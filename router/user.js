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
var User   = require('../app/models/user'); // get our mongoose model
var User2   = require('../app/models/user2'); // get our mongoose model
var App   = require('../app/models/app'); // get our mongoose model
var Group   = require('../app/models/groups'); // get our mongoose model
var request = require('request')
//var Message = require('../app/models/message')

BASE_URL = config.KSTMP_CRYTO_BASE_URL
var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

module.exports = function (supersecret, router) {
	
// Create
//==================================
// Create user (old version)
router.post('/create_user', function(req, res) {

	  // create a sample user
	  var user = new User({ 
		name: req.body.name ,
		email:req.body.email,
		phone: req.body.phone,
		role: req.body.role || "customer",
		assignedTo: req.body.assignedTo,
		uid: req.body.uid || req.body._id,
		user_key: req.body.user_key
	  });
	  if (req.body.role == 'firm'){
	  	  User.findOne({
	    "name": "OSC"
	  }, function(err, osc_user) {
		  var osc_key =  osc_user.user_key
	  request.post({url: BASE_URL+'/generate_firm_key', form: {"osc_key": osc_key ,"firm_id": req.body.uid}},function (error, response, body) {
		 // if(body.status == 'success'){
			  console.log(body)
			  user.user_key = JSON.parse(body).xprv
			  user.user_pub_key = JSON.parse(body).xpub
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
		  //}
		});
		});
		}else if (req.body.role == 'advisor'){
	  	  User.findOne({
	    "uid": req.body.assignedTo
	  }, function(err, adv_user) {
		  if(adv_user){
	  request.post({url: BASE_URL+'/generate_advisor_key', form: {"firm_key": adv_user.user_key ,"advisor_id": req.body.uid}},function (error, response, body) {
		  //if(body.status == 'success'){
			  console.log(body)		
			  user.user_key = JSON.parse(body).xprv
			  user.user_pub_key = JSON.parse(body).xpub
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
		}else{
				return res.status(403).send({ 
				success: false, 
				message: 'advisor need to be assigned to a firm '
			});
		}
		});
		}else{
			  user.save(function(err) {
	    if (err) {
			return res.status(403).send({ 
				success: false, 
				message: 'User '+req.body.uid+' was not saved.' 
			});
		}	    if (err) throw err;

	    console.log('User: '+ req.body.uid+' saved successfully');
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
	    res.json({ success: true, user:user });	
		})
	}

});

// Create user 2 (new version)
router.post('/create_user2', function(req, res) {

	// create a sample user
	var user = new User({ 
		name: req.body.name ,
		email:req.body.email,
		phone: req.body.phone,
		role: req.body.role || "client",
		assignedTo : req.body.assignedto || "",
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
		User.find(function(err, users) {
			if (err)
				res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json(users);
 });
});

// to modify and complete
router.route('/users/:users_id')
.put(function(req, res) {
	// use our user model to find the user we want
	User.findById(req.params.users_id, function(err, user) {
		if (err)
			res.send(err);
		user.name = req.body.name;  // update the user name
		user.password = req.body.password;  // update the user password
		user.admin = req.body.admin;  // update the user admin
		user.save(function(err) {
			if (err)
				res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'User updated!' , user: user});
		});
	});
});
// to modify and complete
router.route('/users/:users_id')
.delete(function(req, res) {
	User.remove({
		_id: req.params.user_id
	}, function(err, user) {
		if (err)
			res.send(err);
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true, message: 'User: '+ user+' Successfully deleted' });
	});
});

router.route('/search/osc') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		User.find(function(err, users) {
			if (err || !users){
				return res.status(403).send({ 
			success: false, 
			message: 'users does not exist'
		});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Search successful', users: users });
	});
 });

router.route('/search/advisor') 
//get all the users (accessed at GET http://localhost:8080/api/users)
	.get(function(req, res) {
		var proj = { "role": "customer"}
		User.find(proj, function(err, users) {
			if (err || !users){
				return res.status(403).send({ 
			success: false, 
			message: 'users does not exist'
		});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Search successful', users: users });
	});
 });

router.route('/users/:users_id')
	.get(function(req, res) {
	// use our user model to find the user we want
	User.findOne({uid: req.params.users_id}, function(err, user) {
		if (err || !user){
			return res.status(403).send({ 
			success: false, 
			message: 'User des not exist'
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'User retrieved!' , user: user});
	});
});

// GET Endpoints
//==============================

router.route('/get_firms') 
//get all existing firms (accessed at GET http://localhost:8080/api/get_firms)
	.get(function(req, res) {
		User.find({"role":"firm" }, function(err, firms) {

		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, firms: firms});
 });
});

//getadvisors
router.route('/get_advisors/:firm') 
//get advisor related to the firm(accessed at GET http://localhost:8080/api/get_advisors/:firm)
	.get(function(req, res) {
		User.find({"role":"advisor", "assignedTo": req.params.firm }, function(err, advisors) {

		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, advisors: advisors});
 });
});

//getusers
router.route('/get_customers/:advisor') 
//get customers related to the advisor (accessed at GET http://localhost:8080/api/get_customers/:advisor)
	.get(function(req, res) {
		User.find({"role":"customer", "assignedTo": req.params.advisor }, function(err, customers) {
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, customers: customers});
 });
});

//getdocument
router.route('/get_all_document') 
//get all documents (accessed at GET http://localhost:8080/api/get_all_document)
	.get(function(req, res) {
		User.find(function(err, users) {
			var docs =[]
		for (i = 0; i < users.length; i++) { 
			if(users[i].docs != []){
			docs.push(users[i].docs)
		}
		}	
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, docs: docs});
 });
});

//get alladvisor
router.route('/get_all_advisors') 
//get all documents (accessed at GET http://localhost:8080/api/get_all_advisors)
	.get(function(req, res) {
		User.find({"role":"advisor"},function(err, advisors) {
	
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({success: true, advisors: advisors});
		});
});

}//end
