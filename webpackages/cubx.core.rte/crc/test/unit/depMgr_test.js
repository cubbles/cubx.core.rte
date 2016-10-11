window.cubx.amd.define(
  [
    'CRC',
    'dependencyManager',
    'text!unit/dependencyManager/dependencies.json',
    'unit/utils/CubxNamespaceManager'
  ],
  function (CRC, DepMgr, depList, CubxNamespaceManager) {
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
        it('should remove "property" endpoints from each rootDependency if available and append it to artifactId', function () {
          var item = depMgr._depList[0];
          item.artifactId.should.equal('util1#main');
          item.webpackageId.should.equal('cubx.core.test.crc-loader-test');
          item.should.not.have.ownProperty('endpointId');
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
          item.dependencyExcludes.should.eql([{ webpackageId: 'excludedPackage', artifactId: 'excludedArtifact' }]);
        });
        it('should set referrer to "root" if param referrer is set to null', function () {
          var item = depMgr._createDepReferenceListFromArtifactDependencies(dependencies, null)[0];
          item.referrer[0].should.equal('root');
        });
      });
    });
  });
