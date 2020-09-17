# nodejs-poolController-webClient

This client application is for use with [nodejs-poolController](https://github.com/tagyoureit/nodejs-poolcontroller) (an app for controlling Pentair pool equipment).

## Installation

If you want to use SSDP for automatic configuration then please ensure it is enable on the nodejs-poolController app (in config.json).

To use this client, install it as a separate application:
1. Download or clone the repository
1. `npm i` to install dependencies
1. Optional - modify `config.json`:
    * Change the port where end users will load this client.  Default is `8080`.
1. Start the app. 
    * `npm start` will clean out the compiled directories and recompile all files anew.  This should be the starting script every time you download/pull a new version.  
    * For faster startup times, run `npm run start:cached` to use the existing compiled files created by `npm start`.
1. To manually enter the ip of nodejs-poolController open the hamburger menu (top right) and disable SSDP and enter an address.

nodejs-poolController by default will only listen to connections on the localhost (127.0.0.1) adapter.  If you will be running this client on a different machine edit `config.json` in the nodejs-poolController app so http/https servers listen on a different (external) interface.  

# Virtual Controllers
* [Virtual Chlorinator Controller Directions](https://github.com/tagyoureit/nodejs-poolController/wiki/Virtual-Chlorinator-Controller-v6)
* [Virtual Pump Controller Directions](https://github.com/tagyoureit/nodejs-poolController/wiki/Virtual-Pump-Controller---v6)