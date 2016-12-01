// KeystampAPI
// =============================================================================
// Author : Jean-Philippe beaudet @s3r3nity
//
// notify.js
//
// Keystamp-api demo notifications method
// =============================================================================


module.exports = function (type, uid, msg, cb){
var mongoose   = require('mongoose');
var Notification   = require('../app/models/notifications'); // get our mongoose model
	// create a sample notification
	var notification = new Notification ({ 
		nid: Math.floor(Math.random()*90000) + 10000,
		type: type,
		owner: uid,
		messages: msg,
		read: false
	});
	
	// save the sample notification
	notification.save(function(err) {
		if (err) {
			return cb(err, null)
		}
		return cb(null, notification)
	});
}

