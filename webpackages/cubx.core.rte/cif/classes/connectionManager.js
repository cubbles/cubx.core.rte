/* globals _,HTMLElement,NodeFilter */
(function () {
  'use strict';

  /**
   * A Class managing the connections and the communication between them
   * @param {object} context The corresponding context
   * @constructor
   * @global
   */
  var ConnectionManager = function (context) {
    /**
     * The context this ConnectionManager instance is bound to
     * @type {object}
     * @private
     */
    this._context = context;

    /**
     * An array holding all the connection instances
     * @type {array}
     * @private
     */
    this._connections = [];
  };

  /**
   * Create Connections based on the given list of components
   * @memberOf ConnectionManager
   * @param {object} components Array of components
   */
  ConnectionManager.prototype.parseConnectionsFromComponentList = function (components) {
    _.forEach(components, function (component) {
      // console.log(component);
      this._createConnectionsFromComponent(component);
    }, this);
  };

  /**
   * Process all Connections for given model change event. If there are no connections for that event
   * then nothing happens
   * @memberOf ConnectionManager
   * @param {object} sourceComp The source component which triggered the model change event
   * @param {object} payloadObject The payload object
   */
  ConnectionManager.prototype.processConnections = function (sourceComp, payloadObject) {
    // console.log('ConnectionManager.processConnections', sourceComp, payloadObject);
    _.forEach(this._connections, function (connection) {
      // not process deactivated connections
      if (connection.deactivated) {
        return;
      }
      var correctComponent = sourceComp === connection.source.component;
      var correctSlot = false;
      if (connection.source.slot && payloadObject.slot && payloadObject.slot === connection.source.slot) {
        correctSlot = true;
      }
      if (correctComponent && correctSlot) {
        this._processConnection(connection, payloadObject);
      }
    }, this);
  };

  /**
   * Process all internal connections for this compound component
   * @memberOf ConnectionManager
   * @param {string} slotName The slot name of the compound component which acts as source for an internal
   *     connection
   * @param {object} payloadObject The payload object
   */
  ConnectionManager.prototype.processInternalConnections = function (slotName, payloadObject) {
    if (window.cubx.CRC.getRuntimeMode() === 'dev') {
      console.log('processInternalConnections', this._context._rootElement, slotName, payloadObject);
    }
    var internalConnections = _.filter(this._connections, function (item) {
      return item.internal;
    });
    // console.log('internal connections', internalConnections);
    _.forEach(internalConnections, function (connection) {
      // not process deactivated connections
      if (connection.deactivated) {
        return;
      }
      // console.log('---connection', connection);
      if (slotName === connection.source.slot) {
        // console.log('process internal connection', connection, payloadObject);
        this._processConnection(connection, payloadObject);
      }
    }, this);
  };

  /**
   * get all connections, which destination.component == element and destination.slot = slot;
   * @memberOf ConnectionManager
   * @param {HTMLElement} element
   * @param {string} slot
   * @return {array} list of filtered connections
   */
  ConnectionManager.prototype.getConnectionsTo = function (element, slot) {
    var connectionsTo = _.filter(this._connections, function (connection) {
      if (connection.destination.component === element && connection.destination.slot === slot) {
        return true;
      } else {
        return false;
      }
    }, this);
    return connectionsTo;
  };

  /**
   * add a new dynamic connection to the connection list.
   * @param {object} connection object with the following structure (repeatedValues, copyValue and hookFunction is
   *     optional)
   * <pre>
   *    {
     *     connectionId: 'con1',
     *       source: {
     *         memberId: 'sourceMember',
     *         component: sourceElment,
     *         slot: 'slotA'
     *       },
     *       destination: {
     *         memberId: 'destinationMember',
     *         component: destinationElement,
     *         slot: 'slotB'
     *       },
     *       repeatedValues: false,
     *       copyValue: true,
     *       hookFunction: 'myFunc'
     *   }
   * </pre>
   * @memberOf ConnectionManager
   */
  ConnectionManager.prototype.addDynamicConnection = function (connection, directExecution) {
    directExecution = directExecution !== undefined && directExecution != null ? directExecution : false;
    var connectionObj = this._dynamicConnectionToConnection(connection);
    connectionObj.static = false;
    var error = connectionObj.validate();
    if (error && error.length > 0) {
      throw new Error('The parameter "connection" is not valid. Throws the following errors:' +
        JSON.stringify(error));
    }

    var oldConnection = this._findSameConnection(this._connections, connectionObj);
    // var oldInternalConnection = this._findSameConnection(this._internalConnections, connectionObj);

    // if (!oldConnection && !oldInternalConnection) {
    if (!oldConnection) {
      this._connections.push(connectionObj);
    } else if (oldConnection && !oldConnection.static) {
      var index = _.findIndex(this._connections, oldConnection);
      this._connections[ index ] = connectionObj;
    } else {
      throw new Error('It already exists a static connection with the connectionId (' +
        JSON.stringify(connection.connectionId) +
        '). Existing static connections can not be overriden. Please use a different connectionId!');
    }
    if (directExecution) {
      this._executeConnection(connection);
    }
  };

  /**
   * Remove the with connectionId identificated connection from the connectionlist.
   * Errors will logged,
   * <ul>
   * <li> if the connection with "connectionId" not found or</li>
   * <li>the founded connection is a static connection.</li>
   * </ul>
   * @param {string} connectionId
   * @memberOf ConnectionManager
   * @returns {ConnectionMananger.Connection|undefined}
   */
  ConnectionManager.prototype.removeDynamicConnection = function (connectionId) {
    var connectionIndex = this._findConnectionIndex(this._connections, connectionId);
    if (connectionIndex === -1) {
      throw new Error('Can not remove connection with the id ' + JSON.stringify(connectionId) +
        ' , because the connection is not in the connection list.');
    }
    var connection;
    var connectionList;
    var index;
    if (connectionIndex > -1) {
      connectionList = this._connections;
      index = connectionIndex;
    }
    connection = connectionList[ index ];
    if (connection.static) {
      throw new Error('Can not remove connection with id (' + JSON.stringify(connectionId) +
        ') , because the connection is not a dynamic connection.');
    }

    return connectionList.splice(index, 1)[ 0 ];
  };

  /**
   * Tidy the connections, if a cubble has been removed:
   * 1. find connection with element as source or destination
   * 2. remove connection if element is a source
   * 3. marked connection with element as destination as deactivated
   * 4. delete component propery from destination
   * @memberOf ConnectionManager
   * @param element
   */
  ConnectionManager.prototype.tidyConnectionsWithCubble = function (element) {
    // find connection with element
    var connections = this._findAllConnectionsWithElement(element);
    connections.forEach(function (connection) {
      if (connection.source.component === element) {
        this._removeConnection(connection);
      }
      if (connection.destination.component === element) {
        // deactvate connection
        this._deactivateConnection(connection);
        // delete destination.component
        var destination = connection.destination;
        delete destination.component;
      }
    }.bind(this));
  };
  /**
   * Reactivate removed connection, if found them with the destination to elements memberId.
   * 1. search in _connections for a deactivated connection with destination as the element (memberId)
   * 2. add element as destination.component
   * 3. activate connection
   * 4. propagate throw the connection the source's slot value.
   * @param {HTMLElement} element
   */
  ConnectionManager.prototype.reactivateConnectionIfExists = function (element) {
    var connections = this._findAllDeactivatedConnectionsWithMemberId(element);
    connections.forEach(function (connection) {
      connection.destination.component = element;
      this._activateConnection(connection);
      var value = connection.source.component.model[ connection.source.slot ];
      var payloadObject = window.cubx.cif.cif.getEventFactory().createModelChangePayloadObject(connection.source.slot, value);
      this._processConnection(connection, payloadObject);
    }.bind(this));
  };

  /**
   * Find, remove and get the element corresponded connection object from _connections.
   * @memberOf ConnectionManager
   * @param {CustomElement} connectionElement
   * @private
   */
  ConnectionManager.prototype.removeConnection = function (connectionElement) {
    var connection = this._connections.find(function (con) {
      return con.connectionId === connectionElement.getAttribute('connection-id');
    });
    return this._removeConnection(connection);
  };

  /* ***************************************************************************/
  /* ***********************  private Methoden *********************************/
  /* ***************************************************************************/

  /**
   * Remove and get a connection object from _connections
   * @memberOf ConnectionManager
   * @param connection
   * @private
   */
  ConnectionManager.prototype._removeConnection = function (connection) {
    var index = this._connections.indexOf(connection);
    if (index > -1) {
      return this._connections.splice(index, 1)[ 0 ];
    }
  };

  /**
   * Deactivate an deactivated connection
   * @memberOf ConnectionManager
   * @param {ConnectionManager.Connection} connection
   * @private
   */
  ConnectionManager.prototype._deactivateConnection = function (connection) {
    connection.deactivated = true;
  };
  /**
   * Activate an deactivated connection
   * @memberOf ConnectionManager
   * @param {ConnectionManager.Connection} connection
   * @private
   */
  ConnectionManager.prototype._activateConnection = function (connection) {
    delete connection.deactivated;
  };

  /**
   * Find all deactivated connection objects in the _connections list with the given elements member-id as destination.
   * @memberOf ConnectionManagement
   * @param {HTMLElement} element for search
   * @returns {Array.<ConnectionManager.Connection>} found connections
   * @private
   */
  ConnectionManager.prototype._findAllConnectionsWithElement = function (element) {
    return this._connections.filter(function (connection) {
      return connection.source.component === element || connection.destination.component === element;
    });
  };

  /**
   * Find all deactivated connection objects in the _connections list with the given elements member-id as destination.
   * @param {HTMLElement} element
   * @returns {Array.<ConnectionManager.Connection>}
   * @private
   */
  ConnectionManager.prototype._findAllDeactivatedConnectionsWithMemberId = function (element) {
    return this._connections.filter(function (connection) {
      return connection.destination.memberId === element.getAttribute('member-id') && connection.deactivated;
    });
  };

  /**
   * Execute a connection. Get the value of the source slot, and propagate throw the connection.
   * @param {ConnectionMananger.Connection} connection
   * @private
   * @memberOf ConnectionManager
   */
  ConnectionManager.prototype._executeConnection = function (connection) {
    var value = connection.source.component.model[ connection.source.slot ];
    var payloadObject = {
      payload: value,
      slot: connection.source.slot
    };
    // if value is not serialisable copyValue must be set to true and a warn should be logged
    if (typeof connection.copyValue === 'boolean' && connection.copyValue) {
      if (!this._isSerializable(payloadObject.payload)) {
        connection.copyValue = false;
        console.warn('\'copyValue\' is set to false since slot value is not serialisable.', payloadObject.payload, connection);
      }
    }

    var newPayloadObject = this._handlePayload(payloadObject, connection.copyValue);
    if (this._allowPropagation(connection, newPayloadObject)) {
      //  save paylod as lastValue in Connection;
      connection.lastValue = newPayloadObject.payload;
      this._addHookFunction(newPayloadObject, connection);
      if (connection.destination.component === this._context.getRootElement()) {
        //  outgoing connection
        if (this._processConnectionHook(newPayloadObject)) {
          return;
        }
        this._context.getRootElement()._setSlotValue(newPayloadObject.slot, newPayloadObject.payload);
        this._context.getRootElement().fireModelChangeEvent(newPayloadObject);
      } else {
        //  ingoing and sibling connection
        var valid = false;
        try {
          valid = this._validateConnection(connection);
        } catch (error) {
          console.error('Error: ' + error.message, connection);
        }
        if (valid) {
          connection.destination.component.setInputSlot(connection.destination.slot, newPayloadObject);
        } else {
          console.error('not valid connection', connection, newPayloadObject);
        }
      }
    }
  };

  /**
   * Determines if an value is serializable. Adapted from https://stackoverflow.com/a/30712764/8082984
   * @param obj
   * @returns {boolean}
   * @private
   */
  ConnectionManager.prototype._isSerializable = function (obj) {
    try {
      if (_.isUndefined(obj) ||
        _.isNull(obj) ||
        _.isBoolean(obj) ||
        _.isNumber(obj) ||
        _.isString(obj)) {
        return true;
      }

      if (!_.isPlainObject(obj) &&
        !_.isArray(obj)) {
        return false;
      }

      for (var key in obj) {
        if (obj.hasOwnProperty(key) && !this._isSerializable(obj[key])) {
          return false;
        }
      }

      return true;
    } catch (e) {
      console.log('ERROR -------------------------', e);
      return false; // e.g. circular references
    }
  };

  /**
   * Create a new ConnectionManager.Connection object. The attributes of the new object will setting with values
   * from paramter "connection".
   * @param {object} connection an object represents a connection
   * @returns {Connection.Connection}
   * @private
   * @memberOf ConnectionManager
   */
  ConnectionManager.prototype._dynamicConnectionToConnection = function (connection) {
    var connectionObj = new ConnectionManager.Connection();
    connectionObj.source = connection.source;
    connectionObj.destination = connection.destination;
    connectionObj.copyValue = connection.copyValue;
    connectionObj.repeatedValues = connection.repeatedValues;
    connectionObj.hookFunction = connection.hookFunction;
    connectionObj.connectionId = connection.connectionId;
    if (connection.static) {
      connectionObj.static = connection.static;
    }
    connectionObj.internal = connection.source.component === this._context.getRootElement();

    return connectionObj;
  };

  /**
   * Find the same connection in connectionlist.
   * - if connection has a connectionId search in connectionList for elements with the connectionId and return if found.
   * - if no connectionId exist generate a connectionId inclusion of source and destination. If the generated connectionId in der connectionList found, return this.
   * @param {array} connectionList The list of connectionn objects
   * @param {ConnectionManager.Connection} connection
   * @returns {*}
   * @private
   */
  ConnectionManager.prototype._findSameConnection = function (connectionList, connection) {
    var foundConnection =
      _.find(connectionList, function (connectionItem) {
        if (connection.connectionId === connectionItem.connectionId) {
          return true;
        }
        var tempConnectionConfig = {
          source: {},
          destination: {}
        };

        tempConnectionConfig.source.runtimeId = connectionItem.source.component.getAttribute('runtime-id');
        tempConnectionConfig.source.slot = connectionItem.source.slot;
        tempConnectionConfig.destination.runtimeId =
          connectionItem.destination.component.getAttribute('runtime-id');
        tempConnectionConfig.destination.slot = connectionItem.destination.slot;
        var tempId = window.cubx.dynamicConnectionUtil.generateConnectionId(tempConnectionConfig);
        if (tempId === connection.connectionId) {
          return true;
        }
        return false;
      });
    return foundConnection;
  };
  /**
   * Find a connection based the connectionId in connection list. Get the index in he connectionlist
   * of the connection. If no connection found, return with -1.
   *
   * @param {array} connectionList
   * @param {string} connectionId
   * @private
   * @return  {number} the index of the connection in the connectionList
   * @memberOf ConnectionManager
   */
  ConnectionManager.prototype._findConnectionIndex = function (connectionList, connectionId) {
    return _.findIndex(connectionList, 'connectionId', connectionId);
  };

  /**
   * Checks, if the connection an internal connection is.
   * @param {ConnectionManager.Connection} connection connection object
   * @returns {boolean} true by internal connection, otherfalls false
   * @memberOf ConnectionManager
   * @private
   */
  ConnectionManager.prototype._isInternalDynamicConnection = function (connection) {
    if (connection.source.component.isCompoundComponent &&
      window.cubx.dynamicConnectionUtil._isChild(connection.source.component,
        connection.destination.component)) {
      return true;
    }
    return false;
  };

  /**
   * Create all connection instances outgoing from the component
   * @memberOf ConnectionManager
   * @param {object} component
   */
  ConnectionManager.prototype._createConnectionsFromComponent = function (component) {
    var cubxConnections = component.querySelector('cubx-core-connections');
    if (cubxConnections && cubxConnections.parentNode === component) {
      // console.log(cubxConnections.children);
      _.forEach(cubxConnections.children, function (cubxConnection) {
        this.createConnectionFromComponent(component, cubxConnection);
      }, this);
    }
  };
  /**
   * Create one connection instance outgoing from the component
   * @param component
   * @param connectionElement
   */
  ConnectionManager.prototype.createConnectionFromComponent = function (component, connectionElement) {
    if (connectionElement.processed) {
      // The element is already processed.
      return;
    }
    var existingConnection;
    if (connectionElement.getType() !== 'internal') {
      existingConnection = this._findConnectionByConnectionId(connectionElement.getConnectionId());
    } else {
      existingConnection = component.Context._connectionMgr._findConnectionByConnectionId(connectionElement.getConnectionId());
    }
    if (existingConnection) {
      console.warn('The following connection element didn\'t added to the connection list, because it already exist a connection with the same connectionId. It is not allowed overriding existing connections.', connectionElement);
      return;
    }
    try {
      if (connectionElement.getType() !== 'internal') {
        this._connections.push(this._createConnection(component, connectionElement));
      } else {
        var connection = this._createConnection(component, connectionElement, true);
        component.Context._connectionMgr._connections.push(connection);
      }
      connectionElement.processed = true;
    } catch (e) {
      console.warn('Connection ', connectionElement, 'could not be created.');
    }
  };

  /**
   * Find a connection by the connectionId
   * @param connectionId
   * @returns {*}
   * @private
   */
  ConnectionManager.prototype._findConnectionByConnectionId = function (connectionId) {
    return this._connections.find(function (con) {
      return con.connectionId === connectionId;
    });
  };
  /**
   * Create single connection out of cubx-core-connection tag
   * @param {HTMLElement} component The component holding the cubx-core-connection tag
   * @param {HTMLElement} cubxConnection The cubx-core-connection tag
   * @private
   * @memberOf ConnectionManager
   */
  ConnectionManager.prototype._createConnection = function (component, cubxConnection, internal) {
    if (typeof internal === 'undefined') {
      internal = false;
    }
    var connection = new ConnectionManager.Connection();
    var source = cubxConnection.getSource();
    var destination = cubxConnection.getDestination();
    var copyValue = cubxConnection.getCopyValue();
    var repeatedValues = cubxConnection.getRepeatedValues();
    var hookFunction = cubxConnection.getHookFunction();

    connection.connectionId = cubxConnection.getConnectionId();
    if (!connection.connectionId || connection.connectionId === 'undefined') {
      console.warn('The connectionId is not defined for the connection with source: "', source,
        '" and destination: "', destination, '".');
    }
    // set source properties to connection
    connection.source.memberId = internal ? 'self' : component.getAttribute('member-id');
    connection.source.slot = source;
    connection.source.component = component;

    // set destination properties to connection
    connection.destination.memberId = destination.split(':')[ 0 ];
    connection.destination.slot = destination.split(':')[ 1 ];
    var walker;
    var node;
    if (connection.destination.memberId === 'parent') {
      // find the destination component based on the member-index
      connection.destination.component = this._findParentComponent(component);
    } else if (internal) {
      walker = document.createTreeWalker(component, NodeFilter.SHOW_ELEMENT, null, false);
      node = walker.currentNode;

      while (node) {
        // walk through all children of component but skip node itself
        if (_.indexOf(component.Context._components, node) > -1 && node.getAttribute('member-id') === connection.destination.memberId) {
          connection.destination.component = node;
          node = null;
        } else {
          node = walker.nextNode();
        }
      }
    } else {
      var parent = this._findParentComponent(component);
      walker = document.createTreeWalker(parent, NodeFilter.SHOW_ELEMENT, null, false);
      node = walker.currentNode;

      while (node) {
        // walk through all children of component but skip node itself
        if (_.indexOf(parent.Context._components, node) > -1 && node.getAttribute('member-id') === connection.destination.memberId) {
          connection.destination.component = node;
          node = null;
        } else {
          node = walker.nextNode();
        }
      }
    }
    if (connection.destination.component == null) {
      throw new Error('Error during connection creation:' + cubxConnection);
    }
    if (typeof copyValue === 'undefined' || copyValue === null) {
      connection.copyValue = true;
    } else if (typeof copyValue === 'string') {
      connection.copyValue = JSON.parse(copyValue);
    } else {
      connection.copyValue = copyValue;
    }

    if (typeof repeatedValues === 'undefined' || repeatedValues === null) {
      connection.repeatedValues = false;
    } else if (typeof repeatedValues === 'string') {
      connection.repeatedValues = JSON.parse(repeatedValues);
    } else {
      connection.repeatedValues = repeatedValues;
    }

    if (typeof hookFunction === 'string') {
      connection.hookFunction = hookFunction;
    }

    connection.internal = internal;

    return connection;
  };

  ConnectionManager.prototype._findParentComponent = function (component) {
    if (component.parentNode.isCompoundComponent || component.parentNode.hasAttribute('cubx-core-crc') || component.parentNode === document.body) {
      return component.parentNode;
    }
    return this._findParentComponent(component.parentNode);
  };

  /**
   * Helper method for processing a single connection
   * @memberOf ConnectionManager
   * @param {object} connection The connection to process
   * @param {object} payloadFrame The payload object
   * @private
   */
  ConnectionManager.prototype._processConnection = function (connection, payloadFrame) {
    // console.log('_processConnection', connection, payloadFrame);
    var valid = false;
    // validate if destination component has slot

    // call set method for destination slot on destination component
    // if value is not serialisable copyValue must be set to true and a warn should be logged
    if (typeof connection.copyValue === 'boolean' && connection.copyValue) {
      if (!this._isSerializable(payloadFrame.payload)) {
        console.warn('\'copyValue\' is set to false since slot value is not serialisable.', payloadFrame.payload, connection);
      }
    }
    var newPayloadFrame = this._handlePayload(payloadFrame, connection.copyValue);

    //  is repeteadValue configured as false and the same as last time will be propagetaed?
    if (this._allowPropagation(connection, newPayloadFrame)) {
      //  save paylod as lastValue in Connection;
      connection.lastValue = newPayloadFrame.payload;
      this._addHookFunction(newPayloadFrame, connection);
      // if destination component is the compound component itseft then it's an internal connection with
      //  this compound component acting as a destination component
      if (connection.destination.component === this._context.getRootElement()) {
        //  update slot in payloadObject
        newPayloadFrame.slot = connection.destination.slot;
        //  if the slot an outpoutslot is
        if (connection.destination.component.isOutputSlot(newPayloadFrame.slot)) {
          // console.log('fireModelChangeEvent internalConnection', this._context.getRootElement(),
          //     newPayloadFrame);
          if (this._processConnectionHook(newPayloadFrame)) {
            return;
          }
          this._context.getRootElement()._setSlotValue(newPayloadFrame.slot, newPayloadFrame.payload);
          this._context.getRootElement().fireSlotChangedEvent(newPayloadFrame.slot, newPayloadFrame.payload);
          this._context.getRootElement().fireModelChangeEvent(newPayloadFrame);
        }
      } else {
        try {
          valid = this._validateConnection(connection);
        } catch (error) {
          console.error('Error: ' + error.message, connection);
        }
        if (valid) {
          connection.destination.component.setInputSlot(connection.destination.slot, newPayloadFrame);
        } else {
          console.error('not valid connection', connection, payloadFrame);
        }
      }
    } else {
      if (window.cubx.CRC.getRuntimeMode() === 'dev') {
        console.info(
          'Abort propagation, because propagation of the same value consecutively not allowed. ' +
          'Cause: The attribute "repeatedValues" is false or absent, for the connectionId "' +
          connection.connectionId + '" and the last propagated value ' +
          JSON.stringify(connection.lastValue) + '  is equal' +
          ' to current payload ' + JSON.stringify(payloadFrame.payload) + '.');
      }
    }
  };
  ConnectionManager.prototype._processConnectionHook = function (payloadFrame) {
    var breakPropagation = false;
    if (payloadFrame.connectionHook) {
      var nextCall = this._context.getRootElement()._processConnectionHook(payloadFrame);
      if (nextCall.called) {
        payloadFrame.payload = nextCall.newValue;
      } else {
        breakPropagation = true;
      }
      payloadFrame.connectionHook = undefined;
    }
    return breakPropagation;
  };

  /**
   * Add a the Hook-Function to Payload if exists in connectuion.
   * @private
   * @param {object} payloadFrame
   * @param {object}connection
   * @returns {*}
   */
  ConnectionManager.prototype._addHookFunction = function (payloadFrame, connection) {
    if (connection.hookFunction) {
      payloadFrame.connectionHook = connection.hookFunction;
      payloadFrame.source = connection.source.component;
    }
    return payloadFrame;
  };

  /**
   * Check if propagation of the payload allowed.
   * It returns true, if connection.repeatedValues is true.
   * It returns false, if the connection.repeatedValues is false or absent, and connection.lastValue is equals
   * to payload.
   * It returns true, if the connection.repeatedValues is false or absent, and connection.lastValue is not equals
   * to payload.
   * @param {object} connection
   * @param {object} payloadFrame
   * @return {boolean}
   * @private
   */
  ConnectionManager.prototype._allowPropagation = function (connection, payloadFrame) {
    if (connection.repeatedValues) {
      return true;
    }
    // console.log('connection.connectionId:',connection.connectionId,',
    //  connection.lastValue:',connection.lastValue)
    if (!connection.repeatedValues && !this._isEqual(connection.lastValue, payloadFrame.payload)) {
      return true;
    }
    return false;
  };

  /**
   * Check, if value or otherValue is equal.
   * @param {*} value
   * @param {*} otherValue
   * @return {boolean}
   * @private
   */
  ConnectionManager.prototype._isEqual = function (value, otherValue) {
    if (typeof value !== typeof otherValue) {
      return false;
    }
    if (typeof value === 'object') {
      return _.isEqual(value, otherValue);
    }
    if (typeof value === 'function') {
      return value.toString() === otherValue.toString();
    }
    return value === otherValue;
  };

  /**
   * Create a clone of payloadFrame.payload, if this is an object and copy is true or absent.
   * @param {object} payloadFrame connection transport object.
   * @param {boolean} copy
   * @return payloadFrame
   * @private
   */
  ConnectionManager.prototype._handlePayload = function (payloadFrame, copy) {
    var newPayloadFrame = {};
    newPayloadFrame.slot = payloadFrame.slot;
    var payload = payloadFrame.payload;
    copy = typeof copy === 'undefined' || copy === null ? true : copy;
    if (typeof payload === 'object' && copy) {
      var newPayload = _.cloneDeep(payload);
      newPayloadFrame.payload = newPayload;
    } else {
      newPayloadFrame.payload = payload;
    }

    return newPayloadFrame;
  };

  /**
   * Validate the given connection.
   * @param {object} connection
   * @return {boolean} True if connection is valid
   * @throws {Error} Will throw an error if connection is not valid
   * @private
   * @memberOf ConnectionManager
   */
  ConnectionManager.prototype._validateConnection = function (connection) {
    // validate if given destination component does have slot with given name
    if (!connection.destination.component.isInputSlot(connection.destination.slot) &&
      connection.destination.memberId !== 'parent') {
      throw new Error('Component with runtime-id ' +
        connection.destination.component.getAttribute('runtime-id') +
        ' does not have an input slot "' + connection.destination.slot +
        '" or no internal connection to the output slot "' + connection.destination.slot + '".');
    }

    return true;
  };

  /**
   * Helper Class for internal dealing with connections
   * @constructor
   * @memberOf Connection
   */
  ConnectionManager.Connection = function () {
    /**
     * Source of the connection
     * @type {object}
     */
    this.source = {
      component: null,
      memberId: null,
      slot: null
    };

    /**
     * Destination of the connection
     * @type {object}
     */
    this.destination = {
      component: null,
      memberId: null,
      slot: null
    };

    /**
     * Optional connection hook
     * @type {function}
     */
    this.hookFunction = null;

    this.connectionId = null;

    this.copyValue = true;

    this.repeatedValues = false;

    this.lastValue = null;

    this.static = true;

    this.validate = function () {
      var error = [];
      var er = this._validateConnectionId();
      if (er && er.length > 0) {
        error = error.concat(er);
      }
      er = this._validateSource();
      if (er && er.length > 0) {
        error = error.concat(er);
      }
      er = this._validateDestination();
      if (er && er.length > 0) {
        error = error.concat(er);
      }
      if (this.repeatedValues && typeof this.repeatedValues !== 'boolean') {
        error.push('The property "repeatedValues" must be boolean.');
      }
      if (this.copyValue && typeof this.copyValue !== 'boolean') {
        error.push('The property "copyValue" must be boolean.');
      }
      if (this.hookFunction && typeof this.hookFunction !== 'string') {
        error.push('The property "hookFunction" must be a string.');
      }
      return error;
    };
    this._validateSource = function () {
      var error = [];
      if (!this.source) {
        error.push('The property "source" is missed.');
        return error;
      }
      var err = this._validateSlot(this.source.slot, 'source');
      if (err && err.length > 0) {
        error = error.concat(err);
      }
      err = this._validateMemberId(this.source.memberId, 'source');
      if (err && err.length > 0) {
        error = error.concat(err);
      }
      err = this._validateComponent(this.source.component, 'source');
      if (err && err.length > 0) {
        error = error.concat(err);
      }

      return error;
    };
    this._validateDestination = function () {
      var error = [];
      if (!this.destination) {
        error.push('The property "destination" is missed.');
        return error;
      }
      var err = this._validateSlot(this.destination.slot, 'destination');
      if (err && err.length > 0) {
        error = error.concat(err);
      }

      err = this._validateMemberId(this.destination.memberId, 'destination');
      if (err && err.length > 0) {
        error = error.concat(err);
      }

      err = this._validateComponent(this.destination.component, 'destination');
      if (err && err.length > 0) {
        error = error.concat(err);
      }

      return error;
    };
    this._validateMemberId = function (memberId, section) {
      var error = [];
      if (arguments.length === 1) {
        section = memberId;
        memberId = undefined;
      }
      if (typeof memberId === 'undefined') {
        error.push('The property "' + section + '.memberId" must exist.');
      } else if (memberId == null) {
        return error;
      } else if (typeof memberId !== 'string') {
        error.push('Not valid ' + section + '.memberId (' + JSON.stringify(memberId) +
          '). The property "' + section + '.memberId" must be a string.');
      } else {
        var reg = /^[a-z][a-zA-Z0-9-]*$/;
        if (!memberId.match(reg)) {
          error.push(
            'Not valid ' + section + '.memberId (' + JSON.stringify(memberId) + '). The property "' +
            section + '.memberId" must match to ' + reg);
        }
      }
      return error;
    };
    this._validateSlot = function (slot, section) {
      if (arguments.length === 1) {
        section = slot;
        slot = undefined;
      }
      var error = [];
      if (!slot) {
        error.push('The property "' + section + '.slot" must exist.');
      } else {
        if (typeof slot !== 'string') {
          error.push(
            'Not valid "' + section + '.slot" (' + JSON.stringify(slot) + '). The property "' +
            section +
            '.slot" must be a string.');
        }
      }
      return error;
    };
    this._validateComponent = function (component, section) {
      if (arguments.length === 1) {
        section = component;
        component = undefined;
      }
      var error = [];
      if (!component) {
        error.push('The property "' + section + '.component" must exist.');
      } else {
        if (typeof component !== 'object' && !(component instanceof HTMLElement)) {
          error.push(
            'Not valid "' + section + '.component" (' + JSON.stringify(component) +
            '). The property "' +
            section + '.component" must be a HTMLElement.');
        }
      }
      return error;
    };
    this._validateConnectionId = function () {
      var error = [];
      if (typeof this.connectionId !== 'string') {
        error.push('The property "connectionId" is missed.');
        return error;
      }
      // var reg = /^[a-z][a-zA-Z0-9-:]*$/;
      // if (!this.connectionId.match(reg)) {
      //     error.push(
      //         'Not valid connectionId (' + JSON.stringify(this.connectionId) +
      //         '). The property "connectionId" must match to ' +
      //         reg);
      // }

      return error;
    };
    this.toDynamicConnection = function () {
      var dynamicConnection;
      if (!this.static) {
        dynamicConnection = new window.cubx.cif.DynamicConnection();
        dynamicConnection.setSourceRuntimeId(this.source.component.getAttribute('runtime-id'));
        dynamicConnection.setSourceSlot(this.source.slot);
        dynamicConnection.setDestinationRuntimeId(this.destination.component.getAttribute('runtime-id'));
        dynamicConnection.setDestinationSlot(this.destination.slot);
        dynamicConnection.setCopyValue(this.copyValue);
        dynamicConnection.setRepeatedValues(this.repeatedValues);
        if (this.hookFunction) {
          dynamicConnection.setHookFunction(this.hookFunction);
        }
      } else {
        console.error(
          'The connection can not convert to a DynamicConnection, because it is defined as a static connection.');
      }
      return dynamicConnection;
    };
  };

  // provide ConnectionManager class in global scope
  if (!window.cubx.__cifError__) {
    window.cubx.cif.ConnectionManager = ConnectionManager;
  }
})();
