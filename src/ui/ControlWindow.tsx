import React, { useState } from 'react';
import { Sim, SimMode } from '../sim/Sim';
import Rand from 'src/lib/rand-seed';
import { Shader2D } from 'src/sim/2D/Sim2D';
import { Colormap3D } from 'src/sim/3D/Sim3D';

export { ControlWindow };

interface ControlPanelInterface {
    sim: Sim
}

class ControlWindow extends React.Component<ControlPanelInterface, {}> {
    ui_init: boolean;
    ui_open: boolean;
    init_3D: boolean;
    customize_open: boolean;
    anti_alias: boolean;
    seed: string;

    constructor(props: ControlPanelInterface) {
        super(props);
        this.ui_init = false;
        this.ui_open = true;
        this.init_3D = false;
        this.customize_open = false;
        this.anti_alias = false;
        this.seed = 'seed';

        // bind 'this' for class functions
        // set_sim
        this.reset_sim_automata = this.reset_sim_automata.bind(this);
        this.pause_sim = this.pause_sim.bind(this);
        this.set_sim_kernel = this.set_sim_kernel.bind(this);
        this.set_sim_brush = this.set_sim_brush.bind(this);
        this.set_sim_zoom = this.set_sim_zoom.bind(this);
        this.set_sim_volume_size = this.set_sim_volume_size.bind(this);
        this.set_sim_shader = this.set_sim_shader.bind(this);
        this.set_sim_activation = this.set_sim_activation.bind(this);
        this.set_sim_colormap = this.set_sim_colormap.bind(this);
        this.set_sim_region = this.set_sim_region.bind(this);
        this.set_sim_compute_delay = this.set_sim_compute_delay.bind(this);
        this.set_sim_blend = this.set_sim_blend.bind(this);
        this.set_sim_density = this.set_sim_density.bind(this);
        // update
        this.update_sim_activation = this.update_sim_activation.bind(this);
        this.update_volume_text = this.update_volume_text.bind(this);
        this.update_kernel_symmetry = this.update_kernel_symmetry.bind(this);
        this.update_compute_text = this.update_compute_text.bind(this);
        // load
        this.load_automata_json = this.load_automata_json.bind(this);
        this.load_automata = this.load_automata.bind(this);
        this.load_shader = this.load_shader.bind(this);
        this.load_colormap = this.load_colormap.bind(this);
        // toggle
        this.toggle_window = this.toggle_window.bind(this);
        this.toggle_customize = this.toggle_customize.bind(this);
        this.toggle_sim_blend = this.toggle_sim_blend.bind(this);
        this.toggle_sim_mode = this.toggle_sim_mode.bind(this);
        this.toggle_sim_aa = this.toggle_sim_aa.bind(this);
        this.toggle_sim_wrap = this.toggle_sim_wrap.bind(this);
        this.toggle_sim_orbit = this.toggle_sim_orbit.bind(this);
        this.toggle_sim_skip_frames = this.toggle_sim_skip_frames.bind(this);
        // randomize
        this.randomize_kernel = this.randomize_kernel.bind(this);
        this.randomize_seed = this.randomize_seed.bind(this);
        // others
        this.export_automata = this.export_automata.bind(this);
        this.import_automata = this.import_automata.bind(this);
        this.get_symmetries_list = this.get_symmetries_list.bind(this);
    }

    componentDidMount = () => {
        // only initialize simulation once
        if (!this.ui_init) {
            this.ui_init = true;
            let sim = this.props.sim;
            // generate seed
            this.seed = sim.generate_seed(Sim.SEED_LEN);
            this.update_seed(this.seed);
            // orbit 3D simulation
            var orbit = document.getElementById('toggle_orbit') as HTMLInputElement;
            orbit.checked = true;
            // skip frames 3D simulation
            var skip = document.getElementById('toggle_skip') as HTMLInputElement;
            skip.checked = true;
            // blend 3D simulation
            var blend = document.getElementById('toggle_blend') as HTMLInputElement;
            blend.checked = true;
            // load in initial preset
            this.load_automata();
        }
    }

    /*****************************************************************
        LOAD FUNCTIONS
    *****************************************************************/

