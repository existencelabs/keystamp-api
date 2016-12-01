// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// encrypt.js
//
// Keystamp-api encryptor
// =============================================================================
var encryptor = require('file-encryptor');
var request =require('request')

module.exports = {
	"upload": function (key, file, filename, user, cb){
	var options = { algorithm: 'aes256' };
	console.log('upload - key: '+key+' file: '+file+' filename: '+filename)
	var fs = require('fs')
	request.get('https://bitcoin-outlet.s3.amazonaws.com/qTdmWd8MrGWTbC9Yp/pdf-sample.pdf',function (error, response, body) {
		console.log('request got : '+JSON.stringify(response))
	}).pipe(fs.createWriteStream('./tmp/message.pdf'));;
	encryptor.encryptFile('./tmp/message.pdf', filename, key, function(err) {
		// Encryption complete.
		var path = './tmp/'+filename;
		var data = filename;
		var dir = './tmp/'+user+'/'
		var fs = require('fs');

		if (!fs.existsSync(dir)){
			fs.mkdirSync(dir);
		}
		fs.rename('./'+filename, dir+filename, function (err) {
 
			if (err) {
				console.error("write error:  " + err.message);
				return cb(err)
			} else {
				console.log(filename+" Successfully Written to " + path);
				return cb(null)
			}
		});
		});
	},
	"encrypt": function (key, path, newname, user, cb , opts){
		var options = {};
		if (opts){
			options = opts
		}else{
			options = { algorithm: 'aes256' }
		}
		encryptor.encryptFile(path, newname, key, options, function(err) {
			if (err){
				return cb(err)
			}
			else cb(null)
	})
	},
	"decrypt": function (key, path, newname, user, cb, opts){
		var options = {};
		if (opts){
			options = opts
		}else{
			options = { algorithm: 'aes256' }
		}
		encryptor.decryptFile(path, newname, key, options, function(err) {
			if (err){
				return cb(err)
			}
			else cb(null)
	})
	}
}//end
