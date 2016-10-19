(function () {
  'use strict';

  window.cubx.amd.define([], function () {
    /**
     * Represents a tree of Dependencies. This is mainly used by the DependencyMgr to handle dependencies and their
     * relation
     *
     * @global
     * @class DependencyTree
     * @constructor
     */
    var DependencyTree = function () {
      /**
       * The nodes Array holds all rootNodes of the dependencyTree. The order of root nodes is important when it comes
       * to dependency conflict resolution.
       * Note: In fact their could be multiple rootNodes. So indeed the dependencyTree is not a "real" tree
       * @type {Array}
       */
      this._rootNodes = [];
    };

    /**
     * Check if a certain exclude is referenced by any other artifact as dependency in the DependencyTree that is not
     * a descendent of the node this exclude belongs to. This method needs to be called before removeDuplicates() is called!
     * @memberOf DependencyTree
     * @param {object} node The current node the exclude belongs to
     * @param {object} exclude The exclude to check. Holds properties webpackageId and artifactId
     * @private
     */
    DependencyTree.prototype._isValidExclude = function (node, exclude) { // TODO: Test me!
      // this array holds all nodes that conflict with the given exclude meaning they reference the
      // same artifact but are not an descendents of the node the exclude belongs to
      var conflicts = [];

      // we assume that duplicates are not removed yet from DependencyTree. That's why we need to make sure that
      // duplicates of this nodes are ignored
      this.traverseBF(function (currentNode) {
        if (currentNode.data.artifactId === exclude.artifactId &&
          currentNode.data.webpackageId === exclude.webpackageId &&
          !currentNode.equalsArtifact(node) && !currentNode.isDescendent(node)) {
          conflicts.push(currentNode);
        }
      });

      if (window.cubx.CRC.getRuntimeMode() === 'dev') {
        conflicts.forEach(function (conflictedNode) {
          console.warn('Exclude ' + exclude.webpackageId + '/' + exclude.artifactId + ' on artifact ' +
            node.data.getId() + ' will be ignored because of dependency ' + conflictedNode.getPathAsString());
        });
      }

      return conflicts.length === 0;
    };

    /**
     * Check all excludes defined in the trees nodes and remove them by moving them from data.dependencyExcludes array
     * into data._removedDependencyExcludes array.
     * @memberOf DependencyTree
     * @returns {object} The DependencyTree itself
     * @private
     */
    DependencyTree.prototype._removeInvalidExcludes = function () { // TODO: Test me!
      this.traverseBF(function (node) {
        if (node.data.dependencyExcludes.length > 0) {
          var validExcludes = [];
          node.data.dependencyExcludes.forEach(function (exclude) {
            if (this._isValidExclude(node, exclude)) {
              // the exclude is valid, so we push it to the temporary validExcludes array
              validExcludes.push(exclude);
            } else {
              // the exclude is not valid thus push it onto current.data._removedDependencyExcludes array
              node.data._removedDependencyExcludes = node.data._removedDependencyExcludes || [];
              node.data._removedDependencyExcludes.push(exclude);
            }
          }.bind(this));
          node.data.dependencyExcludes = validExcludes;
        }
      }.bind(this));

      return this;
    };

    /**
     * Check if the given node is in DependencyTree.
     * @memberOf DependencyTree
     * @param {object} node
     * @returns {boolean} True if Node is in DependencyTree, false otherwise.
     */
    DependencyTree.prototype.contains = function (node) {
      // if we can reach any of the current rootNodes by using the parent reference given node is a member of DependencyTree
      while (node.parent != null) {
        node = node.parent;
      };

      return this._rootNodes.some(function (rootNode) {
        return rootNode.equals(node);
      });
    };

    /**
     * Insert a node into dependency tree. If no parent is given, then the node will be added to rootNodes.
     * If before is given then the nodes will be inserted right before this node in parents children. Otherwise it will
     * be appended to the array of child nodes.
     * @memberOf DependencyTree
     * @param {object} node The node to be inserted. Needs to be an instance of DependencyTree.Node
     * @param [object] parent An instance of DependencyTree.Node representing the parent for the node to be inserted
     * @param [object] before An instance of DependencyTree.Node representing the direct successor of the
     *    inserted node in the children array
     * @returns {object} The created and inserted node. This is instance of DependencyTree.Node
     */
    DependencyTree.prototype.insertNode = function (node, parent, before) {
      if (!(node instanceof DependencyTree.Node)) {
        console.error('parameter \'node\' needs to be an instance of DependencyTree.Node');
        return;
      }
      if (parent && !(parent instanceof DependencyTree.Node)) {
        console.error('parameter \'parent\' needs to be an instance of DependencyTree.Node');
        return;
      }
      if (before && !(before instanceof DependencyTree.Node)) {
        console.error('parameter \'before\' needs to be an instance of DependencyTree.Node');
        return;
      }

      var beforeIndex;
      // if parent and before are given, insert node as new child of given parent as left neighbour of before in parents
      if (parent && before) {
        // find index of before node in parents children array
        beforeIndex = -1;
        parent.children.some(function (child, index) {
          if (before.equals(child)) {
            beforeIndex = index;
            return true;
          }
        });
        node.parent = parent;
        if (beforeIndex < 0) {
          console.warn('Could not find given before node in parents child nodes array. Append given node to end of child nodes array.');
          parent.children.push(node);
        } else {
          parent.children.splice(beforeIndex, 0, node);
        }
      } else if (parent && !before) { // if only parent is given, append given node to the end of parents children array
        node.parent = parent;
        parent.children.push(node);
      } else if (!parent && before) { // if only before is given insert node in rootNodes array as left neighbour of before node
        beforeIndex = -1;
        this._rootNodes.some(function (child, index) {
          if (before.equals(child)) {
            beforeIndex = index;
            return true;
          }
        });
        node.parent = null;
        if (beforeIndex < 0) {
          console.warn('Could not find given before node in rootNodes array. Append given node to end of rootNodes array.');
          this._rootNodes.push(node);
        } else {
          this._rootNodes.splice(beforeIndex, 0, node);
        }
      } else { // neither parent nor before are given. So just append node to the end of rootNodes array
        node.parent = null;
        this._rootNodes.push(node);
      }

      return node;
    };

    /**
     * Remove all duplicate Dependencies from DependencyTree. Nodes are considered equal if the assigned webpackageId
     * and artifactId is equal.
     * @memberOf DependencyTree
     * @returns {object} The DependencyTree without duplicates
     */
    DependencyTree.prototype.removeDuplicates = function () {
      var nodesBF = {}; // holds a map of all nodes using "[webpackageId]/[artifactId]" as key

      this.traverseBF(function (node) {
        if (this.contains(node) && nodesBF.hasOwnProperty(node.data.getId())) {
          var existingNode = nodesBF[node.data.getId()];
          if (node.parent != null) {
            node.parent.usesExisting.push(existingNode);
            existingNode.usedBy.push(node.parent);
          }
          this.removeNode(node);
        } else {
          nodesBF[node.data.getId()] = node;
        }
      }.bind(this));

      return this;
    };

    /**
     * Remove a given node (including all of its descendants).
     * @memberOf DependencyTree
     * @param {object} node The node to be removed
     * @returns {object} The removed node, null if the given node was not found in tree
     */
    DependencyTree.prototype.removeNode = function (node) {
      if (!(node instanceof DependencyTree.Node)) {
        console.error('parameter \'node\' needs to be an instance of DependencyTree.Node');
        return;
      }

      // holds children array from which the given node needs to be removed. If given node is rootNode
      // children will be the rootNodes array
      var children;
      this.traverseBF(function (current) {
        if (node.equals(current)) {
          children = current.parent ? current.parent.children : this._rootNodes;
          return false;
        }
      }.bind(this));

      // find and remove node from children array
      if (children) {
        var index;
        children.some(function (child, childIndex) {
          if (node.equals(child)) {
            index = childIndex;
            return true;
          }
        });
        if (index >= 0) {
          node.parent = null;
          children.splice(index, 1);
          return node;
        } else {
          return null;
        }
      } else {
        return null;
      }
    };

    /**
     * Travers the DependencyTree in Depth First pre-order. The given callback will be called on each visited node given
     * the node itself as the first parameter. If the callback returns false the traversal will be canceled.
     * @memberOf DependencyTree
     * @param {function} callback
     */
    DependencyTree.prototype.traverseDF = function (callback) {
      if (!callback || typeof callback !== 'function') {
        console.error('Parameter \'callback\' needs to be of type function');
        return;
      };
      this._rootNodes.some(function (node) {
        (function processNode (node) {
          if (callback(node) === false) {
            return true;
          }
          node.children.some(function (child) {
            return processNode(child);
          });
        })(node);
      });
    };

    /**
     * Travers the DependencyTree in Breadth First order. The given callback will be called on each visited node given
     * the node itself as the first parameter. If the callback returns false the traversal will be canceled.
     * @memberOf DependencyTree
     * @param {function} callback
     */
    DependencyTree.prototype.traverseBF = function (callback) {
      if (!callback || typeof callback !== 'function') {
        console.error('Parameter \'callback\' needs to be of type function');
        return;
      };
      var queue = this._rootNodes.length > 0 ? this._rootNodes.slice() : [];
      while (queue.length > 0) {
        var node = queue.shift();
        if (node.children.length > 0) {
          node.children.forEach(function (child) {
            queue.push(child);
          });
        }
        if (callback(node) === false) {
          return;
        };
      }
    };

    /**
     * Traverse a subtree within the DependencyTree starting from the given node.
     * @memberOf DependencyTree
     * @param {object} rootNode A DependencyTree.Node within the DependendyTree acting as root for the subtree traversal
     * @param {function} callback Callback function that will be called for each visited node
     */
    DependencyTree.prototype.traverseSubtreeBF = function (rootNode, callback) {
      if (!(rootNode instanceof DependencyTree.Node)) {
        console.error('Parameter \'rootNode\' needs to be an instance of DependencyTree.Node');
        return;
      };
      if (!callback || typeof callback !== 'function') {
        console.error('Parameter \'callback\' needs to be of type function');
        return;
      };
      var queue = [rootNode];
      while (queue.length > 0) {
        var node = queue.shift();
        if (node.children.length > 0) {
          node.children.forEach(function (child) {
            queue.push(child);
          });
        }
        if (callback(node) === false) {
          return;
        };
      }
    };

    /**
     * Internal Class representing a node of a DependencyTree
     * @constructor
     * @memberOf DependencyTree
     * @static
     */
    DependencyTree.Node = function () {
      /**
       * Stores the data of the node. Normally this will be an instance of DependencyMgr.DepReference
       * @type {object|misc}
       */
      this.data = null;

      /**
       * References the parent node of this node.
       * @type {object}
       */
      this.parent = null;

      /**
       * Holds a list of (ordered) children of the node.
       * @type {Array}
       */
      this.children = [];

      /**
       * References other existing nodes from the DependencyTree. This is used to resolve redundant Dependency Nodes
       * inside the DependencyTree.
       * @type {object}
       */
      this.usesExisting = [];

      /**
       * Holds a list of all Nodes that references this node in their usesExisting property
       * @type {Array}
       */
      this.usedBy = [];
    };

    /**
     * Check if given node equals this node.
     * @memberOf DependencyTree.Node
     * @param {object} node The node to compare to
     * @returns {boolean} true if given node is equal to this node, otherwise else is returned
     */
    DependencyTree.Node.prototype.equals = function (node) {
      // for now only check if given node and this node represent the same instances
      return this === node;
    };

    /**
     * Checks if the given node references the same artifact.
     * @memberOf DependencyTree.Node
     * @param {object} node DependencyTree.Node to compare to
     * @returns {boolean} true if artifactId and webpackageId are equal, false otherwise
     */
    DependencyTree.Node.prototype.equalsArtifact = function (node) { // TODO: Test me!
      return node.data.getId() === this.data.getId();
    };

    /**
     * Return the path starting from root for this node as string.
     * @memberOf DependencyTree.Node
     * @return {string}
     */
    DependencyTree.Node.prototype.getPathAsString = function () { // TODO: test me!
      var current = this;
      var path = [current.data.getId()];
      while (current.parent) {
        current = current.parent;
        path.splice(0, 0, current.data.getId());
      }
      return path.join(' > ');
    };

    return DependencyTree;
  });
})();
