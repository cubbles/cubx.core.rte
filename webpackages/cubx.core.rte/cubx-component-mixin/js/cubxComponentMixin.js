/* globals _,guid */
'use strict';
(function () {
  var cubxComponentMixin = {};

  cubxComponentMixin._isReadyRegistered = false;

  /**
   * Set the value of an input slot and trigger a cll of the custom hook method and change the private
   * value of the slot.
   *
   * @param {String} slotId slotId
   * @param {Object} payloadObject
   * @memberOf cubxComponentMixin
   * @public
   */
  cubxComponentMixin.setInputSlot = function (slotId, payloadObject) {
    // console.log('setInputSlot (', this.tagName, this.getAttribute('runtime-id'), ') ', slotId, payloadObject);
    // console.log('payloadObject.connectionHook', payloadObject.connectionHook);

    var nextCall;
    var newValue;
    if (payloadObject.connectionHook) {
      nextCall = this._processConnectionHook(payloadObject);
      if (nextCall.called) {
        newValue = nextCall.newValue;
      } else {
        return;
      }
    } else {
      newValue = payloadObject.payload;
    }
    if (this.isInputSlot(slotId)) {
      // var newValue = payloadObject.payload;
      this[ this._getSetMethodName(slotId) ](newValue);
    }
  };
  /**
   * Checks, if the slot is an input slot.
   *
   * @param {Object|String} slot slot object or slot name
   * @returns {Boolean} true = input slot, false not input slot
   * @memberOf cubxComponentMixin
   * @public
   */
  cubxComponentMixin.isInputSlot = function (slot) {
    var slotObj = this._getSlot(slot);
    if (!slotObj) {
      return false;
    }
    if (slotObj.hasOwnProperty('direction') && _.includes(slotObj.direction, 'input')) {
      return true;
    } else if (!slotObj.hasOwnProperty('direction')) {
      return true;
    }
    return false;
  };
  /**
   * Checks, if the slot is an output slot.
   *
   * @param {Object|String} slot slot object or slotId
   * @returns {Boolean} {Boolean} true = output slot, false not output slot
   *
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin.isOutputSlot = function (slot) {
    var slotObj = this._getSlot(slot);
    if (!slotObj) {
      return false;
    }
    if ((slotObj.hasOwnProperty('direction') && _.includes(slotObj.direction, 'output')) || _.isEmpty(slotObj.direction)) {
      return true;
    } else if (!slotObj.hasOwnProperty('direction')) {
      return true;
    }
    return false;
  };

  /**
   * fire the EventFactory.types.CIF_MODEL_CHANGE event for components
   * @param {object} payloadObject
   * @memberOf cubxComponentMixin
   * @method
   */
  cubxComponentMixin.fireModelChangeEvent = function (payloadObject) {
    // console.log('cubxComponentMixin.fireModelChangeEvent', this,payloadObject);
    var factory = this._getEventFactory();
    var event = factory.createEvent(window.cubx.EventFactory.types.CIF_MODEL_CHANGE, payloadObject);
    this.dispatchEvent(event);
  };

  /**
   * Returns the runtimeId of the component.
   * @returns {string|*} runtimeId of the component
   * @memberOf cubxComponentMixin
   * @public
   */
  cubxComponentMixin.getRuntimeId = function () {
    var runtimeId = this.getAttribute('runtime-id');
    if (typeof runtimeId === 'undefined' || runtimeId === null) {
      runtimeId = guid();
      this.setAttribute('runtime-id', runtimeId);
    }
    return runtimeId;
  };

  /* **********************************************************************************/
  /*                      private methods                                             */
  /* **********************************************************************************/

  /**
   * Set a new value for a slot in model.
   * @param {String} key slotId as key
   * @param {*} value value of the slot
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._setInModel = function (key, value) {
    var modelName = key;
    if (!_.isString(modelName)) {
      modelName = String(modelName);
    }
    this._setSlotValue(key, value);
  };

  /**
   * Get the internal EventFactory instance.
   *
   * @returns {window.cubx.EventFactory}
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getEventFactory = function () {
    if (!this._eventFactory) {
      this._eventFactory = new window.cubx.EventFactory();
    }
    return this._eventFactory;
  };
  /**
   * Get the slot object. If slot is a string, search for the slotobject in the manifest, otherfalls get it directly.
   *
   * @param  {Object|String} slot a slot object or slot name
   * @returns {Object} slot object
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getSlot = function (slot) {
    var slotObj;
    if (_.isString(slot)) {
      slotObj = _.find(this.___cubxManifest___.slots, function (item) {
        return item.slotId === slot;
      });
    } else {
      slotObj = slot;
    }
    return slotObj;
  };

  /**
   * Wait for event cifReady, and then finish the initialisation.
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._cifReady = function () {
    var rootElement = window.cubx.CRC.getCRCElement();

    rootElement.addEventListener(window.cubx.EventFactory.types.CIF_READY, function (evt) {
      if (!this._isReadyRegistered) {
        this._isReadyRegistered = true;
        this._cifReadyHandler();
      }
    }.bind(this));
    rootElement.addEventListener(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY, function (evt) {
      if (!this._isReadyRegistered) {
        this._isReadyRegistered = true;
        this._cifReadyHandler();
      }
    }.bind(this));
  };

  /**
   * Fetch the component manifest from crc.manifestCache on the basis of the component name.
   *
   * @private
   * @returns {Object} manifest object
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getComponentFromCRCCache = function (component) {
    var cache = window.cubx.CRC.getCache();
    var manifest = cache.getComponentCacheEntry(component);
    return manifest || {};
  };

  /**
   * Trigger a model change event for an output slot.
   *
   * @param {String} slotId slotId
   * @param {Object} modelEventPayload payload object of the event
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._triggerModelChangeEvent = function (slotId, modelEventPayload) {
    if (window.cubx.cif && window.cubx.cif.cif &&
      window.cubx.cif.cif.isAllComponentsReady(window.cubx.CRC.getCRCElement())) {
      var runtimeId = this.getRuntimeId();
      runtimeId = typeof runtimeId === 'undefined' ? '' : runtimeId;
      if (window.cubx.CRC.getRuntimeMode() === 'dev') {
        console.log(
          this.tagName.toLowerCase() + ' (runtimeId:' + runtimeId + ')._triggerModelChangeEvent for slot: ' +
          slotId + '-> payload: ', modelEventPayload.payload);
      }
      this.fireModelChangeEvent(modelEventPayload);
    }
  };

  /**
   * Initialized the values of configured slots.
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._initValues = function () {
    var slots = this.___cubxManifest___.slots;
    if (!slots) { // no slots definitions
      return;
    }
    if (!_.isArray(slots) && _.isObject(slots)) {
      var tempSlots = [];
      tempSlots.push(slots);
      slots = tempSlots;
    }
    for (var index = 0; index < slots.length; index++) {
      var slot = slots[ index ];
      var value = this._initValue(slot.value, slot.type);
      var slotId = slot.slotId;
      this._setInModel(slotId, value);
    }
  };

  /**
   * Inititlize the default value.
   *
   * If the originValue not null or undefined, it will be initialized with originValue.
   * If the originValue null or undefined, and the type param exists and is valid, it will the default value
   * of the type initilaized.
   *
   * @param {*} origValue original value
   * @param {String} type  type of the slot
   * @returns {*} value for initialize a slot
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._initValue = function (origValue, type) {
    var value;
    if (!_.isEmpty(origValue) || _.isNumber(origValue) || _.isBoolean(origValue)) {
      value = origValue;
    } else if (!_.isEmpty(type) && this._isValidType(type) && _.isEmpty(origValue)) {
      value = this._getDefaultValueForType(type, origValue);
    } else {
      value = origValue;
    }
    return value;
  };

  /**
   * Generate the handler method for an output slot.
   *
   * @param {String} slotId slotId
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._outputHandler = function (slotId, value) {
    var payloadObj = this._getEventFactory().createModelChangePayloadObject(slotId, value);
    this._triggerModelChangeEvent(slotId, payloadObj);
  };
  /* **********************************************************************************/
  /*                      cubx generate methods                                       */
  /* *********************************************************************************/
  /**
   * Generate a get method for a slot.
   * @param {string} slotId
   * @private
   * @method
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._generateGetMethod = function (slotId) {
    this[ this._getGetMethodName(slotId) ] = function () {
      return this.model[ slotId ];
    };
  };

  /**
   * Generate a method "slots()". The method "slots" get a list of the slots of the element.
   * @param {array} slots
   * @memberOf cubxComponentMixin
   * @private
   */
  cubxComponentMixin._generateSlotsMethod = function (slots) {
    this._slots = [];
    _.each(slots, function (elem) {
      var slot = { slotId: elem.slotId };
      if (elem.type) {
        slot.type = elem.type;
      }
      if (elem.direction) {
        slot.direction = elem.direction;
      } else {
        slot.direction = [ 'input', 'output' ];
      }
      if (elem.description) {
        slot.description = elem.description;
      }
      this._slots.push(slot);
    }.bind(this));

    this.slots = function () {
      return this._slots;
    };
  };

  cubxComponentMixin._generateRepropagateMethod = function (slotId) {
    if (this.isOutputSlot(slotId)) {
      this[ this._getRepropagateMethodName(slotId) ] = function (async) {
        if (!async) {
          async = false;
        }
        var value = this[ this._getGetMethodName(slotId) ]();
        if (async) {
          this.async(function () {
            this._outPutHandler(slotId, value);
          }, [ slotId, value ], 0);
        } else {
          this._outputHandler(slotId, value);
        }
      };
    }
  };

  /* **********************************************************************************/
  /*                      cubx function names for generated methods                   */
  /* **********************************************************************************/
  /**
   * Get the name of the get method depends on slotId.
   *
   * @param {String} slotId slotId
   * @returns {String} name of the get method for the specified slot
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getGetMethodName = function (slotId) {
    return 'get' + _.capitalize(slotId);
  };

  /**
   * Get the name of the set method depends on slotId.
   *
   * @param {String} slotId slotId
   * @returns {String} name of the set method for the specified slot
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getSetMethodName = function (slotId) {
    return 'set' + _.capitalize(slotId);
  };

  /**
   * Get the name of the repropagate method depends on slotId.
   *
   * @param {String} slotId slotId
   * @returns {String} name of the repropagate method for the specified slot
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getRepropagateMethodName = function (slotId) {
    return 'repropagate' + _.capitalize(slotId);
  };
  /* **********************************************************************************/
  /*                      util functions                                              */
  /* **********************************************************************************/
  /**
   * Get the defaultvalue for the type.
   *
   * @param {String} type type of the slot
   * @param {*} fallback value
   * @returns {*}
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getDefaultValueForType = function (type, fallbackValue) {
    var value = fallbackValue;

    switch (type.toLowerCase()) {
      case 'string':
        break;
      case 'number':
        value = 0;
        break;
      case 'boolean':
        value = false;
        break;
      case 'array':
        break;
      case 'object':
        break;
      default:
        break;
    }
    return value;
  };

  /**
   * Clone a slot value if this is an object.
   *
   * @param {*} value value to clone
   * @returns {*}
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._cloneValue = function (value) {
    return _.isObject(value) ? _.cloneDeep(value) : value;
  };

  /**
   * Process the connection hook an returns with the modified new value
   * @param {object} payloadObject
   * @returns {*}
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._processConnectionHook = function (payloadObject) {
    var value = payloadObject.payload;
    var nextCall = {
      called: false
    };

    var next = function (value) {
      nextCall.newValue = value;
      nextCall.called = true;
    };
    try {
      var funcString = payloadObject.connectionHook;
      if (funcString && typeof funcString === 'string') {
        if (_.trim(funcString).substr(0, 8) === 'function') {
          var startBody = funcString.indexOf('{') + 1;
          var endBody = funcString.lastIndexOf('}');
          var startArgs = funcString.indexOf('(') + 1;
          var endArgs = funcString.indexOf(')');
          /* eslint-disable no-new-func */
          var func = new Function(funcString.substring(startArgs, endArgs), funcString.substring(
            startBody, endBody));
          /* eslint-enable no-new-func */
          func(value, next);
        } else {
          // funcString(value, next);
          var fn = this._getFunctionFromString(funcString);
          if (typeof fn === 'function') {
            fn(value, next);
          } else {
            console.error(
              'The defined hookFunction "window.' + funcString + '" is not a global function.');
          }
        }
      } else {
        console.error(
          'No correct type for hookFunction: The hookFunction has the current type ' + typeof funcString +
          ', but it must defined as a string');
      }
    } catch (err) {
      console.error('The "hookFunction" can not be called. The following error occured: ', err);
    }
    return nextCall;
  };

  /**
   * Get the function object using str.
   * @param {str} str name of the global function Example "cubx.functions.myFirstFunction".
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._getFunctionFromString = function (str) {
    var scope = window;
    var scopeSplit = str.split('.');
    for (var i = 0; i < scopeSplit.length - 1; i++) {
      scope = scope[ scopeSplit[ i ] ];

      if (scope === undefined) {
        return;
      }
    }

    return scope[ scopeSplit[ scopeSplit.length - 1 ] ];
  };

  /**
   * Cheks, if the type a valid type is. vaid types are 'object', 'string', 'number' or 'array'.
   *
   * @param {String} type type of the slot
   * @returns {Boolean} true if the type is valiid, otherfalls false
   * @private
   * @memberOf cubxComponentMixin
   */
  cubxComponentMixin._isValidType = function (type) {
    // TODO typescript Types oder types mit jsonschema  prüfen?
    var validType = [ 'object', 'string', 'number', 'array', 'boolean' ];
    return _.includes(validType, type.toLowerCase());
  };

  // assign CubxComponentMixin to global cif namespace
  if (!window.cubx.__cifError__) {
    window.cubx.cubxComponentMixin = cubxComponentMixin;
  }
}());
