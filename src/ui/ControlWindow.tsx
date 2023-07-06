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
        this.load_automata = this.load_automata.bind(this);
        this.load_shader = this.load_shader.bind(this);
        this.load_activation = this.load_activation.bind(this);
        this.toggle_window = this.toggle_window.bind(this);
        this.toggle_aa = this.toggle_aa.bind(this);
        this.randomize_kernel = this.randomize_kernel.bind(this);
        this.randomize_seed = this.randomize_seed.bind(this);
        this.reset_automata = this.reset_automata.bind(this);
        this.pause_sim = this.pause_sim.bind(this);
        this.toggle_sim = this.toggle_sim.bind(this);
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
            this.seed = sim.generate_seed(ControlWindow.SEED_LEN);
            seed_field.value = this.seed.toString();
            
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
            _2D_modules.style.cssText='scale:0%;';
            _3D_modules.style.cssText='scale:100%;';
            break;
        case SimMode.Sim3D:
            sim.set_mode(SimMode.Sim2D);
            _2D_modules.style.cssText='scale:100%;';
            _3D_modules.style.cssText='scale:0%;';
            break;
        }
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
        // update text with correct value
        var zoom_slider = document.getElementById('zoom_slider') as HTMLInputElement;
        var zoom_text = document.getElementById('zoom_text') as HTMLElement;
        zoom_text.innerHTML = zoom_slider.value;
    }

    update_sim_kernel() {
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

        let sim = this.props.sim;
        sim.update_kernel(kernel);
    }

    randomize_seed() {
        // set seed
        let sim = this.props.sim;
        let seed_field = document.getElementById('seed_field') as HTMLInputElement;
        this.seed = sim.generate_seed(ControlWindow.SEED_LEN);
        seed_field.value = this.seed.toString();
    }

    randomize_kernel() {
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
        let sim = this.props.sim;

        this.set_kernel(kernel);
        sim.update_kernel(kernel);
        sim.custom_kernel();

        let menu = document.getElementById('load_automata') as HTMLSelectElement;
        menu.value = 'custom';
    }

    update_sim_activation() {
        let af = document.getElementById('af') as HTMLTextAreaElement;
        this.set_activation(af.value, true);

        // TODO - parse af string to make sure it is a valid function

        let sim = this.props.sim;
        sim.update_activation(af.value);
    }

    update_kernel_symmetry() {
        let v_sym = document.getElementById('v_sym') as HTMLInputElement;
        let h_sym = document.getElementById('h_sym') as HTMLInputElement;

        let k0 = document.getElementById('k0') as HTMLInputElement;
        let k1 = document.getElementById('k1') as HTMLInputElement;
        let k2 = document.getElementById('k2') as HTMLInputElement;

        let k3 = document.getElementById('k3') as HTMLInputElement;
        let k4 = document.getElementById('k4') as HTMLInputElement;
        let k5 = document.getElementById('k5') as HTMLInputElement;

        let k6 = document.getElementById('k6') as HTMLInputElement;
        let k7 = document.getElementById('k7') as HTMLInputElement;
        let k8 = document.getElementById('k8') as HTMLInputElement;

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

    set_kernel(_kernel: Float32Array) {
        let k0 = document.getElementById('k0') as HTMLInputElement;
        let k1 = document.getElementById('k1') as HTMLInputElement;
        let k2 = document.getElementById('k2') as HTMLInputElement;
        k0.value = _kernel[0].toFixed(3).toString();
        k1.value = _kernel[1].toFixed(3).toString();
        k2.value = _kernel[2].toFixed(3).toString();

        let k3 = document.getElementById('k3') as HTMLInputElement;
        let k4 = document.getElementById('k4') as HTMLInputElement;
        let k5 = document.getElementById('k5') as HTMLInputElement;
        k3.value = _kernel[3].toFixed(3).toString();
        k4.value = _kernel[4].toFixed(3).toString();
        k5.value = _kernel[5].toFixed(3).toString();

        let k6 = document.getElementById('k6') as HTMLInputElement;
        let k7 = document.getElementById('k7') as HTMLInputElement;
        let k8 = document.getElementById('k8') as HTMLInputElement;
        k6.value = _kernel[6].toFixed(3).toString();
        k7.value = _kernel[7].toFixed(3).toString();
        k8.value = _kernel[8].toFixed(3).toString();
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

    load_shader() {
        let menu = document.getElementById('load_shader') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_shader(value);
    }

    reset_automata() {
        let seed_field = document.getElementById('seed_field') as HTMLInputElement;
        let sim = this.props.sim;
        sim.reset(seed_field.value);
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

                        <div id='_2D'>
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

                        <div id='_3D'>

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