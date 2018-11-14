'use strict';

window.cubx = window.cubx || {};
window.cubx.amd = window.cubx.amd || {};
window.cubx.amd.define([ 'crcLoader', 'dependencyTagTransformer' ], function (crcLoader, DependencyTagTransformer) {
  describe('dependencyTagTransformer', function () {
    var dependencyTagTransformer = new DependencyTagTransformer();
    describe('#addDependenciesAndExcludesToRootDependencies', function () {
      var element;
      var elementName;
      var webpackageId;

      function createDepElement (elementName, index) {
        var el = document.createElement(elementName);
        el.setAttribute('webpackage-id', 'webpackage' + (index) + '@1.2.3');
        el.setAttribute('artifact-id', 'artifact-' + (index));
        return el;
      }
      before(function () {
        crcLoader._crcRoot = document.body;
      });
      after(function () {
        delete crcLoader._crcRoot;
      });
      beforeEach(function () {
        window.cubx.CRCInit = { rootDependencies: [] };
        webpackageId = 'example@1.2.3';
        elementName = 'my-cubbles';
        element = document.createElement(elementName);
        crcLoader._crcRoot.appendChild(element);
        window.cubx.CRCInit.rootDependencies.push({
          webpackageId: webpackageId,
          artifactId: elementName
        });
        element.appendChild(document.createElement('div'));
        var cubxDepExludesElement = document.createElement('cubx-dependency-excludes');
        element.appendChild(cubxDepExludesElement);
        element.appendChild(document.createElement('div'));
        // index = 0
        cubxDepExludesElement.appendChild(createDepElement('cubx-dependency-exclude', 0));
        cubxDepExludesElement.appendChild(document.createElement('br'));
        // index = 1
        cubxDepExludesElement.appendChild(createDepElement('cubx-dependency-exclude', 1));

        var cubxDepsElement = document.createElement('cubx-dependencies');
        element.appendChild(cubxDepsElement);
        element.appendChild(document.createElement('div'));
        // index = 2
        cubxDepsElement.appendChild(createDepElement('cubx-dependency', 2));
        cubxDepsElement.appendChild(document.createElement('br'));
        // index = 3
        cubxDepsElement.appendChild(createDepElement('cubx-dependency', 3));
      });
      afterEach(function () {
        crcLoader._crcRoot.removeChild(element);
        element = null;
        delete window.cubx.CRCInit.rootDependencies;
      });
      describe('crc root contains one cubbles element', function () {
        beforeEach(function () {
          dependencyTagTransformer.addDependenciesAndExcludesToRootDependencies(crcLoader);
        });
        it('cubx.CRCInit.rootDependencies should have length = 3', function () {
          window.cubx.CRCInit.rootDependencies.should.have.length(3);
        });
        it('cubx.CRCInit.rootDependencies second element should be created from the first cubx-dependency element', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 1 ];
          dep.should.have.property('webpackageId', 'webpackage2@1.2.3');
          dep.should.have.property('artifactId', 'artifact-2');
        });
        it('cubx.CRCInit.rootDependencies third element should be created from the second cubx-dependency element', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 2 ];
          dep.should.have.property('webpackageId', 'webpackage3@1.2.3');
          dep.should.have.property('artifactId', 'artifact-3');
        });
        it('should create and assign dependencyExcludes to rootDependencies based on existing cubx-dependency-excludes', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 0 ];
          dep.should.have.property('dependencyExcludes');
          dep.dependencyExcludes[ 0 ].should.be.eql({webpackageId: 'webpackage0@1.2.3', artifactId: 'artifact-0'});
          dep.dependencyExcludes[ 1 ].should.be.eql({webpackageId: 'webpackage1@1.2.3', artifactId: 'artifact-1'});
        });
      });
      describe('crc root contains two cubbles elements', function () {
        var element2;
        var elementName2;
        var webpackageId2;
        beforeEach(function () {
          webpackageId2 = 'example2@1.2.3';
          elementName2 = 'my-cubbles-2';
          element2 = document.createElement(elementName2);
          crcLoader._crcRoot.appendChild(element2);
          window.cubx.CRCInit.rootDependencies.push({
            webpackageId: webpackageId2,
            artifactId: elementName2
          });
          element2.appendChild(document.createElement('div'));
          var cubxDepExcludesElement = document.createElement('cubx-dependency-excludes');
          element2.appendChild(cubxDepExcludesElement);
          element2.appendChild(document.createElement('div'));
          // index = 4
          cubxDepExcludesElement.appendChild(createDepElement('cubx-dependency-exclude', 4));
          cubxDepExcludesElement.appendChild(document.createElement('br'));
          // index = 5
          cubxDepExcludesElement.appendChild(createDepElement('cubx-dependency-exclude', 5));

          var cubxDepsElement = document.createElement('cubx-dependencies');
          element2.appendChild(cubxDepsElement);
          element2.appendChild(document.createElement('div'));
          // index = 6
          cubxDepsElement.appendChild(createDepElement('cubx-dependency', 6));
          cubxDepsElement.appendChild(document.createElement('br'));
          // index = 7
          cubxDepsElement.appendChild(createDepElement('cubx-dependency', 7));
          dependencyTagTransformer.addDependenciesAndExcludesToRootDependencies(crcLoader);
        });
        afterEach(function () {
          crcLoader._crcRoot.removeChild(element2);
          element2 = null;
        });
        it('cubx.CRCInit.rootDependencies should have length = 6', function () {
          window.cubx.CRCInit.rootDependencies.should.have.length(6);
        });
        it('cubx.CRCInit.rootDependencies third element should be created from the first cubx-dependency element', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 2 ];
          dep.should.have.property('webpackageId', 'webpackage2@1.2.3');
          dep.should.have.property('artifactId', 'artifact-2');
        });
        it('cubx.CRCInit.rootDependencies forth element should be created from the second cubx-dependency element', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 3 ];
          dep.should.have.property('webpackageId', 'webpackage3@1.2.3');
          dep.should.have.property('artifactId', 'artifact-3');
        });
        it('cubx.CRCInit.rootDependencies fifth element should be created from the first cubx-dependency element', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 4 ];
          dep.should.have.property('webpackageId', 'webpackage6@1.2.3');
          dep.should.have.property('artifactId', 'artifact-6');
        });
        it('cubx.CRCInit.rootDependencies sixth element should be created from the second cubx-dependency element', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 5 ];
          dep.should.have.property('webpackageId', 'webpackage7@1.2.3');
          dep.should.have.property('artifactId', 'artifact-7');
        });
        it('should create and assign dependencyExcludes to rootDependencies based on existing cubx-dependency-excludes', function () {
          var dep = window.cubx.CRCInit.rootDependencies[ 0 ];
          dep.should.have.property('dependencyExcludes');
          dep.dependencyExcludes[ 0 ].should.be.eql({webpackageId: 'webpackage0@1.2.3', artifactId: 'artifact-0'});
          dep.dependencyExcludes[ 1 ].should.be.eql({webpackageId: 'webpackage1@1.2.3', artifactId: 'artifact-1'});
          dep = window.cubx.CRCInit.rootDependencies[ 1 ];
          dep.should.have.property('dependencyExcludes');
          dep.dependencyExcludes[ 0 ].should.be.eql({webpackageId: 'webpackage4@1.2.3', artifactId: 'artifact-4'});
          dep.dependencyExcludes[ 1 ].should.be.eql({webpackageId: 'webpackage5@1.2.3', artifactId: 'artifact-5'});
        });
      });
      describe('crc root contains two cubbles elements, but rootDependencies is empty', function () {
        var element2;
        var elementName2;
        var spy;
        beforeEach(function () {
          delete window.cubx.CRCInit.rootDependencies;
          elementName2 = 'my-cubbles-2';
          element2 = document.createElement(elementName2);
          crcLoader._crcRoot.appendChild(element2);

          element2.appendChild(document.createElement('div'));
          var cubxDepExcludesElement = document.createElement('cubx-dependency-excludes');
          element2.appendChild(cubxDepExcludesElement);
          element2.appendChild(document.createElement('div'));
          // index = 4
          cubxDepExcludesElement.appendChild(createDepElement('cubx-dependency-exclude', 4));
          cubxDepExcludesElement.appendChild(document.createElement('br'));
          // index = 5
          cubxDepExcludesElement.appendChild(createDepElement('cubx-dependency-exclude', 5));

          var cubxDepsElement = document.createElement('cubx-dependencies');
          element2.appendChild(cubxDepsElement);
          element2.appendChild(document.createElement('div'));
          // index = 6
          cubxDepsElement.appendChild(createDepElement('cubx-dependency', 6));
          cubxDepsElement.appendChild(document.createElement('br'));
          // index = 7
          cubxDepsElement.appendChild(createDepElement('cubx-dependency', 7));
          spy = sinon.spy(console, 'warn');
        });
        afterEach(function () {
          crcLoader._crcRoot.removeChild(element2);
          element2 = null;
          console.warn.restore();
        });
        it('cubx.CRCInit.rootDependencies should have not exists', function () {
          dependencyTagTransformer.addDependenciesAndExcludesToRootDependencies(crcLoader);
          window.cubx.CRCInit.should.have.not.property('rootDependencies');
        });
        it('cubx.CRCInit.rootDependencyExludes should not exist', function () {
          dependencyTagTransformer.addDependenciesAndExcludesToRootDependencies(crcLoader);
          window.cubx.CRCInit.should.have.not.property('rootDependencyExcludes');
        });
        it('should be not logged a warning if runtimeMode = prod (default)', function () {
          dependencyTagTransformer.addDependenciesAndExcludesToRootDependencies(crcLoader);
          spy.should.be.not.called;
        });
        it('should be logged a warning if runtimeMode = dev', function () {
          window.cubx.CRCInit.runtimeMode = 'dev';
          dependencyTagTransformer.addDependenciesAndExcludesToRootDependencies(crcLoader);
          spy.should.be.calledOnce;
          window.cubx.CRCInit.runtimeMode = 'prod';
        });
      });
    });
    describe('#_findDependenciesAndExcludesInElement', function () {
      var element;
      var elementName;
      beforeEach(function () {
        elementName = 'my-cubbles';
        element = document.createElement(elementName);
      });
      afterEach(function () {
        element = null;
      });
      describe('element contains <cubx-dependencies>', function () {
        beforeEach(function () {
          var index;

          function createDepElement (elementName) {
            var el = document.createElement(elementName);
            el.setAttribute('webpackage-id', 'webpackage' + (index++) + '@1.2.3');
            el.setAttribute('artifact-id', 'artifact-' + (index++));
            return el;
          }

          element.appendChild(document.createElement('div'));
          var cubxDepsElement = document.createElement('cubx-dependencies');
          element.appendChild(cubxDepsElement);
          element.appendChild(document.createElement('div'));
          cubxDepsElement.appendChild(createDepElement('cubx-dependency'));
          cubxDepsElement.appendChild(document.createElement('br'));
          cubxDepsElement.appendChild(createDepElement('cubx-dependency'));
        });
        afterEach(function () {
        });
        it('should have a property "dependencies with length = 2', function () {
          var erg = dependencyTagTransformer._findDependenciesAndExcludesInElement(element);
          erg.should.have.property('dependencies');
          erg.dependencies.should.have.length(2);
          erg.should.have.property('excludes');
          erg.excludes.should.have.length(0);
        });
      });
      describe('element contains <cubx-dependency-excludes>', function () {
        beforeEach(function () {
          var index;

          function createDepElement (elementName) {
            var el = document.createElement(elementName);
            el.setAttribute('webpackage-id', 'webpackage' + (index++) + '@1.2.3');
            el.setAttribute('artifact-id', 'artifact-' + (index++));
            return el;
          }

          element.appendChild(document.createElement('div'));
          var cubxDepsElement = document.createElement('cubx-dependency-excludes');
          element.appendChild(cubxDepsElement);
          element.appendChild(document.createElement('div'));
          cubxDepsElement.appendChild(createDepElement('cubx-dependency-exclude'));
          cubxDepsElement.appendChild(document.createElement('br'));
          cubxDepsElement.appendChild(createDepElement('cubx-dependency-exclude'));
        });
        afterEach(function () {
        });
        it('should have a property "dependencies with length = 2', function () {
          var erg = dependencyTagTransformer._findDependenciesAndExcludesInElement(element);
          erg.should.have.property('dependencies');
          erg.dependencies.should.have.length(0);
          erg.should.have.property('excludes');
          erg.excludes.should.have.length(2);
        });
      });
      describe('element contains <cubx-dependencies> and <cubx-dependency-exludes>', function () {
        beforeEach(function () {
          var index;

          function createDepElement (elementName) {
            var el = document.createElement(elementName);
            el.setAttribute('webpackage-id', 'webpackage' + (index++) + '@1.2.3');
            el.setAttribute('artifact-id', 'artifact-' + (index++));
            return el;
          }

          element.appendChild(document.createElement('div'));
          var cubxDepExludesElement = document.createElement('cubx-dependency-excludes');
          element.appendChild(cubxDepExludesElement);
          element.appendChild(document.createElement('div'));
          cubxDepExludesElement.appendChild(createDepElement('cubx-dependency-exclude'));
          cubxDepExludesElement.appendChild(document.createElement('br'));
          cubxDepExludesElement.appendChild(createDepElement('cubx-dependency-exclude'));

          var cubxDepsElement = document.createElement('cubx-dependencies');
          element.appendChild(cubxDepsElement);
          element.appendChild(document.createElement('div'));
          cubxDepsElement.appendChild(createDepElement('cubx-dependency'));
          cubxDepsElement.appendChild(document.createElement('br'));
          cubxDepsElement.appendChild(createDepElement('cubx-dependency'));
        });
        afterEach(function () {
        });
        it('should have a property "dependencies with length = 2', function () {
          var erg = dependencyTagTransformer._findDependenciesAndExcludesInElement(element);
          erg.should.have.property('dependencies');
          erg.dependencies.should.have.length(2);
          erg.should.have.property('excludes');
          erg.excludes.should.have.length(2);
        });
      });
      describe('element contains wether <cubx-dependency-excludes> or <cubx-dependencies>', function () {
        beforeEach(function () {
          element.appendChild(document.createElement('div'));
          element.appendChild(document.createElement('p'));
        });
        afterEach(function () {
        });
        it('should have a property "dependencies with length = 2', function () {
          var erg = dependencyTagTransformer._findDependenciesAndExcludesInElement(element);
          erg.should.have.property('dependencies');
          erg.dependencies.should.have.length(0);
          erg.should.have.property('excludes');
          erg.excludes.should.have.length(0);
        });
      });
    });
    describe('#_filterChildElements', function () {
      var element;
      var childElementName;
      beforeEach(function () {
        childElementName = 'my-child-element';
        element = document.createElement('parent-element');
        element.appendChild(document.createElement('other-element'));
        element.appendChild(document.createElement(childElementName));
        element.appendChild(document.createElement(childElementName));
        element.appendChild(document.createElement('div'));
        element.appendChild(document.createElement(childElementName));
      });
      afterEach(function () {
        element = null;
      });
      it('should results 3 elements', function () {
        var list = dependencyTagTransformer._filterChildElements(element, childElementName);
        list.should.have.length(3);
      });
      it('all elements should be my.child.element', function () {
        var list = dependencyTagTransformer._filterChildElements(element, childElementName);
        list[ 0 ].tagName.should.be.equal(childElementName.toUpperCase());
        list[ 1 ].tagName.should.be.equal(childElementName.toUpperCase());
        list[ 2 ].tagName.should.be.equal(childElementName.toUpperCase());
      });
    });
    describe('#_addToCubxCRCInit', function () {
      before(function () {
        crcLoader._crcRoot = document.body;
      });
      after(function () {
        delete crcLoader._crcRoot;
      });
      describe('add to rootDependencies', function () {
        var element;
        var webpackageId;
        var artifactWebpackageId;
        var artifactId;
        var artifactElement;
        var elementName;
        var artifactElementName;
        beforeEach(function () {
          webpackageId = 'example@234';
          artifactId = 'example-component';
          artifactWebpackageId = 'xyz@345';
          elementName = 'cubx-dependency';
          artifactElementName = 'root-artifact';

          element = document.createElement(elementName);
          element.setAttribute('webpackage-id', webpackageId);
          element.setAttribute('artifact-id', artifactId);

          artifactElement = document.createElement(artifactElementName);
          artifactElement.setAttribute('cubx-webpackage-id', artifactWebpackageId);
        });
        afterEach(function () {
          element = null;
          artifactElement = null;
        });
        describe('rootDependencies has origin elements', function () {
          describe('<cubx-dependency> element has attributes webpackageId, artifactId', function () {
            beforeEach(function () {
              window.cubx.CRCInit = { rootDependencies: [] };
              // parent cubbles dependency
              window.cubx.CRCInit.rootDependencies.push({
                artifactId: artifactElement.tagName.toLowerCase(),
                webpackageId: artifactWebpackageId
              });
              // origin dependencies
              window.cubx.CRCInit.rootDependencies.push(
                {
                  webpackageId: 'one@1.2.3',
                  artifactId: 'one-element'
                }
              );
              window.cubx.CRCInit.rootDependencies.push(
                {
                  webpackageId: 'two@1.2.3',
                  artifactId: 'two-element'
                }
              );
              var originLength = 2;
              dependencyTagTransformer._addToCubxCRCInit({dependencies: [ element ], excludes: []}, artifactElement, originLength);
            });
            afterEach(function () {
              delete window.cubx.CRCInit.rootDependencies;
            });
            it('the length of rootDependencies should be 4', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(4);
            });
            it('the length of rootDependencies should be 3', function () {
              // Added dependency is the second element (origin dependencies on the end of the rootdependencies, parent cubbles dependency is the first)
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('webpackageId', webpackageId);
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('artifactId', artifactId);
            });
          });
        });
        describe('rootDependencies has not origin elements', function () {
          beforeEach(function () {
            window.cubx.CRCInit = { rootDependencies: [] };
            window.cubx.CRCInit.rootDependencies.push({
              artifactId: artifactElement.tagName.toLowerCase(),
              webpackageId: artifactWebpackageId
            });
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
          });
          describe('<cubx-dependency> element has attributes webpackageId, artifactId', function () {
            beforeEach(function () {
              dependencyTagTransformer._addToCubxCRCInit({dependencies: [ element ], excludes: []}, artifactElement, 0);
            });
            it('the length of rootDependencies should be 4', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(2);
            });
            it('the added dependency should be the second element', function () {
              // Added dependency is the second element (origin dependencies on the end of the rootdependencies, parent cubbles dependency is the first)
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('webpackageId', webpackageId);
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('artifactId', artifactId);
            });
          });
          describe('add 2 <cubx-dependency> elements', function () {
            var element2;
            var webpackageId2;
            var artifactId2;
            beforeEach(function () {
              webpackageId2 = 'example@345';
              artifactId2 = 'example-component-2';
              element2 = document.createElement(elementName);
              element2.setAttribute('webpackage-id', webpackageId2);
              element2.setAttribute('artifact-id', artifactId2);

              dependencyTagTransformer._addToCubxCRCInit({dependencies: [ element, element2 ], excludes: []}, artifactElement, 0);
            });
            afterEach(function () {
              element2 = null;
            });
            it('the length of rootDependencies should be 3', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(3);
            });

            it('the added first dependency should be the second element', function () {
              // Added dependency is the second element (origin dependencies on the end of the rootdependencies, parent cubbles dependency is the first)
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('webpackageId', webpackageId);
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('artifactId', artifactId);
            });
            it('the added second dependency should be the third element', function () {
              // Added dependency is the second element (origin dependencies on the end of the rootdependencies, parent cubbles dependency is the first)
              window.cubx.CRCInit.rootDependencies[ 2 ].should.have.property('webpackageId', webpackageId2);
              window.cubx.CRCInit.rootDependencies[ 2 ].should.have.property('artifactId', artifactId2);
            });
          });
          describe('<cubx-dependency> element has just attribute artifactId', function () {
            var element2;
            var artifactId2;
            beforeEach(function () {
              artifactId2 = 'example-component-2';
              element2 = document.createElement(elementName);
              element2.setAttribute('artifact-id', artifactId2);

              dependencyTagTransformer._addToCubxCRCInit({dependencies: [ element2 ], excludes: []}, artifactElement, 0);
            });
            afterEach(function () {
              element2 = null;
            });
            it('the length of rootDependencies should be 2', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(2);
            });

            it('the added first dependency should be the second element, with webpackageId of parent cubbles element', function () {
              // Added dependency is the second element (origin dependencies on the end of the rootdependencies, parent cubbles dependency is the first)
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('webpackageId', artifactWebpackageId);
              window.cubx.CRCInit.rootDependencies[ 1 ].should.have.property('artifactId', artifactId2);
            });
          });
          describe('<cubx-dependency> element has no attribute artifactId', function () {
            var element2;
            var spyError;
            beforeEach(function () {
              element2 = document.createElement(elementName);
              spyError = sinon.spy(console, 'error');
              dependencyTagTransformer._addToCubxCRCInit({dependencies: [ element2 ], excludes: []}, artifactElement, 0);
            });
            afterEach(function () {
              element2 = null;
              spyError.restore();
            });
            it('the length of rootDependencies should be 1', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(1);
            });

            it('it should be log a warning', function () {
              spyError.should.be.calledOnce;
            });
          });
        });
      });
    });
    describe('#_createDependency', function () {
      before(function () {
        crcLoader._crcRoot = document.body;
      });
      after(function () {
        delete crcLoader._crcRoot;
      });
      describe('dependency element created (element has webpackage-id and artifact-id attribute', function () {
        var depArray;
        var element;
        var webpackageId;
        var artifactWebpackageId;
        var artifactId;
        var artifactElement;
        var elementName;
        var artifactElementName;
        beforeEach(function () {
          depArray = [];
          webpackageId = 'example@234';
          artifactId = 'example-component';
          artifactWebpackageId = 'xyz@345';
          elementName = 'cubx-dependency';
          artifactElementName = 'root-artifact';
          element = document.createElement(elementName);
          element.setAttribute('webpackage-id', webpackageId);
          element.setAttribute('artifact-id', artifactId);

          artifactElement = document.createElement(artifactElementName);
          artifactElement.setAttribute('cubx-webpackage-id', artifactWebpackageId);
          depArray.push({
            artifactId: artifactElement.tagName.toLowerCase(),
            webpackageId: artifactWebpackageId
          });
        });
        afterEach(function () {
          delete window.cubx.CRCInit.rootDependencies;
          depArray = [];
        });

        it('should create a new dependency', function () {
          var dep = dependencyTagTransformer._createDependency(element, artifactElement, depArray);
          dep.should.have.property('webpackageId', webpackageId);
          dep.should.have.property('artifactId', artifactId);
          dep.should.have.not.property('endpointId');
        });
      });
      describe('dependency element created (element has webpackage-id="this" and artifact-id attribute', function () {
        var depArray;
        var element;
        var webpackageId;
        var artifactWebpackageId;
        var artifactId;
        var artifactElement;
        var elementName;
        var artifactElementName;
        beforeEach(function () {
          depArray = [];
          webpackageId = 'this';
          artifactId = 'example-component';
          artifactWebpackageId = 'xyz@345';
          elementName = 'cubx-dependency';
          artifactElementName = 'root-artifact';
          element = document.createElement(elementName);
          element.setAttribute('webpackage-id', webpackageId);
          element.setAttribute('artifact-id', artifactId);

          artifactElement = document.createElement(artifactElementName);
          artifactElement.setAttribute('cubx-webpackage-id', artifactWebpackageId);
          depArray.push({
            artifactId: artifactElement.tagName.toLowerCase(),
            webpackageId: artifactWebpackageId
          });
        });
        afterEach(function () {
          delete window.cubx.CRCInit.rootDependencies;
          depArray = [];
        });

        it('should create a new dependency', function () {
          var dep = dependencyTagTransformer._createDependency(element, artifactElement, depArray);
          dep.should.not.have.property('webpackageId');
          dep.should.have.property('artifactId', artifactId);
          dep.should.have.not.property('endpointId');
        });
      });
      describe('dependency element created (element has just artifact-id attribute, dependency of parent element has webpackage-id attribute', function () {
        var depArray;
        var element;
        var artifactWebpackageId;
        var artifactId;
        var artifactElement;
        var elementName;
        var artifactElementName;
        beforeEach(function () {
          depArray = [];
          artifactId = 'example-component';
          artifactWebpackageId = 'xyz@345';
          elementName = 'cubx-dependency';
          artifactElementName = 'root-artifact';
          window.cubx.CRCInit = { rootDependencies: [] };
          element = document.createElement(elementName);
          element.setAttribute('artifact-id', artifactId);

          artifactElement = document.createElement(artifactElementName);
          artifactElement.setAttribute('cubx-webpackage-id', artifactWebpackageId);
          window.cubx.CRCInit.rootDependencies.push({
            artifactId: artifactElement.tagName.toLowerCase(),
            webpackageId: artifactWebpackageId
          });
        });
        afterEach(function () {
          delete window.cubx.CRCInit.rootDependencies;
          depArray = [];
        });

        it('should create a new dependency', function () {
          var dep = dependencyTagTransformer._createDependency(element, artifactElement, depArray);
          dep.should.have.property('webpackageId', artifactWebpackageId);
          dep.should.have.property('artifactId', artifactId);
          dep.should.have.not.property('endpointId');
        });
      });
      describe('dependency element created (element has just artifact-id attribute, dependency of parent element has not webpackage-id attribute', function () {
        var depArray;
        var element;
        var artifactId;
        var artifactElement;
        var elementName;
        var artifactElementName;
        beforeEach(function () {
          depArray = [];
          artifactId = 'example-component';
          elementName = 'cubx-dependency';
          artifactElementName = 'root-artifact';
          window.cubx.CRCInit = { rootDependencies: [] };
          element = document.createElement(elementName);
          element.setAttribute('artifact-id', artifactId);

          artifactElement = document.createElement(artifactElementName);
          depArray.push({
            artifactId: artifactElement.tagName.toLowerCase()
          });
        });
        afterEach(function () {
          delete window.cubx.CRCInit.rootDependencies;
          depArray = [];
        });

        it('should create a new dependency', function () {
          var dep = dependencyTagTransformer._createDependency(element, artifactElement, depArray);
          dep.should.have.not.property('webpackageId');
          dep.should.have.property('artifactId', artifactId);
          dep.should.have.not.property('endpointId');
        });
      });
      describe('dependency element created (element has webpackage-id, artifact-id and endpoint-id attribute', function () {
        var depArray;
        var element;
        var webpackageId;
        var artifactWebpackageId;
        var artifactId;
        var artifactElement;
        var elementName;
        var artifactElementName;
        var endpointId;
        beforeEach(function () {
          depArray = [];
          webpackageId = 'example@234';
          artifactId = 'example-component';
          endpointId = 'main';
          artifactWebpackageId = 'xyz@345';
          elementName = 'cubx-dependency';
          artifactElementName = 'root-artifact';
          window.cubx.CRCInit = { rootDependencies: [] };
          element = document.createElement(elementName);
          element.setAttribute('webpackage-id', webpackageId);
          element.setAttribute('artifact-id', artifactId);
          element.setAttribute('endpoint-id', endpointId);

          artifactElement = document.createElement(artifactElementName);
          artifactElement.setAttribute('cubx-webpackage-id', artifactWebpackageId);
          depArray.push({
            artifactId: artifactElement.tagName.toLowerCase(),
            webpackageId: artifactWebpackageId
          });
        });
        afterEach(function () {
          delete window.cubx.CRCInit.rootDependencies;
          depArray = [];
        });

        it('should create a new dependency', function () {
          var dep = dependencyTagTransformer._createDependency(element, artifactElement, depArray);
          dep.should.have.property('webpackageId', webpackageId);
          dep.should.have.property('artifactId', artifactId);
          dep.should.have.property('endpointId', endpointId);
        });
      });
    });
  });
});
