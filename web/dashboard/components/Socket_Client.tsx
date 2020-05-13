import * as fs from "fs";
import * as path from "path";
import { EventEmitter } from 'events';
let io=require('socket.io-client');
import axios from 'axios';
let socket: SocketIO.Socket, patch;

export class Comms {
    private _emitter: EventEmitter = new EventEmitter();
    public poolURL="*"; 
    constructor() {
        this.findPoolViaSSDP();
    }
    public findPoolViaSSDP(): void {
        if (this.poolURL === "*") setTimeout(()=>{this.findPoolViaSSDP();}, 5000);
        else return;
        fetch('/discover')
            .then((response) => {
                if (response.status === 200) return response.json();
                else throw new Error(response.statusText);
            })
            .then((json) => {
                // console.log(`json?  ${ JSON.stringify(json) }`);
                this.poolURL=json.url;
                socket=io(this.poolURL, {cookie: false});
                patch=require('socketio-wildcard')(io.Manager);
                patch(socket); 
            })
            .catch((err:Error)=>{
                if (err.message !== 'No Content') console.error(err); 
            })
    }
    public passthrough(cb: (d:any, which:string)=>void){
        // needed to remove all listeners so we don't duplicate the listener for multiple callbacks.
        // this._emitter.removeAllListeners('data');
        // console.log(this._emitter.listeners('data'))
        this._emitter.setMaxListeners(0);
        this._emitter.on('data', (d, which)=>{
            cb(d, which);
        })
    }
    public getEmitter(){
        return this._emitter
    }
    public incoming(cb: any){
            socket.on('*', (data) => {
                if(data.data[1]===null||data.data[1]===undefined) {
                    console.log(`ALERT: Null socket data received for ${ data.data[0] }`);
                } else{

                    this._emitter.emit('data', data.data[1], data.data[0])
                    this._emitter.emit(data.data[0], data.data[1]);
                    cb(data.data[1], data.data[0]);
                }
            });
            socket.on('connect_error', function(data) {
                console.log('connection error:'+data);
                cb({ status: { val: 255, desc: 'Connection Error', name: 'error' } }, 'error');
            });
            socket.on('connect_timeout', function(data) {
                console.log('connection timeout:'+data);
            });

            socket.on('reconnect', function(data) {
                console.log('reconnect:'+data);
            });
            socket.on('reconnect_attempt', function(data) {
                console.log('reconnect attempt:'+data);
            });
            socket.on('reconnecting', function(data) {
                console.log('reconnecting:'+data);
                if (data % 10 === 0) fetch(`/recheck`)
            });
            socket.on('reconnect_failed', function(data) {
                console.log('reconnect failed:'+data);
            });
            socket.on('connect', function(sock) {
                console.log({ msg: 'socket connected:', sock: sock });
                cb({ status: { val: 1, desc: 'Connected', name: 'connected', percent: 0 } }, 'connect');

            });
            socket.on('close', function(sock) {
                console.log({ msg: 'socket closed:', sock: sock });
            });
            return socket;
    }

    public setDateTime(newDT: any) {
        fetch(`${ this.poolURL }/config/dateTime`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hour: newDT.getHours(),
                min: newDT.getMinutes(),
                dow: Math.pow(2, newDT.getDay()),
                date: newDT.getDate(),
                month: newDT.getMonth()+1,
                year: parseInt(newDT.getFullYear().toString().slice(-2), 10)
            })
        });
        // let autoDST = 1 // implement later in UI
    }
    public async setCircuit(data: any){
        console.log(`sending configCircuit: ${JSON.stringify(data)}`)
        // fetch(`${ this.poolURL }/config/circuit`, {
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(data)
        // });


        return axios({
            method: 'put',
            url: `${ this.poolURL }/config/circuit`, 
            data: data
        })
        .then((response)=>{
            return response;
        });
    }
    public async deleteCircuit(data: any){
        console.log(`sending configCircuit: ${JSON.stringify(data)}`)
        await fetch(`${ this.poolURL }/config/circuit`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
    }
    public async toggleCircuit(circuit: number) {
        await fetch(`${ this.poolURL }/state/circuit/toggleState`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: circuit })
        });

    }
    public async setCircuitState(circuit: number, state: boolean=true) {
        await fetch(`${ this.poolURL }/state/circuit/setState`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: circuit, state: state })
        });

    }

    public setHeatMode(id: number, mode: number): void {
        fetch(`${ this.poolURL }/state/body/heatMode`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, mode: mode })
        });
    }

    public setHeatSetPoint(id: number, temp: number): void {
        fetch(`${ this.poolURL }/state/body/setPoint`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, setPoint: temp })
        });
    }

    public setChlor(id: number, poolLevel: number, spaLevel: number, superChlorinateHours: number): void {
        // socket.emit( 'setchlorinator', poolLevel, spaLevel, superChlorinateHours )
        fetch(`${ this.poolURL }/state/chlorinator/setChlor`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id, poolSetpoint: poolLevel, spaSetpoint: spaLevel, superChlorHours: superChlorinateHours })
        });
    }



    public setPumpCircuit(pump, pumpCircuitId: number, obj: any) {
        let { rate, circuit, units }=obj;
        fetch(`${ this.poolURL }/config/pump/${ pump }/pumpCircuit/${ pumpCircuitId }`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rate: rate, circuit: circuit, units: units })
        });
    }



    public setPump(id, pumpType) {
        fetch(`${ this.poolURL }/config/pump/${ id }/type`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pumpType: pumpType })
        });
    }
    public setChlorConfig(props: any) {
        fetch(`${ this.poolURL }/config/chlorinator/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(props)
        });
    }
    public async chlorSearch() {
        return axios.get(`${ this.poolURL }/config/chlorinators/search`)
        .then((response)=>{
            return response;
        });
    }

    public deletePumpCircuit(pump, pumpCircuitId: number) {
        fetch(`${ this.poolURL }/config/pump/${ pump }/pumpCircuit/${ pumpCircuitId }`, {
            method: 'DELETE'
        });
    }

    public replayPackets(arrToBeSent: number[][]) {
        socket.emit('replayPackets', arrToBeSent)
    }

    public receivePacketRaw(packets: number[][]) {
        socket.emit('receivePacketRaw', packets)
    }

    public setAppLoggerOptions(obj: any){
        console.log(`putting to server ${JSON.stringify(obj)}`)
        fetch(`${ this.poolURL }/app/logger/setOptions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(obj)
        });
    }

    public async visibility(){
        let resp = await axios('/visibility')
        return resp.data;
    }
    public async panelVisibility(name: string, state: 'hide'|'show'){
        console.log(`putting ${name} and ${state}`)
        //const config = { headers: {'Content-Type': 'application/json'} };
         await axios.put('/panel', {
           name,
           state
        }) 
    }
    public async resetPanelVisibility(){
        console.log(`resetting panels`)
         await axios.delete('/panel') 
    }
}
export const comms=new Comms();