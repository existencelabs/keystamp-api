var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DocumentShema   = new Schema({
	doc_id: String,
	owner: String,
	from: String,
	to: String,
	path: String,
	file_hash: String,
	filename: String,
	status: String,
	lastUpdated: {
		type: Date,
		default: Date.now()
	},
	encypted: {
		type: Boolean,
		default: false
	}
	
});

module.exports = mongoose.model('Document', DocumentShema );


