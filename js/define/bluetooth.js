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

define(['define/app', 'mui/mui.min', 'mui/mui.enterfocus' /*, 'define/bughd', 'define/bugtags'*/ ], function(app, mui) {

	//start define
	(function($, owner, document, window) {
		var MainActivity = plus.android.runtimeMainActivity();
		var Build = plus.android.importClass("android.os.Build");

		//蓝牙适配器
		if(Build.VERSION.SDK_INT >= 18) { //两种方法二选一
			var Context = plus.android.importClass("android.content.Context");
			bluetoothManager = MainActivity.getSystemService(Context.BLUETOOTH_SERVICE);
			plus.android.importClass(bluetoothManager);
			owner.Badapter = bluetoothManager.getAdapter();
			app.util.log('蓝牙适配器:', owner.Badapter);
			plus.android.importClass(owner.Badapter);
		} else { //<18仅该方法
			var BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
			owner.Badapter = BluetoothAdapter.getDefaultAdapter();
			app.util.log('蓝牙适配器:', owner.Badapter);
		}

		//蓝牙设备
		owner.BluetoothDeviceClass = plus.android.importClass("android.bluetooth.BluetoothDevice");
		owner.Bdevice = new owner.BluetoothDeviceClass();

		//开始使用蓝牙
		owner.start = function() {
			app.util.log('开启蓝牙');
			if(owner.Badapter == null || !owner.Badapter.isEnabled()) {
				//var Intent = plus.android.importClass("android.content.Intent");
				//弹出对话框提示用户是后打开
				//var REQUEST_ENABLE_BT = 1;
				//var enableBtIntent = new Intent(BAdapter.ACTION_REQUEST_ENABLE);
				//MainActivity.startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);//startActivity(enableBtIntent);

				//不做提示，强行打开
				owner.Badapter.enable();
			}
		};
		var IntentFilter = plus.android.importClass('android.content.IntentFilter');
		var filter = new IntentFilter();
		owner.registerFilter = function(callback) {
			app.util.log('注册监听广播');
			filter.addAction(owner.Bdevice.ACTION_FOUND);
			filter.addAction(owner.Badapter.ACTION_DISCOVERY_STARTED);
			filter.addAction(owner.Badapter.ACTION_DISCOVERY_FINISHED);
			filter.addAction(owner.Badapter.ACTION_STATE_CHANGED);
		}

		owner.registerReceiver = function(callback) {
			var receiver;
			receiver = plus.android.implements('io.dcloud.android.content.BroadcastReceiver', {
				onReceive: function(context, intent) { //实现onReceiver回调函数
					plus.android.importClass(intent); //通过intent实例引入intent类，方便以后的‘.’操作
					callback(owner, intent);
				}
			});
			MainActivity.registerReceiver(receiver, filter); //注册监听
		}

		owner.BdeviceList = new Array();
		owner.addDevice = function(Bdevice) {
			app.util.log('发现蓝牙设备蓝牙设备：' + Bdevice.getName() + '    ' + Bdevice.getAddress());
			owner.BdeviceList.push(Bdevice);
		}
		owner.startSearch = function() {
			owner.Badapter.startDiscovery(); //开启搜索
		}
		owner.stopSearch = function() {
			owner.Badapter.cancelDiscovery(); //取消搜索
		}
		var UUID = plus.android.importClass("java.util.UUID");
		owner.uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
		owner.serverSocket = bluetooth.Badapter.listenUsingRfcommWithServiceRecord('btspp', owner.uuid);
		plus.android.importClass(owner.serverSocket);
		owner.mSocket = null;

		var BufferedReader = plus.android.importClass('java.io.BufferedReader');
		var InputStreamReader = plus.android.importClass('java.io.InputStreamReader');
		owner.serverThread = function(callback) {
			//if(owner.mSocket == null) {
			app.util.log('等待客户端连接中....');
			owner.mSocket = owner.serverSocket.accept();
			//}
			app.util.log('客户端已经连接上！');
			plus.android.importClass(owner.mSocket);
			var inputStream = owner.mSocket.getInputStream();
			plus.android.importClass(inputStream);
			var ins = new BufferedReader(new InputStreamReader(inputStream));
			try {
				//while(true) {
				callback(ins.readLine());
				//};
			} catch(e1) {
				//e1.printStackTrace();
			} finally {
				try {
					app.util.log('close');
					inputStream.close();
				} catch(e1) {
					//e1.printStackTrace();
				}
			}
			//var bytes = plus.android.invoke(string, 'getBytes', 'gbk');
		}
		var cdevice = null;
		owner.bluetoothSocket = null;
		owner.cilentThread = function(address, callback) {
			if(!address) {
				mui.toast('请选择蓝牙打印机');
				return;
			}
			app.util.log(address);
			cdevice = owner.Badapter.getRemoteDevice(address);
			plus.android.importClass(cdevice);
			owner.bluetoothSocket = cdevice.createInsecureRfcommSocketToServiceRecord(owner.uuid);
			plus.android.importClass(owner.bluetoothSocket);

			if(!owner.bluetoothSocket.isConnected()) {
				app.util.log('检测到设备未连接，尝试连接....');
				owner.bluetoothSocket.connect();
			}

			if(owner.bluetoothSocket.isConnected()) {
				app.util.log('设备已连接');
				var outputStream = owner.bluetoothSocket.getOutputStream();
				plus.android.importClass(outputStream);
				var string = callback() + "\r\n";
				var bytes = plus.android.invoke(string, 'getBytes', 'utf-8');
				outputStream.write(bytes);
				outputStream.flush();
				cdevice = null //这里关键
				owner.bluetoothSocket.close(); //必须关闭蓝牙连接否则意外断开的话打印错误
				app.util.log('设备已关闭');

			} else {
				app.util.log('设备未连接');
			}
		}

		owner.createBond = function(address, callback) {
			//如果出搜索中，先关闭
			if(owner.Badapter.isDiscovering()) owner.Badapter.cancelDiscovery();
			var btDev = owner.BAdapter.getRemoteDevice(address);
			plus.android.importClass(btDev);
			if(btDev.getBondState() == owner.bdevice.BOND_NONE) {
				plus.android.invoke(btDev, 'createBond');
			} else if(btDev.getBondState() == owner.bdevice.BOND_BONDED) {
				app.util.log('已配对');
			}
		}

		var vlist1 = document.getElementById('NoTMatch'); //注册容器用来显示未配对设备
		var vlist2 = document.getElementById('Matched'); //注册容器用来显示未配对设备

		var l = '<div class="app-row">' +
			'<h5>{0}<span class="app-right">{1}</span></h5></div>' +
			'</li><li class="mui-table-view-cell">' +
			'<div class="app-row app-right" id="act">' +
			'<a type="button" data-act="accept" class="mui-btn mui-btn-primary mui-btn-outlined button-map" data-mac="{1}">接收</a>' +
			'<a type="button" data-act="send" class="mui-btn mui-btn-success mui-btn-outlined button-call" data-mac="{1}">发送</a>' +
			'</div>';
		owner.setContentList = function() {
			vlist2.innerHTML = ''; //清空容器
			vlist1.innerHTML = ''; //清空容器

			for(var i = 0; i < owner.BdeviceList.length; i++) {
				//判断是否配对
				if(owner.BdeviceList[i].getBondState() == owner.Bdevice.BOND_NONE) {
					app.util.log("未配对蓝牙设备：" + owner.BdeviceList[i].getName() + '    ' + owner.BdeviceList[i].getAddress());
					var li1 = document.createElement('li'); //注册
					li1.setAttribute('data-mac', owner.BdeviceList[i].getAddress());
					li1.setAttribute('data-act', 'createBond');
					li1.innerHTML = l.format(owner.BdeviceList[i].getName(), owner.BdeviceList[i].getAddress());
					vlist1.appendChild(li1);
					//这里可更改为自动配对
				} else {
					app.util.log("已配对蓝牙设备：" + owner.BdeviceList[i].getName() + '    ' + owner.BdeviceList[i].getAddress());
					var li2 = document.createElement('li');
					li2.setAttribute('css', 'mui-table-view-cell');
					li2.innerHTML = l.format(owner.BdeviceList[i].getName(), owner.BdeviceList[i].getAddress());
					vlist2.appendChild(li2);
				}
			}
		}

		owner.appendContent = function(Bdevice) {
			//判断是否配对
			if(Bdevice.getBondState() == owner.Bdevice.BOND_NONE) {
				app.util.log("未配对蓝牙设备：" + Bdevice.getName() + '    ' + Bdevice.getAddress());
				var li1 = document.createElement('li'); //注册
				li1.setAttribute('data-mac', Bdevice.getAddress());
				li1.setAttribute('data-act', 'createBond');
				li1.innerHTML = l.format(Bdevice.getName(), Bdevice.getAddress());
				vlist1.appendChild(li1);
				//这里可更改为自动配对
			} else {
				app.util.log("已配对蓝牙设备：" + Bdevice.getName() + '    ' + Bdevice.getAddress());
				var li2 = document.createElement('li');
				li2.setAttribute('css', 'mui-table-view-cell');
				li2.innerHTML = l.format(Bdevice.getName(), Bdevice.getAddress());
				vlist2.appendChild(li2);
			}
		}

	}(mui, bluetooth = {}, document, window));
	//end define

	return bluetooth;
});