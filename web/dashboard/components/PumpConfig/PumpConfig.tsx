import {
    Row,
    Col,
    Container,
    Button,
    ButtonGroup,
    Nav,
    NavItem,
    Dropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu,
    NavLink,
    ButtonDropdown
} from "reactstrap";
import * as React from "react";
import PumpConfigPumpCircuit from "./PumpConfigPumpCircuit";
import PumpConfigSelectType from "./PumpConfigSelectType";
import {comms} from "../Socket_Client";

import {
    IConfigPump,
    IStatePump,
    IDetail
} from "../PoolController";

interface Props {
    pumpConfig: IConfigPump;
    currentPumpNum: number;
    pumpState: IStatePump;
    availableCircuits: {id: number; name: string; type: string}[];
    pumpTypes: any;
}
interface State {
    pumpUnits: IDetail[];
    disabled: boolean[];  // 1, 2, 3...8 flag
}
class PumpConfig extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        let tmpPump = typeof this.props.currentPumpNum==="undefined" ? 1 : this.props.currentPumpNum;
        this.getPumpUnits(tmpPump);
        this.state={
            pumpUnits: [{val: 0, desc: 'RPM', name: 'rpm'}],
            disabled: [ false, false, false, false, false, false, false, false]
        };
        this.getPumpUnits = this.getPumpUnits.bind(this);
        this.setPumpCircuit = this.setPumpCircuit.bind(this);
        this.deletePumpCircuit = this.deletePumpCircuit.bind(this);
        this.setPumpType = this.setPumpType.bind(this);
    }
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.currentPumpNum !== this.props.currentPumpNum) {
            this.getPumpUnits(this.props.currentPumpNum);
        }

        if (JSON.stringify(prevProps.currentPumpCircuit) !== JSON.stringify(this.props.pumpState) && prevState.disabled.reduce((prev,curr)=> prev || curr) === true) {
            this.setState({disabled: [ false, false, false, false, false, false, false, false]})
        }
    }
     getPumpUnits(pump) {
        fetch(`http://localhost:4200/config/pump/${pump}/units`)
        .then(res => res.json())
        .then(
            result => {
                this.setState( {
                    pumpUnits: result
                } )
            },
            error => {
                console.log(error);
            }
        );
    }
    setPumpCircuit(pumpCircuit: number, obj: any){
        console.log(`changing pump ${this.props.currentPumpNum} circuitSlot ${pumpCircuit} to ${JSON.stringify(obj,null,2)}`);
        comms.setPumpCircuit(this.props.currentPumpNum, pumpCircuit, obj);
        this.disablePumpCircuit(pumpCircuit-1);
    }
    deletePumpCircuit(pumpCircuit: number){
        comms.deletePumpCircuit(this.props.currentPumpNum, pumpCircuit)
        this.disablePumpCircuit(pumpCircuit-1);
    }
    disablePumpCircuit(pumpCircuit: number){
        this.setState((prevState)=>{
            let arrDisabled = prevState.disabled.slice();
            arrDisabled[pumpCircuit] = true;
            return { disabled: arrDisabled } 
        })
    }
    setPumpType(pumpType: number){
        comms.setPump(this.props.currentPumpNum, pumpType)
        this.setState({disabled: [ true, true, true, true, true, true, true, true]})
    }
     render() {
        return (
            <Container>
                <Row>
                    <Col>
                        Type{" "}
                        <PumpConfigSelectType
                            currentPumpState={this.props.pumpState}
                            pumpTypes={this.props.pumpTypes}
                            onChange={this.setPumpType}
                        />
                    </Col>
                </Row>
                {this.props.pumpState.type.name==='none'?`Select a pump type to edit circuits`:
           <div>
                 <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[0]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit} 
                    disabled={this.state.disabled[0] || this.props.pumpState.type.name==='none'}
                    />
                    <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[1]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit} 
                    disabled={this.state.disabled[1] || this.props.pumpState.type.name==='none'}/> 
                    <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[2]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit} 
                    disabled={this.state.disabled[2] || this.props.pumpState.type.name==='none'}/> 
                    <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[3]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit} 
                    disabled={this.state.disabled[3] || this.props.pumpState.type.name==='none'}/> 
                    <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[4]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit}                     
                    disabled={this.state.disabled[4] || this.props.pumpState.type.name==='none'}
                    /> 
                    <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[5]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit}                     
                    disabled={this.state.disabled[5] || this.props.pumpState.type.name==='none'}
                    /> 
                    <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[6]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit}                     
                    disabled={this.state.disabled[6] || this.props.pumpState.type.name==='none'}
                    /> 
                    <PumpConfigPumpCircuit 
                    availableCircuits={this.props.availableCircuits}
                    currentPumpCircuit={this.props.pumpState.circuits[7]}
                    pumpType={this.props.pumpState.type.name}
                    pumpUnits={this.state.pumpUnits}
                    onChange={this.setPumpCircuit}
                    onDelete={this.deletePumpCircuit} 
                    disabled={this.state.disabled[7] || this.props.pumpState.type.name==='none'}/> 

                    </div>
        }
            </Container>
        );
    }
}

export default PumpConfig;
