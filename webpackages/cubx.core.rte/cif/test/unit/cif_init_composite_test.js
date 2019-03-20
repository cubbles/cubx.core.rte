'use strict';
describe('CIF', function () {
  var cif;

  var createConnection;
  var createSlotInit;
  var crc;
  before(function () {
    cif = window.cubx.cif.cif;
    cif._componentReady = [];
    createConnection = function (element, sourceSlot, destinationMember, destinationSlot, connectionId, copyValue, repeatedValues, hookFunction) {
      var connections = element.querySelector('cubx-core-connections');
      if (!connections) {
        connections = document.createElement('cubx-core-connections');
        element.appendChild(connections);
      }
      var connection = document.createElement('cubx-core-connection');
      connection.setSource(sourceSlot);
      connection.setDestination(destinationSlot, destinationMember);
      connection.setConnectionId(connectionId);
      if (typeof copyValue !== 'undefined') {
        connection.setCopyValue(copyValue);
      }
      if (typeof repeatedValues !== 'undefined') {
        connection.setRepeatedValues(repeatedValues);
      }
      if (typeof hookFunction !== 'undefined') {
        connection.setHookFunction(hookFunction);
      }
      connections.appendChild(connection);
      return connection;
    };
    createSlotInit = function (element, slot, value) {
      var init = element.querySelector('cubx-core-init');
      if (!init) {
        init = document.createElement('cubx-core-init');
      }
      var slotInit = document.createElement('cubx-core-slot-init');
      slotInit.setSlot(slot);
      slotInit.innerHTML = value;
      init.appendChild(slotInit);
      element.appendChild(init);
    };
  });
  describe('init', function () {
    describe('crcRoot contains 2 different cubbles and one simple connection', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      // eslint-disable-next-line no-unused-vars
      var getComponentCacheEntryStub;

      var compoundEl;
      var compoundEl2;
      var connectionId;
      beforeEach(function () {
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [
            {
              slotId: 'testslotAAA'
            }
          ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [
                {
                  slotId: 'testslotB'
                }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-c',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-c',
              memberId: 'C-element',
              slots: [
                {
                  slotId: 'testslotC'
                }
              ],

              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [ {
                    slotId: 'testslotD'
                  }
                  ]
                }
              ],
              connections: []
            } ],
          connections: []
        };
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [
            {
              slotId: 'testslotE'
            }
          ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [
                {
                  slotId: 'testslotB'
                }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-a',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-a',
              memberId: 'A-element',
              slots: [
                {
                  slotId: 'testslotA'
                }
              ],

              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [
                    {
                      slotId: 'testslotD'
                    }
                  ]

                }
              ],
              connections: []
            }
          ],
          connections: []
        };
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.setAttribute('member-id', 'one');
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        compoundEl2.setAttribute('member-id', 'two');
        container.appendChild(compoundEl2);
        connectionId = 'testCon1';
        createConnection(compoundEl, manifestCiftestA.slots[ 0 ].slotId, 'two', manifestCiftestE.slots[ 0 ].slotId, connectionId);
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return {};
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[ 0 ] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
      });
      it('should initialize the components', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var ciftestA = container.firstElementChild;
        ciftestA.should.have.property('tagName', 'CIFTEST-A');
        ciftestA.getAttribute('member-id').should.have.exist;
        ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
        var ciftestE = ciftestA.nextElementSibling;
        ciftestE.should.have.property('tagName', 'CIFTEST-E');
        ciftestE.getAttribute('member-id').should.have.exist;
        ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
      });
      it('should have a connection in the connectionManager', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var conMgr = container.Context.getConnectionMgr();
        conMgr._connections.should.have.length(1);
        var con = conMgr._connections[ 0 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl);
        con.source.should.have.property('memberId', compoundEl.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestA.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl2);
        con.destination.should.have.property('memberId', compoundEl2.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestE.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId);
        con.should.have.property('copyValue', true);
        con.should.have.property('repeatedValues', false);
        con.should.have.property('hookFunction', null);
      });
    });
    describe('crcRoot contains 2 different cubbles and one connection, with attributes', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      // eslint-disable-next-line no-unused-vars
      var getComponentCacheEntryStub;
      var compoundEl;
      var compoundEl2;
      var connectionId;
      var hookFunction;
      beforeEach(function () {
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-c',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-c',
            memberId: 'C-element',
            slots: [ {
              slotId: 'testslotC'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-a',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-a',
            memberId: 'A-element',
            slots: [ {
              slotId: 'testslotA'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'a-d',
              source: {
                slot: 'testslotA'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-a',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'A-Element', slot: 'testslotA'
            }
          } ]
        };
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.setAttribute('member-id', 'one');
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        compoundEl2.setAttribute('member-id', 'two');
        container.appendChild(compoundEl2);
        connectionId = 'testCon1';
        hookFunction = 'function(value, next) { next(value);}';
        createConnection(compoundEl, manifestCiftestA.slots[ 0 ].slotId, 'two', manifestCiftestE.slots[ 0 ].slotId, connectionId, false, true, hookFunction);
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return {};
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[ 0 ] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
      });
      it('should initialize the components', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var ciftestA = container.firstElementChild;
        ciftestA.should.have.property('tagName', 'CIFTEST-A');
        ciftestA.getAttribute('member-id').should.have.exist;
        ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
        var ciftestE = ciftestA.nextElementSibling;
        ciftestE.should.have.property('tagName', 'CIFTEST-E');
        ciftestE.getAttribute('member-id').should.have.exist;
        ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
      });
      it('should have a connection in the connectionManager', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var conMgr = container.Context.getConnectionMgr();
        conMgr._connections.should.have.length(1);
        var con = conMgr._connections[ 0 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl);
        con.source.should.have.property('memberId', compoundEl.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestA.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl2);
        con.destination.should.have.property('memberId', compoundEl2.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestE.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId);
        con.should.have.property('copyValue', false);
        con.should.have.property('repeatedValues', true);
        con.should.have.property('hookFunction', hookFunction);
      });
    });
    describe('crcRoot contains 2 different cubbles and one connection, with type=internal attribute', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      // eslint-disable-next-line no-unused-vars
      var getComponentCacheEntryStub;
      var compoundEl;
      var compoundEl2;
      var connectionId;
      var spy;
      beforeEach(function () {
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-c',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-c',
            memberId: 'C-element',
            slots: [ {
              slotId: 'testslotC'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-a',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-a',
            memberId: 'A-element',
            slots: [ {
              slotId: 'testslotA'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'a-d',
              source: {
                slot: 'testslotA'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-a',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'A-Element', slot: 'testslotA'
            }
          } ]
        };
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.setAttribute('member-id', 'one');
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        compoundEl2.setAttribute('member-id', 'two');
        container.appendChild(compoundEl2);
        connectionId = 'testCon1';
        var con = createConnection(compoundEl, manifestCiftestA.slots[ 0 ].slotId, 'two', manifestCiftestE.slots[ 0 ].slotId, connectionId);
        con.setAttribute('type', 'internal');
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return {};
        });
        spy = sinon.spy(console, 'error');
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[ 0 ] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
        console.error.restore();
      });
      it('should have a no connection in the connectionManager', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var conMgr = container.Context.getConnectionMgr();
        conMgr._connections.should.have.length(0);
        spy.should.be.calledOnce;
      });
    });
    describe('crcRoot contains 3 different cubbles and 3 connection, with attributes', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      var manifestCiftestF;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      // eslint-disable-next-line no-unused-vars
      var getComponentCacheEntryStub;
      var compoundEl;
      var compoundEl2;
      var compoundEl3;
      var connectionId1;
      var connectionId2;
      var connectionId3;
      beforeEach(function () {
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-c',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-c',
            memberId: 'C-element',
            slots: [ {
              slotId: 'testslotC'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-a',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-a',
            memberId: 'A-element',
            slots: [ {
              slotId: 'testslotA'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'a-d',
              source: {
                slot: 'testslotA'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-a',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'A-Element', slot: 'testslotA'
            }
          } ]
        };
        manifestCiftestF = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-f',
          artifactId: 'ciftest-f',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-a',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-a',
            memberId: 'A-element',
            slots: [ {
              slotId: 'testslotA'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'a-d',
              source: {
                slot: 'testslotA'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-a',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'A-Element', slot: 'testslotA'
            }
          } ]
        };
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.setAttribute('member-id', 'one');
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        compoundEl2.setAttribute('member-id', 'two');
        container.appendChild(compoundEl2);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-f');
        compoundEl3 = new constructor();
        compoundEl3.setAttribute('member-id', 'three');
        container.appendChild(compoundEl3);
        connectionId1 = 'testCon1';
        createConnection(compoundEl, manifestCiftestA.slots[ 0 ].slotId, 'two', manifestCiftestE.slots[ 0 ].slotId, connectionId1);
        connectionId2 = 'testCon2';
        createConnection(compoundEl2, manifestCiftestE.slots[ 0 ].slotId, 'three', manifestCiftestF.slots[ 0 ].slotId, connectionId2);
        connectionId3 = 'testCon3';
        createConnection(compoundEl3, manifestCiftestF.slots[ 0 ].slotId, 'one', manifestCiftestA.slots[ 0 ].slotId, connectionId3);
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            case 'ciftest-f' :
              ergManifest = manifestCiftestF;
              break;
            default:
              break;
          }
          return ergManifest;
        });
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return {};
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[ 0 ] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
      });
      it('should initialize the components', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var ciftestA = container.firstElementChild;
        ciftestA.should.have.property('tagName', 'CIFTEST-A');
        ciftestA.getAttribute('member-id').should.have.exist;
        ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
        var ciftestE = ciftestA.nextElementSibling;
        ciftestE.should.have.property('tagName', 'CIFTEST-E');
        ciftestE.getAttribute('member-id').should.have.exist;
        ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
        var ciftestF = ciftestE.nextElementSibling;
        ciftestF.should.have.property('tagName', 'CIFTEST-F');
        ciftestF.getAttribute('member-id').should.have.exist;
        ciftestF.getAttribute('runtime-id').should.be.equals(manifestCiftestF.webpackageId + '/' + manifestCiftestF.artifactId + '.' + ciftestF.getAttribute('member-id'));
      });
      it('should initialize the connections', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var conMgr = container.Context.getConnectionMgr();
        conMgr._connections.should.have.length(3);
        var con = conMgr._connections[ 0 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl);
        con.source.should.have.property('memberId', compoundEl.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestA.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl2);
        con.destination.should.have.property('memberId', compoundEl2.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestE.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId1);
        con.should.have.property('copyValue', true);
        con.should.have.property('repeatedValues', false);
        con.should.have.property('hookFunction', null);

        con = conMgr._connections[ 1 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl2);
        con.source.should.have.property('memberId', compoundEl2.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestE.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl3);
        con.destination.should.have.property('memberId', compoundEl3.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestF.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId2);
        con.should.have.property('copyValue', true);
        con.should.have.property('repeatedValues', false);
        con.should.have.property('hookFunction', null);

        con = conMgr._connections[ 2 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl3);
        con.source.should.have.property('memberId', compoundEl3.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestF.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl);
        con.destination.should.have.property('memberId', compoundEl.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestA.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId3);
        con.should.have.property('copyValue', true);
        con.should.have.property('repeatedValues', false);
        con.should.have.property('hookFunction', null);
      });
    });
    describe('crcRoot contains 2 different cubbles and one connection and init the first element', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      // eslint-disable-next-line no-unused-vars
      var getComponentCacheEntryStub;
      var compoundEl;
      var compoundEl2;
      var connectionId;
      var spy;
      beforeEach(function () {
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [
            {
              slotId: 'testslotA'
            }
          ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [ {
                slotId: 'testslotB'
              }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-c',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-c',
              memberId: 'C-element',
              slots: [
                {
                  slotId: 'testslotC'
                }
              ],

              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [
                    {
                      slotId: 'testslotD'
                    }
                  ]

                }
              ],
              connections: [
                {
                  connectionId: 'c-d',
                  source: {
                    slot: 'testslotC'
                  },
                  destination: {
                    memberIdRef: 'D-Element', slot: 'testslotD'
                  }
                }
              ]
            }
          ],
          connections: [
            {
              connectionId: 'b-c',
              source: {
                memberIdRef: 'B-Element', slot: 'testslotB'
              },
              destination: {
                memberIdRef: 'C-Element', slot: 'testslotC'
              }
            }
          ]
        };
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [
            {
              slotId: 'testslotA'
            }
          ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [
                {
                  slotId: 'testslotB'
                }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-f',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-f',
              memberId: 'F-element',
              slots: [
                {
                  slotId: 'testslotA'
                } ],

              members: [ {
                componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                memberId: 'D-Element',
                artifactType: 'elementaryComponent',
                artifactId: 'ciftest-d',
                slots: [
                  {
                    slotId: 'testslotD'
                  } ]

              } ],
              connections: [
                {
                  connectionId: 'a-d',
                  source: {
                    slot: 'testslotA'
                  },
                  destination: {
                    memberIdRef: 'D-Element', slot: 'testslotD'
                  }
                }
              ]
            }
          ],
          connections: [
            {
              connectionId: 'b-a',
              source: {
                memberIdRef: 'B-Element', slot: 'testslotB'
              },
              destination: {
                memberIdRef: 'F-Element', slot: 'testslotA'
              }
            }
          ]
        };
        crc = window.cubx.CRC;
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry').callsFake(function (artifactId) {
          var ergManifest;
          switch (artifactId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              ergManifest = {};
              break;
          }
          ergManifest.artifactType = 'compoundComponent';
          return ergManifest;
        });
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.setAttribute('member-id', 'one');
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        compoundEl2.setAttribute('member-id', 'two');
        container.appendChild(compoundEl2);
        connectionId = 'testCon1';
        // First cubx-core-connections
        createConnection(compoundEl, manifestCiftestA.slots[ 0 ].slotId, 'two', manifestCiftestE.slots[ 0 ].slotId, connectionId);
        // Than cubx-core-init
        createSlotInit(compoundEl, manifestCiftestA.slots[ 0 ].slotId, '"Hello World!"');
        spy = sinon.spy(cif._initializer, 'resetInitList');
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[ 0 ] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
        window.cubx.cif.cif._initializer._initList = [];
        cif._initializer.resetInitList.restore();
      });
      it('should initialize the components', function () {
        cif._initCubxElements(container);
        cif._initConnections();
        cif._initSlots();

        var ciftestA = container.firstElementChild;
        ciftestA.should.have.property('tagName', 'CIFTEST-A');
        ciftestA.getAttribute('member-id').should.have.exist;
        ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
        var ciftestE = ciftestA.nextElementSibling;
        ciftestE.should.have.property('tagName', 'CIFTEST-E');
        ciftestE.getAttribute('member-id').should.have.exist;
        ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
      });
      it('should have a connection in the connectionManager', function () {
        cif._initCubxElements(container);
        cif._initConnections();
        cif._initSlots();

        var conMgr = container.Context.getConnectionMgr();
        conMgr._connections.should.have.length(1);
        var con = conMgr._connections[ 0 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl);
        con.source.should.have.property('memberId', compoundEl.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestA.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl2);
        con.destination.should.have.property('memberId', compoundEl2.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestE.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId);
        con.should.have.property('copyValue', true);
        con.should.have.property('repeatedValues', false);
        con.should.have.property('hookFunction', null);
      });
      it('should be initialized', function () {
        cif._initCubxElements(container);
        console.log('##################', container);
        console.log(compoundEl);
        cif._initConnections();
        cif._initSlots();
        compoundEl.model.should.have.property('_testslotA', 'Hello World!');
        compoundEl.model.testslotA.should.be.equal('Hello World!');
        compoundEl2.model.should.have.property('_testslotA', 'Hello World!');
        compoundEl2.model.testslotA.should.be.equal('Hello World!');
      });
      it('resetIniList should be called once', function () {
        cif._initCubxElements(container);
        cif._initConnections();
        cif._initSlots();
        spy.should.have.been.calledOnce;
      });
    });
    describe('crcRoot contains 2 different cubbles and and init the first element and one connections', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      // eslint-disable-next-line no-unused-vars
      var getComponentCacheEntryStub;
      var compoundEl;
      var compoundEl2;
      var connectionId;
      beforeEach(function () {
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [ {
            componentId: 'test.package-ciftest-b@0.1/ciftest-b',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-b',
            memberId: 'B-Element',
            slots: [ {
              slotId: 'testslotB'
            } ]
          }, {
            componentId: 'test.package-ciftest-c@0.1/ciftest-c',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-c',
            memberId: 'C-element',
            slots: [ {
              slotId: 'testslotC'
            } ],

            members: [ {
              componentId: 'test.package-ciftest-d@0.1/ciftest-d',
              memberId: 'D-Element',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-d',
              slots: [ {
                slotId: 'testslotD'
              } ]

            } ],
            connections: [ {
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [
                {
                  slotId: 'testslotB'
                }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-f',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-f',
              memberId: 'F-element',
              slots: [
                {
                  slotId: 'testslotA'
                } ],

              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [ {
                    slotId: 'testslotD'
                  }
                  ]

                } ],
              connections: [
                {
                  connectionId: 'a-d',
                  source: {
                    slot: 'testslotA'
                  },
                  destination: {
                    memberIdRef: 'D-Element', slot: 'testslotD'
                  }
                }
              ]
            }
          ],
          connections: [
            {
              connectionId: 'b-a',
              source: {
                memberIdRef: 'B-Element', slot: 'testslotB'
              },
              destination: {
                memberIdRef: 'F-Element', slot: 'testslotA'
              }
            }
          ]
        };
        crc = window.cubx.CRC;
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry').callsFake(function (artifactId) {
          var ergManifest;
          switch (artifactId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              ergManifest = {};
              break;
          }
          ergManifest.artifactType = 'compoundComponent';
          return ergManifest;
        });
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.setAttribute('member-id', 'one');
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        compoundEl2.setAttribute('member-id', 'two');
        container.appendChild(compoundEl2);
        connectionId = 'testCon1';
        // First cubx-core-init
        createSlotInit(compoundEl, manifestCiftestA.slots[ 0 ].slotId, '"Hello World!"');
        // Then cubx-core-connections
        createConnection(compoundEl, manifestCiftestA.slots[ 0 ].slotId, 'two', manifestCiftestE.slots[ 0 ].slotId, connectionId);
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[ 0 ] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
        window.cubx.cif.cif._initializer._initList = [];
      });
      it('should initialize the components', function () {
        cif._initCubxElements(container);
        cif._initConnections();
        cif._initSlots();

        var ciftestA = container.firstElementChild;
        ciftestA.should.have.property('tagName', 'CIFTEST-A');
        ciftestA.getAttribute('member-id').should.have.exist;
        ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
        var ciftestE = ciftestA.nextElementSibling;
        ciftestE.should.have.property('tagName', 'CIFTEST-E');
        ciftestE.getAttribute('member-id').should.have.exist;
        ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
      });
      it('should have a connection in the connectionManager', function () {
        cif._initCubxElements(container);
        cif._initConnections();
        cif._initSlots();

        var conMgr = container.Context.getConnectionMgr();
        conMgr._connections.should.have.length(1);
        var con = conMgr._connections[ 0 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl);
        con.source.should.have.property('memberId', compoundEl.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestA.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl2);
        con.destination.should.have.property('memberId', compoundEl2.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestE.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId);
        con.should.have.property('copyValue', true);
        con.should.have.property('repeatedValues', false);
        con.should.have.property('hookFunction', null);
      });
      it('should be initialized', function () {
        cif._initCubxElements(container);
        cif._initConnections();
        cif._initSlots();
        compoundEl.model.should.have.property('testslotA', 'Hello World!');
        compoundEl2.model.should.have.property('testslotA', 'Hello World!');
      });
    });
    describe('crcRoot contains cubbles in subtree, not as direct child', function () {
      var container;
      var divEl;
      var manifestCiftestE;
      var manifestCiftestA;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      // eslint-disable-next-line no-unused-vars
      var getComponentCacheEntryStub;

      var compoundEl;
      var compoundEl2;
      var connectionId;
      beforeEach(function () {
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [
            {
              slotId: 'testslotAAA'
            }
          ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [
                {
                  slotId: 'testslotB'
                }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-c',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-c',
              memberId: 'C-element',
              slots: [
                {
                  slotId: 'testslotC'
                }
              ],

              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [ {
                    slotId: 'testslotD'
                  }
                  ]
                }
              ],
              connections: []
            } ],
          connections: []
        };
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [
            {
              slotId: 'testslotE'
            }
          ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [
                {
                  slotId: 'testslotB'
                }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-a',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-a',
              memberId: 'A-element',
              slots: [
                {
                  slotId: 'testslotA'
                }
              ],

              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [
                    {
                      slotId: 'testslotD'
                    }
                  ]

                }
              ],
              connections: []
            }
          ],
          connections: []
        };
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        divEl = document.createElement('div');
        container.appendChild(divEl);
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.setAttribute('member-id', 'one');
        divEl.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        compoundEl2.setAttribute('member-id', 'two');
        divEl.appendChild(compoundEl2);
        connectionId = 'testCon1';
        createConnection(compoundEl, manifestCiftestA.slots[ 0 ].slotId, 'two', manifestCiftestE.slots[ 0 ].slotId, connectionId);
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return {};
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[ 0 ] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
      });
      it('should initialize the components', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var ciftestA = divEl.firstElementChild;
        ciftestA.should.have.property('tagName', 'CIFTEST-A');
        ciftestA.getAttribute('member-id').should.have.exist;
        ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
        var ciftestE = ciftestA.nextElementSibling;
        ciftestE.should.have.property('tagName', 'CIFTEST-E');
        ciftestE.getAttribute('member-id').should.have.exist;
        ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
      });
      it('should have a connection in the connectionManager', function () {
        cif._initCubxElements(container);
        cif._initConnections();

        var conMgr = container.Context.getConnectionMgr();
        conMgr._connections.should.have.length(1);
        var con = conMgr._connections[ 0 ];
        expect(con).to.be.exist;
        con.should.have.property('source');
        con.source.should.have.property('component', compoundEl);
        con.source.should.have.property('memberId', compoundEl.getAttribute('member-id'));
        con.source.should.have.property('slot', manifestCiftestA.slots[ 0 ].slotId);
        con.should.have.property('destination');
        con.destination.should.have.property('component', compoundEl2);
        con.destination.should.have.property('memberId', compoundEl2.getAttribute('member-id'));
        con.destination.should.have.property('slot', manifestCiftestE.slots[ 0 ].slotId);
        con.should.have.property('connectionId', connectionId);
        con.should.have.property('copyValue', true);
        con.should.have.property('repeatedValues', false);
        con.should.have.property('hookFunction', null);
      });
    });
  });
});
