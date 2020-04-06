import * as React from "react";
var extend=require("extend");
import {
    comms
} from "./Socket_Client";
// import Layout from './Layout';
import Navbar from "./Navbar";
import SysInfo from "./SysInfo";
import { Container } from "reactstrap";

import BodyState from "./BodyState";
import Pump from "./Pumps";
import Circuits from "./Circuits";
import Features from "./Features";
import Schedule from "./Schedules";
import Chlorinator from "./Chlorinator";


export interface IPoolSystem {
    loadingMessage: string;
    _config: IConfig;
    _state: IState;
    counter: number;
    poolURL: string;
    sock: SocketIO.Socket;
}

export interface IState {
    temps: IStateTemp;
    pumps: IStatePump[];
    mode: IDetail;
    equipment: any;
    valves: any[];
    heaters: any[];
    // circuits: IStateCircuit[];
    virtualCircuits: IStateCircuit[];
    // features: IStateCircuit[];
    chlorinators: IStateChlorinator[];
    schedules: IStateSchedule[];
    circuitGroups: IStateCircuit[];
    status: IDetail&{ percent: number; };
    time: Date;
    valve: number;
    body: number;
    freeze: boolean;

}
export enum ControllerType { "intellicenter", "intellitouch", "intellicom", "none" }
export interface IConfig {
    lastUpdated: string;
    controllerType: ControllerType;
    pool: IConfigPoolOptions;
    bodies: IConfigBody[];
    schedules: IConfigSchedule[];
    eggTimers?: IConfigEggTimer[];
    customNames?: IConfigCustomName[];
    equipment: IConfigEquipment;
    valves: IConfigValve[];
    circuits: IConfigCircuit[];
    circuitGroups: IConfigCircuitGroup[];
    features: IConfigFeature[];
    pumps: IConfigPump[];
    chlorinators: IConfigChlorinator[];
    remotes: IConfigRemote[];
    intellibrite?: IConfigIntellibrite[];
    heaters: any[];
    appVersion: string;
}
export interface EquipmentIdRange {
    circuits?: EqRange,
    features?: EqRange,
    circuitGroups?: EqRange,
    virtualCircuits?: EqRange;
}
export interface EqRange {
    start: number,
    end: number;
}
export interface IConfigCircuitGroup {
    id: number;
    type: number;
    name: string;
    eggTimer: number;
    isActive: boolean;
    lightingTheme?: number;
    circuits: IConfigCircuitGroupCircuit[];
}
export interface IConfigCircuitGroupCircuit {
    id: number;
    circuit: number;
    desiredStateOn: boolean;
}
export interface IStateCircuitGroupCircuit {
    id: number;
    circuit: IStateCircuit[];
    desiredStateOn: boolean;
}
export interface IStatePumpCircuit {
    id: number,
    circuit: IStateCircuit,
    speed?: number,
    flow?: number,
    units: IDetail;
}
export enum equipmentType { 'circuit', 'feature', 'circuitGroup', 'virtualCircuit' }
export interface IStateCircuit {
    id: number;
    isOn: boolean;
    name: string;
    nameId?: number;
    type?: IDetail;
    lightingTheme?: IDetail;
    equipmentType: equipmentType;
    showInFeatures: boolean;
}
export interface IStateCircuitGroup extends IStateCircuit {
    circuits: IConfigCircuitGroupCircuit[];
}
export interface IStateChlorinator {
    id: number;
    lastComm: number;
    currentOutput: number;
    saltLevel: number;
    saltRequired: number;
    status: IDetail;
    poolSetpoint: number;
    spaSetpoint: number;
    superChlor: boolean;
    superChlorHours: number;
    targetOutput: number;
    name: string;
    body: number;
}
export interface IStateSchedule {
    id: number;
    circuit: { id: number; type: string; },
    startTime: number;
    endTime: number;
    scheduleType: IDetail;
    scheduleDays: {
        val: number;
        days: (IDetail&{ dow: number; })[];
    };
}
export interface IStatePump {
    command: number;
    driveState: number;
    flow?: number;
    id: number;
    mode: number;
    ppc: number;
    rpm?: number;
    runTime: number;
    status: IDetail;
    type: IDetail;
    watts: number;
    circuits: IStatePumpCircuit[];
}
export interface IStateTemp {
    air: number;
    bodies: IStateTempBodyDetail[];
    solar: number;
    units: IDetail;
    waterSensor1: number;
    waterSensor2: number;
}
export interface IStateTempBodyDetail {
    circuit: number;
    heatMode: IDetail;
    heatStatus: IDetail;
    id: number;
    isOn: boolean;
    name: string;
    setPoint: number;
    temp: number;
}
export interface IConfigController {
    adjustDST: boolean;
    batteryVoltage?: number;
    body: number;
    delay: number;
    freeze: boolean;
    heatMode: number;
    mode: IDetail;
    status: IDetail&{ percent?: number; };
    time: Date;
    valve: number;
}
export interface IDetail {
    val: number;
    name: string;
    desc: string;
}
export interface IConfigPoolOptions {
    options: {
        adjustDST: boolean;
        clockMode: number;
        clockSource: "internet"|"manual";
        pumpDelay: boolean;
        manualHeat: boolean;
    };
}
export interface IConfigBody {
    id: number;
    name: string;
    isActive: boolean;
    heatMode: number;
    setPoint: number;
}
export interface IConfigSchedule {
    id: number;
    circuit: number;
    startTime: number;
    endTime: number;
    isActive: boolean;
    scheduleDays: number;
}
export interface IConfigEggTimer {
    id: number;
    circuit: number;
    runTime: number;
    isActive: boolean;
}
export interface IConfigCustomName {
    id: number;
    name: string;
    isActive: boolean;
}
export interface IConfigEquipment {
    model: string;
    shared: boolean;
    maxCircuits: number;
    maxBodies: number;
    maxFeatures: number;
    maxIntelliBrites: number;
    maxChlorinators: number;
    maxSchedules: number;
    bootloaderVersion?: string;
    softwareVersion?: string;
    highSpeedCircuits?: IConfigHighSpeedCircuit[];
    equipmentIds: EquipmentIdRange;
}
export interface IConfigHighSpeedCircuit {
    id: number;
    type: number;
    isActive: boolean;
}
export interface IConfigValve {
    id: number;
    circuit: number;
    isActive: boolean;
    name: string;
}
export interface IConfigCircuit {
    id: number;
    type: number;
    name: string;
    freeze: boolean;
    macro: boolean;
    isActive: boolean;
}
export interface IConfigFeature {
    id: number;
    type: number;
    name: string;
    freeze: boolean;
    macro: boolean;
    isActive: boolean;
}
export interface IConfigPump {
    id: number;
    type: number;
    primingSpeed?: number;
    primingTime?: number;
    minSpeed: number;
    maxSpeed: number;
    speedStepSize: number;
    isActive: boolean;
    circuits: IConfigPumpCircuit[];
}
export interface IConfigPumpCircuit {
    id: number;
    circuit: number;
    speed?: number;
    flow?: number;
    units: 0|1;
}
export interface IConfigChlorinator {
    id: number;
    isActive: boolean;
    body: number;
    spaSetpoint: number;
    poolSetpoint: number;
    superChlor: boolean;
    superChlorHours: number;
    name: string;
}
export interface IConfigRemote {
    id: number;
    type: number;
    isActive: boolean;
    name: string;
    button1: number;
    button2: number;
    button3: number;
    button4: number;
    button5?: number;
    button6?: number;
    button7?: number;
    button8?: number;
    button9?: number;
    button10?: number;
    pumpId?: number;
    stepSize?: number;
}
export interface IConfigIntellibrite {
    id: number;
    isActive: number;
    position: number;
    colorSet: number;
    swimDelay: number;
}
export function getItemById(data: any, _id: number) {
    if(Array.isArray(data)) {
        let res=data.find(el => el.id===_id);
        if(typeof res==="undefined") {
            return 0;
        } else {
            return res;
        }
    }
}
export function getItemByIndex(data: any, ndx: number) {
    return data[ndx+1].shift();
}

