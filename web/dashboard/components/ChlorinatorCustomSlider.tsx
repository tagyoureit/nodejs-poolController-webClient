import { Container, Row, Col, Button } from 'reactstrap';
import { useAPI } from './Comms';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import '../css/rangeslider.css';
import React, { useEffect, useState } from 'react';
import { IStateChlorinator, IState, getItemById, IConfigChlorinator } from './PoolController';

interface Props {
    chlor: IConfigChlorinator&IStateChlorinator,
}

function ChlorinatorCustomSlider(props: Props) {
    const [poolSetpoint, setPoolSetpoint]=useState(0);
    const [spaSetpoint, setSpaSetpoint]=useState(0);
    const [superChlorHours, setSuperChlorHours]=useState(0);
    const execute = useAPI();
    useEffect(() => {
        setPoolSetpoint(props?.chlor?.poolSetpoint)
    }, [props.chlor?.poolSetpoint])
    useEffect(() => {
        setSpaSetpoint(props?.chlor?.spaSetpoint);
    }, [props.chlor?.spaSetpoint])
    useEffect(() => {
        setSuperChlorHours(props?.chlor?.superChlorHours);
    }, [props.chlor?.superChlorHours])

    const onChangePool=(poolLvl: number) => {
        setPoolSetpoint(poolLvl);

    };

    const onChangeSpa=(spaLvl: number) => {
        setSpaSetpoint(spaLvl);
    };

    const onChangeSuperChlor=(hours: number) => {
        setSuperChlorHours(hours);
    };

    const onChangeComplete=() => {
        console.log(`setting chlor: id:${ props.chlor.id }, poolSP: ${ poolSetpoint }, spaSP:${ spaSetpoint||0 }, superChlorHrs:${ superChlorHours }`)
        execute('setChlor', {id: props.chlor.id, poolSetpoint, spaSetpoint:spaSetpoint||0, superChlorHours:superChlorHours||0});
    };

    // Todo: don't show Spa in single body of water
    const heightStyle={
        height: '300px'
    };
    const customPercentLabels={ 0: "Off", 50: "50%", 100: "100%" };
    const customTimeLabels={ 0: "Off", 12: "12", 24: "24" };

    if (typeof props.chlor === 'undefined') return (<div>No Chlor</div>)
    return (

        <div>
            <Container style={heightStyle} >
                <Row>
                    <Col>
                        Pool
                <Slider
                            labels={customPercentLabels}
                            value={poolSetpoint}
                            onChange={onChangePool}
                            onChangeComplete={onChangeComplete}
                        />
                    </Col>
                </Row>
                {props.chlor.body.val>0&&(<><Row>
                    <Col style={{ paddingTop: '25px' }}>
                        Spa
                <Slider
                            labels={customPercentLabels}
                            value={spaSetpoint}
                            onChange={onChangeSpa}
                            onChangeComplete={onChangeComplete}
                        />
                    </Col>
                </Row>
                    <Row>
                        <Col style={{ paddingTop: '25px' }}>
                            Super Chlorinate Hours
              <div className='custom-labels'>
                                <Slider
                                    min={0}
                                    max={24}
                                    labels={customTimeLabels}
                                    value={superChlorHours}
                                    onChange={onChangeSuperChlor}
                                    onChangeComplete={onChangeComplete}
                                />
                            </div>
                        </Col>
                    </Row></>)}

            </Container>

        </div >

    );

}

export default ChlorinatorCustomSlider;