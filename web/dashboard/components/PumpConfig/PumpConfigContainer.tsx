import {
    Row,
    Col,
    Container
} from "reactstrap";
import React, { useState, useEffect, ReactFragment } from "react";
import PumpConfigPumpCircuit from "./PumpConfigPumpCircuit";
import PumpConfigSelectType from "./PumpConfigSelectType";
import { comms } from "../Socket_Client";
import useDataApi from '../DataFetchAPI';
import { ConfigOptionsPump } from './PumpConfigModalPopup';
import {
    IConfigPump,
    IStatePump,
    IDetail,
    IStatePumpCircuit,
    getItemById,
    getItemByVal,
    IConfigPumpType
} from "../PoolController";

interface Props {
    currentPumpId: number;
    currentPump: IConfigPump;
    options: ConfigOptionsPump
}

function PumpConfigContainer(props: Props) {
    /*     let arr = [];
        arr.push({ url: `${ comms.poolURL }/config/pump/availableCircuits`, dataName: 'availableCircuits' });
        arr.push({ url: `${ comms.poolURL }/config/pump/${props.currentPumpId}/units`, dataName: 'circuitFunctions' });
        // arr.push({ url: `${ comms.poolURL }/extended/pumps`, dataName: 'pumps' });
        const initialState = {availableCircuits: [], pumpUnits: []}
        const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState); */

        const [currentPumpType, setCurrentPumpType] = useState<IConfigPumpType>({
            "val": 0,
            "name": "none",
            "desc": "No pump",
            "maxCircuits": 0,
            "hasAddress": false
            });
        // const [pumpUnits, setPumpUnits] = useState<IDetail>();


        useEffect(()=>{
            if (typeof props.currentPump !== 'undefined'){
                console.log(props.currentPump)
                let _pumpType = getItemByVal(props.options.pumpTypes, props.currentPump.type);
                setCurrentPumpType(_pumpType);
            }
        },[props.currentPumpId, JSON.stringify(props.currentPump)])

    const changePumpType=(pumpType: number) => {
        comms.setPump(props.currentPumpId, pumpType)
    }
    const changePumpCircuit=(pumpCircuit: number, obj: any) => {
        console.log(`changing pump ${ props.currentPumpId } circuitSlot ${ pumpCircuit } to ${ JSON.stringify(obj, null, 2) }`);
        comms.setPumpCircuit(props.currentPumpId, pumpCircuit, obj);
    }
    const deletePumpCircuit=(pumpCircuit: number) => {
        comms.deletePumpCircuit(props.currentPumpId, pumpCircuit)
    }

    const pumpCircuits = () =>{
        // if (props.currentPump.type === 0) return;
        let pumpCircArr:ReactFragment[] = []

        for (let i=1; i<=currentPumpType.maxCircuits; i++){

            let _circ = getItemById(props.currentPump.circuits, i);
            if (_circ === 0){
                _circ = {
                    id: i,
                    circuit: 0
                }
                if (typeof props.currentPump.minSpeed !== 'undefined'){
                    _circ.speed = 1000;
                    _circ.units = props.options.pumpUnits[0].desc==='RPM'?0:1;
                }
                else {
                    _circ.flow = 30;
                    _circ.units = props.options.pumpUnits[0].desc==='GPM'?0:1;     
                }
            }

            pumpCircArr.push(
                <PumpConfigPumpCircuit
                key={i+'circuitIdConfig'}
                currentPump={props.currentPump}
                availableCircuits={props.options.circuits}
                currentPumpCircuit={_circ}
                pumpType={currentPumpType.name}
                pumpUnits={props.options.pumpUnits}
                onChange={changePumpCircuit}
                onDelete={deletePumpCircuit}
                disabled={props.currentPump.type===0}
            />          

            )
        }
        return pumpCircArr;
    }

    return <Container>
        <Row>
            <Col>
                Type{" "}
                <PumpConfigSelectType
                    currentPump={props.currentPump}
                    currentPumpId={props.currentPumpId}
                    currentPumpName={currentPumpType.desc}
                    onChange={changePumpType}
                    pumpTypes={props.options.pumpTypes}
                />
            </Col>
        </Row>
        {typeof props.currentPump !== 'undefined' && props.currentPump.type===0? `Select a pump type to edit circuits`:
            <div>
                {pumpCircuits()}
            </div>
        }
    </Container>
        ;
}

export default PumpConfigContainer;
