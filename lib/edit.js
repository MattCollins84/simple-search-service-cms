var schema = require('./schema.js'),
    async = require('async'),
    getById = require('./search.js').byId,
    cloudant = require('./cloudant.js'),
    seamsdb = cloudant.db.use('seams')

var process = function(id, row, callback) {

  var actions = {};

  // ID mismatch - something weird is going on
  if (id !== row._id) {
    return setImmediate(function() {
      return callback(["ID mismatch on edit"], null)
    })
  }

  // load schema
  actions.schema = function(callback) {
    schema.load(callback)
  }

  // pull by ID to manage conflicts
  actions.byId = function(callback) {
    getById(id, callback)
  }

  async.parallel(actions, function(err, result) {
    
    if (err) {
      return callback(err);
    }

    // validate against our schema
    var errors = schema.validate(result.schema, row, true);

    // if we have some errors, return
    if (typeof errors == "object" && errors.length) {
      return callback(errors);
    }

    // make sure we have the latest revision of this doc to manage conflicts
    row._rev = result.byId._rev

    // if we're all good - insert this doc
    seamsdb.insert(row, function(err, data) {
      return callback(err, data);
    });

  })
  
}

module.exports = {
  process: process
}