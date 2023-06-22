export { VolumeData }

class VolumeData {

    size: number;
    gl: WebGL2RenderingContext;
    texture: WebGLTexture;
    frame_buffers: Array<WebGLFramebuffer>;
    max_layers: number;

    constructor(_gl: WebGL2RenderingContext, _size: number) {
        this.gl = _gl;
        this.size = _size;

        // create 3D texture
        let gl = this.gl;
        let s = this.size;
        let texture = gl.createTexture() as WebGLTexture;
        gl.bindTexture(gl.TEXTURE_3D, texture);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
        // NOTE: We pass in data parameter as null since we don't want it on the CPU
        // NOTE: We are using two channels: [state, total_neighbours]
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 2);
        gl.pixelStorei(gl.PACK_ALIGNMENT, 2);
        gl.texImage3D(gl.TEXTURE_3D, 0, gl.RG8, s, s, s, 0, gl.RG, gl.UNSIGNED_BYTE, null);

        // create framebuffers for layers of volume
        let framebuffers = []
        const max_layers = gl.getParameter(gl.MAX_COLOR_ATTACHMENTS);
        for (let i = 0; i < s; i++) {
            let rem_layers = s - i;
            let total_layers = Math.min(rem_layers, max_layers);
            let fb = new LayeredFrameBuffer(gl, texture, i, total_layers);
            framebuffers.push(fb);
        }

        this.texture = texture;
        this.frame_buffers = framebuffers;
        this.max_layers = max_layers;
    }

    set_wrap = (is_wrap: boolean) => {
        let gl = this.gl;

        gl.bindTexture(gl.TEXTURE_3D, this.texture);

        if (is_wrap) {
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.REPEAT);
        } else {
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        }
    }
}

class LayeredFrameBuffer {

    fb: WebGLFramebuffer;
    layers: Array<number>;
    texture: WebGLTexture;
    total_layers: number;
    z_offset: number;

    constructor(gl: WebGL2RenderingContext, texture: WebGLTexture, z_offset: number, total_layers: number) {
        let framebuffer = gl.createFramebuffer() as WebGLFramebuffer;
        let layers = Array(total_layers);
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        // create layers
        for (let i = 0; i < total_layers; i++) {
            let layer = gl.COLOR_ATTACHMENT0 + i;
            gl.framebufferTextureLayer(gl.FRAMEBUFFER, layer, texture, 0, z_offset+i);
            layers[i] = layer;
        }

        let res = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (res !== gl.FRAMEBUFFER_COMPLETE) {
            throw Error(`Incomplete layered framebuffer ${res}`);
        }

        this.fb = framebuffer;
        this.layers = layers;
        this.texture = texture;
        this.total_layers = total_layers;
        this.z_offset = z_offset;
    }
}