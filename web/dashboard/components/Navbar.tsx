import StatusIndicator from './StatusIndicator'
import React, {useState} from 'react';
import { IDetail } from './PoolController';
import {comms} from '../components/Socket_Client'
import
{
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import { PoolContext } from './PoolController';

interface Props
{
    status: IDetail & { percent?: number };
    counter: number;
}

function PoolNav(props: any) {

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => {
            setIsOpen(!isOpen);
    }
    const resetLayout = () =>{
        comms.resetPanelVisibility()
        toggle();
    }

        return (                
        <PoolContext.Consumer>
            {({ visibility, reload }) => (
            <Navbar color="light" light sticky="top" >
                <NavbarBrand href="/" >nodejs-PoolController
                </NavbarBrand>

                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav className="ml-auto" >
                        <NavItem>
                            <NavLink onClick={toggle} href="#system" id='system-tab' data-toggle='tab' aria-controls='system' aria-selected='false'>System Info</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#bodies"
                                id='bodies-tab' data-toggle='tab' aria-controls='bodies' aria-selected='false'
                            >Bodies</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#pump"
                                id='pump-tab' data-toggle='tab' aria-controls='pumps' aria-selected='false'
                            >Pumps</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#circuits"
                                id='circuits-tab' data-toggle='tab' aria-controls='circuits' aria-selected='false'
                            >Circuits</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#features"
                                id='features-tab' data-toggle='tab' aria-controls='features' aria-selected='false'
                            >Features</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#schedules"
                                id='schedules-tab' data-toggle='tab' aria-controls='schedules' aria-selected='false'
                            >Schedules</NavLink>
                        </NavItem>
{/*                         <NavItem>
                            <NavLink onClick={toggle} href="#eggtimers"
                                id='eggtimers-tab' data-toggle='tab' aria-controls='eggtimers' aria-selected='false'
                            >EggTimers</NavLink>
                        </NavItem> */}
                        <NavItem>
                            <NavLink onClick={toggle} href="#chlorinators" id='chlorinators-tab' data-toggle='tab' aria-controls='chlorinators' aria-selected='false'>Chlorinators</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={toggle} href="#light" id='light-tab' data-toggle='tab' aria-controls='light' aria-selected='false'>Lights</NavLink>
                        </NavItem>
{/*                         <NavItem>
                            <NavLink onClick={toggle} href="#debug" id='debug-tab' data-toggle='tab' aria-controls='debug' aria-selected='false'>Debug Log</NavLink>
                        </NavItem> */}
                        <NavItem>
                            <NavLink onClick={toggle} href="/utilities" id='utilities' >Utilities</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink onClick={()=>{resetLayout();reload()}} id='reset' href='#'>Reset Layout</NavLink>
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