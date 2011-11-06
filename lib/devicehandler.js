var util = require('util');

var DeviceHandler = function(device) {
  this.device = device;
};
exports.DeviceHandler = DeviceHandler;

DeviceHandler.prototype.default = function(req, callback) {
  callback(this.device.getInfo());
};

DeviceHandler.prototype.status = function(req, callback) {
  util.puts('getting status...');
  this.device.status(function(res) {
    util.puts('status retreived');
    callback(res);
  });
};

DeviceHandler.prototype.authorize = function(req, callback) {
  // TODO: implement authorize
  callback(res);
};

DeviceHandler.prototype.play = function(req, callback) {
  util.puts('playing...');
  this.device.play(req.content, req.start, function(res) {
    util.puts('played');
    callback(res);
  });
};

DeviceHandler.prototype.stop = function(req, callback) {
  util.puts('stopping...');
  this.device.stop(function(res) {
    util.puts('stopped');
    callback(res);
  });
};

DeviceHandler.prototype.scrub = function(req, callback) {
  util.puts('scrubbing...');
  this.device.scrub(req.position, function(res) {
    util.puts('scrubbed');
    callback(res);
  });
};

DeviceHandler.prototype.reverse = function(req, callback) {
  util.puts('reversing...');
  this.device.reverse(function(res) {
    util.puts('reversed');
    callback(res);
  })
};

DeviceHandler.prototype.rate = function(req, callback) {
  util.puts('setting rate...');
  this.device.rate(req.value, function(res) {
    util.puts('rate set');
    callback(res);
  })
};

DeviceHandler.prototype.pause = function(req, callback) {
  util.puts('pausing...');
  this.device.rate(0, function(res) {
    util.puts('paused');
    callback(res);
  })
};

DeviceHandler.prototype.resume = function(req, callback) {
  util.puts('resuming...');
  this.device.rate(1, function(res) {
    util.puts('resumed');
    callback(res);
  })
};

DeviceHandler.prototype.volume = function(req, callback) {
  util.puts('setting volume...');
  this.device.volume(req.value, function(res) {
    util.puts('volume set');
    callback(res);
  })
};

DeviceHandler.prototype.photo = function(req, callback) {
  // TODO: implement photo
  callback(res);
};

DeviceHandler.prototype.test1 = function(req, callback) {
  this.device.play(
      'http://10.0.1.17:8199/65BEB3AE-ADF1-4FE7-9367-DB1672ED4727.m4v',
      0,
      callback);
};
