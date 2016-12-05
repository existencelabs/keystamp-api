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
var bitcore=require('../app/bitcore_imp')
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
	var key = req.body.key
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
		var ok = crypt.upload(key, path, 'newfile.dat',req.params.user_id, function(err){
					// create a sample document
				var document = new Document ({
					doc_id: Math.floor(Math.random()*90000) + 10000, 
					owner: req.params.user_id,
					from: req.params.user_id,
					to: null,
					path: __dirname+'/'+req.params.user_id+'/newfile.dat',
					file_hash: JSON.parse(body).hash,
					filename:  'newfile.dat',
					status: "Pending",
					encrypted :true
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
		console.log('response: '+body )
		if ( JSON.parse(body).status == 'success') {
			console.log(body) 
			User2.findOne({uid: req.params.user_id},
			function(err, user) {
				if (err || !user)
					res.send(err);
				var filen = path.split("/")
				var name = filen[filen.length -1]
				// create a sample document
				var document = new Document ({
					doc_id: Math.floor(Math.random()*90000) + 10000, 
					owner: req.params.user_id,
					from: req.params.user_id,
					to: req.body.to || null,
					path: path,
					filehash: JSON.parse(body).hash,
					filename: name,
					status: "Pending",
					encrypted:false
					
				});
				document.save(function(err) {
					if (err)
						res.send(err);
			notify('success', req.params.user_id , document.filename+' uploaded', function(err){
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
// notarize a document while logged
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
			hash = doc.filehash
		// send a notarize request to python api
		request.post({url: BASE_URL+'/notarizeme', form: {'text':doc.filehash }},function (error, response, body) {
			// create a sample transaction to save the record
			console.log(body)
			var tx = new Tx ({ 
				filehash: hash,
				txid: JSON.parse(body).txid || '81b7a6359110d0d3534b8c15d43d512f6de30d5a1b6eba220975f9c12e7bc5a3',
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
// notarize a document while unlogged
router.route('/notarize')
	.post(function(req, res) {
		var path = req.body.path
		var signature1 = req.body.signature1
		var signature2 = req.body.signature2
		// hash the file first
		bitcore.hash_sha256(path,  function(filehash){
			// then hash the filehash and the 2  signature of the same file  
			bitcore.hash_sha256('KEYSTAMP'+'&&'+filehash+'&&'+signature1+'&&'+signature2,  function(final_hash){
			// finally send a notarize request to python api
			request.post({url: BASE_URL+'/notarizeme', form: {'text':final_hash }},function (error, response, body) {
				console.log(body)
				if (JSON.parse(body).txid){
				var txid = JSON.parse(body).txid
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: path + ' timestamped txid: '+txid, final_hash:final_hash, txid:txid});
			}else{
				var txid = '81b7a6359110d0d3534b8c15d43d512f6de30d5a1b6eba220975f9c12e7bc5a3'
				res.setHeader('status', 304)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: 'tx failed to be broadcast please try again...', final_hash:final_hash, txid:txid});
			}
			})
		})
	})
});
// verify a document while unlogged with the rwo signature file url and txid
router.route('/verify_by_signature')
	.post(function(req, res) {
		var txid= req.body.txid
		var path = req.body.path
		var signature1 = req.body.signature1
		var signature2 = req.body.signature2
		// hash the file first
		bitcore.hash_sha256(path,  function(filehash){
			// then hash the filehash and the 2  signature of the same file  
			bitcore.hash_sha256('KEYSTAMP'+'&&'+filehash+'&&'+signature1+'&&'+signature2,  function(final_hash){
			// finally send a notarize request to python api
			request.post({url: BASE_URL+'/get_hash_from_bc', form: {'txid':txid }},function (error, response, body) {
				if (JSON.parse(body).hash){
				console.log(body)
				var hash= JSON.parse(body).hash
				if (hash === final_hash){
					res.setHeader('status', 200)
					res.setHeader("Content-Type", "application/json;charset=UTF-8")
					res.json({ success:true , message: 'hash: '+hash+' and '+final_hash+' match ', hash:hash, final_hash:final_hash, txid:txid});
				}else{
					res.setHeader('status', 200)
					res.setHeader("Content-Type", "application/json;charset=UTF-8")
					res.json({ success:true , message: 'hash: '+hash+' and '+final_hash+' do NOT match ', final_hash:final_hash, txid:txid});
				}
			}else{
				res.setHeader('status', 304)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:false , message: 'tx was not found...', final_hash:final_hash, txid:txid});
			}
			})
		})
	})
});
// verify a document while unlogged with final hash of the proof 
router.route('/verify_by_hash')
	.post(function(req, res) {
		var txid= req.body.txid
		var final_hash = req.body.hash
		// finally send a notarize request to python api
		request.post({url: BASE_URL+'/get_hash_from_bc', form: {'txid':txid }},function (error, response, body) {
			if (JSON.parse(body).hash){
			console.log(body)
			var hash= JSON.parse(body).hash
			if (hash === final_hash){
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: 'hash: '+hash+' and '+final_hash+' match ', hash:hash, final_hash:final_hash, txid:txid});
			}else{
				res.setHeader('status', 200)
				res.setHeader("Content-Type", "application/json;charset=UTF-8")
				res.json({ success:true , message: 'hash: '+hash+' and '+final_hash+' do NOT match ', final_hash:final_hash, txid:txid});
			}
		}else{
			res.setHeader('status', 304)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:false , message: 'tx was not found...', final_hash:final_hash, txid:txid});
		}
	})
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
// New bitcore endpoints
// ==================================
// Bitcore Keys api

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
// Sign, Hash verify and notarize from bitcore  
// ==================================
// sign text or file with a public key while logged
router.route('/sign_file/:users_id')
	.post(function(req, res) {
		var path = req.body.path
		var username = req.params.users_id
		var key = req.body.key
		bitcore.hash_sha256(path,  function(hash){
			bitcore.sign_hash(key, hash,  function(signature, details){
			notify('success', username , path + ' signed succesfully successfully with key: '+key+' signature: '+signature, function(err){
				if(err){
					return res.status(403).send({ 
						success: false, 
						message: 'notification failed'
					});
				}
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: path + ' signed succesfully successfully with key: '+key+' signature: '+signature, signture:signature, key:key});
			})
	});
		});
});
// sign text or file with a public key while unlogged
router.route('/sign_file_demo')
	.post(function(req, res) {
		var path = req.body.path
		var key = req.body.key
		bitcore.hash_sha256(path,  function(hash){
			bitcore.sign_hash(key, hash,  function(signature, details){
			res.setHeader('status', 200)
			res.setHeader("Content-Type", "application/json;charset=UTF-8")
			res.json({ success:true , message: path + ' signed succesfully successfully with key: '+key+' signature: '+signature, signature:signature, key:key});
			})
		});
});
}// end
