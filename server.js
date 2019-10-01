const express = require('express');

const port = process.env.PORT || 8000

const axios = require('axios');

const app = express()

var router = express.Router()

app.get('/', function(req, res){
	res.json({Message: 'beginning of api'});
});

app.use('/api', router);

app.listen(port);
console.log('Starting nodejs server on port ' + port)


app.get('*', (req, res) => res.status(200).send({
  message: "Uh oh you shouldn't be here.",
}));

module.exports = app;