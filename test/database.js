/* eslint-env mocha, node */
/* eslint max-nested-callbacks: [2, 5] */
/* eslint no-unused-expressions: 0 */
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

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var sinon = require('sinon');

var Database = require('../lib/database');
var util = require('../lib/util');

var CouchResult = util.CouchResult;
var CouchError = util.CouchError;


describe('Database', function () {

  var TEST_DB_NAME = 'tagesdecke-test-db';

  var conn = { 'make_request': function () {} };
  var mock = sinon.mock(conn);
  var db = new Database(TEST_DB_NAME, conn);


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
      });
    });
  });


  describe('#get(documentID)', function () {
    it('should correctly return the requested document.', function(done) {
      var SUBPATH = 'SpaghettiWithMeatballs';
      var FULLPATH = TEST_DB_NAME + '/' + SUBPATH;
      var PARMS = { attachments: true, rev: '2' };
      var OPTS = { parms: PARMS };
      var BODY = {
        '_id': 'SpaghettiWithMeatballs',
        '_rev': '1-917fa2381192822767f010b95b45325b',
        'description': 'An Italian-American dish.',
        'ingredients': [
          'spaghetti',
          'tomato sauce',
          'meatballs'
        ],
        'name': 'Spaghetti with meatballs'
      };
      var STATUS = 200;

      setupMock('make_request', 'GET', FULLPATH, OPTS, null, STATUS, BODY);

      db.get('SpaghettiWithMeatballs', PARMS).then(function (result) {
        mock.verify();
        expect(result).to.exist;
        expect(result.data).to.exist;
        expect(result.data._id).to.exist;
        expect(result.data._id).to.equal('SpaghettiWithMeatballs');
        expect(result.data).to.deep.equal(BODY);
        done();
      }).catch(function (err) {
        console.log('Error: ', err);
        throw err;
      });
    });
  });


  describe('#put(documentID, document)', function () {
    it('should correctly store the given document.', function(done) {
      var SUBPATH = 'SpaghettiWithMeatballs';
      var FULLPATH = TEST_DB_NAME + '/' + SUBPATH;
      var REQ_BODY = {
        '_id': 'SpaghettiWithMeatballs',
        'description': 'An Italian-American dish.',
        'ingredients': [
          'spaghetti',
          'tomato sauce',
          'meatballs'
        ],
        'name': 'Spaghetti with meatballs'
      };
      var OPTS = { body: REQ_BODY, parms: undefined };
      var RESP_BODY = {
        'id': 'SpaghettiWithMeatballs',
        'ok': true,
        'rev': '1-917fa2381192822767f010b95b45325b'
      };
      var STATUS = 201;

      setupMock('make_request', 'PUT', FULLPATH, OPTS, null, STATUS, RESP_BODY);

      db.put('SpaghettiWithMeatballs', REQ_BODY).then(function (result) {
        mock.verify();
        expect(result).to.exist;
        expect(result.data).to.exist;
        expect(result.data.id).to.exist;
        expect(result.data.id).to.equal('SpaghettiWithMeatballs');
        expect(result.data).to.deep.equal(RESP_BODY);
        done();
      }).catch(function (err) {
        console.log('Error: ', err);
        throw err;
      });
    });
  });


  describe('#delete()', function () {
    it('should correctly delete a given document from the DB.', function(done) {
      done();
    });
  });

  describe('#copy()', function () {
    it('should correctly copy a given document to another ID.', function (done) {
      done();
    });
  });

});
