var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TxShema   = new Schema({
	filehash: String,
	txid: String,
	user: String,
	tx_date: {
		type: Date,
		default: Date.now()
	}
	path: String,
	filename: String
});

module.exports = mongoose.model('Transaction', TxShema);


