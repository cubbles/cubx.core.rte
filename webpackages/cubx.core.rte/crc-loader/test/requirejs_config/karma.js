(function () {
  'use strict';
  // configure requireJS to run with karma
  window.cubx.amd.require.config({
    baseUrl: '/base',
    paths: {
      'crcLoader': 'modules/crcLoader/CRCLoader',
      'jqueryLoader': 'modules/jqueryLoader/jqueryLoader',
      'jquery': 'modules/jqueryLoader/jquery-1.11.1.min',
      'dependencyTagTransformer': 'modules/dependencyTagTransformer/dependencyTagTransformer',
      'polyfills': 'modules/polyfills/polyfills',
      'es6promise': '/modules/ES6Promise/es6-promise-polyfill',
      // text plugin only needed for tests right now
      'text': 'test/vendor/text/text',
      // unit tests
      'unit': 'test/unit'
    }
  });
})();
