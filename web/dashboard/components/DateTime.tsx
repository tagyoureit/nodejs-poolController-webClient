import { Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, UncontrolledAlert } from 'reactstrap';

import InfiniteCalendar from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css';
import Timekeeper from 'react-timekeeper';
import '../css/modal.css'
import { useAPI } from './Comms'
import React, { useEffect, useState, useContext } from 'react';
import useDataApi from './DataFetchAPI';
import { PoolContext } from './PoolController';

interface Props {
  origDateTime: string;
  config: any;
}
function DateTime(props: Props) {
  const { poolURL, emitter } = useContext(PoolContext);
  const [error, seterror] = useState<string>();
  const [visible, setvisible] = useState(false);
  let [modal, setModal] = useState(false);
  let [dateTime, setDateTime] = useState(new Date())
  const toISOLocal = (dt): string => {
    let tzo = dt.getTimezoneOffset();
    var pad = function (n) {
      var t = Math.floor(Math.abs(n));
      return (t < 10 ? '0' : '') + t;
    };
    return new Date(dt.getTime() - (tzo * 60000)).toISOString().slice(0, -1) + (tzo > 0 ? '-' : '+') + pad(tzo / 60) + pad(tzo % 60)
  }
  const dateParse = (date: any) => {
    if (new Date(date).toString() === 'Invalid Date') date = toISOLocal(new Date());
    var s = date.split(/[^0-9]/);
    return new Date(s[0], s[1] - 1, s[2], s[3], s[4], s[5]);
  }
  let [newDateTime, setNewDateTime] = useState(dateParse(props.origDateTime) || new Date());
  const [disabled, setDisabled] = useState(false)
  let execute = useAPI();
  const pad = (n) => {
    return n < 10 ? `0${n}` : n;
  }
  let [time, setTime] = useState<string>('');
  interface InitialState {
    general: any
  }
  const initialState: InitialState =
  {
    general: {}
  };
  const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi(undefined, initialState);
  useEffect(() => {
    fetch();
  }, [poolURL]);

  const fetch = () => {
    if (typeof poolURL === 'undefined') return;
    let arr = [];
    arr.push({ url: `${poolURL}/config/options/general`, dataName: 'general' });
    doFetch(arr);
  }

  useEffect(() => {
    if (typeof props.origDateTime !== 'undefined') {
      const _dt = new Date(props.origDateTime);
      setTime(`${_dt.getHours()}:${pad(_dt.getMinutes())}`);
      setDateTime(_dt);
    }
  }, [props.origDateTime])


  const handleTimeChange = (newTime: any) => {
    // event when time picker is closed
    let newDt = newDateTime;
    newDt.setHours(newTime.hour, newTime.minute);
    setNewDateTime(newDt);
    setTime(newTime.formatted24)
  }

  const handleDateChange = (newDate: any) => {
    // event when date picker is closed
    let newDt = newDateTime;
    newDt.setMonth(newDate.getMonth());
    newDt.setDate(newDate.getDate());
    newDt.setFullYear(newDate.getFullYear());
    // console.log(`will update to ${newDt.toLocaleString('en-US')}`)
    setNewDateTime(newDt);
  }

  const toggle = () => {
    // open and close the modal
    fetch();
    setModal(!modal)
    setDisabled(false);
  }

  const submit = (evt) => {
    const doExecute = async () => {

      let obj = {
        options: {},
        location: {}
      }
      if (typeof evt.target.clockSource.value !== 'undefined') obj.options['clockSource'] = evt.target.clockSource.value;
      if (typeof evt.target.clockMode.value !== 'undefined') obj.options['clockMode'] = evt.target.clockMode.value;
      if (data.general.pool.options.clockSource === 'manual') {
        if (typeof evt.target.timeZone.value !== 'undefined') obj.location['timeZone'] = evt.target.timeZone.value;
        if (typeof evt.target.adjustDST.value !== 'undefined') obj.options['adjustDST'] = evt.target.adjustDST.value === 'true' ? true : false;
      }
      try {

        await execute('configGeneral', obj)
        .then(res => {
          // console.log(`res from config general`);
          // console.log(res);
          doUpdate({ updateType: 'REPLACE', dataName: ['general','pool'], data: res })
          
        });
      }
      catch (err){
        setAlert(JSON.stringify(err));
      }
      try {
        await execute('setDateTime', {
          hour: newDateTime.getHours(),
          min: newDateTime.getMinutes(),
          dow: Math.pow(2, newDateTime.getDay()),
          date: newDateTime.getDate(),
          month: newDateTime.getMonth() + 1,
          year: parseInt(newDateTime.getFullYear().toString().slice(-2), 10)
        })
        console.log(`Changed date/time successfully.`);
        toggle(); // only if successful.
      }
      catch (err){
        setAlert(JSON.stringify(err));
      }
      setDisabled(false);
    }
    setDisabled(true);
    evt.persist();
    evt.preventDefault();
    setDisabled(true);
    doExecute();
  }

  const cancel = () => {
    // when cancel button is pressed reset state
    let _dt = new Date(props.origDateTime);
    toggle();
    setDateTime(_dt);
    setNewDateTime(_dt);
    setTime(`${_dt.getHours()}:${pad(_dt.getMinutes())}`)
  }
  const closeBtn = <button className="close" onClick={cancel}>&times;</button>

  const setAlert = (msg) => {setvisible(true); seterror(msg);}
  const onDismissAlert = () => {setvisible(false); seterror(undefined);}

return props.origDateTime && doneLoading && !isError ? (<>
    <Button color="primary" onClick={toggle}>
      {/* Update this to use 12/24 hour option if available */}
      {dateParse(props.origDateTime).toLocaleString([], { month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: typeof data.general.pool.options.clockMode !== 'undefined' ? data.general.pool.options.clockMode === 12 : props?.config?.pool?.options?.clockMode === 12})}
     </Button>
    <Modal isOpen={modal} toggle={toggle} size='xl' >
    <Alert color="danger" isOpen={visible} toggle={onDismissAlert}>
      {error}
    </Alert>
      <Form onSubmit={submit}>
        <ModalHeader toggle={toggle} close={closeBtn}>Adjust time and date</ModalHeader>
        <ModalBody>
          <Row form>
            <Col md={6}>
              <FormGroup>
                <Label className={'mb-0'} for="clockSource">Clock Source</Label>
                <Input type="select" name="select" id="clockSource" defaultValue={data.general.pool.options.clockSource || 'manual'} >
                  {data.general?.clockSources?.map(k => {
                    return (<option key={k.val} value={k.name}>{k.desc}</option>)
                  })}
                </Input>
              </FormGroup>
            </Col>
            <Col md={6}>
              <FormGroup>
                <Label className={'mb-0'} for="clockMode">Clock Mode</Label>
                <Input type="select" name="select" id="clockMode" defaultValue={data.general.pool.options.clockMode || 12} >
                  {data.general?.clockModes?.map(k => {
                    return (<option key={k.val} value={k.val}>{k.name}</option>)
                  })}
                </Input>
              </FormGroup>
            </Col>
          </Row>
          {data.general.pool.options.clockSource === 'manual' &&
            <>
              <Row>
                <Col sm={{ size: 'auto', offset: 1 }}>
                  <InfiniteCalendar
                    width={350}
                    height={200}
                    selected={dateTime}
                    onSelect={handleDateChange}
                  />
                  </Col>
                <Col sm={{ size: 'auto', offset: 1 }}>
                  <Timekeeper
                    time={time}
                    onChange={handleTimeChange}
                    switchToMinuteOnHourSelect={true}
                    hour24Mode={data.general?.pool?.options?.clockMode === 24}
                  />
                </Col>
              </Row>
              <Row form>

                <Col md={6}>
                  <FormGroup>
                    <Label className={'mb-0'} for="timeZone">Time Zone</Label>
                    <Input type="select" name="select" id="timeZone" defaultValue={data.general?.pool?.location?.timeZone || 0} >
                      {data.general?.timeZones?.map(k => {
                        return (<option key={k.val} value={k.val}>({k.utcOffset}) {k.name}</option>)
                      })}
                    </Input>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label className={'mb-0'} for="adjustDST">Adjust DST</Label>
                    <Input type="select" name="select" id="adjustDST" defaultValue={data.general.pool.options.adjustDST === true ? 'true' : 'false' || 'true'} >
                      <option value={'true'}>True</option>
                      <option value={'false'}>False</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row></>}


        </ModalBody>
        <ModalFooter>
          <Button type='submit' color='primary' disabled={disabled}>Update</Button>
        </ModalFooter>
      </Form>
    </Modal>
  </>
  ) : (<></>);

}

export default DateTime; 