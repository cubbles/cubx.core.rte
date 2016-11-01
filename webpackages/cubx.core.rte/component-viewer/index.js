(function () {
  'use strict';

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
   */
  var appendComponent = function (webpackageId, artifactId) {
    var componentContainer = document.querySelector('body');
    var component = document.createElement(artifactId);
    component.setAttribute('cubx-webpackage-id', webpackageId);
    componentContainer.appendChild(component);
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
    appendComponent(webpackageId, artifactId);
  }

}());
