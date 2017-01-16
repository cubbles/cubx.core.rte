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
    beforeEach(function () {
      container = cif.getCRCRootNode();
      getAllComponentsStub = sinon.stub(window.cubx.CRC.getCache(), 'getAllComponents', function (artifactId) {
        return {
          'cif-test-a': {},
          'cif-test-b': {}
        };
      });
      _addPossibleElementToQueueSpy = sinon.spy(cif, '_addPossibleElementToQueue');
      _processElementFromQueueSpy = sinon.stub(cif, '_processElementFromQueue', function(){
        // do nothing
      });
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getAllComponents.restore();
      cif._addPossibleElementToQueue.restore();
      cif._processElementFromQueue.restore();
    });
    describe('add a component', function () {
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
    describe('remove a component', function () {
      beforeEach(function () {
        cif._createObserverObject();
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('TODO', function () {
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
    var container;
    var element;
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
    it('', function () {
    });
  });
});
