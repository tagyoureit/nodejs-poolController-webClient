import {
    Row, Col, Button, ButtonGroup, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';

import CustomCard from '../CustomCard'
import React, { useContext, useEffect, useState } from 'react';
// import { setLightMode } from '../Socket_Client';
import LightEdit from './LightEdit'
import useDataApi from '../DataFetchAPI';
import { PoolContext } from '../PoolController';
import setIBTheme, { comms } from '../Socket_Client';
interface Props {
    id: string;
}


const initialState={
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

    const toggleModal=() => { setModalOpen(modalOpen); }
    const toggleDropDown=() => { setDropdownOpen(!dropdownOpen); }
    const handleClick=(event: any) => { comms.setIBTheme(event.target.value); 
    }
    const closeBtn=<button className="close" onClick={toggleModal}>&times;</button>;
    const { reload, poolURL, controllerType }=useContext(PoolContext);
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);
    useEffect(() => {
        if(typeof poolURL!=='undefined') {

            let arr=[];
            arr.push({ url: `${ poolURL }/config/options/lightGroups`, dataName: 'lightGroups' });
            doFetch(arr);

        }
    }, [poolURL, doFetch])

    return (<>
        {!doneLoading&&<>Loading...</>}
        {doneLoading&&!isError&&
            <div className="tab-pane active" id="light" role="tabpanel" aria-labelledby="light-tab">
                <CustomCard name='Lights' id={props.id} edit={toggleModal}>

                    <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropDown}>
                        <DropdownToggle caret>
                            {controllerType} Light Modes
                    </DropdownToggle>
                        <DropdownMenu>
                            {data.lightGroups.themes.filter(theme => theme.type==='intellibrite'
                            && theme.name!=='colorsync' && theme.name!=='colorswim'&&theme.name!=='colorset' ).map(theme => {
                                return <DropdownItem onClick={handleClick} value={theme.val} key={`theme-${theme.val}`}>{theme.desc}</DropdownItem>
                            })}
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

                        </DropdownMenu>
                    </ButtonDropdown>
                    
                    {data.lightGroups.themes.filter(theme => theme.name==='colorsync').map(theme => {
                                return <Button onClick={handleClick} value={theme.val} key={`theme-${theme.val}`} className={'ml-2'}>{theme.desc}</Button>
                            })}
                    {data.lightGroups.themes.filter(theme => theme.name==='colorswim').map(theme => {
                                return <Button onClick={handleClick} value={theme.val} key={`theme-${theme.val}`} className={'ml-1'}>{theme.desc}</Button>
                            })}
                    {data.lightGroups.themes.filter(theme => theme.name==='colorset').map(theme => {
                                return <Button onClick={handleClick} value={theme.val} key={`theme-${theme.val}`} className={'ml-1'}>{theme.desc}</Button>
                            })}
                </CustomCard>

                <Modal isOpen={modalOpen} toggle={toggleModal} size='xl' >
                    <ModalHeader toggle={toggleModal} close={closeBtn}>Adjust Intellibrite Lights</ModalHeader>
                    <ModalBody>
                        {/* <LightEdit data={props.data} /> */}
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={toggleModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        }
    </>
    );
};

export default Light;