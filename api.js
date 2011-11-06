var airplay = require('airplay');
var http = require('http');
var util = require('util');

var ContentCache = require('./contentcache').ContentCache;
var DeviceHandler = require('./devicehandler').DeviceHandler;

var API = function(port) {
  var self = this;

  this.port = port || 8090;

  this.contentCache = new ContentCache();

  this.browser = airplay.createBrowser();
  this.browser.on('deviceOnline', function(device) {
    util.puts('device online: ' + device.id + ' / ' + device.getName());
  });
  this.browser.on('deviceOffline', function(device) {
    util.puts('device offline: ' + device.id + ' / ' + device.getName());
  });

  this.server = http.createServer(function (req, res) {
    var requestBody = '';
    req.on('data', function(chunk) {
      requestBody += chunk;
    });
    req.on('end', function() {
      // /device/list
      if (req.url == '/device/list') {
        self.dispatchDeviceListRequest(req, requestBody, res);
      // /device/[id]/[action]
      } else if (req.url.indexOf('/device/') == 0) {
        self.dispatchDeviceRequest(req, requestBody, res);
      // /content/setup
      } else if (req.url == '/content/setup') {
        self.dispatchContentSetupRequest(req, requestBody, res);
      // /content/[id]
      } else if (req.url.indexOf('/content/') == 0) {
        self.dispatchContentRequest(req, requestBody, res);
      } else {
        res.writeHead(404, 'Invalid URL format');
        res.end();
      }
    });
  });
};
exports.API = API;

API.prototype.start = function() {
  this.browser.start();
  this.server.listen(this.port);
};

API.prototype.dispatchDeviceListRequest = function(req, requestBody, res) {
  var response = {
    devices: []
  };
  var devices = this.browser.getDevices();
  for (var n = 0; n < devices.length; n++) {
    var device = devices[n];
    response.devices.push(device.getInfo());
  }
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end(JSON.stringify(response));
};

API.prototype.dispatchDeviceRequest = function(req, requestBody, res) {
  var request = requestBody.length ? JSON.parse(requestBody) : {};

  var deviceMatch = req.url.match(/\/device\/([a-z0-9]+)\/([a-z0-9]+)?/);
  if (deviceMatch) {
    var deviceId = deviceMatch[1];
    var device = this.browser.getDeviceById(deviceId);
    if (device) {
      // Setup handler, if needed
      if (!device.handler) {
        device.handler = new DeviceHandler(device);
      }

      var actionName = deviceMatch[2] || 'default';
      var action = device.handler[actionName];
      if (action) {
        action.call(device.handler, request, function(response) {
          res.writeHead(200, {
            'Content-Type': 'text/plain'
          });
          res.end(JSON.stringify(response));
        });
      } else {
        // Invalid action
        res.writeHead(404, 'Invalid action \'' + actionName + '\'');
        res.end();
      }
    } else {
      res.writeHead(404, 'Invalid device');
      res.end();
    }
  } else {
    res.writeHead(404, 'Invalid device');
    res.end();
  }
};

API.prototype.dispatchContentSetupRequest = function(req, requestBody, res) {
  var request = requestBody.length ? JSON.parse(requestBody) : {};

  var source = request.source;
  var target = request.target;
  var content = this.contentCache.findOrCreate(source, target);

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end(JSON.stringify({
    id: content.id
  }));
};

API.prototype.dispatchContentRequest = function(req, requestBody, res) {
  // TODO: content requests
};
