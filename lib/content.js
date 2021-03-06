var fs = require('fs');
var http = require('http');
var temp = require('./temp');
var transcoding = require('transcoding');
var url = require('url');
var util = require('util');

var Transcoder = require('./transcoder').Transcoder;

var Content = function(id, source, target) {
  this.id = id;
  this.source = {
    content: source.content,
    mimeType: source.mimeType || undefined,
    cookie: source.cookie || undefined,
    referer: source.referer || undefined,
    auth: source.auth || undefined,
    info: null // populated below
  };
  this.target = {
    mimeType: target.mimeType || undefined,
    resolution: target.resolution || undefined,
    quality: target.quality || undefined
  };

  this.cached_ = false;
  this.seekable_ = false;
  this.readyToPlay_ = false;

  this.needsVideoTranscode_ = false;
  this.needsAudioTranscode_ = false;
  this.needsRemux_ = false;

  var self = this;
  this.extractMediaInfo_(function(info) {
    util.puts(util.inspect(info));
    self.source.info = info;

    // TODO: on the fly or when /cache is called
    self.prepare_(function(err) {
      if (!err) {
        self.readyToPlay_ = true;
        self.cached_ = true;
      }
    });
  });
};
exports.Content = Content;

Content.prototype.matches = function(source, target) {
  var sourceMatches =
      source.content == this.source.content;
  var targetMatches =
      target.mimeType == this.target.mimeType &&
      (target.resolution === undefined ||
          target.resolution == this.target.resolution) &&
      (target.quality === undefined ||
          target.quality == this.target.quality);
  return sourceMatches && targetMatches;
};

Content.prototype.isReady = function() {
  return this.readyToPlay_;
};

Content.prototype.createRemoteRequest_ = function(method, headers, callback) {
  var source = this.source;
  var sourceUrl = url.parse(source.content);

  // Headers to make the requests look more valid
  headers['Accept'] = '*/*';
  headers['Accept-Charset'] = 'ISO-8859-1,utf-8;q=0.7,*;q=0.3';
  headers['Accept-Encoding'] = 'identity;q=1, *;q=0';
  headers['Accept-Language'] = 'en-US,en;q=0.8';
  headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) ' +
        'AppleWebKit/535.8 (KHTML, like Gecko) Chrome/17.0.930.0 Safari/535.8';

  // Copy user headers
  if (source.referer) {
    headers['Referer'] = source.referer;
  }
  if (source.cookie) {
    headers['Cookie'] = source.cookie;
  }

  var req = http.request({
    hostname: sourceUrl.hostname,
    port: sourceUrl.port,
    method: method,
    path: sourceUrl.path,
    headers: headers,
    auth: source.auth,
  }, function(res) {
    callback(res);
  });

  return req;
};

Content.prototype.downloadFile_ = function(url, start, end, callback) {
  var headers = {};
  if (end !== undefined) {
    headers['Range'] = 'bytes=' + (start || 0) + '-' + end;
  }

  var tempName = temp.generateName();
  var tempFile = fs.createWriteStream(tempName);
  tempFile.on('error', function(e) {
    util.puts('temp write error: ' + util.inspect(e));
    callback(null);
  });
  tempFile.on('close', function() {
    callback(tempName);
  });

  var req = this.createRemoteRequest_('GET', headers, function(res) {
    res.on('error', function(e) {
      // TODO: prop back up?
      util.puts('error in remote request: ' + util.inspect(e));
      callback(null);
    });
    res.pipe(tempFile);
  });
  req.on('error', function(e) {
    // TODO: prop back up?
    util.puts('error in remote request: ' + util.inspect(e));
    callback(null);
  });
  req.end();
};

Content.prototype.extractMediaInfo_ = function(callback) {
  var sourceUrl = url.parse(this.source.content);
  switch (sourceUrl.protocol) {
    case 'file:':
      var filename = decodeURI(sourceUrl.pathname);
      transcoding.queryInfo(filename, function(err, info) {
        callback(err ? null : info);
      });
      return;
    case 'http:':
    case 'https:':
      this.downloadFile_(this.source.content, 0, 64000, function(filename) {
        if (filename) {
          util.puts(filename);
          transcoding.queryInfo(filename, function(err, info) {
            callback(err ? null : info);
          });
        } else {
          callback(null);
        }
      });
      return;
    default:
      util.puts('unsupported protocol: ' + sourceUrl.protocol);
      callback(null);
      return;
  }
};

Content.prototype.prepare_ = function(callback) {
  var needsRemux = false;
  var needsVideoTranscode = false;
  var needsAudioTranscode = false;

  switch (this.source.info.container) {
    case 'mov':
    case 'mpegts':
      break;
    default:
      needsRemux = true;
      break;
  }

  var videoStream;
  var audioStream;
  for (var n = 0; n < this.source.info.streams.length; n++) {
    var stream = this.source.info.streams[n];
    switch (stream.type) {
      case transcoding.StreamType.VIDEO:
        videoStream = videoStream || stream;
        break;
      case transcoding.StreamType.AUDIO:
        audioStream = audioStream || stream;
        break;
    }
  }
  switch (videoStream.codec) {
    case 'h264':
      break;
    default:
      needsVideoTranscode = true;
      break;
  }
  switch (audioStream.codec) {
    case 'aac':
    case 'mp3':
      break;
    default:
      needsAudioTranscode = true;
      break;
  }

  this.needsVideoTranscode_ = needsVideoTranscode;
  this.needsAudioTranscode_ = needsAudioTranscode;
  this.needsRemux_ = needsRemux;

  if (needsVideoTranscode || needsAudioTranscode) {
    // Needs either a video or audio transcode (and maybe a new container)
    util.puts('needs transcoding, video: ' +
        needsVideoTranscode + ', audio: ' + needsAudioTranscode);
    this.offlineTranscode_(callback);
  } else if (needsRemux) {
    // Needs a simple remux (new container)
    util.puts('needs remuxing');
    this.offlineTranscode_(callback);
  } else {
    // Good to go!
    callback(null);
  }
};