    load_automata_json(data: any, is_custom: boolean, _seed?: string) {
        let sim = this.props.sim;
        // seed
        if (_seed) {
            this.seed = _seed;
        }
        else {
            this.seed = data.seed;
        }
        this.update_seed(this.seed);
        if (sim.mode === SimMode.Sim2D) {
            if (data.sim !== SimMode.Sim2D) return;
            // shader
            this.load_shader(data.shader as Shader2D);
            // symmetries
            this.update_symmetries(data.symmetries, SimMode.Sim2D);
            this.update_kernel_symmetry();
            // kernel
            this.update_kernel(new Float32Array(data.kernel));
            this.set_sim_kernel();
            // activation
            this.update_activation(data.activation, true);
            this.update_sim_activation();
            // custom automata
            if (is_custom) {
                let menu = document.getElementById('load_automata_2d') as HTMLSelectElement;
                menu.value = 'custom';
            }
        }
        else if (sim.mode === SimMode.Sim3D) {
            if (data.sim !== SimMode.Sim3D) return;
            // blend
            let blend = document.getElementById('toggle_blend') as HTMLInputElement;
            blend.checked = data.blend;
            this.set_sim_blend(data.blend);
            // wrap
            let wrap = document.getElementById('toggle_wrap') as HTMLInputElement;
            wrap.checked = data.wrap;
            this.set_sim_wrap(data.wrap);
            // size
            let size = document.getElementById('volume_size') as HTMLInputElement;
            let size_txt = document.getElementById('volume_size_text') as HTMLInputElement;
            size.valueAsNumber = data.size;
            size_txt.innerHTML = data.size.toString();
            this.set_sim_volume_size();
            // compute
            let comp = document.getElementById('compute_delay') as HTMLInputElement;
            let comp_txt = document.getElementById('compute_text') as HTMLInputElement;
            comp.valueAsNumber = data.compute;
            comp_txt.innerHTML = data.compute.toString();
            this.set_sim_compute_delay();
            // skip frames
            let skip = document.getElementById('toggle_skip') as HTMLInputElement;
            skip.checked = data.skip;
            this.set_sim_skip_frames(data.skip);
            // colormap
            this.load_colormap(data.colormap as Colormap3D);
            // symmetries
            this.update_symmetries(data.symmetries, SimMode.Sim3D);
            this.update_kernel_symmetry();
            // kernel
            this.update_kernel(new Float32Array(data.kernel));
            this.set_sim_kernel();
            // activation
            this.update_activation(data.activation, true);
            this.update_sim_activation();
            // custom automata
            if (is_custom) {
                let menu = document.getElementById('load_automata_3d') as HTMLSelectElement;
                menu.value = 'custom';
            }
        }
    }

    async fetch_json_file(path: string) {
        const response = await fetch(path);
        const json = await response.json();
        return json;
    }

    load_automata() {
        let sim = this.props.sim;
        if (sim.mode === SimMode.Sim2D) {
            let menu = document.getElementById('load_automata_2d') as HTMLSelectElement;
            let res = this.fetch_json_file(`../automata/2D/${menu.value}_2D.json`);
            let seed = sim.generate_seed(Sim.SEED_LEN);
            res.then((data) => {this.load_automata_json(data, false, seed)});

            // special case for 'game_of_life' automata
            sim.set_game_of_life_mode(menu.value === 'game_of_life');
            
        }
        else if (sim.mode === SimMode.Sim3D) {
            let menu = document.getElementById('load_automata_3d') as HTMLSelectElement;
            let res = this.fetch_json_file(`../automata/3D/${menu.value}_3D.json`);
            let seed = sim.generate_seed(Sim.SEED_LEN);
            res.then((data) => {this.load_automata_json(data, false, seed)});
        }
    }

    load_colormap(_colormap: Colormap3D) {
        let menu = document.getElementById('load_colormap') as HTMLSelectElement;
        switch (_colormap) {
        default: return;
        case Colormap3D.cool_warm:
            menu.value = 'cool_warm';
            break;
        case Colormap3D.plasma:
            menu.value = 'plasma';
            break;
        case Colormap3D.virdis:
            menu.value = 'virdis';
            break;
        case Colormap3D.rainbow:
            menu.value = 'rainbow';
            break;
        case Colormap3D.green:
            menu.value = 'green';
            break;
        case Colormap3D.ygb:
            menu.value = 'ygb';
            break;
        }
        this.set_sim_colormap();
    }

    load_shader(_shader: Shader2D) {
        let menu = document.getElementById('load_shader') as HTMLSelectElement;
        switch (_shader) {
        default: return;
        case Shader2D.bnw:
            menu.value = 'bnw';
            break;
        case Shader2D.alpha:
            menu.value = 'alpha';
            break;
        case Shader2D.rgb:
            menu.value = 'rgb';
            break;
        case Shader2D.acid:
            menu.value = 'acid';
            break;
        }
        this.set_sim_shader();
    }

    /*****************************************************************
        UPDATE FUNCTIONS
    *****************************************************************/

