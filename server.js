// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// server.js
//
// Keystamp-api router
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model
var logger = require('morgan');
var request = require('request')
var autoUser = require('./app/autouser')

// set middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
var firm_key
var port = config.port;    // set our port
var mongoose   = require('mongoose');
mongoose.connect(config.central_database); // database
app.set('superSecret', config.secret); // secret variable
var db = mongoose.connection;
// check db connection
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("Keystamp-api db started on :"+config.central_database);
	var start = autoUser()
});

// router instance
var router = express.Router();
// non authenticated routes
require('./router/index')(app.get('superSecret'), router);
// authenticate middleware
require('./router/auth')(app.get('superSecret'), router);
// authenticated routes
require('./router/user')(app.get('superSecret'), router);
require('./router/crypto')(app.get('superSecret'), router);
require('./router/2wayauth')(app.get('superSecret'), router);

//all of our routes will be prefixed with /api
app.use('/api', router);

// start server
app.listen(port);
console.log('Keystamp-api is listening on port ' + port);
