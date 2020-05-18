import {
    Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button, ListGroup, ListGroupItem
} from 'reactstrap';
import CustomCard from './CustomCard'
import 'react-rangeslider/lib/index.css'
import ChlorinatorCustomSlider from './ChlorinatorCustomSlider'
import React, { useContext, useEffect, useState } from 'react';
import { IStateChlorinator, getItemById, IConfigChlorinator, IStateCircuit, PoolContext } from './PoolController';
var extend=require('extend');
import { comms } from './Socket_Client';
import useDataApi from './DataFetchAPI';
interface Props {
    id: string;

}

const initialState: { chlorinators: IConfigChlorinator[]&IStateChlorinator[] }={ chlorinators: [] }
function Chlorinator(props: Props) {
    const {poolURL} = useContext(PoolContext)
    const [modal, setModal]=useState(false);
    const [currentChlorID, setCurrentChlorID]=useState(1);
    const [currentChlor, setCurrentChlor]=useState<IConfigChlorinator&IStateChlorinator>();
    
    const addVirtualChlor=async () => {
        setChlorSearch(<p>Searching...</p>)
        let res=await comms.chlorSearch();
        if(res.data.isVirtual) {
            setChlorSearch(<></>)
            let arr=[];
            arr.push({ url: `${ poolURL }/extended/chlorinators`, dataName: 'chlorinators' });
            doFetch(arr);
        }
        else {
            setChlorSearch(<Button color='link' onClick={addVirtualChlor}>No chlorinators found.  Search again.</Button>)
        }
    }
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);
    const [chlorSearch, setChlorSearch]=useState(<Button color='link' onClick={addVirtualChlor}>Search for stand alone chlorinator.</Button>)
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
        let emitter=comms.getEmitter();
        const fnChlor=function(data) { doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'chlorinators', data }); };
        emitter.on('chlorinator', fnChlor);
        return () => {
            emitter.removeListener('chlor', fnChlor);
        };
    }, []);

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


    const chlorinator=() => {
        if(data.chlorinators.length===0||typeof currentChlor==='undefined'||typeof currentChlor.body==='undefined'||typeof currentChlor.status==='undefined') {
            return <>No chlorinator connected to system.
           {chlorSearch}
            </>
        }
        let chlorStatus;
        if(currentChlor.currentOutput>=100||currentChlor.superChlor) {
            chlorStatus=`Super Chlorinate (${ currentChlor.superChlorHours } hours)`
        } else if(currentChlor.currentOutput>0) {
            chlorStatus='On'
        }
        else {
            chlorStatus='Off'
        }
        return (<ListGroup key={currentChlor.id+'chlorlistgroup'}>
            <ListGroupItem >
                <Row>
                    <Col xs="6">{currentChlor.name} ({currentChlor.id})</Col>
                    <Col>
                        <Button onClick={toggleFromButton} value={currentChlor.id} color={currentChlor.currentOutput>0? 'success':'primary'}>{chlorStatus}</Button>
                    </Col>
                </Row>

                {currentChlor.virtualControllerStatus&&currentChlor.virtualControllerStatus!==-1&&(<Row>
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
                    <Col xs="6">{currentChlor.body.val===0? `${ currentChlor.poolSetpoint }%`:`${ currentChlor.poolSetpoint }% / ${ currentChlor.spaSetpoint }%`}
                    </Col>
                </Row>
                <Row>
                    <Col xs="6">Status</Col>
                    <Col xs="6">{currentChlor.status.desc}</Col>
                </Row>
            </ListGroupItem>
        </ListGroup>)
    }


    if(data.chlorinators===false) return (<div />);
    const closeBtn=<button className="close" onClick={toggle}>&times;</button>;

    return (<div className="tab-pane active" id={props.id} role="tabpanel" aria-labelledby="chlorinator-tab">
        <CustomCard name='Chlorinator' id={props.id} >
            {!isLoading&&doneLoading? chlorinator():<>Loading...</>}
        </CustomCard>
        <Modal isOpen={modal} toggle={toggle} size='xl' >
            <ModalHeader toggle={toggle} close={closeBtn}>Adjust Chlorinator Levels for ID:{currentChlorID}</ModalHeader>
            <ModalBody>
                <ChlorinatorCustomSlider
                    chlor={currentChlor}
                />
            </ModalBody>
            <ModalFooter>
                <Button onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    </div>
    )


}

export default Chlorinator;