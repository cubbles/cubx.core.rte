'use strict';
describe('Initializer', function () {
  var initializer;
  var cif;

  before(function () {
    cif = window.cubx.cif.cif;
    initializer = cif.getInitializer();
  });

  describe('constructor', function () {
    it('initializer object could be create', function () {
      initializer.should.be.instanceOf(window.cubx.cif.Initializer);
    });
  });

  describe('#parseInitSlotsForContext', function () {
    var element;
    var child;
    var childChild;
    var spyInitializerParseInitSlotsForElement;
    var spyInitializerParseInitSlotsForContext;
    describe('default (function calls)', function () {
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-parent');
        element = new constructor();
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child');
        child = new constructor();
        child.Context.setParent(element.Context);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-childchild');
        childChild = new constructor();
        childChild.Context.setParent(child.Context);

        spyInitializerParseInitSlotsForElement = sinon.spy(initializer, '_parseInitSlotsForElement');
        spyInitializerParseInitSlotsForContext = sinon.spy(initializer, 'parseInitSlotsForContext');
        initializer.parseInitSlotsForContext(element.Context);
      });
      afterEach(function () {
        initializer._parseInitSlotsForElement.restore();
        initializer.parseInitSlotsForContext.restore();
      });
      it('#_parseInitSlotsForElement should be called three times', function () {
        expect(spyInitializerParseInitSlotsForElement.calledThrice).to.be.true;
      });
      it('#_parseInitSlotsForElement should be called with param element', function () {
        expect(spyInitializerParseInitSlotsForElement.calledWith(element)).to.be.true;
      });
      it('#parseInitSlotsForContext should be called twice', function () {
        expect(spyInitializerParseInitSlotsForContext.calledThrice).to.be.true;
      });
      it('#parseInitSlotsForContext should be called with param child.Context', function () {
        expect(spyInitializerParseInitSlotsForContext.calledWith(child.Context)).to.be.true;
      });

      it('#parseInitSlotsForContext should be called with param childChild.Context', function () {
        expect(spyInitializerParseInitSlotsForContext.calledWith(childChild.Context)).to.be.true;
      });
    });
    describe('integrated cubx-core-init', function () {
      function initSlot (parent, name, value) {
        var initSlotEl = document.createElement('cubx-core-slot-init');
        initSlotEl.setSlot(name);
        initSlotEl.innerHTML = JSON.stringify(value);
        parent.appendChild(initSlotEl);
      }

      var element;
      var child;
      var child2;
      /* eslint-disable no-unused-vars */
      var stubIsInputSlot;
      /* eslint-enable no-unused-vars */
      beforeEach(function () {
        initializer._initList = [];
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-parent');
        element = new constructor();

        var initEl = document.createElement('cubx-core-init');
        element.appendChild(initEl);
        initEl.appendChild(document.createElement('br'));
        initSlot(initEl, 'slotA', 'a');
        initEl.appendChild(document.createElement('br'));
        initSlot(initEl, 'slotB', 'b');

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child');
        child = new constructor();
        child.Context.setParent(element.Context);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child2');
        child2 = new constructor();
        child2.Context.setParent(element.Context);
        stubIsInputSlot = sinon.stub(element, 'isInputSlot').callsFake(function () {
          return true;
        });

        initializer.parseInitSlotsForContext(element.Context);
      });
      afterEach(function () {
        element.isInputSlot.restore();
        initializer._initList = [];
      });
      it('initializer._initList should have length = 2', function () {
        initializer._initList.should.have.length(2);
      });
      it('first element ', function () {
        initializer._initList[ 0 ].should.have.property('_slot', 'slotA');
        initializer._initList[ 0 ].should.have.property('_value', 'a');
        initializer._initList[ 0 ].should.have.property('_component');
        initializer._initList[ 0 ].should.have.property('_context');
      });
      it('second element', function () {
        initializer._initList[ 1 ].should.have.property('_slot', 'slotB');
        initializer._initList[ 1 ].should.have.property('_value', 'b');
        initializer._initList[ 1 ].should.have.property('_component');
        initializer._initList[ 1 ].should.have.property('_context');
      });
    });
  });
  describe('#_parseInitSlotsForElement', function () {
    function initSlot (parent, name, value) {
      var initSlotEl = document.createElement('cubx-core-slot-init');
      initSlotEl.setSlot(name);
      initSlotEl.innerHTML = JSON.stringify(value);
      parent.appendChild(initSlotEl);
    }

    describe('init compound (outer)', function () {
      var element;
      var child;
      var child2;
      /* eslint-disable no-unused-vars */
      var stubIsInputSlot;
      /* eslint-enable no-unused-vars */
      beforeEach(function () {
        initializer._initList = [];
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-parent');
        element = new constructor();

        var initEl = document.createElement('cubx-core-init');
        element.appendChild(initEl);
        initSlot(initEl, 'slotA', 'a');
        initSlot(initEl, 'slotB', 'b');

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child');
        child = new constructor();
        child.Context.setParent(element.Context);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child2');
        child2 = new constructor();
        child2.Context.setParent(element.Context);
        stubIsInputSlot = sinon.stub(element, 'isInputSlot').callsFake(function () {
          return true;
        });

        initializer._parseInitSlotsForElement(element, element.Context);
      });
      afterEach(function () {
        element.isInputSlot.restore();
        initializer._initList = [];
      });
      it('initializer._initList should have length = 2', function () {
        initializer._initList.should.have.length(2);
      });
      it('first element ', function () {
        initializer._initList[ 0 ].should.have.property('_slot', 'slotA');
        initializer._initList[ 0 ].should.have.property('_value', 'a');
        initializer._initList[ 0 ].should.have.property('_component');
        initializer._initList[ 0 ].should.have.property('_context');
      });
      it('second element', function () {
        initializer._initList[ 1 ].should.have.property('_slot', 'slotB');
        initializer._initList[ 1 ].should.have.property('_value', 'b');
        initializer._initList[ 1 ].should.have.property('_component');
        initializer._initList[ 1 ].should.have.property('_context');
      });
    });
    describe('init compound (outer) with forign html elements in <cubx-core-init>', function () {
      var element;
      var child;
      var child2;
      /* eslint-disable no-unused-vars */
      var stubIsInputSlot;
      /* eslint-enable no-unused-vars */
      beforeEach(function () {
        initializer._initList = [];
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-parent');
        element = new constructor();

        var initEl = document.createElement('cubx-core-init');
        element.appendChild(initEl);
        element.appendChild(document.createElement('br'));
        initSlot(initEl, 'slotA', 'a');
        element.appendChild(document.createElement('br'));
        initSlot(initEl, 'slotB', 'b');

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child');
        child = new constructor();
        child.Context.setParent(element.Context);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child2');
        child2 = new constructor();
        child2.Context.setParent(element.Context);
        stubIsInputSlot = sinon.stub(element, 'isInputSlot').callsFake(function () {
          return true;
        });

        initializer._parseInitSlotsForElement(element, element.Context);
      });
      afterEach(function () {
        element.isInputSlot.restore();
        initializer._initList = [];
      });
      it('initializer._initList should have length = 2', function () {
        initializer._initList.should.have.length(2);
      });
      it('first element ', function () {
        initializer._initList[ 0 ].should.have.property('_slot', 'slotA');
        initializer._initList[ 0 ].should.have.property('_value', 'a');
        initializer._initList[ 0 ].should.have.property('_component');
        initializer._initList[ 0 ].should.have.property('_context');
      });
      it('second element', function () {
        initializer._initList[ 1 ].should.have.property('_slot', 'slotB');
        initializer._initList[ 1 ].should.have.property('_value', 'b');
        initializer._initList[ 1 ].should.have.property('_component');
        initializer._initList[ 1 ].should.have.property('_context');
      });
    });
    describe('init compound (outer) and child (first level) compounds', function () {
      var element;
      var child;
      var child2;
      /* eslint-disable no-unused-vars */
      var stubIsInputSlotElement;
      var stubIsInputSlotChild;
      var stubIsInputSlotChild2;
      var stubgetComponentCacheEntry;
      /* eslint-enable no-unused-vars */
      beforeEach(function () {
        stubgetComponentCacheEntry =
          sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
            return { id: key };
          });
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-parent');
        element = new constructor();

        var initEl = document.createElement('cubx-core-init');
        element.appendChild(initEl);
        initSlot(initEl, 'slotA', 'a', 0);
        initSlot(initEl, 'slotB', 'b', 1);

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child');
        child = new constructor();
        child.setAttribute('member-index', 1);
        child.Context.setParent(element.Context);
        element.appendChild(child);
        initEl = document.createElement('cubx-core-init');
        child.appendChild(initEl);
        initSlot(initEl, 'slotC', 'c', 0);
        initSlot(initEl, 'slotD', 'd', 1);

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child2');
        child2 = new constructor();
        child.setAttribute('member-index', 2);
        child2.Context.setParent(element.Context);
        element.appendChild(child2);
        initEl = document.createElement('cubx-core-init');
        child2.appendChild(initEl);
        initSlot(initEl, 'slotE', 'e', 0);
        initSlot(initEl, 'slotF', 'f', 1);
        stubIsInputSlotElement = sinon.stub(element, 'isInputSlot').callsFake(function () {
          return true;
        });
        stubIsInputSlotChild = sinon.stub(child, 'isInputSlot').callsFake(function () {
          return true;
        });
        stubIsInputSlotChild2 = sinon.stub(child2, 'isInputSlot').callsFake(function () {
          return true;
        });
        initializer._parseInitSlotsForElement(element, element.Context);
      });
      afterEach(function () {
        element.isInputSlot.restore();
        child.isInputSlot.restore();
        child2.isInputSlot.restore();
        initializer._initList = [];
        window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      });
      it('initializer._initList should have length = 2', function () {
        initializer._initList.should.have.length(2);
      });
      it('first element ', function () {
        var item = initializer._initList[ 0 ];
        item.should.have.property('_slot', 'slotA');
        item.should.have.property('_value', 'a');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
      it('second element', function () {
        var item = initializer._initList[ 1 ];
        item.should.have.property('_slot', 'slotB');
        item.should.have.property('_value', 'b');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
    });
    describe('init compound (outer) and child (first level) elementary', function () {
      var element;
      var child;
      var child2;
      /* eslint-disable no-unused-vars */
      var stubIsInputSlotElement;
      var stubGetComponentCacheEntry;
      /* eslint-enable no-unused-vars */
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-parent');
        element = new constructor();
        initializer._initList = [];
        var initEl = document.createElement('cubx-core-init');
        element.appendChild(initEl);
        initSlot(initEl, 'slotA', 'a');
        initSlot(initEl, 'slotB', 'b');

        child = document.createElement('ciftest-child-elementary1');
        child.setAttribute('member-id', '1');
        child.isInputSlot = function () {
          return true;
        };
        element.appendChild(child);
        initEl = document.createElement('cubx-core-init');
        child.appendChild(initEl);
        initSlot(initEl, 'slotC', 'c');
        initSlot(initEl, 'slotD', 'd');

        child2 = document.createElement('ciftest-child-elementary2');
        child2.setAttribute('member-id', '1');
        child2.isInputSlot = function () {
          return true;
        };
        element.appendChild(child2);
        initEl = document.createElement('cubx-core-init');
        child2.appendChild(initEl);
        initSlot(initEl, 'slotE', 'e');
        initSlot(initEl, 'slotF', 'f');

        stubIsInputSlotElement = sinon.stub(element, 'isInputSlot').callsFake(function () {
          return true;
        });

        stubGetComponentCacheEntry =
          sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
            var obj;

            switch (key) {
              case 'ciftest-child-elementary1':
                obj = { artifactType: 'elementaryComponent' };
                break;

              case 'ciftest-child-elementary2':
                obj = { artifactType: 'elementaryComponent' };
                break;
              default:
                obj = { artifactType: 'compoundComponent' };
            }
            return obj;
          });

        initializer._parseInitSlotsForElement(element, element.Context);
      });
      afterEach(function () {
        delete window.cubx.CRC.getCache()[ 'ciftest-child-elementary1' ];
        delete window.cubx.CRC.getCache()[ 'ciftest-child-elementary2' ];
        element.isInputSlot.restore();
        initializer._initList = [];
        window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      });
      it('initializer._initList should have length = 6', function () {
        initializer._initList.should.have.length(6);
      });
      it('first element ', function () {
        var item = initializer._initList[ 0 ];
        item.should.have.property('_slot', 'slotA');
        item.should.have.property('_value', 'a');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
      it('second element', function () {
        var item = initializer._initList[ 1 ];
        item.should.have.property('_slot', 'slotB');
        item.should.have.property('_value', 'b');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
      it('third element', function () {
        var item = initializer._initList[ 2 ];
        item.should.have.property('_slot', 'slotC');
        item.should.have.property('_value', 'c');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
      it('fourth element', function () {
        var item = initializer._initList[ 3 ];
        item.should.have.property('_slot', 'slotD');
        item.should.have.property('_value', 'd');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
      it('fifth element', function () {
        var item = initializer._initList[ 4 ];
        item.should.have.property('_slot', 'slotE');
        item.should.have.property('_value', 'e');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
      it('sixth element', function () {
        var item = initializer._initList[ 5 ];
        item.should.have.property('_slot', 'slotF');
        item.should.have.property('_value', 'f');
        item.should.have.property('_component');
        item.should.have.property('_context');
      });
    });

    describe('not init Slot if this not an input Slot ', function () {
      var element;
      var child;
      var child2;
      /* eslint-disable no-unused-vars */
      var stubIsInputSlot;
      /* eslint-enable no-unused-vars */
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-parent');
        element = new constructor();

        var initEl = document.createElement('cubx-core-init');
        element.appendChild(initEl);
        initSlot(initEl, 'slotA', 'a');
        initSlot(initEl, 'slotB', 'b');

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child');
        child = new constructor();
        child.Context.setParent(element.Context);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-child2');
        child2 = new constructor();
        child2.Context.setParent(element.Context);
        stubIsInputSlot = sinon.stub(element, 'isInputSlot').callsFake(function () {
          return false;
        });
        initializer._initList = [];
        initializer._parseInitSlotsForElement(element, element.Context);
      });
      afterEach(function () {
        element.isInputSlot.restore();
        initializer._initList = [];
      });
      it('initializer._initList should have length = 0', function () {
        initializer._initList.should.have.length(0);
      });
    });
  });
  describe('#_addAllInitSlotEntriesToInitList', function () {
    function initSlot (name, value) {
      var initSlotEl = document.createElement('cubx-core-slot-init');
      initSlotEl.setSlot(name);
      initSlotEl.innerHTML = JSON.stringify(value);
      return initSlotEl;
    }

    var stubAddSlotInitializierungToInitList;
    var element;
    var context;
    var initSlotElements;
    beforeEach(function () {
      initSlotElements = [];
      initSlotElements.push(initSlot('slotA', 'a', 0));
      initSlotElements.push(initSlot('slotB', 'b', 1));
      initializer._initList = [];
      stubAddSlotInitializierungToInitList =
        sinon.stub(initializer, '_addInitSlotEntryToInitList').callsFake(function (element, context, initElement) {
          // do nothing
        });
      element = document.createElement('test');
      context = { foo: 'bar' };
      initializer._addAllInitSlotEntriesToInitList(element, context, initSlotElements);
    });
    afterEach(function () {
      initializer._initList = [];
      initializer._addInitSlotEntryToInitList.restore();
    });
    it('#_addInitSlotEntryToInitList should be called twice', function () {
      expect(stubAddSlotInitializierungToInitList.calledTwice).to.be.true;
    });
    it('#_addInitSlotEntryToInitList should be called with the first element of the list', function () {
      expect(stubAddSlotInitializierungToInitList.calledWith(element, context, initSlotElements[ 0 ])).to.be.true;
    });
    it('#_addInitSlotEntryToInitList should be called with the second element of the list', function () {
      expect(stubAddSlotInitializierungToInitList.calledWith(element, context, initSlotElements[ 1 ])).to.be.true;
    });
  });
  describe('#_addInitSlotEntryToInitList', function () {
    var element;
    var context;
    var initSlotEl;
    beforeEach(function () {
      initSlotEl = document.createElement('cubx-core-slot-init');
      initSlotEl.setSlot('slotA');
      initSlotEl.innerHTML = JSON.stringify('a');

      initializer._initList = [];

      element = document.createElement('test');
      element.isInputSlot = function () {
        return true;
      };

      context = { foo: 'bar' };

      initializer._addInitSlotEntryToInitList(element, context, initSlotEl);
    });
    afterEach(function () {
      initializer._initList = [];
    });
    it('initializer._initList should have one element', function () {
      initializer._initList.should.have.length(1);
    });
    it('initializer._initList[0] should be of type Initializer.SlotInit', function () {
      initializer._initList[ 0 ].should.be.instanceOf(window.cubx.cif.Initializer.SlotInit);
    });
    it('cubx-cor-slot-init element should have a property processed (true)', function () {
      initSlotEl.should.have.property('processed', true);
    });
  });

  describe('#_isElementaryComponent', function () {
    /* eslint-disable no-unused-vars */
    var manifestStub;
    /* eslint-enable no-unused-vars */
    var element;
    beforeEach(function () {
      element = document.createElement('test-element');
    });
    describe('the manifest.component the attribute type: \'elementary\' contains', function () {
      beforeEach(function () {
        manifestStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return {
            artifactType: 'elementaryComponent'
          };
        });
      });
      afterEach(function () {
        window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      });
      it('should be true', function () {
        expect(initializer._isElementaryComponent(element)).to.be.true;
      });
    });
    describe('the manifest.component a type !=\'elementary\' contains', function () {
      beforeEach(function () {
        manifestStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return {
            type: '_afterCreatedElementsReady'
          };
        });
      });
      afterEach(function () {
        window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      });
      it('should be true', function () {
        expect(initializer._isElementaryComponent(element)).to.be.false;
      });
    });
    describe('the manifest.component not exists', function () {
      beforeEach(function () {
        manifestStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function () {
          return null;
        });
      });
      afterEach(function () {
        window.cubx.CRC.getCache().getComponentCacheEntry.restore();
      });
      it('should be true', function () {
        expect(initializer._isElementaryComponent(element)).to.be.false;
      });
    });
    describe('no argument', function () {
      it('should be true', function () {
        expect(initializer._isElementaryComponent()).to.be.false;
      });
    });
  });

  describe('#_isConnectionElement', function () {
    var element;
    var connectionElements;
    var connectionsElements;
    beforeEach(function () {
      element = document.createElement('test-element');
      connectionsElements = document.createElement('cubx-core-connections');
      connectionElements = document.createElement('cubx-core-connection');
    });

    it('should be false for other elements ', function () {
      expect(initializer._isConnectionElement(element)).to.be.false;
    });
    it('should be false if element missed', function () {
      expect(initializer._isConnectionElement()).to.be.false;
    });
    it('should be true for cubx-core-connections elements ', function () {
      expect(initializer._isConnectionElement(connectionElements)).to.be.true;
    });
    it('should be true for cubx-core-connections elements ', function () {
      expect(initializer._isConnectionElement(connectionsElements)).to.be.true;
    });
  });
  describe('#_initSlot', function () {
    var componentSetInputSlotStub;
    var slotname;
    var value;
    var payload;
    beforeEach(function () {
      slotname = 'example';
      value = 'aaa';
      payload = {
        slot: slotname,
        payload: value,
        connectionHook: null
      };
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
      var element = new constructor();
      var initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 1);
      initElement.setAttribute('slot', slotname);
      initElement.innerHTML = '"' + value + '"';
      var init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);

      componentSetInputSlotStub = sinon.stub(element, 'setInputSlot').callsFake(function (slot, payloadObject) {
        // do nothing
      });
      initializer._initSlot(init);
    });
    afterEach(function () {

    });
    it('the #setInputSlot method of the component should be called once', function () {
      expect(componentSetInputSlotStub.calledOnce).to.be.true;
    });
    it('the #setInputSlot method of the component should be called with arguments slotname and payload',
      function () {
        expect(componentSetInputSlotStub.withArgs(slotname, payload).calledOnce).to.be.true;
      });
  });
  describe('#initSlots', function () {
    var _initSlotStub;
    beforeEach(function () {
      initializer._initList = [];
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
      var element = new constructor();
      var initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 1);
      initElement.setAttribute('slot', 'example');
      initElement.innerHTML = '"aaa"';
      var init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
      element = new constructor();
      initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 1);
      initElement.setAttribute('slot', 'example');
      initElement.innerHTML = '"ddd"';
      init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test2');
      element = new constructor();
      initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 2);
      initElement.setAttribute('slot', 'example');
      initElement.innerHTML = '"bbb"';
      init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
      element = new constructor();
      initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 2);
      initElement.setAttribute('slot', 'example');
      initElement.innerHTML = '"ccc"';
      init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);

      _initSlotStub = sinon.stub(initializer, '_initSlot').callsFake(function () {
        // do nothing
      });
      initializer.initSlots();
    });
    afterEach(function () {
      initializer._initSlot.restore();
    });
    it('the #_initSlot Method should call forth', function () {
      expect(_initSlotStub.callCount).to.be.equals(4);
    });
    it('initList should have the length 4', function () {
      initializer._initList.should.have.length(4);
    });
  });

  describe('#resetInitList', function () {
    beforeEach(function () {
      initializer._initList = [];
      initializer._initList.push({dummy: 'slotinit1'});
      initializer._initList.push({dummy: 'slotinit2'});
    });
    it('should be the initList reseted', function () {
      initializer._initList.should.have.length(2);
      initializer.resetInitList();
      initializer._initList.should.have.length(0);
    });
  });
  describe('#sortInitList', function () {
    var spy;
    var origInitList;
    beforeEach(function () {
      initializer._initList = [];
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
      var element = new constructor();
      var initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 1);
      initElement.setAttribute('slot', 'example');
      initElement.setAttribute('order', 1);
      initElement.innerHTML = '"aaa"';
      var init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test2');
      element = new constructor();
      initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 2);
      initElement.setAttribute('slot', 'example');
      initElement.setAttribute('order', 4);
      initElement.innerHTML = '"bbb"';
      init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
      element = new constructor();
      initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 2);
      initElement.setAttribute('slot', 'example');
      initElement.setAttribute('order', 5);
      initElement.innerHTML = '"ccc"';
      init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
      element = new constructor();
      initElement = document.createElement('cubx-core-slot-init');
      initElement.setAttribute('deeplevel', 1);
      initElement.setAttribute('slot', 'example');
      initElement.setAttribute('order', 2);
      initElement.innerHTML = '"ddd"';
      init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
      initializer._initList.push(init);
      origInitList = initializer._initList;
      spy = sinon.spy(initializer, '_sortInitList');
      initializer.sortInitList();
    });

    afterEach(function () {
      initializer._initList = [];
      initializer._sortInitList.restore();
      origInitList = [];
    });
    it('the _sortInitList method should be called once', function () {
      expect(spy.calledOnce).to.be.true;
      expect(spy.withArgs(origInitList).calledOnce).to.be.true;
    });
    it('the _initList method should be sorted', function () {
      expect(initializer._initList).to.have.length(4);
      var init = initializer._initList[ 0 ];
      init.should.have.property('_order', 4);
      init.should.have.property('_deepLevel', 2);
      init = initializer._initList[ 1 ];
      init.should.have.property('_order', 5);
      init.should.have.property('_deepLevel', 2);
      init = initializer._initList[ 2 ];
      init.should.have.property('_order', 1);
      init.should.have.property('_deepLevel', 1);
      init = initializer._initList[ 3 ];
      init.should.have.property('_order', 2);
      init.should.have.property('_deepLevel', 1);
    });
  });

  describe('#_sortInitList', function () {
    describe('without internal init', function () {
      beforeEach(function () {
        initializer._initList = [];
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
        var element = new constructor();
        var initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 1);
        initElement.setAttribute('deeplevel', 1);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"aaa"';
        var init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test2');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 4);
        initElement.setAttribute('deeplevel', 2);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"bbb"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 5);
        initElement.setAttribute('deeplevel', 2);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"ccc"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 2);
        initElement.setAttribute('deeplevel', 1);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"ddd"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);
      });

      it('the _initList method should be sorted', function () {
        var sortedList = initializer._sortInitList(initializer._initList);
        expect(sortedList).to.have.length(4);
        var init = sortedList[ 0 ];
        init.should.have.property('_order', 4);
        init.should.have.property('_deepLevel', 2);
        init = sortedList[ 1 ];
        init.should.have.property('_order', 5);
        init.should.have.property('_deepLevel', 2);
        init = sortedList[ 2 ];
        init.should.have.property('_order', 1);
        init.should.have.property('_deepLevel', 1);
        init = sortedList[ 3 ];
        init.should.have.property('_order', 2);
        init.should.have.property('_deepLevel', 1);
      });
    });
    describe('with internal init', function () {
      beforeEach(function () {
        initializer._initList = [];

        var constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
        var element = new constructor();
        var initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 1);
        initElement.setAttribute('deeplevel', 1);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"1"';
        var init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        // 2
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test2');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 4);
        initElement.setAttribute('deeplevel', 2);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"2"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        // 3
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 5);
        initElement.setAttribute('deeplevel', 2);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"3"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        // 4
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 2);
        initElement.setAttribute('deeplevel', 1);
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"4"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        // 5
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test3');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 2);
        initElement.setAttribute('deeplevel', 1);
        initElement.setAttribute('type', 'internal');
        initElement.setAttribute('slot', 'example');
        initElement.innerHTML = '"5"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        // 6
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 1);
        initElement.setAttribute('deeplevel', 1);
        initElement.setAttribute('slot', 'example');
        initElement.setAttribute('type', 'internal');
        initElement.innerHTML = '"6"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        // 7
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 4);
        initElement.setAttribute('deeplevel', 2);
        initElement.setAttribute('slot', 'example');
        initElement.setAttribute('type', 'internal');
        initElement.innerHTML = '"7"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);

        // 8
        constructor = cif.getCompoundComponentElementConstructor('ciftest-initializer-test');
        element = new constructor();
        initElement = document.createElement('cubx-core-slot-init');
        initElement.setAttribute('order', 5);
        initElement.setAttribute('deeplevel', 2);
        initElement.setAttribute('slot', 'example');
        initElement.setAttribute('type', 'internal');
        initElement.innerHTML = '"8"';
        init = new window.cubx.cif.Initializer.SlotInit(element, element.Context, initElement);
        initializer._initList.push(init);
      });

      it('the _initList method should be sorted', function () {
        var sortedList = initializer._sortInitList(initializer._initList);

        expect(sortedList).to.have.length(8);
        // 7
        var init = sortedList[ 0 ];
        init.should.have.property('_order', 4);
        init.should.have.property('_deepLevel', 2);
        init.should.have.property('_internal', true);
        // 8
        init = sortedList[ 1 ];
        init.should.have.property('_order', 5);
        init.should.have.property('_deepLevel', 2);
        init.should.have.property('_internal', true);

        // 2
        init = sortedList[ 2 ];
        init.should.have.property('_order', 4);
        init.should.have.property('_deepLevel', 2);
        init.should.have.property('_internal', null);

        // 3
        init = sortedList[ 3 ];
        init.should.have.property('_order', 5);
        init.should.have.property('_deepLevel', 2);
        init.should.have.property('_internal', null);

        //  6
        init = sortedList[ 4 ];
        init.should.have.property('_order', 1);
        init.should.have.property('_deepLevel', 1);
        init.should.have.property('_internal', true);

        //  5
        init = sortedList[ 5 ];
        init.should.have.property('_order', 2);
        init.should.have.property('_deepLevel', 1);
        init.should.have.property('_internal', true);

        // 1
        init = sortedList[ 6 ];
        init.should.have.property('_order', 1);
        init.should.have.property('_deepLevel', 1);
        init.should.have.property('_internal', null);

        // 4
        init = sortedList[ 7 ];
        init.should.have.property('_order', 2);
        init.should.have.property('_deepLevel', 1);
        init.should.have.property('_internal', null);
      });
    });
  });
});
