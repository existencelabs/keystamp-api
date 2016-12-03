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
	// test transaction
	"test_tx": function(key, cb){
		var privateKey = new bitcore.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
		var utxo = {
			"txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
			"outputIndex" : 0,
			"address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
			"script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
			"satoshis" : 50000
			};

			var transaction = new bitcore.Transaction()
			.from(utxo)
			.to('1Gokm82v6DmtwKEB8AiVhm82hyFSsEvBDK', 15000)
			.sign(key);
		return cb(transaction)
	},
	// KEYS
	// ====================
	// create a private key
	"create_PrivateKey": function(cb){
		var privateKey = new bitcore.PrivateKey();
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
		return cb(hdPrivateKey.xprivkey)  
	},
	//assign a derived key from master (return key, path[ m/uid/uid])
	"derive_HDPrivateKey": function (master, keyid, cb){
		var parent = new bitcore.HDPrivateKey();
		var child = parent.derive(keyid, true);
		return cb(child.xprivkey)  
	},
	// 
	// CRYPTO
	// ====================
	// generate hash from file/text
	"hash_sha256": function (value, cb){
		var val = new Buffer(value);
		var hash = bitcore.crypto.Hash.sha256(val);
		var bn = bitcore.crypto.BN.fromBuffer(hash);
		var final = new bitcore.PrivateKey(bn).toString();
		return cb(final)  
	},
	// sign hash (message) (bitcore-message)
	// verify message
	// notarize ( send signed hash in OP_RETURN field) OP_RETURN tx
	"notarize": function (value, cb){
		var privateKey = new bitcore.PrivateKey('L1uyy5qTuGrVXrmrsvHWHgVzW9kKdrp27wBC7Vs6nZDTF2BRUVwy');
		var utxo = {
		"txId" : "115e8f72f39fad874cfab0deed11a80f24f967a84079fb56ddf53ea02e308986",
		"outputIndex" : 0,
		"address" : "17XBj6iFEsf8kzDMGQk5ghZipxX49VXuaV",
		"script" : "76a91447862fe165e6121af80d5dde1ecb478ed170565b88ac",
		"satoshis" : 50000
		};
		var transaction = new bitcore.Transaction()
			.from(utxo)
			.addData(value) // Add OP_RETURN data
			.sign(privateKey);
		return cb(utxo.txId)  
	}
};
