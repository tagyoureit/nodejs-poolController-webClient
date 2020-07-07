import {
Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import { useAPI } from '../Comms'
import React, { useState, useEffect } from 'react';
import { IDetail, IStatePump, IConfigPumpType, IConfigPump } from '../PoolController';
import { RIEInput } from '@attently/riek';
import { ConfigOptionsPump } from './PumpConfigModalPopup';
var extend = require('extend');
const editIcon = require('../../images/edit.png');
interface Props {
    currentPumpId: number;
    setPump: (currentPumpId: number, data: any) => void
    options: ConfigOptionsPump
}
interface State {
    dropdownOpen: boolean
}

function PumpConfigSelectType(props: Props) {
    const [dropdownOpen, setDropDownOpen] = useState<boolean>(false);

    const changeName = async (data) => {
        console.log(JSON.stringify(data))
        let pumps: IConfigPump[] = extend(true, [], props.options.pumps);
        let pump = pumps.find(p => p.id === props.currentPumpId)
        for (const [k, v] of Object.entries(data)) {
            pump.name = v as string;
        }
        props.setPump(props.currentPumpId, pumps);
    }

    function handleClick(event: any) {
        console.log(`changing pump ${props.currentPumpId} type to ${event.target.value}`)
        let arr = extend(true, [], props.options.pumps);
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === props.currentPumpId) {
                arr[i] = {
                    id: props.currentPumpId,
                    type: parseInt(event.target.value, 10)
                }
            }
        }
        props.setPump(props.currentPumpId, arr);
    }
    const currentPump = () => {
        return props.options.pumps.find(p => p.id === props.currentPumpId);
    }
    const type = () => {
        return props.options.pumpTypes.find(type => type.val === currentPump().type)
    }

    return (<>
        {typeof currentPump() !== 'undefined' &&
            <Row>
                <Col>
                    <ButtonDropdown size='sm' className='mb-1 mt-1' isOpen={dropdownOpen} toggle={() => setDropDownOpen(!dropdownOpen)}>
                        <DropdownToggle caret>
                            {type().desc}
                        </DropdownToggle>
                        <DropdownMenu>
                            {props.options.pumpTypes.map(el => {
                                return (<DropdownItem key={`pump${props.currentPumpId}pumpType${el.val}`} value={el.val} onClick={handleClick}>{el.desc}</DropdownItem>)
                            })}
                        </DropdownMenu>
                    </ButtonDropdown>
                </Col>
                <Col>

                    <RIEInput
                        value={props.options.pumps.find(p => p.id === props.currentPumpId)?.name || 'No pump'}
                        change={changeName}
                        propName={props.options.pumps.find(p => p.id === props.currentPumpId).id.toString()}
                        className={"editable"}
                        classLoading="loading"
                        classInvalid="invalid"
                    />
                    <img src={editIcon} width='15px' height='15px' />
                </Col>
            </Row>}
    </>)
}




export default PumpConfigSelectType;