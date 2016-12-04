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
// Bitcore Keys api
//================================   
router.route('/get_public_key')
	.get(function(req, res) {
		bitcore.create_publicKey(function(key){
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'Public key created succesfully!' , xpub: key});
		});
	});
router.route('/get_public_key_from_parent')
	.post(function(req, res) {
		var parent = req.body.parent
		bitcore.create_publicKey_from_parent(parent,function(key){
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'Public key created from: '+parent+" created successfully" , xpub: key});
		});
	});
router.route('/get_private_key')
	.get(function(req, res) {
		bitcore.create_HDPrivateKey(function(key){
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'New private key created succesfully' , xprv: key});
		});
	});
router.route('/get_derived_key')
	.post(function(req, res) {
		var parent = req.body.parent
		var current_path = req.body.path
		var id = req.body.id || 0
		bitcore.derive_HDPrivateKey(parent, Number(id), current_path,  function(key, path){
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'New derived key: '+key+' created succesfully with path: '+path, xprv: key, path:path});
		});
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
