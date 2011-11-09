var fs = require('fs');
var http = require('http');
var url = require('url');
var util = require('util');

var transcoderList = require('./transcoderlist').transcoderList;

var Content = function(id, source, target) {
  this.id = id;
  this.source = {
    content: source.content,
    mimeType: source.mimeType || undefined,
    cookie: source.cookie || undefined,
    referer: source.referer || undefined,
    auth: source.auth || undefined
  };
  this.target = {
    mimeType: target.mimeType || undefined,
    resolution: target.resolution || undefined,
    quality: target.quality || undefined
  };

  this.cached_ = false;
  this.seekable_ = false;
  this.readyToPlay_ = false;
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

    var start = 0;
    var end = stats.size;
    if (req.headers['range']) {
      var range = req.headers['range'].match(/([0-9]+)-([0-9]+)/);
      start = parseInt(range[1]);
      end = parseInt(range[2]);
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

  // Some headers added to make the request seem a bit more genuine
  var headers = {
    'Accept': '*/*',
    'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
    'Accept-Encoding': 'identity;q=1, *;q=0',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) ' +
        'AppleWebKit/535.8 (KHTML, like Gecko) Chrome/17.0.930.0 Safari/535.8'
  };

  // Copy user headers
  if (source.referer) {
    headers['Referer'] = source.referer;
  }
  if (source.cookie) {
    headers['Cookie'] = source.cookie;
  }

  // Add specific request headers that we want to pass through
  if (req.headers['range']) {
    headers['Range'] = req.headers['range'];
  }

  var remoteReq = http.request({
    hostname: sourceUrl.hostname,
    port: sourceUrl.port,
    method: req.method,
    path: sourceUrl.path,
    headers: headers,
    auth: source.auth,
  }, function(remoteRes) {
    // Write response headers - write out exactly what we get from the remote
    // server (note that they will be all lowercase, but AppleTV accepts that)
    var remoteHeaders = remoteRes.headers;

    var contentType = remoteHeaders['content-type'];
    if (contentType && contentType != 'application/octet-stream') {
      source.mimeType = contentType;
    } else {
      util.puts('remote server returned bad content type: ' + contentType);
    }
    var transcoder = transcoderList.createTranscoder(source, target);
    remoteHeaders['content-type'] = 'video/mp4';

    res.writeHead(remoteRes.statusCode, remoteHeaders);

    // Pipe results
    remoteRes.pipe(res, {
      end: true
    });
  });
  remoteReq.on('error', function(e) {
    // TODO: prop back up?
    util.puts('error in remote request: ' + util.inspect(e));
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

Content.prototype.cache = function(req, callback) {
  callback({});
};
