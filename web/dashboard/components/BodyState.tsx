import * as React from 'react';
import
{
    Row, Col, Button, ButtonGroup, ListGroup, ListGroupItem
} from 'reactstrap';
import CustomCard from './CustomCard'
import Slider from 'react-rangeslider'
import 'react-rangeslider/lib/index.css'
import { comms } from './Socket_Client'
import { IDetail, IStateTempBodyDetail, getItemById } from './PoolController';
var extend=require("extend");
const flame = require( '../images/flame.png' );

interface Props
{
    id: string;
    visibility: string;
}
interface State {
    UOM: IDetail;
    data: IStateTempBodyDetail[];
    setPointBody1: number;
    setPointBody2: number;
    setPointBody3: number;
    setPointBody4: number;
}
class BodyState extends React.Component<Props, State>
{
    constructor( props: Props )
    {
        super( props )
        this.state = {
            data: [],
            UOM: undefined,
            setPointBody1: 0,
            setPointBody2: 0,
            setPointBody3: 0,
            setPointBody4: 0
        }
        this.changeHeat = this.changeHeat.bind( this );
        this.handleOnOffClick = this.handleOnOffClick.bind( this );
        this.changeSetPointVal = this.changeSetPointVal.bind( this );
        this.changeSetPointComplete = this.changeSetPointComplete.bind( this );
    }
    incoming() {
        let self=this;
        comms.passthrough((d: any, which: string): void => {
            if(which==='temps') {
                self.setState({ data: d.bodies });
            }
            if(which==='body'){
                let bodies=extend(true, [], this.state.data);
                let index=this.state.data.findIndex(el => {
                    return el.id===d.id;
                });
                index===-1? bodies.push(d):bodies[index]=d;
                this.setState({data: bodies });   
            }
        });
    }
    componentDidMount() {
        this.incoming();
        fetch(`${comms.poolURL}/state/temps`)
            .then(res => res.json())
            .then(result =>{
               this.setState({data: result.bodies, UOM: result.units}, function(){
                   console.log('finished setting bodies and UOM');
               }) 
            })
    }
    changeHeat = ( id: number, mode: number ) =>
    {
        comms.setHeatMode( id, mode )
    }
    changeSetPointVal = ( setPoint: number, body: number ) =>
    {
        if ( this.state[ 'setPointBody' + body ] !== setPoint )
        {
            this.setState( {[ 'setPointBody' + body]: setPoint} as Pick<State, any>);
        }
    };
    changeSetPointComplete = ( body: number ) =>
    {
        comms.setHeatSetPoint( body, this.state[ 'setPointBody' + body ] )
    }
    handleOnOffClick = ( event: any ) =>
    {
        comms.toggleCircuit( event.target.value )
    }

    bodyDisplay = () =>
    {
        return this.state.data && this.state.data.map( body =>
        {
            const low = this.state.UOM.val === 0 ? 50 : 10;
            const high = this.state.UOM.val === 0 ? 104 : 43;
            const labelStr = `{"${ low }": "${ low }", "${ high }": "${ high }"}`
            let labels = JSON.parse( labelStr )
            const showFlameSolar = () =>
            {
                if ( body.isOn && body.heatStatus.val === 2 )
                {
                    return ( <img src={flame} /> )
                }
            }
            const showFlameHeater = () =>
            {
                if ( body.isOn && body.heatStatus.val === 1 )
                {
                    return ( <img src={flame} /> )
                }
            }
            return ( <ListGroupItem key={body.id + 'BodyKey'}> <Row>
                <Col>{body.name}
                </Col>
                <Col>
                    <Button color={body.isOn ? 'success' : 'primary'}
                        onClick={this.handleOnOffClick} value={body.circuit}  >
                        {body.isOn ? "On" : "Off"}
                    </Button>

                </Col>
            </Row>
                <Row>
                    <Col>Temp</Col>
                    <Col >
                        {body.temp}
                        {body.isOn ? `` : ` (Last)`}
                    </Col>
                </Row>
                <Row>
                    <Col>

                        <Slider
                            min={low}
                            max={high}
                            labels={labels}
                            value={this.state[ 'setPointBody' + body.id ] === 0 ? body.setPoint : this.state[ 'setPointBody' + body.id ]}
                            data-bodyid={body.id}
                            onChange={( setPoint ) => this.changeSetPointVal( setPoint, body.id )}
                            onChangeComplete={() => this.changeSetPointComplete( body.id )}
                        />
                        <div className='text-center'>
                            Set Point: {body.setPoint}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Heater Mode
                                <div className='d-flex justify-content-center'>
                            <ButtonGroup >
                                <Button onClick={() => this.changeHeat( body.id, 0 )} color={body.heatMode.val === 0 ? 'success' : 'secondary'}>Off</Button>
                                <Button onClick={() => this.changeHeat( body.id, 1 )} color={body.heatMode.val === 1 ? 'success' : 'secondary'}>Heater{' '}{showFlameHeater()}</Button>
                                <Button onClick={() => this.changeHeat( body.id, 2 )} color={body.heatMode.val === 2 ? 'success' : 'secondary'}>Solar Pref</Button>
                                <Button onClick={() => this.changeHeat( body.id, 3 )} color={body.heatMode.val === 3 ? 'success' : 'secondary'}>Solar{' '}{showFlameSolar()}</Button>
                            </ButtonGroup>
                        </div>
                    </Col>
                </Row>
            </ListGroupItem>
            )
        } )
    }
    render ()
    {
        return (
            <div className='tab-pane active' id={this.props.id} role="tabpanel" aria-labelledby={this.props.id + '-tab'} >
                <CustomCard name={( this.state.data && this.state.data.length === 1 ? 'Body' : 'Bodies' )} id={this.props.id} visibility={this.props.visibility}>
                    <ListGroup flush >
                        {this.bodyDisplay()}
                    </ListGroup>
                </CustomCard>
            </div>
        )
    }
}

export default BodyState;