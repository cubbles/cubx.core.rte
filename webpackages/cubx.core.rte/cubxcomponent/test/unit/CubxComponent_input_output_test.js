/* globals HTMLImports, getTestComponentCacheEntry, initNewElement */
'use strict';
describe('CubxComponent (Input/Output)', function () {
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('methods of slot variables exists', function () {
    var elementName = 'dummy-set-method';
    var elementName2 = 'dummy-get-method';

    var component;
    var component2;
    var testString = 'a hot new value';

    before(function () {
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];

      initNewElement(elementName, {
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
    describe('set methods', function () {
      it('should be exists: "setInputvalue()"', function () {
        component.setInputvalue.should.be.exists;
        component.setInputvalue.should.be.a('function');
      });

      it('should set the value of attribute model.inputvalue', function () {
        component.setInputvalue(testString);
        component.model.should.have.property('inputvalue', testString);
        component.model.should.have.property('_inputvalue', testString);
        component.model.inputvalue.should.be.equal(testString);
        component.model['inputvalue'].should.be.equal(testString);
      });
      it('should be exists: "setOutputvalue()"', function () {
        component.setOutputvalue.should.be.exists;
        component.setOutputvalue.should.be.a('function');
      });

      it('should set the value of attribute model.outputvalue', function () {
        component.setOutputvalue(testString);
        component.model.should.have.property('outputvalue', testString);
        component.model.should.have.property('_outputvalue', testString);
        component.model.outputvalue.should.be.equal(testString);
        component.model['outputvalue'].should.be.equal(testString);
      });
      it('should be exists: "setInputoutputvalue()"', function () {
        component.setInputoutputvalue.should.be.exists;
        component.setInputoutputvalue.should.be.a('function');
      });
      it('should set the value of attribute model.inputoutputvalue', function () {
        component.setInputoutputvalue(testString);
        component.model.should.have.property('inputoutputvalue', testString);
        component.model.should.have.property('_inputoutputvalue', testString);
        component.model.inputoutputvalue.should.be.equal(testString);
        component.model['inputoutputvalue'].should.be.equal(testString);
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
    describe('getter and setter', function () {
      describe('getter', function () {
        var spyInputValue; // eslint-disable-line no-unused-vars
        var spyOutputValue; // eslint-disable-line no-unused-vars
        var spyInputoutputvalue; // eslint-disable-line no-unused-vars
        beforeEach(function () {
          spyInputValue = sinon.spy(component, 'getInputvalue');
          spyOutputValue = sinon.spy(component, 'getOutputvalue');
          spyInputoutputvalue = sinon.spy(component, 'getInputoutputvalue');
        });
        afterEach(function () {
          component.getInputvalue.restore();
          component.getOutputvalue.restore();
          component.getInputoutputvalue.restore();
        });
        it('getter called getInputvalue for slot inputvalue', function () {
          var res = component.model.inputvalue; // eslint-disable-line no-unused-vars
          spyInputValue.should.be.calledOnce;
        });
        it('not called getInputvalue for internal slot variable _inputvalue', function () {
          var res = component.model._inputvalue; // eslint-disable-line no-unused-vars
          spyInputValue.should.not.called;
        });
        it('getter called getOutputvalue for slot outputvalue', function () {
          var res = component.model.outputvalue; // eslint-disable-line no-unused-vars
          spyOutputValue.should.be.calledOnce;
        });
        it('not called getOutputvalue for internal slot variable _outputvalue', function () {
          var res = component.model._outputvalue; // eslint-disable-line no-unused-vars
          spyOutputValue.should.not.called;
        });
        it('getter called getInputoutputvalue for slot inputoutputvalue', function () {
          var res = component.model.inputoutputvalue; // eslint-disable-line no-unused-vars
          spyInputoutputvalue.should.be.calledOnce;
        });
        it('not called getInputoutputvalue for internal slot variable _inputoutputvalue', function () {
          var res = component.model._inputoutputvalue; // eslint-disable-line no-unused-vars
          spyInputoutputvalue.should.not.called;
        });
      });
      describe('setter', function () {
        var spyInputValue; // eslint-disable-line no-unused-vars
        var spyOutputValue; // eslint-disable-line no-unused-vars
        var spyInputoutputvalue; // eslint-disable-line no-unused-vars
        beforeEach(function () {
          spyInputValue = sinon.spy(component, 'setInputvalue');
          spyOutputValue = sinon.spy(component, 'setOutputvalue');
          spyInputoutputvalue = sinon.spy(component, 'setInputoutputvalue');
        });
        afterEach(function () {
          component.setInputvalue.restore();
          component.setOutputvalue.restore();
          component.setInputoutputvalue.restore();
        });

        it('setter called setInputvalue for slot inputvalue', function () {
          component.model.inputvalue = 'test';
          spyInputValue.should.be.calledOnce;
        });
        it('not called setInputvalue for internal slot variable _inputvalue', function () {
          component.model._inputvalue = 'test';
          spyInputValue.should.not.called;
        });
        it('setter called setOutputvalue for slot outputvalue', function () {
          component.model.outputvalue = 'test';
          spyOutputValue.should.be.calledOnce;
        });
        it('not called setOutputvalue for internal slot variable _outputvalue', function () {
          component.model._outputvalue = 'test';
          spyOutputValue.should.not.called;
        });
        it('setter called setInputoutputvalue for slot inputoutputvalue', function () {
          component.model.inputoutputvalue = 'test';
          spyInputoutputvalue.should.be.calledOnce;
        });
        it('not called setInputoutputvalue for internal slot variable _inputoutputvalue', function () {
          component.model._inputoutputvalue = 'test';
          spyInputoutputvalue.should.not.called;
        });
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
        it('for outputvalue2 by setting slot variable direct (outputvalue2),  should be called', function () {
          var spy = sinon.spy(component, '_outputHandler');
          component.model.outputvalue2 = testString2;
          spy.should.be.calledOnce;
          component._outputHandler.restore();
        });
        it('for outputvalue2 by setting model internal variable direct (_outputvalue2),  should be not called synchron', function () {
          var spy = sinon.spy(component, '_outputHandler');
          component.model._outputvalue2 = testString2;
          spy.should.be.not.called;
          component._outputHandler.restore();
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
});
