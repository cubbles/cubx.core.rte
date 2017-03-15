/* global Event, MutationObserver */
(function () {
  'use strict';
  var MutationBasedCubxStartevent = function () {
    this.cubxMutationAttr = 'data-cubx-mutation';
    this.cubxMutationTargetNodeAttr = 'data-cubx-mutation-target-node';
    this.cubxEmitEventAttr = 'data-cubx-emit-event';
    this.srcElement = document.querySelector('[' + this.cubxMutationAttr + ']');
  };

  /**
   * Dispatch 'emitEvent' so that the CRC starts working
   */
  MutationBasedCubxStartevent.prototype._dispatchEmitEvent = function () {
    var cubxEmitEvent = this.srcElement.getAttribute(this.cubxEmitEventAttr);
    if (cubxEmitEvent) {
      var event = new Event(cubxEmitEvent);
      document.dispatchEvent(event);
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
    var cubxMutationTargetNode = this.srcElement.getAttribute(this.cubxMutationTargetNodeAttr) || 'body';
    var targetNode = document.querySelector(cubxMutationTargetNode);
    if (!targetNode) {
      console.warn('Can\'t process mutation since no node could be found using the \'' +
        cubxMutationTargetNode + '\' selector.' +
        '\nPlease provide a valid css selector using the \'' + this.cubxMutationTargetNodeAttr +
        '\' attribute within the script tag.');
      return;
    }
    var cubxMutation = this.srcElement.getAttribute(this.cubxMutationAttr);
    if (!cubxMutation) {
      console.warn('Can\'t process mutation since the attribute \'' + this.cubxMutationAttr + '\' is undefined.' +
        '\nPlease provide a value for this attribute within the src tag');
      return;
    }
    try {
      cubxMutation = this.fromSimpleQuoteToDoubleQuotes(cubxMutation);
      var mutationObject = JSON.parse(cubxMutation);
    } catch (e) {
      console.warn('Can\'t process mutation since the \'' + this.cubxMutationAttr + '\' value is invalid.' +
        '\nRemember to use JSON notation (Single quotes are also supported).');
      return;
    }
    var observer = new MutationObserver(function (mutations) {
      this._dispatchEmitEvent();
      observer.disconnect();
    }.bind(this));
    observer.observe(targetNode, mutationObject);
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

  var mutationBasedCubxStartevent = new MutationBasedCubxStartevent();
  document.addEventListener('DOMContentLoaded', function () {
    if (!mutationBasedCubxStartevent.srcElement) {
      console.warn('Can\'t process mutation since the \'' + mutationBasedCubxStartevent.cubxMutationAttr +
        '\' attribute is undefined. Please provide a value for this attribute within the script tag.');
      return;
    }
    mutationBasedCubxStartevent._processMutation();
  });
  if (!window.cubx) {
    window.cubx = {};
  }
  window.cubx.mutationBasedCubxStartevent = mutationBasedCubxStartevent;
})();

