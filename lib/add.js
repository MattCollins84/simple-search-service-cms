var schema = require('./schema.js'),
    async = require('async'),
    getById = require('./search.js').byId

var render = function(callback) {

  var actions = {}

  // load schema
  actions.schema = function(callback) {
    schema.load(callback)
  }

  async.parallel(actions, function(err, result) {
    return callback(err, result)
  })
  
}

module.exports = {
  render: render
}