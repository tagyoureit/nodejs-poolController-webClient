import React, { useRef, useState } from 'react';
import { Button, ButtonGroup, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Form, FormGroup, Input, Label } from 'reactstrap';
import '../../css/dropdownselect';
import { IConfigOptionsSchedules, IStateSchedule, IDetail } from '../PoolController';




var extend = require("extend");

interface Props {
  currentSched: IStateSchedule
  options: IConfigOptionsSchedules
  updateSched: (obj: any) => void
}

function ScheduleEditButtons
  (props: Props) {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const min = props.options.tempUnits.name === 'F' ? 50 : 10;
  const max = props.options.tempUnits.name === 'F' ? 104 : 43;
  const [heatSetpoint, setHeatSetpoint] = useState<number>(props.currentSched.heatSetpoint);
  const formRef = useRef();


  const buttons = (schedDays: IDetail[], schedId: number): any => {
    let res: any[] = [];
    let innerRes: any[] = [];
    props.options.scheduleDays.map(optionsDay => {
      innerRes.push(
        <Button
          className={'p-1'}
          key={`id:${schedId}-${optionsDay.val}-button`}
          color={
            schedDays.findIndex(schedDay => schedDay.name === optionsDay.days[0].name) !== -1
              ? "success"
              : "secondary"
          }
          size="sm"
        >
          {optionsDay.days[0].desc.substring(0, 2)}
        </Button>
      );
    });
    res.push(<ButtonGroup key={`scheduleButtons-${schedId}`}>{innerRes}</ButtonGroup>)
    return res;
  }
  const handleClick = (event: any) => {
    let obj = {
      id: props.currentSched.id,
    }


    if (props.currentSched.scheduleType.name === 'repeat')
      obj['scheduleDays'] = props.currentSched.scheduleDays.val + parseInt(event.target.value, 10)
    else
      obj['scheduleDays'] = Math.abs(parseInt(event.target.value, 10))
    console.log(event.target.value)
    props.updateSched(obj);
  }
  return (<ButtonGroup key={`scheduleButtons-${props.currentSched.id}`}>
    {props.options.scheduleDays.map(optionsDay => {
      return <Button
        className={'p-1'}
        key={`${optionsDay.val}-button`}
        color={
          props.currentSched.scheduleDays.days.findIndex(schedDay => schedDay.name === optionsDay.days[0].name) !== -1
            ? "success"
            : "secondary"
        }
        size="sm"
        value={props.currentSched.scheduleDays.days.findIndex(schedDay => schedDay.name === optionsDay.days[0].name) !== -1
          ? optionsDay.val * -1
          : optionsDay.val}
        onClick={handleClick}
      >
        {optionsDay.days[0].desc.substring(0, 2)}
      </Button>

    })}
  </ButtonGroup>
  )
}

export default ScheduleEditButtons
  ;