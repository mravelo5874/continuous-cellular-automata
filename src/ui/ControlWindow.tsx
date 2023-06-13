import * as React from 'react';
import { Sim } from '../sim/Sim';

export { ControlWindow };

interface ControlPanelInterface {
    sim: Sim
}

class ControlWindow extends React.Component<ControlPanelInterface, {}> {

    constructor(props: ControlPanelInterface) {
        super(props);

        // bind 'this' for class functions
        this.update_kernel = this.update_kernel.bind(this);
        this.load_automata = this.load_automata.bind(this);
        this.load_shader = this.load_shader.bind(this);
    }

    update_kernel() {
        // TODO: re-work how kernel / activation function is inputed and displayed 
        const kernel = this.props.sim.get_kernel() as Float32Array;

        let k0 = document.getElementById('k0') as HTMLInputElement;
        let k1 = document.getElementById('k1') as HTMLInputElement;
        let k2 = document.getElementById('k2') as HTMLInputElement;
        k0.value = kernel[0].toFixed(3).toString();
        k1.value = kernel[1].toFixed(3).toString();
        k2.value = kernel[2].toFixed(3).toString();

        let k3 = document.getElementById('k3') as HTMLInputElement;
        let k4 = document.getElementById('k4') as HTMLInputElement;
        let k5 = document.getElementById('k5') as HTMLInputElement;
        k3.value = kernel[3].toFixed(3).toString();
        k4.value = kernel[4].toFixed(3).toString();
        k5.value = kernel[5].toFixed(3).toString();

        let k6 = document.getElementById('k6') as HTMLInputElement;
        let k7 = document.getElementById('k7') as HTMLInputElement;
        let k8 = document.getElementById('k8') as HTMLInputElement;
        k6.value = kernel[6].toFixed(3).toString();
        k7.value = kernel[7].toFixed(3).toString();
        k8.value = kernel[8].toFixed(3).toString();
    }

    load_activation() {
        // TODO: re-work how kernel / activation function is inputed and displayed 
        const activation = this.props.sim.get_activation() as string;

        let af = document.getElementById('af') as HTMLTextAreaElement;
        af.value = activation;
    }

    load_automata() {
        let menu = document.getElementById('load_automata') as HTMLSelectElement;
        const value = menu.value;
        let sim = this.props.sim;
        sim.load_automata(value);

        this.update_kernel();
        this.load_activation();
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
                        <option value='worms'>worms</option>
                        <option value='drops'>drops</option>
                        <option value='waves'>waves</option>
                        <option value='paths'>paths</option>
                        <option value='stars'>stars</option>
                        <option value='cells'>cells</option>
                        <option value='slime'>slime</option>
                        <option value='lands'>lands</option>
                        <option value='cgol'>game of life</option>
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
                
                {/* TODO: fix ui for these things: */}
                <h2>kernel</h2>
                <div className='ui_row'>
                    <div className='ui_column'>
                        <input id='k0' type='number'step='0.001' className='kernel_input'/>
                        <input id='k1' type='number'step='0.001' className='kernel_input'/>
                        <input id='k2' type='number'step='0.001' className='kernel_input'/>
                    </div>
                    <div className='ui_column'>
                        <input id='k3' type='number'step='0.001' className='kernel_input'/>
                        <input id='k4' type='number'step='0.001' className='kernel_input'/>
                        <input id='k5' type='number'step='0.001' className='kernel_input'/>
                    </div>
                    <div className='ui_column'>
                        <input id='k6' type='number'step='0.001' className='kernel_input'/>
                        <input id='k7' type='number'step='0.001' className='kernel_input'/>
                        <input id='k8' type='number'step='0.001' className='kernel_input'/>
                    </div>
                </div>

                <br/>

                <h2>activation function</h2>
                <div>
                    <textarea id='af' className='activation_input'></textarea>
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