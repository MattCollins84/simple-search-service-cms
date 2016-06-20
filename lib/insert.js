const schema = require('./schema.js'),
      async = require('async'),
      getById = require('./search.js').byId,
      cloudant = require('./cloudant.js'),
      seamsdb = cloudant.db.use('seams')

const process = function(row, callback) {

  var actions = {};

  // load schema
  actions.schema = function(callback) {
    schema.load(callback)
  }

  async.parallel(actions, function(err, result) {
    
    if (err) {
      return callback(err);
    }

    // validate against our schema
    const errors = schema.validate(result.schema, row, true);

    // if we have some errors, return
    if (typeof errors == "object" && errors.length) {
      return callback(errors);
    }

    // if we're all good - insert this doc
    seamsdb.insert(row, function(err, data) {
      return callback(err, data);
    });

  })
  
}

module.exports = {
  process: process
}