(function () {
  'use strict';
  /**
   * Get help:
   * > Lifecycle callbacks:
   * https://www.polymer-project.org/1.0/docs/devguide/registering-elements.html#lifecycle-callbacks
   *
   */
  CubxComponent({
    is: 'elementary-example',

    /**
     * Manipulate an element’s local DOM when the element is created.
     */
    created: function () {
    },

    /**
     * Manipulate an element’s local DOM when the element is created and initialized.
     */
    ready: function () {
      var input = this.querySelector('#slota');
      input.setAttribute('value', this.getA());
      this.addEventListener('change', this.inputFieldSlotAChanged.bind(this));
    },

    /**
     * Manipulate an element’s local DOM when the element is attached to the document.
     */
    connected: function () {
    },

    /**
     * Manipulate an element’s local DOM when the cubbles framework is initialized and ready to work.
     */
    contextReady: function () {
    },

    /**
     * A handler to be called by a dom-element
     * @param {event} event
     */
    inputFieldSlotAChanged: function (event) {
      // update the cubbles-model
      this.setA(event.target.value);
    },

    /**
     *  Observe the Cubbles-Component-Model: If value for slot 'a' has changed ...
     */
    modelAChanged: function (newValue) {
      // update the view
      this.querySelector('#slota').setAttribute('value', newValue);
    }
  });
}());
