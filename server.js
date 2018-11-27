// server.js
// set up ======================================================================
// get all the tools we need
require('dotenv').load();
var express = require('express');
var exphbs = require('express-handlebars');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
//var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const MongoStore = require('connect-mongo')(session);
// configuration ===============================================================
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.HOST, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
}, function (err, db) {}); // connect to our database
require('./config/passport')(passport); // pass passport for configuration
// set up our express application
if (process.env.NODE_ENV == 'development') {
  var morgan = require('morgan');
  app.use(morgan('dev'))
  // log every request to the console
}
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({extended: true}));
//  handlebars configuration
var hbs = exphbs.create({
  helpers: {
    dateFormat: require('handlebars-dateformat'),
    ifEquals: function (arg1, arg2, options) {
      var a = new String(arg1).localeCompare(new String(arg2));
      return (!a)
        ? options.fn(this)
        : options.inverse(this)
    },
    trimString: function (text, length) {
      words = text.split(" ");
      new_text = text;
      if (words.length > length) {
        new_text = "";
        for (var i = 0; i <= length; i++) {
          new_text += words[i] + " ";
        }
        new_text = new_text.trim() + "..."
      }
      return new_text;
    }
  },
  defaultLayout: 'main',
  extname: 'hbs'
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs'); // set up hbs for templating
app.use(express.static(__dirname + '/public'));
// required for passport
const day = 8.64e+7;
const hour = 3.6e+6;
app.use(session({
  secret: process.env.SESSION_SECRET, // session secret
  resave: true,
  cookie: {
    httpOnly: false,
    secure: true
  },
  unset: 'destroy',
  saveUninitialized: true,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
//app.use(flash());  use connect-flash for flash messages stored in session
// SOCKET.IO ===================================================================
require('./socketEvents')(io);
// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
// error handle ================================================================
app.use(function (req, res, next) {
  res.status(404);
  if (req.accepts('html')) {
    res.render('404', {user: req.user});
    return;
  }
  // respond with json
  if (req.accepts('json')) {
    res.json({error: 'Not found'});
    return;
  }
  // default to plain-text. send()
  res.send('Not found');
});
// launch ======================================================================
http.listen(port, function () {
  console.log('The magic happens on port ' + port);
});