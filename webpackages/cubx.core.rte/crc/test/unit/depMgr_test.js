window.cubx.amd.define(
  [
    'CRC',
    'dependencyManager',
    'text!unit/dependencyManager/dependencies.json',
    'unit/utils/CubxNamespaceManager',
    'utils'
  ],
  function (CRC, DepMgr, depList, CubxNamespaceManager, utils) {
    'use strict';

    describe('DependencyManager', function () {
      before(function () {
        CubxNamespaceManager.resetNamespace(CRC);
      });
      after(function () {
        CubxNamespaceManager.resetNamespace();
      });
      describe('#init()', function () {
        var depMgr;
        before(function () {
          var depListObj = JSON.parse(depList);
          window.cubx.CRCInit.rootDependencies = depListObj;
          window.cubx.CRCInit.rootDependencyExcludes = [
            {webpackageId: 'exclude1@1.2.3', artifactId: 'artifact1'},
            {webpackageId: 'exclude2@1.2.3', artifactId: 'artifact2'}
          ];
          window.cubx.CRCInit.webpackageBaseUrl = 'http://test.org';
          depMgr = CRC.getDependencyMgr();
          depMgr.init();
        });

        it('should set the dependency list as object if list is given as object', function () {
          expect(depMgr._depList.length).to.eql(3);
        });
        it('should have the expected baseUrl', function () {
          expect(depMgr._baseUrl).to.eql('http://test.org');
        });
      });
      describe('#_createDepReferenceListFromArtifactDependencies()', function () {
        var depMgr;
        var dependencies;
        beforeEach(function () {
          depMgr = CRC.getDependencyMgr();
          dependencies = JSON.parse(depList);
        });
        it('should create list of DepReference items from given list of dependencies', function () {
          var referrer = {
            webpackageId: 'testWebpackagePackageId',
            artifactId: 'testArtifactId'
          };
          var depList = depMgr._createDepReferenceListFromArtifactDependencies(dependencies, referrer);
          expect(depList).to.have.lengthOf(3);
          var item = depList[0];
          item.artifactId.should.equal('util1');
          item.webpackageId.should.equal('cubx.core.test.crc-loader-test');
          item.referrer[0].should.eql(referrer);
          item.dependencyExcludes.should.eql([]);

          item = depList[1];
          item.artifactId.should.equal('util2');
          item.webpackageId.should.equal('cubx.core.test.crc-loader-test');
          item.referrer[0].should.eql(referrer);
          item.dependencyExcludes.should.eql([]);

          item = depList[2];
          item.artifactId.should.equal('util3');
          item.webpackageId.should.equal('cubx.core.test.crc-loader-test');
          item.referrer[0].should.eql(referrer);
          item.dependencyExcludes.should.eql([
            { webpackageId: 'excludedPackage', artifactId: 'excludedArtifact' },
            { webpackageId: 'anotherExcludedPackage', artifactId: 'anotherExcludedArtifact' }
          ]);
        });
        it('should set referrer to "root" if param referrer is set to null', function () {
          var item = depMgr._createDepReferenceListFromArtifactDependencies(dependencies, null)[0];
          item.referrer[0].should.equal('root');
        });
      });
      describe('#_injectDependenciesToDom()', function () {
        var depMgr;
        var appendStylesheetStub;
        var appendHtmlImportStub;
        var appendScriptStub;
        var resourceList;
        var injectedResources;
        var createScriptForFireEventSpy;
        before(function () {
          depMgr = new DepMgr();
          injectedResources = [];
          appendStylesheetStub = sinon.stub(utils.DOM, 'appendStylesheetToHead').callsFake(function (file) { injectedResources.push(file); });
          appendHtmlImportStub = sinon.stub(utils.DOM, 'appendHtmlImportToHead').callsFake(function (file) {
            if (!file.startsWith('blob')) {
              injectedResources.push(file);
            }
          });
          appendScriptStub = sinon.stub(utils.DOM, 'appendScriptTagToHead').callsFake(function (file) { injectedResources.push(file); });
          createScriptForFireEventSpy = sinon.spy(depMgr, '_createScriptForFireEvent');
          resourceList = [
            new DepMgr.Resource('test.html', 'htmlImport', [{webpackageId: 'referrer1', artifactId: 'artifact1'}, 'referrer2/artifact2']),
            new DepMgr.Resource('test.css', 'stylesheet', [{webpackageId: 'referrer3', artifactId: 'artifact3'}]),
            new DepMgr.Resource('test.js', 'javascript', [{webpackageId: 'referrer4', artifactId: 'artifact4'}])
          ];
        });
        beforeEach(function () {
          appendStylesheetStub.resetHistory();
          appendHtmlImportStub.resetHistory();
          appendScriptStub.resetHistory();
          createScriptForFireEventSpy.resetHistory();
          injectedResources = [];
        });
        after(function () {
          appendStylesheetStub.restore();
          appendHtmlImportStub.restore();
          appendScriptStub.restore();
          createScriptForFireEventSpy.restore();
        });
        it('should append all html import resources of given resource list into DOM using utils.DOM api including all referrers of each resource', function () {
          depMgr._injectDependenciesToDom(resourceList);
          appendHtmlImportStub.callCount.should.equal(3);
          var secondCall = appendHtmlImportStub.getCall(1);
          secondCall.args[0].should.be.equal('test.html');
          secondCall.args[1].should.be.eql([ 'referrer1/artifact1', 'referrer2/artifact2' ]);
          // expect(appendHtmlImportStub.calledOnceWith('test.html', [ 'referrer1/artifact1', 'referrer2/artifact2' ])).to.be.true;
          createScriptForFireEventSpy.should.calledTwice;
        });
        it('should append all css resources of given resource list into DOM using utils.DOM api including all referrers of each resource', function () {
          depMgr._injectDependenciesToDom(resourceList);
          expect(appendStylesheetStub.callCount).to.equal(1);
          expect(appendStylesheetStub.calledWith('test.css', [ 'referrer3/artifact3' ])).to.be.true;
        });
        it('should append all javascript resources of given resource list into DOM using utils.DOM api including all referrers of each resource', function () {
          depMgr._injectDependenciesToDom(resourceList);
          expect(appendScriptStub.callCount).to.equal(1);
          expect(appendScriptStub.calledWith('test.js', [ 'referrer4/artifact4' ])).to.be.true;
        });
        it('should keep order of resources when injecting them into DOM', function () {
          depMgr._injectDependenciesToDom(resourceList);
          injectedResources[ 0 ].should.be.equal('test.html');
          injectedResources[ 1 ].should.be.equal('test.css');
          injectedResources[ 2 ].should.be.equal('test.js');
        });
        describe('cubx.CRCInit.disableResourceInjection is true', function () {
          var originCubx;
          before(function () {
            originCubx = window.cubx;
            if (!window.cubx.CRCInit) {
              window.cubx.CRCInit = {};
            }
            window.cubx.CRCInit.disableResourceInjection = true;
          });
          after(function () {
            window.cubx = originCubx;
          });
          it('should not append any resources to the dom', function () {
            depMgr._injectDependenciesToDom(resourceList);
            expect(appendScriptStub.callCount).to.equal(0);
            expect(appendStylesheetStub.callCount).to.equal(0);
            expect(appendHtmlImportStub.callCount).to.equal(1); // One call in #_createScriptForFireEvent
          });
        });
      });
      describe('#_isValidResourceType()', function () {
        it('should return true for resource type "htmlImport"', function () {
          DepMgr._isValidResourceType('htmlImport').should.be.true;
        });
        it('should return true for resource type "stylesheet"', function () {
          DepMgr._isValidResourceType('stylesheet').should.be.true;
        });
        it('should return true for resource type "javascript"', function () {
          DepMgr._isValidResourceType('javascript').should.be.true;
        });
        it('should return false if given string does not match any type name', function () {
          DepMgr._isValidResourceType('barfoo').should.be.false;
        });
      });
    });
  });
