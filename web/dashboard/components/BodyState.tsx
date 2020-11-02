import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useState } from 'react';
import Slider from 'react-rangeslider';
import { Button, ButtonGroup, Col, ListGroup, ListGroupItem, Row } from 'reactstrap';


import { PoolContext, IStateTemp, ConfigOptionsHeaters, IStateTempBodyDetail, IDetail } from './PoolController';
import { useAPI } from './Comms';
var extend = require('extend');
const flame = require('../images/flame.png');
const snowflake = require('../images/snowflake.png');
interface Props {
    currentBodyId: number;
    options: ConfigOptionsHeaters;
    temps: IStateTemp;
}
function BodyState(props: Props) {
    const { poolURL, emitter } = useContext(PoolContext);
    const currentBody = () => {
        return props.temps.bodies.find(body => body.id === props.currentBodyId);
    }
    const [tempSetpoint, settempSetpoint] = useState(currentBody().setPoint);
    const execute = useAPI();
    const changeHeat = async (mode: number) => {
        await execute('setHeatMode', { id: props.currentBodyId, mode })
    }
    const changeSetPointVal = (setPoint: number) => {
        settempSetpoint(setPoint);
    };
    const changeSetPointComplete = async () => {
        let data = await execute('setHeatSetPoint', { id: props.currentBodyId, setPoint: tempSetpoint })
        if (typeof data.stack !== 'undefined') {
            settempSetpoint(currentBody().setPoint);
            console.log(`Error setting setPoint: ${JSON.stringify(data)}`);
            console.log(data);
        }
    }
    const handleOnOffClick = async (event: any) => {
        await execute('toggleCircuit', { id: event.target.value })
    }
    const low = props.temps.units.name === 'F' ? 50 : 10;
    const high = props.temps.units.name === 'F' ? 104 : 43;
    const labelStr = `{"${low}": "${low}", "${high}": "${high}"}`
    let labels = JSON.parse(labelStr)
    const showHeatStatusIcon = (mode: IDetail) => {
        if (!currentBody().isOn || mode.name === 'off' || mode.name.includes('preferred')) return;
        // solar = heatpump
        switch (mode.name) {
            case 'solar':
                if (currentBody().heatStatus.name === 'solar ') return (<img src={flame} />);
                break;
            case 'heater':
                if (currentBody().heatStatus.name === 'heater') return (<img src={flame} />);
                break;
            case 'heatpump':
                if (currentBody().heatStatus.name === 'solar') return (<img src={flame} />);
                if (currentBody().heatStatus.name === 'cooling') return (<img src={snowflake} />);
                break;
        }
/*         if (currentBody().heatStatus.name === 'solar' && mode.name === 'heatpump' ||
            // solar = solar
            // heater = heater
            currentBody().heatStatus.name === mode.name) return (<img src={flame} />) */
    }

    const heaterButtons = () => {
        return <ButtonGroup >
            {props.options.heatModes.map(mode => {
                return <Button
                    key={`body-${props.currentBodyId}-heatMode-${mode.val}`}
                    onClick={() => changeHeat(mode.val)}
                    color={currentBody().heatMode.val === mode.val ? 'success' : 'secondary'}>
                    {`${mode.desc} `}{showHeatStatusIcon(mode)}
                </Button>
            })}
        </ButtonGroup>
    }

    return (
        <ListGroupItem key={currentBody().id + 'BodyKey'}> <Row>
            <Col>{currentBody().name}
            </Col>
            <Col>
                <Button color={currentBody().isOn ? 'success' : 'primary'}
                    onClick={handleOnOffClick} value={currentBody().circuit}  >
                    {currentBody().isOn ? "On" : "Off"}
                </Button>

            </Col>
        </Row>
            {typeof currentBody().temp !== 'undefined' && <Row>
                <Col>Temp</Col>
                <Col >
                    {currentBody().temp}
                    {!currentBody().isOn && ` (Last)`}
                </Col>
            </Row>}
            {props?.options?.heatModes?.length >= 1 && <> <Row>
                <Col>

                    <Slider
                        min={low}
                        max={high}
                        labels={labels}
                        value={tempSetpoint}
                        onChange={changeSetPointVal}
                        onChangeComplete={changeSetPointComplete}
                    />
                    <div className='text-center'>
                        Set Point: {currentBody().setPoint}
                    </div>
                </Col>
            </Row>
                <Row>
                    <Col>
                        <div className='d-flex justify-content-center'>
                            {heaterButtons()}
                        </div>
                    </Col>
                </Row></>}
        </ListGroupItem>
    )
}

export default BodyState;