    update_symmetries(_syms: any, _mode: SimMode) {
        if (_mode === SimMode.Sim2D) {
            var v_sym = document.getElementById('v_sym') as HTMLInputElement;
            var h_sym = document.getElementById('h_sym') as HTMLInputElement;
            var f_sym = document.getElementById('f_sym') as HTMLInputElement;
            var b_sym = document.getElementById('b_sym') as HTMLInputElement;
            var full_sym = document.getElementById('x_sym') as HTMLInputElement;
            v_sym.checked = _syms['v_sym'];
            h_sym.checked = _syms['h_sym'];
            f_sym.checked = _syms['f_sym'];
            b_sym.checked = _syms['b_sym'];
            full_sym.checked = _syms['full_sym'];
        }
        else if (_mode === SimMode.Sim3D) {
            var xp_sym = document.getElementById('x_plane_sym') as HTMLInputElement;
            var x1_sym = document.getElementById('x_diag_1_sym') as HTMLInputElement;
            var x2_sym = document.getElementById('x_diag_2_sym') as HTMLInputElement;
            var yp_sym = document.getElementById('y_plane_sym') as HTMLInputElement;
            var y1_sym = document.getElementById('y_diag_1_sym') as HTMLInputElement;
            var y2_sym = document.getElementById('y_diag_2_sym') as HTMLInputElement;
            var zp_sym = document.getElementById('z_plane_sym') as HTMLInputElement;
            var z1_sym = document.getElementById('z_diag_1_sym') as HTMLInputElement;
            var z2_sym = document.getElementById('z_diag_2_sym') as HTMLInputElement;
            var full_sym = document.getElementById('full_sym') as HTMLInputElement;
            xp_sym.checked = _syms['xp_sym'];
            x1_sym.checked = _syms['x1_sym'];
            x2_sym.checked = _syms['x2_sym'];
            yp_sym.checked = _syms['yp_sym'];
            y1_sym.checked = _syms['y1_sym'];
            y2_sym.checked = _syms['y2_sym'];
            zp_sym.checked = _syms['zp_sym'];
            z1_sym.checked = _syms['z1_sym'];
            z2_sym.checked = _syms['z2_sym'];
            full_sym.checked = _syms['full_sym'];
        }
    }

    update_seed(_seed: string) {
        let seed_field = document.getElementById('seed_field') as HTMLInputElement;
        let seed_field_3d = document.getElementById('seed_field_3d') as HTMLInputElement;
        seed_field.value = _seed;
        seed_field_3d.value = _seed;
    }

    update_zoom_text() {
        var zoom_slider = document.getElementById('zoom_slider') as HTMLInputElement;
        var zoom_text = document.getElementById('zoom_text') as HTMLElement;
        zoom_text.innerHTML = zoom_slider.value;
    }

    update_volume_text() {
        var volume_size = document.getElementById('volume_size') as HTMLInputElement;
        var volume_text = document.getElementById('volume_size_text') as HTMLElement;
        volume_text.innerHTML = volume_size.value;
    }

    update_compute_text() {
        var compute_delay = document.getElementById('compute_delay') as HTMLInputElement;
        var compute_text = document.getElementById('compute_text') as HTMLElement;
        compute_text.innerHTML = compute_delay.value;
    }

    update_sim_activation() {
        let af = document.getElementById('af') as HTMLTextAreaElement;
        this.update_activation(af.value, true);
        let sim = this.props.sim;
        sim.set_activation(af.value);
    }

    update_kernel(_kernel: Float32Array, _curr_idx: number=-1) {
        let sim = this.props.sim;
        if (sim.mode === SimMode.Sim2D) {
            // assert _kernel is correct length
            if (_kernel.length !== 9) return;
            for (let i = 0; i < _kernel.length; i++) {
                if (i !== _curr_idx) {
                    let k = document.getElementById('k'+i.toFixed(0).toString()) as HTMLInputElement;
                    k.value = _kernel[i].toFixed(3).toString();
                }
            }
        }
        else if (sim.mode === SimMode.Sim3D) {
            // assert _kernel is correct length
            if (_kernel.length !== 27) return;
            for (let i = 0; i < _kernel.length; i++) {
                if (i !== _curr_idx) {
                    let j = document.getElementById('j'+i.toFixed(0).toString()) as HTMLInputElement;
                    j.value = _kernel[i].toFixed(3).toString();
                }
            }
        }
    }

