import
{
    Row, Col
} from 'reactstrap';
import CustomCard from '../CustomCard'
import * as React from 'react';
import '../../css/dropdownselect'
import { useAPI } from '../Comms'
import { getItemById, IStatePump, IStatePumpCircuit, IDetail, IConfigCircuit, IConfigPumpCircuit, IConfigPump } from '../PoolController';
import PumpConfigSelectUnits from './PumpConfigSelectUnits';
import PumpConfigSelectCircuit from "./PumpConfigSelectCircuit";
import PumpConfigSelectSpeedSlider from "./PumpConfigSelectSpeedSlider";
import { ConfigOptionsPump } from './PumpConfigModalPopup';
interface Props
{
    currentPumpCircuitId: number
    currentPumpId: number;
    options: ConfigOptionsPump
    setPump: (currentPumpId: number, data:any) => void
}

function PumpConfigPumpCircuit(props:Props) {

        return (
            <div>
                <Row >
                    <Col className="col-4" style={{margin:'auto'}}>
                        Circuit{" "}
                        <PumpConfigSelectCircuit
                            currentPumpId={props.currentPumpId}
                            currentPumpCircuitId = {props.currentPumpCircuitId}
                            setPump={props.setPump}
                            options={props.options}
                        />
                    </Col>
                    <Col className="col">
                        <PumpConfigSelectSpeedSlider
                            currentPumpId={props.currentPumpId}
                            currentPumpCircuitId={props.currentPumpCircuitId}
                            options={props.options}
                            setPump={props.setPump}
                        />
                    </Col>
                    <Col className="col-3" style={{margin:'auto'}}>
                  <PumpConfigSelectUnits
                        currentPumpId={props.currentPumpId}
                        currentPumpCircuitId={props.currentPumpCircuitId}
                        options={props.options}
                        setPump={props.setPump}
                        />  
                        </Col>
                        </Row>
            </div>
        )
    
}

export default PumpConfigPumpCircuit;