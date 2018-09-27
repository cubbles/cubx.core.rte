/* globals HTMLImports,getContainer,createHtmlImport, Event */
'use strict';
describe('CubxComponent (listener)', function () {
  before(function (done) {
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('main', function () {
    var container;
    before(function () {
      container = getContainer();
    });
    after(function () {
      container = null;
    });
    describe('CubxComponent has listener config', function () {
      var elementName = 'element-with-listener';
      var spyChangeGlobal;
      var spyClickGlobal;
      var spyClickButton1;
      var spyClickButton2;
      var spyChangeInput1;
      var spyChangeInput2;
      var spyChangeTextarea;
      before(function (done) {
        var url = 'base/test/resources/template-element-with-listener.html';
        if (window.testRun) {
          url = url.replace('base/test/', '');
        }
        var promise = createHtmlImport(url);
        promise.then(function (value) {
          var el = document.createElement('div');
          var scriptEl = document.createElement('script');
          scriptEl.async = false;
          scriptEl.defer = false;
          scriptEl.type = 'text/javascript';
          var content = 'CubxComponent({ is: "' + elementName + '", ' +
            'listener: {' +
            'change: \'handleChangeGlobal\', ' +
            'click: \'handleClickGlobal\', ' +
            '\'button1.click\': \'handleClickButton1\', ' +
            '\'button2.click\': \'handleClickButton2\', ' +
            '\'input1.change\': \'handleChangeInput1\',' +
            '\'input2.change\': \'handleChangeInput2\',' +
            '\'textarea1.change\': \'handleChangeTextarea\'' +
            '}, ' +
            'handleChangeGlobal: function(evt) {console.log(\'handleChangeGlobal\'); spyChangeGlobal(evt);}, ' +
            'handleClickGlobal: function(evt) {console.log(\'handleClickGlobal\'); spyClickGlobal(evt);}, ' +
            'handleClickButton1: function(evt) {console.log(\'handleClickButton1\'); spyClickButton1(evt);}, ' +
            'handleClickButton2: function(evt) {console.log(\'handleClickButton2\'); spyClickButton2(evt);}, ' +
            'handleChangeInput1: function(evt) {console.log(\'handleChangeInput1\'); spyChangeInput1(evt);}, ' +
            'handleChangeInput2: function(evt) {console.log(\'handleChangeInput2\'); spyChangeInput2(evt);}, ' +
            'handleChangeTextarea: function(evt) {console.log(\'handleChangeTextarea\'); spyChangeTextarea(evt);} ' +
            '});';
          try {
            scriptEl.appendChild(document.createTextNode(content));
          } catch (e) {
            scriptEl.text = content;
          }
          scriptEl.setAttribute('foo', 'bar');
          console.log(el);
          el.appendChild(scriptEl);
          document.body.appendChild(el);
          var element = document.createElement(elementName);
          element.setAttribute('runtime-id', elementName + '#1');
          container.appendChild(element);
          done();
        }).catch(function (err) {
          console.error(err);
          done();
        });
      });
      beforeEach(function () {
        spyChangeGlobal = sinon.spy();
        spyClickGlobal = sinon.spy();
        spyClickButton1 = sinon.spy();
        spyClickButton2 = sinon.spy();
        spyChangeInput1 = sinon.spy();
        spyChangeInput2 = sinon.spy();
        spyChangeTextarea = sinon.spy();
        window.spyChangeGlobal = spyChangeGlobal;
        window.spyClickGlobal = spyClickGlobal;
        window.spyClickButton1 = spyClickButton1;
        window.spyClickButton2 = spyClickButton2;
        window.spyChangeInput1 = spyChangeInput1;
        window.spyChangeInput2 = spyChangeInput2;
        window.spyChangeTextarea = spyChangeTextarea;
      });
      afterEach(function () {
        spyChangeGlobal = null;
        spyClickGlobal = null;
        spyClickButton1 = null;
        spyClickButton2 = null;
        spyChangeInput1 = null;
        spyChangeInput2 = null;
        spyChangeTextarea = null;
        delete window.spyChangeGlobal;
        delete window.spyClickGlobal;
        delete window.spyClickButton1;
        delete window.spyClickButton2;
        delete window.spyChangeInput1;
        delete window.spyChangeInput2;
        delete window.spyChangeTextarea;
      });
      describe('click button1', function () {
        beforeEach(function () {
          document.querySelector('#button1').click();
        });
        it('should be handleClickGlobal called', function () {
          spyClickGlobal.should.be.calledOnce;
        });
        it('should be spyClickButton1 called', function () {
          spyClickButton1.should.be.calledOnce;
        });
      });
      describe('click button2', function () {
        beforeEach(function () {
          document.querySelector('#button2').click();
        });
        it('should be handleClickGlobal called', function () {
          spyClickGlobal.should.be.calledOnce;
        });
        it('should be spyClickButton2 called', function () {
          spyClickButton2.should.be.calledOnce;
        });
      });
      describe('change input1 value', function () {
        beforeEach(function () {
          var el = document.querySelector('#input1');
          el.value = 'xxx';
          el.dispatchEvent(new Event('change', {bubbles: true}));
        });
        it('should be spyChangeGlobal called', function () {
          spyChangeGlobal.should.be.calledOnce;
        });
        it('should be spyChangeInput1 called', function () {
          spyChangeInput1.should.be.calledOnce;
        });
      });
      describe('change input2 value', function () {
        beforeEach(function () {
          var el = document.querySelector('#input2');
          el.value = 'xxx';
          el.dispatchEvent(new Event('change', {bubbles: true}));
        });
        it('should be spyChangeGlobal called', function () {
          spyChangeGlobal.should.be.calledOnce;
        });
        it('should be spyChangeInput2 called', function () {
          spyChangeInput2.should.be.calledOnce;
        });
      });
      describe('change textarea value', function () {
        beforeEach(function () {
          var el = document.querySelector('#textarea1');
          el.value = 'xxx';
          el.dispatchEvent(new Event('change', {bubbles: true}));
        });
        it('should be spyChangeGlobal called', function () {
          spyChangeGlobal.should.be.calledOnce;
        });
        it('should be spyChangeTextarea called', function () {
          spyChangeTextarea.should.be.calledOnce;
        });
      });
    });
  });
});
