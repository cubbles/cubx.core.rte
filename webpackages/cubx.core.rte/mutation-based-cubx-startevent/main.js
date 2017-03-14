/* global Event, MutationObserver */
(function () {
  'use strict';

  var cubxMutationAttr = 'data-cubx-mutation';
  var cubxMutationTargetNodeAttr = 'data-cubx-mutation-target-node';
  var cubxEmitEventAttr = 'data-cubx-emit-event';
  var srcElement = document.querySelector('[' + cubxMutationAttr + ']');

  /**
   * Dispatch 'emitEvent' so that the CRC starts working
   */
  function _dispatchEmitEvent () {
    var cubxEmitEvent = srcElement.getAttribute(cubxEmitEventAttr);
    if (cubxEmitEvent) {
      var event = new Event(cubxEmitEvent);
      document.dispatchEvent(event);
    }
  }

  /**
   * Create the mutation observer for the passed mutation and start to observe the passed node
   * @private
   */
  function _processMutation () {
    var cubxMutation = srcElement.getAttribute(cubxMutationAttr);
    var cubxMutationTargetNode = srcElement.getAttribute(cubxMutationTargetNodeAttr) || 'body';
    if (cubxMutation && cubxMutationTargetNode) {
      var observer = new MutationObserver(function (mutations) {
        _dispatchEmitEvent();
        observer.disconnect();
      });
      cubxMutation = fromSimpleQuoteToDoubleQuotes(cubxMutation);
      var targetNode = document.querySelector(cubxMutationTargetNode);
      observer.observe(targetNode, JSON.parse(cubxMutation));
    }
  }

  /**
   * Replaces all simple quote occurrences to double quote
   * @param  {string} string - String to be processed
   * @returns {*} string without single quotes
   */
  function fromSimpleQuoteToDoubleQuotes (string) {
    if (string.indexOf('\'') >= 0) {
      string = string.replace(/'/gi, '"');
    }
    return string;
  }

  document.addEventListener('DOMContentLoaded', function () {
    _processMutation();
  });
})();

