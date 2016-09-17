var express = require('express');
var app = express();
var bodyParser = require('body-parser');
require('./services/uberservice')();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/rest/sendMail', function(req, res){
	remindMe(req.body);
	res.send({
		message:"Success"
	});
});

app.listen(3000);