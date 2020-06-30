import React, { useContext, useEffect, useRef, useState } from 'react';
import HSBar from "react-horizontal-stacked-bar-chart";
import { Button, Col, Container, ListGroup, ListGroupItem, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap';
import ChemControllerEdit from './ChemControllerEdit';
import { useAPI } from './Comms';
import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { IExtendedChemController, PoolContext } from './PoolController';



const initialState: { chemControllers: IExtendedChemController[]; } = { chemControllers: [] };

function ChemControllers(props: any) {
    const [popoverOpen, setPopoverOpen] = useState<boolean[]>([false]);
    const [modalOpen, setModalOpen] = useState(false);
    const [dropdownOpen, setdropdown] = useState();
    const [needsReload, setNeedsReload] = useState(false);
    const { reload, poolURL, controllerType, emitter } = useContext(PoolContext);
    const [returnedData, doFetch, doUpdate] = useDataApi([], initialState);
    // let { data, isLoading, isError, doneLoading } = returnedData as {data:IExtendedChemController[], isLoading: boolean, isError: boolean, doneLoading: boolean};
    const data = useRef(initialState);
    const isLoading = useRef(true)
    const isError = useRef(false)
    const doneLoading = useRef(false)
    const execute = useAPI();
    useEffect(() => {

        data.current = returnedData.data;
        isLoading.current = returnedData.isLoading;
        isError.current = returnedData.isError;
        doneLoading.current = returnedData.doneLoading;

    }, [JSON.stringify(returnedData)]);

    const refreshChem = () => {
        let arr = [];
        arr.push({ url: `${poolURL}/extended/chemControllers`, dataName: 'chemControllers' });
        doFetch(arr);
    }

    useEffect(() => {
        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined') {
            refreshChem();
            const fn = function (data) {
                console.log(`received chemController emit`);
                // if (data.type.val === 0) return;
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'chemControllers', data });
            };
            emitter.on('chemController', fn);

            return () => {
                emitter.removeListener('chemController', fn);
            };
        }
    }, [poolURL, emitter]);

    const toggleModal = () => {
        console.log(`modalOpen (${modalOpen}) && needsReload(${needsReload}): ${modalOpen && needsReload}`);
        if (modalOpen && needsReload) {
            reload();
            setNeedsReload(false);
        }
        setModalOpen(!modalOpen);
    };

    const value_limit = (val, min, max) => {
        return val < min ? min : (val > max ? max : val);
    }
    const closeBtn = <button className="close" onClick={() => { toggleModal(); }}>&times;</button>;
    let className = "circuit-pane active";
    return (
        <>
            {/* {!doneLoading.current&&<>Loading...</>} */}
            {doneLoading.current && !isError.current &&
                <div className="tab-pane active" id="light" role="tabpanel" aria-labelledby="light-tab">

                    <CustomCard name='Chem Controllers' id={props.id} edit={() => setModalOpen(!modalOpen)}>
                        {typeof data.current.chemControllers === 'undefined' || data.current?.chemControllers?.length === 0 ? 'No Chem Controllers' : data.current.chemControllers.map((chemController) => {

                            return <div key={`chemController-${chemController.id}`}>
                                {chemController.name}
                                <ListGroup >
                                    <ListGroupItem>
                                        <Container>
                                                <Row>
                                                    <Col xs='6' lg='1' className='center'>
                                                        <div className='topAbs10Percent centerText halfLineHeight'>
                                                        Water Balance <br />
                                                        <h1 style={{ color: Math.abs(chemController.saturationIndex) > .3 ? 'rgb(176,40,40)' : 'rgb(42,173,57' }}>
                                                            {typeof chemController.saturationIndex === 'undefined' ? 'n/a' : chemController.saturationIndex}
                                                        </h1>
                                                        </div>
                                                        <div style={{position: 'absolute', bottom: '0'}} className='centerText'>
                                                        Alk: {chemController.alkalinity} <br />
                                                        CH:  {chemController.calciumHardness} <br />
                                                        CYA: {chemController.cyanuricAcid}
                                                        </div>
                                                    </Col>
                                                
                                                    <Col xs='3' lg='1' className='d-flex p-1 m-auto'>
                                                        <div className='center p-0'>
                                                        <svg width="100%" height="150" id='centerSVG'  style={{margin:'auto'}}>
                                                            <rect width="25" height="25" y='0' fill={'rgb(42,173,57'} fillOpacity={chemController.acidTankLevel >= 6 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='25' fill='rgb(42,173,57' fillOpacity={chemController.acidTankLevel >= 5 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='50' fill='rgb(42,173,57' fillOpacity={chemController.acidTankLevel >= 4 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='75' fill={chemController.acidTankLevel >= 3 ? 'rgb(42,173,57' : 'yellow'} fillOpacity={chemController.acidTankLevel >= 3 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='100' fill={chemController.acidTankLevel >= 3 ? 'rgb(42,173,57' : 'yellow'} fillOpacity={chemController.acidTankLevel >= 2 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='125' fill={chemController.acidTankLevel >= 3 ? 'rgb(42,173,57' : chemController.acidTankLevel > 1 ? 'yellow' : 'rgb(176,40,40)'} fillOpacity={chemController.acidTankLevel >= 1 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                        </svg>
                                                        </div>
                                                        <div className='center centerText'>
                                                            Acid Tank Level
                                                </div>
                                                    </Col>
                                                    <Col xs='3' lg='1' className='d-flex p-1'>
                                                        <div className='center p-0'>
                                                        <svg width="100%" height="150" id='centerSVG' style={{margin:'auto'}}>
                                                            <rect width="25" height="25" y='0' fill={'rgb(42,173,57'} fillOpacity={chemController.orpTankLevel >= 6 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='25' fill='rgb(42,173,57' fillOpacity={chemController.orpTankLevel >= 5 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='50' fill='rgb(42,173,57' fillOpacity={chemController.orpTankLevel >= 4 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='75' fill={chemController.orpTankLevel >= 3 ? 'rgb(42,173,57' : 'yellow'} fillOpacity={chemController.orpTankLevel >= 3 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='100' fill={chemController.orpTankLevel >= 3 ? 'rgb(42,173,57' : 'yellow'} fillOpacity={chemController.orpTankLevel >= 2 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                            <rect width="25" height="25" y='125' fill={chemController.orpTankLevel >= 3 ? 'rgb(42,173,57' : chemController.orpTankLevel > 1 ? 'yellow' : 'rgb(176,40,40)'} fillOpacity={chemController.orpTankLevel >= 1 ? 1 : 0} strokeWidth='3' stroke='rgb(0,0,0)' />
                                                        </svg>
                                                        </div>
                                                        <div className='center centerText'>
                                                            ORP Tank Level
                                                        </div>
                                                    </Col>
                                                </Row>
                                          
                                            <Row style={{height:'100px'}}>

                                                <div style={{
                                                    position: 'relative',
                                                    height: '35px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.pHLevel - 6.5) / (8.3 - 6.5) * 100, 0, 100)}%`,
                                                    marginLeft: '-20px', // width of 1/2 of triangle
                                                    zIndex: 4
                                                }}>
                                                    <svg height="40" width="40">
                                                        <text x='20' y='15' textAnchor='middle' fontSize='16' fill='gray'>{chemController.pHLevel}</text>
                                                        <polygon points="20,40 10,20 30,20" fill='gray' stroke='black' strokeWidth='1' />
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '30px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.pHSetpoint - 6.5) / (8.3 - 6.5) * 100, 0, 100)}%`,
                                                    marginLeft: '-17px', // width of 1/2 of circle
                                                    zIndex: 2
                                                }}>
                                                    <svg height="34" width="34"> 
                                                        <circle cx="17" cy="17" r="8" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="5" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="2" stroke="black" strokeWidth="1" fill='black' />
                                                        <title>{chemController.pHSetpoint}</title>
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    top: '-30px',
                                                    zIndex: 0,
                                                    width: '100%'
                                                }}>
                                                    <HSBar
                                                        height={35}
                                                        showTextDown
                                                        id="phBar"
                                                        fontColor="gray"
                                                        data={[
                                                            { value: .5, description: ` `, color: 'rgb(176,40,40)' },
                                                            { value: .2, description: '7.0', color: 'yellow' },
                                                            { value: .4, description: '7.2', color: 'rgb(42,173,57' },
                                                            { value: .2, description: '7.6', color: 'yellow' },
                                                            { value: .5, description: '7.8', color: 'rgb(176,40,40)' }
                                                        ]}
                                                    />
                                                </div>
                                                <div style={{position: 'relative', top: '-120px', fontSize: 'x-large'}}>
                                                    pH
                                                </div>
                                            </Row>
                                            <Row style={{height:'100px'}}>

                                                <div style={{
                                                    position: 'relative',
                                                    height: '35px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.orpLevel - 400) / (950 - 400) * 100, 0, 100)}%`,
                                                    marginLeft: '-20px', // width of 1/2 of triangle
                                                    zIndex: 4
                                                }}>
                                                    <svg height="40" width="40">
                                                        <text x='20' y='15' textAnchor='middle' fontSize='16' fill='gray'>{chemController.orpLevel}</text>
                                                        <polygon points="20,40 10,20 30,20" fill='gray' stroke='black' strokeWidth='1' />
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '30px',
                                                    width: '100%',
                                                    paddingLeft: `${value_limit((chemController.orpSetpoint - 400) / (950 - 400) * 100, 0, 100)}%`,
                                                    marginLeft: '-17px', // width of 1/2 of circle
                                                    zIndex: 2
                                                }}>
                                                    <svg height="34" width="34">
                                                        <circle cx="17" cy="17" r="8" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="5" stroke="black" strokeWidth="1" fillOpacity='0' />
                                                        <circle cx="17" cy="17" r="2" stroke="black" strokeWidth="1" fill='black' />
                                                        <title>{chemController.orpSetpoint}</title>
                                                    </svg>
                                                </div>
                                                <div style={{
                                                    position: 'relative',
                                                    top: '-30px',
                                                    zIndex: 0,
                                                    width: '100%'
                                                }}>
                                                    <HSBar
                                                        height={35}
                                                        showTextDown
                                                        id="orpBar"
                                                        fontColor="gray"
                                                        data={[
                                                            { value: 100, description: ` `, color: 'rgb(176,40,40)' },
                                                            { value: 100, description: '500', color: 'yellow' },
                                                            { value: 150, description: '650', color: 'rgb(42,173,57' },
                                                            { value: 100, description: '750', color: 'yellow' },
                                                            { value: 100, description: '850', color: 'rgb(176,40,40)' }
                                                        ]}
                                                    />
                                                </div>
                                                <div style={{position: 'relative', top: '-120px', fontSize: 'x-large'}}>
                                                    ORP
                                                </div>
                                            </Row>

                                        </Container>
                                    </ListGroupItem>

                                    <br />
                                </ListGroup>
                            </div>

                        })}

                    </CustomCard>


                    <Modal isOpen={modalOpen} toggle={() => { setModalOpen(!modalOpen); }} size='xl' scrollable={true}>
                        <ModalHeader toggle={() => { setModalOpen(!modalOpen); }} close={closeBtn}>Adjust Chem Controller</ModalHeader>
                        <ModalBody>
                            <ChemControllerEdit
                                // chemControllers={data.current.chemControllers} 
                                doUpdate={doUpdate}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button onClick={() => { setModalOpen(!modalOpen); }}>Close</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            }
        </>
    );
}

export default ChemControllers;