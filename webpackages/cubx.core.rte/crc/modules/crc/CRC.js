/* globals CustomEvent*/
/**
 * Defines the CRC RequireJS Module.
 *
 * @version 1.0.0
 * @module CRC_Module
 * @requires StorageManager_Module
 */
window.cubx.amd.define([ 'require',
    'jqueryLoader',
    'storageManager',
    'dependencyManager',
    'cache',
    'componentResolver',
    'utils',
    'eventFactory' ],
  function (require, $, storageMgr, DepMgr, Cache, ComponentResolver, utils, eventFactory) {
    'use strict';

    /**
     * The Client Runtime Container is responsible to provide referred artifacts and basic functionality at runtime.
     * @class CRC
     * @global
     * @constructor
     */
    var CRC = function () {
      /**
       /* CRC Version number
       /* @type {string}
       /* @private
       */
      this._version = '1.8.0';

      /**
       * jQuery object containing only one element to which the crc should be appended
       * @type {Object}
       * @private
       */
      this._root = null;

      /**
       * HTMLElement object containing the crc dom element
       * @type {HTMLElement}
       * @private
       */
      this._crcEl = null;

      /**
       * timestamp just used as id for crc instance
       * @type {number}
       * @private
       */
      this._crcElId = Date.now();

      /**
       * The Dependency Mgr
       * @type {Object}
       * @private
       */
      this._dependencyManager = new DepMgr();

      /**
       * The Manifest Cache
       * @type {Object}
       * @private
       */
      this._cache = new Cache(this);

      /**
       * The Manifest Cache
       * @type {Object}
       * @private
       */
      this._componentResolver = new ComponentResolver(this._cache, this._dependencyManager);
      /**
       * runtime mode
       * @type {string}
       * @private
       */
      this._runtimeMode = 'prod';

      /**
       * The Event Factory
       * @type {Object}
       * @private
       */
      this._eventFactory = eventFactory;
      window.cubx.EventFactory = eventFactory;

      /**
       * The StorageManager instance of this CRC instance
       * @type {object}
       * @private
       */
      this._storageManager = storageMgr;

      /**
       * The name of the crc ready event that is fired after crc has loaded all dependencies and is ready
       * @type {string}
       * @private
       */
      this._readyEventName = 'crcReady';

      /**
       * The ready flag set to true, after crc has loaded all dependencies and is ready
       * @type {boolean}
       * @private
       */
      this._ready = false;

      /**
       * The name of the crc.depMgr ready event that is fired after crc-DependencyManager has injected all
       * dependencies into the dom.
       * @type {string}
       * @private
       */
      this._depMgrReadyEventName = 'crcDepMgrReady';

      /**
       * The ready flag set to true, after the Event "this._depMgrReadyEventName" has been fired.
       * @type {boolean}
       * @private
       */
      this._depMgrReady = false;

      /**
       * Listed all allowed modelVersion.
       * @type {string[]}
       * @private
       */
      this._supportedModelVersionList = [ '8.0', '8.1', '8.2', '8.3' ];
    };

    // --------------------------------------------------------------------------------------------------------------
    // --------------------------------                 Public Methods               --------------------------------
    // --------------------------------------------------------------------------------------------------------------

    /**
     * Initiate CRC as direct child of given root dom node.

     * @param {Object} root jQuery Object which contains the dom node for appending the CRC to.
     * @memberOf CRC
     */
    CRC.prototype.init = function (root) {
      var get = window.cubx.utils.get;
      this._baseUrl = get(window, 'cubx.CRCInit.webpackageBaseUrl');
      this._runtimeMode = get(window, 'cubx.CRCInit.runtimeMode');
      this._root = root;
      this._ie_polyfills();
      // TODO PLAT-88: data-crc-id muss von aussen kommen , evtl . bei fehlende angabe in crcLoader generieren
      if (this._root) {
        root.setAttribute('data-crc-id', this._crcElId);
        root.setAttribute('data-crc-version', this._version);
      } else {
        console.warn(
          'Can\'t set the attributes "data-crc-id" and "data-crc-version", because' +
          ' no element with attribute "cubx-core-crc" found.');
      }
    };

    /**
     * Get the Dependency Manager
     * @return {Object}
     * @memberOf CRC
     */
    CRC.prototype.getDependencyMgr = function () {
      return this._dependencyManager;
    };

    /**
     * Get the Event Factory
     * @return {Object}
     * @memberOf CRC
     */
    CRC.prototype.getEventFactory = function () {
      return this._eventFactory;
    };

    /**
     * Get the Sotarage Manager instance
     * @return {Object}
     * @memberOf CRC
     */
    CRC.prototype.getStorageManager = function () {
      return this._storageManager;
    };

    /**
     * Get the componentResolver instance
     * @return {Object}
     * @memberOf CRC
     */
    CRC.prototype.getComponentResolver = function () {
      return this._componentResolver;
    };

    /**
     * Get the CRC dom node as jQuery object. Returns null if {@link CRC#init|init()} was not called before
     * @returns {Object} jQuery Object containing the CRC dom node or null
     * @memberOf CRC
     * @deprecated
     */
    CRC.prototype.getCRCEl = function () {
      return $('[data-crc-id="' + this._crcElId + '"]');
    };

    /**
     * @returns {object} HTMLElement The CRC dom node
     * @memberOf CRC
     */
    CRC.prototype.getCRCElement = function () {
      var el = document.querySelector('[data-crc-id="' + this._crcElId + '"]');
      if (!el) {
        console.log(
          'Cant get the crc container element, because no element with attribute "cubx-core-crc" found.');
      }
      return el;
    };

    /**
     * Get {@link Utils} module
     * @memberOf CRC
     * @return {object} The {@link Utils} module
     */
    CRC.prototype.getUtils = function () {
      return utils;
    };

    /**
     * Get the Cache instance
     * @memberOf CRC
     * @return {Object} The {@link Cache} instance
     */
    CRC.prototype.getCache = function () {
      return this._cache;
    };

    /**
     * Get the cached processedManifest
     * @param {object | string} artifactId
     * @return {object} processedManifest
     * @memberOf CRC
     */
    CRC.prototype.getResolvedComponent = function (artifactId) {
      var cache = this.getCache();
      var resolvedComponent;
      if (typeof artifactId === 'string') {
        // from cache if stored
        resolvedComponent = cache.getResolvedComponent(artifactId);
      } else {
        throw new TypeError('Parameter artifactId "' + artifactId + '" not a string.');
      }
      // if not stored, it should be build
      if (!resolvedComponent) {
        resolvedComponent = this._resolveComponent(artifactId);
      }
      return resolvedComponent;
    };

    /**
     * Returns the current runtime mode ('prod'|'dev').
     * @returns {string}
     */
    CRC.prototype.getRuntimeMode = function () {
      return this._runtimeMode;
    };

    /**
     * invalidate a cache for processedManifest object
     * @param {object| string} artifactId
     * @memberOf CRC
     */
    CRC.prototype.invalidateResolvedManifest = function (artifactId) {
      var cache = this.getCache();
      if (artifactId && typeof artifactId === 'string' && artifactId.length > 0) {
        cache.deleteResolvedComponent(artifactId);
      }
    };

    /**
     * Fire the crc ready event
     * @memberOf CRC
     */
    CRC.prototype.fireReadyEvent = function () {
      var event = new CustomEvent(this._readyEventName);
      if (this.getCRCElement()) {
        this.getCRCElement().dispatchEvent(event);
      } else {
        document.querySelector('body').dispatchEvent(event);
      }
      this._ready = true;
    };

    /**
     * Fire the crcDepMgrReady event
     * @memberOf CRC
     */
    CRC.prototype.fireDepMgrReadyEvent = function () {
      var event = new CustomEvent(this._depMgrReadyEventName, { bubbles: true });
      if (this.getCRCElement()) {
        this.getCRCElement().dispatchEvent(event);
      } else {
        document.querySelector('body').dispatchEvent(event);
      }
      this._depMgrReady = true;
    };

    /**
     * Indicate, if crc is ready.
     * @return {boolean} true,  after crc has loaded all dependencies and is ready, otherwise false
     */
    CRC.prototype.isReady = function () {
      return this._ready;
    };

    /**
     * Change the modelVersion: Complete with missed minor (=0) and delete patch number (=0) if nessecary.
     * @param {string} modelVersion origin modelVersion
     * @return {string} completed modelVersion
     * @private
     * @memberOf CRC
     */
    CRC.prototype.getNormedModelVersion = function (modelVersion) {
      var correctedModelVersion = modelVersion;
      // If modelVersion just major version add 0 minor version
      if (modelVersion.indexOf('.') === -1) {
        correctedModelVersion += '.0';
      }
      // If modelVersion more then major and minor version cut after minor version.
      if (modelVersion.indexOf('.') < modelVersion.lastIndexOf('.')) {
        var split = modelVersion.split('.');
        correctedModelVersion = split[ 0 ] + '.' + split[ 1 ];
      }
      return correctedModelVersion;
    };
    // -------------------------------------------------------------------------------------------------------------
    // --------------------------------                 Private Methods
    // ------------------------------
    // ------------------------------------------------------------------------------------------------------------
    CRC.prototype._ie_polyfills = function () {
      if (typeof window.CustomEvent !== 'function') {
        window.CustomEvent = function (event, params) {
          params = params || { bubbles: false, cancelable: false, detail: undefined };
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        window.CustomEvent.prototype = window.Event.prototype;
      }
      if (!window.String.prototype.startsWith) {
        window.String.prototype.startsWith = function (searchString, position) {
          position = position || 0;
          return this.indexOf(searchString, position) === position;
        };
      }
      if (!window.String.prototype.endsWith) {
        window.String.prototype.endsWith = function (searchString, position) {
          var subjectString = this.toString();
          if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
          }
          position -= searchString.length;
          var lastIndex = subjectString.indexOf(searchString, position);
          return lastIndex !== -1 && lastIndex === position;
        };
      }
    };
    /**
     * Build a processedManifest, and store in cache.
     * @param {object | string} artifactId
     * @return {object} processedManifest
     * @private
     * @memberOf CRC
     */
    CRC.prototype._resolveComponent = function (artifactId) {
      var resolvedComponent;
      var cache = this.getCache();
      var artifact;

      if (!artifactId || typeof artifactId !== 'string' || artifactId.length === 0) {
        throw new TypeError('The parameter "' + artifactId + '" is not valid.');
      } else {
        artifact = cache.getComponentCacheEntry(artifactId);
      }
      if (!artifact) {
        throw new ReferenceError('Artifact with artifactId "' + artifactId + '" not loaded. ' +
          'Is a dependency defined for this artifact? Please check manifest.webpackage.');
      }

      resolvedComponent = this._componentResolver.processManifest(artifactId);
      cache.setResolvedComponent(artifact.webpackageId + '/' + artifact.artifactId, resolvedComponent);
      cache.setResolvedComponent(artifact.artifactId, resolvedComponent);
      return resolvedComponent;
    };

    /**
     * Check, if modelVersion in this crcLoader supported.
     * Before the check,  the modelVersion will be completed with minor (=0) and patch number (=0), if
     * necessary.
     * @param {string} modelVersion
     * @return {boolean} true if modelVersion allowed
     * @memberOf CRC
     * @private
     */
    CRC.prototype._isModelVersionSupported = function (modelVersion) {
      if (modelVersion) {
        var correctedModelVersion = this.getNormedModelVersion(modelVersion);
        for (var i = 0; i < this._supportedModelVersionList.length; i++) {
          if (this._supportedModelVersionList[ i ] === correctedModelVersion) {
            return true;
          }
        }
      }
      return false;
    };

    // export CRC instance
    return new CRC();
  }
);
