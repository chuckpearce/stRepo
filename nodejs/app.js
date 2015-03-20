
var	http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth');
var url = require('url');
var fs = require('fs');
var config = require('./config');
var	app = express();

var port = config.port;

fs.readdir('./lib', function (err, files) {
	for (var i = 0; i < files.length; i++) {
	    require('./lib/' + files[i])(app,config);
	}
})

var auth = function(username, password) {
  return function(req, res, next) {
    var user = basicAuth(req);

    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
      return res.sendStatus(401);
    }

    next();
  };
};

app.use(bodyParser.json())

app.use('/', auth(config.username, config.password));

var server = app.listen(port, function () {
  console.log('SmartThings Web Service Bridge listening on port:', port)

})

require('./lib/aquaController')(app);
require('./lib/rain8net')(app);

