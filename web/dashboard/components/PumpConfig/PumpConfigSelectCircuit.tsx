import
{
    Row, Col, Container, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import CustomCard from '../CustomCard'
import React, {useState, useEffect} from 'react';
import '../../css/dropdownselect'
import { comms } from '../../components/Socket_Client'
import { getItemById, IStatePump, IStatePumpCircuit } from '../PoolController';

interface Props
{
    availableCircuits: { id: number, name: string, type: string }[];
    currentPumpCircuit: IStatePumpCircuit
    disabled: boolean
    onChange: (pumpCircuit: number, obj: any)=>void
    onDelete: (pumpCircuit: number)=>void
}

function PumpConfigSelectCircuit(props: Props){
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    const handleClick = ( event: any ) =>
    {
        console.log( `changing  circuitSlot=${ props.currentPumpCircuit.id } type to circuit ${ event.target.value } (${ getItemById(props.availableCircuits, parseInt(event.target.value, 10)) .name })` )
        if (event.target.value === "255"){
            props.onDelete(props.currentPumpCircuit.id)
        }
        else
        props.onChange(props.currentPumpCircuit.id, {circuit: parseInt( event.target.value, 10 )})
    }

    const circuitSelectors = () =>
    {
        let dropdownChildren: React.ReactFragment[] = [];
        for ( let i = 0; i < props.availableCircuits.length; i++ )
        {
            // insert first header
            if (i === 0) dropdownChildren.push(<DropdownItem key={`${ props.currentPumpCircuit.id }${ i*100 }CircuitSelect`} header={true} >{props.availableCircuits[ i ].type}</DropdownItem>)
            // insert divider
            if (i > 0 && props.availableCircuits[ i ].type !== props.availableCircuits[ i-1 ].type ){

                dropdownChildren.push(<DropdownItem key={`${ props.currentPumpCircuit.id }${ i*100 }CircuitSelect`} divider={true}></DropdownItem>)
                dropdownChildren.push(<DropdownItem key={`${ props.currentPumpCircuit.id }${ i*101 }CircuitSelect`} header={true}>{ i===props.availableCircuits.length-1?'':props.availableCircuits[ i ].type}</DropdownItem>)
            }
            let circ = props.availableCircuits[ i ];
            let displayText = circ.name==='Remove'?(<p className='text-danger' color='red'>{circ.name}</p>):circ.name;
            let entry:React.ReactFragment = ( <DropdownItem key={`${ props.currentPumpCircuit.id }${ circ.id }CircuitSelect`}
                value={circ.id}
                onClick={handleClick} 
            >{displayText}</DropdownItem> )
            dropdownChildren.push( entry );
        }
        return dropdownChildren;
    }
    return (
        <ButtonDropdown 
        direction="right"
        size='sm' 
        isOpen={dropdownOpen} 
        toggle={()=>setDropdownOpen(!dropdownOpen)}
        style={{ width: '60%' }} 
        className='fullWidth'
        >
            <DropdownToggle 
            disabled={props.disabled}
            caret >
                {props.currentPumpCircuit.circuit.name}
            </DropdownToggle>
            <DropdownMenu 
            modifiers={{
                setMaxHeight: {
                    enabled: true,
                    order: 890,
                    fn: (data) =>{
                        return {
                            ...data,
                            styles: {
                                ...data.styles,
                                overflow: 'auto',
                                maxHeight: '500px'
                            }
                        }
                    }
                }
            }}
            >
               {circuitSelectors()}
            </DropdownMenu>
        </ButtonDropdown>


    )
}

/* class PumpConfigSelectCircuit extends React.Component<Props, State> {

    constructor( props: Props )
    {
        super( props )
        this.toggle = this.toggle.bind( this );
        this.handleClick = this.handleClick.bind( this );
        this.state = {
            dropdownOpen: false, 
            dropdownCircuits: this.circuitSelectors()
        };
    }

    componentDidUpdate(prevProps, prevState ) {

    }
    handleClick ( event: any )
    {
        console.log( `changing  circuitSlot=${ this.props.currentPumpCircuit.id } type to circuit ${ event.target.value } (${ getItemById(this.props.availableCircuits, parseInt(event.target.value, 10)) .name })` )
        if (event.target.value === "255"){
            this.props.onDelete(this.props.currentPumpCircuit.id)
        }
        else
        this.props.onChange(this.props.currentPumpCircuit.id, {circuit: parseInt( event.target.value, 10 )})
    }

    toggle ()
    {
        this.setState( {
            dropdownOpen: !this.state.dropdownOpen
        } );
    }
    circuitSelectors = () =>
    {
        let dropdownChildren: React.ReactFragment[] = [];
        for ( let i = 0; i < this.props.availableCircuits.length; i++ )
        {
            // insert first header
            if (i === 0) dropdownChildren.push(<DropdownItem key={`${ this.props.currentPumpCircuit.id }${ i*100 }CircuitSelect`} header={true}>{this.props.availableCircuits[ i ].type}</DropdownItem>)
            // insert divider
            if (i > 0 && this.props.availableCircuits[ i ].type !== this.props.availableCircuits[ i-1 ].type ){

                dropdownChildren.push(<DropdownItem key={`${ this.props.currentPumpCircuit.id }${ i*100 }CircuitSelect`} divider={true}></DropdownItem>)
                dropdownChildren.push(<DropdownItem key={`${ this.props.currentPumpCircuit.id }${ i*101 }CircuitSelect`} header={true}>{ i===this.props.availableCircuits.length-1?'':this.props.availableCircuits[ i ].type}</DropdownItem>)
            }
            let circ = this.props.availableCircuits[ i ];
            let displayText = circ.name==='Remove'?(<p className='text-danger' color='red'>{circ.name}</p>):circ.name;
            let entry:React.ReactFragment = ( <DropdownItem key={`${ this.props.currentPumpCircuit.id }${ circ.id }CircuitSelect`}
                value={circ.id}
                onClick={this.handleClick} 
            >{displayText}</DropdownItem> )
            dropdownChildren.push( entry );
        }
        return dropdownChildren;
    }
    render ()
    {
    

        return (
            <ButtonDropdown 
            direction="right"
            size='sm' 
            isOpen={this.state.dropdownOpen} 
            toggle={this.toggle}
            style={{ width: '60%' }} 
            className='fullWidth'
            >
                <DropdownToggle 
                disabled={this.props.disabled}
                caret >
                    {this.props.currentPumpCircuit.circuit.name}
                </DropdownToggle>
                <DropdownMenu 
                modifiers={{
                    setMaxHeight: {
                        enabled: true,
                        order: 890,
                        fn: (data) =>{
                            return {
                                ...data,
                                styles: {
                                    ...data.styles,
                                    overflow: 'auto',
                                    maxHeight: '500px'
                                }
                            }
                        }
                    }
                }}
                >
                   {this.circuitSelectors()}
                </DropdownMenu>
            </ButtonDropdown>


        )
    }
} */

export default PumpConfigSelectCircuit;