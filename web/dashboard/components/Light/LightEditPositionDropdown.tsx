import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { useAPI } from '../Comms';

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
    const execute = useAPI();

    useEffect(() => {
        if(typeof props.position!=='undefined'&&targetPosition!==props.position) {
            setTargetPosition(props.position);
            setDisabled(false);
        }
    }, [props.position, targetPosition])

    const toggleDropDown=() => { setDropdownOpen(!dropdownOpen); }

    const handleClick=async (event) => {
        console.log(`lg: ${props.lgId} props.circId: ${ props.circId }, new position:  ${ event.target.value }`)
        await execute('setLightGroupAttribs',  {id: props.lgId, circuits: {id: props.circId, position: targetPosition} } )
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