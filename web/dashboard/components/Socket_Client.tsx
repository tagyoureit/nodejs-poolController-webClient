import * as fs from "fs";
import * as path from "path";
import {EventEmitter} from 'events';
var multicastdns=require('multicast-dns');
let io=require('socket.io-client')
const socket=io('http://localhost:4200')
// piggyback using the event-emitter bundled with socket.io client
var patch=require('socketio-wildcard')(io.Manager);
patch(socket);


export class MdnsClient {
    // Multi-cast DNS server
    private _protocol: string='http://';
    private _server: string;
    private _port: number;
    private queries=[];
    private mdns: any;

    public init(cfg) {
        if(cfg.server==='*') {
            console.log('Starting up MDNS server');
            this.mdns=multicastdns({loopback: true});
            var self=this;
            this.mdns.on('response', function(responses) {
                self.queries.forEach(function(query) {
                    console.log(`looking to match on ${query.name}`);
                    responses.answers.forEach(answer => {
                        console.log(`   ${answer.name}:${query.name}..... `)
                        if(answer.name.includes(query.name)) {
                            // console.log('TXT data:', response.additionals[0].data.toString())
                            // console.log('SRV data:', JSON.stringify(response.additionals[1].data))
                            // console.log('IP Address:', response.additionals[2].data)
                            console.log(`MDNS: found response: ${answer.name} with address ${answer.data}`);
                            if (answer.type === 'A'){
                                this._server = answer.data;
                            }
                            else if (answer.type === 'SRV'){
                                this._port = answer.data.port;
                            }
                            self.queries=self.queries.filter((value, index, arr) => {
                                if(value.name!==query.name) return arr;
                            });
                            console.log(`...remaining unmatched.
                            ${JSON.stringify(self.queries, null, 2)}
                            `);
                        }
                        else console.log(`...${query.name} does not match: ${answer.name}`);
                    });
                });
            });

            this.queries.push({name: '_poolcontroller._tcp.local', type: 'A'});
            this.queries.forEach(q => {
                console.log(`MDNS: sending query for ${q.name}`);
                this.mdns.query({questions: [q]});
            });
        }
        else {
            this.server=cfg.server;
            this.port=cfg.port;
        }

    }
    public get server() {return this._server;}
    public set server(val) {this._server=val; console.log(`set SERVER = ${val}`)}
    public get port() {return this._port;}
    public set port(val) {this._port=val; console.log(`set PORT = ${val}`)}
    public get protocol() {return this._protocol;}
    public set protocol(val) {this._protocol=val;}
    public get url() { return `${this.protocol}${this.server}:${this.port}`}
}

