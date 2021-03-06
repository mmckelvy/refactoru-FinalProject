// Module dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

// All environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({
	secret: 'leverageyourvalue',
	cookie: { maxAge: 1000*60*60 }
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Call the route handler; connect to the relevant Mongo database.
require('./routes/routelist.js')(app);
MongoURL = process.env.MONGOHQ_URL || 'mongodb://localhost/ValuationProject'; 
mongoose.connect(MongoURL);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
