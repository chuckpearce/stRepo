var moment = require('moment');
var config = require('.././config');

var netData = "";
var host = config.aquaController.host;
var port = config.aquaController.port;

var net = require('net');

var connected = false;
var statusObject;

var client = net.connect(port, host, function(){
   client.on('data', function(data) {
	 netData += data;
   });
});

function connect () {
	client = net.connect(port, host, function(){
	   client.on('data', function(data) {
	   	 netData += data;
	   });
	});
}

client.on('connect', function(err) {
	connected = true;
 console.log('connect:', err);
});

client.on('timeout', function(err) {
	if (connected) {
		setTimeout(function(){
			connect()
		}, 60000);
	}
	connected = false;
 console.log('timeout:', err.message);
});

client.on('close', function(err) {
	connected = false;
 console.log('close:', err.message);
});

client.on('error', function(err) {
	setTimeout(function(){
		connect()
	}, 15000);
 console.log('error:', err.message);
});


// Define web routes
module.exports = function( app ){

	app.get('/aquaController/status', function (req, res) {
		getStatus( function (err, data) {
			if (!err) {
				res.send(data);
			} else {
				res.sendStatus(500);
			}
		});
	});


	app.get('/aquaController/toggle', function (req, res) {
		console.log('Starting toggle session', req.query);
		resolveSwitchLabel( req.query.name, req.query.status, function (err, data) {
			getStatus (function (err, data) {
				res.send(data);
			});
		});
	});

}

function getStatus (callback) {
	console.log('Checking status of aquaController');
	client.write('c\n', function (err, data) {
		setTimeout(function () {
			var statusObj = parseStatus(netData);
			callback(null, statusObj);
		}, 1500)
	});
}

function parseStatus (data) {
	netData = "";
	var statusArray = data.split( /\n/g );

	if (statusArray && statusArray[3]) {
		statusObject = {
			time: moment(statusArray[3].replace("\r",''), 'MMM DD YYYY HH:mm:ss').format("hh:mm a")
			, date: moment(statusArray[3].replace("\r",''), 'MMM DD YYYY HH:mm:ss').format("MM/DD/YYYY")
			, temp: statusArray[5].split(/ /g)[0]
			, ph: statusArray[5].split(/ /g)[1]
			, s1: parseSwitchStatus( statusArray[6] )
			, s2: parseSwitchStatus( statusArray[7] )
			, s3: parseSwitchStatus( statusArray[8] )
			, s4: parseSwitchStatus( statusArray[9] )
			, s5: parseSwitchStatus( statusArray[10] )
			, s6: parseSwitchStatus( statusArray[11] )
			, s7: parseSwitchStatus( statusArray[12] )
			, s8: parseSwitchStatus( statusArray[13] )
		};
	}
	return statusObject;
}

function parseSwitchStatus (data) {
	var dataArray = data.split(/ /g);
  if (dataArray[1] && (dataArray[4] || dataArray[5]) ) {
  	var retArray = {
  		label: dataArray[1]
  		, status: dataArray[3]
  		, mode: ( dataArray[4].replace("\r",'').length > 0 ) ? dataArray[4].replace("\r",'') : dataArray[5].replace("\r",'')
  	};

  	return retArray;
  } else {
    return {};
  }
}

function resolveSwitchLabel(switchName, status, callback) {
		
	if (statusObject.length > 1) {
		toggleSwitchMode ( statusObject[switchName].label, status, function (err, data) {
			callback(err, data);
		});
	} else {
		getStatus( function (err, data) {
			toggleSwitchMode ( statusObject[switchName].label, status, function (err, data) {
				callback(err, data);
			});
		});
	}

}

function toggleSwitchMode (switchLabel, status, callback) {

	console.log('Turning switch',switchLabel,'to mode', status);
	var cmd = status.concat(' ').concat(switchLabel);

	console.log('Command', cmd);
	
	client.write(cmd);
	  setTimeout(function () {
	  	if (netData.toString() == cmd) {
	  		callback();
	  	} else {
	  		callback(true, netData);
	  	}
	  	netData = "";
	  }, 2000 );
}



// on XXX
// off XXX
// auto XXX
// d - lists all historical data
// To-Do: find out how to set the time since my controller can't seem to keep time even over 24 hrs.
