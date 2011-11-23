var Service = function(endpoint, user, password) {
  this.endpoint = endpoint;
  this.user = user || null;
  this.password = password || null;
};

Service.prototype.get_ = function(path, callback) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      if (req.status == 200) {
        callback(JSON.parse(req.responseText));
      } else {
        callback(null);
      }
    }
  };
  req.open('GET', this.endpoint + path, true, this.user, this.password);
  req.send(null);
};

Service.prototype.post_ = function(path, requestBody, callback) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      if (req.status == 200) {
        callback(JSON.parse(req.responseText));
      } else {
        callback(null);
      }
    }
  };
  req.open('POST', this.endpoint + path, true, this.user, this.password);
  req.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8');
  req.send(JSON.stringify(requestBody));
};

Service.prototype.getDevices = function(callback) {
  this.get_('/device/list', function(response) {
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.getDeviceInfo = function(deviceId, callback) {
  this.get_('/device/' + deviceId + '/', function(response) {
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.getDeviceStatus = function(deviceId, callback) {
  this.get_('/device/' + deviceId + '/status', function(response) {
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.authorize = function(deviceId, callback) {
  var request = {};
  this.post_('/device/' + deviceId + '/authorize', request, function(response) {
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.play = function(deviceId, content, start, callback) {
  var request = {
    content: content,
    start: start
  };
  this.post_('/device/' + deviceId + '/play', request, function(response) {
    window.console.log(response);
    if (callback) {
     callback(response);
    }
  });
};

Service.prototype.stop = function(deviceId, callback) {
  var request = {};
  this.post_('/device/' + deviceId + '/stop', request, function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.scrub = function(deviceId, position, callback) {
  var request = {
    position: position
  };
  this.post_('/device/' + deviceId + '/scrub', request, function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.reverse = function(deviceId, callback) {
  var request = {};
  this.post_('/device/' + deviceId + '/reverse', request, function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.rate = function(deviceId, value, callback) {
  var request = {
    value: value
  };
  this.post_('/device/' + deviceId + '/rate', request, function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.volume = function(deviceId, value, callback) {
  var request = {
    value: value
  };
  this.post_('/device/' + deviceId + '/volume', request, function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.photo = function(deviceId, content, transition, callback) {
  var request = {
    content: content,
    transition: transition
  };
  this.post_('/device/' + deviceId + '/photo', request, function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.setupContent = function(source, target, callback) {
  var request = {
    source: source,
    target: target
  };
  this.post_('/content/setup', request, function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.getContentStatus = function(contentId, callback) {
  this.get_('/content/' + contentId + '/status', function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};

Service.prototype.getContentInfo = function(contentId, callback) {
  this.get_('/content/' + contentId + '/info', function(response) {
    window.console.log(response);
    if (callback) {
      callback(response);
    }
  });
};
