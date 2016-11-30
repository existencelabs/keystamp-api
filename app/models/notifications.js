var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotificationShema   = new Schema({
	type: String,
	user: String,
	messages: String,
	read: Boolean
});

module.exports = mongoose.model('Notification', NotificationShema);


