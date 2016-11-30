var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserShema2   = new Schema({
	name: String,
	role: String,
	uid: String,
	email:String,
	phone: Number,
	last_pin: Number,
	assignedTo: String,
	status: String,
	lastUpdated:{
		type: Date,
		default: Date.now()
	},
	user_prv_key: {
		type: String,
		default: ""
	},
	user_pub_key: {
		type: String,
		default: ""
	}
});

module.exports = mongoose.model('User2', UserShema2 );

