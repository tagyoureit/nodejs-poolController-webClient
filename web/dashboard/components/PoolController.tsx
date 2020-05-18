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

import BodyState from './BodyState';
import Chlorinator from './Chlorinator';
import Circuits from './Circuits';
import useDataApi from './DataFetchAPI';
import Features from './Features';
import Navbar from './Navbar';
import Pump from './Pumps';
import Schedule from './Schedules';
import { comms, Discovery } from './Socket_Client';
import SysInfo from './SysInfo';
import Light from './Light/Light';

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
export enum ControllerType { "virtual", "intellicenter", "intellitouch", "intellicom", "none" }
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
    nameId?: number;
    freeze?: boolean;
    macro?: boolean;
    isActive?: boolean;
    equipmentType?: 'circuit'|'feature'|'virtual'|'circuitGroup'
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
    minSpeed?: number;
    maxSpeed?: number;
    minFlow?: number;
    maxFlow?: number;
    speedStepSize?: number;
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


function usePrevious(value) {
    const ref=useRef();
    useEffect(() => {
        ref.current=value;
    });
    return ref.current;
}
function PoolController() {
    const [poolURL, setPoolURL]=useState<string>();
    const [counter, setCounter] = useState(0);
    const [visibility, setVisibility]=useState<string[]>([]);
    const [{ data, isLoading, isError, doneLoading, error }, doFetch, doUpdate]=useDataApi([], initialState);
    const prevPercent=usePrevious(data.state&&data.state.status&&data.state.status.percent||0);
    const [debug, setDebug]=useState(false);
    const [host, setHost]=useState('localhost')
    const [port, setPort]=useState<number>(4200)
    const [protocol, setProtocol]=useState('http')
    const [switchDisabled, setSwitchDisabled]=useState(false);
    const [autoDiscovery, setAutoDiscovery]=useState(true);
    let _timeout=useRef<NodeJS.Timeout>()
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        let emitter=comms.getEmitter();
        const fnError=function(data) {
            console.log(`received error emit`)
            doUpdate({ updateType: 'FETCH_FAILURE' });
            // doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'features', data }); 
        };
        const fnController=function(data) {
            console.log(`received controller emit`)
            setCounter(p=>p+1);
            doUpdate({ updateType: 'MERGE_OBJECT', data, dataName: 'state' });
        };
        emitter.on('feature', fnError);
        emitter.on('controller', fnController);
        return () => {
            emitter.removeListener('feature', fnError);
            emitter.removeListener('controller', fnController);
        }
    }, []);
    useEffect(()=>{
        // when pool app loads, get pool app data/location
        checkURL().then(()=>{
            console.log(`done`);
        });
    },[])
    useEffect(()=>{
        // when pool app gets a new poolURL, fetch data
        if (typeof poolURL !== 'undefined') reloadFn();
    },[poolURL])
    /* eslint-enable react-hooks/exhaustive-deps */

    const checkURL=async () => {
        clearTimeout(_timeout.current);  // in case we get here multiple times
        try {
            let res=await comms.getPoolData(true);
            console.log(`res?`)
            console.log(res)
            console.log(`have getPoolData?: autoDiscovery:${ autoDiscovery }, protocol:${ protocol }, host:${ host }, port:${ port }, poolURL:${ poolURL }`)
            console.log(`webClient received config: ${ JSON.stringify(res) }`);
            setAutoDiscovery(res.autoDiscovery);
            setProtocol(res.override.protocol);
            setHost(res.override.host);
            setPort(res.override.port);
            if(typeof res.poolURL==='undefined') {
                console.log(`Checking webClient server for SSDP address every second;`);
                _timeout.current=setTimeout(checkURL, 3000);
            }
            else {
                setPoolURL(res.poolURL);
            }
            return Promise.resolve();
        }
        catch(err) {
            console.log(`Error getting pool discovery vars!`)
            return Promise.reject();
        }
    };


    const getVisibility=async () => {
        let res=await comms.visibility();
        setVisibility(res);
    }

    const switchSSDP=async (e) => {
        setSwitchDisabled(true);
        console.log(`switching AWAY from ${ autoDiscovery }`)
        let res: Discovery;
        if(autoDiscovery) {
            res=await comms.startOverride();
        }
        else {
            res=await comms.deleteOverride();
        }
        await checkURL();
        setSwitchDisabled(false);
    }

    const saveManualLocation=async () => {
        await comms.saveOverride(protocol, host, port)
        await checkURL();
    }

    const reloadFn=() => {
        console.log(`RELOADING all data`)
        let arr=[];
        arr.push({ url: `${ poolURL }/state/all`, dataName: 'state' });
        arr.push({ url: `${ poolURL }/config/all`, dataName: 'config' });
        doFetch(arr);
        getVisibility();
    }

    // Reload data when pool app gets to 100% loaded
    // This may be needed to reload all sections if they were prev empty but we received emits for data updates
    useEffect(() => {
        if(prevPercent!==100&&data.state&&data.state.status&&data.state.status.percent===100) {
            let arr=[];
            arr.push({ url: `${ poolURL }/state/all`, dataName: 'state' });
            arr.push({ url: `${ poolURL }/config/all`, dataName: 'config' });
            doFetch(arr);
        }
    }, [prevPercent, doFetch])

      let className='';
    if((data&&data.state&&data.state.status&&data.state.status.val===255)||isError) {
        className+=" noConnection";
    }
    const navbar=(<div><Navbar /></div>);
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
        <PoolContext.Provider value={{ visibility, reload: reloadFn, controllerType: data.controllerType, poolURL }} >
            <div>
                <Navbar>
                    Configure Comms<br />
                    <CustomInput type="switch" id="ssdpSwitch" name="ssdpSwitch" label="Use SSDP" checked={autoDiscovery} onChange={switchSSDP} disabled={switchDisabled? true:false}/>
                    {autoDiscovery&&typeof poolURL==='undefined'&&'Waiting for SSDP to discover pool url.  Make sure that your SSDP server is enabled in the poolController/config.json file.  If you still have issues (eg your router is blocking uPNP) and need to set the IP manually, set it below.'}
                    {!autoDiscovery&&
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
                {typeof poolURL==='undefined'||!doneLoading&&<Container>Loading...</Container>}
                {typeof poolURL!=='undefined'&&doneLoading&&!data.error&&<div className={className}>
                    <Container>
                        <SysInfo
                            counter={counter}
                            id="System"
                            isLoading={isLoading}
                            doneLoading={doneLoading}
                            data={data.state}
                        />
                        <BodyState
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
                        <div className='debugArea'>

                            Debug: <Button style={{ margin: '0px 0px 3px 0px', padding: 0, border: 0 }} color='link' onClick={() => setDebug(!debug)}>{debug? 'on':'off'}</Button>. <a href='https://github.com/tagyoureit/nodejs-poolController-webClient/issues/new'>Report an issue</a> or ask a question on the <a href='https://gitter.im/nodejs-poolController/Lobby'>forums</a>.
                        </div>
                    </Container>


                </div>}

                {/*<>Msg:{loadingMessage}<br />isLoading?{isLoading? 'yes':'no'}<br />doneLoading?{doneLoading? 'yes':'no'}</><p /><> {JSON.stringify(data)}</> */}
            </div>
        </PoolContext.Provider>
    );

}

export default PoolController;