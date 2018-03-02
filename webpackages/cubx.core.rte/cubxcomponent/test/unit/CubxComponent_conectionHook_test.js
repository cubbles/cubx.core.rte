/* globals HTMLImports,initNewElement, getTestComponentCacheEntry, getContainer */
'use strict';
describe('CubxPolymer call connection-hook', function () {
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('call connection hook', function () {
    var elementName = 'dummy-connection-hook';
    var elem1;
    var elem2;
    var container;
    before(function () {
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
      elem1 = initNewElement(elementName, null, 'one');
      elem2 = initNewElement(elementName, null, 'two');
    });
    describe('inline hook function', function () {
      beforeEach(function () {
        container = getContainer();
        var hookFunction = 'function (value, next) { var newValue = "value: "  + value + " source: " + this.source.id + " destination: " + this.destination.id; next(newValue);} ';

        var Connection = window.cubx.cif.ConnectionManager.Connection;
        var connection = new Connection();
        connection.connectionId = 'one-two';
        connection.source.memberId = 'one';
        connection.source.component = elem1;
        connection.source.slot = 'message';
        connection.destination.memberId = 'two';
        connection.destination.component = elem2;
        connection.destination.slot = 'message';
        connection.hookFunction = hookFunction;
        container.Context._connectionMgr._connections.push(connection);
      });

      afterEach(function () {
        container.Context._connectionMgr._connections = [];
      });
      it('hook function should create a slot value with source and destination id', function (done) {
        window.setTimeout(function () {
          var value = 'Hallo Cubbles!';
          elem1.setMessage('Hallo Cubbles!');
          var res = 'value: ' + value + ' source: one destination: two';
          elem2.getMessage().should.be.equal(res);
          done();
        }, 50);
      });
    });
    describe('global hook function', function () {
      beforeEach(function () {
        container = getContainer();
        window.test = {
          test_hook_function: function (value, next) {
            var newValue = 'value: ' + value + ' source: ' + this.source.id + ' destination: ' + this.destination.id;
            next(newValue);
          }
        };
        var hookFunction = 'test.test_hook_function';

        var Connection = window.cubx.cif.ConnectionManager.Connection;
        var connection = new Connection();
        connection.connectionId = 'one-two';
        connection.source.memberId = 'one';
        connection.source.component = elem1;
        connection.source.slot = 'message';
        connection.destination.memberId = 'two';
        connection.destination.component = elem2;
        connection.destination.slot = 'message';
        connection.hookFunction = hookFunction;
        container.Context._connectionMgr._connections.push(connection);
      });

      afterEach(function () {
        container.Context._connectionMgr._connections = [];
      });
      it('hook function should create a slot value with source and destination id', function (done) {
        window.setTimeout(function () {
          var value = 'Hallo Cubbles!';
          elem1.setMessage('Hallo Cubbles!');
          var res = 'value: ' + value + ' source: one destination: two';
          elem2.getMessage().should.be.equal(res);
          done();
        }, 50);
      });
    });
  });
});
