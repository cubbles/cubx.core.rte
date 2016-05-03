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
