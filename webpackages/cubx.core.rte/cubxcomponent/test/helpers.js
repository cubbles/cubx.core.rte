/* globals _,HTMLElement, CubxComponent */
/* eslint no-unused-vars: [2, { "varsIgnorePattern": "registerCompoundComponentElement|getTestComponentCacheEntry|initNewElement"} ] */
'use strict';

function initNewElement (elementName, templateContext, prototype) {
  var crcContainer = getContainer();
  // add to crcContainer
  var elem = createNewElement(elementName, templateContext, prototype);
  crcContainer.appendChild(elem);
  crcContainer.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
}

function getContainer () {
  var crcContainer = document.querySelector('[cubx-core-crc]');
  if (!crcContainer) {
    // create CRC Container
    var containerEl = document.createElement('div');
    containerEl.setAttribute('cubx-core-crc', undefined);
    document.body.appendChild(containerEl);
    window.cubx.cif.cif._rootContext = new window.cubx.cif.Context(containerEl);
    containerEl.Context = window.cubx.cif.cif._rootContext;
    crcContainer = containerEl;
  }
  return crcContainer;
}

function createNewElement (elementName, templateContext, prototype) {
  if (elementName.indexOf('-') === -1) {
    throw new SyntaxError('Tagname must enclosed a "-" character.');
  }

  if (!templateContext) {
    templateContext = '<span>Base Component Test</span>';
  }

  if (!prototype) {
    prototype = { is: elementName };
  }
  if (!prototype.is) {
    prototype.is = elementName;
  }

  var el = document.createElement('div');

  el.innerHTML = '<template id="' + elementName + '" >' +
     templateContext +
    '</template>';
  CubxComponent(prototype);

  document.body.appendChild(el);

  // add to crcContainer
  return document.createElement(elementName);
}

function getTestComponentCacheEntry () {
  if (!window.componentCacheEntries) {
    window.componentCacheEntries = {};
  }
  return window.componentCacheEntries;
}

/**
 * Register new element for handling compound components
 * @memberOf CIF
 * @param {string} name
 * @return {function}
 * @private
 */
function registerCompoundComponentElement (name) {
  if (typeof name !== 'string' || (typeof name === 'string' && name.indexOf('-') < 1)) {
    throw new TypeError('parameter name needs to be of type "string" and needs to contain a "-"');
  }

  var CompoundComponentPrototype = Object.create(HTMLElement.prototype);
  // extend prototype with specific CompoundComponent properties
  _.merge(CompoundComponentPrototype, window.cubx.cif.compoundComponent);

  var constructor = document.registerElement(name, { prototype: CompoundComponentPrototype });
  return constructor;
}

(function () {
  var ConnectionPrototype = Object.create(HTMLElement.prototype);
  ConnectionPrototype.setSource = function (slot) {
    this.setAttribute('source', slot);
  };
  ConnectionPrototype.getSource = function () {
    return this.getAttribute('source');
  };
  ConnectionPrototype.setDestination = function (slot, memberIndex) {
    var destination = memberIndex != null ? memberIndex + ':' + slot : 'parent:' + slot;
    this.setAttribute('destination', destination);
  };
  ConnectionPrototype.getDestination = function () {
    return this.getAttribute('destination');
  };
  ConnectionPrototype.setType = function (type) {
    this.setAttribute('type', type);
  };
  ConnectionPrototype.getType = function () {
    return this.getAttribute('type');
  };
  ConnectionPrototype.setConnectionId = function (connectionId) {
    this.setAttribute('connection-id', connectionId);
  };
  ConnectionPrototype.getConnectionId = function () {
    return this.getAttribute('connection-id');
  };
  ConnectionPrototype.setCopyValue = function (copyValue) {
    this.setAttribute('copy-value', copyValue);
  };
  ConnectionPrototype.getCopyValue = function () {
    return this.getAttribute('copy-value');
  };
  ConnectionPrototype.setRepeatedValues = function (repeatedValues) {
    this.setAttribute('repeated-values', repeatedValues);
  };
  ConnectionPrototype.getRepeatedValues = function () {
    return this.getAttribute('repeated-values');
  };
  ConnectionPrototype.setHookFunction = function (hook) {
    this.setAttribute('hook-function', hook);
  };
  ConnectionPrototype.getHookFunction = function () {
    return this.getAttribute('hook-function');
  };
  window.cubx._connectionElement = document.registerElement('cubx-core-connection', { prototype: ConnectionPrototype });

  var ConnectionsPrototype = Object.create(HTMLElement.prototype);
  ConnectionsPrototype.createdCallback = function () {
    this.style.display = 'none';
  };
  window.cubx._connectionsElement = document.registerElement('cubx-core-connections', { prototype: ConnectionsPrototype });
})();

(function () {
  var InitPrototype = Object.create(HTMLElement.prototype);
  InitPrototype.createdCallback = function () {
    this.style.display = 'none';
  };
  window.cubx._initSlot = document.registerElement('cubx-core-init', { prototype: InitPrototype });

  var InitSlotPrototype = Object.create(HTMLElement.prototype);
  InitSlotPrototype.setSlot = function (slot) {
    this.setAttribute('slot', slot);
  };
  InitSlotPrototype.getSlot = function () {
    return this.getAttribute('slot');
  };
  InitSlotPrototype.setMember = function (member) {
    this.setAttribute('member', member);
  };
  InitSlotPrototype.getMember = function () {
    return this.getAttribute('member');
  };
  InitSlotPrototype.setOrder = function (order) {
    this.setAttribute('order', order);
  };
  InitSlotPrototype.getOrder = function () {
    return this.getAttribute('order');
  };
  InitSlotPrototype.getType = function () {
    return this.getAttribute('type');
  };
  InitSlotPrototype.setType = function (type) {
    this.setAttribute('type', type);
  };
  InitSlotPrototype.getDeepLevel = function () {
    return this.getAttribute('deeplevel');
  };
  InitSlotPrototype.setDeepLevel = function (deeplevel) {
    this.setAttribute('deeplevel', deeplevel);
  };

  window.cubx._slotInitElement = document.registerElement('cubx-core-slot-init', { prototype: InitSlotPrototype });
})();
