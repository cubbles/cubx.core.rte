/* globals _ */
'use strict';
describe('ConnectionManager', function () {
  describe('hookFunctions', function () {
    var cif;
    before(function () {
      cif = window.cubx.cif.cif;
    });

    describe('complex hookFunction integration tests hook Function call with next(newValue)', function () {
      var container;
      var parent;
      var child1;
      var child2;
      var child3;
      var childChild1;
      var childChild2;
      var dynamicConnection1;
      var dynamicConnection2;
      var dynamicConnection3;
      var dynamicConnection4;
      var dynamicConnection5;
      var dynamicConnection6;
      var dynamicConnection7;
      var dynamicConnection8;
      var dynamicConnectionId1;
      var dynamicConnectionId2;
      var dynamicConnectionId3;
      var dynamicConnectionId4;
      var dynamicConnectionId5;
      var dynamicConnectionId6;
      var dynamicConnectionId7;
      var dynamicConnectionId8;
      var payloadObj;

      // -----------------------------------------------------------------------------
      // |                             export-parent-comp                                                        |
      // |  --------------------------------        ----------------------------                                 |
      // |  |         child-1              |        |         child-2          |                                 |
      // |  |      -----------------       |        |                          |                                 |
      // |  |--4-- | child-child-1  |--5-- |        |                          |                                 |
      // |  |      |                |---   |---1----|                          |                                 |
      // |  |      ------------------  |   |        |                          |      ------------------------   |
      // |  |                          |   |        |                          |--3---|     child-3          |   |
      // |  |  -----------8-------------   |        ----------------------------      |                      |   |
      // |  |  |   ------------------      |                                          |                      |   |
      // |  |  --- | child-child-2  |      |----------------------2------------------ |                      |   |
      // |  |---6--|                |---7--|                                          |                      |   |
      // |  |      ------------------      |                                          ------------------------   |
      // |  --------------------------------                                                                     |
      // |                                                                                                       |
      // --------------------------------------------------------------------------------------------------------|
      before(function () {
        var artifactIdChild1 = 'child-1';
        var manifestChild1 = {
          webpackageId: 'test.' + artifactIdChild1 + '.@0.1.0',
          artifactId: artifactIdChild1,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'output' ]
            }
          ]

        };
        var artifactIdChild2 = 'child-2';
        var manifestChild2 = {
          webpackageId: 'test.' + artifactIdChild2 + '.@0.1.0',
          artifactId: artifactIdChild2,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input' ]
            }
          ]

        };
        var artifactIdChild3 = 'child-3';
        var manifestChild3 = {
          webpackageId: 'test.' + artifactIdChild3 + '.@0.1.0',
          artifactId: artifactIdChild3,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input' ]
            }
          ]

        };
        var artifactIdChildChild1 = 'child-child-1';
        var manifestChildChild1 = {
          webpackageId: 'test.' + artifactIdChildChild1 + '.@0.1.0',
          artifactId: artifactIdChildChild1,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input', 'output' ]
            }
          ]

        };
        var artifactIdChildChild2 = 'child-child-2';
        var manifestChildChild2 = {
          webpackageId: 'test.' + artifactIdChildChild2 + '.@0.1.0',
          artifactId: artifactIdChildChild2,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input', 'output' ]
            }
          ]

        };
        sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
          var manifest;
          switch (key) {
            case artifactIdChild1:
              manifest = manifestChild1;
              break;
            case artifactIdChild2:
              manifest = manifestChild2;
              break;
            case artifactIdChild3:
              manifest = manifestChild3;
              break;
            case artifactIdChildChild1:
              manifest = manifestChildChild1;
              break;
            case artifactIdChildChild2:
              manifest = manifestChildChild2;
              break;
            default:
              manifest = {
                artifactType: 'compoundComponent'
              };
          }
          return manifest;
        });
        container = document.querySelector('[cubx-core-crc]');
        // container.Context = new window.cubx.cif.Context(container);
        var constructor = cif.getCompoundComponentElementConstructor('export-parent-comp');
        // parent element
        parent = new constructor();
        var parentRuntimeId = 'overElem/export-parent-comp';
        parent.setAttribute('runtime-id', parentRuntimeId);
        parent.Context.setParent(container.Context);
        container.appendChild(parent);
        container.Context.addComponent(parent);

        // child-1 element
        var child1RuntimeId = parentRuntimeId + ':test.' + artifactIdChild1 + '/' + artifactIdChild1 +
          '.@0.1.0.member1';
        constructor = cif.getCompoundComponentElementConstructor('child-1');
        child1 = new constructor();
        child1.setAttribute('runtime-id', child1RuntimeId);
        child1.Context.setParent(parent.Context);
        parent.appendChild(child1);
        parent.Context.addComponent(child1);

        // child-2 element
        var child2RuntimeId = parentRuntimeId + ':test.' + artifactIdChild2 + '/' + artifactIdChild2 +
          '.@0.1.0.member2';
        constructor = cif.getCompoundComponentElementConstructor('child-2');
        child2 = new constructor();
        child2.setAttribute('runtime-id', child2RuntimeId);
        child2.Context.setParent(parent.Context);
        parent.appendChild(child2);
        parent.Context.addComponent(child2);

        // child-3 element
        var child3RuntimeId = parentRuntimeId + ':test.' + artifactIdChild3 + '/' + artifactIdChild3 +
          '.@0.1.0.member3';
        constructor = cif.getCompoundComponentElementConstructor('child-3');
        child3 = new constructor();
        child3.setAttribute('runtime-id', child3RuntimeId);
        child3.Context.setParent(parent.Context);
        parent.appendChild(child3);
        parent.Context.addComponent(child3);

        // child-child-1 element
        var childChild1RuntimeId = child1RuntimeId + ':test.' + artifactIdChildChild1 + '/' +
          artifactIdChildChild1 + '.@0.1.0.member1';
        constructor = cif.getCompoundComponentElementConstructor('child-child-1');
        childChild1 = new constructor();
        childChild1.setAttribute('runtime-id', childChild1RuntimeId);
        childChild1.Context.setParent(parent.Context);
        child1.appendChild(childChild1);
        child1.Context.addComponent(childChild1);

        // child-child-1 element
        var childChild2RuntimeId = child1RuntimeId + ':test.' + artifactIdChildChild2 + '/' +
          artifactIdChildChild2 + '.@0.1.0.member1';
        constructor = cif.getCompoundComponentElementConstructor('child-child-1');
        childChild2 = new constructor();
        childChild2.setAttribute('runtime-id', childChild2RuntimeId);
        childChild2.Context.setParent(parent.Context);
        child1.appendChild(childChild2);
        child1.Context.addComponent(childChild2);

        function createConfig (runtimeId1, runtimeId2, hookFunction) {
          return {
            source: {
              runtimeId: runtimeId1,
              slot: 'message'
            },
            destination: {
              runtimeId: runtimeId2,
              slot: 'message'
            },
            copyValue: true,
            repeatedValues: false,
            hookFunction: hookFunction
          };
        }

        function generateHookFunction (connectionIndex) {
          return function (value, next) {
            var newValue = value + '(index: ' + connectionIndex + ', from: ' + this.source.tagName + ' to: ' + this.destination.tagName + ')';
            next(newValue);
          };
        }

        window.hookFunction1 = generateHookFunction(1);
        window.hookFunction2 = generateHookFunction(2);
        window.hookFunction3 = generateHookFunction(3);
        window.hookFunction4 = generateHookFunction(4);
        window.hookFunction5 = generateHookFunction(5);
        window.hookFunction6 = generateHookFunction(6);
        window.hookFunction7 = generateHookFunction(7);
        window.hookFunction8 = generateHookFunction(8);
        dynamicConnection1 = createConfig(child1RuntimeId, child2RuntimeId, 'hookFunction1');
        dynamicConnectionId1 = child1.addDynamicConnection(dynamicConnection1);
        dynamicConnection2 = createConfig(child1RuntimeId, child3RuntimeId, 'hookFunction2');
        dynamicConnectionId2 = child1.addDynamicConnection(dynamicConnection2);
        dynamicConnection3 = createConfig(child2RuntimeId, child3RuntimeId, 'hookFunction3');
        dynamicConnectionId3 = child2.addDynamicConnection(dynamicConnection3);
        dynamicConnection4 = createConfig(child1RuntimeId, childChild1RuntimeId, 'hookFunction4');
        dynamicConnectionId4 = child1.addDynamicConnection(dynamicConnection4);
        dynamicConnection5 = createConfig(childChild1RuntimeId, child1RuntimeId, 'hookFunction5');
        dynamicConnectionId5 = child1.addDynamicConnection(dynamicConnection5);
        dynamicConnection6 = createConfig(child1RuntimeId, childChild2RuntimeId, 'hookFunction6');
        dynamicConnectionId6 = child1.addDynamicConnection(dynamicConnection6);
        dynamicConnection7 = createConfig(childChild2RuntimeId, child1RuntimeId, 'hookFunction7');
        dynamicConnectionId7 = childChild1.addDynamicConnection(dynamicConnection7);
        dynamicConnection8 = createConfig(childChild1RuntimeId, childChild2RuntimeId, 'hookFunction8');
        dynamicConnectionId8 = childChild1.addDynamicConnection(dynamicConnection8);

        payloadObj = {
          slot: 'message',
          payload: 'payload message'
        };
      });
      after(function () {
        container.removeChild(parent);
        container.Context._children = [];
        container.Context._components = [];
        window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      });
      describe('Call hookFunction for connection 1', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = parent.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId1 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction1');
          setMessageSpy = sinon.spy(child2, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction1.restore();
          child2.setMessage.restore();
        });

        it('window.hookFunction1 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction1 modified value', function () {
          child2.getMessage().should.equal(payloadObj.payload + '(index: 1, from: ' + child1.tagName + ' to: ' + child2.tagName + ')');
        });
        it('setMessage method of destination component should be called once', function () {
          setMessageSpy.should.be.calledOnce;
        });
      });
      describe('Call hookFunction for connection 2', function () {
        var hookFunctionSpy;
        /* eslint-disable no-unused-vars */
        var setMessageSpy;
        /* eslint-enable no-unused-vars */
        before(function () {
          var connectionMgr = parent.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId2 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction2');
          setMessageSpy = sinon.spy(child3, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction2.restore();
          child3.setMessage.restore();
        });

        it('window.hookFunction2 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction2 modified value', function () {
          child3.getMessage().should.equal(payloadObj.payload + '(index: 2, from: ' + child1.tagName + ' to: ' + child3.tagName + ')');
        });
      });
      describe('Call hookFunction for connection 3', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = parent.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId3 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction3');
          setMessageSpy = sinon.spy(child3, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction3.restore();
          child3.setMessage.restore();
        });
        it('window.hookFunction3 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction3 modified value', function () {
          child3.getMessage().should.equal(payloadObj.payload + '(index: 3, from: ' + child2.tagName + ' to: ' + child3.tagName + ')');
        });
        it('setMessage method of destination component should be called once', function () {
          setMessageSpy.should.be.calledOnce;
        });
      });
      describe('Call hookFunction for connection 4', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId4 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction4');
          setMessageSpy = sinon.spy(childChild1, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction4.restore();
          childChild1.setMessage.restore();
        });

        it('window.hookFunction4 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction4 modified value', function () {
          childChild1.getMessage().should.equal(payloadObj.payload + '(index: 4, from: ' + child1.tagName + ' to: ' + childChild1.tagName + ')');
        });
        it('setMessage method of destination component should be called once', function () {
          setMessageSpy.should.be.calledOnce;
        });
      });
      describe('Call hookFunction for connection 5', function () {
        var hookFunctionSpy;
        var _setSlotValueSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId5 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction5');
          _setSlotValueSpy = sinon.spy(child1, '_setSlotValue');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction5.restore();
          child1._setSlotValue.restore();
        });

        it('window.hookFunction5 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction5 modified value', function () {
          child1.getMessage().should.equal(payloadObj.payload + '(index: 5, from: ' + childChild1.tagName + ' to: ' + child1.tagName + ')');
        });
        it('_setSlotValueSpy method of destination component should be called once', function () {
          _setSlotValueSpy.should.be.calledOnce;
        });
      });
      describe('Call hookFunction for connection 6', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId6 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction6');
          setMessageSpy = sinon.spy(childChild2, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction6.restore();
          childChild2.setMessage.restore();
        });

        it('window.hookFunction6 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction6 modified value', function () {
          childChild2.getMessage().should.equal(payloadObj.payload + '(index: 6, from: ' + child1.tagName + ' to: ' + childChild2.tagName + ')');
        });
        it('setMessage method of destination component should be called once', function () {
          setMessageSpy.should.be.calledOnce;
        });
      });
      describe('Call hookFunction for connection 7', function () {
        var hookFunctionSpy;
        var _setSlotValueSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId7 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction7');
          _setSlotValueSpy = sinon.spy(child1, '_setSlotValue');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction7.restore();
          child1._setSlotValue.restore();
        });

        it('window.hookFunction7 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction7 modified value', function () {
          child1.getMessage().should.equal(payloadObj.payload + '(index: 7, from: ' + childChild2.tagName + ' to: ' + child1.tagName + ')');
        });
        it('_setSlotValueSpy method of destination component should be called once', function () {
          _setSlotValueSpy.should.be.calledOnce;
        });
      });

      describe('Call hookFunction for connection 8', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId8 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction8');
          setMessageSpy = sinon.spy(childChild2, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction8.restore();
          childChild2.setMessage.restore();
        });

        it('window.hookFunction8 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot has the hookFunction8 modified value', function () {
          childChild2.getMessage().should.equal(payloadObj.payload + '(index: 8, from: ' + childChild1.tagName + ' to: ' + childChild2.tagName + ')');
        });
        it('setMessage method of destination component should be called once', function () {
          setMessageSpy.should.be.calledOnce;
        });
      });
    });
    describe('complex hookFunction integration tests hook Function call not next() function', function () {
      var container;
      var parent;
      var child1;
      var child2;
      var child3;
      var childChild1;
      var childChild2;
      var dynamicConnection1;
      var dynamicConnection2;
      var dynamicConnection3;
      var dynamicConnection4;
      var dynamicConnection5;
      var dynamicConnection6;
      var dynamicConnection7;
      var dynamicConnection8;
      var dynamicConnectionId1;
      var dynamicConnectionId2;
      var dynamicConnectionId3;
      var dynamicConnectionId4;
      var dynamicConnectionId5;
      var dynamicConnectionId6;
      var dynamicConnectionId7;
      var dynamicConnectionId8;
      var payloadObj;

      // -----------------------------------------------------------------------------
      // |                             export-parent-comp                                                        |
      // |  --------------------------------        ----------------------------                                 |
      // |  |         child-1              |        |         child-2          |                                 |
      // |  |      -----------------       |        |                          |                                 |
      // |  |--4-- | child-child-1  |--5-- |        |                          |                                 |
      // |  |      |                |---   |---1----|                          |                                 |
      // |  |      ------------------  |   |        |                          |      ------------------------   |
      // |  |                          |   |        |                          |--3---|     child-3          |   |
      // |  |  -----------8-------------   |        ----------------------------      |                      |   |
      // |  |  |   ------------------      |                                          |                      |   |
      // |  |  --- | child-child-2  |      |----------------------2------------------ |                      |   |
      // |  |---6--|                |---7--|                                          |                      |   |
      // |  |      ------------------      |                                          ------------------------   |
      // |  --------------------------------                                                                     |
      // |                                                                                                       |
      // --------------------------------------------------------------------------------------------------------|
      before(function () {
        var artifactIdChild1 = 'child-1';
        var manifestChild1 = {
          webpackageId: 'test.' + artifactIdChild1 + '.@0.1.0',
          artifactId: artifactIdChild1,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'output' ]
            }
          ]

        };
        var artifactIdChild2 = 'child-2';
        var manifestChild2 = {
          webpackageId: 'test.' + artifactIdChild2 + '.@0.1.0',
          artifactId: artifactIdChild2,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input' ]
            }
          ]

        };
        var artifactIdChild3 = 'child-3';
        var manifestChild3 = {
          webpackageId: 'test.' + artifactIdChild3 + '.@0.1.0',
          artifactId: artifactIdChild3,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input' ]
            }
          ]

        };
        var artifactIdChildChild1 = 'child-child-1';
        var manifestChildChild1 = {
          webpackageId: 'test.' + artifactIdChildChild1 + '.@0.1.0',
          artifactId: artifactIdChildChild1,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input', 'output' ]
            }
          ]

        };
        var artifactIdChildChild2 = 'child-child-2';
        var manifestChildChild2 = {
          webpackageId: 'test.' + artifactIdChildChild2 + '.@0.1.0',
          artifactId: artifactIdChildChild2,
          artifactType: 'compoundComponent',
          slots: [
            {
              slotId: 'message',
              type: 'string',
              direction: [ 'input', 'output' ]
            }
          ]

        };
        sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
          var manifest;
          switch (key) {
            case artifactIdChild1:
              manifest = manifestChild1;
              break;
            case artifactIdChild2:
              manifest = manifestChild2;
              break;
            case artifactIdChild3:
              manifest = manifestChild3;
              break;
            case artifactIdChildChild1:
              manifest = manifestChildChild1;
              break;
            case artifactIdChildChild2:
              manifest = manifestChildChild2;
              break;
            default:
              manifest = {
                artifactType: 'compoundComponent'
              };
          }
          return manifest;
        });
        container = document.querySelector('[cubx-core-crc]');
        // container.Context = new window.cubx.cif.Context(container);
        var constructor = cif.getCompoundComponentElementConstructor('export-parent-comp');
        // parent element
        parent = new constructor();
        var parentRuntimeId = 'overElem/export-parent-comp';
        parent.setAttribute('runtime-id', parentRuntimeId);
        parent.Context.setParent(container.Context);
        container.appendChild(parent);
        container.Context.addComponent(parent);

        // child-1 element
        var child1RuntimeId = parentRuntimeId + ':test.' + artifactIdChild1 + '/' + artifactIdChild1 +
          '.@0.1.0.member1';
        constructor = cif.getCompoundComponentElementConstructor('child-1');
        child1 = new constructor();
        child1.setAttribute('runtime-id', child1RuntimeId);
        child1.Context.setParent(parent.Context);
        parent.appendChild(child1);
        parent.Context.addComponent(child1);

        // child-2 element
        var child2RuntimeId = parentRuntimeId + ':test.' + artifactIdChild2 + '/' + artifactIdChild2 +
          '.@0.1.0.member2';
        constructor = cif.getCompoundComponentElementConstructor('child-2');
        child2 = new constructor();
        child2.setAttribute('runtime-id', child2RuntimeId);
        child2.Context.setParent(parent.Context);
        parent.appendChild(child2);
        parent.Context.addComponent(child2);

        // child-3 element
        var child3RuntimeId = parentRuntimeId + ':test.' + artifactIdChild3 + '/' + artifactIdChild3 +
          '.@0.1.0.member3';
        constructor = cif.getCompoundComponentElementConstructor('child-3');
        child3 = new constructor();
        child3.setAttribute('runtime-id', child3RuntimeId);
        child3.Context.setParent(parent.Context);
        parent.appendChild(child3);
        parent.Context.addComponent(child3);

        // child-child-1 element
        var childChild1RuntimeId = child1RuntimeId + ':test.' + artifactIdChildChild1 + '/' +
          artifactIdChildChild1 + '.@0.1.0.member1';
        constructor = cif.getCompoundComponentElementConstructor('child-child-1');
        childChild1 = new constructor();
        childChild1.setAttribute('runtime-id', childChild1RuntimeId);
        childChild1.Context.setParent(parent.Context);
        child1.appendChild(childChild1);
        child1.Context.addComponent(childChild1);

        // child-child-1 element
        var childChild2RuntimeId = child1RuntimeId + ':test.' + artifactIdChildChild2 + '/' +
          artifactIdChildChild2 + '.@0.1.0.member1';
        constructor = cif.getCompoundComponentElementConstructor('child-child-1');
        childChild2 = new constructor();
        childChild2.setAttribute('runtime-id', childChild2RuntimeId);
        childChild2.Context.setParent(parent.Context);
        child1.appendChild(childChild2);
        child1.Context.addComponent(childChild2);

        function createConfig (runtimeId1, runtimeId2, hookFunction) {
          return {
            source: {
              runtimeId: runtimeId1,
              slot: 'message'
            },
            destination: {
              runtimeId: runtimeId2,
              slot: 'message'
            },
            copyValue: true,
            repeatedValues: false,
            hookFunction: hookFunction
          };
        }

        function generateHookFunction (connectionIndex) {
          return function (value, next) {};
        }

        window.hookFunction1 = generateHookFunction(1);
        window.hookFunction2 = generateHookFunction(2);
        window.hookFunction3 = generateHookFunction(3);
        window.hookFunction4 = generateHookFunction(4);
        window.hookFunction5 = generateHookFunction(5);
        window.hookFunction6 = generateHookFunction(6);
        window.hookFunction7 = generateHookFunction(7);
        window.hookFunction8 = generateHookFunction(8);
        dynamicConnection1 = createConfig(child1RuntimeId, child2RuntimeId, 'hookFunction1');
        dynamicConnectionId1 = child1.addDynamicConnection(dynamicConnection1);
        dynamicConnection2 = createConfig(child1RuntimeId, child3RuntimeId, 'hookFunction2');
        dynamicConnectionId2 = child1.addDynamicConnection(dynamicConnection2);
        dynamicConnection3 = createConfig(child2RuntimeId, child3RuntimeId, 'hookFunction3');
        dynamicConnectionId3 = child2.addDynamicConnection(dynamicConnection3);
        dynamicConnection4 = createConfig(child1RuntimeId, childChild1RuntimeId, 'hookFunction4');
        dynamicConnectionId4 = child1.addDynamicConnection(dynamicConnection4);
        dynamicConnection5 = createConfig(childChild1RuntimeId, child1RuntimeId, 'hookFunction5');
        dynamicConnectionId5 = child1.addDynamicConnection(dynamicConnection5);
        dynamicConnection6 = createConfig(child1RuntimeId, childChild2RuntimeId, 'hookFunction6');
        dynamicConnectionId6 = child1.addDynamicConnection(dynamicConnection6);
        dynamicConnection7 = createConfig(childChild2RuntimeId, child1RuntimeId, 'hookFunction7');
        dynamicConnectionId7 = childChild1.addDynamicConnection(dynamicConnection7);
        dynamicConnection8 = createConfig(childChild1RuntimeId, childChild2RuntimeId, 'hookFunction8');
        dynamicConnectionId8 = childChild1.addDynamicConnection(dynamicConnection8);

        payloadObj = {
          slot: 'message',
          payload: 'payload message'
        };
      });
      after(function () {
        container.removeChild(parent);
        container.Context._children = [];
        container.Context._components = [];
        window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      });
      describe('Call hookFunction for connection 1', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = parent.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId1 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction1');
          setMessageSpy = sinon.spy(child2, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction1.restore();
          child2.setMessage.restore();
        });

        it('window.hookFunction1 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(child2.getMessage()).to.be.undefined;
        });
        it('destination component setMessage method should not be called', function () {
          setMessageSpy.should.not.be.called;
        });
      });
      describe('Call hookFunction for connection 2', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = parent.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId2 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction2');
          setMessageSpy = sinon.spy(child3, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction2.restore();
          child3.setMessage.restore();
        });

        it('window.hookFunction2 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(child3.getMessage()).to.be.undefined;
        });
        it('destination component setMessage method should not be called', function () {
          setMessageSpy.should.not.be.called;
        });
      });
      describe('Call hookFunction for connection 3', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = parent.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId3 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction3');
          setMessageSpy = sinon.spy(child3, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction3.restore();
          child3.setMessage.restore();
        });

        it('window.hookFunction3 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(child3.getMessage()).to.be.undefined;
        });
        it('destination component setMessage method should not be called', function () {
          setMessageSpy.should.not.be.called;
        });
      });
      describe('Call hookFunction for connection 4', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId4 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction4');
          setMessageSpy = sinon.spy(childChild1, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction4.restore();
          childChild1.setMessage.restore();
        });

        it('window.hookFunction4 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(childChild1.getMessage()).to.be.undefined;
        });
        it('destination component setMessage method should not be called', function () {
          setMessageSpy.should.not.be.called;
        });
      });
      describe('Call hookFunction for connection 5', function () {
        var hookFunctionSpy;
        /* eslint-disable no-unused-vars */
        var _setSlotValueSpy;
        /* eslint-enable no-unused-vars */
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId5 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction5');
          _setSlotValueSpy = sinon.spy(child1, '_setSlotValue');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction5.restore();
          child1._setSlotValue.restore();
        });

        it('window.hookFunction5 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(child1.getMessage()).to.be.undefined;
        });
      });
      describe('Call hookFunction for connection 6', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId6 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction6');
          setMessageSpy = sinon.spy(childChild2, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction6.restore();
          childChild2.setMessage.restore();
        });

        it('window.hookFunction6 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(childChild2.getMessage()).to.be.undefined;
        });
        it('destination component setMessage method should not be called', function () {
          setMessageSpy.should.not.be.called;
        });
      });
      describe('Call hookFunction for connection 7', function () {
        var hookFunctionSpy;
        /* eslint-disable no-unused-vars */
        var _setSlotValueSpy;
        /* eslint-enable no-unused-vars */
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId7 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction7');
          _setSlotValueSpy = sinon.spy(child1, '_setSlotValue');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction7.restore();
          child1._setSlotValue.restore();
        });

        it('window.hookFunction7 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(child1.getMessage()).to.be.undefined;
        });
      });

      describe('Call hookFunction for connection 8', function () {
        var hookFunctionSpy;
        var setMessageSpy;
        before(function () {
          var connectionMgr = child1.Context.getConnectionMgr();
          var connection = _.find(connectionMgr._connections, { connectionId: dynamicConnectionId8 });
          hookFunctionSpy = sinon.spy(window, 'hookFunction8');
          setMessageSpy = sinon.spy(childChild2, 'setMessage');
          connectionMgr._processConnection(connection, payloadObj);
        });
        after(function () {
          window.hookFunction8.restore();
          childChild2.setMessage.restore();
        });

        it('window.hookFunction8 should be called', function () {
          hookFunctionSpy.should.be.calledOnce;
        });
        it('destination component message slot is not setted with a new value', function () {
          expect(childChild2.getMessage()).to.be.undefined;
        });
        it('destination component setMessage method should not be called', function () {
          setMessageSpy.should.not.be.called;
        });
      });
    });
  });
});
