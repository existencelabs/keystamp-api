var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotificationShema   = new Schema({
	nid: String,
	type: String,
	owner: Number,
	messages: String,
	read: Boolean,
	createAt: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('Notification', NotificationShema);


