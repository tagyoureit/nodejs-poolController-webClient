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
import PumpConfigSelectType from "./PumpConfigSelectType";
import PumpConfigSelectCircuit from "./PumpConfigSelectCircuit";
import PumpConfigSelectUnits from "./PumpConfigSelectUnits";
import PumpConfigSelectSpeedSlider from "./PumpConfigSelectSpeedSlider";
import {
    IConfigPump,
    getItemById,
    IConfigPumpCircuit,
    IStatePumpCircuit,
    IStatePump,
    getItemByAttr,
    equipmentType,
    IDetail
} from "../PoolController";

interface Props {
    pumpConfig: IConfigPump;
    currentPumpNum: number;
    pumpState: IStatePump;
    condensedCircuitsAndFeatures: {id: number; name: string; type: string}[];
    pumpTypes: any;
}
interface State {
    // currentPumpNum: number;
    pumpUnits: IDetail[];
}
class PumpConfigTabs extends React.Component<Props, State> {
    private _boardUnits;
    private _pumpUnits;
    constructor(props: Props) {
        super(props);
        let tmpPump = typeof this.props.currentPumpNum==="undefined" ? 1 : this.props.currentPumpNum;
        this.getPumpUnits(tmpPump);
        this.state={
            // currentPumpNum: tmpPump,
            pumpUnits: [{val: 0, desc: 'RPM', name: 'rpm'}]
        };
        this.getPumpUnits = this.getPumpUnits.bind(this);
    }
    componentDidUpdate(prevProps, prevState) {
        if(prevProps.currentPumpNum !== this.props.currentPumpNum) {
            this.getPumpUnits(this.props.currentPumpNum);
            // this.setState({
            //     currentPumpNum: this.props.currentPumpNum
            // });
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
    render() {
        const CircuitSelectors= () => {
            if(this.props.pumpState.type.name==='none')
                return <div>Select a pump type to edit circuits</div>;
            const circRows: React.ReactFragment[]=[];
            for(let idx=1;idx<=8;idx++) {
                let pumpCircuitState: IStatePumpCircuit=getItemById(this.props.pumpState.circuits, idx);
                if(!pumpCircuitState) {
                    if(this.state.pumpUnits.length === 1)
                        pumpCircuitState={id: idx, circuit: {id: 0, isOn: false, showInFeatures: false, name: 'Not Used', equipmentType: equipmentType.circuit}, speed: 0, flow: 0, units: this.state.pumpUnits[0]};
                    else
                        pumpCircuitState={id: idx, circuit: {id: 0, isOn: false, showInFeatures: false, name: 'Not Used', equipmentType: equipmentType.circuit}, flow: 0, units: getItemByAttr(this.state.pumpUnits, 'name', 'rpm')};
                }
                let unitsDisplayOrSelect: React.ReactFragment=`${pumpCircuitState.speed||pumpCircuitState.flow} ${pumpCircuitState.units.desc}`;
                if(this.props.pumpState.type.name==='vsf') {
                    unitsDisplayOrSelect=(
                        <PumpConfigSelectUnits
                            currentPumpCircuitState={pumpCircuitState}
                            currentPump={this.props.currentPumpNum}
                            // pumpConfigId={pumpCircuitState.id}
                            // rate={pumpCircuitConfig.units? pumpCircuitConfig.flow:pumpCircuitConfig.speed}
                            boardUnits={this._boardUnits}
                        />
                    );
                }
                circRows.push(
                    <Row key={`${this.props.currentPumpNum}${pumpCircuitState.circuit.id}${idx}`}>
                        <Col className="col-4">
                            Circuit{" "}
                            <PumpConfigSelectCircuit
                                currentPumpState={this.props.pumpState}
                                currentCircuitSlotNumber={pumpCircuitState.id}
                                condensedCircuitsAndFeatures={
                                    this.props.condensedCircuitsAndFeatures
                                }
                            />
                        </Col>
                        <Col className="col">
                            <PumpConfigSelectSpeedSlider
                                currentPump={this.props.currentPumpNum}
                                currentPumpCircuitState={pumpCircuitState}
                            // currentCircuitSlotNum={pumpCircuitConfig.id}
                            />
                        </Col>
                        <Col className="col-3">{unitsDisplayOrSelect}</Col>
                    </Row>
                );
            }
            return circRows;
        };
        return (
            <Container>
                <Row>
                    <Col>
                        Type{" "}
                        <PumpConfigSelectType
                            currentPumpState={this.props.pumpState}
                            pumpTypes={this.props.pumpTypes}
                        />
                    </Col>
                </Row>
                {CircuitSelectors()}
            </Container>
        );
    }
}

export default PumpConfigTabs;
