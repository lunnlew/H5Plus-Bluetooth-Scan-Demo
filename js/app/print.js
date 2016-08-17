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
requirejs(['define/app', 'mui/mui.min' /*, 'define/bughd', 'define/bugtags'*/ ], function(app, mui) {

	mui.init({
		statusBarBackground: '#f7f7f7'
	});
	mui.plusReady(function() {

		/**
		 * 导入支持库
		 */
		app.util.log('导入支持库');
		var main = plus.android.runtimeMainActivity();
		var IntentFilter = plus.android.importClass('android.content.IntentFilter');
		var BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
		var BluetoothDevice = plus.android.importClass("android.bluetooth.BluetoothDevice");
		var BAdapter = BluetoothAdapter.getDefaultAdapter();
		app.util.log('蓝牙适配器:', BAdapter);

		/**
		 * 绑定触发操作
		 */
		document.getElementById('searchDevices').addEventListener('tap', function(event) {
			app.util.log('触发搜索蓝牙操作');
			searchDevices('a');
		});
		document.getElementById('open').addEventListener('tap', function(event) {
			if(!BAdapter.isEnabled()) {
				app.util.log('触发启用蓝牙操作');
				BAdapter.enable();
			}
		});
		document.getElementById('close').addEventListener('tap', function(event) {
			if(BAdapter.isEnabled()) {
				app.util.log('触发关闭蓝牙操作');
				BAdapter.disable();
			}
		});

		function searchDevices(address) {
			/**
			 * 开启蓝牙设备
			 */
			app.util.log("启动蓝牙开关");
			if(!BAdapter.isEnabled()) {
				BAdapter.enable(); //启动蓝牙
			} else {
				//BAdapter.disable();
			}

			var filter = new IntentFilter();
			var bdevice = new BluetoothDevice();
			app.util.log('注册监听广播');
			filter.addAction(bdevice.ACTION_FOUND);
			filter.addAction(BAdapter.ACTION_DISCOVERY_STARTED);
			filter.addAction(BAdapter.ACTION_DISCOVERY_FINISHED);
			filter.addAction(BAdapter.ACTION_STATE_CHANGED);

			/**
			 * 注册监听事件
			 */
			app.util.log('注册监听事件');
			var button1 = document.getElementById('searchDevices');
			var receiver;
			receiver = plus.android.implements('io.dcloud.android.content.BroadcastReceiver', {
				onReceive: function(context, intent) { //实现onReceiver回调函数
					plus.android.importClass(intent); //通过intent实例引入intent类，方便以后的‘.’操作
					switch(intent.getAction()) {
						//case 'android.bluetooth.adapter.action.REQUEST_ENABLE': //BAdapter.ACTION_REQUEST_ENABLE:
						//	{
						//		app.util.log('请求开启蓝牙');
						//		break;
						//	}
						//case 'android.bluetooth.adapter.action.STATE_CHANGED': //BAdapter.ACTION_STATE_CHANGED:
						//	{
						//		app.util.log('蓝牙开关状态变化');
						//		break;
						//	}
						case 'android.bluetooth.adapter.action.DISCOVERY_STARTED': //BAdapter.ACTION_DISCOVERY_STARTED:
							{
								app.util.log('开始扫描蓝牙设备');
								button1.disabled = true;
								button1.innerText = '正在搜索请稍候';
								//查询扫描
								//页面扫描(需要BLUETOOTH权限)
								break;
							}
						case 'android.bluetooth.device.action.FOUND': //bdevice.ACTION_FOUND:
							{
								var on = null;
								var un = null;
								var vlist1 = document.getElementById('NoTMatch'); //注册容器用来显示未配对设备
								vlist1.innerHTML = ''; //清空容器
								var vlist2 = document.getElementById('Matched'); //注册容器用来显示未配对设备
								vlist2.innerHTML = ''; //清空容器

								BleDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
								app.util.log('设备发现[' + "Name : " + BleDevice.getName() + " Address: " + BleDevice.getAddress() + ']');
								//判断是否配对
								if(BleDevice.getBondState() == bdevice.BOND_NONE) {
									app.util.log("未配对蓝牙设备：" + BleDevice.getName() + '    ' + BleDevice.getAddress());
									//参数如果跟取得的mac地址一样就配对
									if(address == BleDevice.getAddress()) {
										if(BleDevice.createBond()) { //配对命令.createBond()
											app.util.log("配对成功");
											var li2 = document.createElement('li'); //注册
											li2.setAttribute('id', BleDevice.getAddress()); //打印机mac地址
											li2.setAttribute('onclick', 'print(id)'); //注册click点击列表进行打印
											li2.innerText = BleDevice.getName();
											vlist2.appendChild(li2);
										}

									} else {
										if(BleDevice.getName() != on) { //判断防止重复添加
											var li1 = document.createElement('li'); //注册
											li1.setAttribute('id', BleDevice.getAddress()); //打印机mac地址
											li1.setAttribute('onclick', 'searchDevices(id)'); //注册click点击列表进行配对
											on = BleDevice.getName();
											li1.innerText = on;
											vlist1.appendChild(li1);

										}

									}
								} else {
									if(BleDevice.getName() != un) { //判断防止重复添加
										app.util.log("已配对蓝牙设备：" + BleDevice.getName() + '    ' + BleDevice.getAddress());
										var li2 = document.createElement('li'); //注册
										li2.setAttribute('id', BleDevice.getAddress()); //打印机mac地址
										li2.setAttribute('onclick', 'print(id)'); //注册click点击列表进行打印
										un = BleDevice.getName();
										li2.innerText = un;
										vlist2.appendChild(li2);
									}
								}
								break;
							}
						case 'android.bluetooth.device.action.BOND_STATE_CHANGED': //bdevice.ACTION_BOND_STATE_CHANGED:
							{
								app.util.log('设备配对状态改变');
								break;
							}
						case 'android.bluetooth.adapter.action.DISCOVERY_FINISHED': //BAdapter.ACTION_DISCOVERY_FINISHED:
							{
								main.unregisterReceiver(receiver); //取消监听
								button1.disabled = false;
								button1.innerText = '搜索设备';
								app.util.log('搜索设备完成');
								break;
							}
					}

				}
			});

			main.registerReceiver(receiver, filter); //注册监听
			BAdapter.startDiscovery(); //开启搜索
		}

		function print(mac_address) {
			var device = null,
				BAdapter = null,
				BluetoothAdapter = null,
				uuid = null,
				main = null,
				bluetoothSocket = null;

			if(!mac_address) {
				mui.toast('请选择蓝牙打印机');
				return;
			}

			main = plus.android.runtimeMainActivity();
			BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
			UUID = plus.android.importClass("java.util.UUID");
			uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
			BAdapter = BluetoothAdapter.getDefaultAdapter();
			device = BAdapter.getRemoteDevice(mac_address);
			plus.android.importClass(device);
			bluetoothSocket = device.createInsecureRfcommSocketToServiceRecord(uuid);
			plus.android.importClass(bluetoothSocket);

			if(!bluetoothSocket.isConnected()) {
				app.util.log('检测到设备未连接，尝试连接....');
				bluetoothSocket.connect();
			}

			if(bluetoothSocket.isConnected()) {
				app.util.log('设备已连接');
				var outputStream = bluetoothSocket.getOutputStream();
				plus.android.importClass(outputStream);
				var string = "打印测试\r\n";
				var bytes = plus.android.invoke(string, 'getBytes', 'gbk');
				outputStream.write(bytes);
				outputStream.flush();
				device = null //这里关键
				bluetoothSocket.close(); //必须关闭蓝牙连接否则意外断开的话打印错误

			} else {
				app.util.log('设备未连接');
			}

		}
	});
});