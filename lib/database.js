/* eslint-env node */
'use strict';

var urljoin = require('url-join');

/**
 * Creates a Database object for a CouchDB instance, using a given Connection.
 *
 * @class
 * @classdesc The Database class creates a convenience object for accessing
 * database-specific functionality of a CouchDB  Host for a given database.
 *
 * @param {String} name -- The name of the database to be accessed.
 * @param {Connection} conn -- The Connection to the database's host.
 *
 */
function Database(name, conn) {
  this.name = name;
  this.conn = conn;
}


/**
 * The central workhorse for performing the HTTP requests.
 *
 * @param {String} method - The HTTP verb to be used in the request
 * @param {String} path - The relative path for the request
 * @param {RequestOptions} opts - An Object containing optional parameters for the request
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Database.prototype.make_request = function make_request (method, path, opts) {
  var url = urljoin(this.name, path);
  return this.conn.make_request(method, url, opts);
};


Database.prototype.get = function get(path, parms) {
  return this.make_request('GET', path, { parms: parms });
};

Database.prototype.post = function post(path, body, parms) {
  return this.make_request('POST', path, { body: body, parms: parms });
};

Database.prototype.put = function put(path, body, parms) {
  return this.make_request('PUT', path, { body: body, parms: parms });
};

Database.prototype.delete = function _delete(path, parms) {
  return this.make_request('DELETE', path, { parms: parms });
};

module.exports = Database;
