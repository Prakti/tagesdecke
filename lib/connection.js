/* eslint-env node */
'use strict';

/*global Promise:true*/
/**
 * Promise class as provided by the bluedbird library. If a Promise is
 * resolved it will yield a {@link CouchResult} if it is rejected it yields a
 * {@link CouchError}.
 *
 * @class Promise
 * @see {@link https://github.com/petkaantonov/bluebird.git|bluebird}
 */
var Promise = require('bluebird');
var urljoin = require('url-join');
var _ = require('lodash');

var util = require('./util');

var CouchResult = util.CouchResult;
var CouchError = util.CouchError;

/**
 * Creates a Connection to a CouchDB Instance.
 *
 * @class
 * @classdesc A connection object aims to provide all RESTful HTTP verbs,
 * supported by CouchDB via convenience functions which provide the require
 * mechanisms for creating the proper HTTP requests.
 *
 * @param {String} url - The base URL to the CouchDB Instance
 * @param {Object} request - An object supporting the 'request' interface
 */
function Connection(url, request) {

  /**
   * The url to the CouchDB instance
   * @member {String}
   */
  this.url = url;

  /**
   * An Object fulfilling the request API
   * @member {Object}
   * @see {@link https://github.com/request/request|request}
   */
  this.request = request;
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
Connection.prototype.make_request = function make_request(method, path, opts) {

  var self = this;

  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  var req = {
    method: method,
    url: urljoin(this.url, path)
  };

  if (opts) {
    if (opts.headers) {
      _.assign(headers, opts.headers);
    }

    if (opts.parms) {
      req.qs = opts.parms;
    }

    if (opts.body) {
      req.body = JSON.stringify(opts.body);
    }
  }

  req.headers = headers;

  return new Promise(function do_request(resolve, reject) {
    self.request(req, function handle_response (err, resp, body) {
      if (err) {
        return reject(err);
      }

      if (resp.statusCode < 400) {
        resolve(new CouchResult(resp, body));
      } else {
        reject(new CouchError(resp, body));
      }
    });
  });

};

/**
 * Convenience method to send a GET request to a CouchDB host.
 *
 * @param {String} path - the path to the desired object below the host-URL
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Connection.prototype.get = function get(path, parms) {
  return this.make_request('GET', path, { parms: parms });
};

/**
 * Convenience method to send a POST request to a CouchDB host.
 *
 * @param {String} path - the path to the desired object below the host-URL
 * @param {Object} body - Object or Array to be JSON encoded and put into
 *                        the request body
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Connection.prototype.post = function post(path, body, parms) {
  return this.make_request('POST', path, { body: body, parms: parms });
};

/**
 * Convenience method to send a PUT request to a CouchDB host.
 *
 * @param {String} path - the path to the desired object below the host-URL
 * @param {Object} body - Object or Array to be JSON encoded and put into
 *                        the request body
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Connection.prototype.put = function put(path, body, parms) {
  return this.make_request('PUT', path, { body: body, parms: parms });
};

/**
 * Convenience method to send a DELETE request to a CouchDB host.
 *
 * @param {String} path - the path to the desired object below the host-URL
 * @param {Object} parms - Object containing key/vale pairs of parametrers to
 *                         be appended to the URL must be JSON encodable
 *
 * @returns {Promise} A {@link Promise} object. If the promise resolves a
 * {@link CouchResult} is returned, if it rejects a {@link CouchError} is
 * returned.
 */
Connection.prototype.delete = function _delete(path, parms) {
  return this.make_request('DELETE', path, { parms: parms });
};

module.exports = Connection;
