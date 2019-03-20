/* globals describe, before, beforeEach, it, after, afterEach, sinon, expect */
window.cubx.amd.define([ 'CRC',
  'dependencyManager',
  'dependencyTree',
  'text!unit/dependencyResolution/rootDependencies.json',
  'text!unit/dependencyResolution/dependencyPackage1.json',
  'text!unit/dependencyResolution/dependencyPackage2.json',
  'text!unit/dependencyResolution/dependencyPackage3.json',
  'text!unit/dependencyResolution/dependencyPackage4.json',
  'text!unit/dependencyResolution/dependencyPackage5.json',
  'text!unit/dependencyResolution/dependencyPackage6.json',
  'unit/utils/CubxNamespaceManager'
], function (CRC, DepMgr, DependencyTree, rootDependencies, pkg1, pkg2, pkg3, pkg4, pkg5, pkg6, CubxNamespaceManager) {
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
          {webpackageId: 'package3@1.0.0', artifactId: 'util'}
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
      afterEach(function () {
        internalDepList = [];
      });
      after(function () {
        depMgr._depJson = null;
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
              spyConsoleWarn.calledOnce; // eslint-disable-line chai-friendly/no-unused-expressions
              spyConsoleWarn.calledWith('The following resource will be ignored, because the type of the resource is unkown. (blob:http://xxxxxx?type=xxx)');
            });
            it('should not create a new resource and return undefined, if the type parameter missed', function () {
              var absoluteUrlString = 'blob:http://xxxxxx?yyy=xxx';
              var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
              expect(resource).to.be.undefined;
              spyConsoleWarn.calledOnce; // eslint-disable-line chai-friendly/no-unused-expressions
              spyConsoleWarn.calledWith('The following resource will be ignored, because the type of the resource is unkown. (blob:http://xxxxxx?yyy=xxx)');
            });
            it('should not create a new resource and return undefined, if no paramter exists', function () {
              var absoluteUrlString = 'blob:http://xxxxxx';
              var resource = depMgr._createResourceFromItem(id, absoluteUrlString, 'prod');
              expect(resource).to.be.undefined;
              spyConsoleWarn.calledOnce; // eslint-disable-line chai-friendly/no-unused-expressions
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
    describe('#_fetchManifest()', function () {
      var depMgr;
      var axiosStub;
      before(function () {
        depMgr = CRC.getDependencyMgr();
        axiosStub = sinon.stub(Object.getPrototypeOf(depMgr._axios), 'request').callsFake(function (url) {
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
    describe('#_getDependencyListFromTree', function () {
      var depTree;
      var dep1;
      var dep2;
      var dep3;
      var dep4;
      var dep5;
      var dep6;
      beforeEach(function () {
        // we need to provide a valid dependencyTree which has already excludes and duplicates removed
        depTree = new DependencyTree();
        dep1 = new DependencyTree.Node();
        dep1.data = new DepMgr.DepReference({webpackageId: 'package1@1.0.0', artifactId: 'util1', referrer: null});
        dep2 = new DependencyTree.Node();
        dep2.data = new DepMgr.DepReference({webpackageId: 'package2@1.0.0', artifactId: 'util2', referrer: null});
        dep3 = new DependencyTree.Node();
        dep3.data = new DepMgr.DepReference({webpackageId: 'package3@1.0.0', artifactId: 'util3', referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}});
        dep4 = new DependencyTree.Node();
        dep4.data = new DepMgr.DepReference({webpackageId: 'package4@1.0.0', artifactId: 'util4', referrer: {webpackageId: 'package1@1.0.0', artifactId: 'util1'}});
        dep5 = new DependencyTree.Node();
        dep5.data = new DepMgr.DepReference({webpackageId: 'package5@1.0.0', artifactId: 'util5', referrer: {webpackageId: 'package2@1.0.0', artifactId: 'util2'}});
        dep6 = new DependencyTree.Node();
        dep6.data = new DepMgr.DepReference({webpackageId: 'package6@1.0.0', artifactId: 'util6', referrer: {webpackageId: 'package5@1.0.0', artifactId: 'util5'}});
        // build dependency tree structure
        depTree.insertNode(dep1);
        depTree.insertNode(dep2);
        depTree.insertNode(dep3, dep1);
        depTree.insertNode(dep4, dep1);
        depTree.insertNode(dep5, dep2);
        depTree.insertNode(dep6, dep5);
        dep2.usesExisting = [dep3];
        dep3.usedBy = [dep2];
        dep3.usesExisting = [dep5];
        dep5.usedBy = [dep3];
      });
      it('should return an array of DepReference items', function () {
        var list = depMgr._getDependencyListFromTree(depTree);
        list.should.be.an.instanceof(Array);
        list.forEach(function (item) { item.should.be.an.instanceOf(DepMgr.DepReference); });
      });
      it('should order the items in the returned array so that all dependencies of an item have a lower index the item itself', function () {
        var list = depMgr._getDependencyListFromTree(depTree);
        list[0].webpackageId.should.equal('package6@1.0.0');
        list[0].artifactId.should.equal('util6');
        list[1].webpackageId.should.equal('package5@1.0.0');
        list[1].artifactId.should.equal('util5');
        list[2].webpackageId.should.equal('package3@1.0.0');
        list[2].artifactId.should.equal('util3');
        list[3].webpackageId.should.equal('package4@1.0.0');
        list[3].artifactId.should.equal('util4');
        list[4].webpackageId.should.equal('package1@1.0.0');
        list[4].artifactId.should.equal('util1');
        list[5].webpackageId.should.equal('package2@1.0.0');
        list[5].artifactId.should.equal('util2');
      });
    });
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
    describe('#_getManifestForDepReference()', function () {
      var baseUrl;
      var depRefItem;
      var fetchManifestStub;
      var getItemFromCacheSpy;

      beforeEach(function () {
        depMgr.init();
        baseUrl = 'http://www.example.de/';
        depRefItem = new DepMgr.DepReference({webpackageId: 'package1@1.0.0', artifactId: 'util1', referrer: null});
        fetchManifestStub = sinon.stub(Object.getPrototypeOf(depMgr), '_fetchManifest').callsFake(function (url) {
          return new Promise(function (resolve, reject) {
            window.setTimeout(function () {
              if (url.indexOf('package1@1.0.0') >= 0) {
                resolve({data: JSON.parse(pkg1)});
              } else {
                reject({response: {status: 'timeout'}}); // eslint-disable-line prefer-promise-reject-errors
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
      it('should resolve returned promise with inline manifest from depReference if there is one ' +
        'and no manifest was found in responseCache', function () {
        depRefItem.manifest = JSON.parse(pkg1);
        return depMgr._getManifestForDepReference(depRefItem).then(function (result) {
          result.should.be.eql(depRefItem.manifest);
          expect(getItemFromCacheSpy.callCount.calledOnce);
          expect(fetchManifestStub.callCount).to.be.equal(0);
        });
      });
      it('should resolve returned promise with requested manifest from baseUrl if there is ' +
        'neither a manifest in responseCache nor in inline manifest', function () {
        return depMgr._getManifestForDepReference(depRefItem, baseUrl).then(function (result) {
          result.should.be.eql(JSON.parse(pkg1));
          expect(getItemFromCacheSpy.calledOnce);
          expect(fetchManifestStub.calledOnce);
          expect(fetchManifestStub.calledWith(baseUrl + 'package1@1.0.0/webpackage.manifest'));
        });
      });
      describe('Error handling', function () {
        it('should reject returned promise if there is an error while fetching manifest', function () {
          depRefItem.webpackageId = 'timeout';
          return depMgr._getManifestForDepReference(depRefItem, baseUrl).then(function (resolved) {
            throw new Error('Promise was unexpectedly fulfilled: ', resolved);
          }, function (rejected) {
            rejected.should.have.property('response');
            rejected.response.should.eql({status: 'timeout'});
          });
        });
        it('should reject returned promise if baseUrl is not given when fetching manifest needs to be called', function () {
          return depMgr._getManifestForDepReference(depRefItem).then(function (resolved) {
            throw new Error('Promise was unexpectedly fulfilled: ', resolved);
          }, function (rejected) {
            rejected.should.be.an.instanceof(TypeError);
          });
        });
        it('should throw a TypeError if first given parameter is not an instanceOf DepReference', function () {
          var errorThrown = false;
          try {
            depMgr._getManifestForDepReference({});
          } catch (e) {
            errorThrown = true;
            expect(e).to.be.instanceOf(TypeError);
          } finally {
            errorThrown.should.be.true;
          }
        });
      });
    });
    describe('#_prepareResponseData()', function () {
      var alertSpy;
      before(function () {
        alertSpy = sinon.spy(window, 'alert');
      });
      beforeEach(function () {
        alertSpy.resetHistory();
      });
      after(function () {
        alertSpy.restore();
      });
      it('should throw an error if called given data is not a valid manifest object/string', function () {
        var errorThrown = false;
        try {
          DepMgr._prepareResponseData({error: 'arbitrary error...'});
        } catch (e) {
          e.should.be.instanceof(Error);
          errorThrown = true;
        } finally {
          errorThrown.should.be.true;
        }
      });
    });
  });
});
