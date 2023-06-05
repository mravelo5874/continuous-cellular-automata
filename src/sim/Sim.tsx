import { webgl_util } from "./WebGL-Util";
import { CanvasResize } from "./CanvasResize";
import { Sim2D } from "./2D/Sim2D";
import { Vec4 } from "../lib/TSM";
import { delay } from "./Gen-Util"; 

export { Sim }

enum SimType { Sim2D, Sim3D }

class Sim {

    type: SimType;
    canvas: HTMLCanvasElement | null;
    context: WebGL2RenderingContext | null;
    sim2D: Sim2D | null;
    resize: CanvasResize | null;

    public paused: boolean;
    public bg_color: Vec4

    // used to calculate time and fps
    private fps: number;
    private start_time: number;
    private prev_time: number;
    private curr_delta_time: number;
    private prev_fps_time: number;
    private frame_count: number = 0;

    constructor() {
    
        // initialize all variables
        this.type = SimType.Sim2D;
        this.canvas = null;
        this.context = null;
        this.sim2D = null;
        this.resize = null;

        this.fps = 0;
        this.start_time = 0;
        this.prev_time = 0;
        this.curr_delta_time = 0;
        this.prev_fps_time = 0;
        this.paused = false;
        this.bg_color = new Vec4([0.0, 0.0, 0.0, 1.0])

        console.log('simulation constructed.');
    }

    init(_canvas: HTMLCanvasElement) {

        this.canvas = _canvas;
        this.context = webgl_util.request_context(this.canvas);
        this.sim2D = new Sim2D(this);
        this.resize = new CanvasResize(this.canvas);

        console.log('simulation initialized.');
    }

    start() {
        this.sim2D?.start();
        window.requestAnimationFrame(() => this.render_loop())
        console.log('simulation started.');
    }

    render_loop() {
        
        // update canvas size
        if (CanvasResize.update_canvas) {
            console.log('update canvas!');
            CanvasResize.update_canvas = false;
            this.resize?.resize_canvas_to_display_size();

            // reset current sim
            switch (this.type) {
                case SimType.Sim2D:
                    (async () => { 
                        await delay(1)
                        this.sim2D?.reset()
                    })();
                    break;
            }
        }

        let sim2D = this.sim2D as Sim2D;
        sim2D.render();

        // calculate current delta time
        this.frame_count++;
        const curr_time: number = Date.now();
        this.curr_delta_time = (curr_time - this.prev_time);
        this.prev_time = curr_time;

        // calculate fps
        if (Date.now() - this.prev_fps_time >= 1000) {
            this.fps = this.frame_count;
            this.frame_count = 0;
            this.prev_fps_time = Date.now();
            //TODO this.info_ui.fps_node.nodeValue = this.fps.toFixed(0)
        }

        // request next frame to be drawn
        window.requestAnimationFrame(() => this.render_loop());
    }

    public get_delta_time(): number { return this.curr_delta_time; }
    public get_elapsed_time(): number { return Date.now() - this.start_time; }
}