Trampoline -- AirPlay control service
====================================

Trampoline provides a node server that gives a RESTful API to AirPlay devices
on the local network via
[node-airplay](https://github.com/benvanik/node-airplay). The server can be used
by applications on the local machine or network to discover AirPlay devices and
control the playback of those devices with one API.

Eventually, Trampoline will provide transparent video serving (exposing
individual local files over HTTP to enable playback from AirPlay devices) and
transcoding (sourcing from local or remote video files and transcoding into a
format that Apple devices will accept).

## Quickstart

    npm install trampoline
    npm start trampoline

## Installation

With [npm](http://npmjs.org):

    npm install trampoline

From source:

    cd ~
    git clone https://benvanik@github.com/benvanik/trampoline.git
    npm link trampoline/

## Configuration

When using `npm start`, use `npm config` to change the launch options:

    npm config set trampoline:port 8090
    npm start trampoline

If launching directly via `trampoline`:

    trampoline --port=8090

## API

### Content API

NOTE: content status readyToPlay must be true before attempting playback!

Setup a new content serving request:

    POST /content/setup
        {
          source: {
            content: string,
            mimeType: string,     // 'video/webm'
            cookie: string,
            referer: string,
            auth: string          // user:password
          },
          target: {
            mimeType: string,     // 'video/mp4'
            resolution: number,   // 480, 720, 1080, undefined for original
            quality: number       // [0-1], undefined for don't care
          }
        }
    --> {
          id: string
        }

    GET /content/[id]
    --> [streaming content]

    PUT /content/[id]

    DELETE /content/[id]

    GET /content/[id]/status
    --> {
          cached: boolean,
          seekable: boolean,
          readyToPlay: boolean
        }

    POST /content/[id]/cache
        {}
    --> {}

### Device API

List all devices on the network (query occasionally):

    GET /device/list
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

Get the information of a specific device:

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

Get the playback status of a device:

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

Begin playback of the given content:

    POST /device/id/play
        {
          content: string,
          start: number
        }
    --> {}

Stop playback of the current content:

    POST /device/id/stop
        {}
    --> {}

Seek to the given position in the current content:

    POST /device/id/scrub
        {
          position: number
        }
    --> {}

Change the playback rate of the current content (0 = pause, 1 = resume):

    POST /device/id/rate
        {
          value: number
        }
    --> {}

Adjust the playback volume:

    POST /device/id/volume
        {
          value: number
        }
    --> {}

TODO: Post a photo for slideshow mode:

    POST /device/id/photo
        {
          content: string,
          transition: string
        }
    --> {}