export function getItemByAttr(data: any, attr: string, val: any) {
    return data.filter(el => el[attr]===val).shift();
}

class PoolController extends React.Component<any, IPoolSystem> {
    constructor(props: IPoolSystem) {
        super(props);
        this.state={
            loadingMessage: 'Loading...',
            sock: undefined,
            poolURL: "*",
            counter: 0,
            _config: {
                controllerType: ControllerType.none,
                lastUpdated: "",
                pool: {
                    options: {
                        adjustDST: false,
                        clockMode: 12,
                        clockSource: "manual",
                        pumpDelay: false,
                        manualHeat: false
                    }
                },
                bodies: [],
                schedules: [],
                eggTimers: [],
                customNames: [],
                equipment: {
                    model: "",
                    shared: false,
                    maxCircuits: 0,
                    maxBodies: 0,
                    maxChlorinators: 0,
                    maxFeatures: 0,
                    maxIntelliBrites: 0,
                    maxSchedules: 0,
                    equipmentIds: {
                        circuits: { start: 1, end: 0 },
                        features: { start: 0, end: 0 },
                        virtualCircuits: { start: 237, end: 247 },
                        circuitGroups: { start: 192, end: 202 }
                    }
                },
                valves: [],
                circuits: [],
                circuitGroups: [],
                features: [],
                pumps: [],
                chlorinators: [
                    {
                        name: "none",
                        id: 1,
                        isActive: false,
                        body: 0,
                        spaSetpoint: 0,
                        poolSetpoint: 0,
                        superChlorHours: 0,
                        superChlor: false
                    }
                ],
                remotes: [],
                intellibrite: [],
                heaters: [],
                appVersion: "0.0.0"
            },
            _state: {
                temps: {
                    air: 0,
                    solar: 0,
                    bodies: [],
                    units: { val: 0, name: "", desc: "" },
                    waterSensor1: 0,
                    waterSensor2: 0
                },
                pumps: [
                    {
                        id: 1,
                        type: { desc: "None", val: 0, name: "none" },
                        status: { desc: "None", val: 0, name: "none" },
                        command: 0,
                        driveState: 0,
                        mode: 0,
                        ppc: 0,
                        runTime: 0,
                        watts: 0,
                        circuits: []
                    }
                ],
                mode: { val: 0, name: "", desc: "" },
                status: {
                    val: 254,
                    name: "not_loaded",
                    desc: "Not Loaded",
                    percent: 0
                },
                equipment: {},
                valves: [],
                heaters: [],
                // circuits: [],
                virtualCircuits: [],
                circuitGroups: [],
                // features: [],
                chlorinators: [
                    {
                        id: 1,
                        spaSetpoint: 0,
                        poolSetpoint: 0,
                        superChlorHours: 0,
                        superChlor: false,
                        currentOutput: 0,
                        lastComm: 0,
                        saltLevel: 0,
                        saltRequired: 0,
                        status: { val: 0, desc: "", name: "" },
                        targetOutput: 0,
                        name: "",
                        body: 32
                    }
                ],
                schedules: [],
                time: new Date(),
                valve: 0,
                body: 0,
                freeze: false
            }
        };

        let a: IPoolSystem;
        let lastUpdateTime=0;
        this.checkURL();
        let self=this;
        setTimeout(function() { self.setState({ loadingMessage: 'Waiting for SSDP to discover pool url.  If you need to set the IP manually, enter it in config.json as `http://host:port`.' }); }, 5000);
    }



