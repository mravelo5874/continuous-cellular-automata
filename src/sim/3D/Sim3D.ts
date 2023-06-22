import { Sim } from "../Sim";
import { ComputeVolume } from "./ComputeVolume";
import { RenderVolume } from "./RenderVolume";

export { Sim3D }

class Sim3D {

    sim: Sim;
    size: number;
    compute_volume: ComputeVolume;
    render_volume: ComputeVolume;

    constructor(_sim: Sim) {
        this.sim = _sim;
        this.size = 64;
        this.compute_volume = new ComputeVolume();
        this.render_volume = new RenderVolume();
    }

    public start() {
        this.reset();
    }

    public reset(_seed?: string) {
        // get context
        let gl = this.sim.context as WebGL2RenderingContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    public render() {
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

    public draw(gl: WebGL2RenderingContext, w: number, h: number) {

    }
}