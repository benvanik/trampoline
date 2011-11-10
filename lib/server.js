#!/usr/bin/env node

var util = require('util');

var opts = require('tav').set({
  port: {
    note: 'API binding port',
    value: 8090
  }
});

var API = require('./api').API;

var port =
    parseInt(process.env.npm_package_config_port) ||
    opts['port'] ||
    8090;

util.puts('starting trampoline...');
util.puts('  port: ' + port);

// Setup API
var api = new API(port);
api.start();

util.puts('trampoline online and ready');
util.puts('');

// Sometimes these get thrown, for some stupid reason
// Error: read Unknown system errno 60
//    at errnoException (net.js:614:11)
//    at TCP.onread (net.js:355:20)
//process.on('uncaughtException', function(err) {
//  window.console.log(util.puts(err));
//});
