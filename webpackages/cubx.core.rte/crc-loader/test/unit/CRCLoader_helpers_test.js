'use strict';
window.cubx = window.cubx || {};
window.cubx.amd = window.cubx.amd || {};
window.cubx.amd.define([ 'crcLoader' ],
  function (crcLoader) {
    describe('CRCLoader (helpers)', function () {
      describe('#_createDependency', function () {
        it('html element has "cubx-webpackage-id" attribute with this', function () {
          var elementName = 'cubx-demo';
          var element = document.createElement(elementName);
          element.setAttribute('cubx-webpackage-id', 'this');
          var dependency = crcLoader._createDependency(element);
          dependency.should.have.property('artifactId', elementName);
          dependency.should.not.have.property('webpackageId');
          dependency.should.not.have.property('endpointId');
        });
        it('html element has "cubx-webpackage-id" attribute with webpackageId', function () {
          var elementName = 'cubx-demo-2';
          var webpackageId = 'example@1.2.3';
          var element = document.createElement(elementName);
          element.setAttribute('cubx-webpackage-id', webpackageId);
          var dependency = crcLoader._createDependency(element);
          dependency.should.have.property('artifactId', elementName);
          dependency.should.have.property('webpackageId', webpackageId);
          dependency.should.not.have.property('endpointId');
        });
        it('html element has "cubx-webpackage-id" attribute with webpackageId and endpointId', function () {
          var elementName = 'cubx-demo-2';
          var webpackageId = 'example@1.2.3';
          var endpointId = 'main';
          var element = document.createElement(elementName);
          element.setAttribute('cubx-webpackage-id', webpackageId);
          element.setAttribute('cubx-endpoint-id', endpointId);
          var dependency = crcLoader._createDependency(element);
          dependency.should.have.property('artifactId', elementName);
          dependency.should.have.property('webpackageId', webpackageId);
          dependency.should.have.property('endpointId', endpointId);
        });
      });
    });
  })
;
