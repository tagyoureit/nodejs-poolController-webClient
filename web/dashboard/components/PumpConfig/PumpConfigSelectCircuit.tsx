import '../../css/dropdownselect';

import React, { useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { getItemById, IConfigCircuit, IConfigPumpCircuit } from '../PoolController';

interface Props
{
    pumpId: number
    availableCircuits: IConfigCircuit[];
    currentPumpCircuit: IConfigPumpCircuit
    disabled: boolean
    onChange: (pumpCircuit: number, obj: any)=>void
    onDelete: (pumpCircuit: number)=>void
}

function PumpConfigSelectCircuit(props: Props){
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

    const handleClick = ( event: any ) =>
    {
        console.log( `changing  circuitSlot=${ props.currentPumpCircuit.id } type to circuit ${ event.target.value } (${ getItemById(props.availableCircuits, parseInt(event.target.value, 10)) .name })` )
        let removeIDs = props.availableCircuits.filter(el=>{
            return el.name.toLowerCase()==='not used' || el.name.toLowerCase()==='delete' || el.name.toLowerCase()==="remove" || el.name.toLowerCase() === 'none'
        }).map(el=>el.id)
        if (removeIDs.includes(parseInt(event.currentTarget.value, 10))){
            props.onDelete(props.currentPumpCircuit.id)
        }
        else
        props.onChange(props.currentPumpCircuit.id, {circuit: parseInt( event.target.value, 10 )})
    }

    const circuitSelectors = () =>
    {
        let dropdownChildren: React.ReactFragment[] = [];
         props.availableCircuits.forEach(circ => {
            let entry:React.ReactFragment = ( <DropdownItem key={`pump${props.pumpId}pumpcirc${ props.currentPumpCircuit.id }circ${ circ.id }CircuitSelect`}
                value={circ.id}
                onClick={handleClick} 
                disabled={typeof circ.type === 'undefined' && circ.id !== 255}
            >{circ.name}</DropdownItem> )
            dropdownChildren.push( entry );
        }); 
        return dropdownChildren;
    }
    const label = () => {
        if (props.currentPumpCircuit.circuit === 0) return 'Not Used'
        return getItemById(props.availableCircuits, props.currentPumpCircuit.circuit).name;
    }
        return (
        <>
        <ButtonDropdown 
        direction="right"
        size='sm' 
        isOpen={dropdownOpen} 
        toggle={()=>setDropdownOpen(!dropdownOpen)}
        style={{ width: '60%' }}
        className='fullWidth'
        >
            <DropdownToggle 
            disabled={props.disabled}
            // color={props.currentPumpCircuit.circuit.isOn?'success':'secondary'}
            caret >
                {label()}
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
                                maxHeight: '400px'
                            }
                        }
                    }
                }
            }}
            >
               {circuitSelectors()}
            </DropdownMenu>
        </ButtonDropdown>
  </>
    )
}

export default PumpConfigSelectCircuit;