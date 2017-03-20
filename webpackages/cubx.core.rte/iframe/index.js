/* global location, MutationObserver */
(function () {
  'use strict';

  var lastHeight = 0;
  var iframeId = $_GET('iframe-id');
  var webpackageId = $_GET('webpackage-id');
  var artifactId = $_GET('artifact-id');
  var inits = $_GET('inits');
  var dependencies = $_GET('dependencies');

  /**
   * Create a 'cubx-core-slot-init' to define a slot initialization
   * @param {string} slotName - Name of the slot to be initialized
   * @param {object} slotValue - Value of the slot
   * @returns {Element} 'cubx-core-slot-init' element to initialize a component's slot
   */
  function _createCoreSlotInitElement (slotName, slotValue) {
    var coreSlotInit = document.createElement('cubx-core-slot-init');
    coreSlotInit.setAttribute('slot', slotName);
    coreSlotInit.textContent = JSON.stringify(slotValue);
    return coreSlotInit;
  }

  /**
   * Create a 'cubx-core-init' html element using a JSON
   * @param {object} inits - Object defining the slots' inits
   * @returns {Element} 'cubx-core-init' element to initialize a component
   */
  function _createCoreInitElement (inits) {
    var coreInit = document.createElement('cubx-core-init');
    coreInit.style.display = 'none';
    for (var key in inits) {
      coreInit.appendChild(_createCoreSlotInitElement(key, inits[key]));
    }
    return coreInit;
  }

  /**
   * Dispatch 'componentAppend' event so that the CRC starts working
   */
  function _dispatchComponentAppendEvent () {
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent('componentAppend', true, true, {});
    document.dispatchEvent(event);
  }

  /**
   * Post a message to the iframe parent containing the offsetHeight of the iframe content
   */
  function _postIframeHeight () {
    var component = document.querySelector(artifactId);
    if (component) {
      var newHeight = component.scrollHeight;
      if (newHeight !== lastHeight) {
        window.parent.postMessage(
          {
            iframeHeight: newHeight,
            id: iframeId
          },
          '*'
        );
        lastHeight = newHeight;
      }
    }
  }

  /**
   * Add a MutationObserver to call the 'postIframeHeight' method when new nodes are added to the
   * body or when the body data changes.
   */
  function _addMutationObserver () {
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        _postIframeHeight();
      });
    });

    var targetNode = document.body;
    observer.observe(targetNode, { childList: true, subtree: true, attributes: true });
  }

  /**
   * Indicates whether the webpackageId and the artifactId provided as url parameters have the
   * correct syntax
   * @returns {boolean}
   */
  function _validComponentParameters () {
    var validParameters = true;
    if (webpackageId && artifactId) {
      var pattern = new RegExp('^([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*)(\\.([a-z0-9]+||([a-z0-9]+[a-z0-9-][a-z0-9]+)*))*[@](\\d+)(\\.[\\d]+)*(-SNAPSHOT)?');
      if (!pattern.test(webpackageId)) {
        console.error('The webpackage-id is invalid. It should follow the pattern "webpackageName@webpackageVersion", eg. my-webpackage@3.1.1-SNAPSHOT');
        validParameters = false;
      }
      pattern = new RegExp('^[a-z0-9]+(-[a-z0-9]+)+$');
      if (!pattern.test(artifactId)) {
        console.error('The artifact-id is invalid. It should be lowercase and dash separated, eg. my-component');
        validParameters = false;
      }
      return validParameters;
    }
    return false;
  }

  /**
   * Create 'rootDependencies' array to initialize the 'window.cubx' object
   * @param {Array} dependencies - Dependencies to be loaded, e.g. [{"webpackageId":"bootstrap-3.3.5@1.1.0","artifactId":"bootstrap"}]
   * @returns {Array} 'rootDependencies' array according to CRCInit definition
   */
  function _createRootDependencies (dependencies) {
    var rootDependencies = [];
    for (var i = 0; i < dependencies.length; i++) {
      rootDependencies.push(
        {
          webpackageId: dependencies[i]['webpackage-id'],
          artifactId: dependencies[i]['artifact-id']
        }
      );
    }
    return rootDependencies;
  }

  /**
   * Create a script element
   * @param {Array} attributes - Attributes to be set to the script element
   * @param {function} cb - Callback function to be called when script has loaded
   * @returns {Element} Created script element
   */
  function _createScriptElement (attributes, cb) {
    var scriptElement = document.createElement('script');
    if (attributes) {
      for (var at in attributes) {
        scriptElement.setAttribute(at, attributes[at]);
      }
    }
    if (cb) {
      scriptElement.onload = function () {
        cb.call(this);
      }.bind(this);
    }
    scriptElement.async = false;
    scriptElement.type = 'text/javascript';
    return scriptElement;
  }

  /**
   * Read url get parameters, similar to PHP.
   * Source: https://www.creativejuiz.fr/blog/en/javascript-en/read-url-get-parameters-with-javascript
   * @param {string} param name of the parameter to read
   * @returns {*} the value of the parameter or an empty object if the parameter was not in the url
   */
  function $_GET (param) {
    var vars = {};
    window.location.href.replace(location.hash, '').replace(
      /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
      function (m, key, value) { // callback
        vars[key] = value !== undefined ? value : '';
      }
    );
    if (param) {
      return vars[param] ? vars[param] : null;
    }
    return vars;
  }

  /**
   * Create and append the associated html element for a component
   */
  function appendComponent () {
    if (_validComponentParameters()) {
      var component = document.createElement(artifactId);
      component.setAttribute('cubx-webpackage-id', webpackageId);
      if (inits) {
        inits = decodeURIComponent(inits);
        if (inits.indexOf('\'') >= 0) {
          inits = inits.replace(/'/gi, '"');
        }
        inits = JSON.parse(inits);
        component.appendChild(_createCoreInitElement(inits));
      }
      if (iframeId) {
        _addMutationObserver();
      }
      document.querySelector('body').appendChild(component);
      _dispatchComponentAppendEvent();
    }
  }

  /**
   * Add the dependencies provided as url parameter to the window.cubx object
   */
  function addRootDependencies () {
    if (dependencies) {
      dependencies = decodeURIComponent(dependencies);
      if (dependencies.indexOf('\'') >= 0) {
        dependencies = dependencies.replace(/'/gi, '"');
      }
      window.cubx = {CRCInit: {rootDependencies: _createRootDependencies(JSON.parse(dependencies))}};
    }
  }

  /**
   * Inject the crcLoader and webcomponents-lite scripts to the head
   */
  function injectHeadScripts () {
    var rteWebpackageId;
    var iframeURI = document.baseURI || location.href;
    var initIndex = iframeURI.indexOf('cubx.core.rte@');
    if (initIndex > -1) {
      rteWebpackageId = iframeURI.substring(initIndex);
      rteWebpackageId = rteWebpackageId.substring(0, rteWebpackageId.indexOf('/'));
    }
    //
    var scriptElement = _createScriptElement(
      {
        'src': '../../' + rteWebpackageId + '/webcomponents-lite/webcomponents-lite.js'
      },
      _dispatchComponentAppendEvent
    );

    document.head.appendChild(scriptElement);
    scriptElement = _createScriptElement(
      {
        'src': '../../' + rteWebpackageId + '/crc-loader/js/main.js',
        'data-crcinit-loadcif': 'true',
        'data-cubx-startevent': 'componentAppend'
      },
      _dispatchComponentAppendEvent
    );
    document.head.appendChild(scriptElement);
  }

  appendComponent();
  addRootDependencies();
  injectHeadScripts();
})();
