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
		var Build = plus.android.importClass("android.os.Build");

		var TYPE = {
			"NONE": 0,
			"CILENT": 1,
			"SERVER": 2
		};

		var tttt = 0;

		var main = plus.android.runtimeMainActivity();
		if(Build.VERSION.SDK_INT >= 18) { //两种方法二选一
			var Context = plus.android.importClass("android.content.Context");
			bluetoothManager = main.getSystemService(Context.BLUETOOTH_SERVICE);
			plus.android.importClass(bluetoothManager);
			var BAdapter = bluetoothManager.getAdapter();
			app.util.log('蓝牙适配器:', BAdapter);
			plus.android.importClass(BAdapter);
		} else { //<18仅该方法
			var BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
			var BAdapter = BluetoothAdapter.getDefaultAdapter();
			app.util.log('蓝牙适配器:', BAdapter);
		}
		var Intent = plus.android.importClass("android.content.Intent");
		if(BAdapter == null || !BAdapter.isEnabled()) {
			//弹出对话框提示用户是后打开
			//var REQUEST_ENABLE_BT = 1;
			//var enableBtIntent = new Intent(BAdapter.ACTION_REQUEST_ENABLE);
			//main.startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);//startActivity(enableBtIntent);

			//不做提示，强行打开
			BAdapter.enable();
		}

		var lists = BAdapter.getBondedDevices();
		plus.android.importClass(lists);
		var len = lists.size();
		var iterator = lists.iterator();
		plus.android.importClass(iterator);
		while(iterator.hasNext()) {
			var d = iterator.next();
			plus.android.importClass(d);
			app.util.log(d.getName()+'=='+d.getAddress());
		}

		var IntentFilter = plus.android.importClass('android.content.IntentFilter');
		var BluetoothDevice = plus.android.importClass("android.bluetooth.BluetoothDevice");

		var filter = new IntentFilter();
		var bdevice = new BluetoothDevice();
		app.util.log('注册监听广播');
		filter.addAction(bdevice.ACTION_FOUND);
		filter.addAction(BAdapter.ACTION_DISCOVERY_STARTED);
		filter.addAction(BAdapter.ACTION_DISCOVERY_FINISHED);
		filter.addAction(BAdapter.ACTION_STATE_CHANGED);

		/**
		 * 绑定触发操作
		 */
		document.getElementById('searchDevices').addEventListener('tap', function(event) {
			app.util.log('触发搜索蓝牙操作');
			searchDevices();
		});
		document.getElementById('open').addEventListener('tap', function(event) {
			if(!BAdapter.isEnabled()) {
				app.util.log('触发启用蓝牙操作');
				BAdapter.enable();
			}
		});
		document.getElementById('accept').addEventListener('tap', function(event) {
			app.util.log('accept');
			this.innerHTML = '接收中';
			document.getElementById('send').innerHTML = '处于发送';
			tttt = TYPE.SERVER;
		});
		document.getElementById('send').addEventListener('tap', function(event) {
			app.util.log('send');
			this.innerHTML = '发送中';
			document.getElementById('accept').innerHTML = '处于接收';
			tttt = TYPE.CILENT;
		});
		document.getElementById('close').addEventListener('tap', function(event) {
			if(BAdapter.isEnabled()) {
				app.util.log('触发关闭蓝牙操作');
				BAdapter.disable();
			}
		});
		mui('.bluetooth-list').on('tap', 'li', function() {
			var mac = this.getAttribute('data-mac');
			var act = this.getAttribute('data-act');
			app.util.log(act);
			switch(act) {
				case 'createBond':
					{
						createBond(mac);
						break;
					}
				case 'serverTread':
					{
						serverTread(mac);
						break;
					}
				case 'cilentTread':
					{
						cilentTread(mac);
						break;
					}
				case 'print':
					{
						print(mac);
						break;
					}
			}
		})

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
							var vlist1 = document.getElementById('NoTMatch'); //注册容器用来显示未配对设备
							vlist1.innerHTML = ''; //清空容器
							var vlist2 = document.getElementById('Matched'); //注册容器用来显示未配对设备
							vlist2.innerHTML = ''; //清空容器

							BleDevice = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
							app.util.log('设备发现[' + "Name : " + BleDevice.getName() + " Address: " + BleDevice.getAddress() + ']');
							//判断是否配对
							if(BleDevice.getBondState() == bdevice.BOND_NONE) {
								return;
								app.util.log("未配对蓝牙设备：" + BleDevice.getName() + '    ' + BleDevice.getAddress());
								var li1 = document.createElement('li'); //注册
								li1.setAttribute('data-mac', BleDevice.getAddress());
								li1.setAttribute('data-act', 'createBond');
								var div = document.createElement('div');
								div.innerHTML = BleDevice.getName() + '    ' + BleDevice.getAddress();
								li1.appendChild(div);
								vlist1.appendChild(li1);

								//这里可更改为自动配对
							} else {
								app.util.log("已配对蓝牙设备：" + BleDevice.getName() + '    ' + BleDevice.getAddress());
								var li2 = document.createElement('li');
								li2.setAttribute('data-mac', BleDevice.getAddress());
								var tread = tttt == TYPE.CILENT ? 'cilentTread' : 'serverTread';
								li2.setAttribute('data-act', tread);
								li2.setAttribute('css', 'mui-table-view-cell');
								var div = document.createElement('div');
								div.innerHTML = BleDevice.getName() + '    ' + BleDevice.getAddress();
								li2.appendChild(div);
								vlist2.appendChild(li2);
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
							//main.unregisterReceiver(receiver); //取消监听
							button1.disabled = false;
							button1.innerText = '搜索设备';
							app.util.log('搜索设备完成');
							BAdapter.cancelDiscovery();
							break;
						}
				}

			}
		});
		main.registerReceiver(receiver, filter); //注册监听

		function searchDevices() {
			BAdapter.startDiscovery(); //开启搜索
		}

		function createBond(address) {
			//如果出搜索中，先关闭
			if(BAdapter.isDiscovering()) BAdapter.cancelDiscovery();
			var btDev = BAdapter.getRemoteDevice(address);
			plus.android.importClass(btDev);
			if(btDev.getBondState() == bdevice.BOND_NONE) {
				plus.android.invoke(btDev, 'createBond');
			} else if(btDev.getBondState() == bdevice.BOND_BONDED) {
				app.util.log('已配对');
				//连接设备
			}
		}

		function serverTread(address) {
			var BAdapter = null,
				BluetoothAdapter = null,
				uuid = null,
				main = null,
				bluetoothSocket = null;

			if(!address) {
				mui.toast('请选择蓝牙打印机');
				return;
			}
			app.util.log(address);
			main = plus.android.runtimeMainActivity();
			BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
			UUID = plus.android.importClass("java.util.UUID");
			uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
			BAdapter = BluetoothAdapter.getDefaultAdapter();

			app.util.log('等待客户端连接中....');
			var serverSocket = BAdapter.listenUsingRfcommWithServiceRecord('btspp', uuid);
			plus.android.importClass(serverSocket);
			mSocket = serverSocket.accept();
			app.util.log('客户端已经连接上！');

			plus.android.importClass(mSocket);

			var inputStream = mSocket.getInputStream();
			plus.android.importClass(inputStream);
			var BufferedReader = plus.android.importClass('java.io.BufferedReader');
			var InputStreamReader = plus.android.importClass('java.io.InputStreamReader');
			var e1 = plus.android.importClass('java.io.IOException');
			var ins = new BufferedReader(new InputStreamReader(inputStream));
			try {
				while(true) {
					var msg = ins.readLine();
					app.util.log(msg);
					document.getElementById('msg').innerHTML = msg;
					if(msg=="break"){
						break;
					}
				};
			} catch(e1) {
				//e1.printStackTrace();
			} finally {
				try {
					inputStream.close();
				} catch(e1) {
					//e1.printStackTrace();
				}
			}

			//var bytes = plus.android.invoke(string, 'getBytes', 'gbk');
		}

		function Bytes2Str(arr) {
			var str = "";
			for(var i = 0; i < arr.length; i++) {
				var tmp = String.fromCharCode(arr[i]);
				str += tmp;
			}
			return str;
		}

		function Str2Bytes(str) { // 因为datapacket发送接收的都是数据流，所以要转换为bytes数组，相当于java里的getBytes()
			var ch, st, re = [];
			for(var i = 0; i < str.length; i++) {
				ch = str.charCodeAt(i);
				st = [];
				do {
					st.push(ch & 0xFF);
					ch = ch >> 8;
				}
				while (ch);
				re = re.concat(st.reverse());
			}
			return re;
		}

		function cilentTread(address) {

			var device = null,
				BAdapter = null,
				BluetoothAdapter = null,
				uuid = null,
				main = null,
				bluetoothSocket = null;

			if(!address) {
				mui.toast('请选择蓝牙打印机');
				return;
			}
			app.util.log(address);
			main = plus.android.runtimeMainActivity();
			BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
			UUID = plus.android.importClass("java.util.UUID");
			uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
			BAdapter = BluetoothAdapter.getDefaultAdapter();
			device = BAdapter.getRemoteDevice(address);
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
				var bytes = plus.android.invoke(string, 'getBytes', 'utf-8');
				outputStream.write(bytes);
				outputStream.flush();
				device = null //这里关键
				bluetoothSocket.close(); //必须关闭蓝牙连接否则意外断开的话打印错误

			} else {
				app.util.log('设备未连接');
			}
		}

		function print(address) {
			var device = null,
				BAdapter = null,
				BluetoothAdapter = null,
				uuid = null,
				main = null,
				bluetoothSocket = null;

			if(!address) {
				mui.toast('请选择蓝牙打印机');
				return;
			}
			app.util.log(address);
			main = plus.android.runtimeMainActivity();
			BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
			UUID = plus.android.importClass("java.util.UUID");
			uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
			BAdapter = BluetoothAdapter.getDefaultAdapter();
			device = BAdapter.getRemoteDevice(address);
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