import React from "react";

import { Canvas } from "./Canvas";
import { ControlWindow } from "./ControlWindow";
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
                <ControlWindow sim={this.props.sim}/>
                <Canvas sim={this.props.sim}/>
            </>
        );
    }
}