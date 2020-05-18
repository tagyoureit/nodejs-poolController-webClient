
import {
    Row, Col, Table, Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button, CardFooter, CardGroup,
    Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import CustomCard from './CustomCard';
import DateTime from './DateTime';
import React, { useContext, useState, useEffect, useReducer } from 'react';
import PumpConfigModalPopup from './PumpConfig/PumpConfigModalPopup';
import { IStatePump, IConfigPump, PoolContext } from './PoolController';
import { comms } from './Socket_Client';
import useDataApi from './DataFetchAPI';
import ErrorBoundary from './ErrorBoundary';

interface Props {
    id: string;

}

const initialState: { pumps: IStatePump[]; }={ pumps: [] };
function Pump(props: Props) {
    const {poolURL} = useContext(PoolContext);
    const [modalOpen, setModalOpen]=useState(false);
    
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi([], initialState);
    
    useEffect(()=>{
        if (typeof poolURL !== 'undefined'){
            let arr=[];
            arr.push({ url: `${ poolURL }/state/pumps`, dataName: 'pumps' });
            doFetch(arr);
        }
    },[poolURL, doFetch])

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        let emitter=comms.getEmitter();
        const fnPump=function(data) {
            console.log(`received pump:`)
            console.log(data)
            doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'pumps', data });
        };
        emitter.on('pump', fnPump);

        return () => {
            emitter.removeListener('pump', fnPump);
        };
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    const closeBtn=<button className="close" onClick={() => setModalOpen(!modalOpen)}>&times;</button>;

    const PumpConfigOrManualControl=() => {
        return (
            <PumpConfigModalPopup
                id='pumpConfig'
            />);
    };

    return doneLoading && !isLoading && (
        <div className="tab-pane active" id="pump" role="tabpanel" aria-labelledby="pump-tab">
            <CustomCard name='Pumps' key='title' id={props.id} edit={() => setModalOpen(!modalOpen)}>
                <CardGroup className="">
                    <ErrorBoundary>
                        {data.pumps && data.pumps.length === 0 && 'Pool app did not find any pumps responding to status requests.'}
                        {data.pumps && data.pumps.length>0 && data.pumps.map((pump) => {
                            try {

                                return (
                                    <Card key={'pump'+pump.id+'card'}>
                                    <CardBody className='p-0' key={'pump'+pump.id+'cardbody'}>
                                        <CardTitle className='card-header'>  {pump.id}: {pump.type.desc}</CardTitle>
                                        <CardText className='text-right mr-3 pt-0'>
                                            Watts: {pump.watts}
                                            <br />
                                            RPM: {pump.rpm}
                                            <br />
                                            Status: {pump.status.desc}
                                            <br />
                                        </CardText>
                                    </CardBody>
                                </Card>);
                                }
                                catch (err){
                                    return (<Card key={'pump'+pump.id+'card'}>
                                        Error with pump {pump.id}.
                                        <br/>
                                        {err.message}
                                        <br />
                                        {JSON.stringify(err)}
                                    </Card>)
                                }
                        })}
                    </ErrorBoundary>
                </CardGroup>
            </CustomCard>

            <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size='xl' scrollable={true}>
                <ModalHeader toggle={() => setModalOpen(!modalOpen)} close={closeBtn}>Adjust Pump Configuration</ModalHeader>
                <ModalBody>
                    {PumpConfigOrManualControl()}
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => setModalOpen(!modalOpen)}>Close</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
}

export default Pump;