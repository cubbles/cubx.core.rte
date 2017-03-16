/* global Event, MutationObserver */
(function () {
  'use strict';
  var MutationBasedCubxStartevent = function () {
    this.mutation = {childList: true};
    this.cubxMutationTargetNodeAttr = 'data-cubx-mutation-target-node';
    this.cubxEmitEventAttr = 'data-cubx-emit-event';
    this.scriptElement = document.querySelector('[' + this.cubxEmitEventAttr + ']');
    this.start();
  };

  MutationBasedCubxStartevent.prototype.start = function () {
    document.addEventListener('DOMContentLoaded', function () {
      if (!this.scriptElement) {
        console.warn('Can\'t process mutation since the \'' + this.cubxEmitEventAttr +
          '\' attribute is undefined. Please provide a value for this attribute within the script tag.');
        return;
      }
      this._processMutation();
    }.bind(this));
  };

  /**
   * Dispatch 'emitEvent' so that the CRC starts working
   */
  MutationBasedCubxStartevent.prototype._dispatchEmitEvent = function () {
    var cubxEmitEvent = this.scriptElement.getAttribute(this.cubxEmitEventAttr);
    if (cubxEmitEvent) {
      var event = new Event(cubxEmitEvent);
      document.dispatchEvent(event);
      console.log('event dispatched');
    } else {
      console.warn('Can\'t dispatch event since the attribute \'' + this.cubxEmitEventAttr + '\' is undefined.' +
        '\n Please provide a value for this attribute within the script tag');
    }
  };

  /**
   * Create the mutation observer for the passed mutation and start to observe the passed node
   * @private
   */
  MutationBasedCubxStartevent.prototype._processMutation = function () {
    var cubxMutationTargetNode = this.scriptElement.getAttribute(this.cubxMutationTargetNodeAttr) || 'body';
    var targetNode = document.querySelector(cubxMutationTargetNode);
    if (!targetNode) {
      console.warn('Can\'t process mutation since no node could be found using the \'' +
        cubxMutationTargetNode + '\' selector.' +
        '\nPlease provide a valid css selector using the \'' + this.cubxMutationTargetNodeAttr +
        '\' attribute within the script tag.');
      return;
    }
    this.observer = new MutationObserver(function (mutations) {
      this._dispatchEmitEvent();
      this.observer.disconnect();
      window.cubx.mutationBasedCubxStartevent = null;
    }.bind(this));
    this.observer.observe(targetNode, this.mutation);
  };

  /**
   * Replaces all simple quote occurrences to double quote
   * @param  {string} string - String to be processed
   * @returns {*} string without single quotes
   */
  MutationBasedCubxStartevent.prototype.fromSimpleQuoteToDoubleQuotes = function (string) {
    if (string.indexOf('\'') >= 0) {
      string = string.replace(/'/gi, '"');
    }
    return string;
  };
  if (!window.cubx) {
    window.cubx = {};
  }
  window.cubx.mutationBasedCubxStartevent = new MutationBasedCubxStartevent();
})();

