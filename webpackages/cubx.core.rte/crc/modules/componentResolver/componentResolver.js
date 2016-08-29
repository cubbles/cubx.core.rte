/**
 * Created by jtrs on 21.05.2015.
 */
window.cubx.amd.define([], function () {
  'use strict';

  /**
   * @class ComponentResolver
   * @global
   * @constructor
   */
  var ComponentResolver = function (cache, dependencyManager) {
    this._cache = cache;
    this._depMgr = dependencyManager;
  };

  /* ******************************************************************************** */
  /*                                  public methods                                 */
  /* ******************************************************************************** */
  /**
   * Build a big completed manifest recursive over all member.
   * @param {string} artifactId document object or webpackage id or webpackage name.
   * @return {object} processed manifest object
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype.processManifest = function (artifactId) {
    var componentManifest;

    var processedManifest = {};

    if (!artifactId || typeof artifactId !== 'string') {
      return processedManifest;
    }

    componentManifest = this._cache.getComponentCacheEntry(artifactId);

    if (!componentManifest) {
      return processedManifest;
    }

    var manifest = JSON.parse(JSON.stringify(componentManifest));

    this._process(manifest);

    return manifest;
  };

  /* ******************************************************************************** */
  /*                                  private methods                                 */
  /* ******************************************************************************** */

  /**
   * process a completition of member objects.
   * @param {object} manifest to completet
   * @private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._process = function (manifest) {
    if (manifest.members && typeof manifest.members === 'object') {
      if (manifest.members.length > 0) {
        for (var index = 0; index < manifest.members.length; index++) {
          manifest.members[ index ] = this._completeMemberManifest(manifest.members[ index ]);
        }
      }
    }
  };

  /**
   * Complete a member item.
   * @param {object} item member item
   * @private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._completeMemberManifest = function (item) {
    var submanifest = this._getSubmanifest(item.artifactId);
    return this._addAttributesToMember(item, submanifest);
  };

  /**
   * get the manifest objects for id.
   * @param {string} artifactId
   * @return {object} manifest for id
   * @private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._getSubmanifest = function (artifactId) {
    var componentManifest = this._cache.getComponentCacheEntry(artifactId);

    if (!componentManifest) {
      console.error('The artifact with artifactId "' + artifactId + '" is not loaded, but it is defined as a ' +
        'componentId of a member. Is a dependency defined for this artifact? ' +
        'Please check manifest.webpackage.');
      return;
    }

    this._process(componentManifest);
    return componentManifest;
  };
  /**
   * Add all attribute from an submanifest to an member item
   * @param {object} item member item
   * @param {object} manifest a manifest object
   * @return {object} completed manifest
   * @private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._addAttributesToMember = function (item, manifest) {
    for (var attr in manifest) {
      item[attr] = manifest[attr];
    }
    return item;
  };

  return ComponentResolver;
});
