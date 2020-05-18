import React, { useContext, useEffect, useReducer, useState } from 'react';
import {
    Button,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap';

import CircuitModalPopup from './CircuitConfig/CircuitModalPopup';
import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { ControllerType, getItemById, IStateCircuit, PoolContext } from './PoolController';
import { comms } from './Socket_Client';
import ErrorBoundary from './ErrorBoundary';
const play=require("../images/play-icon.svg");
const info=require("../images/info-blue-bg.svg");

interface Props {
    id: string;
    }


const initialState: { features: IStateCircuit[]; }={ features: [] };

function Features(props: Props) {
    const [popoverOpen, setPopoverOpen]=useState<boolean[]>([false]);
    const [modalOpen, setModalOpen]=useState(false);
    const [needsReload, setNeedsReload]=useState(false);
    const {reload, poolURL, controllerType} = useContext(PoolContext);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi([], initialState);
    useEffect(()=>{
        if (typeof poolURL !== 'undefined'){
            let arr = [];
            arr.push({ url: `${ poolURL }/extended/features`, dataName: 'features' });
            // arr.push({ url: `${ poolURL }/state/features`, dataName: 'sfeatures' });
            arr.push({ url: `${ poolURL }/config/equipment`, dataName: 'equipment' });
            arr.push({ url: `${ poolURL }/state/circuitGroups`, dataName: 'circuitGroups' });
            doFetch(arr);
        }
    },[poolURL])


    /* eslint-disable react-hooks/exhaustive-deps */
     useEffect(() => {
        let emitter=comms.getEmitter();
        const fn=function(data) { 
            console.log(`received feature emit`)
            doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'features', data }); };
        emitter.on('feature', fn);
        return () => {
            emitter.removeListener('feature', fn);
        };
    }, []); 
    /* eslint-enable react-hooks/exhaustive-deps */
    const toggle = (evt?: any) => {
        let _popover = [...popoverOpen];
         _popover[evt.target.id] = !_popover[evt.target.id];
        setPopoverOpen(_popover)
    }
    const handleClick = ( event: any ): any =>
    {   
        let circ = event.target.value;
        if (getItemById(data.features, circ).isMacro) comms.setCircuitState(circ);
        comms.toggleCircuit( circ );
    }
    const features = () =>
    {
        // if ( !state.features.length || typeof equipmentIds === 'undefined' ) return ( <div /> );
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
        if (!data.features) {return <>No Features</>};
        return data.features.map( feature =>
        {
            let offset = data.equipment.equipmentIds.circuitGroups.start - data.equipment.equipmentIds.features.start;
            let group = getItemById(data.circuitGroups, feature.id + offset);
            if (typeof group !== 'undefined' && typeof group.id !== 'undefined' && controllerType === ControllerType.intellitouch){
                let details = group.circuits.map(circuit => {
                    return (<li key={feature.id+offset+circuit.circuit.id+'_circuitGroupDetails'}>{`${circuit.circuit.id} ${circuit.circuit.name}: ${circuit.desiredStateOn?'Off':'On'}`}</li>)
                });
                let targetid = 'cgtarget'+feature.id;
                return (<ListGroupItem key={feature.id + 'featurelistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        <span>
                            {feature.name + ' '}
                            <img src={info} width='20px' height='20px' id={targetid}/>
                        </span>
                        <Popover isOpen={popoverOpen[targetid]} target={targetid} toggle={toggle}>
                            <PopoverHeader>Circuit Groups</PopoverHeader>
                            <PopoverBody><ul>{details}</ul></PopoverBody>
                        </Popover>
                        <Button color={group.isOn ? 'success' : 'primary'} key={feature.id + 'feature'} onClick={handleClick} value={feature.id} >
                        <img src={play} width='20px' height='20px'/>
                        </Button>
                    </div>
                </ListGroupItem>)                
            }
            else
            return (<ListGroupItem key={feature.id + 'featurelistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        {feature.name}
                        <Button color={feature.isOn ? 'success' : 'primary'} key={feature.id + 'feature'} onClick={handleClick} value={feature.id} >{feature.isOn ? 'On' : 'Off'}
                        </Button>
                    </div>
                </ListGroupItem>
            )
        } )
    }

    const toggleModal=() => {
        console.log(`modalOpen (${modalOpen}) && needsReload(${needsReload}): ${modalOpen && needsReload}`) 
        if (modalOpen && needsReload) {
            reload();
            setNeedsReload(false);
        }
        setModalOpen(!modalOpen); 
    };

    const closeBtn=<button className="close" onClick={toggleModal}>&times;</button>;
    let className="circuit-pane active";
    return (
        <>
        {  !doneLoading?  ( <div />): 
        <div className="feature-pane active" id={props.id} role="tabpanel" aria-labelledby="feature-tab">
            <CustomCard name={props.id} id={props.id}  edit={toggleModal}>
                <ListGroup flush >
                    {features()}
                </ListGroup>
            </CustomCard>
            <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' scrollable={true}>
                <ModalHeader toggle={toggleModal} close={closeBtn}>Adjust Pump Configuration</ModalHeader>
                <ModalBody>
                    <CircuitModalPopup
                        id='circuitConfig'
                        
                        controllerType={controllerType} 
                        type='features'
                        needsReload={needsReload}
                        setNeedsReload={setNeedsReload}
                        />

                </ModalBody>
                <ModalFooter>
                    <Button onClick={toggleModal}>Close</Button>
                </ModalFooter>
            </Modal>

        </div>
        }
        </>
    );
}

export default Features;