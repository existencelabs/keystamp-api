var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotificationShema   = new Schema({
	nid: String,
	type: String,
	owner: Number,
	messages: String,
	read: Boolean
});

module.exports = mongoose.model('Notification', NotificationShema);


