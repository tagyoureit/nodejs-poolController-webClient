import React, { useState, useEffect, useContext } from 'react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import { Col, Container, Row, DropdownToggle, UncontrolledButtonDropdown, DropdownItem, DropdownMenu, Button, UncontrolledAlert, Alert, ButtonGroup } from 'reactstrap';
import '../css/rangeslider.css';
import { useAPI } from './Comms';
import { IExtendedChemController, IDetail, PoolContext } from './PoolController';
import useDataApi from './DataFetchAPI';
import { RIEInput } from '@attently/riek';
const editIcon = require('../images/edit.png');
var extend = require("extend");

interface Props {
    // chemControllers: IExtendedChemController[];
    doUpdate: (obj: any) => void
}
const initialState: {
    options: {
        types: IDetail[],
        tempUnits: IDetail[],
        status1: IDetail[],
        status2: IDetail[],
        waterFlow: IDetail[],
        maxChemControllers: number
    }
} = {
    options: {
        types: [],
        tempUnits: [],
        status1: [],
        status2: [],
        waterFlow: [],
        maxChemControllers: 1
    }
}
function ChemControllerEdit(props: Props) {
    // const [data.options.controllers, setLocalChemData] = useState(props.chemControllers);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi([], initialState);
    const { poolURL } = useContext(PoolContext);
    const [error, seterror] = useState<React.ReactFragment>('');
    useEffect(() => {
        let arr = [];
        arr.push({ url: `${poolURL}/config/options/chemControllers`, dataName: 'options' });
        doFetch(arr);
    }, []);
    // useEffect(() => {
    //     setLocalChemData(props.chemControllers);
    // }, [JSON.stringify(props.chemControllers)]);
    const execute = useAPI();

    const onChange = (type: string, val: number | string | boolean, address: number) => {
        let chemController = extend(true, {}, data.options.controllers.find(c => c.address === address));
        switch (type) {
            case 'ph':
                chemController.pHSetpoint = val as number;
                break;
            case 'orp':
                chemController.orpSetpoint = val as number;
                break;
            case 'cya':
                chemController.cyanuricAcid = val as number;
                break;
            case 'ch':
                chemController.calciumHardness = val as number;
                break;
            case 'alk':
                chemController.alkalinity = val as number;
                break
            case 'name':
                chemController.name = val as string;
                break;
            default:
                console.log(`Unkown type: ${type}`);

        }
        doUpdate({ updateType: 'MERGE_ARRAY', dataName: ['options','controllers'], data: chemController })
        // let _new = extend(true, [], data.options.controllers)
        // setLocalChemData(_new)
    }

    const onChangeComplete = (address: number) => {
        const setdata = async () => {
            let chemController = data.options.controllers.find(c => c.address === address);;
            let res = await execute('setChemControllerConfig', {
                "address": chemController.address,
                "pHSetpoint": chemController.pHSetpoint,
                "orpSetpoint": chemController.orpSetpoint,
                "calciumHardness": chemController.calciumHardness,
                "cyanuricAcid": chemController.cyanuricAcid,
                "alkalinity": chemController.alkalinity,
                "name": chemController.name,
                "isVirtual": chemController.isVirtual
            })
            if (typeof res.stack === 'undefined') {
                props.doUpdate({ updateType: 'MERGE_ARRAY', data: res, dataName: 'chemControllers' });
            }
            else {
                console.log(`Error: ${JSON.stringify(res)}`);
                setErrorHandler(JSON.stringify(res));
            }
        }
        setdata()
    };
    const changeName = async (data) => {

        for (const [k, v] of Object.entries(data)) {
            onChange('name', v as string, parseInt(k, 10));
            onChangeComplete(parseInt(k, 10));
        }
    }
    const handleAdd = async () => {
        let res:any = await execute('setChemControllerConfig', {})
        if (typeof res.stack === 'undefined') {
            if (Object.entries(res).length === 0){
                return;
            }
            let copy = extend(true, [], data.options.controllers);
            copy.push(res);
            // setLocalChemData(copy)
            props.doUpdate({ updateType: 'REPLACE', data: copy, dataName: 'chemControllers' });
            doUpdate({updateType: 'REPLACE', data: copy, dataName: ['options', 'controllers']});
        }
        else {
            console.log(`Error: ${JSON.stringify(res)}`);
            setErrorHandler(JSON.stringify(data));
        }
    }

    async function handleTypeChange(event: any) {
        let address = parseInt(event.target.getAttribute('data-chemaddress'));
        let type = parseInt(event.target.value,10);
        const setdata = async () => {
            // let chemController = data.options.controllers.find(c => c.id === id);;
            let res = await execute('setChemControllerConfig', {
                address,
                type
            })
            if (typeof res.stack === 'undefined') {
                if (type === 0) {
                    // delete
                    let idx = data.options.controllers.findIndex(c => c.address === address)
;                   let copy = extend(true, [], data.options.controllers)
                    copy.splice(idx, 1);
                    // setLocalChemData(copy);
                    props.doUpdate({ updateType: 'REPLACE',data: copy, dataName: 'chemControllers' });
                    doUpdate({updateType: 'REPLACE', data: copy, dataName: ['options', 'controllers']});
                    return;
                }
                props.doUpdate({ updateType: 'MERGE_ARRAY', data: res, dataName: 'chemControllers' });
                doUpdate({ updateType: 'REPLACE_ARRAY', data: res, dataName: ['options','controllers'] })
            }
            else {
                console.log(`ERROR: ${JSON.stringify(res)}`);
                setErrorHandler(JSON.stringify(res));
            }
        }
        setdata()
    }
    async function handleIntelliChemVirtual(address: number, isVirtual: boolean) {
        const setdata = async () => {
            // let chemController = data.options.controllers.find(c => c.id === id);;
            try {

                let res = await execute('setChemControllerConfig', {
                    address,
                    isVirtual
                })
                if (typeof res.stack === 'undefined') {
                    props.doUpdate({ updateType: 'MERGE_ARRAY', data: res, dataName: 'chemControllers' });
                    doUpdate({ updateType: 'REPLACE_ARRAY', data: res, dataName: ['options','controllers'] })
                }
                else {
                    console.log(`ERROR: ${JSON.stringify(res)}`);
                    setErrorHandler(JSON.stringify(res));
                }
            }
            catch (err) {
                console.log(err);
                if (typeof err.response.data.message !== 'undefined'){
                    console.log(err.response.data.message)
                    let msg: React.ReactFragment = (<><b>{err.response.data.message}</b><p>{err.response.data.stack}</p></>)
                    setErrorHandler(msg);
                }
            }
        }
        setdata()
    }
    const heightStyle = {
        height: typeof data?.chemControllers?.controllers?.length === 'undefined' ? `385px` : `${310 * data.options.controllers.length || 0 + 75}px`
    };
    const customPHLabels = { 7.2: "7.2", 7.6: "7.6" };
    const customORPLabels = { 500: "500", 650: "650", 750: "750", 850: "850" };
    const customCHLabels = { 0: "0", 200: "200", 400: "400", 1000: "1000" };
    const customCYALabels = { 0: "0", 30: "30", 50: "50", 100: "100" };
    const customALKLabels = { 0: "0", 80: "80", 120: "120", 240: "240" };
    
    const [visible, setVisible] = useState(false);
    const onDismiss = () => {setVisible(false); seterror('')};
    const setErrorHandler = (err) => {seterror(err); setVisible(true);}
 
    return (doneLoading ? <>
        <div>
        <Alert color="danger" isOpen={visible} toggle={onDismiss}>
      {error}
    </Alert>
            <Container style={heightStyle}>
                {data.options.controllers.map((cC) => {
                    return (<Container key={`chemController${cC.address}edit`} className='mb-5'>
                        <Row>
                            <Col sm="auto">
                                <RIEInput
                                    value={typeof cC.name !== 'undefined'? cC.name : `Chem Controller ${cC.address}`}
                                    change={changeName}
                                    propName={cC.address.toString()}
                                    className={"editable"}
                                    classLoading="loading"
                                    classInvalid="invalid"
                                />
                                <img src={editIcon} width='15px' height='15px' />
                            </Col>
                            <Col>
                                <UncontrolledButtonDropdown
                                    size='sm'
                                    className='mb-1 mt-1'
                                >
                                    <DropdownToggle caret
                                    >   
                                        {data.options.types.find(type => type.val === cC.type).desc}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {data.options.types.map(type => {
                                            return <DropdownItem
                                                key={`cC${cC.address}name${type.val}`}
                                                value={type.val}
                                                data-chemaddress={cC.address}
                                                onClick={handleTypeChange}
                                            >
                                                {type.desc}
                                            </DropdownItem>
                                        })}
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                                {cC.type === data.options.types.find(type => type.name === 'intellichem').val &&      
                                <ButtonGroup>
                                    <Button color="secondary" size="sm" className="mb-1 mt-1" onClick={() => handleIntelliChemVirtual(cC.address, true)} active={cC.isVirtual}>Standalone</Button>
                                    <Button color="secondary" size="sm" className="mb-1 mt-1" onClick={() => handleIntelliChemVirtual(cC.address, false)} active={!cC.isVirtual}>Connected to OCP</Button>

                                </ButtonGroup> }
                            </Col>
                        </Row>
                        <Row>Set points</Row>
                        <Row>
                            <Col xs='1' className='center'>
                                pH
                        </Col>
                            <Col>
                                <Slider
                                    labels={customPHLabels}
                                    value={cC.pHSetpoint}
                                    onChange={(val) => onChange('ph', val, cC.address)}
                                    onChangeComplete={() => { onChangeComplete(cC.address) }}
                                    min={7.2}
                                    max={7.6}
                                    step={0.1}
                                    data-chemaddress={cC.address}
                                />
                            </Col>
                            <Col xs='1' className='center'>
                                {cC.pHSetpoint}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs='1' className='center'>
                                ORP
                        </Col>
                            <Col>
                                <Slider
                                    labels={customORPLabels}
                                    value={cC.orpSetpoint}
                                    onChange={(val) => onChange('orp', val, cC.address)}
                                    onChangeComplete={() => { onChangeComplete(cC.address) }}
                                    min={500}
                                    max={850}
                                    step={10}
                                />
                            </Col>
                            <Col xs='1' className='center'>
                                {cC.orpSetpoint}
                            </Col>
                        </Row>
                        <Row>Readings</Row>
                        <Row>
                            <Col xs='1' className='center'>
                                Alk
                        </Col>
                            <Col>
                                <Slider
                                    labels={customALKLabels}
                                    value={cC.alkalinity}
                                    onChange={(val) => onChange('alk', val, cC.address)}
                                    onChangeComplete={() => { onChangeComplete(cC.address) }}
                                    min={0}
                                    max={240}
                                    step={5}
                                />
                            </Col>
                            <Col xs='1' className='center'>
                                {cC.alkalinity}
                            </Col>
                        </Row>
                        <Row>
                            <Col xs='1' className='center'>
                                CH
                        </Col>
                            <Col>
                                <Slider
                                    labels={customCHLabels}
                                    value={cC.calciumHardness}
                                    onChange={(val) => onChange('ch', val, cC.address)}
                                    onChangeComplete={() => { onChangeComplete(cC.address) }}
                                    min={0}
                                    max={1000}
                                    step={10}
                                />
                            </Col>
                            <Col xs='1' className='center'>
                                {cC.calciumHardness}
                            </Col>
                        </Row>
                        <Row >
                            <Col xs='1' className='center'>
                                CYA
                        </Col>
                            <Col>
                                <Slider
                                    labels={customCYALabels}
                                    value={cC.cyanuricAcid}
                                    onChange={(val) => onChange('cya', val, cC.address)}
                                    onChangeComplete={() => { onChangeComplete(cC.address) }}
                                    min={0}
                                    max={100}
                                    step={5}
                                />
                            </Col>
                            <Col xs='1' className='center'>
                                {cC.cyanuricAcid}
                            </Col>
                        </Row>

                    </Container>
                    );
                })}
                {data.options.controllers.length < data.options.maxChemControllers &&
                    <Button color={'primary'}
                        onClick={handleAdd}>
                        Add Chem Controller
                            </Button>
                }
            </Container>
        </div >
    </>: <> Not loaded yet </>
    );
}

export default ChemControllerEdit;