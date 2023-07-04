import { Sim } from "src/sim/Sim";
import { VolumeData } from "./VolumeData";
import { square_mesh } from '../Meshes/Square';
import { PRGM_LOC, compile_program } from '../Util3D';
import { UniformLocationCache } from "../UniformLocationCache";
import { Vec3 } from "src/lib/TSM";

export { RandomizeVolume }

class RandomizeVolume {
    sim: Sim;
    mesh: any;
    ibo: WebGLBuffer | null;
    vbo: WebGLBuffer | null;
    vao: WebGLVertexArrayObject | null;
    programs: { [key: number]: PRGM_LOC } = {};

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
            precision mediump float;

            layout(location = 0) in vec2 position;
            out vec2 vPosition;
            uniform vec3 u_region;

            void main() {
                vPosition = position;
                gl_Position = vec4(position.xy*u_region.xy, 0.0, 1.0);
            }`;

        let frag =
           `#version 300 es
            precision mediump float;
            precision highp sampler3D;

            in vec2 vPosition;
            out vec4 vFragColor[${depth}];

            uniform float u_density;
            uniform vec3 u_region; // Fill radius with 0...1 per dimension
            uniform float u_external_rand;
            uniform ivec3 u_size;
            uniform int u_z_offset;

            float rand(vec3 co){
                const vec3 rand_vec = vec3(12.9898, 78.233, 3.2345);
                float a = dot(co, rand_vec) * u_external_rand;
                float b = sin(a);
                float c = b * 43758.5453;
                return fract(c);
            }

            bool is_within_region(float z_norm) {
                // Convert 0...1 fill radius to 0...1 texture coordinate
                float z0 = 2.0*z_norm - 1.0;    // 0...1 to -1...+1
                float z1 = u_region.z;          // 0...1

                // Get distance from origin
                z0 = abs(z0);              
                return z0 <= z1;
            }

            vec4 process_layer(int z_) {
                int z = z_ + u_z_offset;
                float z_norm = float(z) / float(u_size.z); 

                // NOTE: We do this do prevent an off by one error
                //       This occurs since the range (0...N-1) gets mapped to (0...N)
                z_norm += 0.5/float(u_size.z);

                if (!is_within_region(z_norm)) {
                    return vec4(0);
                }

                vec3 pos = vec3(vPosition.xy, z_norm);
                float value = rand(pos);
                return vec4(value);
            }

            void main() {
                ${
                    Array(depth)
                        .fill(0)
                        .map((_,z) => `vFragColor[${z}] = process_layer(${z});`)
                        .join('\n')
                }
            }`;

        let gl = this.sim.context as WebGL2RenderingContext;
        return compile_program(gl, vert, frag);
    }

    get_program(depth: number) {
        if (depth in this.programs) {
            return this.programs[depth];
        }

        let program = this.create_program(depth);
        let ulc = new UniformLocationCache(this.sim, program);
        let value = new PRGM_LOC(program, ulc);
        this.programs[depth] = value;
        return value;
    }

    pad_region(region: Vec3, size: number) {
        let res = [size, size, size];
        res = res.map((v, i) => 1.0 / v);
        let pad = [region.x, region.y, region.z];
        const pad_ratio = 0.01;
        pad = pad.map((v, i) => v + res[i] * pad_ratio);
        return pad;
    }

    render(_vol: VolumeData) {
        let gl = this.sim.context as WebGL2RenderingContext;
        let density = 0.5;
        let region = new Vec3([1.0, 1.0, 1.0]);
        
        _vol.set_wrap(false);
        let s = _vol.size;
        let fbs = _vol.frame_buffers;
        let pad_region = this.pad_region(region, s);

        gl.viewport(0,0,s,s);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        // NOTE: Enable basic blending for randomised fields to overlap (i guess?)
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);

        for (let lfb of fbs) {
            let program_location = this.get_program(lfb.total_layers);
            let program = program_location.program;
            let location = program_location.location;

            gl.useProgram(program);
            gl.bindVertexArray(this.vao);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);

            gl.uniform1f(location.find('u_density'), density);
            gl.uniform3f(location.find('u_region'), region.x, region.y, region.z);
            gl.uniform1f(location.find('u_external_rand'), Math.random());
            gl.uniform3i(location.find('u_size'), s, s, s);
            gl.uniform1i(location.find('u_z_offset'), lfb.z_offset);

            gl.bindFramebuffer(gl.FRAMEBUFFER, lfb.fb);
            gl.drawBuffers(lfb.layers);
            gl.drawElements(gl.TRIANGLES, this.mesh.index_data.length, gl.UNSIGNED_INT, 0);
        }
    }
}