/* eslint-env node */
'use strict';

/*global Promise:true*/
/**
 * Promise class as provided by the bluedbird library.
 *
 * @private
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
 *
 * @param {String} url - The base URL to the CouchDB Instance
 * @param {Object} request - An object supporting the 'request' interface
 */
function Connection(url, request) {

  /**
   * The url to the CouchDB instance
   * @member {String}
   * */
  this.url = url;

  /**
   * An Object fulfilling the request API
   * @member {Object}
   * @see request
   */
  this.request = request;
}


/**
 * The central workhorse for performing the HTTP requests.
 * The 'opts' parameter can contain the following optional data:
 *  - parms: An Object of key value pairs to be appended to the URL
 *  - headers: An Object of key value pairs to be put into the request headers
 *  - body: An Object or Array to be JSON encoded into the request body
 *
 * @param {String} method - The HTTP verb to be used in the request
 * @param {String} path - The relative path for the request
 * @param {RequestOptions} opts - An Object containing optional parameters for the request
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


  /**
   * @namespace RequestOptions
   * @property {Object} headers - The default values for parties.
   * @property {Object} parms - The default number of players.
   * @property {Object} body - How much gold the party starts with.
   */
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


Connection.prototype.get = function get(path, parms) {
  return this.make_request('GET', path, { parms: parms });
};

Connection.prototype.post = function post(path, body, parms) {
  return this.make_request('POST', path, { body: body, parms: parms });
};

Connection.prototype.put = function put(path, body, parms) {
  return this.make_request('PUT', path, { body: body, parms: parms });
};

Connection.prototype.delete = function _delete(path, parms) {
  return this.make_request('DELETE', path, { parms: parms });
};

module.exports = Connection;
