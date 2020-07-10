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
    Container,
    Row,
    Col,
    UncontrolledPopover,
} from 'reactstrap';

import CircuitModalPopup from './CircuitConfig/CircuitModalPopup';
import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { ControllerType, getItemById, IStateCircuit, PoolContext, IStateCircuitGroup, IConfigEquipment } from './PoolController';
import { useAPI } from './Comms';
import ErrorBoundary from './ErrorBoundary';
const play = require("../images/play-icon.svg");
const info = require("../images/info-blue-bg.svg");

interface Props {
    id: string;
}


const initialState: {
    features: IStateCircuit[];
    circuitGroups: IStateCircuitGroup[];
    equipment: IConfigEquipment;

} = {
    features: [],
    circuitGroups: [],
    equipment: {
        model: '',
        shared: false,
        maxCircuits: 4,
        maxFeatures: 4,
        maxIntelliBrites: 2,
        maxBodies: 1,
        maxSchedules: 10,
        maxChlorinators: 1,
        equipmentIds: {
            circuits: {
                start: 1,
                end: 2
            },
            features: {
                start: 11,
                end: 20
            },
            circuitGroups: {
                start: 192,
                end: 193
            }
        }
    }
};

function Features(props: Props) {
    const [popoverOpen, setPopoverOpen] = useState<boolean[]>([false]);
    const [modalOpen, setModalOpen] = useState(false);
    const [needsReload, setNeedsReload] = useState(false);
    const { reload, poolURL, controllerType, emitter } = useContext(PoolContext);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi([], initialState);
    const execute = useAPI();
    const reloadData = () => {
        let arr = [];
        arr.push({ url: `${poolURL}/extended/features`, dataName: 'features' });
        arr.push({ url: `${poolURL}/config/equipment`, dataName: 'equipment' });
        arr.push({ url: `${poolURL}/state/circuitGroups`, dataName: 'circuitGroups' });
        doFetch(arr);
    }
    useEffect(() => {
        if (controllerType !== ControllerType.none) {
            reloadData();
        }
    }, [controllerType]);
    useEffect(() => {
        var _data = data;
        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined') {
            const fnFeature = (incoming) => {
                console.log(`received feature emit`)
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'features', data: incoming });

            };
            const fnCG = (incoming) => {
                console.log(`received circuitGroup emit`)
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'circuitGroups', data: incoming });

            };
            reloadData();

            switch (props.id) {
                case "Features":
                    emitter.on('feature', fnFeature);
                    return () => {
                        emitter.removeListener('feature', fnFeature);
                    };
                case "Circuit Groups":
                    emitter.on('circuitGroup', fnCG);
                    return () => {
                        emitter.removeListener('circuitGroup', fnCG);
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
        try {
            if (!data.features || !data.equipment || typeof data.equipment?.equipmentIds === 'undefined') { return <></> };

            if (props.id === 'Features') {
                return data.features.map(feature => {
                    return (feature.showInFeatures && <ListGroupItem key={feature.id + 'featurelistgroupkey'}>
                        <div className='d-flex justify-content-between'>
                            {feature.name}
                            <Button color={feature.isOn ? 'success' : 'primary'} key={feature.id + 'feature'} onClick={handleClick} value={feature.id} >{feature.isOn ? 'On' : 'Off'}
                            </Button>
                        </div>
                    </ListGroupItem>
                    )
                })
            }
            else {
                return data.circuitGroups.map(cg => {
                    let offset = data.equipment.equipmentIds.circuitGroups.start - data.equipment.equipmentIds.features.start;
                    let feature = data.features.find(f => f.id === cg.id - offset - 1);
                    if (typeof feature !== 'undefined') {
                        let details = cg.circuits.map(cgc => {
                            return (<Row className={"p-0"} key={`cgid${cg.id}cgcid${cgc.id}_circuitGroupDetails`}>
                                <Col className={"p-0"} xs="4">{cgc.circuit.name} </Col>
                                <Col className={"p-0"} xs="4">{cgc.desiredStateOn ? 'On' : 'Off'}</Col>
                                <Col className={"p-0"} xs="4">{cgc.circuit.isOn ? 'On' : 'Off'}</Col>
                            </Row>)
                        });
                        let targetid = 'cgtarget' + cg.id;
                        return (
                            <ListGroupItem key={cg.id + 'circuitGrouplistgroupkey'}>
                                <Container className='p-0'>

                                    <Row>
                                        <Col xs='auto' className='mr-auto'>
                                            {cg.name + ' '}
                                    
                                            <Button id={targetid} type="button" color='link'>
                                                <img src={info} width='20px' height='20px' />
                                            </Button>

                                            <UncontrolledPopover trigger="click" target={targetid} placement="right">
                                                <PopoverHeader>Circuits</PopoverHeader>
                                                <PopoverBody><Container>
                                                    <Row  style={{minWidth:'200px'}} key={`cgid${cg.id}_circuitGroupDetails`}>
                                                        <Col className={"p-0"} xs='4' > </Col>
                                                        <Col className={"p-0"} xs='4'>Desired</Col>
                                                        <Col className={"p-0"} xs='4'> Actual</Col>
                                                    </Row>
                                                    {details}

                                                </Container>
                                                </PopoverBody>
                                            </UncontrolledPopover>
                                        </Col>
                                        <Col xs={{size:'auto'}}>
                                            <Button color={cg.isOn ? 'success' : 'primary'} key={cg.id + 'circuitGroup'} onClick={handleClick} value={cg.id} >
                                                <img src={play} width='20px' height='20px' />
                                            </Button>
                                        </Col>
                                    </Row>

                                </Container>
                            </ListGroupItem>

                        )
                    }

                })
            }
        }
        catch (err) {
            console.log(`Error parsing features`);
            console.log(err);

        }
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
            <div className="feature-pane active" id={props.id} role="tabpanel" aria-labelledby="feature-tab">
                <CustomCard name={props.id} id={props.id} edit={props.id === 'Features' ? toggleModal : undefined}>
                    {doneLoading &&
                        <ListGroup flush >
                            {features()}
                        </ListGroup>
                    }
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

        </>
    );
}

export default Features;