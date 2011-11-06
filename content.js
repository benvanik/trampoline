var Content = function(id, source, target) {
  this.id = id;
  this.source = source;
  this.target = target;

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
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  });
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
