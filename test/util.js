/* eslint-env mocha, node */
/* eslint max-nested-callbacks: [2, 5] */
/* eslint no-unused-expressions: 0 */
'use strict';

var chai = require('chai');
chai.use(require('chai-as-promised'));
var expect = chai.expect;

var util = require('../lib/util');

var CouchError = util.CouchError;
var CouchResult = util.CouchResult;

var TEST_DATA = {
  foo: 42,
  bar: [ 1, 2, 3, 4, 5, 6, 7 ]
};

// TODO: check how to incorporate commom error cases

describe('CouchError', function () {
  var err = new CouchError({ statusCode: 404 }, JSON.stringify(TEST_DATA));
  describe('#data', function () {
    it('should return a correctly parsed object', function() {
      expect(err.data).to.exist;
      expect(err.data).to.be.instanceof(Object);
      expect(err.data).to.deep.equal(TEST_DATA);
    });
  });
});


describe('CouchResult', function() {
  var result = new CouchResult({statusCode: 200 }, JSON.stringify(TEST_DATA));
  describe('#data', function() {
    it('should return a correctly parsed object', function() {
      expect(result.data).to.exist;
      expect(result.data).to.be.instanceof(Object);
      expect(result.data).to.deep.equal(TEST_DATA);
    });
  });
});
