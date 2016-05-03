/*globals alert*/
'use strict';
function newContent () {
  alert('changing background color');
  document.body.style.background = '#f9f9e9';
}

window.onload = newContent();
