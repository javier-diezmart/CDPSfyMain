var mongoose = require('mongoose'),
	Schema = mongoose.Schema;


var trackSchema = new Schema({
	name: {type: String},
	caract: {type: String},
	url: {type: String}
	//image: {type: String}
});

module.exports = mongoose.model('TRACKS', trackSchema)