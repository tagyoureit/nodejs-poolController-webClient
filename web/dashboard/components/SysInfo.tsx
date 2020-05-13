import
{
    Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from 'reactstrap';
import StatusIndicator from './StatusIndicator';
import CustomCard from './CustomCard'
import DateTime from './DateTime'
import React, {useState, useEffect} from 'react';
import { IDetail, IStateTemp } from './PoolController';
import SysInfoEditLogger from './SysInfoEditLogger';
import {comms} from './Socket_Client';
import useDataApi from '../components/DataFetchAPI';

interface Props
{

    id: string,
    counter: number,
    data: any;
    isLoading: boolean
    doneLoading: boolean
}

const initialState:any={
    temps: {}, 
    status: {},
    mode: {},
    freeze: false,
    time: ''
};

function SysInfo(props: Props){
    const [modalOpen, setModalOpen] = useState(false);
    const toggleModal = () => {
        // open and close the modal
       setModalOpen(!modalOpen);
    }
    const closeBtn = <button className="close" onClick={toggleModal}>&times;</button>;
        return !props.isLoading && props.doneLoading?
        (
            <div className="tab-pane active" id="system" role="tabpanel" aria-labelledby="system-tab">
                <CustomCard name='System Information' id={props.id}  edit={toggleModal}>
                    <Row>
                        <Col xs="6">Controller Type </Col>
                        <Col>
                            {props.data.equipment.model}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6">Date/Time </Col>
                        <Col>
                            <DateTime  origDateTime={props.data.time} />
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="6">Status</Col>
                        <Col xs="6"><StatusIndicator status={props.data.status} counter={props.counter}></StatusIndicator></Col>
                    </Row>
                    <Row>
                        <Col xs="6">Mode</Col>
                        <Col xs="6">{props.data.mode.desc}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Freeze</Col>
                        <Col xs="6">{props.data.freeze ? "Active" : "Off"}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Air Temp</Col>
                        <Col xs="6">{typeof props.data.temps === 'undefined'?'':props.data.temps.air}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Solar Temp</Col>
                        <Col xs="6">{typeof props.data.temps === 'undefined'?'':props.data.temps.solar}</Col>
                    </Row>

                </CustomCard>
                <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' scrollable={true}>
                        <ModalHeader toggle={toggleModal} close={closeBtn}>Adjust App Settings</ModalHeader>
                        <ModalBody>
                           <SysInfoEditLogger /> 
                        </ModalBody>
                        <ModalFooter>
                            <Button  onClick={toggleModal}>Close</Button>
                        </ModalFooter>
                    </Modal>
            </div>
        )
        :
        <>Loading...</>;
        
}

export default SysInfo;