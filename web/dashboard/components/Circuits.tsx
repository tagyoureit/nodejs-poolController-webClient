import {
    ListGroup, ListGroupItem, Button, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import CustomCard from './CustomCard';
import { useAPI } from './Comms';
import React, { useContext, useState, useEffect, useReducer } from 'react';
import { ControllerType, getItemById, IDetail, IStateCircuit } from './PoolController';
import CircuitModalPopup from './CircuitConfig/CircuitModalPopup';
import useDataApi from './DataFetchAPI';
import { PoolContext } from './PoolController';
interface Props {
    id: string;
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
    const [needsReload, setNeedsReload]=useState(false);
    const { reload, poolURL, controllerType, emitter }=useContext(PoolContext);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);
    const execute = useAPI();
    useEffect(() => {
        if(typeof poolURL!=='undefined') {

            let arr=[];
            switch(props.id) {
                case "Circuits":
                    arr.push({ url: `${ poolURL }/state/circuits`, dataName: 'circuits' });
                    // url=`${ url }/circuits`;
                    break;
                case "Circuit Groups":
                    arr.push({ url: `${ poolURL }/state/circuitGroups`, dataName: 'circuits' });
                    // url=`${ url }/circuitGroups`;
                    break;
                case "Virtual Circuits":
                    arr.push({ url: `${ poolURL }/state/virtualCircuits`, dataName: 'circuits' });
                    // url=`${ url }/virtualCircuits`;
                    break;
            }
            arr.push({ url: `${ poolURL }/config/equipment`, dataName: 'equipment' });
            arr.push({ url: `${ poolURL }/config/circuit/functions`, dataName: 'circuitFunctions' });
            doFetch(arr);
        }
    }, [poolURL, doFetch])


    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined'){
        const fn=function(data) { doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'circuits', data }); };

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
    }
    }, [poolURL, emitter]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const handleClick=async (event: any) => { 
        await execute('toggleCircuit', {id: event.target.value});
     };
    const toggleModal=() => {
        if(modalOpen&&needsReload) {
            reload();
            setNeedsReload(false);
        }
        setModalOpen(!modalOpen);
    };

    const circuit=() => {
        if(!data.circuits.length) return (<div />);
        return data.circuits&&data.circuits.length>0&&data.circuits.map(circuit => {
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
            <CustomCard name={props.id} id={props.id} edit={props.id==='Circuits'? toggleModal:undefined}>
                <ListGroup flush >
                    {circuit()}
                </ListGroup>
            </CustomCard>
            <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' scrollable={true}>
                <ModalHeader toggle={toggleModal} close={closeBtn}>Adjust Pump Configuration</ModalHeader>
                <ModalBody>
                    <CircuitModalPopup
                        id='circuitConfig'
                        controllerType={controllerType}
                        type='circuits'
                        needsReload={needsReload}
                        setNeedsReload={setNeedsReload}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Circuits;