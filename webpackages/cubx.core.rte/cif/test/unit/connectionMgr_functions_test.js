'use strict';
describe('ConnectionManager', function () {
  describe('#_deactivateConnection', function () {
    var connectionMgr;
    var element;
    var context;
    var comp1;
    var comp2;
    var connection;
    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      comp1 = document.createElement('comp1');
      comp2 = document.createElement('comp2');
      connection = {
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
        }
      };
      connection.should.not.have.property('deactivated');
    });
    afterEach(function () {
      connectionMgr = null;
      context = null;
      element = null;
      comp1 = null;
      comp2 = null;
      connection = null;
    });
    it('the connection schould be deactivated', function () {
      connectionMgr._deactivateConnection(connection);
      connection.should.have.property('deactivated');
    });
  });
  describe('#_activateConnection', function () {
    var connectionMgr;
    var element;
    var context;
    var comp1;
    var comp2;
    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      comp1 = document.createElement('comp1');
      comp2 = document.createElement('comp2');
    });
    afterEach(function () {
      connectionMgr = null;
      context = null;
      element = null;
      comp1 = null;
      comp2 = null;
    });
    describe('the connection is deactiveted', function () {
      var connection;
      beforeEach(function () {
        connection = {
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
          }
        };
        connection.should.have.property('deactivated', true);
      });
      afterEach(function () {
        connection = null;
      });
      it('the connection schould be not ever deactivated', function () {
        connectionMgr._activateConnection(connection);
        connection.should.not.have.property('deactivated');
      });
    });
    describe('the connection is not deactiveted', function () {
      var connection;
      beforeEach(function () {
        connection = {
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
          }
        };
        connection.should.not.have.property('deactivated');
      });
      afterEach(function () {
        connection = null;
      });
      it('the connectio schould be not ever deactivatged', function () {
        connectionMgr._activateConnection(connection);
        connection.should.not.have.property('deactivated');
      });
    });
  });
  describe('#_findAllConnectionsWithElement', function () {
    var elem1;
    var elem2;
    var elem3;
    var elem4;
    var element;
    var context;
    var connectionMgr;
    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      elem1 = document.createElement('comp1');
      elem2 = document.createElement('comp2');
      elem3 = document.createElement('comp3');
      elem4 = document.createElement('comp4');
      var connections = [
        {
          connectionId: 'first',
          source: {
            memberId: 'elem3',
            slot: 'slot3',
            component: elem3
          },
          destination: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          }
        },
        {
          connectionId: 'second',
          source: {
            memberId: 'elem1',
            slot: 'slot1',
            component: elem1
          },
          destination: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          }
        },
        {
          connectionId: 'third',
          source: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          },
          destination: {
            memberId: 'elem1',
            slot: 'slot1',
            component: elem1
          }
        }
      ];
      connectionMgr._connections = connections;
    });
    afterEach(function () {
      elem1 = null;
      elem2 = null;
      elem3 = null;
      elem4 = null;
      connectionMgr = null;
      context = null;
      element = null;
    });
    describe('find connections with the element "elem1', function () {
      var connections;
      beforeEach(function () {
        connections = connectionMgr._findAllConnectionsWithElement(elem1);
      });
      afterEach(function () {
        connections = null;
      });
      it('should find 2 connections', function () {
        connections.should.have.length(2);
      });
      it('should find the connection with "elem1" as source', function () {
        var connection = connections[ 0 ];
        expect(connection).should.be.not.empty;
        connection.should.have.property('connectionId', 'second');
        connection.source.component.should.be.eql(elem1);
      });
      it('should find the connection with "elem1" as destination', function () {
        var connection = connections[ 1 ];
        expect(connection).should.be.not.empty;
        connection.should.have.property('connectionId', 'third');
        connection.destination.component.should.be.eql(elem1);
      });
    });
    describe('no connection with the element', function () {
      var connections;
      beforeEach(function () {
        connections = connectionMgr._findAllConnectionsWithElement(elem4);
      });
      afterEach(function () {
        connections = null;
      });
      it('should not find connections', function () {
        connections.should.have.length(0);
      });
    });
  });
  describe('#_removeConnection', function () {
    var element;
    var elem1;
    var elem2;
    var elem3;
    var connectionMgr;
    var connection;
    var context;
    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      elem1 = document.createElement('comp1');
      elem2 = document.createElement('comp2');
      elem3 = document.createElement('comp3');

      var connections = [
        {
          connectionId: 'first',
          source: {
            memberId: 'elem3',
            slot: 'slot3',
            component: elem3
          },
          destination: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          }
        },
        {
          connectionId: 'second',
          source: {
            memberId: 'elem1',
            slot: 'slot1',
            component: elem1
          },
          destination: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          }
        }
      ];
      connection = {
        connectionId: 'third',
        source: {
          memberId: 'elem2',
          slot: 'slot2',
          component: elem2
        },
        destination: {
          memberId: 'elem1',
          slot: 'slot1',
          component: elem1
        }
      };
      connections.push(connection);
      connectionMgr._connections = connections;
    });
    afterEach(function () {
      elem1 = null;
      elem2 = null;
      elem3 = null;
      connectionMgr = null;
      context = null;
      element = null;
    });
    it('the _connections array should have less with one element', function () {
      connectionMgr._connections.should.have.length(3);
      connectionMgr._removeConnection(connection);
      connectionMgr._connections.should.have.length(2);
    });
    it('the removed connection should equal with the parameter connection', function () {
      var removedConnection = connectionMgr._removeConnection(connection);
      removedConnection.should.be.eql(connection);
    });
    it('the _connections list should not have an element equals with connection', function () {
      connectionMgr._removeConnection(connection);
      connectionMgr._connections.forEach(function (con) {
        con.should.be.not.eql(connection);
      });
    });
  });
  describe('#_findAllDeactivatedConnectionsWithMemberId', function () {
    var element;
    var elem1;
    var elem2;
    var elem3;
    var connectionMgr;
    var context;
    var connections;
    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      elem1 = document.createElement('comp1');
      elem1.setAttribute('member-id', 'elem1');
      elem2 = document.createElement('comp2');
      elem3 = document.createElement('comp3');

      connections = [
        {
          connectionId: 'first',
          source: {
            memberId: 'elem3',
            slot: 'slot3',
            component: elem3
          },
          destination: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          }
        },
        {
          connectionId: 'second',
          deactisated: true,
          source: {
            memberId: 'elem1',
            slot: 'slot1',
            component: elem1
          },
          destination: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          }
        },
        {
          connectionId: 'third',
          deactivated: true,
          source: {
            memberId: 'elem2',
            slot: 'slot2',
            component: elem2
          },
          destination: {
            memberId: 'elem1',
            slot: 'slot1',
            component: elem1
          }
        } ];
      connectionMgr._connections = connections;
    });
    afterEach(function () {
      elem1 = null;
      elem2 = null;
      elem3 = null;
      connectionMgr = null;
      context = null;
      element = null;
      connections = null;
    });
    it('should found one connection', function () {
      var returnedConnections = connectionMgr._findAllDeactivatedConnectionsWithMemberId(elem1);
      returnedConnections.should.have.length(1);
      returnedConnections[ 0 ].should.have.property('deactivated', true);
      returnedConnections[ 0 ].destination.should.have.property('memberId', 'elem1');
    });
  });
  describe('#_findConnectionByConnectionId', function () {
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
    var element;
    var destElem;
    var context;
    var connectionMgr;
    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      destElem = document.createElement('destElem');
      connectionMgr._connections.push(createConnection('con1', element, 'slotA', 'member1', destElem, 'slotB', 'member2'));
      connectionMgr._connections.push(createConnection('con2', element, 'slotC', 'member1', destElem, 'slotD', 'member2'));
      connectionMgr._connections.push(createConnection('con3', destElem, 'slotA', 'member2', element, 'slotB', 'member1'));
      connectionMgr._connections.push(createConnection('con4', destElem, 'slotC', 'member2', element, 'slotD', 'member1'));
      connectionMgr._connections.should.have.length(4);
    });
    afterEach(function () {
      connectionMgr = null;
      context = null;
      element = null;
    });
    it('the connection should find the existing connection', function () {
      var connection = connectionMgr._findConnectionByConnectionId('con4');
      expect(connection).to.be.exist;
      connection.should.be.property('connectionId', 'con4');
    });
    it('the connection should not find the not existing connection element', function () {
      var connection = connectionMgr._findConnectionByConnectionId('con5');
      expect(connection).to.be.not.exist;
    });
  });
});
