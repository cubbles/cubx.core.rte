/**
 * Created by pwr on 13.02.2015.
 */

window.cubx.amd.define(
  ['jqueryLoader', 'utils', 'responseCache', 'manifestConverter', 'axios', 'dependencyTree'],
  function ($, utils, responseCache, manifestConverter, axios, DependencyTree) {
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
        transformResponse: [DependencyMgr._prepareResponseData],
        responseType: 'json'
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
          webpackageId: get(window, 'cubx.CRCInit.rteWebpackageId')
        });
      }

      // remove endpointId properties from rootDependencies and append endpointId to artifactId using separator '#'
      // needed for backwards compatibility to modelVersion 8.x
      this._removeEndpointIdFromRootDependencies(rootDependencies);

      // we need to ensure that each rootDependency has a valid webpackageId as this will be used to build path for
      // requesting associated mannifest.webpackage files
      this._determineWebpackageIdsForRootRependencies(rootDependencies);

      // set all top level dependencies as initial depList
      this._depList = this._createDepReferenceListFromArtifactDependencies(rootDependencies, null);
    };

    /**
     * Calculate and inject dependencies
     * @memberOf DependencyMgr
     */
    DependencyMgr.prototype.run = function () {
      this._calculateDependencyList(this._injectDependenciesToDom);
    };

    /**
     * Calculate and inject dependencies using DependencyTree. This Method will replace old run method above
     * @memberOf DependencyMgr
     */
    DependencyMgr.prototype.run_new = function () {
      var get = window.cubx.utils.get;
      var rootDependencies = get(window, 'cubx.CRCInit.rootDependencies') || [];
      this._buildRawDependencyTree(this._createDepReferenceListFromArtifactDependencies(rootDependencies, null), this._baseUrl)
        .then(function (depTree) {
          return this._checkDepTreeForExcludes(depTree, this._baseUrl);
        }.bind(this))
        .then(function (depTree) {
          depTree.applyExcludes();
          depTree.removeDuplicates();
          depTree.removeExcludes();

          console.log(depTree);
          var allDependencies = this._getDependencyListFromTree(depTree);
          var resourceList = this._calculateResourceList(allDependencies);
          // this._injectDependenciesToDom(resourceList);
          console.log(resourceList);
        }.bind(this), function (error) {
          console.error('Error while building and processing DependencyTree: ', error);
        });
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
     * @memberOf DependencyMgr
     * @private
     * @param {object} depTree a DependencyTree instance
     * @returns {object} Array representing a list of depReference items.
     */
    DependencyMgr.prototype._getDependencyListFromTree = function (depTree) { // TODO: Test me!
      var depList = [];
      depTree.traverseBF(function (node) {
        depList.push(node.data);
      });
      depList.reverse();
      return depList;
    };

    /**
     * This method gets all direct and indirect dependencies by fetching manifest.webpackage files from all of them.
     * It will iterate over the artifact-dependencies and fetch non resolved dependency as long as there are any.
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
            var currentArtifact = arguments[ i ].data;
            if (!currentArtifact) {
              console.error('Artifact ' + arguments[ i ].item.webpackageId + '/' + arguments[ i ].item.artifactId + ' not found.');
            }
            // attach all the resources to DepReference item if there are any
            if (currentArtifact.hasOwnProperty('resources') && currentArtifact.resources.length > 0) {
              currentDepReference.resources = currentArtifact.resources;
            }

            // if there are dependencies, create new DepReference Items
            if (currentArtifact.hasOwnProperty('dependencies') && currentArtifact.dependencies.length > 0) {
              // all the dependencies of current artifactObject
              var referredDepReferences =
                self._createDepReferenceListFromArtifactDependencies(currentArtifact.dependencies,
                  {webpackageId: currentDepReference.webpackageId, artifactId: currentDepReference.artifactId});
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
                    existingDepReferenceItem.referrer.push({webpackageId: currentDepReference.webpackageId, artifactId: currentDepReference.artifactId});
                  }());
                } else {
                  (function () {
                    var existingDepReferenceItem = depList[ indexOfReferredDepReferenceItem ];
                    existingDepReferenceItem.referrer.push({webpackageId: currentDepReference.webpackageId, artifactId: currentDepReference.artifactId});
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
          // remove endpoint appendix from artifactId if there was one added by the manifestConverter
          var qualifiedArtifactId = currentDepRef.artifactId.indexOf('#') > -1
            ? currentDepRef.webpackageId + '/' + currentDepRef.artifactId.split('#')[0]
            : currentDepRef.webpackageId + '/' + currentDepRef.artifactId;
          var resource = this._createResourceFromItem(qualifiedArtifactId, currentDepRef.resources[ j ],
            this._runtimeMode, currentDepRef.referrer);
          if (resource) {
            resourceList.push(resource);
          }
        }
      }
      return resourceList;
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
        var currentReferrer = [];
        current.referrer.some(function (referrer, index) {
          currentReferrer[index] = typeof referrer === 'string'
                                   ? referrer
                                   : referrer.webpackageId + '/' + referrer.artifactId;
        });
        switch (current.type) {
          case DependencyMgr._types.stylesheet.name :
            // utils.DOM.prependStylesheetToHead(current.path, element);
            utils.DOM.appendStylesheetToHead(current.path, currentReferrer);
            break;
          case DependencyMgr._types.htmlImport.name :
            // utils.DOM.prependHtmlImportToHead(current.path, element);
            utils.DOM.appendHtmlImportToHead(current.path, currentReferrer);
            break;
          case DependencyMgr._types.javascript.name :
            // utils.DOM.prependScriptTagToHead(current.path, element);
            utils.DOM.appendScriptTagToHead(current.path, currentReferrer);
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
      // TODO: check, if data is a valid manifest object/string
      var manifest = manifestConverter.convert(data);
      return manifest;
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
     * Build a DependencyTree for a list of given dependencies.
     * Note: The returned dependencyTree will NOT be cleaned regarding version conflicts or redundant dependencies!
     * @memberOf DependencyMgr
     * @param {array} rootDependencies Array of DepReference items
     * @param {string} baseUrl The URL from which the manifest.webpackage files should be requested.
     * @private
     * @return {object} promise Will be resolved with calculated DependencyTree or error
     */
    DependencyMgr.prototype._buildRawDependencyTree = function (rootDependencies, baseUrl) {
      if (!Array.isArray(rootDependencies)) {
        throw new TypeError('parameter \'rootDependencies\' needs to be an array');
      }

      return new Promise(function (resolve, reject) {
        var depTree = new DependencyTree();
        var rootNodes = [];

        // first create rootNodes in dependency tree based on rootDependencies
        rootDependencies.forEach(function (rootDependency) {
          var node = new DependencyTree.Node();
          node.data = rootDependency;
          depTree.insertNode(node);
          rootNodes.push(node);
        });

        // define recursively called function for resolving dependencyTree level by level
        // parentNodes is an array of same length as dependencies. parentNodes[i] is a parentNode reference for
        // dependencies[i]
        (function resolveDependencies (dependencies, parentNodes) {
          var resolutionsQueue = [];
          var nodes = [];

          dependencies.forEach(function (dep) {
            try {
              resolutionsQueue.push(this._resolveDepReferenceDependencies(dep, baseUrl));
            } catch (error) {
              console.error('Could not resolve Dependency ', dep.getId());
              reject(error);
            }
          }.bind(this));

          Promise.all(resolutionsQueue).then(function (results) {
            var unresolvedDependencies = [];
            // empty resolutionsQueue
            resolutionsQueue = [];
            // create and insert node in DependencyTree for each resolved dependency
            results.forEach(function (result, index) {
              var parentNode = parentNodes[index];
              parentNode.data.resources = result.resources;
              result.dependencies.forEach(function (depRefItem) {
                var node = new DependencyTree.Node();
                node.data = depRefItem;
                depTree.insertNode(node, parentNode);
                unresolvedDependencies.push(depRefItem);
                nodes.push(node);
              });
            });

            if (unresolvedDependencies.length > 0) {
              resolveDependencies.bind(this, unresolvedDependencies, nodes)();
            } else {
              resolve(depTree);
            }
          }.bind(this), function (error) {
            console.error('Could not resolve Dependency: ', error);
            reject(error);
          });
        }.bind(this))(rootDependencies, rootNodes);
      }.bind(this));
    };

    /**
     * Iterate over a given DependencyTree and check each node if there are dependecyExcludes defined in corresponding
     * manifest. If so these dependencyExcludes will be added.
     * @memberOf DependencyMgr
     * @param {object} depTree A DependencyTree instance
     * @param {string baseUrl A url used to request manifest files from
     * @return {object} promise A Promise
     * @private
     */
    DependencyMgr.prototype._checkDepTreeForExcludes = function (depTree, baseUrl) {
      // make some type checking
      if (!(depTree instanceof DependencyTree)) {
        throw new TypeError('parameter \'depTree\' needs to be an instance of DependencyMgr.DependencyTree');
      }
      if (typeof baseUrl !== 'string') {
        throw new TypeError('parameter \'baseUrl\' needs to be of type string');
      }

      return new Promise(function (resolve, reject) {
        // traverse through tree and request manifest for each node used for adding dependencyExcludes, if there are any.
        var nodes = [];
        var promises = [];

        depTree.traverseBF(function (node) {
          nodes.push(node);
          // if given node is a rootNode check global rootDependencies for existing excludes.
          if (node.parent == null) {
            this._checkAndAddExcludesForRootDependencies(node);
          };
          promises.push(this._getManifestForDepReference(node.data, baseUrl));
        }.bind(this));

        Promise.all(promises).then(function (results) {
          results.forEach(function (manifest, index) {
            try {
              this._checkAndAddExcludesToDepReference(nodes[index].data, manifest);
            } catch (e) {
              reject(e);
            }
            resolve(depTree);
          }.bind(this));
        }.bind(this), function (error) {
          reject(error);
        });
      }.bind(this));
    };

    /**
     * If given node represents a rootDependency this method checks if there are any dependency excludes defined in
     * global rootDependencies array for given node. If so these excludes will be added to DepReference item that given
     * nodes references.
     * @memberOf DependencyMgr
     * @param {object} node A DependencyTree.Node holding a DepReference item for property node.data
     * @return {object} The given node
     * @private
     */
    DependencyMgr.prototype._checkAndAddExcludesForRootDependencies = function (node) {
      // make some type checking of param node
      if (!(node instanceof DependencyTree.Node)) {
        throw new TypeError('parameter \'node\' needs to be an instance of DependencyTree.Node');
      }

      var rootDependencies = window.cubx.utils.get(window, 'cubx.CRCInit.rootDependencies') || [];
      rootDependencies = this._createDepReferenceListFromArtifactDependencies(rootDependencies, null);
      var rootDep = rootDependencies.find(function (dep) {
        return node.data.artifactId === dep.artifactId && node.data.webpackageId === dep.webpackageId;
      });

      if (rootDep.hasOwnProperty('dependencyExcludes')) {
        node.data.dependencyExcludes = rootDep.dependencyExcludes;
      }
      return node;
    };

    /**
     * Check if a given DepReference has dependencyExcludes defined based on the given manifest. If there are any they
     * will be added to given DepReference.
     * @memberOf DependencyMgr
     * @param {object} depReference A DepReference item for which to check and add dependencyExcludes
     * @param {object} manifest A valid manifest object containing the definition of given DepReference
     * @returns {object} The given DepReference
     * @private
     */
    DependencyMgr.prototype._checkAndAddExcludesToDepReference = function (depReference, manifest) {
      // make some parameter type checking
      if (!(depReference instanceof DependencyMgr.DepReference)) {
        throw new TypeError('parameter \'depReference\' needs to be an instance of DependencyMgr.DepReference');
      }
      if (typeof manifest !== 'object') {
        throw new TypeError('parameter \'manifest\' needs to be a an object representing a webpackage.manifest');
      }

      // find artifact in given manifest that corresponds with given depReference
      var artifact = this._extractArtifact(depReference, manifest);
      if (artifact.hasOwnProperty('dependencyExcludes') && artifact.dependencyExcludes.length > 0) {
        depReference.dependencyExcludes = depReference.dependencyExcludes.concat(JSON.parse(JSON.stringify(artifact.dependencyExcludes)));
      }

      return depReference;
    };

    /**
     * Helper for resolving all Dependencies of a given DepReference item for creating the DependencyTree. In contrast
     * to method _resolveDepReference() there will be no caching of resolved artifacts. Only the response cache will be
     * used to avoid requesting the same manifest multiple times. The returned promise is resolved with an array of
     * DepReference items representing the Dependencies for the given depReference. In addition the assigned resources for
     * the given depReference will be returned.
     * @memberOf DependencyMgr
     * @param {object} depReference A DepReference item
     * @param {string} baseUrl The URL from which the manifest.webpackage files should be requested.
     * @returns {object} promise
     * @private
     */
    DependencyMgr.prototype._resolveDepReferenceDependencies = function (depReference, baseUrl) {
      // check depReference
      if (!(depReference instanceof DependencyMgr.DepReference)) {
        throw new TypeError('parameter \'depReference\' need to be an instance of DependencyMgr.DepReference');
      }
      // check baseUrl
      if (typeof baseUrl !== 'string') {
        throw new TypeError('parameter \'baseUrl\' needs to be of type string');
      }

      return new Promise(function (resolve, reject) {
        var dependencies = [];
        var processManifest = function (manifest, cache) {
          if (cache) {
            this._responseCache.addItem(depReference.webpackageId, manifest);
          }
          var artifact = this._extractArtifact(depReference, manifest);
          if (artifact.hasOwnProperty('dependencies') && artifact.dependencies.length > 0) {
            dependencies = this._createDepReferenceListFromArtifactDependencies(artifact.dependencies, depReference);
          }
          // resolve(dependencies);
          resolve({
            resources: artifact.resources || [],
            dependencies: dependencies
          });
        }.bind(this);

        // append '/' to baseUrl if not present
        baseUrl = baseUrl.lastIndexOf('/') === baseUrl.length - 1 ? baseUrl : baseUrl + '/';

        if (depReference.webpackageId && this._responseCache.get(depReference.webpackageId) != null) { // use manifest from responseCache if available
          processManifest(this._responseCache.get(depReference.webpackageId), false);
        } else if (typeof depReference.manifest === 'object') { // use inline manifest from depReference if set
          processManifest(depReference.manifest, true);
        } else { // default case: request manifest using ajax
          var url = baseUrl + depReference.webpackageId + '/manifest.webpackage';
          this._fetchManifest(url).then(
            function (response) { processManifest(response.data, true); },
            function (error) { reject(error); }
          );
        }
      }.bind(this));
    };

    /**
     * Create and get a list with elements from type of DepRef from the passed artifact dependencies.
     * @param {Array} dependencies dependency attribute from artifact
     * @param {object | undefined} referrer is an object containing the artifactId and webpackageId of the artifact,
     *   which refers to the dependencies passed with the first parameter.
     * @return {Array} dependency list, which elements DepRef objects are.
     * @private
     * @memberOf DependencyMgr
     */
    DependencyMgr.prototype._createDepReferenceListFromArtifactDependencies =
      function (dependencies, referrer) {
        var self = this;
        var depList = [];
        if (!dependencies) {
          return depList;
        }

        // check given referrer is of type object
        if (referrer && typeof referrer !== 'object') {
          console.warn('Expect parameter "referrer" to be null or of type object: ', referrer, '. Will use "root" as fallback referrer');
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
          // check if dependencies manifest property is of type object (in case there is a manifest property)
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
              depReferenceInitObject.manifest = manifestConverter.convert(dependency.manifest);
            }

            var depRef = new DependencyMgr.DepReference(depReferenceInitObject);

            // dependencyExcludes if available
            if (dependency.hasOwnProperty('dependencyExcludes')) {
              depRef.dependencyExcludes = dependency.dependencyExcludes;
            };

            depList.push(depRef);
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
     * Internal helper method to determine the webpackageId of a given dependency in the context of a given referrer.
     * If no referrer is given, then dependency needs to have property webpackageId.
     * @memberOf DependencyMgr
     * @param {object} dependency An object containing at least string property "artifactId" and optional string
     *   property "webpackageId"
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
     * Internal Helper for adding a webpackageId to each rootDependency
     * @param {object} rootDependencies
     * @private
     */
    DependencyMgr.prototype._determineWebpackageIdsForRootRependencies = function (rootDependencies) {
      var regExp = /([^\/]*)?@([^\/]*)/; // matches on valid webpackageIds,
      // e.g. matches "cubx.core.artifactsearch@1.5.0" in "https://cubbles.world/sandbox/cubx.core.artifactsearch@1.5.0/artifactsearch/index.html"
      var pathname = window.location.pathname;
      var result = regExp.exec(pathname);
      // if we find a valid webpackageId in pathname use this for rootWebpackageIds. Otherwise we assume that we are requesting
      // the webpage from localhost using cubx developer tools.
      var webpackageId = result ? result[0] : pathname.split('/')[1];

      rootDependencies.forEach(function (dep) {
        if (!dep.hasOwnProperty('webpackageId') && webpackageId) {
          dep.webpackageId = webpackageId;
        }
      });
    };

    /**
     * Get manifest for given DepReference item. The lookup is in following order:
     * 1. If there is an inline manifest assigned to given depReference return this one
     * 2. If there is already a manifest in responseCache for corresponding webpackageId return this one
     * 3. Request the manifest from Base using given baseUrl
     * The returned promised will be resolved with the resolved manifest (as object)
     * @memberOf DependencyMgr
     * @param {object} depReference DepReference item
     * @param {string} [baseUrl]
     * @returns {object} promise
     * @private
     */
    DependencyMgr.prototype._getManifestForDepReference = function (depReference, baseUrl) {
      // make some type checking
      if (!(depReference instanceof DependencyMgr.DepReference)) {
        throw new TypeError('parameter \'depReference\' needs to be an instance of DependencyMgr.DepReference');
      }

      return new Promise(function (resolve, reject) {
        var webpackageId = depReference.webpackageId;
        if (this._responseCache.get(webpackageId) != null) {
          resolve(this._responseCache.get(webpackageId));
        } else if (depReference.manifest != null) {
          resolve(depReference.manifest);
        } else if (typeof baseUrl === 'string') {
          // append / to baseUrl if necessary
          var url = baseUrl.lastIndexOf('/') !== baseUrl.length - 1 ? baseUrl + '/' : baseUrl;
          this._fetchManifest(url + webpackageId + '/manifest.webpackage').then(function (result) {
            resolve(result.data);
          }, function (error) {
            reject(error);
          });
        } else {
          reject(new TypeError('parameter \'baseUrl\' needs to be a valid url'));
        }
      }.bind(this));
    };

    /**
     * Internal helper method for removing endpointId property from all rootDependencies having this property. The
     * value of the endpointId property is appended to the artifactId used endpointSeparator from ManifestConverter.
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
        if (dependency.hasOwnProperty('dependencyExcludes') && dependency.dependencyExcludes.length > 0) {
          dependency.dependencyExcludes.forEach(function (exclude) {
            if (exclude.hasOwnProperty('endpointId') && typeof exclude.endpointId === 'string') {
              exclude.artifactId = exclude.artifactId + manifestConverter.endpointSeparator + exclude.endpointId;
              delete exclude.endpointId;
            }
          });
        }
      });
    };

    /**
     * Resolve and return the artifact object, described by the argument.
     * @param {DepReference} depReference Object containing a reference to an artifact
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
          data: this._extractArtifact(depReference, this._responseCache.get(depReference.webpackageId))
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
          data: this._extractArtifact(depReference, depReference.manifest)
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
        this._fetchManifest(url).then(function (response) {
          self._storeManifestFiles(response.data, depReference.getArtifactId());
          self._responseCache.addItem(depReference.webpackageId, response.data);
          deferred.resolve({
            item: depReference,
            data: self._extractArtifact(depReference, response.data)
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
     * Extract an artifact from a given manifest by artifactId from given DepReference
     * @param {DepReference} depReference Object containing either 'groupId', 'name' and 'version' string
     * @param {string} manifest file of the referred webpackage
     *     properties or 'id' string property of the requested webpackage (normally an item of type DepReference)
     * @private
     * @memberOf DependencyMgr
     * @returns {array | undefined} the dependencies of the passed artifactReference or undefined, if the
     *     artifact has not been found.
     */
    DependencyMgr.prototype._extractArtifact = function (depReference, manifest) {
      var requestedArtifact;
      if (manifest) {
        // for apps, elementaryComponents etc.
        // console.log(JSON.stringify(manifest))
        Object.keys(manifest.artifacts).some(function (artifactType) {
          manifest.artifacts[ artifactType ].some(function (artifact) {
            if (artifact.artifactId === depReference.artifactId) {
              requestedArtifact = artifact;
            }
          });
        });
      }
      return requestedArtifact;
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
     * artifact within a webpackage.
     * @global
     * @constructor
     * @param {object} initObject with the structure of an artifacts´s dependency array
     */
    DependencyMgr.DepReference = function (initObject) {
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
       * Array holding depedencyExcludes in the form of {webpackageId: [webpackageId], artifactId: [artifactId]}
       * @type {Array}
       */
      this.dependencyExcludes = [];

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

    DependencyMgr.DepReference.prototype.getId = function () {
      return this.webpackageId + '/' + this.artifactId;
    };

    DependencyMgr.DepReference.prototype.getArtifactId = function () {
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
