import {
    Button, DropdownToggle, DropdownMenu, DropdownItem, ListGroupItem, UncontrolledButtonDropdown
} from 'reactstrap';
import CustomCard from '../CustomCard';
import React, { useContext, useState, useEffect, useReducer, Dispatch, SetStateAction } from 'react';
import { getItemById, IStateCircuit, IConfigEquipment, ControllerType, IDetail, getItemByVal, PoolContext, } from '../PoolController';
import { comms } from '../Socket_Client';
import { RIEToggle, RIEInput, RIETextArea, RIENumber, RIETags, RIESelect } from '@attently/riek';
import '../../css/dropdownselect';
import useDataApi from '../DataFetchAPI';
const editIcon=require('../../images/edit.png');
const deleteIcon=require('../../images/delete.svg');

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
    const {poolURL} = useContext(PoolContext);
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
    const update = () =>{
        let arr=[];
        props.type==='circuits'?
            arr.push({ url: `${ poolURL }/config/options/circuits`, dataName: 'circuits' }):
            arr.push({ url: `${ poolURL }/config/options/features`, dataName: 'circuits' });
        doFetch(arr);
    }
    useEffect(()=>{
        if (typeof poolURL !== 'undefined') update();
    },[poolURL])

/*     let arr=[];
    props.type==='circuits'?
        arr.push({ url: `${ poolURL }/config/options/circuits`, dataName: 'circuits' }):
        arr.push({ url: `${ poolURL }/config/options/features`, dataName: 'circuits' });
    const [changes, setChanges] = useState([]) */

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);


    const [disabledList, setDisabledList]=useState<number[]>([]);
    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {

        let emitter=comms.getEmitter();
        if (props.type === 'features'){

            const fnFeature=function(data) {
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: ['circuits','features'], data });
                setDisabledList(disabledList => disabledList.filter(el => el!==data.id));
            };
            emitter.on('feature', fnFeature);
            return () => {
                emitter.removeListener('feature', fnFeature);
            };
        }
        else {

            const fnCircuit=function(data) {
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: ['circuits','circuits'], data });
                setDisabledList(disabledList => disabledList.filter(el => el!==data.id));
            };
            emitter.on('circuit', fnCircuit);
            return () => {
                emitter.removeListener('circuit', fnCircuit);
            };
        }
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */



    function addDisabledList(circ) {
        if(disabledList.includes(circ)) return;
        else setDisabledList([...disabledList, circ]);
    }

    async function handleCircuitChange(event: any) {
        let circId=parseInt(event.target.getAttribute('data-circuit'));
        let circFunc=JSON.parse(event.target.value);
        console.log(circFunc);
        if(circFunc.desc==='Not Used'){
            await comms.deleteCircuit({ id: circId });
        }
        else {
            console.log(`{ id: circId, type: circFunc.val:  ${ circId }  ${ circFunc.val }   ${ circFunc.val||0 }`)
            await comms.setCircuit({ id: circId, type: circFunc.val });
        }
        update();
        addDisabledList(circId);
        props.setNeedsReload(true);
    }
    async function handleDelete(event: any) {
        let circId=parseInt(event.target.getAttribute('data-circuit'));
        await comms.deleteCircuit({ id: circId });
        addDisabledList(circId);
        update();
        props.setNeedsReload(true);
    }

    function findCircFunc(circuit: IStateCircuit) {
        let cf = getItemByVal(data.circuits.functions, circuit.type);
        return cf || data.circuits.functions[0];
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
        if(Array.isArray(data.circuits.functions)&&!data.circuits.functions.length) return;
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

    const changeName= async (data) => {
        console.log(data);
        const id=parseInt(Object.keys(data)[0], 10);
        const name=Object.values(data)[0];
        await comms.setCircuit({ id, name });
        addDisabledList(id);
        update();
        props.setNeedsReload(true);
    };
    const changeNameById= async (event) => {
        let circId=parseInt(event.target.getAttribute('data-circuit'));
        let circName=JSON.parse(event.target.value);
        console.log(circName);
        await comms.setCircuit({ id: circId, nameId: circName.val });
        addDisabledList(circId);
        update();
        props.setNeedsReload(true);
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
        let _circs=props.type==='circuits'?data.circuits.circuits:data.circuits.features;
        const notUsed=data.circuits.functions.filter(circ => { return circ.name==='notused'; })[0];
        let res: React.ReactFragment[]=[];
        let start=data.circuits.equipmentIds.start;
        let end=data.circuits.equipmentIds.end;
        for(let i=start;i<=end;i++) {
            if (data.circuits.invalidIds.includes(i)) continue;
            let circ=getItemById(_circs, i);
            let _style={};
            if(circ===0) {
                circ={ id: i, name: 'Not Used', nameId: 0, type: data.circuits.functions[0] };
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

    return (
    <>
        {data.isError&&'Error loading results.'}
        {!doneLoading? <>Loading...</>:
            <div className="tab-pane active" id="Circuit" role="tabpanel" aria-labelledby="Circuit-tab">

                <CustomCard name='Circuit Config'  id={props.id}>
                    {allCircuitsDisplay(props.type)}
                </CustomCard>

            </div>
        }</>

    )


}

export default CircuitModalPopup;