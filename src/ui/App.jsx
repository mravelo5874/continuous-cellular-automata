import React from "react";

export { App };

class Canvas extends React.Component {
    /**
     * @param {sim} props.sim
     */
    constructor(props) {
        super(props);
        this.canvas_ref = React.createRef();
        this.sim_init = false;
    }

    componentDidMount = () => {
        // only initialize simulation once
        if (!this.sim_init) {
            this.sim_init = true;
            let canvas = this.canvas_ref.current;
            let sim = this.props.sim;
            sim.init(canvas);
            sim.start();
        }
    }

    render = () => {
        return (
            <canvas ref={this.canvas_ref}></canvas>
        );
    }
}

function App({ sim }) {
    return (
        <>
            <h1>continuous cellular automata</h1>
            <Canvas sim={sim}></Canvas>
        </>
    );
}