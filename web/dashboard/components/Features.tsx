import React, { useContext, useEffect, useReducer, useState } from 'react';
import {
    Button,
    ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverBody,
    PopoverHeader,
} from 'reactstrap';

import CircuitModalPopup from './CircuitConfig/CircuitModalPopup';
import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { ControllerType, getItemById, IStateCircuit, PoolContext } from './PoolController';
import { useAPI } from './Comms';
import ErrorBoundary from './ErrorBoundary';
const play = require("../images/play-icon.svg");
const info = require("../images/info-blue-bg.svg");

interface Props {
    id: string;
}


const initialState: { features: IStateCircuit[]; } = { features: [] };

function Features(props: Props) {
    const [popoverOpen, setPopoverOpen] = useState<boolean[]>([false]);
    const [modalOpen, setModalOpen] = useState(false);
    const [needsReload, setNeedsReload] = useState(false);
    const { reload, poolURL, controllerType, emitter } = useContext(PoolContext);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi([], initialState);
    const execute = useAPI();
    useEffect(() => {
        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined') {
            const fn = function (data) {
                console.log(`received feature emit`)
                if (typeof data.features.find(f => f.id === data.id) === 'undefined') {
                    console.log(`Feature trying to update ${data.id} but we don't have it yet.`)
                }
                else doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'features', data });
            };
            let arr = [];
            arr.push({ url: `${poolURL}/extended/features`, dataName: 'features' });
            // arr.push({ url: `${ poolURL }/state/features`, dataName: 'sfeatures' });
            arr.push({ url: `${poolURL}/config/equipment`, dataName: 'equipment' });
            arr.push({ url: `${poolURL}/state/circuitGroups`, dataName: 'circuitGroups' });
            doFetch(arr);

            switch (props.id) {
                case "Features":
                    emitter.on('feature', fn);
                    return () => {
                        emitter.removeListener('feature', fn);
                    };
                case "Circuit Groups":
                    emitter.on('circuitGroup', fn);
                    return () => {
                        emitter.removeListener('circuitGroup', fn);
                    };
            }
        }
    }, [poolURL, emitter])


    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {

    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */
    const toggle = (evt?: any) => {
        let _popover = [...popoverOpen];
        _popover[evt.target.id] = !_popover[evt.target.id];
        setPopoverOpen(_popover)
    }
    const handleClick = (event: any): any => {
        let circ = event.target.value;
        if (getItemById(data.features, circ).isMacro) execute('setCircuitState', { id: circ, state: true });
        execute('toggleCircuit', { id: circ });
    }
    const features = () => {
        if (!data.features || !data.equipment) { return <>No Features</> };
        return data.features.map(feature => {

                let offset = data.equipment.equipmentIds.circuitGroups.start - data.equipment.equipmentIds.features.start;
                let group = getItemById(data.circuitGroups, feature.id + offset);
                if (typeof group !== 'undefined' && typeof group.id !== 'undefined' && controllerType === ControllerType.intellitouch) {
                    let details = group.circuits.map(circuit => {
                        return (<li key={feature.id + offset + circuit.circuit.id + '_circuitGroupDetails'}>{`${circuit.circuit.id} ${circuit.circuit.name}: ${circuit.desiredStateOn ? 'Off' : 'On'}`}</li>)
                    });
                    let targetid = 'cgtarget' + feature.id;
                    return (<ListGroupItem key={feature.id + 'featurelistgroupkey'}>
                        <div className='d-flex justify-content-between'>
                            <span>
                                {feature.name + ' '}
                                <img src={info} width='20px' height='20px' id={targetid} />
                            </span>
                            <Popover isOpen={popoverOpen[targetid]} target={targetid} toggle={toggle}>
                                <PopoverHeader>Circuit Groups</PopoverHeader>
                                <PopoverBody><ul>{details}</ul></PopoverBody>
                            </Popover>
                            <Button color={group.isOn ? 'success' : 'primary'} key={feature.id + 'feature'} onClick={handleClick} value={feature.id} >
                                <img src={play} width='20px' height='20px' />
                            </Button>
                        </div>
                    </ListGroupItem>)
                }
                else if (props.id === 'Features'  && feature.showInFeatures)
                    return (<ListGroupItem key={feature.id + 'featurelistgroupkey'}>
                        <div className='d-flex justify-content-between'>
                            {feature.name}
                            <Button color={feature.isOn ? 'success' : 'primary'} key={feature.id + 'feature'} onClick={handleClick} value={feature.id} >{feature.isOn ? 'On' : 'Off'}
                            </Button>
                        </div>
                    </ListGroupItem>
                    )
        })

    }

    const toggleModal = () => {
        console.log(`modalOpen (${modalOpen}) && needsReload(${needsReload}): ${modalOpen && needsReload}`)
        if (modalOpen && needsReload) {
            reload();
            setNeedsReload(false);
        }
        setModalOpen(!modalOpen);
    };

    const closeBtn = <button className="close" onClick={toggleModal}>&times;</button>;
    let className = "circuit-pane active";
    return (
        <>
            {!doneLoading ? (<div />) :
                <div className="feature-pane active" id={props.id} role="tabpanel" aria-labelledby="feature-tab">
                    <CustomCard name={props.id} id={props.id} edit={props.id === 'Features' ? toggleModal : undefined}>
                        <ListGroup flush >
                            {features()}
                        </ListGroup>
                    </CustomCard>
                    {props.id === 'Features' && <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' scrollable={true}>
                        <ModalHeader toggle={toggleModal} close={closeBtn}>Configure Features</ModalHeader>
                        <ModalBody>
                            <CircuitModalPopup
                                id='featureConfig'

                                controllerType={controllerType}
                                type='features'
                                needsReload={needsReload}
                                setNeedsReload={setNeedsReload}
                            />

                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={toggleModal}>Close</Button>
                        </ModalFooter>
                    </Modal>}

                </div>
            }
        </>
    );
}

export default Features;