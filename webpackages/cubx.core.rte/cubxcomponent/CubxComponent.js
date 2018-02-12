/* globals HTMLElement, customElements, */
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
      this.cubxComponentName = this.is;
      console.log('constructor of ' + this.cubxComponentName);
      // TODO this._initValues();

      if (this.created && typeof this.created === 'function') {
        this.created();
      }
      this._cifReady();
    }
    // Object.assign(CubxComponentClass.prototype, prototype);
    // Object.assign(CubxComponentClass.prototype, window.cubx.cubxComponentMixin);

    CubxComponentClass.prototype.connectedCallback = function () {
      if (this.connected && typeof this.connected === 'function') {
        this.connected();
      }
    };

    CubxComponentClass.prototype.disconnectedCallback = function () {
      if (this.disconnected && typeof this.disconnected === 'function') {
        this.disconnected();
      }
    };

    CubxComponentClass.prototype._callCubxReadyLifeCycleMethod = function () {
      if (this.cubxReady) {
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

    Object.setPrototypeOf(CubxComponentClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(CubxComponentClass, HTMLElement);

    if (!customElements.get(prototype.is)) {
      customElements.define(prototype.is, CubxComponentClass);
    }
  }
  window.CubxComponent = CubxComponent;
})();
