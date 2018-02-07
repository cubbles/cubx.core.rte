window.cubx.amd.define([
  'CRC',
  'text!unit/cache/webpackageDocument.json',
  'text!unit/cache/webpackageDocument-simple.json',
  'unit/utils/CubxNamespaceManager' ],
function (CRC, webpackageDocument, simpleWebpackageDocument, CubxNamespaceManager) {
  'use strict';

  describe('Cache', function () {
    var cache;
    var webpackageDocumentObject;
    var simpleWebpackageDocumentObject;
    before(function () {
      CubxNamespaceManager.resetNamespace(CRC, 'Cache.before');
      cache = CRC.getCache();
      webpackageDocumentObject = JSON.parse(webpackageDocument);
      simpleWebpackageDocumentObject = JSON.parse(simpleWebpackageDocument);
    });
    after(function () {
      CubxNamespaceManager.resetNamespace(null, 'Cache.after');
    });
    beforeEach(function () {
      cache.clean();
    });

    describe('#new Cache()', function () {
      it('should create new ManifestCache instance with empty caches for each type of manifest', function () {
        expect(cache).to.have.ownProperty('_componentCache');
      });
    });
    describe('#addComponentCacheEntry', function () {
      beforeEach(function () {
        cache._componentCache = {};
      });
      afterEach(function () {
        cache._componentCache = {};
      });
      it('should be contains in the _componentCache as object', function () {
        var artifactId = 'my-elementary';
        cache.addComponentCacheEntry(webpackageDocument, artifactId);
        cache._componentCache[ artifactId ].should.have.property('artifactId',
          webpackageDocumentObject.artifacts.elementaryComponents[ 0 ].artifactId);
      });
    });
    describe('#getComponentCacheEntry', function () {
      var key = 'test-key';
      var webpackageId = 'aaa-bbb-ccc@123';
      var artifact;
      var key2 = 'test-key2';
      var webpackageId2 = 'aaa-bbb-ccc@125';
      var artifact2;
      beforeEach(function () {
        artifact = {
          artifactId: key,
          artifactType: 'compoundComponent',
          webpackageId: webpackageId
        };

        artifact2 = {
          artifactId: key2,
          artifactType: 'elemetaryComponent',
          webpackageId: webpackageId2
        };

        cache._componentCache[ key ] = artifact;
        cache._componentCache[ key2 ] = artifact2;
      });
      afterEach(function () {
        cache._componentCache = {};
      });
      it('should get the under ' + key + ' stored artifact', function () {
        cache.getComponentCacheEntry(key).should.eql(artifact);
      });

      it('should get the under ' + key2 + ' stored artifact', function () {
        cache.getComponentCacheEntry(key2).should.eql(artifact2);
      });
    });

    describe('#getAllComponents', function () {
      beforeEach(function () {
        cache._componentCache.aa = { foo: 'bar' };
        cache._componentCache.bb = { bar: 'foo' };
      });
      afterEach(function () {
        cache._componentCache = {};
      });
      it('returned object is deep equal with _componentCache attribute', function () {
        cache.getAllComponents().should.eql(cache._componentCache);
      });
    });

    describe('#setResolvedComponent()', function () {
      var id = '12345-1.2.3';
      var name = 'testA';
      var processedManifest = { 'name': name, '_id': id };
      it('should set the processedManifest for the key', function () {
        cache.setResolvedComponent(id, processedManifest);
        expect(cache._resolvedComponents[ id ]).to.deep.equal(processedManifest);
      });
      afterEach(function () {
        cache._resolvedComponents[ id ] = null;
      });
    });

    describe('#getResolvedComponent()', function () {
      var id = '12345-1.2.3';
      var name = 'testA';
      var processedManifest = { 'name': name, '_id': id };
      beforeEach(function () {
        cache._resolvedComponents[ id ] = processedManifest;
      });
      afterEach(function () {
        cache._resolvedComponents[ id ] = null;
      });
      it('should get the processedManifest for the key', function () {
        expect(cache.getResolvedComponent(id)).to.deep.equal(processedManifest);
      });
      it('should get null, if by the key no cache entry exists', function () {
        expect(cache.getResolvedComponent('bla')).to.be.null;
      });
    });
    describe('#deleteResolvedComponent()', function () {
      var id = '12345-1.2.3';
      var name = 'testA';
      var key = id;
      var processedManifest = { 'name': name, '_id': id };
      beforeEach(function () {
        cache._resolvedComponents[ key ] = processedManifest;
      });
      it('should delete by key cached object', function () {
        expect(cache._resolvedComponents).to.have.property(key);
        cache.deleteResolvedComponent(key);
        expect(cache._resolvedComponents).to.have.not.property(key);
      });

      afterEach(function () {

      });
    });
    describe('#_setComponentCacheEntryForKey', function () {
      var key;
      var artifact;
      beforeEach(function () {
        cache._componentCache = {};
        key = 'test-artifact-id';
        artifact = {
          artifactId: key,
          artifactType: 'compoundComponents',
          webpackageId: 'id-xxx'
        };
      });

      afterEach(function () {
        cache._componentCache = {};
      });

      it('should set a entry in _componentCache with the given key', function () {
        cache._setComponentCacheEntryForKey(key, artifact);
        cache._componentCache.should.include.keys(key);
        cache._componentCache[ key ].should.eql(artifact);
      });
    });
    describe('#_addComponentCacheEntry', function () {
      var warnSpy;
      beforeEach(function () {
        cache._componentCache = {};
        warnSpy = sinon.spy(console, 'warn');
      });
      afterEach(function () {
        cache._componentCache = {};
        console.warn.restore();
      });
      describe('add  componentEntry to empty cache', function () {
        it('add compoundComponent to empty cache', function () {
          var key = 'test-artifact-id';
          var artifact = {
            artifactId: key,
            artifactType: 'compoundComponent',
            webpackageId: 'id-xxx'
          };
          cache._addComponentCacheEntry(artifact);
          cache._componentCache.should.not.empty;
          cache._componentCache[ key ].should.eql(artifact);
          expect(warnSpy.called).to.be.false;
        });
        it('add elementaryComponent to empty cache', function () {
          var key = 'test-artifact-id';
          var artifact = {
            artifactId: key,
            artifactType: 'elementaryComponent',
            webpackageId: 'id-xxx'
          };
          cache._addComponentCacheEntry(artifact);
          cache._componentCache.should.not.empty;
          cache._componentCache[ key ].should.eql(artifact);
          expect(warnSpy.called).to.be.false;
        });
      });
      describe('add componentEntry, if an the component with the same artifactId already in cache',
        function () {
          it('for compoundComponent should exist the cache entry by artifactId', function () {
            var key = 'test-artifact-id';
            var artifact = {
              artifactId: key,
              artifactType: 'compoundComponent',
              webpackageId: 'id-xxx'
            };
            cache._componentCache[ key ] = artifact;
            cache._addComponentCacheEntry(artifact);
            cache._componentCache.should.not.empty;
            expect(cache._componentCache).to.have.all.keys(key);
            cache._componentCache[ key ].should.eql(artifact);
            expect(warnSpy.called).to.be.false;
          });
          it('for elementaryComponent should exist the cache entry by artifactId', function () {
            var key = 'test-artifact-id';
            var artifact = {
              artifactId: key,
              artifactType: 'elementaryComponent',
              webpackageId: 'id-xxx'
            };
            var id = artifact.webpackageId + '/' + key;
            cache._componentCache[ id ] = artifact;
            cache._componentCache[ key ] = artifact;
            cache._addComponentCacheEntry(artifact);
            cache._componentCache.should.not.empty;
            expect(cache._componentCache).to.have.all.keys(key, id);
            cache._componentCache[ key ].should.eql(artifact);
            cache._componentCache[ id ].should.eql(artifact);
            expect(warnSpy.called).to.be.false;
          });
        });
      describe('add componentEntry, if the articleId exist for another webpackage', function () {
        it('it should be exists with warning ', function () {
          var key = 'test-artifact-id';
          var oldArtifact = {
            artifactId: key,
            artifactType: 'compoundComponents',
            webpackageId: 'id-yyy'
          };
          var artifact = {
            artifactId: key,
            artifactType: 'elementaryComponent',
            webpackageId: 'id-xxx'
          };
          cache._componentCache[ key ] = oldArtifact;
          cache._addComponentCacheEntry(artifact);
          cache._componentCache.should.not.empty;
          expect(cache._componentCache).to.have.all.keys(key);
          cache._componentCache[ key ].should.eql(artifact);

          expect(warnSpy.called).to.be.true;
        });
      });
    });
    describe('#_findComponentInDocument', function () {
      describe('in document with all artefacts', function () {
        it('should find the component with artifactId "my-elementary"', function () {
          var artifactId = 'my-elementary';
          var artifact = cache._findComponentInDocument(webpackageDocumentObject, artifactId);
          expect(artifact).to.be.not.null;
          artifact.should.have.property('artifactId', artifactId);
        });
        it('should find the component with artifactId "my-compound"', function () {
          var artifactId = 'my-compound';
          var artifact = cache._findComponentInDocument(webpackageDocumentObject, artifactId);
          expect(artifact).to.be.not.null;
          artifact.should.have.property('artifactId', artifactId);
        });
        it('should not find the artifact with artifactId "my-util1"', function () {
          var artifactId = 'my-util1';
          var artifact = cache._findComponentInDocument(webpackageDocumentObject, artifactId);
          expect(artifact).to.be.null;
        });
        it('should not find the artifact with artifactId "my-app"', function () {
          var artifactId = 'my-app';
          var artifact = cache._findComponentInDocument(webpackageDocumentObject, artifactId);
          expect(artifact).to.be.null;
        });
      });
      describe('without compoundComponent and elementaryComponent artifacts,', function () {
        it('should not find the component with artifactId', function () {
          var artifactId = 'notexisiting';
          var artifact = cache._findComponentInDocument(simpleWebpackageDocumentObject, artifactId);
          expect(artifact).to.be.null;
        });
      });
    });
  });
});
