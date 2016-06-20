const services = require('./credentials.js');

var	opts = services.cloudantNoSQLDB[0].credentials;
		opts.account = opts.username;

const cloudant = require('cloudant')(opts);

module.exports = cloudant;