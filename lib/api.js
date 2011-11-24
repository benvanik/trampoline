var airplay = require('airplay');
var dns = require('dns');
var http = require('http');
var os = require('os');
var util = require('util');

var ContentCache = require('./contentcache').ContentCache;
var DeviceHandler = require('./devicehandler').DeviceHandler;

var API = function(port) {
  var self = this;

  this.endpoint = null; // populated in start()
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
    // So we can access from file://
    res.setHeader('Access-Control-Allow-Origin', '*');

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
  var self = this;

  // TODO: compute the correct address based on the device address (reachable
  // interface, etc)
  // Right now, this just queries the first ipv4 addr of the hostname
  dns.lookup(os.hostname(), 4, function(err, address, family) {
    self.endpoint = 'http://' + address + ':' + self.port;
    util.puts('service endpoint: ' + self.endpoint);

    self.browser.start();
    self.server.listen(self.port);
  });
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
        device.handler = new DeviceHandler(device, this.endpoint);
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
  var content = this.contentCache.findOrCreate(source, target, request.id);

  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end(JSON.stringify({
    id: content.id,
    url: this.endpoint + '/content/' + content.id
  }));
};

API.prototype.dispatchContentRequest = function(req, requestBody, res) {
  var request = requestBody.length ? JSON.parse(requestBody) : {};

  var contentMatch = req.url.match(/\/content\/([a-z0-9-]+)\/?([a-z0-9]+)?/);
  if (contentMatch) {
    var contentId = contentMatch[1];
    var content = this.contentCache.get(contentId);
    if (content) {
      var actionName = contentMatch[2] || 'default';
      if (actionName == 'default') {
        if (req.method == 'GET') {
          if (content.isReady()) {
            content.get(req, res);
          } else {
            res.writeHead(500, 'Content Not Ready');
            res.end();
          }
        } else if (req.method == 'PUT') {
          content.put(req, res);
        } else if (req.method == 'DELETE') {
          content.delete();
          this.contentCache.remove(contentId);
          res.writeHead(200, {
            'Content-Type': 'text/plain'
          });
          res.end();
        } else {
          res.writeHead(405, 'Method Not Allowed');
          res.end();
        }
      } else {
        // Dispatch
        var action = content[actionName];
        if (action) {
          action.call(content, request, function(response) {
            res.writeHead(200, {
              'Content-Type': 'text/plain'
            });
            res.end(JSON.stringify(response));
          });
        } else {
          res.writeHead(404, 'Invalid action \'' + actionName + '\'');
          res.end();
        }
      }
    } else {
      res.writeHead(404, 'Invalid content');
      res.end();
    }
  } else {
    res.writeHead(404, 'Invalid content');
    res.end();
  }
};
