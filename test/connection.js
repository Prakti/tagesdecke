var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var Connection = require('../lib/connection');


describe('Connection', function () {

  describe('#get("http://localhost:5984/")', function () {
    it('should return a CouchResponse with information about the CouchDB instance', function() {
      var conn = new Connection('http://localhost:5984/');
      conn.get('/').then(function (result) {
        expect(result).to.exist;

        var data = result.getData();          
        expect(data).to.exist;
        expect(data.couchdb).to.equal('Welcome');
      }).done();
    });
  });

  describe('#get("http://localhost:5984/_babaf00")', function () {
    it('should result in an 404 Error', function() {
      var conn = new Connection('http://localhost:5984/');
      conn.get('_babaf00').catch(function (error) {
        expect(error).to.exist;
        error.statusCode === 404;
      }).done();
    });
  });

  // TODO: create databases to be destroyed later

  describe('#get("http://localhost:5984/")', function() {
    it('should return an array of existing databases', function () {
      var conn = new Connection('http://localhost:5984/');
      conn.get('/_all_dbs').then(function (result) {
        expect(result).to.exist;

        var data = result.getData();
        expect(data).to.be.instanceof(Array);
      }).done();
    });
  });

  // TODO: destroy databases to test API functionality
});
