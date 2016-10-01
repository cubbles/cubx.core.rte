/* globals localStorage*/
/**
 * Defines the Storage Manager RequireJS Module.
 *
 * @since 1.0.0
 * @version 1.0.0
 * @module StorageManager_Module
 */
window.cubx.amd.define([], function () {
  'use strict';

  /**
   * Manages the
   *
   * @constructor
   * @global
   * @version 1.0.0
   * @since 1.0.0
   */
  var StorageManager = function () {
    /**
     * Holds all models wth unique id as key
     * @type {object}
     * @private
     */
    this._modelCache = {};
  };

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------                 Public Methods               ---------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  /**
   * Get the model for given id. If no model could be found for given id a new empty model will be created
   * and returned.
   * @memberOf StorageManager
   * @param {string} id
   * @param {object} model
   * @return {object}
   */
  StorageManager.prototype.getModel = function (id, model) {
    if (typeof id !== 'string') {
      throw new TypeError('parameter "id" needs to be of type string');
    }

    if (this._modelCache.hasOwnProperty(id) && this._modelCache[ id ] !== null) {
      // TODO: mixin mit model parameter
      // return this._modelCache[id];
      return model; // remove after TODO is done
    } else {
      this._modelCache[ id ] = model;
      return this._modelCache[ id ];
    }
  };

  /**
   * Persist Object to localStorage (if available)
   * @memberOf StorageManager
   * @param {string} key
   * @param {object} item
   * @return {boolean} true if item was stored, false otherwise
   */
  StorageManager.prototype.setObjectToLocalStorage = function (key, item) {
    if (window.localStorage) {
      localStorage.setItem(key, JSON.stringify(item));
    } else {
      return false;
    }
  };

  /**
   * Get object from localStorage
   * @memberOf StorageManager
   * @param {string} key
   * @return {object} The requested object or null if no one was found using the provided key
   */
  StorageManager.prototype.getObjectFromLocalStorage = function (key) {
    if (window.localStorage) {
      var item = localStorage.getItem(key);
      return (item === null) ? null : JSON.parse(item);
    } else {
      return null;
    }
  };

  // ---------------------------------------------------------------------------------------------------------------
  // --------------------------------                 Private Methods              ---------------------------------
  // ---------------------------------------------------------------------------------------------------------------

  return new StorageManager();
});
