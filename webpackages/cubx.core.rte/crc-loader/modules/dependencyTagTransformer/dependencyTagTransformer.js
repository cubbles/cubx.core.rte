'use strict';
/*globals cubx*/
/**
 * Defines the DependencyTagTransformer RequireJS Module.
 * This modul takes responsibility for the following tasks
 * Parse to <cubx-dependenciesA and cubx-dependency-excludes> tags and
 * add the interpreted dependencies and excludes to
 * cubx.CCRCInti.rootDependencies and cubx.CCRCInti.rootDependencyExludes.
 *
 * @module DependencyTagTransformer_Module
 */
cubx.amd.define([], function () {
  /**
   * Empty constructor.
   * @global
   * @constructor
   */
  var DependencyTagTransformer = function () {
  };

  // -----------------------------------------------------------------------------------
  // -------------------------------- Public Methods -----------------------------------
  // -----------------------------------------------------------------------------------
  /**
   * Parse for <cubx-dependenciesA and cubx-dependency-excludes> tags and add the interpreted dependencies and excludes to
   * cubx.CCRCInti.rootDependencies and cubx.CCRCInti.rootDependencyExludes.
   * @param {CRCLoader} crcLoader
   * @memberOf DependencyTagTransformer
   * @public
   */
  DependencyTagTransformer.prototype.addDependenciesAndExcludesToRootDependencies = function (crcLoader) {
    if (!cubx || !cubx.CRCInit || !cubx.CRCInit.rootDependencies || cubx.CRCInit.rootDependencies.length === 0) {
      if (window.cubx.CRCInit.runtimeMode === 'dev') {
        console.warn('No dependencies for any components defined. It will be not for "cubx-dependencies" or "cubx-depenedency-excludes" searched.');
      }
      return;
    }
    var artifactList = [];
    cubx.CRCInit.rootDependencies.forEach(function (dep) {
      artifactList.push(dep.artifactId);
    });
    if (artifactList.length === 0) {
      return;
    }
    var artifactElements = crcLoader._crcRoot.querySelectorAll(artifactList.join(','));

    var i;
    var len = artifactElements.length;
    for (i = 0; i < len; i++) {
      var element = artifactElements[ i ];
      var foundling = this._findDependenciesAndExcludesInElement(element);
      this._addToCubxCRCInit(foundling.dependencies, element, 'rootDependencies', crcLoader._cubxCRCInitRootDependenciesOriginLength);
      this._addToCubxCRCInit(foundling.excludes, element, 'rootDependencyExcludes', crcLoader._cubxCRCInitRootDependencyExcludesOriginLength);
    }
  };
  // -----------------------------------------------------------------------------------
  // -------------------------------- Private Methods -----------------------------------
  // -----------------------------------------------------------------------------------
  /**
   * Find and get all <cubx-dependency> and <cubx-dependency-exclude> children of the elements.
   * THe return object has a property "dependencies" (Array of the <cubx-dependency> elements) and a propery "excludes" (Array of the <cubx-dependency-exclude> elements)
   * @memberOf DependencyTagTransformer
   * @param {HTMLElement} element
   * @returns {{dependencies: HTMLElements[], excludes: HTMLElements[]}}
   * @private
   */
  DependencyTagTransformer.prototype._findDependenciesAndExcludesInElement = function (element) {
    var i;
    var childElements = element.children;
    var len = childElements.length;
    var dependencies = [];
    var excludes = [];
    for (i = 0; i < len; i++) {
      if (childElements[ i ].tagName === 'CUBX-DEPENDENCIES') {
        dependencies = this._filterChildElements(childElements[ i ], 'cubx-dependency');
      }
      if (childElements[ i ].tagName === 'CUBX-DEPENDENCY-EXCLUDES') {
        excludes = this._filterChildElements(childElements[ i ], 'cubx-dependency-exclude');
      }
    }
    return {
      dependencies: dependencies,
      excludes: excludes
    };
  };

  /**
   * Filter all child elements with tagName === elementName of element.
   * @param element base Html element
   * @param {string} childElementName the elementName, wich should be filtered
   * @memberOf DependencyTagTransformer
   * @returns {HTMLElment[]}
   * @private
   */
  DependencyTagTransformer.prototype._filterChildElements = function (element, childElementName) {
    var list = [];
    var children = element.children;
    var i;
    var len = children.length;
    for (i = 0; i < len; i++) {
      var elem = children[ i ];
      if (elem.tagName === childElementName.toUpperCase()) {
        list.push(elem);
      }
    }
    return list;
  };

  /**
   * Add for all elements in elementArray a dependency to cubx.CRCInit[propertyName]
   * @param {HTMLElement[]} elementArray Array of Elements which represents a dependency
   * @param {HTMLElement} artifactElement parent cubbles element
   * @param {string} propertyName property name in cubx.CRCInit. Push dependency to this property
   * @memberOf DependencyTagTransformer
   * @private
   */
  DependencyTagTransformer.prototype._addToCubxCRCInit = function (elementArray, artifactElement, propertyName, originLength) {
    elementArray.forEach(function (elem) {
      var artifactId = elem.getAttribute('artifact-id');
      if (!artifactId) {
        console.error('Missing artifactId: The artifact-id attribute is mandatory for each "' + elem.tagName.toLowerCase() + '" element. This element will be ignored:', elem);
      } else {
        if (!cubx.CRCInit[ propertyName ]) {
          cubx.CRCInit[ propertyName ] = [];
        }
        var dep = this._createDependency(elem, artifactElement, cubx.CRCInit[ propertyName ]);
        if (originLength > 0) {
          cubx.CRCInit[ propertyName ].splice(cubx.CRCInit[ propertyName ].length - originLength, 0, dep);
        } else {
          cubx.CRCInit[ propertyName ].push(dep);
        }
      }
    }.bind(this));
  };

  /**
   * Create a dependency from the with the help of the element parameter. If the webpackageId missed, it will be setted  the webpackageId of the
   * artifacts dependency.
   * @param {HTMLElement} element the element to change to a dependency object
   * @param {HTMLElement} artifactElement parent cubbles element
   * @param {object[]} depArray dependencyArray - used for search for default value of webpackageId for the artifactElem
   * @memberOf DependencyTagTransformer
   * @returns {{artifactId: *}}
   * @private
   */
  DependencyTagTransformer.prototype._createDependency = function (element, artifactElement, depArray) {
    var webpackageId = element.getAttribute('webpackage-id');
    var endpointId = element.getAttribute('endpoint-id');
    var artifactId = element.getAttribute('artifact-id');

    var dependency = {
      artifactId: artifactId
    };

    if (webpackageId && webpackageId !== 'this') {
      dependency.webpackageId = webpackageId;
    } else if (!webpackageId) {
      // search webpackageId in dependency for artifact
      var artifactDep = window.cubx.CRCInit.rootDependencies.find(function (dep) {
        return dep.artifactId === artifactElement.tagName.toLowerCase();
      });
      if (artifactDep && artifactDep.webpackageId) {
        // use founded webpackageId of parent artifact for webpackageId
        if (artifactDep.webpackageId) {
          dependency.webpackageId = artifactDep.webpackageId;
        }
      }
    }

    if (endpointId) {
      dependency.endpointId = endpointId;
    }
    return dependency;
  };
  return DependencyTagTransformer;
});
