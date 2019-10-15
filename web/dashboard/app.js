"use strict";
exports.__esModule = true;
var React = require("react");
var ReactDOM = require("react-dom");
var react_router_dom_1 = require("react-router-dom");
var PoolController_1 = require("./components/PoolController");
var UtilitiesLayout_1 = require("./components/utilities/UtilitiesLayout");
var PacketSnifferController_1 = require("./components/utilities/PacketSnifferController");
var PacketTester_1 = require("./components/utilities/PacketTester");
var Replay_1 = require("./components/utilities/Replay");
var App = function () {
    return (<PoolController_1["default"] />);
};
var Utilities = function () {
    return (<UtilitiesLayout_1["default"] />);
};
var packetSniffer = function () {
    return (<PacketSnifferController_1["default"] />);
};
var packetTester = function () {
    return (<PacketTester_1["default"] />);
};
var replay = function () {
    return (<Replay_1["default"] />);
};
ReactDOM.render(<react_router_dom_1.BrowserRouter>
        <react_router_dom_1.Route exact path="/" component={App}/>
        <react_router_dom_1.Route path="/packetSniffer" component={packetSniffer}/>
        <react_router_dom_1.Route path="/utilities" component={Utilities}/>
        <react_router_dom_1.Route path='/packetTester' component={packetTester}/>
        <react_router_dom_1.Route path='/replay' component={replay}/>
    </react_router_dom_1.BrowserRouter>, document.getElementById('root'));
