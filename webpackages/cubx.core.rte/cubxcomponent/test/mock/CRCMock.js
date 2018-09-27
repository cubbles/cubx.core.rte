/* globals CustomEvent */
'use strict';

if (!window.cubx) {
  window.cubx = {};
}
if (!window.cubx.CRC) {
  window.cubx.CRC = {};
}

window.cubx.EventFactory = function () {
};

window.cubx.EventFactory.types = {};
window.cubx.EventFactory.types.CIF_MODEL_CHANGE = 'cifModelChange';
window.cubx.EventFactory.types.COMPONENT_READY = 'componentReady';
window.cubx.EventFactory.types.CIF_READY = 'cifReady';
window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY = 'cifDomUpdateReady';
window.cubx.EventFactory.types.CIF_INIT_START = 'cifInitStart';
window.cubx.EventFactory.types.CIF_INIT_READY = 'cifInitReady';
window.cubx.EventFactory.types.COMPONENT_CREATED = 'componentCreated';
window.cubx.EventFactory.types.CIF_ALL_COMPONENTS_READY = 'cifAllComponentsReady';

window.cubx.EventFactory.prototype.createModelChangePayloadObject = function (slotname, payload, connectionHook) {
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

window.cubx.EventFactory.prototype.createEvent = function (type, detail) {
  var evt;
  switch (type) {
    case window.cubx.EventFactory.types.CIF_MODEL_CHANGE:
      evt = new CustomEvent(type, { bubbles: true, detail: detail });
      break;
    case window.cubx.EventFactory.types.COMPONENT_READY:
      evt = new CustomEvent(type, { bubbles: true, detail: detail });
      break;
    case window.cubx.EventFactory.types.CIF_READY:
      evt = new CustomEvent(type, { bubbles: true });
      break;
    case window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY:
      evt = new CustomEvent(type, {bubbles: true});
      break;
    case window.cubx.EventFactory.types.CIF_INIT_START:
      evt = new CustomEvent(type, { bubbles: false });
      break;
    case window.cubx.EventFactory.types.CIF_INIT_READY:
      evt = new CustomEvent(type, { bubbles: false });
      break;
    case window.cubx.EventFactory.types.COMPONENT_CREATED:
      evt = new CustomEvent(type, { bubbles: true, detail: detail });
      break;
    case window.cubx.EventFactory.types.CIF_ALL_COMPONENTS_READY:
      evt = new CustomEvent(type, { bubbles: true });
      break;
    default:
      throw new TypeError('unknowed type: ', type);
  }
  return evt;
}
;

window.cubx.CRC.getCache = function () {
  var cache = {};
  cache.getComponentCacheEntry = function (key) {
    return getCacheEntry();
  };
  cache.getAllComponents = function () {
    return [];
  };
  return cache;
};
window.cubx.CRC.getCRCElement = function () {
  return document.querySelector('[cubx-core-crc]');
};

window.cubx.CRC.isReady = function () {
  return true;
};

window.cubx.CRC.getRuntimeMode = function () {
  return 'dev';
};

function getCacheEntry () {
  return window.componentCacheEntry;
}
