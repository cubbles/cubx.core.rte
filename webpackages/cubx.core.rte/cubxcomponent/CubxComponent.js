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
      if (prototype.created && typeof prototype.created === 'function') {
        prototype.created();
      }
    }

    Object.setPrototypeOf(CubxComponentClass.prototype, HTMLElement.prototype);
    Object.setPrototypeOf(CubxComponentClass, HTMLElement);

    if (!customElements.get(prototype.is)) {
      customElements.define(prototype.is, CubxComponentClass);
    }
  }
  window.CubxComponent = CubxComponent;
})();
