requirejs.config({
	baseUrl: '../js/lib',
	paths: {
		"app": '../app',
		"define": '../define',
		"jquery": "../lib/jquery",
		"mui": "../lib/mui"
	},
	shim: {
		"define/app": {
			exports: "app",
			deps: ['mui/mui.min']
		},
		"mui/mui.min": {
			exports: "mui"
		},
		"mui/mui.enterfocus": {
			deps: ['mui/mui.min']
		},
		"mui/mui.view": {
			deps: ['mui/mui.min']
		},
		"mui/mui.locker": {
			deps: ['mui/mui.min']
		}
	}
});

define(['mui/mui.min', /*, 'define/bughd', 'define/bugtags'*/ ], function(mui, StringBuffer) {

	//start define
	(function($, owner, document, window) {
	}(mui, window.Thread = {}, document, window));
	//end define

	return window.Thread;
});