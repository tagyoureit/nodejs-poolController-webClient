import
{
    Row, Col, Container, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import CustomCard from '../CustomCard'
import * as React from 'react';
import '../../css/dropdownselect'
import { comms } from '../../components/Socket_Client'
import { getItemById, IStatePump, IStatePumpCircuit } from '../PoolController';

interface Props
{
    currentPumpState: IStatePump
    currentCircuitSlotNumber: number
    condensedCircuitsAndFeatures: { id: number, name: string, type: string }[];
}
interface State
{
    dropdownOpen: boolean,
    currentPump: number,
    currentPumpCircuitState: IStatePumpCircuit
}

class PumpConfigSelectCircuit extends React.Component<Props, State> {

    constructor( props: Props )
    {
        super( props )
        this.toggle = this.toggle.bind( this );
        this.handleClick = this.handleClick.bind( this );
        this.state = {
            dropdownOpen: false, 
            currentPump: this.props.currentPumpState.id || undefined,
            currentPumpCircuitState: getItemById(this.props.currentPumpState.circuits, this.props.currentCircuitSlotNumber) || {circuit: {name: 'Not Used'}}
        };
    }

    handleClick ( event: any )
    {
        console.log( `changing pump=${ this.state.currentPump } circuitSlot=${ this.props.currentCircuitSlotNumber } type to circuit ${ event.target.value } (${ getItemById(this.props.condensedCircuitsAndFeatures, parseInt(event.target.value, 10)) .name })` )
        
        comms.setPumpCircuit( this.state.currentPump, this.props.currentCircuitSlotNumber, {circuit: parseInt( event.target.value, 10 )} )
    }

    toggle ()
    {
        this.setState( {
            dropdownOpen: !this.state.dropdownOpen
        } );
    }

    render ()
    {
        const circuitSelectors = () =>
        {
            let dropdownChildren: React.ReactFragment[] = [];
            for ( let i = 0; i < this.props.condensedCircuitsAndFeatures.length; i++ )
            {
                let circ = this.props.condensedCircuitsAndFeatures[ i ];
                let entry:React.ReactFragment = ( <DropdownItem key={`${ this.props.currentPumpState.id }${ circ.id }CircuitSelect`}
                    value={circ.id}
                    onClick={this.handleClick}
                >
                    {circ.name}
                </DropdownItem> )
                dropdownChildren.push( entry );
            }
            return dropdownChildren;
        }

        return (
            <ButtonDropdown size='sm' isOpen={this.state.dropdownOpen} toggle={this.toggle}
                style={{ width: '60%' }} className='fullWidth'
            >
                <DropdownToggle caret >
                    {this.state.currentPumpCircuitState.circuit.name}
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
                                    maxHeight: '300px'
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
}

export default PumpConfigSelectCircuit;