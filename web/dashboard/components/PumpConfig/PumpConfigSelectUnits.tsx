import React, { useContext, useEffect, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

import { IConfigPump, PoolContext } from '../PoolController';
import { ConfigOptionsPump } from './PumpConfigModalPopup';

//import {comms} from "../Comms";
var extend = require("extend");
interface Props {
    // disabled: boolean
    // pumpUnits: IDetail[];
    currentPumpCircuitId: number;
    // onChange: (pumpCircuit: number, obj: any)=>void
    // pumpType: string
    currentPumpId: number;
    // pumpType: string
    // pumpUnits: IDetail[]
    // disabled: boolean
    options: ConfigOptionsPump
    setPump: (currentPumpId: number, data:any) => void
}
interface State {
    dropdownOpen: boolean;
}

function PumpConfigSelectUnits(props:Props) {
    const { controllerType} = useContext(PoolContext);

        const notUsed = () => {
        if (controllerType.toLowerCase().includes('touch')){
            return props.options.circuitNames.find(c=>c.name === 'notused');
        }
        else {
            return {name: 'notused', val: 255, desc:'NOT USED'}
        }
    }  
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleClick = (event: any) => {
        let data:IConfigPump[] = extend(true, [], props.options.pumps);
        let circ = data.find(p=>p.id === props.currentPumpId).circuits.find(circ => circ.id === props.currentPumpCircuitId)
        circ.units = parseInt(event.target.value,10) as 0 | 1;
        props.setPump(props.currentPumpId, data);
    }

    const currentPump = () =>{
        return props.options.pumps.find(p => p.id === props.currentPumpId); 
    }
    const currentCircuit = () =>{
        let circ = currentPump().circuits.find(circ => circ.id === props.currentPumpCircuitId);
        if (typeof circ === 'undefined') circ = {id: props.currentPumpCircuitId, circuit: 255, units: undefined}
            if (currentPump().minFlow ) {
                if (typeof circ.flow === 'undefined') circ.flow = 30;
                if (typeof circ.units === 'undefined') circ.units = props.options.pumpUnits.find(u => u.name === 'gpm').val as 0|1
            }
            else {
                if (typeof circ.speed === 'undefined') circ.speed = 1000;
                if (typeof circ.units === 'undefined') circ.units = props.options.pumpUnits.find(u => u.name === 'rpm').val as 0|1
            }
            // return {id: props.currentPumpCircuitId, circuit: 255, flow: 30, units: props.options.pumpUnits.find(u => u.name === 'gpm').val}
            // else return {id: props.currentPumpCircuitId, circuit: 255, speed: 1000, units: props.options.pumpUnits.find(u => u.name === 'rpm').val}
        return circ;
    }
    const units = () => {
        let units = props.options.pumpUnits.find(unit => unit.val === currentCircuit()?.units);
        if (typeof units === 'undefined'){
            if (currentPump().maxFlow > 0) return props.options.pumpUnits.find(unit => unit.name === 'gpm');
            if (currentPump().maxSpeed > 0) return props.options.pumpUnits.find(unit => unit.name === 'rpm');
        }
        return units
    }

    const toggle= () => {
            setDropdownOpen(!dropdownOpen);
    }
  
        return !(currentCircuit().circuit === 255) && !(props.options.circuits.find(c => c.id === currentCircuit().circuit)?.name === notUsed().desc) ? (
            <div>

            {props.options.pumpTypes.find(type => type.val === props.options.pumps.find(p => p.id === props.currentPumpId).type).name==='vsf'?
            (typeof currentCircuit() !== 'undefined' && 
            <ButtonDropdown
                size="sm"
                className="mb-1 mt-1"
                isOpen={dropdownOpen}
                toggle={toggle}
            >
                <DropdownToggle 
                disabled={props.options.pumps.find(p => p.id === props.currentPumpId).type === 0}
                caret>
                    {`${currentCircuit()?.speed||currentCircuit()?.flow} ${units().desc}`}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem value="0" onClick={handleClick}>
                        {props.options.pumpUnits[0].desc}
                    </DropdownItem>
                    <DropdownItem value="1" onClick={handleClick}>
                        {props.options.pumpUnits[1].desc}
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>)
            : `${currentCircuit().speed||currentCircuit().flow}  ${units().desc}`}
            </div>
        ) : <></>;
    
}

export default PumpConfigSelectUnits;
