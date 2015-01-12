/* eslint-env node */
'use strict';

var util = require('util');

/**
 * Memozied property for retrieving the JSON decoded body of a CouchResult or
 * CouchError
 */
function get_data () {
  if (this._data === undefined) {
    this._data = JSON.parse(this.body);
  }

  return this._data;
}


/**
 * @class
 */
function CouchError(response, body) {
  this.statusCode = response.statusCode;
  this.response = response;
  this.body = body;

  Object.defineProperty(this, 'data', {
    get: get_data
  });
}

util.inherits(CouchError, Error);

/**
 * @class
 */
function CouchResult(response, body) {
  this.response = response;
  this.body = body;

  Object.defineProperty(this, 'data', {
    get: get_data
  });
}


module.exports = {
  CouchError: CouchError,
  CouchResult: CouchResult
};
