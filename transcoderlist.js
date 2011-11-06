var transcoderTypes = require('./transcoder').transcoderTypes;

var TranscoderList = function() {
  this.transcoderTypes_ = transcoderTypes.slice();
};
exports.TranscoderList = TranscoderList;

TranscoderList.prototype.find_ = function(sourceMimeType, targetMimeType) {
  for (var n = 0; n < this.transcoderTypes_.length; n++) {
    var transcoderType = this.transcoderTypes_[n];
    if (transcoderType.canTranscode(sourceMimeType, targetMimeType)) {
      return transcoderType;
    }
  }
  return null;
};

TranscoderList.prototype.createTranscoder = function(source, target) {
  var transcoderType = this.find_(source.mimeType, target.mimeType);
  if (!transcoderType) {
    return false;
  }
  var transcoder = new transcoderType(source, target);
  // TODO: verify?
  return transcoder;
};
