(function () {
  'use strict';
  // configure requireJS to run with karma
  window.cubx.amd.require.config({
    baseUrl: '/base',
    paths: {
      'crcLoader': 'modules/crcLoader/CRCLoader',
      'crc': 'test/mocks/crcMock',
      'jqueryLoader': 'modules/jqueryLoader/jqueryLoader',
      'jquery': 'modules/jqueryLoader/jquery-1.11.1.min',
      'dependencyTagTransformer': 'modules/dependencyTagTransformer/dependencyTagTransformer',
      'polyfills': 'modules/polyfills/polyfills',
      // text plugin only needed for tests right now
      'text': 'test/vendor/text/text',
      // unit tests
      'unit': 'test/unit'
    }
  });
})();
