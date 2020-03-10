import * as path from 'path';
import Bundler=require('parcel-bundler');
import express=require('express');
import { config } from './Config';

var ssdp=require('node-ssdp').Client
    , client=new ssdp({});
const mSearch='urn:schemas-upnp-org:device:PoolController:1';
let url=config.getSection("discovery").poolControllerURL;
let timeout: NodeJS.Timeout;

function search() {
    if(url==="*") {
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
        if(headers.ST!==mSearch) { return; }
        clearTimeout(timeout);
        console.log('Got a response to an m-search:\n%d\n%s\n%s', code, JSON.stringify(headers, null, '  '), JSON.stringify(rinfo, null, '  '));
        console.log(headers.LOCATION);
        url=headers.LOCATION.match(/^.+?[^\/:](?=[?\/]|$)/)[0];
        client.stop();
    });

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/discover', (req, res) => {
        if(url==="*") {
            console.log(`SSDP: cannot find poolController with discovery.  Please set address manually in config.json in the format of 'http://ip:port/`);
            res.status(204).send();
            client.search(mSearch);
        }
        else {
            console.log(`about to send: ${ url }`);
            res.status(200).send({ url: url });
        }
    });

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