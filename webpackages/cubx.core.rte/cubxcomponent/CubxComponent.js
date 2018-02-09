(function () {
  function CubxComponent (prototype) {
    if (!prototype) {
      console.error('Missed prototype parameter');
    }
    if (!prototype.is) {
      console.error('the prototype parameter missed th "is" property');
    }
    this.cubxComponentName = this.is;
  }

  window.CubxComponent = CubxComponent;
})();
