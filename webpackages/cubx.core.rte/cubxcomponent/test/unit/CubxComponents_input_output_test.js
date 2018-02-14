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
