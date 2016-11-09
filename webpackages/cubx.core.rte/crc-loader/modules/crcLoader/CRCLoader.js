/*globals cubx*/
'use strict';
/**
 * Defines the CRC Loader RequireJS Module.
 *
 * @module CRCLoader_Module
 */
cubx.amd.define([
  'dependencyTagTransformer',
  'crc',
  'polyfills'
], function (DependencyTagTransformer, crc) {
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
     * @type {number}
     * @private
     */
    this._cubxCRCInitRootDependenciesOriginLength = 0;
    /**
     * origin length of cubx.CRCInit.rootDependencyExcludes
     * @type {number}
     * @private
     */
    this._cubxCRCInitRootDependencyExludesOriginLength = 0;
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
    var action = function () {
      this._checkRootDependencies();
      // keep origin length of cubx.CRCInit.rootDependencies
      this._cubxCRCInitRootDependenciesOriginLength = cubx.CRCInit.rootDependencies ? cubx.CRCInit.rootDependencies.length : 0;
      // keep origin length of cubx.CRCInit.rootDependencyExcludes
      this._cubxCRCInitRootDependencyExludesOriginLength = cubx.CRCInit.rootDependencyExcludes ? cubx.CRCInit.rootDependencyExcludes.length : 0;
      this._cubxCRCInitRootDependenciesOriginLength += this._addComponentDependenciesToRootDependencies();
      this._addDependenciesAndExcludesToRootDependencies();
      this._bootstrapCRC();
    }.bind(this);
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
   * check the root dependencies, and get a warning, if the dependency not an object, or it has not an attribute.
   * @private
   */
  CRCLoader.prototype._checkRootDependencies = function () {
    if (!cubx.CRCInit.hasOwnProperty('rootDependencies') || typeof cubx.CRCInit.rootDependencies === 'undefined') {
      cubx.CRCInit.rootDependencies = [];
    }
    var validDeps = [];
    cubx.CRCInit.rootDependencies.forEach(function (dep) {
      if (typeof dep === 'object' && dep.artifactId) {
        validDeps.push(dep);
      } else {
        console.warn('The dependency definition "' + dep + '" will be removed, because it is not valid for this rte version. A valid dependency definition should be an object, and it should to have at least the attribute artifactId');
      }
    });
    cubx.CRCInit.rootDependencies = validDeps;
  };
  /**
   * Parse and add the dependencies from dom tree to the cubx.CRCInit.rootDependencies.
   * The dependencieas are  through cubx-webpackage-id and tagName as artifactId defined.
   * @private
   * @return {number} Number of dependencies that where added to rootDependencies array
   * @memberOf CRCLoader
   */
  CRCLoader.prototype._addComponentDependenciesToRootDependencies = function () {
    var count = 0;
    var elements = this._crcRoot.querySelectorAll('[cubx-webpackage-id]');
    if (elements.length > 0 && (!cubx.CRCInit.hasOwnProperty('rootDependencies') || typeof cubx.CRCInit.rootDependencies === 'undefined')) {
      cubx.CRCInit.rootDependencies = [];
    }
    for (var i = 0; i < elements.length; i++) {
      var element = elements[ i ];
      if (!this._isDependencyInRootDependencies(element)) { // check if the dependency  already exists
        var dep = this._createDependency(element);
        cubx.CRCInit.rootDependencies.push(dep);
        count++;
      }
    }
    return count;
  };

  /**
   * find all <cubx-dependencies> and <cubx-dependency-exludes> Tags and add dependencies and excludes to rootDependencies and rootDependencyExcludes
   * @private
   * @memberOf CRCLoader
   */
  CRCLoader.prototype._addDependenciesAndExcludesToRootDependencies = function () {
    var dependencyTagTransformer = new DependencyTagTransformer();
    dependencyTagTransformer.addDependenciesAndExcludesToRootDependencies(this);
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
        ') is inconsistent with an earlier definition of webpackageId (' + foundling.webpackagageId +
        '). Use the dependency with webpackageId "' + foundling.webpackageId + '" ignore webpackageId "' + webpackageId + '".');
    }
    return typeof foundling !== 'undefined';
  };

  /**
   * Bootstrap CRC
   * @memberOf CRCLoader
   */
  CRCLoader.prototype._bootstrapCRC = function () {
    window.cubx.CRC = crc;
    // select crcRoot element and init crc on it
    window.cubx.CRC.init(this._crcRoot);
    // now run resolve the dependencies
    var depMgr = crc.getDependencyMgr();
    depMgr.init();
    depMgr.run();
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
    var crcMain = document.querySelector('[data-crc-main]');
    if (crcMain !== null) {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = crcMain.getAttribute('data-crc-main');
      script.async = false;
      document.getElementsByTagName('head')[ 0 ].appendChild(script);
    }

    // add after main script hook
    var helperScript = document.createElement('script');
    helperScript.type = 'text/javascript';
    helperScript.async = false;
    helperScript.src = this._crcLoaderResourcesBaseUrl + '/js/afterMainScriptHook.js';
    document.getElementsByTagName('head')[ 0 ].appendChild(helperScript);

    // TODO: use this snippet to fire crcDepMgrReady event!!!! This should solve problems with asynchronous execution time od dynamically included html import
    // TODO: and the after main script hook :-D
    // var blob = new window.Blob(['<script>(function(){"use strict";window.cubx.CRC.fireReadyEvent();})();</script>'], {type: 'text/html'});
    // var htmlImport = document.createElement('link');
    // htmlImport.setAttribute('href', window.URL.createObjectURL(blob));
    // htmlImport.setAttribute('rel', 'import');
    // document.getElementsByTagName('head')[ 0 ].appendChild(htmlImport);
  };

  /**
   * export CRCLoader instance as module
   */
  return new CRCLoader();
})
;
