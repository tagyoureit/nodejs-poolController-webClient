import * as path from 'path';
import Bundler=require('parcel-bundler');
import express=require('express');
import { config } from './Config';

var ssdp=require('node-ssdp').Client
    , client=new ssdp({});
const mSearch='urn:schemas-upnp-org:device:PoolController:1';
let { override, autoDiscovery }: { override: { protocol: string, host: string, port: number }, autoDiscovery: boolean }=config.getSection("discovery");
let discoveredURL: string;
let timeout: NodeJS.Timeout;

function search(force?: boolean) {
    if(autoDiscovery||force) {
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
        if(headers.ST!==mSearch||!autoDiscovery) { return; }
        clearTimeout(timeout);
        console.log('Got a response to an m-search:\n%d\n%s\n%s', code, JSON.stringify(headers, null, '  '), JSON.stringify(rinfo, null, '  '));
        // console.log(headers.LOCATION);
        const oldUrl=discoveredURL;
        discoveredURL=headers.LOCATION.match(/^.+?[^\/:](?=[?\/]|$)/)[0];
        console.log(`IN SEARCH --- ${ discoveredURL }`)
        if(typeof discoveredURL!=='undefined'&&discoveredURL!==oldUrl) console.log(`Found pool server at new address ${ discoveredURL } (previously was ${ oldUrl })`)
        client.stop();
    });

    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, DELETE');
        console.log(`${req.method} ${req.path}`)
        next();
    });
    app.use(express.json());
    app.get('/discover', (req, res) => {
        if(!autoDiscovery) {
            // let {protocol, host, port} = override;
            // res.status(200).send({ url: `${protocol}:\\${host}:${port}` });
        }
        else if(autoDiscovery&&typeof discoveredURL==='undefined') {
            console.log(`SSDP: cannot find poolController with discovery.  Please set address manually in config.json in the format of 'http://ip:port/`);
            client.search(mSearch);
        }
        res.status(200).json({ override, autoDiscovery, discoveredURL });
    });

    app.get('/recheck', (req, res) => {
        if(!autoDiscovery) {
            console.log(`Webapp not able to connect to ${ discoveredURL }.`)
        }
        else {
            console.log(`Webapp not able to connect; forcing mSearch.`)
            client.search(mSearch, true);
        }
    })

    app.get('/visibility', (req, res) => {
        res.send(config.getSection('options').hidePanels)
    })
    app.delete('/panel', (req, res) => {
        let options=config.getSection("options")
        options.hidePanels=[];
        res.send(config.setSection('options', options))
    })
    app.put('/panel', (req, res) => {
        let options=config.getSection("options")
        let { hidePanels }=options;
        const { name, state }=req.body;
        if(state==='hide') {

            if(!hidePanels.includes(name)) {
                hidePanels.push(name);
            }
        }
        else {
            const index=hidePanels.indexOf(name);
            if(index!==-1) {
                hidePanels.splice(index, 1);
            }
        }
        console.log(JSON.stringify(options, null, 2))
        config.setSection("options", options);
        res.send(config.setSection('options', options))
    })

    app.get('/startOverride', (req,res)=>{
        let discovery=config.getSection("discovery");
        autoDiscovery = discovery.autoDiscovery=false;
        delete discovery.discoveredURL;
        discoveredURL = undefined;
        config.setSection("discovery", discovery);
        res.send(config.setSection('discovery', discovery))
        client.stop();
        if(typeof timeout!==undefined) clearTimeout(timeout);
    })
    app.put('/override', (req, res) => {
        override.protocol=req.body.protocol;
        override.host=req.body.host;
        override.port=parseInt(req.body.port, 10);
        let discovery=config.getSection("discovery");
        discovery.override=override;
        delete discovery.discoveredURL;
        discoveredURL = undefined;
        autoDiscovery = discovery.autoDiscovery=false;
        console.log(JSON.stringify(discovery, null, 2))
        config.setSection("discovery", discovery);
        res.send(config.setSection('discovery', discovery))
        client.stop();
        if(typeof timeout!==undefined) clearTimeout(timeout);
    })

    app.delete('/override', (req, res) => {
        let discovery=config.getSection("discovery");
        autoDiscovery = discovery.autoDiscovery=true;
        delete discovery.discoveredURL;
        discoveredURL = undefined;
        console.log(JSON.stringify(discovery, null, 2))
        config.setSection("discovery", discovery);
        res.send(config.setSection('discovery', discovery));
        search();
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
