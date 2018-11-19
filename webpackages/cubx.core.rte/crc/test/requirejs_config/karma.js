(function () {
  'use strict';

  // configure requireJS to run with karma
  window.cubx.amd.require.config({
    baseUrl: '/base',
    paths: {
      'CRC': 'crc/modules/crc/CRC',
      'dependencyManager': 'crc/modules/dependencyManager/depMgr',
      'text': 'crc/modules/text/text',
      'utils': 'crc/modules/utils/utils',
      'cache': 'crc/modules/cache/cache',
      'eventFactory': 'crc/modules/eventFactory/eventFactory',
      'componentResolver': 'crc/modules/componentResolver/componentResolver',
      'responseCache': 'crc/modules/responseCache/responseCache',
      'axios': 'crc/modules/axios/axios.min',
      'dependencyTree': 'crc/modules/dependencyTree/dependencyTree',
      // unit tests
      'unit': 'crc/test/unit'
    }
  });
})();
