#!/usr/bin/env node

var util = require('util');

var API = require('./api').API;

var apiPort = 8090;
var httpPort = 8091;

// Setup API
var api = new API(apiPort);
api.start();

// Setup local HTTP server
// TODO: local HTTP server
