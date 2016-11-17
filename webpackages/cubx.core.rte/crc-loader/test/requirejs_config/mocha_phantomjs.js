/**
 * Created by pwr on 05.02.2015.
 */

(function () {
  'use strict';

  window.cubx.amd.require.config({
    baseUrl: '../',
    paths: {
      'crcLoader': 'modules/crcLoader/CRCLoader',
      'crc': 'test/mocks/crcMock',
      'dependencyTagTransformer': 'modules/dependencyTagTransformer/dependencyTagTransformer',
      'polyfills': 'modules/polyfills/polyfills',
      // text plugin only needed for tests right now
      'text': 'test/vendor/text/text',
      // unit tests
      'unit': 'test/unit'
    }
  });
})();
