import React, { useState } from 'react';
import { Sim, SimMode } from '../sim/Sim';
import Rand from 'src/lib/rand-seed';

export { ControlWindow };

interface ControlPanelInterface {
    sim: Sim
}

class ControlWindow extends React.Component<ControlPanelInterface, {}> {
    
    ui_init: boolean;
    ui_open: boolean;
    anti_alias: boolean;
    seed: string;

    static SEED_LEN: number = 32;

    constructor(props: ControlPanelInterface) {
        super(props);
        this.ui_init = false;
        this.ui_open = true;
        this.anti_alias = false;
        this.seed = 'seed';

        // bind 'this' for class functions
        this.update_sim_kernel = this.update_sim_kernel.bind(this);
        this.update_sim_activation = this.update_sim_activation.bind(this);
        this.update_sim_brush = this.update_sim_brush.bind(this);
        this.update_sim_zoom = this.update_sim_zoom.bind(this);
        this.update_volume_size = this.update_volume_size.bind(this);
        this.update_volume_text = this.update_volume_text.bind(this);

        this.load_automata = this.load_automata.bind(this);
        this.load_shader = this.load_shader.bind(this);
        this.load_activation = this.load_activation.bind(this);
        this.load_colormap = this.load_colormap.bind(this);

        this.toggle_window = this.toggle_window.bind(this);
        this.toggle_blend = this.toggle_blend.bind(this);
        this.toggle_sim = this.toggle_sim.bind(this);
        this.toggle_aa = this.toggle_aa.bind(this);

        this.randomize_kernel = this.randomize_kernel.bind(this);
        this.randomize_seed = this.randomize_seed.bind(this);

        this.reset_automata = this.reset_automata.bind(this);
        this.pause_sim = this.pause_sim.bind(this);
        
    }

    componentDidMount = () => {
        // only initialize simulation once
        if (!this.ui_init) {
            this.ui_init = true;
            let sim = this.props.sim;

            // set kernel and activation function 
            this.set_kernel(sim.get_kernel() as Float32Array);
            this.set_activation(sim.get_activation() as string, true);

            // set seed
            let seed_field = document.getElementById('seed_field') as HTMLInputElement;
            let seed_field_3d = document.getElementById('seed_field_3d') as HTMLInputElement;
            this.seed = sim.generate_seed(ControlWindow.SEED_LEN);
            seed_field.value = this.seed.toString();
            seed_field_3d.value = this.seed.toString();
            
            // update kernel ui
            let v_sym = document.getElementById('v_sym') as HTMLInputElement;
            let h_sym = document.getElementById('h_sym') as HTMLInputElement;
            v_sym.checked = true;
            h_sym.checked = true;
            this.update_kernel_symmetry();

            // keyboard input
            window.addEventListener('keydown', (key: KeyboardEvent) => this.on_key_down(key))
        }
    }

    toggle_blend() {
        let sim = this.props.sim;
        sim.toggle_blend();
    }

    on_key_down(key: KeyboardEvent) {
        switch(key.key) {
            default: return;
            // case 'Control':
            //     this.toggle_window();
            //     break;
        }
    }

    toggle_sim() {
        var _2D_modules = document.getElementById('_2D') as HTMLDivElement;
        var _3D_modules = document.getElementById('_3D') as HTMLDivElement;

        let sim = this.props.sim;
        switch (sim.mode) {
        default: break;
        case SimMode.Sim2D:
            sim.set_mode(SimMode.Sim3D);
            _2D_modules.style.cssText='scale:0%;height:0px;';
            _3D_modules.style.cssText='height:100%;';
            break;
        case SimMode.Sim3D:
            sim.set_mode(SimMode.Sim2D);
            _2D_modules.style.cssText='height:100%;';
            _3D_modules.style.cssText='scale:0%;height:0px;';
            break;
        }
        this.set_kernel(sim.get_kernel() as Float32Array);
        this.set_activation(sim.get_activation() as string, true);
    }

    pause_sim() {
        let sim = this.props.sim;
        sim.paused = !sim.paused
    }

    toggle_aa() {
        var aa_toggle = document.getElementById('toggle_aa') as HTMLInputElement;
        this.anti_alias = aa_toggle.checked;

        let sim = this.props.sim;
        let canvas = sim.canvas as HTMLCanvasElement;

        if (this.anti_alias) {
            canvas.style.imageRendering = 'auto';
        }
        else {
            canvas.style.imageRendering = 'pixelated';
        }
    }

