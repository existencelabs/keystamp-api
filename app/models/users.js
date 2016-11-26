var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserShema   = new Schema({
	fullname: String,
	firstname: String,
	lastname: String,
	user_id: String,
	user_key: String
});

module.exports = mongoose.model('User', UserShema );
