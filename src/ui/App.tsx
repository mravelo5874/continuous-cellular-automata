import React from "react";

import { Canvas } from "./Canvas";
import { Sim } from "../sim/Sim";
export { App };

interface AppInterface {
    sim: Sim
}

class App extends React.Component<AppInterface, {}> {
    constructor (props: AppInterface){
    super(props);
    }
    render() {
        return (
            <>
                <h1>continuous cellular automata</h1>
                <Canvas sim={this.props.sim}></Canvas>
            </>
        );
    }
}