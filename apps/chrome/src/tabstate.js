var TabState = function(tabId) {
  this.id = tabId;
  this.videos = [];
  this.playbackContext = null;
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
    popup: '../src/popup.html'
  });
  chrome.pageAction.show(this.id);
};

TabState.prototype.hideAction = function() {
  chrome.pageAction.hide(this.id);
};
