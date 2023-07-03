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
            let is_normalised = false; 
            let size = 4;
            let stride = count*size;
            let offset = 0;
            gl.vertexAttribPointer(index, count, gl.FLOAT, is_normalised, stride, offset);
            gl.enableVertexAttribArray(index);
        }

        this.mesh = mesh;
        this.ibo = ibo;
        this.vbo = vbo;
        this.vao = vao;
    }

    create_program(depth: number) {
        
    }

    render(_vol_in: VolumeData, _vol_out: VolumeData, _kernel: Float32Array, _activation: string) {

    }
}