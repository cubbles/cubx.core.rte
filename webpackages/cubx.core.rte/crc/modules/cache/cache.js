window.cubx.amd.define(['manifestConverter'], function (manifestConverter) {
  'use strict';

  /**
   * @class Cache
   * @global
   * @constructor
   */
  var Cache = function (crc) {
    /**
     *
     * @type {object}
     * @private
     */
    this._componentCache = {};

    /**
     *
     * @type {object}
     * @private
     */
    this._resolvedComponents = {};

    /**
     * crc Reference
     * @type {object}
     * @private
     */
    this._crc = crc;
  };

  /**
   * Return the whole Cache for webpackage documents.
   * @return {Object}
   */
  Cache.prototype.getAllComponents = function () {
    return this._componentCache;
  };

  /**
   * store the component in cache. Artifacts, which are not of artifactType "elementaryComponent" or "compoundComponent"
   * will be ignored.
   * @memberOf Cache
   * @param {string|object} document webpackageDocument
   * @param {string} artifactId
   */
  Cache.prototype.addComponentCacheEntry = function (document, artifactId) {
    if (typeof document === 'string') {
      document = JSON.parse(document);
    }

    // modelVersion prüfen
    if (!this._crc._isModelVersionSupported(document.modelVersion)) {
      console.warn('Webpackage with id ' + document.groupId + '.' + document.name + ' has modelVersion ' +
        document.modelVersion +
        '. This CRC (version=' + this._crc._version + ') supports the following modelVersion(s): ' +
        this._crc._supportedModelVersionList);
    }
    if (artifactId) {
      var componentEntry = this._findComponentInDocument(document, artifactId);
      if (!componentEntry) {
        // artifact is not a component
        return;
      }

      var webpackageId = document.name;
      webpackageId += '@';
      webpackageId += document.version;
      if (document.groupId && document.groupId.length > 0) {
        webpackageId = document.groupId + '.' + webpackageId;
      }
      componentEntry.webpackageId = webpackageId;
      this._addComponentCacheEntry(componentEntry);
    } else {
      throw new TypeError('Undefined artifactId: The parameter artifactId is obligatory.');
    }
  };

  /**
   * Clean the cache from all entries.
   */
  Cache.prototype.clean = function () {
    this._componentCache = {};
    this._resolvedComponents = {};
  };

  /**
   * get the artifact saved under key
   * @param {string} key
   * @return {object} artifact
   */
  Cache.prototype.getComponentCacheEntry = function (key) {
    if (key) {
      return this._componentCache[ key ];
    }
    return null;
  };
  /**
   * Get the under key stores manifest object from _resolvedComponents.
   * @param {string} key
   * @return {*}
   * @memberOf Cache
   */
  Cache.prototype.getResolvedComponent = function (key) {
    if (this._resolvedComponents.hasOwnProperty(key)) {
      return this._resolvedComponents[ key ];
    }
    return null;
  };
  /**
   * store the manifest under key in _resolvedComponents.
   * @param {string} key
   * @param {object} manifest stored manifest object
   * @memberOf Cache
   */
  Cache.prototype.setResolvedComponent = function (key, manifest) {
    if (key && typeof key === 'string') {
      this._resolvedComponents[ key ] = manifest;
    }
  };
  /**
   * delete the cache entry under key
   * @param {string} key
   * @memberOf Cache
   */
  Cache.prototype.deleteResolvedComponent = function (key) {
    if (this._resolvedComponents[ key ]) {
      delete this._resolvedComponents[ key ];
    }
  };

  //* *********************************************************************************************************
  //* *************************************** private methods *************************************************
  //* *********************************************************************************************************

  /**
   * store the webpackageDocument for the specified key in cache
   * @memberOf Cache
   * @private
   * @param {string} key
   * @param {string|object} artifact webpackageDocument
   */
  Cache.prototype._setComponentCacheEntryForKey = function (key, artifact) {
    if (typeof artifact === 'string') {
      artifact = JSON.parse(artifact);
    }
    this._componentCache[ key ] = artifact;
  };

  /**
   * Add an componentEntry to the componentCache.
   * Log a warning, if the artifactId already contains in the componentCache with the different documentId
   * @param {object} artifactEntry
   * @private
   */
  Cache.prototype._addComponentCacheEntry = function (artifactEntry) {
    var artifactId;
    artifactId = artifactEntry.artifactId;
    // remove '#[endpointId]' appendix if present.
    artifactId = artifactId.indexOf('#') > -1 ? artifactId.split('#')[0] : artifactId;
    var id = artifactEntry.webpackageId + '/' + artifactId;
    var otherArtifact = this.getComponentCacheEntry(artifactId);
    if (otherArtifact && (otherArtifact.webpackageId !== artifactEntry.webpackageId)) {
      console.warn('Trying to store an ambiguous component "' + id + '" in the componentCache. ' +
        'In the componentCache exists already another artifact with the same artifactId, but a ' +
        'different webpackageId: "' + otherArtifact.webpackageId + '/' + otherArtifact.artifactId + '".');
    }
    this._setComponentCacheEntryForKey(artifactId, artifactEntry);
  };

  /**
   * Find the component in the document, add the attribute "artifactType" and return the component.
   * If the artifact not found in document.artifact.compoundComponents or document.artifacts.elementaryComponents,
   * return null.
   * @param {object} document webpackage document
   * @param {string} artifactId
   * @return {object|null} the founded, with artifactType enriched component or null if no component found
   * @private
   */
  Cache.prototype._findComponentInDocument = function (document, artifactId) {
    var i;
    if (!artifactId) {
      return null;
    }
    var currentArtifactId;

    if (document.artifacts && document.artifacts.compoundComponents) {
      for (i = 0; i < document.artifacts.compoundComponents.length; i++) {
        currentArtifactId = document.artifacts.compoundComponents[ i ].artifactId;
        // check if this artifactId was converted using manifestConverter. If so remove '#[endpoint]' to find artifact
        currentArtifactId = currentArtifactId.indexOf('#') > -1 ? currentArtifactId.split('#')[0] : currentArtifactId;
        if (currentArtifactId === artifactId) {
          document.artifacts.compoundComponents[ i ].artifactType = ArtifactTypes.COMPOUND_COMPONENT;
          document.artifacts.compoundComponents[ i ].modelVersion = document.modelVersion;
          return document.artifacts.compoundComponents[ i ];
        }
      }
    }
    if (document.artifacts && document.artifacts.elementaryComponents) {
      for (i = 0; i < document.artifacts.elementaryComponents.length; i++) {
        currentArtifactId = document.artifacts.elementaryComponents[ i ].artifactId;
        // check if this artifactId was converted using manifestConverter. If so remove '#[endpoint]' to find artifact
        currentArtifactId = currentArtifactId.indexOf('#') > -1 ? currentArtifactId.split('#')[0] : currentArtifactId;
        if (currentArtifactId === artifactId) {
          document.artifacts.elementaryComponents[ i ].artifactType = ArtifactTypes.ELEMENTARY_COMPONENT;
          document.artifacts.elementaryComponents[ i ].modelVersion = document.modelVersion;
          return document.artifacts.elementaryComponents[ i ];
        }
      }
    }
    return null;
  };

  var ArtifactTypes = {
    COMPOUND_COMPONENT: 'compoundComponent',
    ELEMENTARY_COMPONENT: 'elementaryComponent',
    APP: 'app',
    UTILITY: 'utilitiy',
    isComponent: function (type) {
      if (type && type === this.COMPOUND_COMPONENT || type === this.ELEMENTARY_COMPONENT) {
        return true;
      }

      return false;
    }
  };

  return Cache;
});
