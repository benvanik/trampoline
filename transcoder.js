var events = require('events');
var util = require('util');

var Transcoder = function(source, target) {
  this.source = source;
  this.target = target;
};
util.inherits(Transcoder, events.EventEmitter);

var NullTranscoder = function(source, target) {
  Transcoder.call(this, source, target);
};
util.inherits(NullTranscoder, Transcoder);

NullTranscoder.canTranscode = function(sourceMimeType, targetMimeType) {
  // Identity
  // if (sourceMimeType == targetMimeType) {
  //   return true;
  // }
  return false;
};

// Order is highest to lowest priority
exports.transcoderTypes = [
  NullTranscoder
];
