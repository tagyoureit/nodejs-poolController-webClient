import {
    Nav, NavItem, NavLink
} from 'reactstrap';
import CustomCard from '../CustomCard';
import React, { useState, useEffect, useReducer } from 'react';
import PumpConfigContainer from './PumpConfigContainer';
import { IStatePump, IConfigPump, getItemById } from '../PoolController';
import { comms } from '../Socket_Client';
import useDataApi from '../DataFetchAPI';
var extend=require("extend");
interface Props {
    id: string;
    
}



const initialState: { pumps: IStatePump[] }={
    pumps: []
};

function PumpConfigModalPopup(props: Props) {
    let [currentPumpId, setCurrentPumpId]=useState(1);
    let [currentPump, setCurrentPump]=useState();
    let arr=[];
    arr.push({ url: `${ comms.poolURL }/extended/pumps`, dataName: 'pumps' });
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);


    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        let emitter=comms.getEmitter();
        const fnPumpExt=function(data) {
            console.log(`received pumpExt:`);
            console.log(data);
            doUpdate({ updateType: 'REPLACE_ARRAY', dataName: 'pumps', data });
        };
        emitter.on('pumpExt', fnPumpExt);

        return () => {
            emitter.removeListener('pumpExt', fnPumpExt);
        };
    }, []);
    
    // react useEffect doesn't do deep compare; hence the JSON.stringify(data)
    useEffect(()=>{
        // set current pump here; pass to children
        let pump = getItemById(data.pumps, currentPumpId);
        setCurrentPump(pump);
    },[currentPumpId, JSON.stringify(data)])
    /* eslint-enable react-hooks/exhaustive-deps */

    const navTabs=() => {
            return data.pumps.map((pump, idx) => {
            return (<NavItem key={`navPumpConfigKey${ pump.id }`}>
                <NavLink href="#" target={pump.id.toString()} onClick={() => setCurrentPumpId(pump.id)} active={currentPumpId===
                    pump.id? true:false}
                    className={currentPumpId===
                        pump.id? 'btn-primary':'btn-secondary'}
                >
                    {pump.id}: {pump.type.desc}
                </NavLink>
            </NavItem>);
        });

    };

    return !doneLoading?<>Loading...</>:(
        <div className="tab-pane active" id="pumpConfig" role="tabpanel" aria-labelledby="pumpConfig-tab">
        {console.log(`data.pumps...`)}
        {console.log(data.pumps)}
            <CustomCard name='Pump Config'  id={props.id}>
                <div>
                    <Nav tabs>
                        {navTabs()}
                    </Nav>
                </div>
                <PumpConfigContainer
                    currentPump={currentPump}
                />
            </CustomCard>
        </div>
    );
}

export default PumpConfigModalPopup;