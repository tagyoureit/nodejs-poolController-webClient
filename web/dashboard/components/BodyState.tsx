import React, { useEffect, useState } from 'react';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import { Button, ButtonGroup, Col, ListGroup, ListGroupItem, Row } from 'reactstrap';
import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { comms } from './Socket_Client';

const flame=require('../images/flame.png');
interface Props {
    id: string;
    
}
const initialState={
    UOM: { desc: '', val: 0, name: '' },
    temps: { 
        bodies: [],
        units: {name: 'F'}
    }
}
function BodyState(props: Props) {
    const [body1, setBody1]=useState(0);
    const [body2, setBody2]=useState(0);
    const [body3, setBody3]=useState(0);
    const [body4, setBody4]=useState(0);
    let arr=[];
    arr.push({ url: `${ comms.poolURL }/state/temps`, dataName: 'temps' });
    arr.push({ url: `${ comms.poolURL }/state/heaters`, dataName: 'heaters' });
    arr.push({ url: `${ comms.poolURL }/config/body/1/heatModes`, dataName: 'heatModes' });

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        let emitter=comms.getEmitter();
        const fnTemps=function(data) { 
            console.log(`incoming socket temps`)
            doUpdate({ updateType: 'MERGE_OBJECT', dataName: 'temps', data }); };
        const fnBody=function(data) { 
            console.log(`incoming socket body`)
            doUpdate({ updateType: 'MERGE_ARRAY', dataName: ['temps', 'bodies'], data }); };
        emitter.on('temps', fnTemps);
        emitter.on('body', fnBody);
        return () => {
            emitter.removeListener('temps', fnTemps);
            emitter.removeListener('body', fnBody);
        };
    }, []);
    /* eslint-enable react-hooks/exhaustive-deps */

    useEffect(() => {
        data.temps && data.temps.bodies && data.temps.bodies.forEach(body => {
            console.log(`BODY: ${ body.id }  -- setPoint ${ body.setPoint }`)
            switch(body.id) {
                case 1:
                    setBody1(body.setPoint);
                    break;
                case 2:
                    setBody2(body.setPoint);
                    break;
                case 3:
                    setBody3(body.setPoint);
                    break;
                case 4:
                    setBody4(body.setPoint);
            }
        })
    }, [JSON.stringify(data.temps.bodies), data.temps.bodies])

    const changeHeat=(id: number, mode: number) => {
        comms.setHeatMode(id, mode)
    }
    const changeSetPointVal=(setPoint: number, body: number) => {
        switch(body) {
            case 1:
                if(body1!==setPoint)
                    setBody1(setPoint);
                break;
            case 2:
                if(body1!==setPoint)
                    setBody2(setPoint);
                break;
            case 3:
                if(body1!==setPoint)
                    setBody3(setPoint);
                break;
            case 4:
                if(body1!==setPoint)
                    setBody4(setPoint);
        }

    };
    const changeSetPointComplete=(body: number) => {
        let sp=0;
        switch(body) {
            case 1:
                sp=body1;
                break;
            case 2:
                sp=body2;
                break;
            case 3:
                sp=body3;
                break;
            case 4:
                sp=body4;
        }
        comms.setHeatSetPoint(body, sp)
    }
    const handleOnOffClick=(event: any) => {
        comms.toggleCircuit(event.target.value)
    }

    const bodyDisplay=() => {
        if(!data.temps.bodies) { return <>No Bodies</> };
        return data&&data.temps.bodies.map(body => {
            const low=data.temps.units.name==='F'? 50:10;
            const high=data.temps.units.name==='F'? 104:43;
            const labelStr=`{"${ low }": "${ low }", "${ high }": "${ high }"}`
            let labels=JSON.parse(labelStr)
            const showFlameSolar=() => {
                if(body.isOn&&body.heatStatus.name==='solar') {
                    return (<img src={flame} />)
                }
            }
            const showFlameHeater=() => {
                if(body.isOn&&body.heatStatus.name==='heater') {
                    return (<img src={flame} />)
                }
            }
            return (<ListGroupItem key={body.id+'BodyKey'}> <Row>
                <Col>{body.name}
                </Col>
                <Col>
                    <Button color={body.isOn? 'success':'primary'}
                        onClick={handleOnOffClick} value={body.circuit}  >
                        {body.isOn? "On":"Off"}
                    </Button>

                </Col>
            </Row>
                <Row>
                    <Col>Temp</Col>
                    <Col >
                        {body.temp}
                        {body.isOn? ``:` (Last)`}
                    </Col>
                </Row>
                <Row>
                    <Col>

                        <Slider
                            min={low}
                            max={high}
                            labels={labels}
                            value={body.id===1?body1:body.id===2?body2:body.id===3?body3:body4}
                            data-bodyid={body.id}
                            onChange={(setPoint) => changeSetPointVal(setPoint, body.id)}
                            onChangeComplete={() => changeSetPointComplete(body.id)}
                        />
                        <div className='text-center'>
                            Set Point: {body.setPoint}
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        Heater Mode
                                <div className='d-flex justify-content-center'>
                            <ButtonGroup >
                                <Button onClick={() => changeHeat(body.id, 0)} color={body.heatMode.val===0? 'success':'secondary'}>Off</Button>
                                <Button onClick={() => changeHeat(body.id, 1)} color={body.heatMode.val===1? 'success':'secondary'}>Heater{' '}{showFlameHeater()}</Button>
                                <Button onClick={() => changeHeat(body.id, 2)} color={body.heatMode.val===2? 'success':'secondary'}>Solar Pref</Button>
                                <Button onClick={() => changeHeat(body.id, 3)} color={body.heatMode.val===3? 'success':'secondary'}>Solar{' '}{showFlameSolar()}</Button>
                            </ButtonGroup>
                        </div>
                    </Col>
                </Row>
            </ListGroupItem>
            )
        })
    }

    return doneLoading&&!isError&&(
        <div className='tab-pane active' id={props.id} role="tabpanel" aria-labelledby={props.id+'-tab'} >
            <CustomCard name={(data&&data.temps.length===1? 'Body':'Bodies')} id={props.id} >
                <ListGroup flush >
                    {bodyDisplay()}
                </ListGroup>
            </CustomCard>
        </div>
    )

}

export default BodyState;