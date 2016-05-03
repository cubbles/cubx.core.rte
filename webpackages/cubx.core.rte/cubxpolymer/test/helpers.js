/* globals _,HTMLElement */
/* eslint no-unused-vars: [2, { "varsIgnorePattern": "registerCompoundComponentElement|getTestComponentCacheEntry|initNewElement"} ] */
'use strict';

function initNewElement (elementName, templateContext, prototype) {
  var crcContainer = getContainer();
  // add to crcContainer
  var elem = createNewElement(elementName, templateContext, prototype);
  crcContainer.appendChild(elem);
}

function getContainer () {
  var crcContainer = document.querySelector('[cubx-core-crc]');
  if (!crcContainer) {
    // create CRC Container
    var containerEl = document.createElement('div');
    containerEl.setAttribute('cubx-core-crc', undefined);
    document.body.appendChild(containerEl);
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

  CubxPolymer(prototype);

  var el = document.createElement('div');
  el.innerHTML = '<dom-module id="' + elementName + '" >' +
    '<template>' + templateContext + '</template>' +
    '</dom-module>';

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
