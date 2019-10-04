
require('dotenv').config()
console.log(process.env.API_KEY)

const express = require('express');
const axios = require('axios');
const app = express()
const request = require('request');
const bcrypt = require('bcrypt');

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
        expires: 600000
    }
}));

//Authentication function for sessions

var auth = function(req, res, next) {
  if (req.session && req.session.admin)
    return next();
  else
  	req.session.error='Please login.'
  	return res.redirect('/login');
};

require('./server/routes')(app);

app.set('view engine', 'ejs');




app.get('/', function(req, res){
	//res.json({Message: 'beginning of api'});
	res.redirect('/login');
});

app.get('/login', function(req, res){
	//res.json({Message: 'beginning of api'});
	res.render('pages/home',{
		login:req.session.admin,
		errormessage: req.session.error,
	});
	if(req.session.error){
		delete req.session.error
	}
	
});

//Login 

app.post('/login', function(req, res){


	let posturl = 'http://localhost:'+process.env.PORT+'/api/login'

	let password = bcrypt.hashSync(req.body.userpassword,10);
	let email = req.body.useremail.toLowerCase();

	request.post(posturl, {form:{useremail:email}}, function(err, response, body){
		if(err)
		{

			res.render('pages/home');
		}
		else
		{
			let parsed = JSON.parse(body);

			if (parsed.password != null && (bcrypt.compareSync(req.body.userpassword, parsed.password))){

				req.session.user = parsed.email;
				req.session.admin = true;
				req.session.balance = parsed.balance;

				if(req.session.error){
					delete req.session.error
				}
				res.redirect('/dashboard');
	
			}
			else{
				req.session.error = 'Incorrect Login'
				res.redirect('/login');
				
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
	let posturl = 'http://localhost:'+process.env.PORT+'/api/register'
	let checkurl = 'http://localhost:'+process.env.PORT+'/api/login'

	let email = req.body.useremail.toLowerCase();
	let hash = bcrypt.hashSync(req.body.userpassword, 10);

	request.post(posturl, {
		form:{
		useremail: email, 
		userpassword: hash, 
		firstname: req.body.firstname, 
		lastname: req.body.lastname}},
		 function(err, response,body){
		 	let parsed = JSON.parse(body);
		 	if(parsed.errors != null){
		 		req.session.error = "This Email already has an account"
		 		res.redirect('/login')
		 	}
		 	else
		 	{
		 		
		 		req.session.error =""
		 		res.redirect('/login')
		 	}

	})
});

//Portfolio and transaction logic

app.get('/dashboard', auth, function (req, res) {
    let findstocks = 'http://localhost:'+process.env.PORT+'/api/findstocks'
   
    const alphaurl1 = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
	const alphaurl2 = '&datatype=json&apikey='+process.env.API_KEY 


    request.post(findstocks, {
    	form:{
    		useremail: req.session.user,
    	}},
    	function(error, response,body){

    		var allstocks = JSON.parse(body)

    		var promises = []

    		for(i = 0; i < allstocks.length; i++){
    			promises.push(new Promise(function(resolve, reject)
    			{
    				request(alphaurl1+allstocks[i][1]+alphaurl2, function(error, response, body){
    				var parsed = JSON.parse(body);

					try{
						resolve([parsed["Global Quote"]["09. change"] ,parseFloat(parsed["Global Quote"]["08. previous close"])]);
					}
					catch(err){
						req.session.error = "API Error, try again later and ensure you have less than 5 stocks due to API restrictions "
						res.redirect('/transactions')
					}
    				})
    			}))
    		}

    		Promise.all(promises).then(function(resolvedResults){
    				res.render('pages/dashboard',{
			    	login:req.session.admin,
			    	currbalance: req.session.balance,
			    	allstocks: allstocks,
			    	stockchange: resolvedResults,
			    	errormessage: req.session.error,
		    		});
		    		
		    		if(req.session.error){
	    				delete req.session.error;
	    			}
    		})
    })
});



app.post('/buystocks', auth, function(req, res){


	let checkurl = 'http://localhost:'+process.env.PORT+'/api/checkstocks'
	let createurl = 'http://localhost:'+process.env.PORT+'/api/userstocks'
	let updateurl = 'http://localhost:'+process.env.PORT+'/api/updatestocks'

	const alphaurl1 = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
	const alphaurl2 = '&datatype=json&apikey=' + process.env.API_KEY

	var transactionsymbol = req.body.stocksymbol

	request(alphaurl1 + req.body.stocksymbol + alphaurl2, function(error,response,body){
			
			console.log(body);
			var parsed = JSON.parse(body);
			


			if (body.length <= 155){
				req.session.error = "No such Stock, please try again"
				res.redirect('/dashboard');
			}
			else if(parsed["Global Quote"] === undefined) {
				req.session.error = "Too many API calls, please wait before trying again"
				res.redirect('/transactions');

			}
			else {

				var stockopen = parseFloat(parsed["Global Quote"]["02. open"]);
				var stockprice = parseFloat(parsed["Global Quote"]["08. previous close"]);
				
				let checkuser = 'http://localhost:'+process.env.PORT+'/api/login'
				request.post(checkuser,{
					form:{
						useremail:req.session.user
					}}, 
					function(error, response,body){
					var parsed = JSON.parse(body);
					var balance = parseFloat(parsed.balance);
					var totalprice = stockprice * parseInt(req.body.stockamount,10)


					if (totalprice > balance){
						req.session.error = "Not enough balance to purchase"
						res.redirect('/dashboard');
					}

					else {
						let createrecord = 'http://localhost:'+process.env.PORT+'/api/newtransactions';
						request.post(createrecord, {
							form:{
								useremail: req.session.user,
								stocksymbol: transactionsymbol,
								stockamount: parseInt(req.body.stockamount,10),
								stockprice: stockprice,
							}},
							function(error, response,body){
							})
						let updatebalance = 'http://localhost:'+process.env.PORT+'/api/userupdate';
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
									 				//console.log("Success on creating");
									 				res.redirect('/dashboard');
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

app.get('/transactions', auth, function (req, res) {
    let findstocks = 'http://localhost:'+process.env.PORT+'/api/usertransactions'
    request.post(findstocks, {
    	form:{
    		useremail: req.session.user,
    	}},
    	function(error, response,body){
    		var alltransactions = JSON.parse(body)
    		res.render('pages/transactions',{
	    	login:req.session.admin,
	    	alltransactions: alltransactions,
	    	errormessage: req.session.error,
	    	}) 
    		if(req.session.error){
    			delete req.session.error
    		}
    		
    })


});


/* Used for testing vantage API
app.get('/test', function(req, res){
	var test = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&datatype=json&apikey=
	request(test, function(error,response,body){
			let parsed = JSON.parse(body);
			if (body.length <= 155){
				res.status(200).send({
  				message: "Error",})
			}
			else {
				res.status(200).send({
			  				message: "Uh oh you shouldn't be here.",})
			}
		})

});
*/


app.get('/logout', function (req, res) {
  req.session.destroy();
  //res.send("logout success!");
  res.redirect('/login');
});

app.get('*', (req, res) => res.status(200).send({
  message: "Uh oh you shouldn't be here.",
}));

module.exports = app;