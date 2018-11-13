'use strict';

describe('Connection', function () {
  /* eslint-disable no-unused-vars */
  var cif;
  /* eslint-enable no-unused-vars */
  var Connection;
  before(function () {
    cif = window.cubx.cif.cif;
    Connection = window.cubx.cif.ConnectionManager.Connection;
  });
  describe('#validate', function () {
    var connection;
    beforeEach(function () {
      connection = new Connection();
    });
    afterEach(function () {
      connection = null;
    });
    describe('for valid connection', function () {
      it('should have no errors with all possible attributes', function () {
        connection.source.memberId = 'sourceMember';
        connection.source.slot = 'testSlotA';
        connection.source.component = document.createElement('sourceElement');
        connection.destination.memberId = 'destinationMember';
        connection.destination.slot = 'testSlotB';
        connection.destination.component = document.createElement('destinationElement');
        connection.connectionId = 'con1';
        connection.copyValue = true;
        connection.repeatedValues = true;
        connection.hookFunction = 'testFunction';

        var erg = connection.validate();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
      it('should have no errors with minimal attributes', function () {
        connection.source.memberId = 'sourceMember';
        connection.source.slot = 'testSlotA';
        connection.source.component = document.createElement('sourceElement');
        connection.destination.memberId = 'destinationMember';
        connection.destination.slot = 'testSlotB';
        connection.destination.component = document.createElement('destinationElement');
        connection.connectionId = 'con1';

        var erg = connection.validate();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
    });
    describe('for not valid connection', function () {
      it('should have errors ', function () {
        connection.connectionId = 'Con1';
        connection.copyValue = 'true';
        connection.repeatedValues = 'true';
        connection.hookFunction = 'testFunction';

        var erg = connection.validate();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(6);
        erg.should.have.nested.property('[0]', 'The property "source.slot" must exist.');
        erg.should.have.nested.property('[1]', 'The property "source.component" must exist.');
        erg.should.have.nested.property('[2]', 'The property "destination.slot" must exist.');
        erg.should.have.nested.property('[3]', 'The property "destination.component" must exist.');
        erg.should.have.nested.property('[4]', 'The property "repeatedValues" must be boolean.');
        erg.should.have.nested.property('[5]', 'The property "copyValue" must be boolean.');
      });
    });
  });
  describe('#_validateSource', function () {
    var connection;
    beforeEach(function () {
      connection = new Connection();
    });
    afterEach(function () {
      connection = null;
    });
    describe('for valid source', function () {
      it('should have no errors', function () {
        connection.source.memberId = 'testMember';
        connection.source.component = document.createElement('sourceElement');
        connection.source.slot = 'testSlot';
        var erg = connection._validateSource();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
    });
    describe('for not valid source', function () {
      it('should be not valid, if source property missed ', function () {
        delete connection.source;

        var erg = connection._validateSource();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source" is missed.');
      });

      it('should be not valid, if source without component ', function () {
        connection.source.slot = 'testSlot';
        connection.source.memberId = 'testMember';
        var erg = connection._validateSource();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source.component" must exist.');
      });
      it('should be not valid, if source without slot ', function () {
        connection.source.memberId = 'testMember';
        connection.source.component = document.createElement('sourceElement');
        var erg = connection._validateSource();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source.slot" must exist.');
      });
      it('should be not valid, if source without memberId, slot and component', function () {
        var erg = connection._validateSource();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(2);
        erg.should.have.nested.property('[0]', 'The property "source.slot" must exist.');
        erg.should.have.nested.property('[1]', 'The property "source.component" must exist.');
      });
    });
  });
  describe('#_validateDestination', function () {
    var connection;
    beforeEach(function () {
      connection = new Connection();
    });
    afterEach(function () {
      connection = null;
    });
    describe('for valid destination', function () {
      it('should have no errors', function () {
        connection.destination.memberId = 'testMember';
        connection.destination.slot = 'testSlot';
        connection.destination.component = document.createElement('destinationElement');
        var erg = connection._validateDestination();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
    });
    describe('for not valid destination', function () {
      it('should be not valid, if property destination missed ', function () {
        delete connection.destination;
        var erg = connection._validateDestination();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "destination" is missed.');
      });

      it('should be not valid, if destination without component ', function () {
        connection.destination.slot = 'testSlot';
        connection.destination.memberId = 'testMember';
        var erg = connection._validateDestination();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "destination.component" must exist.');
      });
      it('should be not valid, if destination without slot ', function () {
        connection.destination.memberId = 'testMember';
        connection.destination.component = document.createElement('destinationElement');
        var erg = connection._validateDestination();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "destination.slot" must exist.');
      });
      it('should be not valid, if destination without memberId, slot and component', function () {
        var erg = connection._validateDestination();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(2);
        erg.should.have.nested.property('[0]', 'The property "destination.slot" must exist.');
        erg.should.have.nested.property('[1]', 'The property "destination.component" must exist.');
      });
    });
  });
  describe('#_validateMemberId', function () {
    var connection;
    beforeEach(function () {
      connection = new Connection();
    });
    afterEach(function () {
      connection = null;
    });
    describe('for valid memberId', function () {
      it('should be valid for memberId "memberId"', function () {
        var memberId = 'memberId';
        var erg = connection._validateMemberId(memberId, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
      it('should be valid for memberId = null ', function () {
        var erg = connection._validateMemberId(null, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
    });
    describe('for not valid memberId', function () {
      it('should be not valid for memberId = undefined', function () {
        var erg = connection._validateMemberId('source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
      });
      it('should be not valid for undefined memberId parameter', function () {
        var memberId;
        var erg = connection._validateMemberId(memberId, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source.memberId" must exist.');
      });
      it('should be not valid, if the memberId parameter not a sting.', function () {
        var memberId = {};
        var erg = connection._validateMemberId(memberId, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]',
          'Not valid source.memberId (' + JSON.stringify(memberId) +
          '). The property "source.memberId" must be a string.');
      });

      it('The memberId "member:ID" should be not valid', function () {
        var memberId = 'member:ID';
        var erg = connection._validateMemberId(memberId, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]',
          'Not valid source.memberId (' + JSON.stringify(memberId) +
          '). The property "source.memberId" must match to /^[a-z][a-zA-Z0-9-]*$/');
      });
      it('The memberId "MemberId" should be not valid', function () {
        var memberId = 'MemberId';

        var erg = connection._validateMemberId(memberId, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]',
          'Not valid source.memberId (' + JSON.stringify(memberId) +
          '). The property "source.memberId" must match to /^[a-z][a-zA-Z0-9-]*$/');
      });
    });
  });
  describe('#_validateSlot', function () {
    var connection;
    beforeEach(function () {
      connection = new Connection();
    });
    afterEach(function () {
      connection = null;
    });
    describe('for valid slot', function () {
      it('should be valid for slot "slotname"', function () {
        var slot = 'slotName';
        var erg = connection._validateSlot(slot, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
    });
    describe('for not valid slot', function () {
      it('should be not valid, if the slot parameter is undefined.', function () {
        var slot;
        var erg = connection._validateSlot(slot, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source.slot" must exist.');
      });
      it('should be not valid, if the slot parameter not exists.', function () {
        var erg = connection._validateSlot('source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source.slot" must exist.');
      });
      it('should be not valid, if the slot parameter not a sting.', function () {
        var slot = {};
        var erg = connection._validateSlot(slot, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]',
          'Not valid "source.slot" (' + JSON.stringify(slot) +
          '). The property "source.slot" must be a string.');
      });
    });
  });
  describe('#_validateComponent', function () {
    var connection;
    beforeEach(function () {
      connection = new Connection();
    });
    afterEach(function () {
      connection = null;
    });
    describe('for valid component', function () {
      it('should be without errors', function () {
        var component = document.createElement('htmlElement');
        var erg = connection._validateComponent(component, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
    });
    describe('for not valid component', function () {
      it('should be not valid, if the component parameter is undefined.', function () {
        var component;
        var erg = connection._validateComponent(component, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source.component" must exist.');
      });
      it('should be not valid, if the component parameter not exists.', function () {
        var erg = connection._validateComponent('source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]', 'The property "source.component" must exist.');
      });
      it('should be not valid, if the slot parameter not a htmlElement.', function () {
        var component = 'string';
        var erg = connection._validateComponent(component, 'source');
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]',
          'Not valid "source.component" (' + JSON.stringify(component) +
          '). The property "source.component" must be a HTMLElement.');
      });
    });
  });
  describe('#_validateConnectionId', function () {
    var connection;
    beforeEach(function () {
      connection = new Connection();
    });
    afterEach(function () {
      connection = null;
    });
    describe('for valid connectionId', function () {
      it('"connectionId-new:id" should be a valid connectionId', function () {
        connection.connectionId = 'connectionId-new:id';
        var erg = connection._validateConnectionId();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
      it('"myFirstId" should be a valid connectionId', function () {
        connection.connectionId = 'myFirstId';
        var erg = connection._validateConnectionId();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
      it('"con1" should be a valid connectionId', function () {
        connection.connectionId = 'con1';
        var erg = connection._validateConnectionId();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(0);
      });
    });
    describe('for not valid connectionId', function () {
      it('null should be a not valid connectionId', function () {
        connection.connectionId = null;
        var erg = connection._validateConnectionId();
        expect(erg).to.be.exist;
        expect(erg).to.be.an('array');
        erg.should.have.length(1);
        erg.should.have.nested.property('[0]',
          'The property "connectionId" is missed.');
      });
    });
  });
  describe('#toDynamicConnection', function () {
    /*
     this.toDynamicConnection = function() {
     var dynamicConnection;
     if (!this.static) {
     dynamicConnection = new window.cubx.cif.DynamicConnection();
     dynamicConnection.setConnectionId(this.connectionId);
     dynamicConnection.setSourceRuntimeId(this.source.component.getAttribute('runtime-id'));
     dynamicConnection.setSourceSlot(this.source.slot);
     dynamicConnection.setDestinationRuntimeId(this.destination.component.getAttribute('runtime-id'));
     dynamicConnection.setDestinationSlot(this.destination.slot);
     dynamicConnection.setCopyValue(this.copyValue);
     dynamicConnection.setRepeatedValues(this.repeatedValues);
     if (this.hookFunction) {
     dynamicConnection.setHookFunction(this.hookFunction);
     }
     }
     return dynamicConnection;
     };
     */
    var connection;
    var spy;
    var sourceRuntimeId;
    var destRuntimeId;
    var dynamicConnection;
    beforeEach(function () {
      connection = new Connection();

      spy = sinon.spy(console, 'error');
    });
    afterEach(function () {
      connection = null;
      console.error.restore();
    });
    describe('parameter connection with all attributes (property static == false)', function () {
      beforeEach(function () {
        connection.source.memberId = 'sourceMember';
        connection.source.slot = 'testSlotA';
        var sourceComp = document.createElement('sourceElement');
        sourceRuntimeId = 'sourceRuntimeId';
        sourceComp.setAttribute('runtime-id', sourceRuntimeId);
        connection.source.component = sourceComp;
        connection.destination.memberId = 'destinationMember';
        connection.destination.slot = 'testSlotB';
        var destComp = document.createElement('destinationElement');
        destRuntimeId = 'destinationRuntimeId';
        destComp.setAttribute('runtime-id', destRuntimeId);
        connection.destination.component = destComp;
        connection.connectionId = 'con1';
        connection.copyValue = false;
        connection.repeatedValues = true;
        connection.hookFunction = 'testFunction';
        connection.static = false;
        dynamicConnection = connection.toDynamicConnection();
      });
      afterEach(function () {
        dynamicConnection = null;
      });
      it('should be create a dynamicConnection object', function () {
        expect(dynamicConnection).to.be.not.undefined;
        expect(dynamicConnection).to.be.not.null;
      });
      it('should be create a correct dynamicConnection', function () {
        dynamicConnection.should.not.have.property('connectionId');
        dynamicConnection.should.have.nested.property('source.runtimeId', sourceRuntimeId);
        dynamicConnection.should.have.nested.property('source.slot', connection.source.slot);
        dynamicConnection.should.have.nested.property('destination.runtimeId', destRuntimeId);
        dynamicConnection.should.have.nested.property('destination.slot', connection.destination.slot);
        dynamicConnection.should.have.property('copyValue', connection.copyValue);
        dynamicConnection.should.have.property('repeatedValues', connection.repeatedValues);
        dynamicConnection.should.have.property('hookFunction', connection.hookFunction);
      });
      it('should get no errors', function () {
        expect(spy.called).to.be.false;
      });
    });
    describe('parameter connection without optional attributes (property static == false)', function () {
      beforeEach(function () {
        connection.source.memberId = 'sourceMember';
        connection.source.slot = 'testSlotA';
        var sourceComp = document.createElement('sourceElement');
        sourceRuntimeId = 'sourceRuntimeId';
        sourceComp.setAttribute('runtime-id', sourceRuntimeId);
        connection.source.component = sourceComp;
        connection.destination.memberId = 'destinationMember';
        connection.destination.slot = 'testSlotB';
        var destComp = document.createElement('destinationElement');
        destRuntimeId = 'destinationRuntimeId';
        destComp.setAttribute('runtime-id', destRuntimeId);
        connection.destination.component = destComp;
        connection.connectionId = 'con1';
        connection.static = false;
        dynamicConnection = connection.toDynamicConnection();
      });
      afterEach(function () {
        dynamicConnection = null;
      });
      it('should be create a dynamicConnection object', function () {
        expect(dynamicConnection).to.be.not.undefined;
        expect(dynamicConnection).to.be.not.null;
      });
      it('should be create a correct dynamicConnection', function () {
        dynamicConnection.should.not.have.property('connectionId');
        dynamicConnection.should.have.nested.property('source.runtimeId', sourceRuntimeId);
        dynamicConnection.should.have.nested.property('source.slot', connection.source.slot);
        dynamicConnection.should.have.nested.property('destination.runtimeId', destRuntimeId);
        dynamicConnection.should.have.nested.property('destination.slot', connection.destination.slot);
        dynamicConnection.should.have.property('copyValue', true);
        dynamicConnection.should.have.property('repeatedValues', false);
        dynamicConnection.should.have.not.property('hookFunction');
      });
      it('should get no errors', function () {
        expect(spy.called).to.be.false;
      });
    });
    describe('parameter connection is static (property static == true)', function () {
      beforeEach(function () {
        connection.source.memberId = 'sourceMember';
        connection.source.slot = 'testSlotA';
        var sourceComp = document.createElement('sourceElement');
        sourceRuntimeId = 'sourceRuntimeId';
        sourceComp.setAttribute('runtime-id', sourceRuntimeId);
        connection.source.component = sourceComp;
        connection.destination.memberId = 'destinationMember';
        connection.destination.slot = 'testSlotB';
        var destComp = document.createElement('destinationElement');
        destRuntimeId = 'destinationRuntimeId';
        destComp.setAttribute('runtime-id', destRuntimeId);
        connection.destination.component = destComp;
        connection.connectionId = 'con1';
        connection.copyValue = false;
        connection.repeatedValues = true;
        connection.hookFunction = 'testFunction';
        dynamicConnection = connection.toDynamicConnection();
      });
      afterEach(function () {

      });
      it('should be undefined', function () {
        expect(dynamicConnection).to.be.undefined;
      });
      it('should log an error', function () {
        expect(spy.calledOnce).to.be.true;
        expect(spy.calledWith(
          'The connection can not convert to a DynamicConnection, because it is defined as a static connection.'))
          .to.be.true;
      });
    });
  });
});
