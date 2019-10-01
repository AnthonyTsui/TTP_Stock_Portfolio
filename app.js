const express = require('express');
const port = 8000
const axios = require('axios');
const app = express()
const request = require('request');

var bodyParser = require('body-parser')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static("public"));


require('./server/routes')(app);

app.set('view engine', 'ejs');


app.get('/', function(req, res){
	//res.json({Message: 'beginning of api'});
	res.render('pages/home');
});

//Login and awful authentication below

app.post('/login', function(req, res){

	let posturl = 'http://localhost:8000/api/login'

	let password = req.body.userpassword;
	let email = req.body.useremail;

	request.post(posturl, {form:{useremail:email}}, function(err, response, body){
		//console.log("We are posting to " + posturl + "Using the credentials: " + password + " " + email );
		if(err)
		{
			//console.log("error on request " + posturl)
			res.render('pages/home');
		}
		else
		{
			//console.log("success on request " + posturl)
			let parsed = JSON.parse(body);

			if (parsed.password != null && parsed.password == password){
				//console.log("Not null!")
				res.render('pages/index');
			}
			else{
				//console.log("null!")
				//console.log("body is " + parsed.password);
				
				res.render('pages/home');
				
			}
			
		}
	})
});

//Registration logic below 

app.get('/register', function(req, res){
	res.render('pages/register');
})

app.post('/register', function(req, res){
	let posturl = 'http://localhost:8000/api/register'
	let checkurl = 'http://localhost:8000/api/login'

	request.post(posturl, {
		form:{
		useremail: req.body.useremail, 
		userpassword: req.body.userpassword, 
		firstname: req.body.firstname, 
		lastname: req.body.lastname}},
		 function(err, response,body){
		 	let parsed = JSON.parse(body);
		 	if(parsed.errors != null){
		 		console.log("error on request " + err)
		 		console.log("Duplicate email detected")
		 		res.render('pages/register');
		 	}
		 	else
		 	{
		 		
		 		//console.log("success!")
		 		//console.log(response)
		 		//console.log(response);
		 		res.render('pages/index');
		 	}

	})
});


app.get('*', (req, res) => res.status(200).send({
  message: "Uh oh you shouldn't be here.",
}));

module.exports = app;