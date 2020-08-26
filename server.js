const express = require('express'),
  app = express(),
  cors = require('cors'),
  mongoose = require('mongoose'),
  Entry = require('./api/models/blogEntryModel'),
  bodyParser = require('body-parser'),
  CognitoExpress = require("cognito-express");

    const authenticatedRoute = express.Router();
 
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/Blogdb')

app.use(cors()); //enable cors on all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", authenticatedRoute);

const cognitoExpress = new CognitoExpress({
  region: "us-east-2",
  cognitoUserPoolId: "us-east-2_V6x1LueAa",
  tokenUse: "access", //Possible Values: access | id
  tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});

authenticatedRoute.use(function(req, res, next) {
	
	//I'm passing in the access token in header under key accessToken
	let accessTokenFromClient = req.headers.access_token;

	//Fail if token not present in header. 
	if (!accessTokenFromClient) return res.status(401).send("Access Token missing from header");

	try {
		cognitoExpress.validate(accessTokenFromClient, function(err, response) {
		
			//If API is not authenticated, Return 401 with error message. 
			if (err) return res.status(401).send(err);
			
			//Else API has been authenticated. Proceed.
			res.locals.user = response;
			next();
		});
	} catch (err) {
		if (err) return res.status(500).send(err);
	}

});

//Define your routes that need authentication check
authenticatedRoute.get("/test", function(req, res, next) {
	res.send(`Hi ${res.locals.user.username}, your API call is authenticated!`);
});

const blogRoutes = require('./api/routes/blogRoutes'); 
blogRoutes(app);

const homeRoutes = require('./api/routes/homeRoutes');
homeRoutes(app);

const port = process.env.PORT || 3000;
app.listen(port);
