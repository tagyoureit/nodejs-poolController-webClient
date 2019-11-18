import { Container, Row, Col, Button } from 'reactstrap'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import '../../css/rangeslider.css'
import * as React from 'react';
import { comms } from '../../components/Socket_Client'
import {IStatePumpCircuit, getItemByAttr} from '../PoolController';

interface Props
{
  currentPump: number;
  currentPumpCircuitState: IStatePumpCircuit
//   currentCircuitSlotNum: number
}

interface State
{
  desiredRate: number
  currentSpeed: number
  isGPM: boolean
}

class PumpConfigSelectSpeedSlider extends React.Component<Props, State> {
    constructor( props: Props )
  {
    super( props )
    this.state = {
      desiredRate: this.props.currentPumpCircuitState.speed || this.props.currentPumpCircuitState.flow || 0,
      currentSpeed: this.props.currentPumpCircuitState.speed || this.props.currentPumpCircuitState.flow || 0,
      isGPM: this.props.currentPumpCircuitState.units.desc === 'GPM'
    }
    this.onChangeSpeed = this.onChangeSpeed.bind( this )
  }

//   componentDidUpdate ( prevProps: Props )
//   {

//     if ( prevProps.currentSpeed !== this.props.currentSpeed
//     )
//       this.setState( { desiredSpeed: this.props.currentSpeed } )
//   }

  onChangeSpeed = ( _speed: number ) =>
  {
    this.setState( () =>
    {
      return {
        desiredRate: _speed,
      }
    } )
  }

  onChangeComplete = () =>
  {
    console.log( `changing pump=${ this.props.currentPump } currentSpeed=${ this.state.currentSpeed } ${this.props.currentPumpCircuitState.units.desc } currentPumpCircuit=${ this.props.currentPumpCircuitState.id } to speed ${ this.state.desiredRate }` )

    comms.setPumpCircuit( this.props.currentPump, this.props.currentPumpCircuitState.id, {rate: this.state.desiredRate} )
  }

  render ()
  {

    const customLabels = () =>
    {
      if ( this.props.currentPumpCircuitState.units.desc === 'GPM' )
      {
        return { 15: "15", 130: "130" }
      }
      else
      {
        return { 450: "450", 3450: "3450" };
      }
    }
    if (this.props.currentPumpCircuitState.circuit.id > 0)
    return (
     
       
                <Slider
          value={this.state.desiredRate}
          onChange={this.onChangeSpeed}
          onChangeComplete={this.onChangeComplete}
          min={this.state.isGPM ? 15 : 450}
          max={this.state.isGPM ? 130 : 3450}
          step={this.state.isGPM ? 1 : 10}
          labels={customLabels()}
        />
      
    )
    else return (< div />)
  }
}

export default PumpConfigSelectSpeedSlider;