    toggle_window() {
        this.ui_open = !this.ui_open;
        var ui_window = document.getElementById('ctrl_window') as HTMLDivElement;
        var ui_button = document.getElementById('ctrl_button') as HTMLButtonElement;
        if (this.ui_open) {
            ui_window.style.cssText='scale:100%;';
            ui_button.style.cssText='background-color:white;color:rgba(0, 0, 0, 0.85);border-color:black;border: solid 2px black';
            ui_button.innerHTML = 'close';
        }
        else {
            ui_window.style.cssText='scale:0%;';
            ui_button.style.cssText='';
            ui_button.innerHTML = 'open';
        }
    }

    update_sim_brush() {
        // update text with correct value
        var brush_slider = document.getElementById('brush_slider') as HTMLInputElement;
        var brush_text = document.getElementById('brush_text') as HTMLElement;
        brush_text.innerHTML = brush_slider.value;

        let sim = this.props.sim;
        sim.update_brush(brush_slider.valueAsNumber);
    }

    update_sim_zoom() {
        var zoom_slider = document.getElementById('zoom_slider') as HTMLInputElement;
        let sim = this.props.sim;
        sim.update_zoom(zoom_slider.valueAsNumber);
    }

    update_zoom_text() {
        var zoom_slider = document.getElementById('zoom_slider') as HTMLInputElement;
        var zoom_text = document.getElementById('zoom_text') as HTMLElement;
        zoom_text.innerHTML = zoom_slider.value;
    }

    update_volume_size() {
        var volume_size = document.getElementById('volume_size') as HTMLInputElement;
        let sim = this.props.sim;
        sim.update_volume_size(volume_size.valueAsNumber);
    }

    update_volume_text() {
        var volume_size = document.getElementById('volume_size') as HTMLInputElement;
        var volume_text = document.getElementById('volume_size_text') as HTMLElement;
        volume_text.innerHTML = volume_size.value;
    }

