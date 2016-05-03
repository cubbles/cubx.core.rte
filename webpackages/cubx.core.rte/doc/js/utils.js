/* globals XMLHttpRequest*/
'use strict';
(function () {
  function getTextFile (url) {
    var md = window.markdownit();
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      // console.log('this.responseText', this.responseText);
      var result = md.render(this.responseText);
      document.querySelector('#view').innerHTML = result;
    };
    xhr.open('GET', url);
    xhr.send();
  }

  window.getTextFile = getTextFile;
})();
