var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Firmshema   = new Schema({
	name: String,
	sector: String,
	administrator: String,
	firm_id: String,
	firm: {
		type: String,
		default: ""
	}
});

module.exports = mongoose.model('Firm', Firmshema);

