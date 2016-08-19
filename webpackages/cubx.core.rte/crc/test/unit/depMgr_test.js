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
          expect(depMgr._depList[0]).to.eql({
            artifactId: 'util1#main',
            wepackageId: 'cubx.core.test.crc-loader-test'
          });
          expect(depMgr._depList[0]).not.to.have.ownProperty('endpointId');
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

      describe('#_createDepReferenceListFromEndpointDependencies()', function () {
        var depMgr;
        var dependencies;
        before(function () {
          depMgr = CRC.getDependencyMgr();
          dependencies = JSON.parse(depList);
        });
        it('should create list of DepReference items from given list of dependencies', function () {
          var referrer = 'testReferrer';
          var depList = depMgr._createDepReferenceListFromEndpointDependencies(dependencies, referrer);
          expect(depList).to.have.lengthOf(3);
          expect(depList[0]).to.contain.all.keys({
            artifactId: 'util1#main',
            webpackageId: 'cubx.core.test.crc-loader-test',
            referrer: referrer
          });
          expect(depList[1]).to.contain.all.keys({
            artifactId: 'util2',
            webpackageId: 'cubx.core.test.crc-loader-test',
            referrer: referrer
          });
          expect(depList[2]).to.contain.all.keys({
            artifactId: 'util3',
            webpackageId: 'cubx.core.test.crc-loader-test',
            referrer: referrer
          });
        });
      });
    });
  });