    update_activation(_activation: string, is_custom: boolean) {
        let af = document.getElementById('af') as HTMLTextAreaElement;
        af.value = _activation;
        if (is_custom) {
            let menu = document.getElementById('load_activation') as HTMLSelectElement;
            menu.value = 'custom';
        }
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

    /*****************************************************************
        TOGGLE FUNCTIONS
    *****************************************************************/

    toggle_sim_mode() {
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
        this.update_kernel(sim.get_kernel() as Float32Array);
        this.update_activation(sim.get_activation() as string, true);

        // initialize 3D default automata
        if (sim.mode === SimMode.Sim3D) {
            if (!this.init_3D) {
                this.init_3D = true;
                this.load_automata();
            }
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

    toggle_customize() {
        this.customize_open = !this.customize_open;
        var window = document.getElementById('customize_window') as HTMLDivElement;
        var button = document.getElementById('toggle_customize') as HTMLButtonElement;
        if (this.customize_open) {
            window.style.cssText='height:100%;';
            button.innerHTML = 'close customization';
        }
        else {
            window.style.cssText='scale:0%;height:0px;';
            button.innerHTML = 'customize automata!';
        }
    }

    toggle_sim_aa() {
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

    toggle_sim_skip_frames() {
        let sim = this.props.sim;
        sim.toggle_skip_frames();
    }

    toggle_sim_wrap() {
        let sim = this.props.sim;
        sim.toggle_wrap();
    }

    toggle_sim_blend() {
        let sim = this.props.sim;
        sim.toggle_blend();
    }

    toggle_sim_orbit() {
        let sim = this.props.sim;
        sim.toggle_orbit();
    }
    
    /*****************************************************************
        SIM FUNCTIONS
    *****************************************************************/

    reset_sim_automata() {
        let seed_field = document.getElementById('seed_field') as HTMLInputElement;
        let reset_cam = document.getElementById('toggle_reset_cam') as HTMLInputElement;
        let sim = this.props.sim;
        sim.reset(seed_field.value, reset_cam.checked);
    }

    pause_sim() {
        let sim = this.props.sim;
        sim.paused = !sim.paused
    }

    set_sim_blend(_blend: boolean) {
        let sim = this.props.sim;
        sim.set_blend(_blend);
    }

    set_sim_wrap(_wrap: boolean) {
        let sim = this.props.sim;
        sim.set_wrap(_wrap);
    }

    set_sim_skip_frames(_skip: boolean) {
        let sim = this.props.sim;
        sim.set_skip_frames(_skip);
    }

    set_sim_brush() {
        var brush_slider = document.getElementById('brush_slider') as HTMLInputElement;
        var brush_text = document.getElementById('brush_text') as HTMLElement;
        brush_text.innerHTML = brush_slider.value;
        let sim = this.props.sim;
        sim.set_brush(brush_slider.valueAsNumber);
    }

    set_sim_zoom() {
        var zoom_slider = document.getElementById('zoom_slider') as HTMLInputElement;
        let sim = this.props.sim;
        sim.set_zoom(zoom_slider.valueAsNumber);
    }

    set_sim_volume_size() {
        var volume_size = document.getElementById('volume_size') as HTMLInputElement;
        let sim = this.props.sim;
        sim.set_volume_size(volume_size.valueAsNumber);
    }

    set_sim_compute_delay() {
        var compute_delay = document.getElementById('compute_delay') as HTMLInputElement;
        let sim = this.props.sim;
        sim.set_compute_delay(compute_delay.valueAsNumber);
    }

    set_sim_colormap() {
        let menu = document.getElementById('load_colormap') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_colormap(value);
    }

    set_sim_shader() {
        let menu = document.getElementById('load_shader') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_shader(value);
    }

    set_sim_region() {
        var region_slider = document.getElementById('region_slider') as HTMLInputElement;
        var region_text = document.getElementById('region_text') as HTMLElement;
        region_text.innerHTML = region_slider.value;
        let sim = this.props.sim;
        sim.set_region(region_slider.valueAsNumber);
    }

    set_sim_density() {
        var density_slider = document.getElementById('density_slider') as HTMLInputElement;
        var density_text = document.getElementById('density_text') as HTMLElement;
        density_text.innerHTML = density_slider.value;
        let sim = this.props.sim;
        sim.set_density(density_slider.valueAsNumber);
    }

    set_sim_activation() {
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
        sim.set_activation(act);
        this.update_activation(act, false);
    }

    set_sim_kernel(_curr_idx?: number) {
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
            this.update_kernel(kernel, _curr_idx);
            sim.set_kernel(kernel);
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
            this.update_kernel(kernel, _curr_idx);
            sim.set_kernel(kernel);
        }
    }

    /*****************************************************************
        RANDOMIZE FUNCTIONS
    *****************************************************************/

    randomize_seed() {
        // set seed
        let sim = this.props.sim;
        let seed_field = document.getElementById('seed_field') as HTMLInputElement;
        let seed_field_3d = document.getElementById('seed_field_3d') as HTMLInputElement;
        this.seed = sim.generate_seed(Sim.SEED_LEN);
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
            this.update_kernel(kernel);
            sim.set_kernel(kernel);
            let menu = document.getElementById('load_automata_2d') as HTMLSelectElement;
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
            this.update_kernel(kernel);
            sim.set_kernel(kernel);
            let menu = document.getElementById('load_automata_3d') as HTMLSelectElement;
            menu.value = 'custom';
        }
    }

    /*****************************************************************
        OTHER FUNCTIONS
    *****************************************************************/

    get_symmetries_list() {
        let sim = this.props.sim;
        if (sim.mode === SimMode.Sim2D) {
            var v_sym = document.getElementById('v_sym') as HTMLInputElement;
            var h_sym = document.getElementById('h_sym') as HTMLInputElement;
            var f_sym = document.getElementById('f_sym') as HTMLInputElement;
            var b_sym = document.getElementById('b_sym') as HTMLInputElement;
            var full_sym = document.getElementById('x_sym') as HTMLInputElement;
            let list = {
                'v_sym': v_sym.checked,
                'h_sym': h_sym.checked,
                'f_sym': f_sym.checked,
                'b_sym': b_sym.checked,
                'full_sym': full_sym.checked
            };
            return list;
        }
        else if (sim.mode === SimMode.Sim3D) {
            var xp_sym = document.getElementById('x_plane_sym') as HTMLInputElement;
            var x1_sym = document.getElementById('x_diag_1_sym') as HTMLInputElement;
            var x2_sym = document.getElementById('x_diag_2_sym') as HTMLInputElement;
            var yp_sym = document.getElementById('y_plane_sym') as HTMLInputElement;
            var y1_sym = document.getElementById('y_diag_1_sym') as HTMLInputElement;
            var y2_sym = document.getElementById('y_diag_2_sym') as HTMLInputElement;
            var zp_sym = document.getElementById('z_plane_sym') as HTMLInputElement;
            var z1_sym = document.getElementById('z_diag_1_sym') as HTMLInputElement;
            var z2_sym = document.getElementById('z_diag_2_sym') as HTMLInputElement;
            var full_sym = document.getElementById('full_sym') as HTMLInputElement;
            let list = {
                'xp_sym': xp_sym.checked,
                'x1_sym': x1_sym.checked,
                'x2_sym': x2_sym.checked,
                'yp_sym': yp_sym.checked,
                'y1_sym': y1_sym.checked,
                'y2_sym': y2_sym.checked,
                'zp_sym': zp_sym.checked,
                'z1_sym': z1_sym.checked,
                'z2_sym': z2_sym.checked,
                'full_sym': full_sym.checked
            };
            return list;
        }
    }

    download(content: string, fileName: string, contentType: string) {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    export_automata() {
        let sim = this.props.sim;
        let name_input = document.getElementById('name') as HTMLInputElement;
        if (name_input.value.toString().length <= 0) {
            window.alert('Please name your automata before exporting.');
            return;
        }
        // different json exports for both modes
        if (sim.mode === SimMode.Sim2D) {
            let data = {
                'sim': sim.mode,
                'seed': this.seed,
                'shader': sim.sim2D?.shader,
                'kernel': Array.from(sim.sim2D?.kernel as Float32Array),
                'symmetries': this.get_symmetries_list(),
                'activation': sim.sim2D?.activation,
            };
            this.download(JSON.stringify(data), `${name_input.value.toString()}.json`, 'text/plain');
        }
        else if (sim.mode === SimMode.Sim3D) {
            let wrap = document.getElementById('toggle_wrap') as HTMLInputElement;
            let size = document.getElementById('volume_size') as HTMLInputElement;
            let comp = document.getElementById('compute_delay') as HTMLInputElement;
            let blend = document.getElementById('toggle_blend') as HTMLInputElement;
            let skip = document.getElementById('toggle_skip') as HTMLInputElement;
            let data = {
                'sim': sim.mode,
                'seed': this.seed,
                'colormap': sim.sim3D?.colormap,
                'kernel': Array.from(sim.sim3D?.kernel as Float32Array),
                'symmetries': this.get_symmetries_list(),
                'activation': sim.sim3D?.activation,
                'wrap': wrap.checked,
                'blend': blend.checked,
                'skip': skip.checked,
                'size': size.valueAsNumber,
                'compute': comp.valueAsNumber,
            }
            this.download(JSON.stringify(data), `${name_input.value.toString()}.json`, 'text/plain');
        }
    }

    import_automata() {
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => { 
            let target = e.currentTarget as HTMLInputElement;
            let files = target.files;
            let file = files?.item(0) as File;
            var reader = new FileReader();
            reader.readAsText(file, 'UTF-8');
            reader.onload = readerEvent => {
                var content = readerEvent.target?.result;
                let data = JSON.parse(content as string);
                this.load_automata_json(data, true);
            }
        }
        input.click();
    }

    render() {
        return(
            <>
                <div id='ctrl_window' className='ui_window'>
                    <div id='ctrl_window_inside'>
                        {/* extra padding at the top of the window */}
                        <div style={{height:'0em'}}/>

                        <div id='ctrl_module'>
                            <h4 className='ctrl_module_sub_title'>simulation mode</h4>
                            <div className='ui_row'>
                                <h1 className='ctrl_module_title' style={{paddingRight:'0.5em'}}>2D</h1>
                                <label className='toggle_switch'>
                                    <input id='sim_mode' onClick={this.toggle_sim_mode} type='checkbox'/>
                                    <span className='toggle_slider'></span>
                                </label>
                                <h1 className='ctrl_module_title' style={{paddingLeft:'0.5em'}}>3D</h1>
                            </div>

                            <div className='ui_row'>
                                <input type='checkbox' id='toggle_pause' className='ui_button' onClick={this.pause_sim}/>
                                <h4 className='ctrl_module_sub_title'>paused</h4>
                            </div>

                            <div className='ui_row'>
                                <input type='checkbox' id='toggle_aa' className='ui_button' onClick={this.toggle_sim_aa}/>
                                <h4 className='ctrl_module_sub_title'>anti-aliasing</h4>
                            </div>
                        </div>

                        <div id='ctrl_module'>
                            <button id='toggle_customize' className='ui_button' onClick={this.toggle_customize} style={{padding:'0.5em', width:'100%'}}>customize automata!</button>
                        </div>
                        
                        <div id='customize_window' style={{scale:'0%', height:'0px'}}>
                            <div id='_3D' style={{scale:'0%', height:'0px'}}>
                                <hr/>
                                <div id='ctrl_module'>
                                    <h2 className='ctrl_module_title'>automata</h2>
                                    <div style={{paddingBottom:'0.5em'}}>
                                        <h4 className='ctrl_module_sub_title'>load preset</h4>
                                        <select className='dropdown_input' name='automata' id='load_automata_3d' defaultValue={'boil'} onChange={this.load_automata}>
                                            <option value='boil'>boil 🍲</option>
                                            <option value='erosion'>erosion 🏔️</option>
                                            <option value='fluids'>fluids 🥣</option>
                                            <option value='molten'>molten 🌋</option>
                                            <option value='neural'>neural 🧠</option>
                                            <option value='ocean'>ocean 🐟</option>
                                            <option value='power'>power 🔥</option>
                                            <option value='pulsar'>pulsar 🌌</option>
                                            <option value='custom' disabled>custom 🛠️</option>
                                        </select>
                                    </div>
                                    <div style={{paddingBottom:'0.5em'}}>
                                        <h4 className='ctrl_module_sub_title'>seed</h4>
                                        <div className='ui_row'>
                                            <input id='seed_field_3d' className='ui_text_field' maxLength={Sim.SEED_LEN}></input>
                                            <div style={{paddingRight:'0.5em'}}/>
                                            <button id='randomize_seed' className='ui_button' style={{width:'35%'}} onClick={this.randomize_seed}>new seed</button>
                                        </div>
                                    </div>
                                    <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                        <input type='checkbox' id='toggle_reset_cam' className='ui_button'/>
                                        <h4 className='ctrl_module_sub_title'>reset camera</h4>
                                    </div>
                                    {/* <h4 className='ctrl_module_sub_title'>fill region</h4>
                                    <div className='ui_row'>
                                        <div className='slider_container'>
                                            <input type='range' min='0' max='1.0' defaultValue='1.0' step='0.01' className='slider' id='region_slider' onChange={this.set_sim_region}/>
                                        </div>
                                        <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='region_text'>1.0</h4>
                                    </div>
                                    <h4 className='ctrl_module_sub_title'>fill density</h4>
                                    <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                        <div className='slider_container'>
                                            <input type='range' min='0' max='1.0' defaultValue='1.0' step='0.01' className='slider' id='density_slider' onChange={this.set_sim_density}/>
                                        </div>
                                        <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='density_text'>1.0</h4>
                                    </div> */}
                                    <button id='reset_button' className='ui_button' onClick={this.reset_sim_automata} style={{padding:'0.5em', width:'100%'}}>reset automata</button>
                                </div>

                                <hr/>
                                <div id='ctrl_module'>
                                    <h2 className='ctrl_module_title'>options</h2>
                                    <div className='ui_row'>
                                        <input type='checkbox' id='toggle_wrap' className='ui_button' onClick={this.toggle_sim_wrap}/>
                                        <h4 className='ctrl_module_sub_title'>wrap</h4>
                                    </div>
                                    <div className='ui_row'>
                                        <input type='checkbox' id='toggle_skip' className='ui_button' onClick={this.toggle_sim_skip_frames}/>
                                        <h4 className='ctrl_module_sub_title'>skip frames</h4>
                                    </div>
                                    <div className='ui_row'>
                                        <input type='checkbox' id='toggle_orbit' className='ui_button' onClick={this.toggle_sim_orbit}/>
                                        <h4 className='ctrl_module_sub_title'>orbit</h4>
                                    </div>
                                    <h4 className='ctrl_module_sub_title'>volume size</h4>
                                    <div className='ui_row'>
                                        <div className='slider_container'>
                                            <input type='range' min='1' max='256' defaultValue='64' className='slider' id='volume_size' onChange={this.update_volume_text} onMouseUp={this.set_sim_volume_size}/>
                                        </div>
                                        <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='volume_size_text'>64</h4>
                                    </div>
                                    <h4 className='ctrl_module_sub_title'>compute delay</h4>
                                    <div className='ui_row'>
                                        <div className='slider_container'>
                                            <input type='range' min='1' max='64' defaultValue='1' className='slider' id='compute_delay' onChange={this.update_compute_text} onMouseUp={this.set_sim_compute_delay}/>
                                        </div>
                                        <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='compute_text'>1</h4>
                                    </div>
                                </div>

                                <hr/>
                                <div id='ctrl_module'>
                                    <h2 className='ctrl_module_title'>render</h2>
                                    <div className='ui_row'>
                                        <input type='checkbox' id='toggle_blend' className='ui_button' onClick={this.toggle_sim_blend}/>
                                        <h4 className='ctrl_module_sub_title'>blend</h4>
                                    </div>

                                    <div style={{paddingBottom:'0.5em'}}>
                                        <h4 className='ctrl_module_sub_title'>colormap</h4>
                                        <select className='dropdown_input' name='colormap' id='load_colormap' onChange={this.set_sim_colormap}>
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
                                            <input id='j0' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(0)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j1' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(1)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j2' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(2)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='j3' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(3)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j4' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(4)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j5' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(5)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='j6' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(6)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j7' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(7)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j8' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(8)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                    </div>
                                    
                                    <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 2</h4>
                                    <div className='ui_column' style={{justifyContent:'center'}}>
                                        <div className='ui_row'>
                                            <input id='j9' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(9)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j10' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(10)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j11' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(11)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='j12' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(12)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j13' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(13)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j14' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(14)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='j15' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(15)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j16' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(16)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j17' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(17)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                    </div>
                                    
                                    <h4 className='ctrl_module_sub_title' style={{textAlign:'center'}}>layer 3</h4>
                                    <div className='ui_column' style={{justifyContent:'center'}}>
                                        <div className='ui_row'>
                                            <input id='j18' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(18)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j19' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(19)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j20' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(20)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='j21' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(21)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j22' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(22)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j23' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(23)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='j24' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(24)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j25' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(25)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='j26' type='number'step='0.001' className='kernel_input_small' onChange={() => this.set_sim_kernel(26)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
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
                            </div>


                            <div id='_2D' style={{scale:'100%', height:'100%'}}>
                                <hr/>
                                <div id='ctrl_module'>
                                    <h2 className='ctrl_module_title'>automata</h2>
                                    <div style={{paddingBottom:'0.5em'}}>
                                        <h4 className='ctrl_module_sub_title'>load preset</h4>
                                        <select className='dropdown_input' defaultValue={'worms'} id='load_automata_2d' onChange={this.load_automata}>
                                            <option value='cells'>cells 🦠</option>
                                            <option value='circuit'>circuit 💻</option>
                                            <option value='comets'>comets ☄️</option>
                                            <option value='game_of_life'>game of life ♟️</option>
                                            <option value='lands'>lands 🌍</option>
                                            <option value='mold'>mold 🧫</option>
                                            <option value='mystic'>mystic ✨</option>
                                            <option value='paths'>paths 🚪</option>
                                            <option value='stars'>stars ⭐</option>
                                            <option value='smoke'>smoke ☁️</option>
                                            <option value='surf'>surf 🏄</option>
                                            <option value='waves'>waves 🌊</option>
                                            <option value='worms'>worms 🐍</option>
                                            <option value='custom' disabled>custom 🛠️</option>
                                        </select>
                                    </div>

                                    <div style={{paddingBottom:'1em'}}>
                                        <h4 className='ctrl_module_sub_title'>seed</h4>
                                        <div className='ui_row'>
                                            <input id='seed_field' className='ui_text_field' maxLength={Sim.SEED_LEN}></input>
                                            <div style={{paddingRight:'0.5em'}}/>
                                            <button id='randomize_seed' className='ui_button' style={{width:'35%'}} onClick={this.randomize_seed}>new seed</button>
                                        </div>
                                    </div>
                                    <button id='reset_button' className='ui_button' onClick={this.reset_sim_automata} style={{padding:'0.5em', width:'100%'}}>reset automata</button>
                                </div>

                                <hr/>
                                <div id='ctrl_module'>
                                    <h2 className='ctrl_module_title'>options</h2>
                                    <h4 className='ctrl_module_sub_title'>brush size</h4>
                                    <div className='ui_row'>
                                        <div className='slider_container'>
                                            <input type='range' min='1' max='256' defaultValue='64' className='slider' id='brush_slider' onChange={this.set_sim_brush}/>
                                        </div>
                                        <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='brush_text'>64</h4>
                                    </div>

                                    <h4 className='ctrl_module_sub_title'>zoom level</h4>
                                    <div className='ui_row' style={{paddingBottom:'0.5em'}}>
                                        <div className='slider_container'>
                                            <input type='range' min='0.6' max='16.0' defaultValue='2.0' step='0.2' className='slider' id='zoom_slider' onChange={this.update_zoom_text} onMouseUp={this.set_sim_zoom}/>
                                        </div>
                                        <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center', color:'rgba(0, 0, 0, 0.5)'}} id='zoom_text'>2.0</h4>
                                    </div>
                                </div>

                                <hr/>
                                <div id='ctrl_module'>
                                    <h2 className='ctrl_module_title'>shader</h2>
                                    <div>
                                        <select className='dropdown_input' name='shader' id='load_shader' onChange={this.set_sim_shader}>
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
                                            <input id='k0' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(0)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='k1' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(1)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='k2' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(2)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='k3' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(3)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='k4' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(4)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='k5' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(5)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                        </div>
                                        <div className='ui_row'>
                                            <input id='k6' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(6)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='k7' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(7)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
                                            <input id='k8' type='number'step='0.001' className='kernel_input' onChange={() => this.set_sim_kernel(8)} style={{fontFamily:'Monaco, monospace', fontSize:'1em'}}/>
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
                            </div>

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>activation function</h2>
                                <div>
                                    <textarea id='af' className='activation_input' onChange={this.update_sim_activation}/>
                                </div>
                                <h4 className='ctrl_module_sub_title'>load activation function</h4>
                                <div>
                                    <select className='dropdown_input' name='automata' id='load_activation' onChange={this.set_sim_activation}>
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

                            <hr/>
                            <div id='ctrl_module'>
                                <h2 className='ctrl_module_title'>save & load automata</h2>
                                <h4 className='ctrl_module_sub_title'>automata name</h4>
                                <div className='ui_row'>
                                    <input id='name' className='ui_text_field' defaultValue={'my_automata'}/>
                                </div>
                                <div style={{height:'0.5em'}}/>
                                <div className='ui_row'>
                                    <button className='ui_button' onClick={this.export_automata} style={{padding:'0.5em', width:'100%'}}>export</button>
                                    <div style={{width:'0.5em'}}/>
                                    <button className='ui_button' onClick={this.import_automata} style={{padding:'0.5em', width:'100%'}}>import</button>
                                </div>
                            </div>

                            <hr/>
                            <div id='ctrl_module'>
                                <div className='ui_info'>
                                    <h4 className='ctrl_module_sub_title' style={{fontSize:'1em'}}>res: <span id='res'/></h4>
                                    <h4 className='ctrl_module_sub_title' style={{fontSize:'1em'}}>fps: <span id='fps'/></h4>
                                </div>
                            </div>
                        </div>
                                      
                        {/* extra padding at the bottom of the window */}
                        <div style={{height:'4em'}}/>
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