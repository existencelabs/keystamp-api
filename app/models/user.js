var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserShema   = new Schema({
	name: String,
	role: String,
	assignedTo: String,
	uid: String,
	email:String,
	user_key: {
		type: String,
		default: ""
	},
	docs:{
		type:Array
	}
});

module.exports = mongoose.model('User', UserShema );
