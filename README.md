# nodejs-poolController-webClient

This client application is for use with [nodejs-poolController](https://github.com/tagyoureit/nodejs-poolcontroller) (an app for controlling Pentair pool equipment).

## Installation

To use this client, install it as a separate application:
1. Download or clone the repository
1. `npm i` to install dependencies
1. Optional - modify `config.json`:
    * Hardcode poolController app address.  You may need to do this if you are running more than one version on the same network or SSDP broadcasts are being blocked.
    The format should be `http://ip:port`.  The default port for the main app is 4200.
    * Change the port where end users will load this client.  Default is `8080`.
1. Start the app. 
    * `npm start` will clean out the compiled directories and recompile all files anew.  This should be the starting script every time you download/pull a new version.  
    * For faster startup times, run `npm run start:cached` to use the existing compiled files created by `npm start`.

nodejs-poolController by default will only listen to connections on the localhost (127.0.0.1) adapter.  If you will be running this client on a different machine edit `config.json` in the nodejs-poolController app so http/https servers listen on a different (external) interface.  Note, the -webClient will connect to nodejs-poolController from the web browser rather then the machine where you run 'snpm start'.

# Virtual Controllers
* [Virtual Chlorinator Controller Directions](https://github.com/tagyoureit/nodejs-poolController/wiki/Virtual-Chlorinator-Controller-v6)
* [Virtual Pump Controller Directions](https://github.com/tagyoureit/nodejs-poolController/wiki/Virtual-Pump-Controller---v6)