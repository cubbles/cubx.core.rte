/* globals HTMLImports */
'use strict';
describe('CubxPolymer origin content', function () {
  this.timeout(6000);
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
      element = document.createElement(elementName);
      document.body.appendChild(element);
      var template = '<span>{{value}}</span>';
      var prototype = {
        is: elementName,
        attached: function () {
          // before wait for Lifecycle Method attached called
          done();
        }
      };

      var el = document.createElement('div');
      el.innerHTML = '<dom-module id="' + elementName + '" >' +
        '<template>' + template + '</template>' +
        '</dom-module>';

      document.body.appendChild(el);
      CubxPolymer(prototype);

      var connections = document.createElement('cubx-core-connections');
      var connection = document.createElement('cubx-core-connection');
      connection.setSource('xxx');
      connection.setDestination('yyy:zzz');
      connection.setConnectionId('myConnection');
      connections.appendChild(connection);
      element.appendChild(connections);
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
      element = document.createElement(elementName);
      document.body.appendChild(element);
      var template = '<span>{{value}}</span>';
      var prototype = {
        is: elementName,
        attached: function () {
          // before wait for Lifecycle Method attached called
          done();
        }
      };

      var el = document.createElement('div');
      el.innerHTML = '<dom-module id="' + elementName + '" >' +
        '<template>' + template + '</template>' +
        '</dom-module>';

      document.body.appendChild(el);
      CubxPolymer(prototype);

      var init = document.createElement('cubx-core-init');
      var slotInit = document.createElement('cubx-core-slot-init');
      slotInit.setSlot('xxx');
      slotInit.setMember('yyy');

      init.appendChild(slotInit);
      element.appendChild(init);
    });

    after(function () {
      window.componentCacheEntry = undefined;
    });

    it('cubx-core-init should be exists', function () {
      element.querySelector('cubx-core-init').should.be.exist;
    });
  });
});
