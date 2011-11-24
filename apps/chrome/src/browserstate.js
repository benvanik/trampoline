var BrowserState = function(serviceEndpoint) {
  this.service = new Service(serviceEndpoint);

  this.devices = {};
  this.targetDevice = null;

  this.tabStates = {};
  this.activeTabState = null;

  this.queryInterval_ = null;

  this.startQueryingDevices_();
};

// Frequency of device updates, in ms
BrowserState.QUERY_DEVICE_INTERVAL_ = 5 * 1000;

BrowserState.prototype.startQueryingDevices_ = function() {
  var self = this;
  this.queryInterval_ = window.setInterval(function() {
    self.queryDevices_();
  }, BrowserState.QUERY_DEVICE_INTERVAL_);
  this.queryDevices_();
}

BrowserState.prototype.stopQueryingDevices_ = function() {
  window.clearInterval(this.queryInterval_);
  this.queryInterval_ = null;
};

BrowserState.prototype.queryDevices_ = function() {
  var self = this;
  this.service.getDevices(function(response) {
    if (!response) {
      window.console.log('service not running, unable to query devices');
      return;
    }
    for (var n = 0; n < response.devices.length; n++) {
      var deviceInfo = response.devices[n];
      if (!self.devices[deviceInfo.id]) {
        var device = new Device(self.service, deviceInfo);
        self.addDevice_(device);
      }
    }
    // TODO: remove devices no longer present
  });
};

BrowserState.prototype.addDevice_ = function(device) {
  this.devices[device.id] = device;

  // Set default device
  // TODO: options?
  if (!this.targetDevice) {
    this.targetDevice = device;
  }

  window.console.log('added device:');
  window.console.log(device);
  // TODO: event
};

BrowserState.prototype.removeDevice_ = function(device) {
  delete this.devices[device.id];

  // Unset target device
  // TODO: options?
  if (this.targetDevice == device) {
    this.targetDevice = null;
  }

  window.console.log('removed device:');
  window.console.log(device);
  // TODO: event
};

BrowserState.prototype.getTabState = function(tabId) {
  var tabState = this.tabStates[tabId];
  if (!tabState) {
    tabState = this.tabStates[tabId] = new TabState(tabId);
  }
  return tabState;
};

BrowserState.prototype.getActiveTabState = function() {
  return this.activeTabState;
};

BrowserState.prototype.beginPlayback = function(tabId, device, source) {
  if (this.activeTabState) {
    this.activeTabState.playbackContext.stop();
    this.activeTabState = null;
  }

  this.activeTabState = this.getTabState(tabId);
  this.activeTabState.playbackContext =
      new PlaybackContext(this, this.activeTabState, device, source);
};
