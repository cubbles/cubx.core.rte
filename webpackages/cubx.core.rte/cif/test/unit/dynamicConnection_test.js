'use strict';

describe('DynamicConnection', function () {
  var DynamicConnection;
  before(function () {
    DynamicConnection = window.cubx.cif.DynamicConnection;
  });
  describe('constructor', function () {
    describe('constructor without parameter', function () {
      var dynamicConnection;

      beforeEach(function () {
        dynamicConnection = new DynamicConnection();
      });
      afterEach(function () {
        dynamicConnection = null;
      });
      it('should be create an empty DynamicConnection object', function () {
        dynamicConnection.should.be.empty;
        dynamicConnection.should.be.instanceOf(DynamicConnection);
      });
      it('should be not valid', function () {
        var error = dynamicConnection.validate();
        error.should.be.length(3);
        error[ 0 ].should.be.equals('Not valid "connectionId" (undefined). It must be a string.');
        error[ 1 ].should.be.equals('The "source" is missed.');
        error[ 2 ].should.be.equals('The "destination" is missed.');
      });
    });
    describe('constructor with valid config parameter', function () {
      var dynamicConnection;
      var config;
      beforeEach(function () {
        config = {
          connectionId: 'testConnection',
          source: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-a.member1',
            slot: 'one'
          },
          destination: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-b.member2',
            slot: 'one'
          },
          copyValue: true,
          repeatedValues: false,
          hookFunction: 'function(value,next){next(value);}'
        };
        dynamicConnection = new DynamicConnection(config);
      });
      afterEach(function () {
        dynamicConnection = null;
      });
      it('should have no validation error', function () {
        var error = dynamicConnection.validate();
        error.should.have.length(0);
      });
      it('should have a valid structure', function () {
        dynamicConnection.should.have.property('connectionId', config.connectionId);
        dynamicConnection.should.have.nested.property('source', config.source);
        dynamicConnection.should.have.nested.property('destination', config.destination);
        dynamicConnection.should.have.property('copyValue', config.copyValue);
        dynamicConnection.should.have.property('repeatedValues', config.repeatedValues);
        dynamicConnection.should.have.property('hookFunction', config.hookFunction);
      });
    });
    describe('constructor with valid minimal config parameter', function () {
      var dynamicConnection;
      var config;
      beforeEach(function () {
        config = {
          connectionId: 'testConnection',
          source: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-a.member1',
            slot: 'one'
          },
          destination: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-b.member2',
            slot: 'one'
          }
        };
        dynamicConnection = new DynamicConnection(config);
      });
      afterEach(function () {
        dynamicConnection = null;
      });
      it('should have no validation error', function () {
        var error = dynamicConnection.validate();
        error.should.have.length(0);
      });
      it('should have a valid structure', function () {
        dynamicConnection.should.have.property('connectionId', config.connectionId);
        dynamicConnection.should.have.nested.property('source', config.source);
        dynamicConnection.should.have.nested.property('destination', config.destination);
      });
    });
    describe('constructor with not valid config parameter', function () {
      var config;
      beforeEach(function () {
        config = {
          connectionId: 'testConnection',
          source: {
            runtimeId: '_com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-a.member1',
            slot: 'one'
          },
          destination: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-b.member2',
            slot: 'one'
          },
          copyValue: 'true',
          repeatedValues: undefined,
          hookFunction: {}
        };
      });
      afterEach(function () {
      });
      it('should have throw a SyntaxError', function () {
        expect(function () {
          /* eslint-disable no-new */
          new DynamicConnection(config);
          /* eslint-enable no-new */
        }).to.throw(SyntaxError);
      });
    });
  });
  describe('#_init', function () {
    var dynamicConnection;
    var config;
    beforeEach(function () {
      dynamicConnection = new DynamicConnection();
    });
    afterEach(function () {
      dynamicConnection = null;
    });
    describe('initialize with a valid config', function () {
      beforeEach(function () {
        config = {
          connectionId: 'testConnection',
          source: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-a.member1',
            slot: 'one'
          },
          destination: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-b.member2',
            slot: 'one'
          },
          copyValue: true,
          repeatedValues: false,
          hookFunction: 'function(value,next){next(value);}'
        };
        dynamicConnection._init(config);
      });
      afterEach(function () {

      });
      it('should have no validation error', function () {
        var error = dynamicConnection.validate();
        error.should.have.length(0);
      });
      it('should have a valid structure', function () {
        dynamicConnection.should.have.property('connectionId', config.connectionId);
        dynamicConnection.should.have.nested.property('source', config.source);
        dynamicConnection.should.have.nested.property('destination', config.destination);
        dynamicConnection.should.have.property('copyValue', config.copyValue);
        dynamicConnection.should.have.property('repeatedValues', config.repeatedValues);
        dynamicConnection.should.have.property('hookFunction', config.hookFunction);
      });
    });
    describe('initialize with a minimal valid config', function () {
      beforeEach(function () {
        config = {
          connectionId: 'testConnection',
          source: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-a.member1',
            slot: 'one'
          },
          destination: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-b.member2',
            slot: 'one'
          }
        };
        dynamicConnection._init(config);
      });
      afterEach(function () {

      });
      it('should have no validation error', function () {
        var error = dynamicConnection.validate();
        error.should.have.length(0);
      });
      it('should have a valid structure', function () {
        dynamicConnection.should.have.property('connectionId', config.connectionId);
        dynamicConnection.should.have.nested.property('source', config.source);
        dynamicConnection.should.have.nested.property('destination', config.destination);
        dynamicConnection.should.not.have.property('copyValue');
        dynamicConnection.should.not.have.property('repeatedValues');
        dynamicConnection.should.not.have.property('hookFunction');
      });
    });
    describe('initialize with not valid config parameter', function () {
      var config;
      var spy;
      beforeEach(function () {
        config = {
          connectionId: 'testConnection',
          source: {
            runtimeId: '_com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-a.member1',
            slot: 'one'
          },
          destination: {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-b.member2',
            slot: 'one'
          },
          copyValue: 'true',
          repeatedValues: undefined,
          hookFunction: {}
        };
        spy = sinon.spy(console, 'error');
      });
      afterEach(function () {
        console.error.restore();
      });
      it('should have throw a SyntaxError', function () {
        expect(function () {
          dynamicConnection._init(config);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
  });
  describe('validate functions', function () {
    /* eslint-disable no-unused-vars */
    var spy;
    /* eslint-enable no-unused-vars */
    var dynamicConnection;
    beforeEach(function () {
      dynamicConnection = new DynamicConnection();
      spy = sinon.spy(console, 'error');
    });
    afterEach(function () {
      dynamicConnection = null;
      console.error.restore();
    });

    describe('#_validateSource', function () {
      it('should be valid with a valid source config object', function () {
        var source = {
          runtimeId: 'a123',
          slot: 'exampleSlot'
        };
        var error = dynamicConnection._validateSource(source);
        error.should.have.length(0);
      });
      it('should be get an error with source = undefined', function () {
        var source;
        var error = dynamicConnection._validateSource(source);
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "source" is missed.');
      });
      it('should be get an error with source = null', function () {
        var source = null;
        var error = dynamicConnection._validateSource(source);
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "source" is missed.');
      });
      it('should get an error, if "runtimeId" missed.', function () {
        var source = {
          slot: 'exampleSlot'
        };
        var error = dynamicConnection._validateSource(source);
        error.should.have.length(2);
        error.should.have.nested.property('[0]', 'The "source.runtimeId" is missed.');
        error.should.have.nested.property('[1]', 'Not valid "runtimeId" (undefined). It must be a string.');
      });
      it('should  get an error, if "slot" missed.', function () {
        var source = {
          runtimeId: 'abc'
        };
        var error = dynamicConnection._validateSource(source);
        error.should.have.length(2);
        error.should.have.nested.property('[0]', 'The "source.slot" is missed.');
        error.should.have.nested.property('[1]', 'Not valid "slot" (undefined). It must be a string.');
      });
      it('should  get an error, if "source" is a string.', function () {
        var source = 'string';
        var error = dynamicConnection._validateSource(source);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid source (' + JSON.stringify(source) + '). The "source" must be an object.');
      });
    });
    describe('#_validateDestination', function () {
      it('should be valid with a valid destination config object', function () {
        var destination = {
          runtimeId: 'a123',
          slot: 'exampleSlot'
        };
        var error = dynamicConnection._validateDestination(destination);
        error.should.have.length(0);
      });
      it('should be get an error with destination = undefined', function () {
        var destination;
        var error = dynamicConnection._validateDestination(destination);
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "destination" is missed.');
      });
      it('should be get an error with destination = null', function () {
        var destination = null;
        var error = dynamicConnection._validateDestination(destination);
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "destination" is missed.');
      });
      it('should get an error, if "runtimeId" missed.', function () {
        var destination = {
          slot: 'exampleSlot'
        };
        var error = dynamicConnection._validateDestination(destination);
        error.should.have.length(2);
        error.should.have.nested.property('[0]', 'The "destination.runtimeId" is missed.');
        error.should.have.nested.property('[1]', 'Not valid "runtimeId" (undefined). It must be a string.');
      });
      it('should  get an error, if "slot" missed.', function () {
        var destination = {
          runtimeId: 'abc'
        };
        var error = dynamicConnection._validateDestination(destination);
        error.should.have.length(2);
        error.should.have.nested.property('[0]', 'The "destination.slot" is missed.');
        error.should.have.nested.property('[1]', 'Not valid "slot" (undefined). It must be a string.');
      });
      it('should  get an error, if "destination" is a string.', function () {
        var destination = 'string';
        var error = dynamicConnection._validateDestination(destination);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid destination (' + JSON.stringify(destination) +
          '). The "destination" must be an object.');
      });
    });
    describe('#_validateRuntimeId', function () {
      it('should be valid with a string parameter "a.b.c@123-SNAPSHOT/d:e.f.g@12.3/h:i"', function () {
        var error = dynamicConnection._validateRuntimeId('a.b.c@123-SNAPSHOT/d:e.f.g@12.3/h:i');
        error.should.have.length(0);
      });

      it('should be get an error if the runtimeId parameter is not a string', function () {
        var runtimeId = {};
        var error = dynamicConnection._validateRuntimeId(runtimeId);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "runtimeId" (' + JSON.stringify(runtimeId) + '). It must be a string.');
      });
      it('should be get an error if the runtimeId has not a correct format', function () {
        var runtimeId = 'abc_def';
        var error = dynamicConnection._validateRuntimeId(runtimeId);
        error.should.have.length(1);
        error.should.have.nested.property('[0]');
        error[0].should.be.to.include('Not valid "runtimeId" (' + runtimeId + ').');
      });
      it('should be valid if the parameter is undefined', function () {
        var runtimeId;
        var error = dynamicConnection._validateRuntimeId(runtimeId);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "runtimeId" (' + JSON.stringify(runtimeId) + '). It must be a string.');
      });
      it('should be valid if the parameter is null', function () {
        var runtimeId = null;
        var error = dynamicConnection._validateRuntimeId(runtimeId);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "runtimeId" (' + JSON.stringify(runtimeId) + '). It must be a string.');
      });
    });
    describe('#_validateSlot', function () {
      it('should be valid with a string parameter "temperature"', function () {
        var error = dynamicConnection._validateRuntimeId('temperature');
        error.should.have.length(0);
      });

      it('should be get an error if the slot parameter is not a string', function () {
        var slot = {};
        var error = dynamicConnection._validateSlot(slot);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "slot" (' + JSON.stringify(slot) + '). It must be a string.');
      });
      it('should be valid if the parameter is undefined', function () {
        var slot;
        var error = dynamicConnection._validateSlot(slot);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "slot" (' + JSON.stringify(slot) + '). It must be a string.');
      });
      it('should be valid if the parameter is null', function () {
        var slot = null;
        var error = dynamicConnection._validateSlot(slot);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "slot" (' + JSON.stringify(slot) + '). It must be a string.');
      });
    });
    describe('#_validateConnectionId', function () {
      it('should be valid with a string parameter "connection-From:To"', function () {
        var error = dynamicConnection._validateConnectionId('connection-From:To');
        error.should.have.length(0);
      });

      it('should be get an error if the connectionId parameter is not a string', function () {
        var connectionId = {};
        var error = dynamicConnection._validateConnectionId(connectionId);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "connectionId" (' + JSON.stringify(connectionId) + '). It must be a string.');
      });

      it('should be valid if the parameter is undefined', function () {
        var connectionId;
        var error = dynamicConnection._validateConnectionId(connectionId);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "connectionId" (' + JSON.stringify(connectionId) + '). It must be a string.');
      });
      it('should be valid if the parameter is null', function () {
        var connectionId = null;
        var error = dynamicConnection._validateConnectionId(connectionId);
        error.should.have.length(1);
        error.should.have.nested.property('[0]',
          'Not valid "connectionId" (' + JSON.stringify(connectionId) + '). It must be a string.');
      });
    });
    describe('#_validateHookFunction', function () {
      it('should be valid with a string parameter myFunc', function () {
        var error = dynamicConnection._validateHookFunction('myFunc');
        error.should.have.length(0);
      });
      it('should be get an error if the parameter is an object', function () {
        var error = dynamicConnection._validateHookFunction({});
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "hookFunction" must be a string.');
      });
      it('should be valid if the parameter is undefined', function () {
        var error = dynamicConnection._validateHookFunction(undefined);
        error.should.have.length(0);
      });
      it('should be valid if the parameter is null', function () {
        var error = dynamicConnection._validateHookFunction(null);
        error.should.have.length(0);
      });
    });
    describe('#_validateRepeatedValues', function () {
      it('should be valid with parameter true', function () {
        var error = dynamicConnection._validateRepeatedValues(true);
        error.should.have.length(0);
      });
      it('should be valid with parameter false', function () {
        var error = dynamicConnection._validateRepeatedValues(false);
        error.should.have.length(0);
      });
      it('should be get an error if the parameter is "true"', function () {
        var error = dynamicConnection._validateRepeatedValues('true');
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "repeatedValues" must be a boolean.');
      });
      it('should be valid if the parameter is undefined', function () {
        var error = dynamicConnection._validateRepeatedValues(undefined);
        error.should.have.length(0);
      });
      it('should be valid if the parameter is null', function () {
        var error = dynamicConnection._validateRepeatedValues(null);
        error.should.have.length(0);
      });
    });
    describe('#_validateCopyValue', function () {
      it('should be valid with parameter true', function () {
        var error = dynamicConnection._validateCopyValue(true);
        error.should.have.length(0);
      });
      it('should be valid with parameter false', function () {
        var error = dynamicConnection._validateCopyValue(false);
        error.should.have.length(0);
      });
      it('should be get an error if the parameter is "true"', function () {
        var error = dynamicConnection._validateCopyValue('true');
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "copyValue" must be a boolean.');
      });
      it('should be valid if the parameter is undefined', function () {
        var error = dynamicConnection._validateCopyValue(undefined);
        error.should.have.length(0);
      });
      it('should be valid if the parameter is null', function () {
        var error = dynamicConnection._validateCopyValue(null);
        error.should.have.length(0);
      });
    });
    describe('#_validateDirectExecution', function () {
      it('should be valid with parameter true', function () {
        var error = dynamicConnection._validateDirectExecution(true);
        error.should.have.length(0);
      });
      it('should be valid with parameter false', function () {
        var error = dynamicConnection._validateDirectExecution(false);
        error.should.have.length(0);
      });
      it('should be get an error if the parameter is "true"', function () {
        var error = dynamicConnection._validateDirectExecution('true');
        error.should.have.length(1);
        error.should.have.nested.property('[0]', 'The "directExecution" must be a boolean.');
      });
      it('should be valid if the parameter is undefined', function () {
        var error = dynamicConnection._validateDirectExecution(undefined);
        error.should.have.length(0);
      });
      it('should be valid if the parameter is null', function () {
        var error = dynamicConnection._validateDirectExecution(null);
        error.should.have.length(0);
      });
    });
    describe('#validate', function () {
      describe('validate empty dynamicConnection', function () {
        var dynamicConnection;

        beforeEach(function () {
          dynamicConnection = new DynamicConnection();
        });
        afterEach(function () {
          dynamicConnection = null;
        });
        it('should be not valid', function () {
          var error = dynamicConnection.validate();
          error.should.be.length(3);
          error[ 0 ].should.be.equals('Not valid "connectionId" (undefined). It must be a string.');
          error[ 1 ].should.be.equals('The "source" is missed.');
          error[ 2 ].should.be.equals('The "destination" is missed.');
        });
      });
      describe('validate a valid dynamicConnection', function () {
        var dynamicConnection;
        var config;
        beforeEach(function () {
          config = {
            connectionId: 'testConnection',
            source: {
              runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-a.member1',
              slot: 'one'
            },
            destination: {
              runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-b.member2',
              slot: 'one'
            },
            copyValue: true,
            repeatedValues: false,
            hookFunction: 'function(value,next){next(value);}'
          };
          dynamicConnection = new DynamicConnection(config);
        });
        afterEach(function () {
          dynamicConnection = null;
        });
        it('should have no validation error', function () {
          var error = dynamicConnection.validate();
          error.should.have.length(0);
        });
        it('should have a valid structure', function () {
          dynamicConnection.should.have.property('connectionId', config.connectionId);
          dynamicConnection.should.have.nested.property('source', config.source);
          dynamicConnection.should.have.nested.property('destination', config.destination);
          dynamicConnection.should.have.property('copyValue', config.copyValue);
          dynamicConnection.should.have.property('repeatedValues', config.repeatedValues);
          dynamicConnection.should.have.property('hookFunction', config.hookFunction);
        });
      });
      describe('validate a valid  minimal dynamicConnection', function () {
        var dynamicConnection;
        var config;
        beforeEach(function () {
          config = {
            connectionId: 'testConnection',
            source: {
              runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-a.member1',
              slot: 'one'
            },
            destination: {
              runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
              'copy-value-test-b.member2',
              slot: 'one'
            }

          };
          dynamicConnection = new DynamicConnection(config);
        });
        afterEach(function () {
          dynamicConnection = null;
        });
        it('should have no validation error', function () {
          var error = dynamicConnection.validate();
          error.should.have.length(0);
        });
        it('should have a valid structure', function () {
          dynamicConnection.should.have.property('connectionId', config.connectionId);
          dynamicConnection.should.have.nested.property('source', config.source);
          dynamicConnection.should.have.nested.property('destination', config.destination);
        });
      });
      describe('validate a not valid dynamicConnection', function () {
        var dynamicConnection;
        beforeEach(function () {
          dynamicConnection = new DynamicConnection();

          dynamicConnection.connectionId = 'testConnection';
          dynamicConnection.source = {
            runtimeId: '_com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-a.member1',
            slot: 'one'
          };
          dynamicConnection.destination = {
            runtimeId: 'com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-compound-outer:com.incowia.cif-test.cif-copy-value-test@1.2.0-SNAPSHOT/' +
            'copy-value-test-b.member2',
            slot: 'one'
          };
          dynamicConnection.copyValue = 'true';
          dynamicConnection.repeatedValues = undefined;
          dynamicConnection.hookFunction = {};
        });
        afterEach(function () {
          dynamicConnection = null;
        });
        it('should have get Errors', function () {
          var error = dynamicConnection.validate();
          error.should.have.length(3);
          error.should.have.nested.property('[0]');
          error[0].should.be.to.include('Not valid "runtimeId" (' + dynamicConnection.source.runtimeId + ').');
          error.should.have.nested.property('[1]', 'The "copyValue" must be a boolean.');
          error.should.have.nested.property('[2]', 'The "hookFunction" must be a string.');
        });
      });
    });
  });
  describe('set functions', function () {
    var dynamicConection;
    var spy;
    beforeEach(function () {
      dynamicConection = new DynamicConnection();
      spy = sinon.spy(console, 'error');
    });
    afterEach(function () {
      dynamicConection = null;
      console.error.restore();
    });
    describe('#setSource', function () {
      it('should be set a valid source', function () {
        var source = {
          runtimeId: 'abc:dce.member1',
          slot: 'aSlot'
        };
        dynamicConection.setSource(source);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('source', source);
      });
      it('should be not set a not valid source', function () {
        var source = {
          runtimeId: '_abc:dce.member1',
          slot: 'aSlot'
        };
        expect(function () {
          dynamicConection.setSource(source);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
        dynamicConection.should.not.have.nested.property('source');
      });
    });
    describe('#setDestination', function () {
      it('should be set a valid destination', function () {
        var destination = {
          runtimeId: 'abc:dce.member1',
          slot: 'aSlot'
        };
        dynamicConection.setDestination(destination);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('destination', destination);
      });
      it('should be not set a not valid destination', function () {
        var destination = {
          runtimeId: '_abc:dce.member1',
          slot: 'aSlot'
        };
        expect(function () {
          dynamicConection.setDestination(destination);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
        dynamicConection.should.not.have.nested.property('destination');
      });
    });
    describe('#setDestinationRuntimeId', function () {
      it('should be set a valid destinationRuntimeId', function () {
        var destinationRuntimeId = 'abc:dce.member1';
        dynamicConection.setDestinationRuntimeId(destinationRuntimeId);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('destination.runtimeId', destinationRuntimeId);
      });
      it('should be not set a not valid destinationRuntimeId', function () {
        var destinationRuntimeId = '_abc:dce.member1';
        expect(function () {
          dynamicConection.setDestinationRuntimeId(destinationRuntimeId);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
    describe('#setDestinationSlot', function () {
      it('should be set a valid destinationSlot', function () {
        var destinationSlot = 'abc';
        dynamicConection.setDestinationSlot(destinationSlot);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('destination.slot', destinationSlot);
      });
      it('should be not set a not valid destinationSlot', function () {
        var destinationSlot = true;
        expect(function () {
          dynamicConection.setDestinationSlot(destinationSlot);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
    describe('#setSourceRuntimeId', function () {
      it('should be set a valid sourceRuntimeId', function () {
        var sourceRuntimeId = 'abc:dce.member1';
        dynamicConection.setSourceRuntimeId(sourceRuntimeId);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('source.runtimeId', sourceRuntimeId);
      });
      it('should be not set a not valid sourceRuntimeId', function () {
        var sourceRuntimeId = '_abc:dce.member1';
        expect(function () {
          dynamicConection.setSourceRuntimeId(sourceRuntimeId);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
    describe('#setSourceSlot', function () {
      it('should be set a valid sourceSlot', function () {
        var sourceSlot = 'abc';
        dynamicConection.setSourceSlot(sourceSlot);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('source.slot', sourceSlot);
      });
      it('should be not set a not valid sourceSlot', function () {
        var sourceSlot = true;
        expect(function () {
          dynamicConection.setSourceSlot(sourceSlot);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
    describe('#setConnectionId', function () {
      it('should be set a valid connectionId', function () {
        var connectionId = 'abc';
        dynamicConection.setConnectionId(connectionId);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('connectionId', connectionId);
      });
    });
    describe('#setCopyValue', function () {
      it('should be set a valid copyValue', function () {
        var copyValue = false;
        dynamicConection.setCopyValue(copyValue);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('copyValue', copyValue);
      });
      it('should be not set a not valid copyValue', function () {
        var copyValue = 'true';
        expect(function () {
          dynamicConection.setCopyValue(copyValue);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
    describe('#setRepeatedValues', function () {
      it('should be set a valid repeatedValues', function () {
        var repeatedValues = false;
        dynamicConection.setRepeatedValues(repeatedValues);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('repeatedValues', repeatedValues);
      });
      it('should be not set a not valid repeatedValues', function () {
        var repeatedValues = 'true';
        expect(function () {
          dynamicConection.setRepeatedValues(repeatedValues);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
    describe('#setHookFunction', function () {
      it('should be set a valid hookFunction', function () {
        var hookFunction = 'global.func.name';
        dynamicConection.setHookFunction(hookFunction);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('hookFunction', hookFunction);
      });
      it('should be not set a not valid hookFunction', function () {
        var hookFunction = {};
        expect(function () {
          dynamicConection.setHookFunction(hookFunction);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
    });
    describe('#setDirectExecution', function () {
      it('should be set a valid directExecution', function () {
        var directExecution = false;
        dynamicConection.setDirectExecution(directExecution);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.nested.property('directExecution', directExecution);
      });
      it('should be not set a not valid copyValue', function () {
        var directExecution = 'true';
        expect(function () {
          dynamicConection.setDirectExecution(directExecution);
        }).to.throw(SyntaxError);
        expect(spy.calledOnce).to.be.true;
      });
      it('should be set to false, if undfined', function () {
        var directExecution;

        dynamicConection.setDirectExecution(directExecution);
        expect(spy.called).to.be.false;
        dynamicConection.should.have.property('directExecution', false);
      });
    });
  });
  describe('#_isValidSection', function () {
    var dynamicConnection;
    beforeEach(function () {
      dynamicConnection = new DynamicConnection();
    });
    afterEach(function () {
      dynamicConnection = null;
    });
    it('should be true for "source"', function () {
      expect(dynamicConnection._isValidSection('source')).to.be.true;
    });
    it('should be true for "destination"', function () {
      expect(dynamicConnection._isValidSection('destination')).to.be.true;
    });
    it('should be false for "xxx"', function () {
      expect(dynamicConnection._isValidSection('xxx')).to.be.false;
    });
  });
});
