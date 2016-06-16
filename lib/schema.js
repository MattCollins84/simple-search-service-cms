var cloudant = require('./cloudant.js'),
  seamsdb = cloudant.db.use('seams'),
  defaultSchema = { _id: "schema", fields:[]};

 
var load = function(callback) {
    
  // fetch from the db
  seamsdb.get("schema", function(err, data) {
    if (err) {
      return callback(null, defaultSchema);
    }
    callback(err, data);
  });

};
 
module.exports = {
  load: load
}