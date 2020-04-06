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

interface Props
{
    visibility: string,
    id: string,
    counter: number,
}
interface State
{
    modalOpen: boolean
}

function SysInfo(props: Props){
    const [temps, setTemps] = useState<IStateTemp>()
    const [status, setStatus] = useState({val: 0, name: '', desc: ''})
    const [mode, setMode] = useState<IDetail>({val: 0, desc:'loading', name:'loading'});
    const [freeze, setFreeze] = useState(false);
    const [time, setTime] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const [model, setModel] = useState();

    useEffect(() => {
        fetch(`${ comms.poolURL }/state/all`)
            .then(res => res.json())
            .then(result => {
                setTemps(result.temps);
                setStatus(result.status);
                setMode(result.mode);
                setFreeze(result.freeze);
                setTime(result.time);
                setModel(result.equipment.model)
            },
                error => {
                    console.log(error);
                });
       
    }, []);
    const toggleModal = () => {
        // open and close the modal
       setModalOpen(!modalOpen);
    }

    const closeBtn = <button className="close" onClick={toggleModal}>&times;</button>;
        return (
            <div className="tab-pane active" id="system" role="tabpanel" aria-labelledby="system-tab">
                <CustomCard name='System Information' id={props.id} visibility={props.visibility} edit={toggleModal}>
                    <Row>
                        <Col xs="6">Controller Type </Col>
                        <Col>
                            {model}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6">Date/Time </Col>
                        <Col>
                            <DateTime  origDateTime={time} />
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="6">Status</Col>
                        <Col xs="6"><StatusIndicator status={status} counter={props.counter}></StatusIndicator></Col>
                    </Row>
                    <Row>
                        <Col xs="6">Mode</Col>
                        <Col xs="6">{mode.desc}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Freeze</Col>
                        <Col xs="6">{freeze ? "Active" : "Off"}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Air Temp</Col>
                        <Col xs="6">{typeof temps === 'undefined'?'':temps.air}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Solar Temp</Col>
                        <Col xs="6">{typeof temps === 'undefined'?'':temps.solar}</Col>
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
        );
}

export default SysInfo;