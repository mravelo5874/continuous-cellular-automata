import { webgl_util } from "./WebGL-Util";
import { CanvasResize } from "./CanvasResize";
import { Sim2D, Automata2D, Shader2D } from "./2D/Sim2D";
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

    // ui nodes
    public fps_node: Text | null;
    public res_node: Text | null;

    constructor() {
    
        // initialize all variables
        this.type = SimType.Sim2D;
        this.canvas = null;
        this.context = null;
        this.sim2D = null;
        this.resize = null;
        this.fps_node = null;
        this.res_node = null;

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

        // add fps text element to screen
        const fps_element = document.querySelector('#fps')
        this.fps_node = document.createTextNode('')
        fps_element?.appendChild(this.fps_node)
        this.fps_node.nodeValue = ''

        // add res text element to screen
        const res_element = document.querySelector('#res')
        this.res_node = document.createTextNode('')
        res_element?.appendChild(this.res_node)
        this.res_node.nodeValue = ''

        console.log('simulation initialized.');
    }

    start() {
        // start 2D simulation and begin render loop
        this.sim2D?.start();
        window.requestAnimationFrame(() => this.render_loop())
        console.log('simulation started.');
    }

    render_loop() {
        
        // update canvas size
        if (CanvasResize.update_canvas) {
            console.log('update canvas!');
            CanvasResize.update_canvas = false;
            this.resize?.resize_canvas_to_display_size(this.res_node);

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

        // render current simulation
        switch (this.type) {
            case SimType.Sim2D:
            let sim2D = this.sim2D as Sim2D;
            sim2D.render();
            break;
        }

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

            if (this.fps_node) this.fps_node.nodeValue = this.fps.toFixed(0)
        }

        // request next frame to be drawn
        window.requestAnimationFrame(() => this.render_loop());
    }

    load_automata(value: string) {
        // load 2D simulation based on string value
        switch(value) {
            default: return;
            case 'worms':
                this.sim2D?.load_automata(Automata2D.worms);
                break;
            case 'drops':
                this.sim2D?.load_automata(Automata2D.drops);
                break;
            case 'waves':
                this.sim2D?.load_automata(Automata2D.waves);
                break;
            case 'paths':
                this.sim2D?.load_automata(Automata2D.paths);
                break;
            case 'stars':
                this.sim2D?.load_automata(Automata2D.stars);
                break;
            case 'cells':
                this.sim2D?.load_automata(Automata2D.cells);
                break;
            case 'slime':
                this.sim2D?.load_automata(Automata2D.slime);
                break;
            case 'lands':
                this.sim2D?.load_automata(Automata2D.lands);
                break;
            case 'cgol':
                this.sim2D?.load_automata(Automata2D.cgol);
                break;
        }
    }

    load_shader(value: string) {
        // load 2D shader based on string value
        switch(value) {
            default: return;
            case 'bnw':
                this.sim2D?.load_shader(Shader2D.bnw);
                break;
            case 'alpha':
                this.sim2D?.load_shader(Shader2D.alpha);
                break;
            case 'rgb':
                this.sim2D?.load_shader(Shader2D.rgb);
                break;
            case 'acid':
                this.sim2D?.load_shader(Shader2D.acid);
                break;
        }
    }

    get_kernel() {
        // return the 2D 3x3 kernel
        return this.sim2D?.kernel;
    }

    get_activation() {
        return this.sim2D?.activation;
    }

    public get_delta_time(): number { return this.curr_delta_time; }
    public get_elapsed_time(): number { return Date.now() - this.start_time; }
}