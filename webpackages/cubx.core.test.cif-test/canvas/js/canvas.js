(function () {
  'use strict';

  var crcContainer = document.querySelector('[cubx-core-crc]');

  crcContainer.addEventListener('cifReady', function () {
    var canvasElements = document.querySelectorAll('.canvas');
    for (var i = 0; i < canvasElements.length; i++) {
      draw(canvasElements[ i ]);
    }
  });

  function draw (canvasElement) {
    var parentCompound = getParentCompound(canvasElement);
    var row = parentCompound.querySelector('.row');

    var canvasWidth = Math.floor(canvasElement.parentNode.getBoundingClientRect().width);
    canvasElement.width = canvasWidth;
    var canvasHeight = Math.floor(row.getBoundingClientRect().height);
    canvasElement.height = canvasHeight;
    if (canvasElement.getContext) {
      var context = canvasElement.getContext('2d');
      var x = 7;
      var y = canvasHeight / 2;
      var x2 = canvasWidth - 7;
      var y2 = y;
      context.moveTo(x, y);
      context.lineTo(x2, y2);
      context.stroke();

      context.beginPath();
      context.moveTo(x2, y2);
      context.lineTo(x2 - 7, y2 - 7);
      context.lineTo(x2 - 7, y2 + 7);
      context.closePath();
      context.fill();

      context.beginPath();
      context.arc(x - 3, y, 3, 0, Math.PI * 2, true);
      context.closePath();
      context.stroke();
      context.fillText('a', x - 3, y + 12);

      context.beginPath();
      context.arc(x2 + 3, y, 3, 0, Math.PI * 2, true);
      context.closePath();
      context.stroke();
      context.fillText('a', x2 - 3, y + 12);
    }
  }

  function getParentCompound (element) {
    if (!element.parentNode) {
      return null;
    } else if (element.parentNode.isCompoundComponent) {
      return element.parentNode;
    } else {
      return getParentCompound(element.parentNode);
    }
  }
})();

