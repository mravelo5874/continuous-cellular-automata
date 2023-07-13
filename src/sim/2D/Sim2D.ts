import { Sim } from '../Sim';
import { 
    default_vert,
    rgb_frag, bnw_frag, alpha_frag, acid_frag } from './Shaders2D';
import { 
    generate_random_rgb_state,
    generate_random_alpha_state,
    generate_random_binary_state,
    generate_empty_state } from './Util2D';
import Rand from 'src/lib/rand-seed';

export { Sim2D, Shader2D };

enum Shader2D { rgb, alpha, bnw, acid, END }

class Sim2D {

    // automata variables
    sim: Sim;
    kernel: Float32Array = new Float32Array([0.68, -0.90, 0.68, -0.90, -0.66, -0.90, 0.68, -0.90, 0.68]);
    activation: string = 'return -1.0/pow(2.0,(0.6*pow(x, 2.0)))+1.0;';
    shader: Shader2D;
    use_cgol: boolean = false;

    // render variables
    program: WebGLProgram | null;
    buffer: WebGLBuffer | null;
    vertices: Float32Array;
    textures: WebGLTexture[];
    framebuffers: WebGLFramebuffer[];
    canvas_zoom: number = 2.0;

    // brush stuff
    brush_size: number = 64;
    brush_1: Uint8Array;
    brush_0: Uint8Array;
  
    constructor(_sim: Sim) {
        this.sim = _sim;
        this.shader = Shader2D.bnw;

        this.program = null;
        this.buffer = null;
        this.textures = [];
        this.framebuffers = [];
        this.vertices = new Float32Array([
            // lower triangle
            -1.0,-1.0,
            -1.0, 1.0,
            1.0,-1.0,
            // upper triangle
            1.0,-1.0,
            -1.0, 1.0,
            1.0, 1.0
        ]);

		let arr_size = this.brush_size*this.brush_size*4;
		this.brush_1 = new Uint8Array(arr_size);
		this.brush_0 = new Uint8Array(arr_size);
    }

    start() {
        this.reset();
    }

    load_shader(shade: Shader2D) {
        this.shader = shade;
        this.reset();
    }

    reset(_seed?: string) {
        // prepare render context
        let gl = this.sim.context as WebGL2RenderingContext;
        let canvas = this.sim.canvas as HTMLCanvasElement;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);

        // set 2D shader
        let vert = default_vert
        let frag = rgb_frag
        switch(this.shader) {
            case Shader2D.bnw:
                frag = bnw_frag;
                break;
            case Shader2D.alpha:
                frag = alpha_frag;
                break;
            case Shader2D.rgb:
                frag = rgb_frag;
                break;
            case Shader2D.acid:
                frag = acid_frag;
                break;
        }

        // set activation function
        frag = frag.replace('[AF]', this.activation);

        // create shaders
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
        gl.shaderSource(vertex_shader, vert)
        gl.compileShader(vertex_shader)
        gl.shaderSource(fragment_shader, frag)
        gl.compileShader(fragment_shader)

        // used for debugging shaders
        const vertex_log = gl.getShaderInfoLog(vertex_shader)
        const fragment_log = gl.getShaderInfoLog(fragment_shader)
        if (vertex_log != '') console.log('vertex shader log: ' + vertex_log)
        if (fragment_log != '') console.log('fragment shader log: ' + fragment_log)
        
        // create program
        this.program = gl.createProgram() as WebGLProgram
        let program = this.program
        gl.attachShader(program, vertex_shader)
        gl.attachShader(program, fragment_shader)
        gl.linkProgram(program)

        // used for debugging program
        const program_log = gl.getProgramInfoLog(program)
        if (program_log != '') console.log('shader program log: ' + program_log)

        // fill the texture with random states
        const w = canvas.width
        const h = canvas.height

        // generate state based on automata
        let seed = this.sim.generate_seed(Sim.SEED_LEN);
        if (_seed) {
            seed = _seed;
        }
        let pixels: Uint8Array = new Uint8Array(0)
        if (this.use_cgol) {
            pixels = generate_empty_state(w, h);
        }
        else {
            switch (this.shader) {
                default:
                case Shader2D.alpha:
                    pixels = generate_random_alpha_state(w, h, seed);
                    break
                case Shader2D.rgb:
                case Shader2D.bnw:
                case Shader2D.acid:
                    pixels = generate_random_rgb_state(w, h, seed);
                    break
            }
        }
        
