var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GroupShema   = new Schema({
	members: Array,
	admins: Array,
	master: String,
	createdAt: {
		type: Date,
		default: Date.now()
	},
	xpub: String,
	xprv: String,
	group_name: String,
	group_logo: String
});

module.exports = mongoose.model('Group', GroupShema);


