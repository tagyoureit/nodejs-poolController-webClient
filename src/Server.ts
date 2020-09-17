require('source-map-support').install();
import axios, { AxiosRequestConfig, Method } from 'axios';
import * as http from "http";
import * as path from 'path';
import * as io from 'socket.io-client';
import { config } from './Config';
import Bundler = require('parcel-bundler');
import express = require('express');

import ioServer = require("socket.io");

var ssdp = require('node-ssdp').Client
    , client = new ssdp({});
const mSearch = 'urn:schemas-upnp-org:device:PoolController:1';
let { override = { protocol: 'http://', host: 'localhost', port: 4200 }, useSSDP = true, poolURL = '' }: { override: { protocol: string, host: string, port: number }, useSSDP: boolean, poolURL?: string } = config.getSection("discovery");
let { protocol, host, port }: { protocol: string, host: string, port: number } = override;
let timeout: NodeJS.Timeout;

let ioClient: SocketIOClient.Socket, patch;
let server: http.Server;
let sockServer: ioServer.Server;


function search(force?: boolean) {
    if (useSSDP || force) {
        if (typeof timeout !== undefined) clearTimeout(timeout);
        client.search(mSearch);
        timeout = setTimeout(function () {
            console.log('restarting search');
            client.stop();
            search();
        }, 5000);
    }
}

const reloadVars = () => {
    let d = config.getSection('discovery');
    override = d.override;
    useSSDP = d.useSSDP;
    poolURL = d.poolURL;
    protocol = d.override.protocol;
    host = d.override.host;
    port = d.override.port;
    if (!useSSDP) {
        if (typeof poolURL === 'undefined' || poolURL !== `${protocol}://${host}:${port}`) {
            let { protocol, host, port } = override;
            poolURL = `${protocol}://${host}:${port}`;
            saveVars();
        }
    }
    initSocketClient();
}
const saveVars = () => {
    let d = config.getSection('discovery');
    d.override = override;
    d.useSSDP = useSSDP;
    d.poolURL = poolURL;
    d.override.protocol = protocol;
    d.override.host = host;
    d.override.port = port;
    config.setSection('discovery', d);
    initSocketClient();
}

const initSocketClient = () => {
    if (typeof ioClient !== 'undefined') ioClient.disconnect();
    ioClient = io.connect(poolURL);
    patch = require('socketio-wildcard')(io.Manager);
    patch(ioClient);
    ioClient.on('connect_error', (data) => {
        console.log(`SOCKET connect error.`)
    });
    ioClient.on('disconnect', (data) => {
        console.log(`SOCKET disconnect.`)
    });
    ioClient.on('reconnect', (data) => {
        console.log(`SOCKET reconnect.`)
    });
    ioClient.on('*', (socketData) => {
        console.log(`Incoming socket: ${socketData.data[0]} with data`)
        console.log(socketData.data[1])
        if (socketData.data[1] === null || socketData.data[1] === undefined) {
            console.log(`ALERT: Null socket data received for ${socketData.data[0]}`);
        } else {
            // emitter.emit(data.data[0], data.data[1]);
            sockServer.emit(socketData.data[0], socketData.data[1]);
        }
    });
}
const initSocketServer = () => {
    var middleware = require('socketio-wildcard')();
    sockServer = ioServer(server, { cookie: true });
    sockServer.use(middleware);
    sockServer.on('error', (err) => {
        console.error('Socket server error %s', err.message);
    });
    sockServer.on('connect_error', (err) => {
        console.error('Socket connection error %s', err.message);
    });
    sockServer.on('reconnect_failed', (err) => {
        console.error('Failed to reconnect with socket %s', err.message);
    });
    sockServer.on('connection', (sock: ioServer.Socket) => {
        console.log(`New socket client connected ${sock.id} -- ${sock.client.conn.remoteAddress}`);
        sock.on('*', (socketData) => {
            console.log(`Passthrough socket: ${socketData.data[0]} with data`)
            console.log(socketData.data[1])
            ioClient.emit(socketData.data[0], socketData.data[1]);
        })
    });
}

