var events = require('events');
var util = require('util');

var Transcoder = function(source, target) {
  this.source = source;
  this.target = target;
};
util.inherits(Transcoder, events.EventEmitter);
exports.Transcoder = Transcoder;

Transcoder.prototype.xx = function() {
  //
};
