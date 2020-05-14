import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useEffect, useState } from 'react';
import Slider from 'react-rangeslider';

import { IConfigPumpCircuit, IDetail, IConfigPump, getItemByVal } from '../PoolController';

interface Props {
    disabled: boolean
    currentPumpCircuit: IConfigPumpCircuit
    currentPump: IConfigPump;
    pumpUnits: IDetail[];
    onChange: (pumpCircuit: number, obj: any) => void
}

interface State {
    desiredRate: number
    isGPM: boolean
}

function PumpConfigSelectSpeedSlider(props: Props) {
    /*     constructor(props: Props) {
            super(props)
            console.log(props.currentPumpCircuit)
            state={
                desiredRate: props.currentPumpCircuit.speed||props.currentPumpCircuit.flow||0,
                isGPM: props.currentPumpCircuit.units.desc==='GPM'
            }
            onChangeSpeed=onChangeSpeed.bind(this)
        } */
    const [isGPM, setIsGPM]=useState(false);
    const [desiredRate, setDesiredRate]=useState(0);
    const [_min, setMin] = useState(450);
    const [_max, setMax] = useState(3450);
    useEffect(() => {
        let unit=getItemByVal(props.pumpUnits, props.currentPumpCircuit.units);
        if (unit.name === 'gpm'){
            setIsGPM(true);
            setDesiredRate(props.currentPumpCircuit.flow);
            setMin(props.currentPump.minFlow);
            setMax(props.currentPump.maxFlow);
        }
        else {
            setIsGPM(false);
            setDesiredRate(props.currentPumpCircuit.speed);
            setMin(props.currentPump.minSpeed);
            setMax(props.currentPump.maxSpeed);
        }
    }, [JSON.stringify(props.currentPumpCircuit)])
    /* 
        componentDidUpdate(prevProps: Props, prevState: State) {
            if (JSON.stringify(prevProps.currentPumpCircuit)!==JSON.stringify(props.currentPumpCircuit) )
                setState({
                    desiredRate: props.currentPumpCircuit.speed||props.currentPumpCircuit.flow||0,
                    isGPM: props.currentPumpCircuit.units.desc==='GPM'
                })
        } */

    const onChangeSpeed=(_speed: number) => {
        setDesiredRate(_speed);
    }

    const onChangeComplete=() => {
        console.log(`changing currentSpeed=${ props.currentPumpCircuit.flow||props.currentPumpCircuit.speed } ${ isGPM? 'GPM':'RPM' } currentPumpCircuit=${ props.currentPumpCircuit.id } to speed ${ desiredRate }`)

        // comms.setPumpCircuit( props.currentPump, props.currentPumpCircuitid, {rate: state.desiredRate} )
        props.onChange(props.currentPumpCircuit.id, { rate: desiredRate })
    }

    const customLabels=() => {
        if(props.currentPumpCircuit.id!==8) return {};
        if(isGPM) {
            return { 15: "15", 130: "130" }
        }
        else {
            return { 450: "450", 3450: "3450" };
        }
    }

    if(props.currentPumpCircuit.id>0)
        return (

            <Slider
                disabled={props.disabled}
                value={desiredRate}
                onChange={onChangeSpeed}
                onChangeComplete={onChangeComplete}
                min={_min}
                max={_max}
                step={isGPM? 1:10}
                labels={customLabels()}
            />

        )
    else return (< div />)

}

export default PumpConfigSelectSpeedSlider;