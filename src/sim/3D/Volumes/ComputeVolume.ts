import { Sim } from "src/sim/Sim";
import { VolumeData } from "./VolumeData";
import { square_mesh } from '../Meshes/Square';
import { PRGM_LOC, compile_program } from '../Util3D';
import { UniformLocationCache } from "../UniformLocationCache";
import { Vec3 } from "src/lib/TSM";


export { ComputeVolume }

class ComputeVolume {
    sim: Sim;
    mesh: any;
    ibo: WebGLBuffer | null;
    vbo: WebGLBuffer | null;
    vao: WebGLVertexArrayObject | null;
    programs: { [key: string]: PRGM_LOC } = {};
    wrap: boolean = false;

    constructor(_sim: Sim) {
        this.sim = _sim;
        this.ibo = null;
        this.vbo = null;
        this.vao = null;
        this.generate_mesh();
    }

    generate_mesh() {
        let gl = this.sim.context as WebGL2RenderingContext;

        let mesh = square_mesh;

        let vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.vertex_data, gl.STATIC_DRAW);

        let ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.index_data, gl.STATIC_DRAW);

        let vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
            let index = 0;
            let count = 2;
            let is_normalised = false; 
            let size = 4;
            let stride = count * size;
            let offset = 0;
            gl.vertexAttribPointer(index, count, gl.FLOAT, is_normalised, stride, offset);
            gl.enableVertexAttribArray(index);
        }

        this.mesh = mesh;
        this.ibo = ibo;
        this.vbo = vbo;
        this.vao = vao;
    }

    create_program(depth: number, _activation: string) {
        let vert =
        `#version 300 es
        precision highp float;

        layout(location = 0) in vec2 position;
        out vec2 vPosition; // 0.0 to 1.0

        void main() {
            vPosition = (position+1.0)/2.0;
            gl_Position = vec4(position.xy, 0.0, 1.0);
        }`;

        let frag = 
        `#version 300 es
        precision highp float;
        precision highp sampler3D;

        in vec2 vPosition; // 0.0 to 1.0
        out vec4 vFragColor[${depth}];

        // volume data format is:
        // R = 0 or 255 => 0.0 or 1.0
        // G = NONE
        // B = NONE
        // A = NONE
        uniform sampler3D volume_in;   
        uniform int z_offset;
        uniform ivec3 u_size;
        uniform float u_kernel[27];

        float activation(float x) {
            ${_activation}
        }

        float get_state(vec3 pos) {
            return texture(volume_in, pos).r;
        }

        float get_sum(vec3 pos, vec3 step) {
            float sum = 0.0;

            // face 1
            sum += get_state(vec3(pos.x - step.x, pos.y + step.y, pos.z - step.z)) * u_kernel[0];
            sum += get_state(vec3(pos.x         , pos.y + step.y, pos.z - step.z)) * u_kernel[1];
            sum += get_state(vec3(pos.x + step.x, pos.y + step.y, pos.z - step.z)) * u_kernel[2];
            sum += get_state(vec3(pos.x - step.x, pos.y         , pos.z - step.z)) * u_kernel[3];
            sum += get_state(vec3(pos.x         , pos.y         , pos.z - step.z)) * u_kernel[4];
            sum += get_state(vec3(pos.x + step.x, pos.y         , pos.z - step.z)) * u_kernel[5];
            sum += get_state(vec3(pos.x - step.x, pos.y - step.y, pos.z - step.z)) * u_kernel[6];
            sum += get_state(vec3(pos.x         , pos.y - step.y, pos.z - step.z)) * u_kernel[7];
            sum += get_state(vec3(pos.x + step.x, pos.y - step.y, pos.z - step.z)) * u_kernel[8];
            // face 2
            sum += get_state(vec3(pos.x - step.x, pos.y + step.y, pos.z         )) * u_kernel[9];
            sum += get_state(vec3(pos.x         , pos.y + step.y, pos.z         )) * u_kernel[10];
            sum += get_state(vec3(pos.x + step.x, pos.y + step.y, pos.z         )) * u_kernel[11];
            sum += get_state(vec3(pos.x - step.x, pos.y         , pos.z         )) * u_kernel[12];
            sum += get_state(vec3(pos.x         , pos.y         , pos.z         )) * u_kernel[13];
            sum += get_state(vec3(pos.x + step.x, pos.y         , pos.z         )) * u_kernel[14];
            sum += get_state(vec3(pos.x - step.x, pos.y - step.y, pos.z         )) * u_kernel[15];
            sum += get_state(vec3(pos.x         , pos.y - step.y, pos.z         )) * u_kernel[16];
            sum += get_state(vec3(pos.x + step.x, pos.y - step.y, pos.z         )) * u_kernel[17];
            // face 3
            sum += get_state(vec3(pos.x - step.x, pos.y + step.y, pos.z + step.z)) * u_kernel[18];
            sum += get_state(vec3(pos.x         , pos.y + step.y, pos.z + step.z)) * u_kernel[19];
            sum += get_state(vec3(pos.x + step.x, pos.y + step.y, pos.z + step.z)) * u_kernel[20];
            sum += get_state(vec3(pos.x - step.x, pos.y         , pos.z + step.z)) * u_kernel[21];
            sum += get_state(vec3(pos.x         , pos.y         , pos.z + step.z)) * u_kernel[22];
            sum += get_state(vec3(pos.x + step.x, pos.y         , pos.z + step.z)) * u_kernel[23];
            sum += get_state(vec3(pos.x - step.x, pos.y - step.y, pos.z + step.z)) * u_kernel[24];
            sum += get_state(vec3(pos.x         , pos.y - step.y, pos.z + step.z)) * u_kernel[25];
            sum += get_state(vec3(pos.x + step.x, pos.y - step.y, pos.z + step.z)) * u_kernel[26];

            return sum;
        }

        vec4 process_layer(int z_, vec3 step, float delta) {
            int z = z_ + z_offset;
            float z_norm = float(z) / float(u_size.z);

            // NOTE: We do this do prevent an off by one error
            // This occurs since the range (0...N-1) gets mapped to (0...N)
            z_norm += 0.5 / float(u_size.z);

            vec3 pos = vec3(vPosition.xy, z_norm);
            float sum = get_sum(pos, step);
            float x = activation(sum);
            return vec4(x, 0.0, 0.0, 0.0);
        }

        void main() {
            vec3 step = vec3(1.0)/vec3(u_size);
            float total_states = 27.0;
            float delta = 1.0 / (total_states-1.0);

            ${
                Array(depth)
                    .fill(0)
                    .map((_,z) => `vFragColor[${z}] = process_layer(${z}, step, delta);`)
                    .join('\n')
            }
        }
    `;

        let gl = this.sim.context as WebGL2RenderingContext;
        return compile_program(gl, vert, frag);
    }

    get_program(depth: number, _activation: string) {
        let key = `${depth}-${_activation}`;
        if (key in this.programs) {
            return this.programs[key];
        }

        let program = this.create_program(depth, _activation);
        let ulc = new UniformLocationCache(this.sim, program);
        let value = new PRGM_LOC(program, ulc);
        this.programs[key] = value;
        return value;
    }

    render(_vol_in: VolumeData, _vol_out: VolumeData, _kernel: Float32Array, _activation: string) {
        _vol_in.set_wrap(this.wrap);
        _vol_out.set_wrap(this.wrap);
        let s = _vol_in.size;
        let texture = _vol_in.texture;
        let fbs = _vol_out.frame_buffers;

        let gl = this.sim.context as WebGL2RenderingContext;
        gl.viewport(0,0,s,s);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);

        let texture_slot = 0;
        gl.activeTexture(gl.TEXTURE0 + texture_slot);
        gl.bindTexture(gl.TEXTURE_3D, texture);
        
        for (let lfb of fbs) {
            let program_location = this.get_program(lfb.total_layers, _activation);
            let program = program_location.program;
            let location = program_location.location;

            gl.useProgram(program);
            gl.bindVertexArray(this.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

            gl.uniform1i(location.find('volume_in'), texture_slot);
            gl.uniform1i(location.find('z_offset'), lfb.z_offset);
            gl.uniform3i(location.find('u_size'), s, s, s);
            gl.uniform1fv(location.find('u_kernel[0]'), _kernel)
            
            gl.bindFramebuffer(gl.FRAMEBUFFER, lfb.fb);
            gl.drawBuffers(lfb.layers);
            gl.drawElements(gl.TRIANGLES, this.mesh.index_data.length, gl.UNSIGNED_INT, 0);
        }
    }
}