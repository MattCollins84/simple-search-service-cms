const cloudant = require('./cloudant.js'),
      seamsdb = cloudant.db.use('seams'),
      defaultSchema = { _id: "schema", fields:[]},
      _ = require('underscore'),
      debug = require('debug')('seams')

 
const load = function(callback) {
    
  // fetch from the db
  seamsdb.get("schema", function(err, data) {
    if (err) {
      return callback(null, defaultSchema);
    }
    callback(err, data);
  });

};

// modifies 'row' in a pass-by-reference way
const validate = function(schema, row, editMode) {

  // default value of editMode
  if (typeof editMode === "undefined" || editMode === null) {
    editMode = false;
  }

  // get all allowed schema field names
  var schemaFields = schema.fields.map(f => { return f.name });
  var errors = [];

  if (editMode) {
    // also allow the _id and _rev fields if we are editing
    schemaFields.push("_id");
    schemaFields.push("_rev");
  }

  // check each field against the schema and enforce the type
  schema.fields.forEach(field => {

    // field.
    //    name
    //    type
    //    facet

    const type = field.type;
    const name = field.name;
    var   value = row[name];

    // does this field exist in the row?
    if (_.isUndefined(row[name])) {
      return;
    }

    // type check number
    if (type === "number") {

      // handle empty strings (as we have no required fields)
      if (value === "") {
        value = 0;
      }

      // parse as float, regardless
      value = parseFloat(value);

      // number, that is not 'NaN'
      if (typeof value === "number" && isNaN(value) === false) {
        row[name] = value;
        return;
      }

      errors.push(`${name} must be a number, incorrect value set: ${row[name]}`);

    }

    // type check boolean
    else if (type === "boolean") {

      const allowed = [true, false, "true", "false"];

      if(_.contains(allowed, value)) {

        if (value === "true") row[name] = true;
        if (value === "false") row[name] = false;

        return;
      }

      errors.push(`${name} must be a boolean, incorrect value set: ${value}`)

    }

    // type check arrays
    else if (type === "arrayofstrings") {

      // split on comma and trim whitespace
      row[name] = value.split(",").map(v => v.trim());

    }

    // everything else (string)
    else {

      // do we want to stop people supplying numbers (for example) into a string field?
      return;

    }

  });

  // find values provided that are not in the schema
  _.difference(Object.keys(row), schemaFields).forEach(x => {
    errors.push(`${x} is not a valid parameter`);
  })

  // did we have any errors? return
  if (errors.length) {
    return errors;
  }

}
 
module.exports = {
  load: load,
  validate: validate
}