async function startBundler() {
    const app = express();
    server = http.createServer(app);

    client.on('response', function inResponse(headers, code, rinfo) {
        if (headers.ST !== mSearch || !useSSDP) { return; }
        clearTimeout(timeout);
        console.log('Got a response to an m-search:\n%d\n%s\n%s', code, JSON.stringify(headers, null, '  '), JSON.stringify(rinfo, null, '  '));
        // console.log(headers.LOCATION);
        const oldUrl = poolURL;
        poolURL = headers.LOCATION.match(/^.+?[^\/:](?=[?\/]|$)/)[0];
        console.log(`IN SEARCH --- ${poolURL}`)
        if (typeof poolURL !== 'undefined' && poolURL !== oldUrl) console.log(`Found pool server at new address ${poolURL} (previously was ${oldUrl})`)

        saveVars();
        client.stop();
    });

    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
        console.log(`${req.method} ${req.path}`)
        next();
    });
    app.use(express.json());

    app.get('/discover', (req, res) => {
        reloadVars();
        if (!useSSDP) {
            // res.status(200).send({ url: `${protocol}://${host}:${port}` });
        }
        else if (useSSDP && typeof poolURL === 'undefined') {
            console.log(`SSDP: cannot find poolController with discovery.  Please set address manually in config.json in the format of 'http://ip:port/`);
            client.search(mSearch);
        }
        res.status(200).json({ override, useSSDP, poolURL });
    });

    app.get('/recheck', (req, res) => {
        reloadVars();
        if (!useSSDP) {
            console.log(`Config.json set to override SSDP: ${poolURL}.`)
        }
        else {
            console.log(`Webapp not able to connect; forcing mSearch.`)
            client.search(mSearch, true);
        }
        return res.status(200);
    })

    app.get('/visibility', (req, res) => {
        res.send(config.getSection('options').hidePanels)
    })
    app.delete('/panel', (req, res) => {
        let options = config.getSection("options")
        options.hidePanels = [];
        res.send(config.setSection('options', options))
    })
    app.put('/panel', (req, res) => {
        let options = config.getSection("options")
        let { hidePanels } = options;
        const { name, state } = req.body;
        if (state === 'hide') {

            if (!hidePanels.includes(name)) {
                hidePanels.push(name);
            }
        }
        else {
            const index = hidePanels.indexOf(name);
            if (index !== -1) {
                hidePanels.splice(index, 1);
            }
        }
        console.log(JSON.stringify(options, null, 2))
        config.setSection("options", options);
        reloadVars();
        res.send(config.setSection('options', options))
    })
    app.get('/chemController', (req, res) => {
        res.send(config.getSection('chemController'));
    })
    app.put('/chemController', (req, res) => {
        // let cc=config.getSection("chemController") || {"chemController": {}}
        // if (typeof req.body.alarms !== 'undefined') cc.alarms = req.body.alarms;
        // if (typeof req.body.warnings !== 'undefined') cc.warnings = req.body.warnings;
        config.setSection("chemController", req.body);
        res.send(req.body);
    })
    app.put('/discovery', (req, res) => {
        protocol = req.body.override.protocol;
        host = req.body.override.host;
        port = parseInt(req.body.override.port, 10);
        useSSDP = req.body.useSSDP;
        if (useSSDP) {
            poolURL = undefined;
            saveVars();
            search();
        }
        else {
            poolURL = `${protocol}://${host}:${port}`;
            saveVars();
            client.stop();
        }
        res.status(200).json({ override, useSSDP, poolURL });
    })


    app.all('*', async (req, res, next) => {
        let paths: string[];
        if (req.url.startsWith('/')) paths = req.url.substring(1).split('/');
        else paths = req.url.split('/');
        switch (paths[0]) {
            case 'state':
            case 'config':
            case 'extended':
            case 'app':
                {
                    console.log(`req.url: ${req.url}`)
                    let opts: AxiosRequestConfig = {
                        url: `${req.protocol}://${req.hostname}:4200${req.path}`,
                        method: req.method as Method,
                        data: req.body
                    }
                    try {
                        let axiosRes = await axios(opts);
                        res.status(200).send(axiosRes.data);
                    }
                    catch (err) {
                        console.log(`Error fetching data: ${err.message}`);
                        console.log(err);
                        res.status(500).send(err.message);
                    }
                    break;
                }
            default:
                next();
        }
    })

    initSocketClient();
    initSocketServer();
    if (process.env.NODE_ENV !== 'production') {
        // Parcel: absolute path to entry point
        const file = path.join(process.cwd(), './web/dashboard/index.html');
        console.log(`Parcel serving files from: ${file}`);
        // Parcel: set options
        const options = {
            outDir: './dist/web'
        };
        // Parcel: Initialize a new bundler
        const bundler = new Bundler(file, options);
        // Let express use the bundler middleware, this will let Parcel handle every request over your express server
        app.use(bundler.middleware());
    }
    else {
        app.use(express.static(path.join(__dirname, '/web')));
    }
    // Listen on port 8080
    server.listen(config.getSection("web").port);
    search();
}

startBundler(); 
