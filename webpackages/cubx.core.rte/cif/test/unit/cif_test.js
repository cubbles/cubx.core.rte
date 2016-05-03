'use strict';
before(function () {
  var container = document.querySelector('[cubx-core-crc]');
  var rootContext = new window.cubx.cif.Context(container);
  container.Context = rootContext;
});
describe('CIF', function () {
  var cif;
  var Context;
  before(function () {
    cif = window.cubx.cif.cif;
    Context = window.cubx.cif.Context;
  });
  describe('#CIF()', function () {
    it('should create a new cif object', function () {
      // Could not test, becose constructor in a closure defined.
    });
    it('the in windows stored cif object has all important attributes', function () {
      // Could not test, becose constructor in a closure defined.
      expect(cif._initializer).to.be.exists;
      expect(cif._initializer).to.be.an('object');
      expect(cif._initializer).to.be.instanceOf(window.cubx.cif.Initializer);
    });
  });
  describe('#getCRCRootNodeList', function () {
    it('getCRCRootNodeList give one element', function () {
      cif.getCRCRootNodeList().should.be.a('array');
      cif.getCRCRootNodeList().should.have.length(1);
    });
  });
  describe('#getCompoundComponentElementConstructor', function () {
    var compoundComponentName;
    var constructor;
    before(function () {
      compoundComponentName = 'cubx-compound';
      constructor = function () {
        // empty
      };
    });
    describe('compound component is registered', function () {
      var _compoundComponentElements_ret;
      beforeEach(function () {
        _compoundComponentElements_ret = cif._compoundComponentElements;
        cif._compoundComponentElements = {};
        cif._compoundComponentElements[ compoundComponentName ] = constructor;
      });
      afterEach(function () {
        cif._compoundComponentElements = _compoundComponentElements_ret;
      });
      it('should be a function', function () {
        var erg = cif.getCompoundComponentElementConstructor(compoundComponentName);
        erg.should.be.exist;
        erg.should.be.a('function');
      });
    });
    describe('compound component is not registered yet', function () {
      var stubRegisterFunction;
      beforeEach(function () {
        stubRegisterFunction = sinon.stub(cif, '_registerCompoundComponentElement', function () {
          return constructor;
        });
      });
      afterEach(function () {
        cif._registerCompoundComponentElement.restore();
      });
      it('shoud.be.a function', function () {
        var erg = cif.getCompoundComponentElementConstructor(compoundComponentName);
        erg.should.be.exists;
        erg.should.be.a('function');
        expect(stubRegisterFunction.calledOnce).to.be.true;
      });
    });
  });
  describe('#isReady', function () {
    var container;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
    });
    describe('if context not exists', function () {
      it('should be false', function () {
        expect(cif.isReady(container)).to.be.false;
      });
    });

    describe('if context', function () {
      /* eslint-disable no-unused-vars*/
      var stubContextIsready;
      /* eslint-ensable no-unused-vars*/
      var context;
      before(function () {
        context = new Context(container);
        stubContextIsready = sinon.stub(context, 'isReady', function () {
          return true;
        });
        cif._rootContextList = [];
        cif._rootContextList.push(context);
      });
      after(function () {
        context.isReady.restore();
        cif._rootContextList = [];
      });
      it('should be true', function () {
        expect(cif.isReady(container)).to.be.true;
      });
    });
  });
  describe('#getInitializer()', function () {
    it('get', function () {
      cif.getInitializer().should.be.an('object');
      cif.getInitializer().should.be.instanceOf(window.cubx.cif.Initializer);
      cif.getInitializer().should.be.eql(cif._initializer);
    });
  });
  describe('#_isModelVersionSupported', function () {
    it('model version 8.1.0 is allowed ', function () {
      expect(cif._isModelVersionSupported('8.1.0')).to.be.ok;
    });
    it('model version 8.0.0 is allowed ', function () {
      expect(cif._isModelVersionSupported('8.0.0')).to.be.ok;
    });
    it('model version 7.0.0 is allowed ', function () {
      expect(cif._isModelVersionSupported('7.0.0')).to.be.not.ok;
    });
    it('model version 6.0.0 is allowed ', function () {
      expect(cif._isModelVersionSupported('6.0.0')).to.be.not.ok;
    });
    it('model version 6.0 is allowed ', function () {
      expect(cif._isModelVersionSupported('6.0')).to.be.not.ok;
    });
    it('model version 3.0  is not allowed ', function () {
      expect(cif._isModelVersionSupported('5.0')).to.be.not.ok;
    });
    it('model version 3.0.0 is not allowed ', function () {
      expect(cif._isModelVersionSupported('4.1.0')).to.be.not.ok;
    });
  });
  describe('#_checkModelVersionForAllComponents', function () {
    var artifactOk;
    var artifactOk2;
    var artifactOk3;
    var artifactNotOk;
    var consoleWarnSpy;
    /* eslint-disable no-unused-vars */
    var cacheStub;
    /* eslint-enable no-unused-vars */
    function getArtifact (artifactId, modelVersion) {
      return {
        webpackageId: 'test.' + artifactId + '@0.1', artifactId: artifactId, modelVersion: modelVersion
      };
    }

    beforeEach(function () {
      artifactOk = getArtifact('test1', '8.0.0');
      artifactOk2 = getArtifact('test2', '8.0.0');
      artifactOk3 = getArtifact('test3', '8.0.0');
      artifactNotOk = getArtifact('testNotOk', '2.0.0');
      consoleWarnSpy = sinon.spy(console, 'warn');
    });
    afterEach(function () {
      artifactOk = null;
      artifactOk2 = null;
      artifactOk3 = null;
      artifactNotOk = null;
      console.warn.restore();
      window.cubx.CRC.getCache.restore();
    });

    it(' should be ok', function () {
      cacheStub = sinon.stub(window.cubx.CRC, 'getCache', function () {
        var cache = {};
        cache.getAllComponents = function () {
          return [ artifactOk, artifactOk2, artifactOk3 ];
        };
        return cache;
      });

      expect(cif._checkModelVersionForAllComponents()).to.be.true;
      expect(consoleWarnSpy.called).to.be.false;
    });
    it(' should be not ok', function () {
      cacheStub = sinon.stub(window.cubx.CRC, 'getCache', function () {
        var cache = {};
        cache.getAllComponents = function () {
          return [ artifactOk, artifactOk2, artifactNotOk, artifactOk3 ];
        };
        return cache;
      });

      expect(cif._checkModelVersionForAllComponents()).be.false;
      expect(consoleWarnSpy.calledOnce).to.be.true;
    });
  });
  describe('#_isElementaryComponentInManifest', function () {
    var manifestElementary;
    var manifestCompound;
    var manifestWithoutType;
    beforeEach(function () {
      manifestElementary = { artifactType: 'elementaryComponent' };
      manifestCompound = { artifactType: 'compoundComponent' };
      manifestWithoutType = {};
    });
    it('should be true for manifest with type=elementary', function () {
      expect(cif._isElementaryComponentInManifest(manifestElementary)).to.be.true;
    });
    it('should be false for manifest with type=compound', function () {
      expect(cif._isElementaryComponentInManifest(manifestCompound)).to.be.false;
    });
    it('should be false if the type attribut missed', function () {
      expect(cif._isElementaryComponentInManifest(manifestWithoutType)).to.be.false;
    });
  });
  describe('#_isElementaryComponent', function () {
    var getComponentCacheEntryStub;
    var elementaryCompName;
    var compoundCompName;
    var container;
    beforeEach(function () {
      elementaryCompName = 'cubixx-test-elementary';
      compoundCompName = 'cubixx-test-compound';

      getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry', function (artifactId) {
        var elem = {
          webpackageId: 'test.' + artifactId + '@0.1',
          artifactId: artifactId
        };
        if (artifactId === elementaryCompName) {
          elem.artifactType = 'elementaryComponent';
        } else if (artifactId === compoundCompName) {
          elem.artifactType = 'compoundComponent';
        }
        return elem;
      });
      container = document.querySelector('[cubx-core-crc]');
    });
    afterEach(function () {
      window.cubx.CRC.getCache().getComponentCacheEntry.restore();
    });
    it('should be true, if the tag is elementary', function () {
      var component = document.createElement(elementaryCompName);
      expect(cif._isElementaryComponent(component)).to.be.true;
    });
    it('should be false, if the tag is compound', function () {
      var component = document.createElement(compoundCompName);
      expect(cif._isElementaryComponent(component)).to.be.false;
    });
  });
  describe('#_isCompoundComponent', function () {
    var getResolvedComponentStub;
    var elementaryCompName;
    var compoundCompName;
    var container;
    beforeEach(function () {
      elementaryCompName = 'cubixx-test-elementary';
      compoundCompName = 'cubixx-test-compound';

      getResolvedComponentStub = sinon.stub(window.cubx.CRC, 'getResolvedComponent', function (artifactId) {
        var elem = {
          webpackageId: 'test.' + artifactId + '@0.1', artifactId: artifactId
        };
        if (artifactId === elementaryCompName) {
          elem.artifactType = 'elementaryComponent';
        } else if (artifactId === compoundCompName) {
          elem.artifactType = 'compoundComponent';
        }
        return elem;
      });
      container = document.querySelector('[cubx-core-crc]');
    });
    afterEach(function () {
      window.cubx.CRC.getResolvedComponent.restore();
    });
    it('should be true, if the tag is compound', function () {
      var component = document.createElement(compoundCompName);
      expect(cif._isCompoundComponent(component)).to.be.true;
    });
    it('should be false, if the tag is compound', function () {
      var component = document.createElement(elementaryCompName);
      expect(cif._isCompoundComponent(component)).to.be.false;
    });
  });
  describe('#_isCompoundComponentInManifest', function () {
    var manifestElementary;
    var manifestCompound;
    var manifestWithoutType;
    beforeEach(function () {
      manifestElementary = { artifactType: 'elementaryComponent' };
      manifestCompound = { artifactType: 'compoundComponent' };
      manifestWithoutType = {};
    });
    it('should be true for manifest with type=elementary', function () {
      expect(cif._isCompoundComponentInManifest(manifestElementary)).to.be.false;
    });
    it('should be false for manifest with type=compound', function () {
      expect(cif._isCompoundComponentInManifest(manifestCompound)).to.be.true;
    });
    it('should be false if the type attribut missed', function () {
      expect(cif._isCompoundComponentInManifest(manifestWithoutType)).to.be.false;
    });
  });
  describe('#_isComponentFromType', function () {
    var manifestElementary;
    var manifestCompound;
    var manifestWithoutType;
    beforeEach(function () {
      manifestElementary = { artifactType: 'elementaryComponent' };
      manifestCompound = { artifactType: 'compoundComponent' };
      manifestWithoutType = {};
    });
    it('should be true for elementary manifest with type=elementary', function () {
      expect(cif._isComponentFromType(manifestElementary, 'elementaryComponent')).to.be.true;
    });
    it('should be true for compound manifest with type=compound', function () {
      expect(cif._isComponentFromType(manifestCompound, 'compoundComponent')).to.be.true;
    });
    it('should be false for elementary manifest with type=compound', function () {
      expect(cif._isComponentFromType(manifestElementary, 'compoundComponent')).to.be.false;
    });
    it('should be true for compound manifest with type=elementary', function () {
      expect(cif._isComponentFromType(manifestCompound, 'elementaryComponent')).to.be.false;
    });
    it('should be false if the type attribut missed in manifest', function () {
      expect(cif._isCompoundComponentInManifest(manifestWithoutType, 'elementaryComponent')).to.be.false;
      expect(cif._isCompoundComponentInManifest(manifestWithoutType, 'compoundComponent')).to.be.false;
    });
  });
  describe('#_determineRuntimeMode', function () {
    // runtimeMode = standalone just one element
    // runtimeMode composit otherfalls
    var container;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
    });
    describe('runtimeMode should be standalone', function () {
      var cubixxElement;
      beforeEach(function () {
        cubixxElement = document.createElement('cubx-test');
        container.appendChild(cubixxElement);
      });
      afterEach(function () {
        container.removeChild(cubixxElement);
      });
      it('if crc container contains just one node', function () {
        console.log('container.children.length', container.children.length);
        expect(cif._determineRuntimeMode(container)).to.equals(cif._runtimeModes.standalone);
      });
      it('if crc container contains just one element, but comments and text too', function () {
        var comment = document.createComment('Kommentar');
        var text = document.createTextNode('Text');
        container.insertBefore(comment, cubixxElement);
        container.insertBefore(text, cubixxElement);
        expect(cif._determineRuntimeMode(container)).to.equals(cif._runtimeModes.standalone);
        container.removeChild(comment);
        container.removeChild(text);
      });
    });
    describe('runtimeMode should be composite', function () {
      var cubixxElement;

      beforeEach(function () {
        cubixxElement = document.createElement('cubx-test');
        container.appendChild(cubixxElement);
      });
      afterEach(function () {
        container.removeChild(cubixxElement);
      });
      it('if crc container contains more than one element', function () {
        var el = document.createElement('cubx-second-test');
        container.appendChild(el);
        expect(cif._determineRuntimeMode(container)).to.equals(cif._runtimeModes.composite);
        container.removeChild(el);
      });
    });
    describe('runtimeMode should be none', function () {
      it('if crc container contains one none custom element', function () {
        expect(cif._determineRuntimeMode(container)).to.equals(cif._runtimeModes.none);
      });
    });
  });
  describe('#_registerCompoundComponentElement', function () {
    it('should be register with component name "-"', function () {
      /* eslint-disable no-unused-vars*/
      var constructor = cif._registerCompoundComponentElement('ciftest-registercompound');
      /* eslint-enable no-unused-vars*/
      var el = new constructor();

      el.should.have.deep.property('isCompoundComponent', true);

      expect(function () {
        cif._registerCompoundComponentElement('ciftest-registercompound');
      }).to.throw(Error);
    });
  });
  describe('#_registerConnectionElements', function () {
    // Could not test...
    // cif._registerConnectionElements
  });
  describe('#_registerConnectionsElements', function () {
    // Could not test...
    // cif._registerConnectionElements
  });
});
