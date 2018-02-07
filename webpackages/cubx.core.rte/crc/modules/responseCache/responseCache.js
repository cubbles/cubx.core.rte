/**
 * Defines the ResponseCache requireJS Module.
 *
 * @version 1.0.0
 * @module ResponseCache_Module
 */
window.cubx.amd.define(function () {
  'use strict';
  /**
   *
   * @class ResponseCache
   * @global
   * @constructor
   */
  var ResponseCache = function () {
    /**
     * Object holding the cached items. The property name under which the item is stored acts as the key.
     * @type {object}
     * @private
     */
    this._cache = {};
  };

  /**
   * Add a new item to ResponseCache. The added item is returned.
   * @memberOf ResponseCache
   * @param {string} key The unique key
   * @param {object|boolean|number|string} item The item to be cached under given key
   * @return {object|boolean|number|string} item The added item
   */
  ResponseCache.prototype.addItem = function (key, item) {
    // check if key is of type string
    if (typeof key !== 'string' || key.length === 0) {
      throw new TypeError('Parameter key needs to be a non empty string');
    }
    // check if item is valid
    if (item === null) {
      throw new TypeError('Parameter item needs to a non null value');
    }
    // add item to cache
    this._cache[key] = item;
    return item;
  };

  /**
   * Get item by given key. If no item is found null is returned.
   * @memberOf ResponseCache
   * @param {string} key
   * @return {object|boolean|number|string|null} item or null
   */
  ResponseCache.prototype.get = function (key) {
    // check if key is of type string
    if (typeof key !== 'string' || key.length === 0) {
      throw new TypeError('Parameter key needs to be a non empty string');
    }
    if (this._cache.hasOwnProperty(key)) {
      return this._cache[key];
    } else {
      return null;
    }
  };

  /**
   * Removes an item from the ResponseCache. If there is an item in cache with given key the removed item is returned.
   * Otherwise null will be returned.
   * @memberOf ResponseCache
   * @param {string} key The key for which the item will be removed
   * @return {object|boolean|number|string|null} item or null
   */
  ResponseCache.prototype.removeItem = function (key) {
    // check if key is of type string
    if (typeof key !== 'string' || key.length === 0) {
      throw new TypeError('Parameter key needs to be a non empty string');
    }
    if (this._cache.hasOwnProperty(key)) {
      var item = this._cache[key];
      delete this._cache[key];
      return item;
    } else {
      // return null if no item for given key is found
      return null;
    }
  };

  /**
   * Invalidate cache by removing all items.
   * @memberOf ResponseCache
   */
  ResponseCache.prototype.invalidate = function () {
    // reset cache
    this._cache = {};
  };

  return new ResponseCache();
});
