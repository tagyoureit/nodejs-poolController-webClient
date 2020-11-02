import React, { useContext, useEffect, useState } from 'react';

import BodyState from './BodyState';
import CustomCard from './CustomCard';
import useDataApi from './DataFetchAPI';
import { PoolContext } from './PoolController';

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
    const reloadBodyData = () => {
        let arr=[];
            arr.push({ url: `${ poolURL }/state/temps`, dataName: 'temps' });
            arr.push({ url: `${ poolURL }/config/options/heaters`, dataName: 'options' });
            doFetch(arr);
    }
    useEffect(()=>{
        if (typeof poolURL !== 'undefined'){
            reloadBodyData();
        }
    },[poolURL])

    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(undefined, initialState);

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        if (typeof poolURL!== 'undefined' && typeof emitter !== 'undefined'){
        const fnTemps=function(obj) { 
            // console.log(`incoming socket temps`)
            checkInitData()
            doUpdate({ updateType: 'MERGE_OBJECT', dataName: 'temps', data: obj }); };
        const fnBody=function(obj) { 
            // console.log(`incoming socket body`)
            checkInitData();
            doUpdate({ updateType: 'MERGE_ARRAY', dataName: ['temps', 'bodies'], data: obj }); };
        emitter.on('temps', fnTemps);
        emitter.on('body', fnBody);
        return () => {
            emitter.removeListener('temps', fnTemps);
            emitter.removeListener('body', fnBody);
        };
    }
    }, [poolURL, emitter]);
    /* eslint-enable react-hooks/exhaustive-deps */

    // need to reload 
    const checkInitData = () =>{
        if (data.temps?.bodies[0]?.heatmode?.val > 0 && data.options?.heatmodes?.length === 0){
            reloadBodyData();
        }
    }
    

    return doneLoading&&!isError&&(
        <div className='tab-pane active' id={props.id} role="tabpanel" aria-labelledby={props.id+'-tab'} >
            <CustomCard name={(data&&data.temps.length===1? 'Body':'Bodies')} id={props.id} >
                {doneLoading && data?.temps?.bodies?.map(body => {
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