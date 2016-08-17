requirejs.config({
    baseUrl: '../js/lib',
    paths: {
        "app": '../app',
        "define": '../define',
        "jquery": "../lib/jquery",
        "mui": "../lib/mui"
    },
    shim: {
        "bughd": {
            exports: "bughd"
        }
    }
});
define(['bughd'], function(bughd) {
    window.bughd = bughd || function() {};
    bughd("create", {
        key: "0a8e036a2cbf364df39be817ea7b2b23"
    });
    bughd("website", {
        APIBASE: "HTML5+",
        APPVERSION: "1.2.0",
        ENV: "PRO"
    });
});
