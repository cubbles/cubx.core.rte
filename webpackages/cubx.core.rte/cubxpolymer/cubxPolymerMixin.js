/* globals _ */
/**
 *
 * @namespace cubxPolymerMixin
 * @description Polymer and CubxPolymer extended HTMLElement
 */
(function (_) {
  'use strict';
  /**
   *
   * @type {object}
   */
  var cubxPolymerMixin = {};

  /* **********************************************************************************/
  /*                      public methods                                              */
  /* **********************************************************************************/

  /**
   * Indicates whether the component is ready.
   * @returns {boolean}
   * @memberOf cubxPolymerMixin
   * @public
   */
  cubxPolymerMixin.isComponentReady = function () {
    return this._componentReady ? this._componentReady : false;
  };

  /**
   * Create and add a dynamic connection to the contexts connectionlist.
   * @memberOf cubxPolymerMixin
   * @public
   * @param {cif.cubx.DynamicConnection} dynamicConnection with the following format
   * <pre>
   * {
     *     source: {
     *         runtimeId: 'aRuntimeId',
     *         slot: 'slotA'
     *     },
     *     destination: {
     *         runtimeId: 'aRuntimeId',
     *         slot: 'slotB'
     *     },
     *     repeatedValues: false,
     *     copyValue: true,
     *     hookFunction: 'myFunc'
     * }
   * </pre>
   *
   * @returns {string} the generated connectionId
   * @throws {Error} - by invalid dynamicConnection parameter of if the connectionId exists for a static connection.
   */
  cubxPolymerMixin.addDynamicConnection = function (dynamicConnection) {
    var connectionId = this.generateConnectionId(dynamicConnection);
    dynamicConnection.connectionId = connectionId;
    var directExecution = dynamicConnection.directExecution ? dynamicConnection.directExecution : false;
    // 1. find own context  -> getRuntimeId - get runtimeId of contexts
    var ownRuntimeId = this.getRuntimeId();
    var context = this._getParentContextForRuntimeId(ownRuntimeId);
    var connectionMgr = context.getConnectionMgr();
    // 2. get source element
    var sourceElement = this._getElementForEndpoint(dynamicConnection, 'source');
    // 3. check source context === own context

    this._checkEndpointContext(context, sourceElement);
    // 4. get destination element
    var destinationElement = this._getElementForEndpoint(dynamicConnection,
      'destination');
    // 5. check destination context === own context
    this._checkEndpointContext(context, destinationElement);

    // 6. create new connection
    var connection = this._createConnectionManagerConnectionObject(dynamicConnection,
      sourceElement,
      destinationElement);
    // 7. validate connection
    var err = connection.validate();
    if (err.length === 0) {
      // 8. append connection
      connectionMgr.addDynamicConnection(connection, directExecution);
    } else {
      throw new Error('The connection can not be added to the context, because errors are detected:' +
        JSON.stringify(err));
    }
    return connectionId;
  };
  /**
   * Remove an existing dynamic connection from the belonging contexts connection list.
   * @memberOf cubxPolymerMixin
   * @public
   * @param {string} connection
   * @throws Error - if the connectionID in the connection list not exists or  if the  connection not dynamic
   *     connection is.
   */
  cubxPolymerMixin.removeDynamicConnection = function (connection) {
    var connectionId = this._identifyConnectionId(connection);
    var ownRuntimeId = this.getRuntimeId();
    var context = this._getParentContextForRuntimeId(ownRuntimeId);
    var connectionMgr = context.getConnectionMgr();
    connectionMgr.removeDynamicConnection(connectionId);
  };
  /**
   * Export the dynamicConnections with connection endpoints of the element self from the own context.
   * @returns JSON with all connections, in which this component participates.
   * <pre>
   * [
   *     {
     *         "source": {
     *             "runtimeId": "aRuntimeId",
     *             "slot": "slotA"
     *         },
     *         "destination": {
     *             "runtimeIdId": "myRuntimeId",
     *             "slot": "slotB"
     *         },
     *         "repeatedValues": false,
     *         "copyValue": true,
     *         "hookFunction": "myFunc"
     *     },
   *     {
     *         "source: {
     *             "runtimeId": "otherRuntimeId",
     *             "slot": "slotC"
     *         },
     *         "destination": {
     *             "runtimeIdId": "myRuntimeId",
     *             "slot": "slotD"
     *         }
     *     }
   * ]
   * </pre>
   * @memberOf cubxPolymerMixin
   * @public
   */
  cubxPolymerMixin.exportDynamicConnections = function () {
    var ownRuntimeId = this.getRuntimeId();
    var context = this._getParentContextForRuntimeId(ownRuntimeId);
    var connectionMgr = context.getConnectionMgr();
    var connections = connectionMgr._connections;
    var dynamicConnections = _.filter(connections, { 'static': false });
    var exportDynamicConnections = [];
    var me = this;
    _.each(dynamicConnections, function (value) {
      if (value.source.component !== me && value.destination.component !== me) {
        // connection endpoint not this element
        return;
      }
      var dynCon = value.toDynamicConnection();
      if (dynCon) {
        exportDynamicConnections.push(dynCon);
      }
    });
    return JSON.stringify(exportDynamicConnections);
  };

  /**
   * Return the base uri of the component, which has the pattern: [baseUrl]/[webpackageId]/[artifactId]
   * @returns {string}
   */
  cubxPolymerMixin.getComponentBaseUri = function () {
    var artifactId = this.___cubxManifest___.artifactId;
    var webpackageId = this.___cubxManifest___.webpackageId;
    var baseUri = window.cubx.CRC._baseUrl;
    if (baseUri.lastIndexOf('/') !== baseUri.length - 1) {
      baseUri += '/';
    }
    baseUri += webpackageId + '/' + artifactId;
    return baseUri;
  };

  /* *****************************************************************/
  /* *********************** private methods *************************/
  /* *****************************************************************/

  cubxPolymerMixin._moveCubxElementChildren = function () {
    this._moveCubxCoreConnections();
    this._moveCubxCoreInit();
  };

  cubxPolymerMixin._moveCubxCoreConnections = function () {
    this._moveCubxCoreElement('cubx-core-connections');
  };

  cubxPolymerMixin._moveCubxCoreInit = function () {
    this._moveCubxCoreElement('cubx-core-init');
  };

  cubxPolymerMixin._moveCubxCoreElement = function (tagName) {
    if (!tagName) {
      return;
    }
    var elem = Polymer.dom(this).querySelector(tagName);
    if (elem) {
      elem = Polymer.dom(this).removeChild(elem);
      if (Polymer.dom(this.root).children.length > 0) {
        var firstElement = Polymer.dom(this.root).children[ 0 ];
        Polymer.dom(this.root).insertBefore(elem, firstElement);
      } else {
        Polymer.dom(this.root).appendChild(elem);
      }
    }
  };

  /**
   * Complement the component prototype with the cubbles specific methods.
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._initPrototypeForCubx = function () {
    /**
     * component name
     * @type {string}
     */
    this.cubxPolymerName = this.is;
    if (!this.cubxPolymerName) {
      throw new Error('Element name could not be inferred.');
    }
    this._wrapLifeCycleMethods();

    // this._deleteAndSaveCubxElementChilren();

    if (!this.properties) {
      this.properties = {};
    }
    this.properties.model = {
      type: Object,
      value: function () {
        return {};
      }
    };
    if (!this.observers) {
      this.observers = [];
    }
    this.___cubxManifest___ = this._getComponentFromCRCCache(this.cubxPolymerName);
    this._initSlots(this.___cubxManifest___.slots);
  };

  /**
   * Wrap the polymer lifecycle methods: attached, detached, created, ready
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._wrapLifeCycleMethods = function () {
    if (this.hasOwnProperty('created')) {
      this.originCreated = this.created;
    }
    /**
     * Wrap the origin created callback function: get the component manifest, and called the origin
     * function if exists.
     *
     * @memberOf cubxPolymerMixin
     * @public
     *
     */
    this.created = function () {
      if (this.originCreated) {
        this.originCreated();
      }
    };

    if (this.hasOwnProperty('ready')) {
      this.originReady = this.ready;
    }
    /**
     * Wrap the origin ready callback function: init the CubxPolymer and call the origin ready function if
     * exists.
     *
     * @memberOf cubxPolymerMixin
     * @public
     *
     */
    this.ready = function () {
      this._moveCubxElementChildren();
      this._initValues();
      this._cifReady();
      if (this.originReady) {
        this.originReady();
      }
    };

    if (this.hasOwnProperty('attached')) {
      this.originAttached = this.attached;
    }

    /**
     * Wrap the origin attached callback function
     * @memberOf cubxPolymerMixin
     * @public
     *
     */
    this.attached = function () {
      if (this.originAttached) {
        this.originAttached();
      }
      this._fireReadyEvent();
    };

    if (this.hasOwnProperty('detached')) {
      this.originDetached = this.detached;
    }

    /**
     * Wrap the origin detached callback function.
     *
     * @memberOf cubxPolymerMixin
     * @public
     *
     */
    this.detached = function () {
      if (this.originDetached) {
        this.originDetached();
      }
    };
  };

  /**
   * Fire the 'componentReady' Event.
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._fireReadyEvent = function () {
    // console.log('_fireReadyEvent ', this);
    this._componentReady = true;
    this.fire(window.cubx.EventFactory.types.COMPONENT_READY,
      { runtimeId: this.getAttribute('runtime-id') });
  };

  /**
   * Generate the slot spezific methods.
   *
   * @param {Array|Object} slots list of slots slots or one slot object
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._initSlots = function (slots) {
    if (typeof slots === 'undefined') {
      return;
    }
    if (_.isArray(slots)) {
      this._generateSlotsMethod(slots);
      for (var index = 0; index < slots.length; index++) {
        this._initSlot(slots[ index ]);
      }
    } else if (_.isObject(slots)) {
      var tempSlots = [];
      tempSlots.push(slots);
      this._generateSlotsMethod(tempSlots);
      this._initSlot(slots);
    }
  };
  /**
   * Initialize a slot (methods).
   *
   * @param {Object} slot aslot object or slot name
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._initSlot = function (slot) {
    if (!slot.hasOwnProperty('slotId')) {
      console.error('Abort initialisation of the slot, because the attribute "slot.slotId" not exists.', slot);
      return;
    }
    var slotId = slot.slotId;

    var observerString = this._getObserverHandlerMethodName(slotId) + '(model.' + slotId + ')';
    this.observers.push(observerString);
    this._generateObserverHandlerMethodForProperty(slotId);

    this._generateSetMethod(slotId);
    this._generateGetMethod(slotId);

    this._generateChangeMethodForProperty(slotId);
    // this._generateObserverHandlerMethodForProperty(slotId);
    // this._generateObserveForProperty(slotId);
    if (this.isOutputSlot(slot)) {
      this._generateRepropagateMethod(slotId);
    }
  };

  /**
   * Set the model variable.
   * @param {object} model
   * @private
   */
  cubxPolymerMixin._setModel = function (model) {
    this.set('model', model);
  };

  /**
   * Get the moel variable.
   * @returns {object}
   * @private
   */
  cubxPolymerMixin._getModel = function () {
    return this.get('model');
  };

  /**
   * Indicate, that the slot variable  propagated.
   *
   * (Get the propagated.<slotId> property)
   * @param {String} slotId
   * @returns {Boolean}
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._isPropagated = function (slotId) {
    if (!this.propagated) {
      return false;
    }
    return this.propagated[ slotId ];
  };

  /**
   * set the propagated flag for the slot.
   *
   * @param {String} slotId
   * @param {Boolean} flag
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._setPropagated = function (slotId, flag) {
    if (!this.propagated) {
      this.propagated = {};
    }
    this.propagated[ slotId ] = flag;
  };

  /**
   * Set the slot value.
   * @param {string} key
   * @param {*} value
   * @private
   */
  cubxPolymerMixin._setSlotValue = function (key, value) {
    this.set('model.' + key, value);
  };
  /**
   * Set the slot value by initialisation.
   * @param {string} slotId slotId
   * @param {*} value
   * @private
   */
  cubxPolymerMixin._initSlotValue = function (slotId, value) {
    this._setPropagated(slotId, true);
    this.set('model.' + slotId, value);
  };

  /**
   * Called if cifReady event dispatched.
   * @private
   */
  cubxPolymerMixin._cifReadyHandler = function () {
    this._synchronizeModelWithStorageManager();
    this._callContextReadyLifeCycleMethod();
  };

  /**
   * Call the lifecycle method cubxReady, if exists.
   * @memberOf cubxPolymerMixin
   * @private
   */
  cubxPolymerMixin._callContextReadyLifeCycleMethod = function () {
    if (this.cubxReady) {
      this.cubxReady();
    }
  };

  /* **********************************************************************************/
  /*                      cubx generate methods                                      */
  /* **********************************************************************************/

  /**
   * Generate the set method.
   *
   * @param {String} slotId slotId
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._generateSetMethod = function (slotId) {
    this[ this._getSetMethodName(slotId) ] = function (value) {
      this._setPropagated(slotId, true);
      this._setInModel(slotId, value);
      this[ this._getChangeHandlerMethodName(slotId) ](value);
    };
  };

  /**
   * Generate the handler method of the observer for the property.
   *
   * @param {String} slotId
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._generateObserverHandlerMethodForProperty = function (slotId) {
    this[ this._getObserverHandlerMethodName(slotId) ] = function (value) {
      if (value) {
        if (this._isPropagated(slotId)) {
          this._setPropagated(slotId, false);
        } else {
          this[ this._getChangeHandlerMethodName(slotId) ](value);
        }
      }
    };
  };

  /**
   * Generate the change handler method of the slot private property.
   *
   * @param {String} slotId slotId
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._generateChangeMethodForProperty = function (slotId) {
    this[ this._getChangeHandlerMethodName(slotId) ] = function (newValue) {
      var hookMethod = this[ this._getMethodNameModelChanged(slotId) ];
      if (hookMethod && _.isFunction(hookMethod)) {
        var argsCount = hookMethod.length;
        if (argsCount === 0) {
          hookMethod.call(this);
        } else {
          hookMethod.call(this, this._cloneValue(newValue));
        }
      }

      if (this.isOutputSlot(slotId)) {
        this._outputHandler(slotId, newValue);
      }
    };
  };

  /* **********************************************************************************/
  /*                      cubx function names for generated methods                   */
  /* **********************************************************************************/

  /**
   * get the observer handler method name.
   * @param {string} slotId
   * @return {string}
   * @memberOf cubxPolymerMixin
   * @private
   */
  cubxPolymerMixin._getObserverHandlerMethodName = function (slotId) {
    return '_observerHandler4' + _.capitalize(slotId);
  };

  /**
   * Get the name of the custom hook method after change the privat model.
   *
   * @param {String} slotId  slotId
   * @returns {String} the name of chandedHook4 method for the specified slot
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._getMethodNameModelChanged = function (slotId) {
    return 'model' + _.capitalize(slotId) + 'Changed';
  };
  /**
   * Get the name of the handler method calling after change the privat model.
   *
   * @param {String} slotId slotId
   * @returns {String} methodname of the handler for the spezified slot
   * @private
   * @memberOf cubxPolymerMixin
   */
  cubxPolymerMixin._getChangeHandlerMethodName = function (slotId) {
    return '_handleChange4' + _.capitalize(slotId);
  };

  // Mix  the cubxComponentMixin in cubxPolymerMixin
  _.mixin(cubxPolymerMixin, window.cubx.cubxComponentMixin);

  // Mix  the DynamicConnectionUtils in cubxPolymerMixin
  _.mixin(cubxPolymerMixin, window.cubx.dynamicConnectionUtil);

  if (!window.cubx) {
    window.cubx = {};
  }

  window.cubx.cubxPolymerMixin = cubxPolymerMixin;
})(_);
