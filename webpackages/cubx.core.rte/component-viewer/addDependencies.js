(function () {
  'use strict';

  /**
   * Create 'rootDependencies' array to initialize the 'window.cubx' object
   * @param {Array} dependencies - Dependencies to be loaded, e.g. [{"webpackageId":"bootstrap-3.3.5@1.1.0","artifactId":"bootstrap"}]
   * @returns {Array} 'rootDependencies' array according to CRCInit definition
   */
  var createRootDependencies = function (dependencies){
    var rootDependencies = [];
    for (var i = 0; i < dependencies.length; i++) {
      rootDependencies.push(
        {
          webpackageId : dependencies[i]['webpackage-id'],
          artifactId : dependencies[i]['artifact-id']
        }
      );
    }
    return rootDependencies;
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

  // Add dependencies to 'window.cubx.CRCInit' object
  var dependencies = $_GET('dependencies');
  if (dependencies) {
    window.cubx =  { CRCInit : { rootDependencies: createRootDependencies(JSON.parse(decodeURIComponent(dependencies)))}};
  }

}());
