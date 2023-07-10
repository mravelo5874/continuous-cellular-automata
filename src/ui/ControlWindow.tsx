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
        this.update_kernel_symmetry = this.update_kernel_symmetry.bind(this);
        this.update_region = this.update_region.bind(this);

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
            let f_sym = document.getElementById('f_sym') as HTMLInputElement;
            let b_sym = document.getElementById('b_sym') as HTMLInputElement;
            let full_sym = document.getElementById('x_sym') as HTMLInputElement;
            v_sym.checked = true;
            h_sym.checked = true;
            f_sym.checked = true;
            b_sym.checked = true;
            full_sym.checked = false;
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
            // symmetry toggles
            var v_sym = document.getElementById('v_sym') as HTMLInputElement;
            var h_sym = document.getElementById('h_sym') as HTMLInputElement;
            var f_sym = document.getElementById('f_sym') as HTMLInputElement;
            var b_sym = document.getElementById('b_sym') as HTMLInputElement;
            let full_sym = document.getElementById('x_sym') as HTMLInputElement;
            // devise kernel array
            let kernel = new Float32Array([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            for (let i = 0; i < 9; i++) {
                let k = document.getElementById('k'+i.toFixed(0).toString()) as HTMLInputElement;
                kernel[i] = k.valueAsNumber;
            }
            // apply symmetries
            if (h_sym.checked) {
                kernel[6] = kernel[0];
                kernel[7] = kernel[1];
                kernel[8] = kernel[2];
            }
            if (v_sym.checked) {
                kernel[2] = kernel[0];
                kernel[5] = kernel[3];
                kernel[8] = kernel[6];
            }
            if (f_sym.checked) {
                kernel[8] = kernel[0];
                kernel[5] = kernel[1];
                kernel[7] = kernel[3];
            }
            if (b_sym.checked) {
                kernel[3] = kernel[1];
                kernel[6] = kernel[2];
                kernel[7] = kernel[5];
            }
            if (full_sym.checked) {
                kernel[1] = kernel[0];
                kernel[2] = kernel[0];
                kernel[3] = kernel[0];
                kernel[5] = kernel[0];
                kernel[6] = kernel[0];
                kernel[7] = kernel[0];
                kernel[8] = kernel[0];
            }
            this.set_kernel(kernel);
            sim.update_kernel(kernel);
        }
        else if (sim.mode === SimMode.Sim3D) {
            // symmetry toggles
            var xp_sym = document.getElementById('x_plane_sym') as HTMLInputElement;
            var x1_sym = document.getElementById('x_diag_1_sym') as HTMLInputElement;
            var x2_sym = document.getElementById('x_diag_2_sym') as HTMLInputElement;
            var yp_sym = document.getElementById('y_plane_sym') as HTMLInputElement;
            var y1_sym = document.getElementById('y_diag_1_sym') as HTMLInputElement;
            var y2_sym = document.getElementById('y_diag_2_sym') as HTMLInputElement;
            var zp_sym = document.getElementById('z_plane_sym') as HTMLInputElement;
            var z1_sym = document.getElementById('z_diag_1_sym') as HTMLInputElement;
            var z2_sym = document.getElementById('z_diag_2_sym') as HTMLInputElement;
            let full_sym = document.getElementById('full_sym') as HTMLInputElement;
            // devise kernel array
            let kernel = new Float32Array([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            ]);
            for (let i = 0; i < 27; i++) {
                let k = document.getElementById('j'+i.toFixed(0).toString()) as HTMLInputElement;
                kernel[i] = k.valueAsNumber;
            }
            // apply symmetries
            if (xp_sym.checked) {
                kernel[2] = kernel[0];
                kernel[5] = kernel[3];
                kernel[8] = kernel[6];
                kernel[11] = kernel[9];
                kernel[14] = kernel[12];
                kernel[17] = kernel[15];
                kernel[20] = kernel[18];
                kernel[23] = kernel[21];
                kernel[26] = kernel[24];
            }
            if (x1_sym.checked) {
                kernel[24] = kernel[0];
                kernel[25] = kernel[1];
                kernel[26] = kernel[2];
                kernel[15] = kernel[3];
                kernel[16] = kernel[4];
                kernel[17] = kernel[5];
                kernel[21] = kernel[9];
                kernel[22] = kernel[10];
                kernel[23] = kernel[11];
            }
            if (x2_sym.checked) {
                kernel[9] = kernel[3];
                kernel[10] = kernel[4];
                kernel[11] = kernel[5];
                kernel[18] = kernel[6];
                kernel[19] = kernel[7];
                kernel[20] = kernel[8];
                kernel[21] = kernel[15];
                kernel[22] = kernel[16];
                kernel[23] = kernel[17];
            }
            if (yp_sym.checked) {
                kernel[6] = kernel[0];
                kernel[7] = kernel[1];
                kernel[8] = kernel[2];
                kernel[15] = kernel[9];
                kernel[16] = kernel[10];
                kernel[17] = kernel[11];
                kernel[24] = kernel[18];
                kernel[25] = kernel[19];
                kernel[26] = kernel[20];
            }
            if (y1_sym.checked) {
                kernel[18] = kernel[2];
                kernel[21] = kernel[5];
                kernel[24] = kernel[8];
                kernel[9] = kernel[1];
                kernel[12] = kernel[4];
                kernel[15] = kernel[7];
                kernel[19] = kernel[11];
                kernel[22] = kernel[14];
                kernel[25] = kernel[17];
            }
            if (y2_sym.checked) {
                kernel[20] = kernel[0];
                kernel[23] = kernel[3];
                kernel[26] = kernel[6];
                kernel[11] = kernel[1];
                kernel[14] = kernel[4];
                kernel[17] = kernel[7];
                kernel[19] = kernel[9];
                kernel[22] = kernel[12];
                kernel[25] = kernel[15];
            }
            if (zp_sym.checked) {
                kernel[18] = kernel[0];
                kernel[19] = kernel[1];
                kernel[20] = kernel[2];
                kernel[21] = kernel[3];
                kernel[22] = kernel[4];
                kernel[23] = kernel[5];
                kernel[24] = kernel[6];
                kernel[25] = kernel[7];
                kernel[26] = kernel[8];
            }
            if (z1_sym.checked) {
                kernel[8] = kernel[0];
                kernel[17] = kernel[9];
                kernel[26] = kernel[18];
                kernel[5] = kernel[1];
                kernel[14] = kernel[10];
                kernel[23] = kernel[19];
                kernel[7] = kernel[3];
                kernel[16] = kernel[12];
                kernel[25] = kernel[21];
            }
            if (z2_sym.checked) {
                kernel[6] = kernel[2];
                kernel[15] = kernel[11];
                kernel[24] = kernel[20];
                kernel[3] = kernel[1];
                kernel[12] = kernel[10];
                kernel[21] = kernel[19];
                kernel[7] = kernel[5];
                kernel[16] = kernel[14];
                kernel[25] = kernel[23];
            }
            if (full_sym.checked) {
                kernel[1] = kernel[0];
                kernel[2] = kernel[0];
                kernel[3] = kernel[0];
                kernel[4] = kernel[0];
                kernel[5] = kernel[0];
                kernel[6] = kernel[0];
                kernel[7] = kernel[0];
                kernel[8] = kernel[0];
                kernel[9] = kernel[0];
                kernel[10] = kernel[0];
                kernel[11] = kernel[0];
                kernel[12] = kernel[0];
                kernel[14] = kernel[0];
                kernel[15] = kernel[0];
                kernel[16] = kernel[0];
                kernel[17] = kernel[0];
                kernel[18] = kernel[0];
                kernel[19] = kernel[0];
                kernel[20] = kernel[0];
                kernel[21] = kernel[0];
                kernel[22] = kernel[0];
                kernel[23] = kernel[0];
                kernel[24] = kernel[0];
                kernel[25] = kernel[0];
                kernel[26] = kernel[0];
            }
            this.set_kernel(kernel);
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
            // symmetry toggles
            var v_sym = document.getElementById('v_sym') as HTMLInputElement;
            var h_sym = document.getElementById('h_sym') as HTMLInputElement;
            var f_sym = document.getElementById('f_sym') as HTMLInputElement;
            var b_sym = document.getElementById('b_sym') as HTMLInputElement;
            let full_sym = document.getElementById('x_sym') as HTMLInputElement;
            // devise kernel array
            let rng = new Rand();
            let kernel = new Float32Array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
            for (let i = 0; i < 9; i++) {
                kernel[i] = rng.next()*2-1;
            }
            // apply symmetries
            if (h_sym.checked) {
                kernel[6] = kernel[0];
                kernel[7] = kernel[1];
                kernel[8] = kernel[2];
            }
            if (v_sym.checked) {
                kernel[2] = kernel[0];
                kernel[5] = kernel[3];
                kernel[8] = kernel[6];
            }
            if (f_sym.checked) {
                kernel[8] = kernel[0];
                kernel[5] = kernel[1];
                kernel[7] = kernel[3];
            }
            if (b_sym.checked) {
                kernel[3] = kernel[1];
                kernel[6] = kernel[2];
                kernel[7] = kernel[5];
            }
            if (full_sym.checked) {
                kernel[1] = kernel[0];
                kernel[2] = kernel[0];
                kernel[3] = kernel[0];
                kernel[5] = kernel[0];
                kernel[6] = kernel[0];
                kernel[7] = kernel[0];
                kernel[8] = kernel[0];
            }
            // set kernel
            this.set_kernel(kernel);
            sim.update_kernel(kernel);
            sim.custom_kernel();
            let menu = document.getElementById('load_automata') as HTMLSelectElement;
            menu.value = 'custom';
        }
        else if (sim.mode === SimMode.Sim3D) {
            // symmetry toggles
            var xp_sym = document.getElementById('x_plane_sym') as HTMLInputElement;
            var x1_sym = document.getElementById('x_diag_1_sym') as HTMLInputElement;
            var x2_sym = document.getElementById('x_diag_2_sym') as HTMLInputElement;
            var yp_sym = document.getElementById('y_plane_sym') as HTMLInputElement;
            var y1_sym = document.getElementById('y_diag_1_sym') as HTMLInputElement;
            var y2_sym = document.getElementById('y_diag_2_sym') as HTMLInputElement;
            var zp_sym = document.getElementById('z_plane_sym') as HTMLInputElement;
            var z1_sym = document.getElementById('z_diag_1_sym') as HTMLInputElement;
            var z2_sym = document.getElementById('z_diag_2_sym') as HTMLInputElement;
            let full_sym = document.getElementById('full_sym') as HTMLInputElement;
            // devise kernel array
            let kernel = new Float32Array([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            ]);
            // devise kernel array
            let rng = new Rand();
            for (let i = 0; i < 27; i++) {
                kernel[i] = rng.next()*2-1;
            }
            // apply symmetries
            if (xp_sym.checked) {
                kernel[2] = kernel[0];
                kernel[5] = kernel[3];
                kernel[8] = kernel[6];
                kernel[11] = kernel[9];
                kernel[14] = kernel[12];
                kernel[17] = kernel[15];
                kernel[20] = kernel[18];
                kernel[23] = kernel[21];
                kernel[26] = kernel[24];
            }
            if (x1_sym.checked) {
                kernel[24] = kernel[0];
                kernel[25] = kernel[1];
                kernel[26] = kernel[2];
                kernel[15] = kernel[3];
                kernel[16] = kernel[4];
                kernel[17] = kernel[5];
                kernel[21] = kernel[9];
                kernel[22] = kernel[10];
                kernel[23] = kernel[11];
            }
            if (x2_sym.checked) {
                kernel[9] = kernel[3];
                kernel[10] = kernel[4];
                kernel[11] = kernel[5];
                kernel[18] = kernel[6];
                kernel[19] = kernel[7];
                kernel[20] = kernel[8];
                kernel[21] = kernel[15];
                kernel[22] = kernel[16];
                kernel[23] = kernel[17];
            }
            if (yp_sym.checked) {
                kernel[6] = kernel[0];
                kernel[7] = kernel[1];
                kernel[8] = kernel[2];
                kernel[15] = kernel[9];
                kernel[16] = kernel[10];
                kernel[17] = kernel[11];
                kernel[24] = kernel[18];
                kernel[25] = kernel[19];
                kernel[26] = kernel[20];
            }
            if (y1_sym.checked) {
                kernel[18] = kernel[2];
                kernel[21] = kernel[5];
                kernel[24] = kernel[8];
                kernel[9] = kernel[1];
                kernel[12] = kernel[4];
                kernel[15] = kernel[7];
                kernel[19] = kernel[11];
                kernel[22] = kernel[14];
                kernel[25] = kernel[17];
            }
            if (y2_sym.checked) {
                kernel[20] = kernel[0];
                kernel[23] = kernel[3];
                kernel[26] = kernel[6];
                kernel[11] = kernel[1];
                kernel[14] = kernel[4];
                kernel[17] = kernel[7];
                kernel[19] = kernel[9];
                kernel[22] = kernel[12];
                kernel[25] = kernel[15];
            }
            if (zp_sym.checked) {
                kernel[18] = kernel[0];
                kernel[19] = kernel[1];
                kernel[20] = kernel[2];
                kernel[21] = kernel[3];
                kernel[22] = kernel[4];
                kernel[23] = kernel[5];
                kernel[24] = kernel[6];
                kernel[25] = kernel[7];
                kernel[26] = kernel[8];
            }
            if (z1_sym.checked) {
                kernel[8] = kernel[0];
                kernel[17] = kernel[9];
                kernel[26] = kernel[18];
                kernel[5] = kernel[1];
                kernel[14] = kernel[10];
                kernel[23] = kernel[19];
                kernel[7] = kernel[3];
                kernel[16] = kernel[12];
                kernel[25] = kernel[21];
            }
            if (z2_sym.checked) {
                kernel[6] = kernel[2];
                kernel[15] = kernel[11];
                kernel[24] = kernel[20];
                kernel[3] = kernel[1];
                kernel[12] = kernel[10];
                kernel[21] = kernel[19];
                kernel[7] = kernel[5];
                kernel[16] = kernel[14];
                kernel[25] = kernel[23];
            }
            if (full_sym.checked) {
                kernel[1] = kernel[0];
                kernel[2] = kernel[0];
                kernel[3] = kernel[0];
                kernel[4] = kernel[0];
                kernel[5] = kernel[0];
                kernel[6] = kernel[0];
                kernel[7] = kernel[0];
                kernel[8] = kernel[0];
                kernel[9] = kernel[0];
                kernel[10] = kernel[0];
                kernel[11] = kernel[0];
                kernel[12] = kernel[0];
                kernel[14] = kernel[0];
                kernel[15] = kernel[0];
                kernel[16] = kernel[0];
                kernel[17] = kernel[0];
                kernel[18] = kernel[0];
                kernel[19] = kernel[0];
                kernel[20] = kernel[0];
                kernel[21] = kernel[0];
                kernel[22] = kernel[0];
                kernel[23] = kernel[0];
                kernel[24] = kernel[0];
                kernel[25] = kernel[0];
                kernel[26] = kernel[0];
            }
            // set kernel
            this.set_kernel(kernel);
            sim.update_kernel(kernel);
            sim.custom_kernel();
            let menu = document.getElementById('load_automata') as HTMLSelectElement;
            menu.value = 'custom';
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
            // symmetry toggles
            let v_sym = document.getElementById('v_sym') as HTMLInputElement;
            let h_sym = document.getElementById('h_sym') as HTMLInputElement;
            let f_sym = document.getElementById('f_sym') as HTMLInputElement;
            let b_sym = document.getElementById('b_sym') as HTMLInputElement;
            let full_sym = document.getElementById('x_sym') as HTMLInputElement;
            // reset kernel inputs
            for (let i = 0; i < 9; i++) {
                let k = document.getElementById('k'+i.toFixed(0).toString()) as HTMLInputElement;
                k.style.background = 'rgba(255, 255, 255, 0.6)';
                k.disabled = false;
            }
            // apply symmetries
            if (h_sym.checked) {
                let sym = [6, 7, 8];
                for (let i = 0; i < sym.length; i++) {
                    let k = document.getElementById('k'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    k.style.background = 'rgba(0, 119, 255, 0.6);';
                    k.disabled = true;
                }
            }
            if (v_sym.checked) {
                let sym = [2, 5, 8];
                for (let i = 0; i < sym.length; i++) {
                    let k = document.getElementById('k'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    k.style.background = 'rgba(0, 119, 255, 0.6);';
                    k.disabled = true;
                }
            }
            if (f_sym.checked) {
                let sym = [5, 7, 8];
                for (let i = 0; i < sym.length; i++) {
                    let k = document.getElementById('k'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    k.style.background = 'rgba(0, 119, 255, 0.6);';
                    k.disabled = true;
                }
            }
            if (b_sym.checked) {
                let sym = [3, 6, 7];
                for (let i = 0; i < sym.length; i++) {
                    let k = document.getElementById('k'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    k.style.background = 'rgba(0, 119, 255, 0.6);';
                    k.disabled = true;
                }
            }
            if (full_sym.checked) {
                let sym = [1, 2, 3, 5, 6, 7, 8];
                for (let i = 0; i < sym.length; i++) {
                    let k = document.getElementById('k'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    k.style.background = 'rgba(0, 119, 255, 0.6);';
                    k.disabled = true;
                }
            }
        }
        else if (sim.mode === SimMode.Sim3D) {
            // symmetry toggles
            var xp_sym = document.getElementById('x_plane_sym') as HTMLInputElement;
            var x1_sym = document.getElementById('x_diag_1_sym') as HTMLInputElement;
            var x2_sym = document.getElementById('x_diag_2_sym') as HTMLInputElement;
            var yp_sym = document.getElementById('y_plane_sym') as HTMLInputElement;
            var y1_sym = document.getElementById('y_diag_1_sym') as HTMLInputElement;
            var y2_sym = document.getElementById('y_diag_2_sym') as HTMLInputElement;
            var zp_sym = document.getElementById('z_plane_sym') as HTMLInputElement;
            var z1_sym = document.getElementById('z_diag_1_sym') as HTMLInputElement;
            var z2_sym = document.getElementById('z_diag_2_sym') as HTMLInputElement;
            let full_sym = document.getElementById('full_sym') as HTMLInputElement;
            // reset kernel inputs
            for (let i = 0; i < 27; i++) {
                let j = document.getElementById('j'+i.toFixed(0).toString()) as HTMLInputElement;
                j.style.background = 'rgba(255, 255, 255, 0.6)';
                j.disabled = false;
            }
            // apply symmetries
            if (xp_sym.checked) {
                let sym = [2, 5, 8, 11, 14, 17, 20, 23, 26];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (x1_sym.checked) {
                let sym = [24, 25, 26, 15, 16, 17, 21, 22, 23];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (x2_sym.checked) {
                let sym = [9, 10, 11, 18, 19, 20, 21, 22, 23];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (yp_sym.checked) {
                let sym = [6, 7, 8, 15, 16, 17, 24, 25, 26];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (y1_sym.checked) {
                let sym = [18, 21, 24, 9, 12, 15, 19, 22, 25];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (y2_sym.checked) {
                let sym = [20, 23, 26, 11, 14, 17, 19, 22, 25];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (zp_sym.checked) {
                let sym = [18, 19, 20, 21, 22, 23, 24, 25, 26];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (z1_sym.checked) {
                let sym = [8, 17, 26, 5, 14, 23, 7, 16, 25];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (z2_sym.checked) {
                let sym = [6, 15, 24, 3, 12, 21, 7, 16, 25];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
            if (full_sym.checked) {
                let sym = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
                for (let i = 0; i < sym.length; i++) {
                    let j = document.getElementById('j'+sym[i].toFixed(0).toString()) as HTMLInputElement;
                    j.style.background = 'rgba(0, 119, 255, 0.6);';
                    j.disabled = true;
                }
            }
        }
    }

    update_region() {
        var region_slider = document.getElementById('region_slider') as HTMLInputElement;
        var region_text = document.getElementById('region_text') as HTMLElement;
        region_text.innerHTML = region_slider.value;
        let sim = this.props.sim;
        sim.update_region(region_slider.valueAsNumber);
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
        case 'cos':
            act = 'return cos(x);';
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
        let f_sym = document.getElementById('f_sym') as HTMLInputElement;
        let b_sym = document.getElementById('b_sym') as HTMLInputElement;
        let full_sym = document.getElementById('x_sym') as HTMLInputElement;
        v_sym.checked = true;
        h_sym.checked = true;
        f_sym.checked = true;
        b_sym.checked = true;
        full_sym.checked = false;
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
                                <h4 className='ctrl_module_sub_title'>fill region</h4>
                                <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                    <div className='slider_container'>
                                        <input type='range' min='0' max='1.0' defaultValue='0.2' step='0.01' className='slider' id='region_slider' onChange={this.update_region}/>
                                    </div>
                                    <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='region_text'>0.2</h4>
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
                            </div>

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>kernel 3x3x3</h2>
                                <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 1</h4>
                                <div className='ui_column' style={{justifyContent:'center'}}>
                                    <div className='ui_row'>
                                        <input id='j0' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j1' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j2' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='j3' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j4' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j5' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='j6' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j7' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j8' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>
                                
                                <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 2</h4>
                                <div className='ui_column' style={{justifyContent:'center'}}>
                                    <div className='ui_row'>
                                        <input id='j9' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j10' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j11' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='j12' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j13' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j14' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='j15' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j16' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j17' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>
                                
                                <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 3</h4>
                                <div className='ui_column' style={{justifyContent:'center'}}>
                                    <div className='ui_row'>
                                        <input id='j18' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j19' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j20' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='j21' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j22' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j23' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='j24' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j25' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='j26' type='number'step='0.001' className='kernel_input_small' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>

                                <div style={{padding:'0.5em'}}>
                                    <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>symmetries</h4>
                                    <div className='ui_row' style={{justifyContent:'center'}}>
                                        <div className='ui_column'>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='x_plane_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>x-plane</h4>
                                            </div>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='x_diag_1_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>x-diag 1</h4>
                                            </div>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='x_diag_2_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>x-diag 2</h4>
                                            </div>
                                        </div>
                                        <div className='ui_column' style={{width:'1em'}}/>
                                        <div className='ui_column'>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='y_plane_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>y-plane</h4>
                                            </div>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='y_diag_1_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>y-diag 1</h4>
                                            </div>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='y_diag_2_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>y-diag 2</h4>
                                            </div>
                                        </div>
                                        <div className='ui_column' style={{width:'1em'}}/>
                                        <div className='ui_column'>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='z_plane_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>z-plane</h4>
                                            </div>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='z_diag_1_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>z-diag 1</h4>
                                            </div>
                                            <div className='ui_row'>
                                                <input type='checkbox' id='z_diag_2_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                                <h4 className='ctrl_module_sub_title'>z-diag 2</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='ui_row' style={{justifyContent:'center'}}>
                                        <input type='checkbox' id='full_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                        <h4 className='ctrl_module_sub_title'>full</h4>
                                    </div>
                                    <div style={{height:'0.5em'}}/>
                                    <button className='ui_button' onClick={this.randomize_kernel} style={{padding:'0.5em', width:'100%'}}>randomize kernel</button>
                                </div>
                            </div>

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>options</h2>
                                <h4 className='ctrl_module_sub_title'>volume size</h4>
                                <div className='ui_row'>
                                    <div className='slider_container'>
                                        <input type='range' min='1' max='256' defaultValue='64' className='slider' id='volume_size' onChange={this.update_volume_text} onMouseUp={this.update_volume_size}/>
                                    </div>
                                    <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='volume_size_text'>64</h4>
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
                                <h2 className='ctrl_module_title'>kernel 3x3</h2>
                                <div className='ui_column' style={{justifyContent:'center'}}>
                                    <div className='ui_row'>
                                        <input id='k0' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k1' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k2' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='k3' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k4' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k5' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                    <div className='ui_row'>
                                        <input id='k6' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k7' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        <input id='k8' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                    </div>
                                </div>

                                <div style={{padding:'0.5em'}}>
                                    <div className='ui_column'>
                                        <div className='ui_row'>
                                            <input type='checkbox' id='x_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>full symmetry</h4>
                                        </div>
                                        <div className='ui_row'>
                                            <input type='checkbox' id='v_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>vertical symmetry</h4>
                                        </div>
                                        <div className='ui_row'>
                                            <input type='checkbox' id='h_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>horizontal symmetry</h4>
                                        </div>
                                        <div className='ui_row'>
                                            <input type='checkbox' id='f_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>forward diagonal symmetry</h4>
                                        </div>
                                        <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                            <input type='checkbox' id='b_sym' className='ui_button' onClick={this.update_kernel_symmetry}/>
                                            <h4 className='ctrl_module_sub_title'>backward diagonal symmetry</h4>
                                        </div>
                                    </div>
                                    <button className='ui_button' onClick={this.randomize_kernel} style={{padding:'0.5em', width:'100%'}}>randomize kernel</button>
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
                                    <option value='cos'>cos</option>
                                    <option value='pow'>power</option>
                                    <option value='abs'>absolute value</option>
                                    <option value='tanh'>tanh</option>
                                    <option value='inv_gaus'>inverse gaussian</option>
                                    <option value='custom' disabled>custom 🛠️</option>
                                </select>
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