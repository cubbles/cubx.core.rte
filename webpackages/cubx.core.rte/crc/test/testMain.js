/* globals mocha */
/**
 * Created by pwr on 05.02.2015.
 */

(function () {
  'use strict';

  /**
   * Make karma.start a empty function to prevent that karma starts before
   * requirejs is ready. In our case karma.start is equivalent to mocha.run,
   * which is called in the callback at the end of this script
   */
  window.__karma__.start = function () {};

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
    'unit/utils_array_test',
    'unit/responseCache_test',
    'unit/dependencyTree_test',
    'unit/depMgrDependencyTreeCreation_test',
    'unit/dependencyTreeModification_test',
    'unit/depMgrParseGlobalResponseCache_test'
  ];

  // get all tests via requireJS and run them
  window.cubx.amd.require(tests, function () {
    // run tests
    console.log('testing...');
    mocha.checkLeaks();
    mocha.run();
    console.log('done');
  });
})();