Content.prototype.offlineTranscode_ = function(callback) {
  var self = this;

  function transcode(filename) {
    var tempName = temp.generateName();
    this.source.content = 'file://' + tempName;
    util.puts(this.source.content);

    transcoding.process(filename, tempName, transcoding.profiles.APPLE_TV_2, {
    }, function(err, sourceInfo, targetInfo) {
      if (err) {
        callback(err);
        return;
      }

      callback(null);
    });
  };

  var sourceUrl = url.parse(this.source.content);
  switch (sourceUrl.protocol) {
    case 'file:':
      // Already local
      transcode.call(this, sourceUrl.pathname);
      break;
    case 'http:':
    case 'https:':
      // Download first, then process
      this.downloadFile_(this.source.content, 0, undefined, function(filename) {
        if (filename) {
          transcode.call(self, filename);
        } else {
          callback(null);
        }
      });
      break;
    default:
      callback(new Error('Unknown protocol ' + sourceUrl.protocol));
      break;
  }
};

Content.prototype.get = function(req, res) {
  var sourceUrl = url.parse(this.source.content);
  switch (sourceUrl.protocol) {
    case 'file:':
      this.localFileGet(req, res, sourceUrl);
      return;
    case 'http:':
    case 'https:':
      this.remoteHttpGet(req, res, sourceUrl);
      return;
    default:
      res.writeHead(415, 'Unsupported Media Type');
      res.end();
      return;
  }
};

Content.prototype.localFileGet = function(req, res, sourceUrl) {
  var source = this.source;
  var target = this.target;

  var filename = decodeURI(sourceUrl.pathname);
  fs.stat(filename, function(err, stats) {
    if (err) {
      res.writeHead(404, 'Not Found');
      res.end();
      return;
    }

    var mtime = Date.parse(stats.mtime);
    var etag = JSON.stringify([stats.ino, stats.size, mtime].join('-'));
    var headers = {
      'Cache-Control': 'max-age=' + (60 * 60 * 24 * 7),
      'Date': new(Date)().toUTCString(),
      'Last-Modified': new(Date)(stats.mtime).toUTCString(),
      'Etag': etag,
      'Content-Type': target.mimeType,
      'Accept-Ranges': 'bytes'
    };

    if (req.headers['if-none-match'] == etag ||
        Date.parse(req.headers['if-modified-since']) >= mtime) {
      res.writeHead(304, headers);
      res.end();
      return;
    }
    if (req.method == 'HEAD') {
      headers['Content-Length'] = stats.size;
      res.writeHead(200, headers);
      res.end();
      return;
    }

    // TODO: transcoding, if required

    var start = 0;
    var end = stats.size;
    if (req.headers['range']) {
      var range = req.headers['range'].match(/([0-9]+)-([0-9]+)?/);
      start = parseInt(range[1]);
      end = range[2] !== undefined ? parseInt(range[2]) : stats.size - 1;
      headers['Content-Length'] = end - start + 1;
      if (start == 0 && end == stats.size) {
        res.writeHead(200, headers);
      } else {
        headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' +
            stats.size;
        res.writeHead(206, headers);
      }
    } else {
      headers['Content-Length'] = stats.size;
      headers['Content-Range'] = 'bytes 0-' + stats.size + '/' + stats.size;
      res.writeHead(200, headers);
    }
    fs.createReadStream(filename, {
      flags: 'r',
      mode: 0666,
      bufferSize: 64 * 1024,
      start: start,
      end: end
    }).pipe(res, {
      end: true
    });
  });
};

Content.prototype.remoteHttpGet = function(req, res, sourceUrl) {
  var source = this.source;
  var target = this.target;

  var headers = {};

  // Add specific request headers that we want to pass through
  if (req.headers['range']) {
    headers['Range'] = req.headers['range'];
  }

  var remoteReq = this.createRemoteRequest_(
      req.method, headers, function(remoteRes) {
    // Write response headers - write out exactly what we get from the remote
    // server (note that they will be all lowercase, but AppleTV accepts that)
    var remoteHeaders = remoteRes.headers;

    var contentType = remoteHeaders['content-type'];
    if (contentType && contentType != 'application/octet-stream') {
      source.mimeType = contentType;
    } else {
      util.puts('remote server returned bad content type: ' + contentType);
    }
    remoteHeaders['content-type'] = target.mimeType;

    res.writeHead(remoteRes.statusCode, remoteHeaders);

    // Pipe results
    remoteRes.pipe(res, {
      end: true
    });
  });
  remoteReq.on('error', function(e) {
    // TODO: prop back up?
    util.puts('error in remote request: ' + util.inspect(e));
    res.end('error');
  });
  remoteReq.end();
};

Content.prototype.put = function(req, res) {
  // TODO: put
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
  res.end();
};

Content.prototype.delete = function() {
  // TODO: delete
};

Content.prototype.status = function(req, callback) {
  callback({
    cached: this.cached_,
    seekable: this.seekable_,
    readyToPlay: this.readyToPlay_
  });
};

Content.prototype.info = function(req, callback) {
  callback(this.source.info);
};

Content.prototype.cache = function(req, callback) {
  callback({});
};
