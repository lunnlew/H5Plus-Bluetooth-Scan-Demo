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
		"define/bluetooth": {
			exports: "bluetooth"
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
requirejs(['define/app', 'mui/mui.min', 'define/bluetooth' /*, 'define/bughd', 'define/bugtags'*/ ], function(app, mui, bluetooth) {

	mui.init({
		statusBarBackground: '#f7f7f7'
	});
	mui.plusReady(function() {
		bluetooth.start();
		bluetooth.registerFilter();
		bluetooth.registerReceiver(function(bluetooth, intent) {
			switch(intent.getAction()) {
				case bluetooth.Badapter.ACTION_DISCOVERY_STARTED:
					{
						app.util.log('开始扫描蓝牙设备');
						break;
					}
				case bluetooth.Bdevice.ACTION_FOUND:
					{
						var device = intent.getParcelableExtra(bluetooth.BluetoothDeviceClass.EXTRA_DEVICE);
						bluetooth.addDevice(device);
						bluetooth.appendContent(device);
						break;
					}
				case bluetooth.Bdevice.ACTION_BOND_STATE_CHANGED:
					{
						app.util.log('设备配对状态改变');
						break;
					}
				case bluetooth.Badapter.ACTION_DISCOVERY_FINISHED:
					{
						app.util.log('搜索设备完成');
						bluetooth.stopSearch();
						//bluetooth.setContentList();
						break;
					}
			}
		});
		document.getElementById('open').addEventListener('tap', function(event) {
			if(!bluetooth.Badapter.isEnabled()) {
				app.util.log('触发启用蓝牙操作');
				bluetooth.Badapter.enable();
			}
		});
		document.getElementById('searchDevices').addEventListener('tap', function(event) {
			//如果出搜索中，先关闭
			if(bluetooth.Badapter.isDiscovering()) {
				app.util.log('关闭搜索');
				this.innerHTML = '搜索';
				bluetooth.stopSearch();
			} else {
				app.util.log('搜索蓝牙设备中');
				this.innerHTML = '搜索中';
				bluetooth.startSearch();
			}
		});
		mui('.bluetooth-list').on('tap', 'a', function(event) {
			app.util.log('tap act');
			switch(this.getAttribute('data-act')) {
				case "accept":
					{
						app.util.log('accept');
						this.innerText = '接收中';
						bluetooth.serverThread(function(data) {
							app.util.log(data);
							mui.toast('收到消息:'+data);
						});
						this.innerText = '接收';
					}
					break;
				case "send":
					{
						app.util.log('send');
						this.innerText = '发送中';
						bluetooth.cilentThread(this.getAttribute('data-mac'), function() {
							return document.getElementById('msg').value;
						});
						this.innerText = '发送';
					}
					break;
			}

		});
		document.getElementById('close').addEventListener('tap', function(event) {
			if(bluetooth.Badapter.isEnabled()) {
				app.util.log('触发关闭蓝牙操作');
				bluetooth.Badapter.disable();
			}
		});
	});
});