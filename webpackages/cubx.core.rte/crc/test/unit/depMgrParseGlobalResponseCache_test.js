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
  'text!unit/addToCache/webpackageDocument8.json',
  'text!unit/addToCache/webpackageDocument9.json',
  'unit/utils/CubxNamespaceManager'
], function (CRC, DepMgr, pkg, pkg1, pkg2, pkg3, pkg4, pkg5, pkg6, pkg7, pkg8, pkg9, CubxNamespaceManager) {
  'use strict';
  var crcDepMgr;

  function cloneObject (obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  describe('Global Cache Parsing', function () {
    describe('#_parseGlobalResponseCache', function () {
      var globalResponseCache = [];
      var expectedLocalResponseCache = {};

      before(function () {
        CubxNamespaceManager.resetNamespace(CRC);
        crcDepMgr = CRC.getDependencyMgr();
        crcDepMgr.init();
        globalResponseCache.push(JSON.parse(pkg));
        globalResponseCache.push(JSON.parse(pkg1));
        globalResponseCache.push(JSON.parse(pkg2));
        globalResponseCache.push(JSON.parse(pkg3));
        globalResponseCache.push(JSON.parse(pkg4));
        globalResponseCache.push(JSON.parse(pkg5));
        globalResponseCache.push(JSON.parse(pkg6));
        globalResponseCache.push(JSON.parse(pkg7));
        globalResponseCache.push(JSON.parse(pkg8));
        globalResponseCache.push(JSON.parse(pkg9));
        expectedLocalResponseCache[ 'org.example.my-webpackage@0.2.0' ] = cloneObject(globalResponseCache[0]);
        expectedLocalResponseCache[ 'org.example.package-1@1.0.0' ] = cloneObject(globalResponseCache[1]);
        expectedLocalResponseCache[ 'org.example.package-2@1.0.0' ] = cloneObject(globalResponseCache[2]);
        expectedLocalResponseCache[ 'org.example.package-3@1.0.0' ] = cloneObject(globalResponseCache[3]);
        expectedLocalResponseCache[ 'org.example.package-4@1.0.0' ] = cloneObject(globalResponseCache[4]);
        expectedLocalResponseCache[ 'org.example.package-5@1.0.0' ] = cloneObject(globalResponseCache[5]);
        expectedLocalResponseCache[ 'org.example.package-6@1.0.0' ] = cloneObject(globalResponseCache[6]);
        expectedLocalResponseCache[ 'org.example.package-7@1.0.0' ] = cloneObject(globalResponseCache[7]);
        expectedLocalResponseCache[ 'org.example.package-8@1.0.0' ] = cloneObject(globalResponseCache[8]);
        expectedLocalResponseCache[ 'package-9@1.0.0' ] = cloneObject(globalResponseCache[9]);
        crcDepMgr._parseGlobalResponseCache(globalResponseCache);
      });
      after(function () {
        CubxNamespaceManager.resetNamespace(CRC);
      });
      it('should fill local _responseCache using globalResponseCache', function () {
        Object.keys(crcDepMgr._responseCache._cache).should.have.length(globalResponseCache.length);
      });
      it('should be equal the cache-entry with the initialised manifest for org.example.my-webpackage@0.2.0', function () {
        crcDepMgr._responseCache._cache['org.example.my-webpackage@0.2.0'].should.deep.equal(expectedLocalResponseCache['org.example.my-webpackage@0.2.0']);
      });
      it('should be equal the cache-entry with the initialised manifest for org.example.package-1@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-1@1.0.0'].should.deep.equal(expectedLocalResponseCache['org.example.package-1@1.0.0']);
      });
      it('should be equal the cache-entry with the initialised manifest for org.example.package-2@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-2@1.0.0'].should.deep.equal(expectedLocalResponseCache['org.example.package-2@1.0.0']);
      });
      it('should be the medel version updated in cache-entry for org.example.package-3@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-3@1.0.0'].should.not.deep.equal(expectedLocalResponseCache['org.example.package-3@1.0.0']);
        var expectedManifest = cloneObject(expectedLocalResponseCache['org.example.package-3@1.0.0']);
        expectedManifest.modelVersion = '9.1.1';
        var manifestInCache = crcDepMgr._responseCache._cache['org.example.package-3@1.0.0'];
        manifestInCache.should.be.deep.equal(expectedManifest);
      });
      it('should be equal the cache-entry with the initialised manifest for org.example.package-4@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-4@1.0.0'].should.deep.equal(expectedLocalResponseCache['org.example.package-4@1.0.0']);
      });
      it('should be equal the cache-entry with the initialised manifest for org.example.package-5@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-5@1.0.0'].should.deep.equal(expectedLocalResponseCache['org.example.package-5@1.0.0']);
      });
      it('should be equal the cache-entry with the initialised manifest for org.example.package-6@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-6@1.0.0'].should.deep.equal(expectedLocalResponseCache['org.example.package-6@1.0.0']);
      });
      it('should be equal the cache-entry with the initialised manifest for org.example.package-7@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-7@1.0.0'].should.deep.equal(expectedLocalResponseCache['org.example.package-7@1.0.0']);
      });
      it('should be converted in cache-entry for org.example.package-8@1.0.0', function () {
        crcDepMgr._responseCache._cache['org.example.package-8@1.0.0'].should.not.deep.equal(expectedLocalResponseCache['org.example.package-8@1.0.0']);
        var manifestInCache = crcDepMgr._responseCache._cache['org.example.package-8@1.0.0'];
        var origDependency = expectedLocalResponseCache[ 'org.example.package-8@1.0.0' ].artifacts.compoundComponents[0].dependencies[1];
        var expectedArtifactId = origDependency.artifactId + '#' + origDependency.endpointId;
        manifestInCache.artifacts.compoundComponents[0].dependencies[1].artifactId.should.equal(expectedArtifactId);
        manifestInCache.modelVersion.should.be.equal('9.1.1');
      });
      it('should be converted in cache-entry for org.example.package-9@1.0.0', function () {
        crcDepMgr._responseCache._cache['package-9@1.0.0'].should.not.deep.equal(expectedLocalResponseCache['package-9@1.0.0']);
        var manifestInCache = crcDepMgr._responseCache._cache['package-9@1.0.0'];
        var expectedArtifactIds = [];
        expectedLocalResponseCache['package-9@1.0.0'].artifacts.utilities.forEach(function (artifact) {
          var artifactId = artifact.artifactId;
          artifact.endpoints.forEach(function (endpoint) {
            expectedArtifactIds.push(artifactId + '#' + endpoint.endpointId);
          });
        });

        manifestInCache.artifacts.utilities.should.be.length(expectedArtifactIds.length);
        manifestInCache.artifacts.utilities.forEach(function (artifact) {
          expectedArtifactIds.should.include(artifact.artifactId);
        });
      });
    });
  });
});
