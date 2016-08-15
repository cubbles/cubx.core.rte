/**
 * Created by Philipp Wagner on 11.08.2016.
 */
window.cubx.amd.define([], function () {
  'use strict';

  /**
   * The manifestConverter can be used to convert manifest.webpackage objects between model Versions.
   * @class ManifestConverter
   * @global
   * @constructor
   */
  var ManifestConverter = function () {
    /**
     * Holds a well defined transformation matrix defining all transformations that need to be done depending on source
     * ModelVersion. Each item contains all transformations that need to be done to convert to current given _targetVersion.
     * @type {object}
     * @private
     */
    this._transformationMatrix = {
      '8.x.x': [
        this._addResourcesArrayToArtifacts
      ],
      '9.0.0': [],
      '9.1.0': []
    };

    /**
     * Define target model version for output manifest files
     * @type {string}
     * @private
     */
    this._targetVersion = '9.1.0';
  };

  /**
   * Based on given _transformationMatrix determine the transformations that need to be proceeded
   * @memberOf ManifestConverter
   * @param {string} sourceModelVersion The source modelVersion
   * @return {array} An array of methods to call in provided order
   * @private
   */
  ManifestConverter.prototype._determineTransformationList = function (sourceModelVersion) {
    var transformationList = [];

    if (sourceModelVersion.indexOf('8.') === 0) {
      // deal with modelVersion 8
      transformationList = this._transformationMatrix['8.x.x'];
    } else if (this._transformationMatrix.hasOwnProperty(sourceModelVersion)) {
      transformationList = this._transformationMatrix[sourceModelVersion];
    }

    return transformationList;
  };

  /**
   *
   * @param manifest
   * @private
   */
  ManifestConverter.prototype._addResourcesArrayToArtifacts = function (manifest) {

  };

  /**
   * Convert a given manifest files into latest modelVersion
   * @param {object} manifest
   * @return {object}convertedManifest
   * @memberOf ManifestConverter
   */
  ManifestConverter.prototype.convert = function (manifest) {
    // var modelVersion = manifest.modelVersion;
    var convertedManifest = JSON.parse(JSON.stringify(manifest));

    return convertedManifest;
  };

  return new ManifestConverter();
});
