import React, { useContext, useEffect, useRef, useState } from 'react';
import HSBar from "react-horizontal-stacked-bar-chart";
import { Button, Col, Container, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row, UncontrolledAlert, Alert } from 'reactstrap';
import ChemControllerEdit from './ChemControllerEdit';
import { useAPI } from './Comms';
import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { IExtendedChemController, PoolContext, IDetail } from './PoolController';
var extend = require("extend");

const tank0 = require('../images/Tank-0.png');
const tank1 = require('../images/Tank-1.png');
const tank2 = require('../images/Tank-2.png');
const tank3 = require('../images/Tank-3.png');
const tank4 = require('../images/Tank-4.png');
const tank5 = require('../images/Tank-5.png');
const tank6 = require('../images/Tank-6.png');

const initialState: { chemControllers: IExtendedChemController[]; } = { chemControllers: [] };

function ChemControllers(props: any) {
    const [popoverOpen, setPopoverOpen] = useState<boolean[]>([false]);
    const [modalOpen, setModalOpen] = useState(false);
    const [dropdownOpen, setdropdown] = useState();
    const [needsReload, setNeedsReload] = useState(false);
    const { reload, poolURL, controllerType, emitter } = useContext(PoolContext);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi([], initialState);
    const alarmsAndWarnings = useRef<React.ReactFragment[]>([])
    const execute = useAPI();

    const refreshChem = () => {
        let arr = [];
        arr.push({ url: `${poolURL}/extended/chemControllers`, dataName: 'chemControllers' });
        arr.push({ url: `/chemController`, dataName: 'alarmsAndWarnings' });

        doFetch(arr);
    }

    useEffect(() => {
        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined') {
            refreshChem();
            const fn = function (data) {
                // console.log(`received chemController emit`);
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'chemControllers', data });
            };
            emitter.on('chemController', fn);

            return () => {
                emitter.removeListener('chemController', fn);
            };
        }
    }, [poolURL, emitter]);

    const toggleModal = () => {
        if (modalOpen && needsReload) {
            reload();
            setNeedsReload(false);
        }
        setModalOpen(!modalOpen);
    };

    const displayTank = (level: number) => {
        switch (level) {
            case 1:
                return <img src={tank1} style={{ height: '100%', maxWidth: '100%' }} />
            case 2:
                return <img src={tank2} style={{ height: '100%', maxWidth: '100%' }} />
            case 3:
                return <img src={tank3} style={{ height: '100%', maxWidth: '100%' }} />
            case 4:
                return <img src={tank4} style={{ height: '100%', maxWidth: '100%' }} />
            case 5:
                return <img src={tank5} style={{ height: '100%', maxWidth: '100%' }} />
            case 6:
                return <img src={tank6} style={{ height: '100%', maxWidth: '100%' }} />
            case 0:
            case 7:
                return <img src={tank0} style={{ height: '100%', maxWidth: '100%' }} />
        }
    }

    const displayAlarmsAndWarnings = (address: number) => {
        alarmsAndWarnings.current = [];
        let res: React.ReactFragment[] = [];
        let alarms = data?.alarmsAndWarnings[address]?.alarms;
        let warnings = data?.alarmsAndWarnings[address]?.warnings;

        if (alarms && warnings) {
            for (let [k, v] of Object.entries(alarms)) {
                let entry = (<Alert key={k} isOpen={!(v as any).dismissed} color="danger" toggle={() => handleDismiss(address, 'alarm', k)}>{(v as any).desc}</Alert>);
                res.push(entry);
                alarmsAndWarnings.current.push(entry);
            }
            for (let [k, v] of Object.entries(warnings)) {
                let entry = (<Alert key={k} isOpen={!(v as any).dismissed} color="warning" toggle={() => handleDismiss(address, 'warning', k)}>{(v as any).desc}</Alert>);
                res.push(entry);
                alarmsAndWarnings.current.push(entry);
            }
        }
    }

    const processAlarmsAndWarnings = (chemController: IExtendedChemController) => {
        let bChanged = false;
        let finalAlarms = {};
        let finalWarnings = {}
        let existingAlarmsAndWarnings = data.alarmsAndWarnings[chemController.address];
        if (doneLoading && !isError && typeof chemController !== 'undefined') {
            if (typeof chemController.alarms !== 'undefined')
                for (const [key, alarm] of Object.entries(chemController.alarms)) {
                    if (existingAlarmsAndWarnings?.alarms.hasOwnProperty(key)) {
                        // alert no longer exists
                        if (alarm.val === 0) {
                            // don't copy
                            bChanged = true;
                        }
                        // alarm has changed
                        else if (alarm.val !== existingAlarmsAndWarnings.alarms[key]?.val) {
                            finalAlarms[key] = alarm;
                            finalAlarms[key].dismissed = false;
                            bChanged = true;
                        }
                        // retain alarm
                        else if (alarm.val === existingAlarmsAndWarnings.alarms[key]?.val) {
                            finalAlarms[key] = existingAlarmsAndWarnings.alarms[key];
                        }
                    }
                    else if (alarm.val !== 0) {
                        finalAlarms[key] = alarm;
                        finalAlarms[key].dismissed = false;
                        bChanged = true;
                    }
                }
            if (typeof chemController.warnings !== 'undefined')
                for (const [key, warning] of Object.entries(chemController.warnings)) {
                    if (existingAlarmsAndWarnings?.warnings.hasOwnProperty(key)) {
                        // alert no longer exists
                        if (warning.val === 0) {
                            // don't copy
                            bChanged = true;
                        }
                        // warning has changed
                        else if (warning.val !== existingAlarmsAndWarnings.warnings[key]?.val) {
                            finalWarnings[key] = warning;
                            finalWarnings[key].dismissed = false;
                            bChanged = true;
                        }
                        // retain alarm
                        else if (warning.val === existingAlarmsAndWarnings.warnings[key]?.val) {
                            finalWarnings[key] = existingAlarmsAndWarnings.warnings[key];
                        }
                    }
                    else if (warning.val !== 0) {
                        finalWarnings[key] = warning;
                        finalWarnings[key].dismissed = false;
                        bChanged = true;
                    }
                }
        }
        if (bChanged) {
            let all = extend({}, true, data.alarmsAndWarnings);
            all[chemController.address] = { alarms: finalAlarms, warnings: finalWarnings }
            saveAlarmAndWarning(all);
        }
    }
    async function saveAlarmAndWarning(obj) {

        let axiosres = await execute('setChemControllerAlarmAndWarning', {
            ...obj
        })
        if (typeof axiosres.stack === 'undefined') {
            doUpdate({ updateType: 'MERGE_OBJECT', data: axiosres, dataName: 'alarmsAndWarnings' });
        }
        else {
            console.log(`Error: ${JSON.stringify(axiosres)}`);
            // seterror(JSON.stringify(res));
        }
    }
    const handleDismiss = (address, type: string, key: string) => {
        let bSave = false;
        let finalAlarms = extend(true, {}, data.alarmsAndWarnings[address].alarms);
        if (type === 'alarm') {
            if (finalAlarms.hasOwnProperty(key)) finalAlarms[key].dismissed = true;
            bSave = true;
        }
        let finalWarnings = extend(true, {}, data.alarmsAndWarnings[address].warnings);
        if (type === 'warning') {
            if (finalWarnings.hasOwnProperty(key)) finalWarnings[key].dismissed = true;
            // warnings.current = new Map(warningsCopy)

            bSave = true;
        }
        if (bSave) {
            let all = extend({}, true, data.alarmsAndWarnings);
            all[address] = { alarms: finalAlarms, warnings: finalWarnings }
            alarmsAndWarnings.current[address] = { alarms: finalAlarms, warnings: finalWarnings }
            saveAlarmAndWarning(all);
            refreshChem();
            // if (bSave) saveAlarmAndWarning(alarms.current, warnings.current);
        }
    }

    const value_limit = (val, min, max) => {
        return val < min ? min : (val > max ? max : val);
    }
    const closeBtn = <button className="close" onClick={() => { toggleModal(); }}>&times;</button>;
    return (
        <>
            <div className="tab-pane active" id="light" role="tabpanel" aria-labelledby="light-tab">
                <CustomCard name='Chem Controllers' id={props.id} edit={() => setModalOpen(!modalOpen)}>
                    {doneLoading && !isError && typeof data.chemControllers === 'undefined' || data?.chemControllers?.length > 0 && data.chemControllers.map((chemController) => {

                        return <div key={`chemController-${chemController.id}`}>
                            {chemController.name}
                            <ListGroup >
                                <ListGroupItem>
                                    <Container>
                                        {processAlarmsAndWarnings(chemController)}{displayAlarmsAndWarnings(chemController.address)}
                                        {alarmsAndWarnings.current}
                                        <Row className='minHeight125'>
                                            <Col xs='12' sm='4' className='centerText p-0 m-0'>
                                                {/* <div className='topAbs10Percent centerText threeQuarterLineHeight'> */}
                                                        Water Balance <br />
                                                <h1 style={{ color: Math.abs(chemController.saturationIndex) > .3 ? 'rgb(176,40,40)' : 'rgb(42,173,57' }}>
                                                    {typeof chemController.saturationIndex === 'undefined' ? 'n/a' : chemController.saturationIndex}
                                                </h1>
                                                {/* </div> */}
                                                <p />
                                                {/* <div style={{position: 'absolute', bottom: '0', lineHeight:'1'}} className='centerText'> */}
                                                        pH Dosing: {chemController?.pHDosingStatus?.desc} <br />
                                                        orp Dosing: {chemController?.orpDosingStatus?.desc} <br />
                                                        Alk: {chemController?.alkalinity} <br />
                                                        CH:  {chemController?.calciumHardness} <br />
                                                        CYA: {chemController?.cyanuricAcid}
                                                {/*  </div> */}
                                            </Col>

                                            <Col style={{ maxHeight: '125px' }} xs='6' sm='4' className='d-flex p-0 m-0'>
                                                <div className='center p-0' style={{ width: '100%', height: 'auto' }}>
                                                    {displayTank(chemController.acidTankLevel)}
                                                </div>
                                                <div className='center centerText'>
                                                    {chemController.acidTankLevel}/6
                                                            <br />
                                                            Acid Tank Level
                                                </div>
                                            </Col>
                                            <Col xs='6' sm='4' style={{ maxHeight: '125px' }} className='d-flex p-0 m-0'>
                                                <div className='center p-0' style={{ width: '100%', height: 'auto' }}>
                                                    {displayTank(chemController.orpTankLevel)}
                                                </div>
                                                <div className='center centerText'>
                                                    {chemController.orpTankLevel}/6
                                                            <br />ORP Tank Level
                                                        </div>
                                            </Col>
                                            {/*   </Row>

                                            <Row  */}
                                            <Col xs='12' style={{ height: '100px' }}>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '35px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.pHLevel - 6.5) / (8.3 - 6.5) * 100, 0, 100)}%`,
                                                    marginLeft: '-20px', // width of 1/2 of triangle
                                                    zIndex: 4
                                                }}>
                                                    <svg height="40" width="40">
                                                        <text x='20' y='15' textAnchor='middle' fontSize='16' fill='gray'>{chemController.pHLevel}</text>
                                                        <polygon points="20,40 10,20 30,20" fill='gray' stroke='black' strokeWidth='1' />
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '30px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.pHSetpoint - 6.5) / (8.3 - 6.5) * 100, 0, 100)}%`,
                                                    marginLeft: '-17px', // width of 1/2 of circle
                                                    zIndex: 2
                                                }}>
                                                    <svg height="34" width="34">
                                                        <circle cx="17" cy="17" r="8" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="5" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="2" stroke="black" strokeWidth="1" fill='black' />
                                                        <title>{chemController.pHSetpoint}</title>
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    top: '-30px',
                                                    zIndex: 0,
                                                    width: '100%'
                                                }}>
                                                    <HSBar
                                                        height={35}
                                                        showTextDown
                                                        id="phBar"
                                                        fontColor="gray"
                                                        data={[
                                                            { value: .5, description: ` `, color: 'rgb(176,40,40)' },
                                                            { value: .2, description: '7.0', color: 'yellow' },
                                                            { value: .4, description: '7.2', color: 'rgb(42,173,57' },
                                                            { value: .2, description: '7.6', color: 'yellow' },
                                                            { value: .5, description: '7.8', color: 'rgb(176,40,40)' }
                                                        ]}
                                                    />
                                                </div>
                                                <div style={{ position: 'relative', top: '-120px', fontSize: 'x-large' }}>
                                                    pH
                                                </div>

                                            </Col>
                                            <Col xs='12'>
                                                {/* </Row>
                                            <Row style={{height:'100px'}}> */}

                                                <div style={{
                                                    position: 'relative',
                                                    height: '35px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.orpLevel - 400) / (950 - 400) * 100, 0, 100)}%`,
                                                    marginLeft: '-20px', // width of 1/2 of triangle
                                                    zIndex: 4
                                                }}>
                                                    <svg height="40" width="40">
                                                        <text x='20' y='15' textAnchor='middle' fontSize='16' fill='gray'>{chemController.orpLevel}</text>
                                                        <polygon points="20,40 10,20 30,20" fill='gray' stroke='black' strokeWidth='1' />
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '30px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.orpSetpoint - 400) / (950 - 400) * 100, 0, 100)}%`,
                                                    marginLeft: '-17px', // width of 1/2 of circle
                                                    zIndex: 2
                                                }}>
                                                    <svg height="34" width="34">
                                                        <circle cx="17" cy="17" r="8" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="5" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="2" stroke="black" strokeWidth="1" fill='black' />
                                                        <title>{chemController.orpSetpoint}</title>
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    top: '-30px',
                                                    zIndex: 0,
                                                    width: '100%'
                                                }}>
                                                    <HSBar
                                                        height={35}
                                                        showTextDown
                                                        id="orpBar"
                                                        fontColor="gray"
                                                        data={[
                                                            { value: 100, description: ` `, color: 'rgb(176,40,40)' },
                                                            { value: 100, description: '500', color: 'yellow' },
                                                            { value: 150, description: '650', color: 'rgb(42,173,57' },
                                                            { value: 100, description: '750', color: 'yellow' },
                                                            { value: 100, description: '850', color: 'rgb(176,40,40)' }
                                                        ]}
                                                    />
                                                </div>
                                                <div style={{ position: 'relative', top: '-120px', fontSize: 'x-large' }}>
                                                    ORP
                                                </div>
                                            </Col>
                                        </Row>
                                    </Container>
                                </ListGroupItem>

                                <br />
                            </ListGroup>
                        </div>

                    })}



                </CustomCard>



                <Modal isOpen={modalOpen} toggle={() => { setModalOpen(!modalOpen); }} size='xl' scrollable={true}>
                    <ModalHeader toggle={() => { setModalOpen(!modalOpen); }} close={closeBtn}>Adjust Chem Controller</ModalHeader>
                    <ModalBody>
                        <ChemControllerEdit
                            // chemControllers={data.chemControllers}
                            doUpdate={doUpdate}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => { setModalOpen(!modalOpen); }}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>

        </>
    );
}

export default ChemControllers;