'use strict';
/**
 * Created by pwr on 09.02.2015.
 */

window.cubx = window.cubx ? window.cubx : {};
window.cubx.amd = window.cubx.amd ? window.cubx.amd : {};
window.cubx.amd.define([ 'crcLoader',
    'jqueryLoader' ],
  function (crcLoader, $) {
    describe('CRCLoader', function () {
      /*
       * Testcases
       */

      describe('#provides init values as expected.', function () {
        before(function () {
          window.cubx.CRCInit = { 'rootDependencies': [] };
          crcLoader.setCRCBaseUrl('test-url');
        });

        it('should return the passed CRCBaseUrl', function () {
          expect(crcLoader.getCRCBaseUrl()).to.be.equal('test-url');
        });

        after(function () {
        });
      });
    });
  });
