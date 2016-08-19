/*globals cubx*/
'use strict';
/**
 * Defines the CRC Loader RequireJS Module.
 *
 * @module CRCLoader_Module
 */
cubx.amd.define([ 'require',
  'jqueryLoader',
  'dependencyTagTransformer',
  'polyfills' ], function (require, $, dependencyTagTransformer) {
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
    /**
     * origin length of cubx.CRCInit.rootDependencies
     */
    this._cubxCRCInitRootDependenciesOriginLength;
    this._cubxCRCInitRootDependencyExludesOriginLength;
  };

  // -----------------------------------------------------------------------------------------------------------
  // --------------------------------   Public Methods ---------------------------------
  // ----------------------------------------------------------------------------------------------------------

  /**
   * Get CRC from server and initialize CRC on local DOM
   * @memberOf CRCLoader
   * @public
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
      // keep origin length of cubx.CRCInit.rootDependencies
      self._cubxCRCInitRootDependenciesOriginLength = cubx.CRCInit.rootDependencies ? cubx.CRCInit.rootDependencies.length : 0;
      // keep origin length of cubx.CRCInit.rootDependencyExcludes
      self._cubxCRCInitRootDependencyExludesOriginLength = cubx.CRCInit.rootDependencyExcludes ? cubx.CRCInit.rootDependencyExcludes.length : 0;
      self._addComponentDependenciesToRootdependencies();
      self._addDependenciesAndExcludesToRootdependencies();
      self._load();
    };
    if (cubx.CRCInit.startEventArrived) {
      action();
    } else {
      document.addEventListener(cubx.CRCInit.startEvent, action);
    }
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
  // -----------------------------------------------------------------------------------------------------------
  // --------------------------------   Private Methods ---------------------------------
  // ----------------------------------------------------------------------------------------------------------
  /**
   * Parse and add the dependencies from dom tree to the cubx.CRCInit.rootDependencies.
   * The dependencieas are  through cubx-webpackage-id and tagName as artifactId defined.
   * @private
   * @memberOf CRCLoader
   */
  CRCLoader.prototype._addComponentDependenciesToRootdependencies = function () {
    var elements = this._crcRoot.querySelectorAll('[cubx-webpackage-id]');
    if (elements.length > 0 && (!cubx.CRCInit.hasOwnProperty('rootDependencies') || typeof cubx.CRCInit.rootDependencies === 'undefined')) {
      cubx.CRCInit.rootDependencies = [];
    }
    for (var i = 0; i < elements.length; i++) {
      var element = elements[ i ];
      if (!this._isDependencyInRootDependencies(element)) { // check if the dependency  already exists
        var dep = this._createDependency(element);
        if (this._cubxCRCInitRootDependenciesOriginLength > 0) {
          cubx.CRCInit.rootDependencies.splice(cubx.CRCInit.rootDependencies.length - this._cubxCRCInitRootDependenciesOriginLength, 0, dep);
        } else {
          cubx.CRCInit.rootDependencies.push(dep);
        }
      }
    }
  };

  /**
   * find all <cubx-dependencies> and <cubx-dependency-exludes> Tags and add dependencies and excludes to rootDependencies and rootDependencyExcludes
   * @private
   * @memberOf CRCLoader
   */
  CRCLoader.prototype._addDependenciesAndExcludesToRootdependencies = function () {
    dependencyTagTransformer.addDependenciesAndExcludesToRootdependencies(this);
  };

  /**
   * create a dependency from element tagname and attributes cubx-webpackage-id and optional cubx-endpoint-id.
   * @param {HTMLElement} element cubx element
   * @returns {object}
   * @private
   * @memberOf CRCLoader
   */
  CRCLoader.prototype._createDependency = function (element) {
    var dependency = {
      artifactId: element.tagName.toLowerCase()
    };
    var webpackageId = element.getAttribute('cubx-webpackage-id');
    if (webpackageId !== 'this') {
      dependency.webpackageId = webpackageId;
    }
    var cubxEndpointId = element.getAttribute('cubx-endpoint-id');
    if (cubxEndpointId) {
      dependency.endpointId = cubxEndpointId;
    }
    return dependency;
  };

  /**
   * Check if the dependency contains in cubx.CRCInit.rootDependencies.
   * If the dependency is contained, but with a different webpackageId, log a warning.
   * @param {HTMLElement} element
   * @returns {boolean}
   * @private
   * @memberOf CRCLoader
   */
  CRCLoader.prototype._isDependencyInRootDependencies = function (element) {
    var foundling;
    if (window.cubx && window.cubx.CRCInit && window.cubx.CRCInit.rootDependencies) {
      foundling = cubx.CRCInit.rootDependencies.find(function (dep) {
        return dep.artifactId === element.tagName.toLowerCase();
      });
    }
    var webpackageId = element.getAttribute('cubx-webpackage-id');
    if (foundling && foundling.webpackageId !== webpackageId) {
      element.ambiguousWebpackageId = true;
      console.warn('Ambiguous webpackageId definition for artifact "' +
        element.tagName.toLowerCase() + '" The defined webpackageId (' + webpackageId +
        ') is inconsistent with an erlier definition of webpackageId (' + foundling.webpackagageId +
        '). Use the dependency with webpackageId "' + foundling.webpackageId + '" ignore webpackageId "' + webpackageId + '".');
    }
    return typeof foundling !== 'undefined';
  };

  /**
   * load CRC
   * @private
   * @memberOf CRCLoader
   */
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
   * The main-Script offers developers a way to execute custom code.
   * @private
   * @memberOf CRCLoader
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
})
;
