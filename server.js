const express = require("express"),
  app = express(),
  cors = require("cors"),
  mongoose = require("mongoose"),
  Entry = require("./api/models/blogEntryModel"),
  bodyParser = require("body-parser"),
  CognitoExpress = require("cognito-express");

const nodemailer = require("nodemailer");
const authenticatedRoute = express.Router();

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/Blogdb");

app.use(cors()); //enable cors on all requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api", authenticatedRoute);

const transporter = nodemailer.createTransport({
  port: 465, // true for 465, false for other ports
  host: "smtp.gmail.com",
  auth: {
    user: "rolzing.sp4m@gmail.com",
    pass: "ygvegtzytxxcpoxu",
  },
  secure: true,
});

const cognitoExpress = new CognitoExpress({
  region: "us-east-2",
  cognitoUserPoolId: "us-east-2_V6x1LueAa",
  tokenUse: "access", //Possible Values: access | id
  tokenExpiration: 3600000, //Up to default expiration of 1 hour (3600000 ms)
});

authenticatedRoute.use(function (req, res, next) {
  //I'm passing in the access token in header under key accessToken
  let accessTokenFromClient = req.headers.access_token;

  //Fail if token not present in header.
  if (!accessTokenFromClient)
    return res.status(401).send("Access Token missing from header");

  try {
    cognitoExpress.validate(accessTokenFromClient, function (err, response) {
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

app.post("/sendEmail", (req, res) => {
  const { to, subject, text, name } = req.body;

  if (!to || !subject || !text || !name) {
    return res.status(400).json({
      status: "400 Bad Request",
      message: "Missing required fields: to or subject or text",
    });
  }

  const mailData = {
    from: "rolzing.sp4m@gmail.com",
    to: "ric.lohern@gmail.com",
    subject: subject,
    text: text,
    name: name,
    html: `<b>Hey Richard! </b> <br> 
    <p>${name}:
    ${text}</p> </br>
    <p>${to}</p>`,
  };

  transporter.sendMail(mailData, function (err, info) {
    if (err) return console.log(err);
    else
      res
        .status(200)
        .send({status: "200", message: "mail send", message_id: info.messageId });
  });
});

const blogRoutes = require("./api/routes/blogRoutes");
blogRoutes(app, authenticatedRoute);

const homeRoutes = require("./api/routes/homeRoutes");
homeRoutes(app, authenticatedRoute);

const port = process.env.PORT || 3000;
app.listen(port);
