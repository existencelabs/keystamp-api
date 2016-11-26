// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// encrypt.js
//
// Keystamp-api encryptor
// =============================================================================
module.exports = function (key, file, filename){
	var encryptor = require('file-encryptor');
	var fs = require('fs')
	// Encrypt file.
	encryptor.encryptFile(file, filename, key, function(err) {
		// Encryption complete.
		var path = "../tmp/";
		var data = filename;

		fs.writeFile(path, data, function(error) {
			if (error) {
				console.error("write error:  " + error.message);
			} else {
				console.log(filename+" Successfully Written to " + path);
			}
		});
	});
}
