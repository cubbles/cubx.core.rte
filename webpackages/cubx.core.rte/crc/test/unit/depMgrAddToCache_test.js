/**
 * Created by jtrs on 19.05.2015.
 */
window.cubx.amd.define([ 'CRC',
  'dependencyManager',
  'text!unit/addToCache/webpackageDocument.json',
  'text!unit/addToCache/webpackageDocument1.json',
  'text!unit/addToCache/webpackageDocument2.json',
  'text!unit/addToCache/webpackageDocument3.json',
  'text!unit/addToCache/webpackageDocument4.json',
  'text!unit/addToCache/webpackageDocument5.json',
  'text!unit/addToCache/webpackageDocument6.json',
  'text!unit/addToCache/webpackageDocument7.json',
  'unit/utils/CubxNamespaceManager'
], function (CRC, DepMgr, pkg, pkg1, pkg2, pkg3, pkg4, pkg5, pkg6, pkg7, CubxNamespaceManager) {
  'use strict';
  var crcDepMgr;

  describe('DepMgrComponentCaching', function () {
    var documents = {};

    before(function () {
      CubxNamespaceManager.resetNamespace(CRC, 'DepMgr.addToCache.before');
      crcDepMgr = CRC.getDependencyMgr();
      crcDepMgr.init();
      documents[ 'org.example.my-webpackage@0.2.0' ] = JSON.parse(pkg);
      documents[ 'org.example.package-1@1.0.0' ] = JSON.parse(pkg1);
      documents[ 'org.example.package-2@1.0.0' ] = JSON.parse(pkg2);
      documents[ 'org.example.package-3@1.0.0' ] = JSON.parse(pkg3);
      documents[ 'org.example.package-4@1.0.0' ] = JSON.parse(pkg4);
      documents[ 'org.example.package-5@1.0.0' ] = JSON.parse(pkg5);
      documents[ 'org.example.package-6@1.0.0' ] = JSON.parse(pkg6);
      documents[ 'org.example.package-7@1.0.0' ] = JSON.parse(pkg7);
    });
    after(function () {
      CubxNamespaceManager.resetNamespace(CRC, 'DepMgr.addToCache.after');
    });
  });
});
