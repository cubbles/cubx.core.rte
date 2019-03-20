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
      var _compoundComponentElementsRet;
      beforeEach(function () {
        _compoundComponentElementsRet = cif._compoundComponentElements;
        cif._compoundComponentElements = {};
        cif._compoundComponentElements[ compoundComponentName ] = constructor;
      });
      afterEach(function () {
        cif._compoundComponentElements = _compoundComponentElementsRet;
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
        stubRegisterFunction = sinon.stub(cif, '_registerCompoundComponentElement').callsFake(function () {
          return constructor;
        });
      });
      afterEach(function () {
        cif._registerCompoundComponentElement.restore();
      });
      it('shoud.be.a function', function () {
        var erg = cif.getCompoundComponentElementConstructor(compoundComponentName);
        erg.should.be.exist;
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
    describe('_cifReady attribute is false', function () {
      beforeEach(function () {
        cif._cifReady = false;
      });
      it('should be false', function () {
        expect(cif.isReady()).to.be.false;
      });
    });

    describe('_cifReady attribute is true', function () {
      beforeEach(function () {
        cif._cifReady = true;
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
      cacheStub = sinon.stub(window.cubx.CRC, 'getCache').callsFake(function () {
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
      cacheStub = sinon.stub(window.cubx.CRC, 'getCache').callsFake(function () {
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
    var getComponentCacheEntryStub; // eslint-disable-line no-unused-vars
    var elementaryCompName;
    var compoundCompName;
    beforeEach(function () {
      elementaryCompName = 'cubixx-test-elementary';
      compoundCompName = 'cubixx-test-compound';

      getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (artifactId) {
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
    var getResolvedComponentStub; // eslint-disable-line no-unused-vars
    var elementaryCompName;
    var compoundCompName;
    beforeEach(function () {
      elementaryCompName = 'cubixx-test-elementary';
      compoundCompName = 'cubixx-test-compound';

      getResolvedComponentStub = sinon.stub(window.cubx.CRC, 'getResolvedComponent').callsFake(function (artifactId) {
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
  describe('#_registerCompoundComponentElement', function () {
    it('should be register with component name "-"', function () {
      /* eslint-disable no-unused-vars */
      var constructor = cif._registerCompoundComponentElement('ciftest-registercompound');
      /* eslint-enable no-unused-vars */
      var el = new constructor();

      el.should.have.deep.property('isCompoundComponent', true);
      var constructor2 = cif._registerCompoundComponentElement('ciftest-registercompound');
      expect(constructor).to.equal(constructor2);
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
  describe('manipulating _processMode property', function () {
    before(function () {
      cif._resetProcessMode();
    });
    afterEach(function () {
      cif._resetProcessMode();
    });
    it('#_processInitial set the _processMode to 1', function () {
      cif._processInitial();
      expect(cif._processMode).to.be.equals(1);
    });
    it('#_processObserverTriggered set the _processMode to 2', function () {
      cif._processObserverTriggered();
      expect(cif._processMode).to.be.equals(2);
    });
    it('#_isInitialProcessing get false if the _processMode is 0', function () {
      cif._resetProcessMode();
      expect(cif._isInitialProcessing()).to.be.false;
    });
    it('#_isInitialProcessing get true if the _processMode is 1', function () {
      cif._processInitial();
      expect(cif._isInitialProcessing()).to.be.true;
    });
    it('#_isInitialProcessing get false if the _processMode is 1', function () {
      cif._processObserverTriggered();
      expect(cif._isInitialProcessing()).to.be.false;
    });
    it('#_isObserverTriggeredProcessing get false if the processmode is 0', function () {
      cif._resetProcessMode();
      expect(cif._isObserverTriggeredProcessing()).to.be.false;
    });
    it('#_isObserverTriggeredProcessing get false if the processmode is 1', function () {
      cif._processInitial();
      expect(cif._isObserverTriggeredProcessing()).to.be.false;
    });
    it('#_isObserverTriggeredProcessing get true if the processmode is 2', function () {
      cif._processObserverTriggered();
      expect(cif._isObserverTriggeredProcessing()).to.be.true;
    });
  });
});
