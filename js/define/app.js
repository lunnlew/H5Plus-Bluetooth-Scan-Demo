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
	(function($, owner, document, window) {
		window.CODE = {
			SUCCESS: 0
		};
		window.API_URL = 'http://192.168.0.101/';
		window.RESOURCE_URL = 'http://192.168.0.101/';
		window.API_URL = 'http://bsh.qwkcms.com/';
		window.RESOURCE_URL = 'http://bsh.qwkcms.com/';
		/**
		 *首页
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
		owner.createState = function(data, callback) {
			var state = owner.getState();
			util.log('token:' + data.data.token);
			state.token = data.data.token;
			state.user = data.data.user;
			owner.setState(state);
			return callback();
		};
		owner.storUserData = function(_data) {
			var data = owner.getUserData();
			data = _data || {};
			util.log(JSON.stringify(data));
			localStorage.setItem('$userdata', JSON.stringify(data));
		};
		owner.getUserData = function() {
			var stateText = localStorage.getItem('$userdata') || "{}";
			return JSON.parse(stateText);
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
		 * 获取本地是否安装客户端
		 **/
		owner.isInstalled = function(id) {
				if(id === 'qihoo' && mui.os.plus) {
					return true;
				}
				if(mui.os.android) {
					var main = plus.android.runtimeMainActivity();
					var packageManager = main.getPackageManager();
					var PackageManager = plus.android.importClass(packageManager)
					var packageName = {
						"qq": "com.tencent.mobileqq",
						"weixin": "com.tencent.mm",
						"sinaweibo": "com.sina.weibo"
					}
					try {
						return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
					} catch(e) {}
				} else {
					switch(id) {
						case "qq":
							var TencentOAuth = plus.ios.import("TencentOAuth");
							return TencentOAuth.iphoneQQInstalled();
						case "weixin":
							var WXApi = plus.ios.import("WXApi");
							return WXApi.isWXAppInstalled()
						case "sinaweibo":
							var SinaAPI = plus.ios.import("WeiboSDK");
							return SinaAPI.isWeiboAppInstalled()
						default:
							break;
					}
				}
			}
			//应用设置
		var setting = owner.setting = {};
		setting.save = function(settings) {
			settings = settings || {};
			localStorage.setItem('app$settings', JSON.stringify(settings));
		}
		setting.get = function() {
			var settingsText = localStorage.getItem('app$settings') || "{}";
			return JSON.parse(settingsText);
		}
		var view = owner.view = {};

		//工具函数
		var util = owner.util = {};

		util.showWaiting = function(txt, option) {
			// option = option || {
			//     //width: 64,
			//     //height: 64,
			//     //color:'#fff',
			//     //size:'14px',
			//     //textalign:'center',
			//     padding: '0px',
			//     //background: '#0A0',
			//     padlock: true,
			//     loading: {
			//         display: 'inline',
			//         icon: '../images/loading.png',
			//     }
			// };
			plus.nativeUI.showWaiting(txt, option);
		}
		util.closeWaiting = function() {
			plus.nativeUI.closeWaiting();
		}
		util.checkEmail = function(email) {
			email = email || '';
			return(email.length > 3 && email.indexOf('@') > -1);
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
		/**
		 * 请求 短信验证码
		 */
		util.sendCode = function(mobile, callback) {
			mui.ajax(API_URL + '/Api/Index/sendVerifyCode.json', {
				data: {
					mobile: mobile,
					pt: 'app'
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					if(data.code != CODE.SUCCESS) {
						return callback(data.msg);
					} else {
						return callback(data.msg);
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback('网络异常，发送失败!');
				}
			});
		};

		/**
		 * 手机存在性检查
		 */
		util.phoneVerify = function(mobile, callback) {
			mui.ajax(API_URL + '/Api/Index/phoneVerify', {
				data: {
					mobile: mobile,
					pt: 'app'
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.code, data.msg, data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback('网络异常!!');
				}
			});
		};

		util.log = function(message, args, code, module) {
			try {
				throw new Error();
			} catch(e) {
				var loc = e.stack.replace(/Error\n/).split(/\n/)[1].replace(/^\s+|\s+$/, "");
				console.log('Location:' + loc);
				console.log('[{0}][{1}]{2} {3} {4}'.format(module || 'app', (new Date()).format('MM-dd hh:mm:ss'), message || '', JSON.stringify(args) || '', code || 0));

			}
		}

		util.getParams = function(params) {
			var t = owner.getState();
			var data = jsonMerge(t, params, true);
			util.log('post data ', data);
			return data;
		}

		util.ajax = function(url, params) {
			mui.ajax(API_URL + url, params);
		}

		util.uploader = function(url, options, workerCB, completedCB) {
			var task = plus.uploader.createUpload(url, options, completedCB);
			workerCB(task);
			return task;
		}
		util.getGEOStatus = function() {
			var context = plus.android.importClass("android.content.Context");
			var locationManager = plus.android.importClass("android.location.LocationManager");
			var main = plus.android.runtimeMainActivity();
			var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
			return mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER);
		}

		var user = owner.user = {};

		/**
		 * 用户登录
		 **/
		user.login = function(loginInfo, callback) {
			callback = callback || $.noop;
			loginInfo = loginInfo || {};
			loginInfo.account = loginInfo.account || '';
			loginInfo.password = loginInfo.password || '';
			if(loginInfo.account.length < 5) {
				return callback('账号最短为 5 个字符');
			}
			util.log(loginInfo.account);
			if(loginInfo.password.length < 6) {
				return callback('密码最短为 6 个字符');
			}
			mui.ajax(API_URL + '/Api/Member/login.json', {
				data: {
					mobile: loginInfo.account,
					pwd: loginInfo.password
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					if(data.code != CODE.SUCCESS) {
						return callback(data.msg);
					} else {
						owner.storUserData(data.data);
						return owner.createState(data, callback);
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback('网络异常!!');
				}
			});
		};
		/**
		 * 新用户注册
		 **/
		user.reg = function(regInfo, callback) {
			callback = callback || $.noop;
			regInfo = regInfo || {};
			regInfo.account = regInfo.account || '';
			regInfo.password = regInfo.password || '';
			if(regInfo.account.length < 5) {
				return callback('用户名最短需要 5 个字符');
			}
			if(regInfo.password.length < 6) {
				return callback('密码最短需要 6 个字符');
			}
			mui.ajax(API_URL + '/Api/Member/reg.json', {
				data: {
					mobile: regInfo.account,
					pwd: regInfo.password,
					verifyCode: regInfo.verifyCode,
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					if(data.code != CODE.SUCCESS) {
						return callback(data.code, data.msg, data.data);
					} else {
						owner.storUserData(data.data);
						owner.createState(data, function() {});
						return callback(data.code, data.msg, data.data);
					}
				},
				error: function(xhr, type, errorThrown) {
					switch(type) {
						case 'timeout':
						default:
							return callback('网络异常!!');
					}
				}
			});
		};
		/**
		 * 用户密码找回
		 **/
		user.updatePass = function(Info, callback) {
			callback = callback || $.noop;
			Info = Info || {};
			Info.account = Info.account || '';
			Info.password = Info.password || '';
			if(Info.account.length < 5) {
				return callback('用户名最短需要 5 个字符');
			}
			if(Info.password.length < 6) {
				return callback('密码最短需要 6 个字符');
			}
			mui.ajax(API_URL + '/Api/Member/updatePass.json', {
				data: {
					mobile: Info.account,
					pwd: Info.password,
					verifyCode: Info.verifyCode,
				},
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					if(data.code != CODE.SUCCESS) {
						return callback(data);
					} else {
						return callback(data);
					}
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback('网络异常!!');
				}
			});
		};

		//轮播图
		var slider = owner.slider = {};
		slider.getlist = function(data, callback) {
			mui.ajax(API_URL + '/Api/Adv/lists', {
				data: util.getParams(data),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.code, data.msg, data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback(1, '网络异常!!');
				}
			});
		}

		//财务
		var fund = owner.fund = {};
		/**
		 * 提现
		 */
		fund.Withdrawal = function(data, callback) {
			mui.ajax(API_URL + '/Api/Withdrawal/actUpdate', {
				data: util.getParams(data),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.code, data.msg, data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback(1, '网络异常!!');
				}
			});
		};
		/**
		 * 默认银行卡
		 */
		fund.getDefaultBank = function(callback) {
			mui.ajax(API_URL + '/Api/Withdrawal/getDefaultBank', {
				data: util.getParams({}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback('网络异常!!');
				}
			});
		};
		/**
		 * 
		 */
		fund.getDefaultBank = function(callback) {
			mui.ajax(API_URL + '/Api/Member/getDefaultBank', {
				data: util.getParams({}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback('网络异常!!');
				}
			});
		};
		/**
		 * 银行卡
		 */
		fund.cardList = function(callback) {
			mui.ajax(API_URL + '/Api/Member/cardList', {
				data: util.getParams({}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback('网络异常!!');
				}
			});
		};

		/**
		 * 收益动态
		 */
		fund.lastCash = function(data, callback) {
			mui.ajax(API_URL + '/Api/Cash/last7Days', {
				data: util.getParams(data),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.code, data.msg, data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback(1, '网络异常!!');
				}
			});
		};
		/**
		 * 收益动态
		 */
		fund.lastRate = function(data, callback) {
			mui.ajax(API_URL + '/Api/Cash/lastRate', {
				data: util.getParams(data),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.code, data.msg, data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback(1, '网络异常!!');
				}
			});
		};

		fund.ul = '<ul class="mui-table-view app-table">{0}</ul>';
		fund.cell = '<li class="mui-table-view-cell" data-id="{0}">' +
			// '<div class="mui-slider-left mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
			'<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
			'<div class="mui-slider-handle"><a href="#"  data-title="{1}" data-id="{0}" data-type="{5}"' +
			'<div class="app-row">' +
			'<div class="app-body">' +
			'<div class="app-row"><p>{1}</p></div>' +
			'<div class="app-row"><p>{3}</p></div>' +
			'</div></h5></div></div></a></div>' +
			'</li>';
		fund.min = 0;
		fund.max = 0;
		fund.have = false;
		//下拉加载
		fund.pulldownRefresh = function(status) {
			var html = '<ul class="mui-table-view app-table">' +
				'<li class="mui-table-view-cell">' +
				'<div class="app-row">' +
				'<h5 class="app-uordertime">{2}<span class="app-ustate app-right app-error">{4}</span></h5></div>' +
				'</li>' +
				'<li class="mui-table-view-cell" data-id="{0}">' +
				// '<div class="mui-slider-left mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				// '<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				'<div class="mui-slider-handle"><a href="#"  data-title="{1}" data-id="{0}" data-type="{5}">' +
				'<div class="app-row">' +
				'<div class="app-body">' +
				'<div class="app-row"><p>{1}</p></div>' +
				'<div class="app-row"><p>{3}</p></div>' +
				'</div></h5></div></div></a></div>' +
				'</li></ul>';
			util.log('fund area', {
				max: fund.max,
				min: fund.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .history-list');
				//加载数据
				mui.ajax(API_URL + '/Api/Cash/lists.json', {
					data: util.getParams({
						status: status,
						oid: fund.max,
						type: 'new',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var s_shtml = '';
						var list = data.data;
						var ids = [fund.max, fund.min];
						if(list.length > 0) {
							fund.have = true;
							var d = new Date();
							for(var i = list.length - 1; i >= 0; i--) {
								d.setTime(list[i].create_time * 1000);
								var class_Str = 'class="mui-navigate-right"';
								s_shtml += html.format(list[i].id, list[i].day, list[i].trad_type, d.format('MM月dd日 hh:mm'), list[i].money, 2, class_Str);
							}
							list_obj.innerHTML = s_shtml;
							ids.push(list[i].id);
						} else {
							fund.have = false;
							list_obj.innerHTML = '<div class="mui-loader">暂无账单.</div>';
						}
						s_shtml = '';
						fund.max = Math.max.apply(null, ids);
						fund.min = Math.min.apply(null, ids);
						util.log('fund area', {
							max: fund.max,
							min: fund.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			}, 1500);
		};
		//上拉加载
		fund.pullupRefresh = function(status) {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(!fund.have); //参数为true代表没有更多数据了。
			var html = '<ul class="mui-table-view app-table">' +
				'<li class="mui-table-view-cell">' +
				'<div class="app-row">' +
				'<h5 class="app-uordertime">{2}<span class="app-ustate app-right app-error">{4}</span></h5></div>' +
				'</li>' +
				'<li class="mui-table-view-cell" data-id="{0}">' +
				// '<div class="mui-slider-left mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				// '<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				'<div class="mui-slider-handle"><a href="#"  data-title="{1}" data-id="{0}" data-type="{5}">' +
				'<div class="app-row">' +
				'<div class="app-body">' +
				'<div class="app-row"><p>{1}</p></div>' +
				'<div class="app-row"><p>{3}</p></div>' +
				'</div></h5></div></div></a></div>' +
				'</li></ul>';
			util.log('fund area', {
				max: fund.max,
				min: fund.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .history-list');
				//加载数据
				mui.ajax(API_URL + '/Api/Cash/lists.json', {
					data: util.getParams({
						status: status,
						oid: fund.min,
						type: 'old',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var list = data.data;
						var ids = [fund.min, fund.max];
						if(list.length > 0) {
							fund.have = true;
							var d = new Date();
							for(var i = 0; i <= list.length - 1; i++) {
								d.setTime(list[i].create_time * 1000);
								var ul = document.createElement('ul');
								var class_Str = 'class="mui-navigate-right"';
								ul.className = 'mui-table-view app-table';
								ul.innerHTML = html.format(list[i].id, list[i].day, list[i].trad_type, d.format('MM月dd日 hh:mm'), list[i].money, 2, class_Str);
								//下拉刷新，新纪录插到最前面；
								orderlist.appendChild(ul);
								ids.push(list[i].id);
							}
						} else {
							fund.have = false;
						}
						fund.max = Math.max.apply(null, ids);
						fund.min = Math.min.apply(null, ids);
						util.log('fund area', {
							max: fund.max,
							min: fund.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
			}, 1500);
		};
		/**
		 * 账单动态
		 */
		fund.listMoney = function(idSelecter, page, pageSize) {
			var html = '<ul class="mui-table-view app-table">' +
				'<li class="mui-table-view-cell">' +
				'<div class="app-row">' +
				'<h5 class="app-uordertime">{2}<span class="app-ustate app-right app-error">{4}</span></h5></div>' +
				'</li>' +
				'<li class="mui-table-view-cell" data-id="{0}">' +
				// '<div class="mui-slider-left mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				// '<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				'<div class="mui-slider-handle"><a href="#"  data-title="{1}" data-id="{0}" data-type="{5}">' +
				'<div class="app-row">' +
				'<div class="app-body">' +
				'<div class="app-row"><p>{1}</p></div>' +
				'<div class="app-row"><p>{3}</p></div>' +
				'</div></h5></div></div></a></div>' +
				'</li></ul>';
			var list_obj = document.getElementById(idSelecter);
			var s_shtml = '';
			//加载数据
			mui.ajax(API_URL + '/Api/Cash/lists', {
				data: app.util.getParams({
					page: page || 0,
					pageSize: pageSize || 10
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					var list = data.data;
					var ids = [];
					if(list.length > 0) {
						fund.have = true;
						var d = new Date();
						for(var i = 0; i <= list.length - 1; i++) {
							d.setTime(list[i].create_time * 1000);
							var class_Str = 'class="mui-navigate-right"';
							s_shtml += html.format(list[i].id, list[i].day, list[i].trad_type, d.format('MM月dd日 hh:mm'), list[i].money, 2, class_Str);
							ids.push(list[i].id);
						}
						list_obj.innerHTML = s_shtml;
					} else {
						fund.have = false;
						list_obj.innerHTML = '<div class="mui-loader">暂无账单.</div>';
					}
					s_shtml = '';
					util.log(JSON.stringify(ids));
					fund.max = Math.max.apply(null, ids);
					fund.min = Math.min.apply(null, ids);
					util.log('fund area', {
						max: fund.max,
						min: fund.min
					});
				},
				error: function(xhr, type, errorThrown) {
					util.log('error load message', {
						type: type
					});
				}
			});
		};
		fund.record = {};
		fund.record.min = 0;
		fund.record.max = 0;
		fund.record.have = false;
		fund.listRecordHome = function(idSelecter, page, pageSize) {
			var html = '<li class="mui-table-view-cell"><div class="app-row"><h5 class="app-uordertime">消费￥<span>{4}</span>  <small>{1}</small><span class="app-ustate app-right app-error">收益<span>{2}</span></span></h5></div></li>';
			var list_obj = document.getElementById(idSelecter);
			var s_shtml = '';
			//加载数据
			mui.ajax(API_URL + '/Api/Record/lists', {
				data: app.util.getParams({
					page: page || 0,
					pageSize: pageSize || 10,
					oid: fund.record.max,
					type: 'new',
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					var list = data.data;
					var ids = [];
					if(list.length > 0) {
						fund.record.have = true;
						var d = new Date();
						for(var i = list.length - 1; i >= 0; i--) {
							d.setTime(list[i].create_time * 1000);
							var class_Str = 'class="mui-navigate-right"';
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell';
							li.innerHTML = html.format(list[i].id, list[i].day, list[i].amount, d.format('MM月dd日 hh:mm'), list[i].money, 2, class_Str);
							list_obj.insertBefore(li, list_obj.firstChild);
							ids.push(list[i].id);
						}
						util.log(JSON.stringify(ids));
						fund.record.max = Math.max.apply(null, ids);
						fund.record.min = Math.min.apply(null, ids);
						util.log('fund area', {
							max: fund.record.max,
							min: fund.record.min
						});
						document.getElementById('more-msg').setAttribute('style','display: block;');
					} else {
						fund.record.have = false;
						//list_obj.innerHTML = '<div class="mui-loader">暂无账单.</div>';
					}
				},
				error: function(xhr, type, errorThrown) {
					util.log('error load message', {
						type: type
					});
				}
			});
		};
		/**
		 * 本月收益累计
		 */
		fund.month = function(data, callback) {
			mui.ajax(API_URL + '/Api/Cash/month', {
				data: util.getParams(data),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.code, data.msg, data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback(1, '网络异常!!');
				}
			});
		};

		//消息
		var message = owner.message = {};
		message.getCount = function(data, callback) {
			mui.ajax(API_URL + '/Api/Message/count', {
				data: util.getParams(data),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					return callback(data.code, data.msg, data.data);
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					return callback(1, '网络异常!!');
				}
			});
		};
		message.loadList = function(idSelecter, page, pageSize) {
			var html = '<ul class="mui-table-view app-table {8}">' +
				// '<li class="mui-table-view-cell">' +
				// '<div class="app-row">' +
				// '<h5 class="app-uordertime">{2}<span class="app-ustate app-right app-error">{4}</span></h5></div>' +
				// '</li>' +
				'<li class="mui-table-view-cell" data-id="{0}">' +
				// '<div class="mui-slider-left mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				'<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
				'<div class="mui-slider-handle"><a href="#" {7} data-title="{1}" data-id="{0}" data-type="{6}" data-url="{5}">' +
				'<div class="app-row">' +
				'<div class="app-body">' +
				'<div class="app-row"><p>{1}</p></div>' +
				'<div class="app-row"><p>{3}</p></div>' +
				'</div></h5></div></div></a></div>' +
				'</li></ul>';

			var list_obj = document.getElementById(idSelecter);
			var s_shtml = '';
			util.log('message area', {
				max: message.max,
				min: message.min
			});
			//加载数据
			mui.ajax(API_URL + '/Api/Message/lists.json', {
				data: util.getParams({
					page: page || 0,
					pageSize: pageSize || 10
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					var list = data.data;
					var ids = [];
					if(list.length > 0) {
						message.have = true;
						var d = new Date();
						for(var i = 0; i <= list.length - 1; i++) {
							d.setTime(list[i].sendTime * 1000);
							switch(list[i].type + '') {
								case '2':
									var class_Str = 'class="mui-navigate-right"';
									break;
								default:
									var class_Str = '';
									break;

							}
							s_shtml += html.format(list[i].id, list[i].title, d.format('MM月dd日 hh:mm'), list[i].content, list[i].is_read, list[i].content, list[i].type, class_Str, list[i].is_read ? ' msgreaded' : '');
							ids.push(list[i].id);
						}
						list_obj.innerHTML = s_shtml;
					} else {
						message.have = false;
						list_obj.innerHTML = '<div class="mui-loader">暂无消息.</div>';
					}
					s_shtml = '';
					util.log(JSON.stringify(ids));
					message.max = Math.max.apply(null, ids);
					message.min = Math.min.apply(null, ids);
					util.log('message area', {
						max: message.max,
						min: message.min
					});
				},
				error: function(xhr, type, errorThrown) {
					util.log('error load message', {
						type: type
					});
				}
			});
		};
		message.read = function(id) {
			mui.ajax(API_URL + '/Api/Message/read.json', {
				data: util.getParams({
					id: id || ''
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					//readed;
				},
				error: function(xhr, type, errorThrown) {
					util.log('error read message', {
						type: type
					});
				}
			});
		};
		message.delete = function(id) {
			mui.ajax(API_URL + '/Api/Message/delete.json', {
				data: util.getParams({
					id: id || ''
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					util.log('deleted message', data);
					//deleted;
				},
				error: function(xhr, type, errorThrown) {
					util.log('error delete message', {
						type: type
					});
				}
			});
		};
		message.ul = '<ul class="mui-table-view app-table">{0}</ul>';
		message.cell = '<li class="mui-table-view-cell" data-id="{0}">' +
			// '<div class="mui-slider-left mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
			'<div class="mui-slider-right mui-disabled"><a class="mui-btn mui-btn-red">删除</a></div>' +
			'<div class="mui-slider-handle"><a href="#" {7} data-title="{1}" data-id="{0}" data-type="{6}" data-url="{5}">' +
			'<div class="app-row">' +
			'<div class="app-body">' +
			'<div class="app-row"><p>{1}</p></div>' +
			'<div class="app-row"><p>{3}</p></div>' +
			'</div></h5></div></div></a></div>' +
			'</li>';
		message.min = 0;
		message.max = 0;
		message.have = false;
		//下拉加载
		message.pulldownRefresh = function(status) {
			var html = message.cell;
			util.log('message area', {
				max: message.max,
				min: message.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .message-list');
				//加载数据
				mui.ajax(API_URL + '/Api/Message/lists.json', {
					data: util.getParams({
						status: status,
						oid: message.max,
						type: 'new',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var s_shtml = "";
						var list = data.data;
						var ids = [message.min, message.max];
						if(list.length > 0) {
							message.have = true;
							var d = new Date();
							for(var i = list.length - 1; i >= 0; i--) {
								var ul = document.createElement('ul');
								d.setTime(list[i].sendTime * 1000);
								switch(list[i].type + '') {
									case '2':
										var class_Str = 'class="mui-navigate-right"';
										break;
									default:
										var class_Str = '';
										break;

								}
								ul.className = 'mui-table-view app-table';
								ul.innerHTML = html.format(list[i].id, list[i].title, d.format('MM月dd日 hh:mm'), list[i].content, list[i].is_read, list[i].content, list[i].type, class_Str, list[i].is_read ? ' msgreaded' : '');

								orderlist.insertBefore(ul, orderlist.firstChild);
								ids.push(list[i].id);
							}
						} else {
							message.have = false;
						}
						message.max = Math.max.apply(null, ids);
						message.min = Math.min.apply(null, ids);
						util.log('message area', {
							max: message.max,
							min: message.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			}, 1500);
		};
		//上拉加载
		message.pullupRefresh = function(status) {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(!message.have); //参数为true代表没有更多数据了。
			var html = message.cell;
			util.log('message area', {
				max: message.max,
				min: message.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .message-list');
				//加载数据
				mui.ajax(API_URL + '/Api/Message/lists.json', {
					data: util.getParams({
						status: status,
						oid: message.min,
						type: 'old',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var list = data.data;
						var ids = [message.min, message.max];
						if(list.length > 0) {
							message.have = true;
							var d = new Date();
							for(var i = 0; i <= list.length - 1; i++) {
								d.setTime(list[i].sendTime * 1000);
								var ul = document.createElement('ul');
								switch(list[i].type + '') {
									case '2':
										var class_Str = 'class="mui-navigate-right"';
										break;
									default:
										var class_Str = '';
										break;

								}
								ul.className = 'mui-table-view app-table';
								ul.innerHTML = html.format(list[i].id, list[i].title, d.format('MM月dd日 hh:mm'), list[i].content, list[i].is_read, list[i].content, list[i].type, class_Str, list[i].is_read ? ' msgreaded' : '');
								//下拉刷新，新纪录插到最前面；
								orderlist.appendChild(ul);
								ids.push(list[i].id);
							}
						} else {
							message.have = false;
						}
						message.max = Math.max.apply(null, ids);
						message.min = Math.min.apply(null, ids);
						util.log('message area', {
							max: message.max,
							min: message.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
			}, 1500);
		};
		// message.loadDetail = function(id,cntSelecter) {
		//     var html = '<ul class="mui-table-view app-table">'+
		//         '<li class="mui-table-view-cell">'+
		//         '<div class="app-row">'+
		//         '<h5 class="app-uordertime">{2}<span class="app-ustate app-right app-error">{4}</span></h5></div>'+
		//         '</li><li class="mui-table-view-cell">'+
		//         '<a href="#" class="mui-navigate-right" data-title="{1}" data-id="{0}" data-type="{6}" data-args="{5}">'+
		//         '<div class="app-row">'+
		//         '<div class="app-body">'+
		//         '<div class="app-row"><p>{1}</p></div>'+
		//         '<div class="app-row"><p>{3}</p></div>'+
		//         '</div></h5></div></div></a>'+
		//         '</li></ul>';
		//
		//     var cnt_obj = document.getElementById(cntSelecter);
		//     var s_shtml = '';
		//     //加载数据
		//     mui.ajax(API_URL + '/staff/v1/msg.read', {
		//         data: util.getParams({
		//             id: id || ''
		//         }),
		//         dataType: 'json', //服务器返回json格式数据
		//         type: 'post', //HTTP请求类型
		//         timeout: 10000, //超时时间设置为10秒；
		//         success: function(data) {
		//             var data = data.data;
		//             var d = new Date();
		//             d.setTime(data.sendTime * 1000);
		//             s_shtml += html.format(data.id, data.title, d.format('MM月dd日 hh:mm'), data.content, data.status, data.args, data.type);
		//             cnt_obj.innerHTML = s_shtml;
		//         },
		//         error: function(xhr, type, errorThrown) {
		//             //异常处理；
		//             util.log(type);
		//         }
		//     });
		// };
		//消息
		var record = owner.record = {};
		record.loadList = function(idSelecter, page, pageSize) {
			var html = '<ul class="mui-table-view app-table" id="record-list-ul"><li class="mui-table-view-cell"><div class="app-row">' +
				'<h5 class="app-uordertime">消费￥<span>{4}</span>  <small>{1}</small><span class="app-ustate app-right app-error">收益<span>{2}</span></span></h5></div></li></ul>';

			var list_obj = document.getElementById(idSelecter);
			var s_shtml = '';
			util.log('record area', {
				max: record.max,
				min: record.min
			});
			//加载数据
			mui.ajax(API_URL + '/Api/Record/lists.json', {
				data: util.getParams({
					page: page || 0,
					pageSize: pageSize || 10
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					var list = data.data;
					var ids = [];
					if(list.length > 0) {
						record.have = true;
						var d = new Date();
						for(var i = 0; i <= list.length - 1; i++) {
							d.setTime(list[i].sendTime * 1000);
							switch(list[i].type + '') {
								case '2':
									var class_Str = 'class="mui-navigate-right"';
									break;
								default:
									var class_Str = '';
									break;

							}
							s_shtml += html.format(list[i].id, list[i].day, list[i].amount, d.format('MM月dd日 hh:mm'), list[i].money, 2, class_Str);
							ids.push(list[i].id);
						}
						list_obj.innerHTML = s_shtml;
					} else {
						record.have = false;
						list_obj.innerHTML = '<div class="mui-loader">暂无消息.</div>';
					}
					s_shtml = '';
					util.log(JSON.stringify(ids));
					record.max = Math.max.apply(null, ids);
					record.min = Math.min.apply(null, ids);
					util.log('record area', {
						max: record.max,
						min: record.min
					});
				},
				error: function(xhr, type, errorThrown) {
					util.log('error load record', {
						type: type
					});
				}
			});
		};
		record.ul = '<ul class="mui-table-view app-table">{0}</ul>';
		record.cell = '<li class="mui-table-view-cell"><div class="app-row"><h5 class="app-uordertime">消费￥<span>{4}</span>  <small>{1}</small><span class="app-ustate app-right app-error">积分<span>{2}</span></span></h5></div></li>';
		record.min = 0;
		record.max = 0;
		record.have = false;
		//下拉加载
		record.pulldownRefresh = function(status) {
			var html = record.cell;
			util.log('record area', {
				max: record.max,
				min: record.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .record-list');
				//加载数据
				mui.ajax(API_URL + '/Api/Record/lists.json', {
					data: util.getParams({
						status: status,
						oid: record.max,
						type: 'new',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var s_shtml = "";
						var list = data.data;
						var ids = [record.min, record.max];
						if(list.length > 0) {
							record.have = true;
							var d = new Date();
							for(var i = list.length - 1; i >= 0; i--) {
								var ul = document.createElement('ul');
								d.setTime(list[i].sendTime * 1000);
								switch(list[i].type + '') {
									case '2':
										var class_Str = 'class="mui-navigate-right"';
										break;
									default:
										var class_Str = '';
										break;

								}
								ul.className = 'mui-table-view app-table';
								ul.innerHTML = html.format(list[i].id, list[i].day, list[i].amount, d.format('MM月dd日 hh:mm'), list[i].money, 2, class_Str);
								orderlist.insertBefore(ul, orderlist.firstChild);
								ids.push(list[i].id);
							}
						} else {
							record.have = false;
						}
						record.max = Math.max.apply(null, ids);
						record.min = Math.min.apply(null, ids);
						util.log('record area', {
							max: record.max,
							min: record.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			}, 1500);
		};
		//上拉加载
		record.pullupRefresh = function(status) {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(!record.have); //参数为true代表没有更多数据了。
			var html = record.cell;
			util.log('record area', {
				max: record.max,
				min: record.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .record-list');
				//加载数据
				mui.ajax(API_URL + '/Api/Record/lists.json', {
					data: util.getParams({
						status: status,
						oid: record.min,
						type: 'old',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var list = data.data;
						var ids = [record.min, record.max];
						if(list.length > 0) {
							record.have = true;
							var d = new Date();
							for(var i = 0; i <= list.length - 1; i++) {
								d.setTime(list[i].sendTime * 1000);
								var ul = document.createElement('ul');
								switch(list[i].type + '') {
									case '2':
										var class_Str = 'class="mui-navigate-right"';
										break;
									default:
										var class_Str = '';
										break;

								}
								ul.className = 'mui-table-view app-table';
								ul.innerHTML = html.format(list[i].id, list[i].day, list[i].amount, d.format('MM月dd日 hh:mm'), list[i].money, 2, class_Str);
								//下拉刷新，新纪录插到最前面；
								orderlist.appendChild(ul);
								ids.push(list[i].id);
							}
						} else {
							record.have = false;
						}
						record.max = Math.max.apply(null, ids);
						record.min = Math.min.apply(null, ids);
						util.log('record area', {
							max: record.max,
							min: record.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
			}, 1500);
		};
		//消息
		var article = owner.article = {};
		article.loadList = function(idSelecter, page, pageSize) {
			var html = '<ul class="mui-table-view app-table {8}">' +
				// '<li class="mui-table-view-cell">' +
				// '<div class="app-row">' +
				// '<h5 class="app-uordertime">{2}<span class="app-ustate app-right app-error">{4}</span></h5></div>' +
				// '</li>' +
				'<li class="mui-table-view-cell" data-id="{0}">' +
				'<div class="mui-slider-handle"><a href="#" {6} data-title="{1}" data-id="{0}" data-type="{4}" data-url="{5}">' +
				'<div class="app-row">' +
				'<div class="app-body">' +
				'<div class="app-row article-title"><p>{1}</p></div>' +
				'<div class="app-row article-descrip"><p>{3}</p></div>' +
				'</div></h5></div></div></a></div>' +
				'</li></ul>';

			var list_obj = document.getElementById(idSelecter);
			var s_shtml = '';
			util.log('article area', {
				max: article.max,
				min: article.min
			});
			//加载数据
			mui.ajax(API_URL + '/Api/article/lists.json', {
				data: util.getParams({
					page: page || 0,
					pageSize: pageSize || 10
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					var list = data.data;
					var ids = [];
					if(list.length > 0) {
						article.have = true;
						var d = new Date();
						for(var i = 0; i <= list.length - 1; i++) {
							d.setTime(list[i].create_time * 1000);
							switch(list[i].type + '') {
								case '2':
									var class_Str = 'class="mui-navigate-right"';
									break;
								default:
									var class_Str = '';
									break;

							}
							s_shtml += html.format(list[i].id, list[i].title, d.format('MM月dd日 hh:mm'), list[i].descrip, list[i].type, list[i].url, class_Str);
							ids.push(list[i].id);
						}
						list_obj.innerHTML = s_shtml;
					} else {
						article.have = false;
						list_obj.innerHTML = '<div class="mui-loader">暂无消息.</div>';
					}
					s_shtml = '';
					util.log(JSON.stringify(ids));
					article.max = Math.max.apply(null, ids);
					article.min = Math.min.apply(null, ids);
					util.log('article area', {
						max: article.max,
						min: article.min
					});
				},
				error: function(xhr, type, errorThrown) {
					util.log('error load article', {
						type: type
					});
				}
			});
		};
		article.ul = '<ul class="mui-table-view app-table">{0}</ul>';
		article.cell = '<li class="mui-table-view-cell" data-id="{0}">' +
			'<div class="mui-slider-handle"><a href="#" {6} data-title="{1}" data-id="{0}" data-type="{4}" data-url="{5}">' +
			'<div class="app-row">' +
			'<div class="app-body">' +
			'<div class="app-row article-title"><p>{1}</p></div>' +
			'<div class="app-row article-descrip"><p>{3}</p></div>' +
			'</div></h5></div></div></a></div>' +
			'</li>';
		article.min = 0;
		article.max = 0;
		article.have = false;
		//下拉加载
		article.pulldownRefresh = function(status) {
			var html = '<ul class="mui-table-view app-table {8}">' +
				// '<li class="mui-table-view-cell">' +
				// '<div class="app-row">' +
				// '<h5 class="app-uordertime">{2}<span class="app-ustate app-right app-error">{4}</span></h5></div>' +
				// '</li>' +
				'<li class="mui-table-view-cell" data-id="{0}">' +
				'<div class="mui-slider-handle"><a href="#" {6} data-title="{1}" data-id="{0}" data-type="{4}" data-url="{5}">' +
				'<div class="app-row">' +
				'<div class="app-body">' +
				'<div class="app-row article-title"><p>{1}</p></div>' +
				'<div class="app-row article-descrip"><p>{3}</p></div>' +
				'</div></h5></div></div></a></div>' +
				'</li></ul>';
			util.log('article area', {
				max: article.max,
				min: article.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .article-list');
				//加载数据
				mui.ajax(API_URL + '/Api/article/lists.json', {
					data: util.getParams({
						status: status,
						oid: article.max,
						type: 'new',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var s_shtml = "";
						var list = data.data;
						var ids = [article.min, article.max];
						if(list.length > 0) {
							article.have = true;
							var d = new Date();
							for(var i = list.length - 1; i >= 0; i--) {
								var ul = document.createElement('ul');
								d.setTime(list[i].create_time * 1000);
								switch(list[i].type + '') {
									case '2':
										var class_Str = 'class="mui-navigate-right"';
										break;
									default:
										var class_Str = '';
										break;

								}
								ul.className = 'mui-table-view app-table';
								ul.innerHTML = html.format(list[i].id, list[i].title, d.format('MM月dd日 hh:mm'), list[i].descrip, list[i].type, list[i].url, class_Str);
								//下拉刷新，新纪录插到最前面；
								orderlist.insertBefore(ul, orderlist.firstChild);
								ids.push(list[i].id);
							}
						} else {
							article.have = false;
						}
						s_shtml = '';
						article.max = Math.max.apply(null, ids);
						article.min = Math.min.apply(null, ids);
						util.log('article area', {
							max: article.max,
							min: article.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
				mui('#pullrefresh').pullRefresh().endPulldownToRefresh(); //refresh completed
			}, 1500);
		};
		//上拉加载
		article.pullupRefresh = function(status) {
			mui('#pullrefresh').pullRefresh().endPullupToRefresh(!article.have); //参数为true代表没有更多数据了。
			var html = article.cell;
			util.log('article area', {
				max: article.max,
				min: article.min
			});
			setTimeout(function() {
				var orderlist = document.body.querySelector('#pullrefresh .article-list');
				//加载数据
				mui.ajax(API_URL + '/Api/article/lists.json', {
					data: util.getParams({
						status: status,
						oid: article.min,
						type: 'old',
						time: new Date().getTime()
					}),
					dataType: 'json', //服务器返回json格式数据
					type: 'post', //HTTP请求类型
					timeout: 10000, //超时时间设置为10秒；
					success: function(data) {
						var list = data.data;
						var ids = [article.min, article.max];
						if(list.length > 0) {
							article.have = true;
							var d = new Date();
							for(var i = 0; i <= list.length - 1; i++) {
								d.setTime(list[i].create_time * 1000);
								var ul = document.createElement('ul');
								switch(list[i].type + '') {
									case '2':
										var class_Str = 'class="mui-navigate-right"';
										break;
									default:
										var class_Str = '';
										break;

								}
								ul.className = 'mui-table-view app-table';
								ul.innerHTML = html.format(list[i].id, list[i].title, d.format('MM月dd日 hh:mm'), list[i].descrip, list[i].type, list[i].url, class_Str);
								orderlist.appendChild(ul);
								ids.push(list[i].id);
							}
						} else {
							article.have = false;
						}
						article.max = Math.max.apply(null, ids);
						article.min = Math.min.apply(null, ids);
						util.log('article area', {
							max: article.max,
							min: article.min
						});
						//plus.nativeUI.closeWaiting();
					},
					error: function(xhr, type, errorThrown) {
						//异常处理；
						util.log(type);
						//plus.nativeUI.closeWaiting();
					}
				});
			}, 1500);
		};
		article.loadDetail = function(id, cntSelecter) {
			var html = '<ul class="mui-table-view">' +
				'<li class="mui-table-view-cell">' +
				'<div class="app-row">' +
				'<div class="app-body article">' +
				'<div class="app-row"><p>{3}</p></div>' +
				'</div></h5></div></div>' +
				'</li></ul>';
			var cnt_obj = document.getElementById(cntSelecter);
			var s_shtml = '';
			//加载数据
			mui.ajax(API_URL + '/Api/Article/detail', {
				data: util.getParams({
					id: id || ''
				}),
				dataType: 'json', //服务器返回json格式数据
				type: 'post', //HTTP请求类型
				timeout: 10000, //超时时间设置为10秒；
				success: function(data) {
					var data = data.data;
					var d = new Date();
					d.setTime(data.create_time * 1000);
					cnt_obj.innerHTML = html.format(data.id, data.title, d.format('MM月dd日 hh:mm'), data.content);
					//cnt_obj.innerHTML = data.content;
				},
				error: function(xhr, type, errorThrown) {
					//异常处理；
					util.log(type);
				}
			});
		};
		//====能力扩展====
		String.prototype.format = function() {
			if(arguments.length == 0) return this;
			for(var s = this, i = 0; i < arguments.length; i++)　 s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
			return s;
		};
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

		function jsonMerge(des, src, override) {
			if(src instanceof Array) {
				for(var i = 0, len = src.length; i < len; i++)
					jsonMerge(des, src[i], override);
			}
			for(var i in src) {
				if(override || !(i in des)) {
					des[i] = src[i];
				}
			}
			return des;
		}

	}(mui, window.app = {}, document, window));

	return window.app;
});