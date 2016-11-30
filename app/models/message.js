var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageShema   = new Schema({
	from: String,
	to: String,
	creation_date : Date,
	status: String,
	content: String
});

module.exports = mongoose.model('Message', MessageShema);

