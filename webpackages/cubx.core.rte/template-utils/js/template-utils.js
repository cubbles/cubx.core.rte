'use strict';
if (!window.cubx) {
  window.cubx = {};
}
if (!window.cubx.utils) {
  window.cubx.utils = {};
}
window.cubx.utils.findTemplate = function (id) {
  var promises = [];
  var importDocList = document.querySelectorAll('link[rel=import]');
  var importDoc;
  for (var i = 0; i < importDocList.length; i++) {
    importDoc = importDocList[ i ];

    promises.push(new Promise(function (resolve, reject) {
      if (importDoc.import) {
        window.cubx.utils.resolveTemplateContent(importDoc, id, resolve, reject);
      } else {
        importDoc.addEventListener('load', function (event) {
          window.cubx.utils.resolveTemplateContent(event.target, id, resolve, reject);
        });
      }
    }));
  }
  return Promise.all(promises);
};

window.cubx.utils.resolveTemplateContent = function (importDoc, id, resolve, reject) {
  var content;
  var template;
  if (importDoc) {
    content = importDoc.import;
  }
  if (content) {
    template = content.querySelector('#' + id);
  }
  if (template) {
    resolve(template);
  } else {
    resolve(false);
  }
};
