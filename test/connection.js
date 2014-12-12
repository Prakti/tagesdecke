/* eslint-env mocha */
"use strict";

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var Connection = require('../lib/connection');


describe('Connection', function () {

  describe('#get("http://localhost:5984/")', function () {
    it('should return a CouchResponse with information about the CouchDB instance', function(done) {
      var conn = new Connection('http://localhost:5984/');
      conn.get('/').then(function (result) {
        expect(result).to.exist;

        var data = result.data;
        expect(data).to.exist;
        expect(data.couchdb).to.equal('Welcome');
        done();
      }).done();
    });
  });

  describe('#get("http://localhost:5984/_babaf00")', function () {
    it('should result in an 404 Error', function (done) {
      var conn = new Connection('http://localhost:5984/');
      conn.get('/baba_f00').catch(function (error) {
        expect(error).to.exist;
        expect(error).to.have.property('statusCode', 404);
        done();
      }).done();
    });
  });

  describe('#put("http://localhost:5984/testdb-12353232342")', function () {
    it('should result in a created database', function (done) {
      var conn = new Connection('http://localhost:5984/');
      conn.put('/testdb-12353232342').then(function (result) {
        expect(result).to.exist;
        expect(result.data).to.exist,
        expect(result.data).to.have.property('ok', true);
        done();
      }).catch(function (err) {
        console.log(err);
      }).done();
    });
  });

  describe('#get("http://localhost:5984/")', function () {
    it('should return an array of existing databases', function (done) {
      var conn = new Connection('http://localhost:5984/');
      conn.get('/_all_dbs').then(function (result) {
        expect(result).to.exist;
        expect(result.data).to.be.instanceof(Array);
        // TODO: check if previously created db is in the list!
        done();
      }).done();
    });
  });

  describe('#delete("http://localhost:5984/testdb-12353232342")', function () {
    it('should result in the deletion of the database', function (done) {
      var conn = new Connection('http://localhost:5984/');
      conn.delete('/testdb-12353232342').then(function (result) {
        expect(result).to.exist;
        expect(result.data).to.exist;
        expect(result.data).to.have.property('ok', true);
        done();
      }).catch(function (err) {
        console.log(err);
      }).done();
    });
  });

  // TODO: destroy databases to test API functionality
});
