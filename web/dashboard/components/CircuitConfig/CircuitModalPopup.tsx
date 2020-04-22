import {
    Button, DropdownToggle, DropdownMenu, DropdownItem, ListGroupItem, UncontrolledButtonDropdown
} from 'reactstrap';
import CustomCard from '../CustomCard';
import React, { useState, useEffect, useReducer } from 'react';
import { getItemById, IStateCircuit, IConfigEquipment, ControllerType, IDetail, } from '../PoolController';
import { comms } from '../Socket_Client';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from '@attently/riek';
import '../../css/dropdownselect';
import useDataApi from '../DataFetchAPI';

const editIcon=require('../../images/edit.png');
const deleteIcon=require('../../images/delete.svg');

interface Props {
    id: string;
    visibility: string;
    controllerType: ControllerType;
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

    const initialState: InitialState=
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
    let arr=[];
    arr.push({ url: `${ comms.poolURL }/config/equipment`, name: 'equipment' });
    arr.push({ url: `${ comms.poolURL }/config/circuit/functions`, name: 'circuitFunctions' });
    arr.push({ url: `${ comms.poolURL }/state/circuits`, name: 'circuits' });
    arr.push({ url: `${ comms.poolURL }/state/features`, name: 'features' });
    arr.push({ url: `${ comms.poolURL }/config/circuits/names`, name: 'circuitNames' });


    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);


    const [disabledList, setDisabledList]=useState<number[]>([]);
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {

        let emitter=comms.getEmitter();
        const fnFeature=function(data) {
            doUpdate({ updateType: 'MERGE_OBJECT', dataName: 'features', data });
            setDisabledList(disabledList => disabledList.filter(el => el!==data.id));
        };
        emitter.on('feature', fnFeature);
        const fnCircuit=function(data) {
            doUpdate({ updateType: 'MERGE_OBJECT', dataName: 'circuits', data });
            setDisabledList(disabledList => disabledList.filter(el => el!==data.id));
        };
        emitter.on('circuit', fnCircuit);
        return () => {
            emitter.removeListener('feature', fnFeature);
            emitter.removeListener('circuit', fnCircuit);
        };
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    function addDisabledList(circ) {
        if(disabledList.includes(circ)) return;
        else setDisabledList([...disabledList, circ]);
    }

    function handleCircuitChange(event: any) {
        let circId=parseInt(event.target.getAttribute('data-circuit'));
        let circFunc=JSON.parse(event.target.value);
        console.log(circFunc);
        if(circFunc.desc==='Not Used')
            comms.deleteCircuit({ id: circId });
        else
            comms.setCircuit({ id: circId, type: circFunc.val });
        addDisabledList(circId);;
    }
    function handleDelete(event: any) {
        let circId=parseInt(event.target.getAttribute('data-circuit'));
        comms.deleteCircuit({ id: circId });
        addDisabledList(circId);
    }
    function handleClick(event: any) {
        let _activeLink=event.target.target;
        let _currentPump=parseInt(event.target.target.slice(-1));
        console.log(_activeLink);
        console.log(_currentPump);
        /* this.setState({
            activeLink: _activeLink,
            currentPumpNum: _currentPump,
            currentPumpState: getItemById(this.props.pumpStates, _currentPump),
            currentCircuit: getItemById(this.props.Circuits, _currentPump)
        }) */
    }
    function findCircFunc(circuit: IStateCircuit) {
        for(let i=0;i<data.circuitFunctions.length;i++) {
            if(data.circuitFunctions[i].val===circuit.type.val) {
                return data.circuitFunctions[i];
            }
        }
        return data.circuitFunctions[0];
    }
    function formatCF(circuit, cf) {
        if(cf.val===findCircFunc(circuit).val)
            return (<b>{cf.desc}</b>) as React.ReactFragment;
        else
            return cf.desc;
    }
    function formatCN(circuit, cn) {
        if(cn.val===circuit.nameId)
            return (<b>{cn.desc}</b>) as React.ReactFragment;
        else
            return cn.desc;
    }
    function circFuncDropdown(circuit: IStateCircuit) {
        if(Array.isArray(data.circuitFunctions)&&!data.circuitFunctions.length) return;
        return (
            <UncontrolledButtonDropdown
                size='sm'
                className='mb-1 mt-1'
            >
                <DropdownToggle caret
                    disabled={circuit.nameId===0||disabledList.includes(circuit.id)}
                >
                    {findCircFunc(circuit).desc}
                </DropdownToggle>
                <DropdownMenu>
                    {data.circuitFunctions.map(cf => {
                        return <DropdownItem
                            key={`circuit${ circuit.id }cf${ cf.val }circFunc`}
                            value={JSON.stringify(cf)}
                            className={cf.desc==='Not Used'? 'colorRed':''}
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

    const changeName=(data) => {
        console.log(data);
        const id=parseInt(Object.keys(data)[0], 10);
        const name=Object.values(data)[0];
        comms.setCircuit({ id, name });
        addDisabledList(id);
    };
    const changeNameById=(event) => {
        let circId=parseInt(event.target.getAttribute('data-circuit'));
        let circName=JSON.parse(event.target.value);
        console.log(circName);
        comms.setCircuit({ id: circId, nameId: circName.val });
        addDisabledList(circId);
    };

    function circTypeInOrDropDown(circ) {
        if(props.controllerType.toString().toLowerCase().includes('touch')) {
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
                            fn: (data) =>{
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
                        {data.circuitNames.map(cn => {
                            return <DropdownItem
                                key={`circuit${ circ.id }cn${ cn.val }circName`}
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
    function allCircuitsDisplay(type) {
        let _circs=[];
        if(type==='circuits') _circs=data.circuits;
        else _circs=data.features;
        if(typeof _circs==='undefined'||typeof data.equipment==='undefined') return;
        const notUsed=data.circuitFunctions.filter(circ => { return circ.name==='notused'; })[0];
        let res: React.ReactFragment[]=[];
        let start=type==='circuits'? data.equipment.equipmentIds.circuits.start:data.equipment.equipmentIds.features.start;
        let end=type==='circuits'? data.equipment.equipmentIds.circuits.end:data.equipment.equipmentIds.features.end;
        for(let i=start;i<=end;i++) {
            let circ=getItemById(_circs, i);
            let _style={};
            if(circ===0) {
                circ={ id: i, name: 'Not Used', nameId: 0, type: notUsed };
            }
            if(circ.nameId===0) _style={ opacity: '50%' };
            res.push(
                <ListGroupItem key={circ.id+'circuitlistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        <div>
                            {`${ circ.id } - `}
                            {circTypeInOrDropDown(circ)}

                            &nbsp;
                            {circ.name!=='Not Used'&&!disabledList.includes(circ.id)? <img src={deleteIcon} width='15px' height='15px' data-circuit={circ.id} onClick={handleDelete} />:''}
                        </div>
                        {circFuncDropdown(circ)}
                    </div>

                </ListGroupItem>
            );

        }
        return res;
    }

    return (<>
        {data.isError && 'Error loading results.'}
        {!doneLoading? <>Loading...</>:
            <div className="tab-pane active" id="Circuit" role="tabpanel" aria-labelledby="Circuit-tab">

                <CustomCard name='Circuit Config' visibility={props.visibility} id={props.id}>
                    Circuits
                {allCircuitsDisplay('circuits')}
                    <br />
                Features
                {allCircuitsDisplay('features')}
                </CustomCard>

            </div>
        }</>)
        ;

}

export default CircuitModalPopup;