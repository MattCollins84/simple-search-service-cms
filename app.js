var express = require('express'),
    async = require('async'),
    compression = require('compression'),
    cfenv = require('cfenv'),
    appEnv = cfenv.getAppEnv(),
    app = express(),
    path = require('path'),
    isloggedin = require('./lib/isloggedin.js'),
    homepage = require('./lib/homepage.js'),
    manage = require('./lib/manage.js'),
    edit = require('./lib/edit.js'),
    add = require('./lib/add.js'),
    insert = require('./lib/insert.js'),
    _ = require('underscore'),
    debug = require('debug')('seams')

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

  debug('homepage', 'start');
  var limit = req.query.limit || 10;
  var q = req.query.q || "*:*";
  var bookmark = req.query.bookmark || false;

  homepage.render({ limit: limit, q: q, bookmark: bookmark }, function(err, data) {
    
    if (err) {
      return res.send(err.reason);
    }

    // store this bookmark as the previous bookmark, so we can go back
    data.previousBookmark = req.query.bookmark;

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
  
  edit.process(req.params.id, req.body, function(err, data) {

    // parse the error
    if (err) {

      var errors = [];

      if (_.isArray(err)) {
        errors = err;
      }

      else if (!_.isUndefined(err.reason)) {
        errors.push(err.reason);
      }

      else {
        errors.push("Unknown error occured");
      }

      return res.status(404).send({ success: false, error: errors });
    }

    res.send({ success: true, data: data });

  })
      
});

// add a row
app.get('/add', isloggedin(), function (req, res) {

  add.render(function(err, data) {
    res.render('add', data)
  });
      
});

// submit inserts
app.post('/insert', isloggedin(), bodyParser, function (req, res) {
  
  insert.process(req.body, function(err, data) {

    // parse the error
    if (err) {

      var errors = [];

      if (_.isArray(err)) {
        errors = err;
      }

      else if (!_.isUndefined(err.reason)) {
        errors.push(err.reason);
      }

      else {
        errors.push("Unknown error occured");
      }

      return res.status(404).send({ success: false, error: errors });
    }

    res.send({ success: true, data: data });

  })
      
});

// start server on the specified port and binding host
app.listen(appEnv.port, appEnv.bind, function() {

  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});