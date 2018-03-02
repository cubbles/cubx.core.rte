/* globals describe, before, beforeEach, after, afterEach, it, expect */
'use strict';
(function () {
  window.cubx.amd.define(['dependencyTree', 'dependencyManager', 'unit/utils/CubxNamespaceManager'],
    function (DependencyTree, DependencyMgr, CubxNamespaceManager) {
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
        describe('#_removeDuplicate()', function () {
          it('should set excluded value of duplicated node to false if duplicate node has excluded value of false', function () {
            // set excluded flag for several nodes
            childA1.excluded = true;
            childA11.excluded = true;
            childA111.excluded = true;
            childB1.excluded = false;

            depTree._removeDuplicate(childA1, childB1);
            childA1.excluded.should.be.false;
          });
          it('should keep excluded value true of duplicated node if duplicate node has excluded value of true as well', function () {
            // set excluded flag for several nodes
            childA1.excluded = true;
            childA11.excluded = true;
            childA111.excluded = true;
            childB1.excluded = true;
            childB11.excluded = true;
            childB111.excluded = true;

            depTree._removeDuplicate(childA1, childB1);
            childA1.excluded.should.be.true;
          });
          it('should keep excluded value false of duplicated node if duplicate node has excluded value of false as well', function () {
            // set excluded flag for several nodes
            childA1.excluded = false;
            childB1.excluded = false;

            depTree._removeDuplicate(childA1, childB1);
            childA1.excluded.should.be.false;
          });
          it('should keep excluded value false of duplicated node if duplicate node has excluded value of true', function () {
            // set excluded flag for several nodes
            childA1.excluded = false;
            childB1.excluded = true;
            childB11.excluded = true;
            childB111.excluded = true;

            depTree._removeDuplicate(childA1, childB1);
            childA1.excluded.should.be.false;
          });
          it('should only mark nodes as excluded if they are excluded in subtree of duplicated node as well as in ' +
            'subtree of duplicate node', function () {
            childA11.excluded = true;
            childA111.excluded = true;
            childB11.excluded = false;
            childB111.excluded = true;

            depTree._removeDuplicate(childA1, childB1);
            childA11.excluded.should.be.false;
            childA111.excluded.should.be.true;
          });
          it('should append referrer of removed duplicate node to referrer of duplicated nodes', function () {
            depTree._removeDuplicate(childA1, childB1);
            childA1.data.referrer.should.eql([ packages.pkg1, packages.pkg2 ]);
          });
        });
        describe('#applyExcludes()', function () {
          var childB3;
          beforeEach(function () {
            /**
             * apply some excludes to given tree like follows (excludes in []). Add a child node package4 to invalidate exclude [package4]
             *
             *                  package1@1.0.0/util1 [package4]                           package2@1.0.0/util2 [package5]
             *                     /         \                                           /         \          \_______________
             *                    /           \                                         /           \                         \
             *      package3@1.0.0/util3    package4@1.0.0/util4          package3@1.0.0/util3    package5@1.0.0/util5   package4@1.0.0/util4
             *              |   [package6]                                          |   [package6]          |
             *              |                                                       |                       |
             *      package5@1.0.0/util5                                  package5@1.0.0/util5    package6@1.0.0/util6
             *              |                                                       |
             *              |                                                       |
             *      package6@1.0.0/util6                                  package6@1.0.0/util6
             */
            nodeA.data.dependencyExcludes = [{ webpackageId: 'package4@1.0.0', artifactId: 'util4' }];
            childA1.data.dependencyExcludes = [{ webpackageId: 'package6@1.0.0', artifactId: 'util6' }];
            nodeB.data.dependencyExcludes = [{ webpackageId: 'package5@1.0.0', artifactId: 'util5' }];
            childB1.data.dependenyExcludes = [{ webpackageId: 'package6@1.0.0', artifactId: 'util6' }];
            childB3 = new DependencyTree.Node();
            childB3.data = new DependencyMgr.DepReference({webpackageId: packages.pkg4.webpackageId, artifactId: packages.pkg4.artifactId, referrer: packages.pkg2});
            depTree.insertNode(childB3, nodeB);
          });
          it('should mark all excluded Nodes', function () {
            depTree.applyExcludes();
            nodeA.excluded.should.be.false;
            nodeB.excluded.should.be.false;
            childA1.excluded.should.be.false;
            childA2.excluded.should.be.true;
            childB1.excluded.should.be.false;
            childB2.excluded.should.be.true;
            childB3.excluded.should.be.false;
            childA11.excluded.should.be.false;
            childA111.excluded.should.be.true;
            childB11.excluded.should.be.true;
            childB21.excluded.should.be.true;
            childB111.excluded.should.be.true;
          });
        });
        describe('#applyGlobalExclude()', function () {
          it('should return the DependencyTree itself', function () {
            // depTree.applyGlobalExclude('')
          });
          it('should set exclude value to true for all appearances of given artifact', function () {
            depTree.applyGlobalExclude(packages.pkg3.webpackageId, packages.pkg3.artifactId);
            childA1.excluded.should.be.true;
            childA11.excluded.should.be.true;
            childA111.excluded.should.be.true;
            childB1.excluded.should.be.true;
            childB11.excluded.should.be.true;
            childB111.excluded.should.be.true;

            // for each other node excluded should be set to false
            nodeA.excluded.should.be.false;
            nodeB.excluded.should.be.false;
            childA2.excluded.should.be.false;
            childB2.excluded.should.be.false;
            childB21.excluded.should.be.false;
          });
        });
        describe('#getListOfConflictedNodes()', function () {
          var childA21;
          var childA211;
          beforeEach(function () {
            /**
             * Adjust depTree to contain two conflicts. Adjusted tree will have the following structure:
             *
             *                  package1@1.0.0/util1                                package2@1.0.0/util2
             *                     /         \                                           /         \
             *                    /           \                                         /           \
             *      package3@1.0.0/util3    package4@1.0.0/util4          package3@1.0.0/util3    package5@1.0.0/util5
             *              |                       |                               |                       |
             *              |                       |                               |                       |
             *      package5@1.0.0/util5    package5@2.0.0/util5          package5@1.0.0/util5    package6@1.0.0/util6
             *              |                       |                               |
             *              |                       |                               |
             *      package6@1.0.0/util6    package6@2.0.0/util6          package6@1.0.0/util6
             *
             */
            var pkg5Conflict = {webpackageId: 'package5@2.0.0', artifactId: 'util5'};
            var pkg6Conflict = {webpackageId: 'package6@2.0.0', artifactId: 'util6'};
            childA21 = new DependencyTree.Node();
            childA21.data = new DependencyMgr.DepReference({ webpackageId: pkg5Conflict.webpackageId, artifactId: pkg5Conflict.artifactId, referrer: packages.pkg4 });
            childA211 = new DependencyTree.Node();
            childA211.data = new DependencyMgr.DepReference({ webpackageId: pkg6Conflict.webpackageId, artifactId: pkg6Conflict.artifactId, referrer: pkg5Conflict });
            depTree.insertNode(childA21, childA2);
            depTree.insertNode(childA211, childA21);
          });
          it('should log an error when given parameter is not a node from within the current DependencyTree instance', function () {
            var spy = sinon.spy(console, 'error');
            depTree.getListOfConflictedNodes({});
            expect(spy.calledOnce).to.be.true;
            var node = new DependencyTree.Node();
            spy.reset();
            depTree.getListOfConflictedNodes(node);
            expect(spy.calledOnce).to.be.true;
            spy.restore();
          });
          it('should return an array containing a list of all conflicts found in DependencyTree (using level order traversal)', function () {
            var conflicts = depTree.getListOfConflictedNodes();
            conflicts.should.be.instanceof(Array);
            conflicts.should.have.lengthOf(2);
            conflicts[0].should.have.property('artifactId', 'util5');
            conflicts[0].should.have.property('nodes');
            conflicts[0].nodes[0].should.equal(childB2);
            conflicts[0].nodes[1].should.equal(childA21);
            conflicts[1].should.have.property('artifactId', 'util6');
            conflicts[1].should.have.property('nodes');
            conflicts[1].nodes[0].should.equal(childB21);
            conflicts[1].nodes[1].should.equal(childA211);
          });
          it('should return an array containing a list of all conflicts found in subtree of given node (using level order traversal)', function () {
            var conflicts = depTree.getListOfConflictedNodes(nodeA);
            conflicts.should.be.instanceof(Array);
            conflicts.should.have.lengthOf(2);
            conflicts[0].should.have.property('artifactId', 'util5');
            conflicts[0].should.have.property('nodes');
            conflicts[0].nodes[0].should.equal(childA11);
            conflicts[0].nodes[1].should.equal(childA21);
            conflicts[1].should.have.property('artifactId', 'util6');
            conflicts[1].should.have.property('nodes');
            conflicts[1].nodes[0].should.equal(childA111);
            conflicts[1].nodes[1].should.equal(childA211);
          });
          it('should return an empty array if there are no conflicts in subtree of given nodes', function () {
            var conflicts = depTree.getListOfConflictedNodes(nodeB);
            conflicts.should.be.instanceof(Array);
            conflicts.should.have.lengthOf(0);
          });
        });
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
          it('should set excluded value on each remaining node correctly', function () {
            /**
             * apply some excludes to given tree like follows (excludes in []). Add a child node package4 to invalidate exclude [package4]
             *
             *                  package1@1.0.0/util1 [package4]                           package2@1.0.0/util2 [package5]
             *                     /         \                                           /         \          \_______________
             *                    /           \                                         /           \                         \
             *      package3@1.0.0/util3    package4@1.0.0/util4          package3@1.0.0/util3    package5@1.0.0/util5   package4@1.0.0/util4
             *              |   [package6]                                          |   [package6]          |
             *              |                                                       |                       |
             *      package5@1.0.0/util5                                  package5@1.0.0/util5    package6@1.0.0/util6
             *              |                                                       |
             *              |                                                       |
             *      package6@1.0.0/util6                                  package6@1.0.0/util6
             */
            nodeA.data.dependencyExcludes = [{ webpackageId: 'package4@1.0.0', artifactId: 'util4' }];
            childA1.data.dependencyExcludes = [{ webpackageId: 'package6@1.0.0', artifactId: 'util6' }];
            nodeB.data.dependencyExcludes = [{ webpackageId: 'package5@1.0.0', artifactId: 'util5' }];
            childB1.data.dependenyExcludes = [{ webpackageId: 'package6@1.0.0', artifactId: 'util6' }];
            var childB3 = new DependencyTree.Node();
            childB3.data = new DependencyMgr.DepReference({webpackageId: packages.pkg4.webpackageId, artifactId: packages.pkg4.artifactId, referrer: packages.pkg2});
            depTree.insertNode(childB3, nodeB);

            depTree.applyExcludes();
            depTree.removeDuplicates();

            nodeA.excluded.should.be.false;
            nodeB.excluded.should.be.false;
            childA1.excluded.should.be.false;
            childA2.excluded.should.be.false;
            childB2.excluded.should.be.false;
            childB21.excluded.should.be.true;
          });
        });
        describe('#removeExcludes()', function () {
          beforeEach(function () {
            /**
             * mark some nodes as [excluded] in original dependency tree
             *
             *                  package1@1.0.0/util1                                package2@1.0.0/util2
             *                     /         \                                           /         \
             *                    /           \                                         /           \
             *      package3@1.0.0/util3    package4@1.0.0/util4          package3@1.0.0/util3    [package5@1.0.0/util5]
             *              |                                                       |                       |
             *              |                                                       |                       |
             *      [package5@1.0.0/util5]                                [package5@1.0.0/util5]  [package6@1.0.0/util6]
             *              |                                                       |
             *              |                                                       |
             *      [package6@1.0.0/util6]                                [package6@1.0.0/util6]
             */
            childA11.excluded = true;
            childA111.excluded = true;
            childB11.excluded = true;
            childB111.excluded = true;
            childB2.excluded = true;
            childB21.excluded = true;
            depTree.removeDuplicates();
          });
          it('should remove all nodes which have property excludes set to true', function () {
            /**
             * After removing excluded nodes tree should look like following
             *
             *                  package1@1.0.0/util1                                package2@1.0.0/util2
             *                     /         \
             *                    /           \
             *      package3@1.0.0/util3    package4@1.0.0/util4
             */
            depTree.removeExcludes();
            depTree._rootNodes.should.have.lengthOf(2);
            depTree._rootNodes[0].should.equal(nodeA);
            depTree._rootNodes[0].children.should.have.lengthOf(2);
            depTree._rootNodes[0].children[0].should.equal(childA1);
            depTree._rootNodes[0].children[1].should.equal(childA2);
            childA1.children.should.have.lengthOf(0);
            childA2.children.should.have.lengthOf(0);
            depTree._rootNodes[1].should.equal(nodeB);
            nodeB.children.should.have.lengthOf(0);
          });
          it('should return the DependencyTree itself', function () {
            expect(depTree.removeExcludes()).to.equal(depTree);
          });
        });
        describe('conflict detection and resolution', function () {
          var Node = DependencyTree.Node;
          var DepRef = DependencyMgr.DepReference;
          var depTree;
          var childA1;
          var childA2;
          var childA11;
          var childB1;
          var childC1;
          var childC2;
          var childC3;

          beforeEach(function () {
            /**
             * Provide example tree with one version conflict (package5@2.0.0/util5 <--> package5@1.0.0/util5),
             * one naming conflict (package3@1.0.0/my-comp <--> packageB@2.0.0/my-comp) and one mixed conflict containing a
             * version conflict (packageC@1.0/artifact_C <--> packageD@1.0/artifact_C <-->  packageD@2.0/artifact_C)
             * Build the following tree:
             *
             *               package1@1.0.0/util1                      packageA@1.0.0/artifactA                              packageB@1.0/artifact_B
             *                  /            \                                    |                                       /               |          \
             *                /               \                                   |                                      /                |           \
             *    package3@1.0.0/my-comp    package5@2.0.0/util5        packageB@2.0.0/my-comp     packageC@1.0/artifact_C   packageD@1.0/artifact_C   packageD@2.0/artifact_C
             *            |
             *            |
             *    package5@1.0.0/util5
             */
            depTree = new DependencyTree();
            var rootA = new Node();
            rootA.data = new DepRef({webpackageId: 'package1@1.0.0', artifactId: 'util1', referrer: null});
            depTree.insertNode(rootA);

            var rootB = new Node();
            rootB.data = new DepRef({webpackageId: 'packageA@1.0.0', artifactId: 'artifactA', referrer: null});
            depTree.insertNode(rootB);

            var rootC = new Node();
            rootC.data = new DepRef({webpackageId: 'packageB@1.0', artifactId: 'artifact_B', referrer: null});
            depTree.insertNode(rootC);

            childA1 = new Node();
            childA1.data = new DepRef({
              webpackageId: 'package3@1.0.0',
              artifactId: 'my-comp',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childA1, rootA);

            childA2 = new Node();
            childA2.data = new DepRef({
              webpackageId: 'package5@2.0.0',
              artifactId: 'util5',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childA2, rootA);

            childA11 = new Node();
            childA11.data = new DepRef({
              webpackageId: 'package5@1.0.0',
              artifactId: 'util5',
              referrer: {webpackageId: 'package3@1.0.0', artifactId: 'my-comp'}
            });
            depTree.insertNode(childA11, childA1);

            childB1 = new Node();
            childB1.data = new DepRef({
              webpackageId: 'packageB@2.0.0',
              artifactId: 'my-comp',
              referrer: {webpackageId: 'packageA@1.0.0', artifactId: 'artifactA'}
            });
            depTree.insertNode(childB1, rootB);

            childC1 = new Node();
            childC1.data = new DepRef({
              webpackageId: 'packageC@1.0',
              artifactId: 'artifact_C',
              referrer: {webpackageId: 'packageB@1.0', artifactId: 'artifact_B'}
            });
            depTree.insertNode(childC1, rootC);

            childC2 = new Node();
            childC2.data = new DepRef({
              webpackageId: 'packageD@1.0',
              artifactId: 'artifact_C',
              referrer: {webpackageId: 'packageB@1.0', artifactId: 'artifact_B'}
            });
            depTree.insertNode(childC2, rootC);

            childC3 = new Node();
            childC3.data = new DepRef({
              webpackageId: 'packageD@2.0',
              artifactId: 'artifact_C',
              referrer: {webpackageId: 'packageB@1.0', artifactId: 'artifact_B'}
            });
            depTree.insertNode(childC3, rootC);
          });

          describe('#determineArtifactConflicts()', function () {
            it('should determine naming conflicts and store them on internal property _nameConflicts', function () {
              depTree.determineArtifactConflicts();
              depTree.should.have.property('_nameConflicts');
              depTree._nameConflicts.should.be.an('array');
              depTree._nameConflicts.should.have.lengthOf(1);
              depTree._nameConflicts[0].should.eql({
                artifactId: 'my-comp',
                nodes: [childA1, childB1]
              });
            });
            it('should determine version conflicts and store them on internal property _versionConflicts', function () {
              depTree.determineArtifactConflicts();
              depTree.should.have.property('_versionConflicts');
              depTree._versionConflicts.should.be.an('array');
              depTree._versionConflicts.should.have.lengthOf(2);
              depTree._versionConflicts.should.have.deep.members([
                {
                  artifactId: 'util5',
                  nodes: [childA2, childA11]
                },
                {
                  artifactId: 'artifact_C',
                  nodes: [childC2, childC3]
                }
              ]);
            });
          });
          describe('#resolveArtifactVersionConflicts()', function () {

          });
        });
      });
    });
})();
