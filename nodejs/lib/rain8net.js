var moment = require('moment');
var config = require('.././config');

var netData = "";
var host = config.rain8net.host;
var port = config.rain8net.port;
var address = config.rain8net.address;

var net = require('net');

var connected = false;

var client = net.connect(port, host, function(){
   client.on('data', function(data) {
   	 netData += data.toString("hex");
   });
});

client.on('connect', function(err) {
	connectionStatus ( function (err, data) {
		if (!err) {
			connected = true;
		}
	});
	
 	console.log('connect:', err);
});

client.on('timeout', function(err) {
	connected = false;
 	console.log('timeout:', err.message);
});

client.on('close', function(err) {
	connected = false;
 	console.log('close:', err.message);
});

client.on('error', function(err) {
	console.log('error:', err.message);
});


// Define web routes
module.exports = function( app ){

	app.get('/rain8/status', function (req, res) {
		zoneStatus( function (err, data) {
			res.send(data);
		});
	})

	app.get('/rain8/connection', function (req, res) {
		connectionStatus( function (err, data) {
			if (!err) {
				res.sendStatus(200);
			} else {
				res.sendStatus(500);
			}
			
		});
	})

	app.get('/rain8/zone', function (req, res) {
		toggleZone( req.query.zone, req.query.enable, function (err, data) {
			if (!err) {
				res.sendStatus(200);
			} else {
				res.sendStatus(500);
			}
		});
	})

	app.get('/rain8/off', function (req, res) {
		allOff( function (err, data) {
			res.send(data);
		});
	})

}

function toggleZone (zone, enable, callback) {
	
	if (enable == 'true') {
		enable = true;
	} else {
		enable = false;
	}

	var cmd = '40'.concat(address).concat((enable) ? '3' : '4').concat(zone);
	console.log('Changing status of zone '.concat(zone).concat(': ').concat(enable) );
	client.write(Buffer(cmd,"hex"));
	  setTimeout(function () {
	  	console.log('Zone change response:', netData);
	  	if (cmd == netData.toString()) {
	  		callback(null, 'Success');
	  	} else {
	  		callback(true, 'Zone did not respond properly');
	  	}	  	
	  	netData = "";
	  }, 1500 );
}

function allOff (callback) {
	var cmd = '40'.concat(address).concat('55');
	console.log('Turning off all zones');
	client.write(Buffer(cmd,"hex"));
	  setTimeout(function () {
	  	console.log('All zones off response:', netData);
	  	if (cmd == netData.toString()) {
	  		callback(null, 'Success');
	  	} else {
	  		callback(true, 'Invalid response disabling all zones');
	  	}
	  	
	  	netData = "";
	  }, 1500 );
}

function connectionStatus (callback) {
	var cmd = '700100';
	console.log('Checking connection status');
	client.write(Buffer(cmd,"hex"));
	  setTimeout(function () {
	  	console.log('Connection status response:', netData);
	  	if (netData.length > 1) {
	  		callback(null);
	  	} else {
	  		callback(true, 'No valid controller found');
	  	}
	  	netData = "";
	  }, 1500 );
}

function zoneStatus (callback) {
	var cmd = '40'.concat(address).concat('F0');
	console.log('Checking zone status');
	client.write(Buffer(cmd,"hex"));
	  setTimeout(function () {
	  	console.log('Zone status response:', netData);
	  	if (netData.length > 1) {
	  		var pad = "00000000" + Hex2Bin(netData.toString().substr(4,2));
    		statusString = pad.substr(pad.length-8);

    		var result = {
    			1: (statusString[7] == 1) ? 'on' : 'off'
    			, 2: (statusString[6] == 1) ? 'on' : 'off'
    			, 3: (statusString[5] == 1) ? 'on' : 'off'
    			, 4: (statusString[4] == 1) ? 'on' : 'off'
    			, 5: (statusString[3] == 1) ? 'on' : 'off'
    			, 6: (statusString[2] == 1) ? 'on' : 'off'
    			, 7: (statusString[1] == 1) ? 'on' : 'off'
    			, 8: (statusString[0] == 1) ? 'on' : 'off'
    		}
	  	}
	  	callback(null, result);
	  	netData = "";
	  }, 1500 );
}

// http://stackoverflow.com/questions/7695450/how-to-program-hex2bin-in-javascript/12987042#12987042
function Hex2Bin(n){if(!checkHex(n))return 0;return parseInt(n,16).toString(2)}
function checkHex(n){return/^[0-9A-Fa-f]{1,64}$/.test(n)}

// Zone on - 40(address)3(zone#1-8) 
// Zone off - 40(address)4(zone#1-8)
// All off - 40(address)55
// Zone status - 40(address)F0 - binary response
// Com check - 700100

// Global off - 205555
// switch stats - 50(address)EF
// flow meter stats - 50(address)E0
// clear flow meter - 50(address)E7
