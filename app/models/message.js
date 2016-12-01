var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageShema   = new Schema({
	owner: Number,
	from: String,
	to: String,
	creation_date : {
		type: Date,
		default: Date.now()
	},
	_new: Boolean,
	message: String,
	path: String,
});

module.exports = mongoose.model('Message', MessageShema);

