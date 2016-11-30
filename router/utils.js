// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./router/utils.js
//
// Keystamp-api router
// =============================================================================

var config = require('../config'); // get our config file
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var User   = require('../app/models/user'); // get our mongoose model
var User2   = require('../app/models/user2'); // get our mongoose model
var Notification   = require('../app/models/notifications'); // get our mongoose model
var App   = require('../app/models/app'); // get our mongoose model
var Group   = require('../app/models/groups'); // get our mongoose model
var request = require('request')
var Message = require('../app/models/message')

BASE_URL = config.KSTMP_CRYTO_BASE_URL


module.exports = function (supersecret, router) {
// Message api
//================================   

router.route('/get_messages_inbox/:users_id')
	.get(function(req, res) {
	Message.find({"to": req.params.users_id}, function(err, mess) {
		if (err){
			return res.status(403).send({ 
			success: false, 
			message: 'No messages yet'
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Messages retreived!' , mess: mess});
		});
	});

router.route('/get_messages_sent/:users_id')
	.get(function(req, res) {
	Message.find({"from": req.params.users_id}, function(err, mess) {
		if (err){
			return res.status(403).send({ 
			success: false, 
			message: 'No messages yet'
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Messages retreived!' , mess: mess});
		});
	});
	
router.route('/create_message')
	.post(function(req, res) {
	var from = req.body.from
	var to = req.body.to
	var msg = req.body.msg || ""
	
	// create a sample message
	var message = new Message({ 
		
		from: from,
		to: to,
		_new: true,
		message: msg,
		path: req.body.path || null,
	});
	// save the sample message
	message.save(function(err) {
	if (err) {
		return res.status(403).send({ 
			success: false, 
			message: 'Message from: '+from+' to: '+to+'was not saved.' 
		});
	}
	res.setHeader('status', 200)
	res.setHeader("Content-Type", "application/json;charset=UTF-8")
	res.json({ success:true , message: 'Messages retreived!' , msg: msg});
	});
})
// Notifications api
//================================  

router.route('/get_notfications/:users_id')
	.get(function(req, res) {
	Notification.find({"user": req.params.users_id}, function(err, note) {
		if (err){
			return res.status(403).send({ 
			success: false, 
			message: 'No notifications yet'
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , notification: note});
		});
	});

router.route('/create_notification')
	.post(function(req, res) {

	// create a sample message
	var notification = new Notification ({ 
		type: req.body.type,
		user: req.body.uid,
		messages: req.body.msg,
		read: false
	});
	
	// save the sample notification
	notification.save(function(err) {
	if (err) {
		return res.status(403).send({ 
			success: false, 
			message: 'Message from: '+from+' to: '+to+'was not saved.' 
		});
	}
	res.setHeader('status', 200)
	res.setHeader("Content-Type", "application/json;charset=UTF-8")
	res.json({ success:true , notification: notification});
	});
})
}//end
