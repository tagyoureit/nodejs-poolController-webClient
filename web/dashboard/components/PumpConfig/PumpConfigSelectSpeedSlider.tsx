import {Container, Row, Col, Button} from 'reactstrap'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import '../../css/rangeslider.css'
import * as React from 'react';
import {comms} from '../../components/Socket_Client'
import {IStatePumpCircuit, getItemByAttr} from '../PoolController';

interface Props {
    disabled: boolean
    currentPumpCircuit: IStatePumpCircuit
    onChange: (pumpCircuit: number, obj: any) => void
}

interface State {
    desiredRate: number
    isGPM: boolean
}

class PumpConfigSelectSpeedSlider extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        console.log(this.props.currentPumpCircuit)
        this.state={
            desiredRate: this.props.currentPumpCircuit.speed||this.props.currentPumpCircuit.flow||0,
            isGPM: this.props.currentPumpCircuit.units.desc==='GPM'
        }
        this.onChangeSpeed=this.onChangeSpeed.bind(this)
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (JSON.stringify(prevProps.currentPumpCircuit)!==JSON.stringify(this.props.currentPumpCircuit) )
            this.setState({
                desiredRate: this.props.currentPumpCircuit.speed||this.props.currentPumpCircuit.flow||0,
                isGPM: this.props.currentPumpCircuit.units.desc==='GPM'
            })
    }

    onChangeSpeed=(_speed: number) => {
        this.setState(() => {
            return {
                desiredRate: _speed,
            }
        })
    }

    onChangeComplete=() => {
        console.log(`changing currentSpeed=${this.props.currentPumpCircuit.flow||this.props.currentPumpCircuit.speed} ${this.props.currentPumpCircuit.units.desc} currentPumpCircuit=${this.props.currentPumpCircuit.id} to speed ${this.state.desiredRate}`)

        // comms.setPumpCircuit( this.props.currentPump, this.props.currentPumpCircuitState.id, {rate: this.state.desiredRate} )
        this.props.onChange(this.props.currentPumpCircuit.id, {rate: this.state.desiredRate})
    }

    render() {

        const customLabels=() => {
            if(this.props.currentPumpCircuit.units.desc==='GPM') {
                return {15: "15", 130: "130"}
            }
            else {
                return {450: "450", 3450: "3450"};
            }
        }
        if(this.props.currentPumpCircuit.circuit.id>0)
            return (

                <Slider
                    disabled={this.props.disabled}
                    value={this.state.desiredRate}
                    onChange={this.onChangeSpeed}
                    onChangeComplete={this.onChangeComplete}
                    min={this.state.isGPM? 15:450}
                    max={this.state.isGPM? 130:3450}
                    step={this.state.isGPM? 1:10}
                    labels={customLabels()}
                />

            )
        else return (< div />)
    }
}

export default PumpConfigSelectSpeedSlider;