'use strict';
/**
 * Created by pwr on 09.02.2015.
 */

window.cubx = window.cubx ? window.cubx : {};
window.cubx.amd = window.cubx.amd ? window.cubx.amd : {};
window.cubx.amd.define([ 'crcLoader',
    'jqueryLoader' ],
  function (crcLoader, $) {
    describe('CRCLoader', function () {
      /*
       * Testcases
       */

      describe('#provides init values as expected.', function () {
        before(function () {
          crcLoader.setCRCBaseUrl('test-url');
        });

        it('should return the passed CRCBaseUrl', function () {
          expect(crcLoader.getCRCBaseUrl()).to.be.equal('test-url');
        });

        after(function () {
          delete crcLoader._crcBaseUrl;
        });
      });

      describe('#_addComponentDependenciesToRootdependencies', function () {
        before(function () {
          crcLoader._crcRoot = document.body;
        });
        after(function () {
          delete crcLoader._crcRoot;
        });
        var element;
        var elementName;
        var webpackageId;
        var endpointId;
        beforeEach(function () {
          elementName = 'cubx-crcloader-test';

          element = document.createElement(elementName);
          element.setAttribute('cubx-webpackage-id', webpackageId);
          document.body.appendChild(element);
        });
        afterEach(function () {
          document.body.removeChild(element);
          element = null;
        });
        describe('cubx.CRCInit.rootDependencies already exists', function () {
          beforeEach(function () {
            window.cubx.CRCInit = { 'rootDependencies': [] };
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
          });
          describe('elment has attribute cubx-webpackage-id="{wepackageId}"', function () {
            beforeEach(function () {
              webpackageId = 'example@1.3.4';
              crcLoader._addComponentDependenciesToRootdependencies();
            });
            it('cubx.CRCInit.rootDependencies created', function () {
              window.cubx.CRCInit.should.have.property('rootDependencies');
            });
            it('rootDependencies should have length=1', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(1);
            });
            it('element dependency is in rootDependencies', function () {
              var dep = window.cubx.CRCInit.rootDependencies[ 0 ];
              dep.should.have.property('webpackageId', webpackageId);
              dep.should.have.property('artifactId', elementName);
              dep.should.not.have.property('endpointId');
            });
          });
          describe('elment has attribute cubx-webpackage-id="this"', function () {
            beforeEach(function () {
              webpackageId = 'this';
              crcLoader._addComponentDependenciesToRootdependencies();
            });
            it('cubx.CRCInit.rootDependencies created', function () {
              window.cubx.CRCInit.should.have.property('rootDependencies');
            });
            it('rootDependencies should have length=1', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(1);
            });
            it('element dependency is in rootDependencies', function () {
              var dep = window.cubx.CRCInit.rootDependencies[ 0 ];
              dep.should.not.have.property('webpackageId');
              dep.should.have.property('artifactId', elementName);
              dep.should.not.have.property('endpointId');
            });
          });
          describe('elment has attributes cubx-webpackage-id="{wepackageId}" and cubx-endpoint-id="{endpointId}" ', function () {
            beforeEach(function () {
              webpackageId = 'example@1.3.4';
              endpointId = 'main';
              element.setAttribute('cubx-endpoint-id', endpointId);
              crcLoader._addComponentDependenciesToRootdependencies();
            });
            it('cubx.CRCInit.rootDependencies created', function () {
              window.cubx.CRCInit.should.have.property('rootDependencies');
            });
            it('rootDependencies should have length=1', function () {
              window.cubx.CRCInit.rootDependencies.should.have.length(1);
            });
            it('element dependency is in rootDependencies', function () {
              var dep = window.cubx.CRCInit.rootDependencies[ 0 ];
              dep.should.have.property('webpackageId', webpackageId);
              dep.should.have.property('artifactId', elementName);
              dep.should.have.property('endpointId', endpointId);
            });
          });
        });
        describe('cubx.CRCInit.rootDependencies not exists yet', function () {
          beforeEach(function () {
            webpackageId = 'example@1.3.4';
            crcLoader._addComponentDependenciesToRootdependencies();
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
          });
          it('cubx.CRCInit.rootDependencies created', function () {
            window.cubx.CRCInit.should.have.property('rootDependencies');
          });
          it('rootDependencies should have length=1', function () {
            window.cubx.CRCInit.rootDependencies.should.have.length(1);
          });
          it('element dependency is in rootDependencies', function () {
            var dep = window.cubx.CRCInit.rootDependencies[ 0 ];
            dep.should.have.property('webpackageId', webpackageId);
            dep.should.have.property('artifactId', elementName);
            dep.should.not.have.property('endpointId');
          });
        });
      });
    });
  });
