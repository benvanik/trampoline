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
