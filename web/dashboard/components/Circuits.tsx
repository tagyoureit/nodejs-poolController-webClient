import {
    ListGroup, ListGroupItem, Button, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import CustomCard from './CustomCard';
import { comms } from './Socket_Client';
import React, { useState, useEffect, useReducer } from 'react';
import { ControllerType, getItemById, IDetail, IStateCircuit } from './PoolController';
import CircuitModalPopup from './CircuitConfig/CircuitModalPopup';
import useDataApi from './DataFetchAPI';

interface Props {
    controllerType: ControllerType;
    id: string;
    visibility: string;
}

export interface ConfigCircuit {
    id: number;
    type: number;
    name: string;
    freeze: boolean;
    macro: boolean;
    isActive: boolean;
}


const initialState: { circuits: IStateCircuit[]; }={ circuits: [] };

function Circuits(props: Props) {
    const [modalOpen, setModalOpen]=useState(false);
    let arr=[];
    switch(props.id) {
        case "Circuits":
            arr.push({ url: `${ comms.poolURL }/state/circuits`, name: 'circuits' });
            // url=`${ url }/circuits`;
            break;
        case "Circuit Groups":
            arr.push({ url: `${ comms.poolURL }/state/circuitGroups`, name: 'circuits' });
            // url=`${ url }/circuitGroups`;
            break;
        case "Virtual Circuits":
            arr.push({ url: `${ comms.poolURL }/state/virtualCircuits`, name: 'circuits' });
            // url=`${ url }/virtualCircuits`;
            break;
    }
    arr.push({ url: `${ comms.poolURL }/config/equipment`, name: 'equipment' });
    arr.push({ url: `${ comms.poolURL }/config/circuit/functions`, name: 'circuitFunctions' });

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        let emitter=comms.getEmitter();
        const fn=function(data) { doUpdate({ updateType: 'MERGE_OBJECT', dataName: 'circuits', data }); };

        switch(props.id) {
            case "Circuits":
                emitter.on('circuit', fn);
                return () => {
                    emitter.removeListener('circuit', fn);
                };
            case "Circuit Groups":
                emitter.on('circuitGroup', fn);
                return () => {
                    emitter.removeListener('circuitGroup', fn);
                };
            case "Virtual Circuits":
                emitter.on('circuitGroup', fn);
                return () => {
                    emitter.removeListener('circuitGroup', fn);
                };
        }
    }, []); 
    /* eslint-enable react-hooks/exhaustive-deps */

    const handleClick=(event: any): any => { comms.toggleCircuit(event.target.value); };
    const toggleModal=() => { setModalOpen(!modalOpen); };

    const circuit=() => {
        if(!data.circuits.length) return (<div />);
        // TODO: Aux Extra and NOT used should be hidden.
        // for ( var cir in data )
        // {
        //     // check to make sure we have the right data
        //     if ( data[ cir ].hasOwnProperty( 'name' ) )
        //     {
        //         // if hideAux is true skip the unused circuits
        //         if ( [ 'NOT USED', 'AUX EXTRA' ].indexOf( data[ cir ].name ) !== -1 && props.hideAux )
        //         {
        //         }
        //         else
        //         {
        return data.circuits.map(circuit => {
            return (
                <ListGroupItem key={circuit.id+'circuitlistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        {circuit.name}
                        <Button color={circuit.isOn? 'success':'primary'} key={circuit.id+'circuit'} onClick={handleClick} value={circuit.id} >{circuit.isOn? 'On':'Off'}
                        </Button>
                    </div>
                </ListGroupItem>
            );
        });
    };

    const closeBtn=<button className="close" onClick={toggleModal}>&times;</button>;
    let className="circuit-pane active";
    return (
        <div className={className} id={props.id} role="tabpanel" aria-labelledby="circuit-tab">
            <CustomCard name={props.id} id={props.id} visibility={props.visibility} edit={props.id==='Circuits'? toggleModal:undefined}>
                <ListGroup flush >
                    {circuit()}
                </ListGroup>
            </CustomCard>
            <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' scrollable={true}>
                <ModalHeader toggle={toggleModal} close={closeBtn}>Adjust Pump Configuration</ModalHeader>
                <ModalBody>
                    <CircuitModalPopup
                        id='circuitConfig'
                        visibility='visible'
                        controllerType={props.controllerType} />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Circuits;