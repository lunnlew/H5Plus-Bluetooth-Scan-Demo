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
// Start the main app logic.
requirejs(['define/app', 'mui/mui.min', /*, 'define/bughd', 'define/bugtags'*/ ], function(app, mui) {

	mui.init({
		statusBarBackground: '#f7f7f7'
	});
	mui.plusReady(function() {
		app.util.log('require-worker');
	});
});