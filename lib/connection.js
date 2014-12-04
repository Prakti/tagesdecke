"use strict";

var request = require('request');
var Promise = require('bluebird');
var urljoin = require('url-join');
var util = require('util');


function CouchError(response, body) {
  this.statusCode = resp.statusCode;
  this.response = response;
  this.body = body;
};

util.inherits(CouchError, Error);

CouchError.prototype.getData = function () {
  if (this.data === undefined) {
    this.data = JSON.parse(this.body);
  }

  return this.data;
}


function CouchResult(response, body) {
  this.response = response;
  this.body = body;
};


CouchResult.prototype.getData = function() {
  if (this.data === undefined) {
    this.data = JSON.parse(this.body);
  }

  return this.data;
};


function Connection(url) {
  this.url = url;
};

Connection.prototype.get = function(path, parms) {
  var url = urljoin(this.url, path);

  var headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  var req = {
    url: url, 
    headers: headers,
    qs: parms,
  };

  return new Promise(function (resolve, reject) {
    request.get(req, function (err, resp, body) {
      if (err) return reject(err);
      if (resp.statusCode < 400) {
        resolve(new CouchResult(resp, body));
      } else {
        reject(new CouchError(resp, body));
      }
    });
  });
}

module.exports = Connection
