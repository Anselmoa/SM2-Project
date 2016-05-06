var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	nickname: String,
	userId: String,
	isRegistedCourse: Boolean
}, {
	collection: 'users',
	versionKey: false
});

module.exports = mongoose.model('User', UserSchema);