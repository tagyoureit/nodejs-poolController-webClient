import
{
    Row, Col, Container, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, ButtonDropdown
} from 'reactstrap';
import CustomCard from '../CustomCard'
import * as React from 'react';
import '../../css/dropdownselect'
import { comms } from '../Socket_Client'
import { getItemById, IStatePump, IStatePumpCircuit, IDetail } from '../PoolController';
import PumpConfigSelectUnits from './PumpConfigSelectUnits';
import PumpConfigSelectCircuit from "./PumpConfigSelectCircuit";
import PumpConfigSelectSpeedSlider from "./PumpConfigSelectSpeedSlider";
interface Props
{
    availableCircuits: { id: number, name: string, type: string }[];
    currentPumpCircuit: IStatePumpCircuit
    pumpType: string
    pumpUnits: IDetail[]
    disabled: boolean
    onChange: (pumpCircuit: number, obj: any)=>void
    onDelete: (pumpCircuit: number)=>void
}
interface State
{

}

class PumpConfigPumpCircuit extends React.Component<Props, State> {

    constructor( props: Props )
    {
        super( props )
    }
   
    render ()
    {
        return (
            <div>
                <Row >
                    <Col className="col-4">
                        Circuit{" "}
                        <PumpConfigSelectCircuit
                            availableCircuits={this.props.availableCircuits}
                            currentPumpCircuit = {this.props.currentPumpCircuit}
                            onChange={this.props.onChange}
                            onDelete={this.props.onDelete}
                            disabled={this.props.disabled}
                        />
                    </Col>
                    <Col className="col">
                        <PumpConfigSelectSpeedSlider
                            currentPumpCircuit={this.props.currentPumpCircuit}
                            onChange={this.props.onChange}
                            disabled={this.props.disabled}
                        />
                    </Col>
                    <Col className="col-3">
                  <PumpConfigSelectUnits
                        currentPumpCircuit={this.props.currentPumpCircuit}
                        pumpUnits={this.props.pumpUnits}
                        onChange={this.props.onChange}
                        pumpType={this.props.pumpType}
                        disabled={this.props.disabled}
                        />  
                        </Col>
                        </Row>
            </div>
        )
    }
}

export default PumpConfigPumpCircuit;