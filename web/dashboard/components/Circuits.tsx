import {
    ListGroup, ListGroupItem, Button, Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap';
import CustomCard from './CustomCard';
import { comms } from './Socket_Client';
import * as React from 'react';
import { ControllerType, getItemById, IDetail } from './PoolController';
import CircuitModalPopup from './CircuitConfig/CircuitModalPopup';
var extend=require("extend");
interface Props {
    controllerType: ControllerType;
    id: string;
    visibility: string;
}
interface State {
    circuits: StateCircuit[];
    sock: any;
    modalOpen: boolean
}
export interface ConfigCircuit {
    id: number;
    type: number;
    name: string;
    freeze: boolean;
    macro: boolean;
    isActive: boolean;
}
export interface StateCircuit {
    id: number;
    isOn: boolean;
    name: string;
    type: IDetail
}


class Circuits extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.handleClick=this.handleClick.bind(this);
        this.state={ circuits: [], sock: undefined, modalOpen: false};
        this.toggleModal = this.toggleModal.bind( this )
    }
    toggleModal() {
        // open and close the modal
        this.setState({
            modalOpen: !this.state.modalOpen
        });
    }
    incoming() {
        let self=this;
        comms.passthrough((d: any, which: string): void => {
            if(which==='circuit' || which==='virtualCircuit'|| which==='circuitGroup') {
                if(getItemById(self.state.circuits, d.id)!==0) {
                    console.log({ [which]: d });
                    let circuits=extend(true, [], self.state.circuits);
                    let index=self.state.circuits.findIndex(el => {
                        return el.id===d.id;
                    });
                    index===-1? circuits.push(d):circuits[index]=d;
                    self.setState({ circuits: circuits });
                }
            // }
           
        });
    }
    componentDidMount() {
        this.incoming();
        let url=`${ comms.poolURL }/state`;
        switch(this.props.id) {
            case "Circuits":
                url=`${ url }/circuits`;
                break;
            case "Circuit Groups":
                url=`${ url }/circuitGroups`;
                break;
            case "Virtual Circuits":
                url=`${ url }/virtualCircuits`;
                break;
        }
        console.log(`fetching ${ url }`);
        fetch(url)
            .then(res => res.json())
            .then(
                result => {
                    console.log({ state: result });
                    this.setState({ circuits: result }, function() {
                        console.log(`finished setting circuit state...`);
                        console.log(this.state);
                    });
                },
                error => {
                    console.log(error);
                }
            );

    }
    circuit=() => {
        if(typeof this.state.circuits==='undefined'||!this.state.circuits.length) return (<div />);
        // TODO: Aux Extra and NOT used should be hidden.
        // for ( var cir in data )
        // {
        //     // check to make sure we have the right data
        //     if ( data[ cir ].hasOwnProperty( 'name' ) )
        //     {
        //         // if hideAux is true skip the unused circuits
        //         if ( [ 'NOT USED', 'AUX EXTRA' ].indexOf( data[ cir ].name ) !== -1 && this.props.hideAux )
        //         {
        //         }
        //         else
        //         {
        return this.state.circuits.map(circuit => {
            return (
                <ListGroupItem key={circuit.id+'circuitlistgroupkey'}>
                    <div className='d-flex justify-content-between'>
                        {circuit.name}
                        <Button color={circuit.isOn? 'success':'primary'} key={circuit.id+'circuit'} onClick={this.handleClick} value={circuit.id} >{circuit.isOn? 'On':'Off'}
                        </Button>
                    </div>
                </ListGroupItem>
            );


        });
    };
    handleClick=(event: any): any => {
        comms.toggleCircuit(event.target.value);
    };
    render() {
        const closeBtn = <button className="close" onClick={this.toggleModal}>&times;</button>;
        // if(this.props.controllerType!==ControllerType.intellicenter&&this.props.id==='Circuit Groups') return (<div />);
        let className="circuit-pane active";
        return (
            <div className={className} id={this.props.id} role="tabpanel" aria-labelledby="circuit-tab">
                <CustomCard name={this.props.id} id={this.props.id} visibility={this.props.visibility} edit={this.props.id === 'Circuits'?this.toggleModal:undefined}>
                    <ListGroup flush >
                        {this.circuit()}
                    </ListGroup>
                </CustomCard>
                <Modal isOpen={this.state.modalOpen} toggle={this.toggleModal} size='xl' scrollable={true}>
                    <ModalHeader toggle={this.toggleModal} close={closeBtn}>Adjust Pump Configuration</ModalHeader>
                    <ModalBody>
                        <CircuitModalPopup
                            id='circuitConfig'
                            visibility='visible' />
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={this.toggleModal}>Close</Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default Circuits;