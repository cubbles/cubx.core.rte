/* globals describe, before, beforeEach, after, afterEach, it, expect */
(function () {
  'use strict';

  window.cubx.amd.define(
    ['CRC',
      'dependencyManager',
      'dependencyTree',
      'manifestConverter',
      'unit/utils/CubxNamespaceManager',
      'text!unit/dependencyResolution/rootDependencies.json',
      'text!unit/dependencyResolution/dependencyPackage1.json',
      'text!unit/dependencyResolution/dependencyPackage2.json',
      'text!unit/dependencyResolution/dependencyPackage3.json',
      'text!unit/dependencyResolution/dependencyPackage4.json',
      'text!unit/dependencyResolution/dependencyPackage5.json',
      'text!unit/dependencyResolution/dependencyPackage6.json'],
    function (CRC, DepMgr, DependencyTree, manifestConverter, CubxNamespaceManager, rootDeps, pkg1, pkg2, pkg3, pkg4, pkg5, pkg6) {
      var depMgr;
      var Node = DependencyTree.Node;
      var DepRef = DepMgr.DepReference;

      describe('DependencyMgr DependencyTree creation', function () {
        describe('#_buildRawDependencyTree()', function () {
          var stub;
          var rootDepList;
          var baseUrl;

          before(function () {
            CubxNamespaceManager.resetNamespace(CRC);
            window.cubx.CRCInit.rootDependencies = JSON.parse(rootDeps);
            depMgr = CRC.getDependencyMgr();
            depMgr.init();
            baseUrl = depMgr._baseUrl;

            stub = sinon.stub(depMgr, '_resolveDepReferenceDependencies', function (dep) {
              return new Promise(function (resolve, reject) {
                var requestedPkg;
                var dependencies = [];
                switch (dep.getId()) {
                  case 'package1@1.0.0/util1':
                    requestedPkg = JSON.parse(pkg1);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {
                        webpackageId: 'package1@1.0.0',
                        artifactId: 'util1'
                      });
                    break;
                  case 'package2@1.0.0/util2':
                    requestedPkg = JSON.parse(pkg2);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {
                        webpackageId: 'package2@1.0.0',
                        artifactId: 'util2'
                      });
                    break;
                  case 'package3@1.0.0/util3':
                    requestedPkg = JSON.parse(pkg3);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {
                        webpackageId: 'package3@1.0.0',
                        artifactId: 'util3'
                      });
                    break;
                  case 'package4@1.0.0/util4':
                    requestedPkg = JSON.parse(pkg4);
                    break;
                  case 'package5@1.0.0/util5':
                    requestedPkg = JSON.parse(pkg5);
                    dependencies = depMgr._createDepReferenceListFromArtifactDependencies(
                      requestedPkg.artifacts.utilities[0].dependencies, {
                        webpackageId: 'package5@1.0.0',
                        artifactId: 'util5'
                      });
                    break;
                  case 'package6@1.0.0/util6':
                    requestedPkg = JSON.parse(pkg6);
                }
                if (requestedPkg) {
                  window.setTimeout(function () {
                    resolve({dependencies: dependencies, resources: requestedPkg.artifacts.utilities[0].resources});
                  }, 200);
                } else if (!(dep instanceof DepMgr.DepReference)) {
                  throw new TypeError();
                } else {
                  window.setTimeout(function () {
                    reject({message: 'Error while resolving...'}); // eslint-disable-line prefer-promise-reject-errors
                  }, 100);
                }
              });
            });
          });
          beforeEach(function () {
            rootDepList = depMgr._depList;
          });
          after(function () {
            stub.restore();
            CubxNamespaceManager.resetNamespace(CRC);
          });
          it('should return a promise', function () {
            expect(depMgr._buildRawDependencyTree(rootDepList, baseUrl)).to.be.an.instanceOf(Promise);
          });
          it('should resolve the returned promise with an instance of DependencyTree', function () {
            return depMgr._buildRawDependencyTree(rootDepList, baseUrl).then(function (result) {
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
            return depMgr._buildRawDependencyTree(rootDepList, baseUrl).then(function (tree) {
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
          // it('should call _checkAndAddExcludesToDepReference() for each Node in raw DependencyTree', function () {
          //   var stub = sinon.stub(Object.getPrototypeOf(depMgr), '_checkAndAddExcludesToDepReference');
          //   return depMgr._buildRawDependencyTree(rootDepList, baseUrl).then(function () {
          //     expect(stub.callCount).to.be.equal(11);
          //     // check stub calls in breadth order traversal
          //     expect(stub.getCall(0).args[0].getId()).to.be.equal('package1@1.0.0/util1');
          //     expect(stub.getCall(1).args[0].getId()).to.be.equal('package2@1.0.0/util2');
          //     expect(stub.getCall(2).args[0].getId()).to.be.equal('package3@1.0.0/util3');
          //     expect(stub.getCall(3).args[0].getId()).to.be.equal('package4@1.0.0/util4');
          //     expect(stub.getCall(4).args[0].getId()).to.be.equal('package3@1.0.0/util3');
          //     expect(stub.getCall(5).args[0].getId()).to.be.equal('package5@1.0.0/util5');
          //     expect(stub.getCall(6).args[0].getId()).to.be.equal('package5@1.0.0/util5');
          //     expect(stub.getCall(7).args[0].getId()).to.be.equal('package5@1.0.0/util5');
          //     expect(stub.getCall(8).args[0].getId()).to.be.equal('package6@1.0.0/util6');
          //     expect(stub.getCall(9).args[0].getId()).to.be.equal('package6@1.0.0/util6');
          //     expect(stub.getCall(10).args[0].getId()).to.be.equal('package6@1.0.0/util6');
          //     stub.restore();
          //   });
          // });
          // it('should enrich each Node in DependencyTree with corresponding dependencyExcludes', function () {
          //   return depMgr._buildRawDependencyTree(rootDepList, baseUrl).then(function (tree) {
          //
          //   });
          // });
          describe('Error Handling', function () {
            it('should throw an TypeError if \'dependencies\' parameter is not an Array', function () {
              try {
                depMgr._buildRawDependencyTree({});
              } catch (error) {
                expect(error).to.be.an.instanceOf(TypeError);
              }
            });
            it('should reject returned promise if there is an TypeError resolving single dependencies', function () {
              rootDepList.push({webpackageId: 'typeError', artifactId: 'util'});
              return depMgr._buildRawDependencyTree(rootDepList, baseUrl).then(function (result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
              }, function (error) {
                error.should.be.an.instanceOf(TypeError);
              });
            });
            it('should reject returned promise if there is an error resolving single depenencies', function () {
              rootDepList.push({webpackageId: 'error', artifactId: 'util'});
              return depMgr._buildRawDependencyTree(rootDepList, baseUrl).then(function (result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
              }, function (error) {
                error.should.have.ownProperty('message', 'Error while resolving...');
              });
            });
          });
        });
        describe('#_checkAndAddExcludesForRootDependencies', function () {
          var node;
          beforeEach(function () {
            CubxNamespaceManager.resetNamespace(CRC);
            window.cubx.CRCInit.rootDependencies = JSON.parse(rootDeps);
            // add an dependencyExclude to rootDependencies
            window.cubx.CRCInit.rootDependencies[0].dependencyExcludes = [
              {webpackageId: 'packageToExclude', artifactId: 'artifactToExclude'}
            ];
            depMgr = CRC.getDependencyMgr();
            depMgr.init();
            node = new DependencyTree.Node();
            node.data = new DepMgr.DepReference({artifactId: 'util1', webpackageId: 'package1@1.0.0', referrer: null});
          });
          it('should return given DependencyTree.Node', function () {
            var result = depMgr._checkAndAddExcludesForRootDependencies(node);
            result.should.equal(node);
          });
          it('should add dependencyExcludes from corresponding rootDependency to given node', function () {
            depMgr._checkAndAddExcludesForRootDependencies(node);
            node.data.dependencyExcludes.should.eql([{
              webpackageId: 'packageToExclude',
              artifactId: 'artifactToExclude'
            }]);
          });
          describe('Error handling', function () {
            it('should throw an TypeError if given parameter is not of type DependencyTree.Node', function () {
              var errorThrown = false;
              try {
                depMgr._checkAndAddExcludesForRootDependencies({});
              } catch (error) {
                errorThrown = true;
                error.should.be.an.instanceOf(TypeError);
              } finally {
                expect(errorThrown).to.be.true;
              }
            });
          });
        });
        describe('#_checkAndAddExcludesToDepReference()', function () {
          var depRefItem;
          var manifest;

          beforeEach(function () {
            CubxNamespaceManager.resetNamespace(CRC);
            window.cubx.CRCInit.rootDependencies = JSON.parse(rootDeps);
            depMgr = CRC.getDependencyMgr();
            depMgr.init();
            manifest = {
              name: 'testPackage',
              groupId: 'com.test',
              version: '1.0.0',
              modelVersion: '9.1.0',
              docType: 'webpackage',
              artifacts: {
                utilities: [
                  {
                    artifactId: 'testArtifact',
                    dependencyExcludes: [
                      {webpackageId: 'exclude@1', artifactId: 'util1'},
                      {webpackageId: 'exclude@2', artifactId: 'util2', endpointId: 'main'}
                    ]
                  }
                ]
              }
            };
            depRefItem = new DepMgr.DepReference({
              webpackageId: 'com.test.testPackage@1.0.0',
              artifactId: 'testArtifact',
              referrer: null
            });
            depRefItem.dependencyExcludes = [{webpackageId: 'exludedPackage', artifactId: 'excludedArtifact'}];
          });
          it('should return the given DepReference instance', function () {
            expect(depMgr._checkAndAddExcludesToDepReference(depRefItem, manifest)).to.eql(depRefItem);
          });
          it('should append all dependencyExcludes defined in given manifest for corresponding artifact to excludes of given DepReference', function () {
            depMgr._checkAndAddExcludesToDepReference(depRefItem, manifest);
            depRefItem.should.have.ownProperty('dependencyExcludes');
            depRefItem.dependencyExcludes.should.be.eql([
              {webpackageId: 'exludedPackage', artifactId: 'excludedArtifact'},
              {webpackageId: 'exclude@1', artifactId: 'util1'},
              {webpackageId: 'exclude@2', artifactId: 'util2', endpointId: 'main'}
            ]);
          });
          describe('Error handling', function () {
            it('should throw an TypeError if first given parameter is not an instance of DepReference', function () {
              var errorThrown = false;
              try {
                depMgr._checkAndAddExcludesToDepReference({}, manifest);
              } catch (error) {
                errorThrown = true;
                error.should.be.an.instanceOf(TypeError);
              } finally {
                errorThrown.should.be.true;
              }
            });
            it('should throw an TypeError if second given parameter is not an object', function () {
              var errorThrown = false;
              try {
                depMgr._checkAndAddExcludesToDepReference(depRefItem, 123);
              } catch (error) {
                errorThrown = true;
                error.should.be.an.instanceOf(TypeError);
              } finally {
                errorThrown.should.be.true;
              }
            });
          });
        });
        describe('#_checkDepTreeForExcludes()', function () {
          var baseUrl;
          var depTree;
          var spy;
          var spy2;
          var stub;

          beforeEach(function () {
            CubxNamespaceManager.resetNamespace(CRC);
            window.cubx.CRCInit.rootDependencies = JSON.parse(rootDeps);
            // add an dependencyExclude to rootDependencies
            window.cubx.CRCInit.rootDependencies[0].dependencyExcludes = [
              {webpackageId: 'packageToExclude', artifactId: 'artifactToExclude'}
            ];
            depMgr = CRC.getDependencyMgr();
            depMgr.init();
            baseUrl = depMgr._baseUrl;

            // spy _checkAndAddExcludesToDepReference()
            spy = sinon.spy(Object.getPrototypeOf(depMgr), '_checkAndAddExcludesToDepReference');

            // spy _checkAndAddExcludesForRootDependencies()
            spy2 = sinon.spy(Object.getPrototypeOf(depMgr), '_checkAndAddExcludesForRootDependencies');

            // stub _getManifestForDepReference()
            stub = sinon.stub(Object.getPrototypeOf(depMgr), '_getManifestForDepReference', function (depRefItem, baseUrl) {
              var manifest;
              switch (depRefItem.webpackageId) {
                case 'package1@1.0.0':
                  manifest = JSON.parse(pkg1);
                  // add some excludes
                  manifest.artifacts.utilities[0].dependencyExcludes = [
                    {webpackageId: 'anotherPackageExclude', artifactId: 'anotherArtifactExclude'}
                  ];
                  break;
                case 'package3@1.0.0':
                  manifest = JSON.parse(pkg3);
                  // add some excludes
                  manifest.artifacts.utilities[0].dependencyExcludes = [
                    {webpackageId: 'packageToExclude', artifactId: 'artifactToExclude'},
                    {webpackageId: 'packageToExclude_2', artifactId: 'artifactToExclude_2'}
                  ];
                  break;
                case 'package4@1.0.0':
                  manifest = JSON.parse(pkg4);
                  break;
                case 'package5@1.0.0':
                  manifest = JSON.parse(pkg5);
              }
              return new Promise(function (resolve, reject) {
                window.setTimeout(function () {
                  if (manifest) {
                    resolve(manifest);
                  } else {
                    reject(); // eslint-disable-line prefer-promise-reject-errors
                  }
                }, 200);
              });
            });

            /**
             * Build the following tree:
             *
             *               package1@1.0.0/util1
             *                    /       \
             *                   /         \
             *    package3@1.0.0/util3    package4@1.0.0/util4
             *            |
             *            |
             *    package5@1.0.0/util5
             */
            depTree = new DependencyTree();
            var root = new DependencyTree.Node();
            root.data = new DepMgr.DepReference({webpackageId: 'package1@1.0.0', artifactId: 'util1', referrer: null});
            depTree.insertNode(root);
            var childA = new DependencyTree.Node();
            childA.data = new DepMgr.DepReference({
              webpackageId: 'package3@1.0.0',
              artifactId: 'util3',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childA, root);
            var childB = new DependencyTree.Node();
            childB.data = new DepMgr.DepReference({
              webpackageId: 'package4@1.0.0',
              artifactId: 'util4',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childB, root);
            var childA1 = new DependencyTree.Node();
            childA1.data = new DepMgr.DepReference({
              webpackageId: 'package5@1.0.0',
              artifactId: 'util5',
              referrer: {webpackageId: 'package4@1.0.0', artifactId: 'util4'}
            });
            depTree.insertNode(childA1, childA);
          });
          afterEach(function () {
            spy.restore();
            spy2.restore();
            stub.restore();
            CubxNamespaceManager.resetNamespace(CRC);
          });
          it('should return promise which will be resolved with given DependencyTree', function () {
            var promise = depMgr._checkDepTreeForExcludes(depTree, baseUrl);
            expect(promise).to.be.an.instanceOf(Promise);
            return promise.then(function (result) {
              result.should.be.an.instanceof(DependencyTree);
            });
          });
          it('should call _checkAndAddExcludesToDepReference() for each Node in DependencyTree and assign dependencyExcludes if there are any', function () {
            return depMgr._checkDepTreeForExcludes(depTree, baseUrl).then(function () {
              expect(spy.callCount).to.eql(4);
              expect(spy.getCall(0).args[0].getId()).to.equal('package1@1.0.0/util1');
              expect(spy.getCall(1).args[0].getId()).to.equal('package3@1.0.0/util3');
              expect(spy.getCall(2).args[0].getId()).to.equal('package4@1.0.0/util4');
              expect(spy.getCall(3).args[0].getId()).to.equal('package5@1.0.0/util5');
              depTree._rootNodes[0].data.should.have.ownProperty('dependencyExcludes');
              depTree._rootNodes[0].data.dependencyExcludes.should.eql([
                {webpackageId: 'packageToExclude', artifactId: 'artifactToExclude'},
                {webpackageId: 'anotherPackageExclude', artifactId: 'anotherArtifactExclude'}
              ]);
              depTree._rootNodes[0].children[0].data.should.have.ownProperty('dependencyExcludes');
              depTree._rootNodes[0].children[0].data.dependencyExcludes.should.eql([
                {webpackageId: 'packageToExclude', artifactId: 'artifactToExclude'},
                {webpackageId: 'packageToExclude_2', artifactId: 'artifactToExclude_2'}
              ]);
              // console.log(depTree);
            });
          });
          it('should call _checkAndAddExcludesForRootDependencies() for each rootNode in DependencyTree', function () {
            return depMgr._checkDepTreeForExcludes(depTree, baseUrl).then(function () {
              expect(spy2.callCount).to.eql(1);
              expect(spy2.getCall(0).args[0]).to.equal(depTree._rootNodes[0]);
            });
          });
          describe('Error handling', function () {
            it('should throw an TypeError if first parameter is not an instance of DependencyMgr.DependencyTree', function () {
              var errorThrown = false;
              try {
                depMgr._checkDepTreeForExcludes({}, 'http://www.example.de/test');
              } catch (error) {
                errorThrown = true;
                error.should.be.an.instanceOf(TypeError);
              } finally {
                expect(errorThrown).to.be.true;
              }
            });
            it('should throw an TypeError if second parameter is not a string', function () {
              var errorThrown = false;
              try {
                depMgr._checkDepTreeForExcludes(new DependencyTree(), 123);
              } catch (error) {
                errorThrown = true;
                error.should.be.an.instanceOf(TypeError);
              } finally {
                expect(errorThrown).to.be.true;
              }
            });
          });
        });
        describe('#_resolveDepReferenceDependencies()', function () {
          var stub;
          var convertManifestStub;
          var depRefItem;
          var baseUrl;

          before(function () {
            CubxNamespaceManager.resetNamespace(CRC);
            window.cubx.CRCInit.rootDependencies = JSON.parse(rootDeps);
            depMgr = CRC.getDependencyMgr();
            depMgr.init();
            baseUrl = depMgr._baseUrl;

            // mock _fetchManifest method
            stub = sinon.stub(depMgr, '_fetchManifest', function (url) {
              return new Promise(function (resolve, reject) {
                var response = {};
                if (url.indexOf('package1@1.0.0') >= 0) {
                  response.data = JSON.parse(pkg1);
                }
                if (url.indexOf('package2@1.0.0') >= 0) {
                  response.data = JSON.parse(pkg2);
                }
                if (url.indexOf('package3@1.0.0') >= 0) {
                  response.data = JSON.parse(pkg3);
                }
                if (url.indexOf('package4@1.0.0') >= 0) {
                  response.data = JSON.parse(pkg4);
                }
                if (url.indexOf('package5@1.0.0') >= 0) {
                  response.data = JSON.parse(pkg5);
                }
                if (url.indexOf('package6@1.0.0') >= 0) {
                  response.data = JSON.parse(pkg6);
                }
                if (response.hasOwnProperty('data')) {
                  window.setTimeout(function () {
                    resolve(response);
                  }, 200);
                } else {
                  window.setTimeout(function () {
                    reject({message: 'Error while requesting ' + url}); // eslint-disable-line prefer-promise-reject-errors
                  }, 100);
                }
              });
            });

            // mock ManifestConverter's convert method to return just a copy of given data
            convertManifestStub = sinon.stub(Object.getPrototypeOf(manifestConverter), 'convert', function (data) {
              return JSON.parse(JSON.stringify(data));
            });
          });
          beforeEach(function () {
            depMgr._responseCache.invalidate();
            depRefItem = new DepMgr.DepReference({webpackageId: 'package1@1.0.0', artifactId: 'util1', referrer: null});
            stub.reset();
            convertManifestStub.reset();
          });
          after(function () {
            stub.restore();
            convertManifestStub.restore();
            CubxNamespaceManager.resetNamespace(CRC);
          });
          it('should return a promise', function () {
            expect(depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl)).to.be.an.instanceOf(Promise);
          });
          it('should resolve the returned promise with an object containing an array of the dependencies of given depRef item and all the resources for the given depRefItem', function () {
            return depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl).then(function (result) {
              result.should.be.an.instanceOf(Object);
              result.should.have.property('resources');
              result.should.have.property('dependencies');
              result.resources.should.eql(['js/pack1.js', 'css/pack1.css']);
              result.dependencies.should.have.lengthOf(2);
              result.dependencies[0].should.be.an.instanceOf(DepMgr.DepReference);
              result.dependencies[1].should.be.an.instanceOf(DepMgr.DepReference);
              expect(result.dependencies[0].getId()).to.equal('package3@1.0.0/util3');
              expect(result.dependencies[1].getId()).to.equal('package4@1.0.0/util4');
            });
          });
          it('should use inline manifest from given dependency if there is any', function () {
            depRefItem.manifest = JSON.parse(pkg1);
            return depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl).then(function (result) {
              expect(stub.callCount).to.equal(0);
              expect(convertManifestStub.callCount).to.equal(1);
              expect(convertManifestStub.calledWith(depRefItem.manifest)).to.be.true;
              result.dependencies.should.have.lengthOf(2);
              result.dependencies[0].should.be.an.instanceOf(DepMgr.DepReference);
              result.dependencies[1].should.be.an.instanceOf(DepMgr.DepReference);
              expect(result.dependencies[0].getId()).to.equal('package3@1.0.0/util3');
              expect(result.dependencies[1].getId()).to.equal('package4@1.0.0/util4');
            });
          });
          it('should use manifest from responseCache if there is already one for given webpackageId', function () {
            depMgr._responseCache.addItem(depRefItem.webpackageId, JSON.parse(pkg1));
            return depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl).then(function (result) {
              expect(stub.callCount).to.equal(0);
              result.dependencies.should.have.lengthOf(2);
              result.dependencies[0].should.be.an.instanceOf(DepMgr.DepReference);
              result.dependencies[1].should.be.an.instanceOf(DepMgr.DepReference);
              expect(result.dependencies[0].getId()).to.equal('package3@1.0.0/util3');
              expect(result.dependencies[1].getId()).to.equal('package4@1.0.0/util4');
            });
          });
          it('should add inline or requested manifest to response cache if there is no entry for corresponding webpackageId', function () {
            return depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl).then(function (result) {
              expect(depMgr._responseCache.get(depRefItem.webpackageId)).to.eql(JSON.parse(pkg1));
            });
          });
          it('should request manifest files from given baseUrl', function () {
            var baseUrl = 'https://www.example.test/';
            return depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl).then(function (result) {
              expect(stub.calledWith(baseUrl + depRefItem.webpackageId + '/manifest.webpackage'));
            });
          });
          it('should append \'/\' to baseUrl if not present', function () {
            var baseUrl = 'https://www.example.test';
            return depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl).then(function (result) {
              expect(stub.calledWith(baseUrl + '/' + depRefItem.webpackageId + '/manifest.webpackage'));
            });
          });
          describe('Error handling', function () {
            it('should throw an TypeError if parameter baseUrl is not given or a not of type string', function () {
              try {
                depMgr._resolveDepReferenceDependencies(depRefItem, {});
              } catch (error) {
                expect(error).to.be.an.instanceOf(TypeError);
              }
            });
            it('should throw an TypeError if parameter depReference is not an instance of DependencyMgr.DepReference', function () {
              try {
                depMgr._resolveDepReferenceDependencies({}, baseUrl);
              } catch (error) {
                expect(error).to.be.an.instanceOf(TypeError);
              }
            });
            it('should reject returned promise if there is an error while fetching the manifest', function () {
              depRefItem.webpackageId = 'error';
              return depMgr._resolveDepReferenceDependencies(depRefItem, baseUrl).then(function (result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
              }, function (error) {
                error.should.have.ownProperty('message');
              });
            });
          });
        });
        describe('#_logDependencyConflicts()', function () {
          var depTree;
          beforeEach(function () {
            /**
             * Build the following tree:
             *
             *               package1@1.0.0/util1
             *                    /       \
             *                   /         \
             *    package3@1.0.0/util3    package5@2.0.0/util5
             *            |
             *            |
             *    package5@1.0.0/util5
             */
            depTree = new DependencyTree();
            var root = new DependencyTree.Node();
            root.data = new DepMgr.DepReference({webpackageId: 'package1@1.0.0', artifactId: 'util1', referrer: null});
            depTree.insertNode(root);
            var childA = new DependencyTree.Node();
            childA.data = new DepMgr.DepReference({
              webpackageId: 'package3@1.0.0',
              artifactId: 'util3',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childA, root);
            var childB = new DependencyTree.Node();
            childB.data = new DepMgr.DepReference({
              webpackageId: 'package5@2.0.0',
              artifactId: 'util5',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childB, root);
            var childA1 = new DependencyTree.Node();
            childA1.data = new DepMgr.DepReference({
              webpackageId: 'package5@1.0.0',
              artifactId: 'util5',
              referrer: {webpackageId: 'package4@1.0.0', artifactId: 'util4'}
            });
            depTree.insertNode(childA1, childA);
          });
          it('should create an warning log for each conflicted artifact', function () {
            depMgr = CRC.getDependencyMgr();
            var spy = sinon.spy(console, 'warn');
            depMgr._logDependencyConflicts(depTree);
            expect(spy.calledOnce);
            spy.reset();
          });
        });
        describe('#_determineTypeOfConflict()', function () {
          var conflicts;
          var depTree;

          beforeEach(function () {
            depTree = new DependencyTree();
            var nodeA = new Node();
            nodeA.data = new DepRef({ webpackageId: 'packageA@1.0', artifactId: 'artifact_A', referrer: null });
            var nodeB = new Node();
            nodeB.data = new DepRef({ webpackageId: 'packageA@2.0', artifactId: 'artifact_A', referrer: null });
            var nodeC = new Node();
            nodeC.data = new DepRef({ webpackageId: 'packageB@1.0', artifactId: 'artifact_A', referrer: null });
            depTree.insertNode(nodeA);
            depTree.insertNode(nodeB);
            depTree.insertNode(nodeC);

            // create three types of conflicts
            conflicts = [
              // version conflict
              {
                artifactId: 'artifact_A',
                nodes: [nodeA, nodeB]
              },
              // naming conflict
              {
                artifactId: 'artifact_A',
                nodes: [nodeA, nodeC]
              },
              // mixed conflict
              {
                artifactId: 'artifact_A',
                nodes: [nodeA, nodeB, nodeC]
              }
            ];
          });

          it('should identify version conflicts correctly', function () {
            var type = depTree._determineTypeOfConflict(conflicts[0]);
            type.should.eql(DependencyTree.conflictTypes.VERSION);
          });
          it('should identify naming conflicts correctly', function () {
            var type = depTree._determineTypeOfConflict(conflicts[1]);
            type.should.eql(DependencyTree.conflictTypes.NAME);
          });
          it('should identify mixed conflicts correctly', function () {
            var type = depTree._determineTypeOfConflict(conflicts[2]);
            type.should.eql(DependencyTree.conflictTypes.MIXED);
          });
        });
        describe.skip('#_extractVersionConflictsFromMixedConflict()', function () {
          var conflict;
          var depTree;
          var nodeA;
          var nodeB;
          var nodeC;
          var nodeD;
          var nodeE;

          beforeEach(function () {
            depTree = new DependencyTree();
            nodeA = new Node();
            nodeA.data = new DepRef({ webpackageId: 'packageA@1.0', artifactId: 'artifact_A', referrer: null });
            nodeB = new Node();
            nodeB.data = new DepRef({ webpackageId: 'packageA@2.0', artifactId: 'artifact_A', referrer: null });
            nodeC = new Node();
            nodeC.data = new DepRef({ webpackageId: 'packageB@1.0', artifactId: 'artifact_A', referrer: null });
            nodeD = new Node();
            nodeD.data = new DepRef({ webpackageId: 'packageB@2.0', artifcatId: 'artifact_A', referrer: null });
            nodeE = new Node();
            nodeE.data = new DepRef({ webpackageId: 'packageC@1.0', artifcatId: 'artifact_A', referrer: null });
            depTree.insertNode(nodeA);
            depTree.insertNode(nodeB);
            depTree.insertNode(nodeC);
            depTree.insertNode(nodeD);
            depTree.insertNode(nodeE);

            // create mixed conflict containing 2 version conflicts and one name conflict
            conflict = {
              artifactId: 'artifact_A',
              nodes: [nodeA, nodeB, nodeC, nodeD, nodeE]
            };
          });
          it('should extract version conflicts out of given mixed conflict', function () {
            var extractedConflicts = depTree._extractVersionConflictsFromMixedConflict(conflict);
            extractedConflicts.should.be.an('array');
            extractedConflicts.should.have.lengthOf(2);
            extractedConflicts.should.have.members(
              {
                artifactId: 'artifact_A',
                nodes: [nodeA, nodeB]
              },
              {
                artifactId: 'artifact_A',
                nodes: [nodeC, nodeD]
              }
            )
          });
        });
        describe('#determineArtifactConflicts()', function () {
          var depTree;

          beforeEach(function () {
            /**
             * Provide example tree with one version conflict (package5@2.0.0/util5 <--> package5@1.0.0/util5) and one
             * naming conflict ()
             * Build the following tree:
             *
             *               package1@1.0.0/util1                      packageA@1.0.0/artifactA
             *                    /       \                                        |
             *                   /         \                                       |
             *    package3@1.0.0/my-comp    package5@2.0.0/util5        packageB@2.0.0/my-comp
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

            var childA1 = new Node();
            childA1.data = new DepRef({
              webpackageId: 'package3@1.0.0',
              artifactId: 'my-comp',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childA1, rootA);

            var childA2 = new Node();
            childA2.data = new DepRef({
              webpackageId: 'package5@2.0.0',
              artifactId: 'util5',
              referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}
            });
            depTree.insertNode(childA2, rootA);

            var childA11 = new Node();
            childA11.data = new DepRef({
              webpackageId: 'package5@1.0.0',
              artifactId: 'util5',
              referrer: {webpackageId: 'package3@1.0.0', artifactId: 'my-comp'}
            });
            depTree.insertNode(childA11, childA1);

            var childB1 = new Node();
            childB1.data = new DepRef({
              webpackageId: 'packageB@2.0.0',
              artifactId: 'my-comp',
              referrer: {webpackageId: 'packageA@1.0.0', artifactId: 'artifactA'}
            });
            depTree.insertNode(childB1, rootB);
          });

          it('should determine naming conflicts and store them on internal property _nameConflicts', function () {
            depTree.determineArtifactConflicts();
            depTree.should.have.property('_nameConflicts');
            depTree._nameConflicts.should.be.an('array');
            depTree._nameConflicts.should.have.lengthOf(1);
          });
          it('should determine version conflicts and store them on internal property _versionConflicts', function () {
            depTree.determineArtifactConflicts();
            depTree.should.have.property('_versionConflicts');
            depTree._versionConflicts.should.be.an('array');
            depTree._versionConflicts.should.have.lengthOf(1);
          });
        });
      });
    });
})();
