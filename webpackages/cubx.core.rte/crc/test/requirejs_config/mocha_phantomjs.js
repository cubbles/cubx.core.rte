(function () {
  'use strict';

  // configure requireJS to run inside browser
  window.cubx.amd.require.config({
    baseUrl: '../',
    paths: {
      'CRC': 'modules/crc/CRC',
      'dependencyManager': 'modules/dependencyManager/depMgr',
      'storageManager': 'modules/storageManager/storageManager',
      'text': 'modules/text/text',
      'utils': 'modules/utils/utils',
      'cache': 'modules/cache/cache',
      'componentResolver': 'modules/componentResolver/componentResolver',
      'eventFactory': 'modules/eventFactory/eventFactory',
      'responseCache': 'modules/responseCache/responseCache',
      'manifestConverter': 'modules/manifestConverter/manifestConverter',
      'axios': 'modules/axios/axios.min',
      // modules needed for test from crc-loader
      'jqueryLoader': '../crc-loader/modules/jqueryLoader/jqueryLoader',
      'jquery': '../crc-loader/modules/jqueryLoader/jquery-1.11.1.min',
      // unit tests
      'unit': 'test/unit'
    }
  });
})();