    update_sim_kernel() {
        let sim = this.props.sim;
        if (sim.mode === SimMode.Sim2D) {
            let k0 = document.getElementById('k0') as HTMLInputElement;
            let k1 = document.getElementById('k1') as HTMLInputElement;
            let k2 = document.getElementById('k2') as HTMLInputElement;
            let k3 = document.getElementById('k3') as HTMLInputElement;
            let k4 = document.getElementById('k4') as HTMLInputElement;
            let k5 = document.getElementById('k5') as HTMLInputElement;
            let k6 = document.getElementById('k6') as HTMLInputElement;
            let k7 = document.getElementById('k7') as HTMLInputElement;
            let k8 = document.getElementById('k8') as HTMLInputElement;
            var v_sym = document.getElementById('v_sym') as HTMLInputElement;
            var h_sym = document.getElementById('h_sym') as HTMLInputElement;
            if (v_sym.checked && !h_sym.checked) {
                k2.value = k0.value;
                k5.value = k3.value;
                k8.value = k6.value;
            }
            else if (h_sym.checked && !v_sym.checked) {
                k6.value = k0.value;
                k7.value = k1.value;
                k8.value = k2.value;
            }
            else if (v_sym.checked && h_sym.checked) {
                k2.value = k0.value;
                k6.value = k0.value;
                k8.value = k0.value;
                k1.value = k3.value;
                k5.value = k3.value;
                k7.value = k3.value;
            }
            let kernel = new Float32Array([
                k0.valueAsNumber,
                k1.valueAsNumber,
                k2.valueAsNumber,
                k3.valueAsNumber,
                k4.valueAsNumber,
                k5.valueAsNumber,
                k6.valueAsNumber,
                k7.valueAsNumber,
                k8.valueAsNumber
            ]);
            sim.update_kernel(kernel);
        }
        else if (sim.mode === SimMode.Sim3D) {
            // layer 1
            let j0 = document.getElementById('j0') as HTMLInputElement;
            let j1 = document.getElementById('j1') as HTMLInputElement;
            let j2 = document.getElementById('j2') as HTMLInputElement;
            let j3 = document.getElementById('j3') as HTMLInputElement;
            let j4 = document.getElementById('j4') as HTMLInputElement;
            let j5 = document.getElementById('j5') as HTMLInputElement;
            let j6 = document.getElementById('j6') as HTMLInputElement;
            let j7 = document.getElementById('j7') as HTMLInputElement;
            let j8 = document.getElementById('j8') as HTMLInputElement;
            // layer 2
            let j9 = document.getElementById('j0') as HTMLInputElement;
            let j10 = document.getElementById('j1') as HTMLInputElement;
            let j11 = document.getElementById('j2') as HTMLInputElement;
            let j12 = document.getElementById('j3') as HTMLInputElement;
            let j13 = document.getElementById('j4') as HTMLInputElement;
            let j14 = document.getElementById('j5') as HTMLInputElement;
            let j15 = document.getElementById('j6') as HTMLInputElement;
            let j16 = document.getElementById('j7') as HTMLInputElement;
            let j17 = document.getElementById('j8') as HTMLInputElement;
            // layer 2
            let j18 = document.getElementById('j0') as HTMLInputElement;
            let j19 = document.getElementById('j1') as HTMLInputElement;
            let j20 = document.getElementById('j2') as HTMLInputElement;
            let j21 = document.getElementById('j3') as HTMLInputElement;
            let j22 = document.getElementById('j4') as HTMLInputElement;
            let j23 = document.getElementById('j5') as HTMLInputElement;
            let j24 = document.getElementById('j6') as HTMLInputElement;
            let j25 = document.getElementById('j7') as HTMLInputElement;
            let j26 = document.getElementById('j8') as HTMLInputElement;
            // TODO: symmetry
            var x_sym = document.getElementById('x_sym') as HTMLInputElement;
            var y_sym = document.getElementById('y_sym') as HTMLInputElement;
            var z_sym = document.getElementById('z_sym') as HTMLInputElement;
            let kernel = new Float32Array([
                j0.valueAsNumber,
                j1.valueAsNumber,
                j2.valueAsNumber,
                j3.valueAsNumber,
                j4.valueAsNumber,
                j5.valueAsNumber,
                j6.valueAsNumber,
                j7.valueAsNumber,
                j8.valueAsNumber,
                j9.valueAsNumber,
                j10.valueAsNumber,
                j11.valueAsNumber,
                j12.valueAsNumber,
                j13.valueAsNumber,
                j14.valueAsNumber,
                j15.valueAsNumber,
                j16.valueAsNumber,
                j17.valueAsNumber,
                j18.valueAsNumber,
                j19.valueAsNumber,
                j20.valueAsNumber,
                j21.valueAsNumber,
                j22.valueAsNumber,
                j23.valueAsNumber,
                j24.valueAsNumber,
                j25.valueAsNumber,
                j26.valueAsNumber
            ]);
            sim.update_kernel(kernel);
        }
    }

    randomize_seed() {
        // set seed
        let sim = this.props.sim;
        let seed_field = document.getElementById('seed_field') as HTMLInputElement;
        let seed_field_3d = document.getElementById('seed_field_3d') as HTMLInputElement;
        this.seed = sim.generate_seed(ControlWindow.SEED_LEN);
        seed_field.value = this.seed.toString();
        seed_field_3d.value = this.seed.toString();
    }

