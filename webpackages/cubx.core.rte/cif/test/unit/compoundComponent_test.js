/* globals cache */
'use strict';

describe('CompoundComponent', function () {
  var compoundComponent;
  before(function () {
    compoundComponent = window.cubx.cif.compoundComponent;
  });

  describe('#createdCallback', function () {
    var spy;
    var ElementConstructor;
    /* eslint-disable no-unused-vars */
    var container;
    /* eslint-enable no-unused-vars */
    var element;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');

      spy = sinon.spy(compoundComponent, 'createdCallback');
      ElementConstructor = window.cubx.cif.cif.getCompoundComponentElementConstructor('ciftest-y');
    });
    it('should be called on create element', function () {
      expect(spy.called).to.be.false;
      element = new ElementConstructor();
      expect(spy.called).to.be.true;

      element.should.have.property('Context');
      element.Context._rootElement.should.have.deep.equals(element);
    });
  });
  describe('#isInputSlot', function () {
    /* eslint-disable no-unused-vars */
    var getCacheStub;
    /* eslint-enable no-unused-vars */
    var container;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
      getCacheStub = sinon.stub(window.cubx.CRC, 'getCache').callsFake(function () {
        var cache = {};
        cache.getComponentCacheEntry = function (key) {
          var manifest;
          switch (key) {
            case 'ciftest-input':
              manifest = {
                artifactType: 'compoundComponent',
                slots: [
                  {
                    slotId: 'firstslot',
                    direction: [ 'input' ]
                  }
                ]
              };
              break;
            case 'ciftest-output':
              manifest = {
                artifactType: 'compoundComponent',
                slots: [
                  {
                    slotId: 'firstslot',
                    direction: [ 'output' ]
                  }
                ]
              };
              break;
            case 'ciftest-input-output-explicite':
              manifest = {
                artifactType: 'compoundComponent',
                slots: [
                  {
                    slotId: 'firstslot',
                    direction: [ 'input', 'output' ]
                  }
                ]
              };
              break;
            case 'ciftest-input-output-implicite':
              manifest = {
                artifactType: 'compoundComponent',
                slots: [
                  {
                    slotId: 'firstslot'
                  }
                ]
              };
              break;
            default:
              manifest = {
                artifactType: 'compoundComponent'
              };
          }
          return manifest;
        };
        cache.getAllComonents = function () {
          return [];
        };
        return cache;
      });
    });
    after(function () {
      window.cubx.CRC.getCache.restore();
    });
    it('should be true if the sot is a inputslot', function () {
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor('ciftest-input');
      var el = new constructor();
      container.appendChild(el);
      expect(el.isInputSlot('firstslot')).to.be.true;
      container.removeChild(el);
    });
    it('should be false if the sot is a outputslot', function () {
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor('ciftest-output');
      var el = new constructor();
      container.appendChild(el);
      expect(el.isInputSlot('firstslot')).to.be.false;
      container.removeChild(el);
    });
    it('should be false if the sot is a input/outputslot (explicit)', function () {
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor(
        'ciftest-input-output-explicite');
      var el = new constructor();
      container.appendChild(el);
      expect(el.isInputSlot('firstslot')).to.be.true;
      container.removeChild(el);
    });
    it('should be false if the sot is a input/outputslot (explicit', function () {
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor(
        'ciftest-input-output-implicite');
      var el = new constructor();
      container.appendChild(el);
      expect(el.isInputSlot('firstslot')).to.be.true;
      container.removeChild(el);
    });
  });
  describe('#setInputSlot', function () {
    var container;
    var element;
    var stub;
    /* eslint-disable no-unused-vars */
    var getCacheStub;
    /* eslint-enable no-unused-vars */
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
      getCacheStub = sinon.stub(window.cubx.CRC, 'getCache').callsFake(function () {
        var cache = {};
        cache.getComponentCacheEntry = function (key) {
          var manifest;
          switch (key) {
            case 'ciftest-a' :
              manifest = {
                artifactType: 'compoundComponent',
                slots: [
                  {
                    slotId: 'aaa'
                  }
                ]
              };
              break;
            default:
              manifest = {
                artifactType: 'compoundComponent'
              };
          }
          return manifest;
        };
        return cache;
      });
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor('ciftest-a');
      element = new constructor();
      container.appendChild(element);
      // container.Context = new window.cubx.cif.Context(container);
      element.Context = new window.cubx.cif.Context(element, container.Context);
      stub = sinon.stub(element, 'setAaa').callsFake(function (value) {
        // do nothing
      });
    });
    after(function () {
      container.removeChild(element);
      container.Context._children = [];
      container.Context._components = [];
      // delete container.Context;
      window.cubx.CRC.getCache.restore();
      element.setAaa.restore();
    });
    it('the Method context.processInternalConnections should be called', function () {
      var slotname = 'aaa';
      var payloadObject = {
        payload: ''
      };
      element.setInputSlot(slotname, payloadObject);
      expect(stub.calledOnce).to.be.true;
      expect(stub.calledWith(payloadObject.payload)).to.be.true;
    });
  });
  describe('#fireModelChangeEvent', function () {
    /*
     fireModelChangeEvent : function(payloadObject) {
     var event = this.eventFactory.createEvent(window.cif.EventFactory.types.MODEL_CHANGE, payloadObject);
     this.dispatchEvent(event);
     }
     */
    var container;
    var element;

    var payloadObject;
    var fireModelChangeEventSpy;
    var testString;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor('ciftest-event');
      element = new constructor();
      container.appendChild(element);
      testString = 'testslot';
      payloadObject = {};
      payloadObject.payload = '{ "foo": 3 }';
      payloadObject.slot = testString;

      fireModelChangeEventSpy = sinon.spy();
      element.addEventListener(window.cubx.EventFactory.types.CIF_MODEL_CHANGE, fireModelChangeEventSpy);
    });
    afterEach(function () {
      container.removeChild(element);
      element.removeEventListener(window.cubx.EventFactory.types.CIF_MODEL_CHANGE, fireModelChangeEventSpy);
    });
    it('event should be fired', function () {
      element.fireModelChangeEvent(payloadObject);
      expect(fireModelChangeEventSpy.callCount).to.equal(1);

      // get the data from our spy call
      var spyCall = fireModelChangeEventSpy.getCall(0);

      // make sure 'foo' on the data argument is set to 'bar'
      expect(spyCall.args[ 0 ].detail).to.deep.equal(payloadObject);
    });
  });
  describe('#isCompoundComponent', function () {
    var container;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
    });
    it('should be true for created lements with CompoundComponentElementConstructor', function () {
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor('ciftest-a');
      var el = new constructor();
      container.appendChild(el);
      expect(el.isCompoundComponent).to.be.true;
      container.removeChild(el);
    });
  });
  describe('#getRuntimeId', function () {
    var container;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
    });
    it('should be true for with CompoundComponentElementConstructor created elments', function () {
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor('ciftest-runtime');
      var el = new constructor();
      container.appendChild(el);
      var runtimeId = 'com.incowia.example@1.0.0/example';
      el.setAttribute('runtime-id', runtimeId);
      expect(el.getRuntimeId()).to.be.equals(runtimeId);
      container.removeChild(el);
    });
  });
  describe('#slots', function () {
    var elem;
    var artifactId;
    var slots;
    var manifest;
    beforeEach(function () {
      artifactId = 'ciftest-slots';
      var constructor = window.cubx.cif.cif.getCompoundComponentElementConstructor(artifactId);
      elem = new constructor();
      manifest = {
        webpackageId: 'test.' + artifactId + '@0.1.0',
        artifactId: artifactId,
        artifactType: 'compoundComponent',
        slots: [
          {
            slotId: 'slotA',
            type: 'string',
            direction: [ 'input' ]
          },
          {
            slotId: 'slotB',
            type: 'number',
            direction: [ 'output' ]
          },
          {
            slotId: 'slotC',
            type: 'object',
            direction: [ 'input', 'output' ]
          },
          {
            slotId: 'slotD',
            type: 'boolean'
          },
          {
            slotId: 'slotE',
            type: 'array',
            direction: [ 'input', 'output' ]
          },
          {
            slotId: 'slotF'
          }
        ]

      };

      sinon.stub(cache, 'getComponentCacheEntry').callsFake(function (key) {
        if (key) {
          return this._componentCache[ key ];
        }
        return null;
      });
      cache._componentCache = {};
      cache._componentCache[ artifactId ] = manifest;
      slots = elem.slots();
    });
    afterEach(function () {
      cache._componentCache = {};
      elem = null;
      artifactId = null;
      slots = null;
      cache.getComponentCacheEntry.restore();
    });
    it('should be not undefined', function () {
      expect(slots).to.be.not.undefined;
    });
    it('should be not null', function () {
      expect(slots).to.be.not.null;
    });
    it('should be an array', function () {
      expect(slots).to.be.an('array');
    });
    it('should have length 6', function () {
      slots.should.have.length(6);
    });
    it('should have first element from type object', function () {
      slots[ 0 ].should.be.an('object');
    });
    it('should have first element with korrekt attributes', function () {
      var slot = slots[ 0 ];
      var slotDef = manifest.slots[ 0 ];
      slot.should.have.property('slotId', slotDef.slotId);
      slot.should.have.property('type', slotDef.type);
      slot.should.have.property('direction');
      slot.direction.should.be.deep.equal(slotDef.direction);
    });
    it('should have second element with korrekt attributes', function () {
      var slot = slots[ 1 ];
      var slotDef = manifest.slots[ 1 ];
      slot.should.have.property('slotId', slotDef.slotId);
      slot.should.have.property('type', slotDef.type);
      slot.should.have.property('direction');
      slot.direction.should.be.deep.equal(slotDef.direction);
    });
    it('should have third element with korrekt attributes', function () {
      var slot = slots[ 2 ];
      var slotDef = manifest.slots[ 2 ];
      slot.should.have.property('slotId', slotDef.slotId);
      slot.should.have.property('type', slotDef.type);
      slot.should.have.property('direction');
      slot.direction.should.be.deep.equal(slotDef.direction);
    });
    it('should have fourth element with korrekt attributes', function () {
      var slot = slots[ 3 ];
      var slotDef = manifest.slots[ 3 ];
      slot.should.have.property('slotId', slotDef.slotId);
      slot.should.have.property('type', slotDef.type);
      slot.should.have.property('direction');
      slot.direction.should.be.deep.equal([ 'input', 'output' ]);
    });
    it('should have fifth element with korrekt attributes', function () {
      var slot = slots[ 4 ];
      var slotDef = manifest.slots[ 4 ];
      slot.should.have.property('slotId', slotDef.slotId);
      slot.should.have.property('type', slotDef.type);
      slot.should.have.property('direction');
      slot.direction.should.be.deep.equal(slotDef.direction);
    });
    it('should have sixth element with korrekt attributes', function () {
      var slot = slots[ 5 ];
      var slotDef = manifest.slots[ 5 ];
      slot.should.have.property('slotId', slotDef.slotId);
      slot.should.not.have.property('type');
      slot.should.have.property('direction');
      slot.direction.should.be.deep.equal([ 'input', 'output' ]);
    });
  });
  describe('cubx methods', function () {
    var component;
    var cif;
    before(function () {
      cif = window.cubx.cif.cif;
      var artifactId = 'cubx-methods';
      var manifest = {
        webpackageId: 'test.' + artifactId + '@0.1.0',
        artifactId: artifactId,
        artifactType: 'compoundComponent',
        slots: [
          {
            slotId: 'slotA',
            type: 'string',
            direction: [ 'input' ]
          },
          {
            slotId: 'slotB',
            type: 'number',
            direction: [ 'output' ]
          },
          {
            slotId: 'slotC',
            type: 'object',
            direction: [ 'input', 'output' ]
          },
          {
            slotId: 'slotD',
            type: 'boolean'
          },
          {
            slotId: 'slotE',
            type: 'array',
            direction: [ 'input', 'output' ]
          },
          {
            slotId: 'slotF'
          }
        ]

      };

      sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (key) {
        return manifest;
      });
      var constructor = cif.getCompoundComponentElementConstructor(artifactId);
      component = new constructor();
      component.model.slotA = 'slotAValue';
      component.model.slotB = 'slotBValue';
      component.model.slotC = 'slotCValue';
      component.model.slotD = 'slotDValue';
      component.model.slotE = 'slotEValue';
      component.model.slotF = 'slotFValue';
    });
    after(function () {
      window.cubx.CRC.getCache().getComponentCacheEntry.restore();
    });
    describe('get methods are generated', function () {
      it('getSlotA should be exists', function () {
        component.should.have.property('getSlotA');
        component.getSlotA.should.be.a('function');
      });
      it('getSlotB should be exists', function () {
        component.should.have.property('getSlotB');
        component.getSlotB.should.be.a('function');
      });
      it('getSlotC should be exists', function () {
        component.should.have.property('getSlotC');
        component.getSlotC.should.be.a('function');
      });
      it('getSlotD should be exists', function () {
        component.should.have.property('getSlotD');
        component.getSlotD.should.be.a('function');
      });
      it('getSlotE should be exists', function () {
        component.should.have.property('getSlotE');
        component.getSlotE.should.be.a('function');
      });
      it('getSlotF should be exists', function () {
        component.should.have.property('getSlotF');
        component.getSlotF.should.be.a('function');
      });
    });
    describe('set methods are generated', function () {
      it('setSlotA should be exists', function () {
        component.should.have.property('setSlotA');
        component.setSlotA.should.be.a('function');
      });
      it('setSlotB should be exists', function () {
        component.should.have.property('setSlotB');
        component.setSlotB.should.be.a('function');
      });
      it('setSlotC should be exists', function () {
        component.should.have.property('setSlotC');
        component.setSlotC.should.be.a('function');
      });
      it('setSlotD should be exists', function () {
        component.should.have.property('setSlotD');
        component.setSlotD.should.be.a('function');
      });
      it('setSlotE should be exists', function () {
        component.should.have.property('setSlotE');
        component.setSlotE.should.be.a('function');
      });
      it('setSlotA should be exists', function () {
        component.should.have.property('setSlotE');
        component.setSlotA.should.be.a('function');
      });
    });
    describe('repropagate methods should be generated', function () {
      it('repropagateSlotA should be exists', function () {
        component.should.not.have.property('repropagateSlotA');
      });
      it('repropagateSlotB should be exists', function () {
        component.should.have.property('repropagateSlotB');
        component.repropagateSlotB.should.be.a('function');
      });
      it('repropagateSlotC should be exists', function () {
        component.should.have.property('repropagateSlotC');
        component.repropagateSlotC.should.be.a('function');
      });
      it('repropagateSlotD should be exists', function () {
        component.should.have.property('repropagateSlotD');
        component.repropagateSlotD.should.be.a('function');
      });
      it('repropagateSlotE should be exists', function () {
        component.should.have.property('repropagateSlotE');
        component.repropagateSlotE.should.be.a('function');
      });
      it('repropagateSlotF should be exists', function () {
        component.should.have.property('repropagateSlotF');
        component.repropagateSlotF.should.be.a('function');
      });
    });
    describe('#isInputSlot method for slots', function () {
      it('#isInputSlot for slotA should be returns with true', function () {
        component.isInputSlot('slotA').should.be.true;
      });
      it('#isInputSlot for slotB should be returns with false', function () {
        component.isInputSlot('slotB').should.be.false;
      });
      it('#isInputSlot for slotC should be returns with true', function () {
        component.isInputSlot('slotC').should.be.true;
      });
      it('#isInputSlot for slotD should be returns with true', function () {
        component.isInputSlot('slotD').should.be.true;
      });
      it('#isInputSlot for slotE should be returns with true', function () {
        component.isInputSlot('slotE').should.be.true;
      });
      it('#isInputSlot for slotF should be returns with true', function () {
        component.isInputSlot('slotF').should.be.true;
      });
    });
    describe('#isOutputSlot method for slots', function () {
      it('#isOutputSlot for slotA should be returns with true', function () {
        component.isOutputSlot('slotA').should.be.false;
      });
      it('#isOutputSlot for slotB should be returns with false', function () {
        component.isOutputSlot('slotB').should.be.true;
      });
      it('#isOutputSlot for slotC should be returns with true', function () {
        component.isOutputSlot('slotC').should.be.true;
      });
      it('#isOutputSlot for slotD should be returns with true', function () {
        component.isOutputSlot('slotD').should.be.true;
      });
      it('#isOutputSlot for slotE should be returns with true', function () {
        component.isOutputSlot('slotE').should.be.true;
      });
      it('#isOutputSlot for slotF should be returns with true', function () {
        component.isOutputSlot('slotF').should.be.true;
      });
    });
    describe('get methods', function () {
      it('getSlotA should be return component.model.slotA', function () {
        component.getSlotA().should.equal(component.model.slotA);
      });
      it('getSlotB should be return component.model.slotB', function () {
        component.getSlotB().should.equal(component.model.slotB);
      });
      it('getSlotC should be return component.model.slotC', function () {
        component.getSlotC().should.equal(component.model.slotC);
      });
      it('getSlotD should be return component.model.slotD', function () {
        component.getSlotD().should.equal(component.model.slotD);
      });
      it('getSlotE should be return component.model.slotE', function () {
        component.getSlotE().should.equal(component.model.slotE);
      });
      it('getSlotF should be return component.model.slotF', function () {
        component.getSlotF().should.equal(component.model.slotF);
      });
    });
    describe('set methods', function () {
      var newValueSlotA;
      var newValueSlotB;
      var newValueSlotC;
      var newValueSlotD;
      var newValueSlotE;
      var newValueSlotF;
      var spyOutputHandler;
      var spyOutputHandlerForInternalConnections;

      describe('setSlotA', function () {
        before(function () {
          newValueSlotA = 'newValueSlotA';
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.setSlotA(newValueSlotA);
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotA should change model.slotA', function () {
          component.model.slotA.should.equal(newValueSlotA);
        });
        it('setSlotA should be not call _outputHandler', function () {
          spyOutputHandler.should.have.been.not.called;
        });
        it('setSlotA should be call once _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.calledOnce;
        });
      });
      describe('setSlotB', function () {
        before(function () {
          newValueSlotB = 'newValueSlotB';
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.setSlotB(newValueSlotB);
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotB should change model.slotB', function () {
          component.model.slotB.should.equal(newValueSlotB);
        });
        it('setSlotB should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotB should be not call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.not.called;
        });
      });
      describe('setSlotC', function () {
        before(function () {
          newValueSlotC = 'newValueSlotC';
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.setSlotC(newValueSlotC);
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotC should change model.slotC', function () {
          component.model.slotC.should.equal(newValueSlotC);
        });
        it('setSlotC should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotC should be call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.calledOnce;
        });
      });
      describe('setSlotD', function () {
        before(function () {
          newValueSlotD = 'newValueSlotD';
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.setSlotD(newValueSlotD);
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotD should change model.slotD', function () {
          component.model.slotD.should.equal(newValueSlotD);
        });
        it('setSlotD should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotD should be call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.calledOnce;
        });
      });
      describe('setSlotE', function () {
        before(function () {
          newValueSlotE = 'newValueSlotE';
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.setSlotE(newValueSlotE);
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotE should change model.slotE', function () {
          component.model.slotE.should.equal(newValueSlotE);
        });
        it('setSlotE should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotE should be call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.calledOnce;
        });
      });
      describe('setSlotF', function () {
        before(function () {
          newValueSlotF = 'newValueSlotF';
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.setSlotF(newValueSlotF);
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotF should change model.slotF', function () {
          component.model.slotF.should.equal(newValueSlotF);
        });
        it('setSlotF should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotF should be call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.calledOnce;
        });
      });
    });
    describe('repropagate methods', function () {
      var newValueSlotB;
      var newValueSlotC;
      var newValueSlotD;
      var newValueSlotE;
      var newValueSlotF;
      var spyOutputHandler;
      var spyOutputHandlerForInternalConnections;

      describe('repropagateSlotB', function () {
        before(function () {
          newValueSlotB = 'hotNewValueSlotB';
          component.setSlotB(newValueSlotB);
          // spy collct just after the initial set
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.repropagateSlotB();
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotB should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotB should be not call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.not.called;
        });
      });
      describe('repropagateSlotC', function () {
        before(function () {
          newValueSlotC = 'hotNewValueSlotC';
          component.setSlotC(newValueSlotC);
          // spy collct just after the initial set
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.repropagateSlotC();
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotC should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotC should be not call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.not.called;
        });
      });
      describe('repropagateSlotD', function () {
        before(function () {
          newValueSlotD = 'newValueSlotD';
          component.setSlotD(newValueSlotD);
          // spy collct just after the initial set
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.repropagateSlotD();
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotD should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotD should be not call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.not.called;
        });
      });
      describe('repropagateSlotE', function () {
        before(function () {
          newValueSlotE = 'hotNewValueSlotE';
          component.setSlotE(newValueSlotE);
          // spy collct just after the initial set
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.repropagateSlotE();
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotE should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotE should be not call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.not.called;
        });
      });
      describe('repropagateSlotF', function () {
        before(function () {
          newValueSlotF = 'hotNewValueSlotF';
          component.setSlotF(newValueSlotF);
          // spy collct just after the initial set
          spyOutputHandler = sinon.spy(component, '_outputHandler');
          spyOutputHandlerForInternalConnections =
            sinon.spy(component, '_outputHandlerForInternalConnections');
          component.repropagateSlotF();
        });
        after(function () {
          component._outputHandler.restore();
          component._outputHandlerForInternalConnections.restore();
        });

        it('setSlotF should be call _outputHandler', function () {
          spyOutputHandler.should.have.been.calledOnce;
        });
        it('setSlotF should be not call _outputHandlerForInternalConnections', function () {
          spyOutputHandlerForInternalConnections.should.have.been.not.called;
        });
      });
    });
    describe('set an outputslot should trigger events', function () {
      var testString;
      var spySlotChangedEvent;
      var spyModelChangeEvent;
      var stub; // eslint-disable-line no-unused-vars
      beforeEach(function () {
        spyModelChangeEvent = sinon.spy();
        stub = sinon.stub(window.cubx.cif.cif, 'isAllComponentsReady').callsFake(function () { return true; });
        component.addEventListener('cifModelChange', spyModelChangeEvent);
        testString = 'Hallo Test World!';
      });
      afterEach(function () {
        component.removeEventListener('cifModelChange', spyModelChangeEvent);
        spyModelChangeEvent = null;
        window.cubx.cif.cif.isAllComponentsReady.restore();
      });
      describe('set slotA', function () {
        beforeEach(function () {
          spySlotChangedEvent = sinon.spy();
          component.addEventListener('slotSlotAChanged', spySlotChangedEvent);
          component.setSlotA(testString);
        });
        afterEach(function () {
          component.removeEventListener('slotSlotAChanged', spySlotChangedEvent);
          spySlotChangedEvent = null;
        });
        it('should be cifModelChange event triggered', function () {
          spyModelChangeEvent.should.have.been.not.called;
        });

        it('should be slotSlotAChanged event triggered', function () {
          spySlotChangedEvent.should.have.been.not.called;
        });
      });
      describe('set slotB', function () {
        beforeEach(function () {
          spySlotChangedEvent = sinon.spy();
          component.addEventListener('slotSlotBChanged', spySlotChangedEvent);
          component.setSlotB(testString);
        });
        afterEach(function () {
          component.removeEventListener('slotSlotBChanged', spySlotChangedEvent);
          spySlotChangedEvent = null;
        });
        it('should be cifModelChange event triggered', function () {
          spyModelChangeEvent.should.have.been.calledOnce;
        });
        it('should have event details (cifModelChange event)', function () {
          var event = spyModelChangeEvent.args[ 0 ][ 0 ];
          console.log(event.detail);
          event.should.have.deep.property('detail');
          event.detail.should.be.deep.property('payload', testString);
          event.detail.should.be.deep.property('slot', 'slotB');
        });
        it('should be slotSlotBChanged event triggered', function () {
          spySlotChangedEvent.should.have.been.calledOnce;
        });
        it('should have event details (slotSlotBChanged event)', function () {
          var event = spySlotChangedEvent.args[ 0 ][ 0 ];
          event.should.have.deep.property('detail', testString);
        });
      });
      describe('set slotC', function () {
        beforeEach(function () {
          spySlotChangedEvent = sinon.spy();
          component.addEventListener('slotSlotCChanged', spySlotChangedEvent);
          component.setSlotC(testString);
        });
        afterEach(function () {
          component.removeEventListener('slotSlotCChanged', spySlotChangedEvent);
          spySlotChangedEvent = null;
        });
        it('should be cifModelChange event triggered', function () {
          spyModelChangeEvent.should.have.been.calledOnce;
        });
        it('should have event details (cifModelChange event)', function () {
          var event = spyModelChangeEvent.args[ 0 ][ 0 ];
          console.log(event.detail);
          event.should.have.deep.property('detail');
          event.detail.should.be.deep.property('payload', testString);
          event.detail.should.be.deep.property('slot', 'slotC');
        });
        it('should be slotSlotCChanged event triggered', function () {
          spySlotChangedEvent.should.have.been.calledOnce;
        });
        it('should have event details (slotSlotCChanged event)', function () {
          var event = spySlotChangedEvent.args[ 0 ][ 0 ];
          event.should.have.deep.property('detail', testString);
        });
      });
      describe('set slotD', function () {
        beforeEach(function () {
          spySlotChangedEvent = sinon.spy();
          component.addEventListener('slotSlotDChanged', spySlotChangedEvent);
          component.setSlotD(testString);
        });
        afterEach(function () {
          component.removeEventListener('slotSlotDChanged', spySlotChangedEvent);
          spySlotChangedEvent = null;
        });
        it('should be cifModelChange event triggered', function () {
          spyModelChangeEvent.should.have.been.calledOnce;
        });
        it('should have event details (cifModelChange event)', function () {
          var event = spyModelChangeEvent.args[ 0 ][ 0 ];
          console.log(event.detail);
          event.should.have.deep.property('detail');
          event.detail.should.be.deep.property('payload', testString);
          event.detail.should.be.deep.property('slot', 'slotD');
        });
        it('should be slotSlotDChanged event triggered', function () {
          spySlotChangedEvent.should.have.been.calledOnce;
        });
        it('should have event details (slotSlotDChanged event)', function () {
          var event = spySlotChangedEvent.args[ 0 ][ 0 ];
          event.should.have.deep.property('detail', testString);
        });
      });
      describe('set slotE', function () {
        beforeEach(function () {
          spySlotChangedEvent = sinon.spy();
          component.addEventListener('slotSlotEChanged', spySlotChangedEvent);
          component.setSlotE(testString);
        });
        afterEach(function () {
          component.removeEventListener('slotSlotEChanged', spySlotChangedEvent);
          spySlotChangedEvent = null;
        });
        it('should be cifModelChange event triggered', function () {
          spyModelChangeEvent.should.have.been.calledOnce;
        });
        it('should have event details (cifModelChange event)', function () {
          var event = spyModelChangeEvent.args[ 0 ][ 0 ];
          console.log(event.detail);
          event.should.have.deep.property('detail');
          event.detail.should.be.deep.property('payload', testString);
          event.detail.should.be.deep.property('slot', 'slotE');
        });
        it('should be slotSlotEChanged event triggered', function () {
          spySlotChangedEvent.should.have.been.calledOnce;
        });
        it('should have event details (slotSlotEChanged event)', function () {
          var event = spySlotChangedEvent.args[ 0 ][ 0 ];
          event.should.have.deep.property('detail', testString);
        });
      });
      describe('set slotF', function () {
        beforeEach(function () {
          spySlotChangedEvent = sinon.spy();
          component.addEventListener('slotSlotFChanged', spySlotChangedEvent);
          component.setSlotF(testString);
        });
        afterEach(function () {
          component.removeEventListener('slotSlotFChanged', spySlotChangedEvent);
          spySlotChangedEvent = null;
        });
        it('should be cifModelChange event triggered', function () {
          spyModelChangeEvent.should.have.been.calledOnce;
        });
        it('should have event details (cifModelChange event)', function () {
          var event = spyModelChangeEvent.args[ 0 ][ 0 ];
          console.log(event.detail);
          event.should.have.deep.property('detail');
          event.detail.should.be.deep.property('payload', testString);
          event.detail.should.be.deep.property('slot', 'slotF');
        });
        it('should be slotSlotFChanged event triggered', function () {
          spySlotChangedEvent.should.have.been.calledOnce;
        });
        it('should have event details (slotSlotFChanged event)', function () {
          var event = spySlotChangedEvent.args[ 0 ][ 0 ];
          event.should.have.deep.property('detail', testString);
        });
      });
    });
  });
});
