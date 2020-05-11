
import {
    Row, Col, Table, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, CardFooter, CardGroup,
    Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import CustomCard from './CustomCard';
import DateTime from './DateTime';
import React, { useState, useEffect, useReducer } from 'react';
import PumpConfigModalPopup from './PumpConfig/PumpConfigModalPopup';
import { IStatePump, IConfigPump } from './PoolController';
import { comms } from './Socket_Client';
import useDataApi from './DataFetchAPI';

interface Props {
    id: string;
    visibility: string;
}

const initialState: { pumps: IStatePump[]; }={ pumps: [] };
function Pump(props: Props) {
    const [modalOpen, setModalOpen]=useState(false);
    let arr=[];
    arr.push({ url: `${ comms.poolURL }/state/pumps`, dataName: 'pumps' });

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);
    
        /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        let emitter=comms.getEmitter();
        const fnPump=function(data) { 
            console.log(`received pump:`)
            console.log(data)
            doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'pumps', data }); };
        emitter.on('pump', fnPump);

        return () => {
            emitter.removeListener('pump', fnPump);
        };
    }, []);
        /* eslint-enable react-hooks/exhaustive-deps */

    const closeBtn=<button className="close" onClick={() => setModalOpen(!modalOpen)}>&times;</button>;

    const PumpConfigOrManualControl=() => {
        return (
            <PumpConfigModalPopup
                id='pumpConfig'
                visibility='visible' />);
    };

    return (
        <div className="tab-pane active" id="pump" role="tabpanel" aria-labelledby="pump-tab">
        {console.log(data)}
            <CustomCard name='Pumps' key='title' id={props.id} visibility={props.visibility} edit={() => setModalOpen(!modalOpen)}>
                <CardGroup className="">
                    {data.pumps && data.pumps.map((pump) => {
                        return (
                            <Card key={'pump'+pump.id+'card'}>
                                <CardBody className='p-0' key={'pump'+pump.id+'cardbody'}>
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
                            </Card>);


                    })}
                </CardGroup>
            </CustomCard>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size='xl' scrollable={true}>
                <ModalHeader toggle={() => setModalOpen(!modalOpen)} close={closeBtn}>Adjust Pump Configuration</ModalHeader>
                <ModalBody>
                    {PumpConfigOrManualControl()}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => setModalOpen(!modalOpen)}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

/* class Pump extends React.Component<Props, State> {

    constructor( props: Props )
    {
        super( props )
    
        state = {
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
                    // pumpConfigs={this.props.pumpConfigs}
                    // pumpStates={this.props.pumpStates}
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
} */

export default Pump;