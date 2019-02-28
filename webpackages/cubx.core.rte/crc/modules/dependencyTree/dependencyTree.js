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
       * Holding all conflicts of type DependencyTree.conflictTypes.NAME
       * @type {Array}
       * @private
       */
      this._nameConflicts = [];

      /**
       * Holding all conflicts of type DependencyTree.conflictTypes.VERSION
       * @type {Array}
       * @private
       */
      this._versionConflicts = [];

      /**
       * Holding all conflicts
       * @type {Array}
       * @private
       */
      this._conflicts = [];

      /**
       * The nodes Array holds all rootNodes of the dependencyTree. The order of root nodes is important when it comes
       * to dependency conflict resolution.
       * Note: In fact their could be multiple rootNodes. So indeed the dependencyTree is not a "real" tree
       * @type {Array}
       */
      this._rootNodes = [];

      /**
       * If true the removeDuplicate() method will take care to handle artifact version conflicts and resolves them.
       * @type {boolean}
       * @private
       */
      this._enableACR = true;
    };

    /**
     * Enum for possible conflictTypes
     * @type {{NAME: string, VERSION: string, MIXED: string}}
     */
    DependencyTree.conflictTypes = {
      NAME: 'NAME_CONFLICT',
      VERSION: 'VERSION_CONFLICT',
      MIXED: 'MIXED_CONFLICT'
    };

    /**
     * Enum for characterizing different relationships between nodes
     * @type {{ARTIFACT_VERSION_CONFLICT: number, ARTIFACT_NAME_CONFLICT: number, ARTIFACT_CUPLICATE: number}}
     */
    DependencyTree.NodeRelationship = {
      'DISTINCT_ARTIFACT': 0,
      'ARTIFACT_VERSION_CONFLICT': 1,
      'ARTIFACT_NAME_CONFLICT': 2,
      'ARTIFACT_DUPLICATE': 3
    };

    /**
     * Mark all descendants of given node as excluded.
     * @param {object} node A DependencyTree.Node whose descendants should be marked excluded
     * @returns {object} the DependencyTree itself
     * @memberOf DependencyTree
     * @private
     */
    DependencyTree.prototype._markDescendantsAsExcluded = function (node) {
      this.traverseSubtreeBF(node, function (currentNode) {
        currentNode.excluded = true;
      });
      return this;
    };

    /**
     * Mark all excludes of given node in it's descendents.
     * @private
     * @memberOf DependencyTree
     * @return {object} DependencyTree
     */
    DependencyTree.prototype._markExcludedNodesInSubtree = function (node) {
      var excludes = node.data.dependencyExcludes;

      // mark all artifacts that are excluded explicitly
      this.traverseSubtreeBF(node, function (currentNode) {
        excludes.forEach(function (exclude) {
          if (exclude.webpackageId === currentNode.data.webpackageId &&
            exclude.artifactId === currentNode.data.artifactId) {
            currentNode.excluded = true;
            this._markDescendantsAsExcluded(currentNode);
          }
        }.bind(this));
      }.bind(this));

      return this;
    };

    /**
     * Removes a duplicate from the DependencyTree. When removing duplicates the excludes of duplicated Node and duplicate Node
     * are merged. Only nodes, which are excluded in both nodes or their descendants. It also will be checked if duplicated
     * and duplicate node are excluded or not.
     * @memberOf DependencyTree
     * @param {object} duplicated DependencyTree.Node that is duplicated
     * @param {object} duplicate DependencyTree.Node that duplicates the duplicated node
     * @private
     */
    DependencyTree.prototype._removeDuplicate = function (duplicated, duplicate) {
      var descendantsOfDuplicated = [];
      var descendantsOfDuplicate = [];

      // If duplicated node is excluded but duplicate node is not excluded we need to make exclude of duplicated node invalid
      if (duplicated.excluded && !duplicate.excluded) duplicated.excluded = false;

      // collect all nodes in subtree of duplicated node
      this.traverseSubtreeBF(duplicated, function (node) {
        descendantsOfDuplicated.push(node);
      });
      // collect all nodes in subtree of duplicate node
      this.traverseSubtreeBF(duplicate, function (node) {
        descendantsOfDuplicate.push(node);
      });

      // calculate the intersection of all excluded nodes. Only nodes that are excluded in both subtrees are removed
      descendantsOfDuplicated.forEach(function (node, idx) {
        var duplicate = descendantsOfDuplicate[idx];

        // the exclude on duplicate node is invalid because the same node is not marked as excluded in duplicated subtree
        if (!node.excluded && duplicate.excluded) duplicate.excluded = false;

        // the exclude on duplicated node is invalid because the same node is not marked as excluded in duplicate subtree
        if (node.excluded && !duplicate.excluded) node.excluded = false;
      });

      // if duplicate is not a root node we need to set usesExisting and usedBy of the duplicates parent
      if (duplicate.parent != null) {
        duplicate.parent.usesExisting.push(duplicated);
        duplicated.usedBy.push(duplicate.parent);
      }
      duplicated.data.referrer = duplicated.data.referrer.concat(duplicate.data.referrer);
      this.removeNode(duplicate);
    };

    /**
     * Remove node which is in conflict with another node from DependencyTree.
     * @memberOf DependencyTree
     * @param {object} node Node which causes the conflict
     * @param {object} conflictedNode Node which is on conflict with give node and thus needs to be removed
     */
    DependencyTree.prototype._removeConflictedNode = function (node, conflictedNode) {
      // if conflictedNode is not a root node we need to set usesExisting and usedBy of node which will replace the conflictedNode
      if (conflictedNode.parent != null) {
        conflictedNode.parent.usesExisting.push(node);
        node.usedBy.push(conflictedNode.parent);
      }
      node.data.referrer = node.data.referrer.concat(conflictedNode.data.referrer);
      this.removeNode(conflictedNode);
    };

    /**
     * Group given list of nodes by their webpackage name.
     * @memberOf DependencyTree
     * @param {array} nodes
     * @return {object} nodes grouped by webpackage name as key
     * @private
     */
    DependencyTree.prototype._groupNodesByWebpackageName = function (nodes) {
      var webpackageMapByName = {};
      nodes.forEach(function (node) {
        var webpackageName = node.data.webpackageId.split('@')[0];
        if (webpackageMapByName.hasOwnProperty(webpackageName)) {
          webpackageMapByName[webpackageName].push(node);
        } else {
          webpackageMapByName[webpackageName] = [node];
        }
      });
      return webpackageMapByName;
    };

    /**
     * Determine the relationship between two given nodes. For possible return values see DependencyTree.NodeRelationship enum.
     * @param {object} nodeA
     * @param {object} nodeB
     * @memberOf DependencyTree
     * @return {number} Relationship Type
     * @private
     */
    DependencyTree.prototype._determineNodeRelationship = function (nodeA, nodeB) {
      var type = DependencyTree.NodeRelationship.DISTINCT_ARTIFACT;
      if (nodeA.equalsArtifact(nodeB)) {
        type = DependencyTree.NodeRelationship.ARTIFACT_DUPLICATE;
      } else if (nodeA.equalsArtifactIgnoreVersion(nodeB)) {
        type = DependencyTree.NodeRelationship.ARTIFACT_VERSION_CONFLICT;
      } else if (nodeA.data.artifactId === nodeB.data.artifactId) {
        type = DependencyTree.NodeRelationship.ARTIFACT_NAME_CONFLICT;
      }
      return type;
    };

    /**
     * Get related node(s) to given node out out of given nodes array depending on the given type of relationship.
     * @memberOf DependencyTree
     * @param {object} node The given node to compare to
     * @param {array} nodes A nodes array to compare against
     * @param {number} relationship One of DependencyTree.NodeRelationship
     * @returns {array}
     * @private
     */
    DependencyTree.prototype._getRelatedNodes = function (node, nodes, relationship) {
      var relatedNodes;

      relatedNodes = nodes.filter(function (currentNode) {
        return (this._determineNodeRelationship(currentNode, node) === relationship);
      }.bind(this));

      return relatedNodes;
    };

    /**
     * Helper method to create an item representing a conflict between two nodes
     * @memberOf DependencyTree
     * @private
     * @param {DependencyTree.Node} node
     * @param {DependencyTree.Node} conflictedNode
     * @param {string} type One of DependencyTree.conflictTypes
     * @param {boolean} resolved
     * @returns {object}
     */
    DependencyTree.prototype._createConflictItem = function (node, conflictedNode, type, resolved) {
      return {
        node: node,
        conflictedNode: conflictedNode,
        type: type,
        resolved: resolved
      };
    };

    /**
     * Apply all excludes in DependencyTree. Note: this needs to be done before removeDuplicates() is called!
     * @memberOf DependencyTree
     * @returns {object} DependencyTree itself
     */
    DependencyTree.prototype.applyExcludes = function () {
      this.traverseBF(function (node) {
        if (node.data.dependencyExcludes.length > 0) this._markExcludedNodesInSubtree(node);
      }.bind(this));

      return this;
    };

    /**
     * Mark all appearances of given artifact in DependencyTree as excluded. This should be done before removeDuplicates()
     * is called.
     * @memberOf DependencyTree
     * @param {string} webpackageId
     * @param {string} artifactId
     * @returns {object} DependencyTree itself
     */
    DependencyTree.prototype.applyGlobalExclude = function (webpackageId, artifactId) {
      this.traverseBF(function (node) {
        if (node.data.artifactId === artifactId && node.data.webpackageId === webpackageId) {
          node.excluded = true;
          this._markDescendantsAsExcluded(node);
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
      }

      return this._rootNodes.some(function (rootNode) {
        return rootNode.equals(node);
      });
    };

    /**
     * Disable automatic conflict resolution.
     * @memberOf DependencyTree
     */
    DependencyTree.prototype.disableACR = function () {
      this._enableACR = false;
    };

    /**
     * Enable automatic conflict resolution. Note: This only applies to artifact version conflicts!
     * @memberOf DependencyTree
     */
    DependencyTree.prototype.enableACR = function () {
      this._enableACR = true;
    };

    /**
     * Get a list of all conflicted nodes including type of conflict. Note: this method only works
     * when ACR is enabled and removeDuplicates() method was already called.
     * @memberOf DependencyTree
     * @returns {array}
     */
    DependencyTree.prototype.getConflictedNodes = function () {
      return this._conflicts;
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
     * and artifactId is equal. If automatic conflict resolution is enabled (per default it is) also artifact version
     * conflicts will be resolved.
     * Note: applyExcludes() needs to be called before removeDuplicates() is called!
     * @memberOf DependencyTree
     * @returns {object} The DependencyTree without duplicates
     */
    DependencyTree.prototype.removeDuplicates = function () {
      var nodesBF = []; // holds an array of all processed/visited nodes

      this.traverseBF(function (node) {
        // If current node is already removed from depTree skip iteration --> if this.contains(node) is false we don't do anything
        if (this.contains(node)) {
          var relatedNodes = {
            duplicates: this._getRelatedNodes(node, nodesBF, DependencyTree.NodeRelationship.ARTIFACT_DUPLICATE),
            versionConflicts: this._getRelatedNodes(node, nodesBF, DependencyTree.NodeRelationship.ARTIFACT_VERSION_CONFLICT),
            nameConflicts: this._getRelatedNodes(node, nodesBF, DependencyTree.NodeRelationship.ARTIFACT_NAME_CONFLICT),
            distinct: this._getRelatedNodes(node, nodesBF, DependencyTree.NodeRelationship.DISTINCT_ARTIFACT)
          };

          if (relatedNodes.duplicates.length === 1) {
            this._removeDuplicate(relatedNodes.duplicates[0], node);
          } else if (relatedNodes.versionConflicts.length === 1) {
            var conflict = this._createConflictItem(relatedNodes.versionConflicts[0], node, DependencyTree.conflictTypes.VERSION, false);
            if (this._enableACR) {
              const conflictSource = relatedNodes.versionConflicts[0];
              // remove conflicted node if ACR is enabled
              // we only need to resolve conflict if both nodes are NOT marked as excluded
              if (conflictSource.excluded === false && node.excluded === false) {
                this._removeConflictedNode(conflictSource, node);
              }
              conflict.resolved = true;
            }
            // push conflict to internal conflicts array for logging purposes
            this._conflicts.push(conflict);
          } else if (relatedNodes.distinct.length + relatedNodes.nameConflicts.length === nodesBF.length) {
            nodesBF.push(node);
          }

          // check for naming conflicts. If there are any just keep them on internal conflicts array for logging purposes
          if (relatedNodes.nameConflicts.length > 0) {
            relatedNodes.nameConflicts.some(function (conflictNode) {
              this._conflicts.push(this._createConflictItem(conflictNode, node, DependencyTree.conflictTypes.NAME, false));
            }.bind(this));
          }
        }
      }.bind(this));

      return this;
    };

    /**
     * Removes all nodes which are marked as excluded. Note: if a node is marked as excluded then it will be removed including all it's descandants!
     * This should be called after excludes are applied (local and global ones) and duplicates are removed.
     *
     * @memberOf DependencyTree
     * @returns {object} DependencyTree itself
     */
    DependencyTree.prototype.removeExcludes = function () {
      this.traverseBF(function (node) {
        if (node.excluded) {
          this.removeNode(node);
          // Check if removed node is conflictedNode in depTree.conflicts array. If so remove this conflict from this.conflicts array to
          // suppress logging of this conflict (It was resolved manually in that case)
          this._conflicts.forEach(function (conflict, idx) {
            if (conflict.node === node || conflict.conflictedNode === node) {
              this._conflicts.splice(idx, 1);
            }
          }.bind(this));
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
          // remove node also in usesExisting array of all nodes referenced in node's usedBy array
          node.usedBy.forEach(function (current) {
            current.usesExisting = current.usesExisting.filter(function (element) {
              return !node.equals(element);
            });
          });
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
      }
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
      }
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
        }
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
      }
      ;
      if (!callback || typeof callback !== 'function') {
        console.error('Parameter \'callback\' needs to be of type function');
        return;
      }
      ;
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
        }
        ;
      }
    };

    /**
     * Returns a JSON object describing the dependency tree using following structure:
     * {
     *    "rootNodes": [
     *      {
     *        "webpackageId": ...,
     *        "artifactId": ...,
     *        "resources": [...], //optional
     *        "children": [
     *          {
     *            "webpackageId": ...,
     *            "artifactId": ...,
     *            "resources": [...], //optional
     *            "children": [...]
     *          },
     *          ...
     // *        ],
     *        usesExisting: [...],
     *        usedBy: [...]
     *      },
     *      ...
     *     }
     * }
     * @memberOf DependencyTree
     * @param {boolean} [includeResources=false] Indicates whether to include resources property.
     * @returns {{}} JSON object describing the depTree
     */
    DependencyTree.prototype.toJSON = function (includeResources) {
      var rootNodes = [];
      this._rootNodes.forEach(function (rootNode) {
        rootNodes.push(rootNode.toJSON(includeResources));
      });
      return {rootNodes: rootNodes};
    };

    DependencyTree.prototype.clone = function () {
      var hash = new WeakMap();

      function clone (obj) {
        if (!obj || typeof obj !== 'object') {
          return obj;
        }
        if (hash.has(obj)) {
          return hash.get(obj);
        }
        try {
          var result = Array.isArray(obj) ? []
            : obj.constructor ? new obj.constructor() : {};
        } catch (e) { // The constructor failed, create without running it
          result = Object.create(Object.getPrototypeOf(obj));
        }
        hash.set(obj, result);
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            result[key] = clone(obj[key]);
          }
        }
        return result;
      }

      return clone(this);
    };

    /**
     * Internal Class representing a node of a DependencyTree
     * @constructor
     * @memberOf DependencyTree
     * @static
     */
    DependencyTree.Node = function () {
      /**
       * Holds a list of (ordered) children of the node.
       * @type {Array}
       */
      this.children = [];

      /**
       * Stores the data of the node. Normally this will be an instance of DependencyMgr.DepReference
       * @type {object|misc}
       */
      this.data = null;

      /**
       * True if node is excluded by any of it's ancestors
       * @type {boolean}
       */
      this.excluded = false;

      /**
       * References the parent node of this node.
       * @type {object}
       */
      this.parent = null;

      /**
       * Holds a list of all Nodes that references this node in their usesExisting property
       * @type {Array}
       */
      this.usedBy = [];

      /**
       * References other existing nodes from the DependencyTree. This is used to resolve redundant Dependency Nodes
       * inside the DependencyTree.
       * @type {object}
       */
      this.usesExisting = [];
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
    DependencyTree.Node.prototype.equalsArtifact = function (node) {
      return node.data.getId() === this.data.getId();
    };

    /**
     * Check if the given node references the same artifact but ignore the version number. This can be used to determine
     * nodes with artifact version conflicts.
     * @memberOf DependencyTree.Node
     * @param {object} node DependencyTree.Node to compare to
     * @return {boolean} true if artifactId and webpackageName and (optional) groupId are equal. False otherwise
     */
    DependencyTree.Node.prototype.equalsArtifactIgnoreVersion = function (node) {
      return (node.data.webpackageId.split('@')[0] + '/' + node.data.artifactId) === (this.data.webpackageId.split('@')[0] + '/' + this.data.artifactId);
    };

    /**
     * Return the path starting from root for this node as string.
     * @memberOf DependencyTree.Node
     * @return {string}
     */
    DependencyTree.Node.prototype.getPathAsString = function () {
      var current = this;
      var path = [current.data.getId()];
      while (current.parent) {
        current = current.parent;
        path.splice(0, 0, current.data.getId());
      }
      return path.join(' > ');
    };

    /**
     * Check if the given node is an ancestor of this node.
     * Note: Edges defined by usesExisting arrays are also take into consideration!
     * @memberOf DependencyTree.Node
     * @param {object} node A DependencyTree.Node instance within te same tree
     * @returns {boolean} true if given node is an ancestor of this node. False otherwise
     */
    DependencyTree.Node.prototype.isAncestorOf = function (node) {
      var isAncestor = false;
      var children = this.children.concat(this.usesExisting);

      while (children.length > 0) {
        var current = children.shift();
        if (current.equals(node)) {
          isAncestor = true;
          break;
        } else {
          current.children.some(function (child) {
            children.push(child);
          });
          current.usesExisting.some(function (child) {
            children.push(child);
          });
        }
      }

      return isAncestor;
    };

    /**
     * Returns true if the node is a descendant of the given node. This also includes usedBy relations!
     * @memberOf DependencyTree.Node
     * @param {object} node A DependencyTree.Node
     * @returns {boolean} true if the node is a descendent of the given node, false otherwise.
     */
    DependencyTree.Node.prototype.isDescendantOf = function (node) {
      var parents = this.parent ? this.usedBy.concat(this.parent) : this.usedBy;

      while (parents.length > 0) {
        var current = parents.shift();
        if (current.equals(node)) return true;
        current.usedBy.forEach(function (item) {
          parents.push(item);
        });
        if (current.parent != null) parents.push(current.parent);
      }
      return false;
    };

    /**
     * Returns a JSON object describing the node using the following structure:
     * {
     *    "webpackageId": ...,
     *    "artifactId": ...,
     *    "resources": [...], //optional
     *    "children": [
     *      {
     *        "webpackageId": ...,
     *        "artifactId": ...,
     *        "resources": [...], //optional
     *        "children": [...],
     *        usesExisting: [...],
     *        usedBy: [...]
     *      },
     *      ...
     *    ],
     *    usesExisting: [...],
     *    usedBy: [...]
     * }
     * @memberOf DependencyTree
     * @param {boolean} [includeResources=false] Indicates whether to include resources property.
     * @returns {{}} JSON object describing the depTree
     */
    DependencyTree.Node.prototype.toJSON = function (includeResources) {
      var jsonObject = {};
      var children = [];
      var usedBy = [];
      var usesExisting = [];
      if (this.children.length > 0) {
        this.children.forEach(function (child) {
          children.push(child.toJSON(includeResources));
        });
      }
      if (this.usedBy.length > 0) {
        this.usedBy.forEach(function (child) {
          usedBy.push({webpackageId: child.data.webpackageId, artifactId: child.data.artifactId});
        });
      }
      if (this.usesExisting.length > 0) {
        this.usesExisting.forEach(function (child) {
          usesExisting.push({webpackageId: child.data.webpackageId, artifactId: child.data.artifactId});
        });
      }
      jsonObject.webpackageId = this.data.webpackageId;
      jsonObject.artifactId = this.data.artifactId;
      jsonObject.children = children;
      jsonObject.usesExisting = usesExisting;
      jsonObject.usedBy = usedBy;
      if (includeResources) {
        jsonObject.resources = this.data.resources;
      }
      return jsonObject;
    };

    return DependencyTree;
  });
})();
