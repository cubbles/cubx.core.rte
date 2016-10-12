/* globals before, describe, it, beforeEach, after */
window.cubx.amd.define(
  [
    'manifestConverter',
    'text!unit/manifestConverter/manifest@8.3.1.json',
    'text!unit/manifestConverter/manifest@9.1.0.json',
    'text!unit/manifestConverter/convertedManifest@9.1.0.json'
  ],
  function (manifestConverter, manifest831, manifest910, convertedManifest910) {
    'use strict';

    describe('ManifestConverter', function () {
      describe('Single converter methods', function () {
        var manifest;
        var originalManifest;
        var convertedManifest = JSON.parse(convertedManifest910);
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
            manifest = JSON.parse(manifest831);
            manifestConverter._removeSingleEndpointsFromArtifacts(manifest);
            manifestConverter._convertMultipleEndpointsToArtifacts(manifest);
          });
          it('should convert dependency "[webpackageId]/[artifactId]/[endpointId]" to {webpackageId: "[webpackageId]", artifactId: "[artifactId]#[endpointId]"}.', function () {
            manifestConverter._convertArtifactDependencyItems(manifest);
            var dependencies = manifest.artifacts.apps[0].dependencies;
            expect(dependencies).to.eql(convertedManifest.artifacts.apps[0].dependencies);

            dependencies = manifest.artifacts.elementaryComponents[0].dependencies;
            expect(dependencies).to.eql(convertedManifest.artifacts.elementaryComponents[0].dependencies);

            dependencies = manifest.artifacts.utilities[1].dependencies;
            expect(dependencies).to.eql(convertedManifest.artifacts.utilities[1].dependencies);
            dependencies = manifest.artifacts.utilities[2].dependencies;
            expect(dependencies).to.eql(convertedManifest.artifacts.utilities[2].dependencies);
          });
          it('should convert dependency "this/[artifactId]/[endpointId]" to object {artifactId: "[artifactId]#[endpointId]"}.', function () {
            manifestConverter._convertArtifactDependencyItems(manifest);
            var dependency = manifest.artifacts.elementaryComponents[0].dependencies[3];
            expect(dependency).to.eql(convertedManifest.artifacts.elementaryComponents[0].dependencies[3]);
          });
        });
        describe('#_convertMultipleEndpointsToArtifacts()', function () {
          it('should remove all artifacts with multiple endpoints', function () {
            manifestConverter._convertMultipleEndpointsToArtifacts(manifest);
            Object.keys(manifest.artifacts).forEach(function (artifactType) {
              manifest.artifacts[artifactType].forEach(function (artifact) {
                if (artifact.hasOwnProperty('endpoints')) {
                  expect(artifact.endpoints).has.lengthOf(1);
                } else {
                  expect(artifact).to.not.hasOwnProperty('endpoints');
                }
              });
            });
          });
          it('should create new artifact with artifactId [artifactId]#[endpointId] for each endpoint holding coressponding resources and dependencies.', function () {
            manifestConverter._convertMultipleEndpointsToArtifacts(manifest);
            expect(manifest.artifacts.utilities).to.have.lengthOf(3);
            expect(manifest.artifacts.utilities[1]).to.eql({
              artifactId: 'my-util2#main',
              description: 'This util demonstrates ... This endpoint is used for...',
              resources: ['import.html'],
              dependencies: ['d3-charts-lib@1.0/bar-chart/main']
            });
            expect(manifest.artifacts.utilities[2]).to.eql({
              artifactId: 'my-util2#min',
              description: 'This util demonstrates ...',
              resources: ['import.min.html'],
              dependencies: ['d3-charts-lib@1.0/bar-chart/main']
            });
          });
        });
        describe('#_convertComponentIdToArtifactIdInMembers()', function () {
          it('should add property "artifactId" and remove property "componentId" for all members in compound components.', function () {
            manifestConverter._convertComponentIdToArtifactIdInMembers(manifest);
            manifest.artifacts.compoundComponents.forEach(function (compound) {
              compound.members.forEach(function (member) {
                expect(member).to.have.ownProperty('artifactId');
                expect(member).to.not.have.ownProperty('componentId');
              });
            });
          });
          it('should assign corresponding [artifactId] value to property "artifactId" for each member', function () {
            manifestConverter._convertComponentIdToArtifactIdInMembers(manifest);
            var members = manifest.artifacts.compoundComponents[0].members;
            expect(members[0].artifactId).to.eql('generic-view');
            expect(members[1].artifactId).to.eql('generic-view');
            expect(members[2].artifactId).to.eql('station-view');
          });
        });
        describe('#_removeEndpointsFromDependencyItems()', function () {
          var convertedManifest;
          var expectedManifest = JSON.parse(convertedManifest910);
          beforeEach(function () {
            convertedManifest = JSON.parse(manifest910);
          });
          it('should remove "endpointId" properties from each dependency if there is such a property', function () {
            manifestConverter._removeEndpointsFromDependencyItems(convertedManifest);
            Object.keys(convertedManifest.artifacts).forEach(function (artifactType) {
              convertedManifest.artifacts[artifactType].forEach(function (artifact) {
                if (artifact.hasOwnProperty('dependencies') && artifact.dependencies.length > 0) {
                  artifact.dependencies.forEach(function (dep) {
                    dep.should.not.have.ownProperty('endpointId');
                  });
                }
              });
            });
          });
          it('should append endpointId value to corresponding artifactId using separator "#"', function () {
            // expect(convertedManifest.artifacts.apps[0].dependencies).to.eql(expectedManifest.artifacts.apps[0].dependencies);
            manifestConverter._removeEndpointsFromDependencyItems(convertedManifest);
            expect(convertedManifest.artifacts.apps[0].dependencies).to.eql(expectedManifest.artifacts.apps[0].dependencies);
            expect(convertedManifest.artifacts.compoundComponents[0].dependencies).to.eql(expectedManifest.artifacts.compoundComponents[0].dependencies);
            expect(convertedManifest.artifacts.elementaryComponents[0].dependencies).to.eql(expectedManifest.artifacts.elementaryComponents[0].dependencies);
            expect(convertedManifest.artifacts.utilities[1].dependencies).to.eql(expectedManifest.artifacts.utilities[1].dependencies);
            expect(convertedManifest.artifacts.utilities[2].dependencies).to.eql(expectedManifest.artifacts.utilities[2].dependencies);
          });
        });
        describe('#_removeEndpointsFromDependencyExcludeItems()', function () {
          var convertedManifest;
          beforeEach(function () {
            convertedManifest = JSON.parse(manifest910);
          });
          it('should remove \'endpointId\' properties from each dependencyExclude if there is such a property', function () {
            manifestConverter._removeEndpointsFromDependencyExcludeItems(convertedManifest);
            Object.keys(convertedManifest.artifacts).forEach(function (artifactType) {
              convertedManifest.artifacts[artifactType].forEach(function (artifact) {
                if (artifact.hasOwnProperty('dependencyExclude') && artifact.dependencyExcludes.length > 0) {
                  artifact.dependencyExcludes.forEach(function (exclude) {
                    exclude.should.not.have.ownProperty('endpointId');
                  });
                }
              });
            });
          });
          it('should append \'endpointId\' value to corresponding artifactId using separator \'#\'', function () {
            manifestConverter._removeEndpointsFromDependencyExcludeItems(convertedManifest);
            convertedManifest.artifacts.compoundComponents[0].dependencyExcludes.should.eql([
              { artifactId: 'my-exclude1#main', webpackageId: 'com.package.exclude1' },
              { artifactId: 'my-exclude2', webpackageId: 'com.package.exclude2' }
            ]);
          });
        });
      });
      describe('Complete manifest transformations', function () {
        describe('#convert()', function () {
          it('should convert given manifest with model version 8.x.x to model version 9.1', function () {
            var manifest = JSON.parse(manifest831);
            var expectedResult = JSON.parse(convertedManifest910);
            var convertedManifest = manifestConverter.convert(manifest);
            expect(convertedManifest).to.eql(expectedResult);
          });
          it('should apply conversion directly on given manifest if it\'s an object', function () {
            var manifestAsObject = JSON.parse(manifest831);
            var convertedManifest = manifestConverter.convert(manifestAsObject);
            expect(convertedManifest).equal(manifestAsObject);
          });
          it('should return converted manifest as object if manifest is given as JSON string', function () {
            var manifestAsJson = manifest831;
            var convertedManifest = manifestConverter.convert(manifestAsJson);
            expect(convertedManifest).to.be.instanceOf(Object);
          });
        });
      });
      describe('Public API', function () {
        var artifact;
        var cleanArtifact;
        beforeEach(function () {
          artifact = {
            artifactId: 'my-artifact#main',
            resources: [
              'main.js'
            ],
            dependencies: [
              {webpackageId: 'my-webpackage', artifactId: 'comp-a#main'},
              {webpackageId: 'my-webpackage', artifactId: 'comp-b'}
            ]
          };
          cleanArtifact = {
            artifactId: 'my-artifact',
            resources: [
              'main.js'
            ],
            dependencies: [
              {webpackageId: 'my-webpackage', artifactId: 'comp-a'},
              {webpackageId: 'my-webpackage', artifactId: 'comp-b'}
            ]
          };
        });
        describe('#cleanArtifact()', function () {
          it('should return given artifact if no modification where necessary', function () {
            var result = manifestConverter.cleanArtifact(cleanArtifact);
            result.should.equal(cleanArtifact);
          });
          it('should return a new object representing a the cleaned artifact. All \'#[endpointId]\' appendices should be removed', function () {
            var result = manifestConverter.cleanArtifact(artifact);
            result.should.have.ownProperty('artifactId', artifact.artifactId);
            result.dependencies.should.eql([
              {webpackageId: 'my-webpackage', artifactId: 'comp-a'},
              {webpackageId: 'my-webpackage', artifactId: 'comp-b'}
            ]);
            result.should.not.equal(artifact);
          });
        });
      });
    });
  });

