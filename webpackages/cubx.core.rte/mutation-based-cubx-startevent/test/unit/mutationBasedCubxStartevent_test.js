'use strict';
describe('MutationBasedCubxStartevent', function () {
  var eventName = 'mutationBasedStart';
  var mutCubxStartevent;
  before(function () {
    mutCubxStartevent = window.cubx.mutationBasedCubxStartevent;
  });
  describe('#fromSimpleQuoteToDoubleQuotes', function () {
    it('should return a string with double quotes instead of single quotes', function () {
      var singleQuoteString = '{ \'key\': \'value\', \'key2\': true, \'key3\': 2}';
      var doubleQuoteString = mutCubxStartevent.fromSimpleQuoteToDoubleQuotes(singleQuoteString);
      expect(doubleQuoteString).to.equal('{ "key": "value", "key2": true, "key3": 2}');
    });
  });
  describe('#dispatchEvent', function () {
    var spyWarn;
    beforeEach(function () {
      mutCubxStartevent.scriptElement = document.createElement('script');
      spyWarn = sinon.spy(console, 'warn');
    });
    afterEach(function () {
      mutCubxStartevent.scriptElement = null;
      console.warn.restore();
    });
    it('should dispatch event \'' + eventName + '\'', function () {
      mutCubxStartevent.scriptElement.setAttribute(mutCubxStartevent.cubxEmitEventAttr, eventName);
      var spy = sinon.spy();
      document.addEventListener(eventName, spy);
      mutCubxStartevent._dispatchEmitEvent();
      spy.should.be.calledOnce;
      document.removeEventListener(eventName, spy);
    });
    it('should not dispatch any event and a warn should be displayed in console', function () {
      mutCubxStartevent._dispatchEmitEvent();
      spyWarn.should.be.calledOnce;
      spyWarn.should.be.calledWith('Can\'t dispatch event since the attribute \'' + mutCubxStartevent.cubxEmitEventAttr + '\' is undefined.' +
        '\n Please provide a value for this attribute within the script tag');
    });
  });
  describe('#_processMutation', function () {
    var spyWarn;
    var spyFunction;
    var selector = '#observable';
    beforeEach(function () {
      mutCubxStartevent.scriptElement = document.createElement('script');
    });
    afterEach(function () {
      mutCubxStartevent.scriptElement = null;
    });
    before(function () {
      spyWarn = sinon.spy(console, 'warn');
    });
    after(function () {
      console.warn.restore();
    });
    it('should warn that the node was not found', function () {
      mutCubxStartevent.scriptElement.setAttribute(mutCubxStartevent.cubxMutationTargetNodeAttr, selector);
      mutCubxStartevent._processMutation();
      spyWarn.should.be.calledOnce;
      spyWarn.should.be.calledWith('Can\'t process mutation since no node could be found using the \'' +
        selector + '\' selector.' + '\nPlease provide a valid css selector using the \'' +
        mutCubxStartevent.cubxMutationTargetNodeAttr + '\' attribute within the script tag.');
    });
    describe('should process mutation correctly', function () {
      var div;
      beforeEach(function () {
        spyFunction = sinon.spy(mutCubxStartevent, '_dispatchEmitEvent');
        mutCubxStartevent.scriptElement.setAttribute(mutCubxStartevent.cubxEmitEventAttr, eventName);
      });
      afterEach(function () {
        mutCubxStartevent._dispatchEmitEvent.restore();
      });
      it('should observe body and process the mutation correctly', function (done) {
        mutCubxStartevent._processMutation();
        document.body.appendChild(document.createElement('p'));
        document.addEventListener(eventName, function () {
          spyFunction.should.be.calledOnce;
          done();
        });
      });
      before(function () {
        div = document.createElement('div');
        div.setAttribute('id', 'observable');
        document.body.appendChild(div);
      });
      after(function () {
        document.body.removeChild(div);
      });
      it('should observe the element reached by the \'' + selector + '\' selector and process the mutation correctly', function (done) {
        mutCubxStartevent.scriptElement.setAttribute(mutCubxStartevent.cubxMutationTargetNodeAttr, selector);
        mutCubxStartevent._processMutation();
        div.appendChild(document.createElement('p'));
        document.addEventListener(eventName, function () {
          spyFunction.should.be.calledOnce;
          done();
        });
      });
    });
  });
});
