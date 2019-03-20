/* globals _,initNewElement,getTestComponentCacheEntry,HTMLImports,createHtmlImport,getContainer */
'use strict';
describe('CubxComponent (helper)', function () {
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
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

    describe('#_initValue', function () {
      it('should be null, if arg1 is null and arg2 is undefined', function () {
        expect(component._initValue('test')).to.be.string;
        expect(component._initValue(null)).to.be.null;
      });
      it('should be an empty string (""), if arg1 is an empty string and arg2 is undefined', function () {
        expect(component._initValue('')).to.be.string;
      });
      it('should be an empty string (""), if arg1 is an empty string and arg2 is string', function () {
        expect(component._initValue('', 'string')).to.be.string;
      });

      it('should be a string, if arg1 is a string and arg2 is "string"', function () {
        var value = 'test';
        expect(component._initValue(value, 'string')).to.be.a.string;
        expect(component._initValue(value, 'string')).to.be.equal(value);
      });
      it('should be null, if arg1 is null and arg2 is "string"', function () {
        expect(component._initValue(null, 'string')).to.be.a.string;
        expect(component._initValue(null, 'string')).to.be.null;
      });

      it('should be an empty string, if arg1 is null and arg2 is "string"', function () {
        expect(component._initValue('', 'string')).to.be.a.string;
        expect(component._initValue('', 'string')).to.be.equal('');
      });
      it('should be undefined, if arg1 is null and arg2 is "string"', function () {
        expect(component._initValue(undefined, 'string')).to.be.undefined;
      });
      it('should be null, if arg1 is null and arg2 is "array"', function () {
        expect(component._initValue(null, 'array')).to.be.null;
      });
      it('should beundefined, if arg1 is null and arg2 is "array"', function () {
        expect(component._initValue(undefined, 'array')).to.be.undefined;
      });
      it('should be an empty array, if arg1 is "[]" and arg2 is "array"', function () {
        expect(component._initValue([], 'array')).to.be.an('array');
        expect(component._initValue([], 'array')).to.be.eql([]);
      });
      it('should be "[1,2,3]", if arg1 is "[1,2,3]" and arg2 is "array"', function () {
        expect(component._initValue([ 1, 2, 3 ], 'array')).to.be.an('array');
        expect(component._initValue([ 1, 2, 3 ], 'array')).to.be.eql([ 1, 2, 3 ]);
      });
      it('should be null, if arg1 is null and arg2 is "object"', function () {
        expect(component._initValue(null, 'object')).to.be.null;
      });
      it('should be {}, if arg1 is {} and arg2 is "object"', function () {
        expect(component._initValue({}, 'object')).to.be.an('object');
        expect(component._initValue({}, 'object')).to.be.eql({});
      });
      it('should be {foo:"baz"}, if arg1 is {foo:"baz"} and arg2 is "object"', function () {
        expect(component._initValue({ foo: 'baz' }, 'object')).to.be.an('object');
        expect(component._initValue({ foo: 'baz' }, 'object')).to.be.eql({ foo: 'baz' });
      });
      it('should be undefined, if arg1 is null and arg2 is "object"', function () {
        expect(component._initValue(undefined, 'object')).to.be.undefined;
      });
      it('should be 0, if arg1 is null and arg2 is  "number"', function () {
        expect(component._initValue(null, 'number')).to.be.a('number');
        expect(component._initValue(null, 'number')).to.be.equal(0);
      });
      it('should be 0, if arg1 is undefined and arg2 is  "number"', function () {
        expect(component._initValue(undefined, 'number')).to.be.a('number');
        expect(component._initValue(undefined, 'number')).to.be.equal(0);
      });
      it('should be 0, if arg1 is 0 and arg2 is  "number"', function () {
        expect(component._initValue(0, 'number')).to.be.a('number');
        expect(component._initValue(0, 'number')).to.be.equal(0);
      });
      it('should be 15, if arg1 is 15 and arg2 is  "number"', function () {
        expect(component._initValue(15, 'number')).to.be.a('number');
        expect(component._initValue(15, 'number')).to.be.equal(15);
      });
      it('should be false, if arg1 is false and arg2 is  "boolean"', function () {
        expect(component._initValue(false, 'boolean')).to.be.a('boolean');
        expect(component._initValue(false, 'boolean')).to.be.equal(false);
      });
      it('should be true, if arg1 is true and arg2 is  "boolean"', function () {
        expect(component._initValue(true, 'boolean')).to.be.a('boolean');
        expect(component._initValue(true, 'boolean')).to.be.equal(true);
      });
      it('should be "dummy", if arg1 is "dummy" and arg2 is  "boolean"', function () {
        expect(component._initValue('dummy', 'boolean')).to.be.a.string;
        expect(component._initValue('dummy', 'boolean')).to.be.equal('dummy');
      });
      it('should be false, if arg1 is null and arg2 is  "boolean"', function () {
        expect(component._initValue(null, 'boolean')).to.be.a('boolean');
        expect(component._initValue(null, 'boolean')).to.be.equal(false);
      });
      it('should be false, if arg1 is null and arg2 is  "boolean"', function () {
        expect(component._initValue(undefined, 'boolean')).to.be.a('boolean');
        expect(component._initValue(undefined, 'boolean')).to.be.equal(false);
      });
      it('should be a string, if arg1 is a string is and arg2 not "string"', function () {
        expect(component._initValue('test', 'object')).to.be.equal('test');
        expect(component._initValue('test', 'object')).to.be.a.string;
      });
      it('should be an object, if arg1 is an object is and arg2is  undefined', function () {
        var value = { test: 'test' };
        expect(component._initValue(value)).to.an('object');
        expect(component._initValue(value)).to.be.deep.equal(value);
      });
      it('should be an object, if arg1 is an object is and arg2 is "???"', function () {
        var value = { test: 'test' };
        expect(component._initValue(value, '???')).to.an('object');
        expect(component._initValue(value, '???')).to.be.deep.equal(value);
      });
      it('should be an empty string, if arg1 is null is and arg2 is "???"', function () {
        expect(component._initValue(null, '???')).to.an.string;
        expect(component._initValue(null, '???')).to.be.null;
      });
      it('should be an empty string, if arg1 is null is and arg2 is "???"', function () {
        expect(component._initValue(undefined, '???')).to.be.undefined;
      });
      it('should be an empty string, if arg1 is null is and arg2 is "???"', function () {
        expect(component._initValue(null, '???')).to.a.string;
        expect(component._initValue(null, '???')).to.be.null;
      });
      it('should be {foo:"baz"}, if arg1 is {foo:"baz"} is and arg2 is "string"', function () {
        expect(component._initValue({ foo: 'baz' }, 'string')).to.an('object');
        expect(component._initValue({ foo: 'baz' }, 'string')).to.be.eql({ foo: 'baz' });
      });
    });

    describe('#_cloneValue', function () {
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

    describe('#_isValidType', function () {
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

  describe('css selector functions', function () {
    var container;
    var elementName = 'css-selector-test-element';
    var element;
    before(function (done) {
      container = getContainer();
      var url = 'base/test/resources/template-css-selector-test-element.html';
      var promise = createHtmlImport(url);
      promise.then(function (value) {
        var el = document.createElement('div');

        var scriptEl = document.createElement('script');
        scriptEl.async = false;
        scriptEl.defer = false;
        scriptEl.type = 'text/javascript';
        var content = 'CubxComponent({ is: "' + elementName + '", ready: function(){ spyCallback();} });';
        try {
          scriptEl.appendChild(document.createTextNode(content));
        } catch (e) {
          scriptEl.text = content;
        }
        el.appendChild(scriptEl);

        document.body.appendChild(el);
        element = document.createElement(elementName);
        element.setAttribute('runtime-id', elementName + '#1');
        container.appendChild(element);
        done();
      }).catch(function (err) {
        console.error(err);
        done();
      });
    });
    describe('#$$', function () {
      it('should find the element with id=a', function (done) {
        setTimeout(function () {
          var el = element.$$('#a');
          expect(el).exist;
          el.id.should.be.equal('a');
          el.innerHTML.should.be.equal('a');
          done();
        }, 150);
      });
      it('should find the element with id=b', function (done) {
        setTimeout(function () {
          var el = element.$$('#b');
          expect(el).exist;
          el.id.should.be.equal('b');
          el.firstChild.innerHTML.should.be.equal('b');
          done();
        }, 150);
      });
      it('should find the element with id=c', function (done) {
        setTimeout(function () {
          var el = element.$$('#c');
          expect(el).exist;
          el.id.should.be.equal('c');
          el.innerHTML.should.be.equal('c');
          done();
        }, 150);
      });
      it('should find the element with class=d', function (done) {
        setTimeout(function () {
          var el = element.$$('.d');
          expect(el).exist;
          el.className.should.be.equal('d');
          el.innerHTML.should.be.equal('d');
          done();
        }, 150);
      });
    });
    describe('.<id>', function () {
      it('should find the element with id=a', function (done) {
        setTimeout(function () {
          var el = element.$.a;
          expect(el).exist;
          el.id.should.be.equal('a');
          el.innerHTML.should.be.equal('a');
          done();
        }, 150);
      });
      it('should find the element with id=b', function (done) {
        setTimeout(function () {
          var el = element.$.b;
          expect(el).exist;
          el.id.should.be.equal('b');
          el.firstChild.innerHTML.should.be.equal('b');
          done();
        }, 150);
      });
      it('should find the element with id=c', function (done) {
        setTimeout(function () {
          var el = element.$.c;
          expect(el).exist;
          el.id.should.be.equal('c');
          el.innerHTML.should.be.equal('c');
          done();
        }, 150);
      });
    });
  });
});
