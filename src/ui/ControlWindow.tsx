import * as React from 'react';

export { ControlWindow };

interface ControlPanelInterface {

}

class ControlWindow extends React.Component<ControlPanelInterface, {}> {

    constructor(props: ControlPanelInterface) {
        super(props);
    }

    render() {
        return(
            <div id='control_window' className='ui_window'>
                <div className='ui_info'>
                    <h4>fps: <span id='fps' className='alt_color_1'/></h4>
                    <h4>canvas: <span id='res' className='alt_color_2'/></h4>
                </div>

                <br/>
                
                {/* TODO: fix ui for these things: */}
                <h2>kernel</h2>
                <div className="ui_row">
                    <div className="ui_column">
                        <input type="number"/>
                        <input type="number"/>
                        <input type="number"/>
                    </div>
                    <div className="ui_column">
                        <input type="number"/>
                        <input type="number"/>
                        <input type="number"/>
                    </div>
                    <div className="ui_column">
                        <input type="number"/>
                        <input type="number"/>
                        <input type="number"/>
                    </div>
                </div>

                <br/>

                <h2>activation function</h2>
                <div>
                    <textarea></textarea>
                </div>
                

                <br/>

                <h2>load automata</h2>
                <div>
                    <select name="automata" id="automata">
                        <option value="worms">worms</option>
                        <option value="waves">waves</option>
                        <option value="drops">drops</option>
                    </select>
                </div>

                <br/>

                <h2>shader</h2>
                <div>
                    <select name="shader" id="shader">
                        <option value="bnw">black and white</option>
                        <option value="alpha">alpha channel</option>
                        <option value="rgb">red green blue channels</option>
                        <option value="acid">acid</option>
                    </select>
                </div>
            </div>
        );
    }
}