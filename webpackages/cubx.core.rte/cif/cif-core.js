(function () {
  'use strict';
  if (!window.cubx) {
    window.cubx = {};
  }
  // create global namespace for cif or throw error if there is already a global cif variable set
  if (typeof window.cubx.cif === 'undefined' || window.cubx.cif === null) {
    window.cubx.cif = {};
  } else {
    // set error flag
    window.cubx.__cifError__ = true;
    throw new Error('It seems to be like there is already a Component Integration Framework instance loaded');
  }
  // console.log('init cif-core');
})();
