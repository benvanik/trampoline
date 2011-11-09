var service = new Service('http://localhost:8090');
var devices = {}; // deviceId -> Device mapping
var targetDevice = null;

function queryDevices() {
  service.getDevices(function(response) {
    if (!response) {
      window.console.log('service not running, unable to query devices');
      return;
    }
    for (var n = 0; n < response.devices.length; n++) {
      var deviceInfo = response.devices[n];
      if (!devices[deviceInfo.id]) {
        var device = new Device(service, deviceInfo);
        devices[deviceInfo.id] = device;
        if (!targetDevice) {
          targetDevice = device;
        }
        window.console.log('new device:');
        window.console.log(device);
      }
    }
    // TODO: remove devices no longer present
  });
}
var kDeviceRefreshInterval = 5 * 1000;
window.setInterval(queryDevices, kDeviceRefreshInterval);
queryDevices();

function getWatchUrls() {
  var urls = [];
  // TODO: detect from supported services/etc
  return urls;
}

var TabState = function(tabId) {
  this.tabId = tabId;
  this.videos = [];
};
TabState.prototype.addVideo = function(details) {
  this.videos.push(details);
  chrome.pageAction.setTitle({
    tabId: this.tabId,
    title: 'Play on device ' + targetDevice.name + ':\n' + details.url
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
    tabId: this.tabId,
    path: '../assets/airplay.png'
  });
  chrome.pageAction.show(this.tabId);
};
TabState.prototype.hideAction = function() {
  chrome.pageAction.hide(this.tabId);
};

// tabId -> TabState
var tabStates = {};

function getTabState(tabId) {
  var tabState = tabStates[tabId];
  if (!tabState) {
    tabState = tabStates[tabId] = new TabState(tabId);
  }
  return tabState;
}

// onResponseStarted does not have tabId, so track all getfile's
// requestId -> tabId
var getfilesMap = {};
chrome.experimental.webRequest.onBeforeRequest.addListener(
    function(details) {
      getfilesMap[details.requestId] = details.tabId;
      return true;
    }, {
      urls: getWatchUrls()
    });

function handleResponseStarted(tabId, details) {
  // TODO: blacklist some details.url ?

  // Extract relevant headers
  var contentType;
  for (var n = 0; n < details.responseHeaders.length; n++) {
    var header = details.responseHeaders[n];
    switch (header.name) {
      case 'Content-Type':
        contentType = header.value;
        break;
    }
  }

  var likelyVideo = false;
  switch (contentType) {
    case 'video/mp4':
    case 'video/mpeg':
    case 'video/quicktime':
    // Need transcoding:
    // case 'video/avi':
    // case 'video/x-flv':
    // case 'video/x-m4v':
    // case 'video/x-msvideo':
    // case 'video/x-ms-asf':
    // case 'video/webm':
      likelyVideo = true;
      break;
  }
  if (!likelyVideo) {
    // TODO: try checking more - like is application/octet-stream, etc
  }

  if (likelyVideo) {
    window.console.log('VIDEO: ' + details.url);
    window.console.log(details);

    var tabState = getTabState(tabId);
    tabState.addVideo(details);
    tabState.showAction();
  }
}

chrome.experimental.webRequest.onResponseStarted.addListener(
    function(details) {
      var tabId = getfilesMap[details.requestId];
      if (tabId === undefined) {
        // TODO: scan all tabs in the current window to try to find which
        // one may have made the request
        chrome.tabs.getAllInWindow(undefined, function(tabs) {
          for (var n = 0; n < tabs.length; n++) {
            var tab = tabs[n];
            if (false) {
              handleResponseStarted(tab.id, details);
              break;
            }
          }
        });
      } else {
        handleResponseStarted(tabId, details);
      }
    }, {
      urls: getWatchUrls()
    }, ['responseHeaders']);

chrome.pageAction.onClicked.addListener(function(tab) {
  var tabState = getTabState(tab.id);
  var video = tabState.getLastVideo();
  if (video) {
    if (targetDevice) {
      targetDevice.play(video.url, 0, function(response) {
        window.console.log(response);
      });
    }
  } else {
    alert('no video');
  }
});
