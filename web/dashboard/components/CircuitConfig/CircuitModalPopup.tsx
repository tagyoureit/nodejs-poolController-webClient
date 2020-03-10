import {
    Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink, Modal,ModalHeader, ModalBody, ModalFooter, ListGroupItem
} from 'reactstrap';
import CustomCard from '../CustomCard'
import React, {useState, useEffect} from 'react';
import {IStatePump, IConfigPump, getItemById, } from '../PoolController';
import {StateCircuit} from '../Circuits';
import {comms} from '../Socket_Client';
interface Props {
    id: string;
    visibility: string;
}
interface State {


}

function CircuitModalPopup(props) {
   let _pumpTypes: any[]=[];
   const [circuits, setCircuits] = useState<StateCircuit[] | null>();
   const [features, setFeatures] = useState<StateCircuit[] | null>();
      
   useEffect(()=>{
    incoming();
    fetch(`${ comms.poolURL }/state/circuits`)
        .then(res => res.json())
        .then(
            result => {
                setCircuits(result);
            },
            error => {
                console.log(error);
            }
        );
    fetch(`${ comms.poolURL }/state/features`)
        .then(res => res.json())
        .then(
            result => {
                setFeatures(result);
            },
            error => {
                console.log(error);
            }
        );

   }, [])

   function incoming() {
        /* let self=this;
        comms.passthrough((d: any, which: string): void => {
            if(which==='circuit') {
                if(getItemById(self.state.circuits, d.id)!==0) {
                    console.log({ [which]: d });
                    let circuits=extend(true, [], self.state.circuits);
                    let index=self.state.circuits.findIndex(el => {
                        return el.id===d.id;
                    });
                    index===-1? circuits.push(d):circuits[index]=d;
                    self.setState({ circuits: circuits });
                }
            }
        }); */
    }
  



  
   function handleNavClick(event: any) {
        let _activeLink=event.target.target;
        let _currentPump=parseInt(event.target.target.slice(-1))
        console.log(_activeLink)
        console.log(_currentPump)
        /* this.setState({
            activeLink: _activeLink,
            currentPumpNum: _currentPump,
            currentPumpState: getItemById(this.props.pumpStates, _currentPump),
            currentCircuit: getItemById(this.props.Circuits, _currentPump)
        }) */
    }



        return (
            <div className="tab-pane active" id="Circuit" role="tabpanel" aria-labelledby="Circuit-tab">
                <CustomCard name='Circuit Config' visibility={props.visibility} id={props.id}>
                    some data
                    {circuits.map(circuit => {
            return (
                <ListGroupItem key={circuit.id+'circuitlistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        {circuit.name}
                        <Button color={circuit.isOn? 'success':'primary'} key={circuit.id+'circuit'} onClick={this.handleClick} value={circuit.id} >{circuit.isOn? 'On':'Off'}
                        </Button>
                    </div>
                </ListGroupItem>
            );

        })}
                    {features.map(feature => {
            return (
                <ListGroupItem key={feature.id+'featurelistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        {feature.name}
                        <Button color={feature.isOn? 'success':'primary'} key={feature.id+'feature'} onClick={this.handleClick} value={feature.id} >{feature.isOn? 'On':'Off'}
                        </Button>
                    </div>
                </ListGroupItem>
            );

        })}
                </CustomCard>
                
            </div>
        )
    
}

export default CircuitModalPopup;