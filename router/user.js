// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./router/users.js
//
// Keystamp-api router
// =============================================================================

var config = require('../config'); // get our config file
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var User2   = require('../app/models/user2'); // get our mongoose model
var App   = require('../app/models/app'); // get our mongoose model
var Group   = require('../app/models/groups'); // get our mongoose model
var request = require('request')
var notify = require('../app/notify')
var BASE_URL = config.KSTMP_CRYTO_BASE_URL


module.exports = function (supersecret, router) {
	
// Create
//==================================
// Create user 2 (new version)
router.post('/create_user', function(req, res) {

	// create a sample user
	var user = new User2({ 
		name: req.body.name ,
		email:req.body.email,
		phone: req.body.phone,
		role: req.body.role || "client",
		assignedTo : req.body.assignedto || null,
		uid: Math.floor(Math.random()*90000) + 10000,
		user_prv_key: req.body.user_prv_key || "",
		user_pub_key: req.body.user_key || ""
	});
	// save the sample user
	user.save(function(err) {
	if (err) {
		return res.status(403).send({ 
			success: false, 
			message: 'User '+req.body.uid+' was not saved.' 
		});
	}
	console.log('User: '+ req.body.uid+' saved successfully');
	res.setHeader('status', 200)
	res.setHeader("Content-Type", "application/json;charset=UTF-8")
	res.json({ success: true, user:user });
	});
});
// Create user 2 (new version)
router.post('/create_group', function(req, res) {

	request.get(BASE_URL+'/generate_master_seed',function (error, response, body) {
		console.log(body)
	// create a sample user
	var group = new Group({ 
		members: [req.body.uid],
		admins: [req.body.uid],
		master: req.body.uid,
		xpub: JSON.parse(body).xpub,
		xprv: JSON.parse(body).xprv,
		group_name: req.body.name,
		group_logo: req.body.logo || null
	});
	// save the sample user
	group.save(function(err) {
	if (err) {
		return res.status(403).send({ 
			success: false, 
			message: 'Group '+req.body.name+' was not created.' 
		});
	}
	console.log('Group '+req.body.name+' created successfully');
	res.setHeader('status', 200)
	res.setHeader("Content-Type", "application/json;charset=UTF-8")
	res.json({ success: true, group:group });
	});
});
});

// Create a new app id and secret
router.post('/create_app', function(req, res) {

	  var app = new App({ 
			app_id: req.body.app_id,
			app_secret: req.body.app_secret
	  });

	  app.save(function(err) {
	    if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'App '+app.app_id+' was not saved.' 
			});
		}
	    console.log('App: '+ app.app_id+' saved successfully');
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	    res.json({ success: true , app:app});
	  });
	});

// Users endpoints 
// ================================
router.route('/users') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User2.find(function(err, users) {
			if (err)
				res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json(users);
 });
});

// update user
router.route('/users/:users_id')
.put(function(req, res) {
	// use our user model to find the user we want
	User2.findOne({ "uid":req.params.users_id }, function(err, user) {
		if (err)
			res.send(err);
		name= req.body.name || user.name ,
		role= req.body.role || user.role ,
		email=req.body.email || user.email ,
		phone= req.body.phone || user.phone ,
		user.save(function(err) {
			if (err)
				res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'User updated!' , user: user});
		});
	});
});

// delete a user
router.route('/users/:users_id')
.delete(function(req, res) {
	User2.remove({
		"uid": req.params.user_id
	}, function(err, user) {
		if (err)
			res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true, message: 'User: '+ user+' Successfully deleted' });
	});
});

}//end
