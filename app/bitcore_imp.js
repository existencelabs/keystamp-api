// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./app/bitcore.js
//
// Keystamp-api bitcore implementation
// =============================================================================
var bitcore = require('bitcore');

module.exports = {
	// create a private key
	"create_PrivateKey": function(cb){
		var privateKey = new PrivateKey();
		return cb(privateKey)
	},
	// create a public key
	"create_publicKey": function(PrivateKey, cb){
		var publicKey = privateKey.toPublicKey();
		return cb(publicKey)
	},
	// create a xprv
	"create_HDPrivateKey": function (PrivateKey, cb){
		var HDPrivateKey = bitcore.HDPrivateKey;
		var hdPrivateKey = new HDPrivateKey();
		return cb(hdPrivateKey)  
	}

};
