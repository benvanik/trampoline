var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');

var tempPath = (function() {
  var vars = ['TMPDIR', 'TMP', 'TEMP'];
  for (var n = 0; n < vars.length; n++) {
    var path = process.env[vars[n]];
    if (path) {
      return fs.realpathSync(path);
    }
  }
  return fs.realpathSync('/tmp');
})();

exports.generateName = function() {
  return path.join(tempPath, uuid());
};
