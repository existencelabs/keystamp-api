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
var User2   = require('../app/models/user2'); // get our mongoose model
var Tx   = require('../app/models/tx'); // get our mongoose model
var Document   = require('../app/models/document'); // get our mongoose model
var App   = require('../app/models/app'); // get our mongoose model
var request = require('request')
var crypt = require('../app/encrypt')
var notify = require('../app/notify')
var BASE_URL = config.KSTMP_CRYTO_BASE_URL

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

module.exports = function (supersecret, router) {
// Hash api
//========================================
// upload and encrypt
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
		User2.findOne({uid: req.params.user_id},
		function(err, user) {
			if (err || !user)
				res.send(err);
		var filen = path.split("/")
		var name = [filen.length -1]
		user.save(function(err) {
			if (err)
				res.send(err);
		var ok = crypt.upload(supersecret, path, 'newfile.dat',req.params.user_id, function(err){
					// create a sample document
				var document = new Document ({
					doc_id: Math.floor(Math.random()*90000) + 10000, 
					owner: req.params.user_id,
					from: req.params.user_id,
					to: null,
					path: __dirname+'/'+req.params.user_id+'/newfile.dat',
					file_hash: JSON.parse(body).hash,
					filename:  'newfile.dat',
					status: "Pending"
				});
			document.save()
			notify('success', req.params.user_id ,  'newfile.dat uploaded', function(err){
				if(err){
					return res.status(403).send({ 
						success: false, 
						message: 'notification failed'
					});
				}
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: 'Docs saved', doc:document });
		})
		})
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

//Documents
//===============================
// create
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
			User2.findOne({uid: req.params.user_id},
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
					to: req.body.to || null,
					path: path,
					file_hash: JSON.parse(body).hash,
					filename: name,
					status: "Pending"
				});
				document.save(function(err) {
					if (err)
						res.send(err);
			notify('success', req.params.users_id , document.filename+' uploaded', function(err){
				if(err){
					return res.status(403).send({ 
						success: false, 
						message: 'notification failed'
					});
				}
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: document.filename+' uploaded', doc:document });
			})
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
// sign
router.route('/sign_document/:users_id')
	.post(function(req, res) {
		var doc_id = req.body.doc_id
		//find the targeted document
		Document.findOne({"owner": req.params.users_id, "doc_id":doc_id}, function(err, doc) {
			if (err || !doc){
				return res.status(403).send({ 
				success: false, 
				message: 'document does not exist'
				});
			}
			doc.status = "signed"
			doc.save()
			notify('success', req.params.users_id , doc.filename + ' Signed succesfully', function(err){
				if(err){
					return res.status(403).send({ 
						success: false, 
						message: 'notification failed'
					});
				}
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: doc.filename + ' Signed succesfully', doc: doc});
		})
	});

});
// notarize a document
router.route('/notarize_document/:users_id')
	.post(function(req, res) {
		var doc_id = req.body.doc_id
		//find the targeted document
		Document.findOne({"owner": req.params.users_id, "doc_id":doc_id}, function(err, doc) {
			if (err || !doc){
				return res.status(403).send({ 
				success: false, 
				message: 'document does not exist'
				});
			}
		// send a notarize request to python api
		request.post({url: BASE_URL+'/notarizeme', form: {'text':doc.hash }},function (error, response, body) {
			// create a sample transaction to save the record
			var tx = new Tx ({ 
				filehash: doc.hash,
				txid: JSON.parse(body).txid,
				owner: req.params.users_id,
				path: doc.path,
				filename: doc.filename
			});
			doc.status = "notarized"
			doc.save()
			tx.save()
			notify('success', req.params.users_id , doc.filename + ' Notarized successfully', function(err){
				if(err){
					return res.status(403).send({ 
						success: false, 
						message: 'notification failed'
					});
				}
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: doc.filename + ' Notarized successfully', doc: doc, tx:tx});
		})
		});
	});
});
// notarize any text
router.route('/notarize_text/:users_id')
	.post(function(req, res) {
		var value = req.body.value
		var username = req.params.users_id
		// send a notarize request to python api
		request.post({url: BASE_URL+'/notarizeme', form: {'text':value }},function (error, response, body) {
			// create a sample transaction to save the record
			var tx = new Tx ({ 
				filehash: value,
				txid: JSON.parse(body).txid,
				owner: username ,
				path: "",
				filename: "",
				is_message: true
			});
			tx.save()
			notify('success', req.params.users_id , '" '+ value + ' " Notarized - txid: '+JSON.parse(body).txid, function(err){
				if(err){
					return res.status(403).send({ 
						success: false, 
						message: 'notification failed'
					});
				}
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message:'" '+ value + ' " Notarized successfully', value: value, tx:tx});
			})
	});
});
// verify document integrity by hashes
router.route('/verify_document/:users_id')
	.post(function(req, res) {
		var doc_id = req.body.doc_id

		//find the targeted document
		Document.findOne({"owner": req.params.users_id, "doc_id":doc_id}, function(err, doc) {
			if (err || !doc){
				return res.status(403).send({ 
				success: false, 
				message: 'document does not exist'
				});
			}
		//find the targeted document saved hash on the blockchain 
		Tx.findOne({"owner": req.params.users_id, "path":doc.path}, function(err, tx) {
		request.post({url: BASE_URL+'/get_hash_from_bc', form: {'txid':tx.txid }},function (error, response, body) {
			var true_hash = JSON.parse(body).hash
			var new_hash = doc.hash
			// then compare the two hashes for integrity
			if(true_hash && new_hash && true_hash === new_hash){
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: 'Integrity is confirmed', integrity: true, bc_hash: true_hash, new_hash: new_hash});
			}else{
				res.json({ 
				success: true, 
				integrity: false,
				message: 'Integrity in compromised',
				bc_hash: true_hash, 
				new_hash: new_hash
				});
			}
			})
		});
	});
	});
	
// notarize any text
router.route('/decrypt_file/:users_id')
	.post(function(req, res) {
		var path = req.body.path
		var username = req.params.users_id
		var key = req.body.key
		var filename= req.body.filename || username+"-"+Date.now()
		var ok = crypt.decrypt(key, path, filename, username, function(err){
			notify('success', username , path + ' encrypted succesfully successfully', function(err){
				if(err){
					return res.status(403).send({ 
						success: false, 
						message: 'notification failed'
					});
				}
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: path + ' encrypted succesfully successfully', value: value, tx:tx});
			})
	});
});
	
}// end
