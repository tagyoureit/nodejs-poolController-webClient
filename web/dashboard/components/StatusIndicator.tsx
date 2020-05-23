import {Button, Tooltip} from 'reactstrap'
import React, {useEffect, useState, useRef} from 'react';
import {IDetail} from './PoolController';
import {useInterval}  from '../utilities/UseInterval'
interface State {
    seconds: number;
    tooltipOpen: boolean;
}

interface Props {
    status: IDetail&{percent?: number}
    counter: number;
}




function StatusIndicator(props: Props) {
    const [seconds, setSeconds] = useState(0);
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [status, setStatus] = useState<any>({desc: '', name: '', percent: 0, val: 0})
    const [counter, setCounter] = useState(0);

    useInterval(()=>{
        setSeconds(sec=>sec+1)
    }, 1000)

    useEffect(()=>{
        if (JSON.stringify(status)!==JSON.stringify(props.status)){
            setStatus(props.status);
            setSeconds(0);
        }
    },[props.status, status])

     useEffect(()=>{
        setCounter(counter=>counter+1);
        setSeconds(0);
    },[props.counter]) 

    const toggle = () => {
            setTooltipOpen(!tooltipOpen);
    } 

        let {percent, val, desc}=status;
        let _color='red';
        if (seconds <= 30) _color = 'green'
        else if (seconds > 30 && seconds <= 60) _color = 'yellow'
        else if (seconds > 61) _color = 'red';
        let toolTipText=`Last update: ${seconds}s`;

        return (
            <div>
                {`${desc}: ${percent}%`}
                <span className='ml-3' style={{
                    borderRadius: '50%',
                    width: '10px',
                    height: '10px',
                    background: _color,
                    display: 'inline-block',
                    boxShadow: '2px 2px 3px 0px rgba(50, 50, 50, 0.75)'
                }} id='stateToolTip'>
                    <Tooltip 
                    placement="right" 
                    isOpen={tooltipOpen}
                     target="stateToolTip" 
                     toggle={toggle}>
                        {toolTipText}
                    </Tooltip>
                </span>
            </div>
        )
    
}

export default StatusIndicator;