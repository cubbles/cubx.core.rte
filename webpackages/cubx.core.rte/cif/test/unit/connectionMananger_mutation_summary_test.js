'use strict';
describe('ConnectionManager', function () {
  describe('#tidyConnectionsWithCubble', function () {
    var element;
    var elem1;
    var elem2;
    var elem3;
    var elem4;
    var connectionMgr;
    var context;
    var origConnections;
    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      elem1 = document.createElement('comp1');
      elem2 = document.createElement('comp2');
      elem3 = document.createElement('comp3');
      elem4 = document.createElement('comp3');
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
      origConnections = [
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
      connectionMgr._connections.should.have.length(3);
    });
    afterEach(function () {
      elem1 = null;
      elem2 = null;
      elem3 = null;
      connectionMgr = null;
      context = null;
      element = null;
      origConnections = null;
    });
    describe('it exist connection with tidy elem', function () {
      beforeEach(function () {
        connectionMgr.tidyConnectionsWithCubble(elem1);
      });
      it('connection with connectionId "second" schould be removed', function () {
        connectionMgr._connections.should.have.length(2);
        connectionMgr._connections.forEach(function (con) {
          con.connectionId.should.be.not.equal('second');
          con.source.component.should.be.not.eql(elem1);
        });
      });
      it('connection with connectionId "third" schould be deactivated', function () {
        var con = connectionMgr._connections[ 1 ];
        con.should.have.property('deactivated', true);
      });
    });
    describe('it exist no connection with tidy elem', function () {
      beforeEach(function () {
        connectionMgr.tidyConnectionsWithCubble(elem4);
      });
      it('no changes', function () {
        connectionMgr._connections.should.have.length(3);
        origConnections.should.be.eql(connectionMgr._connections);
      });
    });
  });
  describe('#reactivateConnectionIfExists', function () {
    var element;
    var elem1;
    var elem2;
    var elem3;
    var connectionMgr;
    var context;
    var connections;
    var _processConnectionStub;

    beforeEach(function () {
      element = document.createElement('elem');
      context = new window.cubx.cif.Context(element);
      connectionMgr = new window.cubx.cif.ConnectionManager(context);
      elem1 = document.createElement('comp1');
      elem1.setAttribute('member-id', 'elem1');
      elem2 = document.createElement('comp2');
      elem2.model = {
        slot2: 'test'
      };

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
        }, {
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
        }
      ];
      connectionMgr._connections = connections;
      _processConnectionStub = sinon.stub(connectionMgr, '_processConnection').callsFake(function () {
        // do nothind
      });
      connectionMgr.reactivateConnectionIfExists(elem1);
    });
    afterEach(function () {
      elem1 = null;
      elem2 = null;
      elem3 = null;
      connectionMgr._processConnection.restore();
      connectionMgr = null;
      context = null;
      element = null;
      connections = null;
    });
    it('connection with connectionId "third" should not have property "deactivated"', function () {
      var connection = connectionMgr._connections[ 2 ]; // connection with connectionId = 'third'
      connection.should.not.have.property('deactivated');
    });
    it('_processConnectionStub should be called once', function () {
      _processConnectionStub.should.be.calledOnce;
    });
    it('_processConnectionStub should be called with "test" in payload', function () {
      var payloadObject = window.cubx.cif.cif.getEventFactory().createModelChangePayloadObject('slot2', 'test');
      var connection = connectionMgr._connections[ 2 ]; // connection with connectionId = 'third'
      _processConnectionStub.should.be.calledWith(connection, payloadObject);
    });
  });
});