export class Comms {
    private _cfgPath: string;
    private _cfg: any;
    constructor() {
        // this._cfgPath=path.join(process.cwd(), "/config.json");
        // this._cfg=fs.existsSync(this._cfgPath)
        //     ? JSON.parse(fs.readFileSync(this._cfgPath, "utf8"))
        //     :{};
        mdns.init({server: 'localhost', port: 4200})
    }
    public emitSocket(which: string) {
        socket.emit(which)
    }
    public incoming(cb: any) {
        socket.on('*', (data) => {
            if(data.data[1]===null||data.data[1]===undefined) {
                console.log(`ALERT: Null socket data received for ${data.data[0]}`)
            } else
                cb(data.data[1], data.data[0])
        })
        socket.on('connect_error', function(data) {
            console.log('connection error:'+data);
            cb({status: {val: 255, desc: 'Connection Error', name: 'error'}}, 'error');
        })
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
        });
        socket.on('reconnect_failed', function(data) {
            console.log('reconnect failed:'+data);
        });
        socket.on('connect', function(sock) {
            console.log({msg: 'socket connected:', sock: sock});
            cb({status: {val: 1, desc: 'Connected', name: 'connected', percent: 0}}, 'connect');

        });
        socket.on('close', function(sock) {
            console.log({msg: 'socket closed:', sock: sock});
        });
    }

    public setDateTime(newDT: any) {
        fetch(`${mdns.url}/config/dateTime`, {
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
        })
        // let autoDST = 1 // implement later in UI
    }

    public toggleCircuit(circuit: number): void {
        fetch(`${mdns.url}/state/circuit/toggleState`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: circuit})
        })

    }
    public setCircuitState(circuit: number, state: boolean=true): void {
        fetch(`${mdns.url}/state/circuit/setState`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: circuit, state: state})
        })

    }

    public setHeatMode(id: number, mode: number): void {
        fetch(`${mdns.url}/state/body/heatMode`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id, mode: mode})
        })
    }

    public setHeatSetPoint(id: number, temp: number): void {
        fetch(`${mdns.url}/state/body/setPoint`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id, setPoint: temp})
        })
    }

    public setChlor(id: number, poolLevel: number, spaLevel: number, superChlorinateHours: number): void {
        // socket.emit( 'setchlorinator', poolLevel, spaLevel, superChlorinateHours )
        fetch(`${mdns.url}/state/chlorinator/setChlor`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id, poolSetpoint: poolLevel, spaSetpoint: spaLevel, superChlorHours: superChlorinateHours})
        })
    }

 /*    public hidePanel(panel: string): void {
        socket.emit('hidePanel', panel)
    }

    public resetPanels(): void {
        socket.emit('resetConfigClient')
    }

    public setLightMode(light: number): void {
        socket.emit('setLightMode', light)
    }

    public updateVersionNotification(bool: boolean): void {
        socket.emit('updateVersionNotificationSetting', bool)
    }

    public search(allOrAny: string, dest: string, src: string, action: string) {

        console.log(`Emitting search start: ${dest} ${src} ${action}`)
        socket.emit('search', 'start', allOrAny, dest, src, action)
    }

    public searchStop() {
        socket.emit('search', 'stop')
    }

    public searchLoad() {
        socket.emit('search', 'load');
    }

    public replayPackets(arrToBeSent: number[][]) {
        socket.emit('replayPackets', arrToBeSent)
    }
    public sendPackets(arrToBeSent: number[][]) {
        socket.emit('sendPackets', arrToBeSent)
    }

    public receivePacket(arrToBeSent: number[][]) {

        socket.emit('receivePacket', JSON.stringify(arrToBeSent))
    }

    public receivePacketRaw(packets: number[][]) {
        socket.emit('receivePacketRaw', packets)
    }

    public setLightColor(circuit: number, color: number) {
        socket.emit('setLightColor', circuit, color)
    }

    public setLightPosition(circuit: number, position: number) {
        socket.emit('setLightPosition', circuit, position)
    }

    public setLightSwimDelay(circuit: number, position: number) {
        socket.emit('setLightSwimDelay', circuit, position)
    }

    public setScheduleCircuit(_id: number, _circuit: number) {
        socket.emit('setScheduleCircuit', _id, _circuit)
    }

    public setEggTimer(_id: number, _circuit: number, _hour: number, _minute: number) {
        socket.emit('setEggTimer', _id, _circuit, _hour, _minute)
    }

    public deleteScheduleOrEggTimer(_id: number) {
        socket.emit('deleteScheduleOrEggTimer', _id)
    } */

    public setPumpCircuit(pump, pumpCircuitId: number, obj: any) {
        let { rate, circuit, units } = obj;
        fetch(`${mdns.url}/config/pump/${pump}/pumpCircuit/${pumpCircuitId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({rate: rate, circuit: circuit, units: units})
        })
    }

    // public setPumpConfigCircuit(pump: number, circuitId: number, pumpCircuitId: number) {
    //     // socket.emit( 'setPumpConfigCircuit', _pump, _circuitSlot, _circuit )
    //     fetch('/config/pump/circuit', {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({id: pump, circuitId: circuitId, pumpCircuitId: pumpCircuitId})
    //     })
    // }

    public setPump(id, pumpType) {
        // socket.emit( 'setPumpConfigType', _pump, _type )
        fetch(`${mdns.url}/config/pump/type`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: id, type: pumpType})
        })
    }

    // public setPumpConfigUnits(pump, pumpCircuitId: number, units) {
    //     // socket.emit( 'setPumpConfigRPMGPM', _pump, _circuitSlot, _speedType )
    //     fetch('/config/pump/circuitRateUnits', {
    //         method: 'PUT',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({id: pump, units: units, pumpCircuitId: pumpCircuitId})
    //     })
    // }

}

export const mdns=new MdnsClient();
export const comms=new Comms();