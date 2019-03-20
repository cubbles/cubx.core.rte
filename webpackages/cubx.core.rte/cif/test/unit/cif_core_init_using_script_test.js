'use strict';

describe.only('CIF', function () {
  // eslint-disable-next-line no-unused-vars
  var cif;
  var coreInitElement;
  var expectedValues = {
    number: {
      slotName: 'number',
      slotValueAsJSON: 10,
      slotValue: 10
    },
    htmlCode: {
      slotName: 'htmlCode',
      slotValueAsJSON: '"<p>Text text text</p>"',
      slotValue: '<p>Text text text</p>'
    },
    string: {
      slotName: 'string',
      slotValueAsJSON: '"this is a string"',
      slotValue: 'this is a string'
    },
    object: {
      slotName: 'object',
      slotValueAsJSON: '{ "number": 5, "boolean": true }',
      slotValue: {
        'number': 5,
        'boolean': true
      }
    },
    list: {
      slotName: 'list',
      slotValueAsJSON: '[ 1, 2, "text", true ]',
      slotValue: [1, 2, 'text', true]
    },
    invalid: {
      slotName: 'jsCode',
      slotValueAsJSON: 'alert("hi");'
    }
  };

  function generateCubxCoreSlotInitElement (slotName, slotValue) {
    var coreInitEl = document.createElement('cubx-core-slot-init');
    coreInitEl.setSlot(slotName);
    coreInitEl.innerHTML = slotValue;
    console.log(coreInitEl);
    return coreInitEl;
  };
  before(function () {
    cif = window.cubx.cif.cif;
  });
  describe('cubx-core-slot-init using script for textContent', function () {
    after(function () {
      document.body.removeChild(coreInitElement);
    });
    it('should inject a script within the cubx-core-slot-init', function () {
      coreInitElement = generateCubxCoreSlotInitElement(
        expectedValues.number.slotName,
        expectedValues.number.slotValueAsJSON
      );
      document.body.appendChild(coreInitElement);
      expect(coreInitElement.firstElementChild.tagName).to.equal('SCRIPT');
    });
  });
  describe('should return correct values when accessing innerHTML and textContent properties', function () {
    afterEach(function () {
      document.body.removeChild(coreInitElement);
    });
    it('should return a stringified number', function () {
      coreInitElement = generateCubxCoreSlotInitElement(
        expectedValues.number.slotName,
        expectedValues.number.slotValueAsJSON
      );
      document.body.appendChild(coreInitElement);
      expect(JSON.parse(coreInitElement.innerHTML)).to.equal(expectedValues.number.slotValue);
      expect(JSON.parse(coreInitElement.textContent)).to.equal(expectedValues.number.slotValue);
    });
    it('should return a stringified htmlCode', function () {
      coreInitElement = generateCubxCoreSlotInitElement(
        expectedValues.htmlCode.slotName,
        expectedValues.htmlCode.slotValueAsJSON
      );
      document.body.appendChild(coreInitElement);
      expect(JSON.parse(coreInitElement.innerHTML)).to.equal(expectedValues.htmlCode.slotValue);
      expect(JSON.parse(coreInitElement.textContent)).to.equal(expectedValues.htmlCode.slotValue);
    });
    it('should return a stringified string', function () {
      coreInitElement = generateCubxCoreSlotInitElement(
        expectedValues.string.slotName,
        expectedValues.string.slotValueAsJSON
      );
      document.body.appendChild(coreInitElement);
      expect(JSON.parse(coreInitElement.innerHTML)).to.equal(expectedValues.string.slotValue);
      expect(JSON.parse(coreInitElement.textContent)).to.equal(expectedValues.string.slotValue);
    });
    it('should return a stringified object', function () {
      coreInitElement = generateCubxCoreSlotInitElement(
        expectedValues.object.slotName,
        expectedValues.object.slotValueAsJSON
      );
      document.body.appendChild(coreInitElement);
      expect(JSON.parse(coreInitElement.innerHTML)).to.deep.equal(expectedValues.object.slotValue);
      expect(JSON.parse(coreInitElement.textContent)).to.deep.equal(expectedValues.object.slotValue);
    });
    it('should return a stringified list', function () {
      coreInitElement = generateCubxCoreSlotInitElement(
        expectedValues.list.slotName,
        expectedValues.list.slotValueAsJSON
      );
      document.body.appendChild(coreInitElement);
      expect(JSON.parse(coreInitElement.innerHTML)).to.deep.equal(expectedValues.list.slotValue);
      expect(JSON.parse(coreInitElement.textContent)).to.deep.equal(expectedValues.list.slotValue);
    });
  });
  describe('', function () {
    after(function () {
      document.body.removeChild(coreInitElement);
    });
    it('should throw error when trying to parse a JSON invalid slotValue', function () {
      coreInitElement = generateCubxCoreSlotInitElement(
        expectedValues.invalid.slotName,
        expectedValues.invalid.slotValueAsJSON
      );
      document.body.appendChild(coreInitElement);
      expect(function () {
        JSON.parse(coreInitElement.innerHTML);
      }).to.throw(SyntaxError);
      expect(function () {
        JSON.parse(coreInitElement.textContent);
      }).to.throw(SyntaxError);
    });
  });
});
