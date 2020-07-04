import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useState } from 'react';
import Slider from 'react-rangeslider';
import { Button, ButtonGroup, Col, ListGroup, ListGroupItem, Row, FormGroup, Form, Label, Input } from 'reactstrap';

import CustomCard from '../CustomCard';
import useDataApi from '../DataFetchAPI';
import { PoolContext } from '../PoolController';
import { useAPI } from '../Comms';


function SocketTester(props) {
    const {poolURL, socket} = useContext(PoolContext);

    const send = (e) =>{
        e.preventDefault();
        socket.emit(e.target.socketName.value, e.target.socketData.value)
    }

    return <div className='tab-pane active' id={props.id} role="tabpanel" aria-labelledby={props.id + '-tab'} >
        <CustomCard name={props.id} id={props.id} >
            <ListGroup flush >
                <Form onSubmit={send}>

                    <FormGroup>
                        <FormGroup>
                            <Label for="socketName">Socket Name to Emit</Label>
                            <Input type="textarea" name="text" id="socketName" />
                        </FormGroup>

                        <FormGroup>
                            <Label for="socketData">Text Area</Label>
                            <Input type="textarea" name="text" id="socketData" />
                        </FormGroup>
                    </FormGroup>
                    <Button type='submit'>Send</Button>
                </Form>
            </ListGroup>
        </CustomCard>
    </div>


}

export default SocketTester;