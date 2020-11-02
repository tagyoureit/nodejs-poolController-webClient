import '../../css/dropdownselect';

import React, { forwardRef, useContext, useEffect, useRef, useState } from 'react';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, FormGroup, Input, Label } from 'reactstrap';

import { IConfigOptionsSchedules, IStateSchedule } from '../PoolController';


var extend = require("extend");

interface Props {
    currentSched: IStateSchedule
    options: IConfigOptionsSchedules
    updateSched: (obj: any) => void
}

function ScheduleEditHeat(props: Props) {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [dropdownChangeSetpointOpen, setdropdownChangeSetpointOpen] = useState<boolean>(false);
    const min = props.options.tempUnits.name === 'F' ? 50 : 10;
    const max = props.options.tempUnits.name === 'F' ? 104 : 43;
    const [heatSetpoint, setHeatSetpoint] = useState<number>(typeof (props.currentSched?.heatSetpoint) !== 'undefined' ? props.currentSched.heatSetpoint : props.options.tempUnits.name === 'F' ? 80 : 27);
    const formRef = useRef();

    const handleHeatSourceClick = (event: any) => {
        let obj = {
            id: props.currentSched.id,
            heatSource: parseInt(event.target.value, 10)
        }
        props.updateSched(obj);
    }
    const schedHeatSources = () => {
        let dropdownChildren: React.ReactFragment[] = [];
        props.options.heatSources.forEach(heatSource => {
            // if (heatSource.name === 'Not Used') return;
            let entry: React.ReactFragment = (<DropdownItem key={`schedule-edit-heat-${props.currentSched.heatSource.val}-${props.currentSched.id}-${heatSource.val}`}
                value={heatSource.val}
                onClick={handleHeatSourceClick}
            >{heatSource.desc}</DropdownItem>)

            dropdownChildren.push(entry);
        });
        return dropdownChildren;
    }

    const handleChangeSetPointClick = (event: any) => {
        let obj = {
            id: props.currentSched.id,
            changeHeatSetpoint: event.target.checked
        }
        props.updateSched(obj);
    }
    const submit = (evt: any) => {
        evt.persist();
        evt.preventDefault();
        let obj = {
            id: props.currentSched.id,
            heatSetpoint
        }
        props.updateSched(obj);
    }
    return (<Form onSubmit={submit} inline={true}>
        Heat Source:<ButtonDropdown
            direction="right"
            size='sm'
            isOpen={dropdownOpen}
            toggle={() => setDropdownOpen(!dropdownOpen)}
            style={{ width: '150px' }}
            className='fullWidth'
        >
            <DropdownToggle
                caret >
                {props.currentSched?.heatSource?.desc}
            </DropdownToggle>
            <DropdownMenu>
                {schedHeatSources()}
            </DropdownMenu>
        </ButtonDropdown>
        {props.currentSched.heatSource.name !== 'off' && <>

            <Label check>Change Heat Setpoint:</Label>
            <FormGroup check inline={true}>
                <Input type="checkbox" checked={typeof (props.currentSched?.changeHeatSetpoint) !== 'undefined' ? props.currentSched?.changeHeatSetpoint : false} onChange={handleChangeSetPointClick} />{' '}

            </FormGroup>
        </>}

        {props.currentSched?.heatSource?.name !== 'off' && props.currentSched?.changeHeatSetpoint &&
            <FormGroup
                className={'m-1 p-1'} >
                <Label for='setpoint'>Set Point: </Label>
                <Input
                    type="number"
                    name="heatSetpoint"
                    min={min}
                    max={max}
                    id={'setpoint'}
                    value={heatSetpoint}
                    onBlur={() => { (formRef as any).current?.click(); /* avoid TS error */ }}
                    onChange={(e) => setHeatSetpoint(parseInt(e.target.value, 10))}
                />
            </FormGroup>}
        {/* https://stackoverflow.com/questions/37901223/react-js-submit-form-programmatically-does-not-trigger-onsubmit-event */}
        <button type='submit' ref={formRef} style={{ display: 'none' }}>Submit</button>
    </Form>
    )
}

export default ScheduleEditHeat;