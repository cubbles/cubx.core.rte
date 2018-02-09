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
        var elementName = 'dummy-empty2';
        before(function () {
          window.componentCacheEntry = {};
          var el = document.createElement('div');

          el.innerHTML = '<template id="' + elementName + '" ><h1>Hallo Dummy!</h1></template>';

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
          var element = document.createElement(elementName);
          var container = getContainer();
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
          window.componentCacheEntry = undefined;
        });
        it('should be exists', function (done) {
          setTimeout(function () {
            var component = document.querySelector(elementName);
            component.should.be.exists;
            expect(component.CubxComponentName).to.be.equals(elementName);
            component.getAttribute('runtime-id').should.be.not.undefined;
            component.getAttribute('runtime-id').should.be.not.null;
            done();
          }, 50);
        });
      });
    });
  });
});
