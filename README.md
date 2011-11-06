Trampoline -- AirPlay control service
====================================

Trampoline provides a node server that gives a RESTful API to AirPlay devices
on the local network via
[node-airplay](https://github.com/benvanik/node-airplay). The server can be used
by applications on the local machine or network to discover AirPlay devices and
control the playback of those devices with one API.

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

    npm config set trampoline:api_port 8090
    npm config set trampoline:http_port 8091
    npm start trampoline

If launching directly via `trampoline`:

    trampoline --api_port=8090 --http_port=8091

## API

### Service REST API

List all devices on the network (query occasionally):

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

TODO: Authorize a device:

    POST /device/id/authorize
        {}
    --> {}

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

Reverse playback of the current content:

    POST /device/id/reverse
        {}
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
