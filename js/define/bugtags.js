requirejs.config({
    baseUrl: '../js/lib',
    paths: {
        "app": '../app',
        "define": '../define',
        "jquery": "../lib/jquery",
        "mui": "../lib/mui"
    },
    shim: {
        "bugtags": {
            exports: "Bugtags",
            deps: ['mui/mui.min']
        }
    }
});
define(['bugtags', 'mui/mui.min'], function(Bugtags) {
    mui.plusReady(function() {
        window.Bugtags = Bugtags || {};
        new Bugtags('112b48d191e27f3e30b254776a67fcdc', '1', '2', '');
    });
});
