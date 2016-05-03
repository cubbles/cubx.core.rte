window.cubx.amd.define(
  [],
  function () {
    'use strict';

    /**
     * A utility module containing helpful methods. This module can be used by calling {@link CRC#getUtils}
     * method of {@link CRC}.
     * @exports crc/Utils
     * @namespace Utils
     */
    var Utils = {

      /**
       * Utility methods for working with arrays
       * @memberOf Utils
       * @type {object}
       * @namespace Utils.Array
       */
      Array: {
        /**
         * Insert item at given index in given array.
         * @memberOf Utils.Array
         * @param {object} array The array to insert item
         * @param {misc} item The item to insert
         * @param {number} index The index at which to insert the item into array
         */
        insertItemAtIndex: function (array, item, index) {
          if (!Array.isArray(array)) {
            throw new TypeError('parameter "array" needs to be an array');
          }

          if (typeof index !== 'number') {
            throw new TypeError('parameter "index" needs to be a number');
          }

          if (index > array.length - 1 || index < 0) {
            throw new RangeError('parameter "index" must be in range [0, array length - 1]');
          }

          // check if there is a value for given index. If not insert item at given index
          if (!array[ index ]) {
            array[ index ] = item;
            return;
          }

          for (var i = array.length; i > index; i--) {
            array[ i ] = array[ i - 1 ];
          }
          array[ index ] = item;
        },

        /**
         * Insert item before a given item in an array.
         * @memberOf Utils.Array
         * @param {object} array The array to insert item
         * @param {misc} insertItem The item to insert into the array
         * @param {misc} item The item that should be the direct successor to inserted item. This item needs to
         *                    be in the array already. If it isn't then the insertItem will just be append to
         *                    the end of the array.
         * @return {number} The index at which the item was inserted
         */
        insertBefore: function (array, insertItem, item) {
          if (!Array.isArray(array)) {
            throw new TypeError('parameter "array" needs to be an array');
          }

          var index = array.indexOf(item);
          if (index === -1) {
            array.push(insertItem);
          } else {
            Utils.Array.insertItemAtIndex(array, insertItem, index);
          }

          return array.indexOf(insertItem);
        },

        /**
         * Remove item from array.
         * @memberOf Utils.Array
         * @param {object} array The array
         * @param {misc} item The item which needs to be removed from the array
         */
        removeItemFromArray: function (array, item) {
          if (!Array.isArray(array)) {
            throw new TypeError('parameter "array" needs to be an array');
          }

          var index = array.indexOf(item);
          if (index === -1) {
            throw new Error('item is not in given array');
          } else {
            array.splice(index, 1);
          }
        }
      },

      /**
       * Utility methods for working with the DOM tree
       * @memberOf Utils
       * @type {object}
       * @namespace Utils.DOM
       */
      DOM: {
        /**
         * Append a new script tag to DOM tree for including external JS file
         * @memberOf Utils.DOM
         * @param {string} src The value for the src attribute
         * @param {string} referrer referrer this script
         */
        appendScriptTagToHead: function (src, referrer) {
          var element = document.createElement('script');
          element.setAttribute('src', src);
          element.async = false;
          element.setAttribute('data-referrer', referrer.join(','));
          document.head.appendChild(element);
        },

        /**
         * Append a new link tag with rel="stylesheet" to head for given href value
         * @memberOf Utils.DOM
         * @param {string} href The link to the stylesheet to be included
         * @param {string} referrer referrer this sylesheet
         */
        appendStylesheetToHead: function (href, referrer) {
          var element = document.createElement('link');
          element.setAttribute('rel', 'stylesheet');
          element.setAttribute('href', href);
          element.setAttribute('data-referrer', referrer.join(','));
          document.head.appendChild(element);
        },

        /**
         * Append a new link tag with rel="import" to head for given href value
         * @memberOf Utils.DOM
         * @param {string} href The link to the htmlImport to be included
         * @param {string} referrer referrer this html import
         */
        appendHtmlImportToHead: function (href, referrer) {
          var element = document.createElement('link');
          element.setAttribute('rel', 'import');
          element.setAttribute('href', href);
          element.setAttribute('data-referrer', referrer.join(','));
          element.async = false;
          document.head.appendChild(element);
        },

        /**
         * Prepend a new script tag to DOM tree for including external JS file
         * @memberOf Utils.DOM
         * @param {string} src The value for the src attribute
         * @param {element} nextSibling The DOM Element acting as next sibling for created script tag
         * @param {string} referrer referrer this script
         */
        prependScriptTagToHead: function (src, nextSibling, referrer) {
          var head = document.getElementsByTagName('head')[ 0 ];
          var element = document.createElement('script');
          element.setAttribute('src', src);
          element.async = false;
          element.setAttribute('data-referrer', referrer.join(','));
          Utils.DOM._insertBefore(head, element, nextSibling);
        },

        /**
         * Prepend a new link tag with rel="stylesheet" to head for given href value
         * @memberOf Utils.DOM
         * @param {string} href The link to the stylesheet to be included
         * @param {element} nextSibling The DOM Element acting as next sibling for created link tag
         * @param {string} referrer referrer this sylesheet
         */
        prependStylesheetToHead: function (href, nextSibling, referrer) {
          var head = document.getElementsByTagName('head')[ 0 ];
          var element = document.createElement('link');
          element.setAttribute('rel', 'stylesheet');
          element.setAttribute('data-referrer', referrer.join(','));
          element.setAttribute('href', href);

          Utils.DOM._insertBefore(head, element, nextSibling);
        },

        /**
         * Prepend a new link tag with rel="import" to head for given href value
         * @memberOf Utils.DOM
         * @param {string} href The link to the htmlImport to be included
         * @param {element} nextSibling The DOM Element acting as next sibling for created link tag
         * @param {string} referrer referrer this html import
         */
        prependHtmlImportToHead: function (href, nextSibling, referrer) {
          var head = document.getElementsByTagName('head')[ 0 ];
          var element = document.createElement('link');
          element.setAttribute('rel', 'import');
          element.setAttribute('href', href);
          element.async = false;
          element.setAttribute('data-referrer', referrer.join(','));
          Utils.DOM._insertBefore(head, element, nextSibling);
        },

        /**
         * Prepend a node to a given parent
         * @memberOf Utils.DOM
         * @param {object} parent The DOM element to insert node into
         * @param {object} node The node to insert
         * @param {element} nextSibling The DOM Element acting as next sibling for inserted node
         * @private
         */
        _insertBefore: function (parent, node, nextSibling) {
          if (nextSibling == null) {
            parent.append(node);
          } else {
            parent.insertBefore(node, nextSibling);
          }
        }
      }
    };

    return Utils;
  });
