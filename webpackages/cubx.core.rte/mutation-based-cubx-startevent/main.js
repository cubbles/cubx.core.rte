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
    } else {
      console.warn('Can\'t dispatch event since the attribute \'' + cubxEmitEventAttr + '\' is undefined.' +
        '\n Please provide a value for this attribute within the script tag');
    }
  }

  /**
   * Create the mutation observer for the passed mutation and start to observe the passed node
   * @private
   */
  function _processMutation () {
    var cubxMutationTargetNode = srcElement.getAttribute(cubxMutationTargetNodeAttr) || 'body';
    var targetNode = document.querySelector(cubxMutationTargetNode);
    if (!targetNode) {
      console.warn('Can\'t process mutation since no node could be found using the \'' +
        cubxMutationTargetNode + '\' selector.' +
        '\nPlease provide a valid css selector using the \'' + cubxMutationTargetNodeAttr +
        '\' attribute within the script tag.');
      return;
    }
    var cubxMutation = srcElement.getAttribute(cubxMutationAttr);
    if (!cubxMutation) {
      console.warn('Can\'t process mutation since the attribute \'' + cubxMutationAttr + '\' is undefined.' +
        '\nPlease provide a value for this attribute within the src tag');
      return;
    }
    try {
      cubxMutation = fromSimpleQuoteToDoubleQuotes(cubxMutation);
      var mutationObject = JSON.parse(cubxMutation);
    } catch (e) {
      console.warn('Can\'t process mutation since the \'' + cubxMutationAttr + '\' value is invalid.' +
        '\nRemember to use JSON notation (Single quotes are also supported).');
      return;
    }
    var observer = new MutationObserver(function (mutations) {
      _dispatchEmitEvent();
      observer.disconnect();
    });
    observer.observe(targetNode, mutationObject);
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
    if (!srcElement) {
      console.warn('Can\'t process mutation since the \'' + cubxMutationAttr +
        '\' attribute is undefined. Please provide a value for this attribute within the script tag.');
      return;
    }
    _processMutation();
  });
})();

