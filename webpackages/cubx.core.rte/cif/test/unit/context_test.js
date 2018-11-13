'use strict';

describe('Context', function () {
  var cif;
  var eventFactory;
  var initializer;
  before(function () {
    cif = window.cubx.cif.cif;
    eventFactory = new window.cubx.EventFactory();
    initializer = cif.getInitializer();
  });
  describe('#Context()', function () {
    var container;
    var element;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
    });
    afterEach(function () {
      container.removeChild(element);
    });
    it('should create a new Context object without parent', function () {
      var context = element.Context;
      expect(context._parent).to.be.null;
      context._children.should.be.empty;
      context._rootElement.should.be.nested.equals(element);
      context._components.should.be.empty;
      context._connectionMgr.should.be.not.empty;
      context._connectionMgr.should.be.an('object');
      context._connectionMgr.should.be.an.instanceof(window.cubx.cif.ConnectionManager);
    });
  });
  describe('#setParent', function () {
    var container;
    var element;
    var childElement;
    var childContext;
    var parentContext;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      parentContext = element.Context;
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child');
      childElement = new constructor();
      element.appendChild(childElement);
      childContext = childElement.Context;
    });
    afterEach(function () {
      element.removeChild(childElement);
      container.removeChild(element);
    });
    it('childContext_parent and parentConext._children[childContext]  should be set ', function () {
      expect(childContext._parent).to.be.null;
      parentContext._children.should.have.length(0);
      childContext.setParent(parentContext);
      childContext._parent.should.be.nested.equals(parentContext);
      parentContext._children.should.have.length(1);
      parentContext.should.have.nested.property('_children[0]', childContext);
    });
  });
  describe('#getRootElement', function () {
    var container;
    var element;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
    });
    afterEach(function () {
      container.removeChild(element);
    });
    it('getRootElement get the content of _rootElement', function () {
      var context = element.Context;
      context.getRootElement().should.be.nested.equals(context._rootElement);
    });
  });
  describe('#getComponents', function () {
    var container;
    var element;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      var subElement = document.createElement('subElemnet');
      element.appendChild(subElement);
      var subElement2 = document.createElement('subElemnet2');
      element.appendChild(subElement2);
    });
    afterEach(function () {
      container.removeChild(element);
    });
    it('getRootElement get the content of _rootElement', function () {
      var context = element.Context;
      context.getComponents().should.be.eql(context._components);
    });
  });
  describe('#getChildren', function () {
    var container;
    var element;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-sub-element');
      var subElement = new constructor();
      element.appendChild(subElement);
      subElement.Context.setParent(element.Context);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-sub-element2');
      var subElement2 = new constructor();
      element.appendChild(subElement2);
      subElement2.Context.setParent(subElement.Context);
    });
    afterEach(function () {
      container.removeChild(element);
    });
    it('getRootElement get the content of _rootElement', function () {
      var context = element.Context;
      context.getChildren().should.be.eql(context._children);
    });
  });
  describe('#addComponent', function () {
    var container;
    var element;
    var context;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      context = element.Context;
    });
    afterEach(function () {
      container.removeChild(element);
    });
    it('argument in addComponent should be contained in "_components" array', function () {
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child');
      var childElement = new constructor();
      context._components.should.be.empty;
      context.addComponent(childElement);
      context._components.should.have.length(1);
      context.should.have.nested.property('_components[0]', childElement);
    });
  });
  describe('#setReady', function () {
    var container;
    var element;
    var parentcontext;
    var subcontext;
    var subsubcontext;
    var subelement;
    var subsubelement;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      parentcontext = element.Context;
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child');
      subelement = new constructor();
      element.appendChild(subelement);
      subcontext = subelement.Context;
      subcontext.setParent(parentcontext);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child-child');
      subsubelement = new constructor();
      subelement.appendChild(subsubelement);
      subsubcontext = subsubelement.Context;
      subsubcontext.setParent(subcontext);
    });
    afterEach(function () {
      subelement.removeChild(subsubelement);
      element.removeChild(subelement);
      container.removeChild(element);
    });
    it('without arguments - _ready attribute should be true for tthe context and all descendents', function () {
      expect(parentcontext._ready).to.be.false;
      expect(subcontext._ready).to.be.false;
      expect(subsubcontext._ready).to.be.false;
      parentcontext.setReady();
      expect(parentcontext._ready).to.be.true;
      expect(subcontext._ready).to.be.true;
      expect(subsubcontext._ready).to.be.true;
    });

    it('with argument true - _ready attribute should be true', function () {
      expect(parentcontext._ready).to.be.false;
      expect(subcontext._ready).to.be.false;
      expect(subsubcontext._ready).to.be.false;
      parentcontext.setReady(true);
      expect(parentcontext._ready).to.be.true;
      expect(subcontext._ready).to.be.true;
      expect(subsubcontext._ready).to.be.true;
    });
    it('with argument true - _ready attribute should be true', function () {
      parentcontext.setReady(true);

      expect(parentcontext._ready).to.be.true;
      expect(subcontext._ready).to.be.true;
      expect(subsubcontext._ready).to.be.true;
      parentcontext.setReady(false);
      expect(parentcontext._ready).to.be.false;
      expect(subcontext._ready).to.be.false;
      expect(subsubcontext._ready).to.be.false;
    });
  });
  describe('#isReady', function () {
    var container;
    var element;
    var context;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      context = element.Context;
    });
    afterEach(function () {
      container.removeChild(element);
    });
    it('isReady get the content of attribute _ready', function () {
      expect(context.isReady()).to.be.equals(context._ready);
      context.setReady(true);
      expect(context.isReady()).to.be.equals(context._ready);
    });
  });
  describe('#initConnections', function () {
    var container;
    var element;
    var parentContext;
    var subContext;
    var subSubContext;
    var subelement;
    var subsubelement;
    var stubParentContext;
    var stubSubContext;
    var stubSubSubContext;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      parentContext = element.Context;
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child');
      subelement = new constructor();
      element.appendChild(subelement);
      subContext = subelement.Context;
      subContext.setParent(parentContext);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child-child');
      subsubelement = new constructor();
      subelement.appendChild(subsubelement);
      subSubContext = subsubelement.Context;
      subSubContext.setParent(subContext);
      stubParentContext = sinon.stub(parentContext, '_initConnections').callsFake(function () {
        // do nothing
      });
      stubSubContext = sinon.stub(subContext, '_initConnections').callsFake(function () {
        // do nothing
      });
      stubSubSubContext = sinon.stub(subSubContext, '_initConnections').callsFake(function () {
        // do nothing
      });
    });
    afterEach(function () {
      subelement.removeChild(subsubelement);
      element.removeChild(subelement);
      container.removeChild(element);
    });

    it('_initConnections should be call', function () {
      parentContext.initConnections();
      expect(stubParentContext.calledOnce).to.be.true;
      expect(stubSubContext.calledOnce).to.be.true;
      expect(stubSubSubContext.calledOnce).to.be.true;
    });
  });
  describe('#collectSlotInits', function () {
    var container;
    var element;
    var child;
    var lastChild;
    var spyParentContextInitSlots;
    var spyChildContextInitSlots;
    var spyLastChildContextInitSlots;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child');
      child = new constructor();
      element.appendChild(child);
      child.Context.setParent(element.Context);
      constructor = cif.getCompoundComponentElementConstructor('ciftest-context-lastchild');
      lastChild = new constructor();
      child.appendChild(lastChild);
      lastChild.Context.setParent(child.Context);
      spyParentContextInitSlots = sinon.spy(element.Context, '_collectSlotInits');
      spyChildContextInitSlots = sinon.spy(child.Context, 'collectSlotInits');
      spyLastChildContextInitSlots = sinon.spy(lastChild.Context, 'collectSlotInits');
      element.Context.collectSlotInits();
    });
    afterEach(function () {
      element.Context._collectSlotInits.restore();
      child.Context.collectSlotInits.restore();
      lastChild.Context.collectSlotInits.restore();
      container.removeChild(element);
    });

    it('#_collectSlotInits for the context to be called', function () {
      expect(spyParentContextInitSlots.calledOnce).to.be.true;
    });
    it('#collectSlotInits for the child context to be called', function () {
      expect(spyChildContextInitSlots.called).to.be.false;
    });
    it('#collectSlotInits for the context to be called', function () {
      expect(spyLastChildContextInitSlots.called).to.be.false;
    });
  });
  describe('#_collectSlotInits', function () {
    var element;
    var spy;
    beforeEach(function () {
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      spy = sinon.spy(initializer, 'parseInitSlotsForContext');
      element.Context._collectSlotInits(cif);
    });
    afterEach(function () {
      window.cubx.cif.cif.getInitializer().parseInitSlotsForContext.restore();
    });
    it('Initializer parseInitSlotsForContext should be called once', function () {
      expect(spy.calledOnce).to.be.true;
    });
    it('Initializer parseInitSlotsForContext should be called with parameter element.Context', function () {
      expect(spy.calledWithExactly(element.Context)).to.be.true;
    });
  });
  describe('#_handleModelChangeEvent', function () {
    var container;
    var element;
    var context;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      context = element.Context;
    });
    afterEach(function () {
      container.removeChild(element);
    });
    describe('modelChangeEvent on root', function () {
      var _handleModelChangeEventStub;
      var stopPropagationSpy;
      var event;
      var detail;
      var processConnectionsStub;

      beforeEach(function (done) {
        var innerFunction = context._handleModelChangeEvent;

        _handleModelChangeEventStub = sinon.stub(context, '_handleModelChangeEvent').callsFake(function (event) {
          innerFunction.apply(context, [ event ]);
          done();
        });
        processConnectionsStub =
          sinon.stub(context._connectionMgr, 'processConnections').callsFake(function (element, detail) {
          });
        detail = {
          payload: '{}',
          slot: 'slotname'
        };
        event = eventFactory.createEvent(window.cubx.EventFactory.types.CIF_MODEL_CHANGE, detail);
        stopPropagationSpy = sinon.spy(event, 'stopPropagation');
        element.dispatchEvent(event);
      });
      afterEach(function () {
        context._handleModelChangeEvent.restore();
        event.stopPropagation.restore();
        context._connectionMgr.processConnections.restore();
      });
      it('_handleModelChangeEvent called', function () {
        expect(_handleModelChangeEventStub.calledOnce).to.be.true;
        expect(_handleModelChangeEventStub.calledWith(event)).to.be.true;
      });

      it('connectionMgr.processConnections called', function () {
        expect(processConnectionsStub.called).to.be.false;
      });
      it('event.stopPropagate called', function () {
        expect(stopPropagationSpy.called).to.be.false;
      });
    });
    describe('modelChangeEvent on child', function () {
      var _handleModelChangeEventStub;
      var stopPropagationSpy;
      var event;
      var detail;
      var processConnectionsStub;
      var subElement;
      var subContext;
      beforeEach(function (done) {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-child');
        subElement = new constructor();
        element.appendChild(subElement);
        subContext = subElement.Context;
        subContext.setParent(context);
        var innerFunction = context._handleModelChangeEvent;
        _handleModelChangeEventStub = sinon.stub(context, '_handleModelChangeEvent').callsFake(function (event) {
          innerFunction.apply(context, [ event ]);
          done();
        });
        processConnectionsStub =
          sinon.stub(context._connectionMgr, 'processConnections').callsFake(function (element, detail) {
          });

        detail = {
          payload: '{}',
          slot: 'xxxslotname'
        };
        event = eventFactory.createEvent(window.cubx.EventFactory.types.CIF_MODEL_CHANGE, detail);
        stopPropagationSpy = sinon.spy(event, 'stopPropagation');
        subElement.dispatchEvent(event);
      });
      afterEach(function () {
        context._handleModelChangeEvent.restore();
        event.stopPropagation.restore();
        context._connectionMgr.processConnections.restore();
      });
      it('_handleModelChangeEvent called', function () {
        expect(_handleModelChangeEventStub.calledOnce).to.be.true;
        expect(_handleModelChangeEventStub.calledWith(event)).to.be.true;
      });

      it('connectionMgr.processConnections called', function () {
        expect(processConnectionsStub.called).to.be.true;
      });
      it('event.stopPropagate called', function () {
        expect(stopPropagationSpy.called).to.be.true;
      });
    });
  });
  describe('#_registerCIFListener', function () {
    // implit tested by handler
  });
  describe('#_initConnections', function () {
    var stub;
    var container;
    var element;
    var context;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-context-parent');
      element = new constructor();
      container.appendChild(element);
      context = element.Context;
      stub = sinon.stub(context._connectionMgr, 'parseConnectionsFromComponentList').callsFake(function () {
        // do nothing
      });
      context._initConnections();
    });
    afterEach(function () {
      context._connectionMgr.parseConnectionsFromComponentList.restore();
      container.removeChild(element);
    });
    it('connectionManager.parseConnectionsFromComponentList should be called', function () {
      expect(stub.calledOnce).to.be.true;
    });
    it('connectionManager.parseConnectionsFromComponentList should be called with arguments "context._components"',
      function () {
        expect(stub.calledWith(context._components)).to.be.true;
      });
  });

  describe('#isEqual', function () {
    var Context;
    before(function () {
      Context = window.cubx.cif.Context;
    });
    it('should be not equal, if 2 instances different', function () {
      var elementOne = document.createElement('element-one');
      var contextOne = new Context(elementOne);
      var contextTwo = new Context(elementOne);
      expect(contextOne.isSame(contextTwo)).to.be.false;
    });

    it('should be equal, if the 2 instances are the same', function () {
      var elementOne = document.createElement('element-one');
      var contextOne = new Context(elementOne);
      var contextTwo = contextOne;
      expect(contextOne.isSame(contextTwo)).to.be.true;
    });
  });
});
