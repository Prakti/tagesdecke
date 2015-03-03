/* eslint-env mocha, node */
/* eslint max-nested-callbacks: [2, 5] */
/* eslint no-unused-expressions: 0 */
'use strict';

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var sinon = require('sinon');

var Connection = require('../lib/connection');


function MockConnection(req, method, url) {
  this.expectedRequest = {
    method: method,
    url: url,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  this.req = req;
}

MockConnection.prototype.add_header = function (key, value) {
  this.expectedRequest.headers[key] = value;
  return this;
};

MockConnection.prototype.add_url_params = function (parms) {
  this.expectedRequest.qs = parms;
  return this;
};

MockConnection.prototype.add_request_body = function (data) {
  if (data) {
    this.expectedRequest.body = JSON.stringify(data);
  }
  return this;
};

MockConnection.prototype.io_error = function (err) {
  this.req.once().withArgs(this.expectedRequest).yields(err, this.response, this.response_body);
  return this;
};

MockConnection.prototype.result = function (statusCode, data) {
  var body = '';

  if (data) {
    body = JSON.stringify(data);
  }

  this.response = {
    statusCode: statusCode
  };

  this.req.once().withArgs(this.expectedRequest).yields(null, this.response, body);
  return this;
};


describe('Connection', function () {

  var TEST_DB_NAME = 'tagesdecke-test-db';

  var request = sinon.mock();
  var conn = new Connection('http://localhost:5984/', request);

  // Renew the connection with the request stub for each sub-test
  beforeEach(function () {
    request = sinon.mock();
    conn = new Connection('http://localhost:5984/', request);
  });


  describe('#make_request()', function () {
    var HEADER_KEY = 'X-Header-Test';
    var HEADER_VAL = 'Test-1-2-3';

    var URL_PARMS = { 'bar': 'baz', 'bang': 'boom' };

    var RESPONSE_BODY = { 'Response': 'Foo Bar FooBarrr' };
    var REQUEST_BODY = { 'Request': 'Lorem Ipsum dolor sit amet' };

    var HEADERS = {};
    HEADERS[HEADER_KEY] = HEADER_VAL;

    var OPTS = {
      headers: HEADERS,
      parms: URL_PARMS,
      body: REQUEST_BODY
    };

    it('should correctly call "request" and handle a correct response', function (done) {
      var mock = new MockConnection(request, 'POST', 'http://localhost:5984/test_request');
      mock.add_header(HEADER_KEY, HEADER_VAL);
      mock.add_url_params(URL_PARMS);
      mock.add_request_body(REQUEST_BODY);
      mock.result(200, RESPONSE_BODY);

      conn.make_request('POST', 'test_request', OPTS).then(function (result) {
        expect(result).to.exist;
        expect(result.response.statusCode).to.equal(200);

        var data = result.data;
        expect(data).to.exist;
        expect(data).to.deep.equal(RESPONSE_BODY);

        request.verify();

        done();
      }).done();

    });
  });

  describe('#get("http://localhost:5984/")', function () {
    it('should return a CouchResponse with information about the CouchDB instance', function (done) {
      //Fake an answer from CouchDB and return it.
      var mock = new MockConnection(request, 'GET', 'http://localhost:5984/');
      mock.result(200, { 'couchdb': 'Welcome'});

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
      var mock = new MockConnection(request, 'GET', 'http://localhost:5984/some-nonexistent-db');
      mock.result(404, { ok: false});

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
      var mock = new MockConnection(request, 'PUT', 'http://localhost:5984/db-to-create');
      mock.result(201, { ok: true });

      conn.put('db-to-create').then(function (result) {
        expect(result).to.exist;
        expect(result.response.statusCode).to.equal(201);
        expect(result.data).to.exist;
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
      var mock = new MockConnection(request, 'GET', 'http://localhost:5984/_all_dbs');
      mock.result(200, ['Foo', TEST_DB_NAME, 'Bar', 'Baz']);

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
        var REQ_DATA = { 'foo': 'Foo', 'bar': 42 };
        var RESP_DATA = { id: 'BABAF00', rev: '1-BABAF00', ok: true };
        var mock = new MockConnection(request, 'POST', 'http://localhost:5984/' + TEST_DB_NAME);
        mock.add_request_body(REQ_DATA).result(201, RESP_DATA);

        conn.post(TEST_DB_NAME, REQ_DATA).then(function (result) {
          expect(result).to.exist;
          expect(result.response.statusCode).to.equal(201);
          expect(result.data).to.exist;
          expect(result.data).to.deep.equal(RESP_DATA);

          request.verify();
          done();
        }).catch(function (err) {
          console.log(err);
        }).done();
    });
  });

  describe('#delete("http://localhost:5984/' + TEST_DB_NAME + '")', function () {
    it('should result in the deletion of the database', function (done) {
      var mock = new MockConnection(request, 'DELETE', 'http://localhost:5984/' + TEST_DB_NAME);
      mock.result(200, { ok: true});

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
