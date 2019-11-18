import
{
    Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button, ListGroup, ListGroupItem
} from 'reactstrap';
import CustomCard from './CustomCard'
import 'react-rangeslider/lib/index.css'
import ChlorinatorCustomSlider from './ChlorinatorCustomSlider'
import * as React from 'react';
import { IStateChlorinator, getItemById, IConfigChlorinator } from './PoolController';
var extend = require( 'extend' );
interface Props
{
    chlorState: IStateChlorinator;
    chlorConfig: IConfigChlorinator;
    maxBodies: number;
    id: string;
    visibility: string;
}
interface State
{
    modal: boolean
    // currentChlor: IStateChlorinator
}

class Chlorinator extends React.Component<Props, State> {

    constructor( props: Props )
    {
        super( props )
        this.state = {
            modal: false,
            // currentChlor: extend(true,{},this.props.chlorState[1])
        };
        this.toggle = this.toggle.bind( this );
        this.toggleFromButton = this.toggleFromButton.bind( this );
    }
    toggle = () =>
    {
        // this will only be clicked when modal is open, so close it
        this.setState( {
            modal: false
        } );
    }
    toggleFromButton = ev =>
    {
        // open and close the modal from the individual chlor buttons.
        let target = parseInt(ev.currentTarget.value, 10)
        this.setState( () => ( {
            modal: !this.state.modal,
            currentChlor: getItemById(this.props.chlorState,target)
        } ));
    }

    chlorinator = () =>
    {
            let chlor = this.props.chlorState;
            let chlorStatus;
            if ( chlor.currentOutput >= 100 )
            {
                chlorStatus = `Super Chlorinate (${ chlor.superChlorHours } hours)`
            } else if ( chlor.currentOutput > 0 )
            {
                chlorStatus = 'On'
            }
            else
            {
                chlorStatus = 'Off'
            }
            return ( <ListGroup key={chlor.id + 'chlorlistgroup'}>
                <ListGroupItem >
                        <Row>
                        <Col xs="6">{chlor.name} ({chlor.id})</Col>
                            <Col>
                                <Button onClick={this.toggleFromButton} value={chlor.id} color={chlor.currentOutput > 0 ? 'success' : 'primary'}>{chlorStatus}</Button>
                            </Col>
                        </Row>

                        <Row>
                            <Col xs="6">Salt</Col>
                            <Col xs="6">{chlor.saltLevel} ppm</Col>
                        </Row>
                        <Row>
                            <Col xs="6">Current Output</Col>
                            <Col xs="6">{chlor.currentOutput} %</Col>
                        </Row>
                        <Row>
                            <Col xs="6">{this.props.maxBodies === 1 ? 'Pool Setpoint' : 'Pool/Spa Setpoint'}
                            </Col>
                            <Col xs="6">{this.props.maxBodies === 11 ? `${ chlor.poolSetpoint }%` : `${ chlor.poolSetpoint }% / ${ chlor.spaSetpoint }%`}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs="6">Status</Col>
                            <Col xs="6">{chlor.status.desc}</Col>
                        </Row>
                </ListGroupItem>
            </ListGroup> )
    }

    render ()
    {
        if (this.props.chlorConfig.isActive === false) return (<div />);
        const closeBtn = <button className="close" onClick={this.toggle}>&times;</button>;

        return (
            <div className="tab-pane active" id={this.props.id} role="tabpanel" aria-labelledby="chlorinator-tab">
                <CustomCard name='Chlorinator' id={this.props.id} visibility={this.props.visibility}>
                    {this.chlorinator()}
                </CustomCard>
                <Modal isOpen={this.state.modal} toggle={this.toggle} size='xl' >
                    <ModalHeader toggle={this.toggle} close={closeBtn}>Adjust Chlorinator Levels for ID:{this.props.chlorState.id}</ModalHeader>
                    <ModalBody>
                        <ChlorinatorCustomSlider 
                            chlorState= {this.props.chlorState}
                            chlorConfig= {this.props.chlorConfig}
                            maxBodies = {this.props.maxBodies}
                          />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.toggle}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default Chlorinator;