// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// ./router/index.js
//
// Keystamp-api bitcore tester
// =============================================================================
var bitcore = require('./bitcore_imp')
module.exports = function (cb) {
		// bitcore test zone
		bitcore.create_PrivateKey(function(key, address){
			console.log('Bitcore prv key = '+key)
		bitcore.hash_sha256('blabla', function(hash){
			console.log('Bitcore hash = '+hash)
		bitcore.derive_HDPrivateKey(key, 55677, '/m/0', function(HDkey, keypath){
			console.log('Bitcore HDkey = '+HDkey)
			console.log('Bitcore keypath = '+keypath)
			})

		//bitcore-message test zone
		bitcore.sign_hash(key, hash, function(signature, details){
			console.log('Bitcore-message signature = '+signature)
			console.log('Bitcore-message details = '+details)
			//bitcore.notarize(signature, function(txid){
				//console.log('Bitcore tx = '+txid.toString())
				console.log('Bitcore address = '+address)
			bitcore.verify_signature(address, signature, hash, function(verified){
				console.log('Bitcore-message verified = '+verified)
				return cb()
				})
				})
			//})
	})
		})
}
