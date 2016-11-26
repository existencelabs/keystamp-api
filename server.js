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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = config.port;    // set our port
var mongoose   = require('mongoose');
mongoose.connect(config.central_database); // database
app.set('superSecret', config.secret); // secret variable
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("db started on :"+config.central_database);
	User.find( function(err, users) {
		console.log(users)
		if (users.length < 1){
				
	  var user = new User({ 
			name: "joe" ,
			email:"joeblow@hot.com",
			role: "customer",
			uid: "joe blow",
			user_key: "37078"
	  });
	  // save the sample user
	  user.save(function(err) {	
		  console.log(" db has been populated by jow blow")
	  });	
	  				
	  var user = new User({ 
			name: "jane" ,
			email:"janedoe@hot.com",
			role: "advisor",
			uid: "joe blow",
			user_key: "37076"
	  });
	  // save the sample user
	  user.save(function(err) {	
		  console.log(" db has been populated by jane doe")
	  });
	  	  var user = new User({ 
			name: "OSC" ,
			email:"osc@osc.gov.on.ca",
			role: "osc",
			uid: "osc",
			user_key: "00001"
	  });
	  // save the sample user
	  user.save(function(err) {	
		  console.log(" db has been populated")
	  });
	}	
	});	
});

// routes
var router = express.Router();              // get an instance of the express Router
require('./router/router')(app.get('superSecret'), router);

//REGISTER OUR ROUTES -------------------------------
//all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Keystamp-api is listening on port ' + port);
