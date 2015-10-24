/* eslint-env node */
'use strict';

var util = require('util');

/**
 * Memozied accessor-function for JSON decoding the body of a CouchResult or
 * CouchError
 *
 * @private
 * @function
 */
function get_data () {
  if (this._data === undefined) {
    this._data = JSON.parse(this.body);
  }

  return this._data;
}


/**
 * Create a new CouchError from a given HTTP response and body.
 *
 * @class
 * @augments Error
 * @classdesc
 * Encapsulates a HTTP response from a CouchDB and provides quick access to
 * the decoded response body and the status-code for inspection.
 *
 * @param {Object} response - The complete response object as returned from
 *                            the 'request' library
 * @param {String} body - The raw body of the HTTP response
 */
function CouchError(response, body) {

  /**
   * The HTTP Status Code of the HTTP response for fast access and inspection
   * @member {Int}
   */
  this.statusCode = response.statusCode;

  /**
   * The raw response object as returned from 'request'
   * @member {Object}
   * @see {@link https://github.com/request/request|request}
   */
  this.response = response;

  /**
   * The reaw body of the HTTP response
   * @member {String}
   */
  this.body = body;

  /**
   * The JSON decoded body of the HTTP response
   * @member {Object|Array}
   * @name data
   * @memberof CouchError
   * @instance
   */
  Object.defineProperty(this, 'data', {
    get: get_data
  });
}

util.inherits(CouchError, Error);

/**
 * Create a new AuthError from a given HTTP response and body.
 *
 * TODO: MA -- 2015/10/24 -- Create consistency check for statusCode
 *
 * @class
 * @augments CouchError
 * @classdesc
 * For easy detection of an AuthError in a Promises catch handler.
 *
 * @param {Object} response - The complete response object as returned from
 *                            the 'request' library
 * @param {String} body - The raw body of the HTTP response
 */
function AuthError(response, body) {
  CouchError.call(this, response, body);
}

util.inherits(AuthError, CouchError);

/**
 * Create a new CouchResult from a given HTTP response and body
 *
 * @class
 * @classdesc
 * Encapsulates a HTTP response from a CouchDB and provides quick access to
 * the decoded response body.
 *
 * @param {Object} response - The complete response object as returned from
 *                            the 'request' library
 * @param {String} body - The raw body of the HTTP response
 */
function CouchResult(response, body) {
  /**
   * The raw response object as returned from 'request'
   * @member {Object}
   * @see {@link https://github.com/request/request|request}
   */
  this.response = response;

  /**
   * The reaw body of the HTTP response
   * @member {String}
   */
  this.body = body;

  /**
   * The JSON decoded body of the HTTP response
   * @member {Object|Array}
   * @name data
   * @memberof CouchResult
   * @instance
   */
  Object.defineProperty(this, 'data', {
    get: get_data
  });
}


module.exports = {
  AuthError: AuthError,
  CouchError: CouchError,
  CouchResult: CouchResult
};
