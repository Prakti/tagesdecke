/* eslint-env node */
'use strict';

var Promise = require('bluebird');
var request = require('request');
var urljoin = require('url-join');
var _ = require('lodash');

var util = require('./util');


var CouchResult = util.CouchResult;
var CouchError = util.CouchError;

function Connection(url) {
  this.url = url;

}

Connection.prototype.make_request = function make_request(method, path, opts) {

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
      req.body = opts.body;
    }
  }

  req.headers = headers;

  return new Promise(function do_request(resolve, reject) {
    request(req, function handle_response (err, resp, body) {
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
