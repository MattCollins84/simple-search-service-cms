const _ = require('underscore');
const parseErrors = function(err) {

	var errors = [];

  if (_.isArray(err)) {
    errors = err;
  }

  else if (!_.isUndefined(err.reason)) {
    errors.push(err.reason);
  }

  else {
    errors.push("Unknown error occured");
  }

  return errors;

}

module.exports = {
	parse: parseErrors
}