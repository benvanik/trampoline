var Device = function(service, deviceInfo) {
  this.service = service;
  this.id = deviceInfo.id;
  this.name = deviceInfo.name;
  this.deviceId = deviceInfo.deviceId;
  this.features = deviceInfo.features;
  this.model = deviceInfo.model;
  this.slideshowFeatures = deviceInfo.slideshowFeatures;
  this.supportedContentTypes = deviceInfo.supportedContentTypes;

  this.status = null;
};

Device.prototype.getStatus = function(callback) {
  // TODO: cache status so a request isn't needed each time
  this.service.getDeviceStatus(this.id, callback);
};

Device.prototype.authorize = function(callback) {
  this.service.authorize(this.id, callback);
};

Device.prototype.play = function(content, start, callback) {
  this.service.play(this.id, content, start, callback);
};

Device.prototype.stop = function(callback) {
  this.service.stop(this.id, callback);
};

Device.prototype.scrub = function(position, callback) {
  this.service.scrub(this.id, position, callback);
};

Device.prototype.reverse = function(callback) {
  this.service.reverse(this.id, callback);
};

Device.prototype.rate = function(value, callback) {
  this.service.rate(this.id, value, callback);
};

Device.prototype.volume = function(value, callback) {
  this.service.volume(this.id, value, callback);
};

Device.prototype.photo = function(content, transition, callback) {
  this.service.photo(this.id, content, transition, callback);
};
