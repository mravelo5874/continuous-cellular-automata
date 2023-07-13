import { Sim } from 'src/sim/Sim';
import { VolumeData } from './VolumeData';
import { square_mesh } from '../Meshes/Square';
import { PRGM_LOC, compile_program } from '../Util3D';
import { UniformLocationCache } from '../UniformLocationCache';
import { Vec4 } from 'src/lib/TSM';

export { ClearVolume }

class ClearVolume {
    sim: Sim;
    mesh: any;
    ibo: WebGLBuffer | null;
    vbo: WebGLBuffer | null;
    vao: WebGLVertexArrayObject | null;
    programs: { [key: number]: PRGM_LOC } = {};
    clear_color: Vec4;

    constructor(_sim: Sim) {
        this.sim = _sim;
        this.clear_color = new Vec4([0.0, 0.0, 0.0, 0.0])
        this.ibo = null;
        this.vbo = null;
        this.vao = null;
        this.generate_mesh();
    }

    generate_mesh() {
        let gl = this.sim.context as WebGL2RenderingContext;
        let mesh = square_mesh;

        // vertex buffer
        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.vertex_data, gl.STATIC_DRAW);

        // index buffer
        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.index_data, gl.STATIC_DRAW);

        // vertex attribute array
        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            let index = 0;
            let count = 2;
            let is_norm = false;
            let size = 4;
            let stride = count * size;
            let offset = 0;
            gl.vertexAttribPointer(index, count, gl.FLOAT, is_norm, stride, offset);
            gl.enableVertexAttribArray(index);
        }

        this.mesh = mesh;
        this.ibo = ibo;
        this.vbo = vbo;
        this.vao = vao;
    }

    create_program(depth: number) {
        let vert =
            `#version 300 es
            precision highp float;

            layout(location = 0) in vec2 position;

            void main() {
                gl_Position = vec4(position.xy, 0.0, 1.0);
            }`;

        let frag =
            `#version 300 es
            precision highp float;

            out vec4 vFragColor[${depth}];
            uniform vec4 u_clear_color;

            void main() {
                ${
                    Array(depth)
                        .fill(0)
                        .map((_,z) => `vFragColor[${z}] = u_clear_color;`)
                        .join('\n')
                }
            }`;

        let gl = this.sim.context as WebGL2RenderingContext;
        return compile_program(gl, vert, frag);
    }

    get_program(depth: number): PRGM_LOC {
        if (depth in this.programs) {
            return this.programs[depth];
        }

        let program = this.create_program(depth);
        let ulc = new UniformLocationCache(this.sim, program);
        let value = new PRGM_LOC(program, ulc);
        this.programs[depth] = value;
        return value;
    }

    render(_vol: VolumeData) {
        let gl = this.sim.context as WebGL2RenderingContext;
        let frame_buffers = _vol.frame_buffers;
        let s = _vol.size;

        gl.viewport(0,0,s,s);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);

        for (let lfb of frame_buffers) {
            let program_location = this.get_program(lfb.total_layers);
            let program = program_location.program;
            let location = program_location.location;
            let c = this.clear_color;

            gl.useProgram(program);
            gl.bindVertexArray(this.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

            gl.uniform4f(location.find('u_clear_color'), c.r, c.g, c.b, c.a);

            gl.bindFramebuffer(gl.FRAMEBUFFER, lfb.fb);
            gl.drawBuffers(lfb.layers);
            gl.clearColor(c.r, c.g, c.b, c.a);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawElements(gl.TRIANGLES, this.mesh.index_data.length, gl.UNSIGNED_INT, 0);
        }
    }
}