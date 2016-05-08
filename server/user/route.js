var express = require('express');
var User = require('./user');

module.exports.init = function() {

	var routerApi = express.Router();

	// middleware to use for all requests
	routerApi.use(function(req, res, next) {
		console.log('Somebody uses our API');
		next();
	});

	// POST NEW USER http://localhost:3001/api/users
	routerApi.post('/users', function(req, res) {
		console.log(req.body);
		var user = new User();
		user.isRegistedCourse = req.body.isRegistedCourse;
		user.nickname = req.body.nickname;
		user.userId = req.body.userId;

		user.save(function(err) {
			if (err) {
				res.send(err);
			}
			res.json({
				message: 'User created!'
			});
		});

	});

	// GET ALL ITEMS http://localhost:8080/api/articles
	routerApi.get('/users', function(req, res) {
		User.find(function(err, user) {
			if (err) {
				res.send(err);
			}
			res.json(user);
		});
	});


	// GET ONE ITEM http://localhost:3001/api/users/:user_id
	routerApi.get('/users/:user_id', function(req, res) {
		 if (req.params.user_id) {
        User.find({ 'userId': req.params.user_id }, function (err, user) {
            res.json(user);
            console.log(user);
        });
        }

	});

	// PUT UPDATE ONE ITEM http://localhost:3001/api/users/:user_id
	routerApi.put('/users/:user_id', function(req, res) {
		User.findOneAndUpdate(
			{ 'userId': req.params.user_id},
			{ '$set':{'isRegistedCourse': true}},
			function(err, user) {
				if (err) throw err;
			});
		console.log('updated');
			res.json('Updated');

	});

	// DELETE ONE ITEM http://localhost:3001/api/users/:user_id
	routerApi.delete('/users/:user_id', function(req, res) {
		console.log('req.params.user_id');
		User.remove({
			_id: req.params.user_id
		}, function(err, user) {
			if (err) {
				res.send(err);
			}
			res.json({
				message: 'Successfully deleted'
			});
		});

	});

	return routerApi;

}


/*
//Create a usermodel for use later
var test = new userModel({
	user: "test",
	profileName: "test",
	isRegisted: false
});
console.log("me: " + test)

============== Create model in the DataBase ================
test.save(function(err, test) {
	console.log("saved?")
	if (err) {
		console.log("error");
		return console.error(err);
	}
	console.log("saved!")
});
console.log("after save");

============== Find all thing in the DataBase ================
userModel.find({}, function(err, users) {
  if (err) throw err;
  // object of all the users
  console.log(users + '||');
});

============== Find things in the Database by search a specific thing ================
userModel.find({
	profileName: 'teste'
}, function(err, user) {
	if (err) throw err;
	if (user == '') {
		console.log('User not found');
	} else {
		// object of the user
		console.log("USER: " + user);
	}
});

============== Find and Update ================
userModel.findOneAndUpdate({ user: 'Teste' }, { profileName: 'teste' }, function(err, user) {
	if (err) throw err;

	// we have the updated user returned to us
	console.log(user);
});
*/