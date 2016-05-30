'use strict';
before(function () {
  var container = document.querySelector('[cubx-core-crc]');
  var rootContext = window.cubx.cif.cif._rootContext;
  container.Context = rootContext;
});
