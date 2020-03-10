var http = require('http');
var io = require('socket.io-client');
var patch = require('socketio-wildcard')(io.Manager);
// var configFile = container.settings.getConfig()

var address = '10.0.0.6';
var port = 39500;
// var address = configFile.outputToSmartThings.address
// var port = configFile.outputToSmartThings.port
// var secureTransport = configFile.poolController.https.enabled === 1 ? true : false
// var logEnabled = 0


var serverURL;

// if (configFile.outputToSmartThings.hasOwnProperty("logEnabled")) {
//     logEnabled = configFile.outputToSmartThings.logEnabled
// }


// if (secureTransport) {
//     serverURL = 'https://localhost:' + configFile.poolController.https.expressPort
// } else {
//     serverURL = 'http://localhost:' + configFile.poolController.http.expressPort
// }
serverURL = 'http://localhost:4200'


var socket = io.connect(serverURL, {
    secure: false,
    // secure: secureTransport,
    reconnect: true,
    rejectUnauthorized: false
});
patch(socket);
function notify(event, data) {
    if (address !== '*') {
        var json = JSON.stringify(data);

        var opts = {
            method: 'NOTIFY',
            host: address,
            port: port,
            path: '/notify',
            headers: {
                'CONTENT-TYPE': 'application/json',
                'CONTENT-LENGTH': Buffer.byteLength(json),
                'X-EVENT': event
            }
        };

        var req = http.request(opts);
        req.on('error', function (err, req, res) {
           console.error(err);
        });
        req.write(json);
        req.end();
        // if (logEnabled) {
            //if (event === "tempBody" || event === "body")
            //console.debug('outputToSmartThings sent event %s', event);
            console.log('outputToSmartThings (' + address + ':' + port + ') Sent ' + event + "'" + json + "'");
        // }
    }

}

socket.on('*', function (data) {
    notify(data.data[0], data.data[1]);
});



