var express = require('express'),
    async = require('async'),
    compression = require('compression'),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    app = express(),
    path = require('path'),
    isloggedin = require('./lib/isloggedin.js'),
    homepage = require('./lib/homepage.js'),
    manage = require('./lib/manage.js')

// set the view engine to ejs
app.set('view engine', 'ejs');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// compress all requests
app.use(compression());

// posted body parser
var bodyParser = require('body-parser')({extended:true})

// home
app.get('/', isloggedin(), function (req, res) {

  homepage.render({}, function(err, data) {
    res.render('index', data)
  });
      
});

// manage a row
app.get('/manage/:id', isloggedin(), function (req, res) {

  manage.render({ id: req.params.id}, function(err, data) {
    res.render('manage', data)
  });
      
});

// submit edits
app.post('/edit/:id', isloggedin(), bodyParser, function (req, res) {
  
  console.log("editing", req.body._id)
  res.send(req.body);
      
});

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {

  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});