import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';
import { useAPI } from '../Comms'
import React, { useEffect, useState, useRef } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { IConfigLightGroupCircuit } from '../PoolController'


interface Props {
    circ: IConfigLightGroupCircuit
    lgId: number
    numLights: number
}
function LightPosition(props: Props) {
    const [dropdownOpen, setDropdownOpen]=useState(false);
    const [disabled, setDisabled]=useState(false);
    const [targetPosition, setTargetPosition]=useState<number>(undefined)
    const execute = useAPI();

    useEffect(() => {
        if (typeof props.circ.position==='undefined') return;
        if(targetPosition===props.circ.position) {
             setDisabled(false);
         }
    }, [props.circ.position])

    const toggleDropDown=() => { setDropdownOpen(!dropdownOpen); }

    const handleClick=async (event) => {
        setDisabled(true);
        setTargetPosition(parseInt(event.target.value))
        execute('configLightGroup', {id: props.lgId, circuits: [{circuit: props.circ.circuit, position: event.target.value}]})
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
                        key={`lg${props.lgId}light${ props.circ.id }${ i }`}
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
                    {targetPosition || props.circ.position}
                </DropdownToggle>
                <DropdownMenu>
                    {positions()}
                </DropdownMenu>
            </ButtonDropdown>

        </div >

    )
}


export default LightPosition;