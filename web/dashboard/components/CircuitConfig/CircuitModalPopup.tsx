import '../../css/dropdownselect';

import { RIEInput } from '@attently/riek';
import React, { Dispatch, SetStateAction, useContext, useEffect, useReducer, useState } from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, ListGroupItem, UncontrolledButtonDropdown, Row, Col } from 'reactstrap';

import CustomCard from '../CustomCard';
import useDataApi from '../DataFetchAPI';
import { ControllerType, getItemById, getItemByVal, IDetail, IStateCircuit, PoolContext, IConfigCircuit } from '../PoolController';
import { useAPI } from '../Comms';
import Switch from 'react-switch';
import { AxiosAdapter, AxiosPromise, AxiosResponse } from 'axios';

const editIcon = require('../../images/edit.png');
const deleteIcon = require('../../images/delete.svg');

interface Props {
    id: string;
    setNeedsReload: Dispatch<SetStateAction<boolean>>;//Dispatch<SetStateAction<boolean>>
    needsReload: boolean
    controllerType: ControllerType;
    type: string
}
interface InitialState {
    circuits: IStateCircuit[],
    features: IStateCircuit[],
    count: number,
    ready: boolean,
    circuitNames: IDetail[],
    circuitFunctions: any[],
    disabledList: number[],
    equipment: any;
}