    checkURL() {
        console.log(`comms.poolURL: ${ comms.poolURL }`);
        if(comms.poolURL==="*") {
            setTimeout(() => this.checkURL(), 1000);
        }
        else {
            this.setState({ poolURL: comms.poolURL });
            this.load();
        }
    }
    idOfFirstUnusedSchedule() {
        if(this.state._config.controllerType===ControllerType.intellitouch) {
            // easytouch/intellitouch will grab the next available schedules.
            // since we are splitting up eggtimers/schedules we need to take a holistic look so we don't overwrite an existing schedule with a new one
            for(let i=1;i<=this.state._config.equipment.maxSchedules;i++) {
                let occupiedSlot=
                    this.state._state.schedules.filter(el => el.id===i).length||
                    this.state._config.eggTimers.filter(el => el.id===i).length;
                if(!occupiedSlot) return i;
            }
        } else if(this.state._config.controllerType===ControllerType.intellicenter) {
            // how to determine first unused?
        }
    }
    load() {
        if(comms.poolURL!=="*") {

            let sock=comms.incoming((d: any, which: string): { d: any, which: string; } => {
                console.log({ [which]: d });
                if(which!=="error")
                    this.setState(state => {
                        return { counter: state.counter+1 };
                    });

                switch(which) {
                    case "error":
                    case "connect":
                        this.setState(state => {
                            return extend(true, state, { _state: d });
                        });
                        break;
                    case "controller":
                        this.setState(state => {
                            return extend(
                                true,
                                state,
                                { _state: d }
                            );
                        });
                        break;
                    /*                     case "pump":
                                            this.setState(state => {
                                                let pumps=extend(true, [], state._state.pumps);
                                                let index=state._state.pumps.findIndex(el => {
                                                    return el.id===d.id;
                                                });
                                                index===-1? pumps.push(d):pumps[index]=d;
                                                return extend(
                                                    true,
                                                    state,
                                                    { _state: { pumps: pumps } }
                                                );
                                            });
                                            break; */
                    /*                     case "pumpExt":
                                            this.setState(prevstate => {
                                                // here we do not extend, just replace the object
                                                let index=this.state._state.pumps.findIndex(el => {
                                                    return el.id===d.id;
                                                });
                                                //let pumps=extend(true, [], prevstate._state.pumps);
                                                prevstate._state.pumps[index]=d;
                                                return {
                                                    _state: prevstate._state
                                                };
                                            });
                                            break; */
                    case "chlorinator":
                        this.setState(state => {
                            let chlors=extend(true, [], state._state.chlorinators);
                            let index=state._state.chlorinators.findIndex(el => {
                                return el.id===d.id;
                            });
                            index===-1? chlors.push(d):chlors[index]=d;
                            return extend(
                                true,
                                state,
                                { _state: { chlorinators: chlors } }
                            );
                        });
                        break;

                    case "temps":
                        this.setState(state => {
                            return extend(
                                true,
                                state,
                                { _state: { temps: d } }
                            );
                        });
                        break;
                    case "equipment":
                        this.setState(state => {
                            return extend(
                                true,
                                state,
                                { _state: { equipment: d } }
                            );
                        });
                        break;
                    case "config":
                        this.setState(state => {
                            return extend(
                                true,
                                state,
                                { _config: d }
                            );
                        });
                        break;
                    default:
                        console.log(`incoming socket ${ which } not processed by main poolcontroller.tsx`);
                        console.log(d);
                        return { d, which };
                }
            });
            this.setState({ sock });
            console.log(`fetching ${ comms.poolURL }/state/all`);
            fetch(`${ comms.poolURL }/state/all`)
                .then(res => res.json())
                .then(
                    result => {
                        console.log({ state: result });
                        this.setState(state => {
                            return extend(true, state, { _state: result });
                        });
                    },
                    error => {
                        console.log(error);
                    }
                );
            fetch(`${ comms.poolURL }/config/all`)
                .then(res => res.json())
                .then(
                    result => {
                        console.log({ config: result });
                        this.setState(state => {
                            return extend(true, state, { _config: result });
                        });
                    },
                    error => {
                        console.log(error);
                    }
                );
        }
    }

