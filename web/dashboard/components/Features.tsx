import {
    ListGroup, ListGroupItem, Button, Popover, PopoverHeader, PopoverBody
} from 'reactstrap';
import CustomCard from './CustomCard';
import { comms } from './Socket_Client';
import React, { useState, useEffect, useReducer } from 'react';
import { IStateCircuit, IConfigCircuit, EquipmentIdRange, getItemById, ControllerType, equipmentType, IStateCircuitGroup } from './PoolController';
const play=require("../images/play-icon.svg");
const info=require("../images/info-blue-bg.svg");
import useDataApi from './DataFetchAPI';
var extend=require("extend");


interface Props {
    controllerType: ControllerType;
    hideAux: boolean,
    id: string;
    visibility: string;
}


const initialState: { features: IStateCircuit[]; }={ features: [] };

function Features(props: Props) {
    const [popoverOpen, setPopoverOpen]=useState<boolean[]>([false]);
   
    let arr = [];
    arr.push({ url: `${ comms.poolURL }/config/features`, name: 'cfeatures' });
    arr.push({ url: `${ comms.poolURL }/state/features`, name: 'sfeatures' });
    arr.push({ url: `${ comms.poolURL }/config/equipment`, name: 'equipment' });
    arr.push({ url: `${ comms.poolURL }/state/circuitGroups`, name: 'circuitGroups' });
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);

    /* eslint-disable react-hooks/exhaustive-deps */
     useEffect(() => {
        let emitter=comms.getEmitter();
        const fn=function(data) { doUpdate({ updateType: 'MERGE_OBJECT', dataName: 'sfeatures', data }); };
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
        if (getItemById(data.cfeatures, circ).isMacro) comms.setCircuitState(circ);
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
        let features = extend(true, [], data.cfeatures, data.sfeatures)
        return features.map( feature =>
        {
            let offset = data.equipment.equipmentIds.circuitGroups.start - data.equipment.equipmentIds.features.start;
            let group = getItemById(data.circuitGroups, feature.id + offset);
            if (typeof group !== 'undefined' && typeof group.id !== 'undefined' && props.controllerType === ControllerType.intellitouch){
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

    return (
        <>
        {  !doneLoading?  ( <div />): 
        <div className="feature-pane active" id={props.id} role="tabpanel" aria-labelledby="feature-tab">
            <CustomCard name={props.id} id={props.id} visibility={props.visibility}>
                <ListGroup flush >
                    {features()}
                </ListGroup>
            </CustomCard>
        </div>
        }
        </>
    );
}

export default Features;