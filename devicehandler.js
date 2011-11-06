var DeviceHandler = function(device) {
  this.device = device;
};
exports.DeviceHandler = DeviceHandler;

DeviceHandler.prototype.default = function(req, callback) {
  callback(this.device.getInfo());
};

DeviceHandler.prototype.status = function(req, callback) {
  this.device.status(function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.authorize = function(req, callback) {
  // TODO: implement authorize
  callback(res);
};

DeviceHandler.prototype.play = function(req, callback) {
  this.device.play(req.content, req.start, function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.stop = function(req, callback) {
  this.device.stop(function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.scrub = function(req, callback) {
  this.device.scrub(req.position, function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.rate = function(req, callback) {
  this.device.rate(req.value, function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.pause = function(req, callback) {
  this.device.rate(0, function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.resume = function(req, callback) {
  this.device.rate(1, function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.volume = function(req, callback) {
  this.device.volume(req.value, function(res) {
    callback(res);
  });
};

DeviceHandler.prototype.photo = function(req, callback) {
  // TODO: implement photo
  callback(res);
};
