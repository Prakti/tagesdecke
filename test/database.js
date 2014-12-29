/* eslint-env mocha */
'use strict';

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var sinon = require('sinon');
var Promise = require('bluebird');

var Database = require('../lib/database');
var util = require('../lib/util');

var CouchResult = util.CouchResult;
var CouchError = util.CouchError;


describe('Database', function () {

  var TEST_DB_NAME = 'tagesdecke-test-db';

  var conn = { 'make_request': function () {} };
  var mock = sinon.mock(conn);
  var db = new Database(TEST_DB_NAME, conn);

  // TODO: We need to check wether the url is contructed correctly
  // TOTO: We need to check if the data is correctly passed back

  // Renew the connection with the request stub for each sub-test
  beforeEach(function () {
    conn = { 'make_request': function () {} };
    mock = sinon.mock(conn);
    db = new Database(TEST_DB_NAME, conn);
  });


  function setupMock(exp, method, path, opts, error, statusCode, body) {
    mock.expects(exp).atLeast(1).withArgs(method, path, opts).returns(
        new Promise(function do_request (reject, resolve) {
          if (error) {
            return reject(error);
          }

          if (statusCode < 400) {
            resolve(new CouchResult({ statusCode: statusCode}, JSON.stringify(body)));
          } else {
            reject(new CouchError({ statusCode: statusCode}, JSON.stringify(body)));
          }
        })
    );
  }

  describe('#make_request()', function () {
    it('should correctly pass through data from the connection', function (done) {
      var METH = 'POST';
      var SUBPATH = 'subpath';
      var FULLPATH = TEST_DB_NAME + "/" + SUBPATH;
      var OPTS = 'OPTIONS';
      var BODY = { ok: true };

      setupMock('make_request', METH, FULLPATH, OPTS, null, 201, BODY);

      db.make_request(METH, SUBPATH, OPTS).then(function (result) {
        console.log("Result: ", result);
        mock.verify();
        // TODO: Check result with chai for correctness
        done();
      }).catch(function (err) {
        console.log("Error: ", err);
          done();
      }).done();
    });
  });

  describe('#get()', function () {
  });

  describe('#post()', function () {
  });

  describe('#put()', function () {
  });

  describe('#delete()', function () {
  });

});
