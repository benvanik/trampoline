#!/usr/bin/env node

var util = require('util');

var opts = require('tav').set({
  api_port: {
    note: 'API binding port',
    value: 8090
  },
  http_port: {
    note: 'HTTP server binding port',
    value: 8091
  }
});

var API = require('./api').API;

var api_port =
    parseInt(process.env.npm_package_config_api_port) ||
    opts['api_port'] ||
    8090;
var http_port =
    parseInt(process.env.npm_package_config_http_port) ||
    opts['http_port'] ||
    8091;

util.puts('starting trampoline...');
util.puts('   api_port: ' + api_port);
util.puts('  http_port: ' + http_port);

// Setup API
var api = new API(api_port);
api.start();

// Setup local HTTP server
// TODO: local HTTP server

util.puts('trampoline online and ready');
util.puts('');
