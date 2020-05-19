import { Container, Row, Col, Button, Table, Dropdown, ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap'
import { comms } from '../Socket_Client'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import '../../css/rangeslider.css'
import React, { useState, useEffect } from 'react';




interface Props {
    circId: number
    lgId: number
    position: number
    numLights: number
}

function LightPosition(props: Props) {
    const [dropdownOpen, setDropdownOpen]=useState(false);
    const [disabled, setDisabled]=useState(false);
    const [targetPosition, setTargetPosition]=useState<number>(-1)

    useEffect(() => {
        if(typeof props.position!=='undefined'&&targetPosition!==props.position) {
            setTargetPosition(props.position);
            setDisabled(false);
        }
    }, [props.position, targetPosition])

    const toggleDropDown=() => { setDropdownOpen(!dropdownOpen); }

    const handleClick=(event) => {
        console.log(`lg.... props.circId, event.target.value: ${ props.circId }, ${ event.target.value }`)
        // setLightPosition( lg, props.data.circuit, event.target.value )
        setDisabled(true);
        setTargetPosition(parseInt(event.target.value))
    }

    const positions=() => {
        let positionArray: number[]=[]
        for(let i=1;i<=props.numLights;i++) {
            positionArray.push(i)
        }
        return (
            <>
                {positionArray.map(i => (
                    (<DropdownItem
                        key={`lg${props.lgId}light${ props.circId }${ i }`}
                        onClick={handleClick}
                        value={i}
                    >
                        {i}
                    </DropdownItem>)

                ))}
            </>
        )
    }

    return (
        <div>
            <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropDown} disabled={disabled} >
                <DropdownToggle caret disabled={disabled}>
                    {props.position}
                </DropdownToggle>
                <DropdownMenu>
                    {positions()}
                </DropdownMenu>
            </ButtonDropdown>

        </div >

    )
}


export default LightPosition;