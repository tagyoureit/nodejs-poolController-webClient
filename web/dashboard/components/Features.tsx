import
{
    ListGroup, ListGroupItem, Button, Popover, PopoverHeader, PopoverBody
} from 'reactstrap';
import CustomCard from './CustomCard'
import { toggleCircuit, setCircuitState } from './Socket_Client'
import * as React from 'react';
import {useState} from 'react';
import { IStateCircuit, IConfigCircuit, EquipmentIdRange, getItemById, ControllerType } from './PoolController';
const play = require("../images/play-icon.svg");
const info = require("../images/info-blue-bg.svg");
interface Props
{
    controllerType: ControllerType;
    circuits: IConfigCircuit[];
    features: IStateCircuit[];
    circuitGroupStates: IStateCircuit[];
    equipmentIds?: EquipmentIdRange;
    hideAux: boolean,
    id: string;
    visibility: string;
}
interface State {
    popoverOpen: any;
}

class Features extends React.Component<Props, State> {

    constructor( props: Props )
    {
        super( props )
        this.state = {popoverOpen: false}
        this.toggle = this.toggle.bind(this);
        this.handleClick = this.handleClick.bind( this );
    }
    toggle = (evt?: any) => {
        let state = typeof this.state.popoverOpen[evt.target.id] === 'undefined'? true : !this.state.popoverOpen[evt.target.id];
        this.setState({popoverOpen: {[evt.target.id]: state}})};
    circuit = () =>
    {
   
        if ( typeof this.props.features === 'undefined' ) return ( <div /> );
        // TODO: Aux Extra and NOT used should be hidden.
        // for ( var cir in data )
        // {
        //     // check to make sure we have the right data
        //     if ( data[ cir ].hasOwnProperty( 'name' ) )
        //     {
        //         // if hideAux is true skip the unused circuits
        //         if ( [ 'NOT USED', 'AUX EXTRA' ].indexOf( data[ cir ].name ) !== -1 && this.props.hideAux )
        //         {
        //         }
        //         else
        //         {
        return this.props.features.map( feature =>
        {
            let offset = this.props.equipmentIds.circuitGroups.start - this.props.equipmentIds.features.start;
            let group = getItemById(this.props.circuitGroupStates, feature.id + offset);
            if (typeof group.id !== 'undefined' && this.props.controllerType === ControllerType.intellitouch){
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
                        <Popover isOpen={this.state.popoverOpen[targetid]} target={targetid} toggle={this.toggle}>
                            <PopoverHeader>Circuit Groups</PopoverHeader>
                            <PopoverBody><ul>{details}</ul></PopoverBody>
                        </Popover>
                        <Button color={group.isOn ? 'success' : 'primary'} key={feature.id + 'feature'} onClick={this.handleClick} value={feature.id} >
                        <img src={play} width='20px' height='20px'/>
                        </Button>
                    </div>
                </ListGroupItem>)                
            }
            else
            return (<ListGroupItem key={feature.id + 'featurelistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        {feature.name}
                        <Button color={feature.isOn ? 'success' : 'primary'} key={feature.id + 'feature'} onClick={this.handleClick} value={feature.id} >{feature.isOn ? 'On' : 'Off'}
                        </Button>
                    </div>
                </ListGroupItem>
            )


        } )
    }
    handleClick = ( event: any ): any =>
    {   
        let circ = event.target.value;
        if (getItemById(this.props.circuits, circ).isMacro) setCircuitState(circ);
        toggleCircuit( circ );
    }
    render ()
    {
        return (
            <div className="feature-pane active" id={this.props.id} role="tabpanel" aria-labelledby="feature-tab">
                <CustomCard name={this.props.id} id={this.props.id} visibility={this.props.visibility}>
                    <ListGroup flush >
                        {this.circuit()}
                    </ListGroup>
                </CustomCard>
            </div>
        );
    }
}

export default Features;