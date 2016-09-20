/*globals describe, before, beforeEach, it, after, afterEach, sinon, expect */
window.cubx.amd.define([ 'CRC',
    'dependencyManager',
    'jqueryLoader',
    'text!unit/dependencyResolution/rootDependencies.json',
    'text!unit/dependencyResolution/dependencyPackage1.json',
    'text!unit/dependencyResolution/dependencyPackage2.json',
    'text!unit/dependencyResolution/dependencyPackage3.json',
    'text!unit/dependencyResolution/dependencyPackage4.json',
    'text!unit/dependencyResolution/dependencyPackage5.json',
    'text!unit/dependencyResolution/dependencyPackage6.json',
    'unit/utils/CubxNamespaceManager'
  ],
  function (CRC, DepMgr, $, rootDependencies, pkg1, pkg2, pkg3, pkg4, pkg5, pkg6, CubxNamespaceManager) {
    'use strict';

    var depMgr;

    describe('DepMgrDependencyResolution', function () {
      before(function () {
        CubxNamespaceManager.resetNamespace(CRC);
        depMgr = CRC.getDependencyMgr();
        depMgr.init();
      });
      after(function () {
        CubxNamespaceManager.resetNamespace();
      });
      describe('#_calculateDependencyList()', function () {
        var resourceList;
        before(function () {
          resourceList = [
            {
              path: 'test1.min.js',
              type: 'javascript'
            },
            {
              path: 'test2.css',
              type: 'stylesheet'
            },
            {
              path: 'test3.min.css',
              type: 'stylesheet'
            },
            {
              path: 'test4.html',
              type: 'htmlImport'
            }
          ];

          sinon.stub(depMgr, '_calculateResourceList').returns(resourceList);
        });

        it('should call given callback with resourceList as first parameter', function (done) {
          depMgr._calculateDependencyList(function (list) {
            expect(list).to.eql(resourceList);
            done();
          });
        });

        it('should throw an TypeError if no callback is provided', function () {
          expect(function () {
            depMgr._calculateDependencyList();
          }).to.throw(TypeError);
        });
        after(function () {
          // depMgr._resolveDependencies.restore();
          depMgr._calculateResourceList.restore();
          // depMgr._getManifestFiles_ret.restore();
        });
      });

      describe('#_createResourceFromItem()', function () {
        var item = {
          prod: 'test.min.js',
          dev: 'test.js'
        };
        var id = 'package1-1.0.0/my-artifact';
        var stringItem = 'test.css';
        before(function () {
          depMgr._baseUrl = '';
        });
        it('should throw TypeError', function () {
          expect(depMgr._createResourceFromItem).to.throw(TypeError);
        });
        it('should create a new resource containing file and type for item given as object', function () {
          var resource = depMgr._createResourceFromItem(id, item, 'prod');
          expect(resource).to.have.property('path');
          expect(resource).to.have.property('type');
          expect(resource.path).to.equal(id + '/' + item.prod);
          expect(resource.type).to.equal('javascript');
        });
        it('should create a new resource containing file and type for item given as string', function () {
          var resource = depMgr._createResourceFromItem(id, stringItem, 'prod');
          expect(resource).to.have.property('path');
          expect(resource).to.have.property('type');
          expect(resource.path).to.equal(id + '/' + stringItem);
          expect(resource.type).to.equal('stylesheet');
        });
        it('should use "prod" file path if parameter "runtimeMode" has value "prod"', function () {
          var resource = depMgr._createResourceFromItem(id, item, 'prod');
          expect(resource.path).to.equal(id + '/' + item.prod);
        });
        it('should use "dev" file path if parameter "runtimeMode" has value "dev"', function () {
          var resource = depMgr._createResourceFromItem(id, item, 'dev');
          expect(resource.path).to.equal(id + '/' + item.dev);
        });
        it('should add the baseUrl as prefix for all files if some url is given', function () {
          depMgr._baseUrl = 'http://www.webblebase.net/';
          var resource = depMgr._createResourceFromItem(id, item, 'prod');
          resource.should.have.property('path', depMgr._baseUrl + id + '/' + item.prod);
          resource.should.have.property('type', 'javascript');
          depMgr._baseUrl = '';
        });

        describe('resources with absolute url', function () {
          describe('allowAbsoluteResourceUrls is false', function () {
            var consoleWarnSpy;
            beforeEach(function () {
              consoleWarnSpy = sinon.spy(console, 'warn');
            });
            afterEach(function () {
              console.warn.restore();
            });
            it('should not create a new resource for item given as string using an absolute url, since allowAbsoluteResourceUrls = false', function () {
              var absoluteUrlString = 'blob:http://xxxxxx?type=js';
              var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
              expect(resource).to.be.undefined;
              consoleWarnSpy.should.be.calledOnce;
              consoleWarnSpy.should.be.calledWith('The following resource can not be loaded since the use of absolute urls is not allowed by default: blob:http://xxxxxx?type=js');
            });
          });

          describe('allowAbsoluteResourceUrls is true', function () {
            beforeEach(function () {
              window.cubx.CRCInit.allowAbsoluteResourceUrls = true;
            });
            afterEach(function () {
              window.cubx.CRCInit.allowAbsoluteResourceUrls = false;
            });

            it('should create a new resource of type "javascript" for item given as string using an absolute url', function () {
              var absoluteUrlString = 'blob:http://xxxxxx?type=js';
              var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
              resource.should.have.property('path', 'blob:http://xxxxxx');
              resource.should.have.property('type', 'javascript');
            });
            it('should create a new resource of type "htmlImport" for item given as string using an absolute url', function () {
              var absoluteUrlString = 'blob:http://xxxxxx?type=html';
              var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
              resource.should.have.property('path', 'blob:http://xxxxxx');
              resource.should.have.property('type', 'htmlImport');
            });
            it('should create a new resource of type "stylesheet" for item given as string using an absolute url', function () {
              var absoluteUrlString = 'blob:http://xxxxxx?type=css';
              var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
              resource.should.have.property('path', 'blob:http://xxxxxx');
              resource.should.have.property('type', 'stylesheet');
            });
            describe('not create resource', function () {
              var spyConsoleWarn;
              beforeEach(function () {
                spyConsoleWarn = sinon.spy(console, 'warn');
              });
              afterEach(function () {
                console.warn.restore();
              });
              it('should not create a new resource and return undefined, if the type valu is unkown', function () {
                var absoluteUrlString = 'blob:http://xxxxxx?type=xxx';
                var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
                expect(resource).to.be.undefined;
                spyConsoleWarn.calledOnce;
                spyConsoleWarn.calledWith('The following resource will be ignored, because the type of the resource is unkown. (blob:http://xxxxxx?type=xxx)');
              });
              it('should not create a new resource and return undefined, if the type parameter missed', function () {
                var absoluteUrlString = 'blob:http://xxxxxx?yyy=xxx';
                var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
                expect(resource).to.be.undefined;
                spyConsoleWarn.calledOnce;
                spyConsoleWarn.calledWith('The following resource will be ignored, because the type of the resource is unkown. (blob:http://xxxxxx?yyy=xxx)');
              });
              it('should not create a new resource and return undefined, if no paramter exists', function () {
                var absoluteUrlString = 'blob:http://xxxxxx';
                var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
                expect(resource).to.be.undefined;
                spyConsoleWarn.calledOnce;
                spyConsoleWarn.calledWith('The following resource will be ignored, because the type of the resource is unkown. (blob:http://xxxxxx)');
              });
            });
          });
        });
      });

      describe('#_determineResourceType()', function () {
        it('should associate fileEnding ".js" with type "javascript"', function () {
          var fileName = 'test.min.js';
          var erg = depMgr._determineResourceType(fileName);
          erg.fileType.name.should.eql('javascript');
        });
        it('should associate fileEnding ".css" with type "stylesheet"', function () {
          var fileName = 'test.min.css';
          var erg = depMgr._determineResourceType(fileName);
          erg.fileType.name.should.eql('stylesheet');
        });
        it('should associate fileEnding ".html" and ".htm" with type "htmlImport"', function () {
          var fileName = 'import.html';
          var erg = depMgr._determineResourceType(fileName);
          erg.fileType.name.should.eql('htmlImport');
          fileName = 'import.htm';
          erg = depMgr._determineResourceType(fileName);
          erg.fileType.name.should.eql('htmlImport');
        });
        it('should associate type parameter "js" with type "javascript"', function () {
          var fileName = 'blob:http://xxxxxx?type=js';
          var erg = depMgr._determineResourceType(fileName);
          erg.fileType.name.should.eql('javascript');
          erg.fileName.should.equal('blob:http://xxxxxx');
        });
        it('should associate type parameter "html" with type "htmlImport"', function () {
          var fileName = 'blob:http://xxxxxx?type=html';
          var erg = depMgr._determineResourceType(fileName);
          erg.fileType.name.should.eql('htmlImport');
          erg.fileName.should.equal('blob:http://xxxxxx');
        });
        it('should associate type parameter "css" with type "stylesheet"', function () {
          var fileName = 'blob:http://xxxxxx?type=css';
          var erg = depMgr._determineResourceType(fileName);
          erg.fileType.name.should.eql('stylesheet');
          erg.fileName.should.equal('blob:http://xxxxxx');
        });
        it('should associate type parameter "js" with type "javascript"', function () {
          var fileName = 'blob:http://xxxxxx?type=xxx';
          var erg = depMgr._determineResourceType(fileName);
          erg.should.have.property('fileType', undefined);
          erg.fileName.should.equal('blob:http://xxxxxx');
        });
        it('should associate type parameter "js" with type "javascript"', function () {
          var fileName = 'blob:http://xxxxxx';
          var erg = depMgr._determineResourceType(fileName);
          erg.should.have.property('fileType', undefined);
          erg.fileName.should.equal('blob:http://xxxxxx');
        });
        it('should associate type parameter "js" with type "javascript"', function () {
          var fileName = 'blob:http://xxxxxx?yyy';
          var erg = depMgr._determineResourceType(fileName);
          erg.should.have.property('fileType', undefined);
          erg.fileName.should.equal('blob:http://xxxxxx?yyy');
        });
      });

      describe('#_resolveDependencies()', function () {
        var expectedDepList = [
          'package6@1.0.0',
          'package5@1.0.0',
          'package3@1.0.0',
          'package4@1.0.0',
          'package1@1.0.0',
          'package2@1.0.0'
        ];
        before(function () {
          // mock Dependency Json fetching
          sinon.stub(depMgr, '_resolveDepReference', function (depReference) {
            var deferred = $.Deferred();
            var data = {
              item: depReference
            };
            if (depReference.webpackageId === 'package1@1.0.0') {
              data.data = depMgr._extractArtifact(depReference, JSON.parse(pkg1));
            } else if (depReference.webpackageId === 'package2@1.0.0') {
              data.data = depMgr._extractArtifact(depReference, JSON.parse(pkg2));
            } else if (depReference.webpackageId === 'package3@1.0.0') {
              data.data = depMgr._extractArtifact(depReference, JSON.parse(pkg3));
            } else if (depReference.webpackageId === 'package4@1.0.0') {
              data.data = depMgr._extractArtifact(depReference, JSON.parse(pkg4));
            } else if (depReference.webpackageId === 'package5@1.0.0') {
              data.data = depMgr._extractArtifact(depReference, JSON.parse(pkg5));
            } else if (depReference.webpackageId === 'package6@1.0.0') {
              data.data = depMgr._extractArtifact(depReference, JSON.parse(pkg6));
            }
            // console.log(depReference.webpackageId + ': ' + JSON.stringify(data.data))
            // simulate a request duration of 500 ms for each request
            window.setTimeout(function () {
              deferred.resolve(data);
            }, 50);
            return deferred.promise();
          });
        });
        beforeEach(function () {
          var depListObj = JSON.parse(rootDependencies);
          window.cubx.CRCInit.rootDependencies = depListObj;
          window.cubx.CRCInit.webpackageBaseUrl = 'http://test.org';
          depMgr.init();
        });

        it('should return list of all dependencies', function (done) {
          var rootDepReferences = depMgr._depList;
          depMgr._resolveDependencies(function (resolvedDependencies) {
            for (var i = 0; i < expectedDepList.length; i++) {
              resolvedDependencies[ i ].should.have.property('webpackageId', expectedDepList[ i ]);
            }
            done();
          }, rootDepReferences);
        });
        it('should set resources array to each created DepReference item', function (done) {
          var rootDepReferences = depMgr._depList;
          depMgr._resolveDependencies(function (resolvedDependencies) {
            // console.log(depMgr._depList);
            resolvedDependencies[ 0 ].should.have.property('resources');
            resolvedDependencies[ 0 ].resources.should.eql(JSON.parse(pkg6).artifacts.utilities[ 0 ].resources);
            resolvedDependencies[ 1 ].should.have.property('resources');
            resolvedDependencies[ 1 ].resources.should.eql(JSON.parse(pkg5).artifacts.utilities[ 0 ].resources);
            resolvedDependencies[ 2 ].should.have.property('resources');
            resolvedDependencies[ 2 ].resources.should.eql(JSON.parse(pkg3).artifacts.utilities[ 0 ].resources);
            resolvedDependencies[ 3 ].should.have.property('resources');
            resolvedDependencies[ 3 ].resources.should.eql(JSON.parse(pkg4).artifacts.utilities[ 0 ].resources);
            resolvedDependencies[ 4 ].should.have.property('resources');
            resolvedDependencies[ 4 ].resources.should.eql(JSON.parse(pkg1).artifacts.utilities[ 0 ].resources);
            resolvedDependencies[ 5 ].should.have.property('resources');
            resolvedDependencies[ 5 ].resources.should.eql(JSON.parse(pkg2).artifacts.utilities[ 0 ].resources);
            done();
          }, rootDepReferences);
        });
        it('should set referrers correctly to each created and resolved DepReference item', function (done) {
          var rootDependencies = depMgr._depList;
          depMgr._resolveDependencies(function (resolvedDependencies) {
            resolvedDependencies.some(function (dep) {
              dep.should.have.property('referrer');
            });
            expect(resolvedDependencies[0].referrer).to.deep.include({webpackageId: 'package5@1.0.0', artifactId: 'util5'});
            expect(resolvedDependencies[0].referrer).to.have.lengthOf(1);
            expect(resolvedDependencies[1].referrer).to.deep.include({webpackageId: 'package3@1.0.0', artifactId: 'util3'});
            expect(resolvedDependencies[1].referrer).to.deep.include({webpackageId: 'package2@1.0.0', artifactId: 'util2'});
            expect(resolvedDependencies[1].referrer).to.have.lengthOf(2);
            expect(resolvedDependencies[2].referrer).to.deep.include({webpackageId: 'package1@1.0.0', artifactId: 'util1'});
            expect(resolvedDependencies[2].referrer).to.deep.include({webpackageId: 'package2@1.0.0', artifactId: 'util2'});
            expect(resolvedDependencies[2].referrer).to.have.lengthOf(2);
            expect(resolvedDependencies[3].referrer).to.deep.include({webpackageId: 'package1@1.0.0', artifactId: 'util1'});
            expect(resolvedDependencies[3].referrer).to.have.lengthOf(1);
            expect(resolvedDependencies[4].referrer).to.include('root');
            expect(resolvedDependencies[4].referrer).to.have.lengthOf(1);
            expect(resolvedDependencies[5].referrer).to.include('root');
            expect(resolvedDependencies[5].referrer).to.have.lengthOf(1);
            done();
          }, rootDependencies);
        });
        afterEach(function () {
          depMgr._depList = null;
        });
        after(function () {
          depMgr._resolveDepReference.restore();
          depMgr._depJson = null;
        });
      });

      /*
       *
       */
      describe('#_resolveDepReference()', function () {
        var stub;
        var data = {};
        before(function () {
          window.cubx.CRCInit.rootDependencies = JSON.parse(rootDependencies);
          window.cubx.CRCInit.webpackageBaseUrl = 'http://test.org';
          depMgr.init();

          // fake data response for mocked ajax request
          data = JSON.parse(pkg1);

          // Mock _fetchManifest method to return promise
          stub = sinon.stub(depMgr, '_fetchManifest', function (url) {
            return new Promise(function (resolve, reject) {
              window.setTimeout(function () {
                resolve({data: data});
              }, 1000);
            });
          });
        });
        beforeEach(function () {
          stub.reset();
          depMgr._responseCache.invalidate();
        });

        it('should return the requested artifact data', function (done) {
          var promise = depMgr._resolveDepReference({
            webpackageId: 'package1@1.0.0',
            artifactId: 'util1',
            getArtifactId: function () {
              return this.artifactId;
            }
          });
          promise.then(function (result) {
            // console.log('done:' + JSON.stringify(result.data))
            expect(result.data).to.eql(data.artifacts.utilities[ 0 ]);
            done();
          });
        });

        it('should request the manifest.webpackage by using the correct url', function (done) {
          depMgr._resolveDepReference({
            webpackageId: 'package1@1.0.0',
            artifactId: 'util1',
            getArtifactId: function () {
              return this.artifactId;
            }
          });
          expect(stub.calledWithMatch(depMgr._baseUrl + 'package1@1.0.0/manifest.webpackage')).to.be.true;
          done();
        });

        after(function () {
          depMgr._fetchManifest.restore();
        });
      });

      describe('#_resolveDepReference()', function () {
        var customManifest = {
          version: '0.0.1-SNAPSHOT',
          name: 'custom-manifest',
          author: 'John Doe',
          docType: 'webpackage',
          artifacts: {
            utilities: [
              {
                artifactId: 'artifact1',
                description: 'artifact for testing purposes...',
                resources: [ 'js/test1.js', 'css/test1.css' ],
                dependencies: [{webpackageId: 'pack1@1.0.0', artifactId: 'util'}, {webpackageId: 'pack2@1.0.0', artifactId: 'main'}]
              }
            ]
          }
        };
        var depReferenceItem = {
          webpackageId: 'package1@1.0.0',
          manifest: customManifest,
          artifactId: 'artifact1',
          getArtifactId: function () {
            return this.artifactId;
          }
        };
        var fetchManifestSpy;
        before(function () {
          fetchManifestSpy = sinon.spy(depMgr, '_fetchManifest');
        });
        beforeEach(function () {
          depMgr._responseCache.invalidate();
          fetchManifestSpy.reset();
        });
        it('should return manifest object, if there is one', function (done) {
          var promise = depMgr._resolveDepReference(depReferenceItem);
          promise.then(function (result) {
            sinon.assert.notCalled(fetchManifestSpy);
            expect(result.data).to.eql(customManifest.artifacts.utilities[ 0 ]);
            done();
          });
        });
        it('should return manifest from cache, if there is one for requested webpackage', function (done) {
          depMgr._responseCache.addItem(depReferenceItem.webpackageId, depReferenceItem.manifest);
          var promise = depMgr._resolveDepReference(depReferenceItem);
          promise.then(function (result) {
            sinon.assert.notCalled(fetchManifestSpy);
            expect(result.data).to.eql(customManifest.artifacts.utilities[ 0 ]);
            done();
          });
        });
        after(function () {
          depMgr._responseCache.invalidate();
          depMgr._fetchManifest.restore();
        });
      });

      describe('#_resolveDepReference() error handling', function () {
        var stub;
        before(function () {
          depMgr._baseUrl = 'http://www.base.test/webpacke-store/';
          stub = sinon.stub(depMgr, '_fetchManifest', function (url) {
            // simulating a 500ms timeout
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                reject({response: {status: 'timeout'}});
              }, 500);
            });
          });
        });
        beforeEach(function () {
          stub.reset();
        });
        it('should reject the returned promise if ajax request fails', function (done) {
          var depRef = {
            id: 'package_2-1.0.0'
          };
          var promise = depMgr._resolveDepReference(depRef);
          promise.fail(function (status) {
            expect(status).to.have.property('status', 'timeout');
            done();
          });
        });
        after(function () {
          depMgr._fetchManifest.restore();
          depMgr._baseUrl = '';
        });
      });
      /**
       * Find index of given DepReference item in internal depList.
       */
      describe('#_getIndexOfDepReferenceItem()', function () {
        var artifactDependencies;
        var testReferrer = {
          webpackageId: 'testWebpackage',
          artifactId: 'testArtifactId'
        };
        before(function () {
          depMgr._depList = null;
          artifactDependencies = JSON.parse(rootDependencies);
          depMgr.init();
        });
        it('should return index of DepReference item in internal depList', function () {
          var depReferences = depMgr._createDepReferenceListFromArtifactDependencies(artifactDependencies, testReferrer);
          depMgr._depList = depReferences;
          expect(depMgr._getIndexOfDepReferenceItem(depMgr._depList, depReferences[ 0 ])).to.equal(0);
        });
        it('should return -1, as given item is not in internal depList', function () {
          var items = depMgr._createDepReferenceListFromArtifactDependencies([
            {webpackageId: 'test-1.2.3', artifactId: 'generic'}
          ], testReferrer);
          expect(depMgr._getIndexOfDepReferenceItem(depMgr._depList, items[ 0 ])).to.equal(-1);
        });
        after(function () {
          depMgr._depList = null;
        });
      });

      /**
       * The resource-list will be injected into the dom.
       */
      describe('#_calculateResourceList()', function () {
        var internalDepList = [];
        var item1;
        var item2;
        var item3;
        before(function () {
          window.cubx.CRCInit.runtimeMode = 'prod';
          depMgr.init();
        });
        beforeEach(function () {
          var testReferrer = {
            webpackageId: 'testWebpackage',
            artifactId: 'testArtifactId'
          };
          var items = depMgr._createDepReferenceListFromArtifactDependencies([
            {webpackageId: 'package1@1.0.0', artifactId: 'generic1'},
            {webpackageId: 'package2@1.0.0', artifactId: 'generic2'},
            {webpackageId: 'package3@1.0.0', artifactId: 'util#main'}
          ], testReferrer);

          item1 = items[ 0 ];
          item2 = items[ 1 ];
          item3 = items[ 2 ];
          item1.resources = [
            'test1_1.js',
            {
              prod: 'test1_2.min.css',
              dev: 'test1_2.css'
            },
            'test1_3.html'
          ];
          item2.resources = [
            {
              prod: 'test2_1.min.js',
              dev: 'test2_1.js'
            },
            'test2_2.js',
            'test2_3.html'
          ];
          item3.resources = [
            'test3-1.js'
          ];
          internalDepList.push(item1);
          internalDepList.push(item2);
          internalDepList.push(item3);
        });
        it('should return a list of all resources in correct order for given list of DepReference items',
          function () {
            depMgr._runtimeMode.should.be.eql('prod');
            var resourceList = depMgr._calculateResourceList(internalDepList);
            // console.log(resourceList);
            resourceList.should.have.length(7);
            resourceList[ 0 ].should.have.property('path',
              depMgr._baseUrl + item1.webpackageId + '/' + item1.artifactId + '/' + item1.resources[ 0 ]);
            resourceList[ 1 ].should.have.property('path',
              depMgr._baseUrl + item1.webpackageId + '/' + item1.artifactId + '/' +
              item1.resources[ 1 ].prod);
            resourceList[ 2 ].should.have.property('path',
              depMgr._baseUrl + item1.webpackageId + '/' + item1.artifactId + '/' + item1.resources[ 2 ]);
            resourceList[ 3 ].should.have.property('path',
              depMgr._baseUrl + item2.webpackageId + '/' + item2.artifactId + '/' +
              item2.resources[ 0 ].prod);
            resourceList[ 4 ].should.have.property('path',
              depMgr._baseUrl + item2.webpackageId + '/' + item2.artifactId + '/' + item2.resources[ 1 ]);
            resourceList[ 5 ].should.have.property('path',
              depMgr._baseUrl + item2.webpackageId + '/' + item2.artifactId + '/' + item2.resources[ 2 ]);
          });
        it('should ignore endpointId appendix on artifacts that where converted by the manifestConverter', function () {
          depMgr._runtimeMode.should.be.eql('prod');
          var resourceList = depMgr._calculateResourceList(internalDepList);
          resourceList[ 6 ].should.have.property('path',
            depMgr._baseUrl + item3.webpackageId + '/util/' + item3.resources[ 0 ]);
        });
        afterEach(function () {
          internalDepList = [];
        });
        after(function () {
          depMgr._depJson = null;
        });
      });

      describe('#_fetchManifest()', function () {
        var depMgr;
        var axiosStub;
        before(function () {
          depMgr = CRC.getDependencyMgr();
          axiosStub = sinon.stub(Object.getPrototypeOf(depMgr._axios), 'request', function (url) {
            return new Promise(function (resolve, reject) {
              setTimeout(function () {
                resolve();
              }, 250);
            });
          });
        });
        it('should call axios.request method with given url', function (done) {
          depMgr._fetchManifest('https://www.example.test').then(function () {
            expect(axiosStub.calledWith({url: 'https://www.example.test'})).to.be.true;
            done();
          });
        });
        it('should return a promise', function () {
          var promise = depMgr._fetchManifest('https://www.example.test');
          expect(promise).to.be.an.instanceOf(Promise);
        });
        after(function () {
          axiosStub.restore();
        });
      });

      describe('#_getManifestForDepReference()', function () {
        var baseUrl;
        var depRefItem;
        var fetchManifestStub;
        var getItemFromCacheSpy;

        beforeEach(function () {
          depMgr.init();
          baseUrl = 'http://www.example.de/';
          depRefItem = new DepMgr.DepReference({webpackageId: 'package1@1.0.0', artifactId: 'util1', referrer: null});
          fetchManifestStub = sinon.stub(Object.getPrototypeOf(depMgr), '_fetchManifest', function (url) {
            return new Promise(function (resolve, reject) {
              window.setTimeout(function () {
                if (url.indexOf('package1@1.0.0') >= 0) {
                  resolve({data: JSON.parse(pkg1)});
                } else {
                  reject({response: {status: 'timeout'}});
                }
              }, 200);
            });
          });
          getItemFromCacheSpy = sinon.spy(depMgr._responseCache, 'get');
          depMgr._responseCache.invalidate();
        });
        afterEach(function () {
          fetchManifestStub.restore();
          getItemFromCacheSpy.restore();
          depMgr._responseCache.invalidate();
        });
        it('should return a promise', function () {
          expect(depMgr._getManifestForDepReference(depRefItem, baseUrl)).to.be.an.instanceOf(Promise);
        });
        it('should resolve returned promise with manifest from responseCache if there is one', function () {
          // put a manifest in responseCache
          depMgr._responseCache.addItem('package1@1.0.0', JSON.parse(pkg1));
          return depMgr._getManifestForDepReference(depRefItem).then(function (result) {
            result.should.be.eql(JSON.parse(pkg1));
            expect(getItemFromCacheSpy.calledOnce);
            expect(fetchManifestStub.callCount).to.be.equal(0);
          });
        });
        it('should resolve returned promise with inline manifest from depReference is there is one ' +
          'and no manifest was found in responseCache', function () {
          depRefItem.manifest = JSON.parse(pkg1);
          return depMgr._getManifestForDepReference(depRefItem).then(function (result) {
            result.should.be.eql(depRefItem.manifest);
            expect(getItemFromCacheSpy.callCount).to.be.equal(0);
            expect(fetchManifestStub.callCount).to.be.equal(0);
          });
        });
        it('should resolve returned promise with requested manifest from baseUrls if there is ' +
          'neighter a manifest in responseCache nor in inline manifest', function () {
          return depMgr._getManifestForDepReference(depRefItem, baseUrl).then(function (result) {
            result.should.be.eql(JSON.parse(pkg1));
            expect(getItemFromCacheSpy.callCount).to.be.equal(0);
            expect(fetchManifestStub.calledOnce);
            expect(fetchManifestStub.calledWith(baseUrl + 'package1@1.0.0/webpackage.manifest'));
          });
        });
        describe('Error handling', function () {
          it('should reject returned promise if there is an error while fetching manifest', function () {
            return depMgr._getManifestForDepReference(depRefItem, baseUrl).then(function (resolved) {
              throw new Error('Promise was unexpectedly fulfilled: ', resolved);
            }, function (rejected) {
              rejected.should.have.property('response');
              rejected.response.should.eql({status: 'timeout'});
            });
          });
          it('should throw a TypeError if first given paramter is not an instanceOf DepReference', function () {
            try {
              depMgr._getManifestForDepReference({});
            } catch (e) {
              expect(e).to.be.instanceOf(TypeError);
            }
          });
          it('should throw a TypeError if baseUrl is not given when fetching manifest needs to be called', function () {
            try {
              depMgr._getManifestForDepReference(depRefItem, 123);
            } catch (e) {
              expect(e).to.be.instanceOf(TypeError);
            }
          });
        });
      });
    });
  });
