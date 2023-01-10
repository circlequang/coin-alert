const axios = require('axios');
var Push = require( 'pushover-notifications' )

const PERIOD = 1800;	// đơn vị là giây, vd 1800s = 30p
const PER_ALRT = 0.01;
const PUSHOVER_USER = 'uobpbh3ksdsuwks46rirpr341i4rwk';	
const PUSHOVER_TOKEN = 'akxp92epvfppidmr7hrnuq69g9fmbm';
const PUSHOVER_DEVICE = 'redmi8'

let _pairList = [
	'btcusdt',
	'bnbusdt',
	'ethusdt',
	'adausdt',
	'daiusdt',
	'solusdt',
	'nearusdt',
	'rousdt',
	'lunausdt',
	'atomusdt',
	'maticusdt',
	'ltcusdt',			
	'dogeusdt',
	'xprusdt',
	'linkusdt',
	'dotusdt',
	'shibusdt'
];

var pair = _pairList[0];			//0 là bitcoin, 1 là bnb, 2 là Eth . . . muốn coin này thì điền Số thứ tự trên _pairList vào, STT này bắt đầu từ 0

var last_price = 0;		// giá lần trước
var curr_price = 0;		// giá hiện tại


main();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


async function main() {
	while(true) {		// Tạo vòng lập vô tận, bạn có thể dừng bằng cách ấn CTR + C
		await run();
		await sleep(1*60*1000);		// do đơn bị tính của hàm sleep là mili-giây, ta để tiến trình cứ 5p sẽ chạy 1 lần
	}
	
}



async function run() {
	let obj = await axios.get('https://api.cryptowat.ch/markets/binance/' + pair +'/ohlc');

	let data = obj.data.result;
	let l = data[PERIOD].length;


	last_price = curr_price;
	curr_price = data[PERIOD][l-1][4];

	// bỏ qua lần chạy đầu tiên
	if(last_price != 0) {
		let curr_per = (Math.abs(curr_price - last_price)/curr_price*100).toFixed(2);		//Lấy 2 số lẻ

		if(curr_per >= PER_ALRT) {
			sendAlert(curr_price, last_price, curr_per);
		}
	}

}


async function sendAlert(curr_price, last_price, curr_per) {
	var p = new Push( {
	  user: PUSHOVER_USER,
	  token: PUSHOVER_TOKEN,
	});

	var message = 'Giá cũ là ' + last_price + ", giá mới là " + curr_price + " đang giao động trong khoản " + curr_per + "%";

	var msg = {
	  // These values correspond to the parameters detailed on https://pushover.net/api
	  // 'message' is required. All other values are optional.
	  message: message,	// required
	  title: "Cảnh báo giá " + pair,
	  sound: 'magic',
	  device: PUSHOVER_DEVICE,
	  priority: 1
	}

	p.send( msg, function( err, result ) {
	  if ( err ) {
	    throw err
	  }

	  console.log( result )
	})
}