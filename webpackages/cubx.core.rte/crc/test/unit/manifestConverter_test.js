window.cubx.amd.define(
  [
    'manifestConverter',
    'text!unit/manifestConverter/manifest@8.3.1.json',
    'text!unit/manifestConverter/manifest@9.0.0.json',
    'text!unit/manifestConverter/manifest@9.1.0.json'
  ],
  function (manifestConverter, manifest831, manifest900, manifest910) {
    'use strict';

    describe('ManifestConverter', function () {
      describe('Converter Methods', function () {
        var manifest;
        var originalManifest;
        beforeEach(function () {
          manifest = JSON.parse(manifest831);
          originalManifest = JSON.parse(manifest831);
        });
        describe('#_addResourcesArrayToArtifacts()', function () {
          it('should add property "resources" containing an empty array to each artifact out of type [elementaryComponents|compoundComponents|utilities].', function () {
            manifestConverter._addResourcesArrayToArtifacts(manifest);
            Object.keys(manifest.artifacts).forEach(function (artifactType) {
              if (artifactType !== 'apps') {
                manifest.artifacts[artifactType].forEach(function (artifact) {
                  expect(artifact).to.have.ownProperty('resources');
                  expect(artifact.resources).to.be.an.instanceOf(Array);
                });
              }
            });
          });
        });
        describe('#_removeSingleEndpointsFromArtifacts()', function () {
          it('should remove "endpoints" property from all artifacts which have exactly one endpoint.', function () {
            manifestConverter._removeSingleEndpointsFromArtifacts(manifest);
            expect(manifest.artifacts.apps[0]).to.not.have.ownProperty('endpoints');
            expect(manifest.artifacts.compoundComponents[0]).to.not.have.ownProperty('endpoints');
            expect(manifest.artifacts.elementaryComponents[0]).to.not.have.ownProperty('endpoints');
            expect(manifest.artifacts.utilities[0]).to.not.have.ownProperty('endpoints');
            expect(manifest.artifacts.utilities[1]).to.have.ownProperty('endpoints');
          });
          it('should move "dependencies" and "resources" from the artifacts single endpoint to artifact itself.', function () {
            manifestConverter._removeSingleEndpointsFromArtifacts(manifest);
            expect(manifest.artifacts.apps[0]).to.have.ownProperty('dependencies');
            expect(manifest.artifacts.apps[0]).to.have.ownProperty('resources');
            expect(manifest.artifacts.apps[0].dependencies).to.eql(originalManifest.artifacts.apps[0].endpoints[0].dependencies);
            expect(manifest.artifacts.apps[0].resources).to.eql(originalManifest.artifacts.apps[0].endpoints[0].resources);

            expect(manifest.artifacts.compoundComponents[0]).to.have.ownProperty('dependencies');
            expect(manifest.artifacts.compoundComponents[0]).to.have.ownProperty('resources');
            expect(manifest.artifacts.compoundComponents[0].dependencies).to.eql(originalManifest.artifacts.compoundComponents[0].endpoints[0].dependencies);
            expect(manifest.artifacts.compoundComponents[0].resources).to.eql(originalManifest.artifacts.compoundComponents[0].endpoints[0].resources);

            expect(manifest.artifacts.elementaryComponents[0]).to.have.ownProperty('dependencies');
            expect(manifest.artifacts.elementaryComponents[0]).to.have.ownProperty('resources');
            expect(manifest.artifacts.elementaryComponents[0].dependencies).to.eql(originalManifest.artifacts.elementaryComponents[0].endpoints[0].dependencies);
            expect(manifest.artifacts.elementaryComponents[0].resources).to.eql(originalManifest.artifacts.elementaryComponents[0].endpoints[0].resources);

            expect(manifest.artifacts.utilities[0]).to.not.have.ownProperty('dependencies');
            expect(manifest.artifacts.utilities[0]).to.have.ownProperty('resources');
            expect(manifest.artifacts.utilities[0].resources).to.eql(originalManifest.artifacts.utilities[0].endpoints[0].resources);
          });
          it('should append "endpointId" of removed endpoint to "artifactId" using # separator.', function () {
            manifestConverter._removeSingleEndpointsFromArtifacts(manifest);
            var artifactId = originalManifest.artifacts.apps[0].artifactId;
            var endpointId = originalManifest.artifacts.apps[0].endpoints[0].endpointId;
            expect(manifest.artifacts.apps[0].artifactId).to.eql(artifactId + '#' + endpointId);

            artifactId = originalManifest.artifacts.compoundComponents[0].artifactId;
            endpointId = originalManifest.artifacts.compoundComponents[0].endpoints[0].endpointId;
            expect(manifest.artifacts.compoundComponents[0].artifactId).to.eql(artifactId + '#' + endpointId);

            artifactId = originalManifest.artifacts.elementaryComponents[0].artifactId;
            endpointId = originalManifest.artifacts.elementaryComponents[0].endpoints[0].endpointId;
            expect(manifest.artifacts.elementaryComponents[0].artifactId).to.eql(artifactId + '#' + endpointId);

            artifactId = originalManifest.artifacts.utilities[0].artifactId;
            endpointId = originalManifest.artifacts.utilities[0].endpoints[0].endpointId;
            expect(manifest.artifacts.utilities[0].artifactId).to.eql(artifactId + '#' + endpointId);
          });
        });
        describe('#_convertArtifactDependencyItems()', function () {
          beforeEach(function () {
            manifest = JSON.parse(manifest900);
          });
          it('should convert dependency "[webpackageId]/[artifactId]/[endpointId]" to {webpackageId: "[webpackageId]", artifactId: "[artifactId]#[endpointId]"}.', function () {
            manifestConverter._convertArtifactDependencyItems(manifest);
            var dependencies = manifest.artifacts.apps[0].dependencies;
            expect(dependencies).to.eql([
              {artifactId: 'bar-chart#main', webpackageId: 'd3-charts-lib@1.0'},
              {artifactId: 'component1#htmlimport', webpackageId: 'com.hm.demos.aviator@1.0'},
              {artifactId: 'component2#htmlimport', webpackageId: 'com.hm.demos.aviator@1.0'}
            ]);

            dependencies = manifest.artifacts.elementaryComponents[0].dependencies;
            expect(dependencies[0]).to.eql({artifactId: 'bar-chart#main', webpackageId: 'd3-charts-lib@1.0'});

            dependencies = manifest.artifacts.utilities[0].dependencies;
            expect(dependencies[0]).to.eql({artifactId: 'bar-chart#main', webpackageId: 'd3-charts-lib@1.0'});
            dependencies = manifest.artifacts.utilities[1].dependencies;
            expect(dependencies[0]).to.eql({artifactId: 'bar-chart#main', webpackageId: 'd3-charts-lib@1.0'});
            dependencies = manifest.artifacts.utilities[2].dependencies;
            expect(dependencies[0]).to.eql({artifactId: 'bar-chart#main', webpackageId: 'd3-charts-lib@1.0'});
          });
          it('should convert dependency "[webpackageId]/[artifactId]" to {webpackageId: "[webpackageId]", artifactId: "[artifactId]"}.', function () {
            manifestConverter._convertArtifactDependencyItems(manifest);
            var dependencies = manifest.artifacts.compoundComponents[0].dependencies;
            expect(dependencies[1]).to.eql({artifactId: 'generic', webpackageId: 'com.incowia.emob.generic-correlator@1.0.0-SNAPSHOT'});
            expect(dependencies[2]).to.eql({artifactId: 'station-view', webpackageId: 'com.incowia.emob.view@1.0.0-SNAPSHOT'});

            dependencies = manifest.artifacts.elementaryComponents[0].dependencies;
            expect(dependencies[1]).to.eql({artifactId: 'component1', webpackageId: 'com.hm.demos.aviator@1.0'});
            expect(dependencies[2]).to.eql({artifactId: 'component2', webpackageId: 'com.hm.demos.aviator@1.0'});
          });
          it('should convert dependency "this/[artifactId]/[endpointId]" to object {artifactId: "[artifactId]#[endpointId]"}.', function () {
            manifestConverter._convertArtifactDependencyItems(manifest);
            var dependency = manifest.artifacts.elementaryComponents[0].dependencies[3];
            expect(dependency).to.eql({artifactId: 'my-artifact#main'});
          });
          it('should convert dependency "this/[artifactId]" to object {artifactId: "[artifactId]"}.', function () {
            manifestConverter._convertArtifactDependencyItems(manifest);
            var dependency = manifest.artifacts.compoundComponents[0].dependencies[0];
            expect(dependency).to.eql({artifactId: 'my-util1'});
          });
        });
      });
    });
  });

