'use strict';
describe('CIF', function () {
  var cif;

  var createConnection;
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
      var crc;
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
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent', function (componentId) {
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
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry', function () {
          return {};
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
      });
      it('should initialize the components', function (done) {
        cif._initCubxElements(container);
        window.setTimeout(function () {
          var ciftestA = container.firstElementChild;
          ciftestA.should.have.property('tagName', 'CIFTEST-A');
          ciftestA.getAttribute('member-id').should.have.exists;
          ciftestA.getAttribute('cubx-component-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId);
          ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
          var ciftestE = ciftestA.nextElementSibling;
          ciftestE.should.have.property('tagName', 'CIFTEST-E');
          ciftestE.getAttribute('member-id').should.have.exists;
          ciftestE.getAttribute('cubx-component-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId);
          ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
          done();
        }, 100);
      });
      it('should have a connection in the connectionManager', function (done) {
        cif._initCubxElements(container);
        cif._initConnections();
        window.setTimeout(function () {
          var conMgr = container.Context.getConnectionMgr();
          conMgr._connections.should.have.length(1);
          var con = conMgr._connections[ 0 ];
          expect(con).to.be.exists;
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
          done();
        }, 100);
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
      var crc;
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
              connectionId: 'c-d', source: {
                slot: 'testslotC'
              }, destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c', source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            }, destination: {
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
              connectionId: 'a-d', source: {
                slot: 'testslotA'
              }, destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-a', source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            }, destination: {
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
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent', function (componentId) {
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
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry', function () {
          return {};
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
      });
      it('should initialize the components', function (done) {
        cif._initCubxElements(container);
        window.setTimeout(function () {
          var ciftestA = container.firstElementChild;
          ciftestA.should.have.property('tagName', 'CIFTEST-A');
          ciftestA.getAttribute('member-id').should.have.exists;
          ciftestA.getAttribute('cubx-component-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId);
          ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
          var ciftestE = ciftestA.nextElementSibling;
          ciftestE.should.have.property('tagName', 'CIFTEST-E');
          ciftestE.getAttribute('member-id').should.have.exists;
          ciftestE.getAttribute('cubx-component-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId);
          ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
          done();
        }, 100);
      });
      it('should have a connection in the connectionManager', function (done) {
        cif._initCubxElements(container);
        cif._initConnections();
        window.setTimeout(function () {
          var conMgr = container.Context.getConnectionMgr();
          conMgr._connections.should.have.length(1);
          var con = conMgr._connections[ 0 ];
          expect(con).to.be.exists;
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
          done();
        }, 100);
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
      var crc;
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
              connectionId: 'c-d', source: {
                slot: 'testslotC'
              }, destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c', source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            }, destination: {
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
              connectionId: 'a-d', source: {
                slot: 'testslotA'
              }, destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-a', source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            }, destination: {
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
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent', function (componentId) {
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
        getComponentCacheEntryStub = sinon.stub(crc.getCache(), 'getComponentCacheEntry', function () {
          return {};
        });
        spy = sinon.spy(console, 'error');
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
        }
        crc.getResolvedComponent.restore();
        crc.getCache().getComponentCacheEntry.restore();
        container.Context._children = [];
        container.Context._components = [];
        container.Context._connectionMgr._connections = [];
        console.error.restore();
      });
      it('should have a no connection in the connectionManager', function (done) {
        cif._initCubxElements(container);
        cif._initConnections();
        window.setTimeout(function () {
          var conMgr = container.Context.getConnectionMgr();
          conMgr._connections.should.have.length(0);
          spy.should.be.calledOnce;
          done();
        }, 100);
      });
    });
  });
});
