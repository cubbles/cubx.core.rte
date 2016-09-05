'use strict';
(function () {

  window.cubx.amd.define(['dependencyTree'], function (DependencyTree) {
    describe('DependencyTree', function () {
      var depTree;
      var rootNode1;
      var rootNode2;
      var childA;
      var childB;
      var childC;
      beforeEach(function () {
        // init tree and put some nodes in it
        depTree = new DependencyTree();
        rootNode1 = new DependencyTree.Node();
        rootNode1.data = {prop1: 'test', prop2: 1234};
        childC = new DependencyTree.Node();
        rootNode1.children = [childC];
        rootNode2 = new DependencyTree.Node();
        rootNode2.data = {prop1: 'test2', prop2: 4321};
        childA = new DependencyTree.Node();
        childB = new DependencyTree.Node();
        rootNode2.children = [childA, childB];
        depTree._rootNodes = [rootNode1, rootNode2];
      });
      describe('#insertNode()', function () {
        it('should return a new DependencyTree.Node instance holding given data.', function () {
          var node = depTree.insertNode({data: 'testData'});
          expect(node).to.be.an.instanceOf(DependencyTree.Node);
          node.should.have.deep.property('data', {data: 'testData'});
        });
        it('should append given node to rootNodes array if neighter parent nor before parameter is given.', function () {
          var node = depTree.insertNode({data: 'testData'});
          depTree._rootNodes.should.have.lengthOf(3);
          depTree._rootNodes[2].should.be.equal(node);
        });
        it('should insert given node to parents children array if parent and before parameter are given.', function () {
          var node = depTree.insertNode({data: 'testData'}, rootNode2, childB);
          rootNode2.children.should.have.lengthOf(3);
          rootNode2.children[1].should.equal(node);
          node.parent.should.be.equal(rootNode2);
        });
      });
      describe('#removeNode()', function () {
        it('should remove given node and all of it\'s descendants from tree', function () {
          depTree.removeNode(rootNode2);
          depTree._rootNodes.should.have.length(1);
          depTree._rootNodes[0].should.equal(rootNode1);
        });
      });
      describe('#traverseDF()', function () {
        it('should traverse the tree in depth first order and call the given callback with each visited node', function () {
          var callbackStub = sinon.stub();
          callbackStub.returns(true);
          depTree.traversDF(callbackStub);
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
          depTree.traverseBF(callbackStub);
          expect(callbackStub.getCall(0).calledWith(rootNode1)).to.be.true;
          expect(callbackStub.getCall(1).calledWith(childC)).to.be.true;
          expect(callbackStub.getCall(2).calledWith(rootNode2)).to.be.true;
          expect(callbackStub.callCount).to.equal(3);
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
      });
    });
  });
})();
