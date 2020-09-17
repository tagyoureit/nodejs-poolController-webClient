import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, UncontrolledTooltip } from 'reactstrap';

import CustomCard from './CustomCard';
import DateTime from './DateTime';
import StatusIndicator from './StatusIndicator';
import SysInfoEditLogger from './SysInfoEditLogger';
import { PoolContext } from './PoolController';
import axios from 'axios';
const record=require('../images/record.gif');
interface Props {
    id: string,
    counter: number,
    state: any;
    isLoading: boolean
    doneLoading: boolean
    controllerName: string
    config: any
}

const initialState: any={
    temps: {},
    status: {},
    mode: {},
    freeze: false,
    time: ''
};

function SysInfo(props: Props) {
    const [modalOpen, setModalOpen]=useState(false);
    const { controllerType, emitter, poolURL }=useContext(PoolContext);
    const [isRecording, setIsRecording]=useState(false);
    useEffect(() => {
        const fetch=async () => {
            let arr=[]
            arr.push(axios({
                method: 'GET',
                url: `${ poolURL }/app/config/log`
            }))
            let res=await axios.all(arr);
            setIsRecording(res[0].data.app.captureForReplay);
        }

        if (typeof poolURL !== 'undefined') fetch();
    }, [poolURL]);
    const toggleModal=() => {
        // open and close the modal
        setModalOpen(!modalOpen);
    }
    const closeBtn=<button className="close" onClick={toggleModal}>&times;</button>;
    return typeof props.state!=='string'&&typeof props.state!=='undefined'?
        (
            <div className="tab-pane active" id="system" role="tabpanel" aria-labelledby="system-tab">
                <CustomCard name='System Information' id={props.id} edit={toggleModal}>
                    <Row>
                        <Col xs="6">Controller Type </Col>
                        <Col>
                            {props.controllerName}
                            {isRecording&&<>
                                <img src={record} alt='Capture For Replay is recording' id='recordBtn' style={{width:'19px', marginLeft:'1rem'}}/>
                                <UncontrolledTooltip placement="right" target="recordBtn">
                                    Capture for replay is recording.
                                    </UncontrolledTooltip>
                            </>}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6">Date/Time </Col>
                        <Col>
                            <DateTime 
                            origDateTime={props?.state?.time} 
                            config={props.config}
                            />
                        </Col>
                    </Row>

                    <Row>
                        <Col xs="6">Status</Col>
                        <Col xs="6"><StatusIndicator status={props?.state?.status } counter={props.counter}></StatusIndicator></Col>
                    </Row>
                    <Row>
                        <Col xs="6">Mode</Col>
                        <Col xs="6">{props?.state?.mode?.desc}</Col>
                    </Row>
                    {typeof props?.state?.freeze !== 'undefined' && <Row>
                        <Col xs="6">Freeze</Col>
                        <Col xs="6">{props?.state?.freeze? "Active":"Off"}</Col>
                    </Row>}
                    {typeof props.state.temps?.air!=='undefined' && <Row>
                        <Col xs="6">Air Temp</Col>
                        <Col xs="6">{props?.state?.temps?.air}</Col>
                    </Row>}
                    {typeof props.state.temps?.solar!=='undefined' && <Row>
                        <Col xs="6">Solar Temp</Col>
                        <Col xs="6">{props?.state?.temps?.solar}</Col>
                    </Row>}

                </CustomCard>
                <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' scrollable={true}>
                    <ModalHeader toggle={toggleModal} close={closeBtn}>Adjust App Settings</ModalHeader>
                    <ModalBody>
                        <SysInfoEditLogger setIsRecording={setIsRecording} />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={toggleModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        )
        :
        <>Loading...</>;

}

export default SysInfo;