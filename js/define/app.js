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

define(['mui/mui.min', 'mui/mui.enterfocus' /*, 'define/bughd', 'define/bugtags'*/ ], function(mui) {

	//start define
	(function($, owner, document, window) {
		//options
		owner.options = {};
		owner.api_url = 'http://192.168.0.108/';
		
		/**
		 * 页面跳转
		 * @param {Object} url
		 * @param {Object} id
		 * @param {Object} cnew
		 * @param {Object} callback
		 */
		owner.toView = function(url, id, cnew, callback) {
			var view = mui.openWindow({
				id: id || url,
				url: url || id,
				show: {
					aniShow: 'pop-in'
				},
				waiting: {
					autoShow: false
				},
				createNew: cnew || false
			});
			if(callback)
				return callback(view);
		};

		//创建用户状态
		owner.createState = function(data) {
			var state = owner.getState();
			return owner.setState(util.jsonMerge(state, data));
		};
		/**
		 * 获取当前状态
		 **/
		owner.getState = function() {
			var stateText = localStorage.getItem('$state') || "{}";
			return JSON.parse(stateText);
		};
		/**
		 * 设置当前状态
		 **/
		owner.setState = function(state) {
			state = state || {};
			localStorage.setItem('$state', JSON.stringify(state));
		};

		/**
		 * AJAX
		 **/
		owner.Ajax = function(url, option) {
			util.log('Ajax Request Data', {
				option: option
			});
			mui.ajax(url, util.jsonMerge({
				data: owner.getState(),
				dataType: 'json',
				type: 'post',
				timeout: 10000,
				success: function(data) {
					mui.toast(data.msg);
				},
				error: function(xhr, type, errorThrown) {
					util.log('error load message', xhr);
				}
			}, option, true));
		};
		//应用设置
		var setting = owner.setting = {};
		setting.save = function(settings) {
			settings = settings || {};
			localStorage.setItem('app$settings', JSON.stringify(settings));
		};
		setting.get = function() {
			var settingsText = localStorage.getItem('app$settings') || "{}";
			return JSON.parse(settingsText);
		};
		//工具函数
		var util = owner.util = {};
		//日志打印
		util.log = function(message, args, code, module) {
			try {
				throw new Error();
			} catch(e) {
				var loc = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
				console.log('Location:' + loc);
				console.log('[{0}][{1}]{2} {3} {4}'.format(module || 'app', (new Date()).format('MM-dd hh:mm:ss'), message || '', JSON.stringify(args) || '', code || 0));

			}
		};
		util.checkUpdate = function() {
			var app = {};
			plus.runtime.getProperty(plus.runtime.appid, function(inf) {
				app.version = inf.version;
			});
			var server = "http://www.dcloud.io/check/update"; //获取升级描述文件服务器地址
			mui.getJSON(server, {
				"appid": plus.runtime.appid,
				"version": app.version,
				//"imei": plus.device.imei
			}, function(data) {
				if(data.status) {
					util.log('update type:' + data.type);
					// data.url="http://demo.dcloud.net.cn/helloh5/update/HelloH5.wgtu";
					// data.type =1;
					// data.note = '1.修正更新';
					// data.title = '资源更新';
					plus.ui.confirm(data.note, function(btn) {
						if(0 == btn.index) {
							switch(data.type) {
								case 3:
									util.updateByApp(data.url);
									break;
								case 2:
									util.updateBywgt(data.url);
									break;
								case 1:
								default:
									util.updateBywgtu(data.url);
									break;
							}
						}
					}, data.title, ["立即更新", "取　　消"]);
				} else {
					mui.toast('佰商汇已是最新版本~')
				}
			});
		};
		/**
		 *整体更新
		 */
		util.updateByApp = function(url) {

		};
		/**
		 *资源整体更新
		 */
		util.updateBywgt = function(url) {

		};
		/**
		 *资源差量更新
		 */
		util.updateBywgtu = function(url) {
			plus.nativeUI.showWaiting("升级中...");
			var dtask = plus.downloader.createDownload(url, {
				filename: "_doc/update/"
			}, function(d, status) {
				util.log(status);
				if(status == 200) {
					util.log("下载wgt成功:" + d.filename);
					plus.runtime.install(d.filename, {
						force: true
					}, function() {
						plus.nativeUI.closeWaiting();
						util.log("安装wgt文件成功！");
						plus.nativeUI.alert("更新完成，立即重启！", function() {
							plus.runtime.restart();
						});
					}, function(e) {
						plus.nativeUI.closeWaiting();
						util.log("安装wgt文件失败[" + e.code + "]：" + e.message);
					});
				} else {
					plus.nativeUI.closeWaiting();
					util.log("下载wgt失败！");
				}
			});
			dtask.addEventListener('statechanged', function(d, status) {
				util.log("statechanged: " + d.state);
			});
			dtask.start();

		};
		//JSON对象合并
		util.jsonMerge = function(des, src, override) {
			if(src instanceof Array) {
				for(var i = 0, len = src.length; i < len; i++)
					util.jsonMerge(des, src[i], override);
			}
			for(var i in src) {
				if(override || !(i in des)) {
					des[i] = src[i];
				}
			}
			return des;
		};

		//字符串格式化
		String.prototype.format = function() {
			if(arguments.length == 0) return this;
			for(var s = this, i = 0; i < arguments.length; i++)　 s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
			return s;
		};

		//日期格式化
		Date.prototype.format = function(format) {
			var o = {
				"M+": this.getMonth() + 1,
				// month
				"d+": this.getDate(),
				// day
				"h+": this.getHours(),
				// hour
				"m+": this.getMinutes(),
				// minute
				"s+": this.getSeconds(),
				// second
				"q+": Math.floor((this.getMonth() + 3) / 3),
				// quarter
				"S": this.getMilliseconds()
					// millisecond
			};
			if(/(y+)/.test(format) || /(Y+)/.test(format)) {
				format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
			}
			for(var k in o) {
				if(new RegExp("(" + k + ")").test(format)) {
					format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
				}
			}
			return format;
		};
	}(mui, window.app = {}, document, window));
	//end define

	return window.app;
});