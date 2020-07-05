import '../css/poolController.css';

import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Container,
    CustomInput,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    InputGroup,
    InputGroupAddon,
    UncontrolledAlert,
    UncontrolledButtonDropdown,
} from 'reactstrap';

import BodiesState from './BodiesState';
import Chlorinator from './Chlorinator';
import Circuits from './Circuits';
import useDataApi from './DataFetchAPI';
import Features from './Features';
import Navbar from './Navbar';
import Pump from './Pumps';
import Schedule from './Schedules';
import { useAPI, Discovery, useComms } from './Comms';
import SysInfo from './SysInfo';
import Light from './Light/Light';
import { useInterval } from '../utilities/UseInterval'
import ChemController from './ChemController'
import Replay from './utilities/Replay'
import SocketTester from './utilities/SocketTester';
var extend=require("extend");
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
export enum ControllerType { virtual="virtual", intellicenter="intellicenter", intellitouch="intellitouch", intellicom="intellitouch", suntouch="suntouch", none="none" }
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
    intellibrite?: IConfigLightGroup[];
    heaters: any[];
    appVersion: string;
}
export interface IConfigOptionsLightGroups {
    maxLightGroups: number,
    equipmentNames: IDetail[],
    themes: ({ type: string }&IDetail)[],
    colors: IDetail[],
    circuits: IConfigCircuit[],
    lightGroups: IConfigLightGroup[],
    functions: IDetail[]
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
    circuit: IStateCircuit,
    startTime: number;
    endTime: number;
    scheduleType: IDetail;
    scheduleDays: {
        val: number;
        days: (IDetail&{ dow: number; })[];
    };
    equipmentType: string
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
    air?: number;
    bodies: IStateTempBodyDetail[];
    solar?: number;
    units: IDetail;
    waterSensor1: number;
    waterSensor2?: number;
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
export interface ConfigOptionsHeaters{
    maxHeaters: number;
    heaters: IConfigHeater[];
    heaterTypes: IDetail[];
    heatModes: IDetail[];
}
export interface IConfigHeater{
    id: number;
    isActive: boolean;
    type: number;
    name: string;
    body: number;
    coolingEnabled: boolean;
    startTempDelta: number;
    stopTempDelta: number
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
    nameId?: number;
    freeze?: boolean;
    macro?: boolean;
    isActive?: boolean;
    equipmentType?: 'circuit'|'feature'|'virtual'|'circuitGroup'
    assignableToPumpCircuit?: boolean
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
    name: string;
    primingSpeed?: number;
    primingTime?: number;
    minSpeed?: number;
    maxSpeed?: number;
    minFlow?: number;
    maxFlow?: number;
    speedStepSize?: number;
    flowStepSize?: number;
    isActive: boolean;
    isVirtual?: boolean;
    circuits: IConfigPumpCircuit[];
}
export interface IConfigPumpType {
    val: number,
    name: string,
    desc: string,
    maxCircuits: number,
    hasAddress: boolean,
    minFlow?: number,
    maxFlow?: number,
    maxPrimingTime?: number
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
    isVirtual: boolean;
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
export interface IConfigLightGroup {
    id: number;
    name?: string;
    isActive?: number;
    type?: IDetail,
    circuits: IConfigLightGroupCircuit[]
}
export interface IConfigLightGroupCircuit {
    id: number,
    circuit?: number,
    position?: number;
    color?: number;
    swimDelay?: number;
    isActive?: boolean;
}

export interface IStateChemController {
    id: number
    name: string
    address?: number
    body?: IDetail
    type: IDetail
    pHLevel: number
    orpLevel: number
    saltLevel: number
    waterFlow: number
    acidTankLevel: number
    orpTankLevel: number
    status1: IDetail
    status2: IDetail
    phDosingTime: number
    orpDosingTime: number
    saturationIndex: number
    temp: number
    tempUnits: IDetail
    virtualControllerStatus: IDetail
}

export interface IConfigChemController {
    id: number
    name: string
    address?: number
    body?: IDetail
    type: IDetail
    isActive: boolean
    isVirtual: boolean
    pHSetpoint: number
    orpSetpoint: number
    calciumHardness: number
    cyanuricAcid: number
    alkalinity: number
}
export interface IExtendedChemController extends IConfigChemController, IStateChemController{}

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
export function getItemByVal(data: any, _val: number) {
    if(Array.isArray(data)) {
        let res=data.find(el => el.val===_val);
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
    if(typeof data==='undefined'||data.length===0) { return undefined; }
    return data.filter(el => el[attr]===val).shift();
}

export const PoolContext=React.createContext({
    visibility: [],
    reload: () => { },
    controllerType: ControllerType.none,
    poolURL: undefined,
    emitter: undefined,
    socket: undefined
})
export const PoolURLContext=React.createContext({
    poolURL: undefined
})

const initialState: any={
    state: {
        equipment: {
            controllerType: ControllerType.none,
            model: 'No connection'
        },
        schedules: [],
        status: { val: -1, percent: 0 }
    },
    doneLoading: false
};



function PoolController() {
    // const [poolURL, setPoolURL]=useState<string>();
    const [counter, setCounter]=useState(0);
    const [visibility, setVisibility]=useState<string[]>(['Replay']);
    const [{ data, isLoading, isError, doneLoading, error }, doFetch, doUpdate]=useDataApi([], initialState);
    const [debug, setDebug]=useState(false);
    const [switchDisabled, setSwitchDisabled]=useState(false);
    const [{override, useSSDP}, poolURL, emitter, setCommsData, retry, socket] = useComms();
    const execute = useAPI();
    const [protocol, setProtocol]=useState(override.protocol)
    const [host, setHost]=useState(override.host)
    const [port, setPort]=useState<number>(override.port)
    const emitterRef = useRef(undefined);
    const socketRef = useRef(undefined);

    useEffect(() => {
        if (override.protocol !== protocol) setProtocol(override.protocol);
        if (override.host !== host) setHost(override.host);
        if (override.port !== port) setPort(override.port);
    }, [override.protocol, override.host, override.port]);
    /* eslint-disable react-hooks/exhaustive-deps */

     useEffect(() => {
         if (typeof poolURL !== 'undefined'){
            if (typeof emitter !== 'undefined' && typeof emitterRef.current === 'undefined') emitterRef.current = emitter;
            if (typeof socket !== 'undefined' && typeof socketRef.current === 'undefined') socketRef.current = socket;
            console.log(`SETTING EMITTERS`);
           const fnError=function(data) {
               if(isError) return;
               doUpdate({ updateType: 'FETCH_FAILURE' });
            };
             const fnReconnect=()=> {
                console.log(`Socket reconnected.`)
            }
            const fnController=function(_data) {
                console.log(`received controller emit`)
                setCounter(p => p+1);
                if (data.state.status.percent !== 100 && _data.status.percent === 100) reloadFn();
                doUpdate({ updateType: 'MERGE_OBJECT', data: _data, dataName: 'state' });
            };
            if (typeof emitterRef.current !== 'undefined'){
                emitterRef.current.on('socket-connect_error', fnError);
                emitterRef.current.on('socket-disconnect', fnError);
                emitterRef.current.on('socket-reconnect', fnReconnect);
                emitterRef.current.on('controller', fnController);
                return () => {
                    emitterRef.current.removeListener('manager-error', fnError);
                    // emitter.removeListener('connect_error', fnError);
                    emitterRef.current.removeListener('connect_timeout', fnError);
                    emitterRef.current.removeListener('controller', fnController);
                }
            }
      }
    }, [poolURL, socket]);


     useEffect(() => {
        console.log(`poolURL changed: ${ poolURL }`)
        // when pool app gets a new poolURL, fetch data
        if(typeof poolURL!=='undefined') reloadFn();
    }, [poolURL])
    /* eslint-enable react-hooks/exhaustive-deps */

   const getVisibility=async () => {
        let res = await execute('visibility');
        setVisibility(res);
    }

    const switchSSDP=async (e) => {
        setSwitchDisabled(true);
        console.log(`switching AWAY from ${ useSSDP }`)
        let data: Discovery;
        if(useSSDP) {
            let cd = extend(true,{},{override, useSSDP},{useSSDP: false})
            data = await setCommsData(cd);
        }
        else {
            let cd = extend(true,{},{override, useSSDP},{useSSDP: true})
            data = await setCommsData(cd);
        }
        setProtocol(data.override.protocol);
        setHost(data.override.host);
        setPort(data.override.port);
        setSwitchDisabled(false);
    }

    const saveManualLocation=async () => {
        let cd = {
            override: {
                protocol,
                host,
                port
            },
            useSSDP
        };
        let resData = await setCommsData(cd);
        console.log(`save override: ${resData}`)
    }

     const reloadFn=() => {
        console.log(`RELOADING all data.  poolURL=${ poolURL } ${ typeof poolURL==='undefined'&&'ABORTING.' }`)
        if (typeof poolURL === 'undefined') return;
        let arr=[];
        arr.push({ url: `${ poolURL }/state/all`, dataName: 'state' });
        arr.push({ url: `${ poolURL }/config/all`, dataName: 'config' });
        doFetch(arr);
        getVisibility();
    }

    useEffect(() => {
        console.log(`emitter changed!`)
        console.log(emitter);
    }, [emitter]);

    let className='';
    if((data&&data.state&&data.state.status&&data.state.status.val===255)||isError||!doneLoading) {
        className+=" noConnection";
    }
    const errorPresent=() => {
        if(isError) {
            return <>
                <UncontrolledAlert color="danger">
                    Pool controller connection lost. {error}
                    <br />
                    Open Navigation menu to configure communications to poolController.
                </UncontrolledAlert>
                {/*  <>{loadingMessage}<br />isLoading?{isLoading? 'yes':'no'}<br />doneLoading?{doneLoading? 'yes':'no'}<br />isError?{isError? 'yes':'no'}</> */}
            </>;
        }
        else return <></>;
    };
    return (
        <PoolContext.Provider value={{ visibility, reload: reloadFn, controllerType: data&&data.config&&data.config.controllerType||'none', poolURL, emitter:emitterRef.current, socket: socketRef.current }} >
        <PoolURLContext.Provider value={{poolURL: poolURL || undefined}}>
            <div>
                <Navbar>
                    Configure Comms<br />
                    <CustomInput type="switch" id="ssdpSwitch" name="ssdpSwitch" label="Use SSDP" checked={useSSDP} onChange={switchSSDP} disabled={switchDisabled? true:false} />
                    {useSSDP&&typeof poolURL==='undefined'&&'Waiting for SSDP to discover pool url.  Make sure that your SSDP server is enabled in the poolController/config.json file.  If you still have issues (eg your router is blocking uPNP) and need to set the IP manually, set it below.'}
                    {!useSSDP&&
                        <> <InputGroup>
                            <InputGroupAddon addonType="prepend">
                                <UncontrolledButtonDropdown >
                                    <DropdownToggle caret>
                                        {protocol}
                                    </DropdownToggle>
                                    <DropdownMenu onClick={e => { setProtocol((e.target as HTMLButtonElement).value) }}>
                                        <DropdownItem value='http'>http</DropdownItem>
                                        <DropdownItem value='https'>https</DropdownItem>
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </InputGroupAddon>
                            <Input type="text" name="host" id="host" value={host} onChange={(e) => { setHost(e.target.value); }} />
                            <InputGroupAddon addonType="append">
                                <Input type='number' name="port" id="port" value={port.toString()} onChange={(e) => { setPort(parseInt(e.target.value, 10)); }} />
                            </InputGroupAddon>

                        </InputGroup>
                            <Button size='sm' color='link' onClick={saveManualLocation}>Save address</Button> (Current value: {poolURL})
                    </>}
                </Navbar>

                {errorPresent()}
                {/* {typeof poolURL==='undefined'||!doneLoading&&<Container>Loading...</Container>} */}
                {/* {typeof poolURL!=='undefined'&& */}

                {<div className={className}>
                    <Container>
                           <SysInfo
                            counter={counter}
                            id="System"
                            isLoading={isLoading}
                            doneLoading={doneLoading}
                            state={data.state}
                            controllerName={data.state.equipment.model}
                            config={data.config}
                        />
                        <BodiesState
                            id="Bodies"
                        />
                        <Pump
                            id="Pumps"
                        />
                        <Circuits
                            id="Circuits"
                        />
                        <Features
                            id="Features"
                        />
                           <Light
                            id="Lights"
                        />
                        <Circuits
                            id="Circuit Groups"
                        />
                        <Circuits
                            id="Virtual Circuits"
                        />
                        <Schedule
                            data={data.state.schedules}
                            id="Schedules"
                        />
                        <Chlorinator
                            id="Chlorinators"
                        />
                        <ChemController
                            id="Chem Controllers"
                        />
                         <Replay
                            id="Replay"
                         />
                         <SocketTester
                            id="Socket Tester"
                        />
                        <div className='debugArea'>

                            Debug: <Button style={{ margin: '0px 0px 3px 0px', padding: 0, border: 0 }} color='link' onClick={() => setDebug(!debug)}>{debug? 'on':'off'}</Button>. <a href='https://github.com/tagyoureit/nodejs-poolController-webClient/issues/new'>Report an issue</a> or ask a question on the <a href='https://gitter.im/nodejs-poolController/Lobby'>forums</a>.
                        </div>
                    </Container>
                </div>}

                {/*<>Msg:{loadingMessage}<br />isLoading?{isLoading? 'yes':'no'}<br />doneLoading?{doneLoading? 'yes':'no'}</><p /><> {JSON.stringify(data)}</> */}
            </div>
            </PoolURLContext.Provider>
        </PoolContext.Provider>
    );

}

export default PoolController;