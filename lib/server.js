#!/usr/bin/env node

var API = require('./trampoline/api').API;

var apiPort = 8090;
var httpPort = 8091;

// Setup API
var api = new API(apiPort);
api.start();

// Setup local HTTP server
// TODO: local HTTP server
