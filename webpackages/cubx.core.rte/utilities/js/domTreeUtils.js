/* eslint no-unused-vars: [2, { "varsIgnorePattern": "elementFindByAttributeValue|findAncestorElement" }]  */
'use strict';
/**
 * Find an element in Dom with the given attribute and value;
 * @param {string} attribute attribute name
 * @param {string} value attribute value
 * @returns {HTMLElement|undefined}
 * @private
 */
function elementFindByAttributeValue (attribute, value) {
  var all = document.getElementsByTagName('*');
  for (var i = 0; i < all.length; i++) {
    if (all[ i ].getAttribute(attribute) === value) {
      return all[ i ];
    }
  }
  return;
}

function findAncestorElement (element, ancestorName) {
  if (element.closest) {
    return element.closest(ancestorName);
  } else {
    var ancestor = element;
    while ((ancestor = ancestor.parentElement) && ancestor.tagName !== ancestorName.toUpperCase()) {}
    return ancestor;
  }
}
