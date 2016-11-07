(function () {
  'use strict';

  /**
   * Create a 'cubx-core-slot-init' to define a slot initialization
   * @param {string} slotName - Name of the slot to be initialized
   * @param {object} slotValue - Value of the slot
   * @returns {Element} 'cubx-core-slot-init' element to initialize a component's slot
   */
  var createCoreSlotInitElement = function (slotName, slotValue) {
    var coreSlotInit = document.createElement('cubx-core-slot-init');
    coreSlotInit.setAttribute('slot', slotName);
    coreSlotInit.textContent = JSON.stringify(slotValue);
    return coreSlotInit;
  };

  /**
   * Create a 'cubx-core-init' html element using a JSON
   * @param {object} inits - Object defining the slots' inits
   * @returns {Element} 'cubx-core-init' element to initialize a component
   */
  var createCoreInitElement = function (inits) {
    var coreInit = document.createElement('cubx-core-init');
    coreInit.style.display = 'none';
    for (var key in inits) {
      coreInit.appendChild(createCoreSlotInitElement(key, inits[key]));
    }
    return coreInit;
  };

  /**
   * Dispatch 'componentReady' event so that the CRC starts working
   */
  var dispatchComponentReadyEvent = function () {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('componentReady', true, true, {});
    document.dispatchEvent(event);
  };

  /**
   * Create and append associated html element for a component
   * @param {string} webpackageId - webpackage-id of the component (e.g. my.package@1.0)
   * @param {string} artifactId - artifact-id of the component (e.g. my-component)
   * @param {array} inits - Array containing initializations of the component's slots
   */
  var appendComponent = function (webpackageId, artifactId, inits) {
    var component = document.createElement(artifactId);
    component.setAttribute('cubx-webpackage-id', webpackageId);
    if (inits) {
      component.appendChild(createCoreInitElement(inits));
    }
    document.querySelector('body').appendChild(component);
    dispatchComponentReadyEvent();
  };

  /**
   * Read url get parameters, similar to PHP.
   * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
   * @param {string} param name of the parameter to read
   * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
   */
  var $_GET = function (param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace(
      /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
      function( m, key, value ) { // callback
        vars[key] = value !== undefined ? value : '';
      }
    );
    if ( param ) {
      return vars[param] ? vars[param] : null;
    }
    return vars;
  };

  var webpackageId = $_GET('webpackage-id');
  var artifactId = $_GET('artifact-id');

  if (webpackageId && artifactId) {
    var validParameters = true;
    var inits = decodeURIComponent($_GET('inits'));
    if (inits.indexOf('\'') >= 0) {
      inits = inits.replace(/'/gi, '"');
    };
    var pattern = new RegExp("^([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*)(\\.([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*))*[@](\\d+)(\\.[\\d]+)*(-SNAPSHOT)?");
    if (!pattern.test(webpackageId)) {
      console.error('The webpackage-id is invalid. It should follow the pattern "webpackageName@webpackageVersion, eg. my-webpackage@3.1.1-SNAPSHOT');
      validParameters = false;
    }
    pattern = new RegExp("^[a-z0-9]+(-[a-z0-9]+)+$");
    if (!pattern.test(artifactId)) {
      console.error('The artifact-id is invalid. It should be lowercase and dash separated, eg. my-component');
      validParameters = false;
    }
    if (validParameters) {
      appendComponent(
        webpackageId,
        artifactId,
        JSON.parse(inits)
      );
    }
  }

}());
