/* globals _, XMLHttpRequest */
'use strict';
describe('ConnectionManager', function () {
  describe('processConnection', function () {
    var cif;
    before(function () {
      cif = window.cubx.cif.cif;
    });
    describe('#processConnections', function () {
      var connections;

      var element;
      var connectionMgr;
      var payloadObj;
      var _processConnectionStub;
      var comp1;
      var comp2;
      var comp3;
      var comp4;
      beforeEach(function () {
        comp1 = document.createElement('comp1');
        comp2 = document.createElement('comp2');
        comp3 = document.createElement('comp3');
        comp4 = document.createElement('comp4');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
        element = new constructor();
        connectionMgr = element.Context._connectionMgr;
        payloadObj = {
          payload: '{}',
          slot: 'firsttestoutput'
        };
        _processConnectionStub = sinon.stub(connectionMgr, '_processConnection').callsFake(function () {
          //  do nothing
        });
      });
      afterEach(function () {
        connectionMgr._processConnection.restore();
        element = null;
        connectionMgr = null;
        payloadObj = null;
      });
      describe('process connections', function () {
        beforeEach(function () {
          connections = [
            {
              connectionId: '1:firsttestoutput-2:firsttestinput',
              source: {
                component: comp1,
                memberId: '1',
                slot: 'firsttestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'firsttestinput'
              }

            },
            {
              connectionId: '1:secondtestoutput-2:secondtestinput',
              source: {
                component: comp1,
                memberId: 1,
                slot: 'secondtestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'secondtestinput'
              }
            },
            {
              connectionId: '1:thirdtestoutput-2:thirdtestinput',
              source: {
                component: comp3,
                memberId: 1,
                slot: 'thirdtestoutput'
              },
              destination: {
                component: comp4,
                memberId: 2,
                slot: 'thirdtestinput'
              }
            }
          ];

          connectionMgr._connections = connections;
          connectionMgr.processConnections(connections[ 0 ].source.component, payloadObj);
        });
        afterEach(function () {
        });
        it('_processConnection called once', function () {
          _processConnectionStub.should.calledOnce;
        });
        it('_processConnection called with Args connections[0] and  payloadObj', function () {
          _processConnectionStub.should.calledWithExactly(connections[ 0 ], payloadObj);
        });
      });
      describe('not process deactivated connections', function () {
        beforeEach(function () {
          connections = [
            {
              connectionId: '1:firsttestoutput-2:firsttestinput',
              deactivated: true,
              source: {
                component: comp1,
                memberId: '1',
                slot: 'firsttestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'firsttestinput'
              }

            },
            {
              connectionId: '1:secondtestoutput-2:secondtestinput',
              source: {
                component: comp1,
                memberId: 1,
                slot: 'secondtestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'secondtestinput'
              }
            },
            {
              connectionId: '1:thirdtestoutput-2:thirdtestinput',
              source: {
                component: comp3,
                memberId: 1,
                slot: 'thirdtestoutput'
              },
              destination: {
                component: comp4,
                memberId: 2,
                slot: 'thirdtestinput'
              }
            }
          ];

          connectionMgr._connections = connections;
          connectionMgr.processConnections(connections[ 0 ].source.component, payloadObj);
        });
        afterEach(function () {
        });
        it('_processConnection not called', function () {
          _processConnectionStub.should.not.called;
        });
      });
    });
    describe('#processInternalConnections', function () {
      var connections;
      var element;
      var connectionMgr;
      var payloadObj;
      var _processConnectionStub;
      var comp1;
      var comp2;
      var comp3;
      var comp4;

      beforeEach(function () {
        comp1 = document.createElement('comp1');
        comp2 = document.createElement('comp2');
        comp3 = document.createElement('comp3');
        comp4 = document.createElement('comp4');

        var constructor = cif.getCompoundComponentElementConstructor('ciftest-connectionmgr-test');
        element = new constructor();

        connectionMgr = element.Context._connectionMgr;
        payloadObj = {
          payload: '{}',
          slot: 'firsttestoutput'
        };
        _processConnectionStub = sinon.stub(connectionMgr, '_processConnection').callsFake(function () {
          //  do nothing
        });
      });
      afterEach(function () {
        connectionMgr._processConnection.restore();
        connectionMgr = null;
        comp1 = null;
        comp2 = null;
        comp3 = null;
        comp4 = null;
      });
      describe('process internal connection', function () {
        beforeEach(function () {
          connections = [
            {
              connectionId: '1:firsttestoutput-2:firsttestoutput',
              source: {
                component: comp1,
                memberId: '1',
                slot: 'firsttestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'firsttestinput'
              },
              internal: true
            },
            {
              connectionId: '1:secondtestoutput-2:secondtestinput',
              source: {
                component: comp1,
                memberId: '1',
                slot: 'secondtestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'secondtestinput'
              },
              internal: true
            },
            {
              connectionId: '1:thirdtestoutput-2:thirdtestinput',
              source: {
                component: comp3,
                memberId: '1',
                slot: 'thirdtestoutput'
              },
              destination: {
                component: comp4,
                memberId: '2',
                slot: 'thirdtestinput'
              },
              internal: true
            }
          ];
          connectionMgr._connections = connections;
          connectionMgr.processInternalConnections(connections[ 0 ].source.slot, payloadObj);
        });
        afterEach(function () {
          connections = null;
        });
        it('_processConnection called once', function () {
          _processConnectionStub.should.be.calledOnce;
        });
        it('_processConnection called with Args connections[0] and  payloadObj', function () {
          _processConnectionStub.should.be.calledWithExactly(connections[ 0 ], payloadObj);
        });
      });
      describe('not process dactivated internal connection', function () {
        beforeEach(function () {
          connections = [
            {
              connectionId: '1:firsttestoutput-2:firsttestoutput',
              deactivated: true,
              source: {
                component: comp1,
                memberId: '1',
                slot: 'firsttestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'firsttestinput'
              },
              internal: true
            },
            {
              connectionId: '1:secondtestoutput-2:secondtestinput',
              source: {
                component: comp1,
                memberId: '1',
                slot: 'secondtestoutput'
              },
              destination: {
                component: comp2,
                memberId: '2',
                slot: 'secondtestinput'
              },
              internal: true
            },
            {
              connectionId: '1:thirdtestoutput-2:thirdtestinput',
              source: {
                component: comp3,
                memberId: '1',
                slot: 'thirdtestoutput'
              },
              destination: {
                component: comp4,
                memberId: '2',
                slot: 'thirdtestinput'
              },
              internal: true
            }
          ];
          connectionMgr._connections = connections;
          connectionMgr.processInternalConnections(connections[ 0 ].source.slot, payloadObj);
        });
        afterEach(function () {
          connections = [];
        });
        it('_processConnection called once', function () {
          _processConnectionStub.should.be.not.called;
        });
      });
    });
    describe('#_processConnection', function () {
      //  interne output connection
      describe('for valid internal outgoing connection', function () {
        var connection;
        var payloadObj;
        var connectionManager;
        var stubSetInputSlot;
        var spyFireModelChangeEvent;
        var spyFireSlotChangedEvent;
        var comp2;
        beforeEach(function () {
          var artifactId1 = 'source-comp1-element';
          var artifactId2 = 'source-comp2-element';
          var manifestComp1 = {
            webpackageId: 'test.' + artifactId1 + '@0.1.0',
            artifactId: artifactId1,
            artifactType: 'compoundComponent',
            slots: [
              {
                slotId: 'firsttestoutput',
                type: 'string',
                direction: [ 'output' ]
              }
            ]

          };
          var manifestComp2 = {
            webpackageId: 'test.' + artifactId2 + '@0.1.0',
            artifactId: artifactId2,
            artifactType: 'compoundComponent',
            slots: [
              {
                slotId: 'firsttestoutput',
                type: 'string',
                direction: [ 'output' ]
              }
            ]

          };
          sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
            var manifest;
            switch (key) {
              case artifactId1:
                manifest = manifestComp1;
                break;
              case artifactId2:
                manifest = manifestComp2;
                break;
              default:
                manifest = {
                  artifactType: 'compoundComponent'
                };
            }
            return manifest;
          });

          var constructor = cif.getCompoundComponentElementConstructor(artifactId1);
          var comp1 = new constructor();
          constructor = cif.getCompoundComponentElementConstructor('source-comp2-element');
          comp2 = new constructor();
          comp2.setAttribute('runtime-id', 'test.' + artifactId2 + '@0.1.0');
          comp2.appendChild(comp1);
          comp1.Context.setParent(comp2.Context);
          stubSetInputSlot = sinon.stub(comp2, 'setInputSlot').callsFake(function (slot, payoad) {
            //  do nothing
          });
          comp2.fireModelChangeEvent = function (payloadObject) {
            //  do nothing;
          };
          //  connection
          //  payload
          connection = {
            source: {
              component: comp1,
              memberId: 1,
              slot: 'firsttestoutput'
            },
            destination: {
              component: comp2,
              memberId: 'parent',
              slot: 'firsttestoutput'
            }
          };
          payloadObj = {
            payload: '"string"',
            slot: 'firsttestoutput'
          };
          spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
          spyFireSlotChangedEvent = sinon.spy(comp2, 'fireSlotChangedEvent');
          //  var context = new window.cubx.cif.Context(comp2);
          connectionManager = comp2.Context._connectionMgr;
          connectionManager._processConnection(connection, payloadObj);
        });
        afterEach(function () {
          comp2.setInputSlot.restore();
          comp2.fireModelChangeEvent.restore();
          comp2.fireSlotChangedEvent.restore();
          window.cubx.CRC.getCache().getComponentCacheEntry.restore();
        });
        it('comp2.setInputSlot should be not called', function () {
          stubSetInputSlot.should.been.not.called;
        });
        it('comp2.fireModelChangeEvent should be called once', function () {
          expect(spyFireModelChangeEvent.calledOnce).to.be.true;
        });
        it('comp2.fireModelChangeEvent should be called with the correct payloadObj (slot, payload,',
          function () {
            expect(
              spyFireModelChangeEvent.calledWith(sinon.match.has('slot', 'firsttestoutput'))).to.be.true;
            expect(spyFireModelChangeEvent.calledWith(sinon.match.has('payload', '"string"'))).to.be.true;
          });
        it('comp2.fireSlotChangedEvent should be called once', function () {
          expect(spyFireSlotChangedEvent.calledOnce).to.be.true;
        });
        it('propagated value is saved in connection.lastValue Attribute', function () {
          connection.should.have.property('lastValue', payloadObj.payload);
        });
        it('payload object has no attribute "connectionHook"', function () {
          payloadObj.should.not.have.property('connectionHook');
        });
      });
      describe('for valid internal outgoing connection with connection hookFunction', function () {
        var connection;
        var payloadObj;
        var connectionManager;
        var stubSetInputSlot;
        var spyFireModelChangeEvent;
        var comp2;
        var testSpy;
        beforeEach(function () {
          var artifactId1 = 'source-comp1-element';
          var artifactId2 = 'source-comp2-element';
          var manifestComp1 = {
            webpackageId: 'test.' + artifactId1 + '@0.1.0',
            artifactId: artifactId1,
            artifactType: 'compoundComponent',
            slots: [
              {
                slotId: 'firsttestoutput',
                type: 'string',
                direction: [ 'output' ]
              }
            ]

          };
          var manifestComp2 = {
            webpackageId: 'test.' + artifactId2 + '@0.1.0',
            artifactId: artifactId2,
            artifactType: 'compoundComponent',
            slots: [
              {
                slotId: 'firsttestoutput',
                type: 'string',
                direction: [ 'output' ]
              }
            ]

          };
          sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
            var manifest;
            switch (key) {
              case artifactId1:
                manifest = manifestComp1;
                break;
              case artifactId2:
                manifest = manifestComp2;
                break;
              default:
                manifest = {
                  artifactType: 'compoundComponent'
                };
            }
            return manifest;
          });
          var constructor = cif.getCompoundComponentElementConstructor(artifactId1);
          var comp1 = new constructor();
          constructor = cif.getCompoundComponentElementConstructor('source-comp2-element');
          comp2 = new constructor();
          comp2.setAttribute('runtime-id', 'test.' + artifactId2 + '@0.1.0');
          comp2.appendChild(comp1);
          comp1.Context.setParent(comp2.Context);

          stubSetInputSlot = sinon.stub(comp2, 'setInputSlot').callsFake(function (slot, pyoad) {
            //  do nothing
          });
          comp2.fireModelChangeEvent = function (payloadObject) {
            //  do nothing;
          };
          window.myTestFunction = function (value, next) {
            next(value);
          };

          testSpy = sinon.spy(window, 'myTestFunction');
          //  connection
          //  payload
          connection = {
            source: {
              component: comp1,
              memberId: 1,
              slot: 'firsttestoutput'
            },
            destination: {
              component: comp2,
              memberId: 'parent',
              slot: 'firsttestoutput'
            },
            hookFunction: 'myTestFunction'

          };
          payloadObj = {
            payload: '"string"',
            slot: 'firsttestoutput'
          };
          spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');

          connectionManager = comp2.Context._connectionMgr;
          connectionManager._processConnection(connection, payloadObj);
        });
        afterEach(function () {
          comp2.setInputSlot.restore();
          comp2.fireModelChangeEvent.restore();
          window.cubx.CRC.getCache().getComponentCacheEntry.restore();
          window.myTestFunction.restore();
        });
        it('comp2.setInputSlot should be not called', function () {
          stubSetInputSlot.should.have.been.not.called;
        });
        it('comp2.fireModelChangeEvent should be called once', function (done) {
          setTimeout(function () {
            spyFireModelChangeEvent.should.have.been.calledOnce;
            done();
          }, 50);
        });
        it('the hookFunction should be called', function () {
          testSpy.should.be.calledOnce;
        });
        it('comp2.fireModelChangeEvent should be called with the correct payloadObj (slot, payload,' +
          ' and hookFunction ', function (done) {
          setTimeout(function () {
            expect(spyFireModelChangeEvent.calledWith(sinon.match.has('slot', 'firsttestoutput'))).to.be.true;
            expect(spyFireModelChangeEvent.calledWith(sinon.match.has('payload', '"string"'))).to.be.true;
            expect(spyFireModelChangeEvent.calledWith(
              sinon.match.has('connectionHook', undefined))).to.be.true;
            done();
          }, 50);
        });
        it('propagated value is saved in connection.lastValue Attribute', function () {
          connection.should.have.property('lastValue', payloadObj.payload);
        });
      });
      describe('for not valid connection', function () {
        var connection;
        var payloadObj;
        var connectionManager;
        var spySetInputSlot;
        var spyFireModelChangeEvent;
        var comp2;
        beforeEach(function () {
          var comp1 = document.createElement('comp1');

          comp2 = document.createElement('comp2');
          comp2.setAttribute('runtime-id', 'comp2');
          comp2.isInputSlot = function (slot) {
            return false;
          };
          comp2.setInputSlot = function (slot, value) {
            //  do nothing
          };
          comp2.fireModelChangeEvent = function (payloadObject) {
            //  do nothing;
          };
          //  connection
          //  payload
          connection = {
            source: {
              component: comp1,
              memberId: 1,
              slot: 'firsttestoutput'
            },
            destination: {
              component: comp2,
              memberId: 2,
              slot: 'firsttestinput'
            }
          };
          payloadObj = {
            payload: 'string',
            slot: 'firsttestoutput'
          };

          spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
          spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
          var context = new window.cubx.cif.Context(document.createElement('element'));
          connectionManager = new window.cubx.cif.ConnectionManager(context);
          connectionManager._processConnection(connection, payloadObj);
        });
        afterEach(function () {
          comp2.setInputSlot.restore();
          comp2.fireModelChangeEvent.restore();
        });
        it('comp2.setInputSlot should not call setInputSlot', function () {
          expect(spySetInputSlot.called).to.be.false;
        });
        it('comp2.fireModelChangeEvent should be not called', function () {
          expect(spyFireModelChangeEvent.called).to.be.false;
        });
      });
      describe('for valid connection', function () {
        describe('copyValue attribute tests', function () {
          describe('copyValue not explizit configured (typeof payload === object', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var spySetInputSlot;
            var spyFireModelChangeEvent;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = { foo: 'bar' };
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).not.ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                }

              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
              spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });

            afterEach(function () {
              comp2.setInputSlot.restore();
              comp2.fireModelChangeEvent.restore();
            });
            it('comp2.setInputSlot should be called once', function () {
              expect(spySetInputSlot.calledOnce).to.be.true;
            });

            it('comp2.setInputSlot should be called  with arguments connection.destination.slot payloadObj',
              function () {
                expect(
                  spySetInputSlot.calledWithExactly(connection.destination.slot,
                    payloadObj)).to.be.true;
              });

            it('comp2.fireModelChangeEvent should be not called', function () {
              expect(spyFireModelChangeEvent.called).to.be.false;
            });

            it('propagated value is saved in connection.lastValue Attribute', function () {
              expect(connection.lastValue).to.be.deep.equal(payloadObj.payload);
            });
          });
          describe('copyValue not explizit configured (typeof payload === string)', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var spySetInputSlot;
            var spyFireModelChangeEvent;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = 'a string';
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                }
              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
              spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });
            afterEach(function () {
              comp2.setInputSlot.restore();
              comp2.fireModelChangeEvent.restore();
            });

            it('comp2.setInputSlot should be called once', function () {
              expect(spySetInputSlot.calledOnce).to.be.true;
            });

            it('comp2.setInputSlot should be called  with arguments connection.destination.slot payloadObj',
              function () {
                expect(
                  spySetInputSlot.calledWithExactly(connection.destination.slot,
                    payloadObj)).to.be.true;
              });

            it('comp2.fireModelChangeEvent should be not called', function () {
              expect(spyFireModelChangeEvent.called).to.be.false;
            });
            it('propagated value is saved in connection.lastValue Attribute', function () {
              connection.should.have.property('lastValue', payloadObj.payload);
            });
          });
          describe('copyValue is true (typeof payload === string', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var spySetInputSlot;
            var spyFireModelChangeEvent;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = 'a string';
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                copyValue: true
              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
              spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });
            afterEach(function () {
              comp2.setInputSlot.restore();
              comp2.fireModelChangeEvent.restore();
            });

            it('comp2.setInputSlot should be called once', function () {
              expect(spySetInputSlot.calledOnce).to.be.true;
            });
            it('comp2.setInputSlot should be called  with arguments connection.destination.slot payloadObj',
              function () {
                expect(
                  spySetInputSlot.calledWithExactly(connection.destination.slot,
                    payloadObj)).to.be.true;
              });
            it('comp2.fireModelChangeEvent should be not called', function () {
              expect(spyFireModelChangeEvent.called).to.be.false;
            });
            it('propagated value is saved in connection.lastValue Attribute', function () {
              connection.should.have.property('lastValue', payloadObj.payload);
            });
          });
          describe('copyValue is true (typeof payload === object', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var spySetInputSlot;
            var spyFireModelChangeEvent;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = { foo: 'bar' };
              var comp1 = document.createElement('comp1');
              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                //  do nothing;
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                //  do nothing
                expect(value.payload === payload).not.ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
              };
              //  connection
              //  payload
              connection = {
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                copyValue: true

              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
              spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });
            afterEach(function () {
              comp2.setInputSlot.restore();
              comp2.fireModelChangeEvent.restore();
            });

            it('comp2.setInputSlot should be called once', function () {
              expect(spySetInputSlot.calledOnce).to.be.true;
            });
            it('comp2.setInputSlot should be called  with arguments connection.destination.slot payloadObj',
              function () {
                expect(
                  spySetInputSlot.calledWith(connection.destination.slot,
                    sinon.match.has('slot', 'firsttestoutput'))).to.be.true;
                expect(
                  spySetInputSlot.calledWith(connection.destination.slot,
                    sinon.match.has('payload', payload))).to.be.true;
              });
            it('comp2.fireModelChangeEvent should be not called', function () {
              expect(spyFireModelChangeEvent.called).to.be.false;
            });
            it('propagated value is saved in connection.lastValue Attribute', function () {
              expect(connection.lastValue).to.be.deep.equal(payloadObj.payload);
            });
          });
          describe('copyValue is true (payload not serializable)', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var payload;
            var spyConsole;
            var comp2;
            var handlePayloadSpy;
            beforeEach(function () {
              payload = new XMLHttpRequest();
              var comp1 = document.createElement('comp1');
              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) { return true; };
              comp2.setInputSlot = function (slot, value) {};
              comp2.fireModelChangeEvent = function (payloadObject) {};
              connection = {
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                copyValue: true

              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              handlePayloadSpy = sinon.spy(connectionManager, '_handlePayload');
              spyConsole = sinon.spy(console, 'warn');
            });
            afterEach(function () {
              spyConsole.restore();
              handlePayloadSpy.restore();
            });
            it('copyValue should should not be changed, user should be warned', function () {
              connectionManager._processConnection(connection, payloadObj);
              return Promise.all([
                expect(handlePayloadSpy).to.be.calledWith(sinon.match.any, true),
                expect(spyConsole).to.be.calledOnce
              ]);
            });
          });
          describe('copyValue is false (typeof payload === string', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var spySetInputSlot;
            var spyFireModelChangeEvent;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = 'a string';
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                copyValue: false

              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
              spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });
            afterEach(function () {
              comp2.setInputSlot.restore();
              comp2.fireModelChangeEvent.restore();
            });

            it('comp2.setInputSlot should be called once', function () {
              expect(spySetInputSlot.calledOnce).to.be.true;
            });
            it('comp2.setInputSlot should be called  with arguments connection.destination.slot payloadObj',
              function () {
                expect(
                  spySetInputSlot.calledWithExactly(connection.destination.slot,
                    payloadObj)).to.be.true;
              });
            it('comp2.fireModelChangeEvent should be not called', function () {
              expect(spyFireModelChangeEvent.called).to.be.false;
            });
            it('propagated value is saved in connection.lastValue Attribute', function () {
              connection.should.have.property('lastValue', payloadObj.payload);
            });
          });
          describe('copyValue is false (typeof payload === object', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var spySetInputSlot;
            var spyFireModelChangeEvent;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = { foo: 'bar' };
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                copyValue: false
              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
              spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });
            afterEach(function () {
              comp2.setInputSlot.restore();
              comp2.fireModelChangeEvent.restore();
            });
            it('comp2.setInputSlot should be called once', function () {
              expect(spySetInputSlot.calledOnce).to.be.true;
            });
            it('comp2.setInputSlot should be called  with arguments connection.destination.slot payloadObj',
              function () {
                expect(
                  spySetInputSlot.calledWithExactly(connection.destination.slot,
                    payloadObj)).to.be.true;
              });
            it('comp2.fireModelChangeEvent should be not called', function () {
              expect(spyFireModelChangeEvent.called).to.be.false;
            });
            it('propagated value is saved in connection.lastValue Attribute', function () {
              connection.should.have.property('lastValue', payloadObj.payload);
            });
          });
        });
        describe('repeatedValue attribute tests', function () {
          describe('for repeatedValue = false or absent', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = 'a string';
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                connectionId: 'test-connection-3',
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                repeatedValues: false
              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });

            describe('not propagate for the same value', function () {
              var consoleInfoSpy;
              var spySetInputSlot;
              beforeEach(function () {
                spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
                consoleInfoSpy = sinon.spy(console, 'info');
                connectionManager._processConnection(connection, payloadObj);
              });
              afterEach(function () {
                comp2.setInputSlot.restore();
                console.info.restore();
              });

              it('comp2.setInputSlot should be not called', function () {
                expect(spySetInputSlot.called).to.be.false;
              });

              it('info about the aborting propaggtion should be logged to the console', function () {
                expect(consoleInfoSpy.calledOnce).to.be.true;
                expect(consoleInfoSpy.calledWithMatch(connection.connectionId)).to.be.true;
              });
            });
            describe('propagate for a new  value', function () {
              var consoleInfoSpy;
              var spySetInputSlot;

              beforeEach(function () {
                payload = 'new string';
                spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
                consoleInfoSpy = sinon.spy(console, 'info');
                payloadObj = {
                  payload: payload,
                  slot: 'firsttestoutput'
                };
                connectionManager._processConnection(connection, payloadObj);
              });
              afterEach(function () {
                comp2.setInputSlot.restore();
                console.info.restore();
              });

              it('comp2.setInputSlot should be called once', function () {
                expect(spySetInputSlot.calledOnce).to.be.true;
              });

              it('should be nothing logged to the console', function () {
                expect(consoleInfoSpy.called).to.be.false;
              });
            });
          });
          describe('for repeatedValue = true', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = 'a string';
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                connectionId: 'test-connection-3',
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                repeatedValues: true
              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });

            describe('not propagate for the same value', function () {
              var consoleInfoSpy;
              var spySetInputSlot;
              beforeEach(function () {
                spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
                consoleInfoSpy = sinon.spy(console, 'info');
                connectionManager._processConnection(connection, payloadObj);
              });
              afterEach(function () {
                comp2.setInputSlot.restore();
                console.info.restore();
              });

              it('comp2.setInputSlot should be called', function () {
                expect(spySetInputSlot.calledOnce).to.be.true;
              });

              it('should be nothing logged to the console', function () {
                expect(consoleInfoSpy.called).to.be.false;
              });
            });
          });
        });
        describe('hookFunction attribute tests', function () {
          describe('with hookFunction', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var payload;
            var comp2;
            var spySetInputSlot;
            beforeEach(function () {
              payload = 'a string';
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                connectionId: 'test-connection-3',
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                hookFunction: 'test'
              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              spySetInputSlot = sinon.spy(comp2, 'setInputSlot');
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });
            it('setInputSlot schould called with 2 arguments and second argument should contains the' +
              ' connectionHook attribute', function () {
              expect(spySetInputSlot.calledOnce).to.be.true;
              expect(spySetInputSlot.calledWith(connection.destination.slot,
                sinon.match.has('connectionHook', 'test'))).to.be.true;
            });
          });
          describe('without hookFunction', function () {
            var connection;
            var payloadObj;
            var connectionManager;
            var payload;
            var comp2;
            beforeEach(function () {
              payload = 'a string';
              var comp1 = document.createElement('comp1');

              comp2 = document.createElement('comp2');
              comp2.setAttribute('runtime-id', 'comp2');
              comp2.isInputSlot = function (slot) {
                return true;
              };
              comp2.setInputSlot = function (slot, value) {
                expect(value.payload === payload).ok;
              };
              comp2.fireModelChangeEvent = function (payloadObject) {
                //  do nothing;
              };
              //  connection
              //  payload
              connection = {
                connectionId: 'test-connection-3',
                source: {
                  component: comp1,
                  memberId: 1,
                  slot: 'firsttestoutput'
                },
                destination: {
                  component: comp2,
                  memberId: 2,
                  slot: 'firsttestinput'
                },
                hookFunction: null
              };
              payloadObj = {
                payload: payload,
                slot: 'firsttestoutput'
              };
              var context = new window.cubx.cif.Context(document.createElement('element'));
              connectionManager = new window.cubx.cif.ConnectionManager(context);
              connectionManager._processConnection(connection, payloadObj);
            });
            it('payloadObj schould not have an attribute connectionHook', function () {
              payloadObj.should.not.have.property('connectionHook');
            });
          });
        });
      });
      describe('for valid internal incomming connection with connection hookFunction', function () {
        var connection;
        var payloadObj;
        var connectionManager;
        /* eslint-disable no-unused-vars */
        var stubIsInputSlot;
        /* eslint-enable no-unused-vars */
        var stubSetInputSlot;
        var spyFireModelChangeEvent;
        var comp2;
        beforeEach(function () {
          var constructor = cif.getCompoundComponentElementConstructor('source-comp1-element');
          var comp1 = new constructor();
          constructor = cif.getCompoundComponentElementConstructor('source-comp2-element');
          comp2 = new constructor();

          comp2.setAttribute('runtime-id', 'source-comp2-element');
          stubIsInputSlot = sinon.stub(comp2, 'isInputSlot').callsFake(function (slot) {
            return true;
          });
          comp1.appendChild(comp2);
          comp2.Context.setParent(comp1.Context);
          stubSetInputSlot = sinon.stub(comp2, 'setInputSlot').callsFake(function (slot, pyoad) {
            //  do nothing
          });
          comp2.fireModelChangeEvent = function (payloadObject) {
            //  do nothing;
          };
          //  connection
          //  payload
          connection = {
            source: {
              component: comp1,
              memberId: 'self',
              slot: 'firsttestoutput'
            },
            destination: {
              component: comp2,
              memberId: 2,
              slot: 'firsttestinput'
            },
            hookFunction: 'test',
            internal: true

          };
          payloadObj = {
            payload: '"string"',
            slot: 'firsttestoutput'
          };
          spyFireModelChangeEvent = sinon.spy(comp2, 'fireModelChangeEvent');

          connectionManager = comp1.Context._connectionMgr;
          connectionManager._processConnection(connection, payloadObj);
        });
        afterEach(function () {
          comp2.setInputSlot.restore();
          comp2.isInputSlot.restore();
          comp2.fireModelChangeEvent.restore();
        });
        it('comp2.setInputSlot should be called once', function () {
          expect(stubSetInputSlot.calledOnce).to.be.true;
        });
        it('comp2.fireModelChangeEvent should not be called', function () {
          expect(spyFireModelChangeEvent.called).to.be.false;
        });

        it('propagated value is saved in connection.lastValue Attribute', function () {
          connection.should.have.property('lastValue', payloadObj.payload);
        });
      });
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
    describe('#_validateConnection', function () {
      describe('source slot in connection is an inputslot', function () {
        var connection;
        var connectionManager;
        var spy;
        beforeEach(function () {
          var comp1 = document.createElement('comp1');

          var comp2 = document.createElement('comp2');
          comp2.setAttribute('runtime-id', 'comp2');
          comp2.isInputSlot = function (slot) {
            return true;
          };
          spy = sinon.spy(comp2, 'isInputSlot');
          connection = {
            source: {
              component: comp1,
              memberId: 1,
              slot: 'firsttestoutput'
            },
            destination: {
              component: comp2,
              memberId: 2,
              slot: 'firsttestinput'
            }
          };
          var context = new window.cubx.cif.Context(document.createElement('element'));
          connectionManager = new window.cubx.cif.ConnectionManager(context);
        });
        it('should be valid', function () {
          expect(connectionManager._validateConnection(connection)).to.be.true;
          expect(spy.calledOnce).to.be.true;
        });
      });
      describe('destination slot in connection is not an inputslot', function () {
        var connection;
        var connectionManager;
        var spy;
        beforeEach(function () {
          var comp1 = document.createElement('comp1');

          var comp2 = document.createElement('comp2');
          comp2.setAttribute('runtime-id', 'comp2');
          comp2.isInputSlot = function (slot) {
            return false;
          };
          spy = sinon.spy(comp2, 'isInputSlot');

          connection = {
            source: {
              component: comp1,
              memberId: 1,
              slot: 'firsttestoutput'
            },
            destination: {
              component: comp2,
              memberId: 2,
              slot: 'firsttestinput'
            }
          };
          var context = new window.cubx.cif.Context(document.createElement('element'));
          connectionManager = new window.cubx.cif.ConnectionManager(context);
        });

        it('should throw an exception', function () {
          expect(function () {
            connectionManager._validateConnection(connection);
          }).to.be.throw(Error, /not have an input slot/);
          expect(spy.calledOnce).to.be.true;
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
          //  change res.payload --> not changed payload
          res.payload.that = 'new';
          res.payload.should.be.not.eql(payload);
        });
        it('parameter copy null --> payload will be copied', function () {
          var res = connectionManager._handlePayload(payloadFrame, null);
          expect(res.payload === payload).to.be.not.ok;
          //  change res.payload --> not changed payload
          res.payload.that = 'new';
          res.payload.should.be.not.eql(payload);
        });
        it('parameter copy true --> payload will be copied', function () {
          var res = connectionManager._handlePayload(payloadFrame, true);
          expect(res.payload === payload).to.be.not.ok;
          //  change res.payload --> not changed payload
          res.payload.that = 'new';
          res.payload.should.be.not.eql(payload);
        });
        it('parameter copy false --> payload will be not copied', function () {
          var res = connectionManager._handlePayload(payloadFrame, false);
          expect(res.payload === payload).to.be.ok;
          //  change res.payload --> changed payload
          res.payload.that = 'new';
          res.payload.should.be.eql(payload);
        });
      });
    });
    describe('#_isEqual', function () {
      var connectionManager;
      before(function () {
        connectionManager = new window.cubx.cif.ConnectionManager();
      });
      describe('both parameter are from type object', function () {
        var obj;
        var otherObj;
        beforeEach(function () {
          obj = {
            text: 'example',
            value: {
              foo: 'bar'
            }
          };
          otherObj = _.cloneDeep(obj);
        });

        it('origValue and otherValue is equal', function () {
          expect(obj !== otherObj).to.be.ok;
          expect(connectionManager._isEqual(obj, otherObj)).to.be.ok;
        });
        it('origValue and otherValue is not equal', function () {
          expect(obj !== otherObj).to.be.ok;
          otherObj.that = 'new';
          expect(connectionManager._isEqual(obj, otherObj)).to.be.not.ok;
        });
      });
      describe('both parameter are from type string', function () {
        var str;
        beforeEach(function () {
          str = 'example';
        });

        it('origValue and otherValue is equal', function () {
          expect(connectionManager._isEqual(str, 'example')).to.be.ok;
        });
        it('origValue and otherValue is not equal', function () {
          expect(connectionManager._isEqual(str, 'other exaample')).to.be.not.ok;
        });
      });
      describe('both parameter are from type number', function () {
        it('origValue and otherValue is equal', function () {
          expect(connectionManager._isEqual(5, 5)).to.be.ok;
        });
        it('origValue and otherValue is not equal', function () {
          expect(connectionManager._isEqual(5, 6)).to.be.not.ok;
        });
      });
      describe('both parameter are from type boolean', function () {
        var bool;
        beforeEach(function () {
          bool = true;
        });

        it('origValue and otherValue is equal', function () {
          expect(connectionManager._isEqual(bool, true)).to.be.ok;
        });
        it('origValue and otherValue is not equal', function () {
          expect(connectionManager._isEqual(bool, false)).to.be.not.ok;
        });
      });
      describe('both parameter are from type undefined', function () {
        it('origValue and otherValue is equal', function () {
          expect(connectionManager._isEqual()).to.be.ok;
        });
        it('origValue and otherValue is not equal', function () {
          expect(connectionManager._isEqual(1)).to.be.not.ok;
        });
      });
      describe('both parameter are from type null', function () {
        it('origValue and otherValue is equal', function () {
          expect(connectionManager._isEqual(null, null)).to.be.ok;
        });
        it('origValue and otherValue is not equal', function () {
          expect(connectionManager._isEqual(null)).to.be.not.ok;
        });
      });
      describe('both parameter are from type function', function () {
        var func1;
        var func2;
        var func3;
        beforeEach(function () {
          func1 = function () {
            return 1;
          };

          func2 = function () {
            return 1;
          };
          func3 = function () {
            return true;
          };
        });
        it('origValue and otherValue is equal', function () {
          expect(connectionManager._isEqual(func1, func2)).to.be.ok;
        });
        it('origValue and otherValue is not equal', function () {
          expect(connectionManager._isEqual(func1, func3)).to.be.not.ok;
        });
      });
      describe('the parameter are not froms same type', function () {
        var obj;

        beforeEach(function () {
          obj = {
            text: 'example',
            value: {
              foo: 'bar'
            }
          };
        });

        it('object and string are not equal', function () {
          expect(connectionManager._isEqual(obj, 'example')).to.be.not.ok;
        });
        it('obj and null are not equal', function () {
          expect(connectionManager._isEqual(obj, null)).to.be.not.ok;
        });
        it('obj and undefined are not equal', function () {
          expect(connectionManager._isEqual(obj)).to.be.not.ok;
        });
        it('string and number are not equal', function () {
          expect(connectionManager._isEqual(1, '1')).to.be.not.ok;
        });
      });
    });
    describe('#_allowPropagation', function () {
      var connectionManager;
      before(function () {
        connectionManager = new window.cubx.cif.ConnectionManager();
      });

      describe('repeatedValues is absent', function () {
        var connection;

        beforeEach(function () {
          connection = {
            connectionId: 'test-connection-1',
            lastValue: '2'
          };
        });

        it('propagation allowed, if propagate new value', function () {
          var payloadFrame = {
            slot: 'test',
            payload: '3'
          };
          expect(connectionManager._allowPropagation(connection, payloadFrame)).to.be.true;
        });
        it('propagation not allowed, if propagate the same value', function () {
          var payloadFrame = {
            slot: 'test',
            payload: '2'
          };
          expect(connectionManager._allowPropagation(connection, payloadFrame)).to.be.not.true;
        });
      });
      describe('repeatedValues is false', function () {
        var connection;

        beforeEach(function () {
          connection = {
            connectionId: 'test-connection-1',
            lastValue: '2',
            repeatedValues: false
          };
        });

        it('propagation allowed, if propagate new value', function () {
          var payloadFrame = {
            slot: 'test',
            payload: '3'
          };
          expect(connectionManager._allowPropagation(connection, payloadFrame)).to.be.true;
        });
        it('propagation not allowed, if propagate the same value', function () {
          var payloadFrame = {
            slot: 'test',
            payload: '2'
          };
          expect(connectionManager._allowPropagation(connection, payloadFrame)).to.be.not.true;
        });
      });
      describe('repeatedValues is true', function () {
        var connection;

        beforeEach(function () {
          connection = {
            connectionId: 'test-connection-1',
            lastValue: '2',
            repeatedValues: true
          };
        });

        it('propagation allowed, if propagate new value', function () {
          var payloadFrame = {
            slot: 'test',
            payload: '3'
          };
          expect(connectionManager._allowPropagation(connection, payloadFrame)).to.be.true;
        });
        it('propagation  allowed, if propagate the same value', function () {
          var payloadFrame = {
            slot: 'test',
            payload: '2'
          };
          expect(connectionManager._allowPropagation(connection, payloadFrame)).to.be.true;
        });
      });
    });
  });
});
