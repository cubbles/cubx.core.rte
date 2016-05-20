/* globals initNewElement,getTestComponentCacheEntry */
'use strict';
describe('CubxPolymer (input/output)', function () {
  describe('methods of slot variables exists ', function () {
    var elementName = 'dummy-set-method';
    var elementName2 = 'dummy-get-method';

    var component;
    var component2;
    var testString = 'a hot new value';

    before(function () {
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
      var template = '<span id="test">{{model.inputvalue}}</span>';
      initNewElement(elementName, template, {
        modelTestChanged: function () {
          console.log('#### Method  modelTestChanged ####');
        },
        modelSecondtestChanged: function (value) {
          console.log('#### Method  modelSecondtestChanged #### : ' + value);
        }
      });
      component = document.querySelector(elementName);
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName2 ];
      initNewElement(elementName2);
      component2 = document.querySelector(elementName2);
    });
    after(function () {
      window.componentCacheEntry = undefined;
    });

    describe('set method', function () {
      it('should be exists: "setInputvalue()"', function () {
        component.setInputvalue.should.be.exists;
        component.setInputvalue.should.be.a('function');
      });

      it('should set the value of attribute model.inputvalue', function () {
        component.setInputvalue(testString);
        component.model.should.have.property('inputvalue', testString);
      });
      it('should be exists: "setOutputvalue()"', function () {
        component.setOutputvalue.should.be.exists;
        component.setOutputvalue.should.be.a('function');
      });

      it('should set the value of attribute model.outputvalue', function () {
        component.setOutputvalue(testString);
        component.model.should.have.property('outputvalue', testString);
      });
      it('should be exists: "setInputoutputvalue()"', function () {
        component.setInputoutputvalue.should.be.exists;
        component.setInputoutputvalue.should.be.a('function');
      });
      it('should set the value of attribute model.inputoutputvalue', function () {
        component.setInputoutputvalue(testString);
        component.model.should.have.property('inputoutputvalue', testString);
      });
    });

    describe('get method', function () {
      it('should be exists: "getInputvalue()"', function () {
        component2.getInputvalue.should.be.exists;
        component2.getInputvalue.should.be.a('function');
      });

      it('should get the value of attribute model.inputvalue', function () {
        expect(component2.getInputvalue()).to.equal('Hallo Webble Word! (inputvalue)');
        expect(component2.getInputvalue()).to.equal(component2.model.inputvalue);
      });

      it('should be exists: "getOutputvalue()"', function () {
        component2.getOutputvalue.should.be.exists;
        component2.getOutputvalue.should.be.a('function');
      });

      it('should get the value of attribute model.outputvalue', function () {
        expect(component2.getOutputvalue()).to.be.equal('Hallo Webble Word! (outputvalue)');
        expect(component2.getOutputvalue()).to.be.equal(component2.model.outputvalue);
      });
      it('should be exists: "getInputoutputvalue()"', function () {
        component2.getInputoutputvalue.should.be.exists;
        component2.getInputoutputvalue.should.be.a('function');
      });
      it('should get the value of attribute model.inputoutputvalue', function () {
        expect(component2.getInputoutputvalue()).to.be.equals('Hallo Webble Word! (inputoutputvalue)');
        expect(component2.getInputoutputvalue()).to.be.equals(component2.model.inputoutputvalue);
      });
    });

    describe('modelChanged method', function () {
      var spyModelSecondtestChanged;
      var spyModelTestChanged;
      beforeEach(function () {
        spyModelTestChanged = sinon.spy(component, 'modelTestChanged');

        spyModelSecondtestChanged = sinon.spy(component, 'modelSecondtestChanged');
      });
      afterEach(function () {
        component.modelSecondtestChanged.restore();
        component.modelTestChanged.restore();
      });
      it('should be exists:  "modelTestChanged"', function (done) {
        component.should.have.property('modelTestChanged');
        component.modelTestChanged.should.be.a('function');
        done();
      });
      it('modelTestChanged method should be call', function () {
        component.setTest(testString);

        expect(spyModelTestChanged.calledOnce).to.be.ok;
        var spyCall = spyModelTestChanged.getCall(0);
        expect(spyCall.args).to.be.empty;
      });

      it('should be exists:  "modelSecondtestChanged"', function (done) {
        component.should.have.property('modelSecondtestChanged');
        component.modelSecondtestChanged.should.be.a('function');
        done();
      });

      it('"modelSecondtestChanged" method should be called', function () {
        component.setSecondtest(testString);
        expect(spyModelSecondtestChanged.calledOnce).to.be.ok;
        var spyCall = spyModelSecondtestChanged.getCall(0);
        var arg = spyCall.args[ 0 ];
        expect(arg).to.be.equals(testString);
      });
    });
    describe('output model', function () {
      var elementName = 'dummy-output-handling';

      var component;
      var testString = 'a hot new value';
      var testString2 = 'a better new value';
      var testString3 = 'a better new value';

      before(function () {
        window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
        initNewElement(elementName);
        component = document.querySelector(elementName);
      });
      after(function () {
        window.componentCacheEntry = undefined;
      });

      describe('_outputHandler', function () {
        it('for outputvalue should be called', function () {
          var spy = sinon.spy(component, '_outputHandler');
          component.setOutputvalue(testString);
          expect(spy.calledOnce).to.be.ok;
          expect(spy.calledWith('outputvalue', testString)).to.be.ok;
          component._outputHandler.restore();
        });

        it('for inputoutputvalue should be called', function () {
          var spy = sinon.spy(component, '_outputHandler');
          component.setInputoutputvalue(testString);
          expect(spy.calledOnce).to.be.ok;
          expect(spy.calledWith('inputoutputvalue', testString)).to.be.ok;
          component._outputHandler.restore();
        });
        it('for outputvalue2 by setting model variable dirct should be not called synchron', function () {
          var spy = sinon.spy(component, '_outputHandler');
          component.model.outputvalue2 = testString2;
          expect(spy.called).to.be.not.ok;
          component._outputHandler.restore();
        });
        it('for outputvalue3 by setting model variable direct should be called asynchron', function (done) {
          var spy = sinon.spy(component, '_outputHandler');
          component.set('model.outputvalue3', testString3);
          setTimeout(function () {
            expect(spy.calledOnce).to.be.ok;
            expect(spy.calledWith('outputvalue3', testString3)).to.be.ok;
            component._outputHandler.restore();
            done();
          }, 50);
        });
      });

      describe('_triggerModelChangeEvent', function () {
        var testString = 'test for trigger';
        var spy;
        before(function () {
          spy = sinon.spy(component, '_triggerModelChangeEvent');
        });
        it('for outputvalue should be called', function () {
          component.setOutputvalue(testString);
          expect(spy.calledOnce).to.be.true;
          expect(spy.withArgs('outputvalue', {
            connectionHook: undefined,
            payload: testString,
            slot: 'outputvalue'
          }).calledOnce).to.be.ok;
        });
        it('for inputoutputvalue should be called', function () {
          component.setInputoutputvalue(testString);
          expect(spy.withArgs('inputoutputvalue', {
            connectionHook: undefined,
            payload: testString,
            slot: 'inputoutputvalue'
          }).calledOnce).to.be.ok;
        });
      });
      describe('_trigger cifModelChange Event', function () {
        var testString = 'test for trigger';
        var spy;
        beforeEach(function () {
          var test = function (event) {
            // console.log(event.detail);
          };
          spy = sinon.spy(test);
          component.addEventListener('cifModelChange', spy);
        });
        it('for outputvalue should be called', function () {
          component.setOutputvalue(testString);
          expect(spy.calledOnce).to.be.true;
        });
        it('for inputoutputvalue should be called', function () {
          component.setInputoutputvalue(testString);
          var event = spy.args[ 0 ][ 0 ];

          event.should.have.deep.property('detail');
          event.detail.should.have.property('payload', testString);
        });
        it('for outputvalue should be called', function () {
          component.setInputoutputvalue(testString);
          expect(spy.calledOnce).to.be.true;
        });
        it('for inputoutputvalue should be called', function () {
          component.setInputoutputvalue(testString);
          var event = spy.args[ 0 ][ 0 ];
          event.should.have.deep.property('detail');
          event.detail.should.have.property('payload', testString);
        });
      });
    });
  });

  describe('setInputSlot cause changes in input and private model', function () {
    var elementName = 'dummy-handling-input';
    var component;
    var payloadObj1;
    var payloadObj2;
    var payloadObj3;
    before(function () {
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
      initNewElement(elementName, null, {});
      component = document.querySelector(elementName);

      window.test = {
        testFunction: function (value, next) {
          value = 15;
          next(value);
        }
      };

      payloadObj1 = {
        slot: 'inputtest',
        payload: 'new input value',
        connectionHook: undefined
      };

      payloadObj2 = {
        slot: 'inputtest',
        payload: 'new input value',
        connectionHook: 'test.testFunction'
      };

      payloadObj3 = {
        slot: 'inputtest',
        payload: 'new input value',
        connectionHook: 'function(value, next) { value = 21;  next(value);}'
      };
    });
    after(function () {
      window.componentCacheEntry = undefined;
    });
    describe('"setInputSlot" set the input model', function () {
      beforeEach(function () {
        component.setInputSlot('inputtest', payloadObj1);
      });
      it('set "model.inputtest"', function () {
        component.model.should.have.property('inputtest', 'new input value');
      });
    });

    describe('"setInputSlot" call connectionHook before set the input model', function () {
      describe('connectionHook is a global function', function () {
        var spy;
        beforeEach(function () {
          spy = sinon.spy(window.test, 'testFunction');
          component.setInputSlot('inputtest', payloadObj2);
        });
        afterEach(function () {
          window.test.testFunction.restore();
        });
        it('hook function should be called', function () {
          expect(spy.calledOnce).to.be.true;
          expect(spy.calledWith('new input value')).to.be.true;
        });
        it('"model.inputtest" has a new changed value: 15', function () {
          component.model.should.have.property('inputtest', 15);
        });
      });
      describe('connectionHook is an inner function', function () {
        beforeEach(function () {
          component.setInputSlot('inputtest', payloadObj3);
        });
        it('"model.inputtest" has a new changed value: 21', function () {
          component.model.should.have.property('inputtest', 21);
        });
      });
    });
  });
  describe('call "repropagate" Method', function () {
    var elementName = 'dummy-repropagate';
    var component;

    before(function () {
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
      initNewElement(elementName);
      component = document.querySelector(elementName);
    });
    describe('"repropagate" Method exists für output slots', function () {
      it('repropagateInputvar method should be not exists', function () {
        expect(component.repropageteInputvar).to.be.unefined;
      });
      it('repropagateOutputvar method should be exists, and  is a function', function () {
        component.repropagateOutputvar.should.be.exist;
        component.repropagateOutputvar.should.be.a('function');
      });
      it('repropagateInputoutputvar method should be exists, and  is a function', function () {
        component.repropagateInputoutputvar.should.be.exist;
        component.repropagateInputoutputvar.should.be.a('function');
      });
      it('repropagateInputoutput2 method should be exists, and  is a function', function () {
        component.repropagateInputoutput2.should.be.exist;
        component.repropagateInputoutput2.should.be.a('function');
      });
    });
    describe('"repropagate" Method cause a call of _outputHandler method for the slot', function () {
      before(function () {
        sinon.stub(component, '_triggerModelChangeEvent', function (slotname, modelEventPayload) {
        });
      });
      it('repropagateOutputvar cause a call of _outputHandler method', function () {
        var spyOutputHandler = sinon.spy(component, '_outputHandler');
        component.repropagateOutputvar();
        expect(spyOutputHandler.calledOnce).to.be.ok;
        expect(spyOutputHandler.calledWith('outputvar', component.getOutputvar())).to.be.ok;
        component._outputHandler.restore();
      });
      it('repropagateInputoutputvar cause a call of _outputHandler method', function () {
        var spyOutputHandler = sinon.spy(component, '_outputHandler');
        component.repropagateInputoutputvar();
        expect(spyOutputHandler.calledOnce).to.be.ok;
        expect(spyOutputHandler.calledWith('inputoutputvar', component.getInputoutputvar())).to.be.ok;
        component._outputHandler.restore();
      });

      it('repropagateInputoutputvar cause a call of _outputHandler method', function () {
        var spyOutputHandler = sinon.spy(component, '_outputHandler');
        component.repropagateInputoutput2();
        expect(spyOutputHandler.calledOnce).to.be.ok;
        expect(spyOutputHandler.calledWith('inputoutput2', component.getInputoutput2())).to.be.ok;
        component._outputHandler.restore();
      });
    });
    describe('set the slot with new value and "repropagate" Method cause a 2 calls ' +
      'of _outputHandler4 method for the slot', function () {
      it('repropagateOutputvar2 cause a second call of _outputHandler4Outputvar2 method', function () {
        var spyOutputHandler = sinon.spy(component, '_outputHandler');
        component.setOutputvar2('new value');
        component.repropagateOutputvar2();
        expect(spyOutputHandler.calledTwice).to.be.ok;
        component._outputHandler.restore();
      });
    });
  });
});
