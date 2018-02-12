/* globals  HTMLImports, getContainer */
'use strict';
describe('CubxComponent (init)', function () {
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('CubxComponent init', function () {
    describe('CubxComponent create', function () {
      describe('element create with calling "CubxComponent(prototyp)"', function () {
        var elementName = 'dummy-empty';
        before(function () {
          // window.componentCacheEntry = {};
          var el = document.createElement('div');
          //
          // el.innerHTML = '<template id="' + elementName + '" ><h1>Hallo Dummy!</h1></template>';

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
          var container = getContainer();
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        // after(function () {
        //   // window.componentCacheEntry = undefined;
        // });
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
          // window.componentCacheEntry = {};
          var el = document.createElement('div');
          //
          // el.innerHTML = '<template id="' + elementName + '" ><h1>Hallo Dummy!</h1></template>';

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
          var container = getContainer();
          container.appendChild(element);
          container.appendChild(element2);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        // after(function () {
        //   // window.componentCacheEntry = undefined;
        // });
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
      describe('element create with calling "CubxComponent(prototyp) use created lifecycle method"', function () {
        var elementName = 'dummy-empty2';
        var consoleLogSpy; // eslint-disable-line no-unused-vars
        before(function () {
          consoleLogSpy = sinon.spy(console, 'log');
          // window.componentCacheEntry = {};
          var el = document.createElement('div');
          //
          // el.innerHTML = '<template id="' + elementName + '" ><h1>Hallo Dummy!</h1></template>';

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", created: function(){ console.log("created called");} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);
          document.body.appendChild(el);
          consoleLogSpy.should.have.callCount(0); // not called before created
          var element = document.createElement(elementName);// called after created
          consoleLogSpy.should.have.callCount(1);
          var container = getContainer();
          container.appendChild(element);

          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        // after(function () {
        //   // window.componentCacheEntry = undefined;
        // });
        it('should be exists', function (done) {
          setTimeout(function () {
            var component = document.querySelector(elementName);
            component.should.be.exists;
            done();
          }, 50);
        });
        it('should be called created', function (done) {
          setTimeout(function () {
            consoleLogSpy.should.have.been.calledWith('created called');
            done();
          }, 50);
        });
        after(function () {
          console.log.restore();
        });
      });
      describe('element create with calling "CubxComponent(prototyp) use connected lifecycle method"', function () {
        var elementName = 'dummy-empty3';
        var consoleLogSpy; // eslint-disable-line no-unused-vars

        before(function () {
          consoleLogSpy = sinon.spy(console, 'log');
          // window.componentCacheEntry = {};
          var el = document.createElement('div');
          //
          // el.innerHTML = '<template id="' + elementName + '" ><h1>Hallo Dummy!</h1></template>';

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", connected: function(){ console.log(\'connected called\');} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);

          document.body.appendChild(el);
          var element = document.createElement(elementName);
          var container = getContainer();
          consoleLogSpy.should.have.callCount(0); // not called before append to dom
          container.appendChild(element);

          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
          console.log.restore();
        });
        // after(function () {
        //   // window.componentCacheEntry = undefined;
        // });
        it('should be exists', function (done) {
          setTimeout(function () {
            var component = document.querySelector(elementName);
            component.should.be.exists;
            done();
          }, 50);
        });
        it('should be call connected callback', function (done) {
          setTimeout(function () {
            consoleLogSpy.should.have.been.calledWith('connected called');
            done();
          }, 50);
        });
      });
      describe('element create with calling "CubxComponent(prototyp) use disconnected lifecycle method"', function () {
        var elementName = 'dummy-empty4';
        var consoleLogSpy; // eslint-disable-line no-unused-vars
        var container;
        before(function () {
          consoleLogSpy = sinon.spy(console, 'log');
          // window.componentCacheEntry = {};
          var el = document.createElement('div');
          //
          // el.innerHTML = '<template id="' + elementName + '" ><h1>Hallo Dummy!</h1></template>';

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", disconnected: function(){ console.log(\'disconnected called\');} });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          el.appendChild(scriptEl);

          document.body.appendChild(el);
          var element = document.createElement(elementName);
          container = getContainer();
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
          console.log.restore();
        });
        // after(function () {
        //   // window.componentCacheEntry = undefined;
        // });

        it('should be call disconnected callback', function (done) {
          setTimeout(function () {
            consoleLogSpy.should.have.callCount(0); // not called yet
            var element = document.querySelector(elementName);
            container.removeChild(element);
            consoleLogSpy.should.have.been.calledWith('disconnected called');
            done();
          }, 50);
        });
      });
    });
  });
});
