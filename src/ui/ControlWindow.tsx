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
                <div className='ui_row'>
                    <h3>fps:</h3>
                    <h3>res:</h3>
                </div>
                <h2>kernel</h2>
                <h2>activation function</h2>
                <h2>load automata</h2>

            </div>
        );
    }
}