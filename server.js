
// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./router/router.js
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
//TODO : connect to private db

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = config.port;    // set our port
var mongoose   = require('mongoose');
mongoose.connect(config.database); // database
app.set('superSecret', config.secret); // secret variable
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("db started ------------");
});

// routes
var router = express.Router();              // get an instance of the express Router
require('./router/router')(app, router);

//REGISTER OUR ROUTES -------------------------------
//all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
Contact GitHub API Training Shop Blog About
© 2016 GitHub, Inc. Terms Privacy Security Status Help
