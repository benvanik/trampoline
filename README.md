


Service API:

  List all devices on the network (query occasionally)
  GET /device/
  --> {
        devices: [
          {
            id: string,
            name: string,
            deviceId: string,
            features: number,
            model: string,
            slideshowFeatures: [],
            supportedContentTypes: [string, ...]
          }, ...
        ]
      }

  Get the information of a specific device
  GET /device/id/
  --> {
        id: string,
        name: string,
        deviceId: string,
        features: number,
        model: string,
        slideshowFeatures: [],
        supportedContentTypes: [string, ...]
      }

  Get the playback status of a device
  GET /device/id/status
  --> {
        duration: number,
        position: number,
        rate: number,
        playbackBufferEmpty: boolean,
        playbackBufferFull: boolean,
        playbackLikelyToKeepUp: boolean,
        readyToPlay: boolean,
        loadedTimeRanges: [
          {
            start: number,
            duration: number
          }, ...
        ],
        seekableTimeRanges: [
          {
            start: number,
            duration: number
          }, ...
        ]
      }

  TODO: Authorize a device
  POST /device/id/authorize
      {}
  --> {}

  Begin playback of the given content
  POST /device/id/play
      {
        content: string,
        start: number
      }
  --> {}

  Stop playback of the current content
  POST /device/id/stop
      {}
  --> {}

  Seek to the given position in the current content
  POST /device/id/scrub
      {
        position: number
      }
  --> {}

  Reverse playback of the current content
  POST /device/id/reverse
      {}
  --> {}

  Change the playback rate of the current content (0 = pause, 1 = resume)
  POST /device/id/rate
      {
        value: number
      }
  --> {}

  Adjust the playback volume
  POST /device/id/volume
      {
        value: number
      }
  --> {}

  TODO: Post a photo for slideshow mode
  POST /device/id/photo
      {
        content: string,
        transition: string
      }
  --> {}





HTTP/1.1 200 OK
Date: Sat, 05 Nov 2011 23:20:41 GMT
Content-Type: text/x-apple-plist+xml
Content-Length: 820
X-Transmit-Date: 2011-11-05T23:20:41.911377Z

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>duration</key>
  <real>5555.0495000000001</real>
  <key>loadedTimeRanges</key>
  <array>
    <dict>
      <key>duration</key>
      <real>5555.0495000000001</real>
      <key>start</key>
      <real>0.0</real>
    </dict>
  </array>
  <key>playbackBufferEmpty</key>
  <true/>
  <key>playbackBufferFull</key>
  <false/>
  <key>playbackLikelyToKeepUp</key>
  <true/>
  <key>position</key>
  <real>4.6269989039999997</real>
  <key>rate</key>
  <real>1</real>
  <key>readyToPlay</key>
  <true/>
  <key>seekableTimeRanges</key>
  <array>
    <dict>
      <key>duration</key>
      <real>5555.0495000000001</real>
      <key>start</key>
      <real>0.0</real>
    </dict>
  </array>
</dict>
</plist>


HTTP/1.1 200 OK
Date: Sat, 05 Nov 2011 23:34:13 GMT
Content-Type: text/x-apple-plist+xml
Content-Length: 427

<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>deviceid</key>
  <string>xx:xx:xx:xx:xx:xx</string>
  <key>features</key>
  <integer>14839</integer>
  <key>model</key>
  <string>AppleTV2,1</string>
  <key>protovers</key>
  <string>1.0</string>
  <key>srcvers</key>
  <string>120.2</string>
</dict>
</plist>
