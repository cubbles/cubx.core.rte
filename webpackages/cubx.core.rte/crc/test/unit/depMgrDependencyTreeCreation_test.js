(function () {
  'use strict';

  window.cubx.amd.define(
    [ 'CRC',
      'dependencyManager',
      'dependencyTree',
      'unit/utils/CubxNamespaceManager',
      'text!unit/dependencyResolution/rootDependencies.json',
      'text!unit/dependencyResolution/dependencyPackage1.json',
      'text!unit/dependencyResolution/dependencyPackage2.json',
      'text!unit/dependencyResolution/dependencyPackage3.json',
      'text!unit/dependencyResolution/dependencyPackage4.json',
      'text!unit/dependencyResolution/dependencyPackage5.json',
      'text!unit/dependencyResolution/dependencyPackage6.json'],
    function (CRC, DepMgr, DependencyTree, CubxNamespaceManager, rootDeps, pkg1, pkg2, pkg3, pkg4, pkg5, pkg6) {
      var depMgr;

      describe('DependencyMgr DependencyTree creation', function () {
        describe('#_buildRawDependencyTree()', function () {
          var stub;
          var rootDepList;

          before(function () {
            CubxNamespaceManager.resetNamespace(CRC);
            window.cubx.CRCInit.rootDependencies = JSON.parse(rootDeps);
            depMgr = CRC.getDependencyMgr();
            depMgr.init();
            rootDepList = depMgr._depList;

            stub = sinon.stub(depMgr, '_resolveDepReferenceDependencies', function (dep) {
              return new Promise(function (resolve, reject) {
                var requestedPkg;
                var dependencies = [];
                switch (dep.getId()) {
                  case 'package1@1.0.0/util1':
                    requestedPkg = JSON.parse(pkg1);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {webpackageId: 'package1@1.0.0', artifactId: 'util1'});
                    break;
                  case 'package2@1.0.0/util2':
                    requestedPkg = JSON.parse(pkg2);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {webpackageId: 'package2@1.0.0', artifactId: 'util2'});
                    break;
                  case 'package3@1.0.0/util3':
                    requestedPkg = JSON.parse(pkg3);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {webpackageId: 'package3@1.0.0', artifactId: 'util3'});
                    break;
                  case 'package4@1.0.0/util4':
                    requestedPkg = JSON.parse(pkg4);
                    break;
                  case 'package5@1.0.0/util5':
                    requestedPkg = JSON.parse(pkg5);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {webpackageId: 'package5@1.0.0', artifactId: 'util5'});
                    break;
                  case 'package6@1.0.0/util6':
                    requestedPkg = JSON.parse(pkg6);
                }
                window.setTimeout(function () {
                  resolve(dependencies);
                }, 200);
              });
            });
          });
          it('should return a promise', function () {
            expect(depMgr._buildRawDependencyTree(rootDepList)).to.be.an.instanceOf(Promise);
          });
          it('should resolve the returned promise with an instance of DependencyTree', function () {
            return depMgr._buildRawDependencyTree(rootDepList).then(function (result) {
              result.should.be.an.instanceOf(DependencyTree);
            });
          });
          it('should create a DependencyTree representing the raw dependency structure for given rootDependency list', function () {
            /**
             * Check if raw dependency tree has the following structure:
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
            return depMgr._buildRawDependencyTree(rootDepList).then(function (tree) {
              expect(tree._rootNodes).to.have.lengthOf(2);
              // check first (root) level of tree
              expect(tree._rootNodes[0].data.getId()).to.equal('package1@1.0.0/util1');
              expect(tree._rootNodes[1].data.getId()).to.equal('package2@1.0.0/util2');
              // check second level of tree
              expect(tree._rootNodes[0].children[0].data.getId()).to.equal('package3@1.0.0/util3');
              expect(tree._rootNodes[0].children[1].data.getId()).to.equal('package4@1.0.0/util4');
              expect(tree._rootNodes[1].children[0].data.getId()).to.equal('package3@1.0.0/util3');
              expect(tree._rootNodes[1].children[1].data.getId()).to.equal('package5@1.0.0/util5');
              // check third level of tree
              expect(tree._rootNodes[0].children[0].children[0].data.getId()).to.equal('package5@1.0.0/util5');
              expect(tree._rootNodes[1].children[0].children[0].data.getId()).to.equal('package5@1.0.0/util5');
              expect(tree._rootNodes[1].children[1].children[0].data.getId()).to.equal('package6@1.0.0/util6');
              // check 4th level of tree
              expect(tree._rootNodes[0].children[0].children[0].children[0].data.getId()).to.equal('package6@1.0.0/util6');
              expect(tree._rootNodes[1].children[0].children[0].children[0].data.getId()).to.equal('package6@1.0.0/util6');
            });
          });
          after(function () {
            stub.restore();
          });
        });
        describe('#_resolveDepReferenceDependencies()', function () {
          it('should return a promise', function () {
            // expect(depMgr._resolveDepReferenceDependencies(depMgr._depList[0])).to.be.an.instanceOf(Promise);
          });
        });
      });
    });
})();
