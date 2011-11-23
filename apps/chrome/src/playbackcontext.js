var PlaybackContext = function(browser, tab, device, source) {
  this.browser = browser;
  this.service = browser.service;
  this.tab = tab;
  this.device = device;

  // source: {
  //   content: string,
  //   mimeType: string,     // 'video/webm'
  //   cookie: string,
  //   referer: string,
  //   auth: string          // user:password
  // }
  this.source = source;
  // TODO: pull from options/etc
  this.target = {
    mimeType: 'video/mp4',
    //resolution: 720,
    //quality: 0.8
  };

  this.contentId = null;
  this.sourceInfo = null;
  this.currentStatus = null;

  this.updateInterval_ = null;

  this.prepare_();
};

// Ready polling interval, in ms
PlaybackContext.READY_POLL_INTERVAL_ = 100;
// Frequency of status updates, in ms
PlaybackContext.UPDATE_INTERVAL_ = 1000;

PlaybackContext.prototype.prepare_ = function() {
  var self = this;
  this.service.setupContent(this.source, this.target, function(response) {
    self.contentId = response.id;
    self.waitUntilReady_(self.contentId, function(info) {
      self.sourceInfo = info;
      self.startQueryingStatus_();

      // TODO: event
    });
  });
};

PlaybackContext.prototype.waitUntilReady_ = function(contentId, callback) {
  var self = this;
  var checkReady = function() {
    self.getContentStatus(contentId, function(status) {
      if (status.readyToPlay) {
        service.getContentInfo(contentId, function(info) {
          callback(info);
        });
      } else {
        window.setTimeout(checkReady, PlaybackContext.READY_POLL_INTERVAL_);
      }
    });
  };
  checkReady();
};

PlaybackContext.prototype.startQueryingStatus_ = function() {
  var self = this;
  this.updateInterval_ = window.setInterval(function() {
    self.updateStatus_();
  }, PlaybackContext.UPDATE_INTERVAL_);
  self.updateStatus_();
};

PlaybackContext.prototype.stopQueryingStatus_ = function() {
  window.clearInterval(this.updateInterval_);
  this.updateInterval_ = null;
};

PlaybackContext.prototype.updateStatus_ = function() {
  var self = this;
  this.device.getStatus(function(status) {
    self.currentStatus = status;
    // TODO: event
  });
};

PlaybackContext.prototype.seek = function(percent) {
  var position = (percent / 100) * this.currentStatus.duration;
  this.device.scrub(position);
};

PlaybackContext.prototype.rewind = function() {
  this.seek(0);
};

PlaybackContext.prototype.pause = function() {
  this.device.rate(0);
};

PlaybackContext.prototype.resume = function() {
  this.device.rate(1);
};

PlaybackContext.prototype.stop = function() {
  this.device.stop();
  this.stopQueryingStatus_();
};
