import React, { useState, useEffect, useRef } from "react";
var extend=require("extend");
import {
    comms
} from "./Socket_Client";

import Navbar from "./Navbar";
import SysInfo from "./SysInfo";
import { UncontrolledAlert, Container } from "reactstrap";

import BodyState from "./BodyState";
import Pump from "./Pumps";
import Circuits from "./Circuits";
import Features from "./Features";
import Schedule from "./Schedules";
import Chlorinator from "./Chlorinator";
import useDataApi from './DataFetchAPI';


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
    virtualControllerStatus: IDetail;
    poolSetpoint: number;
    spaSetpoint: number;
    superChlor: boolean;
    superChlorHours: number;
    targetOutput: number;
    name: string;
    body: IDetail;
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
    if (typeof data === 'undefined' || data.length === 0) {return undefined;}
    return data.filter(el => el[attr]===val).shift();
}


const initialState: any={
    state: {
        equipment: {
            controllerType: ControllerType.none
        },
        schedules: [],
        status: {val: -1, percent: 0}
    }
};


function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }
function PoolController() {
    const [loadingMessage, setLoadingMessage]=useState<string>('Loading...');
    const [poolURL, setPoolURL]=useState<string>('*');
    const [sock, setSock]=useState<any>();
    const [counter, setCounter]=useState(0);
    const [visibility, setVisibility] = useState<string[]>([]);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi([], initialState);
    const prevPercent = usePrevious(data.state.status.percent)

    useEffect(() => {
        checkURL();
        setTimeout(function() { if(comms.poolURL==='*') { setLoadingMessage: 'Waiting for SSDP to discover pool url.  If you need to set the IP manually, enter it in config.json as `http://host:port`.'; } }, 5000);
    }, []);


    const checkURL=() => {
        if(comms.poolURL==='*') {
            console.log(`Checking webClient server for SSDP address every second;`);
            setTimeout(() => checkURL(), 1000);
        }
        else {
            console.log(`webClient server found pool app at: ${ comms.poolURL }`);
            // setState({ poolURL: comms.poolURL });
            setPoolURL(comms.poolURL);

        }
    };

    useEffect(()=>{
        let fetch = async ()=>{
            let res = await comms.visibility();
            setVisibility(res);
        }
        fetch();
    },[])

    useEffect(()=>{
        if (prevPercent !== 100 && data.state.status.percent === 100){
            let arr=[];
            arr.push({ url: `${ comms.poolURL }/state/all`, dataName: 'state' });
            arr.push({ url: `${ comms.poolURL }/config/all`, dataName: 'config' });
            doFetch(arr);
        }
    },[prevPercent, data.state.status.percent])

    useEffect(() => {
        if(poolURL!=="*") {
            let arr=[];
            arr.push({ url: `${ comms.poolURL }/state/all`, dataName: 'state' });
            arr.push({ url: `${ comms.poolURL }/config/all`, dataName: 'config' });
            doFetch(arr);
            let sock=comms.incoming((d: any, which: string): { d: any, which: string; } => {
                console.log({ [which]: d });
                if(which!=="error")
                    this;/* .setState(state => {
                        return { counter: state.counter+1 };
                    }); */
                setCounter(prev => prev+1);

                switch(which) {
                    case "error":
                        // case "connect":
                        // this.setState(state => {
                        //     return extend(true, state, { _state: d });
                        // });
                        doUpdate({ updateType: 'FETCH_FAILURE' });
                        break;
                    case "controller":
                        // this.setState(state => {
                        //     return extend(
                        //         true,
                        //         state,
                        //         { _state: d }
                        //     );
                        // });
                        doUpdate({ updateType: 'MERGE_OBJECT', data: d, dataName: 'state' });
                        break;

                    case "chlorinator":
                        /*                  this.setState(state => {
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
                                         }); */
                        doUpdate({ updateType: 'MERGE_OBJECT', data: d, dataName: 'state' });
                        break;

                    case "temps":
                        /*                         this.setState(state => {
                                                    return extend(
                                                        true,
                                                        state,
                                                        { _state: { temps: d } }
                                                    );
                                                }); */
                        break;
                    case "equipment":
                        /*                         this.setState(state => {
                                                    return extend(
                                                        true,
                                                        state,
                                                        { _state: { equipment: d } }
                                                    );
                                                }); */
                        break;
                    case "config":
                        /*                         this.setState(state => {
                                                    return extend(
                                                        true,
                                                        state,
                                                        { _config: d }
                                                    );
                                                }); */
                        break;
                    default:
                        console.log(`incoming socket ${ which } not processed by main poolcontroller.tsx`);
                        console.log(d);
                        return { d, which };
                }
            });
            setSock(sock); // is this really needed?
        }
    }, [poolURL]);



    let className='';
    if((data&&data.state&&data.state.status&&data.state.status.val===255)||isError) {
        className+=" noConnection";
    }
    const navbar=(<div><Navbar /></div>);
    const errorPresent=() => {
        if(isError) {
            return <>
                <UncontrolledAlert color="danger">
                    Error connecting to poolController. Retrying in 10s.
                </UncontrolledAlert>
               {/*  <>{loadingMessage}<br />isLoading?{isLoading? 'yes':'no'}<br />doneLoading?{doneLoading? 'yes':'no'}<br />isError?{isError? 'yes':'no'}</> */}
            </>;
        }
        else return <></>;
    };

    return (
        <div>
            {navbar}
            {errorPresent()}
            <div className={className}>
                {comms.poolURL==="*"? <>{loadingMessage}</>:

                    <Container>
                        <SysInfo
                            counter={counter}
                            id="system"
                            visibility={data.visibility || []}
                            isLoading={isLoading}
                            doneLoading={doneLoading}
                            data={data.state}
                        />
                        <BodyState
                            id="bodies"
                            visibility={data.visibility || []}
                        />
                        <Pump
                            id="pumps"
                            visibility={data.visibility || []}
                        />
                        <Circuits
                            controllerType={data.state.equipment.controllerType}
                            id="Circuits"
                            visibility={data.visibility || []}
                        />
                        <Features
                            controllerType={data.state.equipment.controllerType}
                            hideAux={false}
                            id="Features"
                            visibility={data.visibility || []}
                        />
                        <Circuits
                            controllerType={data.state.equipment.controllerType}
                            id="Circuit Groups"
                            visibility={data.visibility || []}
                        />
                        <Circuits
                            controllerType={data.state.equipment.controllerType}
                            id="Virtual Circuits"
                            visibility={data.visibility || []}
                        />
                        <Schedule
                            data={data.state.schedules}
                            id="schedules"
                            visibility={data.visibility || []}
                        />
                        <Chlorinator
                            id="chlorinators"
                            visibility={data.visibility || []}
                        />
                    </Container>
                }

            </div>

          {/*<>Msg:{loadingMessage}<br />isLoading?{isLoading? 'yes':'no'}<br />doneLoading?{doneLoading? 'yes':'no'}</><p /><> {JSON.stringify(data)}</> */}
        </div>
    );

}

export default PoolController;