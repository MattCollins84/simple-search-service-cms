var schema = require('./schema.js'),
    async = require('async'),
    search = require('./search.js').cloudantSearch

var renderHomepage = function(opts, callback) {

  var actions = {}

  // load schema
  actions.schema = function(callback) {
    schema.load(callback)
  }

    // load rows
  actions.rows = function(callback) {
    
    var opts = {
      limit: 5,
      include_docs: true,
      q: "*:*"
    }

    search(opts, function(err, data) {
      return callback(null, data.rows)
    })

  }

  async.parallel(actions, function(err, results) {

    if (err) throw err;

    // format our results to match the schema
    var rows = [];
    results.rows.forEach(r => {

      var row = [r._id];

      results.schema.fields.forEach(f => {
        row.push(r[f.name])
      });

      rows.push(row);

    });

    return callback(err, {
      schema: results.schema.fields,
      rows: rows
    })

  })

}
module.exports = {
  render: renderHomepage
}