(function () {
  'use strict';
  window.cubx.amd.define([], function () {
    var CRCMock = function () {
      console.log('init CRCMock');
    };
    CRCMock.prototype.init = function () { return; }; // eslint-disable-line no-useless-return
    CRCMock.prototype.getDependencyMgr = function () {
      return {
        init: function () { return; }, // eslint-disable-line no-useless-return
        run: function () { return; }// eslint-disable-line no-useless-return
      };
    };
    return new CRCMock();
  });
})();
