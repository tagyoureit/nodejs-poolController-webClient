import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, ListGroupItem, Row } from 'reactstrap';

import { useAPI } from '../Comms';
import useDataApi from '../DataFetchAPI';
import { IConfigOptionsSchedules, IConfigSchedule, IDetail, IStateSchedule, PoolContext } from '../PoolController';
import ScheduleEditCircuit from './ScheduleEditCircuit';
import ScheduleEditHeat from './ScheduleEditHeat';
import ScheduleEditTime from './ScheduleEditTime';
import ScheduleEditType from './ScheduleEditType';
import ScheduleEditButtons from './ScheduleEditButtons';

const editIcon = require('../../images/edit.png');
var extend = require("extend");
const deleteIcon = require('../../images/delete.png');
interface Props {
    schedules: IStateSchedule[];
    options: IConfigOptionsSchedules
    update: () => void;
}

function ScheduleEdit(props: Props) {
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi([], {});
    const { poolURL } = useContext(PoolContext);
    const [error, seterror] = useState<React.ReactFragment>('');

    const execute = useAPI();

    const handleAdd = async () => {
        execute('updateSched', { id: -1 })
            .then(res => {
                if (typeof res.stack !== 'undefined') {
                    throw new Error(res.stack);
                }
                else {
                    props.update();
                }
            })
            .catch((err) => {
                console.error(`Error adding schedule:`);
                console.error(err);
            })
    }

    function updateSched(obj: any) {
        let newSched: IConfigSchedule = props.options.schedules.find(s => s.id === obj.id);
        if (typeof newSched === 'undefined') {
            // if add...
            newSched = {
                id: obj.id,
                circuit: 1,
                startTime: 480, // 8am
                startTimeType: 0,
                endTime: 1020, // 5pm
                endTimeType: 0,
                isActive: true,
                scheduleDays: 0,
                scheduleType: 1,
                heatSource: 32,
            };
        }
        for (let prop in obj) {
            newSched[prop] = obj[prop];
        }

        execute('updateSched', newSched)
            .then(res => {
                if (typeof res.stack !== 'undefined') {
                    throw new Error(res.stack);
                }
                else {
                    props.update();
                }
            })
            .catch((err) => {
                console.error(`Error updating schedule:`);
                console.error(err);
            })
    }

    function deleteSched(id: number) {
        execute('deleteSched', { id })
            .then(res => {
                if (typeof res.stack !== 'undefined') {
                    throw new Error(res.stack);
                }
                else {
                    props.update();
                }
            })
            .catch((err) => {
                console.error(`Error deleting schedule:`);
                console.error(err);
            })
    }



    const [visible, setVisible] = useState(false);
    const onDismiss = () => { setVisible(false); seterror('') };
    const setErrorHandler = (err) => { seterror(err); setVisible(true); }

    return (<>
        <div>
            <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                {error}
            </Alert>
            <Container >
                {props.schedules.map((sched) => {
                    return <ListGroupItem key={`${sched.id}-schedule`}>
                        <Row >
                            <Col xs={12} sm={5}>

                                <ScheduleEditCircuit
                                    currentSched={sched}
                                    options={props.options}
                                    updateSched={updateSched}
                                />
                            </Col>
                            <Col xs={12} sm={5}>

                                <ScheduleEditButtons
                                    currentSched={sched}
                                    options={props.options}
                                    updateSched={updateSched}
                                />
                            </Col>
                            <Col xs={12} sm={2} >
                                <Button color={'link'} className={'m-0 p-0'}
                                    onClick={() => deleteSched(sched.id)}
                                ><img width={'30px'} src={deleteIcon} /></Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <ScheduleEditType
                                    currentSched={sched}
                                    options={props.options}
                                    updateSched={updateSched}
                                />
                            </Col>
                        </Row>
                        <ScheduleEditTime
                            currentSched={sched}
                            options={props.options}
                            updateSched={updateSched}
                        />
                        <Row>
                            <Col>
                                {typeof sched?.circuit?.type?.hasHeatSource !== 'undefined' && sched?.circuit?.type?.hasHeatSource && <ScheduleEditHeat
                                    currentSched={sched}
                                    options={props.options}
                                    updateSched={updateSched}
                                />}



                            </Col>
                        </Row>
                    </ListGroupItem>
                })}

                {(props.schedules.length + props.options.eggTimers.length) < props.options.maxSchedules &&
                    <Button color={'primary'}
                        onClick={handleAdd}>
                        Add Schedule
                            </Button>
                }
            </Container>

        </div >
    </>
    );
}

export default ScheduleEdit;