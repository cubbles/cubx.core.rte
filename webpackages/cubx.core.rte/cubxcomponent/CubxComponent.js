/* globals HTMLElement, customElements */
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

    function CubxComponentClass () {
      this.cubxComponentName = prototype.is;
      HTMLElement.call(this);
      // TODO this._initValues();

      if (prototype.created && typeof prototype.created === 'function') {
        prototype.created();
      }
    }

    CubxComponentClass.prototype.connectedCallback = function () {
      if (prototype.connected && typeof prototype.connected === 'function') {
        prototype.connected();
      }
    };

    CubxComponentClass.prototype.disconnectedCallback = function () {
      if (prototype.disconnected && typeof prototype.disconnected === 'function') {
        prototype.disconnected();
      }
    };

    Object.setPrototypeOf(CubxComponentClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(CubxComponentClass, HTMLElement);

    if (!customElements.get(prototype.is)) {
      customElements.define(prototype.is, CubxComponentClass);
    }
  }
  window.CubxComponent = CubxComponent;
})();
