/* globals Event, CustomEvent */

'use strict';
/**
 * Created by pwr on 09.02.2015.
 */
window.cubx = window.cubx || {};
window.cubx.amd = window.cubx.amd || {};
window.cubx.amd.define([ 'crcLoader' ],
  function (crcLoader) {
    describe('CRCLoader', function () {
      function cleanUpCrcLoader () {
        crcLoader._crcRoot = null;
        crcLoader._cubxCRCInitRootDependenciesOriginLength = 0;
        crcLoader._cubxCRCInitRootDependencyExludesOriginLength = 0;
        crcLoader._webpackageBaseUrl = null;
        crcLoader._crcBaseUrl = null;
      }

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

      describe('#_addComponentDependenciesToRootDependencies()', function () {
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

          document.body.appendChild(element);
        });
        afterEach(function () {
          document.body.removeChild(element);
          element = null;
        });
        describe('cubx.CRCInit.rootDependencies already exists', function () {
          beforeEach(function () {
            window.cubx.CRCInit = { rootDependencies: [] };
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
          });
          describe('element has attribute cubx-webpackage-id="{wepackageId}"', function () {
            beforeEach(function () {
              webpackageId = 'example@1.3.4';
              element.setAttribute('cubx-webpackage-id', webpackageId);
              crcLoader._addComponentDependenciesToRootDependencies();
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
          describe('element has attribute cubx-webpackage-id="this"', function () {
            beforeEach(function () {
              webpackageId = 'this';
              element.setAttribute('cubx-webpackage-id', webpackageId);
              crcLoader._addComponentDependenciesToRootDependencies();
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
          describe('element has attributes cubx-webpackage-id="{wepackageId}" and cubx-endpoint-id="{endpointId}" ', function () {
            beforeEach(function () {
              webpackageId = 'example@1.3.4';
              endpointId = 'main';
              element.setAttribute('cubx-webpackage-id', webpackageId);
              element.setAttribute('cubx-endpoint-id', endpointId);
              crcLoader._addComponentDependenciesToRootDependencies();
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
          describe('dependency for element exists in cubx.CRCInit.rootDependencies ', function () {
            beforeEach(function () {
              webpackageId = 'example@1.3.4';
            });
            describe('dependency exists with the same webpackageId', function () {
              var spyWarn;
              beforeEach(function () {
                element.setAttribute('cubx-webpackage-id', webpackageId);
                window.cubx.CRCInit.rootDependencies.push({
                  webpackageId: webpackageId,
                  artifactId: elementName
                });
                spyWarn = sinon.spy(console, 'warn');
                crcLoader._addComponentDependenciesToRootDependencies();
              });
              afterEach(function () {
                console.warn.restore();
              });
              it('rootDependencies should have length=1', function () {
                window.cubx.CRCInit.rootDependencies.should.have.length(1);
              });
              it('rootDependencies log a warning', function () {
                spyWarn.should.be.not.called;
              });
            });
            describe('dependency exists with other webpackageId', function () {
              var spyWarn;
              beforeEach(function () {
                endpointId = 'main';
                element.setAttribute('cubx-webpackage-id', webpackageId);
                window.cubx.CRCInit.rootDependencies.push({
                  webpackageId: 'xyz@1.3.4',
                  artifactId: elementName
                });
                spyWarn = sinon.spy(console, 'warn');
                crcLoader._addComponentDependenciesToRootDependencies();
              });
              afterEach(function () {
                console.warn.restore();
              });
              it('rootDependencies should have length=1', function () {
                window.cubx.CRCInit.rootDependencies.should.have.length(1);
              });
              it('rootDependencies log a warning', function () {
                spyWarn.should.be.calledOnce;
              });
            });
          });
          describe('rootDependencies has origin elements ', function () {
            beforeEach(function () {
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
              crcLoader._cubxCRCInitRootDependenciesOriginLength = 2;
              webpackageId = 'example@1.3.4';
            });
            afterEach(function () {
              crcLoader._cubxCRCInitRootDependenciesOriginLength = 0;
            });
            describe('dependency exists with the same webpackageId', function () {
              beforeEach(function () {
                element.setAttribute('cubx-webpackage-id', webpackageId);
                crcLoader._addComponentDependenciesToRootDependencies();
              });

              it('rootDependencies should have length=3', function () {
                window.cubx.CRCInit.rootDependencies.should.have.length(3);
              });
              it('added dependency should be the last element of the array', function () {
                window.cubx.CRCInit.rootDependencies[ 2 ].should.have.property('webpackageId', webpackageId);
                window.cubx.CRCInit.rootDependencies[ 2 ].should.have.property('artifactId', elementName);
              });
            });
          });
        });

        describe('cubx.CRCInit.rootDependencies not exists yet', function () {
          beforeEach(function () {
            webpackageId = 'example@1.3.4';
            element.setAttribute('cubx-webpackage-id', webpackageId);
            crcLoader._addComponentDependenciesToRootDependencies();
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

      describe('#_isDependencyInRootDependencies()', function () {
        var element;
        var elementName;
        var webpackageId;
        before(function () {
          crcLoader._crcRoot = document.body;
        });
        after(function () {
          delete crcLoader._crcRoot;
        });
        describe('dependency already exists in rootDepenedencies with the same webpackageId', function () {
          var spyWarn;
          beforeEach(function () {
            webpackageId = 'example@1.2.3';
            elementName = 'cubx-crcloader-test';
            window.cubx.CRCInit = { rootDependencies: [] };
            window.cubx.CRCInit.rootDependencies.push({
              webpackageId: webpackageId,
              artifactId: elementName
            });

            element = document.createElement(elementName);
            element.setAttribute('cubx-webpackage-id', webpackageId);
            document.body.appendChild(element);
            spyWarn = sinon.spy(console, 'warn');
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
            document.body.removeChild(element);
            element = null;
            console.warn.restore();
          });
          it('should be true', function () {
            expect(crcLoader._isDependencyInRootDependencies(element)).to.be.true;
          });
          it('should be not log warning', function () {
            crcLoader._isDependencyInRootDependencies(element);
            spyWarn.should.be.not.called;
          });
        });
        describe('dependency already exists in rootDepenedencies with different webpacakgeId', function () {
          var spyWarn;
          beforeEach(function () {
            webpackageId = 'example@1.2.3';
            elementName = 'cubx-crcloader-test';
            window.cubx.CRCInit = { rootDependencies: [] };
            window.cubx.CRCInit.rootDependencies.push({
              webpackageId: 'xyz@123',
              artifactId: elementName
            });

            element = document.createElement(elementName);
            element.setAttribute('cubx-webpackage-id', webpackageId);
            document.body.appendChild(element);
            spyWarn = sinon.spy(console, 'warn');
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
            document.body.removeChild(element);
            element = null;
            console.warn.restore();
          });
          it('should be true', function () {
            expect(crcLoader._isDependencyInRootDependencies(element)).to.be.true;
          });
          it('should be  log warning', function () {
            crcLoader._isDependencyInRootDependencies(element);
            spyWarn.should.be.calledOnce;
          });
        });
        describe('dependency not exists yet in rootDepenedencies', function () {
          var spyWarn;
          beforeEach(function () {
            webpackageId = 'example@1.2.3';
            elementName = 'cubx-crcloader-test';
            window.cubx.CRCInit = { rootDependencies: [] };
            element = document.createElement(elementName);
            element.setAttribute('cubx-webpackage-id', webpackageId);
            document.body.appendChild(element);
            spyWarn = sinon.spy(console, 'warn');
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
            document.body.removeChild(element);
            element = null;
            console.warn.restore();
          });
          it('should be true', function () {
            expect(crcLoader._isDependencyInRootDependencies(element)).to.be.false;
          });
          it('should be not log warning', function () {
            crcLoader._isDependencyInRootDependencies(element);
            spyWarn.should.be.not.called;
          });
        });
      });

      describe('#_checkRootDependencies()', function () {
        before(function () {
          crcLoader._crcRoot = document.body;
        });
        after(function () {
          delete crcLoader._crcRoot;
        });
        describe('rootDependencies exists not', function () {
          beforeEach(function () {
            window.cubx.CRCInit = {};
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
          });
          it('should be the rootDependencies property created', function () {
            crcLoader._checkRootDependencies();
            window.cubx.CRCInit.should.have.property('rootDependencies');
            window.cubx.CRCInit.rootDependencies.should.be.an('array');
          });
        });
        describe('root dependencie included only valid entries', function () {
          var origRootDependencies;
          beforeEach(function () {
            window.cubx.CRCInit = { rootDependencies: [] };
            window.cubx.CRCInit.rootDependencies.push({
              artifactId: 'my-elem'
            });
            window.cubx.CRCInit.rootDependencies.push({
              artifactId: 'other-comp',
              webpackageId: 'example@1.2.3'
            });
            origRootDependencies = [];
            origRootDependencies = origRootDependencies.concat(window.cubx.CRCInit.rootDependencies);
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
          });
          it('rootDependencies should be keeped', function () {
            crcLoader._checkRootDependencies();
            window.cubx.CRCInit.rootDependencies.should.be.eql(origRootDependencies);
          });
        });
        describe('root dependencie included valid and not valid entries', function () {
          var origRootDependencies;
          beforeEach(function () {
            window.cubx.CRCInit = { rootDependencies: [] };
            window.cubx.CRCInit.rootDependencies.push({
              artifactId: 'my-elem'
            });
            window.cubx.CRCInit.rootDependencies.push({
              artifactId: 'other-comp',
              webpackageId: 'example@1.2.3'
            });
            window.cubx.CRCInit.rootDependencies.push('other.example@1.4.5/other-artifact/main');
            window.cubx.CRCInit.rootDependencies.push('this/my-comp2/main');
            origRootDependencies = [];
            origRootDependencies = origRootDependencies.concat(window.cubx.CRCInit.rootDependencies);
          });
          afterEach(function () {
            delete window.cubx.CRCInit.rootDependencies;
          });
          it('rootDependencies should included just the object elements, the string elements will be deleted', function () {
            crcLoader._checkRootDependencies();
            window.cubx.CRCInit.rootDependencies.should.be.not.eql(origRootDependencies);
            window.cubx.CRCInit.rootDependencies.should.have.length(2);
            window.cubx.CRCInit.rootDependencies[ 0 ].should.be.an('object');
            window.cubx.CRCInit.rootDependencies[ 1 ].should.be.an('object');
          });
        });
      });

      describe('processing  after start event', function () {
        var _checkRootDependenciesStub;
        var _addComponentDependenciesToRootDependenciesStub;
        var _addDependenciesAndExcludesToRootDependenciesStub;
        var _bootstrapCRCStub;
        var originCubx;

        beforeEach(function () {
          originCubx = window.cubx;
          window.cubx = {
            CRCInit: {
              startEvent: 'myStartEvent',
              runtimeMode: 'dev'
            }
          };

          _checkRootDependenciesStub = sinon.stub(crcLoader, '_checkRootDependencies').callsFake(function () {
            // do nothing;
          });
          _addComponentDependenciesToRootDependenciesStub = sinon.stub(crcLoader, '_addComponentDependenciesToRootDependencies').callsFake(function () {
            // do nothing;
          });
          _addDependenciesAndExcludesToRootDependenciesStub = sinon.stub(crcLoader, '_addDependenciesAndExcludesToRootDependencies').callsFake(function () {
            // do nothing;
          });
          _bootstrapCRCStub = sinon.stub(crcLoader, '_bootstrapCRC').callsFake(function () {
            // do nothing;
          });

          crcLoader.run();
          var startEvent = new CustomEvent(window.cubx.CRCInit.startEvent);
          document.dispatchEvent(startEvent);
        });
        afterEach(function () {
          crcLoader._checkRootDependencies.restore();
          crcLoader._addComponentDependenciesToRootDependencies.restore();
          crcLoader._addDependenciesAndExcludesToRootDependencies.restore();
          crcLoader._bootstrapCRC.restore();
          window.cubx = originCubx;
          cleanUpCrcLoader();
        });
        describe('processing will be done', function () {
          it('_checkRootDependencies should be called once', function (done) {
            window.setTimeout(function () {
              _checkRootDependenciesStub.should.be.calledOnce;
              done();
            }, 1);
          });
          it('_addComponentDependenciesToRootDependencies should be called once', function (done) {
            window.setTimeout(function () {
              _addComponentDependenciesToRootDependenciesStub.should.be.calledOnce;
              done();
            });
          });
          it('_addDependenciesAndExcludesToRootDependencies should be called once', function (done) {
            window.setTimeout(function () {
              _addDependenciesAndExcludesToRootDependenciesStub.should.be.calledOnce;
              done();
            }, 1);
          });
          it('_bootstrapCRC should be called once', function (done) {
            window.setTimeout(function () {
              _bootstrapCRCStub.should.be.calledOnce;
              done();
            }, 1);
          });
        });
        describe('processing will be done once by repeated fired start event', function () {
          beforeEach(function () {
            var startEvent = new CustomEvent(window.cubx.CRCInit.startEvent);
            document.dispatchEvent(startEvent);
          });
          it('_checkRootDependencies should be called once', function (done) {
            window.setTimeout(function () {
              _checkRootDependenciesStub.should.be.calledOnce;
              done();
            }, 1);
          });
          it('_addComponentDependenciesToRootDependencies should be called once', function (done) {
            window.setTimeout(function () {
              _addComponentDependenciesToRootDependenciesStub.should.be.calledOnce;
              done();
            });
          });
          it('_addDependenciesAndExcludesToRootDependencies should be called once', function (done) {
            window.setTimeout(function () {
              _addDependenciesAndExcludesToRootDependenciesStub.should.be.calledOnce;
              done();
            }, 1);
          });
          it('_bootstrapCRC should be called once', function (done) {
            window.setTimeout(function () {
              _bootstrapCRCStub.should.be.calledOnce;
              done();
            }, 1);
          });
        });
      });

      describe('#cubx.CRCInit.startEvent can be used to set startEvent', function () {
        beforeEach(function () {
          window.cubx.CRCInit = { startEvent: 'pleaseStart' };
          crcLoader.run();
        });
        afterEach(function () {
          delete window.cubx.CRCInit.startEvent;
          cleanUpCrcLoader();
        });
        it('should not set _crcRoot since pleaseStart event is not dispatched', function () {
          crcLoader.should.have.property('_crcRoot', null);
        });
        it('should detect that pleaseStart event is dispatched and set _crcRoot', function () {
          var event = new Event('pleaseStart');
          document.dispatchEvent(event);
          crcLoader.should.have.property('_crcRoot', window.document.body);
        });
      });
    });
  });
