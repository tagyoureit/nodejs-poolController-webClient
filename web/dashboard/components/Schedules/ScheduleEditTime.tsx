import '../../css/dropdownselect';

import React, { forwardRef, useContext, useEffect, useState, useRef } from 'react';
import { Button, ButtonDropdown, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Form, FormGroup, Input, Label, Row } from 'reactstrap';

import { IConfigOptionsSchedules, IStateSchedule } from '../PoolController';

interface Props {
    currentSched: IStateSchedule
    options: IConfigOptionsSchedules
    updateSched: (obj: any) => void
}

function ScheduleEditTime(props: Props) {
    const [startTimeTypedropdownOpen, startTimeTypesetDropdownOpen] = useState<boolean>(false);
    const [endTimeTypedropdownOpen, endTimeTypesetDropdownOpen] = useState<boolean>(false);
    const formRef = useRef();
    const convertToTimeStr = (num: number) => {
        let hr = Math.floor(num / 60),
            minNum = Math.round(num % 60);
        if (typeof props.options.clockMode !== 'undefined' && props.options.clockMode === 12) {
            var ampm = hr >= 12 ? 'p' : 'a';
            hr = hr % 12;
            hr = hr ? hr : 12; // the hour '0' should be '12'
            let minStr = minNum < 10 ? '0' + minNum : minNum;
            var strTime = `${hr}:${minStr}${ampm}`;
            return strTime;
        }
        else {

            return `${hr}:${minNum < 10 ? "0" + minNum : minNum}`;
        }
    }

    const numericTo24 = (num: number) => {
        let hr = Math.floor(num / 60),
            minNum = Math.round(num % 60);
        return `${hr < 10 ? '0' + hr : hr}:${minNum < 10 ? '0' + minNum : minNum}`;

    }
    const [starttime, setstarttime] = useState(numericTo24(props.currentSched.startTime));
    const [endtime, setendtime] = useState(numericTo24(props.currentSched.endTime));
    const handleClick = (event: any, type: 'startTimeType' | 'endTimeType') => {
        let obj = {
            id: props.currentSched.id,
            [type]: parseInt(event.target.value, 10)
        }
        props.updateSched(obj);
    }
    const minsPastMidnight = (time: string) => {
        console.log(time);
        const timeSplit = time.split(':');
        return (parseInt(timeSplit[0], 10) * 60 + parseInt(timeSplit[1], 10));
    }
    const submit = (evt: any) => {
        evt.persist();
        evt.preventDefault();
        let obj = {
            id: props.currentSched.id
        }
        if (typeof evt.target[`startTime-${props.currentSched.id}`] !== 'undefined') obj['startTime'] = minsPastMidnight(evt.target[`startTime-${props.currentSched.id}`].value);
        if (typeof evt.target[`endTime-${props.currentSched.id}`] !== 'undefined') obj['endTime'] = minsPastMidnight(evt.target[`endTime-${props.currentSched.id}`].value);
        props.updateSched(obj);
    }
    const schedTimeTypes = (type: 'startTimeType' | 'endTimeType') => {
        let dropdownChildren: React.ReactFragment[] = [];
        props.options.scheduleTimeTypes.forEach(schedTimeType => {
            if (schedTimeType.name === 'Not Used') return;
            let entry: React.ReactFragment = (<DropdownItem key={`schedule-edit-${type}-${props.currentSched[type].val}-${props.currentSched.id}-${schedTimeType.val}`}
                value={schedTimeType.val}
                onClick={(evt) => handleClick(evt, type)}
            >{schedTimeType.desc}</DropdownItem>)

            dropdownChildren.push(entry);
        });
        return dropdownChildren;
    }
    return (<Form onSubmit={submit} >

        <Row form={true}>
            <Col xs={12} md={6}  >
                Start Time:
                <ButtonDropdown
                    name="startTimeType"
                    direction="right"
                    size='sm'
                    isOpen={startTimeTypedropdownOpen}
                    toggle={() => startTimeTypesetDropdownOpen(!startTimeTypedropdownOpen)}
                    style={{ width: '150px' }}
                    className='fullWidth'
                >
                    <DropdownToggle
                        caret >
                        {props.currentSched.startTimeType.desc}
                    </DropdownToggle>
                    <DropdownMenu>
                        {schedTimeTypes('startTimeType')}
                    </DropdownMenu>
                </ButtonDropdown>


                {props.currentSched.startTimeType.name === 'manual' ? <FormGroup style={{ width: '150px', display: 'inline-block' }}
                    className={'m-1 p-1'} >

                    <Input
                        type="time"
                        name="startTime"
                        id={`startTime-${props.currentSched.id}`}
                        value={starttime}
                        onChange={(e) => setstarttime(e.target.value)}
                        onBlur={() => { (formRef as any).current?.click(); /* avoid TS error */ }} 
                        bsSize='sm'
                    />
                </FormGroup>

                    : <>{convertToTimeStr(props.currentSched.startTime)}</>
                }
            </Col>


            <Col xs={12} md={6} >
                End Time:
                {props.currentSched.scheduleType.name === 'runonce' ? convertToTimeStr(props.currentSched.endTime) : <>
                <ButtonDropdown
                    direction="right"
                    size='sm'
                    isOpen={endTimeTypedropdownOpen}
                    toggle={() => endTimeTypesetDropdownOpen(!endTimeTypedropdownOpen)}
                    style={{ width: '150px' }}
                    className='fullWidth'
                >
                    <DropdownToggle
                        caret >
                        {props.currentSched.endTimeType.desc}
                    </DropdownToggle>
                    <DropdownMenu>
                        {schedTimeTypes('endTimeType')}
                    </DropdownMenu>
                </ButtonDropdown>

                {props.currentSched.endTimeType.name === 'manual' ? <FormGroup style={{ width: '150px', display: 'inline-block' }}
                    className={'m-1 p-1'} >

                    <Input
                        type="time"
                        name="endTime"
                        id={`endTime-${props.currentSched.id}`}
                        value={endtime}
                        onChange={(e) => setendtime(e.target.value)}
                        onBlur={() => { (formRef as any).current.click() }}
                        bsSize={'sm'}
                    />
                </FormGroup>
                    : <>{convertToTimeStr(props.currentSched.endTime)}</>
                }
                </>}
            </Col>
        </Row>

        {/* https://stackoverflow.com/questions/37901223/react-js-submit-form-programmatically-does-not-trigger-onsubmit-event */}
        <button type='submit' ref={formRef} style={{ display: 'none' }}>Submit</button>
    </Form>


    )
}

export default ScheduleEditTime;