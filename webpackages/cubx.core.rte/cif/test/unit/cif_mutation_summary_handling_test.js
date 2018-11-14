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
    var cache;
    var crc;
    var getResolvedComponentStub; // eslint-disable-line no-unused-vars
    beforeEach(function () {
      crc = window.cubx.CRC;
      container = cif.getCRCRootNode();
      cache = window.cubx.CRC.getCache();
      getAllComponentsStub = sinon.stub(cache, 'getAllComponents').callsFake(function (artifactId) {
        return {
          'cif-test-a': {},
          'cif-test-b': {}
        };
      });
      _detectMutationSpy = sinon.spy(cif, '_detectMutation');
      getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (artifactId) {
        var elem = {
          webpackageId: 'test.' + artifactId + '@0.1', artifactId: artifactId
        };
        if (artifactId === 'cif-test-a') {
          elem.artifactType = 'compoundComponent';
        } else if (artifactId === 'cif-test-b') {
          elem.artifactType = 'elementaryComponentt';
        }
        return elem;
      });
    });
    afterEach(function () {
      cif._detectMutation.restore();
      while (container.children.length > 0) {
        container.removeChild(container.children[ 0 ]);
      }
      cache.getAllComponents.restore();
      crc.getResolvedComponent.restore();
    });
    describe('add new cubble', function () {
      beforeEach(function () {
        cif._createObserverObject();
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });

      it('the observer should register, if add a new cubble', function (done) {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        container.appendChild(new constructor());
        setTimeout(function () {
          _detectMutationSpy.should.been.calledOnce;
          done();
        });
      });
    });
    describe('remove a cubble', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        container.appendChild(new constructor());
        cif._createObserverObject();
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('the observer should register, if remove a cubble', function (done) {
        var element = container.querySelector('cif-test-a');
        container.removeChild(element);
        setTimeout(function () {
          _detectMutationSpy.should.been.calledOnce;
          done();
        });
      });
    });
    describe('add <cubx-core-connections>', function () {
      var connectionsEl;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        var cubble = new constructor();
        container.appendChild(cubble);

        cif._createObserverObject();
        connectionsEl = document.createElement('cubx-core-connections');
        cubble.appendChild(connectionsEl);
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('the observer should register, if add a cubx-core-connections element', function (done) {
        setTimeout(function () {
          _detectMutationSpy.should.been.calledOnce;
          done();
        });
      });
    });
    describe('add cubx-core-connection', function () {
      var connectionEl;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        var cubble = new constructor();
        container.appendChild(cubble);
        var connectionsEl = document.createElement('cubx-core-connections');
        cubble.appendChild(connectionsEl);
        cif._createObserverObject();
        connectionEl = document.createElement('cubx-core-connection');
        cubble.appendChild(connectionEl);
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('the observer should register, if add a cubx-core-connection element', function (done) {
        setTimeout(function () {
          _detectMutationSpy.should.been.calledOnce;
          done();
        });
      });
    });
    describe('remove <cubx-core-connections>;', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        var cubble = new constructor();
        container.appendChild(cubble);

        var connectionsEl = document.createElement('cubx-core-connections');
        cubble.appendChild(connectionsEl);
        cif._createObserverObject();
        cubble.removeChild(connectionsEl);
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('the observer should register, if remove a cubx-core-connections element', function (done) {
        setTimeout(function () {
          _detectMutationSpy.should.been.calledOnce;
          done();
        });
      });
    });
    describe('remove <cubx-core-connection>', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        var cubble = new constructor();
        container.appendChild(cubble);

        var connectionsEl = document.createElement('cubx-core-connections');
        cubble.appendChild(connectionsEl);
        var connectionEl = document.createElement('cubx-core-connection');
        connectionsEl.appendChild(connectionEl);
        cif._createObserverObject();
        connectionsEl.removeChild(connectionEl);
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('the observer should register, if remove a cubx-core-connection element', function (done) {
        setTimeout(function () {
          _detectMutationSpy.should.been.calledOnce;
          done();
        });
      });
    });
  });
  describe('#_detectMutation', function () {
    // eslint-disable-next-line no-unused-vars
    var getAllComponentsStub;
    var container;
    var _addPossibleElementToQueueStub;
    var _processElementFromQueueSpy;
    var _handleRemovedCubbleStub;
    var _handleAddedConnectionStub;
    var _handleRemovedConnectionsSpy;
    var _handleRemovedConnectionStub;
    beforeEach(function () {
      container = cif.getCRCRootNode();
      getAllComponentsStub = sinon.stub(window.cubx.CRC.getCache(), 'getAllComponents').callsFake(function (artifactId) {
        return {
          'cif-test-a': {},
          'cif-test-b': {},
          'cif-test-c': {}
        };
      });
      _addPossibleElementToQueueStub = sinon.stub(cif, '_addPossibleElementToQueue').callsFake(function (element) {
        console.log('_addPossibleElementToQueue argument: element', element);
      });
      _processElementFromQueueSpy = sinon.stub(cif, '_processElementFromQueue').callsFake(function () {
        console.log('_processElementFromQueue no args');
      });
      _handleRemovedCubbleStub = sinon.stub(cif, '_handleRemovedCubble').callsFake(function (element, oldParentNode) {
        console.log('_handleRemovedCubble arg: element', element);
        console.log('_handleRemovedCubble arg: oldParentNode', oldParentNode);
      });
      _handleAddedConnectionStub = sinon.stub(cif, '_handleAddedConnection').callsFake(function (connectionElement) {
        console.log('_handleAddedConnection arg: element', connectionElement);
      });
      _handleRemovedConnectionsSpy = sinon.spy(cif, '_handleRemovedConnections');
      _handleRemovedConnectionStub = sinon.stub(cif, '_handleRemovedConnection').callsFake(function (element, oldParentNode) {
        console.log('element', element);
        console.log('oldParentNode', oldParentNode);
      });
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getAllComponents.restore();
      cif._addPossibleElementToQueue.restore();
      cif._processElementFromQueue.restore();
      cif._handleRemovedCubble.restore();
      cif._handleAddedConnection.restore();
      cif._handleRemovedConnections.restore();
      cif._handleRemovedConnection.restore();
    });
    describe('add a cubble', function () {
      var getResolvedComponentStub; // eslint-disable-line no-unused-vars
      var crc;
      beforeEach(function () {
        crc = window.cubx.CRC;
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (artifactId) {
          var elem = {
            webpackageId: 'test.' + artifactId + '@0.1', artifactId: artifactId
          };
          if (artifactId === 'cif-test-a') {
            elem.artifactType = 'compoundComponent';
          } else if (artifactId === 'cif-test-b') {
            elem.artifactType = 'compoundComponent';
          } else if (artifactId === 'cif-test-c') {
            elem.artifactType = 'elementaryComponentt';
          }
          return elem;
        });

        cif._createObserverObject();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        var element = new constructor();
        container.appendChild(element);
      });
      afterEach(function () {
        crc.getResolvedComponent.restore();
        cif._elementQueue = new Queue();
        cif._observer.disconnect();
        delete cif._observer;
        while (container.children.length > 0) {
          container.removeChild(container.children[ 0 ]);
        }
      });
      it('The method #_addPossibleElementToQueue should be called once', function (done) {
        window.setTimeout(function () {
          _addPossibleElementToQueueStub.should.been.calledOnce;
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
      it('the method _handleRemovedCubbleStub should be called once with arguments: deleted element and crcRoot', function (done) {
        container.removeChild(elementA);
        window.setTimeout(function () {
          _handleRemovedCubbleStub.should.be.calledOnce;
          _handleRemovedCubbleStub.should.be.calledWith(elementA, container);
          done();
        });
      });
    });
    describe('remove a cubble tree', function () {
      var elementA;
      var elementB;
      var elementC;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        container.appendChild(elementA);
        constructor = cif.getCompoundComponentElementConstructor('cif-test-b');
        elementB = new constructor();
        container.appendChild(elementB);
        constructor = cif.getCompoundComponentElementConstructor('cif-test-c');
        elementC = new constructor();
        elementB.appendChild(elementC);
        cif._createObserverObject();
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
      });
      it('the method _handleRemovedCubbleStub should be called once with arguments: deleted element elementA and crcRoot', function (done) {
        container.removeChild(elementA);
        window.setTimeout(function () {
          _handleRemovedCubbleStub.should.be.calledOnce;
          _handleRemovedCubbleStub.should.be.calledWith(elementA, container);
          done();
        });
      });
      it('the method _handleRemovedCubbleStub should be called twice', function (done) {
        container.removeChild(elementB);
        window.setTimeout(function () {
          _handleRemovedCubbleStub.should.be.calledTwice;
          _handleRemovedCubbleStub.args[0].should.eql([elementB, container]);
          _handleRemovedCubbleStub.args[1].should.eql([elementC, elementB]);
          // _handleRemovedCubbleStub.should.be.calledWith(elementB, container);
          // _handleRemovedCubbleStub.should.be.calledWith(elementC, elementB);
          done();
        });
      });
      it('the method _handleRemovedCubbleStub should be not called for removed element elementC', function (done) {
        elementB.removeChild(elementC);
        window.setTimeout(function () {
          _handleRemovedCubbleStub.should.be.calledOnce;
          _handleRemovedCubbleStub.should.be.calledWith(elementC, elementB);
          done();
        });
      });
    });
    describe('add a "cubx-core-connection" element', function () {
      var connections;
      var connection;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        var element = new constructor();
        container.appendChild(element);
        connections = document.createElement('cubx-core-connections');
        element.appendChild(connections);
        cif._createObserverObject();
        connection = document.createElement('cubx-core-connection');
        connections.appendChild(connection);
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
        while (container.children.length > 0) {
          container.removeChild(container.children[ 0 ]);
        }
        connection = null;
        connections = null;
      });
      it('the method _handleAddedConnection should be called once', function (done) {
        window.setTimeout(function () {
          _handleAddedConnectionStub.should.be.calledOnce;
          _handleAddedConnectionStub.should.be.calledWith(connection);
          done();
        });
      });
    });
    describe('remove a "cubx-core-connections" element', function () {
      var connections;
      var element;
      var connection1;
      var connection2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        element = new constructor();
        container.appendChild(element);
        connections = document.createElement('cubx-core-connections');
        element.appendChild(connections);
        connection1 = document.createElement('cubx-core-connection');
        connections.appendChild(connection1);
        connection2 = document.createElement('cubx-core-connection');
        connections.appendChild(connection2);
        cif._createObserverObject();
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
        while (container.children.length > 0) {
          container.removeChild(container.children[ 0 ]);
        }
        connections = null;
      });
      it('the method _handleRemovedConnections should be called once', function (done) {
        element.removeChild(connections);
        window.setTimeout(function () {
          _handleRemovedConnectionsSpy.should.be.calledOnce;
          _handleRemovedConnectionsSpy.should.be.calledWith(connections, element);
          done();
        });
      });
      it('the method _handleRemovedConnection should be called twice', function (done) {
        element.removeChild(connections);
        window.setTimeout(function () {
          _handleRemovedConnectionStub.should.be.calledTwice;
          _handleRemovedConnectionStub.should.be.calledWith(connection1, element);
          _handleRemovedConnectionStub.should.be.calledWith(connection2, element);
          done();
        });
      });
    });
    describe('remove a "cubx-core-connection" element', function () {
      var connections;
      var connection;
      var element;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        element = new constructor();
        container.appendChild(element);
        connections = document.createElement('cubx-core-connections');
        element.appendChild(connections);
        connection = document.createElement('cubx-core-connection');
        connections.appendChild(connection);
        cif._createObserverObject();
      });
      afterEach(function () {
        cif._observer.disconnect();
        delete cif._observer;
        while (container.children.length > 0) {
          container.removeChild(container.children[ 0 ]);
        }
        connection = null;
        connections = null;
      });
      it('the method _handleRemovedConnection should be called once', function (done) {
        connections.removeChild(connection);
        window.setTimeout(function () {
          _handleRemovedConnectionStub.should.be.calledOnce;
          _handleRemovedConnectionStub.should.be.calledWith(connection, element);
          done();
        });
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
      it('the _elementQueue should be contains one elements', function () {
        expect(cif._elementQueue.getLength()).to.be.equal(1);
      });
      it('the _elementQueue should be contains the element node', function () {
        cif._elementQueue.peek().should.be.eql(element);
      });
    });
    describe('the added element is generated by cif', function () {
      var parentElem;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        parentElem = new constructor();
        container.appendChild(parentElem);
        constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        element = new constructor();
        element.generatedByCif = true;
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
    var _reacivateConnectionIfExistsStub;
    beforeEach(function () {
      cif._resetProcessMode();
      _updateCubxCoreConnectionsStub = sinon.stub(cif, '_updateCubxCoreConnections').callsFake(function () {
        // do nothing;
      });
      _updateCubxCoreInitStub = sinon.stub(cif, '_updateCubxCoreInit').callsFake(function () {
        // do nothing;
      });
      _initCubxElementsInRootStub = sinon.stub(cif, '_initCubxElementsInRoot').callsFake(function () {
        // do nothing;
      });
      _processObserverTriggeredSpy = sinon.spy(cif, '_processObserverTriggered');

      _reacivateConnectionIfExistsStub = sinon.stub(cif, '_reactivateConnectionIfExists').callsFake(function () {
        // do nothing
      });
    });
    afterEach(function () {
      cif._updateCubxCoreConnections.restore();
      cif._updateCubxCoreInit.restore();
      cif._initCubxElementsInRoot.restore();
      cif._processObserverTriggered.restore();
      cif._reactivateConnectionIfExists.restore();
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
      it('the method _reactivateConnectionIfExists should be not called', function () {
        _reacivateConnectionIfExistsStub.should.be.not.called;
      });
    });
    describe('the queue has elements', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        element = new constructor();
        cif._elementQueue.enqueue([element]);
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
      it('the method _reactivateConnectionIfExists should be called once', function () {
        _reacivateConnectionIfExistsStub.should.be.calledOnce;
      });
    });
  });
  describe('#_handleRemovedCubble', function () {
    describe('oldParentNode is undefined', function () {
      var elementA;
      var spy;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
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
        tidyConnectionsWithCubbleStub = sinon.stub(connectionMgr, 'tidyConnectionsWithCubble').callsFake(function () {
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
    describe('removed element generated by cif', function () {
      var tidyConnectionsWithCubbleStub;
      var container;
      var connectionMgr;
      var elementA;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        elementA.generatedByCif = true;
        constructor = cif.getCompoundComponentElementConstructor('cif-test-b');
        var elementB = new constructor();
        container.Context.getComponents().push(elementB);
        container.Context.getComponents().push(elementA);
        connectionMgr = container.Context._connectionMgr;
        tidyConnectionsWithCubbleStub = sinon.stub(connectionMgr, 'tidyConnectionsWithCubble').callsFake(function () {
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
      it('the method tidyConnectionsWithCubble should be not called.', function () {
        tidyConnectionsWithCubbleStub.should.be.not.called;
      });
      it('elementA should be not removed from the contexts compound list', function () {
        container.Context.getComponents().should.be.include(elementA);
      });
    });
  });
  describe('#_reactivateConnectionIfExists', function () {
    var _findNextAncestorWithContextSpy;
    beforeEach(function () {
      _findNextAncestorWithContextSpy = sinon.spy(cif, '_findNextAncestorWithContext');
    });
    afterEach(function () {
      cif._findNextAncestorWithContext.restore();
    });
    describe('element ancestor cubble with context is the rootcontext', function () {
      var container;
      var elementA;
      var connectionMgr;
      var connectionMgrReactivateConnectionIfExistsStub;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        container.appendChild(elementA);
        connectionMgr = container.Context._connectionMgr;
        connectionMgrReactivateConnectionIfExistsStub = sinon.stub(connectionMgr, 'reactivateConnectionIfExists').callsFake(function () {
          // do nothing
        });
        cif._reactivateConnectionIfExists(elementA);
      });
      afterEach(function () {
        connectionMgr.reactivateConnectionIfExists.restore();
        container.removeChild(elementA);
        connectionMgr = null;
        elementA = null;
      });
      it('the method _findNextAncestorWithContext should be called once', function () {
        _findNextAncestorWithContextSpy.should.be.calledOnce;
        _findNextAncestorWithContextSpy.should.returned(container);
      });
      it('the method _reactivateConnectionIfExists of the connectionMgr should be called once', function () {
        connectionMgrReactivateConnectionIfExistsStub.should.be.calledOnce;
        connectionMgrReactivateConnectionIfExistsStub.calledWith(elementA);
      });
    });
    describe('element has ancestor cubble with context', function () {
      var container;
      var elementA;
      var elementB;
      var connectionMgr1ReactivateConnectionIfExistsStub;
      var connectionMgr2ReactivateConnectionIfExistsStub;
      var connectionMgr1;
      var connectionMgr2;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        container.appendChild(elementA);
        constructor = cif.getCompoundComponentElementConstructor('cif-test-b');
        elementB = new constructor();
        elementA.appendChild(elementB);
        connectionMgr1 = container.Context._connectionMgr;
        connectionMgr2 = elementA.Context._connectionMgr;
        connectionMgr1ReactivateConnectionIfExistsStub = sinon.stub(connectionMgr1, 'reactivateConnectionIfExists').callsFake(function () {
          // do nothing
        });
        connectionMgr2ReactivateConnectionIfExistsStub = sinon.stub(connectionMgr2, 'reactivateConnectionIfExists').callsFake(function () {
          // do nothing
        });
        cif._reactivateConnectionIfExists(elementB);
      });
      afterEach(function () {
        connectionMgr1.reactivateConnectionIfExists.restore();
        connectionMgr2.reactivateConnectionIfExists.restore();
        container.removeChild(elementA);
        connectionMgr1 = null;
        connectionMgr2 = null;
        elementA = null;
        elementB = null;
      });
      it('the method _findNextAncestorWithContext should be called once', function () {
        _findNextAncestorWithContextSpy.should.be.calledOnce;
        _findNextAncestorWithContextSpy.should.returned(elementA);
      });
      it('the method _reactivateConnectionIfExists of the connectionMgr1 should be not called', function () {
        connectionMgr1ReactivateConnectionIfExistsStub.should.be.not.called;
      });
      it('the method _reactivateConnectionIfExists of the connectionMgr2 should be called once', function () {
        connectionMgr2ReactivateConnectionIfExistsStub.should.be.calledOnce;
        connectionMgr2ReactivateConnectionIfExistsStub.calledWith(elementB);
      });
    });
    describe('element has  no ancestor with context', function () {
      var elementA;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        elementA = new constructor();
        document.body.appendChild(elementA);
        cif._reactivateConnectionIfExists(elementA);
      });
      afterEach(function () {
        document.body.removeChild(elementA);
        elementA = null;
      });
      it('the method _findNextAncestorWithContext should be called once', function () {
        _findNextAncestorWithContextSpy.should.be.calledTwice;
        _findNextAncestorWithContextSpy.should.returned(undefined);
      });
    });
  });
  describe('#_deactivateConnection', function () {
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
  describe('#_activateConnection', function () {
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
  describe('#_findAllConnectionsWithElement', function () {
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
  describe('#_handleAddedConnection', function () {
    // eslint-disable-next-line no-unused-vars
    var getComponentCacheEntryStub;
    var connectionMgrCreateConnectionFromComponentStub;
    var container;
    var element;
    var connections;
    var connection;
    var containerConnectionMgr;
    var consoleWarnSpy;
    beforeEach(function () {
      container = cif.getCRCRootNode();
      var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
      element = new constructor();
      container.appendChild(element);
      connections = document.createElement('cubx-core-connections');
      connection = document.createElement('cubx-core-connection');
      getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (tagName) {
        if (tagName !== 'not-cubble') {
          return {
            artifactId: tagName
          };
        }
      });
      containerConnectionMgr = container.Context.getConnectionMgr();
      consoleWarnSpy = sinon.spy(console, 'warn');
      connectionMgrCreateConnectionFromComponentStub = sinon.stub(containerConnectionMgr, 'createConnectionFromComponent').callsFake(function () {
        // do nothing
      });
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      containerConnectionMgr.createConnectionFromComponent.restore();
      console.warn.restore();
      while (container.childElementCount > 0) {
        container.removeChild(container.children[ 0 ]);
      }
      connection = null;
      connections = null;
      element = null;
      containerConnectionMgr = null;
    });
    describe('the html structure is correct', function () {
      beforeEach(function () {
        element.appendChild(connections);
        connections.appendChild(connection);
        cif._handleAddedConnection(connection);
      });
      it('_connectionMgr.createConnectionFromComponent should be called once', function () {
        connectionMgrCreateConnectionFromComponentStub.should.be.calledOnce;
        connectionMgrCreateConnectionFromComponentStub.should.be.calledWith(element, connection);
      });
      it('should be not get a warn log', function () {
        consoleWarnSpy.should.be.not.called;
      });
    });
    describe('the <cubx-core-connection> is a direct child of an cubble', function () {
      beforeEach(function () {
        element.appendChild(connection);
        cif._handleAddedConnection(connection);
      });
      it('should be get a warn log', function () {
        consoleWarnSpy.should.be.calledOnce;
      });
      it('_connectionMgr.createConnectionFromComponent should be not called', function () {
        connectionMgrCreateConnectionFromComponentStub.should.be.not.called;
      });
    });
    describe('the <cubx-core-connections> is not a direct child of an cubble', function () {
      beforeEach(function () {
        var notCubble = document.createElement('not-cubble');
        element.appendChild(notCubble);
        notCubble.appendChild(connections);
        connections.appendChild(connection);
        cif._handleAddedConnection(connection);
      });
      it('should be get a warn log', function () {
        consoleWarnSpy.should.be.calledOnce;
        consoleWarnSpy.should.be.calledWithMatch('A "cubx-core-connections" element must be a child an cubble.');
      });
      it('_connectionMgr.createConnectionFromComponent should be not called', function () {
        connectionMgrCreateConnectionFromComponentStub.should.be.not.called;
      });
    });
    describe('the <cubx-core-connection> is not a direct child of <cubx-core-connection>', function () {
      beforeEach(function () {
        element.appendChild(connections);
        var divEl = document.createElement('div');
        connections.appendChild(divEl);
        divEl.appendChild(connection);
        cif._handleAddedConnection(connection);
      });
      it('should be get a warn log', function () {
        consoleWarnSpy.should.be.calledOnce;
        consoleWarnSpy.should.be.calledWithMatch('Can\'t handle the added element. A "cubx-core-connection" element must be a child of a "cubx-core-connections" element.');
      });
      it('_connectionMgr.createConnectionFromComponent should be not called', function () {
        connectionMgrCreateConnectionFromComponentStub.should.be.not.called;
      });
    });
    describe('the <cubx-core-connection> is not in scope of root context', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-c');
        var element2 = new constructor();
        element2.appendChild(connections);
        connections.appendChild(connection);
        cif._handleAddedConnection(connection);
      });
      it('should be get a warn log', function () {
        consoleWarnSpy.should.be.calledOnce;
        consoleWarnSpy.should.be.calledWithMatch('Can\'t handle added element. The connection in not in scope of root context.');
      });
      it('_connectionMgr.createConnectionFromComponent should be not called', function () {
        connectionMgrCreateConnectionFromComponentStub.should.be.not.called;
      });
    });
    describe('the <cubx-core-connection> is as internal connection marked', function () {
      beforeEach(function () {
        element.appendChild(connections);
        connection.setAttribute('type', 'internal');
        connection.getType = function () {
          return this.getAttribute('type');
        };
        connections.appendChild(connection);
        cif._handleAddedConnection(connection);
      });
      it('should be get an error log', function () {
        consoleWarnSpy.should.be.calledOnce;
        consoleWarnSpy.should.be.calledWithMatch('Can\'t handle added element, because it is an internal connection.');
      });
      it('_connectionMgr.createConnectionFromComponent should be not called', function () {
        connectionMgrCreateConnectionFromComponentStub.should.be.not.called;
      });
    });
  });
  describe('#_handleRemovedConnections', function () {
    // eslint-disable-next-line no-unused-vars
    var getComponentCacheEntryStub;
    var container;
    var element;
    var connections;
    var connection1;
    var connection2;
    var _handleRemovedConnectionStub;
    beforeEach(function () {
      container = cif.getCRCRootNode();
      var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
      element = new constructor();
      container.appendChild(element);
      connections = document.createElement('cubx-core-connections');
      connection1 = document.createElement('cubx-core-connection');
      connection2 = document.createElement('cubx-core-connection');
      getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (tagName) {
        if (tagName !== 'not-cubble') {
          return {
            artifactId: tagName
          };
        }
      });
      _handleRemovedConnectionStub = sinon.stub(cif, '_handleRemovedConnection').callsFake(function () {
        // do nothing
      });
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      cif._handleRemovedConnection.restore();
      while (container.childElementCount > 0) {
        container.removeChild(container.children[ 0 ]);
      }
      connection1 = null;
      connection2 = null;
      connections = null;
      element = null;
    });
    describe('handle child connections', function () {
      beforeEach(function () {
        connections.appendChild(connection1);
        connections.appendChild(connection2);
        connections.appendChild(document.createElement('div'));
        cif._handleRemovedConnections(connections, element);
      });
      it('the method _handleRemovedConnection should be called twice', function () {
        _handleRemovedConnectionStub.should.be.calledTwice;
        _handleRemovedConnectionStub.should.be.calledWith(connection1, element);
        _handleRemovedConnectionStub.should.be.calledWith(connection2, element);
      });
    });
  });
  describe('#_handleRemovedConnection', function () {
    function createConnection (connectionId, sourceElement, sourceSlot, sourceMember, destElement, destSlot, destMember) {
      var connection = {
        connectionId: connectionId,
        source: {
          component: sourceElement,

          slot: sourceSlot
        },
        destination: {
          component: destElement,

          slot: destSlot
        }

      };
      if (sourceMember) {
        connection.source.memberId = sourceMember;
      }
      if (destMember) {
        connection.destination.memberId = destMember;
      }

      return connection;
    }

    // eslint-disable-next-line no-unused-vars
    var getComponentCacheEntryStub;
    var container;
    var element;
    var connection;
    var containerConnectionMgr;
    var destElem;
    var consoleWarnSpy;
    beforeEach(function () {
      container = cif.getCRCRootNode();
      var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
      element = new constructor();
      constructor = cif.getCompoundComponentElementConstructor('cif-test-b');
      destElem = new constructor();
      container.appendChild(element);
      connection = document.createElement('cubx-core-connection');
      getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (tagName) {
        if (tagName !== 'not-cubble') {
          return {
            artifactId: tagName
          };
        }
      });
      consoleWarnSpy = sinon.spy(console, 'warn');
      containerConnectionMgr = container.Context.getConnectionMgr();
      containerConnectionMgr._connections = [];
      containerConnectionMgr._connections.push(createConnection('con1', element, 'slotA', 'member1', destElem, 'slotB', 'member2'));
      containerConnectionMgr._connections.push(createConnection('con2', element, 'slotC', 'member1', destElem, 'slotD', 'member2'));
      containerConnectionMgr._connections.push(createConnection('con3', destElem, 'slotA', 'member2', element, 'slotB', 'member1'));
      containerConnectionMgr._connections.push(createConnection('con4', destElem, 'slotC', 'member2', element, 'slotD', 'member1'));
      containerConnectionMgr._connections.should.have.length(4);
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      console.warn.restore();
      while (container.childElementCount > 0) {
        container.removeChild(container.children[ 0 ]);
      }
      connection = null;
      element = null;
      destElem = null;
      containerConnectionMgr._connections = [];
      containerConnectionMgr = null;
    });
    describe('the html structure is correct', function () {
      beforeEach(function () {
        connection.setAttribute('connection-id', 'con2');
        cif._handleRemovedConnection(connection, element);
      });
      it('the connection list should have length = 3', function () {
        containerConnectionMgr._connections.should.have.length(3);
      });
      it('in the connection list exists no connection with connectionId "con2"', function () {
        containerConnectionMgr._connections.forEach(function (con) {
          con.connectionId.should.not.equals('con2');
        });
      });
      it('should not get a warn log', function () {
        consoleWarnSpy.should.be.not.called;
      });
    });
    describe('the <cubx-core-connections> is not a direct child of an cubble', function () {
      beforeEach(function () {
        var notCubble = document.createElement('not-cubble');
        cif._handleRemovedConnection(connection, notCubble);
      });
      it('the connection list should have length = 4', function () {
        containerConnectionMgr._connections.should.have.length(4);
      });
      it('should get a warn log', function () {
        consoleWarnSpy.should.be.calledOnce;
        consoleWarnSpy.should.be.calledWithMatch('A "cubx-core-connections" element must be a child an cubble.');
      });
    });
    describe('the <cubx-core-connection> is not in scope of root context', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-c');
        var element2 = new constructor();
        element.appendChild(element2);
        cif._handleRemovedConnection(connection, element2);
      });
      it('the connection list should have length = 4', function () {
        containerConnectionMgr._connections.should.have.length(4);
      });
      it('should get a warn log', function () {
        consoleWarnSpy.should.be.calledOnce;
        consoleWarnSpy.should.be.calledWithMatch('Can\'t handle removed element. The connection in not in scope of root context.');
      });
    });
    describe('the <cubx-core-connection> is as internal connection marked', function () {
      beforeEach(function () {
        connection.setAttribute('type', 'internal');
        cif._handleRemovedConnection(connection, element);
      });
      it('the connection list should have length = 4', function () {
        containerConnectionMgr._connections.should.have.length(4);
      });
      it('should be get a warn log', function () {
        consoleWarnSpy.should.be.calledOnce;
        consoleWarnSpy.should.be.calledWithMatch('Can\'t handle removed element, because it is an internal connection.');
      });
    });
  });
});
