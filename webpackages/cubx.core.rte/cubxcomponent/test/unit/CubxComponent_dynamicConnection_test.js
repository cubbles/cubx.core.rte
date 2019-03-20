/* globals getContainer,registerCompoundComponentElement,createNewElement, HTMLImports */

'use strict';
describe('CubxComponent (dynamicConnection', function () {
  var DynamicConnection;
  this.timeout(3000);
  before(function (done) {
    DynamicConnection = window.cubx.cif.DynamicConnection;
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('#addDynamicConnection', function () {
    var elem1;
    var elem2;
    var compElem;
    var compRuntimeId;
    var elem1RuntimeId;
    var elem2RuntimeId;
    before(function () {
      var container = getContainer();
      // container.Context = new window.cubx.cif.Context(container);
      registerCompoundComponentElement('compound-element-add1');
      compElem = document.createElement('compound-element-add1');
      compRuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-add1';
      compElem.setAttribute('runtime-id', compRuntimeId);
      compElem.Context = new window.cubx.cif.Context(compElem);
      container.appendChild(compElem);
      elem1 = createNewElement('element-one-add1');
      elem1RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-one-add1' + '.member1';
      elem1.setAttribute('runtime-id', elem1RuntimeId);
      compElem.appendChild(elem1);

      elem2 = createNewElement('element-two-add1');
      elem2RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-two-add1' + '.member2';
      elem2.setAttribute('runtime-id', elem2RuntimeId);
      compElem.appendChild(elem2);
    });
    describe('add connection to a empty connection list', function () {
      var dynamicConnection;
      before(function () {
        dynamicConnection = new DynamicConnection({
          source: {
            runtimeId: elem1RuntimeId,
            slot: 'slot1'
          },
          destination: {
            runtimeId: elem2RuntimeId,
            slot: 'slot2'
          },
          connectionId: 'firstDynamicConnection'
        });
        elem1.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('the added connection should be exists in the connection list', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
      });
      it('the added connection should override a existing dynamic the right properties and property values',
        function () {
          var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
          connection.should.have.property('static', false);
          connection.should.have.property('lastValue', null);
          connection.should.have.property('copyValue', true);
          connection.should.have.property('repeatedValues', false);
          connection.should.have.property('hookFunction', null);
          connection.should.have.property('connectionId', dynamicConnection.connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', elem1);
          connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property('destination.component', elem2);
          connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
        });
    });
    describe('add connection with all possible attributes to a empty connection list', function () {
      var dynamicConnection;
      before(function () {
        dynamicConnection = new DynamicConnection({
          source: {
            runtimeId: elem1RuntimeId,
            slot: 'slot1'
          },
          destination: {
            runtimeId: elem2RuntimeId,
            slot: 'slot2'
          },
          connectionId: 'firstDynamicConnection',
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        });
        elem1.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('the added connection should be exists in the connection list', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
      });
      it('the added connection should override a existing dynamic the right properties and property values',
        function () {
          var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
          connection.should.have.property('static', false);
          connection.should.have.property('lastValue', null);
          connection.should.have.property('copyValue', dynamicConnection.copyValue);
          connection.should.have.property('repeatedValues', dynamicConnection.repeatedValues);
          connection.should.have.property('hookFunction', dynamicConnection.hookFunction);
          connection.should.have.property('connectionId', dynamicConnection.connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', elem1);
          connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property('destination.component', elem2);
          connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
        });
    });
    describe('add connection to a not empty connection list', function () {
      var dynamicConnection;

      before(function () {
        var dummyElem1 = createNewElement('dummy-elem1');
        var dummyElem1RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem1' + '.member3';
        dummyElem1.setAttribute('runtime-id', dummyElem1RuntimeId);
        compElem.appendChild(dummyElem1);

        var dummyElem2 = createNewElement('dummy-elem2');
        var dummyElem2RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem2' + '.member4';
        dummyElem2.setAttribute('runtime-id', dummyElem2RuntimeId);
        compElem.appendChild(dummyElem2);
        var con1 = new window.cubx.cif.ConnectionManager.Connection();
        con1.source = {};
        con1.source.memberId = 'member3';
        con1.source.component = dummyElem1;
        con1.source.slot = 'slotX';

        con1.destination = {};
        con1.destination.memberId = 'member4';
        con1.destination.component = dummyElem2;
        con1.destination.slot = 'slotY';
        con1.connectionId = 'static1';

        compElem.Context.getConnectionMgr()._connections.push(con1);
        var con2 = new window.cubx.cif.ConnectionManager.Connection();
        con2.source = {};
        con2.source.memberId = 'member4';
        con2.source.component = dummyElem2;
        con2.source.slot = 'slotY';

        con2.destination = {};
        con2.destination.memberId = 'member3';
        con2.destination.component = dummyElem1;
        con2.destination.slot = 'slotX';
        con2.connectionId = 'static2';
        compElem.Context.getConnectionMgr()._connections.push(con2);
        dynamicConnection = new DynamicConnection({
          source: {
            runtimeId: elem1RuntimeId,
            slot: 'slot1'
          },
          destination: {
            runtimeId: elem2RuntimeId,
            slot: 'slot2'
          },
          connectionId: 'firstDynamicConnection'
        });
        elem1.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('the added connection should be exists in the connection list', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(3);
      });
      it('the added connection should have the right properties and property values', function () {
        var connection = compElem.Context.getConnectionMgr()._connections[ 2 ];
        connection.should.have.property('static', false);
        connection.should.have.property('lastValue', null);
        connection.should.have.property('copyValue', true);
        connection.should.have.property('repeatedValues', false);
        connection.should.have.property('hookFunction', null);
        connection.should.have.property('connectionId', dynamicConnection.connectionId);
        connection.should.have.nested.property('source.memberId', 'member1');
        connection.should.have.nested.property('source.component', elem1);
        connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
        connection.should.have.nested.property('destination.memberId', 'member2');
        connection.should.have.nested.property('destination.component', elem2);
        connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
      });
    });
    describe('add connection failed, if the connectionId exist for a static connection', function () {
      var dynamicConnection;

      before(function () {
        var dummyElem1 = createNewElement('dummy-elem-x');
        var dummyElem1RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem-x1' + '.member3';
        dummyElem1.setAttribute('runtime-id', dummyElem1RuntimeId);
        compElem.appendChild(dummyElem1);

        var dummyElem2 = createNewElement('dummy-elem2-x');
        var dummyElem2RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem2-x' + '.member4';
        dummyElem2.setAttribute('runtime-id', dummyElem2RuntimeId);
        compElem.appendChild(dummyElem2);
        var con1 = new window.cubx.cif.ConnectionManager.Connection();
        con1.source = {};
        con1.source.memberId = 'member1';
        con1.source.component = elem1;
        con1.source.slot = 'slot1';

        con1.destination = {};
        con1.destination.memberId = 'member2';
        con1.destination.component = elem2;
        con1.destination.slot = 'slot2';
        con1.connectionId = 'static1';

        compElem.Context.getConnectionMgr()._connections.push(con1);
        var con2 = new window.cubx.cif.ConnectionManager.Connection();
        con2.source = {};
        con2.source.memberId = 'member4';
        con2.source.component = dummyElem2;
        con2.source.slot = 'slotY';

        con2.destination = {};
        con2.destination.memberId = 'member3';
        con2.destination.component = dummyElem1;
        con2.destination.slot = 'slotX';
        con2.connectionId = 'static2';
        compElem.Context.getConnectionMgr()._connections.push(con2);
        dynamicConnection = new DynamicConnection({
          source: {
            runtimeId: elem1RuntimeId,
            slot: 'slot1'
          },
          destination: {
            runtimeId: elem2RuntimeId,
            slot: 'slot2'
          },
          connectionId: 'static1'
        });
      });
      after(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('the connection should cause an exception', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(2);
        expect(function () {
          elem1.addDynamicConnection(dynamicConnection);
        }).to.throw(Error);
        compElem.Context.getConnectionMgr()._connections.should.have.length(2);
      });
    });
    describe('the added connection should override a existing dynamic connection', function () {
      var dummyElem2RuntimeId;
      var dummyElem1RuntimeId;
      var dummyElem1;
      var dummyElem2;
      before(function () {
        dummyElem1 = createNewElement('dummy-elem-y');
        dummyElem1RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem-y' + '.member3';
        dummyElem1.setAttribute('runtime-id', dummyElem1RuntimeId);
        compElem.appendChild(dummyElem1);

        dummyElem2 = createNewElement('dummy-elem2-y');
        dummyElem2RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem2-y' + '.member4';
        dummyElem2.setAttribute('runtime-id', dummyElem2RuntimeId);
        compElem.appendChild(dummyElem2);
        var con1 = new window.cubx.cif.ConnectionManager.Connection();
        con1.source = {};
        con1.source.memberId = 'member3';
        con1.source.component = dummyElem1;
        con1.source.slot = 'slotX';

        con1.destination = {};
        con1.destination.memberId = 'member4';
        con1.destination.component = dummyElem2;
        con1.destination.slot = 'slotY';
        con1.connectionId = 'static1';

        compElem.Context.getConnectionMgr()._connections.push(con1);
        var con2 = new window.cubx.cif.ConnectionManager.Connection();
        con2.source = {};
        con2.source.memberId = 'member4';
        con2.source.component = dummyElem2;
        con2.source.slot = 'slotY';

        con2.destination = {};
        con2.destination.memberId = 'member3';
        con2.destination.component = dummyElem1;
        con2.destination.slot = 'slotX';
        con2.connectionId = 'static2';
        compElem.Context.getConnectionMgr()._connections.push(con2);
        var dynamicConnection1 = {
          source: {
            runtimeId: dummyElem1RuntimeId,
            slot: 'slotx'
          },
          destination: {
            runtimeId: dummyElem2RuntimeId,
            slot: 'sloty'
          }
        };
        elem1.addDynamicConnection(dynamicConnection1);

        var dynamicConnection2 = {
          source: {
            runtimeId: dummyElem1RuntimeId,
            slot: 'slotz'
          },
          destination: {
            runtimeId: dummyElem2RuntimeId,
            slot: 'slota'
          }
        };
        elem1.addDynamicConnection(dynamicConnection2);
      });
      after(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('the length of connection list not changed', function () {
        var dynamicConnection = {
          source: {
            runtimeId: dummyElem1RuntimeId,
            slot: 'slotx'
          },
          destination: {
            runtimeId: dummyElem2RuntimeId,
            slot: 'sloty'
          }
        };
        elem1.addDynamicConnection(dynamicConnection);
        compElem.Context.getConnectionMgr()._connections.should.have.length(4);
      });
      it('the added connection should have the right properties and property values', function () {
        var dynamicConnection = {
          source: {
            runtimeId: dummyElem1RuntimeId,
            slot: 'slotx'
          },
          destination: {
            runtimeId: dummyElem2RuntimeId,
            slot: 'sloty'
          },
          hookFunction: 'myFunc'
        };
        elem1.addDynamicConnection(dynamicConnection);
        var connection = compElem.Context.getConnectionMgr()._connections[ 2 ];
        connection.should.have.property('static', false);
        connection.should.have.property('lastValue', null);
        connection.should.have.property('copyValue', true);
        connection.should.have.property('repeatedValues', false);
        connection.should.have.property('hookFunction', 'myFunc');
        connection.should.have.property('connectionId',
          window.cubx.dynamicConnectionUtil.generateConnectionId(dynamicConnection));
        connection.should.have.nested.property('source.memberId', 'member3');
        connection.should.have.nested.property('source.component', dummyElem1);
        connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
        connection.should.have.nested.property('destination.memberId', 'member4');
        connection.should.have.nested.property('destination.component', dummyElem2);
        connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
      });
    });
  });
  describe('#removeDynamicConnection', function () {
    var elem1;
    var elem2;
    var compElem;
    var compRuntimeId;
    var elem1RuntimeId;
    var elem2RuntimeId;
    before(function () {
      var container = getContainer();
      // container.Context = new window.cubx.cif.Context(container);
      registerCompoundComponentElement('compound-element-remove1');
      compElem = document.createElement('compound-element-remove1');
      compRuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-remove1';
      compElem.setAttribute('runtime-id', compRuntimeId);
      compElem.Context = new window.cubx.cif.Context(compElem);
      container.appendChild(compElem);
      elem1 = createNewElement('element-one-remove1');
      elem1RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-one-add1' + '.member1';
      elem1.setAttribute('runtime-id', elem1RuntimeId);
      compElem.appendChild(elem1);

      elem2 = createNewElement('element-two-remove1');
      elem2RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-two-add1' + '.member2';
      elem2.setAttribute('runtime-id', elem2RuntimeId);
      compElem.appendChild(elem2);
    });
    describe('remove connection if connectionlist has just the one connection', function () {
      var dynamicConnection;
      var spy;
      beforeEach(function () {
        dynamicConnection = new DynamicConnection({
          source: {
            runtimeId: elem1RuntimeId,
            slot: 'slot1'
          },
          destination: {
            runtimeId: elem2RuntimeId,
            slot: 'slot2'
          },
          connectionId: 'firstDynamicConnection'
        });
        elem1.addDynamicConnection(dynamicConnection);
        spy = sinon.spy(console, 'error');
      });
      afterEach(function () {
        compElem.Context.getConnectionMgr()._connections = [];
        console.error.restore();
      });

      it('should be removed if removeConnection called from elem1', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        elem1.removeDynamicConnection(dynamicConnection.connectionId);
        compElem.Context.getConnectionMgr()._connections.should.have.length(0);
        expect(spy.called).to.be.false;
      });
      it('should be removed if removeConnection called from elem2', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        elem2.removeDynamicConnection(dynamicConnection.connectionId);
        compElem.Context.getConnectionMgr()._connections.should.have.length(0);
        expect(spy.called).to.be.false;
      });
    });
    describe('remove connection if connectionlist has more than one connection', function () {
      var dynamicConnection;

      before(function () {
        var dummyElem1 = createNewElement('dummy-elem-z');
        var dummyElem1RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem-z' + '.member3';
        dummyElem1.setAttribute('runtime-id', dummyElem1RuntimeId);
        compElem.appendChild(dummyElem1);

        var dummyElem2 = createNewElement('dummy-elem2-z');
        var dummyElem2RuntimeId = compRuntimeId + ':' +
          'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/dummy-elem2-z' + '.member4';
        dummyElem2.setAttribute('runtime-id', dummyElem2RuntimeId);
        compElem.appendChild(dummyElem2);
        var con1 = new window.cubx.cif.ConnectionManager.Connection();
        con1.source = {};
        con1.source.memberId = 'member3';
        con1.source.component = dummyElem1;
        con1.source.slot = 'slotX';

        con1.destination = {};
        con1.destination.memberId = 'member4';
        con1.destination.component = dummyElem2;
        con1.destination.slot = 'slotY';
        con1.connectionId = 'static1';

        compElem.Context.getConnectionMgr()._connections.push(con1);
        var con2 = new window.cubx.cif.ConnectionManager.Connection();
        con2.source = {};
        con2.source.memberId = 'member4';
        con2.source.component = dummyElem2;
        con2.source.slot = 'slotY';

        con2.destination = {};
        con2.destination.memberId = 'member3';
        con2.destination.component = dummyElem1;
        con2.destination.slot = 'slotX';
        con2.connectionId = 'static2';
        compElem.Context.getConnectionMgr()._connections.push(con2);
      });
      beforeEach(function () {
        dynamicConnection = new DynamicConnection({
          source: {
            runtimeId: elem1RuntimeId,
            slot: 'slot1'
          },
          destination: {
            runtimeId: elem2RuntimeId,
            slot: 'slot2'
          },
          connectionId: 'firstDynamicConnection'
        });
        elem1.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      afterEach(function () {
      });

      it('should be removed if removeConnection called from elem1', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(3);
        elem1.removeDynamicConnection(dynamicConnection.connectionId);
        compElem.Context.getConnectionMgr()._connections.should.have.length(2);
      });
      it('should be removed if removeConnection called from elem2', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(3);
        elem2.removeDynamicConnection(dynamicConnection.connectionId);
        compElem.Context.getConnectionMgr()._connections.should.have.length(2);
      });
      it('should be not removed if try remove a static connection and removeConnection called from elem2',
        function () {
          compElem.Context.getConnectionMgr()._connections.should.have.length(3);
          var connectionId = 'static1';
          expect(function () {
            elem2.removeDynamicConnection(connectionId);
          }).to.throw(Error, 'Can not remove connection with id ("' + connectionId +
            '") , because the connection is not a dynamic connection.');
          compElem.Context.getConnectionMgr()._connections.should.have.length(3);
        });
      it('should be not removed if try remove a static connection and removeConnection called from elem1',
        function () {
          compElem.Context.getConnectionMgr()._connections.should.have.length(3);
          var connectionId = 'static2';
          expect(function () {
            elem1.removeDynamicConnection(connectionId);
          }).to.throw(Error, 'Can not remove connection with id ("' + connectionId +
            '") , because the connection is not a dynamic connection.');
          compElem.Context.getConnectionMgr()._connections.should.have.length(3);
        });

      it('should get an error, if try remove a not existent connection', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(3);
        var connectionId = 'xxx';
        expect(function () {
          elem1.removeDynamicConnection(connectionId);
        }).to.throw(Error, 'Can not remove connection with the id ' + JSON.stringify(connectionId) +
          ' , because the connection is not in the connection list.');
        compElem.Context.getConnectionMgr()._connections.should.have.length(3);
      });
    });
  });
  describe('#exportDynamicConnections', function () {
    var compElem;
    var compRuntimeId;
    var elem1;
    var elem2;
    var elem3;
    var elem1RuntimeId;
    var elem2RuntimeId;
    var elem3RuntimeId;

    function createConnection (connectionId, isStatic, source, dest) {
      var con = new window.cubx.cif.ConnectionManager.Connection();
      con.connectionId = connectionId;
      con.source.memberId = 'member1';
      con.source.component = source;
      con.source.slot = 'slot1';
      con.destination.memberId = 'member2';
      con.destination.component = dest;
      con.destination.slot = 'slot2';
      if (typeof isStatic === 'boolean') {
        con.static = isStatic;
      }
      return con;
    }

    before(function () {
      var container = getContainer();
      // container.Context = new window.cubx.cif.Context(container);
      registerCompoundComponentElement('compound-element-export1');
      compElem = document.createElement('compound-element-export1');
      compRuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-export1';
      compElem.setAttribute('runtime-id', compRuntimeId);
      compElem.Context = new window.cubx.cif.Context(compElem);
      container.appendChild(compElem);
      elem1 = createNewElement('element-one-export1');
      elem1RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-one-export1' + '.member1';
      elem1.setAttribute('runtime-id', elem1RuntimeId);
      compElem.appendChild(elem1);

      elem2 = createNewElement('element-two-export1');
      elem2RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-two-export1' + '.member2';
      elem2.setAttribute('runtime-id', elem2RuntimeId);
      compElem.appendChild(elem2);

      elem3 = createNewElement('element-three-export1');
      elem3RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-three-export1' + '.member3';
      elem3.setAttribute('runtime-id', elem3RuntimeId);
      compElem.appendChild(elem3);
    });

    describe('no connections in connection list', function () {
      it('should get an empty array as JSON', function () {
        var erg = elem1.exportDynamicConnections();
        expect(erg).to.be.equal('[]');
      });
    });
    describe('connection list contains just static connections', function () {
      beforeEach(function () {
        var connections = compElem.Context.getConnectionMgr()._connections;

        var con = createConnection('con1', true, elem1, elem2);
        connections.push(con);
        con = createConnection('con1', true, elem2, elem3);
        connections.push(con);
      });
      afterEach(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('should get an empty array as JSON', function () {
        var erg = elem1.exportDynamicConnections();
        expect(erg).to.be.equal('[]');
      });
    });
    describe('connection list contains one dynamic connection for elem1 as source', function () {
      beforeEach(function () {
        var connections = compElem.Context.getConnectionMgr()._connections;
        var con = createConnection('conDyn', false, elem1, elem2);
        connections.push(con);
      });
      afterEach(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('should get an array with the dynamic connection as JSON', function () {
        var erg = elem1.exportDynamicConnections();
        expect(erg).to.be.equal('[{"source":{"runtimeId":"' + elem1RuntimeId +
          '","slot":"slot1"},"destination":{"runtimeId":"' + elem2RuntimeId +
          '","slot":"slot2"},"copyValue":true,"repeatedValues":false}]');
      });
    });
    describe('connection list contains one dynamic connection for elem1 as destination', function () {
      beforeEach(function () {
        var connections = compElem.Context.getConnectionMgr()._connections;
        var con = createConnection('conDyn', false, elem2, elem1);
        connections.push(con);
      });
      afterEach(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('should get an array with the dynamic connection as JSON', function () {
        var erg = elem1.exportDynamicConnections();
        expect(erg).to.be.equal('[{"source":{"runtimeId":"' + elem2RuntimeId +
          '","slot":"slot1"},"destination":{"runtimeId":"' + elem1RuntimeId +
          '","slot":"slot2"},"copyValue":true,"repeatedValues":false}]');
      });
    });
    describe('connection list contains static and dynamic connections elem1 as source', function () {
      beforeEach(function () {
        var connections = compElem.Context.getConnectionMgr()._connections;
        var con = createConnection('con1', true, elem1, elem2);
        connections.push(con);
        con = createConnection('conDyn', false, elem1, elem2);
        connections.push(con);
      });
      afterEach(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('should get an array with the dynamic connection as JSON', function () {
        var erg = elem1.exportDynamicConnections();
        expect(erg).to.be.equal('[{"source":{"runtimeId":"' + elem1RuntimeId +
          '","slot":"slot1"},"destination":{"runtimeId":"' + elem2RuntimeId +
          '","slot":"slot2"},"copyValue":true,"repeatedValues":false}]');
      });
    });
    describe('connection list contains static and dynamic connections elem1 as destination', function () {
      beforeEach(function () {
        var connections = compElem.Context.getConnectionMgr()._connections;
        var con = createConnection('con1', true, elem1, elem2);
        connections.push(con);
        con = createConnection('conDyn', false, elem2, elem1);
        connections.push(con);
      });
      afterEach(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('should get an array with the dynamic connection as JSON', function () {
        var erg = elem1.exportDynamicConnections();
        expect(erg).to.be.equal('[{"source":{"runtimeId":"' + elem2RuntimeId +
          '","slot":"slot1"},"destination":{"runtimeId":"' + elem1RuntimeId +
          '","slot":"slot2"},"copyValue":true,"repeatedValues":false}]');
      });
    });
    describe('connection list contains a dynamic connections for other element', function () {
      beforeEach(function () {
        var connections = compElem.Context.getConnectionMgr()._connections;
        var con = createConnection('conDyn', false, elem2, elem3);
        connections.push(con);
      });
      afterEach(function () {
        compElem.Context.getConnectionMgr()._connections = [];
      });
      it('should get an empty array as JSON', function () {
        var erg = elem1.exportDynamicConnections();
        expect(erg).to.be.equal('[]');
      });
    });
  });
});
