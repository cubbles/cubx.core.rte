/**
 * Created by jtrs on 19.05.2015.
 */
window.cubx.amd.define([ 'CRC',
    'dependencyManager',
    'jqueryLoader',
    'text!unit/addToCache/webpackageDocument.json',
    'text!unit/addToCache/webpackageDocument1.json',
    'text!unit/addToCache/webpackageDocument2.json',
    'text!unit/addToCache/webpackageDocument3.json',
    'text!unit/addToCache/webpackageDocument4.json',
    'text!unit/addToCache/webpackageDocument5.json',
    'text!unit/addToCache/webpackageDocument6.json',
    'text!unit/addToCache/webpackageDocument7.json',
    'unit/utils/CubxNamespaceManager'
  ],
  function (CRC, DepMgr, $, pkg, pkg1, pkg2, pkg3, pkg4, pkg5, pkg6, pkg7, CubxNamespaceManager) {
    'use strict';
    var crcDepMgr;

    describe('DepMgr.addToCache', function () {
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
      describe('#_resolveDepReference() from Cache', function () {
        var depReferenceItem;
        var cache;

        before(function () {
          cache = CRC.getCache();
          cache.clean();
          depReferenceItem = {
            'webpackageId': 'package-1@1.0.0',
            'artifactId': 'my-component-1',
            'endpointId': 'main',
            getArtifactId: function () {
              return this.artifactId;
            }
          };
          var data = documents[ 'org.example.package-1@1.0.0' ];
          sinon.stub(DepMgr, 'ajax').yieldsToAsync('success', data);
        });
        after(function () {
          DepMgr.ajax.restore();
        });
        beforeEach(function () {
          cache.clean();
        });
        afterEach(function () {
          cache.clean();
        });

        it('call of _resolveDepReference cause a cache entry', function (done) {
          var promise = crcDepMgr._resolveDepReference(depReferenceItem);
          promise.then(function () {
            var cache = crcDepMgr._crc.getCache();
            var erg = cache.getComponentCacheEntry('my-component-1');
            erg.should.be.not.empty;
            erg.should.be.an('object');
            done();
          });
        });
      });
      describe('#addToCache', function () {
        var cache;
        before(function () {
          cache = crcDepMgr._crc.getCache();
          cache._componentCache = {};
          sinon.stub(crcDepMgr, '_resolveDepReference', function (depReferenceItem) {
            var deferred = $.Deferred();
            var data = {
              item: depReferenceItem
            };
            this._storeManifestFiles(documents[ depReferenceItem.webpackageId ], depReferenceItem.artifactId);
            if (depReferenceItem.hasOwnProperty('webpackageId')) {
              data.data = crcDepMgr._extractArtifact(depReferenceItem,
                documents[ depReferenceItem.webpackageId ]);
            }
            // simulate a request duration of 500 ms for each request

            deferred.resolve(data);

            return deferred.promise();
          });
          var rootDependencies = documents[ 'org.example.my-webpackage@0.2.0' ].artifacts.apps[ 0 ]
            .endpoints[ 0 ].dependencies;
          crcDepMgr.addToCache(rootDependencies);
        });
        after(function () {
          cache._componentCache = {};
          crcDepMgr._resolveDepReference.restore();
        });

        it('referenced artifacts from my-component-1 should be exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-1');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-1@1.0.0');
          erg.should.have.property('artifactId', 'my-component-1');
          erg.should.have.property('artifactType', 'compoundComponent');
        });

        it('manifest.webpackage for my-component-2 should be exists exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-2');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-2@1.0.0');
          erg.should.have.property('artifactId', 'my-component-2');
          erg.should.have.property('artifactType', 'compoundComponent');
        });

        it('manifest.webpackage for my-component-3 should be exists exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-3');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-3@1.0.0');
          erg.should.have.property('artifactId', 'my-component-3');
          erg.should.have.property('artifactType', 'compoundComponent');
        });
        it('manifest.cubxfor my-util-4 should be not exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-util-4');
          expect(erg).to.be.empty;
        });

        it('manifest.webpackage for my-component-5 should be exists exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-5');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-5@1.0.0');
          erg.should.have.property('artifactId', 'my-component-5');
          erg.should.have.property('artifactType', 'elementaryComponent');
        });

        it('manifest.cubxfor my-util-6 should be not exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-util-6');
          expect(erg).to.be.empty;
        });

        it('manifest.webpackage for my-component-7 should be exists exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-7');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-7@1.0.0');
          erg.should.have.property('artifactId', 'my-component-7');
          erg.should.have.property('artifactType', 'compoundComponent');
        });

        it('manifest.webpackage for my-component-8 should be exists exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-8');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-7@1.0.0');
          erg.should.have.property('artifactId', 'my-component-8');
          erg.should.have.property('artifactType', 'compoundComponent');
        });

        it('manifest.webpackage for my-component-9 should be exists exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-9');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-7@1.0.0');
          erg.should.have.property('artifactId', 'my-component-9');
          erg.should.have.property('artifactType', 'elementaryComponent');
        });

        it('manifest.webpackage for my-component-10 should be exists exists in Cache', function () {
          var erg = cache.getComponentCacheEntry('my-component-10');
          expect(erg).not.empty;
          erg.should.be.an('object');
          erg.should.have.property('webpackageId', 'org.example.package-7@1.0.0');
          erg.should.have.property('artifactId', 'my-component-10');
          erg.should.have.property('artifactType', 'elementaryComponent');
        });
      });
    });
  });
