var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var AppShema   = new Schema({
	app_id: String,
	app_secret: String
});

module.exports = mongoose.model('App', AppShema );

