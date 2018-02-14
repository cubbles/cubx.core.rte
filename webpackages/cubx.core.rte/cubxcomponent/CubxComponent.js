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

    function CubxComponentClass () {
      HTMLElement.call(this);
      Object.assign(this, prototype);
      this._cifReady();
      this.cubxComponentName = this.is;
      this.eventFactory = new window.cubx.EventFactory();
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

    CubxComponentClass.prototype._callCubxReadyLifeCycleMethod = function () {
      if (this.cubxReady && typeof this.cubxReady === 'function') {
        this.cubxReady();
      }
    };

    /**
     * Called if cifReady event dispatched.
     * @private
     */
    CubxComponentClass.prototype._cifReadyHandler = function () {
      this._callCubxReadyLifeCycleMethod();
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

    Object.setPrototypeOf(CubxComponentClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(CubxComponentClass, HTMLElement);

    if (!customElements.get(prototype.is)) {
      customElements.define(prototype.is, CubxComponentClass);
    }
  }
  window.CubxComponent = CubxComponent;
})();
