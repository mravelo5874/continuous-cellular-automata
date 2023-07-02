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
enum Automata3D { custom, sphere, perlin, random, organized, END }

class Sim3D {
    // automata variables
    sim: Sim;
    kernel: Float32Array;
    activation: string;
    volume_old: VolumeData;
    volume_new: VolumeData;

    // renderables
    size: number;
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
        
        this.size = 64;
        this.automata = Automata3D.perlin;
        this.colormap = Colormap3D.ygb;

        // create volume datas
        let gl = this.sim.context as WebGL2RenderingContext;
        let s = this.size;
        this.volume_old = new VolumeData(gl, s);
        this.volume_new = new VolumeData(gl, s);
        
        // create volumes
        this.compute_volume = new ComputeVolume();
        this.clear_volume = new ClearVolume(_sim);
        this.randomize_volume = new RandomizeVolume(_sim);
        this.render_volume = new RenderVolume(_sim);
        this.render_volume.set_colormap(this.colormap);
    }

    public start() {
        this.reset();
    }

    public reset(_seed?: string, _reset_cam: boolean = true) {
        // TODO: set automata
        switch (this.automata)
        {
            default: return;
            case Automata3D.sphere:
                //this.auto_volume.sphere_volume()
                //this.neural_app.option_ui.auto_node.nodeValue = 'sphere'
                break
            case Automata3D.organized:
                //this.neural_app.option_ui.auto_node.nodeValue = 'organized'
                //this.auto_volume.organize_volume()
                break
            case Automata3D.random:
                //this.neural_app.option_ui.auto_node.nodeValue = 'random'
                //this.auto_volume.binary_randomize_volume(Date.now().toString(), 0.8)
                break
            case Automata3D.perlin:
                //this.neural_app.option_ui.auto_node.nodeValue = 'perlin'
                //this.auto_volume.perlin_volume(Date.now().toString(), Vec3.zero)
                //this.auto_volume.start_perlin()
                break
        }

        // reset camera
        // if (_reset_cam) this.set_zoom(this.zoom);
    }

    public render() {
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
}