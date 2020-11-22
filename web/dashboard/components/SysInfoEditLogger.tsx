import React, { useContext, useEffect, useState, Dispatch } from 'react';
import { Button, ButtonDropdown, ButtonGroup, Card, CardBody, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledCollapse, Container, Row, Col, Nav, NavItem, NavLink, TabContent, TabPane, CardTitle, CardText, FormGroup, Input, Label, Form } from 'reactstrap';
import { useAPI } from './Comms';
import { PoolContext } from './PoolController';
import axios from 'axios';
const extend = require("extend");
import useDataApi from './DataFetchAPI';
interface Props {
    setIsRecording: Dispatch<(prevState: undefined) => undefined>
}
function SysInfoEditLogger(props: Props) {
    const [log, setLog] = useState<any>({ app: { captureForReplay: false } });
    const [broadcast, setBroadcast] = useState<any>({});
    const [dropdownLevelOpen, setDropdownLevelOpen] = useState<boolean>(false);
    const [ready, setReady] = useState<boolean>(false);
    const [includeBroadcastActions, setIncludeBroadcastActions] = useState<number[]>([]);
    const { poolURL, emitter } = useContext(PoolContext);
    const [captureButtonIsOpen, setCaptureButtonIsOpen] = useState(false);
    const [captureButtonType, setCaptureButtonType] = useState(true);
    const [activeTab, setActiveTab] = useState('1');

    interface InitialState {
        general: any
    }
    const initialState: InitialState =
    {
        general: {}
    };
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi(undefined, initialState);

    const execute = useAPI();
    if (typeof poolURL === 'undefined') return;
    useEffect(() => {
        const fetch = async () => {
            let arr = []
            arr.push(axios({
                method: 'GET',
                url: `${poolURL}/app/config/log`
            }))
            arr.push(axios({
                method: 'GET',
                url: `${poolURL}/app/messages/broadcast/actions`
            }))

            let res = await axios.all(arr);
            setLog(res[0].data);
            setBroadcast(res[1].data);

        }
        fetch();
        let arr = [];
        arr.push({ url: `${poolURL}/config/options/general`, dataName: 'general' });
        doFetch(arr);
    }, [poolURL]);
    useEffect(() => {

        if (typeof log?.packet?.logToConsole !== 'undefined' && Object.keys(log).length > 1 && Object.keys(broadcast).length > 0) {
            setReady(true);
            setIncludeBroadcastActions(log.packet.broadcast.includeActions);
        }
        else {
            setReady(false)
        }
    }, [JSON.stringify(broadcast), JSON.stringify(log)]);

    const toggleAppSetting = async (obj: string) => {
        let update = {};
        switch (obj) {
            case 'log.app.enabled':
                update = { app: { enabled: !log.app.enabled } };
                break;
            case 'log.packet.pump.enabled':
                update = { packet: { pump: { enabled: !log.packet.pump.enabled } } };
                break;
            case 'log.packet.logToConsole':
                update = { packet: { logToConsole: !log.packet.logToConsole } };
                break;
            case 'log.packet.broadcast.enabled':
                update = { packet: { broadcast: { enabled: !log.packet.broadcast.enabled } } };
                break;
            case 'log.packet.chlorinator.enabled':
                update = { packet: { chlorinator: { enabled: !log.packet.chlorinator.enabled } } };
                break;
        }
        await execute('setAppLoggerOptions', update);
        setLog(extend(true, {}, log, update));
    }

    const toggleLevelDropDown = () => { setDropdownLevelOpen(dropdownLevelOpen => !dropdownLevelOpen); };

    const setLogLevel = async (evt) => {
        const update = { app: { level: evt.target.value } };
        await execute('setAppLoggerOptions', update);
        setLog(extend(true, {}, log, update));
    };
    const onCheckboxBtnClick = async (selected) => {
        const index = includeBroadcastActions.indexOf(selected);
        if (selected === -1) includeBroadcastActions.splice(0, includeBroadcastActions.length);
        else if (index < 0) {
            includeBroadcastActions.push(selected);
        } else {
            includeBroadcastActions.splice(index, 1);
        }
        setIncludeBroadcastActions([...includeBroadcastActions]);
        setLog(log);
        await execute('setAppLoggerOptions', { packet: { broadcast: { includeActions: includeBroadcastActions } } });
    };

    const changeReplay = async () => {
        try {
            let update = {};
            if (log.app.captureForReplay) {

                let data = await execute('stopPacketCapture')
                const url = window.URL.createObjectURL(new Blob([data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'replay.zip');
                document.body.appendChild(link);
                link.click();
                update = { app: { captureForReplay: false } };
                setLog(extend(true, {}, log, update));
                props.setIsRecording(false);
            }
            else {
                let data;
                if (captureButtonType) {
                    data = await execute('startPacketCapture');
                }
                else { data = await execute('startPacketCaptureWithoutReset') }
                if (data === 'OK') {
                    update = { app: { captureForReplay: true } };
                    setLog(extend(true, {}, log, update));
                }
            }
            props.setIsRecording(true);
        }

        catch (err) {
            console.log(`Error ${log.app.captureForReplay ? 'stopping' : 'starting'} replay feature: ${err.message}`)
        }
    }

    const toggle = tab => {
        if (activeTab !== tab) setActiveTab(tab);
    }

    const changeGeneral = (evt) => {
        evt.preventDefault();
        let obj = {
            owner: {},
            options: {},
            location: {}
        }
        if (typeof evt.target.alias.value !== 'undefined') obj['alias'] = evt.target.alias.value;
        if (typeof evt.target.ownerName.value !== 'undefined') obj.owner['name'] = evt.target.ownerName.value;
        if (typeof evt.target.ownerPhone.value !== 'undefined') obj.owner['phone'] = evt.target.ownerPhone.value;
        if (typeof evt.target.ownerEmail.value !== 'undefined') obj.owner['email'] = evt.target.ownerEmail.value;
        if (typeof evt.target.ownerEmail2.value !== 'undefined') obj.owner['email2'] = evt.target.ownerEmail2.value;
        if (typeof evt.target.ownerPhone2.value !== 'undefined') obj.owner['phone2'] = evt.target.ownerPhone2.value;

        if (typeof evt.target.address.value !== 'undefined') obj.location['address'] = evt.target.address.value;
        if (typeof evt.target.city.value !== 'undefined') obj.location['city'] = evt.target.city.value;
        if (typeof evt.target.state.value !== 'undefined') obj.location['state'] = evt.target.state.value;
        if (typeof evt.target.zip.value !== 'undefined') obj.location['zip'] = evt.target.zip.value;
        if (typeof evt.target.country.value !== 'undefined') obj.location['country'] = evt.target.country.value;
        if (typeof evt.target.latitude.value !== 'undefined') obj.location['latitude'] = evt.target.latitude.value;
        if (typeof evt.target.longitude.value !== 'undefined') obj.location['longitude'] = evt.target.longitude.value;
        if (typeof evt.target.timezone.value !== 'undefined') obj.location['timeZone'] = evt.target.timezone.value;
        execute('configGeneral', obj)
            .then(res => {
                console.log(`res from config general`);
                console.log(res);

            });

    }

    return ready && doneLoading ? (<>
        <div>
            <Nav tabs>
                <NavItem>

                    <NavLink
                        className={activeTab === '1' ? 'bg-primary text-white' : ''}
                        active={activeTab === '1'}
                        onClick={() => { toggle('1'); }}
                    >
                        Logging
          </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={activeTab === '2' ? 'bg-primary text-white' : ''}
                        active={activeTab === '2'}
                        onClick={() => { toggle('2'); }}
                    >
                        Personal Information
          </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>

                <TabPane tabId="1">
                    Packet Capture Enabled:
            <ButtonDropdown
                        isOpen={captureButtonIsOpen}
                        toggle={() => { setCaptureButtonIsOpen(!captureButtonIsOpen) }}
                        size='sm'
                    >
                        <Button id="caret" color={log.app.captureForReplay ? 'danger' : 'primary'} onClick={changeReplay}>{log.app.captureForReplay ? 'Stop' : captureButtonType ? 'Capture with Reset' : 'Capture without Reset'}</Button>
                        {!log.app.captureForReplay &&
                            <><DropdownToggle caret color={log.app.captureForReplay ? 'danger' : 'primary'} />
                                <DropdownMenu>
                                    <DropdownItem onClick={() => setCaptureButtonType(true)}>Capture with Reset</DropdownItem>
                                    <DropdownItem onClick={() => setCaptureButtonType(false)}>Capture without Reset</DropdownItem>
                                </DropdownMenu></>}
                    </ButtonDropdown>

                    <br />
            App logging enabled:

            <Button style={{ marginLeft: '5px' }} onClick={() => toggleAppSetting('log.app.enabled')} color={log.app.enabled ? 'success' : 'secondary'} size='sm' disabled={log.app.captureForReplay}>{log.app.enabled ? 'On' : 'Off'}</Button>
                    <br />

            App log level:
                            <ButtonDropdown style={{ marginLeft: '5px' }} isOpen={dropdownLevelOpen} toggle={toggleLevelDropDown} size='sm'
                        disabled={log.app.captureForReplay}
                    >
                        <DropdownToggle caret
                            disabled={log.app.captureForReplay}
                        >
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
                    {console.log(`log.packet:`)} {console.log(log.packet)}
            Log to console:
            <Button style={{ marginLeft: '5px' }} onClick={() => toggleAppSetting('log.packet.logToConsole')} color={log.packet.logToConsole ? 'success' : 'secondary'} size='sm'
                        disabled={log.app.captureForReplay}
                    >{log.packet.logToConsole ? 'On' : 'Off'}</Button>
                    <br />

            Log broadcast packets:

            <Button style={{ marginLeft: '5px' }} onClick={() => toggleAppSetting('log.packet.broadcast.enabled')} color={log.packet.broadcast.enabled ? 'success' : 'secondary'} size='sm'
                        disabled={log.app.captureForReplay}
                    >{log.packet.broadcast?.enabled ? 'On' : 'Off'}</Button>

                    <Button style={{ marginLeft: '5px' }} color="link" id="toggler2" size='sm'>
                        Include Broadcast Actions...
    </Button>
                    <UncontrolledCollapse toggler="#toggler2">
                        <Card>
                            <CardBody>
                                <ButtonGroup vertical={true}>

                                    <Button color="primary" onClick={() => onCheckboxBtnClick(-1)} active={!includeBroadcastActions.length} size='sm' key='include.-1'
                                        disabled={log.app?.captureForReplay}
                                    >All</Button>
                                    {broadcast.map(el => {
                                        return (<Button color="primary" onClick={() => onCheckboxBtnClick(el.val)} active={includeBroadcastActions.includes(el.val)} size='sm' key={`include.${el.val}`}>{`${el.val} - ${el.desc}`}</Button>);
                                    })}

                                </ButtonGroup>
                            </CardBody>
                        </Card>
                    </UncontrolledCollapse>
                    <br />
    Log pump messages: <Button
                        style={{ marginLeft: '5px' }}
                        onClick={() => toggleAppSetting('log.packet.pump.enabled')}
                        color={log.packet.pump.enabled ? 'success' : 'secondary'}
                        size='sm'
                        disabled={log.app.captureForReplay}
                    >{log.packet.pump.enabled ? 'On' : 'Off'}</Button>
                    <br />
    Log chlorinator messages: <Button
                        style={{ marginLeft: '5px' }}
                        onClick={() => toggleAppSetting('log.packet.chlorinator.enabled')}
                        color={log.packet.chlorinator.enabled ? 'success' : 'secondary'}
                        size='sm'
                        disabled={log.app.captureForReplay}
                    >{log.packet.chlorinator.enabled ? 'On' : 'Off'}</Button>

                </TabPane>


                <TabPane tabId="2">


                    <Form onSubmit={changeGeneral}>

                        <Row form>
                            <Col md={6}>

                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="alias">Pool Alias</Label>
                                    <Input type="text" name="alias" id="alias"
                                        defaultValue={data.general.pool?.alias || ''} />
                                </FormGroup>
                            </Col>
                        </Row>

                        <h2>Owner</h2>
                        <Row form>
                            <Col md={6}>
                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="ownerName">Name</Label>
                                    <Input type="text" name="ownerName" id="ownerName"
                                        defaultValue={data.general.pool?.owner?.name || ''}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row form>
                            <Col md={6}>

                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="ownerPhone" >Phone</Label>

                                    <Input type="text" name="ownerPhone" id="ownerPhone"
                                        defaultValue={data.general.pool?.owner?.phone || ''}
                                    />

                                </FormGroup>
                            </Col>


                            <Col md={6}>
                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="ownerPhone2" >Phone 2</Label>

                                    <Input type="text" name="ownerPhone2" id="ownerPhone2"
                                        defaultValue={data.general.pool?.owner?.phone2 || ''}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>



                        <Row form>
                            <Col md={6}>
                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="ownerEmail" >Email</Label>
                                    <Input type="email" name="ownerEmail" id="ownerEmail"
                                        defaultValue={data.general.pool?.owner?.email || ''}
                                    />

                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup>
                                    <Label className={'mb-0'} for="ownerEmail2">Email 2</Label>
                                    <Input type="email" name="ownerEmail2" id="ownerEmail2"
                                        defaultValue={data.general.pool?.owner?.email2 || ''}
                                    />

                                </FormGroup>
                            </Col>
                        </Row>
                        <h2>Location</h2>
                        <Row form>

                            <Col md={6}>
                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="address">Address</Label>
                                    <Input type="text" name="address" id="address"
                                        defaultValue={data.general.pool?.location?.address || ''}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row form>
                            <Col md={6}>

                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="city">City</Label>
                                    <Input type="text" name="city" id="city"
                                        defaultValue={data.general.pool?.location?.city || ''}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>

                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="state">State</Label>
                                    <Input type="text" name="state" id="state"
                                        defaultValue={data.general.pool?.location?.state || ''}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>

                        <Row form>
                            <Col md={6}>

                                <FormGroup className={'mb-0'}>
                                    <Label className={'mb-0'} for="zip">Zip</Label>
                                    <Input type="text" name="zip" id="zip"
                                        defaultValue={data.general.pool?.location?.zip || ''}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>


                                <FormGroup>
                                    <Label className={'mb-0'} for="country">Select</Label>
                                    <Input type="select" name="select" id="country">
                                        {data.general?.countries?.map(k => {
                                            return (<option key={k.val}>{k.desc}</option>)
                                        })}
                                    </Input>
                                </FormGroup>
                            </Col>
                        </Row>



                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label className={'mb-0'} for="latitude">Latitude</Label>
                                    <Input type="text" name="latitude" id="latitude"
                                        defaultValue={data.general.pool?.location?.latitude || ''}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>

                                <FormGroup>
                                    <Label className={'mb-0'} for="longitude">Longitude</Label>
                                    <Input type="text" name="longitude" id="longitude"
                                        defaultValue={data.general.pool?.location?.longitude || ''}
                                    />
                                </FormGroup>
                            </Col>
                        </Row>


                        <Row form>
                            <Col md={6}>
                                <FormGroup>
                                    <Label className={'mb-0'} for="clockSource">Clock Source</Label>
                                    <Input type="select" name="select" id="clockSource" defaultValue={data.general.pool.options.clockSource || 0} >
                                        {data.general?.clockSources?.map(k => {
                                            return (<option key={k.val} value={k.val}>{k.desc}</option>)
                                        })}
                                    </Input>
                                </FormGroup>
                            </Col>

                            <Col md={6}>

                                <FormGroup>
                                    <Label className={'mb-0'} for="timezone">TimeZone</Label>
                                    <Input type="select" name="select" id="timezone" defaultValue={data.general.pool.location.timeZone} >
                                        {data.general?.timeZones?.map(k => {
                                            return (<option key={k.val} value={k.val}>({k.utcOffset}) {k.name}</option>)
                                        })}
                                    </Input>
                                </FormGroup>
                            </Col>

                        </Row>
                        <Button type='submit'>Save</Button>
                    </Form>


                </TabPane>
            </TabContent>
        </div>

    </>)
        : (<>Loading options...</>);

}

export default SysInfoEditLogger;
