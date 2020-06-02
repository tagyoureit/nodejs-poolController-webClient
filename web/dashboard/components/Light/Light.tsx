import {
    Row, Col, Button, ButtonGroup, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';

import CustomCard from '../CustomCard';
import React, { useContext, useEffect, useState } from 'react';
// import { setLightMode } from '../Comms';
import LightEdit from './LightEdit';
import useDataApi from '../DataFetchAPI';
import { PoolContext, IConfigOptionsLightGroups } from '../PoolController';
import { useAPI } from '../Comms';
import axios from 'axios';
interface Props {
    id: string;
}

const initialState: IConfigOptionsLightGroups={
    maxLightGroups: 1,
    equipmentNames: [],
    themes: [],
    colors: [],
    circuits: [],
    lightGroups: [],
    functions: []
};

function Light(props: Props) {
    const [dropdownOpen, setDropdownOpen]=useState(false);
    const [modalOpen, setModalOpen]=useState(false);
    const execute=useAPI();
    const toggleDropDown=() => { setDropdownOpen(!dropdownOpen); };
    const handleClick=async (theme, id) => {
        await execute('setLightGroupTheme', { id, theme });
    };
    const closeBtn=<button className="close" onClick={() => setModalOpen(!modalOpen)}>&times;</button>;
    const { reload, poolURL, controllerType, emitter }=useContext(PoolContext);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);
    useEffect(() => {
        if(typeof poolURL!=='undefined'&&typeof emitter!=='undefined') {
            let arr=[];
            arr.push({ url: `${ poolURL }/config/options/lightGroups`, dataName: 'options' });
            arr.push({ url: `${ poolURL }/state/lightGroups`, dataName: 'lightGroups' });
            doFetch(arr);

            const fn=function(data) {
                console.log(`received lightGroup emit`);
                doUpdate({ updateType: 'MERGE_ARRAY', dataName: 'lightGroups', data });
            };
            emitter.on('lightGroup', fn);
            emitter.on('lightGroupConfig', function(data) {
                doUpdate({ updateType: 'REPLACE_ARRAY', dataName: ['options', 'lightGroups'], data });
            });
            return () => {
                emitter.removeListener('lightGroup', fn);
                emitter.removeListener('lightGroupConfig', function(data) {
                    doUpdate({ updateType: 'REPLACE_ARRAY', dataName: ['options', 'lightGroups'], data });
                });
            };
        }
    }, [poolURL, doFetch, emitter]);

    return (<>
        {!doneLoading&&<>Loading...</>}
        {doneLoading&&!isError&&
            <div className="tab-pane active" id="light" role="tabpanel" aria-labelledby="light-tab">

                <CustomCard name='Lights' id={props.id} edit={() => setModalOpen(!modalOpen)}>
                    {data.lightGroups.map(lightGroup => {
                        return (<div key={`lightGroup${ lightGroup.id }`}>

                            {lightGroup?.type?.desc}&nbsp;
                            {lightGroup.action.val? `: Please wait... ${ lightGroup.action.desc }`:<><ButtonDropdown
                                isOpen={dropdownOpen}
                                toggle={toggleDropDown}
                                disabled={lightGroup.action.val!==0}
                            >
                                <DropdownToggle caret>
                                    Light Modes
                        </DropdownToggle>
                                <DropdownMenu>

                                    {data.options.themes.filter(theme => theme.type==='intellibrite'
                                        &&!['colorsync', 'colorswim', 'colorset', 'on', 'off'].includes(theme.name)
                                    ).map(theme => {
                                        return <DropdownItem onClick={() => { handleClick(theme.val, lightGroup.id); }} key={`theme-${ theme.val }`}>{theme.desc}</DropdownItem>;
                                    })}
                                </DropdownMenu>
                            </ButtonDropdown>

                                {data.options.themes.filter(theme => theme.name==='on').map(theme => {
                                    return <Button onClick={() => { handleClick(theme.val, lightGroup.id); }} key={`theme-${ theme.val }`} className={'ml-2'}>{theme.desc}</Button>;
                                })}
                                {data.options.themes.filter(theme => theme.name==='off').map(theme => {
                                    return <Button onClick={() => { handleClick(theme.val, lightGroup.id); }} key={`theme-${ theme.val }`} className={'ml-2'}>{theme.desc}</Button>;
                                })}
                                {data.options.themes.filter(theme => theme.name==='colorsync').map(theme => {
                                    return <Button onClick={() => { handleClick(theme.val, lightGroup.id); }} key={`theme-${ theme.val }`} className={'ml-2'}>{theme.desc}</Button>;
                                })}
                                {data.options.themes.filter(theme => theme.name==='colorswim').map(theme => {
                                    return <Button onClick={() => { handleClick(theme.val, lightGroup.id); }} key={`theme-${ theme.val }`} className={'ml-1'}>{theme.desc}</Button>;
                                })}
                                {data.options.themes.filter(theme => theme.name==='colorset').map(theme => {
                                    return <Button onClick={() => { handleClick(theme.val, lightGroup.id); }} key={`theme-${ theme.val }`} className={'ml-1'}>{theme.desc}</Button>;
                                })}
                            </>}
                            {data.options.lightGroups.length>0&&<br />}
                        </div>);
                    })
                    }

                </CustomCard>


                <Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)} size='xl' scrollable={true}>
                    <ModalHeader toggle={() => setModalOpen(!modalOpen)} close={closeBtn}>Adjust Light Groups</ModalHeader>
                    <ModalBody>
                        <LightEdit data={data.options} />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => setModalOpen(!modalOpen)}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        }
    </>
    );
};

export default Light;

{/* <DropdownItem header>Actions</DropdownItem>

                        <DropdownItem onClick={handleClick} value='0'>Off</DropdownItem>
                        <DropdownItem onClick={handleClick} value='1'>On</DropdownItem>
                        <DropdownItem onClick={handleClick} value='128'>Color Sync</DropdownItem>
                        <DropdownItem onClick={handleClick} value='144'>Color Swim</DropdownItem>
                        <DropdownItem onClick={handleClick} value='160'>Color Set</DropdownItem>
                        <DropdownItem onClick={handleClick} value='190'>Save</DropdownItem>
                        <DropdownItem onClick={handleClick} value='191'>Recall</DropdownItem>

                        <DropdownItem divider />
                        <DropdownItem header>Colors</DropdownItem>
                        <DropdownItem onClick={handleClick} value='196' style={{ color: 'white', background: 'gray' }}>White</DropdownItem>
                        <DropdownItem onClick={handleClick} value='194' style={{ color: 'green' }}>
                            Green
                                </DropdownItem>
                        <DropdownItem onClick={handleClick} value='193' style={{ color: 'blue' }}>
                            Blue
                                </DropdownItem>
                        <DropdownItem onClick={handleClick} value='195' style={{ color: 'red' }}>Red
                                </DropdownItem>
                        <DropdownItem onClick={handleClick} value='197' style={{ color: 'magenta' }}>Magenta
                                </DropdownItem>

                        <DropdownItem divider />
                        <DropdownItem header>Scenes</DropdownItem>
                        <DropdownItem onClick={handleClick} value='177'>Party</DropdownItem>
                        <DropdownItem onClick={handleClick} value='178'>Romance</DropdownItem>
                        <DropdownItem onClick={handleClick} value='179'>Caribbean</DropdownItem>
                        <DropdownItem onClick={handleClick} value='180'>American</DropdownItem>
                        <DropdownItem onClick={handleClick} value='181'>Sunset</DropdownItem>
                        <DropdownItem onClick={handleClick} value='182'>Royal</DropdownItem> */}