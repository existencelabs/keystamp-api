// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./router/crypto.js
//
// Keystamp-api router
// =============================================================================

var config = require('../config'); // get our config file
var morgan      = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config'); // get our config file
var User   = require('../app/models/user'); // get our mongoose model
var Document   = require('../app/models/document'); // get our mongoose model
var App   = require('../app/models/app'); // get our mongoose model
var request = require('request')
var crypt = require('../app/encrypt')
//var Message = require('../app/models/message')

BASE_URL = config.KSTMP_CRYTO_BASE_URL
var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

module.exports = function (supersecret, router) {
// Hash api
//========================================

router.route('/upload/:user_id')
.post(function(req, res){
	var date = new Date();
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	var endpoint = '/hashme'
	var base_url ='https://reghackto.herokuapp.com'
	var path = req.body.path
		request.post({url: base_url+endpoint, form:{file_url:path}},function (error, response, body) {
			console.log('response: '+JSON.stringify(body) )
			if ( JSON.parse(body).status == 'success') {
				console.log(body) 
		User.findOne({uid: req.params.user_id},
		function(err, user) {
			if (err || !user)
				res.send(err);
		var filen = path.split("/")
		var name = [filen.length -1]
		var doc = {
			hash:JSON.parse(body).hash,
			updatedAt: day + ' ' + monthNames[monthIndex] + ' ' + year,
			path: path,
			signed: false,
			name: name,
			comingFrom: req.body.comingFrom
		}
		user.docs.push(doc)
		console.log('fetched user: '+user+' and doc: '+doc)
		user.save(function(err) {
			if (err)
				res.send(err);
		var ok = crypt(supersecret, path, 'newfile.dat',req.params.user_id)
		res.setHeader('status', 200)
		res.setHeader("Content-Type", "application/json;charset=UTF-8")
		res.json({ success:true , message: 'Docs saved', doc:doc });
		});
		});
		}else{
			return res.status(403).send({ 
			success: false, 
			message: 'upload did not work',
			response:response
		});
		}
		})
	});

// Keys api 
// ===============================================
router.route('/notarize/:users_id')
    .post(function(req, res) {
		var value = req.body.value	
		User.findOne({"uid": req.params.users_id}, function(err, user) {
		if (err || !user){
			return res.status(403).send({ 
	        success: false, 
	        message: 'user does not exist'
			});
		}
		var docs = []
		var check = 0
		var l = user.docs.length
		if(user.docs.length){
		for (i = 0; i < user.docs.length; i++) { 
		var d= user.docs[i]

			console.log(JSON.stringify(d.hash))
				console.log('i= '+i+' l= '+l)		
		request.post({url: BASE_URL+'/notarizeme', form: {'text':d.hash }},function (error, response, body) {
			// if(body.status == 'success'){
			docs.push(d.hash)
			console.log(JSON.stringify(d.hash))
			
		});
			check = check+1
		}
		console.log('check= '+check+' l= '+l)
		if(check == (l)){
			user.status = "doc_notarized"
			user.lastUpdated = Date.now()
			user.save()
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: docs + ' Notarized successfully' });	
		}
	}
	});

});

// new endpoints
//==============================

//Documents
//==========

router.route('/create_document/:user_id')
.post(function(req, res){
	var date = new Date();
	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	var endpoint = '/hashme'
	var base_url ='https://reghackto.herokuapp.com'
	var path = req.body.path
	request.post({url: base_url+endpoint, form:{file_url:path}},function (error, response, body) {
		console.log('response: '+JSON.stringify(body) )
		if ( JSON.parse(body).status == 'success') {
			console.log(body) 
			User.findOne({uid: req.params.user_id},
			function(err, user) {
				if (err || !user)
					res.send(err);
				var filen = path.split("/")
				var name = [filen.length -1]
				// create a sample document
				var document = new Document ({
					doc_id: Math.floor(Math.random()*90000) + 10000, 
					owner: req.params.user_id,
					from: req.params.user_id,
					to: req.params.to || null,
					path: req.params.path,
					file_hash: JSON.parse(body).hash,
					filename: name,
					status: "Pending"
				});
				document.save(function(err) {
					if (err)
						res.send(err);
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: 'Document registered', doc:document });
			});
		});
		}else{
			return res.status(403).send({ 
			success: false, 
			message: 'document was NOT registered',
			response:response
		});
	}
	})
});
router.route('/notarize_document/:users_id')
    .post(function(req, res) {
		var value = req.body.value	
		Document.findOne({"uid": req.params.users_id}, function(err, user) {
		if (err || !user){
			return res.status(403).send({ 
	        success: false, 
	        message: 'user does not exist'
			});
		}
		var docs = []
		var check = 0
		var l = user.docs.length
		if(user.docs.length){
		for (i = 0; i < user.docs.length; i++) { 
		var d= user.docs[i]

			console.log(JSON.stringify(d.hash))
				console.log('i= '+i+' l= '+l)		
		request.post({url: BASE_URL+'/notarizeme', form: {'text':d.hash }},function (error, response, body) {
			// if(body.status == 'success'){
			docs.push(d.hash)
			console.log(JSON.stringify(d.hash))
			
		});
			check = check+1
		}
		console.log('check= '+check+' l= '+l)
		if(check == (l)){
			user.status = "doc_notarized"
			user.lastUpdated = Date.now()
			user.save()
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: docs + ' Notarized successfully' });	
		}
	}
	});

});
}// end
