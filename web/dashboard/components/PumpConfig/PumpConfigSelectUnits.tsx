import {Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown} from "reactstrap";
//import {comms} from "../Socket_Client";
import * as React from "react";
import {IStatePumpCircuit, IDetail, getItemByAttr} from "../PoolController";

interface Props {
    disabled: boolean
    pumpUnits: IDetail[];
    currentPumpCircuit: IStatePumpCircuit;
    onChange: (pumpCircuit: number, obj: any)=>void
    pumpType: string
}
interface State {
    dropdownOpen: boolean;
}

class PumpConfigSelectUnits extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.toggle=this.toggle.bind(this);
        this.handleClick=this.handleClick.bind(this);
        this.state={dropdownOpen: false};
    }

    handleClick(event: any) {
        console.log(`changing circuitSlot ${this.props.currentPumpCircuit} type to ${event.target.value}`);
        //comms.setPumpCircuit(this.props.currentPump, this.props.currentPump, {units: event.target.value});
        this.props.onChange(this.props.currentPumpCircuit.id, {units: parseInt(event.target.value,10)})
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }
    render() {
        return (
            <div>
            {this.props.pumpType==='vsf'?
            <ButtonDropdown
                size="sm"
                className="mb-1 mt-1"
                isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
            >
                <DropdownToggle 
                disabled={this.props.disabled}
                caret>
                    {`${this.props.currentPumpCircuit.speed||this.props.currentPumpCircuit.flow} ${this.props.currentPumpCircuit.units.desc}`}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem value="0" onClick={this.handleClick}>
                        {`${getItemByAttr(this.props.pumpUnits, 'val', '0').desc}`}
                    </DropdownItem>
                    <DropdownItem value="1" onClick={this.handleClick}>
                        {`${getItemByAttr(this.props.pumpUnits, 'val', '1').desc}`}
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
            :this.props.currentPumpCircuit.circuit.id>0?`${this.props.currentPumpCircuit.speed||this.props.currentPumpCircuit.flow} ${this.props.currentPumpCircuit.units.desc}`:''}
            </div>
        );
    }
}

export default PumpConfigSelectUnits;
