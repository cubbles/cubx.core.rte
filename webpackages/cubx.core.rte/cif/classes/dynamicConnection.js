(function () {
  'use strict';
  var DynamicConnection = function () {
    if (arguments.length > 0) {
      this._init(arguments[ 0 ]);
    }
  };

  DynamicConnection.prototype.setSource = function (source) {
    var error = this._validateSource(source);
    if (error.length > 0) {
      console.error('The "source" parameter ', source, ' is not valid. Caused error:', error);
      throw new SyntaxError('Not valid source parameter.');
    }
    this.source = source;
  };
  DynamicConnection.prototype.setDestination = function (destination) {
    var error = this._validateDestination(destination);
    if (error.length > 0) {
      console.error(
        'The "destination" parameter (' + JSON.stringify(destination) + ') is not a valid. Caused error:' +
        JSON.stringify(error));
      throw new SyntaxError('Not valid destination parameter.');
    }
    this.destination = destination;
  };
  DynamicConnection.prototype.setDestinationRuntimeId = function (runtimeId) {
    var error = this._validateRuntimeId(runtimeId);
    if (error.length > 0) {
      console.error('The "runtimeId" parameter (' + runtimeId + ') is not a valid. Caused error:' +
        JSON.stringify(error));
      throw new SyntaxError('Not valid runtimeId parameter.');
    }
    if (!this.destination) {
      this.destination = {};
    }
    this.destination.runtimeId = runtimeId;
  };
  DynamicConnection.prototype.setDestinationSlot = function (slot) {
    var error = this._validateSlot(slot);
    if (error.length > 0) {
      console.error('The "slot" parameter (' + slot + ') is not a valid. Caused error:' +
        JSON.stringify(error));
      throw new SyntaxError('Not valid slot parameter.');
    }
    if (!this.destination) {
      this.destination = {};
    }
    this.destination.slot = slot;
  };
  DynamicConnection.prototype.setSourceRuntimeId = function (runtimeId) {
    var error = this._validateRuntimeId(runtimeId);
    if (error.length > 0) {
      console.error('The "runtimeId" parameter (' + runtimeId + ') is not a valid. Caused error:' +
        JSON.stringify(error));
      throw new SyntaxError('Not valid runtimeId parameter.');
    }
    if (!this.source) {
      this.source = {};
    }
    this.source.runtimeId = runtimeId;
  };
  DynamicConnection.prototype.setSourceSlot = function (slot) {
    var error = this._validateSlot(slot);
    if (error.length > 0) {
      console.error('The "slot" parameter', slot, ' is not valid. Caused error:', error);
      throw new SyntaxError('Not valid slot parameter.');
    }
    if (!this.source) {
      this.source = {};
    }
    this.source.slot = slot;
  };
  DynamicConnection.prototype.setConnectionId = function (connectionId) {
    var error = this._validateConnectionId(connectionId);
    if (error.length > 0) {
      console.error('The "connectionId" parameter ', connectionId, ') is not valid. Caused error:', error);
      throw new SyntaxError('Not valid connectionId parameter.');
    }
    this.connectionId = connectionId;
  };
  DynamicConnection.prototype.setCopyValue = function (copyValue) {
    var error = this._validateCopyValue(copyValue);
    if (error.length > 0) {
      console.error('The "copyValue" parameter ', copyValue, ' is not valid. Caused error:', error);
      throw new SyntaxError('Not valid copyValue parameter.');
    }
    this.copyValue = copyValue;
  };
  DynamicConnection.prototype.setRepeatedValues = function (repeatedValues) {
    var error = this._validateRepeatedValues(repeatedValues);
    if (error.length > 0) {
      console.error('The "repeatedValues" parameter ', repeatedValues, ' is not valid. Caused error:', error);
      throw new SyntaxError('Not valid repeatedValues parameter.');
    }

    this.repeatedValues = repeatedValues;
  };
  DynamicConnection.prototype.setDirectExecution = function (directExecution) {
    var error = this._validateDirectExecution(directExecution);
    if (error.length > 0) {
      console.error('The "directExecution" parameter ', directExecution, ' is not valid. Caused error:', error);
      throw new SyntaxError('Not valid directExecution parameter.');
    }

    this.directExecution = directExecution !== undefined && directExecution ? directExecution : false;
  };
  DynamicConnection.prototype.setHookFunction = function (hookFunction) {
    var error = this._validateHookFunction(hookFunction);
    if (error.length > 0) {
      console.error('The "hookFunction" parameter ', hookFunction, ' is not valid. Caused error:', error);
      throw new SyntaxError('Not valid hookFunction parameter.');
    }
    this.hookFunction = hookFunction;
  };
  DynamicConnection.prototype.validate = function () {
    var error = [];
    var er = this._validateConnectionId(this.connectionId);
    if (er && er.length > 0) {
      error = error.concat(er);
    }
    er = this._validateSource(this.source);
    if (er && er.length > 0) {
      error = error.concat(er);
    }
    er = this._validateDestination(this.destination);
    if (er && er.length > 0) {
      error = error.concat(er);
    }
    er = this._validateRepeatedValues(this.repeatedValues);
    if (er && er.length > 0) {
      error = error.concat(er);
    }
    er = this._validateCopyValue(this.copyValue);
    if (er && er.length > 0) {
      error = error.concat(er);
    }
    er = this._validateHookFunction(this.hookFunction);
    if (er && er.length > 0) {
      error = error.concat(er);
    }

    return error;
  };

  /* ***************************************************************/
  /* ****************** private methods*****************************/
  /* ***************************************************************/

  DynamicConnection.prototype._init = function (config) {
    var temp = new DynamicConnection();
    if (config.connectionId) {
      temp.connectionId = config.connectionId;
    }
    if (config.source) {
      temp.source = config.source;
    }
    if (config.destination) {
      temp.destination = config.destination;
    }
    if (config.hasOwnProperty('copyValue')) {
      temp.copyValue = config.copyValue;
    }
    if (typeof config.repeatedValues === 'boolean') {
      temp.repeatedValues = config.repeatedValues;
    }
    if (config.hasOwnProperty('hookFunction')) {
      temp.hookFunction = config.hookFunction;
    }
    if (config.hasOwnProperty('directExecution')) {
      temp.directExecution = config.directExecution;
    }
    var error = temp.validate();
    if (error.length > 0) {
      console.error('The "config" parameter ', config, ') is not valid. Caused error:', error);
      throw new SyntaxError('The parameter "config" is not valid.');
    } else {
      Object.assign(this, temp);
    }
  };
  DynamicConnection.prototype._validateSource = function (source) {
    var error = [];
    if (!source) {
      error.push('The "source" is missed.');
      return error;
    }
    if (typeof source !== 'object') {
      error.push('Not valid source (' + JSON.stringify(source) + '). The "source" must be an object.');
      return error;
    }
    if (!source.hasOwnProperty('slot')) {
      error.push('The "source.slot" is missed.');
    }
    var err = this._validateSlot(source.slot);
    if (err && err.length > 0) {
      error = error.concat(err);
    }
    if (!source.hasOwnProperty('runtimeId')) {
      error.push('The "source.runtimeId" is missed.');
    }
    err = this._validateRuntimeId(source.runtimeId);
    if (err && err.length > 0) {
      error = error.concat(err);
    }

    return error;
  };
  DynamicConnection.prototype._validateDestination = function (destination) {
    var error = [];
    if (!destination) {
      error.push('The "destination" is missed.');
      return error;
    }
    if (typeof destination !== 'object') {
      error.push(
        'Not valid destination (' + JSON.stringify(destination) + '). The "destination" must be an object.');
      return error;
    }
    if (!destination.hasOwnProperty('slot')) {
      error.push('The "destination.slot" is missed.');
    }
    var err = this._validateSlot(destination.slot, 'destination');
    if (err && err.length > 0) {
      error = error.concat(err);
    }
    if (!destination.hasOwnProperty('runtimeId')) {
      error.push('The "destination.runtimeId" is missed.');
    }
    err = this._validateRuntimeId(destination.runtimeId, 'destination');
    if (err && err.length > 0) {
      error = error.concat(err);
    }

    return error;
  };
  DynamicConnection.prototype._isValidSection = function (section) {
    return section === 'source' || section === 'destination';
  };
  DynamicConnection.prototype._validateRuntimeId = function (runtimeId) {
    var error = [];
    if (typeof runtimeId !== 'string') {
      error.push('Not valid "runtimeId" (' + JSON.stringify(runtimeId) + '). It must be a string.');
    } else {
      var reg = /^[a-z][a-zA-Z0-9-.:/@]*$/;
      if (!runtimeId.match(reg)) {
        error.push(
          'Not valid "runtimeId" (' + runtimeId + '). It must match to ' + reg);
      }
    }
    return error;
  };
  DynamicConnection.prototype._validateSlot = function (slot, section) {
    var error = [];

    if (typeof slot !== 'string') {
      error.push('Not valid "slot" (' + JSON.stringify(slot) + '). It must be a string.');
    }

    return error;
  };
  DynamicConnection.prototype._validateConnectionId = function (connectionId) {
    var error = [];
    if (typeof connectionId !== 'string') {
      error.push('Not valid "connectionId" (' + JSON.stringify(connectionId) + '). It must be a string.');
      return error;
    }

    return error;
  };
  DynamicConnection.prototype._validateHookFunction = function (hookFunction) {
    var error = [];
    if (typeof hookFunction !== 'undefined' && hookFunction !== null && typeof hookFunction !== 'string') {
      error.push('The "hookFunction" must be a string.');
    }
    return error;
  };
  DynamicConnection.prototype._validateRepeatedValues = function (repeatedValues) {
    var error = [];
    if (typeof repeatedValues !== 'undefined' && repeatedValues !== null && typeof repeatedValues !== 'boolean') {
      error.push('The "repeatedValues" must be a boolean.');
    }
    return error;
  };
  DynamicConnection.prototype._validateCopyValue = function (copyValue) {
    var error = [];

    if (typeof copyValue !== 'undefined' && copyValue !== null && typeof copyValue !== 'boolean') {
      error.push('The "copyValue" must be a boolean.');
    }
    return error;
  };

  DynamicConnection.prototype._validateDirectExecution = function (directExecution) {
    var error = [];

    if (typeof directExecution !== 'undefined' && directExecution !== null &&
      typeof directExecution !== 'boolean') {
      error.push('The "directExecution" must be a boolean.');
    }
    return error;
  };

  // assign CompoundComponent to global cif namespace
  if (!window.cubx.__cifError__) {
    window.cubx.cif.DynamicConnection = DynamicConnection;
  }
})();
