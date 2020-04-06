import {
    Row,
    Col,
    Container
} from "reactstrap";
import React, {useState, useEffect} from "react";
import PumpConfigPumpCircuit from "./PumpConfigPumpCircuit";
import PumpConfigSelectType from "./PumpConfigSelectType";
import {comms} from "../Socket_Client";
import useDataApi from '../DataFetchAPI';

import {
    IConfigPump,
    IStatePump,
    IDetail,
    IStatePumpCircuit
} from "../PoolController";

interface Props {
    currentPump: IConfigPump & IStatePump;
}

function PumpConfigContainer(props: Props){
    let arr = [];
    arr.push({ url: `${ comms.poolURL }/config/pump/availableCircuits`, name: 'availableCircuits' });
    arr.push({ url: `${ comms.poolURL }/config/pump/${props.currentPump.id}/units`, name: 'circuitFunctions' });
    // arr.push({ url: `${ comms.poolURL }/extended/pumps`, name: 'pumps' });
    const initialState = {availableCircuits: [], pumpUnits: []}
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);
    /* eslint-disable react-hooks/exhaustive-deps */
   /*  useEffect(()=>{

    }, [props.currentPump.id]) */ // do NOT add doUpdate to the list here
    /* eslint-enable react-hooks/exhaustive-deps */
 


    const setPumpType = (pumpType: number)=>{
        comms.setPump(props.currentPump.id, pumpType)
    }
    const setPumpCircuit = (pumpCircuit: number, obj: any) => {
        console.log(`changing pump ${props.currentPump.id} circuitSlot ${pumpCircuit} to ${JSON.stringify(obj,null,2)}`);
        comms.setPumpCircuit(props.currentPump.id, pumpCircuit, obj);
    }
    const deletePumpCircuit = (pumpCircuit: number) => {
        comms.deletePumpCircuit(props.currentPump.id, pumpCircuit)
    }
    return !doneLoading ?(<>Loading...</>):
        <Container>
            <Row>
                <Col>
                    Type{" "}
                    <PumpConfigSelectType
                        currentPumpState={props.currentPump}
                        onChange={setPumpType}
                    />
                </Col>
            </Row>
            {doneLoading && props.currentPump.type.name==='none'?`Select a pump type to edit circuits`:
       <div>
{/*           {typeof data.pumps[props.currentPump.id].circuits === 'undefined'?console.log(`MAP PUMP IS UNDEFINED!`):''}
          {typeof data.pumps[props.currentPump.id].circuits === 'undefined'?console.log(props):''} */}
           {props.currentPump.circuits.map(circ =>{
               return (<PumpConfigPumpCircuit 
                key={circ.id + 'circuitIdConfig'}
                availableCircuits={data.availableCircuits}
                currentPumpCircuit={circ as any as IStatePumpCircuit}
                pumpType={props.currentPump.type.name}
                pumpUnits={data.pumpUnits}
                onChange={setPumpCircuit}
                onDelete={deletePumpCircuit} 
                disabled={props.currentPump.type.name==='none'}
                />)})}                   
         </div>
    }
        </Container>
    ;
}

export default PumpConfigContainer;
