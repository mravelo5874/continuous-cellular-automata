import { UniformLocationCache } from "./UniformLocationCache";

export { PRGM_LOC, validate_shader, validate_program, compile_program };

class PRGM_LOC {
    program: WebGLProgram;
    location: UniformLocationCache;

    constructor(_program: WebGLProgram, 
        _location: UniformLocationCache) {
        this.program = _program;
        this.location = _location;
    }
}

let prepend_line_numbers = (src: string) => {
    let lines = src.split('\n').map((v, i) => `${i+1}\t| ${v}`);
    let out = lines.join('\n');
    return out;
}

let validate_shader = (gl: WebGL2RenderingContext, shader: WebGLShader, src: string) => {
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        console.error(prepend_line_numbers(src));
        return false;
    }
    return true;
}

let validate_program = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return false;
    }
    return true;
}

let compile_program = (gl: WebGL2RenderingContext, vert: string, frag: string) => {
    let vertex_shader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
    gl.shaderSource(vertex_shader, vert);
    gl.compileShader(vertex_shader);
    if (!validate_shader(gl, vertex_shader, vert)) {
        throw new Error('Unable to compile vertex shader');
    }

    let fragment_shader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;
    gl.shaderSource(fragment_shader, frag);
    gl.compileShader(fragment_shader);
    if (!validate_shader(gl, fragment_shader, frag)) {
        throw new Error('Unable to compile fragment shader');
    }

    let program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);
    gl.linkProgram(program);
    if (!validate_program(gl, program)) {
        throw new Error('Unable to compile program');
    }

    return program;
}