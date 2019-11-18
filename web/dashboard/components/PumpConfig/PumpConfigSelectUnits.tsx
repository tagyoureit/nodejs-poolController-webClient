import {Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown} from "reactstrap";
import {comms} from "../Socket_Client";
import * as React from "react";
import {IStatePumpCircuit, IDetail, getItemByAttr} from "../PoolController";

interface Props {
    //   rate: number;
    currentPump: number;
    boardUnits: IDetail[];
    currentPumpCircuitState: IStatePumpCircuit;
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
        console.log(`changing pump ${this.props.currentPump} circuitSlot ${this.props.currentPumpCircuitState} type to ${event.target.value}`);
        comms.setPumpCircuit(this.props.currentPump, this.props.currentPump, {units: event.target.value});
    }

    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }
    render() {
        return (
            <ButtonDropdown
                size="sm"
                className="mb-1 mt-1"
                isOpen={this.state.dropdownOpen}
                toggle={this.toggle}
            >
                <DropdownToggle caret>
                    {`${this.props.currentPumpCircuitState.speed||this.props.currentPumpCircuitState.flow} ${this.props.currentPumpCircuitState.units.desc}`}
                </DropdownToggle>
                <DropdownMenu>
                    <DropdownItem value="0" onClick={this.handleClick}>
                        {`${getItemByAttr(this.props.boardUnits, 'val', '0').desc}`}
                    </DropdownItem>
                    <DropdownItem value="1" onClick={this.handleClick}>
                        {`${getItemByAttr(this.props.boardUnits, 'val', '1').desc}`}
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
        );
    }
}

export default PumpConfigSelectUnits;
