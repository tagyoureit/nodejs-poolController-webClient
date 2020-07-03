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
                                                <Row className='minHeight125'>
                                                    <Col xs='12' sm='4' className='centerText p-0 m-0'>
                                                        {/* <div className='topAbs10Percent centerText threeQuarterLineHeight'> */}
                                                        Water Balance <br/>
                                                        <h1 style={{ color: Math.abs(chemController.saturationIndex) > .3 ? 'rgb(176,40,40)' : 'rgb(42,173,57' }}>
                                                            {typeof chemController.saturationIndex === 'undefined' ? 'n/a' : chemController.saturationIndex}
                                                        </h1>
                                                        {/* </div> */}
                                                        <p />
                                                        {/* <div style={{position: 'absolute', bottom: '0', lineHeight:'1'}} className='centerText'> */}
                                                        Alk: {chemController.alkalinity} <br />
                                                        CH:  {chemController.calciumHardness} <br />
                                                        CYA: {chemController.cyanuricAcid}
                                                       {/*  </div> */}
                                                    </Col>
                                                
                                                    <Col style={{maxHeight:'125px'}} xs='6' sm='4'  className='d-flex p-0 m-0'>
                                                        <div className='center p-0' style={{width:'100%', height:'auto'}}>
                                                        <svg height="100%" id="Layer_1" data-name="Layer 1" 
                                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.58 192.89">
                                                            showWebviewLoader={false}
                                                            <path id='fill-1' className={`tankBaseFill ${chemController.acidTankLevel >= 3 ? 'tankFillGreen' : chemController.acidTankLevel > 1 ? 'tankFillYellow' : chemController.acidTankLevel === 1 ? 'tankFillRed': ''}`} d="M345.35,356.79v13.56s-19.19,25.7,52.56,29.86c0,0,68.27-.69,52.3-29.86l-1.39-13.56Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-2' className={`tankBaseFill ${chemController.acidTankLevel >= 3 ? 'tankFillGreen' : chemController.acidTankLevel > 1 ? 'tankFillYellow' : ''}`} d="M345.35,333.36v13.57s-19.19,25.69,52.56,29.86c0,0,68.27-.7,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-3' className={`tankBaseFill ${chemController.acidTankLevel >= 3 ? 'tankFillGreen' : ''}`} d="M345.35,309.93V323.5s-19.19,25.69,52.56,29.86c0,0,68.27-.69,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-4' className={`tankBaseFill ${chemController.acidTankLevel >= 4 ? 'tankFillGreen' : ''}`} d="M345.45,288.63V302.2S326.26,327.89,398,332.06c0,0,68.27-.69,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-5' className={`tankBaseFill ${chemController.acidTankLevel >= 5 ? 'tankFillGreen' : ''}`} d="M345.45,265.21v13.56s-19.19,25.7,52.56,29.86c0,0,68.27-.69,52.3-29.86l-1.39-13.56Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-6' className={`tankBaseFill ${chemController.acidTankLevel >= 6 ? 'tankFillGreen' : ''}`} d="M345.45,241.78v13.57S326.26,281,398,285.21c0,0,68.27-.7,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>

                                                            <ellipse className={`tankBaseFill ${chemController.acidTankLevel >= 6 ? 'tankFillGreen' : ''}`} cx="58.29" cy="28.09" rx="56.49" ry="26.29"/>
                                                            <ellipse className="tankBaseFill tankFillBlack" cx="24.2" cy="28.09" rx="8.79" ry="5.29"/>
                                                        </svg>
                                                        </div>
                                                        <div className='center centerText'>
                                                            {chemController.acidTankLevel / 6}%
                                                            <br />
                                                            Acid Tank Level
                                                </div>
                                                    </Col>
                                                    <Col xs='6' sm='4' style={{maxHeight:'125px'}} className='d-flex p-0 m-0'>
                                                        <div className='center p-0' style={{width:'100%', height:'auto'}}>
                                                        <svg height="100%" id="Layer_1" data-name="Layer 1" 
                                                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 116.58 192.89">
                                                            <path id='fill-1' className={`tankBaseFill ${chemController.orpTankLevel >= 3 ? 'tankFillGreen' : chemController.orpTankLevel > 1 ? 'tankFillYellow' : chemController.orpTankLevel === 1 ? 'tankFillRed': ''}`} d="M345.35,356.79v13.56s-19.19,25.7,52.56,29.86c0,0,68.27-.69,52.3-29.86l-1.39-13.56Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-2' className={`tankBaseFill ${chemController.orpTankLevel >= 3 ? 'tankFillGreen' : chemController.orpTankLevel > 1 ? 'tankFillYellow' : ''}`} d="M345.35,333.36v13.57s-19.19,25.69,52.56,29.86c0,0,68.27-.7,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-3' className={`tankBaseFill ${chemController.orpTankLevel >= 3 ? 'tankFillGreen' : ''}`} d="M345.35,309.93V323.5s-19.19,25.69,52.56,29.86c0,0,68.27-.69,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-4' className={`tankBaseFill ${chemController.orpTankLevel >= 4 ? 'tankFillGreen' : ''}`} d="M345.45,288.63V302.2S326.26,327.89,398,332.06c0,0,68.27-.69,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-5' className={`tankBaseFill ${chemController.orpTankLevel >= 5 ? 'tankFillGreen' : ''}`} d="M345.45,265.21v13.56s-19.19,25.7,52.56,29.86c0,0,68.27-.69,52.3-29.86l-1.39-13.56Z" transform="translate(-339.63 -209.12)"/>
                                                            <path id='fill-6' className={`tankBaseFill ${chemController.orpTankLevel >= 6 ? 'tankFillGreen' : ''}`} d="M345.45,241.78v13.57S326.26,281,398,285.21c0,0,68.27-.7,52.3-29.86l-1.39-13.57Z" transform="translate(-339.63 -209.12)"/>

                                                            <ellipse className={`tankBaseFill ${chemController.orpTankLevel >= 6 ? 'tankFillGreen' : ''}`} cx="58.29" cy="28.09" rx="56.49" ry="26.29"/>
                                                            <ellipse className="tankBaseFill tankFillBlack" cx="24.2" cy="28.09" rx="8.79" ry="5.29"/>
                                                        </svg>

                                                        </div>
                                                        <div className='center centerText'>
                                                            ORP Tank Level
                                                        </div>
                                                    </Col>
                                              {/*   </Row>
                                          
                                            <Row  */}
                                                <Col xs='12' style={{height:'100px'}}>
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

                                                </Col>
<Col xs='12'>
                                            {/* </Row>
                                            <Row style={{height:'100px'}}> */}

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
                                            </Col>
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