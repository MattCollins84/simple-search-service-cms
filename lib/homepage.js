const schema = require('./schema.js'),
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
    
    // include docs, and only use a bookmark if we have one
    opts.include_docs = true;
    if (opts.bookmark == false) {
      delete opts.bookmark;
    }

    search(opts, function(err, data) {
      return callback(err, data)
    })

  }

  async.parallel(actions, function(err, results) {

    if (err) {
      return callback(err);
    }

    results.total_rows = results.rows.total_rows;
    results.bookmark = results.rows.bookmark;
    results.rows = results.rows.rows;

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
      rows: rows,
      limit: opts.limit,
      q: opts.q,
      totalRows: results.total_rows,
      thisBookmark: opts.bookmark,
      nextBookmark: results.bookmark,
      partial: opts.partial
    })

  })

}
module.exports = {
  render: renderHomepage
}