/**
 * Created by pwr on 13.02.2015.
 */

window.cubx.amd.define([ 'jqueryLoader', 'utils' ], function ($, utils) {
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
      rootDependencies.unshift(get(window, 'cubx.CRCInit.rteWebpackageId') + '/cif/main');
    }

    if (get(window, 'cubx.CRCInit.pollyfillPromise') === true) {
      console.log('Pushing es6-promise (polyfill) into the dependencies ...');
      rootDependencies.unshift(get(window, 'cubx.CRCInit.rteWebpackageId') + '/es6-promise/html-import');
    }

    // set all top level dependencies as initial depList
    var rootReferrer = window.location.pathname.substr(1);
    this._depList = this._createDepReferenceListFromEndpointDependencies(rootDependencies, rootReferrer);
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
        resourceList.push(this._createResourceFromItem(currentDepRef.webpackageId + '/' +
          currentDepRef.artifactId, currentDepRef.resources[ j ],
          this._runtimeMode, currentDepRef.referrer));
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
      throw new TypeError('paramter "crc" needs to be an instance of the CRC');
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
   * @param {string | undefined} referrer is the full endpointId ({webpackageId}/{artifactId}/{endpointId}) of the
   *     artifact-endpoint, which refers to the  dependencies passed with the first parameter
   * @return {Array} dependency list, which elements DepRef objects are.
   * @private
   * @memberOf DependencyMgr
   */
  DependencyMgr.prototype._createDepReferenceListFromEndpointDependencies =
    function (dependencies, referrer) {
      var depList = [];
      if (!dependencies) {
        return depList;
      }
      // console.log(typeof dependencies)
      dependencies.forEach(function (dependency) {
        if (typeof dependency === 'string') {
          var depReferenceInitObject = {
            'referrer': referrer
          };
          // check if this is a webpackage-internal dependency
          if (dependency.indexOf('this') === 0) {
            var regex = /^(.*)?@([^\/]*)/;
            var regErg = regex.exec(referrer);
            var referrerPath;
            if (!regErg) {
              referrerPath = referrer.substr(0, referrer.indexOf('/'));
            } else {
              referrerPath = regErg ? (regErg[ 0 ] || '') : '';
            }
            depReferenceInitObject.dependency = referrerPath + dependency.substr('this'.length);
          } else {
            depReferenceInitObject.dependency = dependency;
          }
          depList.push(new DepReference(depReferenceInitObject));
        } else {
          console.error('Expected parameter to be a string, but value was: ' + typeof dependency);
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
    if (qualifiedArtifactId === '') {
      file = item[ runtimeMode ];
    } else {
      file = this._baseUrl + qualifiedArtifactId + '/' + item[ runtimeMode ];
    }
    var type = this._determineResourceType(file);
    return new Resource(file, type.name, referrer);
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
    var fileEnding = fileName.split('.')[ fileName.split('.').length - 1 ];

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

    return fileType;
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
    // refer to the manifest.webpackage -file as this is also available if we don't use a couchdb based backend
    var url = this._baseUrl + depReference.webpackageId + '/manifest.webpackage';
    DependencyMgr.ajax({
      url: url,
      dataType: 'json',
      success: function (data, textStatus) {
        self._storeManifestFiles(data, depReference.getArtifactId());
        deferred.resolve({
          item: depReference,
          data: self._extractArtifactEndpoint(depReference, data)
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        deferred.reject({
          status: textStatus,
          error: errorThrown
        });
      }
    });

    return deferred.promise();
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
    this.webpackageId = undefined;

    /**
     * id of the artifact
     * @type {string}
     */
    this.artifactId = undefined;

    /**
     * id of the endpoint
     * @type {string}
     */
    this.endpointId = undefined;

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

    this.equals = function (item) {
      return item.webpackageId + item.artifactId + item.endpointId ===
        this.webpackageId + this.artifactId + this.endpointId;
    };

    // constructor logic
    var init = function (dependency, referrer) {
      var regex = /[^\/]*@[^\/]*/;
      // this.webpackageId = dependency.substring(0, dependency.indexOf('/'));
      var regErg = regex.exec(dependency);
      if (!regErg) {
        this.webpackageId = dependency.substr(0, dependency.indexOf('/'));
      } else {
        this.webpackageId = regErg ? (regErg[ 0 ] || '') : '';
      }
      this.artifactId = dependency.substring(dependency.indexOf(this.webpackageId) + this.webpackageId.length + 1,
        dependency.lastIndexOf('/'));
      this.endpointId = dependency.substring(dependency.lastIndexOf('/') + 1);
      if (typeof referrer === 'string') {
        this.referrer.push(referrer);
      } else {
        console.warn('DepManager received referrer of unexpected type \'' + typeof referrer + '\'');
      }
    }.bind(this);
    init(initObject.dependency, initObject.referrer);
  };

  DepReference.prototype.getId = function () {
    return this.webpackageId + '/' + this.artifactId + '/' + this.endpointId;
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
