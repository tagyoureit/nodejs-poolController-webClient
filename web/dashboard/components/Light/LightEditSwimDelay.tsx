import { Container, Row, Col, Button, Table, Dropdown, ButtonDropdown, DropdownToggle, DropdownItem, DropdownMenu } from 'reactstrap'
import { useAPI } from '../Comms'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import '../../css/rangeslider.css'
import React, { useContext, useEffect, useState } from 'react';

//TODO: when the modal is showing and this dropdown is open, the modal is scrolling in the background instead of the dropdown scrolling

interface Props {
    circId: number
    lgId: number
    swimDelay: number
}

interface State {
    dropdownOpen: boolean
    disabled: boolean
    targetSwimDelay: number
}

function LightSwimDelay(props: Props) {
    const [dropdownOpen, setDropdownOpen]=useState(false);
    const [disabled, setDisabled]=useState(false);
    const [swimDelay, setSwimDelay]=useState<number>(-1)

    useEffect(() => {
        if(typeof props.swimDelay!=='undefined'&&swimDelay!==props.swimDelay) {
            setSwimDelay(props.swimDelay);
            setDisabled(false);
        }
    }, [props.swimDelay, swimDelay])

    const toggleDropDown=() => { setDropdownOpen(!dropdownOpen); }

    const handleClick=(event) => {
        //    setLightSwimDelay( props.data.circuit, event.target.value )
        setDisabled(true);
        setSwimDelay(parseInt(event.target.value))
    }

    const delays=() => {
        let positionArray: number[]=[]
        for(let i=0;i<=60;i++) {
            positionArray.push(i)
        }

        return (
            <>
                {positionArray.map(i => (
                    (<DropdownItem
                        key={`delaylg${ props.lgId }circ${ props.circId }${ i }`}
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
             {`circ:id-${props.circId}, lgid:${props.lgId}`}
            <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropDown} disabled={disabled} >
                <DropdownToggle caret disabled={disabled}>
                    {props.swimDelay? props.swimDelay:'0'}s
                    </DropdownToggle>
                <DropdownMenu>
                    {delays()}
                </DropdownMenu>
            </ButtonDropdown>
        </div >
    )
}

export default LightSwimDelay;