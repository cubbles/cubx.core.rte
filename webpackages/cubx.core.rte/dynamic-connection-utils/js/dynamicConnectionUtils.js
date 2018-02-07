/* globals _,elementFindByAttributeValue */
(function () {
  'use strict';
  var DynamicConnectionUtil = {};

  /**
   * generate and get a connectionId based on connection config object.
   * @memberOf DynamicConnectionUtil
   * @param {object} connectionConfig the connections config object with the following format
   * <pre>
   *     {
         *          source: {
         *              runtimeId: 'aRuntimeId',
         *              slot: 'aSlotId'
         *          },
         *          destination: {
         *              runtimeId: 'someRuntimeId',
         *              slot: 'someSlotId'
         *          }
         *     }
   * </pre>
   * @throws {Error} the connectionConfig is not valid
   */
  DynamicConnectionUtil.generateConnectionId = function (connectionConfig) {
    this._checkConnectionConfig(connectionConfig);
    var basicString = connectionConfig.source.runtimeId + '#' + connectionConfig.source.slot + '>' +
      connectionConfig.destination.runtimeId + '#' + connectionConfig.destination.slot;
    // console.log('basicString', basicString);
    var id = window.btoa(basicString);
    return id;
  };

  /**
   * Imported all connections from the parameter "connectionList".
   * @memberOf DynamicConnectionUtil
   * @param {string} connectionList connection list as jsonv string
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
     *     } ...
   * ]
   * </pre>
   * @throws SyntaxError - if connectionList not a valid JSON
   */
  DynamicConnectionUtil.importDynamicConnections = function (connectionList) {
    var connectionListObj = JSON.parse(connectionList);
    var me = this;
    _.each(connectionListObj, function (con) {
      me._importDynamicConnection(con);
    });
  };

  /* *****************************************************************/
  /* *********************** private methods *************************/
  /* *****************************************************************/

  /**
   * Import one connection
   * @param {object} connection a connection object
   * <pre>
   * {
     *     source: {
     *         runtimeId: 'oneRuntimeId',
     *         slot: 'slotC'
     *     },
     *     destination: {
     *         runtimeIdId: 'otherRuntimeId',
     *         slot: "slotD"
     *     },
     *     copyValue: false,
     *     repeatedValues: true,
     *     hookFunction: 'myFunction'
     * }
   * </pre>
   * @memberOf DynamicConnectionUtil
   * @private
   */
  DynamicConnectionUtil._importDynamicConnection = function (connection) {
    connection.connectionId = this.generateConnectionId(connection);
    var directExecution = connection.directExecution || false;
    var sourceElement;
    var destinationElement;
    try {
      sourceElement = this._getElementForEndpoint(connection, 'source');
      destinationElement = this._getElementForEndpoint(connection, 'destination');
    } catch (e) {
      return;
    }

    var sourceContext = sourceElement.Context;
    var destinationContext = destinationElement.Context;
    var context;
    if (sourceContext && this._isChild(sourceElement, destinationElement)) {
      context = sourceContext;
      if (!context.isSame(this._getParentContextForRuntimeId(connection.destination.runtimeId))) {
        console.error('The connection' + JSON.stringify(connection, null, 2) +
          ' can not be created. Ambiguous context: ' +
          'The source context is not the same as a the destination context. ' +
          'It is just allowed to create a connection in the same context.');
      }
    } else if (destinationContext && this._isChild(destinationElement, sourceElement)) {
      context = destinationContext;
      if (!context.isSame(this._getParentContextForRuntimeId(connection.source.runtimeId))) {
        console.error('The connection' + JSON.stringify(connection, null, 2) +
          ' can not be created. Ambiguous context: ' +
          'The source context is not the same as a the destination context. ' +
          'It is just allowed to create a connection in the same context.');
      }
    }
    var error = false;
    if (!context) {
      if (!this._getParentContextForRuntimeId(connection.source.runtimeId)) {
        console.error('The connection can not be created within the context, because no context ' +
          'for the element with runtimeId (' + connection.source.runtimeId +
          ') has been found');
        error = true;
      }
      if (!this._getParentContextForRuntimeId(connection.destination.runtimeId)) {
        console.error('The connection can not be created within the context, because no context ' +
          'for the element with runtimeId (' + connection.destination.runtimeId +
          ') has been found');
        error = true;
      }

      if (error) {
        return;
      }

      if (!this._getParentContextForRuntimeId(connection.source.runtimeId).isSame(this._getParentContextForRuntimeId(connection.destination.runtimeId))) {
        console.error('The connection' + JSON.stringify(connection, null, 2) +
          ' can not be created. Ambiguous context: ' +
          'The source context is not the same as a the destination context. ' +
          'It is just allowed to create a connection in the same context.');
        return;
      }

      context = this._getParentContextForRuntimeId(connection.source.runtimeId);
    }

    var dynCon = new window.cubx.cif.DynamicConnection(connection);

    var newConnection = this._createConnectionManagerConnectionObject(dynCon,
      sourceElement,
      destinationElement);
    var err = newConnection.validate();
    if (err.length === 0) {
      // append connection
      context.getConnectionMgr().addDynamicConnection(newConnection, directExecution);
    } else {
      console.error('The connection can not be added to the context, because errors are detected:' +
        JSON.stringify(err));
    }
  };

  /**
   * get the connectionId.
   * <ul>
   * <li> Get the parameter connection self, if the Paramter is a string.</li>
   * <li> Call the #getConnection(connection) method, if the parameter connection is an object.</li>
   * </ul>
   * @param {string|object} connection identificated the connection
   *  <ul>
   * <li>string:  a connectionId</li>
   * <li>object valid connection config object like
   * <pre>
   * {
               source: {
                   runtimeId: 'aSourceRuntimId',
                   slot: 'aSourceSlot'
               },
               destination: {
                   runtimeId: 'aDestinationRuntimeId',
                   slot: 'aDestinationSlot'
               }
           }
   * </pre>
   * </li>
   * </ul>
   * @returns {*}
   * @throws {Error} if the parameter not a string or an valid connection config object is.
   * @private
   * @memberOf DynamicConnectionUtil
   */
  DynamicConnectionUtil._identifyConnectionId = function (connection) {
    if (typeof connection === 'string') {
      return connection;
    }
    if (typeof connection === 'object') {
      return this.generateConnectionId(connection);
    }

    var config = {
      source: {
        runtimeId: 'aSourceRuntimId',
        slot: 'aSourceSlot'
      },
      destination: {
        runtimeId: 'aDestinationRuntimeId',
        slot: 'aDestinationSlot'
      }
    };
    throw new Error('The connectionId coud not determine. The parameter shoud be a connectionId (string) or' +
      ' a connection config object like ' + JSON.stringify(config, null, 4) + '.');
  };

  /**
   * Check the connectionConfig structure.
   *  <ul>
   *  <li>returns true  - if the structur is valid</li>
   *  <li>throw an error  - if the structur not valid</li>
   *  </ul>
   * @memberOf DynamicConnectionUtil
   * @param {object} connectionConfig object with the following structure
   * <pre>
   *     {
     *          source: {
     *              runtimeId: 'aRuntimeId',
     *              slot: 'aSlotId'
     *          },
     *          destination: {
     *              runtimeId: 'someRuntimeId',
     *              slot: 'someSlotId'
     *          }
     *     }
   * </pre>
   * @throws {Error} the connctionConfig is not valid
   * @private
   */
  DynamicConnectionUtil._checkConnectionConfig = function (connectionConfig) {
    var basicMessage = 'A connection object must be an object with the following structure: ' +
      '{ source: { runtimeId: "aRuntimeId", slot: "aSlotId"},' +
      'destination:{ runtimeId: "aRuntimeId", slot: "aSlotId"}}';
    if (typeof connectionConfig !== 'object') {
      throw new Error(basicMessage + ' but get a(n) ' + typeof connectionConfig + '.');
    }
    var errors = [];
    if (!_.has(connectionConfig, 'source.runtimeId')) {
      errors.push('The attribute source.runtimeId is missed.');
    }
    if (!_.has(connectionConfig, 'source.slot')) {
      errors.push('The attribute source.slot is missed.');
    }
    if (!_.has(connectionConfig, 'destination.runtimeId')) {
      errors.push('The attribute destination.runtimId is missed.');
    }
    if (!_.has(connectionConfig, 'destination.slot')) {
      errors.push('The attribute destination.slot is missed.');
    }
    if (errors.length > 0) {
      throw new Error(basicMessage + ' but missed the following attributes: ' + JSON.stringify(errors));
    }
    return true;
  };
  /**
   * Check if child is a childelement of parent.
   * @param {HTMLElement} parent parent element
   * @param {HTMLElement} child child element
   * @returns {boolean} true if the child is a child element from parent, otherfalls false.
   * @memberOf DynamicConnectionUtil
   * @private
   */
  DynamicConnectionUtil._isChild = function (parent, child) {
    return _.some(parent.Context._components, child);
  };

  /**
   * Extract the memberId from the runtimeId. For elements in root context get null. (no memberId exists).
   * @memberOf DynamicConnectionUtil
   * @param {string}runtimeId
   * @returns {undefined|string} memberId or for elements in root context null.
   * @private
   */
  DynamicConnectionUtil._getMemberIdFromRuntimeId = function (runtimeId) {
    // search  the last index of "-" get a index inside the last component name.
    // memeberId is with "." separetaed after the component
    var temp = runtimeId.substr(runtimeId.lastIndexOf('-') + 1);
    var member;
    // If no "." separator is the component i the root context.
    if (temp.indexOf('.') > -1) {
      member = temp.substr(temp.lastIndexOf('.') + 1);
    } else {
      member = null;
    }

    return member;
  };
  /**
   * Extract the runtimeId of the parent element and its context. For elements in root context get null.
   * @memberOf DynamicConnectionUtil
   * @param {string} elementRuntimeId  runtimeId of the element
   * @returns {undefined|string}
   * @private
   */
  DynamicConnectionUtil._getParentContextRuntimeId = function (elementRuntimeId) {
    var contextRuntimeId;
    // if not ":" separator exist, is the element in the root context;
    if (elementRuntimeId.indexOf(':') > -1) {
      contextRuntimeId = elementRuntimeId.substr(0, elementRuntimeId.lastIndexOf(':'));
    }
    return contextRuntimeId;
  };

  /**
   * Find and get the context for the given elementRuntimeId.
   * @memberOf DynamicConnectionUtil
   * @param {string} elementRuntimeId
   * @returns {cubx.cif.Context} the founded Context object.
   * @private
   */
  DynamicConnectionUtil._getParentContextForRuntimeId = function (elementRuntimeId) {
    var context;
    var contextRuntimeId = this._getParentContextRuntimeId(elementRuntimeId);
    var contextElement;
    if (contextRuntimeId === undefined) {
      var rootElement = document.querySelector('[cubx-core-crc]') || document.body;
      if (this._isChild(rootElement, elementFindByAttributeValue('runtime-id', elementRuntimeId))) {
        contextElement = rootElement;
      }
    } else {
      // querySelector not works because runtime-id contains ":" and "/"
      contextElement = elementFindByAttributeValue('runtime-id', contextRuntimeId);
    }
    if (contextElement) {
      context = contextElement.Context;
    }
    return context;
  };

  /**
   * Search and get the HTMLElement of the connection endpoint.
   * @memberOf DynamicConnectionUtil
   * @param {cubx.cif.DynamicConnection} dynamicConnection
   * @param {string} connectionEndpoint ('source'|'destination') endpoint of connection
   * @returns {HTMLElement|undefined}
   * @private
   */
  DynamicConnectionUtil._getElementForEndpoint = function (dynamicConnection, connectionEndpoint) {
    var runtimeId;
    if (connectionEndpoint !== 'source' && connectionEndpoint !== 'destination') {
      throw new Error('The parameter "endpointName" can only accept the values "source" ' +
        'and  "destination".');
    }
    runtimeId = dynamicConnection[ connectionEndpoint ].runtimeId;
    var element = elementFindByAttributeValue('runtime-id', runtimeId);
    if (!element) {
      throw new Error('No element was found with runtimeId "' + runtimeId +
        '". (dynamicConnection.source.runtimeId)');
    }
    return element;
  };

  /**
   * Check, if  the Context of the connectionEndPointElement is the same as theparamater context.
   * @memberOf DynamicConnectionUtil
   * @param {cubx.cif.Context} context
   * @param {HTMLElement} connectionEndPointElement
   * @throws Error if the if  the Context of the connectionEndPointElement is the same as context or the context
   *     not found.
   * @private
   */
  DynamicConnectionUtil._checkEndpointContext = function (context, connectionEndPointElement) {
    var runtimeId;
    var endPointContext;
    if (connectionEndPointElement.isCompoundComponent && connectionEndPointElement.Context === context) {
      // internal connection
      return true;
    }
    runtimeId = connectionEndPointElement.getAttribute('runtime-id');
    endPointContext = this._getParentContextForRuntimeId(runtimeId);

    if (typeof endPointContext === 'undefined') {
      throw new Error('The connection can not be created within the context created, because  no context ' +
        'for the element with runtimeId (' + runtimeId + ') has been found');
    } else if (!context.isSame(endPointContext)) {
      throw new Error('The connection can not be created within the context, because the context of the ' +
        'element with runtimeId (' + runtimeId + ') is not the same as a the own context (' +
        context.getRootElement().getAttribute('runtime-id') +
        '). It is only allowed to create a connection in your own context.');
    }
    return true;
  };

  /**
   * Create a new cubx.cif.ConnectionManager.Connection object based od Dynamic connection.
   * @memberOf DynamicConnectionUtil
   * @param {cubx.cif.DynamicConnection} dynamicConnection
   * @param {HTMLElement} sourceElement
   * @param {HTMLElement} destinationElement
   * @returns {cubx.cif.ConnectionManager.Connection.Connection}
   * @private
   */
  DynamicConnectionUtil._createConnectionManagerConnectionObject =
    function (dynamicConnection, sourceElement, destinationElement, internal) {
      var Connection = window.cubx.cif.ConnectionManager.Connection;
      var connection = new Connection();
      connection.connectionId = dynamicConnection.connectionId;
      connection.internal = internal;
      connection.source.memberId = this._getMemberIdFromRuntimeId(dynamicConnection.source.runtimeId);
      connection.source.component = sourceElement;
      connection.source.slot = dynamicConnection.source.slot;
      connection.destination.memberId =
        this._getMemberIdFromRuntimeId(dynamicConnection.destination.runtimeId);
      connection.destination.component = destinationElement;
      connection.destination.slot = dynamicConnection.destination.slot;
      if (dynamicConnection.hasOwnProperty('copyValue')) {
        connection.copyValue = dynamicConnection.copyValue;
      }
      if (dynamicConnection.hasOwnProperty('repeatedValues')) {
        connection.repeatedValues = dynamicConnection.repeatedValues;
      }
      if (dynamicConnection.hasOwnProperty('hookFunction')) {
        connection.hookFunction = dynamicConnection.hookFunction;
      }
      return connection;
    };

  DynamicConnectionUtil._findContextByConnectionId = function (connectionId) {
    var text = window.atob(connectionId);
    var ownRuntimeId = this.getRuntimeId();
    var endpoints = text.split('>');
    if (endpoints.length !== 2) {
      throw new Error('The connectionId ' + connectionId +
        ' is not a vlaid connectionId for an dynamic connection.');
    }
    var source = endpoints[ 0 ].split('#');
    if (source.length !== 2) {
      throw new Error('The connectionId ' + connectionId +
        ' is not a vlaid connectionId for an dynamic connection.');
    }
    var sourceRuntimeId = source[ 0 ];
    var destination = endpoints[ 1 ].split('#');
    if (destination.length !== 2) {
      throw new Error('The connectionId ' + connectionId +
        ' is not a vlaid connectionId for an dynamic connection.');
    }
    var destinationRuntimeId = destination[ 0 ];
    var context;
    if (ownRuntimeId === sourceRuntimeId && destinationRuntimeId.length > sourceRuntimeId.length &&
      destinationRuntimeId.indexOf(sourceRuntimeId) > -1) {
      context = this.Context;
    } else if (ownRuntimeId === destinationRuntimeId && sourceRuntimeId.length > destinationRuntimeId.length &&
      sourceRuntimeId.indexOf(destinationRuntimeId) > -1) {
      context = this.Context;
    } else {
      context = this._getParentContextForRuntimeId(ownRuntimeId);
    }
    return context;
  };

  window.cubx.dynamicConnectionUtil = DynamicConnectionUtil;
}());
