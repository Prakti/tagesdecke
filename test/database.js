/* eslint-env mocha, node */
/* eslint max-nested-callbacks: [2, 5] */
/* eslint no-unused-expressions: 0 */
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
  // TODO: We need to check if the data is correctly passed back

  // Renew the connection with the request stub for each sub-test
  beforeEach(function () {
    conn = { 'make_request': function () {} };
    mock = sinon.mock(conn);
    db = new Database(TEST_DB_NAME, conn);
  });


  function setupMock(exp, method, path, opts, error, statusCode, body) {
    mock.expects(exp).atLeast(1).withArgs(method, path, opts).returns(
        new Promise(function do_request (resolve, reject) {
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
      var FULLPATH = TEST_DB_NAME + '/' + SUBPATH;
      var OPTS = 'OPTIONS';
      var BODY = { ok: true };
      var STATUS = 201;

      setupMock('make_request', METH, FULLPATH, OPTS, null, STATUS, BODY);

      db.make_request(METH, SUBPATH, OPTS).then(function (result) {
        mock.verify();
        expect(result).to.exist;
        expect(result.response).to.exist;
        expect(result.response.statusCode).to.equal(STATUS);
        expect(result.body).to.exist;
        expect(result.data).to.deep.equal(BODY);
        done();
      }).catch(function (err) {
        console.log('Error: ', err);
        throw err;
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
