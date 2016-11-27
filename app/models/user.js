var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserShema   = new Schema({
	name: String,
	role: String,
	assignedTo: String,
	child: Array,
	uid: String,
	email:String,
	phone: Number,
	last_pin: Number,
	status: String,
	lastUpdated:{
		type: Date,
		default: Date.now()
	},
	user_key: {
		type: String,
		default: ""
	},
	user_pub_key: {
		type: String,
		default: ""
	},
	docs:{
		type:Array
	}
});

module.exports = mongoose.model('User', UserShema );
