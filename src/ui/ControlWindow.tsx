import * as React from 'react';
import { Sim } from '../sim/Sim';

export { ControlWindow };

interface ControlPanelInterface {
    sim: Sim
}

class ControlWindow extends React.Component<ControlPanelInterface, {}> {

    ui_init: boolean;

    constructor(props: ControlPanelInterface) {
        super(props);
        this.ui_init = false;
        // bind 'this' for class functions
        this.update_sim_kernel = this.update_sim_kernel.bind(this);
        this.update_sim_activation = this.update_sim_activation.bind(this);
        this.update_sim_brush = this.update_sim_brush.bind(this);
        this.update_sim_zoom = this.update_sim_zoom.bind(this);
        this.load_automata = this.load_automata.bind(this);
        this.load_shader = this.load_shader.bind(this);
    }

    componentDidMount = () => {
        // only initialize simulation once
        if (!this.ui_init) {
            this.ui_init = true;
            let sim = this.props.sim;

            this.set_kernel(sim.get_kernel() as Float32Array);
            this.set_activation(sim.get_activation() as string);
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
        // update text with correct value
        var zoom_slider = document.getElementById('zoom_slider') as HTMLInputElement;
        var zoom_text = document.getElementById('zoom_text') as HTMLElement;
        zoom_text.innerHTML = zoom_slider.value;

        let sim = this.props.sim;
        sim.update_zoom(zoom_slider.valueAsNumber);
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

    update_sim_activation() {
        let af = document.getElementById('af') as HTMLTextAreaElement;

        // TODO - parse af string to make sure it is a valid function

        let sim = this.props.sim;
        sim.update_activation(af.value);
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

    set_activation(_activation: string) {
        let af = document.getElementById('af') as HTMLTextAreaElement;
        af.value = _activation;
    }

    load_automata() {
        let menu = document.getElementById('load_automata') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_automata(value);

        // update ui
        this.set_kernel(sim.get_kernel() as Float32Array);
        this.set_activation(sim.get_activation() as string);
    }

    load_shader() {
        let menu = document.getElementById('load_shader') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_shader(value);
    }

    render() {
        return(
            <div id='control_window' className='ui_window'>
                <h2>load automata</h2>
                <div>
                    <select className='dropdown_input' name='automata' id='load_automata' onChange={this.load_automata}>
                        <option value='worms'>worms 🐍</option>
                        <option value='drops'>drops 💧</option>
                        <option value='waves'>waves 🌊</option>
                        <option value='paths'>paths 🚪</option>
                        <option value='stars'>stars ⭐</option>
                        <option value='cells'>cells 🦠</option>
                        <option value='slime'>slime 🧫</option>
                        <option value='lands'>lands 🗺️</option>
                        <option value='cgol'>game of life ♟️</option>
                    </select>
                </div>

                <br/>

                <h2>shader</h2>
                <div>
                    <select className='dropdown_input' name='shader' id='load_shader' onChange={this.load_shader}>
                        <option value='bnw'>black and white</option>
                        <option value='alpha'>alpha channel</option>
                        <option value='rgb'>red green blue channels</option>
                        <option value='acid'>acid</option>
                    </select>
                </div>

                <br/>
                
                <h2>kernel</h2>
                <div className='ui_row'>
                    <div className='ui_column'>
                        <input id='k0' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                        <input id='k1' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                        <input id='k2' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                    </div>
                    <div className='ui_column'>
                        <input id='k3' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                        <input id='k4' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                        <input id='k5' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                    </div>
                    <div className='ui_column'>
                        <input id='k6' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                        <input id='k7' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                        <input id='k8' type='number'step='0.001' className='kernel_input' onChange={this.update_sim_kernel}/>
                    </div>
                </div>

                <br/>

                <h2>activation function</h2>
                <div>
                    <textarea id='af' className='activation_input' onChange={this.update_sim_activation}/>
                </div>

                <br/>

                <h2>brush size</h2>
                <div className='ui_row'>
                    <div className='slider_container'>
                        <input type='range' min='1' max='256' defaultValue='100' className='slider' id='brush_slider' onInput={this.update_sim_brush}/>
                    </div>
                    <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center'}} id='brush_text'>100</h4>
                </div>
                
                <br/>

                <h2>zoom level</h2>
                <div className='ui_row'>
                    <div className='slider_container'>
                        <input type='range' min='1' max='8' defaultValue='1' className='slider' id='zoom_slider' onInput={this.update_sim_zoom}/>
                    </div>
                    <h4 style={{width:'24px', paddingLeft:'12px', textAlign:'center'}} id='zoom_text'>1</h4>
                </div>

                <br/>

                <div className='ui_info'>
                    <h4>fps: <span id='fps' className='alt_color_1'/></h4>
                    <h4>canvas: <span id='res' className='alt_color_2'/></h4>
                </div>
            </div>
        );
    }
}