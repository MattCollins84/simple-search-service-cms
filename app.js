const express = require('express'),
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
    del = require('./lib/delete.js'),
    _ = require('underscore'),
    debug = require('debug')('seams'),
    parseErrors = require('./lib/errors.js').parse

// set the view engine to ejs
app.set('view engine', 'ejs');

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// compress all requests
app.use(compression());

// posted body parser
const bodyParser = require('body-parser')({extended:true})

// home
app.get('/', function (req, res) {

  debug('homepage', 'start');
  const limit = req.query.limit || 10;
  const q = req.query.q || "*:*";
  const bookmark = req.query.bookmark || "";

  var opts = { 
    limit: limit, 
    q: q, 
    bookmark: bookmark
  }

  if (req.query.sort) {
    opts.sort = '"'+req.query.sort+'"'
  }

  homepage.render(opts, function(err, data) {
    
    if (err) {
      const errors = parseErrors(err)
      return res.status(404).send({ success: false, error: errors });
    }

    // do we want to render just the extra rows, or the whole page?
    if (req.query.partial) {
      return res.render('partials/rows', data);
    }

    return res.render('index', data);

  });
      
});

// manage a row
app.get('/manage/:id', isloggedin(), function (req, res) {

  manage.render({ id: req.params.id}, function(err, data) {
    return res.render('manage', data)
  });
      
});

// submit edits
app.put('/row/:id', isloggedin(), bodyParser, function (req, res) {
  
  edit.process(req.params.id, req.body, function(err, data) {

    if (err) {
      const errors = parseErrors(err)
      return res.status(404).send({ success: false, error: errors });
    }

    return res.send({ success: true, data: data });

  })
      
});

// add a row
app.get('/add', isloggedin(), function (req, res) {

  add.render(function(err, data) {
    
    if (err) {
      const errors = parseErrors(err)
      return res.status(404).send({ success: false, error: errors });
    }

    return res.render('add', data);

  });
      
});

// submit inserts
app.post('/row', isloggedin(), bodyParser, function (req, res) {
  
  insert.process(req.body, function(err, data) {

    if (err) {
      const errors = parseErrors(err)
      return res.status(404).send({ success: false, error: errors });
    }

    return res.send({ success: true, data: data });

  })
      
});

// delete a row
app.delete('/row/:id', isloggedin(), function (req, res) {

  del.process(req.params.id, function(err, data) {
    
    // parse the error
    if (err) {
      const errors = parseErrors(err)
      return res.status(404).send({ success: false, error: errors });
    }

    return res.send({ success: true, data: data });

  });
      
});

// start server on the specified port and binding host and output a message
app.listen(appEnv.port, appEnv.bind, function() {

  console.log("server starting on " + appEnv.url);

});

require("cf-deployment-tracker-client").track();