    randomize_kernel() {
        let sim = this.props.sim;
        if (sim.mode === SimMode.Sim2D) {
            var v_sym = document.getElementById('v_sym') as HTMLInputElement;
            var h_sym = document.getElementById('h_sym') as HTMLInputElement;
            let rng = new Rand();
            let k0 = rng.next()*2-1;
            let k1 = rng.next()*2-1;
            let k2 = rng.next()*2-1;
            let k3 = rng.next()*2-1;
            let k4 = rng.next()*2-1;
            let k5 = rng.next()*2-1;
            let k6 = rng.next()*2-1;
            let k7 = rng.next()*2-1;
            let k8 = rng.next()*2-1;
            if (h_sym.checked) {
                k6 = k0;
                k7 = k1;
                k8 = k2;
            }
            if (v_sym.checked) {
                k2 = k0;
                k5 = k3;
                k8 = k6;
            }
            let kernel = new Float32Array([k0, k1, k2, k3, k4, k5, k6, k7, k8]);
            this.set_kernel(kernel);
            sim.update_kernel(kernel);
            sim.custom_kernel();
            let menu = document.getElementById('load_automata') as HTMLSelectElement;
            menu.value = 'custom';
        }
        else if (sim.mode === SimMode.Sim3D) {
            let rng = new Rand();
            // layer 1
            let j0 = rng.next()*2-1;
            let j1 = rng.next()*2-1;
            let j2 = rng.next()*2-1;
            let j3 = rng.next()*2-1;
            let j4 = rng.next()*2-1;
            let j5 = rng.next()*2-1;
            let j6 = rng.next()*2-1;
            let j7 = rng.next()*2-1;
            let j8 = rng.next()*2-1;
            // layer 2
            let j9 = rng.next()*2-1;
            let j10 = rng.next()*2-1;
            let j11 = rng.next()*2-1;
            let j12 = rng.next()*2-1;
            let j13 = rng.next()*2-1;
            let j14 = rng.next()*2-1;
            let j15 = rng.next()*2-1;
            let j16 = rng.next()*2-1;
            let j17 = rng.next()*2-1;
            // layer 3
            let j18 = rng.next()*2-1;
            let j19 = rng.next()*2-1;
            let j20 = rng.next()*2-1;
            let j21 = rng.next()*2-1;
            let j22 = rng.next()*2-1;
            let j23 = rng.next()*2-1;
            let j24 = rng.next()*2-1;
            let j25 = rng.next()*2-1;
            let j26 = rng.next()*2-1;
            let kernel = new Float32Array([
                j0,  j1,  j2,  j3,  j4,  j5,  j6,  j7,  j8, 
                j9,  j10, j11, j12, j13, j14, j15, j16, j17,
                j18, j19, j20, j21, j22, j23, j24, j25, j26, ]);
            this.set_kernel(kernel);
            sim.update_kernel(kernel);
        }
    }

    update_sim_activation() {
        let af = document.getElementById('af') as HTMLTextAreaElement;
        this.set_activation(af.value, true);
        let sim = this.props.sim;
        sim.update_activation(af.value);
    }

