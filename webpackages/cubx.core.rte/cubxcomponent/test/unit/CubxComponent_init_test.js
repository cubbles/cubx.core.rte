/* globals  HTMLImports, getContainer, createHtmlImport */
'use strict';
describe('CubxComponent (init)', function () {
  this.timeout(5000);
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('CubxComponent init', function () {
    var container;
    before(function () {
      container = getContainer();
    });
    after(function () {
      container = null;
    });
    describe('CubxComponent create', function () {
      describe('element create with calling "CubxComponent(prototyp)"', function () {
        var elementName = 'dummy-empty';
        before(function () {
          var el = document.createElement('div');

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '" });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          el.appendChild(scriptEl);
          document.body.appendChild(el);
          var runtimeId = elementName + '#1';
          var element = document.createElement(elementName);
          element.setAttribute('runtime-id', runtimeId);
          container.appendChild(element);
        });
        it('should be exists', function (done) {
          setTimeout(function () {
            var component = document.querySelector(elementName);
            component.should.be.exist;
            expect(component.cubxComponentName).to.be.equals(elementName);
            done();
          }, 50);
        });
      });
      describe('create the same element twice"', function () {
        var elementName = 'dummy-empty';
        before(function () {
          var el = document.createElement('div');

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '" });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);
          document.body.appendChild(el);
          var element = document.createElement(elementName);
          element.setAttribute('runtime-id', elementName + '#2');
          var element2 = document.createElement(elementName);
          element2.setAttribute('runtime-id', elementName + '#3');
          container.appendChild(element);
          container.appendChild(element2);
        });
        it('should be exists', function (done) {
          setTimeout(function () {
            var components = document.querySelectorAll(elementName);
            for (var i = 0; i < components.length; i++) {
              var component = components[ i ];
              component.should.be.exist;
              expect(component.cubxComponentName).to.be.equals(elementName);
            }
            done();
          }, 50);
        });
      });
      describe('element use created lifecycle method"', function () {
        var elementName = 'dummy-empty2';
        var spyCallback; // eslint-disable-line no-unused-vars
        before(function () {
          spyCallback = sinon.spy();
          window.spyCallback = spyCallback;
          var el = document.createElement('div');
          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", created: function(){ spyCallback();} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);
          document.body.appendChild(el);
          spyCallback.should.have.callCount(0); // not called before created
          var element = document.createElement(elementName);
          spyCallback.should.have.callCount(1);// called after created
          element.setAttribute('runtime-id', elementName + '#1');
          container.appendChild(element);
        });
        after(function () {
          spyCallback = null;
          delete window.spyCallback;
        });

        // after(function () {
        //   // window.componentCacheEntry = undefined;
        // });
        it('should be called created', function (done) {
          setTimeout(function () {
            spyCallback.should.have.been.calledOnce;
            done();
          }, 50);
        });
      });
      describe('element use connected lifecycle method"', function () {
        var elementName = 'dummy-empty3';
        var spyCallback;

        before(function () {
          spyCallback = sinon.spy();
          window.spyCallback = spyCallback;
          var el = document.createElement('div');

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", connected: function(){ spyCallback();} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);

          document.body.appendChild(el);
          var element = document.createElement(elementName);
          spyCallback.should.have.callCount(0); // not called before append to dom
          element.setAttribute('runtime-id', elementName + '#1');
          container.appendChild(element);
        });
        after(function () {
          spyCallback = null;
          delete window.spyCallback;
        });
        it('should be call connected callback', function (done) {
          setTimeout(function () {
            spyCallback.should.have.been.calledOnce;
            done();
          }, 50);
        });
      });
      describe('element use disconnected lifecycle method"', function () {
        var elementName = 'dummy-empty4';
        var spyCallback; // eslint-disable-line no-unused-vars
        before(function () {
          spyCallback = sinon.spy();
          window.spyCallback = spyCallback;
          var el = document.createElement('div');

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", disconnected: function(){ spyCallback();} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);

          document.body.appendChild(el);
          var element = document.createElement(elementName);
          element.setAttribute('runtime-id', elementName + '#1');
          container.appendChild(element);
        });
        after(function () {
          spyCallback = null;
          delete window.spyCallback;
        });

        it('should be call disconnected callback', function (done) {
          setTimeout(function () {
            spyCallback.should.have.callCount(0); // not called yet
            var element = document.querySelector(elementName);
            container.removeChild(element);
            spyCallback.should.have.been.calledOnce;
            done();
          }, 50);
        });
      });
      describe('element use contextReady lifecycle method"', function () {
        describe('triggered with cifDomUpdateReady', function () {
          var elementName = 'dummy-empty5a';
          var spyCallback;
          before(function () {
            spyCallback = sinon.spy();
            window.spyCallback = spyCallback;
            var el = document.createElement('div');

            var scriptEl = document.createElement('script');
            scriptEl.async = false;
            scriptEl.defer = false;
            scriptEl.type = 'text/javascript';
            var content = 'CubxComponent({ is: "' + elementName + '", contextReady: function(){ spyCallback();} });';
            try {
              scriptEl.appendChild(document.createTextNode(content));
            } catch (e) {
              scriptEl.text = content;
            }
            scriptEl.setAttribute('foo', 'bar');
            el.appendChild(scriptEl);

            document.body.appendChild(el);
            var runtimeId = elementName + '#1';
            document.addEventListener(window.cubx.EventFactory.types.COMPONENT_READY, function (evt) {
              if (evt.detail.runtimeId === runtimeId) {
                var cifDomUpdateReadyEvt = new window.cubx.EventFactory().createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY);
                container.dispatchEvent(cifDomUpdateReadyEvt);
              }
            });
            var element = document.createElement(elementName);
            element.setAttribute('runtime-id', runtimeId);
            container.appendChild(element);
          });
          after(function () {
            spyCallback = null;
            delete window.spyCallback;
          });

          it('should be call contextReady callback', function (done) {
            setTimeout(function () {
              spyCallback.should.have.been.calledOnce;
              done();
            }, 50);
          });
        });
        describe('triggered with cifReady', function () {
          var elementName = 'dummy-empty5b';
          var spyCallback;
          before(function () {
            spyCallback = sinon.spy();
            window.spyCallback = spyCallback;
            var el = document.createElement('div');

            var scriptEl = document.createElement('script');
            scriptEl.async = false;
            scriptEl.defer = false;
            scriptEl.type = 'text/javascript';
            var content = 'CubxComponent({ is: "' + elementName + '", contextReady: function(){ spyCallback();} });';
            try {
              scriptEl.appendChild(document.createTextNode(content));
            } catch (e) {
              scriptEl.text = content;
            }
            scriptEl.setAttribute('foo', 'bar');
            el.appendChild(scriptEl);

            document.body.appendChild(el);
            var runtimeId = elementName + '#1';
            document.addEventListener(window.cubx.EventFactory.types.COMPONENT_READY, function (evt) {
              if (evt.detail.runtimeId === runtimeId) {
                var cifReadyEvt = new window.cubx.EventFactory().createEvent(window.cubx.EventFactory.types.CIF_READY);
                container.dispatchEvent(cifReadyEvt);
              }
            });
            var element = document.createElement(elementName);
            element.setAttribute('runtime-id', runtimeId);
            container.appendChild(element);
          });
          after(function () {
            spyCallback = null;
            delete window.spyCallback;
          });

          it('should be call contextReady callback', function (done) {
            setTimeout(function () {
              spyCallback.should.have.been.calledOnce;
              done();
            }, 50);
          });
        });
      });
      describe('element use ready lifecycle method (without template)"', function () {
        var elementName = 'dummy-empty6';
        var spyCallback;
        before(function () {
          spyCallback = sinon.spy();
          window.spyCallback = spyCallback;
          var el = document.createElement('div');

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", ready: function(){ spyCallback();} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);

          document.body.appendChild(el);
          var element = document.createElement(elementName);
          element.setAttribute('runtime-id', elementName + '#1');
          container.appendChild(element);
        });
        after(function () {
          spyCallback = null;
          delete window.spyCallback;
        });

        it('should be call contextReady callback', function (done) {
          setTimeout(function () {
            spyCallback.should.have.been.calledOnce;
            done();
          }, 50);
        });
      });
      describe('element create with html template)"', function () {
        var elementName = 'dummy-element-1';
        var spyCallback;
        before(function (done) {
          spyCallback = sinon.spy();
          window.spyCallback = spyCallback;
          var url = 'base/test/resources/template-dummy-element-1.html';
          if (window.testRun) {
            url = url.replace('base/test/', '');
          }
          var promise = createHtmlImport(url);
          promise.then(function (value) {
            var el = document.createElement('div');

            var scriptEl = document.createElement('script');
            scriptEl.async = false;
            scriptEl.defer = false;
            scriptEl.type = 'text/javascript';
            var content = 'CubxComponent({ is: "' + elementName + '", ready: function(){ spyCallback();} });';
            try {
              scriptEl.appendChild(document.createTextNode(content));
            } catch (e) {
              scriptEl.text = content;
            }
            scriptEl.setAttribute('foo', 'bar');
            el.appendChild(scriptEl);

            document.body.appendChild(el);
            var element = document.createElement(elementName);
            element.setAttribute('runtime-id', elementName + '#1');
            container.appendChild(element);
            done();
          }).catch(function (err) {
            console.error(err);
            done();
          });
        });
        after(function () {
          spyCallback = null;
          delete window.spyCallback;
        });
        it('should be have integrated the template', function (done) {
          setTimeout(function () {
            var el = document.querySelector(elementName);
            var content = el.firstElementChild;
            expect(content).to.be.exist;
            content.tagName.should.be.equal('DIV');
            content.innerHTML.should.be.equal('Hallo Cubbles!');
            done();
          }, 50);
        });
        it('should be call ready callback', function (done) {
          setTimeout(function () {
            spyCallback.should.have.been.calledOnce;
            done();
          }, 50);
        });
      });
      describe('element create with inline template)"', function () {
        var elementName = 'dummy-element-2';
        before(function () {
          var el = document.createElement('div');

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", template:{content:"<div>Hallo Cubbles!</div><p>Hallo Cubbles again!</p>"} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);

          document.body.appendChild(el);
          try {
            var element = document.createElement(elementName);
          } catch (err) {
            console.log(err);
          }

          element.setAttribute('runtime-id', elementName + '#1');
          container.appendChild(element);
        });
        it('should be have integrated the template', function (done) {
          setTimeout(function () {
            var el = document.querySelector(elementName);
            var content = el.firstElementChild;
            expect(content).to.be.exist;
            content.tagName.should.be.equal('DIV');
            content.innerHTML.should.be.equal('Hallo Cubbles!');
            expect(content.nextElementSibling).to.be.exist;
            content.nextElementSibling.tagName.should.be.equal('P');
            content.nextElementSibling.innerHTML.should.be.equal('Hallo Cubbles again!');
            done();
          }, 50);
        });
      });
    });
  });
});
