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
      it('should add item to cache using given key', function () {
        expect(responseCache.addItem(key, item)).to.be.eql(item);
        expect(responseCache._cache[key]).to.be.eql(item);
        expect(responseCache._cache[key]).to.be.eql(item);
      });
      it('should throw an error if key is not of type string or is empty string', function () {
        var spy = sinon.spy(responseCache, 'addItem');
        try {
          responseCache.addItem(123, item);
        } catch (e) {}
        expect(spy.threw('TypeError')).to.be.true;
        responseCache.addItem.restore();
      });
      it('should throw an error if item is null', function () {
        var spy = sinon.spy(responseCache, 'addItem');
        try {
          responseCache.addItem(key, null);
        } catch (e) {}
        expect(spy.threw('TypeError')).to.be.true;
        responseCache.addItem.restore();
      });
      it('should override item if there is already one for given key', function () {
        responseCache._cache[key] = item;
        responseCache.addItem(key, item2);
        expect(responseCache._cache[key]).to.be.eql(item2);
      });
    });
    describe('#get(key)', function () {
      it('should return the item for given key', function () {
        responseCache._cache[key] = item;
        expect(responseCache.get(key)).to.be.eql(item);
      });
      it('should return null if no item was found for given key', function () {
        expect(responseCache.get(key)).to.be.null;
      });
      it('should throw an error if key is not of type string or is empty string', function () {
        var spy = sinon.spy(responseCache, 'get');
        try {
          responseCache.get(123);
        } catch (e) {}
        expect(spy.threw('TypeError')).to.be.true;
        responseCache.get.restore();
      });
    });
    describe('#removeItem(key)', function () {
      it('should remove item with given key from cache and return removed item', function () {
        responseCache._cache[key] = item;
        expect(responseCache.removeItem(key)).to.be.eql(item);
        expect(responseCache._cache.hasOwnProperty(key)).to.be.false;
      });
      it('should return null if no item was found for given key', function () {
        expect(responseCache.removeItem(key)).to.be.null;
      });
      it('should throw an error if key is not of type string or is empty string', function () {
        var spy = sinon.spy(responseCache, 'removeItem');
        try {
          responseCache.removeItem(123);
        } catch (e) {}
        expect(spy.threw('TypeError')).to.be.true;
        responseCache.removeItem.restore();
      });
    });
    describe('#invalidate()', function () {
      it('should empty the cache', function () {
        responseCache._cache[key] = item;
        responseCache.invalidate();
        expect(Object.keys(responseCache._cache)).to.be.empty;
      });
    });
  });
});
