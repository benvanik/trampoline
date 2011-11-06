var airplay = require('airplay');
var http = require('http');
var util = require('util');

var DeviceHandler = require('./devicehandler').DeviceHandler;

var API = function(port) {
  var self = this;

  this.port = port || 8090;

  this.browser = airplay.createBrowser();

  this.server = http.createServer(function (req, res) {
    var requestBody = '';
    req.on('data', function(chunk) {
      requestBody += chunk;
    });
    req.on('end', function() {
      // Expected URLs:
      // /device/
      // /device/[id]/[action]
      if (req.url == '/device/') {
        self.dispatchDeviceDefaultRequest(req, requestBody, res);
      } else if (req.url.indexOf('/device/') == 0) {
        self.dispatchDeviceRequest(req, requestBody, res);
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

API.prototype.dispatchDeviceDefaultRequest = function(req, requestBody, res) {
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
  var requestObject = requestBody.length ? JSON.parse(requestBody) : {};

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
        action.call(device.handler, requestObject, function(responseObject) {
          res.writeHead(200, {
            'Content-Type': 'text/plain'
          });
          res.end(JSON.stringify(responseObject));
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
