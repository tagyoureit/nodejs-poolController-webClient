import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useRef, useState } from 'react';
import Slider from 'react-rangeslider';
import { Button, ButtonDropdown, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Form, FormGroup, Input, Label, ListGroup, ListGroupItem, Row, UncontrolledButtonDropdown } from 'reactstrap';

import { useAPI } from '../Comms';
import { ControllerType, IConfigChlorinator, IStateChlorinator, PoolContext, PoolURLContext } from '../PoolController';
import useDataApi from '../DataFetchAPI';
const deleteIcon = require('../../images/delete.png');
interface Props {
    //chlor: IConfigChlorinator & IStateChlorinator,
    update: () => void;
}
const initialState: { types: any[], bodies: any[], filters: any[] } = { types: [], bodies: [], filters: [] }
function FilterEdit(props: Props) {
    const { poolURL, emitter, controllerType } = useContext(PoolContext)
    const { poolURL: pu } = useContext(PoolURLContext);
    const [dropdownTypeOpen, setdropdownTypeOpen] = useState(false);
    const [dropdownBodyOpen, setdropdownBodyOpen] = useState(false);
    const [dropdownNeedsCleaningOpen, setdropdownNeedsCleaningOpen] = useState(false);
    const filters = useRef([]);
    const execute = useAPI();
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate] = useDataApi(undefined, initialState);

    const update = () => {
        if (typeof poolURL !== 'undefined' && controllerType !== ControllerType.none) {
            let arr = [];
            arr.push({ url: `${poolURL}/config/options/filters`, dataName: 'filters' });
            doFetch(arr);
        }
    }
    useEffect(() => {
        update();
    }, [poolURL, doFetch, controllerType])

    useEffect(() => {
        if (typeof data.filters !== 'undefined' && data?.filters?.filters?.length > 0) {
            filters.current = data.filters.filters;
        }
    }, [JSON.stringify(data?.filters?.filters)]);
    const handleAdd = async () => {
        execute('updateFilter', { id: -1 })
            .then(res => {
                if (typeof res.stack !== 'undefined') {
                    throw new Error(res.stack);
                }
                else {
                    update();
                    props.update();
                }
            })
            .catch((err) => {
                console.error(`Error adding filter:`);
                console.error(err);
            })
    }
    function deleteFilter(id: number) {
        execute('deleteFilter', { id })
            .then(res => {
                if (typeof res.stack !== 'undefined') {
                    throw new Error(res.stack);
                }
                else {
                    update();
                    props.update();
                }
            })
            .catch((err) => {
                console.error(`Error deleting schedule:`);
                console.error(err);
            })
    }

    const onChangeComplete = (id: number) => {
        // console.log(`setting chlor: id:${ props.chlor.id }, poolSP: ${ poolSetpoint }, spaSP:${ spaSetpoint||0 }, superChlorHrs:${ superChlorHours }`)
        let { name, filterType, lastCleanDate, needsCleaning, body } = filters.current.find(f => f.id === id);
        execute('updateFilter', { id, name, filterType, lastCleanDate, needsCleaning, body });


    };
    const saveType = (id: number, evt: any) => {
        filters.current.find(f => f.id === id).filterType = parseInt(evt.target.value, 10);
        onChangeComplete(id);
    }
    const saveBody = (id: number, evt: any) => {
        filters.current.find(f => f.id === id).body = parseInt(evt.target.value, 10);
        onChangeComplete(id);
    }
    const saveNeedsCleaning = (id: number, bNeedsCleaning: boolean) => {
        filters.current.find(f => f.id === id).needsCleaning = bNeedsCleaning;
        onChangeComplete(id);
    }
    const changeLastCleanDate = (id: number, evt: any) => {
        filters.current.find(f => f.id === id).lastCleanDate = evt.target.value;
        onChangeComplete(id);
    }

    const capturefilterName = (id: number, name: string) => {
        console.log('changeName');
        filters.current.find(f => f.id === id).name = name;
    }

    const heightStyle = {
        height: '300px'
    };

    return (
        <div>
            <Container style={heightStyle} >
                <ListGroup flush>
                    {filters.current.length > 0 && filters.current.map(filter => {
                        return <ListGroupItem key={`filter-${filter.id}-edit`} >
                            <Row className={"mb-1"}>
                                <Col xs={12} sm={3}>
                                    Filter ID: {filter.id}

                                </Col>
                                <Col xs={12} sm={9} style={{display:"flex"}}>
                                    
                                       

                                            Name:
                                        

                                        <Input type="text" name="filterName" id="filterName"
                                            defaultValue={filter.name || 'Name Unknown'}
                                            onChange={(e) => capturefilterName(filter.id, e.target.value)}
                                            onBlur={() => { onChangeComplete(filter.id) }}
                                        />
                                    
                                </Col>
                            </Row>
                            <Row className={"mb-1"}>

                                <Col xs={12} sm={3}>
                                    <label>Body:</label>
                                    <ButtonDropdown isOpen={dropdownBodyOpen} toggle={() => setdropdownBodyOpen(!dropdownBodyOpen)} >
                                        <DropdownToggle caret>
                                            {data?.filters?.bodies.find(t => t.val === filter.body).desc}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {data?.filters?.bodies.map(b => {
                                                return <DropdownItem key={`${b.val}-type`} onClick={(e) => { saveBody(filter.id, e) }} value={b.val} >{b.desc}</DropdownItem>
                                            })}

                                        </DropdownMenu>
                                    </ButtonDropdown>

                                </Col>
                                <Col xs={12} sm={9}>
                                    <ButtonDropdown isOpen={dropdownTypeOpen} toggle={() => setdropdownTypeOpen(!dropdownTypeOpen)} >
                                        <DropdownToggle caret>
                                            {data?.filters?.types.find(t => t.val === filter.filterType).desc}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {data?.filters?.types.map(filterType => {
                                                return <DropdownItem key={`${filterType.val}-type`} onClick={(e) => { saveType(filter.id, e) }} value={filterType.val} >{filterType.desc}</DropdownItem>
                                            })}

                                        </DropdownMenu>
                                    </ButtonDropdown>

                                </Col>
                            </Row>
                            <Row className={"mb-1"}>
                                <Col xs={12} sm={3}>
                                    <label>Needs Cleaning:</label>
                                    <UncontrolledButtonDropdown isOpen={dropdownNeedsCleaningOpen} toggle={() => setdropdownNeedsCleaningOpen(!dropdownNeedsCleaningOpen)}>
                                        <DropdownToggle caret>
                                            {filter.needsCleaning ? "Yes" : "No"}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            <DropdownItem key={`${filter.id}-${filter.needsCleaning}-needsCleaning`} onClick={(e) => { saveNeedsCleaning(filter.id, true) }} value={true} >Yes</DropdownItem>
                                            <DropdownItem key={`${filter.id}-${filter.needsCleaning}-needsCleaning`} onClick={(e) => { saveNeedsCleaning(filter.id, false) }} value={false} >No</DropdownItem>


                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>

                                </Col>
                                <Col style={{display: "flex"}}>
                                            Last Clean Date:
                                            <Input
                                                type="date"
                                                name="date"
                                                id="lastCleanDate"
                                                placeholder={filter.lastCleanDate}
                                                value={filter.lastCleanDate}
                                                onChange={(evt) => { changeLastCleanDate(filter.id, evt) }}
                                            />

                                </Col>
                                <Col xs={12} sm={2} >
                                    <Button color={'link'} className={'m-0 p-0'}
                                        onClick={() => deleteFilter(filter.id)}
                                    ><img width={'30px'} src={deleteIcon} /></Button>
                                </Col>
                            </Row>
                        </ListGroupItem>
                    })}

                </ListGroup>
                <Button color={'primary'}
                    className={"m-1"}
                    onClick={handleAdd}>
                    Add Filter
                            </Button>

            </Container>

        </div >

    );

}

export default FilterEdit;