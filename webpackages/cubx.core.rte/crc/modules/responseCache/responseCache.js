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
   * Add a new item to ResponseCache. If addition succeeds the returned promise is resolved given the item.
   * If there was an error the returned promise is rejected given the error. If there is already an item set for given
   * key it will be overridden.
   * @memberOf ResponseCache
   * @param {string} key The unique key
   * @param {object|boolean|number|string} item The item to be cached under given key
   * @return {object} Promise
   */
  ResponseCache.prototype.addItem = function (key, item) {
    var self = this;
    var promise = new Promise(function (resolve, reject) {
      // check if key is of type string
      if (typeof key !== 'string' || key.length === 0) {
        reject(new TypeError('Parameter key needs to be a non empty string'));
        return;
      }
      // check if item is valid
      if (item === null) {
        reject(new TypeError('Parameter item needs to a non null value'));
        return;
      }
      // add item to cache
      self._cache[key] = item;
      resolve(item);
    });
    return promise;
  };

  /**
   * Get item by given key. If no item is found for given key then returned promise is resolved with null.
   * @memberOf ResponseCache
   * @param {string} key
   * @return {object} promise
   */
  ResponseCache.prototype.get = function (key) {
    var self = this;
    var promise = new Promise(function (resolve, reject) {
      // check if key is of type string
      if (typeof key !== 'string' || key.length === 0) {
        reject(new TypeError('Parameter key needs to be a non empty string'));
        return;
      }
      if (self._cache.hasOwnProperty(key)) {
        resolve(self._cache[key]);
      } else {
        resolve(null);
      }
    });
    return promise;
  };

  /**
   * Removes an item from the ResponseCache. If there is an item in cache with given key the returned promise will be
   * resolved with this item. Otherwise the promise will be resolved with null. If there is an error the promise will
   * be rejected.
   * @memberOf ResponseCache
   * @param {string} key The key for which the item will be removed
   * @return {object} promise
   */
  ResponseCache.prototype.removeItem = function (key) {
    var self = this;
    var promise = new Promise(function (resolve, reject) {
      // check if key is of type string
      if (typeof key !== 'string' || key.length === 0) {
        reject(new TypeError('Parameter key needs to be a non empty string'));
        return;
      }
      if (self._cache.hasOwnProperty(key)) {
        var item = self._cache[key];
        delete self._cache[key];
        resolve(item);
      } else {
        // resolve with null if no item for given key is found
        resolve(null);
      }
    });
    return promise;
  };

  /**
   * Invalide Cache by removing all items. After successfully invalidating the cache the returned promise is resolved.
   * @memberOf ResponseCache
   * @return {object} promise
   */
  ResponseCache.prototype.invalidate = function () {
    var self = this;
    var promise = new Promise(function (resolve, reject) {
      // reset cache
      self._cache = {};
      resolve();
    });
    return promise;
  };

  return new ResponseCache();
});
