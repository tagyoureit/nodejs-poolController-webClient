import
{
    Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import { useAPI } from '../Comms'
import React, {useState, useEffect} from 'react';
import { IDetail, IStatePump, IConfigPumpType, IConfigPump } from '../PoolController';
import { RIEInput } from '@attently/riek';
var extend = require( 'extend' );
const editIcon = require('../../images/edit.png');
interface Props
{
    currentPump: IConfigPump;
    currentPumpId: number;
    currentPumpType: string;
    pumpTypes: IConfigPumpType[];
    handleChangePumpType: (type: number)=>void
    setPump: (obj: any)=>void
}
interface State
{
    dropdownOpen: boolean
}

function PumpConfigSelectType(props: Props){
    const [dropdownOpen, setDropDownOpen] = useState<boolean>(false);

    const changeName = async (data) => {
        console.log(JSON.stringify(data))
        let pump = extend(true, {}, props.currentPump)
        for (const [k, v] of Object.entries(data)) {
           pump.name = v;
        }
        props.setPump(pump);
    }

    function handleClick ( event: any )
    {
        console.log( `changing pump ${ props.currentPumpId } type to ${ event.target.value }` )
        // comms.setPump(props.currentPumpState.id, {type: event.target.value})
        props.handleChangePumpType(parseInt(event.target.value, 10));
    }


    return (
        <Row>
            <Col>
        <ButtonDropdown size='sm' className='mb-1 mt-1' isOpen={dropdownOpen} toggle={()=>setDropDownOpen(!dropdownOpen)}>
            <DropdownToggle caret>
                {props.currentPumpType}
            </DropdownToggle>
            <DropdownMenu>
                {props.pumpTypes.map(el =>{
                    return ( <DropdownItem key={`pump${props.currentPumpId}pumpType${el.val}`} value={el.val} onClick={handleClick}>{el.desc}</DropdownItem>)
                })}
            </DropdownMenu>
        </ButtonDropdown>
                </Col>
                <Col>
                {typeof props.currentPump !== 'undefined' && false && <><RIEInput
                    value={props.currentPump?.name}
                    change={changeName}
                    propName={props.currentPump.id.toString()}
                    className={"editable"}
                    classLoading="loading"
                    classInvalid="invalid"
                />
                <img src={editIcon} width='15px' height='15px' /></>}
                </Col>
        </Row>
    )
}




export default PumpConfigSelectType;