import * as React from 'react';
import { Sim } from '../sim/Sim';

export { Canvas };

interface CanvasInterface {
    sim: Sim
}

class Canvas extends React.Component<CanvasInterface, {}> {
    
    canvas_ref: React.RefObject<HTMLCanvasElement>;
    sim_init: boolean;
    
    constructor(props: CanvasInterface) {
        super(props);
        this.canvas_ref = React.createRef();
        this.sim_init = false;
    }

    componentDidMount = () => {
        // only initialize simulation once
        if (!this.sim_init) {
            this.sim_init = true;
            let canvas = this.canvas_ref.current as HTMLCanvasElement;
            let sim = this.props.sim;
            sim.init(canvas);
            sim.start();
        }
    }

    render() {
        return(
            <canvas ref={this.canvas_ref}></canvas>
        );
    }
}