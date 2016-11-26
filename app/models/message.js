var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageShema   = new Schema({
	from: String,
	to: String,
	creation_date : Date,
	sign_date: Date,
	confirm_date: Date,
	url: String,
	status: String,
	message: String
});

module.exports = mongoose.model('Message', MessageShema);

