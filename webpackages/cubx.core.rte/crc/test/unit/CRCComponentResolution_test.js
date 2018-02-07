/* globals describe, before, beforeEach, it, after, afterEach, sinon */
window.cubx.amd.define([ 'CRC',
  'text!unit/componentResolution/webpackageDocument1.json',
  'text!unit/componentResolution/webpackageDocument2.json',
  'text!unit/componentResolution/webpackageDocument3.json',
  'text!unit/componentResolution/webpackageDocument4.json',
  'text!unit/componentResolution/webpackageDocument5.json',
  'text!unit/componentResolution/resolvedComponent.json',
  'unit/utils/CubxNamespaceManager'
], function (CRC, doc1, doc2, doc3, doc4, doc5, resolvedComponent, CubxNamespaceManager) {
  'use strict';

  describe('CRCComponentResolution', function () {
    var cache;
    var documents = {};
    var depMgr;
    before(function () {
      CubxNamespaceManager.resetNamespace(CRC, 'CRCComponentResolution.before');
      cache = CRC.getCache();
      depMgr = CRC.getDependencyMgr();
      depMgr.init();

      documents[ 'test.compound-A@1.0.0' ] = JSON.parse(doc1);
      documents[ 'test.compound-B@1.0.0' ] = JSON.parse(doc2);
      documents[ 'test.elementary-C@1.0.0' ] = JSON.parse(doc3);
      documents[ 'test.elementary-D@1.0.0' ] = JSON.parse(doc4);
      documents[ 'test.elementary-E@1.0.0' ] = JSON.parse(doc5);
    });
    after(function () {
      CubxNamespaceManager.resetNamespace(undefined, 'CRCComponentResolution.after');
    });
    describe('#getResolvedComponent', function () {
      describe('build resolvedComponent, if initial not in cache', function () {
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
          delete cache._resolvedComponents[ 'compound-A' ];
        });
        describe('resolvedComponent should be build, if not in ', function () {
          var spy;

          beforeEach(function () {
            cache._resolvedComponents = {};
            spy = sinon.spy(CRC, '_resolveComponent');
          });
          afterEach(function () {
            CRC._resolveComponent.restore();
          });
          it('should be equals with resolvedComponent',
            function () {
              var processedErg = CRC.getResolvedComponent('compound-A');
              expect(processedErg).to.be.not.undefined;
              expect(processedErg).to.be.not.null;
              expect(processedErg).to.be.not.empty;
              expect(processedErg).to.deep.equals(JSON.parse(resolvedComponent));
            });
          it('the method "_resolveComponent" should be called', function () {
            CRC.getResolvedComponent('compound-A');
            expect(spy.calledOnce).to.be.true;
          });
          it('resolvedComponent should be stored in cache ', function () {
            CRC.getResolvedComponent('compound-A');
            cache._resolvedComponents.should.be.have.property('compound-A');
            cache._resolvedComponents[ 'compound-A' ].should.be.an('object');
            expect(spy.calledOnce).to.be.true;
          });
        });
        describe('resolvedComponent should be get from cache',
          function () {
            var spy;

            beforeEach(function () {
              CRC.getResolvedComponent('compound-A');
              spy = sinon.spy(CRC, '_resolveComponent');
            });
            afterEach(function () {
              CRC._resolveComponent.restore();
            });
            it('should be equals with an expected document ',
              function () {
                var processedErg = CRC.getResolvedComponent('compound-A');
                expect(processedErg).to.be.not.undefined;
                expect(processedErg).to.be.not.null;
                expect(processedErg).to.be.not.empty;
                expect(processedErg).to.deep.equals(JSON.parse(resolvedComponent));
              });
            it('the method "_resolveComponent" should be not called', function () {
              CRC.getResolvedComponent('compound-A');
              expect(spy.called).to.be.not.true;
            });
          });
      });
    });
    describe('#invalidateResolvedManifest', function () {
      var cache;
      beforeEach(function () {
        cache = CRC.getCache();
        cache._resolvedComponents[ 'compound-A' ] =
          JSON.parse(resolvedComponent);
      });
      it('the cache "_resolvedComponents" should have not contains the resolvedComponent after invalidate',
        function () {
          expect(cache._resolvedComponents).to.have.property('compound-A');
          CRC.invalidateResolvedManifest('compound-A');
          expect(cache._resolvedComponents).to.have.not.property('compound-A');
        });
    });
  });
});
