var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var jwt = require('express-jwt');
var cors = require('cors');

app.use(cors());

//Verificar o auth0
var authCheck = jwt({
	secret: new Buffer('3YkvM_BCwzj1ABAyXDq0u0cjiYsJfgpGhXtXJoKGUOSjllIIPHpjDMrxCKTermeR', 'base64'),
	audience: 'tBojVxtAQCzy3jnYAKIRD5gbMh9SrUqP'
});

require('./server/config/mongoose').initDb();

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
app.use("/node_modules" ,express.static(__dirname + '/node_modules'));
app.use('/bower_components',express.static(__dirname + '/bower_components'));

app.use('/api', authCheck, require('./server/user/route').init());

app.get('/', function (req, res) {
		console.log('hello');
		res.sendFile('/index.html');
})

app.listen((process.env.PORT || 3001), function(){
  console.log('listening on *:5000');
});

console.log("Listening 3001");