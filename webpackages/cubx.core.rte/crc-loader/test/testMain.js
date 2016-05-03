/* globals mocha, mochaPhantomJS */
/**
 * Created by pwr on 05.02.2015.
 */

(function () {
  'use strict';

  // define all tests that should be performed (relative to test/index.html)
  var tests = [
    'unit/CRCLoader_test'
  ];

  // get all tests via requireJS and run them
  window.cubx.amd.require(tests, function () {
    // run tests
    mocha.checkLeaks();
    if (window.mochaPhantomJS) {
      mochaPhantomJS.run();
    } else {
      mocha.run();
    }
    console.log('done');
  });
})();
