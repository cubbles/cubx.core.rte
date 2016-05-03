/**
 * Created by jtrs on 21.05.2015.
 */
window.cubx.amd.define([ 'jqueryLoader' ], function ($) {
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
   * @param {string} artifactId document object or wbpackage id or webpackage name.
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

    var manifest = $.extend(true, {}, componentManifest);

    this._deleteEndpoints(manifest);

    this._process(manifest);

    return manifest;
  };

  /* ******************************************************************************** */
  /*                                  private methods                                 */
  /* ******************************************************************************** */
  ComponentResolver.prototype._deleteEndpoints = function (manifest) {
    delete manifest.endpoints;
  };

  /**
   * process a completeing of member objects.
   * @param {object} manifest to completet
   * @private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._process = function (manifest) {
    if (manifest.members && typeof manifest.members === 'object') {
      if (manifest.members.constructor === Array) {
        for (var index = 0; index < manifest.members.length; index++) {
          manifest.members[ index ] =
            this._completeMemberManifest(manifest.members[ index ], manifest.webpackageId);
        }
      } else {
        manifest.members = this._completeMemberManifest(manifest.members, manifest.webpackageId);
      }
    }
  };

  /**
   * Complete an member item.
   * @param {object} item memeber item
   * @private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._completeMemberManifest = function (item, webpackageId) {
    if (item.componentId.startsWith('this')) {
      item.componentId = item.componentId.replace('this', webpackageId);
    }

    var submanifest = this._getSubmanifest(item.componentId);
    return this._addAttributesToMember(item, submanifest);
  };

  /**
   * get the manifest objects for id.
   * @param {string} componentId
   * @return {object} manifest for id
   * private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._getSubmanifest = function (componentId) {
    var artifactId = componentId.substr(componentId.lastIndexOf('/') + 1);
    var webpackageId = componentId.substr(0, componentId.lastIndexOf('/'));
    var componentManifest = this._cache.getComponentCacheEntry(artifactId);

    if (!componentManifest) {
      console.error('The artifact with artifactId "' + artifactId + '" is not loaded, but it is defined as a ' +
        'componentId of a member. Is a dependency defined for this artifact? ' +
        'Please check manifest.webpackage.');
      return;
    }

    if (!componentManifest.webpackageId || componentManifest.webpackageId !== webpackageId) {
      console.error(
        'The artifact in component cache has an other webpackageId (' + componentManifest.webpackageId +
        ') as expected (' + webpackageId + '). Ambiguous components? ');
    }

    this._process(componentManifest);
    return componentManifest;
  };
  /**
   * Add all attribute from an submanifest to an member item
   * @param {object} item memeber item
   * @param {object} manifest a manifest object
   * @return {object} completed manifest
   * @private
   * @memberOf ComponentResolver
   */
  ComponentResolver.prototype._addAttributesToMember = function (item, manifest) {
    for (var attr in manifest) {
      if (manifest.hasOwnProperty(attr) && attr !== 'endpoints') {
        item[ attr ] = manifest[ attr ];
      }
    }
    return item;
  };
  return ComponentResolver;
});
