/* globals Queue */
'use strict';

describe('CIF', function () {
  var cif;
  before(function () {
    cif = window.cubx.cif.cif;
  });
  describe('#_findNextAncestorWithContext', function () {
    describe('the crcRoot is a descendant of body', function () {
      describe('the next context element is crcRoot', function () {
        var compoundEl;
        var container;
        beforeEach(function () {
          container = document.querySelector('[cubx-core-crc]');
          var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
          var divElement = document.createElement('div');
          container.appendChild(divElement);
          compoundEl = new constructor();
          divElement.appendChild(compoundEl);
          compoundEl.Context.setParent(container.Context);
          container.Context.addComponent(compoundEl);
        });
        afterEach(function () {
          while (container.childElementCount > 0) {
            container.removeChild(container.children.item(0));
          }
          container.Context._children = [];
          container.Context._components = [];
        });
        it('should get the container element', function () {
          var parentComp = cif._findNextAncestorWithContext(compoundEl);
          expect(parentComp).to.be.not.undefined;
          parentComp.should.have.property('Context');
          expect(parentComp.Context).to.be.not.empty;
          parentComp.should.be.eql(container);
        });
      });
      describe('the next context element is not the crcRoot', function () {
        var compoundEl;
        var compoundParentEl;
        var container;
        beforeEach(function () {
          container = document.querySelector('[cubx-core-crc]');
          var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
          var divElement1 = document.createElement('div');
          container.appendChild(divElement1);
          compoundParentEl = new constructor();
          divElement1.appendChild(compoundParentEl);
          compoundParentEl.Context.setParent(container.Context);
          container.Context.addComponent(compoundParentEl);

          var divElement2 = document.createElement('div');
          compoundParentEl.appendChild(divElement2);
          compoundEl = new constructor();
          divElement2.appendChild(compoundEl);
          compoundEl.Context.setParent(compoundParentEl.Context);
          compoundParentEl.Context.addComponent(compoundEl);
        });
        afterEach(function () {
          while (container.childElementCount > 0) {
            container.removeChild(container.children.item(0));
          }
          container.Context._children = [];
          container.Context._components = [];
        });
        it('should get the compoundParentEl', function () {
          var parentComp = cif._findNextAncestorWithContext(compoundEl);
          expect(parentComp).to.be.not.undefined;
          parentComp.should.have.property('Context');
          expect(parentComp.Context).to.be.not.empty;
          parentComp.should.be.eql(compoundParentEl);
          parentComp.should.be.not.eql(container);
        });
      });
      describe('the next context element is not found', function () {
        var container;
        var divElement2;
        var divElement;
        beforeEach(function () {
          container = document.querySelector('body');
          divElement = document.createElement('div');
          container.appendChild(divElement);
          divElement2 = document.createElement('div');
          divElement.appendChild(divElement2);
        });
        afterEach(function () {
          container.removeChild(divElement);
        });
        it('should get the compoundParentEl', function () {
          var parentComp = cif._findNextAncestorWithContext(divElement2);
          expect(parentComp).to.be.undefined;
        });
      });
    });
    describe('the crcRoot is the body element', function () {
      var oldContainer;
      var originRootContext;
      var rootContext;
      var container;
      before(function () {
        oldContainer = document.querySelector('[cubx-core-crc]');
        originRootContext = oldContainer.Context;
        oldContainer.removeAttribute('cubx-core-crc');
        delete oldContainer.Context;
        container = document.querySelector('body');
        container.setAttributeNode(document.createAttribute('cubx-core-crc'));
        rootContext = window.cubx.cif.cif.createRootContext(container);
        container.Context = rootContext;
        window.cubx.cif.cif._rootContext = rootContext;
      });
      after(function () {
        oldContainer.Context = originRootContext;
        container.removeAttribute('cubx-core-crc');
        delete container.Context;
        window.cubx.cif.cif._rootContext = originRootContext;
        oldContainer.setAttribute('cubx-core-crc', '');
      });
      describe('the next context element is crcRoot', function () {
        var compoundEl;
        var divElement;
        beforeEach(function () {
          container = document.querySelector('[cubx-core-crc]');
          var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
          divElement = document.createElement('div');
          container.appendChild(divElement);
          compoundEl = new constructor();
          divElement.appendChild(compoundEl);
          compoundEl.Context.setParent(container.Context);
          container.Context.addComponent(compoundEl);
        });
        afterEach(function () {
          container.removeChild(divElement);
          container.Context._children = [];
          container.Context._components = [];
        });
        it('should get the container element', function () {
          var parentComp = cif._findNextAncestorWithContext(compoundEl);
          expect(parentComp).to.be.not.undefined;
          parentComp.should.have.property('Context');
          expect(parentComp.Context).to.be.not.empty;
          parentComp.should.be.eql(container);
        });
      });
      describe('the next context element is not the crcRoot', function () {
        var compoundEl;
        var compoundParentEl;
        var divElement1;
        beforeEach(function () {
          container = document.querySelector('[cubx-core-crc]');
          var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
          divElement1 = document.createElement('div');
          container.appendChild(divElement1);
          compoundParentEl = new constructor();
          divElement1.appendChild(compoundParentEl);
          compoundParentEl.Context.setParent(container.Context);
          container.Context.addComponent(compoundParentEl);

          var divElement2 = document.createElement('div');
          compoundParentEl.appendChild(divElement2);
          compoundEl = new constructor();
          divElement2.appendChild(compoundEl);
          compoundEl.Context.setParent(compoundParentEl.Context);
          compoundParentEl.Context.addComponent(compoundEl);
        });
        afterEach(function () {
          container.removeChild(divElement1);
          container.Context._children = [];
          container.Context._components = [];
        });
        it('should get the compoundParentEl', function () {
          var parentComp = cif._findNextAncestorWithContext(compoundEl);
          expect(parentComp).to.be.not.undefined;
          parentComp.should.have.property('Context');
          expect(parentComp.Context).to.be.not.empty;
          parentComp.should.be.eql(compoundParentEl);
          parentComp.should.be.not.eql(container);
        });
      });
    });
  });
  describe('#_createObserverObject', function () {
    // eslint-disable-next-line no-unused-vars
    var getAllComponentsStub;
    var container;
    var _detectMutationSpy;

    beforeEach(function () {
      container = cif.getCRCRootNode();
      getAllComponentsStub = sinon.stub(window.cubx.CRC.getCache(), 'getAllComponents', function (artifactId) {
        return {
          'cif-test-a': {},
          'cif-test-b': {}
        };
      });
      _detectMutationSpy = sinon.spy(cif, '_detectMutation');
      cif._createObserverObject();
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getAllComponents.restore();
      cif._observer.disconnect();
      delete cif._observer;
      cif._detectMutation.restore();
      while (container.children.length > 0) {
        container.removeChild(container.children[ 0 ]);
      }
    });
    it('the observer should register, if add a new coubble', function () {
      var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
      container.appendChild(new constructor());
      _detectMutationSpy.should.been.calleOnce;
    });
  });
  describe('#_detectMutation', function () {
    // eslint-disable-next-line no-unused-vars
    var getAllComponentsStub;
    var container;
    var _addPossibleElementToQueueSpy;
    var _processElementFromQueueSpy;
    var _handleRemovedCubbleSpy;
    beforeEach(function () {
      container = cif.getCRCRootNode();
      getAllComponentsStub = sinon.stub(window.cubx.CRC.getCache(), 'getAllComponents', function (artifactId) {
        return {
          'cif-test-a': {},
          'cif-test-b': {}
        };
      });
      _addPossibleElementToQueueSpy = sinon.spy(cif, '_addPossibleElementToQueue');
      _processElementFromQueueSpy = sinon.stub(cif, '_processElementFromQueue', function () {
        // do nothing
      });
      _handleRemovedCubbleSpy = sinon.stub(cif, '_handleRemovedCubble', function () {
        // do nothing
      });
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getAllComponents.restore();
      cif._addPossibleElementToQueue.restore();
      cif._processElementFromQueue.restore();
      cif._handleRemovedCubble.restore();
    });
    describe('add a cubble', function () {
      beforeEach(function () {
        cif._createObserverObject();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');

        var element = new constructor();
        container.appendChild(element);
      });
      afterEach(function () {
        cif._elementQueue = new Queue();
        cif._observer.disconnect();
        delete cif._observer;
        while (container.children.length > 0) {
          container.removeChild(container.children[ 0 ]);
        }
      });
      it('The method #_addPossibleElementToQueue should be called once', function (done) {
        window.setTimeout(function () {
          _addPossibleElementToQueueSpy.should.been.calledOnce;
          done();
        });
      });
      it('The method #_processElementFromQueue should be called once', function (done) {
        window.setTimeout(function () {
          _processElementFromQueueSpy.should.be.calledOnce;
          done();
        });
      });
    });
    describe('remove a cubble', function () {
      var elementA;
      var elementB;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        container.appendChild(elementA);
        constructor = cif.getCompoundComponentElementConstructor('cif-test-b');
        elementB = new constructor();
        container.appendChild(elementB);
        cif._createObserverObject();
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('the method _handleRemovedCubbleSpy should be called once with arguments: deleted element and crcRoot', function (done) {
        container.removeChild(elementA);
        window.setTimeout(function () {
          _handleRemovedCubbleSpy.should.be.calledOnce;
          _handleRemovedCubbleSpy.should.be.calledWith(elementA, container);
          done();
        });
      });
    });
    describe('add a "cubx-core-connections" element', function () {
      // TODO test: add a "cubx-core-connections"
      before(function () {
      });
      after(function () {
      });
      beforeEach(function () {
      });
      afterEach(function () {
      });
      it('', function () {
      });
    });
    describe('add a "cubx-core-connection" element', function () {
      // TODO test: add a "cubx-core-connection"
      before(function () {
      });
      after(function () {
      });
      beforeEach(function () {
      });
      afterEach(function () {
      });
      it('', function () {
      });
    });
    describe('add a "cubx-core-init" element', function () {
      // TODO test: add a "cubx-core-init"
      before(function () {
      });
      after(function () {
      });
      beforeEach(function () {
      });
      afterEach(function () {
      });
      it('', function () {
      });
    });
    describe('add a "cubx-core-slot" element', function () {
      // TODO test: add a "cubx-core-slot"
      before(function () {
      });
      after(function () {
      });
      beforeEach(function () {
      });
      afterEach(function () {
      });
      it('', function () {
      });
    });
  });
  describe('#_addPossibleElementToQueue', function () {
    var container;
    var element;
    describe('the added elements next ancestor with context is the crcRoot', function () {
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        element = new constructor();
        container.appendChild(element);
        cif._elementQueue = new Queue();
        cif._addPossibleElementToQueue(element);
      });
      afterEach(function () {
        container.removeChild(element);
        cif._elementQueue = new Queue();
      });
      it('the _elementQueue should be contains one element', function () {
        expect(cif._elementQueue.getLength()).to.be.equal(1);
      });
      it('the _elementQueue should be contains the element node', function () {
        expect(cif._elementQueue.getLength()).to.be.equal(1);
        cif._elementQueue.peek().should.be.eql(element);
      });
    });
    describe('the added elements next ancestor with context is an cubble and not the crcRoot', function () {
      var parentElem;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        parentElem = new constructor();
        container.appendChild(parentElem);
        constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        element = new constructor();
        parentElem.appendChild(element);
        cif._elementQueue = new Queue();
        cif._addPossibleElementToQueue(element);
      });
      afterEach(function () {
        container.removeChild(parentElem);
        cif._elementQueue = new Queue();
      });
      it('the _elementQueue should be contains no elements', function () {
        expect(cif._elementQueue.getLength()).to.be.equal(0);
      });
    });
  });
  describe('#_processElementFromQueue', function () {
    var element;
    var _updateCubxCoreConnectionsStub;
    var _updateCubxCoreInitStub;
    var _initCubxElementsInRootStub;
    var _processObserverTriggeredSpy;
    beforeEach(function () {
      cif._resetProcessMode();
      _updateCubxCoreConnectionsStub = sinon.stub(cif, '_updateCubxCoreConnections', function () {
        // do nothing;
      });
      _updateCubxCoreInitStub = sinon.stub(cif, '_updateCubxCoreInit', function () {
        // do nothing;
      });
      _initCubxElementsInRootStub = sinon.stub(cif, '_initCubxElementsInRoot', function () {
        // do nothing;
      });
      _processObserverTriggeredSpy = sinon.spy(cif, '_processObserverTriggered');
    });
    afterEach(function () {
      cif._updateCubxCoreConnections.restore();
      cif._updateCubxCoreInit.restore();
      cif._initCubxElementsInRoot.restore();
      cif._processObserverTriggered.restore();
      cif._resetProcessMode();
    });
    describe('the queue is empty', function () {
      beforeEach(function () {
        expect(cif._elementQueue.getLength()).to.be.equal(0);
        cif._processElementFromQueue();
      });
      it('the method _updateCubxCoreConnections should not called', function () {
        _updateCubxCoreConnectionsStub.should.be.not.called;
      });
      it('the method _updateCubxCoreInit should not called', function () {
        _updateCubxCoreInitStub.should.be.not.called;
      });
      it('the method _initCubxElementsInRoot should not called', function () {
        _initCubxElementsInRootStub.should.be.not.called;
      });
      it('the elementQueue should be empty', function () {
        expect(cif._elementQueue.getLength()).to.be.equal(0);
      });
      it('the method _processObserverTriggered should be not called', function () {
        _processObserverTriggeredSpy.should.be.not.called;
      });
    });
    describe('the queue has elements', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        element = new constructor();
        cif._elementQueue.enqueue(element);
        expect(cif._elementQueue.getLength()).to.be.equal(1);
        cif._processElementFromQueue();
      });
      afterEach(function () {
        cif._elementQueue = new Queue();
      });
      it('the method _updateCubxCoreConnections should called once', function () {
        _updateCubxCoreConnectionsStub.should.be.calledOnce;
      });
      it('the method _updateCubxCoreInit should called once', function () {
        _updateCubxCoreInitStub.should.be.calledOnce;
      });
      it('the method _initCubxElementsInRoot should called once', function () {
        _initCubxElementsInRootStub.should.be.calledOnce;
      });
      it('the elementQueue should be empty', function () {
        expect(cif._elementQueue.getLength()).to.be.equal(0);
      });
      it('the method _processObserverTriggered should be called once', function () {
        _processObserverTriggeredSpy.should.be.calledOnce;
      });
    });
  });
  describe('#_handleRemovedCubble', function () {
    describe('oldParentNode is undefined', function () {
      var elementA;
      var spy;
      beforeEach(function () {
        spy = sinon.spy(console, 'warn');
      });
      afterEach(function () {
        elementA = null;
        console.warn.restore();
      });
      it('should be logged a warning', function () {
        cif._handleRemovedCubble(elementA);
        spy.should.be.calledOnce;
        spy.should.be.calledWithMatch('No context found for removed cubble');
      });
    });
    describe('parent context not exists', function () {
      var parent;
      var elementA;
      var spy;
      beforeEach(function () {
        parent = document.createElement('div');
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        spy = sinon.spy(console, 'warn');
      });
      afterEach(function () {
        parent = null;
        elementA = null;
        console.warn.restore();
      });
      it('should be logged a warning', function () {
        cif._handleRemovedCubble(elementA, parent);
        spy.should.be.calledOnce;
        spy.should.be.calledWithMatch('No context found for removed cubble');
      });
    });
    describe('context exists', function () {
      var tidyConnectionsWithCubbleStub;
      var container;
      var connectionMgr;
      var elementA;

      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        constructor = cif.getCompoundComponentElementConstructor('cif-test-b');
        var elementB = new constructor();
        container.Context.getComponents().push(elementB);
        container.Context.getComponents().push(elementA);
        connectionMgr = container.Context._connectionMgr;
        tidyConnectionsWithCubbleStub = sinon.stub(connectionMgr, 'tidyConnectionsWithCubble', function () {
          // do nothing
        });
        container.Context.getComponents().should.be.include(elementA);
        cif._handleRemovedCubble(elementA, container);
      });
      afterEach(function () {
        container.Context._components = [];
        elementA = null;
        container = null;
        connectionMgr.tidyConnectionsWithCubble.restore();
      });
      it('the method tidyConnectionsWithCubble should be called.', function () {
        tidyConnectionsWithCubbleStub.should.be.calledOnce;
        tidyConnectionsWithCubbleStub.should.be.calledWith(elementA);
      });
      it('elementA should be removed from the contexts compound list', function () {
        container.Context.getComponents().should.be.not.include(elementA);
      });
    });
  });
});
