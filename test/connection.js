/* eslint-env mocha */
"use strict";

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var sinon = require('sinon');

var Connection = require('../lib/connection');


describe('Connection', function () {

  var TEST_DB_NAME = 'tagesdecke-test-db';

  var request = sinon.mock();
  var conn = new Connection('http://localhost:5984/', request);

  // Helper function to set up the response for the tests
  function setupMock(method, url, req, err, code, resp) {
      var expectedRequest = {
        method: method,
        url: url,
        headers: {
          'Accept': "application/json",
          'Content-Type': "application/json"
        }
      };

      if (req) {
        expectedRequest.body = JSON.stringify(req);
      }

      var response = {
        statusCode: code
      };

      var data = JSON.stringify(resp);
      request.once().withArgs(expectedRequest).yields(err, response, data);
  }

  // Renew the connection with the request stub for each sub-test
  beforeEach(function () {
    request = sinon.mock();
    conn = new Connection('http://localhost:5984/', request);
  });

  describe('#get("http://localhost:5984/")', function () {
    it('should return a CouchResponse with information about the CouchDB instance', function(done) {
      //Fake an answer from CouchDB and return it.
      setupMock('GET', 'http://localhost:5984/', null, null, 200, { 'couchdb' : 'Welcome' });

      conn.get('/').then(function (result) {
        expect(result).to.exist;
        expect(result.response.statusCode).to.equal(200);

        var data = result.data;
        expect(data).to.exist;
        expect(data.couchdb).to.equal('Welcome');

        request.verify();

        done();
      }).catch(function (err) {
        console.log(err);
      }).done();

    });
  });

  describe('#get("http://localhost:5984/some-nonexistent-db")', function () {
    it('should result in an 404 Error', function (done) {
      // fake an error-response
      var error = new Error();
      error.statusCode = 404;

      setupMock('GET', 'http://localhost:5984/some-nonexistent-db', null, error);

      conn.get('/some-nonexistent-db').catch(function (error) {
        expect(error).to.exist;
        expect(error.statusCode).to.equal(404);
        expect(error).to.have.property('statusCode', 404);

        request.verify();
        done();
      }).done();
    });
  });

  describe('#put("http://localhost:5984/db-to-create")', function () {
    it('should result in a created database', function (done) {
      // Fake response of couchdb
      setupMock('PUT', 'http://localhost:5984/db-to-create', null, null, 201, { ok: true });

      conn.put("db-to-create").then(function (result) {
        expect(result).to.exist;
        expect(result.response.statusCode).to.equal(201);
        expect(result.data).to.exist,
        expect(result.data).to.have.property('ok', true);

        request.verify();
        done();
      }).catch(function (err) {
        console.log(err);
      }).done();
    });
  });

  describe('#get("http://localhost:5984/_all_dbs")', function () {
    it('should return an array of existing databases containing: ' + TEST_DB_NAME, function (done) {
      // Fake response from CouchDB:
      var DATA = ['Foo', TEST_DB_NAME, 'Bar', 'Baz'];
      setupMock('GET', 'http://localhost:5984/_all_dbs', null, null, 200, DATA);

      conn.get('/_all_dbs').then(function (result) {
        expect(result).to.exist;
        expect(result.response.statusCode).to.equal(200);
        expect(result.data).to.be.instanceof(Array);
        expect(result.data).to.include.members([TEST_DB_NAME]);

        request.verify();
        done();
      }).catch(function (err) {
        console.log(err);
      }).done();
    });
  });


  describe('#post("http://localhost:5984/' + TEST_DB_NAME + '")', function () {
    it('should successfully create a document in the db: ' + TEST_DB_NAME, function (done) {
        var RESP = { id: 'BABAF00', rev: '1-BABAF00', ok: true };
        var REQ = { 'foo': 'Foo', 'bar': 42 };

        setupMock('POST', 'http://localhost:5984/' + TEST_DB_NAME, REQ, null, 201, RESP);

        conn.post(TEST_DB_NAME, REQ).then(function (result) {
          expect(result).to.exist;
          expect(result.response.statusCode).to.equal(201);
          expect(result.data).to.exist;
          expect(result.data).to.have.property('ok', true);
          expect(result.data).to.have.property('id');
          expect(result.data).to.have.property('rev');

          request.verify();
          done();
        }).catch(function (err) {
          console.log(err);
        }).done();
    });
  });

  describe('#delete("http://localhost:5984/' + TEST_DB_NAME + '")', function () {
    it('should result in the deletion of the database', function (done) {
      var RESP = { ok: true};
      setupMock('DELETE', 'http://localhost:5984/' + TEST_DB_NAME, null, null, 200, RESP);

      conn.delete(TEST_DB_NAME).then(function (result) {
        expect(result).to.exist;
        expect(result.response.statusCode).to.equal(200);
        expect(result.data).to.exist;
        expect(result.data).to.have.property('ok', true);

        request.verify();
        done();
      }).catch(function (err) {
        console.log(err);
      }).done();
    });
  });

});