    render() {
        let className='';
        if(this.state._state.status.val===255) className+=" noConnection";
        return (
            <div>

                <div>
                    <Navbar status={this.state._state.status} counter={this.state.counter}>
                        {this.state._state.status.percent}
                    </Navbar>
                </div>
                <div className={className}>
                    {comms.poolURL==="*"? this.state.loadingMessage:

                        <Container>
                            <SysInfo
                                counter={this.state.counter}
                                id="system"
                                visibility={"visible"}
                            />
                            <BodyState
                                id="bodies"
                                visibility={"visible"}
                            />
                            <Pump
                                pumpStates={this.state._state.pumps}
                                pumpConfigs={this.state._config.pumps}
                                id="pumps"
                                visibility={"visible"}
                            />
                            <Circuits
                                controllerType={this.state._config.controllerType}
                                id="Circuits"
                                visibility={"visible"}
                            />
                            <Features
                                controllerType={this.state._config.controllerType}
                                hideAux={false}
                                id="Features"
                                visibility={"visible"}
                            />
                            <Circuits
                                controllerType={this.state._config.controllerType}
                                id="Circuit Groups"
                                visibility={"visible"}
                            />
                            <Circuits
                                controllerType={this.state._config.controllerType}
                                id="Virtual Circuits"
                                visibility={"visible"}
                            />
                            <Schedule
                                data={this.state._state.schedules}
                                id="schedules"
                                visibility={"visible"}
                                idOfFirstUnusedSchedule={this.idOfFirstUnusedSchedule()}

                            />
                            <Chlorinator
                                chlorState={this.state._state.chlorinators[0]}
                                chlorConfig={this.state._config.chlorinators[0]}
                                maxBodies={this.state._config.equipment.maxBodies}
                                id="chlorinators"
                                visibility={"visible"}
                            />
                        </Container>
                    }

                </div>
            </div>

        );
    }
}
export default PoolController;