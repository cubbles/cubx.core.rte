/*global _,Polymer*/

/**
 * CubxPolymer wrapped the Polymer function.
 * CubxPolymer extends the protptype of the Polymer Tags by the functionality of the CubxPolymer model.
 * The Polymer functionality will be just extended, not changed.
 */

(function () {
  'use strict';
  /**
   * Mixed the cubxPolymerMixin functionality in polymer prototype. And initialized the cubx component.
   * @param {object} prototype Polymer Prototype object
   */
  function CubxPolymer (prototype) {
    if (!prototype) {
      console.error('Missed prototype parameter');
    }
    if (!prototype.is) {
      console.error('the prototype parameter missed th "is" property');
    }

    _.mixin(prototype, window.cubx.cubxPolymerMixin);

    prototype._initPrototypeForCubx();

    Polymer(prototype);
  }

  /**
   * Wrapper for the Polymer global function. This extends the Polymer element prototype with the CubxPolymer
   * model, methods and functionality.
   *
   * @param name polymer element tagname
   * @param prototype {HTMLElement} Polymer Elment prototype
   * @function
   * @global
   */
  window.CubxPolymer = CubxPolymer;
})();