    update_kernel_symmetry() {
        let sim = this.props.sim;
        if (sim.mode === SimMode.Sim2D) {
            let k0 = document.getElementById('k0') as HTMLInputElement;
            let k1 = document.getElementById('k1') as HTMLInputElement;
            let k2 = document.getElementById('k2') as HTMLInputElement;
            let k3 = document.getElementById('k3') as HTMLInputElement;
            let k4 = document.getElementById('k4') as HTMLInputElement;
            let k5 = document.getElementById('k5') as HTMLInputElement;
            let k6 = document.getElementById('k6') as HTMLInputElement;
            let k7 = document.getElementById('k7') as HTMLInputElement;
            let k8 = document.getElementById('k8') as HTMLInputElement;
            let v_sym = document.getElementById('v_sym') as HTMLInputElement;
            let h_sym = document.getElementById('h_sym') as HTMLInputElement;
            // reset all kernel styles
            k0.style.background = 'rgba(255, 255, 255, 0.6)';
            k1.style.background = 'rgba(255, 255, 255, 0.6)';
            k2.style.background = 'rgba(255, 255, 255, 0.6)';
            k3.style.background = 'rgba(255, 255, 255, 0.6)';
            k4.style.background = 'rgba(255, 255, 255, 0.6)';
            k5.style.background = 'rgba(255, 255, 255, 0.6)';
            k6.style.background = 'rgba(255, 255, 255, 0.6)';
            k7.style.background = 'rgba(255, 255, 255, 0.6)';
            k8.style.background = 'rgba(255, 255, 255, 0.6)';
            k0.disabled = false;
            k1.disabled = false;
            k2.disabled = false;
            k3.disabled = false;
            k5.disabled = false;
            k6.disabled = false;
            k7.disabled = false;
            k8.disabled = false;
            if (v_sym.checked && !h_sym.checked) {
                k0.style.background = 'rgba(110, 212, 252, 0.6)';
                k3.style.background = 'rgba(110, 212, 252, 0.6)';
                k6.style.background = 'rgba(110, 212, 252, 0.6)';
                k2.style.background = 'rgba(110, 212, 252, 0.6)';
                k5.style.background = 'rgba(110, 212, 252, 0.6)';
                k8.style.background = 'rgba(110, 212, 252, 0.6)';
                k2.disabled = true;
                k5.disabled = true;
                k8.disabled = true;
            }   
            else if (h_sym.checked && !v_sym.checked) {
                k0.style.background = 'rgba(110, 212, 252, 0.6)';
                k1.style.background = 'rgba(110, 212, 252, 0.6)';
                k2.style.background = 'rgba(110, 212, 252, 0.6)';
                k6.style.background = 'rgba(110, 212, 252, 0.6)';
                k7.style.background = 'rgba(110, 212, 252, 0.6)';
                k8.style.background = 'rgba(110, 212, 252, 0.6)';
                k6.disabled = true;
                k7.disabled = true;
                k8.disabled = true;
            }
            else if (v_sym.checked && h_sym.checked) {
                k0.style.background = 'rgba(38, 148, 192, 0.6)';
                k2.style.background = 'rgba(38, 148, 192, 0.6)';
                k6.style.background = 'rgba(38, 148, 192, 0.6)';
                k8.style.background = 'rgba(38, 148, 192, 0.6)';
                k1.style.background = 'rgba(110, 212, 252, 0.6)';
                k3.style.background = 'rgba(110, 212, 252, 0.6)';
                k5.style.background = 'rgba(110, 212, 252, 0.6)';
                k7.style.background = 'rgba(110, 212, 252, 0.6)';
                k1.disabled = true;
                k2.disabled = true;
                k5.disabled = true;
                k6.disabled = true;
                k7.disabled = true;
                k8.disabled = true;
            }
        }
        else if (sim.mode === SimMode.Sim3D) {
            // layer 1
            let j0 = document.getElementById('j0') as HTMLInputElement;
            let j1 = document.getElementById('j1') as HTMLInputElement;
            let j2 = document.getElementById('j2') as HTMLInputElement;
            let j3 = document.getElementById('j3') as HTMLInputElement;
            let j4 = document.getElementById('j4') as HTMLInputElement;
            let j5 = document.getElementById('j5') as HTMLInputElement;
            let j6 = document.getElementById('j6') as HTMLInputElement;
            let j7 = document.getElementById('j7') as HTMLInputElement;
            let j8 = document.getElementById('j8') as HTMLInputElement;
            // layer 2
            let j9 = document.getElementById('j0') as HTMLInputElement;
            let j10 = document.getElementById('j1') as HTMLInputElement;
            let j11 = document.getElementById('j2') as HTMLInputElement;
            let j12 = document.getElementById('j3') as HTMLInputElement;
            let j13 = document.getElementById('j4') as HTMLInputElement;
            let j14 = document.getElementById('j5') as HTMLInputElement;
            let j15 = document.getElementById('j6') as HTMLInputElement;
            let j16 = document.getElementById('j7') as HTMLInputElement;
            let j17 = document.getElementById('j8') as HTMLInputElement;
            // layer 2
            let j18 = document.getElementById('j0') as HTMLInputElement;
            let j19 = document.getElementById('j1') as HTMLInputElement;
            let j20 = document.getElementById('j2') as HTMLInputElement;
            let j21 = document.getElementById('j3') as HTMLInputElement;
            let j22 = document.getElementById('j4') as HTMLInputElement;
            let j23 = document.getElementById('j5') as HTMLInputElement;
            let j24 = document.getElementById('j6') as HTMLInputElement;
            let j25 = document.getElementById('j7') as HTMLInputElement;
            let j26 = document.getElementById('j8') as HTMLInputElement;
            // TODO: symmetry
            var x_sym = document.getElementById('x_sym') as HTMLInputElement;
            var y_sym = document.getElementById('y_sym') as HTMLInputElement;
            var z_sym = document.getElementById('z_sym') as HTMLInputElement;
        }
    }

    set_kernel(_kernel: Float32Array) {
        let sim = this.props.sim;
        if (sim.mode === SimMode.Sim2D) {
            // assert _kernel is correct length
            if (_kernel.length !== 9) return;
            for (let i = 0; i < _kernel.length; i++) {
                let k = document.getElementById('k'+i.toFixed(0).toString()) as HTMLInputElement;
                k.value = _kernel[i].toFixed(3).toString();
            }
        }
        else if (sim.mode === SimMode.Sim3D) {
            // assert _kernel is correct length
            if (_kernel.length !== 27) return;
            for (let i = 0; i < _kernel.length; i++) {
                let j = document.getElementById('j'+i.toFixed(0).toString()) as HTMLInputElement;
                j.value = _kernel[i].toFixed(3).toString();
            }
        }
    }

    set_activation(_activation: string, is_custom: boolean) {
        let af = document.getElementById('af') as HTMLTextAreaElement;
        af.value = _activation;
        if (is_custom) {
            let menu = document.getElementById('load_activation') as HTMLSelectElement;
            menu.value = 'custom';
        }
    }

