import React, { useContext, useEffect, useState } from 'react';
import { Button, ButtonDropdown, ButtonGroup, Card, CardBody, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledCollapse, Container, Row, Col } from 'reactstrap';
import { useAPI } from './Comms';
import { PoolContext } from './PoolController';
import axios from 'axios';
const extend=require("extend");

function SysInfoEditLogger(props) {
    const [log, setLog]=useState<any>({});
    const [broadcast, setBroadcast]=useState<any>({});
    const [dropdownLevelOpen, setDropdownLevelOpen]=useState<boolean>(false);
    const [ready, setReady]=useState<boolean>(false);
    const [includeBroadcastActions, setIncludeBroadcastActions]=useState<number[]>([]);
    const {poolURL, emitter} = useContext(PoolContext);
    const execute = useAPI();
    useEffect(() => {
        const fetch = async () =>{
            let arr = []
            arr.push(axios({
               method: 'GET',
               url: `${ poolURL }/app/config/log`
           }))
            arr.push(axios({
               method: 'GET',
               url: `${ poolURL }/app/messages/broadcast/actions`
           }))
           let res = await axios.all(arr);
           setLog(res[0].data);
           setBroadcast(res[1].data);

            /* 
                fetch(`${ poolURL }/app/config/log`)
                .then(res => res.json())
                .then(
                    result => {
                        console.log(`equipmentIdS? ${ JSON.stringify(result.equipmentIds) }`);
                        setLog(result);
                    },
                    error => {
                        console.log(error);
                    }
                    );
                    fetch(`${ poolURL }/app/messages/broadcast/actions`)
                    .then(res => res.json())
                    .then(
                        result => {
                            console.log(`equipmentIdS? ${ JSON.stringify(result.equipmentIds) }`);
                            setBroadcast(result);
                        },
                        error => {
                            console.log(error);
                        }
                        );*/
                    } 
                    fetch();
    }, [poolURL]);

    useEffect(() => {
        if(Object.keys(log).length&&Object.keys(broadcast).length) {
            setReady(true);
            setIncludeBroadcastActions(log.packet.broadcast.includeActions);
        }
    }, [broadcast, log]);

    const  toggleAppSetting = async (obj: string) => {
        let update={};
        switch(obj) {
            case 'log.app.enabled':
                update={ app: { enabled: !log.app.enabled } };
                break;
            case 'log.packet.pump.enabled':
                update={ packet: { pump: { enabled: !log.packet.pump.enabled } } };
                break;
            case 'log.packet.logToConsole':
                update={ packet: { logToConsole: !log.packet.logToConsole } };
                break;
            case 'log.packet.broadcast.enabled':
                update={ packet: { broadcast: { enabled: !log.packet.broadcast.enabled } } };
                break;
            case 'log.packet.chlorinator.enabled':
                update = { packet: { chlorinator: { enabled: !log.packet.chlorinator.enabled } } };
                break;
        }
        await execute('setAppLoggerOptions', update);
        setLog(extend(true, {}, log, update));
    }

    const toggleLevelDropDown=() => { setDropdownLevelOpen(dropdownLevelOpen => !dropdownLevelOpen); };

    const setLogLevel=async (evt) => {
        console.log(evt);
        const update={ app: { level: evt.target.value } };
        await execute('setAppLoggerOptions', update);
        setLog(extend(true, {}, log, update));
    };
    const onCheckboxBtnClick=async (selected) => {
        const index=includeBroadcastActions.indexOf(selected);
        if(selected===-1) includeBroadcastActions.splice(0, includeBroadcastActions.length);
        else if(index<0) {
            includeBroadcastActions.push(selected);
        } else {
            includeBroadcastActions.splice(index, 1);
        }
        setIncludeBroadcastActions([...includeBroadcastActions]);
        setLog(log);
        await execute('setAppLoggerOptions', { packet: { broadcast: { includeActions: includeBroadcastActions } } });
    };

    if(ready) {
        return (<>
                    App logging enabled:
            
                    <Button style={{marginLeft:'5px'}} onClick={() => toggleAppSetting('log.app.enabled')} color={log.app.enabled? 'success':'secondary'} size='sm'>{log.app.enabled? 'On':'Off'}</Button>
                    <br />
                
                    App log level:
            <ButtonDropdown style={{marginLeft:'5px'}} isOpen={dropdownLevelOpen} toggle={toggleLevelDropDown} size='sm'>
                        <DropdownToggle caret>
                            {log.app.level}
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={setLogLevel} value='error'>error</DropdownItem>
                            <DropdownItem onClick={setLogLevel} value='warn'>warn</DropdownItem>
                            <DropdownItem onClick={setLogLevel} value='info'>info</DropdownItem>
                            <DropdownItem onClick={setLogLevel} value='verbose'>verbose</DropdownItem>
                            <DropdownItem onClick={setLogLevel} value='debug'>debug</DropdownItem>
                            <DropdownItem onClick={setLogLevel} value='silly'>silly</DropdownItem>
                        </DropdownMenu>

                    </ButtonDropdown>
              
                    <br />
                    Log to console:
                    <Button style={{marginLeft:'5px'}} onClick={() => toggleAppSetting('log.packet.logToConsole')} color={log.packet.logToConsole? 'success':'secondary'} size='sm'>{log.packet.logToConsole? 'On':'Off'}</Button>
                <br />
               
                    Log broadcast packets: 
                   
                    <Button style={{marginLeft:'5px'}} onClick={() => toggleAppSetting('log.packet.broadcast.enabled')} color={log.packet.broadcast.enabled? 'success':'secondary'} size='sm'>{log.packet.broadcast.enabled? 'On':'Off'}</Button>
            
            <Button style={{marginLeft:'5px'}} color="link" id="toggler2" size='sm'>
                Include Broadcast Actions...
            </Button>
            <UncontrolledCollapse toggler="#toggler2">
                <Card>
                    <CardBody>
                        <ButtonGroup vertical={true}>

                            <Button color="primary" onClick={() => onCheckboxBtnClick(-1)} active={!includeBroadcastActions.length} size='sm' key='include.-1'>All</Button>
                            {broadcast.map(el => {
                                return (<Button color="primary" onClick={() => onCheckboxBtnClick(el.val)} active={includeBroadcastActions.includes(el.val)} size='sm' key={`include.${ el.val }`}>{`${ el.val } - ${ el.desc }`}</Button>);
                            })}

                        </ButtonGroup>
                    </CardBody>
                </Card>
            </UncontrolledCollapse>
            <br />
            Log pump messages: <Button style={{marginLeft:'5px'}} onClick={() => toggleAppSetting('log.packet.pump.enabled')} color={log.packet.pump.enabled? 'success':'secondary'} size='sm'>{log.packet.pump.enabled? 'On':'Off'}</Button>
            <br />
            Log chlorinator messages: <Button style={{marginLeft:'5px'}} onClick={() => toggleAppSetting('log.packet.chlorinator.enabled')} color={log.packet.chlorinator.enabled? 'success':'secondary'} size='sm'>{log.packet.chlorinator.enabled? 'On':'Off'}</Button>
            <br />
        </>);
    }

    else {
        return (<>Loading options...</>);
    }
}

export default SysInfoEditLogger;
