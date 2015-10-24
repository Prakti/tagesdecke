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

var Database = require('./database');
var util = require('./util');

var CouchResult = util.CouchResult;
var CouchError = util.CouchError;
var AuthError = util.AuthError;

/**
 * Extracts non-null options from a given object and attach them to the other
 * given object.
 *
 * @param opts_list {Array} an array of strings representing the option names
 * @param src {Object} the object to check for set options
 * @param dst {Object} the object to set found options on
 *
 * TODO: MA -- 2014/10/24 -- Think about migrating to own module
 */
function getOptions(opts_list, src, dst) {
  if (src) {
    _.forEach(opts_list, function (opt) {
      if (src[opt]) {
        dst[opt] = src[opt];
      }
    });
  }
}

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
function Connection(url, request, options) {

  /**
   * The url to the CouchDB instance
   * @member {String}
   */
  this.url = url;

  /**
   * TODO: MA -- 2014/10/24 -- Document
   *
   * @member {Object}
   */
  this.req_defaults = {
    headers: { 'Accept': 'application/json' },
    json: true
  };

  /**
   * Indicates whether to use Cookie authentication
   * @member {boolean}
   */
  this.useCookie = false;

  /**
   * The username to use for connecting to the couchdb host
   * @member {String}
   */
  this.user = '';

  /**
   * Ths password to use for connecting to the CouchDB host
   * @member {String}
   */
  this.passwd = '';

  // Variable initialization done --> connection setup

  getOptions(['user', 'passwd', 'useCookie'], options, this);

  if (!this.useCookie && this.user) {
    // We do not use cookie auth -- configure basic auth
    this.req_defaults.auth = {
      user: this.user,
      pass: this.passwd,
      sendImmediately: true
    };
  }

  /**
   * An Object fulfilling the request API
   * @member {Object}
   * @see {@link https://github.com/request/request|request}
   */
  this.request = request.defaults(this.req_defaults);
}


/**
 * The bare-metal HTTP request handling function returning a promise.
 *
 * WARNING: it is recommended to use make_request as it can handle
 *          automatic cookie-based login/relogin.
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
Connection.prototype.http_request = function http_request(method, path, opts) {
  var self = this;

  var req = {
    method: method,
    url: urljoin(this.url, path)
  };

  if (opts) {
    if (opts.headers) {
      req.headers = opts.headers;
    }

    if (opts.parms) {
      req.qs = opts.parms;
    }

    if (opts.body) {
      req.body = opts.body;
    }
  }

  if (this.useCookie) {
      req.jar = true;

      if (!req.headers) {
          req.headers = {};
      }

      req.headers['X-CouchDB-WWW-Authenticate'] = 'Cookie';
  }

  return new Promise(function do_request(resolve, reject) {
    self.request(req, function handle_response (err, resp, body) {
      if (err) {
        return reject(err);
      }

      if (resp.statusCode < 400) {
        resolve(new CouchResult(resp, body));
      } else if (resp.statusCode === 401) {
        // Special case for handling relogins with cooike auth
        reject(new AuthError(resp, body));
      } else {
        reject(new CouchError(resp, body));
      }
    });
  });

};


/**
 * Do a cookie-based login to the CouchDB and then retry a given request.
 *
 * @returns {Promise} Returns a promise that either resolves successful to the
 *                    result of the specified request or is rejected because
 *                    of the failed authentication.
 */
Connection.prototype.login_and_retry = function login_and_retry (method, path, opts) {
  var self = this;

  var login = {
    name: this.user,
    password: this.passwd
  };

  return this.http_request('POST', '_session', { body: login })
  .then(function () {
      return self.http_request(method, path, opts);
  });
};

/**
 * The central workhorse for HTTP requests. Does automatic login and relogin
 * in casse 'useCookie' is set on the connection and credentials have been
 * supplied.
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
  if (this.useCookie) {
    // Try to make the request but intercept auth failues
    return this.http_request(method, path, opts).catch(AuthError, function () {
        return self.login_and_retry(method, path, opts);
    });
  } else {
    return this.http_request(method, path, opts);
  }
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

/**
 * Convenience method to send a HEAD request to a CouchDB  host.
 *
 * TODO: Document
 */
Connection.prototype.head = function head(path, parms) {
  return this.make_request('HEAD', path, { parms: parms });
};


/**
 * Convenience method to open a database on a CouchDB host.
 *
 * TODO: Document
 */
Connection.prototype.openDB = function openDB(dbname, options) {
  var self = this;
  var create = true;

  if (options && options.create === false) {
    create = false;
  }

  return self.head(dbname).then(function () {
    return new Database(dbname, self);
  }).catch(function (error) {
    if (error.statusCode === 404 && create) {
      return self.put(dbname).then(function () {
        return new Database(dbname, self);
      });
    } else {
      throw error;
    }
  });
};

module.exports = Connection;
