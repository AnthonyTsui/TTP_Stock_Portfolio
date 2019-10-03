const usersController = require('../controllers').users;
const userstocksController = require('../controllers').userstocks;
const transactionsController = require('../controllers').usertransactions;

module.exports = (app) => {
	app.get('/api', (req, res) => res.status(200).send({
		message: 'Welcome to the keysearches API',
	}));


	//Users Logic
	app.get('/api/users', usersController.list);

	app.post('/api/users', usersController.create);

	app.post('/api/login', usersController.retrieve);

	app.post('/api/register', usersController.create);

	app.post('/api/userupdate', usersController.update);


	//Userstocks Logic
	app.get('/api/userstocks', userstocksController.list);

	app.post('/api/userstocks', userstocksController.create);

	app.post('/api/findstocks', userstocksController.retrieve);

	app.post('/api/checkstocks', userstocksController.retrieveSpecific);

	app.post('/api/updatestocks', userstocksController.update);

	//Usertransactions Logic
	app.get('/api/alltransactions', transactionsController.list);

	app.post('/api/usertransactions', transactionsController.retrieve);

	app.post('/api/newtransactions', transactionsController.create);

};