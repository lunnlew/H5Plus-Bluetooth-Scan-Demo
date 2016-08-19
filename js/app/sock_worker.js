var isBreak = false;

onmessage = function(event) {
	var data = JSON.parse(event.data);
	var mSocket = null;

	switch(data.command) {
		//建立服务
		case 1:
			{

				var device = null,
					BAdapter = null,
					BluetoothAdapter = null,
					uuid = null,
					main = null,
					bluetoothSocket = null,
					serverSocket = null;

				postMessage(JSON.stringify({
					"code": 1,
					'msg': '收到建立服务命令',
					"data": null,
					"command": null
				}));

				if(!data.data.address) {
					postMessage(JSON.stringify({
						"code": 1,
						'msg': 'MAC地址缺失',
						"data": null,
						"command": null
					}));
					return;
				}
				main = plus.android.runtimeMainActivity();
				BluetoothAdapter = plus.android.importClass("android.bluetooth.BluetoothAdapter");
				UUID = plus.android.importClass("java.util.UUID");
				uuid = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
				BAdapter = BluetoothAdapter.getDefaultAdapter();

				postMessage(JSON.stringify({
					"code": 1,
					'msg': '等待客户端连接中',
					"data": null,
					"command": null
				}));

				serverSocket = BAdapter.listenUsingRfcommWithServiceRecord('btspp', uuid);
				plus.android.importClass(serverSocket);
				mSocket = serverSocket.accept();

				postMessage(JSON.stringify({
					"code": 1,
					'msg': '客户端已经连接上',
					"data": null,
					"command": 2
				}));

			}
			break;
			//接收数据
		case 2:
			{
				postMessage(JSON.stringify({
					"code": 1,
					'msg': '收到接收数据命令',
					"data": null,
					"command": null
				}));

				if(!mSocket) {
					postMessage(JSON.stringify({
						"code": 1,
						'msg': '还没有建立数据连接',
						"data": null,
						"command": null
					}));
					return;
				}

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
						postMessage(JSON.stringify({
							"code": 2,
							'msg': null,
							"data": msg,
							"command": null
						}));
						if(isBreak) {
							postMessage(JSON.stringify({
								"code": 1,
								'msg': '停止接收数据',
								"data": null,
								"command": null
							}));
							break;
						}
					};
					isBreak = false;
				} catch(e1) {
					//e1.printStackTrace();
				} finally {
					try {
						inputStream.close();
					} catch(e1) {
						//e1.printStackTrace();
					}
				}

			}
			break;
		case 3:
			{
				postMessage(JSON.stringify({
					"code": 1,
					'msg': '收到停止接收数据命令',
					"data": null
				}));
				isBreak = true;
			}
			break;
		default:
			break;
	}
}