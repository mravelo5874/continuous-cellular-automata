import { Sim } from "../Sim";

export { Sim3D }

class Sim3D {

    // automata variables
    sim: Sim;

    constructor(_sim: Sim) {
        this.sim = _sim;
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
    }
}