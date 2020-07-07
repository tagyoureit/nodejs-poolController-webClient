import '../../css/rangeslider.css';
import 'react-rangeslider/lib/index.css';

import React, { useEffect, useMemo, useState, useContext } from 'react';
import Slider from 'react-rangeslider';

import { ConfigOptionsPump } from './PumpConfigModalPopup';
import { IConfigPump, PoolContext, IConfig, IConfigCircuit } from '../PoolController';

var extend = require("extend");
interface Props {
    currentPumpId: number;
    currentPumpCircuitId: number;
    options: ConfigOptionsPump;
    setPump: (currentPumpId: number, data:any) => void;
}

interface State {
    desiredRate: number
    isGPM: boolean
}

function PumpConfigSelectSpeedSlider(props: Props) {
    const [desiredRate, setDesiredRate]=useState(0);
    const { controllerType} = useContext(PoolContext);
    const currentPump = () =>{
        return props.options.pumps.find(p => p.id === props.currentPumpId); 
    }
        const notUsed = () => {
        if (controllerType.toLowerCase().includes('touch')){
            return props.options.circuitNames.find(c=>c.name === 'notused');
        }
        else {
            return {name: 'notused', val: 255, desc:'NOT USED'}
        }
    }  
    const currentCircuit = () =>{
        let circ = currentPump().circuits.find(circ => circ.id === props.currentPumpCircuitId);
        if (typeof circ === 'undefined') circ = {id: props.currentPumpCircuitId, circuit: 255, units: undefined}
            if (currentPump().minFlow ) {
                if (typeof circ.flow === 'undefined') circ.flow = 30;
                if (typeof circ.units === 'undefined') circ.units = props.options.pumpUnits.find(u => u.name === 'gpm').val as 0|1
            }
            else {
                if (typeof circ.speed === 'undefined') circ.speed = 1000;
                if (typeof circ.units === 'undefined') circ.units = props.options.pumpUnits.find(u => u.name === 'rpm').val as 0|1
            }
            // return {id: props.currentPumpCircuitId, circuit: 255, flow: 30, units: props.options.pumpUnits.find(u => u.name === 'gpm').val}
            // else return {id: props.currentPumpCircuitId, circuit: 255, speed: 1000, units: props.options.pumpUnits.find(u => u.name === 'rpm').val}
        return circ;
    }

    const units = () => {
        let units = props.options.pumpUnits.find(unit => unit.val === currentCircuit()?.units);
        if (typeof units === 'undefined'){
            if (currentPump().maxFlow > 0) return props.options.pumpUnits.find(unit => unit.name === 'gpm');
            if (currentPump().maxSpeed > 0) return props.options.pumpUnits.find(unit => unit.name === 'rpm');
        }
        return units
    }

     useEffect(() => {
        
        if (units().name === 'gpm'){
            let flow = currentCircuit().flow;
            setDesiredRate(flow);
        }
        else {
            let speed = currentCircuit().speed;
            setDesiredRate(speed);
        }
    }, [JSON.stringify(props.options), props.currentPumpCircuitId, props.currentPumpId]) 
     

    const onChangeSpeed=(_speed: number) => {
        setDesiredRate(_speed);
    }

    const onChangeComplete=() => {
        console.log(`changing currentSpeed=${ currentCircuit().flow||currentCircuit().speed } ${ units().name } currentPumpCircuit=${ currentCircuit().id } to speed ${ desiredRate }`)
        let data:IConfigPump[] = extend(true, [], props.options.pumps);
        let circ = data.find(p=>p.id === props.currentPumpId).circuits.find(circ => circ.id === props.currentPumpCircuitId)
        if (units().name === 'gpm'){
            circ.flow = desiredRate;
        }
        else {
            circ.speed = desiredRate;
        }
        props.setPump(props.currentPumpId, data);
    }

    const customLabels=() => {
        if(currentCircuit().id!==8) return {};
        if(units().name === 'gpm') {
            return { [currentPump().minFlow]: currentPump().minFlow.toString(), [currentPump().maxFlow]: currentPump().maxFlow.toString() }
        }
        else {
            return { [currentPump().minSpeed]: currentPump().minSpeed.toString(), [currentPump().maxSpeed]: currentPump().maxSpeed.toString() };
        }
    }

    return !(currentCircuit().circuit === 255) && !(props.options.circuits.find(c => c.id === currentCircuit().circuit)?.name === notUsed().desc) ?
            <Slider
                value={desiredRate}
                onChange={onChangeSpeed}
                onChangeComplete={onChangeComplete}
                min={units().name === 'gpm' ? currentPump().minFlow : currentPump().minSpeed}
                max={units().name === 'gpm' ? currentPump().maxFlow : currentPump().maxSpeed}
                step={units().name === 'gpm' ? currentPump().flowStepSize : currentPump().speedStepSize}
                labels={customLabels()}
            />
            : < div />
            
}

export default PumpConfigSelectSpeedSlider;