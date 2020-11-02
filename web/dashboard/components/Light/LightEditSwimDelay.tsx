import React, { useContext, useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { useAPI } from '../Comms';
import { IConfigLightGroupCircuit } from '../PoolController';

//TODO: when the modal is showing and this dropdown is open, the modal is scrolling in the background instead of the dropdown scrolling

interface Props {
    circ: IConfigLightGroupCircuit
    lgId: number
}

interface State {
    dropdownOpen: boolean
    disabled: boolean
    targetSwimDelay: number
}

function LightSwimDelay(props: Props) {
    const [dropdownOpen, setDropdownOpen]=useState(false);
    const [disabled, setDisabled]=useState(false);
    const [targetSwimDelay, setTargetSwimDelay]=useState<number>(undefined)
    let {id: circId, circuit: circuitId, swimDelay} = props.circ;
    const execute = useAPI();
    useEffect(() => {
        if(typeof swimDelay==='undefined') return
        if (targetSwimDelay===swimDelay) {
            setDisabled(false);
        }
    }, [swimDelay, targetSwimDelay])

    const toggleDropDown=() => { setDropdownOpen(!dropdownOpen); }

    const handleClick=(event) => {
        //    setLightSwimDelay( props.data.circuit, event.target.value )
        setTargetSwimDelay(parseInt(event.target.value,10))
        setDisabled(true);
        execute('configLightGroup', {id: props.lgId, circuits: [{circuit: circuitId, swimDelay: event.target.value}]})
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
                        key={`delaylg${ props.lgId }circ${ circId }${ i }`}
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
                    {targetSwimDelay || swimDelay || '0'}s
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
                                    maxHeight: '200px'
                                }
                            }
                        }
                    }
                }}
                >
                    {delays()}
                </DropdownMenu>
            </ButtonDropdown>
        </div >
    )
}

export default LightSwimDelay;