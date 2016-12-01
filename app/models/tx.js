var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TxShema   = new Schema({
	filehash: String,
	txid: String,
	owner: Number,
	tx_date: {
		type: Date,
		default: Date.now()
	},
	is_message: {
		type: Boolean,
		default: false
	},
	path: String,
	filename: String
});

module.exports = mongoose.model('Transaction', TxShema);


