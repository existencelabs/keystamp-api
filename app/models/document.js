var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DocumentShema   = new Schema({
	from: String,
	to: String,
	path: String,
	file_hash: String,
	tx_id: String,
	filename: String,
	status: String
});

module.exports = mongoose.model('Document', DocumentShema );


