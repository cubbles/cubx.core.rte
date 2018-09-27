/* globals HTMLDivElement, HTMLBodyElement */
/**
 * Created by pwr on 05.02.2015.
 */

window.cubx.amd.define([
  'CRC',
  'dependencyManager',
  'unit/utils/CubxNamespaceManager'
], function (crc, DepMgr, CubxNamespaceManager) {
  'use strict';

  // var crc = new CRC();

  describe('CRC', function () {
    describe('#init()', function () {
      describe('with crc root element: cubx-core-crc', function () {
        before(function () {
          CubxNamespaceManager.resetNamespace(crc);
          //
          var el = document.createElement('div');
          var attr = document.createAttribute('cubx-core-crc');
          el.setAttributeNode(attr);
          el.setAttribute('id', 'crc-test');
          el.setAttribute('style', 'display:none;');
          document.body.appendChild(el);
        });
        after(function () {
          CubxNamespaceManager.resetNamespace();
          var el = document.body.querySelector('#crc-test');
          document.body.removeChild(el);
        });
        it('should append crc root DOM node to given DOM node', function () {
          var el = document.querySelector('#crc-test');
          crc.init(el);
          document.querySelector('#crc-test').getAttribute('data-crc-id').should.be.equals(String(crc._crcElId));
          document.querySelector('#crc-test').getAttribute('data-crc-version').should.be.equals(crc._version);
        });
      });
      describe('whitout crc root element', function () {
        before(function () {
          CubxNamespaceManager.resetNamespace(crc);
        });
        after(function () {
          CubxNamespaceManager.resetNamespace();
          document.body.removeAttribute('data-crc-id');
          document.body.removeAttribute('data-crc-version');
        });
        it('should append crc root DOM node to given DOM node', function () {
          var el = document.body;
          crc.init(el);
          document.body.getAttribute('data-crc-id').should.be.equals(String(crc._crcElId));
          document.body.getAttribute('data-crc-version').should.be.equals(crc._version);
        });
      });
    });

    describe('#getCRCElement()', function () {
      describe('body is crc root', function () {
        before(function () {
          CubxNamespaceManager.resetNamespace(crc);
          crc.init(document.body);
        });
        after(function () {
          CubxNamespaceManager.resetNamespace();
          document.body.removeAttribute('data-crc-id');
          document.body.removeAttribute('data-crc-version');
        });
        it('', function () {
          expect(crc.getCRCElement()).to.be.exist;
          expect(crc.getCRCElement()).to.be.instanceof(HTMLBodyElement);
        });
      });
      describe('crc root marked with "cubx-core-crc" ', function () {
        before(function () {
          CubxNamespaceManager.resetNamespace(crc);
          //
          var el = document.createElement('div');
          var attr = document.createAttribute('cubx-core-crc');
          el.setAttributeNode(attr);
          el.setAttribute('id', 'crc-test');
          el.setAttribute('style', 'display:none;');
          document.body.appendChild(el);
          crc.init(el);
        });
        after(function () {
          CubxNamespaceManager.resetNamespace();
          var el = document.body.querySelector('#crc-test');
          document.body.removeChild(el);
        });
        it('should get the current crc root element as Element Object', function () {
          expect(crc.getCRCElement()).to.be.exist;
          expect(crc.getCRCElement()).to.be.instanceof(HTMLDivElement);
          crc.getCRCElement().getAttribute('id').should.equal('crc-test');
        });
      });
    });

    describe('#getDependencyMgr()', function () {
      it('should return the DependencyMgr instance of crc', function () {
        expect(crc.getDependencyMgr()).to.be.instanceOf(DepMgr);
      });
    });

    describe('#getNormedModelVersion', function () {
      it('model version 5.12.5 cut after minor version ', function () {
        expect(crc.getNormedModelVersion('5.12.5')).to.be.equal('5.12');
      });
      it('model version 5.12 will left by to 5.12 ', function () {
        expect(crc.getNormedModelVersion('5.12')).to.be.equal('5.12');
      });
      it('model version 5 will be completed to 5.0 ', function () {
        expect(crc.getNormedModelVersion('5')).to.be.equal('5.0');
      });
    });

    describe('#_isModelVersionSupported', function () {
      it('model version 8.0.0 is not allowed ', function () {
        expect(crc._isModelVersionSupported('8.0.0')).to.be.not.ok;
      });
      it('model version 9.0 not is allowed ', function () {
        expect(crc._isModelVersionSupported('8.0')).to.be.not.ok;
      });
      it('model version 3.0  is not allowed ', function () {
        expect(crc._isModelVersionSupported('3.0')).to.be.not.ok;
      });
      it('model version 4.1.0 is not allowed ', function () {
        expect(crc._isModelVersionSupported('4.1.0')).to.be.not.ok;
      });
      it('model version 10.0 is allowed ', function () {
        expect(crc._isModelVersionSupported('10.0')).to.be.ok;
      });
      it('model version 10.0.0 is allowed ', function () {
        expect(crc._isModelVersionSupported('10.0.0')).to.be.ok;
      });
    });
  });
});
