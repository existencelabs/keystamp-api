// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// encrypt.js
//
// Keystamp-api encryptor
// =============================================================================
module.exports = function (key, file, filename){
	console.log('encrypt | received= key: '+key+' file: '+file+' filename: '+filename)
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
				return false
			} else {
				console.log(filename+" Successfully Written to " + path);
				return true
			}
		});
	});
}
