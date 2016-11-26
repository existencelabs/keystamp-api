// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// encrypt.js
//
// Keystamp-api encryptor
// =============================================================================
module.exports = function (key, file, filename, user){
	var request =require('request')
	console.log('encrypt | received= key: '+key+' file: '+file+' filename: '+filename)
	var encryptor = require('file-encryptor');
	var fs = require('fs')
	request.get('https://bitcoin-outlet.s3.amazonaws.com/qTdmWd8MrGWTbC9Yp/pdf-sample.pdf',function (error, response, body) {
		console.log('request got : '+JSON.stringify(response))
		//fs.writeFile('./tmp/message.pdf', JSON.stringify(body), function (err) {
			//if (err) throw err;
		//	console.log('It\'s saved!');
		//});
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
				return false
			} else {
				console.log(filename+" Successfully Written to " + path);
				return 'success'
			}
		});
				
	});
}
