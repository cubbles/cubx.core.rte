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
  var tests = [
    'unit/CRCLoader_test',
    'unit/CRCLoader_helpers_test',
    'unit/dependencyTagTransformer_test'
  ];

  // get all tests via requireJS and run them
  window.cubx.amd.require(tests, function () {
    // run tests
    mocha.checkLeaks();
    mocha.run();
    console.log('done');
  });
})();
