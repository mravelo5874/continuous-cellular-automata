import { Camera } from 'src/lib/Camera';
import { Vec3 } from "src/lib/TSM";
import { VolumeData } from "./VolumeData";
import { Colormap3D } from "../Sim3D";
import { Cube } from '../Cube';
import { Sim } from 'src/sim/Sim';

export { RenderVolume }

class RenderVolume {
    sim: Sim;
    cube: Cube;
    program: WebGLProgram;
    vao: WebGLVertexArrayObject
    func: WebGLTexture | null;

    // camera
    camera: Camera;
    zoom: number = 3.0;
    cam_sense: number = 0.25;
    rot_speed: number = 0.02;
    zoom_speed: number = 0.002;
    min_zoom: number = 0.0;
    max_zoom: number = 8.0;
    orbit: boolean = true;

    // visuals
    blend_volume: boolean = true;

    constructor(_sim: Sim) {
        this.sim = _sim;
        this.cube = new Cube();

        let gl = _sim.context as WebGL2RenderingContext;
        this.program = gl.createProgram() as WebGLProgram
        this.vao = gl.createVertexArray() as WebGLVertexArrayObject

        let canvas = _sim.canvas as HTMLCanvasElement;
        this.camera = new Camera(
            new Vec3([0, 0, -this.zoom]),
            new Vec3([0, 0, 0]),
            new Vec3([0, 1, 0]),
            45,
            canvas.width / canvas.height,
            0.1,
            1000.0
        )
        
        this.func = null;
        this.init(gl);
    }

    init(gl: WebGL2RenderingContext) {
        {/* CREATE RENDER PROGRAM */}
        let vert = _3D_VERT;
        let frag = _3D_FRAG;

        // create shaders
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
        gl.shaderSource(vertex_shader, vert);
        gl.compileShader(vertex_shader);
        gl.shaderSource(fragment_shader, frag);
        gl.compileShader(fragment_shader);

        // used for debugging shaders
        const vertex_log = gl.getShaderInfoLog(vertex_shader);
        const fragment_log = gl.getShaderInfoLog(fragment_shader);
        if (vertex_log != '') console.log('vertex shader log: ' + vertex_log);
        if (fragment_log != '') console.log('fragment shader log: ' + fragment_log);

        // create program
        let program = this.program;
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, fragment_shader);
        gl.linkProgram(program);

        // used for debugging program
        const program_log = gl.getProgramInfoLog(program);
        if (program_log != '') console.log('shader program log: ' + program_log);

        // use program!
        gl.useProgram(this.program);

