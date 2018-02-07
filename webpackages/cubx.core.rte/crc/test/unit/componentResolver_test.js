/* globals describe, before, beforeEach, it, after, sinon */
window.cubx.amd.define([
  'CRC',
  // 'componentResolver',
  'text!unit/componentResolution/webpackageDocument1.json',
  'text!unit/componentResolution/webpackageDocument2.json',
  'text!unit/componentResolution/webpackageDocument3.json',
  'text!unit/componentResolution/webpackageDocument4.json',
  'text!unit/componentResolution/webpackageDocument5.json',
  'text!unit/componentResolution/resolvedComponent.json',
  'unit/utils/CubxNamespaceManager'
], function (CRC, doc1, doc2, doc3, doc4, doc5, resolvedComponent, CubxNamespaceManager) {
  'use strict';

  var resolver;
  var documents = [];
  var depMgr;
  var cache;
  var resolvedComponentObject;

  describe('ComponentResolver', function () {
    before(function () {
      CubxNamespaceManager.resetNamespace(CRC, 'ComponentResolver.before');
      depMgr = CRC.getDependencyMgr();
      depMgr.init();
      cache = CRC.getCache();
      cache._componentCache = {};
      resolver = CRC.getComponentResolver();
      documents[ 'test.compound-A@1.0.0' ] = JSON.parse(doc1);
      documents[ 'test.compound-B@1.0.0' ] = JSON.parse(doc2);
      documents[ 'test.elementary-C@1.0.0' ] = JSON.parse(doc3);
      documents[ 'test.elementary-D@1.0.0' ] = JSON.parse(doc4);
      documents[ 'test.elementary-E@1.0.0' ] = JSON.parse(doc5);
      resolvedComponentObject = JSON.parse(resolvedComponent);
    });
    after(function () {
      CubxNamespaceManager.resetNamespace(undefined, 'ComponentResolver.after');
    });
    describe('#resolvedComponent', function () {
      describe('build resolvedComponent', function () {
        beforeEach(function () {
          depMgr._storeManifestFiles(documents[ 'test.compound-A@1.0.0' ], 'compound-A');
          depMgr._storeManifestFiles(documents[ 'test.compound-B@1.0.0' ], 'compound-B');
          depMgr._storeManifestFiles(documents[ 'test.elementary-C@1.0.0' ], 'elementary-C');
          depMgr._storeManifestFiles(documents[ 'test.elementary-D@1.0.0' ], 'elementary-D');
          depMgr._storeManifestFiles(documents[ 'test.elementary-E@1.0.0' ], 'elementary-E');
          depMgr._storeManifestFiles(documents[ 'test.compound-A@1.0.0' ], 'elementary-F');
        });
        afterEach(function () {
          delete cache._componentCache[ 'compound-A' ];
          delete cache._componentCache[ 'compound-B' ];
          delete cache._componentCache[ 'elementary-C' ];
          delete cache._componentCache[ 'elementary-D' ];
          delete cache._componentCache[ 'elementary-E' ];
          delete cache._componentCache[ 'elementary-F' ];
        });
        it('should be equals with an expected document', function () {
          var processedErg = resolver.processManifest('compound-A');
          // console.log('processedErg', JSON.stringify(processedErg, null, 2));
          expect(processedErg).to.be.not.undefined;
          expect(processedErg).to.be.not.null;
          expect(processedErg).to.be.not.empty;
          expect(processedErg).to.eql(resolvedComponentObject);
        });
      });
    });
  });
});
