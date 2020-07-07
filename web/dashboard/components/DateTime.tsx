import { Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import InfiniteCalendar from 'react-infinite-calendar';
import 'react-infinite-calendar/styles.css';
import Timekeeper from 'react-timekeeper';
import '../css/modal.css'
import { useAPI } from './Comms'
import React, {useEffect, useState} from 'react';

interface Props
{
  origDateTime: Date;
  config: any;
}
function DateTime(props:Props) {
    let [modal, setModal] = useState(false);
    let [dateTime, setDateTime] = useState(new Date())
    let [newDateTime, setNewDateTime] = useState(props.origDateTime || new Date());
    const [disabled, setDisabled] = useState(false)
    let execute = useAPI();
    const pad= (n) =>{
        return n < 10 ? `0${n}` : n;
    }
    let [time, setTime] = useState<string>('');
    
    useEffect(()=>{
        if (typeof props.origDateTime !== 'undefined'){
            const _dt = new Date(props.origDateTime);
            setTime(`${_dt.getHours()}:${pad(_dt.getMinutes())}`);
            setDateTime(_dt);
        }     
    },[props.origDateTime])


  const handleTimeChange = ( newTime: any ) =>
  {
    // event when time picker is closed
    let newDt = newDateTime;
    newDt.setHours( newTime.hour, newTime.minute );
      setNewDateTime(newDt);
      setTime(newTime.formatted24)
  }

  const handleDateChange = ( newDate: any ) =>
  {
    // event when date picker is closed
    let newDt = newDateTime;
    newDt.setMonth( newDate.getMonth() );
    newDt.setDate( newDate.getDate() );
    newDt.setFullYear( newDate.getFullYear() );
    console.log( `will update to ${ newDt.toLocaleString( 'en-US' ) }` )
      setNewDateTime(newDt);
  }

  const toggle = () =>
  {
    // open and close the modal
    setModal(!modal)
  }


 const submit = () =>
  {
    const doExecute = async() => {
        // submit changes to socket
        await execute('setDateTime', {
            hour: newDateTime.getHours(),
            min: newDateTime.getMinutes(),
            dow: Math.pow(2, newDateTime.getDay()),
            date: newDateTime.getDate(),
            month: newDateTime.getMonth()+1,
            year: parseInt(newDateTime.getFullYear().toString().slice(-2), 10)
        })
        console.log(`Changed date/time successfully.`)
        toggle()
    }
    setDisabled(true);
    doExecute();
  }

  const cancel = () =>
  {
    // when cancel button is pressed reset state
    let _dt = new Date(props.origDateTime);
    setModal(!modal);
    setDateTime(_dt);
    setNewDateTime(_dt);
    setTime(`${_dt.getHours()}:${pad(_dt.getMinutes())}`)
  }
  const closeBtn = <button className="close" onClick={cancel}>&times;</button>;
  let dt = new Date(props.origDateTime).toLocaleString([], {month:'2-digit',day:'2-digit',year: 'numeric', hour: '2-digit', minute:'2-digit', hour12: true})
  
    return props.origDateTime && (
      <div>
        {props?.config?.pool?.options?.clockSource !== 'server' ? <Button color="primary" onClick={toggle}>
          {/* Update this to use 12/24 hour option if available */}
          {dt}
        </Button>: dt}
        <Modal isOpen={modal} toggle={toggle} size='xl' >
          <ModalHeader toggle={toggle} close={closeBtn}>Adjust time and date</ModalHeader>
          <ModalBody>
            <Row>
              <Col sm={{ size: 'auto', offset: 1 }}><InfiniteCalendar
                width={350}
                height={200}
                selected={dateTime}
                onSelect={handleDateChange}
              /></Col>
              <Col sm={{ size: 'auto', offset: 1 }}>
                <Timekeeper
                  time={time}
                  onChange={handleTimeChange}
                  switchToMinuteOnHourSelect={true}
                />
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button color={newDateTime === props.origDateTime ? 'secondary' : 'primary'} onClick={submit} 
                disabled={disabled}
            >{newDateTime === props.origDateTime ? 'Cancel' : 'Update'}</Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  
}

export default DateTime; 