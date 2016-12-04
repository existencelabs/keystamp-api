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
var User2   = require('../app/models/user2'); // get our mongoose model
var notify = require('../app/notify') // get our notify method
var Document   = require('../app/models/document'); // get our mongoose model
var Group   = require('../app/models/groups'); // get our mongoose model
var request = require('request')
var Message = require('../app/models/message')
var Tx   = require('../app/models/tx'); // get our mongoose model
var Notification   = require('../app/models/notifications'); // get our mongoose model
var mailer = require('../app/mailer')
BASE_URL = config.KSTMP_CRYTO_BASE_URL
var bitcore = require('../app/bitcore_imp')

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
//getdocument
router.route('/get_all_document') 
//get all documents (accessed at GET http://localhost:8080/api/get_all_document)
	.get(function(req, res) {
		Document.find(function(err, docs) {	
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({success: true, docs: docs});
		});
});
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
// subscribe to a group
router.route('/subscribe/:users_id')
	.post(function(req, res) {
	var group_name = req.body.group
	 Group.findOne({"group_name": group_name}, function(err, group) {
		if (err || !group){
			return res.status(403).send({ 
			success: false, 
			message: 'Group does not exists' 
			});
		}
		for (i = 0; i < group.members.length; i++) { 
			if(group.members[i] == req.params.users_id){
				return res.status(403).send({ 
			success: false, 
			message: req.params.users_id+' already in group: '+group.group_name 
			});
			}
		}
		group.members.push(req.params.users_id)
		group.save(function(){
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Clients assigned to: '+req.params.users_id+' retreived!' , members: group.members});
		})
		});
	});
	
// unsubscribe from a group
router.route('/unsubscribe/:users_id')
	.post(function(req, res) {
	var group_name = req.body.group
	 Group.findOne({"group_name": group_name}, function(err, group) {
		if (err || !group){
			return res.status(403).send({ 
			success: false, 
			message: 'Group does not exists' 
			});
		}
		for (i = 0; i < group.members.length; i++) { 
			if(group.members[i] == req.params.users_id){
				group.members.splice(i)
				group.save()
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: req.params.users_id+' unsubscribed from '+ group.group_name , members: group.members});
				
			}else{
				return res.status(403).send({ 
				success: false, 
				message: req.params.users_id+ 'Is not member of '+ group.group_name
			});
			}
			}
		
	})
});
	
// assign to middleman
router.route('/assign/:users_id')
	.post(function(req, res) {
	var assigner = req.body.assigner
	var assignee = req.params.users_id
	 User2.findOne({"uid": assignee}, function(err, usr) {
		if (err || !usr){
			return res.status(403).send({ 
			success: false, 
			message: 'User: '+assignee+ ' does not exists' 
			});
		}
		usr.assignedTo = assigner
		usr.save(function(){
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: assignee+' assigned to '+ assigner , assignedTo: usr.assignedTo});
		})
	})
});
// unlink from middleman
router.route('/unlink/:users_id')
	.post(function(req, res) {
	var assigner = req.body.assigner
	var assignee = req.params.users_id
	 User2.findOne({"uid": assignee}, function(err, usr) {
		if (err || !usr){
			return res.status(403).send({ 
			success: false, 
			message: 'User: '+assignee+ ' does not exists' 
			});
		}
		usr.assignedTo = null
		usr.save(function(){
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: assignee+' assigned to '+ assigner , assignedTo: usr.assignedTo});
		})
	})
});
// invite to keystamp
router.route('/invite/:users_id')
	.post(function(req, res) {
	var from = req.body.from
	var email = req.body.email
	var to = req.body.name 
	mailer.invite(from, to, email,  function(err){
		if(err){
			return res.status(403).send({ 
			success: false, 
			message: 'Invite to: '+to+ ' from '+from+' failed' ,
				error: err
		});
		}
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'Invite to '+to+' from '+from+' successfully sent'});
		})
	});
}//end
