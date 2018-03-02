/* globals HTMLElement, CubxComponent, guid, customElements */
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
    document.head.appendChild(link);
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

function initNewElement (elementName, prototype, id) {
  var crcContainer = getContainer();
  // add to crcContainer
  var elem = createNewElement(elementName, prototype);
  if (id) {
    elem.id = id;
    elem.setAttribute('member-id', id);
  }
  document.addEventListener(window.cubx.EventFactory.types.COMPONENT_READY, function (evt) {
    if (evt.detail.runtimeId === elem.getAttribute('runtime-id')) {
      crcContainer.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
    }
  });
  crcContainer.appendChild(elem);
  return elem;
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
  function getConstructor () {
    var CompoundComponentClass = function () {
      var htmlEl = HTMLElement.call(this);
      var me;
      if (htmlEl) {
        me = htmlEl;
      } else {
        me = this;
      }
      Object.assign(me, window.cubx.cif.compoundComponent);
      me.createdCallback();
      return me;
    };

    Object.setPrototypeOf(CompoundComponentClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(CompoundComponentClass, HTMLElement);
    return CompoundComponentClass;
  }
  var constructor = customElements.get(name);
  if (!constructor) {
    constructor = getConstructor();
    customElements.define(name, constructor);
  }
  return constructor;
}

(function () {
  function getConstrunctorConnection () {
    var ConnectionClass = function () {
      return HTMLElement.call(this);
    };

    ConnectionClass.prototype.setSource = function (slot) {
      this.setAttribute('source', slot);
    };
    ConnectionClass.prototype.getSource = function () {
      return this.getAttribute('source');
    };
    ConnectionClass.prototype.setDestination = function (slot, memberIndex) {
      var destination = memberIndex != null ? memberIndex + ':' + slot : 'parent:' + slot;
      this.setAttribute('destination', destination);
    };
    ConnectionClass.prototype.getDestination = function () {
      return this.getAttribute('destination');
    };
    ConnectionClass.prototype.setType = function (type) {
      this.setAttribute('type', type);
    };
    ConnectionClass.prototype.getType = function () {
      return this.getAttribute('type');
    };
    ConnectionClass.prototype.setConnectionId = function (connectionId) {
      this.setAttribute('connection-id', connectionId);
    };
    ConnectionClass.prototype.getConnectionId = function () {
      return this.getAttribute('connection-id');
    };
    ConnectionClass.prototype.setCopyValue = function (copyValue) {
      this.setAttribute('copy-value', copyValue);
    };
    ConnectionClass.prototype.getCopyValue = function () {
      return this.getAttribute('copy-value');
    };
    ConnectionClass.prototype.setRepeatedValues = function (repeatedValues) {
      this.setAttribute('repeated-values', repeatedValues);
    };
    ConnectionClass.prototype.getRepeatedValues = function () {
      return this.getAttribute('repeated-values');
    };
    ConnectionClass.prototype.setHookFunction = function (hook) {
      this.setAttribute('hook-function', hook);
    };
    ConnectionClass.prototype.getHookFunction = function () {
      return this.getAttribute('hook-function');
    };
    Object.setPrototypeOf(ConnectionClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(ConnectionClass, HTMLElement);
    return ConnectionClass;
  }
  if (!customElements.get('cubx-core-connection')) {
    customElements.define('cubx-core-connection', getConstrunctorConnection());
    window.cubx._connectionElement = getConstrunctorConnection();
  }
  function getConstructorConnections () {
    var ConnectionsClass = function () {
      return HTMLElement.call(this);
    };

    ConnectionsClass.prototype.createdCallback = function () {
      this.style.display = 'none';
    };
    Object.setPrototypeOf(ConnectionsClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(ConnectionsClass, HTMLElement);
    return ConnectionsClass;
  }
  if (!customElements.get('cubx-core-connections')) {
    customElements.define('cubx-core-connections', getConstructorConnections());
    window.cubx._connectionsElement = getConstructorConnections();
  }
})();

(function () {
  function getConstructorInit () {
    var InitClass = function () {
      return HTMLElement.call(this);
    };

    InitClass.prototype.createdCallback = function () {
      this.style.display = 'none';
    };
    Object.setPrototypeOf(InitClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(InitClass, HTMLElement);
    return InitClass;
  }
  if (!customElements.get('cubx-core-init')) {
    customElements.define('cubx-core-init', getConstructorInit());
    window.cubx._initSlot = getConstructorInit();
  }
  function getConstructorSlotInit () {
    var SlotInitClass = function () {
      return HTMLElement.call(this);
    };

    SlotInitClass.prototype.setSlot = function (slot) {
      this.setAttribute('slot', slot);
    };
    SlotInitClass.prototype.getSlot = function () {
      return this.getAttribute('slot');
    };
    SlotInitClass.prototype.setMember = function (member) {
      this.setAttribute('member', member);
    };
    SlotInitClass.prototype.getMember = function () {
      return this.getAttribute('member');
    };
    SlotInitClass.prototype.setOrder = function (order) {
      this.setAttribute('order', order);
    };
    SlotInitClass.prototype.getOrder = function () {
      return this.getAttribute('order');
    };
    SlotInitClass.prototype.getType = function () {
      return this.getAttribute('type');
    };
    SlotInitClass.prototype.setType = function (type) {
      this.setAttribute('type', type);
    };
    SlotInitClass.prototype.getDeepLevel = function () {
      return this.getAttribute('deeplevel');
    };
    SlotInitClass.prototype.setDeepLevel = function (deeplevel) {
      this.setAttribute('deeplevel', deeplevel);
    };
    Object.setPrototypeOf(SlotInitClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(SlotInitClass, HTMLElement);
    return SlotInitClass;
  }
  if (!customElements.get('cubx-core-slot-init')) {
    customElements.define('cubx-core-slot-init', getConstructorSlotInit());
    window.cubx._slotInitElement = getConstructorInit();
  }
})();
