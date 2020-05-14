import {
    Nav, NavItem, NavLink
} from 'reactstrap';
import CustomCard from '../CustomCard';
import React, { useContext, useState, useEffect, useReducer } from 'react';
import PumpConfigContainer from './PumpConfigContainer';
import { IStatePump, IConfigPump, getItemById, IStateCircuit, IDetail, IConfigPumpType, IConfigCircuit, getItemByVal } from '../PoolController';
import { comms } from '../Socket_Client';
import useDataApi from '../DataFetchAPI';
import ErrorBoundary from '../ErrorBoundary';
import { PoolContext } from '../PoolController'
interface Props {
    id: string;

}

export type ConfigOptionsPump={
    maxPumps: number,
    pumps: IConfigPump[],
    pumpTypes: IConfigPumpType[],
    circuits: IConfigCircuit[],
    circuitNames: IDetail[],
    pumpUnits: IDetail[]
}

const initialState: ConfigOptionsPump={
    maxPumps: 1,
    pumps: [{
        "id": 1,
        "type": 0,
        "isActive": true,
        "circuits": []
    }],
    pumpTypes: [{
        "val": 0,
        "name": "none",
        "desc": "No pump",
        "maxCircuits": 0,
        "hasAddress": false
    }],
    pumpUnits: [{
        "val": 0,
        "name": "rpm",
        "desc": "RPM"
    }],
    circuits: [],
    circuitNames: []
};

function PumpConfigModalPopup(props: Props) {
    let [currentPumpId, setCurrentPumpId]=useState(1);
    let [currentPump, setCurrentPump]=useState();
    let arr=[];
    arr.push({ url: `${ comms.poolURL }/config/options/pumps`, dataName: 'options' });
    const [{ data, isLoading, isError, doneLoading }, doFetch, doUpdate]=useDataApi(arr, initialState);

    const { controllerType }=useContext(PoolContext);
    const [pumpType, setPumpType]=useState<IConfigPumpType>();
    // const [pumpUnits, setPumpUnits] = useState<IDetail>();

    /* eslint-disable react-hooks/exhaustive-deps */
    useEffect(() => {
        let emitter=comms.getEmitter();
        const fnPumpExt=function(data) {
            /* console.log(`received pumpExt:`);
            console.log(data);
            doUpdate({ updateType: 'REPLACE_ARRAY', dataName: ['options','pumps'], data }); */
            let arr=[];
            arr.push({ url: `${ comms.poolURL }/config/options/pumps`, dataName: 'options' });
            doFetch(arr);
        };
        emitter.on('pumpExt', fnPumpExt);

        return () => {
            emitter.removeListener('pumpExt', fnPumpExt);
        };
    }, []);

    // react useEffect doesn't do deep compare; hence the JSON.stringify(data)
    useEffect(() => {
        if(doneLoading) {

            // set current pump here; pass to children
            let pump=getItemById(data.options.pumps, currentPumpId);
            setCurrentPump(pump);
            let _pumpType=getItemById(data.options.pumpTypes, pump.type);
            setPumpType(_pumpType);
        }
    }, [currentPumpId, doneLoading])
    /* eslint-enable react-hooks/exhaustive-deps */

    const navTabs=() => {
        if(doneLoading) {

            return data.options.pumps.map((pump, idx) => {
                const desc=getItemByVal(data.options.pumpTypes, pump.type).desc
                return (<NavItem key={`navPumpConfigKey${ pump.id }`}>
                    <NavLink href="#" target={pump.id.toString()} onClick={() => setCurrentPumpId(pump.id)} active={currentPumpId===
                        pump.id? true:false}
                        className={currentPumpId===
                            pump.id? 'btn-primary':'btn-secondary'}
                    >
                        {pump.id}: {desc}
                    </NavLink>
                </NavItem>);
            });
        }
    };

    return !doneLoading? <>Loading...</>:(
        <div className="tab-pane active" id="pumpConfig" role="tabpanel" aria-labelledby="pumpConfig-tab">

            <CustomCard name='Pump Config' id={props.id}>
                <div>
                    <Nav tabs>
                        {navTabs()}
                    </Nav>
                </div>
                <ErrorBoundary>
                    <PumpConfigContainer
                        currentPumpId={currentPumpId}
                        currentPump={currentPump}
                        options={data.options}
                    />
                </ErrorBoundary>
            </CustomCard>
        </div>
    );
}

export default PumpConfigModalPopup;