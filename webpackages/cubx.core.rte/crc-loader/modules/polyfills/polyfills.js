/* globals cubx, Array, String, Element*/
cubx.amd.define([], function () {
  'use strict';
  (function () {
    if (typeof window.CustomEvent !== 'function') {
      window.CustomEvent = function (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
      };
      window.CustomEvent.prototype = window.Event.prototype;
    }
    if (!window.String.prototype.startsWith) {
      window.String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.indexOf(searchString, position) === position;
      };
    }
    if (!window.String.prototype.endsWith) {
      window.String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
          position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
      };
    }

    if (!Array.prototype.find) {
      // eslint-disable-next-line no-extend-native
      Array.prototype.find = function (predicate) {
        if (this == null) {
          throw new TypeError('Array.prototype.find called on null or undefined');
        }
        if (typeof predicate !== 'function') {
          throw new TypeError('predicate must be a function');
        }
        var list = Object(this);
        var length = list.length >>> 0;
        var thisArg = arguments[ 1 ];
        var value;

        for (var i = 0; i < length; i++) {
          value = list[ i ];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
        return undefined;
      };
    }

    if (!Array.prototype.filter) {
      // eslint-disable-next-line no-extend-native
      Array.prototype.filter = function (fun/*, thisArg*/) {
        'use strict';

        if (this === void 0 || this === null) {
          throw new TypeError();
        }

        var t = Object(this);
        var len = t.length >>> 0;
        if (typeof fun !== 'function') {
          throw new TypeError();
        }

        var res = [];
        var thisArg = arguments.length >= 2 ? arguments[ 1 ] : void 0;
        for (var i = 0; i < len; i++) {
          if (i in t) {
            var val = t[ i ];

            // NOTE: Technically this should Object.defineProperty at
            //       the next index, as push can be affected by
            //       properties on Object.prototype and Array.prototype.
            //       But that method's new, and collisions should be
            //       rare, so use the more-compatible alternative.
            if (fun.call(thisArg, val, i, t)) {
              res.push(val);
            }
          }
        }

        return res;
      };
    }

    if (typeof Element.prototype.matches !== 'function') {
      Element.prototype.matches = Element.prototype.msMatchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.webkitMatchesSelector || function matches (selector) {
          var element = this;
          var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
          var index = 0;

          while (elements[ index ] && elements[ index ] !== element) {
            ++index;
          }
          return Boolean(elements[ index ]);
        };
    }
    if (typeof Element.prototype.closest !== 'function') {
      Element.prototype.closest = function closest (selector) {
        var element = this;

        while (element && element.nodeType === 1) {
          if (element.matches(selector)) {
            return element;
          }

          element = element.parentNode;
        }

        return null;
      };
    }

    if (!String.prototype.trim) {
      (function () {
        // Make sure we trim BOM and NBSP
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        // eslint-disable-next-line no-extend-native
        String.prototype.trim = function () {
          return this.replace(rtrim, '');
        };
      })();
    }
  })();
});
