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
      expect(cif._initializer).to.be.exist;
      expect(cif._initializer).to.be.an('object');
      expect(cif._initializer).to.be.instanceOf(window.cubx.cif.Initializer);
    });
  });
  describe('#_initCubxElements', function () {
    describe('crcRoot contains just one cubbles', function () {
      var container;
      var crc;
      var manifest;
      var compoundEl;
      /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "getResolvedComponentStub" }] */
      var getResolvedComponentStub;
      beforeEach(function () {
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
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
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function () {
          return manifest;
        });
      });
      afterEach(function () {
        var el = container.querySelector('ciftest-a');
        container.removeChild(el);
        crc.getResolvedComponent.restore();
        container.Context._children = [];
        container.Context._components = [];
      });
      describe('whitout id, member-id, runtime-id attributes', function () {
        it('should initialize the components', function (done) {
          cif._initCubxElements(container);
          window.setTimeout(function () {
            var ciftestA = container.firstElementChild;
            ciftestA.should.have.property('tagName', 'CIFTEST-A');
            ciftestA.getAttribute('member-id').should.be.exist;
            ciftestA.getAttribute('member-id').should.have.length(36);
            ciftestA.getAttribute('runtime-id').should.be.exist;
            ciftestA.getAttribute('runtime-id').should.be.equals(manifest.webpackageId + '/' + manifest.artifactId + '.' + ciftestA.getAttribute('member-id'));
            ciftestA.should.have.property('processed', true);
            var ciftestB = ciftestA.firstElementChild;
            ciftestB.should.have.property('tagName', 'CIFTEST-B');
            ciftestB.should.have.property('processed', true);
            done();
          }, 200);
        });
      });
      describe('whith id, without member-id, runtime-id attributes', function () {
        var memberId;
        beforeEach(function () {
          memberId = 'test-member-id';
          compoundEl.setAttribute('id', memberId);
        });

        it('should initialize the components', function (done) {
          cif._initCubxElements(container);
          window.setTimeout(function () {
            var ciftestA = container.firstElementChild;
            ciftestA.should.have.property('tagName', 'CIFTEST-A');
            ciftestA.getAttribute('member-id').should.be.exist;
            ciftestA.getAttribute('member-id').should.be.equals(memberId);
            ciftestA.getAttribute('runtime-id').should.be.exist;
            ciftestA.getAttribute('runtime-id').should.be.equals(manifest.webpackageId + '/' + manifest.artifactId + '.' + memberId);
            ciftestA.should.have.property('processed', true);
            var ciftestB = ciftestA.firstElementChild;
            ciftestB.should.have.property('tagName', 'CIFTEST-B');
            ciftestB.should.have.property('processed', true);
            done();
          }, 100);
        });
      });
      describe('whith id and member-id, without runtime-id attributes', function () {
        var memberId;
        var id;
        beforeEach(function () {
          id = 'test-id';
          compoundEl.setAttribute('id', id);
          memberId = 'test-member-id';
          compoundEl.setAttribute('member-id', memberId);
        });

        it('should initialize the components', function (done) {
          cif._initCubxElements(container);
          window.setTimeout(function () {
            var ciftestA = container.firstElementChild;
            ciftestA.should.have.property('tagName', 'CIFTEST-A');
            ciftestA.getAttribute('member-id').should.be.exist;
            ciftestA.getAttribute('member-id').should.be.equals(memberId);
            ciftestA.getAttribute('runtime-id').should.be.exist;
            ciftestA.getAttribute('runtime-id').should.be.equals(manifest.webpackageId + '/' + manifest.artifactId + '.' + memberId);
            ciftestA.should.have.property('processed', true);
            var ciftestB = ciftestA.firstElementChild;
            ciftestB.should.have.property('tagName', 'CIFTEST-B');
            ciftestB.should.have.property('processed', true);
            done();
          }, 100);
        });
      });
      describe('whitout  member-id, runtime-id and  with id and existing correct runtime-id attribute', function () {
        var runtimeId;
        var id;
        beforeEach(function () {
          id = 'customId';
          runtimeId = manifest.webpackageId + '/' + manifest.artifactId + '.' + id;
          compoundEl.setAttribute('id', id);
          compoundEl.setAttribute('runtime-id', runtimeId);
        });

        it('should initialize the components', function (done) {
          cif._initCubxElements(container);
          window.setTimeout(function () {
            var ciftestA = container.firstElementChild;
            ciftestA.should.have.property('tagName', 'CIFTEST-A');
            ciftestA.getAttribute('member-id').should.be.exist;
            ciftestA.getAttribute('member-id').should.be.equals(id);
            ciftestA.getAttribute('runtime-id').should.be.exist;
            ciftestA.getAttribute('runtime-id').should.be.equals(runtimeId);
            ciftestA.should.have.property('processed', true);
            var ciftestB = ciftestA.firstElementChild;
            ciftestB.should.have.property('tagName', 'CIFTEST-B');
            ciftestB.should.have.property('processed', true);
            done();
          }, 100);
        });
      });
      describe('whitout id, member-id, runtime-id and  with existing uncorrect runtime-id attribute', function () {
        var runtimeId;
        // eslint-disable-next-line no-unsused-vars
        var spy;
        beforeEach(function () {
          runtimeId = 'some/uncorrect.runtimeid';
          compoundEl.setAttribute('runtime-id', runtimeId);
          spy = sinon.spy(console, 'warn');
        });
        afterEach(function () {
          console.warn.restore();
        });
        it('should initialize the components', function (done) {
          cif._initCubxElements(container);
          window.setTimeout(function () {
            var ciftestA = container.firstElementChild;
            ciftestA.should.have.property('tagName', 'CIFTEST-A');
            ciftestA.getAttribute('member-id').should.be.exist;
            ciftestA.getAttribute('member-id').should.have.length(36);
            ciftestA.getAttribute('runtime-id').should.be.exist;
            ciftestA.getAttribute('runtime-id').should.be.equals(manifest.webpackageId + '/' + manifest.artifactId + '.' + ciftestA.getAttribute('member-id'));
            ciftestA.should.have.property('processed', true);
            var ciftestB = ciftestA.firstElementChild;
            ciftestB.should.have.property('tagName', 'CIFTEST-B');
            ciftestB.should.have.property('processed', true);
            spy.should.calledOnce;
            done();
          }, 100);
        });
      });
    });
    describe('crcRoot contains one cubbles and other html elements', function () {
      var container;
      var manifest;
      /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "getResolvedComponentStub" }] */
      var getResolvedComponentStub;
      var crc;
      var compoundEl;
      beforeEach(function () {
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        container.appendChild(document.createElement('div'));
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
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function () {
          return manifest;
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[0] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        container.Context._children = [];
        container.Context._components = [];
      });
      it('should initialize the components', function (done) {
        cif._initCubxElements(container);
        window.setTimeout(function () {
          var ciftestA = container.firstElementChild;
          ciftestA.should.have.property('tagName', 'CIFTEST-A');
          ciftestA.should.have.property('processed', true);
          var ciftestB = ciftestA.firstElementChild;
          ciftestB.should.have.property('tagName', 'CIFTEST-B');
          ciftestB.should.have.property('processed', true);
          done();
        }, 100);
      });
    });
    describe('crcRoot contains 2 different cubbles', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "getResolvedComponentStub" }] */
      var getResolvedComponentStub;
      var crc;
      var compoundEl;
      beforeEach(function () {
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        var compoundEl2 = new constructor();
        container.appendChild(compoundEl2);
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [ {
            slotId: 'testslotA'
          } ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [
                {
                  slotId: 'testslotB'
                }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-a',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-a',
              memberId: 'A-element',
              slots: [
                {
                  slotId: 'testslotA'
                }
              ],

              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [
                    {
                      slotId: 'testslotD'
                    }
                  ]
                }
              ],
              connections: [
                {
                  connectionId: 'a-d',
                  source: {
                    slot: 'testslotA'
                  },
                  destination: {
                    memberIdRef: 'D-Element', slot: 'testslotD'
                  }
                }
              ]
            }
          ],
          connections: [
            {
              connectionId: 'b-a',
              source: {
                memberIdRef: 'B-Element',
                slot: 'testslotB'
              },
              destination: {
                memberIdRef: 'A-Element',
                slot: 'testslotA'
              }
            }
          ]
        };
        manifestCiftestA = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-a',
          artifactId: 'ciftest-a',
          artifactType: 'compoundComponent',
          modelVersion: '8.0.0',
          slots: [
            {
              slotId: 'testslotA'
            }
          ],
          members: [
            {
              componentId: 'test.package-ciftest-b@0.1/ciftest-b',
              artifactType: 'elementaryComponent',
              artifactId: 'ciftest-b',
              memberId: 'B-Element',
              slots: [ {
                slotId: 'testslotB'
              }
              ]
            },
            {
              componentId: 'test.package-ciftest-c@0.1/ciftest-c',
              artifactType: 'compoundComponent',
              artifactId: 'ciftest-c',
              memberId: 'C-element',
              slots: [
                {
                  slotId: 'testslotC'
                }
              ],
              members: [
                {
                  componentId: 'test.package-ciftest-d@0.1/ciftest-d',
                  memberId: 'D-Element',
                  artifactType: 'elementaryComponent',
                  artifactId: 'ciftest-d',
                  slots: [
                    {
                      slotId: 'testslotD'
                    }
                  ]
                }
              ],
              connections: [
                {
                  connectionId: 'c-d',
                  source: {
                    slot: 'testslotC'
                  },
                  destination: {
                    memberIdRef: 'D-Element', slot: 'testslotD'
                  }
                }
              ]
            }
          ],
          connections: [
            {
              connectionId: 'b-c',
              source: {
                memberIdRef: 'B-Element',
                slot: 'testslotB'
              },
              destination: {
                memberIdRef: 'C-Element',
                slot: 'testslotC'
              }
            }
          ]
        };
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[0] === el) {
            elList = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        container.Context._children = [];
        container.Context._components = [];
      });
      it('should initialize the components', function (done) {
        cif._initCubxElements(container);
        window.setTimeout(function () {
          var ciftestA = container.firstElementChild;
          ciftestA.should.have.property('tagName', 'CIFTEST-A');
          ciftestA.getAttribute('member-id').should.have.exist;
          ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
          ciftestA.should.have.property('processed', true);
          var ciftestB = ciftestA.firstElementChild;
          ciftestB.should.have.property('tagName', 'CIFTEST-B');
          ciftestB.should.have.property('processed', true);
          var ciftestE = ciftestA.nextElementSibling;
          ciftestE.should.have.property('tagName', 'CIFTEST-E');
          ciftestE.getAttribute('member-id').should.have.exist;
          ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
          ciftestE.should.have.property('processed', true);
          var ciftestB2 = ciftestE.firstElementChild;
          ciftestB2.should.have.property('tagName', 'CIFTEST-B');
          ciftestB2.should.have.property('processed', true);
          var ciftestA2 = ciftestB2.nextElementSibling;
          ciftestA2.should.have.property('tagName', 'CIFTEST-A');
          ciftestA2.should.have.property('processed', true);
          done();
        }, 100);
      });
    });
    describe('crcRoot contains 2 identical cubbles', function () {
      var container;
      var manifest;
      /* eslint no-unused-vars: ["error", { "varsIgnorePattern": "getResolvedComponentStub" }] */
      var getResolvedComponentStub;
      var crc;
      var compoundEl;
      beforeEach(function () {
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);

        var compoundEl2 = new constructor();
        container.appendChild(compoundEl2);

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
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function () {
          return manifest;
        });
      });
      afterEach(function () {
        var elList = container.children;
        while (elList[ 0 ]) {
          var el = elList[ 0 ];
          container.removeChild(el);
          if (elList[0] === el) {
            elList = container.children;
          }
        }
        container.Context._children = [];
        container.Context._components = [];
        crc.getResolvedComponent.restore();
      });
      it('should initialize the components', function (done) {
        cif._initCubxElements(container);
        window.setTimeout(function () {
          var ciftestA = container.firstElementChild;
          ciftestA.should.have.property('tagName', 'CIFTEST-A');
          ciftestA.should.have.property('processed', true);
          var ciftestB = ciftestA.firstElementChild;
          ciftestB.should.have.property('tagName', 'CIFTEST-B');
          ciftestB.should.have.property('processed', true);
          var ciftestA2 = ciftestA.nextElementSibling;
          ciftestA2.should.have.property('tagName', 'CIFTEST-A');
          ciftestA2.should.have.property('processed', true);
          var ciftestB2 = ciftestA2.firstElementChild;
          ciftestB2.should.have.property('tagName', 'CIFTEST-B');
          ciftestB2.should.have.property('processed', true);
          done();
        }, 100);
      });
    });
    describe('crcRoot contains 3 cubbles', function () {
      var container;
      var manifestCiftestE;
      var manifestCiftestA;
      // eslint-disable-next-line no-unused-vars
      var getResolvedComponentStub;
      var crc;
      var compoundEl;
      var compoundEl2;
      var compoundEl3;
      beforeEach(function () {
        crc = window.cubx.CRC;
        container = document.querySelector('[cubx-core-crc]');
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-e');
        compoundEl2 = new constructor();
        container.appendChild(compoundEl2);
        compoundEl3 = new constructor();
        container.appendChild(compoundEl3);
        manifestCiftestE = {
          webpackageId: 'test.package-ciftest-a@0.1/ciftest-e',
          artifactId: 'ciftest-e',
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
            componentId: 'test.package-ciftest-c@0.1/ciftest-a',
            artifactType: 'compoundComponent',
            artifactId: 'ciftest-a',
            memberId: 'A-element',
            slots: [ {
              slotId: 'testslotA'
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
              connectionId: 'a-d',
              source: {
                slot: 'testslotA'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-a',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'A-Element', slot: 'testslotA'
            }
          } ]
        };
        manifestCiftestA = {
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
              connectionId: 'c-d',
              source: {
                slot: 'testslotC'
              },
              destination: {
                memberIdRef: 'D-Element', slot: 'testslotD'
              }
            } ]
          } ],
          connections: [ {
            connectionId: 'b-c',
            source: {
              memberIdRef: 'B-Element', slot: 'testslotB'
            },
            destination: {
              memberIdRef: 'C-Element', slot: 'testslotC'
            }
          } ]
        };
        getResolvedComponentStub = sinon.stub(crc, 'getResolvedComponent').callsFake(function (componentId) {
          var ergManifest;
          switch (componentId) {
            case 'ciftest-a' :
              ergManifest = manifestCiftestA;
              break;
            case 'ciftest-e' :
              ergManifest = manifestCiftestE;
              break;
            default:
              break;
          }
          return ergManifest;
        });
      });
      afterEach(function () {
        var elems = container.children;
        while (elems[ 0 ]) {
          var el = elems[ 0 ];
          container.removeChild(el);
          if (elems[0] === el) {
            elems = container.children;
          }
        }
        crc.getResolvedComponent.restore();
        container.Context._children = [];
        container.Context._components = [];
      });
      describe('all elements without member-id', function () {
        it('should initialize the components', function (done) {
          cif._initCubxElements(container);
          window.setTimeout(function () {
            var ciftestA = container.firstElementChild;
            ciftestA.should.have.property('tagName', 'CIFTEST-A');
            ciftestA.getAttribute('member-id').should.have.exist;
            ciftestA.getAttribute('runtime-id').should.be.equals(manifestCiftestA.webpackageId + '/' + manifestCiftestA.artifactId + '.' + ciftestA.getAttribute('member-id'));
            ciftestA.should.have.property('processed', true);
            var ciftestB = ciftestA.firstElementChild;
            ciftestB.should.have.property('tagName', 'CIFTEST-B');
            ciftestB.should.have.property('processed', true);
            var ciftestE = ciftestA.nextElementSibling;
            ciftestE.should.have.property('tagName', 'CIFTEST-E');
            ciftestE.getAttribute('member-id').should.have.exist;
            ciftestE.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE.getAttribute('member-id'));
            ciftestE.should.have.property('processed', true);
            var ciftestB2 = ciftestE.firstElementChild;
            ciftestB2.should.have.property('tagName', 'CIFTEST-B');
            ciftestB2.should.have.property('processed', true);
            var ciftestA2 = ciftestB2.nextElementSibling;
            ciftestA2.should.have.property('tagName', 'CIFTEST-A');
            ciftestA2.should.have.property('processed', true);
            var ciftestE2 = ciftestE.nextElementSibling;
            ciftestE2.should.have.property('tagName', 'CIFTEST-E');
            ciftestE2.getAttribute('member-id').should.have.exist;
            ciftestE2.getAttribute('runtime-id').should.be.equals(manifestCiftestE.webpackageId + '/' + manifestCiftestE.artifactId + '.' + ciftestE2.getAttribute('member-id'));
            ciftestE2.should.have.property('processed', true);
            done();
          }, 100);
        });
      });
      describe('two elements has the same member-id', function () {
        var memberId;
        beforeEach(function () {
          memberId = 'testId';
          compoundEl.setAttribute('member-id', memberId);
          compoundEl2.setAttribute('member-id', memberId);
        });
        it('should initialize the components', function () {
          expect(function () {
            cif._initCubxElements(container);
          }).to.throw(Error, /The same memberId used before./);
        });
      });
    });
  });
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
            connectionId: 'c-d',
            source: {
              slot: 'testslotC'
            },
            destination: {
              memberIdRef: 'd', slot: 'testslotD'
            }
          } ],
          inits: [ {
            memberIdRef: 'd', slot: 'testslotD', value: 'yyy'
          } ]
        } ],
        connections: [ {
          connectionId: 'b-c',
          source: {
            memberIdRef: 'b', slot: 'testslotB'
          },
          destination: {
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
        expect(domTree.getAttribute('runtime-id')).to.be.exist;
        domTree.getAttribute('runtime-id').should.equals(id);
        domTree.should.have.property('_connections');
        domTree._connections.should.deep.equals(manifest.connections);
        domTree._inits.should.deep.equals(manifest.inits);
        // members
        domTree.firstElementChild.should.have.property('tagName', manifest.members[ 0 ].artifactId.toUpperCase());
        expect(domTree.firstElementChild.getAttribute('runtime-id')).to.be.exist;
        domTree.firstElementChild.getAttribute('runtime-id').should.equals(id + ':' + manifest.members[ 0 ].componentId + '.' + manifest.members[ 0 ].memberId);
        expect(domTree.firstElementChild.getAttribute('member-id')).to.be.exist;
        domTree.firstElementChild.getAttribute('member-id').should.equals(manifest.members[ 0 ].memberId);
        domTree.firstElementChild.nextElementSibling.should.have.property('tagName', manifest.members[ 1 ].artifactId.toUpperCase());
        expect(domTree.firstElementChild.nextElementSibling.getAttribute('runtime-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.getAttribute('runtime-id').should.equals(id + ':' + manifest.members[ 1 ].componentId + '.' + manifest.members[ 1 ].memberId);
        expect(domTree.firstElementChild.nextElementSibling.getAttribute('member-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.getAttribute('member-id').should
          .equals(manifest.members[ 1 ].memberId);
        domTree.firstElementChild.nextElementSibling.should.have.property('_connections');
        domTree.firstElementChild.nextElementSibling._connections.should.deep.equals(manifest.members[ 1 ].connections);
        domTree.firstElementChild.nextElementSibling._inits.should.deep.equals(manifest.members[ 1 ].inits);
        domTree.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', manifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
        expect(domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('runtime-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('runtime-id').should.equals(id + ':' + manifest.members[ 1 ].componentId + '.' + manifest.members[ 1 ].memberId + ':' + manifest.members[ 1 ].members[ 0 ].componentId + '.' + manifest.members[ 1 ].members[ 0 ].memberId);
        expect(domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('member-id')).to.be.exist;
        domTree.firstElementChild.nextElementSibling.firstElementChild.getAttribute('member-id').should
          .equals(manifest.members[ 1 ].members[ 0 ].memberId);
        container.removeChild(elem);
        container.Context._children = [];
        container.Context._components = [];
        done();
      }, 100);
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
        container.Context._children = [];
        container.Context._components = [];
      });
      it('members should be attached to dom.', function (done) {
        cif._attachMembers(compoundEl, rootManifest);
        window.setTimeout(function () {
          compoundEl.firstElementChild.should.have.exist;
          compoundEl.firstElementChild.should.have.property('tagName', rootManifest.members[ 0 ].artifactId.toUpperCase());
          compoundEl.firstElementChild.nextElementSibling.should.have.exist;
          compoundEl.firstElementChild.nextElementSibling.should.have.property('tagName', rootManifest.members[ 1 ].artifactId.toUpperCase());
          compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.exist;
          compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
          done();
        }, 100);
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
          var parentContext = container.Context;

          var constructor = cif.getCompoundComponentElementConstructor('ciftest-template-a');
          compoundEl = new constructor();
          var context = new Context(compoundEl, parentContext);
          compoundEl.Context = context;
          compoundEl.setAttribute('cubx-component-id', 'test-pacakge@0.1.0/ciftest-template-a');
          compoundEl.setAttribute('runtime-id', 'test-pacakge@0.1.0/ciftest-template-a');
          container.appendChild(compoundEl);
          getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (artifactId) {
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
          container.Context._children = [];
          container.Context._components = [];
        });
        it('members should be attached as part of a template to dom.', function (done) {
          cif._attachMembers(compoundEl, rootManifest);
          window.setTimeout(function () {
            compoundEl.firstElementChild.should.have.exist;
            compoundEl.firstElementChild.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.firstElementChild.should.have.exist;
            compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 0 ].artifactId.toUpperCase());
            compoundEl.firstElementChild.nextElementSibling.should.have.exist;
            compoundEl.firstElementChild.nextElementSibling.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.exist;
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].artifactId.toUpperCase());
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.exist;
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
            done();
          }, 100);
        });
      });
      describe('template in first and second level', function () {
        before(function () {
          container = document.querySelector('[cubx-core-crc]');
          var parentContext = container.Context;
          // container.Context = parentContext;
          var constructor = cif.getCompoundComponentElementConstructor('ciftest-template-a-2');
          compoundEl = new constructor();
          var context = new Context(compoundEl, parentContext);
          compoundEl.Context = context;
          compoundEl.setAttribute('cubx-component-id', 'test-pacakge@0.1.0/ciftest-template-a-2');
          compoundEl.setAttribute('runtime-id', 'test-pacakge@0.1.0/ciftest-template-a-2');
          container.appendChild(compoundEl);
          getComponentCacheEntryStub = sinon.stub(window.cubx.CRC.getCache(), 'getComponentCacheEntry').callsFake(function (artifactId) {
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
          container.Context._children = [];
          container.Context._components = [];
        });
        it('members should be attached as part of a template to dom.', function (done) {
          cif._attachMembers(compoundEl, rootManifest);
          window.setTimeout(function () {
            compoundEl.firstElementChild.should.have.exist;
            compoundEl.firstElementChild.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.firstElementChild.should.have.exist;
            compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 0 ].artifactId.toUpperCase());
            compoundEl.firstElementChild.nextElementSibling.should.have.exist;
            compoundEl.firstElementChild.nextElementSibling.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.exist;

            compoundEl.firstElementChild.nextElementSibling.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].artifactId.toUpperCase());

            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.exist;
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.should.have.property('tagName', 'DIV');
            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.should.have.exist;

            compoundEl.firstElementChild.nextElementSibling.firstElementChild.firstElementChild.firstElementChild.should.have.property('tagName', rootManifest.members[ 1 ].members[ 0 ].artifactId.toUpperCase());
            done();
          }, 100);
        });
      });
    });
  });
  describe('#_afterCreatedElementsReady', function () {
    var _createConnectionElementsStub;
    var _initConnectionsStub;
    var _createInitElementsStub;
    var _createObserverObjectStub;
    var _processElementFromQueueStub;
    var cifReadyEmmiterSpy;
    var cifDomUpdateReadyEmmiterSpy;
    var _resetProcessModeSpy;
    beforeEach(function () {
      _createConnectionElementsStub = sinon.stub(cif, '_createConnectionElements').callsFake(function () {
        // do nothing
      });
      _initConnectionsStub = sinon.stub(cif, '_initConnections').callsFake(function () {
        // do nothing
      });
      _createInitElementsStub = sinon.stub(cif, '_createInitElements').callsFake(function () {
        // do nothing
      });
      _createObserverObjectStub = sinon.stub(cif, '_createObserverObject').callsFake(function () {
        // do nothing
      });
      _processElementFromQueueStub = sinon.stub(cif, '_processElementFromQueue').callsFake(function () {
        // do nothing
      });
      _resetProcessModeSpy = sinon.spy(cif, '_resetProcessMode');
      cifReadyEmmiterSpy = sinon.stub();
      document.addEventListener('cifReady', cifReadyEmmiterSpy);
      cifDomUpdateReadyEmmiterSpy = sinon.spy();
      document.addEventListener('cifDomUpdateReady', cifDomUpdateReadyEmmiterSpy);
    });
    afterEach(function () {
      cif._createConnectionElements.restore();
      cif._initConnections.restore();
      cif._createInitElements.restore();
      cif._createObserverObject.restore();
      cif._processElementFromQueue.restore();
      cif._resetProcessMode.restore();
    });
    describe('cif processing initial', function () {
      beforeEach(function () {
        var crcRoot = cif.getCRCRootNode();
        cif._processInitial();
        cif._afterCreatedElementsReady(crcRoot);
      });
      afterEach(function () {
        cif._resetProcessMode();
      });
      it('the method #_createConnectionElements should be called once', function () {
        _createConnectionElementsStub.should.be.calledOnce;
      });
      it('the method #_initConnections should be called once', function () {
        _initConnectionsStub.should.be.calledOnce;
      });
      it('the method #_createInitElements should be called once', function () {
        _createInitElementsStub.should.be.calledOnce;
      });
      it('the method #_createObserverObject should be called once', function () {
        _createObserverObjectStub.should.be.calledOnce;
      });
      it('the method #_processElementFromQueue should be not called', function () {
        _processElementFromQueueStub.should.be.not.called;
      });
      it('the method #_resetProcessMode should be called once', function () {
        _resetProcessModeSpy.should.be.calledOnce;
      });
      it('the event "cifReady" should be fired', function (done) {
        window.setTimeout(function () {
          cifReadyEmmiterSpy.should.be.calledOnce;
          done();
        });
      });
      it('the event "cifDomUpdateReady" should be not fired', function (done) {
        window.setTimeout(function () {
          cifDomUpdateReadyEmmiterSpy.should.be.not.called;
          done();
        });
      });
    });
    describe('cif processing triggered by observer', function () {
      beforeEach(function () {
        var crcRoot = cif.getCRCRootNode();
        cif._processObserverTriggered();
        cif._afterCreatedElementsReady(crcRoot);
      });
      afterEach(function () {
        cif._resetProcessMode();
      });
      it('the method #_createConnectionElements should be called once', function () {
        _createConnectionElementsStub.should.be.calledOnce;
      });
      it('the method #_initConnections should be called once', function () {
        _initConnectionsStub.should.be.calledOnce;
      });
      it('the method #_createInitElements should be called once', function () {
        _createInitElementsStub.should.be.calledOnce;
      });
      it('the method #_createObserverObject should be not called', function () {
        _createObserverObjectStub.should.be.not.called;
      });
      it('the method #_processElementFromQueue should be called once', function () {
        _processElementFromQueueStub.should.be.calledOnce;
      });
      it('the method #_resetProcessMode should be called once', function () {
        _resetProcessModeSpy.should.be.calledOnce;
      });
      it('the event "cifReady" should be not fired', function (done) {
        window.setTimeout(function () {
          cifReadyEmmiterSpy.should.be.not.called;
          done();
        });
      });
      it('the event "cifDomUpdateReady" should be fired', function (done) {
        window.setTimeout(function () {
          cifDomUpdateReadyEmmiterSpy.should.be.calledOnce;
          done();
        });
      });
    });
  });
});
