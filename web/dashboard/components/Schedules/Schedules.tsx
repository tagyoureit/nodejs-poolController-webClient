import { Row, Col, Button, ButtonGroup, ModalHeader, ModalBody, ModalFooter, Modal } from "reactstrap";
import CustomCard from "../CustomCard";
import React, { useContext, useState, useEffect, useReducer } from 'react';
import { useAPI } from '../Comms';
import { IStateSchedule, IDetail } from "../PoolController";
import useDataApi from '../DataFetchAPI';
import { PoolContext } from '../PoolController';
import ScheduleEdit from './ScheduleEdit';
interface Props {
  // data: IStateSchedule[];
  id: string;

}

const initialState: { schedules: IStateSchedule[] } = { schedules: [] }
function Schedule(props: Props) {
  const { poolURL, emitter } = useContext(PoolContext);
  const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi([], initialState);

  const [modalOpen, setModalOpen] = useState(false);
  useEffect(() => {
    if (typeof poolURL !== 'undefined') {
      update();
    }
  }, [poolURL, doFetch])

  const update = () => {
    let arr = [];
    arr.push({ url: `${poolURL}/state/schedules`, dataName: 'schedules' });
    arr.push({ url: `${poolURL}/config/options/schedules`, dataName: 'options' });
    doFetch(arr);
  }

      /* eslint-disable react-hooks/exhaustive-deps */
      useEffect(() => {
        if(typeof poolURL!=='undefined' && typeof emitter !== 'undefined') {
            const fnSchedule=function(data) {
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'schedules', data });
            };
            emitter.on('schedule', fnSchedule);

            return () => {
                emitter.removeListener('schedule', fnSchedule);
            };
        }
    }, [poolURL, emitter]);
    /* eslint-enable react-hooks/exhaustive-deps */
  const buttons = (schedDays: IDetail[], schedId: number): any => {
    let res: any[] = [];

    if (typeof data?.options?.scheduleDays === 'undefined' || typeof schedDays === 'undefined') return (<div />);
    let currSched: IStateSchedule = data.schedules.find(s => s.id === schedId);
    if (currSched.scheduleType.name === 'runonce') {
      res.push(<div
        key={`id:${schedId}-${currSched.scheduleDays.val}-button`}
        className="mr-1 p-0 text-muted"
      >{`${currSched.scheduleType.desc}: `}<Button
        className="mr-1 p-0"
        /* style={{ width: '23px' }} */
        color="success"
        size="sm"
      >
          {currSched.scheduleDays.val !== 0 ? currSched.scheduleDays.days[0].desc.substring(0, 3): 'None'}
        </Button></div>)
    }
    else {
      
        let innerRes:any[] = [];
      data.options.scheduleDays.map(optionsDay => {
      innerRes.push(
        <Button
          className={'p-1'}
          key={`id:${schedId}-${optionsDay.val}-button`}
          color={
            schedDays.findIndex(schedDay => schedDay.name === optionsDay?.days[0]?.name) !== -1
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
  }

    return res;
  }

  const letters = (schedDays: IDetail[], schedId: number): any => {
    let res: any[] = [];

    if (typeof data?.options?.scheduleDays === 'undefined' || typeof schedDays === 'undefined') return (<div />);
    let currSched: IStateSchedule = data.schedules.find(s => s.id === schedId);
    if (currSched.scheduleType.name === 'runonce') {
      res.push(<span key={`id:${schedId}-${currSched.id}-letter`} className={'text-muted'}>Once: <span
        
        className={
         "text-success"
        }
      >
        {currSched.scheduleDays.val !== 0 ? currSched.scheduleDays.days[0].desc.substring(0,3) : 'None'}
      </span></span>)
    }
    else 
    data.options.scheduleDays.map(optionsDay => {
      // this had size='sm' but typescript doesn't like it... do we need to keep it small?
      res.push(
        <span
          key={`id:${schedId}-${optionsDay.val}-letter`}
          className={
            schedDays.findIndex(schedDay => schedDay.name === optionsDay.days[0].name) !== -1
              ? "text-success"
              : "text-muted"
          }
        >
          {optionsDay.days[0].desc.substring(0, 1)}
        </span>
      );
    });
    return res;
  }

  const convertToTimeStr = (num: number) => {
    let hr = Math.floor(num / 60),
      minNum = Math.round(num % 60);
    if (typeof data?.options?.clockMode !== 'undefined' && data?.options?.clockMode === 12) {
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


  // from https://stackoverflow.com/a/49097740/7386278
  const compareTimeAgtB = (a: string | Date, b: string | Date) => {
    // for each one, if it is a string it will be "12:23" format
    // else if it is an object we are passing in the current Date (object)
    if (typeof a === "string") {
      var timeA = new Date();
      timeA.setHours(parseInt(a.split(":")[0]), parseInt(a.split(":")[1]));
    } else {
      timeA = a;
    }
    if (typeof b === "string") {
      var timeB = new Date();
      timeB.setHours(parseInt(b.split(":")[0]), parseInt(b.split(":")[1]));
    } else {
      timeB = b;
    }
    if (timeA >= timeB) return true;
    else return false;
  }


  const schedules = () => {

    if (data !== undefined && data.schedules.length) {
      let now = new Date();
      return data.schedules.map((sched: IStateSchedule) => {
        // is the current schedule active?
        let active = false;
        if (
          compareTimeAgtB(now, convertToTimeStr(sched.startTime)) &&
          compareTimeAgtB(convertToTimeStr(sched.endTime), now)
        ) {
          // current time is between schedule start and end time
          active = true;
        }
        return (<div key={`schedule${sched.id}row`}>

          <Row >
            <Col
              md={4}
              sm={4}
              xs={4}
              className={`${active ? "text-primary font-weight-bold" : ""} pr-0 `}
            >
              {typeof sched.circuit.name === 'undefined' ? 'Unknown name' : sched.circuit.name}
            </Col>
            <Col
              md={3}
              sm={3}
              xs={4}
              className={`${active ? "text-primary font-weight-bold" : ""} p-0`}
            >
              {convertToTimeStr(sched.startTime)} - {convertToTimeStr(sched.endTime)}
            </Col>

            <Col
              sm={5}
              xs={4}
              className="d-none d-sm-block d-md-block p-1"
              style={{ textAlign: "right" }}
            >
              {buttons(sched.scheduleDays.days, sched.id)}
            </Col>
            <Col
              md={5}
              xs={4}
              className="d-block d-sm-none" style={{ textAlign: "right" }}>
              {letters(sched.scheduleDays.days, sched.id)}
            </Col>


          </Row>
          {typeof sched.heatSource !== 'undefined' && <Row>
            <Col xs={'auto'} style={{fontSize:'50%'}}>

            &nbsp;Heat Source: {sched.heatSource.desc} {sched.heatSource.name !== 'off' && sched.changeHeatSetpoint ? `(Set Point: ${sched.heatSetpoint})` : `` }
            </Col>

            </Row>}
          </div>
        );
      });
    }
  };
  const closeBtn = <button className="close" onClick={() => { setModalOpen(!modalOpen); }}>&times;</button>;

  return (
    <div
      className="tab-pane active"
      id={props.id}
      role="tabpanel"
      aria-labelledby="schedules-tab"
    >


      <CustomCard
        name="Schedules"
        id={props.id}
        edit={() => setModalOpen(!modalOpen)}
      >
        {schedules()}
      </CustomCard>
      <Modal isOpen={modalOpen} toggle={() => { setModalOpen(!modalOpen); }} size='xl' scrollable={true}>
        <ModalHeader toggle={() => { setModalOpen(!modalOpen); }} close={closeBtn}>Adjust Schedules</ModalHeader>
        <ModalBody>
          <ScheduleEdit
            schedules={data.schedules}
            options={data.options}
            update={update}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => { setModalOpen(!modalOpen); }}>Close</Button>
        </ModalFooter>
      </Modal>
    </div>
  );

}

export default Schedule;
