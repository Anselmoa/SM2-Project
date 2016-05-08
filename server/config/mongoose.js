module.exports.initDb = function() {

	var mongoose = require('mongoose');

/*============== Connect to the DataBase ================*/
	var url = 'mongodb://admin:pass@ds025180.mlab.com:25180/logins_todo';
	var db = mongoose.connect(url, function(err, res) {
		if (err) {
			console.log('Error connecting to: ' + 'url' + '.' + err);
		} else {
			console.log('Succeeded connected to: ' + url);
		}
	});
};