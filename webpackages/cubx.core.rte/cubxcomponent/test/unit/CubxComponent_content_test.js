/* globals HTMLImports, initNewElementWithTemplate */
'use strict';
describe('CubxComponent origin content', function () {
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('<cubx-core-connections> keeped in element context', function () {
    var elementName = 'dummy-content-connections';
    var element;
    before(function (done) {
      window.componentCacheEntry = {};
      // element = document.createElement(elementName);
      // document.body.appendChild(element);
      var prototype = {
        is: elementName,
        connected: function () {
          // before wait for Lifecycle Method connected called
          done();
        }
      };
      // CubxComponent(prototype);

      var promise = initNewElementWithTemplate(elementName, prototype, 'base/test/resources/template-dummy-content-connections.html');
      promise.then(function (elem) {
        var connections = document.createElement('cubx-core-connections');
        var connection = document.createElement('cubx-core-connection');
        connection.setSource('xxx');
        connection.setDestination('yyy:zzz');
        connection.setConnectionId('myConnection');
        connections.appendChild(connection);
        element = elem;
        elem.appendChild(connections);
      });
    });

    after(function () {
      window.componentCacheEntry = undefined;
    });

    it('cubx-core-connections should be exists', function () {
      element.querySelector('cubx-core-connections').should.be.exist;
    });
  });
  describe('<cubx-core-init> keeped in element context', function () {
    var elementName = 'dummy-content-init';
    var element;
    before(function (done) {
      window.componentCacheEntry = {};
      var prototype = {
        is: elementName,
        connected: function () {
          // before wait for Lifecycle Method connected called
          done();
        }
      };
      var promise = initNewElementWithTemplate(elementName, prototype, 'base/test/resources/template-dummy-content-init.html');
      promise.then(function (elem) {
        var init = document.createElement('cubx-core-init');
        var slotInit = document.createElement('cubx-core-slot-init');
        slotInit.setSlot('xxx');
        slotInit.setMember('yyy');

        init.appendChild(slotInit);
        element = elem;
        elem.appendChild(init);
      });
    });

    after(function () {
      window.componentCacheEntry = undefined;
    });

    it('cubx-core-init should be exists', function () {
      element.querySelector('cubx-core-init').should.be.exist;
    });
  });
});
