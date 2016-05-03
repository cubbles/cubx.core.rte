/* globals _,initNewElement,getTestComponentCacheEntry */
'use strict';
describe('CubxPolymer (helper)', function () {
  describe('helper functions', function () {
    var elementName = 'dummy-helper';
    var component;
    before(function () {
      window.componentCacheEntry = {};

      initNewElement(elementName);
      component = document.querySelector(elementName);
    });
    after(function () {
      window.componentCacheEntry = undefined;
    });

    describe('_initValue', function () {
      it('should be an empty string, if arg1 is null and arg2 is undefined', function () {
        expect(component._initValue('test')).to.be.string;
        expect(component._initValue(null)).to.be.empty;
      });
      it('should be an empty string, if arg1 is null and arg2 is "string"', function () {
        expect(component._initValue(null, 'string')).to.be.a.string;
        expect(component._initValue(null, 'string')).to.be.empty;
      });
      it('should be an empty string, if arg1 is null and arg2 is "STring"', function () {
        expect(component._initValue(null, 'string')).to.be.a.string;
        expect(component._initValue(null, 'string')).to.be.empty;
      });
      it('should be an empty array, if arg1 is null and arg2 is "array"', function () {
        expect(component._initValue(null, 'array')).to.be.a.string;
        expect(component._initValue(null, 'array')).to.be.empty;
      });
      it('should be an empty object, if arg1 is null and arg2 is "object"', function () {
        expect(component._initValue(null, 'object')).to.be.an.object;
        expect(component._initValue(null, 'object')).to.be.empty;
      });
      it('should be 0, if arg1 is null and arg2 is  "number"', function () {
        expect(component._initValue(null)).to.be.a.number;
        expect(component._initValue(null, 'number')).to.be.equal(0);
      });

      it('should be a string, if arg1 is a string and arg2 is undefined', function () {
        var value = 'test';
        expect(component._initValue(value)).to.be.string;
        expect(component._initValue(value)).to.be.equal(value);
      });
      it('should be a string, if arg1 is a string and arg2 is "string"', function () {
        var value = 'test';
        expect(component._initValue(value)).to.be.a.string;
        expect(component._initValue(value, 'string')).to.be.equal(value);
      });
      it('should be a string, if arg1 is a string and arg2 is "string"', function () {
        var value = 'test';
        expect(component._initValue(value)).to.be.a.string;
        expect(component._initValue(value, 'string')).to.be.equal(value);
      });
      it('should be a string, if arg1 is a string is and arg2 not "string"', function () {
        expect(component._initValue('test', 'object')).to.be.equal('test');
      });
      it('should be an object, if arg1 is an object is and arg2is  undefined', function () {
        var value = { test: 'test' };
        expect(component._initValue(value)).to.an.object;
        expect(component._initValue(value)).to.be.deep.equal(value);
      });
      it('should be an object, if arg1 is an object is and arg2 is "???"', function () {
        var value = { test: 'test' };
        expect(component._initValue(value, '???')).to.an.object;
        expect(component._initValue(value, '???')).to.be.deep.equal(value);
      });

      it('should be an empty string, if arg1 is null is and arg2 is "???"', function () {
        expect(component._initValue(null, '???')).to.an.string;
        expect(component._initValue(null, '???')).to.be.empty;
      });
    });

    describe('_cloneValue', function () {
      it('changing of cloned object not change origin Object', function () {
        var obj = { a: 'b' };
        var clonedObj = component._cloneValue(obj);
        clonedObj.a = 'c';
        obj.should.be.not.deep.equal(clonedObj);
      });
      it('changing of deep cloned object not change origin Object', function () {
        var obj = { a: 'b', c: { d: 'f' } };
        var clonedObj = component._cloneValue(obj);
        clonedObj.c.d = 'g';
        obj.should.be.not.deep.equal(clonedObj);
      });
    });

    describe('_isValidType', function () {
      it('should be ok, if type is "string"', function () {
        expect(component._isValidType('string')).to.be.ok;
      });
      it('should be ok, if type is "object"', function () {
        expect(component._isValidType('object')).to.be.ok;
      });
      it('should be ok, if type is "number"', function () {
        expect(component._isValidType('number')).to.be.ok;
      });
      it('should be ok, if type is "array"', function () {
        expect(component._isValidType('array')).to.be.ok;
      });
      it('should be not ok, if type is "other"', function () {
        expect(component._isValidType('other')).to.be.not.ok;
      });
    });
  });
  describe('helper functions for input/output slot', function () {
    var elementName = 'dummy-helper2';
    var component;

    before(function () {
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
      initNewElement(elementName);
      component = document.querySelector(elementName);
    });
    after(function () {
      window.componentCacheEntry = undefined;
    });

    describe('isInputSlot', function () {
      it('should be ok, for slot "inputvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'inputvar';
        });
        expect(component.isInputSlot(slot)).to.be.ok;
      });
      it('should be ok, for slot "inputoutputvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'inputoutputvar';
        });
        expect(component.isInputSlot(slot)).to.be.ok;
      });
      it('should be not ok, for slot "outputvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'outputvar';
        });
        expect(component.isInputSlot(slot)).to.be.not.ok;
      });
      it('should be ok, for slot "inputoutputwithoutdirectionvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'inputoutputwithoutdirectionvar';
        });
        expect(component.isInputSlot(slot)).to.be.ok;
      });
    });
    describe('isOutputSlot', function () {
      it('should be not ok, for slot "inputvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'inputvar';
        });
        expect(component.isOutputSlot(slot)).to.be.not.ok;
      });
      it('should be ok, for slot "inputoutputvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'inputoutputvar';
        });
        expect(component.isOutputSlot(slot)).to.be.ok;
      });
      it('should be ok, for slot "outputvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'outputvar';
        });
        expect(component.isOutputSlot(slot)).to.be.ok;
      });
      it('should be ok, for slot "inputoutputwithoutdirectionvar"', function () {
        var slot = _.find(window.componentCacheEntry.slots, function (elem) {
          return elem.slotId === 'inputoutputwithoutdirectionvar';
        });
        expect(component.isOutputSlot(slot)).to.be.ok;
      });
    });
  });
});

