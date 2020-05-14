import
{
    Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import { comms } from '../../components/Socket_Client'
import React, {useState, useEffect} from 'react';
import { IDetail, IStatePump, IConfigPumpType, IConfigPump } from '../PoolController';
var extend = require( 'extend' );

interface Props
{
    currentPump: IConfigPump;
    currentPumpId: number;
    currentPumpName: string;
    pumpTypes: IConfigPumpType[];
    onChange: (type: number)=>void
}
interface State
{
    dropdownOpen: boolean
}

function PumpConfigSelectType(props: Props){
    const [dropdownOpen, setDropDownOpen] = useState<boolean>(false);



    function handleClick ( event: any )
    {
        console.log( `changing pump ${ props.currentPumpId } type to ${ event.target.value }` )
        // comms.setPump(props.currentPumpState.id, {type: event.target.value})
        props.onChange(parseInt(event.target.value, 10));
    }


    return (
        <ButtonDropdown size='sm' className='mb-1 mt-1' isOpen={dropdownOpen} toggle={()=>setDropDownOpen(!dropdownOpen)}>
            <DropdownToggle caret>
                {props.currentPumpName}
            </DropdownToggle>
            <DropdownMenu>
                {props.pumpTypes.map(el =>{
            return ( <DropdownItem key={`pump${props.currentPumpId}pumpType${el.val}`} value={el.val} onClick={handleClick}>{el.desc}</DropdownItem>)
        })}
            </DropdownMenu>
        </ButtonDropdown>
    )
}




export default PumpConfigSelectType;