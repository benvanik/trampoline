var child_process = require('child_process');
var util = require('util');

var DomJS = require('dom-js').DomJS;

exports.extractInfo = function(filename, callback) {
  var results = '';
  var mediainfo = child_process.spawn('mediainfo', [
    '--output=xml',
    filename
  ]);
  mediainfo.stdout.on('data', function(data) {
    results += data;
  });
  mediainfo.stderr.on('data', function(data) {
    console.log('mediainfo stderr: ' + data);
  });
  mediainfo.on('exit', function(code) {
    if (code == 0) {
      var domjs = new DomJS();
      domjs.parse(results, function(err, dom) {
        function getProperty(el, name) {
          for (var n = 0; n < el.children.length; n++) {
            var child = el.children[n];
            if (child.name == name) {
              return child.children[0].text;
            }
          }
          return null;
        };
        var info = {
          format: null,
          //duration: 0,
          videoTracks: [],
          audioTracks: []
        };
        for (var n = 0; n < dom.children.length; n++) {
          var fileEl = dom.children[n];
          if (fileEl.name == 'File') {
            for (var m = 0; m < fileEl.children.length; m++) {
              var trackEl = fileEl.children[m];
              if (trackEl.name == 'track') {
                switch (trackEl.attributes.type) {
                  case 'General':
                    // Format: 'Flash Video'
                    info.format = getProperty(trackEl, 'Format');
                    // Duration: '2mn 6s'
                    var duration = getProperty(trackEl, 'Duration');
                    // TODO: convert and store info.duration
                    break;
                  case 'Video':
                    var videoTrack = {
                      type: 'video',
                      // Format: AVC
                      format: getProperty(trackEl, 'Format'),
                      // Width: 640 pixels
                      width: parseInt(getProperty(trackEl, 'Width')
                          .replace(/ pixels/, '')),
                      // Height: 360 pixels
                      height: parseInt(getProperty(trackEl, 'Height')
                          .replace(/ pixels/, '')),
                      // Frame_rate: 29.970 fps
                      frameRate: parseFloat(
                          getProperty(trackEl, 'Frame_rate')
                          .replace(/ fps/, '')),
                      // Format_profile: Main@L3.0
                      profile: parseInt(
                          getProperty(trackEl, 'Format_profile')
                          .replace(/[^0-9]/g, '')),
                      // Format_settings__QPel: No
                      qpel: (getProperty(trackEl, 'Format_settings__QPel')
                          != 'No')
                    };
                    info.videoTracks.push(videoTrack);
                    break;
                  case 'Audio':
                    var audioTrack = {
                      // Format: AAC
                      format: getProperty(trackEl, 'Format')
                    };
                    info.audioTracks.push(audioTrack);
                    break;
                }
              }
            }
          }
        }
        callback(info);
      });
    } else {
      console.log('child process exited with code ' + code);
    }
  });
};
