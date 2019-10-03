const express = require('express');
const port = 8000
const axios = require('axios');
const app = express()
const request = require('request');

const bcrypt = require('bcrypt');

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
        expires: 600000
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
  	return res.redirect('/login');
    //return res.sendStatus(401);
	// need to change to redirect
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

//Login and awful authentication below

app.post('/login', function(req, res){

	//need to change email to lowercase 

	let posturl = 'http://localhost:8000/api/login'

	let password = bcrypt.hashSync(req.body.userpassword,10);
	let email = req.body.useremail.toLowerCase();

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

			if (parsed.password != null && (bcrypt.compareSync(req.body.userpassword, parsed.password))){
				//console.log("Not null!")
				req.session.user = parsed.email;
				req.session.admin = true;
				req.session.balance = parsed.balance;
				//console.log("Parsed is: " + parsed);
				//console.log("Response: " + response.content)

				//console.log(req.session.user);
				//console.log('Verified login');
				if(req.session.error){
					delete req.session.error
				}
				res.redirect('/dashboard');
	
			}
			else{
				//console.log("null!")
				//console.log("body is " + parsed.password);
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

	//need to change email to lowercase 

	let posturl = 'http://localhost:8000/api/register'
	let checkurl = 'http://localhost:8000/api/login'

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
		 		//console.log("error on request " + err)
		 		//console.log("Duplicate email detected")
		 		req.session.error = "This Email already has an account"
		 		res.redirect('/login')
		 	}
		 	else
		 	{
		 		
		 		//console.log("success!")
		 		//console.log(response)
		 		//console.log(response);
		 		res.redirect('/login')
		 	}

	})
});


app.get('/dashboard', auth, function (req, res) {
    //res.send("You can only see this after you've logged in.");
    let findstocks = 'http://localhost:8000/api/findstocks'
   
    const alphaurl1 = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
	const alphaurl2 = '&datatype=json&apikey=LQYZUXEHKSVF5KQW' 


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
    				//console.log("Body is : " + body)
    				//console.log("Parsed is : " + parsed)
    				//console.log(parsed["Global Quote"]["09. change"]);
					//var stockopen = parseFloat(parsed["Global Quote"]["09. change"]);

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
    			//console.log(resolvedResults);
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

	//need to change email to lowercase 

	let checkurl = 'http://localhost:8000/api/checkstocks'
	let createurl = 'http://localhost:8000/api/userstocks'
	let updateurl = 'http://localhost:8000/api/updatestocks'

	const alphaurl1 = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='
	const alphaurl2 = '&datatype=json&apikey=LQYZUXEHKSVF5KQW'

	var transactionsymbol = req.body.stocksymbol

	request(alphaurl1 + req.body.stocksymbol + alphaurl2, function(error,response,body){
			//console.log('error :', error);
			//console.log('response:', response.statusCode);
			console.log(body);
			var parsed = JSON.parse(body);
			


			if (body.length <= 155){
				req.session.error = "No such Stock, please try again"
				res.redirect('/dashboard');
			}
			else if(parsed["Global Quote"] === undefined || typeof parsed["Gloal Quote"] === "undefined" ) {
				req.session.error = "Too many API calls, please wait before trying again"
				res.redirect('/transactions');

			}
			else {
				//console.log("Succes on vantage api call")
				//console.log(parsed["Global Quote"]["02. open"]);

				var stockopen = parseFloat(parsed["Global Quote"]["02. open"]);
				var stockprice = parseFloat(parsed["Global Quote"]["08. previous close"], 10);


				//console.log("logged open is " + stockprice)
				//console.log("logged price is " + stockprice)
				
				let checkuser = 'http://localhost:8000/api/login'
				request.post(checkuser,{
					form:{
						useremail:req.session.user
					}}, 
					function(error, response,body){
					var parsed = JSON.parse(body);
					var balance = parseFloat(parsed.balance);
					var totalprice = stockprice * parseInt(req.body.stockamount,10)

					//console.log("Body is: " + body)
					//console.log("Balance is : " + parsed.balance)
					//console.log("Totalprice is : " + totalprice)

					if (totalprice > balance){
						req.session.error = "Not enough balance to purchase"
						res.redirect('/dashboard');
					}

					else {
						let createrecord = 'http://localhost:8000/api/newtransactions';
						request.post(createrecord, {
							form:{
								useremail: req.session.user,
								stocksymbol: transactionsymbol,
								stockamount: parseInt(req.body.stockamount,10),
								stockprice: stockprice,
							}},
							function(error, response,body){
								//console.log("Transactions body is : " + body)
							})
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
													//console.log("Balance: " + currbalance)
									 				//console.log("Success on updating");
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
    //res.send("You can only see this after you've logged in.");
    let findstocks = 'http://localhost:8000/api/usertransactions'
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



app.get('/test', function(req, res){
	var test = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&datatype=json&apikey=LQYZUXEHKSVF5KQW'
	request(test, function(error,response,body){
			//console.log('error :', error);
			//console.log('response:', response.statusCode);
			//console.log(body);
			let parsed = JSON.parse(body);
			//console.log(parsed["Global Quote"]["02. open"]);
			if (body.length <= 155){
				res.status(200).send({
  				message: "Error",})
			}
			else {
				//console.log(parsed["Global Quote"]["08. previous close"])
				//console.log(parseFloat(parsed["Global Quote"]["08. previous close"]))
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