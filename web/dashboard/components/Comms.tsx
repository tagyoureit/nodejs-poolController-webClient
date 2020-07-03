import { EventEmitter } from 'events';
import io from 'socket.io-client';
import axios, { AxiosRequestConfig, AxiosPromise } from 'axios';
import { Socket } from "socket.io";
let socket: SocketIOClient.Socket, patch;
let manager: Socket

var extend=require("extend");
import { useReducer, useState, useEffect, useContext } from 'react';
import { PoolContext, PoolURLContext } from './PoolController';

export interface Discovery {
    override: { protocol: string, host: string, port: number }, useSSDP: boolean, poolURL: string
}

const delay=ms => new Promise(resolve => setTimeout(resolve, ms));
const initialData: Discovery={
    "override": {
        "protocol": "http",
        "host": "localhost",
        "port": 4200
    },
    "useSSDP": true,
    "poolURL": undefined
}
export const useComms=(): any[] => {
   
    const [commsData, setCommsData]=useState<Discovery>(initialData)
    const [poolURL, setPoolURL]=useState<string>();
    const [retry, setRetry]=useState(0);
    const emitter: EventEmitter=new EventEmitter();
    const fetchData=async () => {
        let found=false;
        let count=0;
        while(!found) {
            count++;
            if(count===10) return Promise.reject(`Aborted after 10 attempts.`)
            console.log(`fetching data`)
            try {
                let response=await axios({
                    method: 'get',
                    url: '/discover'
                })
                if(response.status===200&&typeof response.data.poolURL!=='undefined') {
                    setCommsData(response.data);
                    setPoolURL(response.data.poolURL);
                    found=true;

                    return Promise.resolve(response.data);
                }
                else {
                    await delay(3000);
                }
            }
            catch(err) {
                console.log(`Caught err - getPoolData: ${ err.message }`)
                if(err.message!=='No Content') console.error(err);
            }
        }
    }
    useEffect(() => {
        fetchData();
    }, [retry]);

    useEffect(() => {
        if(socket) socket.disconnect();
        if(manager) manager.disconnect();
        if(typeof poolURL!=='undefined') {
            socket=io(poolURL);
            patch=require('socketio-wildcard')(io.Manager);
            patch(socket);
                 socket.on('connect_error', (data) => {
                     console.log(`SOCKET connect error.`)
                     emitter.emit('socket-connect_error', { val: 255, desc: 'Connection Error', name: 'error' })
                 });
                 socket.on('disconnect', (data) => {
                     console.log(`SOCKET disconnect.`)
                     emitter.emit('socket-disconnect', { val: 255, desc: 'Connection Error', name: 'error' })
                 });
                 socket.on('reconnect', (data) => {
                     console.log(`SOCKET reconnect.`)
                     emitter.emit('socket-reconnect');
                 });
            socket.on('*', (data) => {
                console.log(`Incoming socket: ${ data.data[0] } with data`)
                console.log(data.data[1])
                if(data.data[1]===null||data.data[1]===undefined) {
                    console.log(`ALERT: Null socket data received for ${ data.data[0] }`);
                } else {
                    emitter.emit(data.data[0], data.data[1]);
                }
            });

        }
    }, [poolURL]);

    const updateCommsData=(data: Discovery): Promise<Discovery> => {

        const updateComms=async () => {
            try {
                let putResult=await axios({
                    method: 'put',
                    url: '/discovery',
                    data: data
                })
                if(typeof putResult.data.poolURL==='undefined') {
                    // for useSSDP, wait for the controller to be found
                    try {
                        let getResponseData=await fetchData();
                        setCommsData(getResponseData)
                        return Promise.resolve(getResponseData)
                    }
                    catch(err) {
                        data.useSSDP=false;
                        setCommsData(data);
                        return updateComms();
                    }
                }
                else {
                    setCommsData(putResult.data);
                    setPoolURL(putResult.data.poolURL);
                }
                return Promise.resolve(putResult.data)
            }
            catch(err) {
                console.log(`error with updateComms: ${ err.message }`)
                return Promise.reject(err);
            }
        }
        return updateComms();
    }
    return [commsData, poolURL, emitter, updateCommsData, setRetry, socket];

}


export const useAPI=() => {
    // const { poolURL, emitter }=useContext(PoolContext);
    const {poolURL} = useContext(PoolURLContext)
    const execute=async (action: string, data?: any) => {
        let opts: AxiosRequestConfig={
            method: 'put',
            data: data
        }
        switch(action) {
            // CIRCUITS
            case 'setCircuitState':
                opts.url=`${ poolURL }/state/circuit/setState`
                break;
            case 'deleteCircuit':
                opts.url=`${ poolURL }/config/circuit`
                opts.method='DELETE';
                break;
            case 'setCircuit':
                opts.url=`${ poolURL }/config/circuit`
                break;
            case 'setFeature':
                opts.url=`${ poolURL }/config/feature`
                break;
            case 'toggleCircuit':
                opts.url = `${poolURL}/state/circuit/toggleState`;
                break
            // DATE TIME
            case 'setDateTime':
                opts['url']=`${ poolURL }/config/dateTime`;
                break;
            // PANEL VISIBILITY
            case 'visibility':
                opts.method='get'
                opts.url='/visibility';
                break;
            case 'panelVisibility':
                opts.url='/panel';
                break;
            case 'resetPanelVisibility':
                opts.method='delete'
                opts.url='/panel'
                break;
            // HEAT MODES
            case 'setHeatMode':
                opts.url=`${ poolURL }/state/body/heatMode`
                break;
            case 'setHeatSetPoint':
                opts.url=`${ poolURL }/state/body/setPoint`
                break;
            case 'toggleHeatMode':
                opts.url=`${ poolURL }/state/circuit/toggleState`
                break;
            // CHLORINATOR
            case 'chlorSearch':
                opts.method = 'get'
                opts.url=`${ poolURL }/config/chlorinators/search`
                break;
            case 'setChlor':
                opts.url=`${ poolURL }/state/chlorinator/setChlor`
                break;
            // PUMPS
            case 'setPump':
                opts.url=`${ poolURL }/config/pump`
                break;
            // APP OPTIONS
            case 'setAppLoggerOptions':
                opts.url=`${ poolURL }/app/logger/setOptions`
                break;
            case 'startPacketCapture':
                opts.method = 'get'
                opts.url = `${ poolURL }/app/config/startPacketCapture`
                break;
            case 'startPacketCaptureWithoutReset':
                opts.method = 'get'
                opts.url = `${ poolURL }/app/config/startPacketCaptureWithoutReset`
                break;
            case 'stopPacketCapture':
                opts.method = 'get'
                opts.responseType = 'blob'
                opts.url = `${ poolURL }/app/config/stopPacketCapture`
                break;
            // CHEM CONTROLLERS
            case 'setChemControllerConfig':
                opts.url = `${ poolURL }/config/chemController`
                break;
            
            // LIGHT GROUPS
            case 'setLightGroupTheme':
                opts.url=`${ poolURL }/state/circuit/setTheme`
                break;
            case 'setLightGroupAttribs':
                opts.url=`${ poolURL }/config/lightGroup`
                break;
            case 'configLightGroup':
                opts.url=`${ poolURL }/config/lightGroup`
                break;
            // UTILITIES
            default:
                console.log(`missing API call ${action}`)
                return Promise.reject(`missing API call ${action}`)
        }
        try {
            let res=await axios(opts);
            return res.data;
        }
        catch (err){
            console.log(`Error fetching data: ${err.message}`);
            return Promise.reject(err);
        }
    }
    return execute
}