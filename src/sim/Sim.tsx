import { webgl_util } from "./WebGL-Util";
import { CanvasResize } from "./CanvasResize";
import { Sim2D, Automata2D, Shader2D } from "./2D/Sim2D";
import { Sim3D } from "./3D/Sim3D";
import { Vec4 } from "../lib/TSM";
import { delay } from "./Gen-Util"; 
import Rand from "src/lib/rand-seed";

export { Sim, SimMode }

enum SimMode { Sim2D, Sim3D }

class Sim {

    mode: SimMode;
    canvas: HTMLCanvasElement | null;
    context: WebGL2RenderingContext | null;
    sim2D: Sim2D | null;
    sim3D: Sim3D | null;
    resize: CanvasResize | null;

    static zoom: number = 2.0;
    public paused: boolean;
    public bg_color: Vec4;

    // user input
    public is_input: boolean = false;
    public mouse_button: number = 0;

    // used to calculate time and fps
    private fps: number;
    private start_time: number;
    private prev_time: number;
    private curr_delta_time: number;
    private prev_fps_time: number;
    private frame_count: number = 0;

    // ui nodes
    public fps_node_2d: Text | null;
    public res_node_2d: Text | null;
    public fps_node_3d: Text | null;
    public res_node_3d: Text | null;

    constructor() {
        // initialize all variables
        this.mode = SimMode.Sim2D;
        this.canvas = null;
        this.context = null;
        this.sim2D = null;
        this.sim3D = null;
        this.resize = null;
        this.fps_node_2d = null;
        this.res_node_2d = null;
        this.fps_node_3d = null;
        this.res_node_3d = null;

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
        this.sim3D = new Sim3D(this);
        this.resize = new CanvasResize(this.canvas);

        // add fps text element to screen
        // 2d fps
        let fps_element = document.querySelector('#fps_2d')
        this.fps_node_2d = document.createTextNode('')
        fps_element?.appendChild(this.fps_node_2d)
        this.fps_node_2d.nodeValue = ''
        // 3d fps
        fps_element = document.querySelector('#fps_3d')
        this.fps_node_3d = document.createTextNode('')
        fps_element?.appendChild(this.fps_node_3d)
        this.fps_node_3d.nodeValue = ''

        // add res text element to screen
        // 2d res
        let res_element = document.querySelector('#res_2d')
        this.res_node_2d = document.createTextNode('')
        res_element?.appendChild(this.res_node_2d)
        this.res_node_2d.nodeValue = ''
        // 3d res
        res_element = document.querySelector('#res_3d')
        this.res_node_3d = document.createTextNode('')
        res_element?.appendChild(this.res_node_3d)
        this.res_node_3d.nodeValue = ''

        console.log('simulation initialized.');
    }

    start() {
        this.sim2D?.start();
        this.sim3D?.start();
        window.requestAnimationFrame(() => this.render_loop())
        console.log('simulation started.');
    }

    render_loop() {
        // update canvas size
        if (CanvasResize.update_canvas) {
            console.log('update canvas!');
            CanvasResize.update_canvas = false;

            // reset current sim
            switch (this.mode) {
                case SimMode.Sim2D:
                    this.resize?.resize_canvas_to_display_size(this.res_node_2d);
                    (async () => { 
                        await delay(1);
                        this.sim2D?.reset();
                    })();
                    break;
                case SimMode.Sim3D:
                    this.resize?.resize_canvas_to_display_size(this.res_node_3d);
                    (async () => { 
                        await delay(1);
                        this.sim3D?.reset();
                    })();
                    break;
            }
        }

        // render current simulation
        switch (this.mode) {
            default: break;
            case SimMode.Sim2D:
                this.sim2D?.render();
                break;
            case SimMode.Sim3D:
                this.sim3D?.render();
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
            
            switch (this.mode) {
                default: break;
                case SimMode.Sim2D:
                    if (this.fps_node_2d) this.fps_node_2d.nodeValue = this.fps.toFixed(0)
                    break;
                case SimMode.Sim3D:
                    if (this.fps_node_3d) this.fps_node_3d.nodeValue = this.fps.toFixed(0)
                    break;
            }
        }

        // request next frame to be drawn
        window.requestAnimationFrame(() => this.render_loop());
    }

    mouse_start(x: number, y: number, button: number) {
        this.is_input = true;
        this.mouse_button = button;
        switch (this.mouse_button) {
        default: break;
        case 1:
            if (this.mode === SimMode.Sim2D) this.sim2D?.mouse_draw(x, y);
            break;
        case 2:
            if (this.mode === SimMode.Sim2D) this.sim2D?.mouse_erase(x, y);
            break;
        }
    }

    mouse_drag(x: number, y: number, dx: number, dy: number) {
        if (!this.is_input) return;
        switch (this.mouse_button) {
        default: break;
        case 1:
            if (this.mode === SimMode.Sim2D) this.sim2D?.mouse_draw(x, y);
            if (this.mode === SimMode.Sim3D) this.sim3D?.orbit_cube(dx, dy);
            break;
        case 2:
            if (this.mode === SimMode.Sim2D) this.sim2D?.mouse_erase(x, y);
            break;
        }
    }

    mouse_end() {
        this.is_input = false;
    }

    mouse_wheel(dy: number) {
        if (this.mode === SimMode.Sim3D) this.sim3D?.camera_zoom(dy);
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
            case 'circuit':
                this.sim2D?.load_automata(Automata2D.circuit);
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

    set_mode(_mode: SimMode) {
        if (_mode === this.mode) return;
        this.mode = _mode;

        // clear canvas
        let gl = this.context as WebGL2RenderingContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // special changes made when switching modes
        switch (_mode) {
            default: break;
            case SimMode.Sim2D:
                this.update_zoom(this.sim2D?.canvas_zoom as number);
                break;
            case SimMode.Sim3D:
                this.update_zoom(1.0);
                break;
        }
    }

    reset_2d(_seed: string) {
        this.sim2D?.reset(_seed);
    }

    custom_kernel() {
        this.sim2D?.custom_kernel();
    }

    get_kernel() {
        return this.sim2D?.kernel;
    }

    get_activation() {
        return this.sim2D?.activation;
    }

    update_kernel(_kernel: Float32Array) {
        this.sim2D?.set_kernel(_kernel);
    }

    update_activation(_activation: string) {
        this.sim2D?.set_activation(_activation);
    }

    update_brush(_brush: number) {
        this.sim2D?.set_brush(_brush);
    }

    update_zoom(_zoom: number) {
        Sim.zoom = _zoom;
        CanvasResize.update_canvas = true;

        // special mode updates
        switch (this.mode) {
            default: break;
            case SimMode.Sim2D:
                if (this.sim2D) this.sim2D.canvas_zoom = _zoom;
                break;
            case SimMode.Sim3D:
                break;
        }
    }

    mouse_draw(x: number, y: number) {
        this.sim2D?.mouse_draw(x, y);
    }

    mouse_erase(x: number, y: number) {
        this.sim2D?.mouse_erase(x, y);
    }

    public get_delta_time(): number { return this.curr_delta_time; }
    public get_elapsed_time(): number { return Date.now() - this.start_time; }


    generate_seed(_length: number): string {
        let seed = '';
        let rng = new Rand();
        for (let i = 0; i < _length; i++) {
            seed += (rng.next() * 9).toFixed(0).toString();
        }   
        return seed;
    }
}