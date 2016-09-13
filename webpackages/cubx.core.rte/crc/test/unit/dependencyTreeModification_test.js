/* globals describe, before, beforeEach, after, afterEach, it, expect*/
'use strict';
(function () {
  window.cubx.amd.define(['dependencyTree', 'dependencyManager'], function (DependencyTree, DependencyMgr) {
    var depTree;

    beforeEach(function () {
      depTree = new DependencyTree();
    });
    describe('DependencyTree Modification', function () {
      describe('#removeDuplicates()', function () {
        it('should return the DependencyTree itself', function () {
          expect(depTree.removeDuplicates()).to.be.an.instanceOf(DependencyTree);
        });
      });
    });
  });
})();
