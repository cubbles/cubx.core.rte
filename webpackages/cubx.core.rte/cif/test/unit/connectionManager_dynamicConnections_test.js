/* globals createTestConnection */
'use strict';

describe('ConnectionManager', function () {
  describe('dynamicConnections', function () {
    var cif;
    before(function () {
      cif = window.cubx.cif.cif;
    });
    describe('#_addHookFunction', function () {
      var payloadFrame;
      var connection;
      var connectionManager;
      var functionStr;

      afterEach(function () {
        payloadFrame = null;
        connection = null;
        connectionManager = null;
        functionStr = null;
      });
      describe('hookFunction exists', function () {
        beforeEach(function () {
          functionStr = 'cubx.functions.firstHook';
          var comp1 = document.createElement('comp1');
          comp1.setAttribute('runtime-id', 'comp1');
          var comp2 = document.createElement('comp2');
          comp2.setAttribute('runtime-id', 'comp2');
          comp2.isInputSlot = function (slot) {
            return true;
          };
          payloadFrame = {
            slot: 'slota',
            payload: { foo: 'baz' }
          };
          connection = {
            destination: {
              component: comp1,
              memberId: 'member1',
              slot: 'slota'
            },
            source: {
              component: comp2,
              memberId: 'member2',
              slot: 'slota'
            },
            hookFunction: 'cubx.functions.firstHook'
          };
          var context = new window.cubx.cif.Context(document.createElement('element'));
          connectionManager = new window.cubx.cif.ConnectionManager(context);
          connectionManager._addHookFunction(payloadFrame, connection);
        });
        it('payloadFrame has an attribute "connectionHook"', function () {
          payloadFrame.should.have.property('connectionHook', functionStr);
        });
      });
      describe('hookFunction not exists', function () {
        beforeEach(function () {
          functionStr = 'cubx.functions.firstHook';
          var comp1 = document.createElement('comp1');
          comp1.setAttribute('runtime-id', 'comp1');
          var comp2 = document.createElement('comp2');
          comp2.setAttribute('runtime-id', 'comp2');
          comp2.isInputSlot = function (slot) {
            return true;
          };
          payloadFrame = {
            slot: 'slota',
            payload: { foo: 'baz' }
          };
          connection = {
            destination: {
              component: comp1,
              memberId: 'member1',
              slot: 'slota'
            },
            source: {
              component: comp2,
              memberId: 'member2',
              slot: 'slota'
            }
          };
          var context = new window.cubx.cif.Context(document.createElement('element'));
          connectionManager = new window.cubx.cif.ConnectionManager(context);
          connectionManager._addHookFunction(payloadFrame, connection);
        });
        it('payloadFrame has not an attribute "connectionHook"', function () {
          payloadFrame.should.not.have.property('connectionHook');
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
    describe('#_handlePayload', function () {
      describe('parameter payloadFrame.payload is from type object', function () {
        var payloadFrame;
        var connectionManager;
        var payload;
        beforeEach(function () {
          connectionManager = new window.cubx.cif.ConnectionManager();
          payload = {
            name: 'example',
            value: { fo: 'bar' }
          };
          payloadFrame = {
            slot: 'test',
            payload: payload
          };
        });

        it('parameter copy undefined --> payload will be copied', function () {
          var res = connectionManager._handlePayload(payloadFrame);
          expect(res.payload === payload).to.be.not.ok;
          // change res.payload --> not changed payload
          res.payload.that = 'new';
          res.payload.should.be.not.eql(payload);
        });
        it('parameter copy null --> payload will be copied', function () {
          var res = connectionManager._handlePayload(payloadFrame, null);
          expect(res.payload === payload).to.be.not.ok;
          // change res.payload --> not changed payload
          res.payload.that = 'new';
          res.payload.should.be.not.eql(payload);
        });
        it('parameter copy true --> payload will be copied', function () {
          var res = connectionManager._handlePayload(payloadFrame, true);
          expect(res.payload === payload).to.be.not.ok;
          // change res.payload --> not changed payload
          res.payload.that = 'new';
          res.payload.should.be.not.eql(payload);
        });
        it('parameter copy false --> payload will be not copied', function () {
          var res = connectionManager._handlePayload(payloadFrame, false);
          expect(res.payload === payload).to.be.ok;
          // change res.payload --> changed payload
          res.payload.that = 'new';
          res.payload.should.be.eql(payload);
        });
      });
    });
    describe('#addDynamicConnection', function () {
      var connectionMgr;
      var conConfig;
      var sourceElem;
      var destinationElem;
      describe('add a connection to connecton list', function () {
        beforeEach(function () {
          var constructor = cif.getCompoundComponentElementConstructor('parent-elem');
          var parentElem = new constructor();
          connectionMgr = parentElem.Context._connectionMgr;
          constructor = cif.getCompoundComponentElementConstructor('source-elem');
          sourceElem = new constructor();
          sourceElem.setAttribute('runtime-id', 'aSourceRuntimeId');
          parentElem.appendChild(sourceElem);
          sourceElem.Context.setParent(parentElem.Context);
          constructor = cif.getCompoundComponentElementConstructor('destination-elem');
          destinationElem = new constructor();
          destinationElem.setAttribute('runtime-id', 'aDestinationRuntimeId');
          parentElem.appendChild(destinationElem);
          destinationElem.Context.setParent(parentElem.Context);
          var con = {
            connectionId: 'con1',
            source: {
              memberId: 'sourceMember',
              component: sourceElem,
              slot: 'slotA'
            },
            destination: {
              memberId: 'destinationMember',
              component: destinationElem,
              slot: 'slotB'
            }
          };

          connectionMgr._connections.push(createTestConnection(con, true));
          con.connectionId = 'con2';
          connectionMgr._connections.push(createTestConnection(con, true));
          con.connectionId = 'otherCon2';
          connectionMgr._connections.push(createTestConnection(con, true));
          con.connectionId = 'otherCon1';
          connectionMgr._connections.push(createTestConnection(con, true));
          connectionMgr._connections.should.have.length(4);
        });
        afterEach(function () {
          connectionMgr = null;
        });
        describe('add a valid connection', function () {
          beforeEach(function () {
            conConfig = {
              connectionId: 'dynCon1',
              source: {
                memberId: 'sourceMember',
                component: document.createElement('sourceElement'),
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: document.createElement('destination-element'),
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
          });
          afterEach(function () {
            conConfig = null;
          });
          it('the valid connection added to connectionManager._connections', function () {
            connectionMgr.addDynamicConnection(conConfig);
            connectionMgr._connections.should.have.length(5);
            connectionMgr._connections[ 4 ].should.have.property('connectionId', conConfig.connectionId);
            connectionMgr._connections[ 4 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
          });
        });
        describe('add a not valid connection', function () {
          beforeEach(function () {
            conConfig = {
              connectionId: 'dynCon1',
              destination: {
                memberId: 'destinationMember',
                component: document.createElement('destination-element'),
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
          });
          afterEach(function () {
            conConfig = null;
          });

          it('a not valid connection should be not added to connectionManager._connections', function () {
            expect(function () {
              connectionMgr.addDynamicConnection(conConfig);
            }).to.throw(Error);
            connectionMgr._connections.should.have.length(4);
          });
        });
        describe('add a connection, connectionId exists as a static connection', function () {
          beforeEach(function () {
            conConfig = {
              connectionId: 'dynCon1',
              source: {
                memberId: 'sourceMember',
                component: document.createElement('sourceElement'),
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: document.createElement('destination-element'),
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
            var existConnection = connectionMgr._connections[ 2 ];
            conConfig.connectionId = existConnection.connectionId;
          });
          afterEach(function () {
            conConfig = null;
          });
          it('should cause an exception', function () {
            expect(function () {
              connectionMgr.addDynamicConnection(conConfig);
            }).to.throw(Error);
            connectionMgr._connections.should.have.length(4);
          });
        });
        describe('add a connection, source/destination exists as a static connection', function () {
          beforeEach(function () {
            conConfig = {

              source: {
                memberId: 'sourceMember',
                component: sourceElem,
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: destinationElem,
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'
            };
            conConfig.connectionId = window.cubx.dynamicConnectionUtil.generateConnectionId({
              source: {
                runtimeId: sourceElem.getAttribute('runtime-id'),
                slot: conConfig.source.slot
              },
              destination: {
                runtimeId: destinationElem.getAttribute('runtime-id'),
                slot: conConfig.destination.slot
              }
            });
            var existConnection = connectionMgr._connections[ 2 ];
            conConfig.connectionId = existConnection.connectionId;
          });
          afterEach(function () {
            conConfig = null;
          });
          it('should cause an exception', function () {
            expect(function () {
              connectionMgr.addDynamicConnection(conConfig);
            }).to.throw(Error);
            connectionMgr._connections.should.have.length(4);
          });
        });
        describe('add a connection, the connectionId exists as a dynamic connection', function () {
          var spy;
          beforeEach(function () {
            conConfig = {
              connectionId: 'dynCon1',
              source: {
                memberId: 'sourceMember',
                component: document.createElement('sourceElement'),
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: document.createElement('destination-element'),
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
            connectionMgr.addDynamicConnection(conConfig);

            spy = sinon.spy(console, 'error');
          });
          afterEach(function () {
            conConfig = null;
            console.error.restore();
          });
          it('should override the existing connection', function () {
            connectionMgr._connections.should.have.length(5);
            connectionMgr._connections[ 4 ].should.nested.property('source.memberId',
              conConfig.source.memberId);
            conConfig.source.memberId = 'otherMember';
            connectionMgr.addDynamicConnection(conConfig);
            expect(spy.called).to.be.false;
            connectionMgr._connections.should.have.length(5);
            connectionMgr._connections[ 4 ].should.have.property('connectionId', conConfig.connectionId);
            connectionMgr._connections[ 4 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
            connectionMgr._connections[ 4 ].should.nested.property('source.memberId');
            connectionMgr._connections[ 4 ].should.nested.property('source.memberId',
              conConfig.source.memberId);
          });
        });
        describe('add a connection, the connection source/destionation exists as a dynamic connection',
          function () {
            var spy;
            beforeEach(function () {
              var source = document.createElement('sourceElement');
              var sourceRuntimeId = 'source:runtimeId';
              var destinationRuntimeId = 'destination:runtimeId';
              source.setAttribute('runtime-id', sourceRuntimeId);
              var destination = document.createElement('destination-element');
              destination.setAttribute('runtime-id', destinationRuntimeId);
              conConfig = {
                source: {
                  memberId: 'sourceMember',
                  component: source,
                  slot: 'slotA'
                },
                destination: {
                  memberId: 'destinationMember',
                  component: destination,
                  slot: 'slotB'
                },
                repeatedValues: false,
                copyValue: true,
                hookFunction: 'myFunc'

              };
              conConfig.connectionId = window.cubx.dynamicConnectionUtil.generateConnectionId({
                source: {
                  runtimeId: source.getAttribute('runtime-id'),
                  slot: conConfig.source.slot
                },
                destination: {
                  runtimeId: destination.getAttribute('runtime-id'),
                  slot: conConfig.destination.slot
                }
              });
              connectionMgr.addDynamicConnection(conConfig);

              spy = sinon.spy(console, 'error');
            });
            afterEach(function () {
              conConfig = null;
              console.error.restore();
            });
            it('should override the existing connection', function () {
              connectionMgr._connections.should.have.length(5);
              connectionMgr._connections[ 4 ].should.have.property('hookFunction', 'myFunc');
              conConfig.hookFunction = 'otherFunc';
              connectionMgr.addDynamicConnection(conConfig);
              expect(spy.called).to.be.false;
              connectionMgr._connections.should.have.length(5);
              connectionMgr._connections[ 4 ].should.have.property('connectionId', conConfig.connectionId);
              connectionMgr._connections[ 4 ].should.instanceOf(
                window.cubx.cif.ConnectionManager.Connection);
              connectionMgr._connections[ 4 ].should.have.property('hookFunction', 'otherFunc');
            });
          });
      });
      describe('add an internal connection to connecton list', function () {
        beforeEach(function () {
          var constructor = cif.getCompoundComponentElementConstructor('source-elem');
          sourceElem = new constructor();
          sourceElem.setAttribute('runtime-id', 'aSourceRuntimeId');
          destinationElem = document.createElement('destination-elem');
          destinationElem.setAttribute('runtime-id', 'aDestinationRuntimeId');
          sourceElem.appendChild(destinationElem);
          destinationElem.Context.setParent(sourceElem.Context);
          connectionMgr = sourceElem.Context._connectionMgr;
          var con = {
            connectionId: 'con1',
            source: {
              memberId: 'sourceMember',
              component: sourceElem,
              slot: 'slotA'
            },
            destination: {
              memberId: 'destinationMember',
              component: destinationElem,
              slot: 'slotB'
            }

          };
          connectionMgr._connections.push(createTestConnection(con, true));
          con.connectionId = 'con2';
          connectionMgr._connections.push(createTestConnection(con, true));
          con.connectionId = 'otherCon2';
          connectionMgr._connections.push(createTestConnection(con, true));
          con.connectionId = 'otherCon1';
          connectionMgr._connections.push(createTestConnection(con, true));
          connectionMgr._connections.should.have.length(4);
        });
        afterEach(function () {
          connectionMgr = null;
        });
        describe('add a valid connection', function () {
          beforeEach(function () {
            var constructor = cif.getCompoundComponentElementConstructor('other-source-elem');
            var source = new constructor();
            source.setAttribute('runtime-id', 'aSource:RuntimeId');

            var destination = document.createElement('other-destination-elem');
            destination.setAttribute('runtime-id', 'aDestination:RuntimeId');
            source.appendChild(destination);
            connectionMgr = source.Context._connectionMgr;
            conConfig = {
              connectionId: 'dynCon1',
              source: {
                memberId: 'sourceMember',
                component: source,
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: destination,
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
            var con = {
              connectionId: 'con1',
              source: {
                memberId: 'sourceMember',
                component: sourceElem,
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: destinationElem,
                slot: 'slotB'
              }

            };
            connectionMgr._connections.push(createTestConnection(con, true));
            con.connectionId = 'con2';
            connectionMgr._connections.push(createTestConnection(con, true));
            con.connectionId = 'otherCon2';
            connectionMgr._connections.push(createTestConnection(con, true));
            con.connectionId = 'otherCon1';
            connectionMgr._connections.push(createTestConnection(con, true));
            connectionMgr._connections.should.have.length(4);
          });

          afterEach(function () {
            conConfig = null;
          });
          it('the valid connection added to connectionManager._connections', function () {
            connectionMgr.addDynamicConnection(conConfig);
            connectionMgr._connections.should.have.length(5);
            var connection = connectionMgr._connections[ 4 ];
            connection.should.have.property('connectionId', conConfig.connectionId);
            connection.should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
            connection.should.have.property('internal', true);
          });
        });
        describe('add a not valid connection', function () {
          beforeEach(function () {
            conConfig = {
              connectionId: 'dynCon1',
              destination: {
                memberId: 'destinationMember',
                component: document.createElement('destination-element'),
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
          });
          afterEach(function () {
            conConfig = null;
          });
          it('a not valid connection should be not added to connectionManager._connections', function () {
            connectionMgr._connections.should.have.length(4);
            expect(function () {
              connectionMgr.addDynamicConnection(conConfig);
            }).to.throw(Error);
            connectionMgr._connections.should.have.length(4);
          });
        });
        describe('add a connection, connectionId exists as a static connection', function () {
          beforeEach(function () {
            conConfig = {
              connectionId: 'dynCon1',
              source: {
                memberId: 'sourceMember',
                component: document.createElement('source-element'),
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: document.createElement('destination-element'),
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
            var existConnection = connectionMgr._connections[ 2 ];
            conConfig.connectionId = existConnection.connectionId;
          });
          afterEach(function () {
            conConfig = null;
          });
          it('should cause an exception', function () {
            expect(function () {
              connectionMgr.addDynamicConnection(conConfig);
            }).to.throw(Error);
            connectionMgr._connections.should.have.length(4);
          });
        });
        describe('add a connection, source/destination exists as a static connection', function () {
          beforeEach(function () {
            conConfig = {
              source: {
                memberId: 'sourceMember',
                component: sourceElem,
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: destinationElem,
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'
            };
            conConfig.connectionId = window.cubx.dynamicConnectionUtil.generateConnectionId({
              source: {
                runtimeId: sourceElem.getAttribute('runtime-id'),
                slot: conConfig.source.slot
              },
              destination: {
                runtimeId: destinationElem.getAttribute('runtime-id'),
                slot: conConfig.destination.slot
              }
            });
            var existConnection = connectionMgr._connections[ 2 ];
            conConfig.connectionId = existConnection.connectionId;
          });
          afterEach(function () {
            conConfig = null;
          });
          it('should cause an exception', function () {
            connectionMgr._connections.should.have.length(4);
            expect(function () {
              connectionMgr.addDynamicConnection(conConfig);
            }).to.throw(Error);
            connectionMgr._connections.should.have.length(4);
          });
        });
        describe('add a connection, the connectionId exists as a dynamic connection', function () {
          var spy;
          beforeEach(function () {
            var constructor = cif.getCompoundComponentElementConstructor('source-elem');
            var source = new constructor();
            source.setAttribute('runtime-id', 'aSource:RuntimeId');
            var destination = document.createElement('destination-elem');
            destination.setAttribute('runtime-id', 'aDestination:RuntimeId');
            source.appendChild(destination);
            source.Context.addComponent(destination);
            conConfig = {
              connectionId: 'dynCon1',
              source: {
                memberId: 'sourceMember',
                component: source,
                slot: 'slotA'
              },
              destination: {
                memberId: 'destinationMember',
                component: destination,
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'

            };
            connectionMgr._connections.should.have.length(4);
            connectionMgr.addDynamicConnection(conConfig);

            spy = sinon.spy(console, 'error');
          });
          afterEach(function () {
            conConfig = null;
            console.error.restore();
          });
          it('should override the existing connection', function () {
            var conlist = connectionMgr._connections;
            conlist.should.have.length(5);
            conlist[ 4 ].should.nested.property('source.memberId', conConfig.source.memberId);
            conConfig.source.memberId = 'otherMember';
            connectionMgr.addDynamicConnection(conConfig);
            expect(spy.called).to.be.false;
            conlist.should.have.length(5);
            conlist[ 4 ].should.have.property('connectionId', conConfig.connectionId);
            conlist[ 4 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
            conlist[ 4 ].should.nested.property('source.memberId');
            conlist[ 4 ].should.nested.property('source.memberId', conConfig.source.memberId);
          });
        });
        describe('add a connection, the connection source/destination exists as a dynamic connection',
          function () {
            var spy;
            beforeEach(function () {
              var source = document.createElement('source-element');
              var sourceRuntimeId = 'source:runtimeId.sourceMember';
              var destinationRuntimeId = 'destination:runtimeId.destinationMember';
              source.setAttribute('runtime-id', sourceRuntimeId);
              var destination = document.createElement('destination-element');
              destination.setAttribute('runtime-id', destinationRuntimeId);
              source.appendChild(destination);
              source.Context.addComponent(destination);
              conConfig = {
                source: {
                  memberId: 'sourceMember',
                  component: source,
                  slot: 'slotA'
                },
                destination: {
                  memberId: 'destinationMember',
                  component: destination,
                  slot: 'slotB'
                },
                repeatedValues: false,
                copyValue: true,
                hookFunction: 'myFunc'

              };
              conConfig.connectionId = window.cubx.dynamicConnectionUtil.generateConnectionId({
                source: {
                  runtimeId: sourceRuntimeId,
                  slot: conConfig.source.slot
                },
                destination: {
                  runtimeId: destinationRuntimeId,
                  slot: conConfig.destination.slot
                }
              });
              connectionMgr.addDynamicConnection(conConfig);

              spy = sinon.spy(console, 'error');
            });
            afterEach(function () {
              conConfig = null;
              console.error.restore();
            });
            it('should override the existing connection', function () {
              var conlist = connectionMgr._connections;
              conlist.should.have.length(5);
              conlist[ 4 ].should.nested.property('source.memberId', conConfig.source.memberId);
              conConfig.source.memberId = 'otherMember';
              connectionMgr.addDynamicConnection(conConfig);
              expect(spy.called).to.be.false;
              conlist.should.have.length(5);
              conlist[ 4 ].should.have.property('connectionId', conConfig.connectionId);
              conlist[ 4 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
              conlist[ 4 ].should.nested.property('source.memberId');
              conlist[ 4 ].should.nested.property('source.memberId', conConfig.source.memberId);
            });
          });
      });
    });
    describe('#_findSameConnection', function () {
      var connectionList;
      var source;
      var destination;
      var con1;
      var con2;
      var con3;
      var con4;
      var connectionManager;
      var context;
      beforeEach(function () {
        source = document.createElement('my-source');
        destination = document.createElement('my-dest');
        connectionList = [];
        con1 = {
          connectionId: 'con1',
          source: {
            component: source,
            memberId: 'member1',
            slot: 'slotA'
          },
          destination: {
            component: destination,
            memberId: 'member2',
            slot: 'slotB'
          }
        };
        connectionList.push(con1);
        con2 = {
          connectionId: 'con2',
          source: {
            component: source,
            memberId: 'member1',
            slot: 'slotC'
          },
          destination: {
            component: destination,
            memberId: 'member2',
            slot: 'slotD'
          }
        };
        connectionList.push(con2);
        con3 = {
          connectionId: con3,
          source: {
            component: source,
            memberId: 'member1',
            slot: 'slotE'
          },
          destination: {
            component: destination,
            memberId: 'member2',
            slot: 'slotF'
          }
        };
        con4 = {
          connectionId: 'con4',
          source: {
            component: source,
            memberId: 'member1',
            slot: 'slotG'
          },
          destination: {
            component: destination,
            memberId: 'member2',
            slot: 'slotH'
          }
        };
        context = new window.cubx.cif.Context(cif.getCRCRootNode());
        connectionManager = new window.cubx.cif.ConnectionManager(context);
      });
      afterEach(function () {
        connectionList = null;
        connectionManager = null;
        context = null;
        con1 = null;
        con2 = null;
        con3 = null;
        con4 = null;
      });
      it('should find con1', function () {
        var foundCon = connectionManager._findSameConnection(connectionList, con1);
        expect(foundCon).to.be.exist;
        foundCon.should.be.an('object');
        foundCon.should.be.eql;
      });
      it('should find con2', function () {
        var foundCon = connectionManager._findSameConnection(connectionList, con2);
        expect(foundCon).to.be.exist;
        foundCon.should.be.an('object');
        foundCon.source.should.eql(con2.source);
        foundCon.destination.should.eql(con2.destination);
      });
      it('should not find con3', function () {
        var foundCon = connectionManager._findSameConnection(connectionList, con3);
        expect(foundCon).to.be.not.exist;
      });
      it('should not find con4', function () {
        var foundCon = connectionManager._findSameConnection(connectionList, con4);
        expect(foundCon).to.be.not.exist;
      });
    });
    describe('#removeDynamicConnection', function () {
      var connectionMgr;
      var conConfig;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('parent-elem');
        var parentElem = new constructor();

        var sourceElem = document.createElement('source-elem');
        var destinationElem = document.createElement('destination-elem');
        connectionMgr = parentElem.Context._connectionMgr;
        var con = {
          connectionId: 'con1',
          source: {
            memberId: 'sourceMember',
            component: sourceElem,
            slot: 'slotA'
          },
          destination: {
            memberId: 'destinationMember',
            component: destinationElem,
            slot: 'slotB'
          }

        };
        connectionMgr._connections.push(createTestConnection(con, true));
        con.connectionId = 'con2';
        connectionMgr._connections.push(createTestConnection(con, true));
        con.connectionId = 'otherCon2';
        connectionMgr._connections.push(createTestConnection(con, true));
        con.connectionId = 'otherCon1';
        connectionMgr._connections.push(createTestConnection(con, true));
        connectionMgr._connections.should.have.length(4);
      });
      afterEach(function () {
        connectionMgr = null;
      });
      describe('remove a dynamic connection', function () {
        beforeEach(function () {
          conConfig = {
            connectionId: 'dynCon1',
            source: {
              memberId: 'sourceMember',
              component: document.createElement('source-element'),
              slot: 'slotA'
            },
            destination: {
              memberId: 'destinationMember',
              component: document.createElement('destination-element'),
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc'

          };
          connectionMgr.addDynamicConnection(conConfig);
          connectionMgr._connections.should.have.length(5);
        });
        it('after remove should not longer contains in connection list ', function () {
          connectionMgr.removeDynamicConnection('dynCon1');
          connectionMgr._connections.should.have.length(4);
        });
        it('should be cause an error message, if the connection not exists', function () {
          expect(function () {
            connectionMgr.removeDynamicConnection('xxx');
          }).to.throw(Error);
          connectionMgr._connections.should.have.length(5);
        });
      });
      describe('try to remove a static connection', function () {
        it('should be cause an error', function () {
          expect(function () {
            connectionMgr.removeDynamicConnection('con2');
          }).to.throw(Error);
          connectionMgr._connections.should.have.length(4);
        });
      });
      describe('try to remove an non existent connection', function () {
        it('should be cause an error', function () {
          expect(function () {
            connectionMgr.removeDynamicConnection('xxx');
          }).to.throw(Error);
          connectionMgr._connections.should.have.length(4);
        });
      });
    });
    describe('#_dynamicConnectionToConnection', function () {
      var connectionMgr;

      var conConfig;
      describe('connection for sibling elements', function () {
        beforeEach(function () {
          var constructor = cif.getCompoundComponentElementConstructor('parent-elem');
          var parentElem = new constructor();
          connectionMgr = parentElem.Context._connectionMgr;
          conConfig = {
            connectionId: 'con1',
            source: {
              memberId: 'sourceMember',
              component: document.createElement('source-element'),
              slot: 'slotA'
            },
            destination: {
              memberId: 'destinationMember',
              component: document.createElement('destination-element'),
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc'

          };
        });

        it('should get a ConnectionManage.Connection object.', function () {
          conConfig.should.not.instanceOf(window.cubx.cif.ConnectionManager.Connection);
          var connection = connectionMgr._dynamicConnectionToConnection(conConfig);
          connection.should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
        });
        it('should have a same properties as the parameter object', function () {
          var connection = connectionMgr._dynamicConnectionToConnection(conConfig);
          connection.should.have.nested.property('connectionId', conConfig.connectionId);
          connection.should.have.nested.property('source', conConfig.source);
          connection.should.have.nested.property('destination', conConfig.destination);
          connection.should.have.nested.property('repeatedValues', conConfig.repeatedValues);
          connection.should.have.nested.property('copyValue', conConfig.copyValue);
          connection.should.have.nested.property('hookFunction', conConfig.hookFunction);
          connection.should.have.nested.property('internal', false);
        });
      });
      describe('internal connection', function () {
        beforeEach(function () {
          var constructor = cif.getCompoundComponentElementConstructor('parent-elem');
          var parentElem = new constructor();
          connectionMgr = parentElem.Context._connectionMgr;
          conConfig = {
            connectionId: 'con1',
            source: {
              memberId: 'sourceMember',
              component: parentElem,
              slot: 'slotA'
            },
            destination: {
              memberId: 'destinationMember',
              component: document.createElement('destination-element'),
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc'

          };
        });

        it('should get a ConnectionManage.Connection object.', function () {
          conConfig.should.not.instanceOf(window.cubx.cif.ConnectionManager.Connection);
          var connection = connectionMgr._dynamicConnectionToConnection(conConfig);
          connection.should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
        });
        it('should have a same properties as the parameter object', function () {
          var connection = connectionMgr._dynamicConnectionToConnection(conConfig);
          connection.should.have.nested.property('connectionId', conConfig.connectionId);
          connection.should.have.nested.property('source', conConfig.source);
          connection.should.have.nested.property('destination', conConfig.destination);
          connection.should.have.nested.property('repeatedValues', conConfig.repeatedValues);
          connection.should.have.nested.property('copyValue', conConfig.copyValue);
          connection.should.have.nested.property('hookFunction', conConfig.hookFunction);
          connection.should.have.nested.property('internal', true);
        });
      });
    });
    describe('#_findConnectionIndex', function () {
      // return _.findIndex(this._connections, 'connectionId', connectionId);
      var connectionMgr;

      beforeEach(function () {
        // create connectionliste
        connectionMgr = new window.cubx.cif.ConnectionManager();
        var sourceElem = document.createElement('source-elem');
        var destinationElem = document.createElement('destination-elem');
        var con = {
          connectionId: 'con1',
          source: {
            memberId: 'sourceMember',
            component: sourceElem,
            slot: 'slotA'
          },
          destination: {
            memberId: 'destinationMember',
            component: destinationElem,
            slot: 'slotB'
          }
        };
        connectionMgr._connections.push(createTestConnection(con, true));
        con.connectionId = 'con2';
        connectionMgr._connections.push(createTestConnection(con, true));
        con.connectionId = 'otherCon2';
        connectionMgr._connections.push(createTestConnection(con, true));
        con.connectionId = 'otherCon1';
        connectionMgr._connections.push(createTestConnection(con, true));
        connectionMgr._connections.should.have.length(4);
      });
      afterEach(function () {
        connectionMgr = null;
      });
      it('should get index=1 for connectionId "con2"', function () {
        var index = connectionMgr._findConnectionIndex(connectionMgr._connections, 'con2');
        expect(index).to.be.equal(1);
      });
      it('should get index=3 for connectionId "otherCon1"', function () {
        var index = connectionMgr._findConnectionIndex(connectionMgr._connections, 'otherCon1');
        expect(index).to.be.equal(3);
      });
      it('should get index=-1 for not existin connectionId', function () {
        var index = connectionMgr._findConnectionIndex(connectionMgr._connections, 'xxx');
        expect(index).to.be.equal(-1);
      });
    });
  });
});
