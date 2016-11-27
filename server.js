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
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
	console.log("db started on :"+config.central_database);
	User.find( function(err, users) {
		//console.log(users)
		if (users.length < 1){
	  BASE_URL = 'https://reghackto.herokuapp.com'
	  request.get(BASE_URL+'/generate_master_seed',function (error, response, body) {
			  console.log(body)
			  config.OSC_KEY = JSON.parse(body).xprv
	 
	  	  var user = new User({ 
			name: "OSC" ,
			email:"osc@osc.gov.on.ca",
			role: "osc",
			uid: 00001,
			user_key: JSON.parse(body).xprv,
			user_pub_key: JSON.parse(body).xpub
	  });
	  // osc got its key
	  user.save(function(err) {	
		  console.log(" db has been populated by osc")
		  request.post({url: BASE_URL+'/generate_firm_key', form: {"osc_key": config.OSC_KEY ,"firm_id": 55677}},function (error, response, body_f) {
			  console.log(body_f)
	  var user = new User({ 
			name: "Thomas Kyles" ,
			email:"thomas@fmi.com",
			role: "firm",
			assignedTo: "1",
			uid: 55677,
			user_key: JSON.parse(body_f).xprv,
			user_pub_key:JSON.parse(body_f).xpub
	  });

		firm_key = JSON.parse(body_f).xprv
	  // save the sample user
	  user.save(function(err) {	
		  console.log(" db has been populated by Thomas Kyles")
	  });	
	
		request.post({url: BASE_URL+'/generate_advisor_key', form: {"firm_key": firm_key, "advisor_id": 66789}},function (error, response, body_a) {
			  console.log(JSON.parse(body_a).xprv)		
	  var user = new User({ 
			name: "Jannete Bohn" ,
			email:"jannete@hotmail.com",
			assignedTo: "55677",
			role: "advisor",
			uid: 66789,
			user_key: JSON.parse(body_a).xprv,
			user_pub_key:  JSON.parse(body_a).xpub
	  });
	  
	  // save the sample user
	  user.save(function(err) {	
		  console.log(" db has been populated by Jannete Bohn")
	  });
	  });
		});	
	  	  var user = new User({ 
			name: "Johnathan" ,
			email:"jonathan@gmail.com",
			assignedTo: "66789",
			role: "customer",
			uid: 22314,
			user_key: "none"
	  });
	  // save the sample user
	  user.save(function(err) {	
		  console.log(" db has been populated by Johnathan")
	  });

	  });
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
