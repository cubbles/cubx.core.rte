'use strict';
/*globals cubx*/
/**
 * Defines the DependencyTagTransformer RequireJS Module.
 * This module takes responsibility for the following tasks
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
        console.warn('No dependencies for any components defined. It won\'t be searched for "cubx-dependencies" or "cubx-depenedency-excludes".');
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
      this._addToCubxCRCInit(foundling, element, crcLoader._cubxCRCInitRootDependenciesOriginLength);
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
   * @returns {HTMLElement[]}
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
   * Add for all elements in deps a dependency to cubx.CRCInit.rootDependencies
   * @param {object} deps Object containing dependencies and excludes arrays holding <cubx-dependency> and <cubx-dependency-exclude> elements as items.
   * @param {HTMLElement} artifactElement parent cubbles element
   * @memberOf DependencyTagTransformer
   * @private
   */
  DependencyTagTransformer.prototype._addToCubxCRCInit = function (deps, artifactElement, originLength) {
    originLength = originLength || 0;
    // first insert all dependencies into rootDependencies array by prepending them.
    deps.dependencies.forEach(function (elem, index) {
      var artifactId = elem.getAttribute('artifact-id');
      if (!artifactId) {
        console.error('Missing artifactId: The artifact-id attribute is mandatory for each "' + elem.tagName.toLowerCase() + '" element. This element will be ignored:', elem);
      } else {
        if (!cubx.CRCInit.rootDependencies) {
          cubx.CRCInit.rootDependencies = [];
        }
        var dep = this._createDependency(elem, artifactElement);
        cubx.CRCInit.rootDependencies.splice(cubx.CRCInit.rootDependencies.length - originLength, 0, dep);
      }
    }.bind(this));

    // search dependency from rootDependencies array for artifactElement
    var artifactDep = window.cubx.CRCInit.rootDependencies.find(function (dep) {
      return dep.artifactId === artifactElement.tagName.toLowerCase();
    });

    // assign all dependencyExcludes to corresponding dependency from rootDependencies array
    deps.excludes.forEach(function (elem) {
      var artifactId = elem.getAttribute('artifact-id');
      if (!artifactId) {
        console.error('Missing artifactId: The artifact-id attribute is mandatory for each "' + elem.tagName.toLowerCase() + '" element. This element will be ignored:', elem);
      } else {
        var depExclude = this._createDependency(elem, artifactElement);
        artifactDep.dependencyExcludes = artifactDep.dependencyExcludes || [];
        artifactDep.dependencyExcludes.push(depExclude);
      }
    }.bind(this));
  };

  /**
   * Create a dependency from the with the help of the element parameter. If the webpackageId missed, it will be setted  the webpackageId of the
   * artifacts dependency.
   * @param {HTMLElement} element the element to change to a dependency object
   * @param {HTMLElement} artifactElement parent cubbles element
   * @memberOf DependencyTagTransformer
   * @returns {{artifactId: *}}
   * @private
   */
  DependencyTagTransformer.prototype._createDependency = function (element, artifactElement) {
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
        dependency.webpackageId = artifactDep.webpackageId;
      }
    }

    if (endpointId) {
      dependency.endpointId = endpointId;
    }
    return dependency;
  };
  return DependencyTagTransformer;
});