        // bind transfer function texture
        const func_loc = gl.getUniformLocation(this.program as WebGLProgram, 'u_func');
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.func);
        gl.uniform1i(func_loc, 1);

        // init setup cube render
        this.setup_cube_render(gl);
    }

    render(w: number, h: number, volume_in: VolumeData) {
        let gl = this.sim.context as WebGL2RenderingContext;
        let bg = this.sim.bg_color;

        // rotate cube if there is no user input
        if (!this.sim.paused && this.orbit) {
            if (!this.sim.is_input) {
                this.camera.orbitTarget(this.camera.up().normalize(), this.rot_speed * 0.05);
            }
        }

        // gl stuff
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(bg.r, bg.g, bg.b, bg.a);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        gl.frontFace(gl.CCW);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.viewport(0, 0, w, h);

        // setup render cube
        this.setup_cube_render(gl, volume_in);

        // draw
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawElements(gl.TRIANGLES, this.cube.get_idx_u32().length, gl.UNSIGNED_INT, 0);
    }

    setup_cube_render(gl: WebGL2RenderingContext, _volume?: VolumeData) {
        let program = this.program as WebGLProgram;
        
        // draw cube
        gl.useProgram(this.program);
        /* Setup VAO */
        gl.bindVertexArray(this.vao);

        /* Setup Index Buffer */
        const idx_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.cube.get_idx_u32(), gl.STATIC_DRAW);

        /* Setup Attributes */
        // position attribute
        let pos_loc = gl.getAttribLocation(program, 'a_pos');
        const pos_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, pos_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cube.get_pos_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(pos_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(pos_loc, 0);
        gl.enableVertexAttribArray(pos_loc);

        // normal attribute
        let norm_loc = gl.getAttribLocation(program, 'a_norm');
        const norm_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, norm_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cube.get_norms_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(norm_loc, 4, gl.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(norm_loc, 0);
        gl.enableVertexAttribArray(norm_loc);

        // uvs attribute
        let uv_loc = gl.getAttribLocation(program, 'a_uv');
        const uv_buffer = gl.createBuffer() as WebGLBuffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, uv_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.cube.get_uvs_f32(), gl.STATIC_DRAW);
        gl.vertexAttribPointer(uv_loc, 2, gl.FLOAT, false, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribDivisor(uv_loc, 0);
        gl.enableVertexAttribArray(uv_loc);

        // set view uniform
        const view_loc = gl.getUniformLocation(program, "u_view");
        gl.uniformMatrix4fv(view_loc, false, new Float32Array(this.camera.viewMatrix().all()));

        // set projection uniform
        const proj_loc = gl.getUniformLocation(program, "u_proj");
        gl.uniformMatrix4fv(proj_loc, false, new Float32Array(this.camera.projMatrix().all()));

        // set eye uniform
        const eye_loc = gl.getUniformLocation(program, "u_eye");
        gl.uniform3fv(eye_loc, new Float32Array(this.camera.pos().xyz));

        // bind transfer function texture
        const func_loc = gl.getUniformLocation(program, 'u_func');
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.func);
        gl.uniform1i(func_loc, 1);

        // set volume uniform
        if (_volume) {
            const volume_loc = gl.getUniformLocation(program, 'u_volume');
            gl.activeTexture(gl.TEXTURE0+2);
            gl.bindTexture(gl.TEXTURE_3D, _volume.texture);
            gl.generateMipmap(gl.TEXTURE_3D);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            if (this.blend_volume) {
                gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else {
                gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            gl.uniform1i(volume_loc, 2);
        }
    }

    set_colormap(_color: Colormap3D) {
        switch (_color) {
            case Colormap3D.cool_warm:
                this.func = this.load_colormap('../colormaps/cool-warm-paraview.png')
                break
            case Colormap3D.green:
                this.func = this.load_colormap('../colormaps/samsel-linear-green.png')
                break
            case Colormap3D.plasma:
                this.func = this.load_colormap('../colormaps/matplotlib-plasma.png')
                break
            case Colormap3D.rainbow:
                this.func = this.load_colormap('../colormaps/rainbow.png')
                break
            case Colormap3D.virdis:
                this.func = this.load_colormap('../colormaps/matplotlib-virdis.png')
                break
            case Colormap3D.ygb:
                this.func = this.load_colormap('../colormaps/samsel-linear-ygb-1211g.png')
                break
        }
    }

    load_colormap(path: string) {
        let gl = this.sim.context as WebGL2RenderingContext;
        let transfer_function = gl.createTexture() as WebGLTexture
        gl.bindTexture(gl.TEXTURE_2D, transfer_function)
        // add single pixel for now
        const pixel = new Uint8Array([0, 0, 0, 255])
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
        // add image after load
        const img = new Image() 
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, transfer_function)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        }
        // Turn off mips and set wrapping to clamp to edge
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

        img.src = path
        return transfer_function
    }

    reset_camera() {
        let canvas = this.sim.canvas as HTMLCanvasElement;
        // offset camera
        this.camera = new Camera(
            new Vec3([0, 0, -this.zoom]),
            new Vec3([0, 0, 0]),
            new Vec3([0, 1, 0]),
            45,
            canvas.width / canvas.height,
            0.1,
            1000.0
        )
    }

    set_zoom(_zoom: number) {
        this.zoom = _zoom
        let canvas = this.sim.canvas as HTMLCanvasElement;
        // offset camera
        this.camera = new Camera(
            new Vec3([0, 0, -this.zoom]),
            new Vec3([0, 0, 0]),
            new Vec3([0, 1, 0]),
            45,
            canvas.width / canvas.height,
            0.1,
            1000.0
        );
    }

    orbit_cube(dx: number, dy: number) {
        // move camera if in 3d mode
        let dir = this.camera.right();
        dir.scale(-dx);
        dir.add(this.camera.up().scale(dy));
        dir.normalize();

        // move camera
        let rotAxis: Vec3 = Vec3.cross(this.camera.forward(), dir);
        rotAxis = rotAxis.normalize();

        // make sure values are not NaN
        if (dy !== 0 || dx !== 0) {
            this.camera.orbitTarget(rotAxis, this.rot_speed);
        }
    }

    camera_zoom(_delta: number) {
        let dist: number = this.camera.distance();

        // do not zoom if too far away or too close
        if (dist + (_delta*this.zoom_speed) > this.max_zoom) return;
        else if (dist + (_delta*this.zoom_speed) < this.min_zoom) return;

        // offset camera
        this.camera.offsetDist(_delta*this.zoom_speed);
        this.zoom = this.camera.distance();
    }
}