        // create 2 textures and attach them to framebuffers
        this.textures = []
        this.framebuffers = []
        for (var ii = 0; ii < 2; ++ii) 
        {
            // create texture
            var texture = this.create_setup_texture(gl)
            this.textures.push(texture)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)

            // create a framebuffer
            var fbo = gl.createFramebuffer() as WebGLFramebuffer
            this.framebuffers.push(fbo)
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
        
            // attach a texture to it.
            var attachmentPoint = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, 0)
        }

        // set init pixels to texture 1
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1])
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

        // use program !!!
        gl.useProgram(program)

        // create vertices buffer
        this.buffer = gl.createBuffer() as WebGLBuffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

        // set color uniform
        const color_loc = gl.getUniformLocation(program, 'u_color')
        gl.uniform4fv(color_loc, [0.0, 0.0, 0.0, 0.0])

        // set time uniform
        const time_loc = gl.getUniformLocation(program, 'u_time')
        gl.uniform1f(time_loc, 0.0)
        
        // set step uniform
        const step_loc = gl.getUniformLocation(this.program, 'u_step')
        gl.uniform1f(step_loc, 1)

        // set pause uniform
        const pause_loc = gl.getUniformLocation(this.program, 'u_pause')
        gl.uniform1f(pause_loc, 0)

        // start with the original texture
        const texture_loc = gl.getUniformLocation(program, 'u_texture')
        gl.activeTexture(gl.TEXTURE0 + 0)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1])
    
        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(texture_loc, 0)

        // set kernel array uniform
        const kernel_loc = gl.getUniformLocation(program, 'u_kernel[0]')
        gl.uniform1fv(kernel_loc, this.kernel)

        // set resolution uniform
        const res_loc = gl.getUniformLocation(program, "u_res")
        let res: Float32Array = new Float32Array([w, h])
        gl.uniform2fv(res_loc, res)

        // set position attribute
        const pos_loc = gl.getAttribLocation(program, 'a_pos')
        gl.enableVertexAttribArray(pos_loc)
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0)

        // DRAW TO CANVAS
        this.set_fb(null, w, h, gl)
        this.draw_to_canvas(gl)
    }

    render() {
        // prepare render context
        let gl = this.sim.context as WebGL2RenderingContext;
        let canvas = this.sim.canvas as HTMLCanvasElement;
        let w = canvas.width;
        let h = canvas.height;
        let bg = this.sim.bg_color;

        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.disable(gl.BLEND);
        gl.viewport(0, 0, w, h);

        // draw to screen
        this.draw(gl, w, h);
    }

    draw(gl: WebGL2RenderingContext, w: number, h: number) {
        // use program !!!
        let program = this.program as WebGLProgram
        gl.useProgram(program)

        // create vertices buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW)

        // set texture uniform
        const texture_loc = gl.getUniformLocation(program, 'u_texture')
        gl.activeTexture(gl.TEXTURE0 + 0)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1])

        // Tell the shader to get the texture from texture unit 0
        gl.uniform1i(texture_loc, 0);

        // set time uniform
        const time_loc = gl.getUniformLocation(program, 'u_time')
        gl.uniform1f(time_loc, this.sim.get_elapsed_time())

        // set step as true for the 2 iterations
        const step_loc = gl.getUniformLocation(program, 'u_step')
        gl.uniform1f(step_loc, 1)

        // set pause uniform
        const pause_loc = gl.getUniformLocation(program, 'u_pause')
        if (this.sim.paused) gl.uniform1f(pause_loc, 1)
        else gl.uniform1f(pause_loc, 0)

        // set position attribute
        const pos_loc = gl.getAttribLocation(program, 'a_pos')
        gl.enableVertexAttribArray(pos_loc)
        gl.vertexAttribPointer(pos_loc, 2, gl.FLOAT, false, 0, 0)

        // FRAMEBUFFER 1
        this.set_fb(this.framebuffers[0], w, h, gl)
        this.draw_to_canvas(gl)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[0])

        // FRAMEBUFFER 2
        this.set_fb(this.framebuffers[1], w, h, gl)
        this.draw_to_canvas(gl)
        gl.bindTexture(gl.TEXTURE_2D, this.textures[1])

        // set step as false for drawing to canvas
        gl.uniform1f(step_loc, 0)

        // DRAW TO CANVAS
        this.set_fb(null, w, h, gl)
        this.draw_to_canvas(gl)
    }

    draw_to_canvas(gl: WebGL2RenderingContext) {
        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    create_setup_texture(gl: WebGL2RenderingContext): WebGLTexture {
        var texture = gl.createTexture() as WebGLTexture
        gl.bindTexture(gl.TEXTURE_2D, texture)

        // Set up texture so we can render any size image and so we are
        // working with pixels.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    
        return texture
    }

    set_fb(fbo: WebGLFramebuffer | null, width: number, height: number, gl: WebGL2RenderingContext): void {
      // make this the framebuffer we are rendering to.
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      // Tell WebGL how to convert from clip space to pixels
      gl.viewport(0, 0, width, height);
    }

    set_kernel(_kernel: Float32Array) {
        this.kernel = _kernel;
        let gl = this.sim.context as WebGL2RenderingContext;
        let program = this.program as WebGLProgram;
        const kernel_loc = gl.getUniformLocation(program, 'u_kernel[0]')
        gl.uniform1fv(kernel_loc, this.kernel)
    }

    set_activation(_activation: string) {
        this.activation = _activation;
        this.reset();
    }

    set_brush(size: number): void {  
		this.brush_size = size;
		let arr_size = size*size*4;
		this.brush_1 = new Uint8Array(arr_size);
		this.brush_0 = new Uint8Array(arr_size);
        let rng = new Rand();
		for (let i=0; i < arr_size; i++) {
            if (this.use_cgol)
			    this.brush_1[i] = 255;
            else this.brush_1[i] = rng.next() * 255;
			this.brush_0[i] = 0;
		}
	}

    randomize_brush() {
        let arr_size = this.brush_size*this.brush_size*4;
        this.brush_1 = new Uint8Array(arr_size)
        let rng = new Rand();
        for (let i=0; i < arr_size; i++) {
            var value = rng.next();
            if (this.use_cgol) {
                if (value > 0.5) this.brush_1[i] = 255;
            }
            else {
                this.brush_1[i] = 255 * value;
            }
            this.brush_0[i] = 0;
        }
    }
  
    mouse_draw(rel_x: number, rel_y: number) {
        let gl = this.sim.context as WebGL2RenderingContext;
        let canvas = this.sim.canvas as HTMLCanvasElement;
        let w = canvas.width;
        let h = canvas.height;
        rel_y = 1.0 - rel_y;
    
        let x = Math.floor(w * rel_x);
        let y = Math.floor(h * rel_y);
        x = x - Math.floor(this.brush_size / 2); // center brush
        y = y - Math.floor(this.brush_size / 2);
    
        this.randomize_brush();
        let brush_arr = this.brush_1;
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, this.brush_size, this.brush_size, gl.RGBA, gl.UNSIGNED_BYTE, brush_arr);
        this.draw_to_canvas(gl);
    }

    mouse_erase(rel_x: number, rel_y: number) {
        let gl = this.sim.context as WebGL2RenderingContext;
        let canvas = this.sim.canvas as HTMLCanvasElement;
        let w = canvas.width;
        let h = canvas.height;
        rel_y = 1.0 - rel_y;
    
        let x = Math.floor(w * rel_x);
        let y = Math.floor(h * rel_y);
        x = x - Math.floor(this.brush_size / 2); // center brush
        y = y - Math.floor(this.brush_size / 2);
            
        let brush_arr = this.brush_0;
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, this.brush_size, this.brush_size, gl.RGBA, gl.UNSIGNED_BYTE, brush_arr);
        this.draw_to_canvas(gl);
    }
}