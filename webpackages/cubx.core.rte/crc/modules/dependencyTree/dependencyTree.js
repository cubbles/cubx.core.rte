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
      var self = this;
      this.traverseBF(function (current) {
        if (node.equals(current)) {
          children = current.parent ? current.parent.children : self._rootNodes;
          return false;
        }
      });

      // find and remove node from children array
      if (children) {
        var index;
        children.some(function (child, childIndex) {
          if (node.equals(child)) {
            index = childIndex;
            return true;
          }
        });
        if (index) {
          node.parent = null;
          children.splice(index, 1);
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
     * Internal Class representing a node of a DependencyTree
     * @constructor
     * @memberOf DependencyTree
     * @static
     */
    DependencyTree.Node = function () {
      /**
       * Stores the data of the node.
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

    return DependencyTree;
  });
})();