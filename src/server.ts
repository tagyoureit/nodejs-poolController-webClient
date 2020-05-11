import * as path from 'path';
import Bundler=require('parcel-bundler');
import express=require('express');
import { config } from './Config';

var ssdp=require('node-ssdp').Client
    , client=new ssdp({});
const mSearch='urn:schemas-upnp-org:device:PoolController:1';
let configURL: string=config.getSection("discovery").poolControllerURL;
let discoveredURL: string=configURL;
let timeout: NodeJS.Timeout;

function search(force?: boolean) {
    if(configURL==="*"||force) {
        if(typeof timeout!==undefined) clearTimeout(timeout);
        client.search(mSearch);
        timeout=setTimeout(function() {
            console.log('restarting search');
            client.stop();
            search();
        }, 5000);
    }
}

async function startBundler() {
    const app=express();
    client.on('response', function inResponse(headers, code, rinfo) {
        if(headers.ST!==mSearch||configURL!=='*') { return; }
        clearTimeout(timeout);
        console.log('Got a response to an m-search:\n%d\n%s\n%s', code, JSON.stringify(headers, null, '  '), JSON.stringify(rinfo, null, '  '));
        // console.log(headers.LOCATION);
        const oldUrl=discoveredURL;
        discoveredURL=headers.LOCATION.match(/^.+?[^\/:](?=[?\/]|$)/)[0];
        if(discoveredURL!=='*'&&discoveredURL!==oldUrl) console.log(`Found pool server at new address ${ discoveredURL } (previously was ${ oldUrl })`)
        client.stop();
    });

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
        next();
    });
    app.use(express.json());
    app.get('/discover', (req, res) => {
        if(configURL!=='*') {
            res.status(200).send({ url: configURL });
        }
        else if(discoveredURL==="*") {
            console.log(`SSDP: cannot find poolController with discovery.  Please set address manually in config.json in the format of 'http://ip:port/`);
            res.status(204).send(`No SSDP found yet.`);
            client.search(mSearch);
        }
        else {
            console.log(`about to send: ${ discoveredURL }`);
            res.status(200).send({ url: discoveredURL });
        }
    });

    app.get('/recheck', (req, res) => {
        if(configURL!=='*') {
            console.log(`Webapp not able to connect to ${ configURL }.`)
        }
        else {
            console.log(`Webapp not able to connect; forcing mSearch.`)
            client.search(mSearch, true);
        }
    })

    app.get('/visibility', (req, res)=>{
        res.send(config.getSection('options').hidePanels)
    })
    app.put('/panel', (req, res) => {
        let options=config.getSection("options")
        let {hidePanels} = options;
        const { name, state }=req.body;
        if (state === 'hide') {

            if (!hidePanels.includes(name)){
                hidePanels.push(name);
            }
        }
        else {
            const index = hidePanels.indexOf(name);
            if (index !== -1){
                hidePanels.splice(index, 1);
            }
        }
        console.log(JSON.stringify(options,null,2))
        config.setSection("options", options);
    })

    // Parcel: absolute path to entry point
    const file=path.join(process.cwd(), './web/dashboard/index.html');
    console.log(`Parcel serving files from: ${ file }`);
    // Parcel: set options
    const options={
        outDir: './dist/web'
    };
    // Parcel: Initialize a new bundler
    const bundler=new Bundler(file, options);
    // Let express use the bundler middleware, this will let Parcel handle every request over your express server
    app.use(bundler.middleware());

    // Listen on port 8080
    app.listen(config.getSection("web").port);
    search();
}

startBundler();