    load_activation() {
        let menu = document.getElementById('load_activation') as HTMLSelectElement;
        let act = '';
        switch(menu.value) {
        default: return;
        case 'id':
            act = 'return x;';
            break;
        case 'sin':
            act = 'return sin(x);';
            break;
        case 'pow':
            act = 'return pow(x,2.0);';
            break;
        case 'abs':
            act = 'return abs(x);';
            break;
        case 'tanh':
            act = 'return (exp(2.0*x)-1.0)/(exp(2.0*x)+1.0);';
            break;
        case 'inv_gaus':
            act = 'return -1.0/pow(2.0,(pow(x,2.0)))+1.0;';
            break;
        }

        let sim = this.props.sim;
        sim.update_activation(act);
        this.set_activation(act, false);
    }

    load_automata_3d() {
        // TODO find and load interesting 3d automata
    }

    load_automata() {
        let menu = document.getElementById('load_automata') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_automata(value);
        // update ui
        let v_sym = document.getElementById('v_sym') as HTMLInputElement;
        let h_sym = document.getElementById('h_sym') as HTMLInputElement;
        v_sym.checked = true;
        h_sym.checked = true;
        this.update_kernel_symmetry();
        this.set_kernel(sim.get_kernel() as Float32Array);
        this.set_activation(sim.get_activation() as string, true);
    }

    load_colormap() {
        let menu = document.getElementById('load_colormap') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_colormap(value); 
    }

    load_shader() {
        let menu = document.getElementById('load_shader') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_shader(value);
    }

    reset_automata() {
        let seed_field = document.getElementById('seed_field') as HTMLInputElement;
        let reset_cam = document.getElementById('toggle_reset_cam') as HTMLInputElement;
        let sim = this.props.sim;
        sim.reset(seed_field.value, reset_cam.checked);
    }

