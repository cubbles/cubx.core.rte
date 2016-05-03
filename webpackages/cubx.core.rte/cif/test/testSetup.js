(function () {
  'use strict';
  if (!window.cubx) {
    window.cubx = {};
  }
  // set global variable window.cif
  window.cubx.cif = {};

  var crcRoot = document.createElement('div');
  crcRoot.setAttribute('cubx-core-crc', null);
  crcRoot.style.visibility = 'hidden';
  crcRoot.setAttribute('id', 'crcRoot');
  document.body.appendChild(crcRoot);
})();
