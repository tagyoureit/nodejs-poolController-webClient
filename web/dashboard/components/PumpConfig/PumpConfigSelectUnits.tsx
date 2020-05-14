import {Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown} from "reactstrap";
//import {comms} from "../Socket_Client";
import React, {useEffect, useState} from "react";
import {IStatePumpCircuit, IDetail, getItemByAttr, IConfigPumpCircuit, getItemByVal} from "../PoolController";

interface Props {
    disabled: boolean
    pumpUnits: IDetail[];
    currentPumpCircuit: IConfigPumpCircuit;
    onChange: (pumpCircuit: number, obj: any)=>void
    pumpType: string
}
interface State {
    dropdownOpen: boolean;
}

function PumpConfigSelectUnits(props:Props) {
/*     constructor(props: Props) {
        super(props);
        toggle=toggle.bind(this);
        handleClick=handleClick.bind(this);
        state={dropdownOpen: false};
    } */

    const [dropdownOpen, setDropdownOpen] = useState(false);
    useEffect(() => {
        let unit=getItemByVal(props.pumpUnits, props.currentPumpCircuit.units);

    }, [JSON.stringify(props.currentPumpCircuit)])

    const handleClick = (event: any) => {
        console.log(`changing circuitSlot ${props.currentPumpCircuit} type to ${event.target.value}`);
        //comms.setPumpCircuit(props.currentPump, props.currentPump, {units: event.target.value});
        props.onChange(props.currentPumpCircuit.id, {units: parseInt(event.target.value,10)})
    }

    const toggle= () => {
            setDropdownOpen(!dropdownOpen);
    }
  
        return (
            <div>
            {props.pumpType==='vsf'?
            <ButtonDropdown
                size="sm"
                className="mb-1 mt-1"
                isOpen={dropdownOpen}
                toggle={toggle}
            >
                <DropdownToggle 
                disabled={props.disabled}
                caret>
                    {`${props.currentPumpCircuit.speed||props.currentPumpCircuit.flow} ${getItemByVal(props.pumpUnits, props.currentPumpCircuit.units).desc}`}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem value="0" onClick={handleClick}>
                        {props.pumpUnits[0].desc}
                    </DropdownItem>
                    <DropdownItem value="1" onClick={handleClick}>
                        {props.pumpUnits[1].desc}
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
            :props.currentPumpCircuit.circuit>0?`${props.currentPumpCircuit.speed||props.currentPumpCircuit.flow} ${getItemByVal(props.pumpUnits, props.currentPumpCircuit.units).desc}`:''}
            </div>
        );
    
}

export default PumpConfigSelectUnits;
