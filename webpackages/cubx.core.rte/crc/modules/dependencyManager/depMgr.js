/**
 * Created by pwr on 13.02.2015.
 */

window.cubx.amd.define(['jqueryLoader', 'utils', 'responseCache', 'manifestConverter', 'axios'], function ($, utils, responseCache, manifestConverter, axios) {
  'use strict';

  /**
   * The Dependency Manager takes care about resolving dependencies of an application.
   * @constructor
   * @global
   */
  var DependencyMgr = function () {
    /**
     * The used baseUrl for dependant webpackages.
     * @type {string}
     * @private
     */
    this._baseUrl = null;

    /**
     * A List of DepReference items
     * @type {object}
     * @private
     */
    this._depList = null;

    /**
     * The runtime mode for injected resources. Default is 'prod'
     * @type {string}
     * @private
     */
    this._runtimeMode = null;

    /**
     * Reference to the crc instance this DependencyMgr instance belongs to
     * @type {object}
     * @private
     */
    this._crc = null;

    /**
     * The responseCache used by this DependencyMgr instance
     * @type {object}
     * @private
     */
    this._responseCache = responseCache;

    /**
     * Holds an axios instance used for requesting manifest.webpackage files
     * @type {object}
     * @private
     */
    this._axios = axios.create({
      transformResponse: [DependencyMgr._prepareResponseData]
    });
  };

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------                 Static Properties            ---------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Contains all possible resource types
   * @type {object}
   * @memberOf DependencyMgr
   * @static
   * @private
   */
  DependencyMgr._types = {
    stylesheet: {
      name: 'stylesheet',
      fileEndings: [
        'css'
      ],
      'template': '<link rel="stylesheet" href="#">'
    },
    htmlImport: {
      name: 'htmlImport',
      fileEndings: [
        'html',
        'htm'
      ],
      'template': '<link rel="import" href="#">'
    },
    javascript: {
      name: 'javascript',
      fileEndings: [
        'js'
      ],
      'template': '<script src="#"></script>'
    }
  };

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------                 Public Methods              ---------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Init the dependency manager.
   * @memberOf DependencyMgr
   */
  DependencyMgr.prototype.init = function () {
    var get = window.cubx.utils.get;
    this._baseUrl = get(window, 'cubx.CRCInit.webpackageBaseUrl');
    this._runtimeMode = get(window, 'cubx.CRCInit.runtimeMode');
    this._crc = get(window, 'cubx.CRC');
    var rootDependencies = get(window, 'cubx.CRCInit.rootDependencies') || [];

    // load cif, if it is not excluded by config
    if (get(window, 'cubx.CRCInit.loadCIF') === 'true') {
      console.log('Pushing cif into the dependencies ...');
      rootDependencies.unshift({
        artifactId: 'cif',
        endpointId: 'main', // as long as manifest.webpackage is not migrated to modelVersion 9.1. we still need an enpointId here
        webpackageId: get(window, 'cubx.CRCInit.rteWebpackageId')
      });
    }

    // load es6-promise polyfill if necessary
    if (get(window, 'cubx.CRCInit.polyfillPromise') === true) {
      console.log('Pushing es6-promise (polyfill) into the dependencies ...');
      rootDependencies.unshift({
        artifactId: 'es6-promise',
        endpointId: 'html-import', // as long as manifest.webpackage is not migrated to modelVersion 9.1. we still need an enpointId here
        webpackageId: get(window, 'cubx.CRCInit.rteWebpackageId')
      });
    }

    // remove endpointId properties from rootDependencies and append endpointId to artifactId using separator '#'
    // needed for backwards compatibility to modelVersion 8.x
    this._removeEndpointIdFromRootDependencies(rootDependencies);

    // set all top level dependencies as initial depList
    this._depList = this._createDepReferenceListFromEndpointDependencies(rootDependencies, null);
  };

  /**
   * Calculate and inject dependencies
   * @memberOf DependencyMgr
   */
  DependencyMgr.prototype.run = function () {
    this._calculateDependencyList(this._injectDependenciesToDom);
  };

  /**
   * calculate list of all references (as URLs) that need to be injected
   * @memberOf DependencyMgr
   * @private
   * @param {function} next Callback to be called when dependency list calculation is done. The list of all needed
   *                        resources is provided as the callback parameter
   */
  DependencyMgr.prototype._calculateDependencyList = function (next) {
    var self = this;
    if (typeof next === 'function') {
      this._resolveDependencies(function (allDependencies) {
        // add all needed resource items to resource list and call next()
        var resourceList = self._calculateResourceList(allDependencies);
        self._depList = allDependencies;
        next(resourceList);
      }, self._depList);
    } else {
      throw new TypeError('parameter "next" needs to be a function');
    }
  };

  /**
   * This method gets all direct and indirect dependencies by fetching manifest.webpackage files from all of them.
   * It will iterate over the endpoint-dependencies and fetch non resolved dependency as long as there are any.
   * At the end the depList will be passed to the function passed with the 'next' -parameter.
   * Note: the list items will <b>not</b> contain the needed files!
   * @memberOf DependencyMgr
   * @param {function} next Callback to be called after dependency list calculation is complete
   * @param {Array} depList dependency list
   * @private
   */
  DependencyMgr.prototype._resolveDependencies = function (next, depList) {
    var self = this;
    var resolveOutstandingDependencies = function (depList) {
      var deferredDepReferenceResolutions = [];
      // create list of DepReferenceItems
      for (var j = 0; j < depList.length; j++) {
        var depRef = depList[ j ];
        if (depRef.resolved) {
          continue;
        }
        // as the DepReference item is now going to be processed, mark it as not outstanding
        depRef.resolved = true;
        deferredDepReferenceResolutions.push(self._resolveDepReference(depRef));
      }

      // get all outstanding direct dependencies
      $.when.apply(window, deferredDepReferenceResolutions).done(function () {
        // keep current number of DepReference items in depList, to decide recursive call at the end
        var oldLength = depList.length;
        // process each promise from ajax requests (each request belongs to one promise)
        for (var i = 0; i < deferredDepReferenceResolutions.length; i++) {
          // current DepReference item for which the dependencies where requested
          var currentDepReference = arguments[ i ].item;
          var currentEndpoint = arguments[ i ].data;
          if (!currentEndpoint) {
            console.error('Endpoint ' + arguments[ i ].item.webpackageId + '/' + arguments[ i ].item.artifactId + ' / ' +
              arguments[ i ].item.endpointId + ' not found.');
          }
          // attach all the resources to DepReference item if there are any
          if (currentEndpoint.hasOwnProperty('resources') && currentEndpoint.resources.length > 0) {
            currentDepReference.resources = currentEndpoint.resources;
          }

          // if there are dependencies, create new DepReference Items
          if (currentEndpoint.hasOwnProperty('dependencies') && currentEndpoint.dependencies.length > 0) {
            // all the dependencies of current artifactEndpointObject
            var referredDepReferences =
              self._createDepReferenceListFromEndpointDependencies(currentEndpoint.dependencies,
                currentDepReference.getId());
            referredDepReferences.forEach(function (referredDepReferenceItem) {
              var indexOfCurrentDepReferenceItem = self._getIndexOfDepReferenceItem(depList,
                currentDepReference);
              var indexOfReferredDepReferenceItem = self._getIndexOfDepReferenceItem(depList,
                referredDepReferenceItem);
              if (indexOfReferredDepReferenceItem === -1) {
                // insert a new DepReference item if this one is not in depList yet.
                // Note: insert the new DepReference item *before* the dependent DepReference item!
                utils.Array.insertBefore(depList, referredDepReferenceItem, currentDepReference);
              } else if (indexOfReferredDepReferenceItem > indexOfCurrentDepReferenceItem) {
                // if the DepReference item is already in the list and it's position is greater than
                // the position of the current dependent DepReference move it
                (function () {
                  var existingDepReferenceItem = depList[ indexOfReferredDepReferenceItem ];
                  utils.Array.removeItemFromArray(depList, existingDepReferenceItem);
                  utils.Array.insertBefore(depList, existingDepReferenceItem, currentDepReference);
                  existingDepReferenceItem.referrer.push(currentDepReference.getId());
                }());
              } else {
                (function () {
                  var existingDepReferenceItem = depList[ indexOfReferredDepReferenceItem ];
                  existingDepReferenceItem.referrer.push(currentDepReference.getId());
                }());
              }
            });
          }
        }
        // if there where new DepReference Items added, check their manifest files
        if (oldLength < depList.length) {
          resolveOutstandingDependencies(depList);
        } else if (typeof next === 'function') {
          // if all dependencies have been fetched continue with next callback
          next(depList);
        }
      });
    };

    resolveOutstandingDependencies(depList);
  };

  /**
   * Calculate the needed resources based on the depList
   * @memberOf DependencyMgr
   * @param {Array} depList A list containing all the needed dependencies as DepReference items
   * @return {Array} A list containing all the needed resources in correct order
   * @private
   */
  DependencyMgr.prototype._calculateResourceList = function (depList) {
    var resourceList = [];
    for (var i = 0; i < depList.length; i++) {
      var currentDepRef = depList[ i ];
      for (var j = 0; j < currentDepRef.resources.length; j++) {
        var resource = this._createResourceFromItem(currentDepRef.webpackageId + '/' +
          currentDepRef.artifactId, currentDepRef.resources[ j ],
          this._runtimeMode, currentDepRef.referrer);
        if (resource) {
          resourceList.push(resource);
        }
      }
    }
    return resourceList;
  };

  /**
   * Public method used to dynamically add dependencies.
   * @memberOf DependencyMgr
   * @param {object} dependencies
   * @return {Array} resolved dependencyList
   */
  DependencyMgr.prototype.addToCache = function (dependencies) {
    var rootDeps = dependencies || [];
    var depList = this._createDepReferenceListFromEndpointDependencies(rootDeps, 'dynamically-added');
    depList = this._resolveDependencies(null, depList);
    return depList;
  };

  /**
   * Write Resource-References for Dependencies in DOM.
   * @memberOf DependencyMgr
   * @param {array} depList Array containing references to all needed resources
   */
  DependencyMgr.prototype._injectDependenciesToDom = function (depList) {
    // var element = document.getElementsByTagName('head')[0].firstElementChild;
    for (var i = 0; i < depList.length; i++) {
      var current = depList[ i ];
      switch (current.type) {
        case DependencyMgr._types.stylesheet.name :
          // utils.DOM.prependStylesheetToHead(current.path, element);
          utils.DOM.appendStylesheetToHead(current.path, current.referrer);
          break;
        case DependencyMgr._types.htmlImport.name :
          // utils.DOM.prependHtmlImportToHead(current.path, element);
          utils.DOM.appendHtmlImportToHead(current.path, current.referrer);
          break;
        case DependencyMgr._types.javascript.name :
          // utils.DOM.prependScriptTagToHead(current.path, element);
          utils.DOM.appendScriptTagToHead(current.path, current.referrer);
      }
    }
    window.cubx.CRC.fireDepMgrReadyEvent();
  };

  /**
   * Set crc instance this DependencyMgr instance belongs to
   * @memberOf DependencyMgr
   * @param {object} crc
   * @deprecated
   */
  DependencyMgr.prototype.setCRC = function (crc) {
    if (typeof crc !== 'object') {
      throw new TypeError('parameter "crc" needs to be an instance of the CRC');
    }

    this._crc = crc;
  };

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------                 Static Methods               ---------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Check if given type is valid
   * @param {string} type
   * @return {boolean}
   * @memberOf DependencyMgr
   * @static
   * @private
   */
  DependencyMgr._isValidResourceType = function (type) {
    for (var property in DependencyMgr._types) {
      if (DependencyMgr._types.hasOwnProperty(property)) {
        if (DependencyMgr._types[ property ].name === type) {
          return true;
        }
      }
    }

    return false;
  };

  /**
   * Prepare given data for Dependency Resolution. This is used to convert manifest.webpackage files before resolving
   * Dependencies.
   * @param {object} data The data to be transformed
   * @return {object} the prepared data
   * @static
   * @memberOf DependencyMgr
   * @private
   */
  DependencyMgr._prepareResponseData = function (data) {
    var manifest = manifestConverter.convert(data);
    return JSON.stringify(manifest);
  };

  /**
   * Alias for jQuery's ajax() method
   * @type {function}
   * @memberOf DependencyMgr
   */
  DependencyMgr.ajax = $.ajax;

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------                 Private Methods              ---------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Create and get a list with elements from type of DepRef from the passed artifact-endpoint dependencies.
   * @param {Array} dependencies dependency attribute from artifact-endpoint
   * @param {object | undefined} referrer is an object containing the artifactId and webpackageId of the artifact, which
   *    refers to the dependencies passed with the first parameter.
   * @return {Array} dependency list, which elements DepRef objects are.
   * @private
   * @memberOf DependencyMgr
   */
  DependencyMgr.prototype._createDepReferenceListFromEndpointDependencies =
    function (dependencies, referrer) {
      var self = this;
      var depList = [];
      if (!dependencies) {
        return depList;
      }

      // check given referrer is of type object
      if (referrer && typeof referrer !== 'object') {
        console.error('Expect parameter "referrer" to be null or of type object: ', referrer);
        // if referrer is invalid set it to null. A referrer with value 'null' is interpreted as 'root'
        referrer = null;
      }

      // console.log(typeof dependencies)
      dependencies.forEach(function (dependency) {
        var valid = true; // just a flag used for skipping the processing of current dependency when it is invalid

        // check if dependency is of type 'object' and has at least string property 'artifactId'
        if (!(typeof dependency === 'object' && dependency.hasOwnProperty('artifactId') && typeof dependency.artifactId === 'string')) {
          console.error('Expected parameter to be an object containing at least string property "artifactId": ', dependency);
          valid = false;
        }
        // check if depdencies manifest property is of type object (in case there is a manifest property)
        if (dependency.hasOwnProperty('manifest') && typeof dependency.manifest !== 'object') {
          console.error('Expected parameter to be an object containing at least string property "artifactId": ', dependency);
          valid = false;
        }

        // continue processing of current dependency only if it's a valid one
        if (valid) {
          var depReferenceInitObject = {
            referrer: referrer,
            artifactId: dependency.artifactId,
            webpackageId: self._determineWebpackageId(dependency, referrer)
          };

          // add manifest if available
          if (dependency.manifest) {
            depReferenceInitObject.manifest = dependency.manifest;
          }

          depList.push(new DepReference(depReferenceInitObject));

          // if (dep.endpoint.indexOf('this') === 0) {
          //   var regex = /^(.*)?@([^\/]*)/; <-- match auf [webpackage]@[version]
          //   var regErg = regex.exec(referrer);s
          //   var referrerPath;
          //   if (!regErg) { <-- Dieser Fall tritt nur ein, wenn der referrer keine vollständige webpackageId enhält
          //     referrerPath = referrer.substr(0, referrer.indexOf('/'));
          //   } else {
          //     referrerPath = regErg ? (regErg[ 0 ] || '') : '';
          //   }
          //   depReferenceInitObject.dependency = referrerPath + dep.endpoint.substr('this'.length);
          // } else {
          //   depReferenceInitObject.dependency = dep.endpoint;
          // }
        }
      });
      return depList;
    };

  /**
   * Create a Resource item
   * @memberOf DependencyMgr
   * @param {string} qualifiedArtifactId extended id of the artifact (including the webpackgeId) this resourceItem
   *     belongs to
   * @param {object} item Item from resources list in dependency.json
   * @param {type} runtimeMode Either "prod" or "dev"
   * @param {array} referrer referrer list
   * @private
   * @return {object} Resource item
   */
  DependencyMgr.prototype._createResourceFromItem = function (qualifiedArtifactId, item, runtimeMode, referrer) {
    // if item does not contain a prod-dev structure, map it into that - to simplify further processing
    if (typeof item === 'string') {
      item = {
        prod: item,
        dev: item
      };
    }

    if (!item.hasOwnProperty('prod') || !item.hasOwnProperty('dev') ||
      typeof item.prod !== 'string' || typeof item.dev !== 'string') {
      throw new TypeError('parameter "item" needs to have string properties "prod" and "dev"');
    }

    if (qualifiedArtifactId === null || typeof qualifiedArtifactId !== 'string') {
      throw new TypeError('parameter "qualifiedArtifactId" needs to be of type string');
    }

    var file;

    var get = window.cubx.utils.get;
    var allowAbsoluteResourceUrls = get(window, 'cubx.CRCInit.allowAbsoluteResourceUrls');
    if (item[ runtimeMode ].indexOf('http') === 0 || item[ runtimeMode ].indexOf('blob') === 0) {
      if (allowAbsoluteResourceUrls) {
        file = item[ runtimeMode ];
      } else {
        console.warn('The following resource can not be loaded since the use of absolute urls is not allowed by default: ' + item[ runtimeMode ]);
        return;
      }
    } else {
      file = this._baseUrl + qualifiedArtifactId + '/' + item[ runtimeMode ];
    }

    var resMetaObj = this._determineResourceType(file);
    if (!resMetaObj.fileType) {
      console.warn('The following resource will be ignored, because the type of the resource is unkown. It should be "js", "html" or "css". (' + item[ runtimeMode ] + ')');
      return;
    }
    return new Resource(resMetaObj.fileName, resMetaObj.fileType.name, referrer);
  };

  /**
   * Determine resource type based on the file ending of a given filename
   * @memberOf DependencyMgr
   * @param {string} fileName
   * @return {object} fileType The file type or null if no type could be determined
   * @private
   */
  DependencyMgr.prototype._determineResourceType = function (fileName) {
    var fileType;
    var paramTypeIndex = fileName.indexOf('?type=');
    var paramType;
    if (paramTypeIndex > 0) {
      paramType = fileName.substr(paramTypeIndex + 6);
      fileName = fileName.substring(0, paramTypeIndex);
    }
    var fileEnding = paramType || fileName.split('.')[ fileName.split('.').length - 1 ];

    for (var property in DependencyMgr._types) {
      if (DependencyMgr._types.hasOwnProperty(property)) {
        var type = DependencyMgr._types[ property ];
        for (var i = 0; i < type.fileEndings.length; i++) {
          if (type.fileEndings[ i ] === fileEnding) {
            fileType = type;
            break;
          }
        }
        if (fileType) {
          break;
        }
      }
    }

    return {
      fileType: fileType,
      fileName: fileName
    };
  };

  /**
   * Internal helper method to determine the webpackageId of a given dependency in the context of a given referrer. If no referrer is given, then
   * dependency needs to have property webpackageId.
   * @memberOf DependencyMgr
   * @param {object} dependency An object containing at least string property "artifactId" and optional string property "webpackageId"
   * @param {object|null} referrer An object containing string properties "artifactId" and "webpackageId" or null
   * @return {string} The webpackageId of the dependency or an empty string if no webpackageId could be determined
   * @private
   */
  DependencyMgr.prototype._determineWebpackageId = function (dependency, referrer) {
    if (dependency.hasOwnProperty('webpackageId') && typeof dependency.webpackageId === 'string') {
      return dependency.webpackageId;
    } else if (referrer && typeof referrer === 'object' && referrer.hasOwnProperty('webpackageId') && referrer.hasOwnProperty('artifactId')) {
      // if there is no webpackageId given then we assume that the dependency resides in the same webpackage like the referrer
      return referrer.webpackageId;
    } else {
      console.error('Could not determine webpackageId for dependency: ', dependency, ' and referrer: ', referrer);
      return '';
    }
  };

  /**
   * Internal helper method for removing endpointId property from all rootDependencies having this property. The value of the
   * endpointId property is appended to the artifactId used endpointSeparator from ManifestConverter.
   * @memberOf DependencyMgr
   * @param {object} rootDependencies
   * @private
   */
  DependencyMgr.prototype._removeEndpointIdFromRootDependencies = function (rootDependencies) {
    rootDependencies.forEach(function (dependency) {
      if (dependency.hasOwnProperty('endpointId') && typeof dependency.endpointId === 'string') {
        dependency.artifactId = dependency.artifactId + manifestConverter.endpointSeparator + dependency.endpointId;
        delete dependency.endpointId;
      }
    });
  };

  /**
   * Resolve and return the artifact-endpoint object, described by the argument.
   * @param {DepReference} depReference Object containing a reference to an artifact-endpoint
   * @private
   * @memberOf DependencyMgr
   * @returns {object} promise JQuery promise object
   */
  DependencyMgr.prototype._resolveDepReference = function (depReference) {
    var deferred = $.Deferred();
    var self = this;
    var url = null; // holds the url for requesting the manifest.webpackage. Will be null if there is a manifest object given in depReference.

    // check if there is already an item in the ResponseCache for given webpackageId
    if (depReference.webpackageId && this._responseCache.get(depReference.webpackageId) != null) {
      var cachedManifest = this._responseCache.get(depReference.webpackageId);
      this._storeManifestFiles(cachedManifest, depReference.getArtifactId());
      deferred.resolve({
        item: depReference,
        data: this._extractArtifactEndpoint(depReference, this._responseCache.get(depReference.webpackageId))
      });
    }

    // skip further processing if deferred is already resolved and thus we do have already a manifest from ResponseCache
    if (deferred.state() === 'resolved') {
      return deferred.promise();
    }

    // use inline manifest from depReference, if there is any
    if (depReference.manifest && typeof depReference.manifest === 'object') {
      // resolve deferred with manifest object from depReference
      // Note: There is no built in validation of given object against our manifest schema!
      this._storeManifestFiles(depReference.manifest, depReference.getArtifactId());
      this._responseCache.addItem(depReference.webpackageId, depReference.manifest);
      deferred.resolve({
        item: depReference,
        data: this._extractArtifactEndpoint(depReference, depReference.manifest)
      });
    } else {
      // refer to the manifest.webpackage -file as this is also available if we don't use a couchdb based backend
      url = this._baseUrl + depReference.webpackageId + '/manifest.webpackage';
    }

    // skip further processing if deferred is already resolved and thus we do have already a manifest from depReference item
    if (deferred.state() === 'resolved') {
      return deferred.promise();
    }

    // only make ajax request if there is a url given
    if (url) {
      // DependencyMgr.ajax({
      //   url: url,
      //   dataType: 'json',
      //   success: function (data, textStatus) {
      //     self._storeManifestFiles(data, depReference.getArtifactId());
      //     self._responseCache.addItem(depReference.webpackageId, data);
      //     deferred.resolve({
      //       item: depReference,
      //       data: self._extractArtifactEndpoint(depReference, data)
      //     });
      //   },
      //   error: function (jqXHR, textStatus, errorThrown) {
      //     deferred.reject({
      //       status: textStatus,
      //       error: errorThrown
      //     });
      //   }
      // });

      this._fetchManifest(url).then(function (data) {
        self._storeManifestFiles(data, depReference.getArtifactId());
        self._responseCache.addItem(depReference.webpackageId, data);
        deferred.resolve({
          item: depReference,
          data: self._extractArtifactEndpoint(depReference, data)
        });
      }, function (error) {
        deferred.reject({
          status: error.response.status,
          error: error
        });
      });
    }

    return deferred.promise();
  };

  /**
   * Request a manifest.webpackage file using ajax
   * @param {string} url The url for fetching the manifest.webpackage from
   * @return {object} Promise
   * @private
   * @memberOf DependencyMgr
   */
  DependencyMgr.prototype._fetchManifest = function (url) {
    return this._axios.request({
      url: url
    });
  };

  /**
   * Get the dependencies of a webpackage from base
   * @param {DepReference} depReference Object containing either 'groupId', 'name' and 'version' string
   * @param {string} manifest file of the referred webpackage
   *     properties or 'id' string property of the requested webpackage (normally an item of type DepReference)
   * @private
   * @memberOf DependencyMgr
   * @returns {array | undefined} the dependencies of the passed artifactEndpointReference or undefined, if the
   *     endpoint has not been found.
   */
  DependencyMgr.prototype._extractArtifactEndpoint = function (depReference, manifest) {
    var artifactEndpoint;
    if (manifest) {
      // for apps, elementaryComponents etc.
      // console.log(JSON.stringify(manifest))
      Object.keys(manifest.artifacts).some(function (artifactType) {
        manifest.artifacts[ artifactType ].some(function (artifact) {
          if (artifact.artifactId === depReference.artifactId) {
            artifact.endpoints.some(function (endpoint) {
              if (endpoint.endpointId === depReference.endpointId) {
                artifactEndpoint = endpoint;
                return true;
              }
            });
          }
        });
      });
    }
    return artifactEndpoint;
  };
  /**
   * Find index of given DepReference item in internal depList
   * @param {array} depList A dependeny list
   * @param {object} item A DepReference item
   * @return {number} The index of the item or -1 if item is not in depList
   * @private
   * @memberOf DependencyMgr
   */
  DependencyMgr.prototype._getIndexOfDepReferenceItem = function (depList, item) {
    var index = -1;
    if (item === null || typeof item !== 'object') {
      throw TypeError('parameter item needs to be of type "DepReference"');
    }
    for (var i = 0; i < depList.length; i++) {
      if (item.equals(depList[ i ])) {
        index = i;
        break;
      }
    }
    return index;
  };

  /**
   * store all manifest files of the dependency in manifest cache
   * @param {object} document document object of the resource
   * @param {string} artifactId
   * @private
   * @memberOf DependencyMgr
   */
  DependencyMgr.prototype._storeManifestFiles = function (document, artifactId) {
    var cache = window.cubx.CRC.getCache();
    cache.addComponentCacheEntry(document, artifactId);
  };

  /* ----------------------------------------------------------------------------------------------------------------*/
  /* --------------------------------------- Dependency Reference Class ---------------------------------------------*/
  /* ----------------------------------------------------------------------------------------------------------------*/

  /**
   * Class for representing a dependency item in a dependency list. Each dependency is in fact a reference to an
   * artifact´s endpoint within a webpackage.
   * @global
   * @constructor
   * @param {object} initObject with the structure of an endpoint´s dependency array
   */
  var DepReference = function (initObject) {
    /**
     * id of the webpackage
     * @type {string}
     */
    this.webpackageId = initObject.webpackageId;

    /**
     * id of the artifact
     * @type {string}
     */
    this.artifactId = initObject.artifactId;

    /**
     * id list of referrer of webpackage
     * @type {array}
     */
    this.referrer = [];

    /**
     * Array of resources
     * @type {Resource}
     */
    this.resources = [];

    /**
     * Array holding direct dependencies as DepReference items
     * @type {Array}
     */
    this.dependencies = [];

    /**
     * Object representing a manifest.webpackage file that should be used when resolving this DepReference instance.
     * Requesting a manifest.webpackage via ajax will be skipped for this DepReference instance if this is set.
     * @type {object}
     */
    this.manifest = initObject.manifest || undefined;

    this.equals = function (item) {
      return item.webpackageId + item.artifactId === this.webpackageId + this.artifactId;
    };

    // constructor logic
    (function (referrer) {
      if (referrer && typeof referrer === 'object' && referrer.hasOwnProperty('webpackageId') && referrer.hasOwnProperty('artifactId')) {
        this.referrer.push(referrer);
      } else if (referrer === null) {
        // if referrer is null we assume it's a root dependency. So we set referrer to 'root'
        this.referrer.push('root');
      } else {
        console.warn('DepManager received referrer of unexpected type \'' + typeof referrer + '\'');
      }
    }.bind(this))(initObject.referrer);
  };

  DepReference.prototype.getId = function () {
    return this.webpackageId + '/' + this.artifactId;
  };
  DepReference.prototype.getArtifactId = function () {
    return this.artifactId;
  };
  /* ----------------------------------------------------------------------------------------------------------------*/
  /* --------------------------------------- Resource Class ---------------------------------------------*/
  /* ----------------------------------------------------------------------------------------------------------------*/

  /**
   * @global
   * @constructor
   * @param {string} path The resource path
   * @param {string} type The resource type
   * @param {array} referrer list
   */
  var Resource = function (path, type, referrer) {
    if (path === null || typeof path !== 'string' || path.length === 0) {
      throw new TypeError('parameter "path" needs to be of type string');
    }

    /**
     * Path
     * @type {string}
     */
    this.path = path;

    if (type === null || typeof type !== 'string' || type.length === 0) {
      throw new TypeError('parameter "type" needs to be of type string');
    }

    if (!DependencyMgr._isValidResourceType(type)) {
      throw new TypeError('parameter "type" has non valid value');
    }

    /**
     * type
     * @type {string}
     */
    this.type = type;

    /**
     * referrer list
     */
    this.referrer = referrer;
  };

  return DependencyMgr;
});
