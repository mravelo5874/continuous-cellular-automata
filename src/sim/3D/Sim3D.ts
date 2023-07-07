import { Sim } from '../Sim';

import { VolumeData } from './Volumes/VolumeData';
import { ClearVolume } from './Volumes/ClearVolume';
import { RandomizeVolume } from './Volumes/RandomizeVolume';
import { ComputeVolume } from './Volumes/ComputeVolume';
import { RenderVolume } from './Volumes/RenderVolume';

import { kernels_3d } from './Kernels3D';
import { activations_3d } from './Activations3D';


export { Sim3D, Colormap3D }

enum Colormap3D { cool_warm, plasma, virdis, rainbow, green, ygb, END }
enum Automata3D { custom, END }

class Sim3D {
    static START_SIZE: number = 64;
    static MAX_SIZE: number = 512;

    // automata variables
    sim: Sim;
    kernel: Float32Array;
    activation: string;
    volume_old: VolumeData | null = null;
    volume_new: VolumeData | null = null;
    seed: string = '';

    // renderables
    size: number = Sim3D.START_SIZE;
    colormap: Colormap3D;
    automata: Automata3D;

    // volumes
    clear_volume: ClearVolume;
    randomize_volume: RandomizeVolume;
    compute_volume: ComputeVolume;
    render_volume: RenderVolume;
    

    constructor(_sim: Sim) {
        this.sim = _sim;
        this.kernel = kernels_3d.default_kernel();
        this.activation = activations_3d.default_activation();
        
        // create volume datas
        this.set_size(this.size, false);
        this.automata = Automata3D.custom;
        this.colormap = Colormap3D.ygb;
        
        // create volumes
        this.clear_volume = new ClearVolume(_sim);
        this.randomize_volume = new RandomizeVolume(_sim);
        this.compute_volume = new ComputeVolume(_sim);
        this.render_volume = new RenderVolume(_sim);
        this.render_volume.set_colormap(this.colormap);
    }

    start() {
        this.reset();
    }

    reset(_seed?: string, _reset_cam: boolean = true) {
        // make sure volumes are not null 
        if (this.volume_old === null || this.volume_new === null) {
            return;
        }

        // reset framebuffer
        let gl = this.sim.context as WebGL2RenderingContext;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.DEPTH_TEST);

        // clear volumes
        this.clear_volume.render(this.volume_old);
        this.clear_volume.render(this.volume_new);

        // TODO: customize randomize volume
        this.seed = this.sim.generate_seed(32);
        if (_seed) {
            this.seed = _seed;
        }
        this.randomize_volume.render(this.volume_old, this.seed);

        // TODO: set automata
        switch (this.automata) {
            default: break;
        }

        // reset camera
        if (_reset_cam) this.render_volume.reset_camera();
    }

    render() {
        // make sure volumes are not null 
        if (this.volume_old === null || this.volume_new === null) {
            return;
        }

        // prepare render context
        let canvas = this.sim.canvas as HTMLCanvasElement;
        let w = canvas.width;
        let h = canvas.height;

        // compute single step
        this.compute_volume.render(
            this.volume_old, 
            this.volume_new, 
            this.kernel,
            this.activation);

        // swap volume buffers
        let tmp = this.volume_old;
        this.volume_old = this.volume_new;
        this.volume_new = tmp;

        // draw to screen
        this.render_volume.render(w, h, this.volume_old);
    }

    orbit_cube(dx: number, dy: number) {
        this.render_volume.orbit_cube(dx, dy);
    }

    camera_zoom(_delta: number) {
        this.render_volume.camera_zoom(_delta);
    }

    set_size(_size: number, _reset: boolean = true) {
        if (_size <= 0 || _size > Sim3D.MAX_SIZE) {
            return;
        }
        this.size = _size;

        // create volume datas
        let gl = this.sim.context as WebGL2RenderingContext;
        let s = this.size;
        this.volume_old = new VolumeData(gl, s);
        this.volume_new = new VolumeData(gl, s);

        if (_reset) this.reset(this.seed, false);
    }
}