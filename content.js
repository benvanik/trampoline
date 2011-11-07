var fs = require('fs');
var url = require('url');
var util = require('util');

var transcoderList = require('./transcoderlist').transcoderList;

var Content = function(id, source, target) {
  this.id = id;
  this.source = {
    content: source.content,
    mimeType: source.mimeType || undefined
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
  // Attempt to create a transcoder - may be null
  var transcoder = transcoderList.createTranscoder(this.source, this.target);

  var sourceUrl = url.parse(this.source.content);
  switch (sourceUrl.protocol) {
    case 'file:':
      if (transcoder) {
        this.transcodingHttpGet(req, res, sourceUrl, transcoder);
      } else {
        this.straightFileGet(req, res, sourceUrl);
      }
      return;
    case 'http:':
    case 'https:':
      if (transcoder) {
        this.transcodingHttpGet(req, res, sourceUrl, transcoder);
      } else {
        this.straightHttpGet(req, res, sourceUrl);
      }
      return;
    default:
      res.writeHead(415, 'Unsupported Media Type');
      res.end();
      return;
  }
};

Content.prototype.straightFileGet = function(req, res, sourceUrl) {
  var filename = decodeURI(sourceUrl.pathname);
  fs.stat(filename, function(err, stats) {
    if (err) {
      res.writeHead(404, 'Not Found');
      res.end();
      return;
    }

    // TODO: proper content type
    var mimeType = 'application/octet-stream';

    var mtime = Date.parse(stats.mtime);
    var etag = JSON.stringify([stats.ino, stats.size, mtime].join('-'));
    var headers = {
      'Cache-Control': 'max-age=' + (60 * 60 * 24 * 7),
      'Date': new(Date)().toUTCString(),
      'Last-Modified': new(Date)(stats.mtime).toUTCString(),
      'Etag': etag,
      'Content-Type': mimeType,
      'Accept-Ranges': 'bytes'
    };

    if (req.headers['if-none-match'] == etag ||
        Date.parse(req.headers['if-modified-since']) >= mtime) {
      headers['Content-Length'] = stats.size;
      res.writeHead(304, headers);
      res.end();
      return;
    } else if (req.method == 'HEAD') {
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
      headers['Content-Length'] = end - start;
      if (start != 0 && end != stats.size) {
        headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' +
            stats.size;
        res.writeHead(206, headers);
      } else {
        res.writeHead(200, headers);
      }
    } else {
      headers['Content-Length'] = stats.size;
      res.writeHead(200, headers);
    }
    fs.createReadStream(filename, {
      flags: 'r',
      mode: 0666,
      bufferSize: 64 * 1024
    }).pipe(res, {
      end: true
    });
    return;
  });
};

Content.prototype.straightHttpGet = function(req, res, sourceUrl) {
  // proxy
};

Content.prototype.transcodingFileGet = function(req, res, sourceUrl,
    transcoder) {
  res.writeHead(501, 'Not Implemented');
  res.end();
};

Content.prototype.transcodingHttpGet = function(req, res, sourceUrl,
    transcoder) {
  res.writeHead(501, 'Not Implemented');
  res.end();
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
