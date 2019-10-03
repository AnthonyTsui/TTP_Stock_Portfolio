const express = require('express');
const port = 8000
const axios = require('axios');
const app = express()
const request = require('request');

const alphaapi = 'LQYZUXEHKSVF5KQW';

var session = require('express-session');

var bodyParser = require('body-parser')


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static("public"));

app.use(session({
	key: 'user_sid',
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true,
    cookie: {
        expires: 60000
    }
}));

/*
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
        res.clearCookie('user_sid');        
    }
    next();
});
*/

//Authentication function for sessions

var auth = function(req, res, next) {
  //if (req.session && req.session.user === "amy" && req.session.admin)
  if (req.session && req.session.admin)
    return next();
  else
    return res.sendStatus(401);
	// need to change to redirect
};

require('./server/routes')(app);

app.set('view engine', 'ejs');




app.get('/', function(req, res){
	//res.json({Message: 'beginning of api'});
	res.render('pages/home',{
		login:req.session.admin,
	});
});

app.get('/login', function(req, res){
	//res.json({Message: 'beginning of api'});
	res.render('pages/home',{
		login:req.session.admin,
	});
});

//Login and awful authentication below

app.post('/login', function(req, res){

	//need to change email to lowercase 

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
				req.session.user = parsed.email;
				req.session.admin = true;
				req.session.balance = parsed.balance;
				//console.log("Parsed is: " + parsed);
				console.log("Response: " + response.content)

				console.log(req.session.user);
				console.log('Verified login');
				res.redirect('/dashboard');
			}
			else{
				//console.log("null!")
				//console.log("body is " + parsed.password);
				
				res.render('pages/home',{
					login:req.session.admin,
				});
				
			}
			
		}
	})
});

//Registration logic below 

app.get('/register', function(req, res){
	res.render('pages/register',{
		login:req.session.admin,
	});
})

app.post('/register', function(req, res){

	//need to change email to lowercase 

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
		 		res.render('pages/home',{
		 			login:req.session.admin,
		 		});
		 	}
		 	else
		 	{
		 		
		 		//console.log("success!")
		 		//console.log(response)
		 		//console.log(response);
		 		res.render('pages/home',{
		 			login:req.session.admin,
		 		});
		 	}

	})
});


app.get('/dashboard', auth, function (req, res) {
    //res.send("You can only see this after you've logged in.");
    res.render('pages/dashboard',{
    	login:req.session.admin,
    	currbalance: req.session.balance,
    });
});



app.post('/buystocks',  function(req, res){

	//need to change email to lowercase 

	let checkurl = 'http://localhost:8000/api/checkstocks'
	let createurl = 'http://localhost:8000/api/userstocks'
	let updateurl = 'http://localhost:8000/api/updatestocks'

	const alphaurl1 = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
	const alphaurl2 = '&datatype=json&apikey=LQYZUXEHKSVF5KQW'

	request(alphaurl1 + req.body.stocksymbol + alphaurl2, function(error,response,body){
			//console.log('error :', error);
			//console.log('response:', response.statusCode);
			console.log(body);
			var parsed = JSON.parse(body);
			
			if (body.length <= 155){
				res.status(200).send({
  				message: "Error no such stock",})
			}
			else {
				console.log("Succes on vantage api call")
				console.log(parsed["Global Quote"]["02. open"]);

				var stockopen = parseFloat(parsed["Global Quote"]["02. open"]);
				var stockprice = parseFloat(parsed["Global Quote"]["08. previous close"], 10);


				console.log("logged open is " + stockprice)
				console.log("logged price is " + stockprice)
				
				let checkuser = 'http://localhost:8000/api/login'
				request.post(checkuser,{
					form:{
						useremail:req.session.user
					}}, 
					function(error, response,body){
					var parsed = JSON.parse(body);
					var balance = parseFloat(parsed.balance);
					var totalprice = stockprice * parseInt(req.body.stockamount,10)

					console.log("Body is: " + body)
					console.log("Balance is : " + parsed.balance)
					console.log("Totalprice is : " + totalprice)

					if (totalprice > balance){
						res.status(200).send({
  						message: "Not enough money",})
					}

					else {
						let updatebalance = 'http://localhost:8000/api/userupdate';
						request.post(updatebalance,{
							form:{
								useremail: req.session.user,
								totalprice: totalprice,
							}},
							 function(error, response, body){
							 	var parsed = JSON.parse(body)
							 	var currbalance = parseFloat(parsed.balance);
							 	req.session.balance = parsed.balance
							 	request.post(checkurl, {
									form:{
										useremail: req.session.user,
										stocksymbol: req.body.stocksymbol,}},
									 function(err, response,body){
									 	if(body === undefined || body.length <= 2){

									 		request.post(createurl,{
									 			form:{
									 				useremail: req.session.user,
									 				stocksymbol: req.body.stocksymbol,
									 				stockamount: req.body.stockamount,
									 			}},
									 			function(err, response, body){
									 				console.log("Success on creating");
									 				res.direct('/dashboard');
									 			}
									 		)
									 	}
									 	else
									 	{
									 		request.post(updateurl,{
									 			form:{
									 				useremail: req.session.user,
									 				stocksymbol: req.body.stocksymbol,
									 				stockamount: req.body.stockamount,
									 			}},
									 			function(err, response, body){
									 				var parsed = JSON.parse(body);
													var currbalance = parsed.balance;
													console.log("Balance: " + currbalance)
									 				console.log("Success on updating");
									 				res.redirect('/dashboard');
									 			}
									 		)
									 		
									 	}

								})

						})
					}
				})
			}
		})






	
});

app.get('/test', function(req, res){
	var test = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&datatype=json&apikey=LQYZUXEHKSVF5KQW'
	request(test, function(error,response,body){
			//console.log('error :', error);
			//console.log('response:', response.statusCode);
			console.log(body);
			let parsed = JSON.parse(body);
			//console.log(parsed["Global Quote"]["02. open"]);
			if (body.length <= 155){
				res.status(200).send({
  				message: "Error",})
			}
			else {
				console.log(parsed["Global Quote"]["08. previous close"])
				console.log(parseFloat(parsed["Global Quote"]["08. previous close"]))
				res.status(200).send({
			  				message: "Uh oh you shouldn't be here.",})
			}
		})

});



app.get('/logout', function (req, res) {
  req.session.destroy();
  //res.send("logout success!");
  res.redirect('/login');
});

app.get('*', (req, res) => res.status(200).send({
  message: "Uh oh you shouldn't be here.",
}));

module.exports = app;