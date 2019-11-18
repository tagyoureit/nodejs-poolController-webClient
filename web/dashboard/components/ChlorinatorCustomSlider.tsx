import { Container, Row, Col, Button } from 'reactstrap'
import { comms } from './Socket_Client'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import '../css/rangeslider.css'
import * as React from 'react';
import { IStateChlorinator, IState, getItemById, IConfigChlorinator } from './PoolController'

interface Props{
    chlorState: IStateChlorinator,
    chlorConfig: IConfigChlorinator
    maxBodies: number
}

interface State
{
  poolSetpoint: number;
  spaSetpoint: number;
  superChlorHours: number;
}

class ChlorinatorCustomSlider extends React.Component<Props, State> {
  constructor( props: Props )
  {
    super( props )

    this.state = { 
        poolSetpoint: this.props.chlorState.poolSetpoint || 0,
        spaSetpoint: this.props.chlorState.spaSetpoint || 0,
        superChlorHours: this.props.chlorState.superChlorHours || 0 
    } 
    this.onChangePool = this.onChangePool.bind( this )

  }

/*   componentDidMount ()
  {
    this.setState( { 
        poolSetpoint: this.props.chlorState.poolSetpoint || 0,
        spaSetpoint: this.props.chlorState.spaSetpoint || 0,
        superChlorHours: this.props.chlorState.superChlorHours || 0 
    } )
  }
 */
  componentDidUpdate ( prevProps: Props )
  {
    if ( prevProps.chlorState.poolSetpoint !== this.props.chlorState.poolSetpoint
    )
      this.setState( { poolSetpoint: this.props.chlorState.poolSetpoint } )

      if (this.props.maxBodies > 1)
    if ( prevProps.chlorState.spaSetpoint !== this.props.chlorState.spaSetpoint
    )
      this.setState( { spaSetpoint: this.props.chlorState.spaSetpoint } )

    if ( prevProps.chlorState.superChlorHours !== this.props.chlorState.superChlorHours
    )
      this.setState( { superChlorHours: this.props.chlorState.superChlorHours } )
  }

  onChangePool = ( poolLvl: number ) =>
  {
    this.setState( () =>
    {
      return {
        poolSetpoint: poolLvl,
      }
    } )
  }

  onChangeSpa = ( spaLvl: number ) =>
  {
    this.setState( () =>
    {
      return {
        spaSetpoint: spaLvl,
      }
    } )
  }

  onChangeSuperChlor = ( hours: number ) =>
  {
    this.setState( () =>
    {
      return {
        superChlorHours: hours
      }
    } )
  }

  onChangeComplete = () =>
  {
    comms.setChlor( this.props.chlorState.id, this.state.poolSetpoint, this.state.spaSetpoint || 0, this.state.superChlorHours )
  }

  // Todo: don't show Spa in single body of water
  render ()
  {
    const heightStyle = {
      height: '300px'
    }
    const customPercentLabels = { 0: "Off", 50: "50%", 100: "100%" };
    const customTimeLabels = { 0: "Off", 12: "12", 24: "24" };

    return (

      <div>
        <Container style={heightStyle} >
          <Row>
          <Col>
            Pool
                <Slider
                  labels={customPercentLabels}
                  value={this.state.poolSetpoint}
                  onChange={this.onChangePool}
                  onChangeComplete={this.onChangeComplete}
                />
            </Col>
          </Row>
          <Row>
          <Col style={{ paddingTop: '25px' }}>
            Spa
                <Slider
                  labels={customPercentLabels}
                  value={this.state.spaSetpoint}
                  onChange={this.onChangeSpa}
                  onChangeComplete={this.onChangeComplete}
                />
            </Col>
          </Row>
          <Row>
            <Col style={{ paddingTop: '25px' }}>
            Super Chlorinate Hours
              <div className='custom-labels'>
                <Slider
                  min={0}
                  max={24}
                  labels={customTimeLabels}
                  value={this.state.superChlorHours}
                  onChange={this.onChangeSuperChlor}
                  onChangeComplete={this.onChangeComplete}
                />
              </div>
            </Col>
          </Row>

        </Container>

      </div >

    )
  }
}

export default ChlorinatorCustomSlider;