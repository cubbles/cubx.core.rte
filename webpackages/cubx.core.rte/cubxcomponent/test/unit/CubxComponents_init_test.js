/* globals  HTMLImports, getContainer */
'use strict';
describe('CubxComponent (init)', function () {
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
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);
          document.body.appendChild(el);
          var element = document.createElement(elementName);
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        it('should be exists', function (done) {
          setTimeout(function () {
            var component = document.querySelector(elementName);
            component.should.be.exists;
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
          var element2 = document.createElement(elementName);
          container.appendChild(element);
          container.appendChild(element2);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        it('should be exists', function (done) {
          setTimeout(function () {
            var components = document.querySelectorAll(elementName);
            for (var i = 0; i < components.length; i++) {
              var component = components[i];
              component.should.be.exists;
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
          var element = document.createElement(elementName);// called after created
          spyCallback.should.have.callCount(1);
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
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
          container.appendChild(element);

          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
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
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
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
      describe('element use cubxReady lifecycle method"', function () {
        var elementName = 'dummy-empty5';
        var spyCallback;
        before(function () {
          spyCallback = sinon.spy();
          window.spyCallback = spyCallback;
          var el = document.createElement('div');

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", cubxReady: function(){ spyCallback();} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);

          document.body.appendChild(el);
          var element = document.createElement(elementName);
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
          delete window.spyCallback;
        });

        it('should be call cubxReady callback', function (done) {
          setTimeout(function () {
            spyCallback.should.have.been.calledOnce;
            done();
          }, 50);
        });
      });
    });
  });
});
