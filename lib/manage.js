var schema = require('./schema.js'),
    async = require('async'),
    getById = require('./search.js').byId

var renderManage = function(opts, callback) {

  var actions = {}

  // load schema
  actions.schema = function(callback) {
    schema.load(callback)
  }

  actions.byId = function(callback) {
    getById(opts.id, callback)
  }

  async.parallel(actions, function(err, result) {
    return callback(err, result)
  })
  

}
module.exports = {
  render: renderManage
}