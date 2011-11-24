var serviceEndpoint = 'http://10.0.1.3:8090';
var browserState = new BrowserState(serviceEndpoint);

// Route ports
chrome.extension.onConnect.addListener(function(port) {
  if (port.name.indexOf('popup:') == 0) {
    // This should only ever come from the active tab - if there is no active
    // tab then die
    var tabId = parseInt(port.name.substr(port.name.indexOf(':') + 1));
    var tabState = browserState.getTabState(tabId);
    if (tabState) {
      tabState.setPort(port);
    }
  }
});

function getWatchUrls() {
  var urls = [];
  // TODO: detect from supported services/etc
  return urls;
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
    case 'video/x-flv':
    case 'video/x-m4v':
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

    var tabState = browserState.getTabState(tabId);
    tabState.addVideo(details);
    tabState.showAction();
  }
}

chrome.experimental.webRequest.onResponseStarted.addListener(function(details) {
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

// chrome.pageAction.onClicked.addListener(function(tab) {
//   var device = browserState.targetDevice;
//   if (!device) {
//     alert('no device');
//   }

//   var tabState = browserState.getTabState(tab.id);
//   var video = tabState.getLastVideo();
//   if (video) {
//     browserState.beginPlayback(tab.id, device, video);
//   } else {
//     alert('no video');
//   }
// });
