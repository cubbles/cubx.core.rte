/* globals describe, before, beforeEach, after, afterEach, it, expect*/
'use strict';
(function () {
  window.cubx.amd.define(['dependencyTree', 'dependencyManager'], function (DependencyTree, DependencyMgr) {
    var depTree;
    var nodeA;
    var nodeB;
    var childA1;
    var childA2;
    var childB1;
    var childB2;
    var childA11;
    var childB11;
    var childB21;
    var childA111;
    var childB111;
    var packages = {};

    beforeEach(function () {
      packages = {
        pkg1: {webpackageId: 'package1@1.0.0', artifactId: 'util1'},
        pkg2: {webpackageId: 'package2@1.0.0', artifactId: 'util2'},
        pkg3: {webpackageId: 'package3@1.0.0', artifactId: 'util3'},
        pkg4: {webpackageId: 'package4@1.0.0', artifactId: 'util4'},
        pkg5: {webpackageId: 'package5@1.0.0', artifactId: 'util5'},
        pkg6: {webpackageId: 'package6@1.0.0', artifactId: 'util6'}
      };
      /**
       * build dependency tree that has the following structure:
       *
       *                  package1@1.0.0/util1                                package2@1.0.0/util2
       *                     /         \                                           /         \
       *                    /           \                                         /           \
       *      package3@1.0.0/util3    package4@1.0.0/util4          package3@1.0.0/util3    package5@1.0.0/util5
       *              |                                                       |                       |
       *              |                                                       |                       |
       *      package5@1.0.0/util5                                  package5@1.0.0/util5    package6@1.0.0/util6
       *              |                                                       |
       *              |                                                       |
       *      package6@1.0.0/util6                                  package6@1.0.0/util6
       */
      depTree = new DependencyTree();
      nodeA = new DependencyTree.Node();
      nodeA.data = new DependencyMgr.DepReference({webpackageId: packages.pkg1.webpackageId, artifactId: packages.pkg1.artifactId, referrer: null});
      nodeB = new DependencyTree.Node();
      nodeB.data = new DependencyMgr.DepReference({webpackageId: packages.pkg2.webpackageId, artifactId: packages.pkg2.artifactId, referrer: null});
      childA1 = new DependencyTree.Node();
      childA1.data = new DependencyMgr.DepReference({webpackageId: packages.pkg3.webpackageId, artifactId: packages.pkg3.artifactId, referrer: packages.pkg1});
      childA2 = new DependencyTree.Node();
      childA2.data = new DependencyMgr.DepReference({webpackageId: packages.pkg4.webpackageId, artifactId: packages.pkg4.artifactId, referrer: packages.pkg1});
      childB1 = new DependencyTree.Node();
      childB1.data = new DependencyMgr.DepReference({webpackageId: packages.pkg3.webpackageId, artifactId: packages.pkg3.artifactId, referrer: packages.pkg2});
      childB2 = new DependencyTree.Node();
      childB2.data = new DependencyMgr.DepReference({webpackageId: packages.pkg5.webpackageId, artifactId: packages.pkg5.artifactId, referrer: packages.pkg2});
      childA11 = new DependencyTree.Node();
      childA11.data = new DependencyMgr.DepReference({webpackageId: packages.pkg5.webpackageId, artifactId: packages.pkg5.artifactId, referrer: packages.pkg3});
      childB11 = new DependencyTree.Node();
      childB11.data = new DependencyMgr.DepReference({webpackageId: packages.pkg5.webpackageId, artifactId: packages.pkg5.artifactId, referrer: packages.pkg3});
      childB21 = new DependencyTree.Node();
      childB21.data = new DependencyMgr.DepReference({webpackageId: packages.pkg6.webpackageId, artifactId: packages.pkg6.artifactId, referrer: packages.pkg5});
      childA111 = new DependencyTree.Node();
      childA111.data = new DependencyMgr.DepReference({webpackageId: packages.pkg6.webpackageId, artifactId: packages.pkg6.artifactId, referrer: packages.pkg5});
      childB111 = new DependencyTree.Node();
      childB111.data = new DependencyMgr.DepReference({webpackageId: packages.pkg6.webpackageId, artifactId: packages.pkg6.artifactId, referrer: packages.pkg5});
      depTree.insertNode(nodeA);
      depTree.insertNode(nodeB);
      depTree.insertNode(childA1, nodeA);
      depTree.insertNode(childA2, nodeA);
      depTree.insertNode(childB1, nodeB);
      depTree.insertNode(childB2, nodeB);
      depTree.insertNode(childA11, childA1);
      depTree.insertNode(childB11, childB1);
      depTree.insertNode(childB21, childB2);
      depTree.insertNode(childA111, childA11);
      depTree.insertNode(childB111, childB11);
    });
    describe('DependencyTree Modification', function () {
      describe('#removeDuplicates()', function () {
        it('should return the DependencyTree itself', function () {
          expect(depTree.removeDuplicates()).to.be.an.instanceOf(DependencyTree);
        });
        it('should remove all duplicated nodes from DependencyTree. Only the first one that is found using breadth-first traversal is kept.', function () {
          depTree.removeDuplicates();
          /**
           * Check if cleaned dependency tree has the following structure:
           *
           *                  package1@1.0.0/util1                                package2@1.0.0/util2
           *                     /         \                                           /
           *                    /           \                                         /
           *      package3@1.0.0/util3    package4@1.0.0/util4          package5@1.0.0/util5
           *                                                                      |
           *                                                                      |
           *                                                            package6@1.0.0/util6
           */
          depTree._rootNodes.should.be.eql([nodeA, nodeB]);
          depTree._rootNodes[0].children.should.be.eql([childA1, childA2]);
          depTree._rootNodes[0].children[0].children.should.be.eql([]);
          depTree._rootNodes[0].children[1].children.should.be.eql([]);
          depTree._rootNodes[1].children.should.be.eql([childB2]);
          depTree._rootNodes[1].children[0].children.should.be.eql([childB21]);
        });
        it('should return DependencyTree which contains each webpackage exactly once', function () {
          // packageIds in breadth first order
          var packageIds = [
            'package1@1.0.0/util1',
            'package2@1.0.0/util2',
            'package3@1.0.0/util3',
            'package4@1.0.0/util4',
            'package5@1.0.0/util5',
            'package6@1.0.0/util6'
          ];
          depTree.removeDuplicates();
          var count = 0;
          depTree.traverseBF(function (node) {
            expect(packageIds[count]).to.eql(node.data.getId());
            count++;
          });
          count.should.be.eql(6);
        });
        it('should create correct \'usedBy\' and \'usesExisting\' relations', function () {
          depTree.removeDuplicates();
          nodeB.usesExisting.should.be.eql([childA1]);
          childA1.usedBy.should.be.eql([nodeB]);
          childA1.usesExisting.should.be.eql([childB2]);
          childB2.usedBy.should.be.eql([childA1]);
        });
      });
      describe('#applyExcludes()', function () {
        it('should return the DependencyTree itself', function () {

        });
        describe('should resolve the excludes using the following rules:', function () {
          it('An exclude is only valid within the scope of it\'s own subtree', function () {

          });
          it('A dependency package1@1.0.0/util1 on level n always overwrites an exclude package1@1.0.0/util1 on level n + k (k >= 1) within the same subtree', function () {

          });
          it('If an artifact has directly defined a dependency and an exclude referencing the same artifact then the dependency will be ignored', function () {

          });
          it('An exclude always will be ignored if the same artifact is referenced at least once in any of the other subtrees', function () {

          });
        });
      });
    });
  });
})();
