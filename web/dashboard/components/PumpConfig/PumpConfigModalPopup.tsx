import { EventEmitter } from 'events';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';
import axios from 'axios';
import CustomCard from '../CustomCard';
import useDataApi from '../DataFetchAPI';
import ErrorBoundary from '../ErrorBoundary';
import {
    getItemById,
    getItemByVal,
    IConfigCircuit,
    IConfigPump,
    IConfigPumpType,
    IDetail,
    PoolContext,
} from '../PoolController';
import PumpConfigContainer from './PumpConfigContainer';
import { useAPI } from '../Comms';

interface Props {
    id: string;
}

export type ConfigOptionsPump={
    maxPumps: number,
    pumps: IConfigPump[],
    pumpTypes: IConfigPumpType[],
    circuits: IConfigCircuit[],
    circuitNames: IDetail[],
    pumpUnits: IDetail[]
}

const initialState: ConfigOptionsPump={
    maxPumps: 1,
    pumps: [{
        "id": 1,
        "type": 0,
        "isActive": true,
        "circuits": [],
        "name": 'none'
    }],
    pumpTypes: [{
        "val": 0,
        "name": "none",
        "desc": "No pump",
        "maxCircuits": 0,
        "hasAddress": false
    }],
    pumpUnits: [{
        "val": 0,
        "name": "rpm",
        "desc": "RPM"
    }],
    circuits: [],
    circuitNames: []
};

function PumpConfigModalPopup(props: Props) {
    let [currentPumpId, setCurrentPumpId]=useState(1);
    // let [currentPump, setCurrentPump]=useState();
    const execute=useAPI();

    const { controllerType, poolURL, emitter }: {controllerType: string, poolURL: string, emitter:EventEmitter}=useContext(PoolContext);
    let arr=[];
    arr.push({ url: `${ poolURL }/config/options/pumps`, dataName: 'options' });
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);

    const [pumpType, setPumpType]=useState<IConfigPumpType>();

    const changePumpType=async (pumpType: number) => {
        await axios({
            method: 'put',
            url: `${ poolURL }/config/pump/${ currentPumpId }/type`,
            data: { pumpType }
        })
    }
    const setPump = async(currentPumpId: number, incomingData: any) => {
        let pump = incomingData.find(p => p.id === currentPumpId);
        let res = await execute('setPump', pump );
        if (typeof res.stack === 'undefined'){
            let idx = incomingData.findIndex(d => d.id === res.id);
            incomingData[idx] = res;
            doUpdate({updateType: 'REPLACE', data: incomingData, dataName: ['options', 'pumps']});
        }
        else {
            console.log(`ERROR!`)
            console.log(res);
            
        }
    }

    const navTabs=() => {
        try {
        if(doneLoading) {
            return data.options.pumps.map((pump, idx) => {
                return (<NavItem key={`navPumpConfigKey${ pump.id }`}>
                    <NavLink href="#" target={pump.id.toString()} onClick={() => setCurrentPumpId(pump.id)} active={currentPumpId===
                        pump.id? true:false}
                        className={currentPumpId===
                            pump.id? 'btn-primary':'btn-secondary'}
                    >
                        {pump.id}: {pump.name || 'No pump'}
                    </NavLink>
                </NavItem>);
            });
        }
    }
    catch (err){
        console.log(err);
        return <>Error</>
    }
    };

    return !doneLoading? <>Loading...</>:(
        <div className="tab-pane active" id="pumpConfig" role="tabpanel" aria-labelledby="pumpConfig-tab">

            <CustomCard name='Pump Config' id={props.id}>
                <div>
                    <Nav tabs>
                        {navTabs()}
                    </Nav>
                </div>
                <ErrorBoundary>
                    <PumpConfigContainer
                        currentPumpId={currentPumpId}
                        // currentPump={currentPump}
                        options={data.options}
                        setPump={setPump}
                    />
                </ErrorBoundary>
            </CustomCard>
        </div>
    );
}

export default PumpConfigModalPopup;