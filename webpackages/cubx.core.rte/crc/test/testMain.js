/* globals mocha, mochaPhantomJS */
/**
 * Created by pwr on 05.02.2015.
 */

(function () {
  'use strict';

  // define all tests that should be performed (relative to test/index.html)
  // note: don't add .js file endings for test file paths because they will be included as requirejs modules
  var tests = [
    'unit/cache_test',
    'unit/componentResolver_test',
    'unit/CRC_test',
    'unit/depMgrAddToCache_test',
    'unit/CRCComponentResolution_test',
    'unit/depMgr_test',
    'unit/depMgrDependencyResolution_test',
    'unit/eventFactory_test',
    'unit/storageManager_test',
    'unit/utils_array_test'
  ];

  // get all tests via requireJS and run them
  window.cubx.amd.require(tests, function () {
    // run tests
    console.log('testing...');
    mocha.checkLeaks();
    if (window.mochaPhantomJS) {
      mochaPhantomJS.run();
    } else {
      mocha.run();
    }
    console.log('done');
  });
})();
