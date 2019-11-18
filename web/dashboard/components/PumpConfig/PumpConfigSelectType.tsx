import
{
    Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import { comms } from '../../components/Socket_Client'
import * as React from 'react';
import { IDetail, IStatePump } from '../PoolController';
var extend = require( 'extend' );

interface Props
{
    currentPumpState: IStatePump;
    pumpTypes: any
    // currentPumpType: number
}
interface State
{
    dropdownOpen: boolean
}

class PumpConfigSelectType extends React.Component<Props, State> {
    constructor( props: Props )
    {
        super( props )
        this.toggle = this.toggle.bind( this );
        this.handleClick = this.handleClick.bind( this );
        
        this.state = {
            dropdownOpen: false
        };
    }
    componentDidUpdate ( prevProps )
    {
        // if ( this.props.currentPumpType !== prevProps.currentPumpType )
        // {
        //     this.setState( {
        //         pumpType: this.pumpType.transform( this.props.currentPumpType ).desc
        //     } );
        // }
    }
    handleClick ( event: any )
    {
        console.log( `changing pump ${ this.props.currentPumpState.id } type to ${ event.target.value }` )
        comms.setPump(this.props.currentPumpState.id, {type: event.target.value})
    }

    toggle ()
    {
        this.setState( {
            dropdownOpen: !this.state.dropdownOpen
        } );
    }
    pumpTypes ()
    {
        let ret:React.ReactFragment[] = [];
        let types = this.props.pumpTypes
        if (!types.length) return (<div />);
        let pump = this.props.currentPumpState
        for ( let i = 0; i < types.length; i++ )
        {
            ret.push( ( <DropdownItem key={`pump${pump.id}pumpType${types[i].val}`} value={types[i].val} onClick={this.handleClick}>{types[i].desc}</DropdownItem>))
        }
        return ret;
    }
    render ()
    {
        return (
            <ButtonDropdown size='sm' className='mb-1 mt-1' isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                <DropdownToggle caret>
                    {this.props.currentPumpState.type.desc}
                </DropdownToggle>
                <DropdownMenu>
                    {this.pumpTypes()}
                </DropdownMenu>
            </ButtonDropdown>
        )
    }
}

export default PumpConfigSelectType;