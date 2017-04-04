'use strict';

describe('Handling with DynamicConnections', function () {
  var cif;
  var container;
  before(function () {
    cif = window.cubx.cif.cif;
    container = document.querySelector('[cubx-core-crc]');
    // container.Context = new window.cubx.cif.Context(container);
  });
  describe('#addDynamicConnection', function () {
    describe('add dynamic connection between 2 sibling elements, child from compoundComponent', function () {
      var elemOne;
      var elemTwo;
      var parent;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('parent-comp');
        parent = new constructor();
        parent.setAttribute('runtime-id', 'overElem/parent-comp');
        container.appendChild(parent);
        constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        elemOne.setAttribute('runtime-id', 'overElem/parent-comp:elemOne/elemOne.member1');
        parent.appendChild(elemOne);
        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        elemTwo.setAttribute('runtime-id', 'overElem/parent-comp:elemTwo/elemTwo.member2');
        parent.appendChild(elemTwo);
        dynamicConnection = {
          source: {
            runtimeId: 'overElem/parent-comp:elemOne/elemOne.member1',
            slot: 'slotA'
          },
          destination: {
            runtimeId: 'overElem/parent-comp:elemTwo/elemTwo.member2',
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        parent.Context._connectionMgr.connections = [];
        container.removeChild(parent);
      });
      it('parent context should have one connection', function () {
        parent.Context._connectionMgr._connections.should.have.length(1);
      });
      it('parent context should have a connection with right properties', function () {
        var connection = parent.Context._connectionMgr._connections[ 0 ];
        connection.connectionId.should.be.equal(dynamicConnection.connectionId);
        connection.source.should.be.an('object');
        connection.source.should.have.property('component');
        connection.source.component.should.be.eql(elemOne);
        connection.source.should.have.property('memberId', 'member1');
        connection.source.should.have.property('slot', dynamicConnection.source.slot);
        connection.destination.should.be.an('object');
        connection.destination.should.have.property('component');
        connection.destination.component.should.be.eql(elemTwo);
        connection.destination.should.have.property('memberId', 'member2');
        connection.destination.should.have.property('slot', dynamicConnection.destination.slot);
        connection.should.have.property('copyValue', dynamicConnection.copyValue);
        connection.should.have.property('repeatedValues', dynamicConnection.repeatedValues);
        connection.should.have.property('hookFunction', dynamicConnection.hookFunction);
      });
      it('should get the correct connectionId', function () {
        var str = dynamicConnection.source.runtimeId + '#' + dynamicConnection.source.slot + '>' +
          dynamicConnection.destination.runtimeId + '#' + dynamicConnection.destination.slot;
        var expectedConnectionId = window.btoa(str);
        expect(connectionId).to.be.not.null;
        expect(connectionId).to.be.not.undefined;
        expect(connectionId).to.be.not.empty;
        expect(connectionId).to.be.a('string');
        connectionId.should.be.equal(expectedConnectionId);
      });
    });
    describe(
      'add dynamic connection between 2 sibling elements, child from compoundComponent with minimal ' +
      'dynamicConnection config',
      function () {
        var elemOne;
        var elemTwo;
        var parent;
        var dynamicConnection;
        var connectionId;
        before(function () {
          var constructor = cif.getCompoundComponentElementConstructor('parent-comp');
          parent = new constructor();
          parent.setAttribute('runtime-id', 'overElem/parent-comp');
          container.appendChild(parent);
          constructor = cif.getCompoundComponentElementConstructor('elem-one');
          elemOne = new constructor();
          elemOne.setAttribute('runtime-id', 'overElem/parent-comp:elemOne/elemOne.member1');
          parent.appendChild(elemOne);
          constructor = cif.getCompoundComponentElementConstructor('elem-two');
          elemTwo = new constructor();
          elemTwo.setAttribute('runtime-id', 'overElem/parent-comp:elemTwo/elemTwo.member2');
          parent.appendChild(elemTwo);
          dynamicConnection = {
            source: {
              runtimeId: 'overElem/parent-comp:elemOne/elemOne.member1',
              slot: 'slotA'
            },
            destination: {
              runtimeId: 'overElem/parent-comp:elemTwo/elemTwo.member2',
              slot: 'slotB'
            }
          };
          connectionId = elemOne.addDynamicConnection(dynamicConnection);
        });
        after(function () {
          parent.Context._connectionMgr.connections = [];
          container.removeChild(parent);
        });
        it('parent context should have one connection', function () {
          parent.Context._connectionMgr._connections.should.have.length(1);
        });
        it('parent context should have a connection with right properties', function () {
          var connection = parent.Context._connectionMgr._connections[ 0 ];
          connection.connectionId.should.be.equal(dynamicConnection.connectionId);
          connection.source.should.be.an('object');
          connection.source.should.have.property('component');
          connection.source.component.should.be.eql(elemOne);
          connection.source.should.have.property('memberId', 'member1');
          connection.source.should.have.property('slot', dynamicConnection.source.slot);
          connection.destination.should.be.an('object');
          connection.destination.should.have.property('component');
          connection.destination.component.should.be.eql(elemTwo);
          connection.destination.should.have.property('memberId', 'member2');
          connection.destination.should.have.property('slot', dynamicConnection.destination.slot);
          connection.should.have.property('copyValue', true);
          connection.should.have.property('repeatedValues', false);
          connection.should.have.property('hookFunction', null);
        });
        it('should get the correct connectionId', function () {
          var str = dynamicConnection.source.runtimeId + '#' + dynamicConnection.source.slot + '>' +
            dynamicConnection.destination.runtimeId + '#' + dynamicConnection.destination.slot;
          var expectedConnectionId = window.btoa(str);
          expect(connectionId).to.be.not.null;
          expect(connectionId).to.be.not.undefined;
          expect(connectionId).to.be.not.empty;
          expect(connectionId).to.be.a('string');
          connectionId.should.be.equal(expectedConnectionId);
        });
      });
    describe('add dynamic connection between 2 sibling elements, child from root', function () {
      var elemOne;
      var elemTwo;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        elemOne.setAttribute('runtime-id', 'elemOne/elemOne.member1');
        container.appendChild(elemOne);
        container.Context.addComponent(elemOne);
        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        elemTwo.setAttribute('runtime-id', 'elemTwo/elemTwo.member2');
        container.appendChild(elemTwo);
        container.Context.addComponent(elemTwo);
        dynamicConnection = {
          source: {
            runtimeId: 'elemOne/elemOne.member1',
            slot: 'slotA'
          },
          destination: {
            runtimeId: 'elemTwo/elemTwo.member2',
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        container.Context._connectionMgr.connections = [];
        container.removeChild(elemOne);
        container.removeChild(elemTwo);
      });
      it('root context should have one connection', function () {
        container.Context._connectionMgr._connections.should.have.length(1);
      });
      it('root context should have a connection with right properties', function () {
        var connection = container.Context._connectionMgr._connections[ 0 ];
        connection.connectionId.should.be.equal(dynamicConnection.connectionId);
        connection.source.should.be.an('object');
        connection.source.should.have.property('component');
        connection.source.component.should.be.eql(elemOne);
        connection.source.should.have.property('memberId', 'member1');
        connection.source.should.have.property('slot', dynamicConnection.source.slot);
        connection.destination.should.be.an('object');
        connection.destination.should.have.property('component');
        connection.destination.component.should.be.eql(elemTwo);
        connection.destination.should.have.property('memberId', 'member2');
        connection.destination.should.have.property('slot', dynamicConnection.destination.slot);
        connection.should.have.property('copyValue', dynamicConnection.copyValue);
        connection.should.have.property('repeatedValues', dynamicConnection.repeatedValues);
        connection.should.have.property('hookFunction', dynamicConnection.hookFunction);
      });
      it('should get the correct connectionId', function () {
        var str = dynamicConnection.source.runtimeId + '#' + dynamicConnection.source.slot + '>' +
          dynamicConnection.destination.runtimeId + '#' + dynamicConnection.destination.slot;
        var expectedConnectionId = window.btoa(str);
        expect(connectionId).to.be.not.null;
        expect(connectionId).to.be.not.undefined;
        expect(connectionId).to.be.not.empty;
        expect(connectionId).to.be.a('string');
        connectionId.should.be.equal(expectedConnectionId);
      });
    });
    describe('add dynamic connection between self and child element', function () {
      var elemOne;
      var elemTwo;
      var parent;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('parent-comp');
        parent = new constructor();
        parent.setAttribute('runtime-id', 'overElem/parent-comp');
        container.appendChild(parent);
        constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        elemOne.setAttribute('runtime-id', 'overElem/parent-comp:elemOne/elemOne.member1');
        parent.appendChild(elemOne);
        parent.Context.addComponent(elemOne);

        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        elemTwo.setAttribute('runtime-id',
          'overElem/parent-comp:elemOne/elemOne.member1:elemTwo/elemTwo.member2');
        elemOne.appendChild(elemTwo);
        elemOne.Context.addComponent(elemTwo);
        dynamicConnection = {
          source: {
            runtimeId: 'overElem/parent-comp:elemOne/elemOne.member1',
            slot: 'slotA'
          },
          destination: {
            runtimeId: 'overElem/parent-comp:elemOne/elemOne.member1:elemTwo/elemTwo.member2',
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        parent.Context._connectionMgr._internalConnections = [];
        container.removeChild(parent);
      });
      it('own context should have one connection', function () {
        elemOne.Context._connectionMgr._connections.should.have.length(1);
      });
      it('parent context should have an internal connection with right properties', function () {
        var connection = elemOne.Context._connectionMgr._connections[ 0 ];
        connection.should.have.property('internal', true);
        connection.connectionId.should.be.equal(dynamicConnection.connectionId);
        connection.source.should.be.an('object');
        connection.source.should.have.property('component');
        connection.source.component.should.be.eql(elemOne);
        connection.source.should.have.property('memberId', 'member1');
        connection.source.should.have.property('slot', dynamicConnection.source.slot);
        connection.destination.should.be.an('object');
        connection.destination.should.have.property('component');
        connection.destination.component.should.be.eql(elemTwo);
        connection.destination.should.have.property('memberId', 'member2');
        connection.destination.should.have.property('slot', dynamicConnection.destination.slot);
        connection.should.have.property('copyValue', dynamicConnection.copyValue);
        connection.should.have.property('repeatedValues', dynamicConnection.repeatedValues);
        connection.should.have.property('hookFunction', dynamicConnection.hookFunction);
      });
      it('should get the correct connectionId', function () {
        var str = dynamicConnection.source.runtimeId + '#' + dynamicConnection.source.slot + '>' +
          dynamicConnection.destination.runtimeId + '#' + dynamicConnection.destination.slot;
        var expectedConnectionId = window.btoa(str);
        expect(connectionId).to.be.not.null;
        expect(connectionId).to.be.not.undefined;
        expect(connectionId).to.be.not.empty;
        expect(connectionId).to.be.a('string');
        connectionId.should.be.equal(expectedConnectionId);
      });
    });
    describe('add dynamic connection between child element and self', function () {
      var elemOne;
      var elemTwo;
      var parent;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('parent-comp');
        parent = new constructor();
        parent.setAttribute('runtime-id', 'overElem/parent-comp');
        container.appendChild(parent);
        constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        elemOne.setAttribute('runtime-id', 'overElem/parent-comp:elemOne/elemOne.member1');
        parent.appendChild(elemOne);
        parent.Context.addComponent(elemOne);
        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        elemTwo.setAttribute('runtime-id',
          'overElem/parent-comp:elemOne/elemOne.member1:elemTwo/elemTwo.member2');
        elemOne.appendChild(elemTwo);
        elemOne.Context.addComponent(elemTwo);
        dynamicConnection = {
          source: {
            runtimeId: 'overElem/parent-comp:elemOne/elemOne.member1:elemTwo/elemTwo.member2',
            slot: 'slotA'
          },
          destination: {
            runtimeId: 'overElem/parent-comp:elemOne/elemOne.member1',
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      after(function () {
        parent.Context._connectionMgr._connections = [];
        container.removeChild(parent);
      });
      it('own context should have one internal connection', function () {
        elemOne.Context._connectionMgr._connections.should.have.length(1);
      });
      it('parent context should have an internal connection with right properties', function () {
        var connection = elemOne.Context._connectionMgr._connections[ 0 ];
        connection.connectionId.should.be.equal(dynamicConnection.connectionId);
        connection.source.should.be.an('object');
        connection.source.should.have.property('component');
        connection.source.component.should.be.eql(elemTwo);
        connection.source.should.have.property('memberId', 'member2');
        connection.source.should.have.property('slot', dynamicConnection.source.slot);
        connection.destination.should.be.an('object');
        connection.destination.should.have.property('component');
        connection.destination.component.should.be.eql(elemOne);
        connection.destination.should.have.property('memberId', 'member1');
        connection.destination.should.have.property('slot', dynamicConnection.destination.slot);
        connection.should.have.property('copyValue', dynamicConnection.copyValue);
        connection.should.have.property('repeatedValues', dynamicConnection.repeatedValues);
        connection.should.have.property('hookFunction', dynamicConnection.hookFunction);
      });
      it('should get the correct connectionId', function () {
        var str = dynamicConnection.source.runtimeId + '#' + dynamicConnection.source.slot + '>' +
          dynamicConnection.destination.runtimeId + '#' + dynamicConnection.destination.slot;
        var expectedConnectionId = window.btoa(str);
        expect(connectionId).to.be.not.null;
        expect(connectionId).to.be.not.undefined;
        expect(connectionId).to.be.not.empty;
        expect(connectionId).to.be.a('string');
        connectionId.should.be.equal(expectedConnectionId);
      });
    });
  });
  describe('#removeDynamicConnection', function () {
    describe('remove dynamic connection between 2 sibling elements, child from compoundComponent', function () {
      var elemOne;
      var elemTwo;
      var parent;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('parent-comp');
        parent = new constructor();
        parent.setAttribute('runtime-id', 'overElem/parent-comp');
        container.appendChild(parent);
        constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        elemOne.setAttribute('runtime-id', 'overElem/parent-comp:elemOne/elemOne.member1');
        parent.appendChild(elemOne);
        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        elemTwo.setAttribute('runtime-id', 'overElem/parent-comp:elemTwo/elemTwo.member2');
        parent.appendChild(elemTwo);
        dynamicConnection = {
          source: {
            runtimeId: 'overElem/parent-comp:elemOne/elemOne.member1',
            slot: 'slotA'
          },
          destination: {
            runtimeId: 'overElem/parent-comp:elemTwo/elemTwo.member2',
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
      });
      beforeEach(function () {
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      afterEach(function () {
        parent.Context._connectionMgr._connections = [];
      });
      describe('with connectionId', function () {
        it('should remove the connection', function () {
          parent.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection(connectionId);
          parent.Context._connectionMgr._connections.should.have.length(0);
        });
      });
      describe('with connection config', function () {
        it('should remove the connection', function () {
          parent.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection({
            source: {
              runtimeId: dynamicConnection.source.runtimeId,
              slot: dynamicConnection.source.slot
            },
            destination: {
              runtimeId: dynamicConnection.destination.runtimeId,
              slot: dynamicConnection.destination.slot
            }
          });
          parent.Context._connectionMgr._connections.should.have.length(0);
        });
      });
    });
    describe('remove dynamic connection between 2 sibling elements, child from root', function () {
      var elemOne;
      var elemTwo;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        elemOne.setAttribute('runtime-id', 'elemOne/elemOne.member1');
        container.appendChild(elemOne);
        container.Context.addComponent(elemOne);
        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        elemTwo.setAttribute('runtime-id', 'elemTwo/elemTwo.member2');
        container.appendChild(elemTwo);
        container.Context.addComponent(elemTwo);
        dynamicConnection = {
          source: {
            runtimeId: 'elemOne/elemOne.member1',
            slot: 'slotA'
          },
          destination: {
            runtimeId: 'elemTwo/elemTwo.member2',
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
      });
      after(function () {
        container.Context._connectionMgr.connections = [];
        container.removeChild(elemOne);
        container.removeChild(elemTwo);
      });
      beforeEach(function () {
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      afterEach(function () {
        container.Context._connectionMgr._connections = [];
      });
      describe('with connectionId', function () {
        it('should remove the connection', function () {
          container.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection(connectionId);
          container.Context._connectionMgr._connections.should.have.length(0);
        });
      });
      describe('with connection config', function () {
        it('should remove the connection', function () {
          container.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection({
            source: {
              runtimeId: dynamicConnection.source.runtimeId,
              slot: dynamicConnection.source.slot
            },
            destination: {
              runtimeId: dynamicConnection.destination.runtimeId,
              slot: dynamicConnection.destination.slot
            }
          });
          container.Context._connectionMgr._connections.should.have.length(0);
        });
      });
    });
    describe('remove dynamic connection between self and child element', function () {
      var elemOne;
      var elemTwo;
      var parent;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('parent-comp');
        parent = new constructor();
        var parentRuntimeId = 'remove.overElem/parent-comp';
        parent.setAttribute('runtime-id', parentRuntimeId);
        container.appendChild(parent);
        container.Context.addComponent(parent);

        constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        var elemOneRuntimeId = parentRuntimeId + ':elemOne/elemOne.member1';
        elemOne.setAttribute('runtime-id', elemOneRuntimeId);
        elemOne.Context.setParent(parent.Context);
        parent.appendChild(elemOne);
        parent.Context.addComponent(elemOne);

        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        var elemTwoRuntimeId = elemOneRuntimeId + ':elemTwo/elemTwo.member2';
        elemTwo.Context.setParent(elemOne.Context);
        elemTwo.setAttribute('runtime-id',
          elemTwoRuntimeId);
        elemOne.appendChild(elemTwo);
        elemOne.Context.addComponent(elemTwo);

        dynamicConnection = {
          source: {
            runtimeId: elemOneRuntimeId,
            slot: 'slotA'
          },
          destination: {
            runtimeId: elemTwoRuntimeId,
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
      });
      after(function () {
        container.removeChild(parent);
      });
      beforeEach(function () {
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      afterEach(function () {
        elemOne.Context._connectionMgr._internalConnections = [];
      });
      describe('with connectionId', function () {
        it('should remove the connection', function () {
          elemOne.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection(connectionId);
          elemOne.Context._connectionMgr._connections.should.have.length(0);
        });
      });
      describe('with connection config', function () {
        it('should remove the connection', function () {
          elemOne.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection({
            source: {
              runtimeId: dynamicConnection.source.runtimeId,
              slot: dynamicConnection.source.slot
            },
            destination: {
              runtimeId: dynamicConnection.destination.runtimeId,
              slot: dynamicConnection.destination.slot
            }
          });
          elemOne.Context._connectionMgr._internalConnections.should.have.length(0);
        });
      });
    });
    describe('remove dynamic connection between child element and self', function () {
      var elemOne;
      var elemTwo;
      var parent;
      var dynamicConnection;
      var connectionId;
      before(function () {
        var constructor = cif.getCompoundComponentElementConstructor('parent-comp');
        parent = new constructor();
        var parentRuntimeId = 'xxx.overElem/parent-comp';
        parent.setAttribute('runtime-id', parentRuntimeId);
        parent.Context.setParent(container.Context);
        container.appendChild(parent);
        constructor = cif.getCompoundComponentElementConstructor('elem-one');
        elemOne = new constructor();
        var elemOneRuntimeId = parentRuntimeId + ':elemOne/elemOne.member1';
        elemOne.setAttribute('runtime-id', elemOneRuntimeId);
        elemOne.Context.setParent(parent.Context);
        parent.appendChild(elemOne);
        constructor = cif.getCompoundComponentElementConstructor('elem-two');
        elemTwo = new constructor();
        var elemTwoRuntimId = elemOneRuntimeId + ':elemTwo/elemTwo.member2';
        elemTwo.setAttribute('runtime-id', elemTwoRuntimId);
        elemTwo.Context.setParent(elemOne.Context);
        elemOne.appendChild(elemTwo);
        elemOne.Context.addComponent(elemTwo);
        dynamicConnection = {
          source: {
            runtimeId: elemTwoRuntimId,
            slot: 'slotA'
          },
          destination: {
            runtimeId: elemOneRuntimeId,
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
      });
      after(function () {
        container.removeChild(parent);
        container.Context._children = [];
        container.Context._components = [];
      });
      beforeEach(function () {
        connectionId = elemOne.addDynamicConnection(dynamicConnection);
      });
      afterEach(function () {
        parent.Context._connectionMgr._connections = [];
      });
      describe('with connectionId', function () {
        it('should remove the connection', function () {
          elemOne.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection(connectionId);
          elemOne.Context._connectionMgr._connections.should.have.length(0);
        });
      });
      describe('with connection config', function () {
        it('should remove the connection', function () {
          elemOne.Context._connectionMgr._connections.should.have.length(1);
          elemOne.removeDynamicConnection({
            source: {
              runtimeId: dynamicConnection.source.runtimeId,
              slot: dynamicConnection.source.slot
            },
            destination: {
              runtimeId: dynamicConnection.destination.runtimeId,
              slot: dynamicConnection.destination.slot
            }
          });
          elemOne.Context._connectionMgr._connections.should.have.length(0);
        });
      });
    });
  });
  describe('#exportDynamicConnections', function () {
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
      var constructor = cif.getCompoundComponentElementConstructor('export-parent-comp');
      // parent element
      parent = new constructor();
      var parentRuntimeId = 'overElem/export-parent-comp';
      parent.setAttribute('runtime-id', parentRuntimeId);
      parent.Context.setParent(container.Context);
      container.appendChild(parent);
      container.Context.addComponent(parent);

      // child-1 element
      var child1RuntimeId = parentRuntimeId + ':myWebpacakge@1.2.3/child-1.member1';
      constructor = cif.getCompoundComponentElementConstructor('child-1');
      child1 = new constructor();
      child1.setAttribute('runtime-id', child1RuntimeId);
      child1.Context.setParent(parent.Context);
      parent.appendChild(child1);
      parent.Context.addComponent(child1);

      // child-2 element
      var child2RuntimeId = parentRuntimeId + ':myWebpacakge@1.2.3/child-2.member2';
      constructor = cif.getCompoundComponentElementConstructor('child-2');
      child2 = new constructor();
      child2.setAttribute('runtime-id', child2RuntimeId);
      child2.Context.setParent(parent.Context);
      parent.appendChild(child2);
      parent.Context.addComponent(child2);

      // child-3 element
      var child3RuntimeId = parentRuntimeId + ':myWebpacakge@1.2.3/child-3.member3';
      constructor = cif.getCompoundComponentElementConstructor('child-3');
      child3 = new constructor();
      child3.setAttribute('runtime-id', child3RuntimeId);
      child3.Context.setParent(parent.Context);
      parent.appendChild(child3);
      parent.Context.addComponent(child3);

      // child-child-1 element
      var childChild1RuntimeId = child1RuntimeId + ':myWebpacakge@1.2.3/child-child-1.member1';
      constructor = cif.getCompoundComponentElementConstructor('child-child-1');
      childChild1 = new constructor();
      childChild1.setAttribute('runtime-id', childChild1RuntimeId);
      childChild1.Context.setParent(parent.Context);
      child1.appendChild(childChild1);
      child1.Context.addComponent(childChild1);

      // child-child-1 element
      var childChild2RuntimeId = child1RuntimeId + ':myWebpacakge@1.2.3/child-child-2.member2';
      constructor = cif.getCompoundComponentElementConstructor('child-child-1');
      childChild2 = new constructor();
      childChild2.setAttribute('runtime-id', childChild2RuntimeId);
      childChild2.Context.setParent(parent.Context);
      child1.appendChild(childChild2);
      child1.Context.addComponent(childChild2);

      function createConfig (runtimeId1, runtimeId2) {
        return {
          source: {
            runtimeId: runtimeId1,
            slot: 'slotA'
          },
          destination: {
            runtimeId: runtimeId2,
            slot: 'slotB'
          },
          copyValue: false,
          repeatedValues: true,
          hookFunction: 'myFunction'
        };
      }

      dynamicConnection1 = createConfig(child1RuntimeId, child2RuntimeId);
      child1.addDynamicConnection(dynamicConnection1);
      dynamicConnection2 = createConfig(child1RuntimeId, child3RuntimeId);
      child1.addDynamicConnection(dynamicConnection2);
      dynamicConnection3 = createConfig(child2RuntimeId, child3RuntimeId);
      child2.addDynamicConnection(dynamicConnection3);
      dynamicConnection4 = createConfig(child1RuntimeId, childChild1RuntimeId);
      child1.addDynamicConnection(dynamicConnection4);
      dynamicConnection5 = createConfig(childChild1RuntimeId, child1RuntimeId);
      child1.addDynamicConnection(dynamicConnection5);
      dynamicConnection6 = createConfig(child1RuntimeId, childChild2RuntimeId);
      child1.addDynamicConnection(dynamicConnection6);
      dynamicConnection7 = createConfig(childChild2RuntimeId, child1RuntimeId);
      childChild1.addDynamicConnection(dynamicConnection7);
      dynamicConnection8 = createConfig(childChild1RuntimeId, childChild2RuntimeId);
      childChild1.addDynamicConnection(dynamicConnection8);
    });
    after(function () {
      container.remove(parent);
      container.Context._children = [];
      container.Context._components = [];
    });
    describe('with sibling element connections from child-3 ', function () {
      var exportObj;
      beforeEach(function () {
        var exportJson = child3.exportDynamicConnections();
        exportObj = JSON.parse(exportJson);
      });
      it('should be exist', function () {
        expect(exportObj).to.be.exist;
      });
      it('should be not empty', function () {
        expect(exportObj).to.be.not.empty;
      });
      it('should be an array', function () {
        expect(exportObj).to.be.a('array');
      });
      it('should have 2 elements', function () {
        exportObj.should.have.length(2);
      });
      it('should have an connection from child-1 to child-3 (connection 2)', function () {
        var exp = exportObj[ 0 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection2.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection2.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection2.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection2.destination.slot);
      });
      it('should have an connection from child-2 to child-3 (connection 3)', function () {
        var exp = exportObj[ 1 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection3.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection3.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection3.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection3.destination.slot);
      });
    });

    describe('with sibling and internal connections, and child context ', function () {
      var exportObj;
      beforeEach(function () {
        var exportJson = child1.exportDynamicConnections();
        exportObj = JSON.parse(exportJson);
      });
      it('should be exist', function () {
        expect(exportObj).to.be.exist;
      });
      it('should be not empty', function () {
        expect(exportObj).to.be.not.empty;
      });
      it('should be an array', function () {
        expect(exportObj).to.be.a('array');
      });
      it('should have 7 elements', function () {
        exportObj.should.have.length(7);
      });
      it('should have a connection from child-1 to child-2 (connection 1)', function () {
        var exp = exportObj[ 0 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection1.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection1.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection1.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection1.destination.slot);
      });
      it('should have a connection from child-1 to child-3 (connection 2)', function () {
        var exp = exportObj[ 1 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection2.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection2.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection2.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection2.destination.slot);
      });
      it('should have a internal connection from child-1 to child-child-1 (connection 4)', function () {
        var exp = exportObj[ 2 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection4.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection4.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection4.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection4.destination.slot);
      });
      it('should have a internal connection from child-child-1 to child-1 (connection 5)', function () {
        var exp = exportObj[ 3 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection5.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection5.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection5.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection5.destination.slot);
      });
      it('should have a internal connection from child-1 to child-child-2 (connection 6)', function () {
        var exp = exportObj[ 4 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection6.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection6.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection6.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection6.destination.slot);
      });
      it('should have a internal connection from child-child-2 to child-1 (connection 7)', function () {
        var exp = exportObj[ 5 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection7.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection7.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection7.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection7.destination.slot);
      });

      it('should have a internal connection from child-child-1 to child-child-2 (connection 8)', function () {
        var exp = exportObj[ 6 ];
        exp.source.runtimeId.should.be.equal(dynamicConnection8.source.runtimeId);
        exp.source.slot.should.be.equal(dynamicConnection8.source.slot);
        exp.destination.runtimeId.should.be.equal(dynamicConnection8.destination.runtimeId);
        exp.destination.slot.should.be.equal(dynamicConnection8.destination.slot);
      });
    });
  });
});
