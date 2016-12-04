// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./router/index.js
//
// Keystamp-api router
// =============================================================================


var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var App   = require('../app/models/app'); // get our mongoose model
var request = require('request')
var crypt = require('../app/encrypt')
BASE_URL = config.KSTMP_CRYTO_BASE_URL
var bitcore = require('../app/bitcore_imp')
module.exports = function (supersecret, router) {

//test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.setHeader('status', 200)
	res.setHeader("Content-Type", "application/json;charset=UTF-8")
	res.json({ message: 'Welcome to keystamp API!' });   
});

// Auth
// =====================================
router.post('/auth', function(req, res) {
		console.log(req.body.app_id)
	  // find the user
	  App.findOne({
	    "app_id": req.body.app_id
	  }, function(err, app) {
	    if (err || !app) {
			return res.status(403).send({ 
				success: false, 
				message: 'App does not exist.' 
			});
		}else {
			// check if password matches
			if (app.app_secret != req.body.app_secret) {
				res.json({ success: false, message: 'Authentication failed. App not registered.' });
			}else{
				// if user is found and password is right
				// create a token
				var token = jwt.sign(app,supersecret, {});
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				// return the information including token as JSON
				res.json({
					success: true,
					message: 'Authentication succesful',
					token: token
				});
			}   
		}
	});
});

}//end of api
