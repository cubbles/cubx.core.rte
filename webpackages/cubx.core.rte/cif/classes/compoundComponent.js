/* globals _ */

(function () {
  'use strict';

  /**
   * Helper Object holding all properties and methods for compound component custom HTML elements.
   * Will be merge in CompoundComponentsProtorype
   * @global
   * @type {object}
   * @namespace
   */
  var compoundComponent = {

    /**
     * indicator for  compound components
     * @type boolean
     *
     */
    isCompoundComponent: true,

    /**
     * eventFactory
     * @type Eventfactory
     *
     */
    eventFactory: new window.cubx.EventFactory()
  };

  /* *******************************************************************/
  /* ******************** lifecycle callback methods *******************/
  /* *******************************************************************/

  /**
   * this callback is executed every time a new compound component element is created
   * @method
   * @memberOf compoundComponent
   */
  compoundComponent.createdCallback = function () {
    // console.log('compoundComponent.createdCallback');
    if (!this._componentCreated) {
      this._componentCreated = true;
      if (this.isCompoundComponent) {
        this.Context = new window.cubx.cif.Context(this);
      }
      this.___cubxManifest___ = this._getComponentFromCRCCache(this.tagName.toLowerCase());
      this._generateModel();
      this._generateAccessMethods();
    }
  };

  /**
   *  this callback is executed every time an attribute is attached to the domtree.
   *  @method
   * @memberOf compoundComponent
   */
  compoundComponent.connectedCallback = function () {
    if (!this._componentConnected) {
      this._componentConnected = true;
    }
  };

  /* *******************************************************************/
  /* ******************** public methods *******************************/
  /* *******************************************************************/
  /**
   * Create and add a dynamic connection to the contexts connectionlist and returns with the generated connectionId.
   * The connection will be generated by usage of source.runtimeId, source.slot, destination.runtimeId
   * destination.slot.
   * @memberOf compoundComponent
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
   * @returns {string} a generated connectionId
   * @throws Error - by invalid dynamicConnection parameter of if the connectionId exists for a static connection.
   */
  compoundComponent.addDynamicConnection = function (dynamicConnection) {
    var connectionId = this.generateConnectionId(dynamicConnection);
    dynamicConnection.connectionId = connectionId;
    var directExecution = dynamicConnection.directExecution ? dynamicConnection.directExecution : false;
    // 1. find context
    var ownRuntimeId = this.getRuntimeId();
    var isInternalConnection = false;
    //  2. get source element
    var sourceElement = this._getElementForEndpoint(dynamicConnection, 'source');
    //  3. get destination element
    var destinationElement = this._getElementForEndpoint(dynamicConnection,
      'destination');
    if (dynamicConnection.source.runtimeId === ownRuntimeId &&
      this._isChild(sourceElement, destinationElement)) {
      isInternalConnection = true;
    }
    if (dynamicConnection.destination.runtimeId === ownRuntimeId &&
      this._isChild(destinationElement, sourceElement)) {
      isInternalConnection = true;
    }

    var context;
    if (isInternalConnection) {
      context = this.Context;
    } else {
      context = this._getParentContextForRuntimeId(ownRuntimeId);
    }
    var connectionMgr = context.getConnectionMgr();
    //  4. check source context === own context
    this._checkEndpointContext(context, sourceElement);
    //  5. check destination context === own context
    this._checkEndpointContext(context, destinationElement);

    //  6. create new connection
    var connection = this._createConnectionManagerConnectionObject(
      dynamicConnection, sourceElement,
      destinationElement);
    //  7. validate connection
    var err = connection.validate();
    if (err.length === 0) {
      //  8. append connection
      connectionMgr.addDynamicConnection(connection, directExecution);
    } else {
      throw new Error('The connection can not be added to the context, because errors are detected:' +
        JSON.stringify(err));
    }
    return connectionId;
  };
  /**
   * Remove an existing dynamic connection from the belonging contexts connection list.
   * @memberOf compoundComponent
   * @public
   * @param {string| object} connection connectionId or connection config object
   * @throws Error - if the connectionID in the connection list not exists or  if the  connection not dynamic
   *     connection is.
   */
  compoundComponent.removeDynamicConnection = function (connection) {
    var connectionId = this._identifyConnectionId(connection);

    //  find Context
    // var ownRuntimeId = this.getRuntimeId();

    var context = this._findContextByConnectionId(connectionId);
    //  generate connectiond if not exist.
    //  var parentContext = this._getParentContextForRuntimeId(ownRuntimeId);
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
   * @memberOf compoundComponent
   * @public
   */
  compoundComponent.exportDynamicConnections = function () {
    var ownRuntimeId = this.getRuntimeId();
    var context = this._getParentContextForRuntimeId(ownRuntimeId);
    //  For Compound only, exported rekursive
    var exportDynamicConnections = this._exportDynamicConnections(context);

    return JSON.stringify(exportDynamicConnections);
  };

  /**
   * get the slot definitions of this component.
   * @memberOf compoundComponent
   * @method
   * @returns {Array}
   */
  compoundComponent.slots = function () {
    var manifest = window.cubx.CRC.getCache().getComponentCacheEntry(this.tagName.toLowerCase());
    _.each(manifest.slots, function (item) {
      if (!item.direction) {
        item.direction = [ 'input', 'output' ];
      }
    });
    return manifest.slots;
  };

  /**
   * Dispatch the componentReady event.
   * event details:
   * <pre>
   * {
         *      runtimeId: runtimeId
         * }
   * </pre>
   * @memberOf compoundComponent
   * @method
   * @param {string} runtimeId runtime id of the component
   * @private
   */
  compoundComponent.fireReadyEvent = function (runtimeId) {
    // console.log(this.tagName + '.fireReadyEvent ',runtimeId);
    this._componentReady = true;
    var componentReadyEvent = this.eventFactory.createEvent(window.cubx.EventFactory.types.COMPONENT_READY,
      {
        runtimeId: runtimeId
      });
    // console.log('compoundComponent fireReady ', this.tagName.toLowerCase(), componentReadyEvent);
    this.dispatchEvent(componentReadyEvent);
    this._cifReady();
  };

  /* *******************************************************************/
  /* ******************** private methods ******************************/
  /* *******************************************************************/

  /**
   * Set the slot model variable.
   * @param {string} key slotId
   * @param {*} value slot value
   * @private
   */
  compoundComponent._setSlotValue = function (key, value) {
    this.model[ key ] = value;
  };

  /**
   * Set the model variable.
   * @param {object} model
   * @private
   */
  compoundComponent._setModel = function (model) {
    this.model = model;
  };

  compoundComponent._outputHandlerForInternalConnections = function (slotId, value) {
    // console.log('+++++++ call processConnections for internal connection', slotId, value);
    //  process internal connections extra
    var payloadObject = this._getEventFactory().createModelChangePayloadObject(slotId, value);
    this.Context.processInternalConnections(slotId, payloadObject);
  };

  /**
   * Export all dynamic connections recursive downwarts on contexts
   * @param {cubx.cif.Context} context
   * @memberOf compoundComponent
   * @method
   * @returns {Array} List of connections
   * @private
   */
  compoundComponent._exportDynamicConnections = function (context) {
    var connectionMgr = context.getConnectionMgr();
    var connections = connectionMgr._connections;
    var internalConnections = connectionMgr._internalConnections;
    var dynamicConnections = _.filter(connections, { 'static': false });
    var dynamicInternalConnections = _.filter(internalConnections, { 'static': false });
    var exportDynamicConnections = [];
    var me = this;
    var isParentContext = me.Context.getParent() === context;
    var exportFunction = function (value) {
      //  if own or parent context and self not source or destination do not export
      if (isParentContext &&
        value.source.component !== me &&
        value.destination.component !== me) {
        //  connection endpoint not this element
        return;
      }
      var dynCon = value.toDynamicConnection();
      if (dynCon) {
        exportDynamicConnections.push(dynCon);
      }
    };

    _.each(dynamicConnections, function (value) {
      exportFunction(value, context.getRootElement());
    });
    _.each(dynamicInternalConnections, function (value) {
      exportFunction(value, context.getRootElement());
    });

    var childContexts = context.getChildren();
    _.each(childContexts, function (item) {
      if (isParentContext && item !== me.Context) {
        return;
      }
      exportDynamicConnections = exportDynamicConnections.concat(me._exportDynamicConnections(item));
    });

    return exportDynamicConnections;
  };

  /* *******************************************************************/
  /* ******************** private methods ******************************/
  /* *******************************************************************/

  /**
   * et the model variable,
   * @returns {Object}
   * @private
   */
  compoundComponent._getModel = function () {
    return this.model;
  };

  /**
   * Method will call after cifReady dispatched.
   * @private
   */
  compoundComponent._cifReadyHandler = function () {
    this._synchronizeModelWithStorageManager();
  };
  /* *******************************************************************/
  /* ******************** generate methods ******************************/
  /* *******************************************************************/
  /**
   * Generate the model variable
   * @private
   * @memberOf compoundComponent
   * @method
   */
  compoundComponent._generateModel = function () {
    this.model = {};
  };

  /**
   * Generate the access methods for slot variables.
   * @method
   * @memberOf CubxCompoundComponent
   * @compoundComponent
   */
  compoundComponent._generateAccessMethods = function () {
    // console.log('_generateAccessMethods', this.tagName,this.___cubxManifest___);
    var me = this;
    if (this.___cubxManifest___ && this.___cubxManifest___.slots) {
      _.each(this.___cubxManifest___.slots, function (item) {
        // if (!item.direction) {
        //     item.direction = ['input', 'output'];
        // }
        me._generateGetMethod(item.slotId);
        me._generateSetMethod(item.slotId);
        me._generateRepropagateMethod(item.slotId);
      });
    }
  };

  /**
   * Generate a set method for a slot.
   * @param {string} slotId
   * @private
   * @method
   * @memberOf compoundComponent
   */
  compoundComponent._generateSetMethod = function (slotId) {
    // console.log('generateSetMethod (',this.tagName,'):',slotId);
    this[ this._getSetMethodName(slotId) ] = function (value) {
      this._setInModel(slotId, value);
      if (this.isOutputSlot(slotId)) {
        //  outputHandler trigger the model change events for "normal" sibling connections
        this._outputHandler(slotId, value);
      }
      if (this.isInputSlot(slotId)) {
        this._outputHandlerForInternalConnections(slotId, value);
      }
    };
  };

  //  Mix the cubxComponentMixin in compoundComponent
  Object.assign(compoundComponent, window.cubx.cubxComponentMixin);
  //  Mix  the DynamicConnectionUtils in compoundComponent
  Object.assign(compoundComponent, window.cubx.dynamicConnectionUtil);

  // assign compoundComponent to global cif namespace
  if (!window.cubx.__cifError__) {
    window.cubx.cif.compoundComponent = compoundComponent;
  }
})();
