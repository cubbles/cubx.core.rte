(function () {
  'use strict';

  // configure requireJS to run with karma
  window.cubx.amd.require.config({
    baseUrl: '/base',
    paths: {
      'CRC': 'crc/modules/crc/CRC',
      'dependencyManager': 'crc/modules/dependencyManager/depMgr',
      'storageManager': 'crc/modules/storageManager/storageManager',
      'text': 'crc/modules/text/text',
      'utils': 'crc/modules/utils/utils',
      'cache': 'crc/modules/cache/cache',
      'eventFactory': 'crc/modules/eventFactory/eventFactory',
      'componentResolver': 'crc/modules/componentResolver/componentResolver',
      'responseCache': 'crc/modules/responseCache/responseCache',
      // modules needed for test from crc-loader
      'jqueryLoader': 'crc-loader/modules/jqueryLoader/jqueryLoader',
      'jquery': 'crc-loader/modules/jqueryLoader/jquery-1.11.1.min',
      // unit tests
      'unit': 'crc/test/unit'
    }
  });
})();
