import {
    Row, Col, Modal, ModalHeader, ModalBody, ModalFooter, Button, ListGroup, ListGroupItem
} from 'reactstrap';
import CustomCard from '../CustomCard'
import 'react-rangeslider/lib/index.css'
import FilterEdit from './FilterEdit'
import React, { useContext, useEffect, useState, useRef } from 'react';
import {getItemById, IStateCircuit, PoolContext, PoolURLContext, ControllerType } from '../PoolController';
import { useAPI } from '../Comms';
import useDataApi from '../DataFetchAPI';
import axios from 'axios';
interface Props {
    id: string;

}

const initialState: { filters: any }={ filters: [] }
function Filter(props: Props) {
    const {poolURL, emitter, controllerType} = useContext(PoolContext)
    const {poolURL : pu} = useContext(PoolURLContext);
    const [modalOpen, setModalOpen]=useState(false);

    const execute = useAPI();

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);
    const update = () => {
        let arr = [];
        arr.push({ url: `${poolURL}/state/filters`, dataName: 'filters' });
        doFetch(arr);
      }
    useEffect(()=>{
        if (typeof poolURL !== 'undefined' && controllerType !== ControllerType.none){
            let arr=[];
            arr.push({ url: `${ poolURL }/state/filters`, dataName: 'filters' });
            doFetch(arr);
        }
    },[poolURL, doFetch, controllerType])


       /* eslint-disable react-hooks/exhaustive-deps */
       useEffect(() => {
        if(typeof poolURL!=='undefined' && typeof emitter !== 'undefined') {
            const fnFilter=function(data) {
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'filters', data });
            };
            emitter.on('filter', fnFilter);

            return () => {
                emitter.removeListener('filter', fnFilter);
            };
        }
    }, [poolURL, emitter]);
    /* eslint-enable react-hooks/exhaustive-deps */

    const toggle=() => {
        // this will only be clicked when modal is open, so close it
        setModalOpen(false);
    }
    const toggleFromButton=ev => {
        // open and close the modal from the individual chlor buttons.
        let target=parseInt(ev.currentTarget.value, 10)
        setModalOpen(!modalOpen)
        // const cc = getItemById(data.Filters,target)
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

    return (<div className="tab-pane active" id={props.id} role="tabpanel" aria-labelledby="Filter-tab">
        
        <CustomCard name='Filter' id={props.id} edit={() => setModalOpen(!modalOpen)}>
        {data.filters?.length===0 && controllerType !== ControllerType.none &&
            <>No filters configured.</>
        }
            {isLoading || !doneLoading|| typeof data.filters === 'undefined' ? <></>:
                data.filters.map(filter=>{
                    return <div key={filter.id+'filterlistgroup'}>
                <ListGroup >
                <ListGroupItem >
                    <Row>
                        <Col xs="6">{filter.name} ({filter.id})</Col>
                        <Col>
                            PSI: {filter.psi} 
                        </Col>
                    </Row>
    
                    <Row>
                        <Col xs="6">Type</Col>
                        <Col xs="6">{filter?.filterType?.desc}</Col>
                    </Row>
                    <Row>
                        <Col xs="6">Status</Col>
                        <Col>
                            Needs Cleaning?: {filter.needsCleaning?'Yes':'No'} <br />
                        Last Clean: {filter?.lastCleanDate}
                        </Col>
                    </Row>
                    <Row>
                        <Col xs="6"> Body
                                </Col>
                        <Col xs="6">{filter?.body?.desc}
                        </Col>
                    </Row>
                </ListGroupItem>
            </ListGroup>
                </div>
                
                    })
            }
        </CustomCard>
        <Modal isOpen={modalOpen} toggle={toggle} size='xl' >
            <ModalHeader toggle={toggle} close={closeBtn}></ModalHeader>
            <ModalBody>
                <FilterEdit
                    update={update}
                />
            </ModalBody>
            <ModalFooter>
                <Button onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    </div>
)


}

export default Filter;