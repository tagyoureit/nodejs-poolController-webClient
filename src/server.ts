import * as path from 'path';
import Bundler = require( 'parcel-bundler' );
import express = require('express');

async function startBundler() {
    const app = express();
    // Parcel: absolute path to entry point
    const file = path.join( process.cwd(), './dashboard/index.html' )
    console.log( `Parcel serving files from: ${ file }` )
    // Parcel: set options
    const options = {
        outDir: '../dist/web'
    };
    // Parcel: Initialize a new bundler
    const bundler = new Bundler( file, options );
    // Let express use the bundler middleware, this will let Parcel handle every request over your express server
    app.use(bundler.middleware());

    // Listen on port 8080
    app.listen(8080);
}

startBundler();