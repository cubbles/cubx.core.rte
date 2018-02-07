/* globals alert,CustomEvent */
window.cubx.amd.define([ 'CRC',
  'eventFactory',
  'unit/utils/CubxNamespaceManager'
], function (CRC, EventFactory, CubxNamespaceManager) {
  'use strict';

  /**
   * The EventFactory creates custom events
   */
  describe('EventFactory', function () {
    var eventFactory;
    before(function () {
      CubxNamespaceManager.resetNamespace(CRC);
      eventFactory = new EventFactory();
    });
    after(function () {
      CubxNamespaceManager.resetNamespace();
    });

    describe('#createModelChangePayloadObject()', function () {
      var slot;
      var detail;
      var connectionHook;
      describe('create with slot, detail, connectionHook', function () {
        beforeEach(function () {
          slot = 'testslot';
          detail = JSON.stringify({ bar: 'foo' });
          connectionHook = function () {
            alert('hallo');
          };
        });

        it('should create a new PayloadObject object', function () {
          var payloadObject = eventFactory.createModelChangePayloadObject(slot, detail, connectionHook);
          payloadObject.should.exist;
          payloadObject.should.have.property('slot');
          payloadObject.slot.should.a('string');
          payloadObject.slot.should.equals(slot);
          payloadObject.should.have.property('payload');
          payloadObject.payload.should.a('string');
          payloadObject.payload.should.equals(detail);
          payloadObject.should.have.property('connectionHook');
          payloadObject.connectionHook.should.a('function');
          payloadObject.connectionHook.should.equals(connectionHook);
        });
      });
      describe('create with slot, detail', function () {
        beforeEach(function () {
          slot = 'testslot';
          detail = JSON.stringify({ bar: 'foo' });
          connectionHook = function () {
            alert('hallo');
          };
        });

        it('should create a new PayloadObject object', function () {
          var payloadObject = eventFactory.createModelChangePayloadObject(slot, detail);
          payloadObject.should.have.property('slot');
          payloadObject.slot.should.a('string');
          payloadObject.slot.should.equals(slot);
          payloadObject.should.have.property('payload');
          payloadObject.payload.should.a('string');
          payloadObject.payload.should.equals(detail);
          expect(payloadObject.connectionHook).to.be.undefined;
        });
      });
      describe('error handlingl', function () {
        beforeEach(function () {

        });
        it('should be throw an exception just one argument assign', function () {
          slot = 'testslot';
          detail = JSON.stringify({ bar: 'foo' });
          connectionHook = 'hallo';
          expect(function () {
            eventFactory.createModelChangePayloadObject(slot);
          }).to.throw(Error);
        });
        it('should be throw an exception no argument assign', function () {
          slot = 'testslot';
          detail = JSON.stringify({ bar: 'foo' });
          connectionHook = 'hallo';
          expect(function () {
            eventFactory.createModelChangePayloadObject();
          }).to.throw(Error);
        });
        it('connectionHook not a function: should cause an exception', function () {
          slot = 'testslot';
          detail = JSON.stringify({ bar: 'foo' });
          connectionHook = 'hallo';
          expect(function () {
            eventFactory.createModelChangePayloadObject(slot, detail, connectionHook);
          }).to.throw(Error);
        });
      });
    });

    describe('#createEvent', function () {
      var type;

      beforeEach(function () {

      });
      describe('create an event from type EventFactory.types.CIF_READY', function () {
        var detail;
        beforeEach(function () {
          type = EventFactory.types.CIF_READY;
          detail = { foo: 'bar' };
        });
        afterEach(function () {
          detail = null;
        });
        it('should be true, if an event from type EventFactory.types.CIF_READY created', function () {
          var event = eventFactory.createEvent(type, detail);
          event.should.be.exist;
          event.should.be.instanceof(CustomEvent);
          event.should.have.property('detail', null);
          event.should.have.property('type', 'cifReady');
          event.should.have.property('bubbles', true);
        });
      });
      describe('create an event from type EventFactory.types.CIF_DOM_UPDATE_READY', function () {
        var detail;
        beforeEach(function () {
          type = EventFactory.types.CIF_DOM_UPDATE_READY;
          detail = { foo: 'bar' };
        });
        afterEach(function () {
          detail = null;
        });
        it('should be true, if an event from type EventFactory.types.CIF_READYDOM_UPDATE_READY created', function () {
          var event = eventFactory.createEvent(type, detail);
          event.should.be.exist;
          event.should.be.instanceof(CustomEvent);
          event.should.have.property('detail', null);
          event.should.have.property('type', 'cifDomUpdateReady');
          event.should.have.property('bubbles', true);
        });
      });
      describe('create an event from type EventFactory.types.COMPONENT_READY', function () {
        var detail;
        beforeEach(function () {
          type = EventFactory.types.COMPONENT_READY;
          detail = { foo: 'bar' };
        });
        afterEach(function () {
          detail = null;
        });
        it('should be true, if an event from type EventFactory.types.COMPONENT_READY created', function () {
          var event = eventFactory.createEvent(type, detail);
          event.should.be.exist;
          event.should.be.instanceof(CustomEvent);
          event.should.have.property('detail', detail);
          event.should.have.property('type', 'componentReady');
          event.should.have.property('bubbles', true);
        });
      });
      describe('create an event from type EventFactory.types.CIF_ALL_COMPONENTS_READY', function () {
        var detail;
        beforeEach(function () {
          type = EventFactory.types.CIF_ALL_COMPONENTS_READY;
          detail = { foo: 'bar' };
        });
        afterEach(function () {
          detail = null;
        });
        it('should be true, if an event from type EventFactory.types.CIF_ALL_COMPONENTS_READY created',
          function () {
            var event = eventFactory.createEvent(type, detail);
            event.should.be.exist;
            event.should.be.instanceof(CustomEvent);
            event.should.have.property('detail', null);
            event.should.have.property('type', 'cifAllComponentsReady');
            event.should.have.property('bubbles', true);
          });
      });
      describe('create an event from type EventFactory.types.CIF_MODEL_CHANGE', function () {
        var detail;
        beforeEach(function () {
          type = EventFactory.types.CIF_MODEL_CHANGE;
          detail = { foo: 'bar' };
        });
        afterEach(function () {
          detail = null;
        });
        it('should be true, if an event from type EventFactory.types.CIF_MODEL_CHANGE created', function () {
          var event = eventFactory.createEvent(type, detail);
          event.should.be.exist;
          event.should.be.instanceof(CustomEvent);
          event.should.have.deep.property('detail', detail);
          event.should.have.property('type', 'cifModelChange');
          event.should.have.property('bubbles', true);
        });
        it('should be true, if an event from type EventFactory.types.CIF_MODEL_CHANGE created whitout detail', function () {
          var event = eventFactory.createEvent(type);
          event.should.be.exist;
          event.should.be.instanceof(CustomEvent);
          event.should.have.deep.property('detail', null);
          event.should.have.property('type', 'cifModelChange');
          event.should.have.property('bubbles', true);
        });
      });

      describe('create an event from type EventFactory.types.CIF_INIT_START', function () {
        beforeEach(function () {
          type = EventFactory.types.CIF_INIT_START;
        });
        it('should be false, if an event from type EventFactory.types.CIF_INIT_START created',
          function () {
            var event = eventFactory.createEvent(type);
            event.should.be.exist;
            event.should.be.instanceof(CustomEvent);
            event.should.have.deep.property('detail', null);
            event.should.have.property('type', 'cifInitStart');
            event.should.have.property('bubbles', false);
          });
      });

      describe('create an event from type EventFactory.types.CIF_START', function () {
        beforeEach(function () {
          type = EventFactory.types.CIF_START;
        });
        it('should be false, if an event from type EventFactory.types.CIF_START created',
          function () {
            var event = eventFactory.createEvent(type);
            event.should.be.exist;
            event.should.be.instanceof(CustomEvent);
            event.should.have.deep.property('detail', null);
            event.should.have.property('type', 'cifStart');
            event.should.have.property('bubbles', true);
          });
      });
      describe('create an event from type EventFactory.types.CIF_INIT_READY', function () {
        beforeEach(function () {
          type = EventFactory.types.CIF_INIT_READY;
        });
        it('should be false, if an event from type EventFactory.types.CIF_INIT_READY created',
          function () {
            var event = eventFactory.createEvent(type);
            event.should.be.exist;
            event.should.be.instanceof(CustomEvent);
            event.should.have.deep.property('detail', null);
            event.should.have.property('type', 'cifInitReady');
            event.should.have.property('bubbles', false);
          });
      });
      describe('type parameter is unknown', function () {
        var detail;
        beforeEach(function () {
          type = 'notExistent';
          detail = { foo: 'bar' };
        });
        afterEach(function () {
          detail = null;
        });
        it('should be throw a TypeException', function () {
          expect(function () {
            eventFactory.createEvent(type, detail);
          }).throw(TypeError);
        });
      });
      afterEach(function () {
        type = null;
      });
    });
  });
});
