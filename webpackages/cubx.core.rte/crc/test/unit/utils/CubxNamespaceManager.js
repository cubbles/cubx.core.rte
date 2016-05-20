/**
 * Created by hrbu on 11.11.2015.
 */
/**
 * Utility to manage the CubxNamespace.
 *
 * @module CubxNamespace
 */
window.cubx.amd.define([], function () {
  'use strict';

  var CubxNamespace = function () {
  };

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------                 Public Methods               ---------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Reset the namespace
   * @memberOf CubxNamespace
   */
  CubxNamespace.prototype.resetNamespace = function (crc, message) {
    // console.log('CubxNamespace.resetNamespace(' + crc + ', ' + message + ')');
    window.cubx = {
      amd: window.cubx.amd,
      utils: {
        get: function (obj, key) {
          return key.split('.').reduce(function (o, x) {
            return (typeof o === 'undefined' || o === null) ? o : o[ x ];
          }, obj);
        }
      },
      CRCInit: {
        // rteWebpackageId: 'cubx.runtime',
        webpackageBaseUrl: '/',
        loadCIF: true,
        rootDependencies: [],
        runtimeMode: 'dev'
      }
    };
    if (crc) {
      window.cubx.CRC = crc;
    }
  };

  //
  return new CubxNamespace();
});
