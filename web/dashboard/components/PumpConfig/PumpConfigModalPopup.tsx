import {
    Row, Col, Button, ButtonGroup, Nav, NavItem, Dropdown, DropdownItem, DropdownToggle, DropdownMenu, NavLink
} from 'reactstrap';
import CustomCard from '../CustomCard'
import * as React from 'react';
import PumpConfig from './PumpConfig'
import {IStatePump, IConfigPump, getItemById} from '../PoolController';
import {mdns} from "../Socket_Client"
interface Props {
    pumpConfigs: IConfigPump[];
    pumpStates: IStatePump[];
    id: string;
    visibility: string;
}
interface State {
    activeLink: string
    currentPumpNum: number
    currentPumpState: IStatePump,
    currentPumpConfig: IConfigPump,
    availableCircuits: {type: string, id: number, name: string}[]
}

class PumpConfigModalPopup extends React.Component<Props, State> {
    private _pumpTypes: any[]=[];
    constructor(props: Props) {
        super(props)
        this.getTypes();
        this.state={
            activeLink: 'pump1',
            currentPumpNum: 1,
            currentPumpState: getItemById(this.props.pumpStates, 1),
            currentPumpConfig: getItemById(this.props.pumpConfigs, 1),
            availableCircuits: []
        }

        this.handleNavClick=this.handleNavClick.bind(this)
    }
    componentDidMount() {
        fetch(`${mdns.url}/config/pump/availableCircuits`)
        .then(res => res.json())
        .then(
            result => {
                console.log({availableCircuits: result})
                this.setState({
                    availableCircuits: result
                });
            },
            error => {
                console.log(error);
            }
        );
    }
      componentDidUpdate(prevProps: Props, prevState: State) {
            const pumpSt = getItemById(this.props.pumpStates, this.state.currentPumpNum);
            const pumpCfg = getItemById(this.props.pumpConfigs, this.state.currentPumpNum);
            if (JSON.stringify(prevState.currentPumpState)!==JSON.stringify(pumpSt) || JSON.stringify(prevState.currentPumpConfig)!==JSON.stringify(pumpCfg))
            this.setState({
                currentPumpState: pumpSt,
                currentPumpConfig: pumpCfg
            })
     } 

    getTypes() {
        fetch("http://localhost:4200/config/pump/types")
            .then(res => res.json())
            .then(
                result => {
                    this._pumpTypes=result;
                },
                error => {
                    console.log(error);
                }
            );
    }
    handleNavClick(event: any) {
        let _activeLink=event.target.target;
        let _currentPump=parseInt(event.target.target.slice(-1))
        console.log(_activeLink)
        console.log(_currentPump)
        this.setState({
            activeLink: _activeLink,
            currentPumpNum: _currentPump,
            currentPumpState: getItemById(this.props.pumpStates, _currentPump),
            currentPumpConfig: getItemById(this.props.pumpConfigs, _currentPump)
        })
    }
    render() {
        let _navTabs: any[]=[];
        this.props.pumpConfigs.forEach((pump, idx) => {
            let _linkID=`pump${pump.id}`
            _navTabs.push((
                <NavItem key={`navPumpConfigKey${pump.id}`}>
                    <NavLink href="#" target={_linkID} onClick={this.handleNavClick} active={this.state.activeLink===
                        _linkID? true:false}
                        className={this.state.activeLink===
                            _linkID? 'btn-primary':'btn-secondary'}
                    >
                        {pump.id}: {this.state.currentPumpState.type.desc}
                    </NavLink>
                </NavItem>
            ))
        })

        let currentPump=() => {
            return (<PumpConfig
                pumpConfig={this.state.currentPumpConfig}
                currentPumpNum={this.state.currentPumpNum}
                availableCircuits={this.state.availableCircuits}
                pumpState={this.state.currentPumpState}
                pumpTypes={this._pumpTypes}
            />)
        }

        return (
            <div className="tab-pane active" id="pumpConfig" role="tabpanel" aria-labelledby="pumpConfig-tab">
                <CustomCard name='Pump Config' visibility={this.props.visibility} id={this.props.id}>
                    <div>
                        <Nav tabs>
                            {_navTabs}
                        </Nav>
                    </div>
                    {currentPump()}
                </CustomCard>
            </div>
        )
    }
}

export default PumpConfigModalPopup;