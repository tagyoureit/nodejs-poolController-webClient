import React, { ReactChildren, useState } from 'react';
import { Collapse, Nav, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink, Tooltip } from 'reactstrap';

import { useAPI } from './Comms';
import { PoolContext } from './PoolController';

interface Props
{
    // appVersionStatus: {
    //     installed: string;
    //     status: IDetail;
    //     nextCheckTime: string;
    //     githubRelease: string
    // },
    children: ReactChildren
}

function PoolNav(props) {
    const execute = useAPI();
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {
            setIsOpen(!isOpen);
    }
    const resetLayout = async () =>{
        await execute('resetPanelVisibility', )
        toggle();
    }
    const [tooltipOpen, settooltipOpen] = useState(false);

    const toggleToolTip = () => settooltipOpen(!tooltipOpen);

    const updateAvailable = () => {
        if (typeof props?.appVersionState?.status?.name !== 'undefined') {
            if (props.appVersionState.status.name === 'ahead'){ 
                
                return (<p className='text-muted float-left m-2 text-center' style={{fontSize:'10px'}} id="toolTip">Platform: <br />{props.appVersionState.status.name}
                <Tooltip isOpen={tooltipOpen} autohide={false} placement="bottom" target="toolTip" toggle={toggleToolTip}>
                {props.appVersionState.status.desc}<br />
                Installed version: {props.appVersionState.installed}<br />
                Published version: {props.appVersionState.githubRelease}
                </Tooltip>
                </p> )
            }
            else if (props.appVersionState.status.name === 'behind'){ 
                return (<p className='text-primary float-left m-2 text-center' style={{fontSize:'10px'}} id="toolTip">Platform: <br />{props.appVersionState.status.name}
                <Tooltip isOpen={tooltipOpen} autohide={false}  placement="bottom" target="toolTip" toggle={toggleToolTip}>
                {props.appVersionState.status.desc}<br />
                Installed version: {props.appVersionState.installed}<br />
                Published version: {props.appVersionState.githubRelease}<br />
                Visit <a href='https://github.com/tagyoureit/nodejs-poolController/releases' target='_new'>nodejs-poolController Github</a> for the new release
                </Tooltip>
                </p> )
            }
        } 
    }

        return (                
        <PoolContext.Consumer>
            {({ visibility, reload }) => (
            <Navbar color="light" light sticky="top" >
                <NavbarBrand href="/" >nodejs-PoolController
                </NavbarBrand>
                <span style={{display:'flex'}}>
                    
                {updateAvailable()}
                <NavbarToggler onClick={toggle} />
                </span>
                
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="ml-auto" >
                        <NavItem>
                            <NavLink onClick={toggle} href="#system" id='system-tab' data-toggle='tab' aria-controls='system' aria-selected='false'>System Info</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#Bodies"
                                id='Bodies-tab' data-toggle='tab' aria-controls='Bodies' aria-selected='false'
                                >Bodies</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#Pumps"
                                id='Pumps-tab' data-toggle='tab' aria-controls='Pumps' aria-selected='false'
                                >Pumps</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#Circuits"
                                id='Circuits-tab' data-toggle='tab' aria-controls='Circuits' aria-selected='false'
                                >Circuits</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#Features"
                                id='Features-tab' data-toggle='tab' aria-controls='Features' aria-selected='false'
                                >Features</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#Schedules"
                                id='Schedules-tab' data-toggle='tab' aria-controls='Schedules' aria-selected='false'
                                >Schedules</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#Chlorinators" id='Chlorinators-tab' data-toggle='tab' aria-controls='Chlorinators' aria-selected='false'>Chlorinators</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#Lights" id='Lights-tab' data-toggle='tab' aria-controls='Lights' aria-selected='false'>Lights</NavLink>
                        </NavItem>

                        <NavItem>
                            <NavLink onClick={toggle} href="/utilities" id='utilities' >Utilities</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={()=>{resetLayout();
                                reload()}
                            } id='reset' href='#'>Reset Layout</NavLink>
                        </NavItem>
                    </Nav>
                    <br />
                {props.children}
                </Collapse>
            </Navbar>
            )}
            </PoolContext.Consumer>
            
        )
    
}
export default PoolNav;