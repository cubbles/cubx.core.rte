/* globals _,HTMLElement, CubxComponent, guid */
/* eslint no-unused-vars: [2, { "varsIgnorePattern": "registerCompoundComponentElement|getTestComponentCacheEntry|initNewElement|createHtmlImport |createNewElementWithTemplate"} ] */
'use strict';

function createHtmlImport (path) {
  return new Promise(function (resolve, reject) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'import');
    link.setAttribute('href', path);
    link.onload = function () {
      resolve(link);
    };
    setTimeout(function () {
      reject(new Error('Timeout of 200 ms'));
    }, 200);
    document.body.appendChild(link);
  });
}

function initNewElementWithTemplate (elementName, prototype, templatePath) {
  var crcContainer = getContainer();
  // add to crcContainer
  var promise = createNewElementWithTemplate(elementName, prototype, templatePath);
  return promise.then(function (elem) {
    document.addEventListener(window.cubx.EventFactory.types.COMPONENT_READY, function (evt) {
      if (evt.detail.runtimeId === elem.getAttribute('runtime-id')) {
        crcContainer.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
      }
    });
    crcContainer.appendChild(elem);
    return Promise.resolve(elem);
  });
}

function initNewElement (elementName, prototype) {
  var crcContainer = getContainer();
  // add to crcContainer
  var elem = createNewElement(elementName, prototype);
  document.addEventListener(window.cubx.EventFactory.types.COMPONENT_READY, function (evt) {
    if (evt.detail.runtimeId === elem.getAttribute('runtime-id')) {
      crcContainer.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
    }
  });
  crcContainer.appendChild(elem);
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

function createNewElementWithTemplate (elementName, prototype, templatePath) {
  var promise = createHtmlImport(templatePath);
  return promise.then(function () {
    var elem = createNewElement(elementName, prototype);
    return Promise.resolve(elem);
  }).catch(function (err) {
    return Promise.reject(err);
  });
}

function createNewElement (elementName, prototype) {
  if (elementName.indexOf('-') === -1) {
    throw new SyntaxError('Tagname must enclosed a "-" character.');
  }

  if (!prototype) {
    prototype = { is: elementName };
  }
  if (!prototype.is) {
    prototype.is = elementName;
  }

  CubxComponent(prototype);

  // add to crcContainer
  var element = document.createElement(elementName);
  element.setAttribute('runtime-id', guid());
  return element;
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
