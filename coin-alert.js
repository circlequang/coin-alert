const axios = require('axios');
var Push = require('pushover-notifications');

const PERIOD = 1800; // unit is seconds, e.g. 1800s = 30 minutes
const PER_ALRT = 0.01;
const PUSHOVER_USER = 'uobpbh3ksdsuwks46rirpr341i4rwk';
const PUSHOVER_TOKEN = 'akxp92epvfppidmr7hrnuq69g9fmbm';
const PUSHOVER_DEVICE = 'redmi8';

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

var pair = _pairList[0]; // 0 is bitcoin, 1 is bnb, 2 is Eth... to use another coin, input the corresponding index from _pairList, starting from 0

var last_price = 0; // previous price
var curr_price = 0; // current price

main();

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    while (true) { // Create an infinite loop, you can stop it by pressing CTRL + C
        await run();
        await sleep(1 * 60 * 1000); // the unit of sleep function is milliseconds, so the process will run every 5 minutes
    }
}

async function run() {
    let obj = await axios.get('https://api.cryptowat.ch/markets/binance/' + pair + '/ohlc');

    let data = obj.data.result;
    let l = data[PERIOD].length;

    last_price = curr_price;
    curr_price = data[PERIOD][l - 1][4];

    // skip the first run
    if (last_price != 0) {
        let curr_per = (Math.abs(curr_price - last_price) / curr_price * 100).toFixed(2); // round to 2 decimal places

        if (curr_per >= PER_ALRT) {
            sendAlert(curr_price, last_price, curr_per);
        }
    }
}

async function sendAlert(curr_price, last_price, curr_per) {
    var p = new Push({
        user: PUSHOVER_USER,
        token: PUSHOVER_TOKEN,
    });

    var message = 'Previous price was ' + last_price + ", current price is " + curr_price + ", fluctuating within " + curr_per + "%";

    var msg = {
        // These values correspond to the parameters detailed on https://pushover.net/api
        // 'message' is required. All other values are optional.
        message: message, // required
        title: "Price Alert " + pair,
        sound: 'magic',
        device: PUSHOVER_DEVICE,
        priority: 1
    }

    p.send(msg, function(err, result) {
        if (err) {
            throw err;
        }

        console.log(result);
    });
}
