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

  /**
   * The name of the database to be accessed
   * @member {String}
   */
  this.name = name;

  /**
   * The Connection to the database's host.
   * @member {Connection}
   */
  this.conn = conn;
}


/**
 * The central workhorse for performing the HTTP requests.
 *
 * @param {String} method - The HTTP verb to be used in the request
 * @param {String} path - The relative path for the request
 * @param {Object} opts - An Object containing optional parameters for the request:
 * @param {Object} opts.headers - Object containing key/value pairs of custom
 *                                HTTP Headers
 * @param {Object} opts.parms - Object containing key/value pairs of parameters to
 *                              be appended to the URL must be JSON encodable
 * @param {Object} opts.body - Object or Array to be JSON encoded and put into
 *                             the request body
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Database.prototype.make_request = function make_request (method, path, opts) {
  var url = urljoin(this.name, path);
  return this.conn.make_request(method, url, opts);
};


/**
 * Convenience method to send a GET request to a CouchDB database.
 *
 * @param {String} path - the path to the desired object below the database-URL
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Database.prototype.get = function get(path, parms) {
  return this.make_request('GET', path, { parms: parms });
};

/**
 * Convenience method to send a POST request to a CouchDB database.
 *
 * @param {String} path - the path to the desired object below the database-URL
 * @param {Object} body - Object or Array to be JSON encoded and put into
 *                        the request body
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Database.prototype.post = function post(path, body, parms) {
  return this.make_request('POST', path, { body: body, parms: parms });
};

/**
 * Convenience method to send a PUT request to a CouchDB database.
 *
 * @param {String} path - the path to the desired object below the database-URL
 * @param {Object} body - Object or Array to be JSON encoded and put into
 *                        the request body
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Database.prototype.put = function put(path, body, parms) {
  return this.make_request('PUT', path, { body: body, parms: parms });
};

/**
 * Convenience method to send a DELETE request to a CouchDB database.
 *
 * @param {String} path - the path to the desired object below the database-URL
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Database.prototype.delete = function _delete(path, parms) {
  return this.make_request('DELETE', path, { parms: parms });
};

module.exports = Database;
