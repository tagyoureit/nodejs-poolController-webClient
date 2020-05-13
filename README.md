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
1. Start the app with `npm start`.  Currently, this loads ParcelJS in a development environment and will build the app upon loading.  Future versions will include directions for a production build.

nodejs-poolController by default will only listen to connections from localhost (127.0.0.1).  If you will be running this client on a different machine