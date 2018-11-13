'use strict';

describe('CIF', function () {
  var cif;

  before(function () {
    cif = window.cubx.cif.cif;
  });
  describe('#CIF()', function () {
    it('should create a new cif object', function () {
      // Could not test, becose constructor in a closure defined.
    });
    it('the in windows stored cif object has all important attributes', function () {
      // Could not test, becose constructor in a closure defined.
      expect(cif._initializer).to.be.exist;
      expect(cif._initializer).to.be.an('object');
      expect(cif._initializer).to.be.instanceOf(window.cubx.cif.Initializer);
    });
  });
  describe('#_initSlots', function () {
    var container;
    var rootContextInitSlotsStub;
    var rootContext;
    var originRootContext;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      originRootContext = container.Context;
      rootContext = window.cubx.cif.cif.createRootContext(container);
      window.cubx.cif.cif._rootContext = rootContext;
      rootContextInitSlotsStub = sinon.stub(rootContext, 'collectSlotInits').callsFake(function () {
        // do nothing
      });
    });

    afterEach(function () {
      rootContext.collectSlotInits.restore();
      window.cubx.cif.cif._rootContext = originRootContext;
    });

    it('context.initSlots should be called once ', function () {
      cif._initSlots(container);

      expect(rootContextInitSlotsStub.calledOnce).to.be.true;
    });
  });
  describe('#_createInitElements', function () {
    var container;
    var compoundEl;
    var subElement1;
    var subElement2;
    var spy;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
      compoundEl = new constructor();
      container.appendChild(compoundEl);
      compoundEl.Context.setParent(container.Context);
      container.Context.addComponent(compoundEl);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
      subElement1 = new constructor();
      subElement1.setAttribute('member-id', '1');
      subElement1.Context.setParent(compoundEl.Context);
      compoundEl.appendChild(subElement1);
      subElement1.Context.setParent(compoundEl.Context);
      compoundEl.Context.addComponent(subElement1);
      compoundEl.Context.addComponent(subElement1);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
      subElement2 = new constructor();
      subElement2.setAttribute('member-id', '2');
      compoundEl.appendChild(subElement2);
      subElement2.Context.setParent(compoundEl.Context);
      compoundEl.Context.addComponent(subElement2);
      subElement2.Context.setParent(compoundEl.Context);
      compoundEl.Context.addComponent(subElement2);
      var inits = [ {
        memberIdRef: '2',
        slot: 'testinput',
        value: 'bbb'
      }, {
        value: 'aaa',
        slot: 'testinput'
      } ];
      compoundEl._inits = inits;
      spy = sinon.spy(cif, '_createSlotInitElement');
    });
    afterEach(function () {
      cif._createSlotInitElement.restore();
      container.removeChild(compoundEl);
      container.Context._children = [];
      container.Context._components = [];
    });

    it('Init Tags should be created under source Elements', function () {
      cif._createInitElements(compoundEl);
      compoundEl.firstElementChild.tagName.should.equals('CUBX-CORE-INIT');
      subElement2.firstElementChild.tagName.should.equals('CUBX-CORE-INIT');
      expect(spy.calledTwice).to.be.true;
    });
    it('_inits propert should be renamed to _createdInits after createin initSlots elements', function () {
      compoundEl.should.have.property('_inits');
      var compoundElInits = compoundEl._inits;
      cif._createInitElements(compoundEl);
      compoundEl.should.not.have.property('_inits');
      compoundEl.should.have.deep.property('_createdInits', compoundElInits);
    });
  });
  describe('#_createSlotInitElement', function () {
    var container;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
    });
    describe('initialise member slot', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        subElement1._deeplevel = 0;
        compoundEl.appendChild(subElement1);
        compoundEl.Context.addComponent(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        subElement2._deeplevel = 0;
        compoundEl.appendChild(subElement2);
        compoundEl.Context.addComponent(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('cubx-core-slot-init Tag should be created under member Element', function () {
        var inits = {
          memberIdRef: '1', value: 'aaa', slot: 'testinput'
        };

        cif._createSlotInitElement(compoundEl, inits, 50);

        var member1 = compoundEl.firstElementChild;

        member1.firstElementChild.should.have.property('tagName', 'CUBX-CORE-INIT');
        var initEl = member1.firstElementChild;
        expect(initEl.childElementCount).to.be.equals(1);
        initEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-SLOT-INIT');
        var initSlot = initEl.firstElementChild;
        initSlot.attributes.should.be.length(3);
        initSlot.getAttribute('slot').should.be.equals(inits.slot);
        initSlot.getAttribute('order').should.be.equals('50');
        initSlot.getAttribute('deeplevel').should.be.equals('0');
        expect(initSlot.innerHTML).to.be.equals('"' + inits.value + '"');
      });
    });

    describe('initialise own slot', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl._deeplevel = 0;
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-index', 1);
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-index', 2);
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('cubx-core-slot Tag should be created', function () {
        var init = {
          value: 'aaa', slot: 'testinput'
        };

        cif._createSlotInitElement(compoundEl, init, 50);

        compoundEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-INIT');
        var initEl = compoundEl.firstElementChild;
        expect(initEl.childElementCount).to.be.equals(1);
        initEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-SLOT-INIT');
        var initSlot = initEl.firstElementChild;
        initSlot.attributes.should.be.length(4);
        initSlot.getAttribute('slot').should.be.equals(init.slot);
        initSlot.getAttribute('order').should.be.equals('50');
        initSlot.getAttribute('type').should.be.equals('internal');
        initSlot.getAttribute('deeplevel').should.be.equals('0');
        expect(initSlot.innerHTML).to.be.equals('"' + init.value + '"');
      });
    });
  });
});
