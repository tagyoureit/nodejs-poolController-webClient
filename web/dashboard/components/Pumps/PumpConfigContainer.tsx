
import React, { ReactFragment, useContext, useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';

import { getItemById, getItemByVal, IConfigPump, IConfigPumpType, PoolContext } from '../PoolController';
import { ConfigOptionsPump } from './PumpConfigModalPopup';
import PumpConfigPumpCircuit from './PumpConfigPumpCircuit';
import PumpConfigSelectType from './PumpConfigSelectType';

interface Props {
    currentPumpId: number;

    options: ConfigOptionsPump
    setPump: (currentPumpId: number, data:any) => void
}

function PumpConfigContainer(props: Props) {
    const { poolURL }=useContext(PoolContext);
    const currentPump = () => {
        return props.options.pumps.find(p => p.id === props.currentPumpId);
    }
    const currentPumpType = () => {
        return props.options.pumpTypes.find(p => p.val === currentPump().type);
    }

    const pumpCircuits=() => {
        // if (props.currentPump.type === 0) return;
        let pumpCircArr: ReactFragment[]=[]       
        for(let i=1;i<=currentPumpType().maxCircuits;i++) {
            pumpCircArr.push(
                <PumpConfigPumpCircuit
                    key={i+'circuitIdConfig'}
                    currentPumpCircuitId={i}
                    currentPumpId={props.currentPumpId}
                    options={props.options}
                    setPump={props.setPump}
                />

            )
        }
        return pumpCircArr;
    }

    return <Container>
        <Row>
            <Col>
                <PumpConfigSelectType
                    currentPumpId={props.currentPumpId}
                    setPump={props.setPump}
                    options={props.options}
                />
            </Col>
        </Row>
        {typeof props.options.pumps.find(p => p.id === props.currentPumpId) !=='undefined' && props.options.pumps.find(p => p.id === props.currentPumpId).type===0? `Select a pump type to edit circuits`:
            <div>
                {pumpCircuits()}
            </div>
        }
    </Container>
        ;
}

export default PumpConfigContainer;
