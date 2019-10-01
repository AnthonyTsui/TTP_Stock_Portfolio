const express = require('express');
const port = 8000
const axios = require('axios');
const app = express()

require('./server/routes')(app);

app.get('/', function(req, res){
	res.json({Message: 'beginning of api'});
});


app.get('*', (req, res) => res.status(200).send({
  message: "Uh oh you shouldn't be here.",
}));

module.exports = app;