    render() {
        return(
            <>
                <div id='ctrl_window' className='ui_window'>
                    <div id='ctrl_window_inside'>
                        {/* extra padding at the top of the window */}
                        <div style={{height:'0em'}}/>

                        <div id='ctrl_module'>
                            <div className='ui_info'>
                                <h4 className='ctrl_module_sub_title'>fps: <span id='fps'/></h4>
                                <h4 className='ctrl_module_sub_title'>res: <span id='res'/></h4>
                            </div>
                        </div>

                        <hr/>
                        <div id='ctrl_module'>
                            <h4 className='ctrl_module_sub_title'>simulation mode</h4>
                            <div className='ui_row'>
                                <h1 className='ctrl_module_title' style={{paddingRight:'0.5em'}}>2D</h1>
                                <label className='toggle_switch'>
                                    <input id='sim_mode' onClick={this.toggle_sim} type='checkbox'/>
                                    <span className='toggle_slider'></span>
                                </label>
                                <h1 className='ctrl_module_title' style={{paddingLeft:'0.5em'}}>3D</h1>
                            </div>

                            <div className='ui_row'>
                                <input type='checkbox' id='toggle_aa' className='ui_button' onClick={this.toggle_aa}/>
                                <h4 className='ctrl_module_sub_title'>anti-aliasing</h4>
                            </div>

                            <div className='ui_row'>
                                <input type='checkbox' id='toggle_pause' className='ui_button' onClick={this.pause_sim}/>
                                <h4 className='ctrl_module_sub_title'>paused</h4>
                            </div>
                        </div>


                        <div id='_3D' style={{scale:'0%', height:'0px'}}>

                        <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>automata</h2>
                                <div style={{paddingBottom:'0.5em'}}>
                                    <h4 className='ctrl_module_sub_title'>load preset</h4>
                                    <select className='dropdown_input' name='automata' id='load_automata_3d' onChange={this.load_automata_3d}>
                                        <option value='custom' disabled>custom 🛠️</option>
                                    </select>
                                </div>
        
                                <div style={{paddingBottom:'1em'}}>
                                    <h4 className='ctrl_module_sub_title'>seed</h4>
                                    <div className='ui_row'>
                                        <input id='seed_field_3d' className='ui_text_field' maxLength={ControlWindow.SEED_LEN}></input>
                                        <div style={{paddingRight:'0.5em'}}/>
                                        <button id='randomize_seed' className='ui_button' style={{width:'35%'}} onClick={this.randomize_seed}>new seed</button>
                                    </div>
                                </div>

                                <div className='ui_row'>
                                    <input type='checkbox' id='toggle_reset_cam' className='ui_button'/>
                                    <h4 className='ctrl_module_sub_title'>reset camera</h4>
                                </div>
                                <button id='reset_button' className='ui_button' onClick={this.reset_automata} style={{padding:'0.5em', width:'100%'}}>reset automata</button>

                                {/* TODO export import automata using .json files 
                                <div style={{paddingTop:'0.5em'}}>
                                    <button id='export_button' className='ui_button' style={{width:'50%'}}>export</button>
                                    <button id='import_button' className='ui_button' style={{width:'50%'}}>import</button>
                                </div>
                                */}
                            </div>

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>render</h2>
                                <div className='ui_row'>
                                    <input type='checkbox' id='toggle_blend' className='ui_button' onClick={this.toggle_blend}/>
                                    <h4 className='ctrl_module_sub_title'>blend</h4>
                                </div>

                                <div style={{paddingBottom:'0.5em'}}>
                                    <h4 className='ctrl_module_sub_title'>colormap</h4>
                                    <select className='dropdown_input' name='colormap' id='load_colormap' onChange={this.load_colormap}>
                                        <option className='dropdown_option' value='ygb'>yellow green blue</option>
                                        <option value='cool_warm'>cool warm</option>
                                        <option value='plasma'>plasma</option>
                                        <option value='virdis'>virdis</option>
                                        <option value='rainbow'>rainbow</option>
                                        <option value='green'>green</option>
                                    </select>
                                </div>

                                <h4 className='ctrl_module_sub_title'>volume size</h4>
                                <div className='ui_row'>
                                    <div className='slider_container'>
                                        <input type='range' min='1' max='256' defaultValue='64' className='slider' id='volume_size' onChange={this.update_volume_text} onMouseUp={this.update_volume_size}/>
                                    </div>
                                    <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='volume_size_text'>64</h4>
                                </div>
                            </div>

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>kernel</h2>
                                <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 1</h4>
                                <div className='ui_row' style={{justifyContent:'center'}}>
                                    <div className='ui_column'>
                                        <input id='j0' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j1' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j2' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='j3' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j4' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j5' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='j6' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j7' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j8' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>
                                
                                <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 2</h4>
                                <div className='ui_row' style={{justifyContent:'center'}}>
                                    <div className='ui_column'>
                                        <input id='j9' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j10' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j11' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='j12' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j13' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j14' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='j15' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j16' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j17' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>
                                
                                <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 3</h4>
                                <div className='ui_row' style={{justifyContent:'center'}}>
                                    <div className='ui_column'>
                                        <input id='j18' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j19' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j20' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='j21' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j22' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j23' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='j24' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j25' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j26' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>

                                <div style={{padding:'0.5em'}}>
                                    <div className='ui_column'>
                                        <div className='ui_row'>
                                            <input type='checkbox' id='x_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>x symmetry</h4>
                                        </div>
                                        <div className='ui_row'>
                                            <input type='checkbox' id='y_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>y symmetry</h4>
                                        </div>
                                        <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                            <input type='checkbox' id='z_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>z symmetry</h4>
                                        </div>
                                    </div>
                                    <button className='ui_button' onClick={this.randomize_kernel} style={{padding:'0.5em', width:'100%'}}>randomize kernel</button>
                                </div>
                            </div>
                        </div>


                        <div id='_2D' style={{scale:'100%', height:'100%'}}>
                            {/* TODO
                            <hr/>
                            <div id='ctrl_module'>
                                <h4 className='ctrl_module_sub_title'>how it works:</h4>
                                <div>
 
                                </div>
                            </div> */}

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>automata</h2>
                                <div style={{paddingBottom:'0.5em'}}>
                                    <h4 className='ctrl_module_sub_title'>load preset</h4>
                                    <select className='dropdown_input' name='automata' id='load_automata' onChange={this.load_automata}>
                                        <option className='dropdown_option' value='worms'>worms 🐍</option>
                                        <option value='drops'>drops 💧</option>
                                        <option value='waves'>waves 🌊</option>
                                        <option value='paths'>paths 🚪</option>
                                        <option value='stars'>stars ⭐</option>
                                        <option value='cells'>cells 🦠</option>
                                        <option value='slime'>slime 🧫</option>
                                        <option value='lands'>lands 🗺️</option>
                                        <option value='circuit'>circuit 💻</option>
                                        <option value='cgol'>game of life ♟️</option>
                                        <option value='custom' disabled>custom 🛠️</option>
                                    </select>
                                </div>
        
                                <div style={{paddingBottom:'1em'}}>
                                    <h4 className='ctrl_module_sub_title'>seed</h4>
                                    <div className='ui_row'>
                                        <input id='seed_field' className='ui_text_field' maxLength={ControlWindow.SEED_LEN}></input>
                                        <div style={{paddingRight:'0.5em'}}/>
                                        <button id='randomize_seed' className='ui_button' style={{width:'35%'}} onClick={this.randomize_seed}>new seed</button>
                                    </div>
                                </div>

                                <button id='reset_button' className='ui_button' onClick={this.reset_automata} style={{padding:'0.5em', width:'100%'}}>reset automata</button>

                                {/* TODO export import automata using .json files 
                                <div style={{paddingTop:'0.5em'}}>
                                    <button id='export_button' className='ui_button' style={{width:'50%'}}>export</button>
                                    <button id='import_button' className='ui_button' style={{width:'50%'}}>import</button>
                                </div>
                                */}
                            </div>
                            
                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>shader</h2>
                                <div>
                                    <select className='dropdown_input' name='shader' id='load_shader' onChange={this.load_shader}>
                                        <option value='bnw'>black and white</option>
                                        <option value='alpha'>alpha channel</option>
                                        <option value='rgb'>red green blue channels</option>
                                        <option value='acid'>acid</option>
                                    </select>
                                </div>
                            </div>
                            
                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>kernel</h2>
                                <div className='ui_row' style={{justifyContent:'center'}}>
                                    <div className='ui_column'>
                                        <input id='k0' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k1' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k2' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='k3' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k4' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k5' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_column'>
                                        <input id='k6' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k7' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k8' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>

                                <div style={{padding:'0.5em'}}>
                                    <div className='ui_column'>
                                        <div className='ui_row'>
                                            <input type='checkbox' id='v_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>vertical symmetry</h4>
                                        </div>
                                        <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                            <input type='checkbox' id='h_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>horizontal symmetry</h4>
                                        </div>
                                    </div>
                                    <button className='ui_button' onClick={this.randomize_kernel} style={{padding:'0.5em', width:'100%'}}>randomize kernel</button>
                                </div>
                            </div>
                            
                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>activation function</h2>
                                <div>
                                    <textarea id='af' className='activation_input' onChange={this.update_sim_activation}/>
                                </div>
                                <h4 className='ctrl_module_sub_title'>load activation function</h4>
                                <div>
                                    <select className='dropdown_input' name='automata' id='load_activation' onChange={this.load_activation}>
                                        <option value='id'>identity</option>
                                        <option value='sin'>sin</option>
                                        <option value='pow'>power</option>
                                        <option value='abs'>absolute value</option>
                                        <option value='tanh'>tanh</option>
                                        <option value='inv_gaus'>inverse gaussian</option>
                                        <option value='custom' disabled>custom 🛠️</option>
                                    </select>
                                </div>
                            </div>

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>options</h2>
                                <h4 className='ctrl_module_sub_title'>brush size</h4>
                                <div className='ui_row'>
                                    <div className='slider_container'>
                                        <input type='range' min='1' max='256' defaultValue='64' className='slider' id='brush_slider' onChange={this.update_sim_brush}/>
                                    </div>
                                    <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='brush_text'>64</h4>
                                </div>

                                <h4 className='ctrl_module_sub_title'>zoom level</h4>
                                <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                    <div className='slider_container'>
                                        <input type='range' min='0.6' max='16.0' defaultValue='2.0' step='0.2' className='slider' id='zoom_slider' onChange={this.update_zoom_text} onMouseUp={this.update_sim_zoom}/>
                                    </div>
                                    <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='zoom_text'>2.0</h4>
                                </div>
                            </div>
                        </div>
                                                
                        {/* extra padding at the bottom of the window */}
                        <div style={{height:'12em'}}/>
                    </div>
                </div>

                <div>
                    <button id='ctrl_button' className='ui_button' style={{
                        backgroundColor:'white', 
                        color:'rgba(0, 0, 0, 0.85)', 
                        border:'solid 2px black'}} onClick={this.toggle_window}>close</button>
                </div>
            </>
        );
    }
}