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
          // window.componentCacheEntry = {};
          var el = document.createElement('div');
          //
          // el.innerHTML = '<template id="' + elementName + '" ><h1>Hallo Dummy!</h1></template>';

          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", created: function(){ console.log(\'created called\');} });';
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
          consoleLogSpy = sinon.spy(console, 'log');
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        // after(function () {
        //   // window.componentCacheEntry = undefined;
        // });
        it('should be exists', function (done) {
          setTimeout(function () {
            var component = document.querySelector(elementName);
            component.should.be.exists;
            consoleLogSpy.calledWith('created called');
            done();
          }, 50);
        });
      });
    });
  });
});
