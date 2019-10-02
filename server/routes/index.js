const usersController = require('../controllers').users;
const userstocksController = require('../controllers').userstocks;

module.exports = (app) => {
	app.get('/api', (req, res) => res.status(200).send({
		message: 'Welcome to the keysearches API',
	}));


	//Users Logic
	app.get('/api/users', usersController.list);

	app.post('/api/users', usersController.create);

	app.post('/api/login', usersController.retrieve);

	app.post('/api/register', usersController.create);


	//Userstocks Logic
	app.get('/api/userstocks', userstocksController.list);

	app.post('/api/userstocks', userstocksController.create);

	app.post('/api/findstocks', userstocksController.retrieve);

	app.post('/api/checkstocks', userstocksController.retrieveSpecific);

	app.post('/api/updatestocks', userstocksController.update);

};