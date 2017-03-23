/* global Event, MutationObserver */
(function () {
  'use strict';
  var MutationBasedCubxStartevent = function () {
    this.mutation = {childList: true};
    this.cubxMutationTargetNodeAttr = 'data-cubx-target-selector';
    this.cubxEmitEventAttr = 'data-cubx-emit-event';
    this.scriptElement = document.querySelector('[' + this.cubxEmitEventAttr + ']');
    this.start();
  };

  /**
   * Make the utility to start working
   */
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

  if (!window.cubx) {
    window.cubx = {};
  }
  window.cubx.mutationBasedCubxStartevent = new MutationBasedCubxStartevent();
})();

