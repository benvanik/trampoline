var uuid = require('node-uuid');

var Content = require('./content').Content;

var ContentCache = function() {
  this.content_ = {};
};
exports.ContentCache = ContentCache;

ContentCache.prototype.create = function(source, target) {
  var contentId = uuid();
  var content = new Content(contentId, source, target);
  this.content_[content.id] = content;
  return content;
};

ContentCache.prototype.find = function(source, target) {
  for (var contentId in this.content_) {
    var content = this.content_[contentId];
    if (content.matches(source, target)) {
      return content;
    }
  }
  return null;
};

ContentCache.prototype.findOrCreate = function(source, target) {
  var content = this.find(source, target);
  if (!content) {
    content = this.create(source, target);
  }
  return content;
};

ContentCache.prototype.get = function(contentId) {
  return this.content_[contentId];
};
