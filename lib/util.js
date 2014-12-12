/* eslint-env node */
'use strict';

var util = require('util');

function CouchError(response, body) {
  this.statusCode = response.statusCode;
  this.response = response;
  this.body = body;
}

util.inherits(CouchError, Error);

Object.defineProperty(CouchError.prototype, 'data', {
  get: function get_data() {
    if (this._data === undefined) {
      this._data = JSON.parse(this.body);
    }

    return this._data;
  }
});


function CouchResult(response, body) {
  this.response = response;
  this.body = body;
}


Object.defineProperty(CouchResult.prototype, 'data', {
  get: function get_data() {
    if (this._data === undefined) {
      this._data = JSON.parse(this.body);
    }

    return this._data;
  }
});

module.exports = {
  CouchError: CouchError,
  CouchResult: CouchResult
};
