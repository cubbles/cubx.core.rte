/* globals describe, before, beforeEach, after, afterEach, it, expect */
'use strict';
(function () {
  window.cubx.amd.define(['dependencyTree', 'dependencyManager'], function (DependencyTree, DependencyMgr) {
    describe('DependencyTree', function () {
      var depTree;
      var rootNode1;
      var rootNode2;
      var childA;
      var childB;
      var childC;
      beforeEach(function () {
        /**
         * init tree and put some nodes in it. Following tree will be created:
         *
         *           rootNode1          rootNode2
         *              |                 /   \
         *              |                /     \
         *            childC         childA   childB
         */
        depTree = new DependencyTree();
        rootNode1 = new DependencyTree.Node();
        rootNode1.data = {prop1: 'test', prop2: 1234};
        childC = new DependencyTree.Node();
        childC.parent = rootNode1;
        rootNode1.children = [childC];
        rootNode2 = new DependencyTree.Node();
        rootNode2.data = {prop1: 'test2', prop2: 4321};
        childA = new DependencyTree.Node();
        childA.parent = rootNode2;
        childB = new DependencyTree.Node();
        childB.parent = rootNode2;
        rootNode2.children = [childA, childB];
        depTree._rootNodes = [rootNode1, rootNode2];
      });
      describe('#insertNode()', function () {
        it('should return the inserted DependencyTree.Node instance', function () {
          var node = new DependencyTree.Node();
          node.data = {testData: 'testData'};
          expect(depTree.insertNode(node)).to.equal(node);
        });
        it('should append given node to rootNodes array if neither parent nor before parameter is given.', function () {
          var node = new DependencyTree.Node();
          node.data = {testData: 'testData'};
          depTree.insertNode(node);
          depTree._rootNodes.should.have.lengthOf(3);
          depTree._rootNodes[2].should.be.equal(node);
        });
        it('should insert given node to parents children array if parent and before parameter are given.', function () {
          var node = new DependencyTree.Node();
          node.data = {testData: 'testData'};
          depTree.insertNode(node, rootNode2, childB);
          rootNode2.children.should.have.lengthOf(3);
          rootNode2.children[1].should.equal(node);
          node.parent.should.be.equal(rootNode2);
        });
        it('should insert given node to rootNodes array as left neighbour of given before node if no parent is given.', function () {
          var node = new DependencyTree.Node();
          node.data = {testData: 'testData'};
          depTree.insertNode(node, null, rootNode2);
          expect(node.parent).to.be.null;
          depTree._rootNodes.should.have.lengthOf(3);
          depTree._rootNodes[0].should.be.equal(rootNode1);
          depTree._rootNodes[1].should.be.equal(node);
          depTree._rootNodes[2].should.be.equal(rootNode2);
        });
      });
      describe('#removeNode()', function () {
        it('should remove given node and all of it\'s descendants from tree', function () {
          depTree.removeNode(rootNode2);
          depTree._rootNodes.should.have.length(1);
          depTree._rootNodes[0].should.equal(rootNode1);
        });
        it('should return null if node to be removed could not be found in tree', function () {
          var node = depTree.removeNode(new DependencyTree.Node());
          expect(node).to.be.null;
        });
        it('should return the removed node', function () {
          var node = depTree.removeNode(childA);
          expect(node).to.eql(childA);
        });
        it('should remove given node from usesExisting array of all nodes inside given nodes usedBy array', function () {
          childA.usesExisting = [childC];
          childC.usedBy = [childA];
          depTree.removeNode(childC);
          childA.usesExisting.should.have.lengthOf(0);
        });
        it('should log an error if given parameter is not a DependencyTree.Node instance', function () {
          var spy = sinon.spy(console, 'error');
          depTree.removeNode({});
          expect(spy.calledOnce);
          spy.restore();
        });
      });
      describe('#traverseDF()', function () {
        it('should traverse the tree in depth first pre-order and call the given callback with each visited node', function () {
          var callbackStub = sinon.stub();
          callbackStub.returns(true);
          depTree.traverseDF(callbackStub);
          expect(callbackStub.getCall(0).calledWith(rootNode1)).to.be.true;
          expect(callbackStub.getCall(1).calledWith(childC)).to.be.true;
          expect(callbackStub.getCall(2).calledWith(rootNode2)).to.be.true;
          expect(callbackStub.getCall(3).calledWith(childA)).to.be.true;
          expect(callbackStub.getCall(4).calledWith(childB)).to.be.true;
        });
        it('should break traversal if callback returns false', function () {
          var callbackStub = sinon.stub();
          callbackStub.onThirdCall().returns(false);
          callbackStub.returns(true);
          depTree.traverseDF(callbackStub);
          expect(callbackStub.getCall(0).calledWith(rootNode1)).to.be.true;
          expect(callbackStub.getCall(1).calledWith(childC)).to.be.true;
          expect(callbackStub.getCall(2).calledWith(rootNode2)).to.be.true;
          expect(callbackStub.callCount).to.equal(3);
        });
        it('should log an error if parameter is not of type function', function () {
          var consoleStub = sinon.stub(console, 'error');
          depTree.traverseDF('foo');
          expect(consoleStub.called).to.be.true;
          consoleStub.restore();
        });
      });
      describe('#traverseBF()', function () {
        it('should traverse the tree in breadth first order and call the given callback with each visited node', function () {
          var callbackStub = sinon.stub();
          callbackStub.returns(true);
          depTree.traverseBF(callbackStub);
          expect(callbackStub.getCall(0).calledWith(rootNode1)).to.be.true;
          expect(callbackStub.getCall(1).calledWith(rootNode2)).to.be.true;
          expect(callbackStub.getCall(2).calledWith(childC)).to.be.true;
          expect(callbackStub.getCall(3).calledWith(childA)).to.be.true;
          expect(callbackStub.getCall(4).calledWith(childB)).to.be.true;
          expect(callbackStub.callCount).to.equal(5);
        });
        it('should break traversal if callback returns false', function () {
          var callbackStub = sinon.stub();
          callbackStub.onThirdCall().returns(false);
          callbackStub.returns(true);
          depTree.traverseBF(callbackStub);
          expect(callbackStub.getCall(0).calledWith(rootNode1)).to.be.true;
          expect(callbackStub.getCall(1).calledWith(rootNode2)).to.be.true;
          expect(callbackStub.getCall(2).calledWith(childC)).to.be.true;
          expect(callbackStub.callCount).to.equal(3);
        });
        it('should log an error if parameter is not of type function', function () {
          var consoleStub = sinon.stub(console, 'error');
          depTree.traverseBF('foo');
          expect(consoleStub.called).to.be.true;
          consoleStub.restore();
        });
      });
      describe('#traverseSubtreeBF()', function () {
        it('should traverse subtree starting from given node in breadth first order and call callback for each visited node', function () {
          var callbackStub = sinon.stub();
          callbackStub.returns(true);
          depTree.traverseSubtreeBF(rootNode2, callbackStub);
          expect(callbackStub.getCall(0).calledWith(rootNode2)).to.be.true;
          expect(callbackStub.getCall(1).calledWith(childA)).to.be.true;
          expect(callbackStub.getCall(2).calledWith(childB)).to.be.true;
          expect(callbackStub.callCount).to.equal(3);
        });
        it('should log an error if first parameter is not of type DependencyTree.Node', function () {
          var consoleStub = sinon.stub(console, 'error');
          depTree.traverseSubtreeBF('foo', function () {});
          expect(consoleStub.called).to.be.true;
          consoleStub.restore();
        });
        it('should log an error if second paramter is not of type function', function () {
          var consoleStub = sinon.stub(console, 'error');
          depTree.traverseSubtreeBF(rootNode2, 'foo');
          expect(consoleStub.called).to.be.true;
          consoleStub.restore();
        });
      });
      describe('#contains()', function () {
        it('should return true if given node is member of the DependencyTree', function () {
          expect(depTree.contains(childA)).to.be.true;
        });
        it('should return false if given node is not member of the DependencyTree', function () {
          var node = new DependencyTree.Node();
          expect(depTree.contains(node)).to.be.false;
        });
      });
      describe('#toJSON()', function () {
        it('should return an object describing the dependency tree as JSON object', function () {
          rootNode1.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package1@1.0', artifactId: 'comp-1', referrer: null});
          childC.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageC@1.0', artifactId: 'comp-c', referrer: null});

          rootNode2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package2@1.0', artifactId: 'comp-2', referrer: null});
          childA.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageB@1.0', artifactId: 'comp-b', referrer: null});

          expect(depTree.toJSON()).to.deep.equal({
            rootNodes: [
              {
                webpackageId: 'com.example.package1@1.0',
                artifactId: 'comp-1',
                children: [
                  {
                    webpackageId: 'com.example.packageC@1.0',
                    artifactId: 'comp-c',
                    children: [],
                    usesExisting: [],
                    usedBy: []
                  }
                ],
                usesExisting: [],
                usedBy: []
              },
              {
                webpackageId: 'com.example.package2@1.0',
                artifactId: 'comp-2',
                children: [
                  {
                    webpackageId: 'com.example.packageA@1.0',
                    artifactId: 'comp-a',
                    children: [],
                    usesExisting: [],
                    usedBy: []
                  },
                  {
                    webpackageId: 'com.example.packageB@1.0',
                    artifactId: 'comp-b',
                    children: [],
                    usesExisting: [],
                    usedBy: []
                  }
                ],
                usesExisting: [],
                usedBy: []
              }
            ]
          });
        });
        it('should include the \'resources\' property on nodes of the JSON object', function () {
          rootNode1.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package1@1.0', artifactId: 'comp-1', referrer: null});
          childC.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageC@1.0', artifactId: 'comp-c', referrer: null});
          childC.data.resources = ['index.html'];

          rootNode2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package2@1.0', artifactId: 'comp-2', referrer: null});
          childA.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a', referrer: null});
          childA.data.resources = ['js/main.js', 'css/style.css'];
          childB.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageB@1.0', artifactId: 'comp-b', referrer: null});

          expect(depTree.toJSON(true)).to.deep.equal({
            rootNodes: [
              {
                webpackageId: 'com.example.package1@1.0',
                artifactId: 'comp-1',
                resources: [],
                children: [
                  {
                    webpackageId: 'com.example.packageC@1.0',
                    artifactId: 'comp-c',
                    resources: ['index.html'],
                    children: [],
                    usesExisting: [],
                    usedBy: []
                  }
                ],
                usesExisting: [],
                usedBy: []
              },
              {
                webpackageId: 'com.example.package2@1.0',
                artifactId: 'comp-2',
                resources: [],
                children: [
                  {
                    webpackageId: 'com.example.packageA@1.0',
                    artifactId: 'comp-a',
                    resources: ['js/main.js', 'css/style.css'],
                    children: [],
                    usesExisting: [],
                    usedBy: []
                  },
                  {
                    webpackageId: 'com.example.packageB@1.0',
                    artifactId: 'comp-b',
                    resources: [],
                    children: [],
                    usesExisting: [],
                    usedBy: []
                  }
                ],
                usesExisting: [],
                usedBy: []
              }
            ]
          });
        });
        it('should assign correct values to \'usesExisting\' and \'usedBy\' properties', function () {
          rootNode1.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package1@1.0', artifactId: 'comp-1', referrer: null});
          childC.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageC@1.0', artifactId: 'comp-c', referrer: null});

          rootNode2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package2@1.0', artifactId: 'comp-2', referrer: null});
          childA.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageB@1.0', artifactId: 'comp-b', referrer: null});

          var childD = new DependencyTree.Node();
          childD.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageD@1.0', artifactId: 'comp-d', referrer: {webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a'}});

          var childD2 = new DependencyTree.Node();
          childD2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageD@1.0', artifactId: 'comp-d', referrer: {webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a'}});

          depTree.insertNode(childD, childC);
          depTree.insertNode(childD2, childB);
          depTree.removeDuplicates();

          expect(depTree.toJSON()).to.deep.equal({
            rootNodes: [
              {
                webpackageId: 'com.example.package1@1.0',
                artifactId: 'comp-1',
                children: [
                  {
                    webpackageId: 'com.example.packageC@1.0',
                    artifactId: 'comp-c',
                    children: [
                      {
                        webpackageId: 'com.example.packageD@1.0',
                        artifactId: 'comp-d',
                        children: [],
                        usesExisting: [],
                        usedBy: [
                          {
                            webpackageId: 'com.example.packageB@1.0',
                            artifactId: 'comp-b'
                          }
                        ]
                      }
                    ],
                    usesExisting: [],
                    usedBy: []
                  }
                ],
                usesExisting: [],
                usedBy: []
              },
              {
                webpackageId: 'com.example.package2@1.0',
                artifactId: 'comp-2',
                children: [
                  {
                    webpackageId: 'com.example.packageA@1.0',
                    artifactId: 'comp-a',
                    children: [],
                    usesExisting: [],
                    usedBy: []
                  },
                  {
                    webpackageId: 'com.example.packageB@1.0',
                    artifactId: 'comp-b',
                    children: [],
                    usesExisting: [
                      {
                        webpackageId: 'com.example.packageD@1.0',
                        artifactId: 'comp-d'
                      }
                    ],
                    usedBy: []
                  }
                ],
                usesExisting: [],
                usedBy: []
              }
            ]
          });
        });
      });
      describe('#clone()', function () {
        var clonedTree;
        beforeEach(function () {
          rootNode1.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package1@1.0', artifactId: 'comp-1', referrer: null});
          childC.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageC@1.0', artifactId: 'comp-c', referrer: null});

          rootNode2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package2@1.0', artifactId: 'comp-2', referrer: null});
          childA.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageB@1.0', artifactId: 'comp-b', referrer: null});

          var childD = new DependencyTree.Node();
          childD.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageD@1.0', artifactId: 'comp-d', referrer: {webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a'}});

          var childD2 = new DependencyTree.Node();
          childD2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageD@1.0', artifactId: 'comp-d', referrer: {webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a'}});

          depTree.insertNode(childD, childC);
          depTree.insertNode(childD2, childB);
          clonedTree = depTree.clone();
          console.log(clonedTree);
        });
        it('cloned tree should be an instance of \'DependencyTree\'', function () {
          expect(clonedTree instanceof DependencyTree).to.be.true;
        });
        it('cloned and original tree should be deep equal', function () {
          expect(clonedTree).to.deep.equal(depTree);
        });
      });
    });
    describe('DependencyTree.Node', function () {
      var depTree;
      var rootNode1;
      var rootNode2;
      var childA;
      var childB;
      var childC;
      var childD;
      var childE;
      var childF;
      var childG;
      var childH;

      beforeEach(function () {
        /**
         * init tree and put some nodes in it. Following tree will be created:
         *
         *           rootNode1          rootNode2
         *              |                 /   \
         *              |                /     \
         *            childC         childA   childB
         *            /   \            |       /   \
         *           /     \           |      /     \
         *      childD   childE    childF   childG   childH
         */
        depTree = new DependencyTree();
        rootNode1 = new DependencyTree.Node();
        rootNode1.data = {prop1: 'test', prop2: 1234};
        childC = new DependencyTree.Node();
        childC.parent = rootNode1;
        rootNode1.children = [childC];
        rootNode2 = new DependencyTree.Node();
        rootNode2.data = {prop1: 'test2', prop2: 4321};
        childA = new DependencyTree.Node();
        childA.parent = rootNode2;
        childB = new DependencyTree.Node();
        childB.parent = rootNode2;
        rootNode2.children = [childA, childB];
        depTree._rootNodes = [rootNode1, rootNode2];
        childD = new DependencyTree.Node();
        childD.parent = childC;
        childE = new DependencyTree.Node();
        childE.parent = childC;
        childC.children = [childD, childE];
        childF = new DependencyTree.Node();
        childF.parent = childA;
        childA.children = [childF];
        childG = new DependencyTree.Node();
        childG.parent = childB;
        childH = new DependencyTree.Node();
        childH.parent = childB;
        childB.children = [childG, childH];
      });
      describe('#equalsArtifcat()', function () {
        it('should return true if given node references same artifact (based on artifactId and webpackageId)', function () {
          childA.data = new DependencyMgr.DepReference({webpackageId: 'pkgA@1.0', artifactId: 'artifactA', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'pkgA@1.0', artifactId: 'artifactA', referrer: null});
          expect(childA.equalsArtifact(childB)).to.be.true;
        });
        it('should return false if given node references a different artifact', function () {
          childA.data = new DependencyMgr.DepReference({webpackageId: 'pkgA@1.0', artifactId: 'artifactA', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'pkgB@1.0', artifactId: 'artifactB', referrer: null});
          expect(childA.equalsArtifact(childB)).to.be.false;
        });
      });
      describe('#equalsArtifactIgnoreVersion()', function () {
        it('should return true if given node references same artifact (based on artifactId, webpackage name and groupdId, ignoring version)', function () {
          childA.data = new DependencyMgr.DepReference({webpackageId: 'pkgA@1.0', artifactId: 'artifactA', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'pkgA@2.0', artifactId: 'artifactA', referrer: null});
          expect(childA.equalsArtifactIgnoreVersion(childB)).to.be.true;
        });
        it('should return false if given node references a different artifact', function () {
          childA.data = new DependencyMgr.DepReference({webpackageId: 'pkgA@1.0', artifactId: 'artifactA', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'pkgB@1.0', artifactId: 'artifactB', referrer: null});
          expect(childA.equalsArtifactIgnoreVersion(childB)).to.be.false;
        });
      });
      describe('#getPathAsString()', function () {
        it('should return a string containing the path from root down to node using [webpackageId]/[artifactId] as node names', function () {
          rootNode1.data = new DependencyMgr.DepReference({webpackageId: 'pkgA', artifactId: 'artifactA', referrer: null});
          childC.data = new DependencyMgr.DepReference({webpackageId: 'pkgC', artifactId: 'artifactC', referrer: null});
          childD.data = new DependencyMgr.DepReference({webpackageId: 'pkgD', artifactId: 'artifactD', referrer: null});
          var path = childD.getPathAsString();
          path.should.equal('pkgA/artifactA > pkgC/artifactC > pkgD/artifactD');
        });
      });
      describe('#isDescendantOf()', function () {
        beforeEach(function () {
          childA.usesExisting = [childC];
          childC.usedBy = [childA];
        });
        it('should return true if node is a descendant of given node checking also paths for nodes in usedBy array', function () {
          expect(childD.isDescendantOf(rootNode1)).to.be.true;
          expect(childD.isDescendantOf(rootNode2)).to.be.true;
          expect(childC.isDescendantOf(childA)).to.be.true;
          expect(childC.isDescendantOf(rootNode2)).to.be.true;
          expect(childF.isDescendantOf(rootNode1)).to.be.false;
        });
      });
      describe('#isAncestorOf()', function () {
        beforeEach(function () {
          childF.usesExisting = [childC];
          childC.usedBy = [childF];
        });
        it('should return true if node is an ancestor of given node checking also paths defined by usesExisting array', function () {
          expect(childF.isAncestorOf(childD)).to.be.true;
          expect(rootNode1.isAncestorOf(childD)).to.be.true;
          expect(rootNode1.isAncestorOf(childF)).to.be.false;
          expect(rootNode2.isAncestorOf(childF)).to.be.true;
          expect(rootNode2.isAncestorOf(childE)).to.be.true;
        });
      });
      describe('#toJSON()', function () {
        it('should return an object describing the node as JSON object', function () {
          rootNode2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package2@1.0', artifactId: 'comp-2', referrer: null});
          childA.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a', referrer: null});
          childB.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageB@1.0', artifactId: 'comp-b', referrer: null});
          childF.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageF@1.0', artifactId: 'comp-f', referrer: null});
          childG.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageG@1.0', artifactId: 'comp-g', referrer: null});
          childH.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageH@1.0', artifactId: 'comp-h', referrer: null});

          expect(rootNode2.toJSON()).to.deep.equal(
            {
              webpackageId: 'com.example.package2@1.0',
              artifactId: 'comp-2',
              children: [
                {
                  webpackageId: 'com.example.packageA@1.0',
                  artifactId: 'comp-a',
                  children: [
                    {
                      webpackageId: 'com.example.packageF@1.0',
                      artifactId: 'comp-f',
                      children: [],
                      usesExisting: [],
                      usedBy: []
                    }
                  ],
                  usesExisting: [],
                  usedBy: []
                },
                {
                  webpackageId: 'com.example.packageB@1.0',
                  artifactId: 'comp-b',
                  children: [
                    {
                      webpackageId: 'com.example.packageG@1.0',
                      artifactId: 'comp-g',
                      children: [],
                      usesExisting: [],
                      usedBy: []
                    },
                    {
                      webpackageId: 'com.example.packageH@1.0',
                      artifactId: 'comp-h',
                      children: [],
                      usesExisting: [],
                      usedBy: []
                    }
                  ],
                  usesExisting: [],
                  usedBy: []
                }
              ],
              usesExisting: [],
              usedBy: []
            }
          );
        });
        it('should include resources property in the JSON object', function () {
          rootNode2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package2@1.0', artifactId: 'comp-2', referrer: null});
          childA.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a', referrer: null});
          childA.data.resources = ['js/main.js', 'css/style.css'];
          childB.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageB@1.0', artifactId: 'comp-b', referrer: null});
          childB.data.resources = ['index.html'];
          childF.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageF@1.0', artifactId: 'comp-f', referrer: null});
          childF.data.resources = ['index.html'];
          childG.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageG@1.0', artifactId: 'comp-g', referrer: null});
          childH.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageH@1.0', artifactId: 'comp-h', referrer: null});

          expect(rootNode2.toJSON(true)).to.deep.equal(
            {
              webpackageId: 'com.example.package2@1.0',
              artifactId: 'comp-2',
              resources: [],
              children: [
                {
                  webpackageId: 'com.example.packageA@1.0',
                  artifactId: 'comp-a',
                  resources: ['js/main.js', 'css/style.css'],
                  children: [
                    {
                      webpackageId: 'com.example.packageF@1.0',
                      artifactId: 'comp-f',
                      resources: ['index.html'],
                      children: [],
                      usesExisting: [],
                      usedBy: []
                    }
                  ],
                  usesExisting: [],
                  usedBy: []
                },
                {
                  webpackageId: 'com.example.packageB@1.0',
                  artifactId: 'comp-b',
                  resources: ['index.html'],
                  children: [
                    {
                      webpackageId: 'com.example.packageG@1.0',
                      artifactId: 'comp-g',
                      resources: [],
                      children: [],
                      usesExisting: [],
                      usedBy: []
                    },
                    {
                      webpackageId: 'com.example.packageH@1.0',
                      artifactId: 'comp-h',
                      resources: [],
                      children: [],
                      usesExisting: [],
                      usedBy: []
                    }
                  ],
                  usesExisting: [],
                  usedBy: []
                }
              ],
              usesExisting: [],
              usedBy: []
            }
          );
        });
        it('should assign correct values to \'usesExisting\' and \'usedBy\' properties', function () {
          rootNode2.data = new DependencyMgr.DepReference({webpackageId: 'com.example.package2@1.0', artifactId: 'comp-2', referrer: null});
          childA.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a', referrer: null});
          childA.usesExisting = [childH];

          childB.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageB@1.0', artifactId: 'comp-b', referrer: null});

          childF.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageF@1.0', artifactId: 'comp-f', referrer: null});
          childF.usesExisting = [childG];

          childG.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageG@1.0', artifactId: 'comp-g', referrer: null});
          childG.usedBy = [childF];

          childH.data = new DependencyMgr.DepReference({webpackageId: 'com.example.packageH@1.0', artifactId: 'comp-h', referrer: null});
          childH.usedBy = [childA];

          expect(rootNode2.toJSON()).to.deep.equal(
            {
              webpackageId: 'com.example.package2@1.0',
              artifactId: 'comp-2',
              children: [
                {
                  webpackageId: 'com.example.packageA@1.0',
                  artifactId: 'comp-a',
                  children: [
                    {
                      webpackageId: 'com.example.packageF@1.0',
                      artifactId: 'comp-f',
                      children: [],
                      usesExisting: [{webpackageId: 'com.example.packageG@1.0', artifactId: 'comp-g'}],
                      usedBy: []
                    }
                  ],
                  usesExisting: [{webpackageId: 'com.example.packageH@1.0', artifactId: 'comp-h'}],
                  usedBy: []
                },
                {
                  webpackageId: 'com.example.packageB@1.0',
                  artifactId: 'comp-b',
                  children: [
                    {
                      webpackageId: 'com.example.packageG@1.0',
                      artifactId: 'comp-g',
                      children: [],
                      usesExisting: [],
                      usedBy: [{webpackageId: 'com.example.packageF@1.0', artifactId: 'comp-f'}]
                    },
                    {
                      webpackageId: 'com.example.packageH@1.0',
                      artifactId: 'comp-h',
                      children: [],
                      usesExisting: [],
                      usedBy: [{webpackageId: 'com.example.packageA@1.0', artifactId: 'comp-a'}]
                    }
                  ],
                  usesExisting: [],
                  usedBy: []
                }
              ],
              usesExisting: [],
              usedBy: []
            }
          );
        });
      });
    });
  });
})();
