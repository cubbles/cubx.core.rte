/* globals CustomEvent */
/**
 * Defines the CRC RequireJS Module.
 *
 * @version 2.3.2-SNAPSHOT
 * @module CRC_Module
 */
window.cubx.amd.define([
  'storageManager',
  'dependencyManager',
  'cache',
  'componentResolver',
  'utils',
  'eventFactory'
],
  function (storageMgr, DepMgr, Cache, ComponentResolver, utils, EventFactory) {
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
      this._version = '2.3.2-SNAPSHOT';

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
      this._eventFactory = new EventFactory();
      window.cubx.EventFactory = EventFactory;

      /**
       * The StorageManager instance of this CRC instance
       * @type {object}
       * @private
       */
      this._storageManager = storageMgr;

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
      this._supportedModelVersionList = [ '8.0', '8.1', '8.2', '8.3', '9.0', '9.1' ];
    };

    // --------------------------------------------------------------------------------------------------------------
    // --------------------------------                 Public Methods               --------------------------------
    // --------------------------------------------------------------------------------------------------------------

    /**
     * Initiate CRC as direct child of given root dom node.

     * @param {Object} root element which contains the dom node for appending the CRC to.
     * @memberOf CRC
     */
    CRC.prototype.init = function (root) {
      var get = window.cubx.utils.get;
      this._baseUrl = get(window, 'cubx.CRCInit.webpackageBaseUrl');
      this._runtimeMode = get(window, 'cubx.CRCInit.runtimeMode');
      this._root = root;
      if (this._root) {
        root.setAttribute('data-crc-id', this._crcElId);
        root.setAttribute('data-crc-version', this._version);
      } else {
        console.warn(
          'Can\'t set the attributes "data-crc-id" and "data-crc-version", because' +
          ' no element could be identified as crc root element.');
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
     * @returns {object} HTMLElement The CRC dom node
     * @memberOf CRC
     */
    CRC.prototype.getCRCElement = function () {
      var el = document.querySelector('[data-crc-id="' + this._crcElId + '"]');
      if (!el) {
        console.log(
          'Cant get the crc container element, because no element could be identified as crc root element.');
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
      var eventFactory = this.getEventFactory();
      var event = eventFactory.createEvent(window.cubx.EventFactory.types.CRC_READY);
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
