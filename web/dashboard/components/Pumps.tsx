
import
{
    Row, Col, Table, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, CardFooter, CardGroup,
    Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import CustomCard from './CustomCard'
import DateTime from './DateTime'
import * as React from 'react';
import PumpConfigModalPopup from './PumpConfig/PumpConfigModalPopup'
import { IStatePump, IConfigPump } from './PoolController';
import {comms} from './Socket_Client';

interface Props
{
    pumpStates: IStatePump[];
    pumpConfigs: IConfigPump[]
    id: string;
    visibility: string;
    // condensedCircuitsAndFeatures: { id: number, name: string, type: string }[];
    //controlType: 'pumpConfig' | 'manual'
}
interface State
{
    modalOpen: boolean
}
class Pump extends React.Component<Props, State> {

    constructor( props: Props )
    {
        super( props )
    
        this.state = {
            modalOpen: false
        };
        this.toggleModal = this.toggleModal.bind( this )
    }
    toggleModal() {
        // open and close the modal
        this.setState({
            modalOpen: !this.state.modalOpen
        });
    }

    render ()
    {
        // const colCount = Object.keys( this.props ).length + 1
        if ( typeof this.props.pumpStates[ 0 ] === 'undefined' ) return ( 'nothing' );
        let pumps =  this.props.pumpStates.map( ( pump ) =>
        {
                return (
                    <Card key={'pump' + pump.id + 'card'}>
                        <CardBody className='p-0' key={'pump' + pump.id + 'cardbody'}>
                            <CardTitle className='card-header'>  {pump.id}: {pump.type.desc}</CardTitle>
                            <CardText className='text-right mr-3 pt-0'>
                                Watts: {pump.watts}
                                <br />
                                RPM: {pump.rpm}
                                <br />
                                Status: {pump.status.desc}
                                <br />
                            </CardText>
                        </CardBody>
                    </Card> )
            

        } )
        const closeBtn = <button className="close" onClick={this.toggleModal}>&times;</button>;
        const PumpConfigOrManualControl = () =>
        {
            return (
            <PumpConfigModalPopup
                    pumpConfigs={this.props.pumpConfigs}
                    pumpStates={this.props.pumpStates}
                    // condensedCircuitsAndFeatures={this.state.availableCircuits}
                    id='pumpConfig'
                    visibility='visible' /> )
        }
        // TODO: remove "hide" button on modal 
        return (
            <div className="tab-pane active" id="pump" role="tabpanel" aria-labelledby="pump-tab">
                <CustomCard name='Pumps' key='title' id={this.props.id} visibility={this.props.visibility} edit={this.toggleModal}>
                    <CardGroup className="">
                        {pumps}
                    </CardGroup>
                </CustomCard>

                <Modal isOpen={this.state.modalOpen} toggle={this.toggleModal} size='xl' scrollable={true}>
                        <ModalHeader toggle={this.toggleModal} close={closeBtn}>Adjust Pump Configuration</ModalHeader>
                        <ModalBody>
                         {PumpConfigOrManualControl()} 
                        </ModalBody>
                        <ModalFooter>
                            <Button  onClick={this.toggleModal}>Close</Button>
                        </ModalFooter>
                    </Modal>
            </div>
        );
    }
}

export default Pump;