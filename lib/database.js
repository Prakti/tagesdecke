/* eslint-env node */
'use strict';

var urljoin = require('url-join');


function Database(name, conn) {
  this.name = name;
  this.conn = conn;
}

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
