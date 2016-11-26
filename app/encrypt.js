// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// config.js
//
// Keystamp-api router
// =============================================================================
module.exports = function (key, file, filename){
	var encryptor = require('file-encryptor');
	// Encrypt file.
	encryptor.encryptFile(file, filename, key, function(err) {
	// Encryption complete.
});
}
