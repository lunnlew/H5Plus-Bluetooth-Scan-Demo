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
			exports: "app"
		},
		"mui/mui.min": {
			exports: "mui"
		},
		"mui/mui.enterfocus": {
			deps: ['mui/mui.min']
		}
	}
});

// Start the main app logic.
requirejs(['define/app', 'mui/mui.min', 'define/Thread', /*, 'define/bughd', 'define/bugtags'*/ ], function(app, mui, Thread) {

	mui.init({
		statusBarBackground: '#f7f7f7'
	});
	mui.plusReady(function() {

		if(typeof(Worker) !== "undefined") {
			app.util.log('worker init');
			var worker = new Worker("../js/app/sock_worker.js");
			worker.onmessage = function(event) {
				var data = JSON.parse(event.data);
				switch(data.code) {
					case 1:
						{
							app.util.log(data.msg);
							if(data.command) {
								//再次发送命令
								worker.postMessage(JSON.stringify({
									'command': data.command,
									'data': data.data,
									"code": null,
									"msg": null
								}));
							}

						}
						break;
					case 2:
						{
							app.util.log(data.data);
						}
						break;

				}
			};
			//建立服务
			worker.postMessage(JSON.stringify({
				'command': 1,
				'data': {
					"data": {
						"address": null
					}
				},
				'code': 0,
				'msg': null
			}));

		} else {
			app.util.log('Sorry! No Web Worker support..');
		}
	});
});