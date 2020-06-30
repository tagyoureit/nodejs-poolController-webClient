import { EventEmitter } from 'events';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { Nav, NavItem, NavLink } from 'reactstrap';

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
    let [currentPump, setCurrentPump]=useState();

    const { controllerType, poolURL, emitter }: {controllerType: string, poolURL: string, emitter:EventEmitter}=useContext(PoolContext);
    let arr=[];
    arr.push({ url: `${ poolURL }/config/options/pumps`, dataName: 'options' });
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);

    const [pumpType, setPumpType]=useState<IConfigPumpType>();

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined'){
            console.log(`LOADING PUMPEXT EMITTER; ${controllerType}`);
    
        const fnPumpExt=function(data) {
            doUpdate({ updateType: 'REPLACE_ARRAY', dataName: ['options','pumps'], data }); 
            let arr=[];
            arr.push({ url: `${ poolURL }/config/options/pumps`, dataName: 'options' });
            doFetch(arr);
        };
        emitter.on('pumpExt', fnPumpExt);

        return () => {
            console.log('UNLOADING PUMPEXT EMITTER');
            
            emitter.removeListener('pumpExt', fnPumpExt);
        };
        }
    }, [poolURL,emitter]);

    // react useEffect doesn't do deep compare; hence the JSON.stringify(data)
    useEffect(() => {
        if(doneLoading) {

            // set current pump here; pass to children
            let pump=getItemById(data.options.pumps, currentPumpId);
            setCurrentPump(pump);
            let _pumpType=getItemById(data.options.pumpTypes, pump.type);
            setPumpType(_pumpType);
        }
    }, [currentPumpId, doneLoading])
    /* eslint-enable react-hooks/exhaustive-deps */

    const navTabs=() => {
        if(doneLoading) {

            return data.options.pumps.map((pump, idx) => {
                const desc=pump.name
                return (<NavItem key={`navPumpConfigKey${ pump.id }`}>
                    <NavLink href="#" target={pump.id.toString()} onClick={() => setCurrentPumpId(pump.id)} active={currentPumpId===
                        pump.id? true:false}
                        className={currentPumpId===
                            pump.id? 'btn-primary':'btn-secondary'}
                    >
                        {pump.id}: {desc}
                    </NavLink>
                </NavItem>);
            });
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
                        currentPump={currentPump}
                        options={data.options}
                    />
                </ErrorBoundary>
            </CustomCard>
        </div>
    );
}

export default PumpConfigModalPopup;