(function () {
  'use strict';
  window.cubx.amd.define([], function () {
    var CRCMock = function () {
      console.log('init CRCMock');
    };
    CRCMock.prototype.init = function () { return; };
    CRCMock.prototype.getDependencyMgr = function () {
      return {
        init: function () { return; },
        run: function () { return; }
      };
    };
    return new CRCMock();
  });
})();
