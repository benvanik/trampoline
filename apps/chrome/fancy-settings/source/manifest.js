this.manifest = {
    "name": "Trampoline",
    "icon": "icon.png",
    "settings": [
        {
            "tab": i18n.get("general"),
            "group": i18n.get("devices"),
            "name": "detectDevices",
            "type": "checkbox",
            "label": i18n.get("detect devices")
        },
        {
            "tab": i18n.get("general"),
            "group": i18n.get("devices"),
            "name": "defaultDevice",
            "type": "radioButtons",
            "label": i18n.get("default device") + ":",
            "options": [
                ["a0", "A0"],
                ["a1", "A1"]
            ]
        },


        {
            "tab": i18n.get("content"),
            "group": i18n.get("discovery"),
            "name": "discoverNetworkContent",
            "type": "checkbox",
            "label": i18n.get("discover network content")
        },
        {
            "tab": i18n.get("content"),
            "group": i18n.get("discovery"),
            "name": "discoverCustomContent",
            "type": "checkbox",
            "label": i18n.get("discover script content")
        },


        {
            "tab": i18n.get("transcoding"),
            "group": i18n.get("features"),
            "name": "enableRemuxing",
            "type": "checkbox",
            "label": i18n.get("enable remuxing")
        },
        {
            "tab": i18n.get("transcoding"),
            "group": i18n.get("features"),
            "name": "enableTranscoding",
            "type": "checkbox",
            "label": i18n.get("enable transcoding")
        },
        {
            "tab": i18n.get("transcoding"),
            "group": i18n.get("features"),
            "name": "enableSubtitles",
            "type": "checkbox",
            "label": i18n.get("enable subtitles")
        },
        {
            "tab": i18n.get("transcoding"),
            "group": i18n.get("quality"),
            "name": "videoQuality",
            "type": "popupButton",
            "label": i18n.get("video quality"),
            "options": [
                ["default", "Leave as-is"],
                ["480", "480p"],
                ["720", "720p"],
                ["1080", "1080p"]
            ]
        },
        {
            "tab": i18n.get("transcoding"),
            "group": i18n.get("quality"),
            "name": "audioQuality",
            "type": "popupButton",
            "label": i18n.get("audio quality"),
            "options": [
                ["default", "Leave as-is"],
                ["low", "Low"],
                ["high", "High"]
            ]
        }
    ],
    "alignment": []
};
