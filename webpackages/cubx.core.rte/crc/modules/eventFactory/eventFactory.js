/* globals CustomEvent */
'use strict';
window.cubx.amd.define([], function () {
  /**
   * The EventFactory creates custom events
   * @global
   * @class EventFactory
   * @constructor
   */
  var EventFactory = function () {
  };

  /**
   * Container for event types
   * @memberof EventFactory
   * @namespace EventFactory.types
   */
  EventFactory.types = {};

  /**
   * Constant for crc ready event
   * @memberOf EventFactory types
   * @constant
   * @default
   * @type {string}
   */
  EventFactory.types.CRC_READY = 'crcReady';

  /**
   * Constant for Model Change event type
   * @memberof EventFactory.types
   * @constant
   * @default
   * @type {string}
   */
  EventFactory.types.CIF_MODEL_CHANGE = 'cifModelChange';

  /**
   * Constant for Cif Ready event type
   * @memberof EventFactory.types
   * @constant
   * @default
   * @type {string}
   */
  EventFactory.types.CIF_START = 'cifStart';
  /**
   * Constant for Cif Ready event type
   * @memberof EventFactory.types
   * @constant
   * @default
   * @type {string}
   */
  EventFactory.types.CIF_READY = 'cifReady';

  /**
   * Constant for Cif Dom Update Ready event type
   * @memberof EventFactory.types
   * @constant
   * @default
   * @type {string}
   */
  EventFactory.types.CIF_DOM_UPDATE_READY = 'cifDomUpdateReady';

  /**
   * Constant for cifInitStart event type
   * @constant
   * @default
   * @memberOf EventFactory.types
   * @type {string}
   */
  EventFactory.types.CIF_INIT_START = 'cifInitStart';

  /**
   * Constant for cifInitReady event type
   * @constant
   * @default
   * @memberOf EventFactory.types
   * @type {string}
   */
  EventFactory.types.CIF_INIT_READY = 'cifInitReady';

  /**
   * Constant for cifInitReady event type
   * @constant
   * @default
   * @memberOf EventFactory.types
   * @type {string}
   */
  EventFactory.types.COMPONENT_READY = 'componentReady';

  /**
   * Constant for cifAllComponentsReady event type
   * @constant
   * @default
   * @memberOf EventFactory
   * @type {string}
   */
  EventFactory.types.CIF_ALL_COMPONENTS_READY = 'cifAllComponentsReady';

  /**
   * Constant for componenCreated event type
   * @constant
   * @default
   * @memberOf EventFactory
   * @type {string}
   */
  EventFactory.types.COMPONENT_CREATED = 'componentCreated';

  /**
   * Create Event of given type
   * @memberOf EventFactory
   * @param {string} type Event Type
   * @param {object} [detail] Object being attached to the created Event
   * @return The created event
   */
  EventFactory.prototype.createEvent = function (type, detail) {
    var event;

    switch (type) { // use switch statement to make it easy to add other event types in the future
      case EventFactory.types.CRC_READY:
        event = new CustomEvent(EventFactory.types.CRC_READY, { bubbles: true });
        break;
      case EventFactory.types.CIF_READY:
        event = new CustomEvent(EventFactory.types.CIF_READY, { bubbles: true });
        break;
      case EventFactory.types.CIF_DOM_UPDATE_READY:
        event = new CustomEvent(EventFactory.types.CIF_DOM_UPDATE_READY, { bubbles: true });
        break;
      case EventFactory.types.CIF_START:
        event = new CustomEvent(EventFactory.types.CIF_START, { bubbles: true });
        break;
      case EventFactory.types.CIF_MODEL_CHANGE:
        if (detail != null && typeof detail === 'object') {
          event = new CustomEvent(EventFactory.types.CIF_MODEL_CHANGE, { bubbles: true, detail: detail });
        } else {
          event = new CustomEvent(EventFactory.types.CIF_MODEL_CHANGE, { bubbles: true });
        }
        break;
      case EventFactory.types.CIF_INIT_START:
        event = new CustomEvent(EventFactory.types.CIF_INIT_START, { bubbles: false });
        break;
      case EventFactory.types.CIF_INIT_READY:
        event = new CustomEvent(EventFactory.types.CIF_INIT_READY, { bubbles: false });
        break;
      case EventFactory.types.COMPONENT_READY:
        event = new CustomEvent(EventFactory.types.COMPONENT_READY, { bubbles: true, detail: detail });
        break;
      case EventFactory.types.COMPONENT_CREATED:
        event = new CustomEvent(EventFactory.types.COMPONENT_CREATED, { bubbles: true, detail: detail });
        break;
      case EventFactory.types.CIF_ALL_COMPONENTS_READY:
        event = new CustomEvent(EventFactory.types.CIF_ALL_COMPONENTS_READY, { bubbles: true });
        break;
      default:
        throw new TypeError('parameter "type" needs to be a valid event type (current param: ' + type);
    }

    return event;
  };

  /**
   * create and return a payloadObject for EventFactory.types.CIF_MODEL_CHANGE
   * @memberOf EventFactory
   * @param {string} slotname name of the slot
   * @param {string} payload payloadObject
   * @param {function} connectionHook connection hook
   * @return {{slot: *, payload: *, connectionHook: *}}
   */
  EventFactory.prototype.createModelChangePayloadObject = function (slotname, payload, connectionHook) {
    if (arguments.length < 2) {
      throw new Error('The first 2 arguments "slotname" and "payload" are necessary');
    }
    if (connectionHook && typeof connectionHook !== 'function') {
      throw new TypeError('The parameter "connectionHook" must be a function');
    }
    return {
      slot: slotname,
      payload: payload,
      connectionHook: connectionHook
    };
  };
  // TODO: replace this with by returning a singleton
  return EventFactory;
});