const _3D_VERT =
`#version 300 es
layout(location=0) in vec3 pos;
precision highp float;

uniform mat4 u_view;
uniform mat4 u_proj;
uniform vec3 u_eye;

in vec4 a_norm;
in vec4 a_pos;
in vec2 a_uv;

out vec4 v_norm;
out vec2 v_uv;
out vec3 v_eye;
out vec3 v_ray;

void main() {
    gl_Position = u_proj * u_view * a_pos;
    v_norm = normalize(a_norm);
    v_uv = a_uv;
    v_eye = u_eye;
    v_ray = a_pos.xyz - u_eye;
}
`;

const _3D_FRAG =
`#version 300 es
precision highp float;

uniform highp sampler3D u_volume;
uniform highp sampler2D u_func; 

in vec4 v_norm;
in vec2 v_uv;
in vec3 v_eye;
in vec3 v_ray;

out vec4 fragColor;

vec2 intersect_box(vec3 orig, vec3 dir) {
	const vec3 box_min = vec3(-0.5, -0.5, -0.5);
	const vec3 box_max = vec3(0.5, 0.5, 0.5);
	vec3 inv_dir = 1.0 / dir;
	vec3 tmin_tmp = (box_min - orig) * inv_dir;
	vec3 tmax_tmp = (box_max - orig) * inv_dir;
	vec3 tmin = min(tmin_tmp, tmax_tmp);
	vec3 tmax = max(tmin_tmp, tmax_tmp);
	float t0 = max(tmin.x, max(tmin.y, tmin.z));
	float t1 = min(tmax.x, min(tmax.y, tmax.z));
	return vec2(t0, t1);
}

void main() {   
    vec4 my_color = vec4(0.0, 0.0, 0.0, 0.0);

    // step 1: normalize ray
    vec3 ray = normalize(v_ray);

    // step 2: intersect ray with volume, find interval along ray inside volume
    vec2 t_hit = intersect_box(v_eye, ray);
    if (t_hit.x > t_hit.y) {
        discard;
    }

    // avoid sampling behind eye
    t_hit.x = max(t_hit.x, 0.0);

    // step 3: set step size to march through volume
    float dt = 0.001;

    // step 4: march ray through volume and sample
    vec3 p = v_eye + t_hit.x * ray;
    for (float t = t_hit.x; t < t_hit.y; t += dt) {
        // sample volume
        vec3 pos = p + 0.5;
        float val = texture(u_volume, pos).r;

        // get color from transfer function
        float alpha = pow(2.0, val) - 1.0;
        vec4 val_color = vec4(texture(u_func, vec2(val * 2.0, 0.5)).rgb, alpha);

        my_color.rgb += (1.0 - my_color.a) * val_color.a * val_color.rgb;
        my_color.a += (1.0 - my_color.a) * val_color.a;

        if (my_color.a >= 0.95) {
            break;
        }
        p += ray * dt;
    }

    fragColor = my_color;
}
`;