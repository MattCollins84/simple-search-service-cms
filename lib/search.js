var async = require('async'),
  cloudant = require('./cloudant.js'),
  schema = require('./schema.js'),
  debug = require('debug')('seams'),
  settingsdb = cloudant.db.use('seams_settings'),
  seamsdb = cloudant.db.use('seams');
 
// perform a search using Cloudant Search, returning the data
// as an array of documents in 'rows'
var cloudantSearch = function(opts, callback) {
  var facets = [];
  var fieldMap = {};
  async.series([

    // get the current schema
    function(cb) {
      debug("Schema load start");
      schema.load(function(err, theSchema) {
        for(var i in theSchema.fields) {
          var n = theSchema.fields[i].name;
        var s = n.replace(/\s/g, '_');
      fieldMap[s] = n;
          if (theSchema.fields[i].facet == true) {
          facets.push(s);
          }
        }
        debug("Schema load end");
        cb(null, null);
      });
    },
    
    // sanitize search query field names
    function(cb) {
      debug("sanitizing");
      var q = opts.q;
      for (var s in fieldMap) {
        if (fieldMap[s] !== s) {
          q = q.replace('"' + fieldMap[s] + '":', (s+':'))
             .replace("'" + fieldMap[s] + "':", (s+':'));
        } 
      }
      opts.q = q;
      cb(null, null);
    },

    // do the search
    function(cb) {
      if (facets.length >0) {
        opts.counts = JSON.stringify(facets);
      }
      debug("Cloudant search");
      seamsdb.search("search", "search", opts, function(err, data) {
        if (err) {
          return callback(err,data);
        }
        var rows = [];
        for(var i in data.rows) {
          var r = data.rows[i].doc;
          r._order = data.rows[i].order;
          rows.push(r);
        }
        data.rows = rows;
        debug("Result",data.rows.length,"rows");
        for (var j in data.counts) {
          if (fieldMap[j] !== j) {
            data.counts[fieldMap[j]] = data.counts[j];
            delete data.counts[j];
          }
        }
        cb(err, data);
      });
    }
  ], function(err, data) {
    callback(err, data[2])
  });

};

var byId = function(id, callback) {

  seamsdb.get(id, { include_docs: true }, function(err, data) {

    if (err) {
      return callback(err, null);
    }

    return callback(null, data);

  });

}
 
module.exports = {
  cloudantSearch: cloudantSearch,
  byId: byId
}