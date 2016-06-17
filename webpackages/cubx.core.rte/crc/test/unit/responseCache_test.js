window.cubx.amd.define(['responseCache'], function (responseCache) {
  'use strict';
  describe('ResponseCache', function () {
    var key = 'test_key';
    var item = {
      propA: 'propA',
      propB: 1234
    };
    var item2 = {
      propC: 'propC',
      propD: true
    };

    beforeEach(function () {
      responseCache._cache = {};
    });
    describe('#addItem(key, item)', function () {
      it('should return a promise', function () {
        expect(responseCache.addItem(key, item)).to.be.an.instanceOf(Promise);
      });
      it('should add item to cache using given key', function (done) {
        responseCache.addItem(key, item).then(function (result) {
          result.should.be.eql(item);
          expect(responseCache._cache[key]).to.be.eql(item);
          done();
        });
      });
      it('should reject returned promise if key is not of type string or is empty string', function (done) {
        responseCache.addItem(123, item).then(function () {}, function (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          done();
        });
      });
      it('should reject returned promise if item is null', function (done) {
        responseCache.addItem(key, null).then(function () {}, function (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          done();
        });
      });
      it('should override item if there is already one for given key', function (done) {
        responseCache._cache[key] = item;
        responseCache.addItem(key, item2).then(function (result) {
          expect(responseCache._cache[key]).to.be.eql(item2);
          done();
        });
      });
    });
    describe('#get(key)', function () {
      it('should return a promise', function () {
        expect(responseCache.get(key)).to.be.an.instanceOf(Promise);
      });
      it('should return the item for given key', function (done) {
        responseCache._cache[key] = item;
        responseCache.get(key).then(function (result) {
          result.should.be.eql(item);
          done();
        });
      });
      it('should return null if no item was found for given key', function (done) {
        responseCache.get(key).then(function (result) {
          expect(result).to.be.null;
          done();
        });
      });
      it('should reject returned promise if key is not a of type string or is empty string', function (done) {
        responseCache.get(123).then(function () {}, function (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          done();
        });
      });
    });
    describe('#removeItem(key)', function () {
      it('should return a promise', function () {
        expect(responseCache.removeItem(key)).to.be.an.instanceOf(Promise);
      });
      it('should remove item with given key from cache', function (done) {
        responseCache._cache[key] = item;
        responseCache.removeItem(key).then(function (result) {
          result.should.be.eql(item);
          expect(responseCache._cache.hasOwnProperty(key)).to.be.false;
          done();
        });
      });
      it('should resolve returned promise with null if no item was found for given key', function (done) {
        responseCache.removeItem(key).then(function (result) {
          expect(result).to.be.null;
          done();
        });
      });
      it('should reject returned promise if key is not of type string or is empty string', function (done) {
        responseCache.removeItem(123).then(function () {}, function (error) {
          expect(error).to.be.an.instanceOf(TypeError);
          done();
        });
      });
    });
    describe('#invalidate()', function() {
      it('should return a promise', function () {
        expect(responseCache.invalidate()).to.be.an.instanceOf(Promise);
      });
      it('should empty the cache', function (done) {
        responseCache._cache[key] = item;
        responseCache.invalidate().then(function () {
          expect(Object.keys(responseCache._cache)).to.be.empty;
          done();
        });
      });
    });
  });
});
