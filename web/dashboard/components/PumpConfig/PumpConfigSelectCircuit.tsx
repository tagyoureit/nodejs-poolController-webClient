import '../../css/dropdownselect';

import React, { useContext, useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { getItemById, IConfigPump, PoolContext } from '../PoolController';
import { ConfigOptionsPump } from './PumpConfigModalPopup';

var extend = require("extend");

interface Props
{
    currentPumpId: number
    // availableCircuits: IConfigCircuit[];
    currentPumpCircuitId: number
    // disabled: boolean
    // onChange: (pumpCircuit: number, obj: any)=>void
    // onDelete: (pumpCircuit: number)=>void
    options: ConfigOptionsPump
    setPump: (currentPumpId: number, data:any) => void
}

function PumpConfigSelectCircuit(props: Props){
    const { controllerType }=useContext(PoolContext);
    const notUsed = () => {
        if (controllerType.toLowerCase().includes('touch')){
            return props.options.circuitNames.find(c=>c.name === 'notused');
        }
        else {
            return {name: 'notused', val: 255, desc:'NOT USED'}
        }
    }    
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const currentPump = () =>{
        return props.options.pumps.find(p => p.id === props.currentPumpId); 
    }
    const currentCircuit = () =>{
        let circ = currentPump()?.circuits.find(circ => circ.id === props.currentPumpCircuitId);
        if (typeof circ === 'undefined') return {id: props.currentPumpCircuitId, circuit: 255}
        else return circ;
    }
    const handleClick = ( event: any ) =>
    {
        console.log( `changing  circuitSlot=${ currentCircuit().id } type to circuit ${ event.target.value } (${ getItemById(props.options.circuits, parseInt(event.target.value, 10)) .name })` )
        let data:IConfigPump[] = extend(true, [], props.options.pumps);
        let pump = data.find(p=>p.id === props.currentPumpId)
        let idx = pump.circuits.findIndex(circ => circ.id === props.currentPumpCircuitId);
        if (idx >= 0) {
            pump.circuits[idx].circuit = parseInt(event.target.value,10);
        }
        else
        {
            pump.circuits.push({id: props.currentPumpCircuitId, circuit: parseInt(event.target.value,10), units: undefined})
        }    
        props.setPump(props.currentPumpId, data);
    }

    const circuitSelectors = () =>
    {
        let dropdownChildren: React.ReactFragment[] = [];
         props.options.circuits.forEach(circ => {
            if (circ.equipmentType === 'virtual' && circ.assignableToPumpCircuit === false) return;
            if (circ.equipmentType === 'lightGroup' as any) return;
            if (circ.name === notUsed().desc && (circ.equipmentType === 'circuit' || circ.equipmentType === 'feature')) return;
            let entry:React.ReactFragment = ( <DropdownItem key={`pump${props.currentPumpId}pumpcirc${ currentCircuit().id }circ${ circ.id }CircuitSelect`}
                value={circ.id}
                onClick={handleClick} 
            >{circ.name}</DropdownItem> )

            dropdownChildren.push( entry );
        }); 
        // let entry:React.ReactFragment = ( <DropdownItem key={`pump${props.currentPumpId}pumpcirc${ currentCircuit().id }circ${ circ.id }CircuitSelect`}
        //         value={circ.id}
        //         onClick={handleClick} 
        //         disabled={typeof circ.type === 'undefined' && circ.id !== notUsed().val}
        //     >{circ.name}</DropdownItem> )
            
        //     dropdownChildren.push( entry );
        return dropdownChildren;
    }
    const label = () => {
        if (currentCircuit()?.circuit === 0 || currentCircuit()?.circuit === notUsed().val) return notUsed().desc
        return props.options.circuits.find(c => c.id === currentCircuit().circuit)?.name;
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
            disabled={props.options.pumps.find(p => p.id === props.currentPumpId).type === 0}
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