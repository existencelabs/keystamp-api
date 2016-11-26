var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserShema   = new Schema({
	name: String,
	role: String,
	user_id: String,
	user_key: {
		type: String,
		default: ""
	}
});

module.exports = mongoose.model('User', UserShema );
