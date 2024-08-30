import { Sim } from "../Sim";

export { UniformLocationCache };

class UniformLocationCache {
    sim: Sim;
    program: WebGLProgram;
    cache: { [key: string]: WebGLUniformLocation } = {};

    constructor(_sim: Sim, _program: WebGLProgram) {
        this.sim = _sim;
        this.program = _program;
    }

    find = (key: string) => {
        if (key in this.cache) {
            return this.cache[key];
        }
        let gl = this.sim.context as WebGL2RenderingContext;
        let loc = gl.getUniformLocation(this.program, key.toString()) as WebGLUniformLocation;
        this.cache[key] = loc;
        return loc;
    }
}