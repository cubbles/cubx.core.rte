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
    this.targetNodeSelector = this.scriptElement.getAttribute(this.cubxMutationTargetNodeAttr) || 'body';
    this.targetNode = document.querySelector(this.targetNodeSelector);
    if (!this.targetNode) {
      this._observeBody();
    } else {
      this._observeTargetNode();
    }
  };

  /**
   * Observe the target node to dispatch the emit event when a mutation occurs
   * @private
   */
  MutationBasedCubxStartevent.prototype._observeTargetNode = function () {
    this.observer = new MutationObserver(function (mutations) {
      this._dispatchEmitEvent();
      this.observer.disconnect();
      window.cubx.mutationBasedCubxStartevent = null;
    }.bind(this));
    this.observer.observe(this.targetNode, this.mutation);
  };

  /**
   * Observe the body until the target node is added to DOM
   * @private
   */
  MutationBasedCubxStartevent.prototype._observeBody = function () {
    var bodyObserver = new MutationObserver(function (mutations) {
      this.targetNode = document.querySelector(this.targetNodeSelector);
      if (this.targetNode) {
        this._observeTargetNode();
        bodyObserver.disconnect();
      }
    }.bind(this));
    bodyObserver.observe(document.body, {childList: true});
  };

  if (!window.cubx) {
    window.cubx = {};
  }
  window.cubx.mutationBasedCubxStartevent = new MutationBasedCubxStartevent();
})();

