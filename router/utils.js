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
var notify = require('../app/notify') // get our notify method
var Document   = require('../app/models/document'); // get our mongoose model
var App   = require('../app/models/app'); // get our mongoose model
var Group   = require('../app/models/groups'); // get our mongoose model
var request = require('request')
var Message = require('../app/models/message')
var Tx   = require('../app/models/tx'); // get our mongoose model
var Notification   = require('../app/models/notifications'); // get our mongoose model
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
	
router.route('/create_message/:users_id')
	.post(function(req, res) {
	var from = req.body.from
	var to = req.body.to
	var owner = req.params.users_id
	var msg = req.body.msg || ""
	
	// create a sample message
	var message = new Message({ 
		owner: owner,
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
	res.json({ success:true , message: 'Messages from: '+from+' sent to: '+to+' sent succesfully' , msg: msg});
	});
})
// Notifications api
//================================  

router.route('/get_notifications/:users_id')
	.get(function(req, res) {
	Notification.find({"owner": req.params.users_id}, function(err, note) {
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

// Document/Txs api 
// ===============================
// get one user documents
router.route('/get_my_documents/:users_id')
	.get(function(req, res) {
	Document.find({"owner": req.params.users_id}, function(err, docs) {
		if (err || !docs){
			return res.status(403).send({ 
			success: false, 
			message: 'No documents yet'
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Documents retreived!' , docs: docs});
		});
	});

// get one user transactions
router.route('/get_my_tx/:users_id')
	.get(function(req, res) {
	Tx.find({"owner": req.params.users_id}, function(err, txs) {
		if (err || !txs){
			return res.status(403).send({ 
			success: false, 
			message: 'No transactions yet'
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Transactions retreived!' , txs: txs});
		});
	});

// get one user documents
router.route('/get_members_by_group/:users_id')
	.get(function(req, res) {
	 Group.find({"members": req.params.users_id}, function(err, group) {
		 console.log(group)
		if (err || !group || group.length < 1){
			return res.status(403).send({ 
			success: false, 
			message: req.params.users_id+' is not member of any #group yet' 
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Members: '+group.members+' retreived in #'+group.group_name , members: group.member});
		});
	});
	
// get one user documents
router.route('/get_clients_by_middleman/:users_id')
	.get(function(req, res) {
	 User2.find({"assignedTo": req.params.users_id}, function(err, usr) {
		if (err || !usr){
			return res.status(403).send({ 
			success: false, 
			message: 'No clients assigned to '+ req.params.user_id+' yet' 
			});
		}
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Clients assigned to: '+req.params.users_id+' retreived!' , assigned: usr});
		});
	});
	
// Assign api 
// ===============================
// assign a user to a group

}//end
