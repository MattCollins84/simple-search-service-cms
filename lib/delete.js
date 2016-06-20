var async = require('async'),
    getById = require('./search.js').byId,
    cloudant = require('./cloudant.js'),
    seamsdb = cloudant.db.use('seams')

var process = function(id, callback) {

  var actions = {};

  // load by ID
  actions.byId = function(callback) {
    getById(id, callback)
  }

  async.parallel(actions, function(err, result) {
    
    if (err) {
      return callback(err);
    }

    // if we're all good - insert this doc
    seamsdb.destroy(result.byId._id, result.byId._rev, function(err, data) {
      return callback(err, data);
    });

  })
  
}

module.exports = {
  process: process
}