function CircuitModalPopup(props: Props) {
    const { poolURL, controllerType, emitter } = useContext(PoolContext);
    const execute = useAPI();
    const initialState: InitialState =
    {
        circuits: [],
        features: [],
        circuitNames: [],
        circuitFunctions: [],
        count: 0,
        ready: false,
        disabledList: [],
        equipment: {}
    };
    const update = () => {
        let arr = [];
        props.type === 'circuits' ?
            arr.push({ url: `${poolURL}/config/options/circuits`, dataName: 'circuits' }) :
            arr.push({ url: `${poolURL}/config/options/features`, dataName: 'circuits' });
        doFetch(arr);
    }
    useEffect(() => {
        if (typeof poolURL !== 'undefined') update();
    }, [poolURL])

    /*     let arr=[];
        props.type==='circuits'?
            arr.push({ url: `${ poolURL }/config/options/circuits`, dataName: 'circuits' }):
            arr.push({ url: `${ poolURL }/config/options/features`, dataName: 'circuits' });
        const [changes, setChanges] = useState([]) */

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi(undefined, initialState);


    const [disabledList, setDisabledList] = useState<number[]>([]);
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {

        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined') {
            if (props.type === 'features') {

                const fnFeature = function (data) {
                    doUpdate({ updateType: 'MERGE_ARRAY', dataName: ['circuits', 'features'], data });
                    setDisabledList(disabledList => disabledList.filter(el => el !== data.id));
                };
                emitter.on('feature', fnFeature);
                return () => {
                    emitter.removeListener('feature', fnFeature);
                };
            }
            else {

                const fnCircuit = function (data) {
                    doUpdate({ updateType: 'MERGE_ARRAY', dataName: ['circuits', 'circuits'], data });
                    setDisabledList(disabledList => disabledList.filter(el => el !== data.id));
                };
                emitter.on('circuit', fnCircuit);
                return () => {
                    emitter.removeListener('circuit', fnCircuit);
                };
            }
        }
    }, [poolURL, emitter]);
    /* eslint-enable react-hooks/exhaustive-deps */



    function addDisabledList(circ) {
        // if(disabledList.includes(circ)) return;
        // else setDisabledList([...disabledList, circ]);
    }

    async function handleCircuitChange(event: any) {
        let circId = parseInt(event.target.getAttribute('data-circuit'));
        let circFunc = JSON.parse(event.target.value);
        console.log(circFunc);
        if (circFunc.desc.toLowerCase() === 'not used') {
            await execute('deleteCircuit', { id: circId });
        }
        else {
            console.log(`{ id: circId, type: circFunc.val:  ${circId}  ${circFunc.val}   ${circFunc.val || 0}`)
            let res: AxiosResponse;
            if (props.type === 'features') {
                res = await execute('setFeature', { id: circId, type: circFunc.val });
            }
            else {
                res = await execute('setCircuit', { id: circId, type: circFunc.val });
            }
        }
        update();
        addDisabledList(circId);
        props.setNeedsReload(true);
    }
    async function handleDelete(event: any) {
        let circId = parseInt(event.target.getAttribute('data-circuit'));
        let res = await execute('deleteCircuit', { id: circId });
        addDisabledList(circId);

        update();
        props.setNeedsReload(true);
    }

    function findCircFunc(circuit: IConfigCircuit) {
        let cf = getItemByVal(data.circuits.functions, circuit.type);
        return cf || data.circuits.functions[0];
    }
    function formatCF(circuit, cf) {
        if (cf.val === findCircFunc(circuit).val)
            return (<b>{cf.desc}</b>)
        else
            return <>{cf.desc}</>;
    }
    function formatCN(circuit, cn) {
        if (cn.val === circuit.nameId)
            return (<b>{cn.desc}</b>);
        else
            return <>{cn.desc}</>;
    }
    function circFuncDropdown(circuit: IConfigCircuit) {
        if (Array.isArray(data.circuits.functions) && !data.circuits.functions.length) return;
        return (
            <UncontrolledButtonDropdown
                size='sm'
                className='mb-1 mt-1'
            >
                <DropdownToggle caret
                //disabled={circuit.nameId===0||disabledList.includes(circuit.id)}
                >
                    {findCircFunc(circuit).desc}
                </DropdownToggle>
                <DropdownMenu>
                    {data.circuits.functions.map(cf => {
                        return <DropdownItem
                            key={`circuit${circuit.id}cf${cf.val}circFunc`}
                            value={JSON.stringify(cf)}
                            className={cf.desc === 'Not Used' ? 'colorRed' : ''}
                            data-circuit={circuit.id}
                            onClick={handleCircuitChange}
                        >
                            {formatCF(circuit, cf)}
                        </DropdownItem>;
                    })}
                </DropdownMenu>
            </UncontrolledButtonDropdown>
        );
    }

    const handleShowInFeaturesChange = async (id: number, data: boolean) => {
        console.log(data);
        addDisabledList(id);
        let res = await execute('setCircuit', { id, [props.id === 'featureConfig' ? 'showInFeatures' : 'showInCircuits']: data });
        update();
        props.setNeedsReload(true);
    };
    const changeName = async (data) => {
        console.log(data);
        const id = parseInt(Object.keys(data)[0], 10);
        const name = Object.values(data)[0];
        let res = await execute('setCircuit', { id, name });
        addDisabledList(id);
        update();
        props.setNeedsReload(true);
    };
    const changeNameById = async (event) => {
        let circId = parseInt(event.target.getAttribute('data-circuit'));
        let circName = JSON.parse(event.target.value);
        console.log(circName);
        await execute('setCircuit', { id: circId, nameId: circName.val });
        addDisabledList(circId);
        update();
        props.setNeedsReload(true);
    };
    const changeFreeze = async (id: number, data: boolean) => {
        console.log(data);
        addDisabledList(id);
        let res = await execute('setCircuit', { id, freeze: data });
        update();
        props.setNeedsReload(true);
    }

    function circTypeInOrDropDown(circ) {
        if (controllerType.toString().toLowerCase().includes('touch')) {
            return (
                <UncontrolledButtonDropdown
                    direction="right"
                    size='sm'
                    className='mb-1 mt-1'
                >
                    <DropdownToggle caret
                        disabled={disabledList.includes(circ.id)}
                    >
                        {circ.name}
                    </DropdownToggle>
                    <DropdownMenu
                        modifiers={{
                            setMaxHeight: {
                                enabled: true,
                                order: 890,
                                fn: (data) => {
                                    return {
                                        ...data,
                                        styles: {
                                            ...data.styles,
                                            overflow: 'auto',
                                            maxHeight: '400px'
                                        }
                                    }
                                }
                            }
                        }}
                    >
                        {data.circuits.equipmentNames.map(cn => {
                            return <DropdownItem
                                key={`circuit${circ.id}cn${cn.val}circName`}
                                value={JSON.stringify(cn)}
                                data-circuit={circ.id}
                                onClick={changeNameById}
                            >
                                {formatCN(circ, cn)}
                            </DropdownItem>;
                        })}
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            );
        }
        else {
            return (<><RIEInput
                value={circ.name}
                change={changeName}
                propName={circ.id.toString()}
                className={"editable"}
                classLoading="loading"
                classInvalid="invalid"
            />
                <img src={editIcon} width='15px' height='15px' /></>);
        }

    }
    function allCircuitsDisplay() {
        let _circs: IConfigCircuit[] = props.type === 'circuits' ? data.circuits.circuits : data.circuits.features;
        const notUsed = data.circuits.functions.find(circ => circ.name === 'notused');
        let res: React.ReactFragment[] = [];
        let start = data.circuits.equipmentIds.start;
        let end = data.circuits.equipmentIds.end;
        res.push(
            <ListGroupItem key={'header-row'}>
                   <Row>
                        <Col md='3' xs='6' >
                         Id - name
                         </Col>
                        <Col md='2' xs='6'>
                            Show
                        </Col>
                        <Col md='3' xs='6'>
                            Function
                        </Col>
                        <Col md='2' xs='6'>
                            Freeze
                        </Col>
                    </Row>
            </ListGroupItem>
        );
        for (let i = start; i <= end; i++) {
            if (data.circuits.invalidIds.includes(i)) continue;
            let circ: IConfigCircuit = _circs.find(c => c.id === i);
            let _style = {};
            if (typeof circ === 'undefined') {
                circ = { id: i, name: 'Not Used', nameId: 0, type: data.circuits.functions[0], showInFeatures: false };
            }
            if (circ.nameId === 0) _style = { opacity: '50%' };
            res.push(
                <ListGroupItem key={circ.id + 'circuitlistgroupkey'}>
                    <Row>
                        <Col md='3' xs='6' className='p-0'>
                            {`${circ.id} - `}
                            {circTypeInOrDropDown(circ)}
                            &nbsp;
                             {circ.name !== 'Not Used' && !disabledList.includes(circ.id) ? <img src={deleteIcon} width='15px' height='15px' data-circuit={circ.id} onClick={handleDelete} /> : ''}
                        </Col>
                        <Col md='2' xs='6' className='p-0'>

                            {props.id === 'featureConfig' && <Switch
                                onChange={(data) => { handleShowInFeaturesChange(circ.id, data) }}
                                checked={props.id === 'featureConfig' ? circ.showInFeatures : circ.showInCircuits}
                                disabled={disabledList.includes(circ.id)}
                                aria-label="Show in features toggle"
                            />}
                        </Col>

                        <Col md='3' xs='6' className='p-0'>
                            {circFuncDropdown(circ)}
                        </Col>
                        <Col md='2' xs='6' className='p-0'>

                            <Switch
                                onChange={(data) => { changeFreeze(circ.id, data) }}
                                checked={circ.freeze || false} // TODO: remove from virtual controller
                                disabled={disabledList.includes(circ.id)}
                                aria-label="Freeze toggle"
                            />
                            </Col>
                    </Row>
                </ListGroupItem>
            );

        }
        return res;
    }

    return (
        <>
            {data.isError && 'Error loading results.'}
            {!doneLoading ? <>Loading...</> :
                <div className="tab-pane active" id="Circuit" role="tabpanel" aria-labelledby="Circuit-tab">

                    <CustomCard name={props.type === 'features' ? 'Feature Config' : 'Circuit Config'} id={props.id}>

                        {allCircuitsDisplay()}
                    </CustomCard>

                </div>
            }</>

    )


}

export default CircuitModalPopup;