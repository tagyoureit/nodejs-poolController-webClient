import
{
    Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import { comms } from '../../components/Socket_Client'
import React, {useState, useEffect} from 'react';
import { IDetail, IStatePump } from '../PoolController';
var extend = require( 'extend' );

interface Props
{
    currentPumpState: IStatePump;
    onChange: (type: number)=>void
}
interface State
{
    dropdownOpen: boolean
}

function PumpConfigSelectType(props: Props){
    const [dropdownOpen, setDropDownOpen] = useState<boolean>(false);
    const [pumpTypes, setPumpTypes] = useState<any>([]);

    useEffect(()=>{
            fetch(`${comms.poolURL}/config/pump/types`)
                .then(res => res.json())
                .then(
                    result => {
                        setPumpTypes(result);
                    },
                    error => {
                        console.log(error);
                    }
                );
    
    }, [])

    function handleClick ( event: any )
    {
        console.log( `changing pump ${ props.currentPumpState.id } type to ${ event.target.value }` )
        // comms.setPump(props.currentPumpState.id, {type: event.target.value})
        props.onChange(parseInt(event.target.value, 10));
    }


    return (
        <ButtonDropdown size='sm' className='mb-1 mt-1' isOpen={dropdownOpen} toggle={()=>setDropDownOpen(!dropdownOpen)}>
            <DropdownToggle caret>
                {props.currentPumpState.type.desc}
            </DropdownToggle>
            <DropdownMenu>
                {pumpTypes.map(el =>{
            return ( <DropdownItem key={`pump${el.id}pumpType${el.val}`} value={el.val} onClick={handleClick}>{el.desc}</DropdownItem>)
        })}
            </DropdownMenu>
        </ButtonDropdown>
    )
}




export default PumpConfigSelectType;