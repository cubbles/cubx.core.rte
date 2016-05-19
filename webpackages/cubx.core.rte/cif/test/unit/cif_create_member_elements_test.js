'use strict';

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
  describe('#_initComposite', function () {
    var container;
    var manifest;
    /*eslint no-unused-vars: ["error", { "varsIgnorePattern": "getResolvedComponentStub" }]*/
    var getResolvedComponentStub;
    var crc;
    var compoundEl;
    beforeEach(function () {
      crc = window.cubx.CRC;
      container = document.querySelector('[cubx-core-crc]');
      compoundEl = document.createElement('ciftest-a');
      container.appendChild(compoundEl);
      manifest = {
        webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
        artifactId: 'ciftest-a',
        artifactType: 'compoundComponent',
        modelVersion: '8.0.0',
        slots: [ {
          slotId: 'testslotA'
        } ],
        members: [ {
          componentId: 'test.package-ciftest-b@0.1/ciftest-b',
          artifactType: 'elementaryComponent',
          artifactId: 'ciftest-b',
          memberId: 'B-Element',
          slots: [ {
            slotId: 'testslotB'
          } ]
        }, {
          componentId: 'test.package-ciftest-c@0.1/ciftest-c',
          artifactType: 'compoundComponent',
          artifactId: 'ciftest-c',
          memberId: 'C-element',
          slots: [ {
            slotId: 'testslotC'
          } ],

          members: [ {
            componentId: 'test.package-ciftest-d@0.1/ciftest-d',
            memberId: 'D-Element',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-d',
            slots: [ {
              slotId: 'testslotD'
            } ]

          } ],
          connections: [ {
            connectionId: 'c-d', source: {
              slot: 'testslotC'
            }, destination: {
              memberIdRef: 'D-Element', slot: 'testslotD'
            }
          } ]
        } ],
        connections: [ {
          connectionId: 'b-c', source: {
            memberIdRef: 'B-Element', slot: 'testslotB'
          }, destination: {
            memberIdRef: 'C-Element', slot: 'testslotC'
          }
        } ]
      };
      getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent', function () {
        return manifest;
      });
    });
    afterEach(function () {
      var el = document.querySelector('ciftest-a');
      container.removeChild(el);
      crc.getResolvedComponent.restore();
    });
    it('should initialize the components', function (done) {
      cif._initComposite(container);
      window.setTimeout(function () {
        var ciftestA = container.firstElementChild;
        ciftestA.should.have.property('tagName', 'CIFTEST-A');
        var ciftestB = ciftestA.firstElementChild;
        ciftestB.should.have.property('tagName', 'CIFTEST-B');
        done();
      }, 500);
    });
  });
  // describe('#_initComposite', function () {
  //   // do nothing at the moment
  // });
  describe('#_createDOMTreeFromManifest', function () {
    var container;
    var manifest;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
      // var parentContext = new Context(container);
      // container.Context = parentContext;
      manifest = {
        webpackageId: 'test.package-ciftest-a@0.1',
        artifactId: 'ciftest-a',
        artifactType: 'compoundComponent',
        slots: [ {
          slotId: 'testslotA'
        } ],
        members: [ {
          webpackageId: 'test.package-ciftest-b@0.1',
          componentId: 'test.package-ciftest-b@0.1/ciftest-b',
          artifactType: 'elementary',
          artifactId: 'ciftest-b',
          memberId: 'b',
          slots: [ {
            name: 'testslotB'
          } ]
        }, {
          webpackageId: 'test.package-ciftest-c@0.1',
          componentId: 'test.package-ciftest-c@0.1/ciftest-c',
          artifactType: 'compound',
          artifactId: 'ciftest-c',
          memberId: 'c',
          slots: [ {
            slotId: 'testslotC'
          } ],

          members: [ {
            webpackageId: 'test.package-ciftest-d@0.1',
            componentId: 'test.package-ciftest-d@0.1/ciftest-d',
            memberId: 'd',
            artifactType: 'elementaryComponent',
            artifactId: 'ciftest-d',
            slots: [ {
              slotId: 'testslotD'
            } ]

          } ],
          connections: [ {
            connectionId: 'c-d', source: {
              slot: 'testslotC'
            }, destination: {
              memberIdRef: 'd', slot: 'testslotD'
            }
          } ],
          inits: [ {
            memberIdRef: 'd', slot: 'testslotD', value: 'yyy'
          } ]
        } ],
        connections: [ {
          connectionId: 'b-c', source: {
            memberIdRef: 'b', slot: 'testslotB'
          }, destination: {
            memberIdRef: 'd', slot: 'testslotC'
          }
        } ],
        inits: [ {
          memberIdRef: 'b', slot: 'testslotB', value: '_afterCreatedElementsReady'
        } ]
      };
    });

    it('correct dom tree will be created with custom attributes', function (done) {
      var memberId = '1';
      var componentId = manifest.webpackageId + '/' + manifest.artifactId;
      var id = componentId + '.' + memberId;
      var elem = document.createElement(manifest.artifactId);
      elem.setAttribute('foo', 'bar');
      container.appendChild(elem);
      elem.setAttribute('runtime-id', id);
      elem.setAttribute('cubx-component-id', 'test.package-ciftest-a@0.1/ciftest-a');
      elem.setAttribute('member-id', memberId);
      var domTree = cif._createDOMTreeFromManifest(manifest, elem);
      window.setTimeout(function () {
        domTree.should.have.property('tagName', manifest.artifactId.toUpperCase());
        expect(domTree.getAttribute('foo')).to.be.equal('bar');
        expect(domTree.getAttribute('cubx-component-id')).to.be.exist;
        domTree.getAttribute('cubx-component-id').should.equals(componentId);
        expect(domTree.getAttribute('runtime-id')).to.be.exist;
        domTree.getAttribute('runtime-id').should.equals(id);
        domTree.should.have.property('_connections');
        domTree._connections.should.deep.equals(manifest.connections);
        domTree._inits.should.deep.equals(manifest.inits);
        // members
        domTree.firstElementChild.should.have.property('tagName', manifest.members[ 0 ].artifactId.toUpperCase());
        expect(domTree.firstElementChild.getAttribute('cubx-component-id')).to.be.exist;
        domTree.firstElementChild.getAttribute('cubx-component-id').should.equals(manifest.members[ 0 ].componentId);
        expect(domTree.firstElementChild.getAttribute('runtime-id')).to.be.exist;
        domTree.firstElementChild.getAttribute('runtime-id').should.equals(id + ':' + manifest.members[ 0 ].componentId + '.' + manifest.members[ 0 ].memberId);
        expect(domTree.firstElementChild.getAttribute('member-id')).to.be.exist;
        domTree.firstElementChild.getAttribute('member-id').should.equals(manifest.members[ 0 ].memberId);
        domTree.firstElementChild.nextElementSibling.should.have.property('tagName', manifest.members[ 1 ].artifactId.toUpperCase());
        expect(domTree.firstElementChild.nextElementSibling.getAttribute('cubx-component-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.getAttribute('cubx-component-id').should
          .equals(manifest.members[ 1 ].componentId);
        expect(domTree.firstElementChild.nextElementSibling.getAttribute('runtime-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.getAttribute('runtime-id').should.equals(id + ':' + manifest.members[ 1 ].componentId + '.' + manifest.members[ 1 ].memberId);
        expect(domTree.firstElementChild.nextElementSibling.getAttribute('member-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.getAttribute('member-id').should
          .equals(manifest.members[ 1 ].memberId);
        domTree.firstElementChild.nextElementSibling.should.have.property('_connections');
        domTree.firstElementChild.nextElementSibling._connections.should.deep.equals(manifest.members[ 1 ].connections);
        domTree.firstElementChild.nextElementSibling._inits.should.deep.equals(manifest.members[ 1 ].inits);
        domTree.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', manifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
        expect(domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('cubx-component-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('cubx-component-id').should
          .equals(manifest.members[ 1 ].members[ 0 ].componentId);
        expect(domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('runtime-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('runtime-id').should.equals(id + ':' + manifest.members[ 1 ].componentId + '.' + manifest.members[ 1 ].memberId + ':' + manifest.members[ 1 ].members[ 0 ].componentId + '.' + manifest.members[ 1 ].members[ 0 ].memberId);
        expect(domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('member-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('member-id').should
          .equals(manifest.members[ 1 ].members[ 0 ].memberId);
        container.removeChild(elem);
        done();
      }, 500);
    });
  });
  describe('#_attachMembers', function () {
    describe('without template', function () {
      var container;
      var compoundEl;
      var rootManifest;
      before(function () {
        container = document.querySelector('[cubx-core-crc]');
        var parentContext = container.Context;
        // container.Context = parentContext;
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        var context = new Context(compoundEl, parentContext);
        compoundEl.Context = context;
        compoundEl.setAttribute('cubx-component-id', 'test-pacakge@0.1.0/ciftest-a');
        container.appendChild(compoundEl);
        rootManifest = {
          members: [
            {
              webpackageId: 'test.package-ciftest-b',
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'b'
            },
            {
              webpackageId: 'test.package-ciftest-c@0.1',
              componentId: 'test.package-ciftest-c@0.1/ciftest-c',
              artifactType: 'compound',
              artifactId: 'ciftest-c',
              memberId: 'c',
              members: [
                {
                  webpackageId: 'test.package-ciftest-d-0.1',
                  componentId: 'test.package-ciftest-d-0.1/ciftest-d',
                  memberId: 'd',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d'
                } ]
            } ]
        };
      });
      after(function () {
        container.removeChild(compoundEl);
      });
      it('members should be attached to dom.', function (done) {
        cif._attachMembers(compoundEl, rootManifest);
        window.setTimeout(function () {
          compoundEl.firstElementChild.should.have.exists;
          compoundEl.firstElementChild.should.have.property('tagName', rootManifest.members[ 0 ].artifactId.toUpperCase());
          compoundEl.firstElementChild.nextElementSibling.should.have.exists;
          compoundEl.firstElementChild.nextElementSibling.should.have.property('tagName', rootManifest.members[ 1 ].artifactId.toUpperCase());
          compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.exists;
          compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
          done();
        }, 500);
      });
    });
    describe('with template', function () {
      var container;
      var compoundEl;
      var rootManifest;
      /* eslint-disable no-unused-vars */
      var getComponentCacheEntryStub;
      /* eslint-enable no-unused-vars */
      describe('template in first level', function () {
        before(function () {
          container = document.querySelector('[cubx-core-crc]');
          var parentContext = new Context(container);
          container.Context = parentContext;
          var constructor = cif.getCompoundComponentElementConstructor('ciftest-template-a');
          compoundEl = new constructor();
          var context = new Context(compoundEl, parentContext);
          compoundEl.Context = context;
          compoundEl.setAttribute('cubx-component-id', 'test-pacakge@0.1.0/ciftest-template-a');
          compoundEl.setAttribute('runtime-id', 'test-pacakge@0.1.0/ciftest-template-a');
          container.appendChild(compoundEl);
          getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry', function (artifactId) {
            var manifest;
            switch (artifactId) {
              case 'ciftest-b' :
                manifest = {
                  webpackageId: 'test.package-ciftest-b',
                  componentId: 'test.package-ciftest-b@0.1/ciftest-b',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-b'
                };
                break;
              case 'ciftest-c':
                manifest = {
                  webpackageId: 'test.package-ciftest-c@0.1',
                  componentId: 'test.package-ciftest-c@0.1/ciftest-c',
                  artifactType: 'compound',
                  artifactId: 'ciftest-c',
                  members: [
                    {
                      webpackageId: 'test.package-ciftest-d-0.1',
                      componentId: 'test.package-ciftest-d-0.1/ciftest-d',
                      memberId: 'd',
                      artifactType: 'elementaryComponent',
                      artifactId: 'ciftest-d'
                    } ]
                };
                break;
              case 'ciftest-d':
                manifest = {
                  webpackageId: 'test.package-ciftest-d-0.1',
                  componentId: 'test.package-ciftest-d-0.1/ciftest-d',
                  memberId: 'd',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d'
                };
                break;
              default:
                manifest = {
                  artifactType: 'elementaryComponent',
                  artifactId: artifactId
                };
            }
            return manifest;
          });
          rootManifest = {
            members: [
              {
                webpackageId: 'test.package-ciftest-b',
                componentId: 'test.package-ciftest-b@0.1/ciftest-b',
                artifactType: 'elementaryComponent',
                artifactId: 'ciftest-b',
                memberId: 'b'
              },
              {
                webpackageId: 'test.package-ciftest-c@0.1',
                componentId: 'test.package-ciftest-c@0.1/ciftest-c',
                artifactType: 'compound',
                artifactId: 'ciftest-c',
                memberId: 'c',
                members: [
                  {
                    webpackageId: 'test.package-ciftest-d-0.1',
                    componentId: 'test.package-ciftest-d-0.1/ciftest-d',
                    memberId: 'd',
                    artifactType: 'elementaryComponent',
                    artifactId: 'ciftest-d'
                  } ]
              } ]
          };
        });
        after(function () {
          container.removeChild(compoundEl);
          window.cubx.CRC.getCache().getComponentCacheEntry.restore();
        });
        it('members should be attached as part of a template to dom.', function (done) {
          cif._attachMembers(compoundEl, rootManifest);
          window.setTimeout(function () {
            compoundEl.firstElementChild.should.have.exists;
            compoundEl.firstElementChild.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.firstElementChild.should.have.exists;
            compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 0 ].artifactId.toUpperCase());
            compoundEl.firstElementChild.nextElementSibling.should.have.exists;
            compoundEl.firstElementChild.nextElementSibling.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.exists;
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].artifactId.toUpperCase());
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.exists;
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
            done();
          }, 500);
        });
      });
      describe('template in first and second level', function () {
        before(function () {
          container = document.querySelector('[cubx-core-crc]');
          var parentContext = new Context(container);
          container.Context = parentContext;
          var constructor = cif.getCompoundComponentElementConstructor('ciftest-template-a-2');
          compoundEl = new constructor();
          var context = new Context(compoundEl, parentContext);
          compoundEl.Context = context;
          compoundEl.setAttribute('cubx-component-id', 'test-pacakge@0.1.0/ciftest-template-a-2');
          compoundEl.setAttribute('runtime-id', 'test-pacakge@0.1.0/ciftest-template-a-2');
          container.appendChild(compoundEl);
          getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry', function (artifactId) {
            var manifest;
            switch (artifactId) {
              case 'ciftest-b' :
                manifest = {
                  webpackageId: 'test.package-ciftest-b',
                  componentId: 'test.package-ciftest-b@0.1/ciftest-b',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-b'
                };
                break;
              case 'ciftest-template-c':
                manifest = {
                  webpackageId: 'test.package-ciftest-template-c@0.1',
                  componentId: 'test.package-ciftest-template-c@0.1/ciftest-template-c',
                  artifactType: 'compound',
                  artifactId: 'ciftest-template-c',
                  members: [
                    {
                      webpackageId: 'test.package-ciftest-d-0.1',
                      componentId: 'test.package-ciftest-d-0.1/ciftest-d',
                      memberId: 'd',
                      artifactType: 'elementaryComponent',
                      artifactId: 'ciftest-d'
                    } ]
                };
                break;
              case 'ciftest-d':
                manifest = {
                  webpackageId: 'test.package-ciftest-d-0.1',
                  componentId: 'test.package-ciftest-d-0.1/ciftest-d',
                  memberId: 'd',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d'
                };
                break;
              default:
                manifest = {
                  artifactType: 'elementaryComponent',
                  artifactId: artifactId
                };
            }
            return manifest;
          });
          rootManifest = {
            members: [
              {
                webpackageId: 'test.package-ciftest-b',
                componentId: 'test.package-ciftest-b@0.1/ciftest-b',
                artifactType: 'elementaryComponent',
                artifactId: 'ciftest-b',
                memberId: 'b'
              },
              {
                webpackageId: 'test.package-ciftest-template-c@0.1',
                componentId: 'test.package-ciftest-template-c@0.1/ciftest-template-c',
                artifactType: 'compound',
                artifactId: 'ciftest-template-c',
                memberId: 'c',
                members: [
                  {
                    webpackageId: 'test.package-ciftest-d-0.1',
                    componentId: 'test.package-ciftest-d-0.1/ciftest-d',
                    memberId: 'd',
                    artifactType: 'elementaryComponent',
                    artifactId: 'ciftest-d'
                  } ]
              } ]
          };
        });
        after(function () {
          container.removeChild(compoundEl);
          window.cubx.CRC.getCache().getComponentCacheEntry.restore();
        });
        it('members should be attached as part of a template to dom.', function (done) {
          cif._attachMembers(compoundEl, rootManifest);
          window.setTimeout(function () {
            compoundEl.firstElementChild.should.have.exists;
            compoundEl.firstElementChild.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.firstElementChild.should.have.exists;
            compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 0 ].artifactId.toUpperCase());
            compoundEl.firstElementChild.nextElementSibling.should.have.exists;
            compoundEl.firstElementChild.nextElementSibling.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.exists;

            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].artifactId.toUpperCase());

            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.exists;
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.should.have.exists;

            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
            done();
          }, 500);
        });
      });
    });
  });
});
