'use strict';
/*globals cubx*/
/**
 * Defines the CRC Loader RequireJS Module.
 *
 * @module CRCLoader_Module
 */
cubx.amd.define([ 'require', 'jqueryLoader' ], function (require, $) {
  /**
   * The CRC Loader takes care about getting the suitable CRC Version from Server depending on the requested
   * WebPackage.
   *
   * @global
   * @constructor
   */
  var CRCLoader = function () {
    this._crcLoaderResourcesBaseUrl = null;
    this._crcBaseUrl = null;
    this._webpackageBaseUrl = null;
    /**
     * crcRoot Element
     * @type {HTMLElement}
     * @private
     */
    this._crcRoot = null;
  };

  // -----------------------------------------------------------------------------------------------------------
  // --------------------------------   Public Methods ---------------------------------
  // ----------------------------------------------------------------------------------------------------------

  /**
   * Get CRC from server and initialize CRC on local DOM
   * @memberOf CRCLoader
   */
  CRCLoader.prototype.run = function () {
    document.addEventListener('crcDepMgrReady', this._includeMainScript.bind(this));
    var crcContainer = document.querySelector('[cubx-core-crc]');
    if (!crcContainer) {
      crcContainer = document.body;
    }
    this._crcRoot = crcContainer;
    var self = this;
    var action = function () {
      self._addComponentIdsToRootdependencies();
      self._load();
    };
    if (cubx.CRCInit.startEventArrived) {
      action();
    } else {
      document.addEventListener(cubx.CRCInit.startEvent, action);
    }
  };

  CRCLoader.prototype._addComponentIdsToRootdependencies = function () {
    var elements = this._crcRoot.querySelectorAll('[cubx-webpackage-id]');
    if (elements.length > 0 && (!cubx.CRCInit.hasOwnProperty('rootDependencies') || typeof cubx.CRCInit.rootDependencies === 'undefined')) {
      cubx.CRCInit.rootDependencies = [];
    }
    for (var i = 0; i < elements.length; i++) {
      var dependency = elements[ i ].getAttribute('cubx-webpackage-id') + '/' + elements[ i ].tagName.toLowerCase();
      var cubxEndpointId = elements[ i ].getAttribute('cubx-endpoint-id');
      if (cubxEndpointId) {
        dependency += '/' + cubxEndpointId;
      }
      cubx.CRCInit.rootDependencies.push(dependency);
    }
  };

  CRCLoader.prototype._load = function () {
    var crcLoader = this;
    var crcModuleName = crcLoader._crcBaseUrl + '/modules/crc/CRC.js';
    var me = this;
    // get CRC
    $.getScript(crcLoader._crcBaseUrl + '/js/main.js', function () {
      require([ crcModuleName ], function (crc) {
        window.cubx.CRC = crc;

        // select crcRoot element and init crc on it
        window.cubx.CRC.init(me._crcRoot);
        // now run resolve the dependencies
        var depMgr = crc.getDependencyMgr();
        depMgr.init();
        depMgr.run();
      });
    });
  };

  /**
   * Get the base url to crc
   * @memberOf CRCLoader
   */
  CRCLoader.prototype.getCRCBaseUrl = function () {
    return this._crcBaseUrl;
  };

  /**
   * Get the URL of the used Base
   * @return {string}
   */
  CRCLoader.prototype.getWebpackageBaseUrl = function () {
    return this._webpackageBaseUrl;
  };

  /**
   * Set the URL of the used Base
   * @param {string} url The Base URL
   */
  CRCLoader.prototype.setWebpackageBaseUrl = function (url) {
    this._webpackageBaseUrl = url;
  };

  /**
   * Set the base-URL for crcLoader-resources
   * @param {string} url The URL
   */
  CRCLoader.prototype.setCRCLoaderResourcesBaseUrl = function (url) {
    this._crcLoaderResourcesBaseUrl = url;
  };

  /**
   * Set the base-URL for crc-resources
   * @param {string} url The URL
   */
  CRCLoader.prototype.setCRCBaseUrl = function (url) {
    this._crcBaseUrl = url;
  };

  // -----------------------------------------------------------------------------------------------------
  // --------------------------------   Private Methods ---------------------------------
  // ----------------------------------------------------------------------------------------------------

  /**
   * The main-Script offers developers a way to execute custom code.
   */
  CRCLoader.prototype._includeMainScript = function () {
    if (window.cubx.CRCInit.runtimeMode === 'dev') {
      console.log('CRCLoader: including application main-script');
    }
    // get defined main js file from webpackage and execute it (if given)
    var crcMain = $('[data-crc-main]').data('crcMain');
    if (typeof crcMain !== 'undefined') {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = crcMain;
      script.async = false;
      document.getElementsByTagName('head')[ 0 ].appendChild(script);
    }

    // add after main script hook
    var helperScript = document.createElement('script');
    helperScript.type = 'text/javascript';
    helperScript.async = false;
    helperScript.src = this._crcLoaderResourcesBaseUrl + '/js/afterMainScriptHook.js';
    document.getElementsByTagName('head')[ 0 ].appendChild(helperScript);
  };

  /**
   * export CRCLoader instance as module
   */
  return new CRCLoader();
});
