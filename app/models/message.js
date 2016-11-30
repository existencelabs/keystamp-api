var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageShema   = new Schema({
	from: String,
	to: String,
	creation_date : Date,
	_new: Boolean,
	message: String,
	path: String,
});

module.exports = mongoose.model('Message', MessageShema);

