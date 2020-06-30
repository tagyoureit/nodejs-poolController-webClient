import axios from 'axios';
import React, { ReactFragment, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';

import { getItemById, getItemByVal, IConfigPump, IConfigPumpType, PoolContext } from '../PoolController';
import { ConfigOptionsPump } from './PumpConfigModalPopup';
import PumpConfigPumpCircuit from './PumpConfigPumpCircuit';
import PumpConfigSelectType from './PumpConfigSelectType';

interface Props {
    currentPumpId: number;
    currentPump: IConfigPump;
    options: ConfigOptionsPump
}

function PumpConfigContainer(props: Props) {
    const { poolURL }=useContext(PoolContext);
    const [currentPumpType, setCurrentPumpType]=useState<IConfigPumpType>({
        "val": 0,
        "name": "none",
        "desc": "No pump",
        "maxCircuits": 0,
        "hasAddress": false
    });

    useEffect(() => {
        if(typeof props.currentPump!=='undefined') {
            console.log(props.currentPump)
            let _pumpType=getItemByVal(props.options.pumpTypes, props.currentPump.type);
            setCurrentPumpType(_pumpType);
        }
    }, [props.currentPumpId, JSON.stringify(props.currentPump), props.options.pumpTypes, props.currentPump])

    const changePumpType=async (pumpType: number) => {
        await axios({
            method: 'put',
            url: `${ poolURL }/config/pump/${ props.currentPumpId }/type`,
            data: { pumpType }
        })
    }
    const setPump = async(data: any) => {
        await axios({
            method: 'put',
            url: `${ poolURL }/config/pump`,
            data: data
        })
    }
    const changePumpCircuit=async (pumpCircuit: number, obj: any) => {
        console.log(`changing pump ${ props.currentPumpId } circuitSlot ${ pumpCircuit } to ${ JSON.stringify(obj, null, 2) }`);
        await axios({
            url: `${ poolURL }/config/pump/${ props.currentPumpId }/pumpCircuit/${ pumpCircuit }`,
            method: 'PUT',
            data: obj
        })
    }
    const deletePumpCircuit=async (pumpCircuit: number) => {
         await axios({
            url:`${ poolURL }/config/pump/${ props.currentPumpId }/pumpCircuit/${ pumpCircuit }`,
            method: 'DELETE'
        });
    }

    const pumpCircuits=() => {
        // if (props.currentPump.type === 0) return;
        let pumpCircArr: ReactFragment[]=[]

        for(let i=1;i<=currentPumpType.maxCircuits;i++) {

            let _circ=getItemById(props.currentPump.circuits, i);
            if(_circ===0) {
                _circ={
                    id: i,
                    circuit: 0
                }
                if(typeof props.currentPump.minSpeed!=='undefined') {
                    _circ.speed=1000;
                    _circ.units=props.options.pumpUnits[0].desc==='RPM'? 0:1;
                }
                else {
                    _circ.flow=30;
                    _circ.units=props.options.pumpUnits[0].desc==='GPM'? 0:1;
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
                    currentPumpType={currentPumpType.desc}
                    handleChangePumpType={changePumpType}
                    setPump={setPump}
                    pumpTypes={props.options.pumpTypes}
                />
            </Col>
        </Row>
        {typeof props.currentPump!=='undefined'&&props.currentPump.type===0? `Select a pump type to edit circuits`:
            <div>
                {pumpCircuits()}
            </div>
        }
    </Container>
        ;
}

export default PumpConfigContainer;
