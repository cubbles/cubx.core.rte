/* globals _,initNewElement,getTestComponentCacheEntry, HTMLImports, getContainer */
'use strict';
describe('CubxPolymer (init)', function () {
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('CubxPolymer init', function () {
    describe('CubxPolymer create', function () {
      describe('element create with calling "CubxPolymer(prototyp)"', function () {
        var elementName = 'dummy-empty2';
        before(function () {
          window.componentCacheEntry = {};
          var el = document.createElement('div');
          el.innerHTML = '<dom-module id="' + elementName + '" >' +
            '<template>CubxPolymer test</template>' +

            '</dom-module>';

          var polEl = el.querySelector('dom-module');
          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxPolymer({ is: "' + elementName + '" });';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          polEl.appendChild(scriptEl);
          document.body.appendChild(el);
          var element = document.createElement(elementName);
          var container = getContainer();
          container.appendChild(element);
          container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
        });
        after(function () {
          window.componentCacheEntry = undefined;
        });
        it('should be exists', function (done) {
          setTimeout(function () {
            var component = document.querySelector(elementName);
            component.should.be.exists;
            expect(component.cubxPolymerName).to.be.equals(elementName);
            component.getAttribute('runtime-id').should.be.not.undefined;
            component.getAttribute('runtime-id').should.be.not.null;
            done();
          }, 50);
        });
      });

      describe('element create with calling "CubxPolymer(name, prototype) ', function () {
        var elementName = 'dummy-empty';
        var component;
        before(function () {
          window.componentCacheEntry = {};
          initNewElement(elementName);
          component = document.querySelector(elementName);
        });
        after(function () {
          window.componentCacheEntry = undefined;
        });
        it('should be exists', function () {
          component.should.be.exists;
          expect(component.cubxPolymerName).to.be.equals(elementName);
        });
      });
    });
    describe('CubxPolymer initialize private and input variable', function () {
      describe('element initial have input/outpot Slot methods', function () {
        var elementName = 'dummy-input-output';
        var component;
        var callback;
        before(function () {
          window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
          callback = sinon.spy();
          var template = '<span>{{value}}</span>';
          var prototype = {
            modelValueChanged: function (newValue) {
              callback();
            }
          };
          initNewElement(elementName, template, prototype);
          component = document.querySelector(elementName);
        });
        after(function () {
          window.componentCacheEntry = undefined;
          callback = null;
        });
        it('should have attribute "model"', function () {
          component.should.have.property('model');
        });
        it('should have private model attribute of slot', function () {
          component.model.should.have.property('value', 'Hallo Webble Word!');
        });
        it('should not the callback Method called', function () {
          callback.should.been.calledOnce;
        });
      });

      describe('element have input Slot variable', function () {
        var elementName = 'dummy-input';

        before(function () {
          window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
          var template = '<span>{{value}}</span>';
          initNewElement(elementName, template);
        });

        after(function () {
          window.componentCacheEntry = undefined;
        });
        it('should have attribute "model"', function () {
          var component = document.querySelector(elementName);
          component.should.have.property('model');
        });
        it('should have private model attribute of slot value', function () {
          var component = document.querySelector(elementName);
          component.model.should.have.property('value', 'Hallo Webble Word!');
        });
      });
      describe('element have Slot variable', function () {
        var elementName = 'dummy-output';

        before(function () {
          window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
          var template = '<span>{{value}}</span>';
          initNewElement(elementName, template);
        });

        after(function () {
          window.componentCacheEntry = undefined;
        });

        it('should have attribute "model"', function () {
          var component = document.querySelector(elementName);
          component.should.have.property('model');
        });
        it('should have input model attribute of slot', function () {
          var component = document.querySelector(elementName);
          component.model.should.have.not.deep.property('input.value');
        });
      });
      describe('default value should be  initialized with configured value ', function () {
        var elementName = 'dummy-default-value';
        before(function () {
          window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
          initNewElement(elementName);
        });
        after(function () {
          window.componentCacheEntry = undefined;
        });

        describe('element Slot variable initialized korrekt if the type is a string', function () {
          it('should have private model attribute of slot', function () {
            var component = document.querySelector(elementName);
            component.model.should.have.property('stringvalue', 'Hallo Webble Word!');
          });
        });
        describe('element Slot variable initialized korrekt if the type is a number', function () {
          it('should have private model attribute of slot', function () {
            var component = document.querySelector(elementName);
            component.model.should.have.property('numbervalue', 3);
          });
        });
        describe('element Slot variable initialized korrekt if the type is an object', function () {
          it('should have private model attribute of slot', function () {
            var component = document.querySelector(elementName);
            component.model.should.have.property('objectvalue');
            component.model.objectvalue.should.deep.equals({ 'foo': 'bar' });
          });
        });
        describe('element Slot variable initialized korrekt if the type is an array', function () {
          it('should have private model attribute of slot', function () {
            var component = document.querySelector(elementName);
            component.model.should.have.property('arrayvalue');
            component.model.arrayvalue.should.deep.equals([ 2, 3, 4 ]);
          });
        });
        describe('element Slot variable initialized korrekt if the type is a string and the value not defined',
          function () {
            it('should have private model attribute of slot', function () {
              var component = document.querySelector(elementName);
              component.model.should.have.property('stringvalue2', undefined);
            });
          });
        describe('element Slot variable initialized korrekt if the type is a number and the value not defined',
          function () {
            it('should have private model attribute of slot', function () {
              var component = document.querySelector(elementName);
              component.model.should.have.property('numbervalue2', 0);
            });
          });
        describe('element Slot variable initialized korrekt if the type is an object and the value not defined',
          function () {
            it('should have private model attribute of slot', function () {
              var component = document.querySelector(elementName);
              component.model.should.have.property('objectvalue2');
              expect(component.model.objectvalue2).to.be.undefined;
            });
          });
        describe('element Slot variable initialized korrekt if the type is an array and the value not defined',
          function () {
            it('should have private model attribute of slot', function () {
              var component = document.querySelector(elementName);
              component.model.should.have.property('arrayvalue2');
              expect(component.model.arrayvalue2).to.be.undefined;
            });
          });
        describe('element Slot variable initialized korrekt if type and value not defined', function () {
          it('should have private model attribute of slot', function () {
            var component = document.querySelector(elementName);
            component.model.should.have.property('typlessvalue', undefined);
          });
        });
      });
    });

    describe('generate handler methods and observer', function () {
      var elementName = 'dummy-handler-observer';
      var component;

      before(function () {
        window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
        initNewElement(elementName);
        component = document.querySelector(elementName);
      });
      after(function () {
        window.componentCacheEntry = undefined;
      });
      describe('_generateObserveForProperty generate observer for input slots', function () {
        it('observer "model.inputvar" should be exists in observers', function () {
          var observerFunc = _.find(component.observers, function (item) {
            return item.indexOf('model.inputvar') === 0;
          });
          expect(observerFunc).be.exists;
        });
        it('observer "model.outputvar" should be exists in _observers', function () {
          var observerFunc = _.find(component._observers, function (item) {
            return item.indexOf('model.outputvar') === 0;
          });
          expect(observerFunc).be.exists;
        });
        it('observer "model.inputoutputvar" should be exists in _observers', function () {
          var observerFunc = _.find(component._observers, function (item) {
            return item.indexOf('model.inputoutputvar') === 0;
          });
          expect(observerFunc).be.exists;
        });
      });

      describe('#_handleChange4... method for a slot:"', function () {
        it('"_handleChange4Inputvar" should be exists', function () {
          component.should.be.have.property('_handleChange4Inputvar');
        });
        it('"_handleChange4Inputvar" should be a function', function () {
          component._handleChange4Inputvar.should.be.a('function');
        });
        it('"_handleChange4Outputvar" should be exists ', function () {
          component.should.be.have.property('_handleChange4Outputvar');
        });
        it('"_handleChange4Outputvar" should be a function', function () {
          component._handleChange4Outputvar.should.be.a('function');
        });
        it('"_handleChange4Inputoutputvar" should be exists', function () {
          component.should.be.have.property('_handleChange4Inputoutputvar');
        });
        it('"_handleChange4Inputoutputvar" should be a function', function () {
          component._handleChange4Inputoutputvar.should.be.a('function');
        });
      });
    });
    describe('#_generateSlotsMethod', function () {
      var elementName = 'dummy-slots-handling';
      var element;
      before(function () {
        window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
        if ((element = document.querySelector(elementName)) === null) {
          initNewElement(elementName);
          element = document.querySelector(elementName);
        }
      });
      after(function () {
        window.componentCacheEntry = undefined;
      });
      it('the slots method should get the list of the slots', function () {
        var slots = element.slots();

        slots.should.have.length(11);
        slots[ 0 ].should.have.property('slotId', 'inputvalue');
        slots[ 0 ].should.have.property('type', 'string');
        slots[ 0 ].should.have.deep.property('direction[0]', 'input');

        slots[ 1 ].should.have.property('slotId', 'outputvalue');
        slots[ 1 ].should.have.property('type', 'string');
        slots[ 1 ].should.have.deep.property('direction[0]', 'output');

        slots[ 2 ].should.have.property('slotId', 'inputoutputvalue');
        slots[ 2 ].should.have.property('type', 'string');
        slots[ 2 ].should.have.deep.property('direction[0]', 'input');
        slots[ 2 ].should.have.deep.property('direction[1]', 'output');

        slots[ 3 ].should.have.property('slotId', 'inputvalueWithoutType');
        slots[ 3 ].should.not.have.property('type');
        slots[ 3 ].should.have.deep.property('direction[0]', 'input');

        slots[ 4 ].should.have.property('slotId', 'outputvalueWithoutType');
        slots[ 4 ].should.not.have.property('type');
        slots[ 4 ].should.have.deep.property('direction[0]', 'output');

        slots[ 5 ].should.have.property('slotId', 'inputoutputvalueWithoutType');
        slots[ 5 ].should.not.have.property('type');
        slots[ 5 ].should.have.deep.property('direction[0]', 'input');
        slots[ 5 ].should.have.deep.property('direction[1]', 'output');

        slots[ 6 ].should.have.property('slotId', 'inputoutputvaluePerDefault');
        slots[ 6 ].should.have.property('type', 'string');
        slots[ 6 ].should.have.deep.property('direction[0]', 'input');
        slots[ 6 ].should.have.deep.property('direction[1]', 'output');

        slots[ 7 ].should.have.property('slotId', 'outputobject');
        slots[ 7 ].should.have.property('type', 'object');
        slots[ 7 ].should.have.deep.property('direction[0]', 'output');

        slots[ 8 ].should.have.property('slotId', 'outputobjectarray');
        slots[ 8 ].should.have.deep.property('type', 'array');
        slots[ 8 ].should.have.deep.property('direction[0]', 'output');

        slots[ 9 ].should.have.property('slotId', 'inputobject');
        slots[ 9 ].should.have.property('type', 'object');
        slots[ 9 ].should.have.deep.property('direction[0]', 'input');

        slots[ 10 ].should.have.property('slotId', 'inputobjectarray');
        slots[ 10 ].should.have.deep.property('type', 'array');
        slots[ 10 ].should.have.deep.property('direction[0]', 'input');
      });
    });
  });
  describe('calling original element lifecycle methods', function () {
    var originCreated = 0;
    var originReady = 0;
    var originAttached = 0;
    var originDetached = 0;
    describe('lifecycle method created', function () {
      var elementName = 'dummy-lifecycle-created';
      before(function (done) {
        window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
        var template = '<span>{{value}}</span>';
        initNewElement(elementName, template, {
          created: function () {
            originCreated++;
            done();
          }
        });
      });
      it('should call "created', function () {
        expect(originCreated).to.be.equals(1);
      });
    });
    describe('lifecycle method ready', function () {
      var elementName = 'dummy-lifecycle-ready';
      before(function (done) {
        window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
        var template = '<span>{{value}}</span>';
        initNewElement(elementName, template, {
          ready: function () {
            originReady++;
            done();
          }
        });
      });
      it('should call "ready', function () {
        expect(originReady).to.be.equals(1);
      });
    });
    describe('lifecycle method attached', function () {
      var elementName = 'dummy-lifecycle-attached';
      before(function (done) {
        window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
        var template = '<span>{{value}}</span>';
        initNewElement(elementName, template, {
          attached: function () {
            originAttached++;
            done();
          }
        });
      });
      it('should call "attached', function () {
        expect(originAttached).to.be.equals(1);
      });
    });
    describe('lifecycle method detached', function () {
      var elementName = 'dummy-lifecycle-detached';
      before(function (done) {
        window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
        var template = '<span>{{value}}</span>';
        initNewElement(elementName, template, {
          detached: function () {
            originDetached++;
            done();
          }
        });
        var component = document.querySelector(elementName);
        component.parentNode.removeChild(component);
      });
      it('should call "detached', function () {
        expect(originDetached).to.be.equals(1);
      });
    });
    after(function () {
      window.componentCacheEntry = undefined;
    });
  });
  describe('calling cubxReady lifecycle method', function () {
    var elementName = 'dummy-cubxready-lifecycle';
    var cubxReadyCalls = 0;

    before(function () {
      window.componentCacheEntry = getTestComponentCacheEntry()[ elementName ];
      var template = '<span>{{value}}</span>';
      initNewElement(elementName, template, {
        cubxReady: function () {
          cubxReadyCalls++;
        }
      });
    });

    after(function () {
      window.componentCacheEntry = undefined;
    });

    it('should call "cubxReady"', function (done) {
      setTimeout(function () {
        expect(cubxReadyCalls).to.be.equals(1);
        done();
      }, 50);
    });

    it('should call "cubxReady" just once', function (done) {
      var container = getContainer();
      container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY));
      container.dispatchEvent(window.cubx.EventFactory.prototype.createEvent(window.cubx.EventFactory.types.CIF_READY));
      setTimeout(function () {
        expect(cubxReadyCalls).to.be.equals(1);
        done();
      }, 50);
    });
  });
});
