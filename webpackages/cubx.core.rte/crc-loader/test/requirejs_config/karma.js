(function () {
  'use strict';
  // configure requireJS to run with karma
  window.cubx.amd.require.config({
    baseUrl: '/base',
    paths: {
      'crcLoader': 'modules/crcLoader/CRCLoader',
      'jqueryLoader': 'modules/jqueryLoader/jqueryLoader',
      'jquery': 'modules/jqueryLoader/jquery-1.11.1.min',
      // text plugin only needed for tests right now
      'text': 'test/vendor/text/text',
      // unit tests
      'unit': 'test/unit'
    }
  });
})();
