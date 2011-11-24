var TabState = function(browser, tabId) {
  this.id = tabId;
  this.browser = browser;
  this.videos = [];
  this.playbackContext = null;

  this.port = null;
};

TabState.prototype.addVideo = function(details) {
  this.videos.push(details);
  chrome.pageAction.setTitle({
    tabId: this.id,
    title: 'Play ' + details.url
  });
};

TabState.prototype.getLastVideo = function() {
  if (!this.videos.length) {
    return null;
  }
  return this.videos[this.videos.length - 1];
};

TabState.prototype.showAction = function() {
  chrome.pageAction.setIcon({
    tabId: this.id,
    path: '../assets/airplay.png'
  });
  chrome.pageAction.setPopup({
    tabId: this.id,
    popup: '../src/popup.html?' + this.id
  });
  chrome.pageAction.show(this.id);
};

TabState.prototype.hideAction = function() {
  chrome.pageAction.hide(this.id);
};

TabState.prototype.setPort = function(port) {
  function bindContext(ctx) {
    ctx.addListener('ready', function(info) {
      port.postMessage({
        command: 'ready',
        value: info
      });
      ctx.play();
    });
    ctx.addListener('status', function(status) {
      port.postMessage({
        command: 'updateStatus',
        value: status
      });
    });
  };

  this.port = port;
  var self = this;
  port.onMessage.addListener(function(msg) {
    switch (msg.command) {
      case 'play':
        var device = self.browser.targetDevice;
        if (!device) {
          alert('no device');
        }
        var video = self.getLastVideo();
        if (video) {
          var ctx = self.browser.beginPlayback(self.id, device, video);
          bindContext(ctx);
        } else {
          alert('no video');
        }
        break;
      case 'resume':
        if (self.playbackContext) {
          self.playbackContext.resume();
        }
        break;
      case 'pause':
        if (self.playbackContext) {
          self.playbackContext.pause();
        }
        break;
      case 'stop':
        self.browser.endPlayback();
        break;
      case 'rewind':
        if (self.playbackContext) {
          self.playbackContext.rewind();
        }
        break;
      case 'seek':
        if (self.playbackContext) {
          self.playbackContext.seek(msg.value);
        }
        break;
    }
  });
  port.onDisconnect.addListener(function() {
    self.playbackContext.removeAllListeners();
    self.port = null;
  });

  if (this.playbackContext) {
    bindContext(this.playbackContext);
    port.postMessage({
      command: 'ready',
      value: this.playbackContext.sourceInfo,
      status: this.playbackContext.currentStatus
    });
  } else {
    port.postMessage({
      command: 'idle'
    });
  }
};
