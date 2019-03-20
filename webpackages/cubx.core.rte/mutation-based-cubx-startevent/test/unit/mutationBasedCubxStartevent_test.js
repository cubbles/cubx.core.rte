'use strict';
describe('MutationBasedCubxStartevent', function () {
  var eventName = 'mutationBasedStart';
  var mutCubxStartevent;
  before(function () {
    mutCubxStartevent = window.cubx.mutationBasedCubxStartevent;
  });
  describe('#dispatchEvent', function () {
    var spyWarn;
    before(function () {
      spyWarn = sinon.spy(console, 'warn');
    });
    beforeEach(function () {
      mutCubxStartevent.scriptElement = document.createElement('script');
    });
    afterEach(function () {
      mutCubxStartevent.scriptElement = null;
      spyWarn.resetHistory();
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
    var spyObserveBody;
    var spyObserveTargetNode;
    var selector = '#observable';
    beforeEach(function () {
      mutCubxStartevent.scriptElement = document.createElement('script');
      mutCubxStartevent.scriptElement.setAttribute(mutCubxStartevent.cubxEmitEventAttr, eventName);
    });
    afterEach(function () {
      mutCubxStartevent.scriptElement = null;
    });
    describe('target node is in DOM', function () {
      var div = document.createElement('div');
      var spyFunction;
      before(function () {
        spyFunction = sinon.spy(mutCubxStartevent, '_dispatchEmitEvent');
      });
      afterEach(function () {
        spyFunction.resetHistory();
      });
      describe('process body (as target node) mutation', function () {
        afterEach(function () {
          mutCubxStartevent.observer.disconnect();
          document.body.removeChild(div);
        });
        it('should observe body and process the mutation correctly', function (done) {
          mutCubxStartevent._processMutation();
          document.body.appendChild(div);
          document.addEventListener(eventName, function () {
            spyFunction.should.be.calledOnce;
            done();
          });
        });
      });
      describe('observe target node', function () {
        before(function () {
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
    describe('observe body until the node is added', function () {
      before(function () {
        spyObserveBody = sinon.spy(mutCubxStartevent, '_observeBody');
        spyObserveTargetNode = sinon.spy(mutCubxStartevent, '_observeTargetNode');
      });
      after(function () {
        mutCubxStartevent._observeBody.restore();
      });
      it('should call \'_observeBody\' since the target node is not in DOM', function () {
        mutCubxStartevent.scriptElement.setAttribute(mutCubxStartevent.cubxMutationTargetNodeAttr, selector);
        mutCubxStartevent._processMutation();
        spyObserveBody.should.be.calledOnce;
      });
      it('should detect that the target node was added', function () {
        var div = document.createElement('div');
        document.body.appendChild(div);
        mutCubxStartevent._processMutation();
        spyObserveTargetNode.should.be.calledOnce;
      });
    });
  });
});
