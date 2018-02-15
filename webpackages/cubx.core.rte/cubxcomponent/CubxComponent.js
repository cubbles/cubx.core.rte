/* globals HTMLElement, customElements, _ */
(function () {
  function CubxComponent (prototype) {
    if (!prototype) {
      console.error('Missed prototype parameter');
      return;
    }
    if (!prototype.is) {
      console.error('the prototype parameter missed th "is" property');
      return;
    }
    Object.assign(prototype, window.cubx.cubxComponentMixin);
    Object.assign(prototype, window.cubx.dynamicConnectionUtil);

    function CubxComponentClass () {
      HTMLElement.call(this);
      Object.assign(this, prototype);
      this._cifReady();
      this.cubxComponentName = this.is;
      this.eventFactory = new window.cubx.EventFactory();
      this.model = {};
      this.___cubxManifest___ = this._getComponentFromCRCCache(this.cubxComponentName);
      this._initSlots(this.___cubxManifest___.slots);
      if (this.created && typeof this.created === 'function') {
        this.created();
      }

      this._initValues();
      var promise = this._includeTemplate(this.cubxComponentName);
      promise.then(function () {
        if (this.ready && typeof this.ready === 'function') {
          this.ready();
        }
      }.bind(this));
    }

    CubxComponentClass.prototype.connectedCallback = function () {
      if (this.connected && typeof this.connected === 'function') {
        this.connected();
      }
      this._fireReadyEvent();
    };

    CubxComponentClass.prototype.disconnectedCallback = function () {
      if (this.disconnected && typeof this.disconnected === 'function') {
        this.disconnected();
      }
    };

    CubxComponentClass.prototype._callContextReadyLifeCycleMethod = function () {
      if (this.contextReady && typeof this.contextReady === 'function') {
        this.contextReady();
      }
    };

    /**
     * Called if cifReady event dispatched.
     * @private
     */
    CubxComponentClass.prototype._cifReadyHandler = function () {
      this._callContextReadyLifeCycleMethod();
    };

    CubxComponentClass.prototype._initSlots = function (slots) {
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

    CubxComponentClass.prototype._initSlot = function (slot) {
      if (!slot.hasOwnProperty('slotId')) {
        console.error('Abort initialisation of the slot, because the attribute "slot.slotId" not exists.', slot);
        return;
      }
      var slotId = slot.slotId;

      this._generateSetMethod(slotId);
      this._generateGetMethod(slotId);

      this._generateChangeMethodForProperty(slotId);

      if (this.isOutputSlot(slot)) {
        this._generateRepropagateMethod(slotId);
      }
    };

    CubxComponentClass.prototype._getChangeHandlerMethodName = function (slotId) {
      return '_handleChange4' + _.capitalize(slotId);
    };

    CubxComponentClass.prototype._generateSetMethod = function (slotId) {
      this[ this._getSetMethodName(slotId) ] = function (value) {
        this._setInModel(slotId, value);
        this[ this._getChangeHandlerMethodName(slotId) ](value);
      };
    };

    CubxComponentClass.prototype._generateGetMethod = function (slotId) {
      this[ this._getGetMethodName(slotId) ] = function () {
        return this.model[ slotId ];
      };
    };

    CubxComponentClass.prototype._setSlotValue = function (key, value) {
      this.model[ key ] = value;
    };

    CubxComponentClass.prototype._getChangeHandlerMethodName = function (slotId) {
      return '_handleChange4' + _.capitalize(slotId);
    };

    CubxComponentClass.prototype._triggerModelChangeEvent = function (slotId, modelEventPayload) {
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

    CubxComponentClass.prototype._includeTemplate = function (artifactId) {
      var promise = window.cubx.utils.findTemplate(this.cubxComponentName);
      return promise.then(
        function (results) {
          var template;
          for (var i = 0; i < results.length; i++) {
            var result = results[ i ];
            if (typeof result === 'object') {
              template = result;
              break;
            }
          }
          if (template) {
            var templateContent = document.importNode(template.content, true);
            this.appendChild(templateContent);
          }
          return Promise.resolve(true);
        }.bind(this));
    };

    CubxComponentClass.prototype._fireReadyEvent = function () {
      // console.log('_fireReadyEvent ', this);
      this._componentReady = true;
      var componentReadyEvent = this.eventFactory.createEvent(window.cubx.EventFactory.types.COMPONENT_READY,
        {
          runtimeId: this.getAttribute('runtime-id')
        });
      this.dispatchEvent(componentReadyEvent);
    };

    CubxComponentClass.prototype._generateChangeMethodForProperty = function (slotId) {
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

    CubxComponentClass.prototype._getMethodNameModelChanged = function (slotId) {
      return 'model' + _.capitalize(slotId) + 'Changed';
    };

    CubxComponentClass.prototype.addDynamicConnection = function (dynamicConnection) {
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
    CubxComponentClass.prototype.removeDynamicConnection = function (connection) {
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
    CubxComponentClass.prototype.exportDynamicConnections = function () {
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
    CubxComponentClass.prototype.getComponentBaseUri = function () {
      var artifactId = this.___cubxManifest___.artifactId;
      var webpackageId = this.___cubxManifest___.webpackageId;
      var baseUri = window.cubx.CRC._baseUrl;
      if (baseUri.lastIndexOf('/') !== baseUri.length - 1) {
        baseUri += '/';
      }
      baseUri += webpackageId + '/' + artifactId;
      return baseUri;
    };

    Object.setPrototypeOf(CubxComponentClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(CubxComponentClass, HTMLElement);

    if (!customElements.get(prototype.is)) {
      customElements.define(prototype.is, CubxComponentClass);
    }
  }
  window.CubxComponent = CubxComponent;
})();
