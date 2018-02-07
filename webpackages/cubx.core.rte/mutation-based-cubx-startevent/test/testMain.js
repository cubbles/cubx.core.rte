/* globals mocha mochaPhantomJS */
(function () {
  'use strict';
  if (!window.cubx) {
    window.cubx = {};
  }
  // set global variable window.cif
  if (!window.cubx.cif) {
    window.cubx.cif = {};
  }

  console.log('testing...');
  mocha.checkLeaks();

  if (window.mochaPhantomJS) {
    mochaPhantomJS.run();
  } else {
    mocha.run();
  }

  console.log('done');
})();
