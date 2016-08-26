/**
 * Created by Philipp Wagner on 11.08.2016.
 */
window.cubx.amd.define([], function () {
  'use strict';

  /**
   * The manifestConverter can be used to convert manifest.webpackage objects.
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
        '_addResourcesArrayToArtifacts',
        '_removeSingleEndpointsFromArtifacts',
        '_convertMultipleEndpointsToArtifacts',
        '_convertArtifactDependencyItems',
        '_convertComponentIdToArtifactIdInMembers'
      ],
      '9.1.0': [
        '_removeEndpointsFromDependencyItems'
      ]
    };

    /**
     * Define target model version for output manifest files
     * @type {string}
     * @private
     */
    this._targetVersion = '9.1.0';

    /**
     * The separator that is used when concatenating artifactId and endpointId from ModelVersion 8.x manifest files
     * @type {string}
     */
    this.endpointSeparator = '#';
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
   * Iterate over each artifact and create a 'resources' property for each of them.
   * Note: The changes will be made directly on the given manifest object.
   * Note: If there is already a resources array for an artifact it will be overwritten!
   * @param {object} manifest A valid manifest object
   * @private
   * @memberOf ManifestConverter
   */
  ManifestConverter.prototype._addResourcesArrayToArtifacts = function (manifest) {
    // iterate over each artifact but ignore all artifacts of type 'app'
    Object.keys(manifest.artifacts).forEach(function (artifactType) {
      if (artifactType !== 'apps') {
        manifest.artifacts[artifactType].forEach(function (artifact) {
          artifact.resources = [];
        });
      }
    });
  };

  /**
   * Convert each dependency in dependencies array from string to object. Only dependencies on artifact level will be
   * considered.
   * Note: The changes will be made directly on the given manifest object.
   * @param {object} manifest A valid manifest object
   * @memberOf ManifestConverter
   * @private
   */
  ManifestConverter.prototype._convertArtifactDependencyItems = function (manifest) {
    var self = this;
    Object.keys(manifest.artifacts).forEach(function (artifactType) {
      manifest.artifacts[artifactType].forEach(function (artifact) {
        if (artifact.hasOwnProperty('dependencies') && artifact.dependencies.length > 0) {
          artifact.dependencies.forEach(function (dependency, index, dependencies) {
            var segments = dependency.split('/');
            var dependencyObject = {};
            if (segments[0] !== 'this') {
              dependencyObject.webpackageId = segments[0];
            }
            dependencyObject.artifactId = segments[1] + self.endpointSeparator + segments[2];
            dependencies[index] = dependencyObject;
          });
        }
      });
    });
  };

  /**
   * Convert each dependencyItem by removing endpointId property (if available) and append it's value to artifactId
   * using separator '#'.
   * Note: The changes will be made directly on the given manifest object.
   * @memberOf ManifestConverter
   * @param {object} manifest A valid manifest object
   * @private
   */
  ManifestConverter.prototype._removeEndpointsFromDependencyItems = function (manifest) {
    var self = this;
    Object.keys(manifest.artifacts).forEach(function (artifactType) {
      manifest.artifacts[artifactType].forEach(function (artifact) {
        if (artifact.hasOwnProperty('dependencies') && artifact.dependencies.length > 0) {
          artifact.dependencies.forEach(function (dependency, index, dependencies) {
            if (typeof dependency === 'object' && dependency.hasOwnProperty('endpointId')) {
              dependency.artifactId = dependency.artifactId + self.endpointSeparator + dependency.endpointId;
              delete dependency.endpointId;
            };
          });
        }
      });
    });
  };

  /**
   * Rename componentId property to artifactId and remove webpackageId|this in each member of compounds.
   * Note: The changes will be made directly on the given manifest object.
   * @memberOf ManifestConverter
   * @param {object} manifest A valid manifest object
   * @private
   */
  ManifestConverter.prototype._convertComponentIdToArtifactIdInMembers = function (manifest) {
    if (!manifest.artifacts.hasOwnProperty('compoundComponents')) {
      return;
    };
    manifest.artifacts.compoundComponents.forEach(function (compound) {
      compound.members.forEach(function (member) {
        member.artifactId = member.componentId.split('/')[1];
        delete member.componentId;
      });
    });
  };

  /**
   * Convert Artifacts which have multiple endpoints to multiple Artifacts.
   * Note: The changes will be made directly on the given manifest object.
   * @memberOf ManifestConverter
   * @param {object} manifest A valid manifest object
   * @private
   */
  ManifestConverter.prototype._convertMultipleEndpointsToArtifacts = function (manifest) {
    var self = this;
    Object.keys(manifest.artifacts).forEach(function (artifactType) {
      var convertedArtifacts = [];
      manifest.artifacts[artifactType].forEach(function (artifact, index, artifacts) {
        if (artifact.hasOwnProperty('endpoints') && artifact.endpoints.length > 1) {
          artifact.endpoints.forEach(function (endpoint) {
            var convertedArtifact = JSON.parse(JSON.stringify(artifact));
            convertedArtifact.artifactId = convertedArtifact.artifactId + self.endpointSeparator + endpoint.endpointId;
            convertedArtifact.resources = endpoint.resources;
            if (endpoint.hasOwnProperty('dependencies')) {
              convertedArtifact.dependencies = endpoint.dependencies;
            }
            if (endpoint.hasOwnProperty('description') && convertedArtifact.hasOwnProperty('description')) {
              convertedArtifact.description = convertedArtifact.description + ' ' + endpoint.description;
            } else if (!convertedArtifact.hasOwnProperty('description') && endpoint.hasOwnProperty('description')) {
              convertedArtifact.description = endpoint.description;
            }
            delete convertedArtifact.endpoints;
            convertedArtifacts.push(convertedArtifact);
          });
        } else {
          convertedArtifacts.push(artifact);
        }
      });
      manifest.artifacts[artifactType] = convertedArtifacts;
    });
  };

  /**
   * Remove endpoints for artifacts that have only one endpoint.
   * Note: The changes will be made directly on the given manifest object.
   * @param {object} manifest A valid manifest object
   * @memberOf ManifestConverter
   * @private
   */
  ManifestConverter.prototype._removeSingleEndpointsFromArtifacts = function (manifest) {
    var self = this;
    Object.keys(manifest.artifacts).forEach(function (artifactType) {
      manifest.artifacts[artifactType].forEach(function (artifact) {
        // only process artifact if there is one single endpoint
        if (artifact.hasOwnProperty('endpoints') && artifact.endpoints.length === 1) {
          // append endpointId to artifactId using defined separator
          artifact.artifactId = artifact.artifactId + self.endpointSeparator + artifact.endpoints[0].endpointId;
          // move resources from endpoint to artifact, if there are any
          if (artifact.endpoints[0].resources.length > 0) {
            artifact.resources = artifact.endpoints[0].resources;
          }
          // move dependencies from endpoint to artifact, if there are any
          if (artifact.endpoints[0].hasOwnProperty('dependencies') && artifact.endpoints[0].dependencies.length > 0) {
            artifact.dependencies = artifact.endpoints[0].dependencies;
          }
          delete artifact.endpoints;
        }
      });
    });
  };

  /**
   * Convert a given manifest files into latest modelVersion.
   * Note: If the given manifest is of type object the conversion is done directly on the manifest object.
   * @param {object|string} manifest Object or JSON string representing a manifest.webpackage.
   * @return {object} convertedManifest An object representing a converted manifest.
   * @memberOf ManifestConverter
   */
  ManifestConverter.prototype.convert = function (manifest) {
    var convertedManifest = typeof manifest === 'string' ? JSON.parse(manifest) : manifest;
    var modelVersion = convertedManifest.modelVersion;
    var self = this;
    var transformationList = this._determineTransformationList(modelVersion);

    transformationList.forEach(function (fn) {
      self[fn](convertedManifest);
    });
    convertedManifest.modelVersion = this._targetVersion;
    return convertedManifest;
  };

  return new ManifestConverter();
});
