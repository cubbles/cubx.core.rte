/* globals localStorage */
window.cubx.amd.define([ 'storageManager' ], function (storageMgr) {
  'use strict';

  describe('StorageManager', function () {
    var key = 'testKey';
    var item = {
      key1: 'value1',
      key2: {
        key2_1: 'value2_1',
        key2_2: 22
      }
    };

    describe('#setObjectToLocalStorage()', function () {
      before(function () {
        localStorage.clear();
      });
      it('should stringify a given object and store it to localStorage using given key', function () {
        storageMgr.setObjectToLocalStorage(key, item);
        localStorage.getItem(key).should.equal(JSON.stringify(item));
      });
    });
    describe('#getObjectFromLocalStorage()', function () {
      beforeEach(function () {
        localStorage.clear();
      });
      it('should get a value from localStorage as Object by given key', function () {
        localStorage.setItem(key, JSON.stringify(item));
        storageMgr.getObjectFromLocalStorage(key).should.eql(item);
      });
      it('should return null if no item is found in localStorage for the given key', function () {
        expect(storageMgr.getObjectFromLocalStorage(key)).to.be.a('null');
      });
    });
    describe('#getModel()', function () {
      beforeEach(function () {
        storageMgr._modelCache = {};
      });
      it('should return a new model for given id if no model is available for the given id', function () {
        var id = 'testId';
        var model = {};
        storageMgr.getModel(id, model).should.be.an('object');
      });
    });
  });
});
