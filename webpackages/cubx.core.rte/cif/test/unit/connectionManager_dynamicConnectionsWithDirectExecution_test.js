/* globals XMLHttpRequest */
'use strict';

describe('ConnectionManager', function () {
  describe('dynamicConnections with direct execution', function () {
    var cif;
    var connectionMgr;
    var conConfig;
    var sourceElem;
    var destinationElem;
    var value;
    before(function () {
      cif = window.cubx.cif.cif;

      var parentElemArtifactId = 'parent-elem';
      var parentElemManifest = {

        webpackageId: 'test.' + parentElemArtifactId + '.@0.1.0',
        artifactId: parentElemArtifactId,
        artifactType: 'compoundComponent',
        slots: [],
        members: [],
        connections: []
      };
      var parentElementRuntimeId = parentElemManifest.webpackageId + '/' + parentElemArtifactId;
      var sourceElemArtifactId = 'source-elem';
      var sourceElemManifest = {

        webpackageId: 'test.' + sourceElemArtifactId + '.@0.1.0',
        artifactId: sourceElemArtifactId,
        artifactType: 'compoundComponent',
        slots: [
          {
            slotId: 'slotA',
            type: 'object',
            direction: [ 'output' ]
          }
        ]
      };
      var sourceElemRuntimeId = parentElementRuntimeId + ':' + sourceElemManifest.webpackageId + '/' +
        sourceElemArtifactId + '.member1';
      var destinationElemArtifactId = 'destination-elem';
      var destinationElemManifest = {

        webpackageId: 'test.' + destinationElemArtifactId + '.@0.1.0',
        artifactId: destinationElemArtifactId,
        artifactType: 'compoundComponent',
        slots: [
          {
            slotId: 'slotB',
            type: 'object',
            direction: [ 'input' ]
          }
        ]
      };
      var destinationElemRuntimeId = parentElementRuntimeId + ':' + destinationElemManifest.webpackageId +
        '/' + destinationElemArtifactId + '.member2';
      parentElemManifest.members.push({
        memberId: 'member1',
        componentId: sourceElemManifest.webpackageId + '/' + sourceElemArtifactId
      });

      parentElemManifest.members.push({
        memberId: 'member2',
        componentId: destinationElemManifest.webpackageId + '/' + destinationElemArtifactId
      });
      sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
        var manifest;
        switch (key) {
          case parentElemArtifactId:
            manifest = parentElemManifest;
            break;
          case sourceElemArtifactId:
            manifest = sourceElemManifest;
            break;
          case destinationElemArtifactId:
            manifest = destinationElemManifest;
            break;
          default:
            manifest = {
              artifactType: 'compoundComponent'
            };
        }
        return manifest;
      });
      var constructor = cif.getCompoundComponentElementConstructor(parentElemArtifactId);
      var parentElem = new constructor();
      parentElem.setAttribute('runtime-id', parentElementRuntimeId);
      connectionMgr = parentElem.Context.getConnectionMgr();
      constructor = cif.getCompoundComponentElementConstructor(sourceElemArtifactId);
      sourceElem = new constructor();
      sourceElem.setAttribute('runtime-id', sourceElemRuntimeId);
      value = { foo: 'example' };
      sourceElem.setSlotA(value);
      parentElem.appendChild(sourceElem);

      sourceElem.Context.setParent(parentElem.Context);
      constructor = cif.getCompoundComponentElementConstructor(destinationElemArtifactId);
      destinationElem = new constructor();
      destinationElem.setAttribute('runtime-id', destinationElemRuntimeId);
      parentElem.appendChild(destinationElem);
      destinationElem.Context.setParent(parentElem.Context);
    });
    after(function () {
      window.cubx.CRC.getCache().getComponentCacheEntry.restore();
    });

    afterEach(function () {
      connectionMgr._connections = [];
      // destinationElem.model = {};
    });
    describe('#addDynamicConnection', function () {
      describe('add a valid connection with directExecution = true, copyValue=true', function () {
        var spyExecuteConnection;
        var spyControlFunc;
        beforeEach(function () {
          conConfig = {
            connectionId: 'dynConX',
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
          spyControlFunc = sinon.spy();
          window.myFunc = function (value, next) {
            spyControlFunc();
            next(value);
          };

          spyExecuteConnection = sinon.spy(connectionMgr, '_executeConnection');
          connectionMgr.addDynamicConnection(conConfig, true);
        });
        afterEach(function () {
          conConfig = null;
          connectionMgr._executeConnection.restore();
        });
        it('the connection should be added to connectionManager._connections', function () {
          connectionMgr._connections.should.have.length(1);
        });
        it('the added connection should be valid', function () {
          connectionMgr._connections[ 0 ].should.have.property('connectionId', conConfig.connectionId);
          connectionMgr._connections[ 0 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
        });
        it('the hook function #myFunc should be called once', function () {
          // myFunc call controlFunc -> controlFunc is clled, if myfunc is called
          spyControlFunc.should.be.calledOnce;
        });
        it('the #_executeConnection should been called', function () {
          spyExecuteConnection.should.been.calledOnce;
          spyExecuteConnection.should.been.calledWith(conConfig);
          destinationElem.model.slotB.should.have.deep.equal(value);
          expect(destinationElem.model.slotB !== value);
        });
      });
      describe('add a valid connection with directExecution = true, copyValue=true, slotValue not serializable', function () {
        var spyExecuteConnection;
        var spyControlFunc;
        var spyConsole;
        var handlePayloadSpy;
        var noSerializableValue = new XMLHttpRequest();
        beforeEach(function () {
          conConfig = {
            connectionId: 'dynConX',
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
          spyControlFunc = sinon.spy();
          window.myFunc = function (value, next) {
            spyControlFunc();
            next(value);
          };

          spyExecuteConnection = sinon.spy(connectionMgr, '_executeConnection');

          handlePayloadSpy = sinon.spy(connectionMgr, '_handlePayload');
          spyConsole = sinon.spy(console, 'warn');
          sourceElem.setSlotA(noSerializableValue);
          connectionMgr.addDynamicConnection(conConfig, true);
        });
        afterEach(function () {
          conConfig = null;
          connectionMgr._executeConnection.restore();
          handlePayloadSpy.restore();
          spyConsole.restore();
          sourceElem.setSlotA(value);
        });
        it('the connection should be added to connectionManager._connections', function () {
          connectionMgr._connections.should.have.length(1);
        });
        it('the added connection should be valid', function () {
          connectionMgr._connections[ 0 ].should.have.property('connectionId', conConfig.connectionId);
          connectionMgr._connections[ 0 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
        });
        it('the hook function #myFunc should be called once', function () {
          // myFunc call controlFunc -> controlFunc is clled, if myfunc is called
          spyControlFunc.should.be.calledOnce;
        });
        it('the #_executeConnection should been called', function () {
          spyExecuteConnection.should.been.calledOnce;
          spyExecuteConnection.should.been.calledWith(conConfig);
          destinationElem.model.slotB.should.have.nested.equal(noSerializableValue);
          expect(destinationElem.model.slotB !== noSerializableValue);
        });
        it('copyValue should be set to false, user should be warned', function () {
          return Promise.all([
            expect(handlePayloadSpy).to.be.calledWith(sinon.match.any, false),
            expect(spyConsole).to.be.calledWith('\'copyValue\' is set to false since slot value is not serialisable.', sinon.match.any, sinon.match.any)
          ]);
        });
      });
      describe('add a valid connection with directExecution = false', function () {
        var spyExecuteConnection;
        var spyControlFunc;
        beforeEach(function () {
          conConfig = {
            connectionId: 'dynConX',
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
          spyControlFunc = sinon.spy();
          window.myFunc = function (value, next) {
            spyControlFunc();
            next(value);
          };

          spyExecuteConnection = sinon.spy(connectionMgr, '_executeConnection');
          connectionMgr.addDynamicConnection(conConfig, false);
        });
        afterEach(function () {
          conConfig = null;
          connectionMgr._executeConnection.restore();
        });
        it('the connection should be added to connectionManager._connections', function () {
          connectionMgr._connections.should.have.length(1);
        });
        it('the added connection should be valid', function () {
          connectionMgr._connections[ 0 ].should.have.property('connectionId', conConfig.connectionId);
          connectionMgr._connections[ 0 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
        });
        it('the hook function #myFunc should be called once', function () {
          // myFunc call controlFunc -> controlFunc is clled, if myfunc is called
          spyControlFunc.should.be.not.called;
        });
        it('the #_executeConnection should been not called', function () {
          spyExecuteConnection.should.been.not.called;
        });
      });
      describe('add a valid connection with directExecution = true, copyValue = false', function () {
        var spyExecuteConnection;
        var spyControlFunc;
        beforeEach(function () {
          conConfig = {
            connectionId: 'dynConX',
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
            copyValue: false,
            hookFunction: 'myFunc'
          };
          spyControlFunc = sinon.spy();
          window.myFunc = function (value, next) {
            spyControlFunc();
            next(value);
          };

          spyExecuteConnection = sinon.spy(connectionMgr, '_executeConnection');
          connectionMgr.addDynamicConnection(conConfig, true);
        });
        afterEach(function () {
          conConfig = null;
          connectionMgr._executeConnection.restore();
        });
        it('the connection should be added to connectionManager._connections', function () {
          connectionMgr._connections.should.have.length(1);
        });
        it('the added connection should be valid', function () {
          connectionMgr._connections[ 0 ].should.have.property('connectionId', conConfig.connectionId);
          connectionMgr._connections[ 0 ].should.instanceOf(window.cubx.cif.ConnectionManager.Connection);
        });
        it('the hook function #myFunc should be called once', function () {
          // myFunc call controlFunc -> controlFunc is clled, if myfunc is called
          spyControlFunc.should.be.calledOnce;
        });
        it('the #_executeConnection should been called', function () {
          spyExecuteConnection.should.been.calledOnce;
          spyExecuteConnection.should.been.calledWith(conConfig);
          destinationElem.model.slotB.should.deep.equal({ foo: 'example' });
          expect(destinationElem.model.slotB === value);
        });
      });
    });
  });
});
