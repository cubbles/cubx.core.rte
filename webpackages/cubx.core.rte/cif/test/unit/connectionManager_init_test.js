'use strict';
describe('ConnectionManager', function () {
  describe('init', function () {
    var cif;
    before(function () {
      cif = window.cubx.cif.cif;
    });
    describe('ConnectionManager.constructor', function () {
      var container;
      var element;
      var spy;
      var context;
      beforeEach(function () {
        spy = sinon.spy(window.cubx.cif, 'ConnectionManager');
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-elem');
        element = new constructor();
        container.appendChild(element);
        context = element.Context;
      });
      afterEach(function () {
        window.cubx.cif.ConnectionManager.restore();
        container.removeChild(element);
      });
      it('ConnectionManager should be called', function () {
        expect(spy.called).to.be.true;
      });
      it('ConnectionManager initialized', function () {
        context._connectionMgr._connections.should.be.empty;
        context._connectionMgr._context.should.be.nested.equal(context);
      });
    });
    describe('#parseConnectionsFromComponentList', function () {
      var container;
      var element;

      var connectionMgr;
      var stub;
      var components;
      beforeEach(function () {
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-elem');
        element = new constructor();
        container.appendChild(element);
        var context = element.Context;
        connectionMgr = context._connectionMgr;
        stub = sinon.stub(context._connectionMgr, '_createConnectionsFromComponent').callsFake(function (component) {
          // dot nothing
        });
        components = [
          {
            name: 'test1'
          },
          {
            name: 'test2'
          }
        ];
        connectionMgr.parseConnectionsFromComponentList(components);
      });
      afterEach(function () {
        connectionMgr._createConnectionsFromComponent.restore();
        container.removeChild(element);
      });
      it('connectionMgr._createConnectionsFromComponent should be called for each component ' +
        'in _components property', function () {
        expect(stub.calledTwice).to.be.true;
        expect(stub.calledWith(components[ 0 ])).to.be.true;
        expect(stub.calledWith(components[ 1 ])).to.be.true;
      });
    });
    describe('#_createConnectionsFromComponent', function () {
      describe('the destination is a member', function () {
        var element;
        var connectionMgr;
        var child;
        var child2;
        var connections;
        var consoleWarnSpy;

        beforeEach(function () {
          var origConnections = [
            {
              connectionId: '1:firstSlotoutput-2:firstSlotInput',
              source: {
                memberIdRef: '1',
                slot: 'firstSlotOutput'
              },
              destination: {
                memberIdRef: '2',
                slot: 'firstSlotInput'

              }
            }
          ];

          var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
          element = new constructor();
          element._connections = origConnections;
          child = document.createElement('comp1');
          child.setAttribute('member-id', '1');
          element.appendChild(child);
          element.Context.addComponent(child);
          child2 = document.createElement('comp2');
          child2.setAttribute('member-id', '2');
          element.appendChild(child2);
          element.Context.addComponent(child2);
          cif._createConnectionElements(element);
          connectionMgr = element.Context._connectionMgr;
          consoleWarnSpy = sinon.spy(console, 'warn');
          connectionMgr._createConnectionsFromComponent(child);
          connections = element.Context._connectionMgr._connections;
        });
        afterEach(function () {
          console.warn.restore();
        });
        it('should be one connection exists', function () {
          expect(connections).to.be.not.null;
          connections.should.have.length(1);
        });
        it('console.warn should be not called', function () {
          consoleWarnSpy.should.have.been.not.called;
        });
        it('should be the correct connection created', function () {
          var connection = connections[ 0 ];
          connection.source.should.have.nested.property('component', child);
          connection.source.should.have.property('memberId', '1');
          connection.source.should.have.property('slot', 'firstSlotOutput');
          connection.destination.should.have.nested.property('component', child2);
          connection.destination.should.have.property('memberId', '2');
          connection.destination.should.have.property('slot', 'firstSlotInput');
          connection.should.have.property('connectionId', '1:firstSlotoutput-2:firstSlotInput');
        });
        it('should the dom-element marked as processed', function () {
          var conElem = child.querySelector('cubx-core-connection');
          expect(conElem).to.be.exist;
          conElem.should.have.property('processed', true);
        });
      });
      describe('the destination is a member and connectionId missed', function () {
        var element;
        var connectionMgr;
        var child;
        var child2;
        var connections;
        var consoleWarnSpy;

        beforeEach(function () {
          var origConnections = [
            {
              source: {
                memberIdRef: '1',
                slot: 'firstSlotOutput'
              },
              destination: {
                memberIdRef: '2',
                slot: 'firstSlotInput'

              }
            }
          ];

          var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
          element = new constructor();
          element._connections = origConnections;
          child = document.createElement('comp1');
          child.setAttribute('member-id', '1');
          element.appendChild(child);
          element.Context.addComponent(child);
          child2 = document.createElement('comp2');
          child2.setAttribute('member-id', '2');
          element.appendChild(child2);
          element.Context.addComponent(child2);
          cif._createConnectionElements(element);
          connectionMgr = element.Context._connectionMgr;
          consoleWarnSpy = sinon.spy(console, 'warn');
          connectionMgr._createConnectionsFromComponent(child);
          connections = element.Context._connectionMgr._connections;
        });
        afterEach(function () {
          console.warn.restore();
        });
        it('should be one connection exists', function () {
          expect(connections).to.be.not.null;
          connections.should.have.length(1);
        });
        it('console.warn should be called once', function () {
          consoleWarnSpy.should.have.been.calledOnce;
        });
        it('should be the correct connection created', function () {
          var connection = connections[ 0 ];
          connection.source.should.have.nested.property('component', child);
          connection.source.should.have.property('memberId', '1');
          connection.source.should.have.property('slot', 'firstSlotOutput');
          connection.destination.should.have.nested.property('component', child2);
          connection.destination.should.have.property('memberId', '2');
          connection.destination.should.have.property('slot', 'firstSlotInput');
          connection.should.have.property('connectionId', null);
        });
        it('should the dom-element marked as processed', function () {
          var conElem = child.querySelector('cubx-core-connection');
          expect(conElem).to.be.exist;
          conElem.should.have.property('processed', true);
        });
      });
      describe('the destination is a parent', function () {
        var element;
        var connectionMgr;
        var child;
        var connections;
        var consoleWarnSpy;
        beforeEach(function () {
          var origConnections = [
            {
              connectionId: '1:firstSlotoutput-firstSlotInput',
              source: {
                memberIdRef: '1',
                slot: 'firstSlotOutput'
              },
              destination: {
                slot: 'firstSlotInput'
              }
            }
          ];

          var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
          element = new constructor();
          element._connections = origConnections;
          child = document.createElement('comp1');
          child.setAttribute('member-id', '1');
          element.appendChild(child);
          element.Context.addComponent(child);

          cif._createConnectionElements(element);
          connectionMgr = element.Context._connectionMgr;
          consoleWarnSpy = sinon.spy(console, 'warn');
          connectionMgr._createConnectionsFromComponent(child);
          connections = element.Context._connectionMgr._connections;
        });
        afterEach(function () {
          console.warn.restore();
        });
        it('should be one connection exists', function () {
          expect(connections).to.be.not.null;
          connections.should.have.length(1);
        });
        it('console.warn should be not called', function () {
          consoleWarnSpy.should.have.been.not.called;
        });
        it('should be the correct connection created', function () {
          var connection = connections[ 0 ];
          connection.source.should.have.nested.property('component', child);
          connection.source.should.have.property('memberId', '1');
          connection.source.should.have.property('slot', 'firstSlotOutput');
          connection.destination.should.have.nested.property('component', element);
          connection.destination.should.have.property('memberId', 'parent');
          connection.destination.should.have.property('slot', 'firstSlotInput');
          connection.should.have.property('connectionId', '1:firstSlotoutput-firstSlotInput');
        });
        it('should the dom-element marked as processed', function () {
          var conElem = child.querySelector('cubx-core-connection');
          expect(conElem).to.be.exist;
          conElem.should.have.property('processed', true);
        });
      });
      describe('the destination is a parent and connectionId missed', function () {
        var element;
        var connectionMgr;
        var child;
        var connections;
        var consoleWarnSpy;
        beforeEach(function () {
          var origConnections = [
            {
              source: {
                memberIdRef: '1',
                slot: 'firstSlotOutput'
              },
              destination: {
                slot: 'firstSlotInput'
              }
            }
          ];

          var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
          element = new constructor();
          element._connections = origConnections;
          child = document.createElement('comp1');
          child.setAttribute('member-id', '1');
          element.appendChild(child);
          element.Context.addComponent(child);

          cif._createConnectionElements(element);
          connectionMgr = element.Context._connectionMgr;
          consoleWarnSpy = sinon.spy(console, 'warn');
          connectionMgr._createConnectionsFromComponent(child);
          connections = element.Context._connectionMgr._connections;
        });
        afterEach(function () {
          console.warn.restore();
        });
        it('should be one connection exists', function () {
          expect(connections).to.be.not.null;
          connections.should.have.length(1);
        });
        it('console.warn should be called once', function () {
          consoleWarnSpy.should.have.been.calledOnce;
        });
        it('should be the correct connection created', function () {
          var connection = connections[ 0 ];
          connection.source.should.have.nested.property('component', child);
          connection.source.should.have.property('memberId', '1');
          connection.source.should.have.property('slot', 'firstSlotOutput');
          connection.destination.should.have.nested.property('component', element);
          connection.destination.should.have.property('memberId', 'parent');
          connection.destination.should.have.property('slot', 'firstSlotInput');
          connection.should.have.property('connectionId', null);
        });
        it('should the dom-element marked as processed', function () {
          var conElem = child.querySelector('cubx-core-connection');
          expect(conElem).to.be.exist;
          conElem.should.have.property('processed', true);
        });
      });
      describe('the source is a parent', function () {
        var element;
        var connectionMgr;
        var child;
        var connections;
        var consoleWarnSpy;
        beforeEach(function () {
          var origConnections = [
            {
              connectionId: 'firstSlotoutput-1:firstSlotInput',
              source: {
                slot: 'firstSlotOutput'
              },
              destination: {
                memberIdRef: 1,
                slot: 'firstSlotInput'

              }
            }
          ];

          var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
          element = new constructor();
          element._connections = origConnections;
          child = document.createElement('comp1');
          child.setAttribute('member-id', '1');
          element.appendChild(child);
          element.Context.addComponent(child);

          cif._createConnectionElements(element);
          connectionMgr = element.Context._connectionMgr;
          consoleWarnSpy = sinon.spy(console, 'warn');
          connectionMgr._createConnectionsFromComponent(element);
          connections = element.Context._connectionMgr._connections;
        });
        afterEach(function () {
          console.warn.restore();
        });
        it('should be one connection exists', function () {
          expect(connections).to.be.not.null;
          connections.should.have.length(1);
        });
        it('console.warn should be not called', function () {
          consoleWarnSpy.should.have.been.not.called;
        });
        it('should be the correct connection created', function () {
          var connection = connections[ 0 ];
          connection.source.should.have.nested.property('component', element);
          connection.source.should.have.property('slot', 'firstSlotOutput');
          connection.destination.should.have.nested.property('component', child);
          connection.destination.should.have.property('memberId', '1');
          connection.destination.should.have.property('slot', 'firstSlotInput');
          connection.should.have.property('internal', true);
          connection.should.have.property('connectionId', 'firstSlotoutput-1:firstSlotInput');
        });
        it('should the dom-element marked as processed', function () {
          var conElem = element.querySelector('cubx-core-connection');
          expect(conElem).to.be.exist;
          conElem.should.have.property('processed', true);
        });
      });
      describe('the source is a parent and connectionId missed', function () {
        var element;
        var connectionMgr;
        var child;
        var connections;
        var consoleWarnSpy;
        beforeEach(function () {
          var origConnections = [
            {
              source: {
                slot: 'firstSlotOutput'
              },
              destination: {
                memberIdRef: 1,
                slot: 'firstSlotInput'

              }
            }
          ];

          var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
          element = new constructor();
          element._connections = origConnections;
          child = document.createElement('comp1');
          child.setAttribute('member-id', '1');
          element.appendChild(child);
          element.Context.addComponent(child);

          cif._createConnectionElements(element);
          connectionMgr = element.Context._connectionMgr;
          consoleWarnSpy = sinon.spy(console, 'warn');
          connectionMgr._createConnectionsFromComponent(element);
          connections = element.Context._connectionMgr._connections;
        });
        afterEach(function () {
          console.warn.restore();
        });
        it('should be one connection exists', function () {
          expect(connections).to.be.not.null;
          connections.should.have.length(1);
        });
        it('console.warn should be called once', function () {
          consoleWarnSpy.should.have.been.calledOnce;
        });
        it('should be the correct connection created', function () {
          var connection = connections[ 0 ];
          connection.source.should.have.nested.property('component', element);
          connection.source.should.have.property('slot', 'firstSlotOutput');
          connection.destination.should.have.nested.property('component', child);
          connection.destination.should.have.property('memberId', '1');
          connection.destination.should.have.property('slot', 'firstSlotInput');
          connection.should.have.property('internal', true);
          expect(connection.connectionId).to.be.null;
        });
        it('should the dom-element marked as processed', function () {
          var conElem = element.querySelector('cubx-core-connection');
          expect(conElem).to.be.exist;
          conElem.should.have.property('processed', true);
        });
      });
    });
    describe('#createConnectionFromComponent', function () {
      var connectionMgr;
      var container;
      var context;
      var _createConnectionStub;
      var component;
      var connectionElement;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        context = new window.cubx.cif.Context(container);
        connectionMgr = new window.cubx.cif.ConnectionManager(context);
        _createConnectionStub = sinon.stub(connectionMgr, '_createConnection').callsFake(function (component, element) {
          // just get an object
          return {
            connectionId: element.getAttribute('connection-id')
          };
        });
        var constructor = cif.getCompoundComponentElementConstructor('cif-test-a');
        component = new constructor();
        connectionElement = document.createElement('cubx-core-connection');
        connectionElement.setAttribute('connection-id', 'test');
        connectionElement.setAttribute('source', 'first');
        connectionElement.setAttribute('destination', 'two:second');
        connectionElement.getType = function () {
          return this.getAttribute('type');
        };
        connectionElement.getConnectionId = function () {
          return this.getAttribute('connection-id');
        };
      });
      afterEach(function () {
        container = null;
        context = null;
        connectionMgr._createConnection.restore();
        connectionMgr = null;
        component = null;
        connectionElement = null;
      });
      describe('normal connection', function () {
        beforeEach(function () {
          connectionMgr._connections.should.have.length(0);
          connectionMgr.createConnectionFromComponent(component, connectionElement);
        });
        it('_createConnection should be called once', function () {
          _createConnectionStub.should.be.calledOnce;
        });
        it('_createConnection should be called with component and connectionElement', function () {
          _createConnectionStub.should.be.calledWithExactly(component, connectionElement);
        });
        it('connectionElement should have property processed', function () {
          connectionElement.should.have.property('processed', true);
        });
        it('the property connectionMgr._connections should have a length of 1', function () {
          connectionMgr._connections.should.have.length(1);
        });
      });
      describe('internal connection', function () {
        beforeEach(function () {
          connectionMgr._connections.should.have.length(0);
          connectionElement.setAttribute('type', 'internal');
          component.Context = new window.cubx.cif.Context(component);

          connectionMgr.createConnectionFromComponent(component, connectionElement);
        });
        it('_createConnection should be called once', function () {
          _createConnectionStub.should.be.calledOnce;
        });
        it('_createConnection should be called with component,connectionElement and true', function () {
          _createConnectionStub.should.be.calledWithExactly(component, connectionElement, true);
        });
        it('connectionElement should have property processed', function () {
          connectionElement.should.have.property('processed', true);
        });
        it('the property _connectionMgr._connections of the parent context should have a length of 0', function () {
          connectionMgr._connections.should.have.length(0);
        });
        it('the property _connectionMgr._connections of the components context should have a length of 1', function () {
          component.Context._connectionMgr._connections.should.have.length(1);
        });
      });
      describe('procressed connection', function () {
        var connectionElement1;
        beforeEach(function () {
          connectionElement1 = document.createElement('cubx-core-connection');
          connectionElement1.setAttribute('connection-id', 'test1');
          connectionElement1.setAttribute('source', 'first');
          connectionElement1.setAttribute('destination', 'two:second');
          connectionElement1.getType = function () {
            return this.getAttribute('type');
          };
          connectionElement1.getConnectionId = function () {
            return this.getAttribute('connection-id');
          };
          connectionElement1.processed = true;
          connectionMgr._connections.should.have.length(0);
          connectionMgr.createConnectionFromComponent(component, connectionElement1);
        });
        afterEach(function () {
          connectionElement1 = null;
        });
        it('_createConnection should be not called', function () {
          _createConnectionStub.should.be.not.called;
        });
        it('the property connectionMgr._connections should have a length of 0', function () {
          connectionMgr._connections.should.have.length(0);
        });
      });
      describe('existing connection', function () {
        var connectionElement1;
        var consoleWarnSpy;
        beforeEach(function () {
          connectionElement1 = document.createElement('cubx-core-connection');
          connectionElement1.setAttribute('connection-id', 'test');
          connectionElement1.setAttribute('source', 'first');
          connectionElement1.setAttribute('destination', 'two:second');
          connectionElement1.getType = function () {
            return this.getAttribute('type');
          };
          connectionElement1.getConnectionId = function () {
            return this.getAttribute('connection-id');
          };
          consoleWarnSpy = sinon.spy(console, 'warn');
          connectionMgr._connections.should.have.length(0);
          connectionMgr.createConnectionFromComponent(component, connectionElement);
          connectionMgr.createConnectionFromComponent(component, connectionElement1);
        });
        afterEach(function () {
          connectionElement1 = null;
          console.warn.restore();
        });
        it('the property connectionMgr._connections should have a length of 1', function () {
          connectionMgr._connections.should.have.length(1);
        });
        it('_createConnection should be called once', function () {
          _createConnectionStub.should.be.calledOnce;
        });
        it('should be logged a warning', function () {
          consoleWarnSpy.should.be.calledOnce;
          consoleWarnSpy.should.be.calledWithMatch('The following connection element didn\'t added to the connection list, because it already exist a connection with the same connectionId.');
        });
      });
    });
    describe('#_createConnection', function () {
      describe('getCopyValue() and getRepeatedValues() and getHookFunctions returns with null', function () {
        describe('the destination is a member', function () {
          var element;
          var connectionMgr;
          var child;
          var child2;
          var connection;
          var cubxConnection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '2:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return '1:firstSlotOutput-2:firstSlotInput';
              },
              getHookFunction: function () {
                return null;
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', '1');
            element.appendChild(child);
            element.Context.addComponent(child);
            child2 = document.createElement('comp2');
            child2.setAttribute('member-id', 2);
            element.appendChild(child2);
            element.Context.addComponent(child2);
            connectionMgr = element.Context._connectionMgr;

            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            expect(connection).to.be.not.null;
            connection.source.should.have.nested.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.destination.should.have.nested.property('component', child2);
            connection.destination.should.have.property('memberId', '2');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', null);
            connection.should.have.property('connectionId', '1:firstSlotOutput-2:firstSlotInput');
            connection.should.have.property('internal', false);
          });
        });
        describe('the destination is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return 'parent:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return '1:firstSlotOutput-firstSlotInput';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            element.Context.addComponent(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', element);
            connection.destination.should.have.property('memberId', 'parent');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', '1:firstSlotOutput-firstSlotInput');
            connection.should.have.property('internal', false);
          });
        });
        describe('the source is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '1:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return 'firstSlotOutput-firstSlotInput';
              },
              getType: function () {
                return 'internal';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            element.Context.addComponent(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(element, cubxConnection, true);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', element);
            connection.source.should.have.property('memberId', 'self');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', child);
            connection.destination.should.have.property('memberId', '1');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'firstSlotOutput-firstSlotInput');
            connection.should.have.property('internal', true);
          });
        });
      });
      describe('getCopyValue() returns with true', function () {
        describe('the destination is a member', function () {
          var element;
          var connectionMgr;
          var child;
          var child2;
          var connection;
          var cubxConnection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '2:firstSlotInput';
              },
              getCopyValue: function () {
                return true;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return '1:firstSlotOutput-2:firstSlotInput';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', '1');
            element.appendChild(child);
            element.Context.addComponent(child);
            child2 = document.createElement('comp2');
            child2.setAttribute('member-id', '2');
            element.appendChild(child2);
            element.Context.addComponent(child2);
            connectionMgr = element.Context._connectionMgr;

            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            expect(connection).to.be.not.null;
            connection.source.should.have.nested.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.destination.should.have.nested.property('component', child2);
            connection.destination.should.have.property('memberId', '2');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', '1:firstSlotOutput-2:firstSlotInput');
            connection.should.have.property('internal', false);
          });
        });
        describe('the destination is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return 'parent:firstSlotInput';
              },
              getCopyValue: function () {
                return true;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return 'custom-id';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', element);
            connection.destination.should.have.property('memberId', 'parent');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id');
            connection.should.have.property('internal', false);
          });
        });
        describe('the source is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '1:firstSlotInput';
              },
              getCopyValue: function () {
                return true;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return 'custom-id';
              },
              getHookFunction: function () {
                return 'test';
              },
              getType: function () {
                return 'internal';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            element.Context.addComponent(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(element, cubxConnection, true);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', element);
            connection.source.should.have.property('memberId', 'self');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', child);
            connection.destination.should.have.property('memberId', '1');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id');
            connection.should.have.property('internal', true);
          });
        });
      });
      describe('getCopyValue() returns with false', function () {
        describe('the destination is a member', function () {
          var element;
          var connectionMgr;
          var child;
          var child2;
          var connection;
          var cubxConnection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '2:firstSlotInput';
              },
              getCopyValue: function () {
                return false;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return 'custom-id';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', '1');
            element.appendChild(child);
            element.Context.addComponent(child);
            child2 = document.createElement('comp2');
            child2.setAttribute('member-id', '2');
            element.appendChild(child2);
            element.Context.addComponent(child2);
            connectionMgr = element.Context._connectionMgr;

            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            expect(connection).to.be.not.null;
            connection.source.should.have.nested.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.destination.should.have.nested.property('component', child2);
            connection.destination.should.have.property('memberId', '2');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', false);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id');
            connection.should.have.property('internal', false);
          });
        });
        describe('the destination is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return 'parent:firstSlotInput';
              },
              getCopyValue: function () {
                return false;
              },
              getRepeatedValues: function () {
                return null;
              },
              getConnectionId: function () {
                return 'custom-id2';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            element.Context.addComponent(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', element);
            connection.destination.should.have.property('memberId', 'parent');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', false);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id2');
            connection.should.have.property('internal', false);
          });
        });
      });
      describe('getRepeatedValues() returns with true', function () {
        describe('the destination is a member', function () {
          var element;
          var connectionMgr;
          var child;
          var child2;
          var connection;
          var cubxConnection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '2:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return true;
              },
              getConnectionId: function () {
                return '1:firstSlotOutput-2:firstSlotInput';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', '1');
            element.appendChild(child);
            element.Context.addComponent(child);
            child2 = document.createElement('comp2');
            child2.setAttribute('member-id', '2');
            element.Context.addComponent(child2);
            element.appendChild(child2);
            connectionMgr = element.Context._connectionMgr;

            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            expect(connection).to.be.not.null;
            connection.source.should.have.nested.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.destination.should.have.nested.property('component', child2);
            connection.destination.should.have.property('memberId', '2');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', true);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', '1:firstSlotOutput-2:firstSlotInput');
            connection.should.have.property('internal', false);
          });
        });
        describe('the destination is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return 'parent:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return true;
              },
              getConnectionId: function () {
                return 'custom-id';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', element);
            connection.destination.should.have.property('memberId', 'parent');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', true);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id');
            connection.should.have.property('internal', false);
          });
        });
        describe('the source is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '1:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return true;
              },
              getConnectionId: function () {
                return 'custom-id';
              },
              getHookFunction: function () {
                return 'test';
              },
              getType: function () {
                return 'internal';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            element.Context.addComponent(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(element, cubxConnection, true);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', element);
            connection.source.should.have.property('memberId', 'self');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', child);
            connection.destination.should.have.property('memberId', '1');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', true);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id');
            connection.should.have.property('internal', true);
          });
        });
      });
      describe('getRepeatedValues() returns with false', function () {
        describe('the destination is a member', function () {
          var element;
          var connectionMgr;
          var child;
          var child2;
          var connection;
          var cubxConnection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '2:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return false;
              },
              getConnectionId: function () {
                return 'custom-id';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', '1');
            element.appendChild(child);
            element.Context.addComponent(child);
            child2 = document.createElement('comp2');
            child2.setAttribute('member-id', '2');
            element.appendChild(child2);
            element.Context.addComponent(child2);
            connectionMgr = element.Context._connectionMgr;

            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            expect(connection).to.be.not.null;
            connection.source.should.have.nested.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.destination.should.have.nested.property('component', child2);
            connection.destination.should.have.property('memberId', '2');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id');
            connection.should.have.property('internal', false);
          });
        });
        describe('the destination is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return 'parent:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return false;
              },
              getConnectionId: function () {
                return 'custom-id2';
              },
              getHookFunction: function () {
                return 'test';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(child, cubxConnection);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', child);
            connection.source.should.have.property('memberId', '1');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', element);
            connection.destination.should.have.property('memberId', 'parent');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id2');
            connection.should.have.property('internal', false);
          });
        });
        describe('the source is a parent', function () {
          var element;
          var connectionMgr;
          var cubxConnection;
          var child;
          var connection;
          beforeEach(function () {
            cubxConnection = {
              getSource: function () {
                return 'firstSlotOutput';
              },
              getDestination: function () {
                return '1:firstSlotInput';
              },
              getCopyValue: function () {
                return null;
              },
              getRepeatedValues: function () {
                return false;
              },
              getConnectionId: function () {
                return 'custom-id2';
              },
              getHookFunction: function () {
                return 'test';
              },
              getType: function () {
                return 'internal';
              }
            };
            var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
            element = new constructor();
            child = document.createElement('comp1');
            child.setAttribute('member-id', 1);
            element.appendChild(child);
            element.Context.addComponent(child);
            connectionMgr = element.Context._connectionMgr;
            connectionMgr._connections = [];
            connection = connectionMgr._createConnection(element, cubxConnection, true);
          });

          it('the created connection should be the right connection object', function () {
            connection.should.have.property('source');
            connection.source.should.have.property('component', element);
            connection.source.should.have.property('memberId', 'self');
            connection.source.should.have.property('slot', 'firstSlotOutput');
            connection.should.have.property('destination');
            connection.destination.should.have.property('component', child);
            connection.destination.should.have.property('memberId', '1');
            connection.destination.should.have.property('slot', 'firstSlotInput');
            connection.should.have.property('copyValue', true);
            connection.should.have.property('repeatedValues', false);
            connection.should.have.property('hookFunction', 'test');
            connection.should.have.property('connectionId', 'custom-id2');
            connection.should.have.property('internal', true);
          });
        });
      });
    });
    describe('#getConnectionsTo', function () {
      function createConnection (sourceElement, sourceSlot, sourceMember, destElement, destSlot, destMember) {
        var connection = {
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

      var connectionManager;
      var element;
      var element2;
      var element3;
      beforeEach(function () {
        connectionManager = new window.cubx.cif.ConnectionManager();
        var constructor = cif.getCompoundComponentElementConstructor('source-element');
        var sourceElement = new constructor();
        constructor = cif.getCompoundComponentElementConstructor('source-element2');
        var sourceElement2 = new constructor();
        constructor = cif.getCompoundComponentElementConstructor('first-destination-element');
        element = new constructor();
        constructor = cif.getCompoundComponentElementConstructor('second-destination-element');
        element2 = new constructor();
        constructor = cif.getCompoundComponentElementConstructor('third-destination-element');
        element3 = new constructor();

        connectionManager._connections.push(createConnection(sourceElement, 1, 'slotA', element, 'slotB', 1));
        connectionManager._connections.push(createConnection(sourceElement, 1, 'slotA', element, 'slotC', 2));
        connectionManager._connections.push(createConnection(sourceElement2, 2, 'slotA', element, 'slotB', 1));
        connectionManager._connections.push(createConnection(sourceElement2, 2, 'slotA', element, 'slotC', 2));
        connectionManager._connections.push(createConnection(sourceElement, 1, 'slotA', element2, 'slotB', 1));
        connectionManager._connections.push(createConnection(sourceElement, 1, 'slotA', element2, 'slotC', 2));
        connectionManager._connections.push(createConnection(sourceElement, 1, 'slotA', element3, 'slotB', 1));
        connectionManager._connections.push(createConnection(sourceElement, 1, 'slotA', element3, 'slotC', 2));
      });
      it('one connection to element2, slotC should be found', function () {
        var list = connectionManager.getConnectionsTo(element2, 'slotB');
        expect(list).to.exist;
        list.should.be.instanceOf(Array);
        list.should.have.length(1);
      });
      it('one connection to element, slotB should 2 connections found', function () {
        var list = connectionManager.getConnectionsTo(element, 'slotB');
        expect(list).to.exist;
        list.should.be.instanceOf(Array);
        list.should.have.length(2);
      });
    });
    describe('#removeConnection', function () {
      var container;

      var connectionMgr;
      var source;
      var destination;
      var elem;
      var connectionElem;
      beforeEach(function () {
        container = cif.getCRCRootNode();
        var constructor = cif.getCompoundComponentElementConstructor('my-source');
        source = new constructor();
        source.setAttribute('member-id', 'member1');
        constructor = cif.getCompoundComponentElementConstructor('my-destination');
        destination = new constructor();
        destination.setAttribute('member-id', 'member2');
        constructor = cif.getCompoundComponentElementConstructor('my-elem');
        elem = new constructor();
        container.appendChild(elem);
        elem.appendChild(source);
        elem.appendChild(destination);
        elem.Context.addComponent(source);
        elem.Context.addComponent(destination);
        var connections = document.createElement('cubx-core-connections');
        connectionElem = document.createElement('cubx-core-connection');
        connectionElem.setAttribute('connection-id', 'con1');
        connectionElem.setAttribute('source', 'slotA');
        connectionElem.setAttribute('destination', 'member2:slotB');
        connections.appendChild(connectionElem);
        source.appendChild(connections);
        connectionMgr = elem.Context.getConnectionMgr();
        connectionMgr._createConnectionsFromComponent(source);
      });
      afterEach(function () {
        container = null;
        connectionMgr = null;
        connectionElem = null;
        elem = null;
        source = null;
        destination = null;
      });
      it('should remove the connectionElement corresponding connection object', function () {
        connectionMgr._connections.should.have.length(1);
        connectionMgr.removeConnection(connectionElem);
        connectionMgr._connections.should.have.length(0);
      });
    });
  });
});
