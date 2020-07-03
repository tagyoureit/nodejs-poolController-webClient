import {
    Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button, ListGroup, ListGroupItem
} from 'reactstrap';
import CustomCard from './CustomCard'
import 'react-rangeslider/lib/index.css'
import ChlorinatorCustomSlider from './ChlorinatorCustomSlider'
import React, { useContext, useEffect, useState, useRef } from 'react';
import { IStateChlorinator, getItemById, IConfigChlorinator, IStateCircuit, PoolContext, PoolURLContext } from './PoolController';
import { useAPI } from './Comms';
import useDataApi from './DataFetchAPI';
import axios from 'axios';
interface Props {
    id: string;

}

const initialState: { chlorinators: IConfigChlorinator[]&IStateChlorinator[] }={ chlorinators: [] }
function Chlorinator(props: Props) {
    const {poolURL, emitter} = useContext(PoolContext)
    const {poolURL : pu} = useContext(PoolURLContext);
    const [modal, setModal]=useState(false);
    const [currentChlorID, setCurrentChlorID]=useState(1);
    const [currentChlor, setCurrentChlor]=useState<IConfigChlorinator&IStateChlorinator>();
    const execute = useAPI();
    const addVirtualChlor=async () => {
        setChlorSearchMessage(`Searching...`)
        try {
            
            let res=await execute('chlorSearch');
            if (res.isVirtual) {
                let arr=[];
                arr.push({ url: `${ poolURL }/extended/chlorinators`, dataName: 'chlorinators' });
                doFetch(arr);
            }
            else {
                setChlorSearchMessage(`No chlorinators found.  Search again.`)
            }
        }
        catch (err) {
            setChlorSearchMessage(`Error: ${err.message}. No chlorinators found.  Search again.`)
        }
    }
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);
    const [chlorSearchMessage, setChlorSearchMessage] = useState(`Search for chlorinator.`);
    useEffect(()=>{
        if (typeof poolURL !== 'undefined'){
            let arr=[];
            arr.push({ url: `${ poolURL }/extended/chlorinators`, dataName: 'chlorinators' });
            doFetch(arr);
        }
    },[poolURL, doFetch])


    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if(doneLoading&&data.chlorinators.length>0) {
            let chlor=getItemById(data.chlorinators, currentChlorID);
            setCurrentChlor(chlor);
        }
    }, [currentChlorID, doneLoading, JSON.stringify(data)])

    useEffect(() => {
        if (typeof poolURL !== 'undefined' && typeof emitter !== 'undefined'){
        const fnChlor=function(data) { doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'chlorinators', data }); };
        emitter.on('chlorinator', fnChlor);
        return () => {
            emitter.removeListener('chlor', fnChlor);
        };
    }
    }, [poolURL, emitter]);

    /* eslint-enable react-hooks/exhaustive-deps */

    const toggle=() => {
        // this will only be clicked when modal is open, so close it
        setModal(false);
    }
    const toggleFromButton=ev => {
        // open and close the modal from the individual chlor buttons.
        let target=parseInt(ev.currentTarget.value, 10)
        setModal(!modal)
        // const cc = getItemById(data.chlorinators,target)
        // setCurrentChlorID(cc);
    }

    const chlorStatus = (percent: number, superChlor: boolean, superChlorHours: number) => {

        if(percent>=100||superChlor) {
            return `Super Chlorinate (${ superChlorHours } hours)`
        } else if(percent>0) {
            return 'On'
        }
        else {
            return 'Off'
        }
    } 

    
    const closeBtn=<button className="close" onClick={toggle}>&times;</button>;

    return (<>{typeof data.chlorinators !== 'undefined' && typeof currentChlor !== 'undefined' &&<div className="tab-pane active" id={props.id} role="tabpanel" aria-labelledby="chlorinator-tab">
        
        <CustomCard name='Chlorinator' id={props.id} >
        {data.chlorinators.length===0||typeof currentChlor==='undefined' &&
            <>No chlorinator connected to system.
            <br />
           {chlorSearchMessage === `Searching...` ? chlorSearchMessage:<Button color='link' onClick={addVirtualChlor}>{chlorSearchMessage}</Button>}
            </>
        }
            {isLoading || !doneLoading|| typeof currentChlor === 'undefined' ? <>Loading...</>:
                <ListGroup key={currentChlor.id+'chlorlistgroup'}>
                <ListGroupItem >
                    <Row>
                        <Col xs="6">{currentChlor.name} ({currentChlor.id})</Col>
                        <Col>
                            <Button onClick={toggleFromButton} value={currentChlor.id} color={currentChlor.currentOutput>0? 'success':'primary'}>{chlorStatus(currentChlor.currentOutput, currentChlor.superChlor, currentChlor.superChlorHours)}</Button>
                        </Col>
                    </Row>
    
                    {currentChlor?.isVirtual && currentChlor.virtualControllerStatus&&currentChlor.virtualControllerStatus.val!==-1&&(<Row>
                        <Col xs="6">Virtual Controller Status:</Col>
                        <Col xs="6">{currentChlor.virtualControllerStatus.desc}</Col>
                    </Row>)}
                    <Row>
                        <Col xs="6">Salt</Col>
                        <Col xs="6">{currentChlor.saltLevel} ppm</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Current Output</Col>
                        <Col xs="6">{currentChlor.currentOutput} %</Col>
                    </Row>
                    <Row>
                        <Col xs="6">{currentChlor.body&&currentChlor.body.desc} Setpoint
                                </Col>
                        <Col xs="6">{currentChlor?.body?.val===0? `${ currentChlor.poolSetpoint }%`:`${ currentChlor.poolSetpoint }% / ${ currentChlor.spaSetpoint }%`}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6">Status</Col>
                        <Col xs="6">{currentChlor?.status.desc}</Col>
                    </Row>
                </ListGroupItem>
            </ListGroup>
            }
        </CustomCard>
        <Modal isOpen={modal} toggle={toggle} size='xl' >
            <ModalHeader toggle={toggle} close={closeBtn}>Adjust Chlorinator Levels for ID:{currentChlorID}</ModalHeader>
            <ModalBody>
                {currentChlor && <ChlorinatorCustomSlider
                    chlor={currentChlor}
                />}
            </ModalBody>
            <ModalFooter>
                <Button onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    </div>
}</>)


}

export default Chlorinator;