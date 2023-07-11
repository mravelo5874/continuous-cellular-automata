import { webgl_util } from "./WebGL-Util";
import { CanvasResize } from "./CanvasResize";
import { Sim2D, Automata2D, Shader2D } from "./2D/Sim2D";
import { Colormap3D, Sim3D } from "./3D/Sim3D";
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
    public fps_node: Text | null;
    public res_node: Text | null;

    constructor() {
        // initialize all variables
        this.mode = SimMode.Sim2D;
        this.canvas = null;
        this.context = null;
        this.sim2D = null;
        this.sim3D = null;
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
        this.sim3D = new Sim3D(this);
        this.resize = new CanvasResize(this.canvas);

        // add fps text element to screen
        let fps_element = document.querySelector('#fps');
        this.fps_node = document.createTextNode('');
        fps_element?.appendChild(this.fps_node);
        this.fps_node.nodeValue = '';
        // add res text element to screen
        // 2d res
        let res_element = document.querySelector('#res');
        this.res_node = document.createTextNode('');
        res_element?.appendChild(this.res_node);
        this.res_node.nodeValue = '';

        console.log('simulation initialized.');
    }

    start() {
        this.sim2D?.start();
        this.sim3D?.start();
        window.requestAnimationFrame(() => this.render_loop());

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
                this.resize?.resize_canvas_to_display_size(this.res_node);
                (async () => { 
                    await delay(1);
                    this.sim2D?.reset();
                })();
                break;
            case SimMode.Sim3D:
                this.resize?.resize_canvas_to_display_size(this.res_node);
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
            if (this.fps_node) this.fps_node.nodeValue = this.fps.toFixed(0);
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

    reset(_seed: string, _reset_cam: boolean) {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            this.sim2D?.reset(_seed);
            break;
        case SimMode.Sim3D:
            this.sim3D?.reset(_seed, _reset_cam);
            break;
        }
    }

    toggle_blend() {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            break;
        case SimMode.Sim3D:
            let blend = this.sim3D?.render_volume.blend_volume;
            if (this.sim3D) this.sim3D.render_volume.blend_volume = !blend;
            break;
        }
    }

    toggle_wrap() {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            break;
        case SimMode.Sim3D:
            let wrap = this.sim3D?.compute_volume.wrap;
            if (this.sim3D) this.sim3D.compute_volume.wrap = !wrap;
            break;
        }
    }

    load_colormap(_colormap: string) {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            break;
        case SimMode.Sim3D:
            switch (_colormap) {
            default: break;
            case 'cool_warm':
                this.sim3D?.render_volume.set_colormap(Colormap3D.cool_warm);
                break;
            case 'plasma':
                this.sim3D?.render_volume.set_colormap(Colormap3D.plasma);
                break;
            case 'virdis':
                this.sim3D?.render_volume.set_colormap(Colormap3D.virdis);
                break;
            case 'rainbow':
                this.sim3D?.render_volume.set_colormap(Colormap3D.rainbow);
                break;
            case 'green':
                this.sim3D?.render_volume.set_colormap(Colormap3D.green);
                break;
            case 'ygb':
                this.sim3D?.render_volume.set_colormap(Colormap3D.ygb);
                break;
            }
            break;
        }
    }

    custom_kernel() {
        this.sim2D?.custom_kernel();
    }

    get_kernel() {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            if (this.sim2D) return this.sim2D?.kernel;
            break;
        case SimMode.Sim3D:
            if (this.sim3D) return this.sim3D?.kernel;
            break;
        }
    }

    get_activation() {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            if (this.sim2D) return this.sim2D?.activation;
            break;
        case SimMode.Sim3D:
            if (this.sim3D) return this.sim3D?.activation;
            break;
        }
        return this.sim2D?.activation;
    }

    update_volume_size(_size: number) {
        if (this.mode == SimMode.Sim3D) {
            this.sim3D?.set_size(_size);
        } 
    } 

    update_kernel(_kernel: Float32Array) {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            if (this.sim2D) this.sim2D?.set_kernel(_kernel);
            break;
        case SimMode.Sim3D:
            if (this.sim3D) this.sim3D?.set_kernel(_kernel);
            break;
        }
    }

    update_activation(_activation: string) {
        switch (this.mode) {
        default: break;
        case SimMode.Sim2D:
            if (this.sim2D) this.sim2D?.set_activation(_activation);
            break;
        case SimMode.Sim3D:
            if (this.sim3D) this.sim3D?.set_activation(_activation);
            break;
        }
        
    }

    update_region(_region: number) {
        this.sim3D?.randomize_volume.set_region(_region);
    }

    update_brush(_brush: number) {
        this.sim2D?.set_brush(_brush);
    }

    update_compute_delay(_delay: number) {
        if (_delay <= 0) return;
        if (this.sim3D) this.sim3D.compute_delay = _delay;
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