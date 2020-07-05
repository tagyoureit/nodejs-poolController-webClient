import 'react-rangeslider/lib/index.css';

import React, { useContext, useEffect, useState } from 'react';
import Slider from 'react-rangeslider';
import { Button, ButtonGroup, Col, ListGroup, ListGroupItem, Row } from 'reactstrap';

import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { PoolContext, IStateTempBodyDetail } from './PoolController';
import { useAPI } from './Comms';
import BodyState from './BodyState'
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
function BodiesState(props: Props) {
    const {poolURL, emitter} = useContext(PoolContext);
    useEffect(()=>{
        if (typeof poolURL !== 'undefined'){
            let arr=[];
            arr.push({ url: `${ poolURL }/state/temps`, dataName: 'temps' });
            arr.push({ url: `${ poolURL }/config/options/heaters`, dataName: 'options' });
            doFetch(arr);
        }
    },[poolURL])

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (typeof poolURL!== 'undefined' && typeof emitter !== 'undefined'){
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
    }
    }, [poolURL, emitter]);
    /* eslint-enable react-hooks/exhaustive-deps */

    

    return doneLoading&&!isError&&(
        <div className='tab-pane active' id={props.id} role="tabpanel" aria-labelledby={props.id+'-tab'} >
            <CustomCard name={(data&&data.temps.length===1? 'Body':'Bodies')} id={props.id} >
                {doneLoading && data.temps.bodies.map(body => {
                    return <BodyState
                            key={`body-${body.id}`}
                            currentBodyId={body.id}
                            options={data.options}
                            temps={data.temps}
                        />
                })}
            </CustomCard>
        </div>
    )

}

export default BodiesState;