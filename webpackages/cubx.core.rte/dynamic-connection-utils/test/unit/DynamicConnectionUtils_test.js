/* globals _,getContainer,createNewElement,registerCompoundComponentElement,initNewElement, HTMLImports */
/* eslint no-unused-vars: [2, {"varsIgnoredPattern":"initNewElement|getContainer|registerCompoundComponentElement|createNewElement|getContainer"}] */
'use strict';
describe('DynamicConnectionUtils', function () {
  var dynamicConnectionUtil;
  var Context;
  this.timeout(3000);
  before(function (done) {
    dynamicConnectionUtil = window.cubx.dynamicConnectionUtil;
    Context = window.cubx.cif.Context;
    HTMLImports.whenReady(function () {
      done();
    });
  });
  describe('helper methoden', function () {
    var element;
    before(function () {
      initNewElement('elem-one');
      element = document.querySelector('elem-one');
    });

    describe('#_getParentContextRuntimeId', function () {
      it('should get the correct runtimeId for context element', function () {
        var runtimeId = 'com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-outer-6:com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-6.member2:com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/cif-test-a.member1';

        var result = element._getParentContextRuntimeId(runtimeId);
        expect(result).to.equal('com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-outer-6:com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-6.member2');
      });
      it('should get the undefined for elements in rootcontext', function () {
        var runtimeId = 'com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-outer-6';
        var result = element._getParentContextRuntimeId(runtimeId);
        expect(result).to.be.undefined;
      });
    });
    describe('#_getMemberIdFromRuntimeId', function () {
      it('should get the correct memberId ', function () {
        var runtimeId = 'com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-outer-6:com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-6.member2:com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/cif-test-a.member1';
        var result = element._getMemberIdFromRuntimeId(runtimeId);
        expect(result).to.equal('member1');
      });
      it('should get undefined, if the element with runtimeId is in rootcontext ', function () {
        var runtimeId = 'com.incowia.cif-test.cif-init-test@1.2.0-SNAPSHOT/' +
          'cif-test-compound-outer-6';
        var result = element._getMemberIdFromRuntimeId(runtimeId);
        expect(result).to.be.null;
      });
    });
    describe('#_getParentContextForRuntimeId', function () {
      describe('in a compound', function () {
        var elem1;
        var elem2;
        var compElem;
        var compRuntimeId;
        var elem1RuntimeId;
        var elem2RuntimeId;
        before(function () {
          var container = getContainer();
          // container.Context = new window.cubx.cif.Context(container);
          var constructor = registerCompoundComponentElement('compound-element');
          compElem = new constructor();
          compRuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem';
          compElem.setAttribute('runtime-id', compRuntimeId);
          compElem.Context = new window.cubx.cif.Context(compElem);
          container.appendChild(compElem);
          elem1 = createNewElement('element-one');
          elem1RuntimeId = compRuntimeId + ':' +
            'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-one' + '.member1';
          elem1.setAttribute('runtime-id', elem1RuntimeId);
          compElem.appendChild(elem1);

          elem2 = createNewElement('element-two');
          elem2RuntimeId = compRuntimeId + ':' +
            'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-two' + '.member2';
          elem2.setAttribute('runtime-id', elem2RuntimeId);
          compElem.appendChild(elem2);
        });

        it('should found the context of compElem on "elem1" with "elem1RuntimeId"', function () {
          var erg = elem1._getParentContextForRuntimeId(elem1RuntimeId);
          erg.should.be.deep.equals(compElem.Context);
        });
        it('should found the context of compElem on "elem1" with "elem2RuntimeId"', function () {
          var erg = elem2._getParentContextForRuntimeId(elem1RuntimeId);
          erg.should.be.deep.equals(compElem.Context);
        });
        it('should found the context of compElem on "elem2" with "elem2RuntimeId"', function () {
          var erg = elem2._getParentContextForRuntimeId(elem2RuntimeId);
          erg.should.be.deep.equals(compElem.Context);
        });
        it('should found the context of compElem on "elem1" with "elem2RuntimeId"', function () {
          var erg = elem1._getParentContextForRuntimeId(elem2RuntimeId);
          erg.should.be.deep.equals(compElem.Context);
        });
      });

      describe('in a root', function () {
        var elem1;
        var elem2;
        var elem1RuntimeId;
        var elem2RuntimeId;
        var container;
        before(function () {
          container = getContainer();
          // container.Context = new window.cubx.cif.Context(container);
          elem1 = createNewElement('element-one2');
          elem1RuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-one2.member1';
          elem1.setAttribute('runtime-id', elem1RuntimeId);
          container.appendChild(elem1);
          container.Context.addComponent(elem1);
          elem2 = createNewElement('element-two2');
          elem2RuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-tw2.member2';
          elem2.setAttribute('runtime-id', elem2RuntimeId);
          container.appendChild(elem2);
          container.Context.addComponent(elem2);
        });

        it('should found the context of container on "elem1" with "elem1RuntimeId"', function () {
          var erg = elem1._getParentContextForRuntimeId(elem1RuntimeId);
          erg.should.be.deep.equals(container.Context);
        });
        it('should found the context of container on "elem1" with "elem2RuntimeId"', function () {
          var erg = elem2._getParentContextForRuntimeId(elem1RuntimeId);
          erg.should.be.deep.equals(container.Context);
        });
        it('should found the context of container on "elem2" with "elem2RuntimeId"', function () {
          var erg = elem2._getParentContextForRuntimeId(elem2RuntimeId);
          erg.should.be.deep.equals(container.Context);
        });
        it('should found the context of container on "elem1" with "elem2RuntimeId"', function () {
          var erg = elem1._getParentContextForRuntimeId(elem2RuntimeId);
          erg.should.be.deep.equals(container.Context);
        });
      });
    });
    describe('#_createConnectionManagerConnectionObject', function () {
      var dynamicConnection;

      var sourceElem;
      var destElem;
      before(function () {
        // container.Context = new window.cubx.cif.Context(container);
        sourceElem = createNewElement('element-x-source');
        destElem = createNewElement('element-y-source');
      });
      beforeEach(function () {
        dynamicConnection = {
          connectionId: 'myConnectionId',
          source: {
            runtimeId: 'runtime.Id.SourceBlah/artifact:other.element/artifact.member1',
            slot: 'slotBlah'
          },
          destination: {
            runtimeId: 'runtime.Id.SourceBlah/artifact:other.element/second.artifact.member2',
            slot: 'slotBlahBlah'
          }
        };
      });
      afterEach(function () {
        dynamicConnection = null;
      });
      describe('called on source element', function () {
        it('should create a valid connection', function () {
          var connection = sourceElem._createConnectionManagerConnectionObject(dynamicConnection, sourceElem,
            destElem);
          expect(connection).to.be.not.undefined;
          expect(connection).to.be.not.null;
          connection.should.have.property('connectionId', dynamicConnection.connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', sourceElem);
          connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property('destination.component', destElem);
          connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
          connection.should.have.property('copyValue', true);
          connection.should.have.property('repeatedValues', false);
          connection.should.have.property('hookFunction');
          expect(connection.validate()).to.have.length(0);
        });
        it('should create a valid connection', function () {
          dynamicConnection.copyValue = false;
          dynamicConnection.repeatedValues = true;
          dynamicConnection.hookFunction = 'myFunction';
          var connection = sourceElem._createConnectionManagerConnectionObject(dynamicConnection, sourceElem,
            destElem);
          expect(connection).to.be.not.undefined;
          expect(connection).to.be.not.null;
          connection.should.have.property('connectionId', dynamicConnection.connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', sourceElem);
          connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property('destination.component', destElem);
          connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
          connection.should.have.property('copyValue', false);
          connection.should.have.property('repeatedValues', true);
          connection.should.have.property('hookFunction', 'myFunction');
          expect(connection.validate()).to.have.length(0);
        });
      });
      describe('called on destination element', function () {
        it('should create a valid connection', function () {
          var connection = destElem._createConnectionManagerConnectionObject(dynamicConnection, sourceElem,
            destElem);
          expect(connection).to.be.not.undefined;
          expect(connection).to.be.not.null;
          connection.should.have.property('connectionId', dynamicConnection.connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', sourceElem);
          connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property('destination.component', destElem);
          connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
          connection.should.have.property('copyValue', true);
          connection.should.have.property('repeatedValues', false);
          connection.should.have.property('hookFunction');
          expect(connection.validate()).to.have.length(0);
        });
        it('should create a valid connection', function () {
          dynamicConnection.copyValue = false;
          dynamicConnection.repeatedValues = true;
          dynamicConnection.hookFunction = 'myFunction';
          var connection = destElem._createConnectionManagerConnectionObject(dynamicConnection, sourceElem,
            destElem);
          expect(connection).to.be.not.undefined;
          expect(connection).to.be.not.null;
          connection.should.have.property('connectionId', dynamicConnection.connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', sourceElem);
          connection.should.have.nested.property('source.slot', dynamicConnection.source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property('destination.component', destElem);
          connection.should.have.nested.property('destination.slot', dynamicConnection.destination.slot);
          connection.should.have.property('copyValue', false);
          connection.should.have.property('repeatedValues', true);
          connection.should.have.property('hookFunction', 'myFunction');
          expect(connection.validate()).to.have.length(0);
        });
      });
    });
    describe('#_getElementForEndpoint', function () {
      var container;
      var dynamicConnection;
      var sourceElem;
      var destElem;
      var compElem;
      before(function () {
        var compRuntimeId;
        container = getContainer();
        // container.Context = new window.cubx.cif.Context(container);
        var constructor = registerCompoundComponentElement('compound-element-xx');
        compElem = new constructor();
        compRuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-xx';
        dynamicConnection = {
          connectionId: 'myConnectionId',
          source: {
            runtimeId: compRuntimeId + ':other.element/artifact.member1',
            slot: 'slotBlah'
          },
          destination: {
            runtimeId: compRuntimeId + ':other.element/second.artifact.member2',
            slot: 'slotBlahBlah'
          }
        };

        compElem.setAttribute('runtime-id', compRuntimeId);
        container.appendChild(compElem);
        sourceElem = createNewElement('element-xx-source');
        sourceElem.setAttribute('runtime-id', dynamicConnection.source.runtimeId);
        compElem.appendChild(sourceElem);
        destElem = createNewElement('element-yy-source');
        destElem.setAttribute('runtime-id', dynamicConnection.destination.runtimeId);
        compElem.appendChild(destElem);
      });
      describe('called on sourceElem', function () {
        it('should find the sourceElem', function () {
          var elem = sourceElem._getElementForEndpoint(dynamicConnection, 'source');
          expect(elem).to.be.not.undefined;
          expect(elem).to.be.not.null;
          expect(elem === sourceElem).to.be.true;
        });
        it('should find the destElem', function () {
          var elem = sourceElem._getElementForEndpoint(dynamicConnection, 'destination');
          expect(elem).to.be.not.undefined;
          expect(elem).to.be.not.null;
          expect(elem === destElem).to.be.true;
        });
      });
      describe('called on destElem', function () {
        it('should find the sourceElem', function () {
          var elem = destElem._getElementForEndpoint(dynamicConnection, 'source');
          expect(elem).to.be.not.undefined;
          expect(elem).to.be.not.null;
          expect(elem === sourceElem).to.be.true;
        });
        it('should find the destElem', function () {
          var elem = destElem._getElementForEndpoint(dynamicConnection, 'destination');
          expect(elem).to.be.not.undefined;
          expect(elem).to.be.not.null;
          expect(elem === destElem).to.be.true;
        });
      });
    });
    describe('#_checkEndpointContext', function () {
      var container;
      var sourceElem;
      var destElem;
      var compElem;
      var compElem2;
      var otherElem;
      before(function () {
        var compRuntimeId;
        var compRuntimeId2;
        container = getContainer();
        // container.Context = new window.cubx.cif.Context(container);
        var constructor = registerCompoundComponentElement('compound-element-xxx');
        compElem = new constructor();
        compRuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-xxx';

        compElem.setAttribute('runtime-id', compRuntimeId);
        container.appendChild(compElem);

        constructor = registerCompoundComponentElement('compound-element-xxx-other');
        compElem2 = new constructor();
        compRuntimeId2 = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-xxx-other';

        compElem.setAttribute('runtime-id', compRuntimeId);
        container.appendChild(compElem);
        sourceElem = createNewElement('element-xxx-source');
        sourceElem.setAttribute('runtime-id', compRuntimeId + ':other.element/artifact.member1');
        compElem.appendChild(sourceElem);
        destElem = createNewElement('element-yyy-source');
        destElem.setAttribute('runtime-id', compRuntimeId + ':other.element/other-artifact.member2');
        compElem.appendChild(destElem);
        otherElem = createNewElement('element-xxx-other');
        otherElem.setAttribute('runtimeId', compRuntimeId2 + ':other.element/artifact.member1');
        compElem2.appendChild(otherElem);
      });
      describe('called on sourceElem', function () {
        it('should throw no exception for sourceElem', function () {
          expect(sourceElem._checkEndpointContext(compElem.Context, sourceElem)).to.be.true;
        });
        it('should throw no exception for destElem', function () {
          expect(sourceElem._checkEndpointContext(compElem.Context, destElem)).to.be.true;
        });
        it('should throw an exception for sourceElem', function () {
          expect(function () {
            sourceElem._checkEndpointContext(compElem2.Context, sourceElem);
          }).to.throw(Error);
        });
        it('should throw no exception for destElem', function () {
          expect(function () {
            sourceElem._checkEndpointContext(compElem2.Context, destElem);
          }).to.throw(Error);
        });

        it('should throw an exception for sourceElem', function () {
          expect(function () {
            sourceElem._checkEndpointContext(compElem.Context, otherElem);
          }).to.throw(Error);
        });
      });
      describe('called on destElem', function () {
        it('should throw no exception for sourceElem', function () {
          destElem._checkEndpointContext(compElem.Context, sourceElem);
        });
        it('should throw no exception for destElem', function () {
          destElem._checkEndpointContext(compElem.Context, sourceElem);
        });
        it('should throw an exception for sourceElem', function () {
          expect(function () {
            destElem._checkEndpointContext(compElem2.Context, sourceElem);
          }).to.throw(Error);
        });
        it('should throw no exception for destElem', function () {
          expect(function () {
            destElem._checkEndpointContext(compElem2.Context, destElem);
          }).to.throw(Error);
        });
        it('should throw an exception for sourceElem', function () {
          expect(function () {
            destElem._checkEndpointContext(compElem.Context, otherElem);
          }).to.throw(Error);
        });
      });
    });
    describe('#_checkConnectionConfig', function () {
      it('should be throw an error, if the parameter is undefined', function () {
        expect(function () {
          dynamicConnectionUtil._checkConnectionConfig();
        }).to.throw(Error,
          'A connection object must be an object with the following structure: { source: { runtimeId: ' +
          '"aRuntimeId", slot: "aSlotId"},destination:{ runtimeId: "aRuntimeId", slot: "aSlotId"}} ' +
          'but get a(n) undefined.');
      });
      it('should be throw an error, if the parameter is not an object', function () {
        expect(function () {
          dynamicConnectionUtil._checkConnectionConfig('test');
        }).to.throw(Error,
          'A connection object must be an object with the following structure: { source: { runtimeId: ' +
          '"aRuntimeId", slot: "aSlotId"},destination:{ runtimeId: "aRuntimeId", slot: "aSlotId"}} ' +
          'but get a(n) string.');
      });
      it('should be throw an error, if the parameter is not a valid connection config object', function () {
        expect(function () {
          dynamicConnectionUtil._checkConnectionConfig({});
        }).to.throw(Error,
          'A connection object must be an object with the following structure: { source: { runtimeId: ' +
          '"aRuntimeId", slot: "aSlotId"},destination:{ runtimeId: "aRuntimeId", slot: "aSlotId"}} ' +
          'but missed the following attributes: ["The attribute source.runtimeId is missed.",' +
          '"The attribute source.slot is missed.","The attribute destination.runtimId is missed.",' +
          '"The attribute destination.slot is missed."]');
      });
      it('should be true by  a valid connection config object', function () {
        var config = {
          source: {
            runtimeId: 'aRuntimeId',
            slot: 'slotA'
          },
          destination: {
            runtimeId: 'secondRuntimeId',
            slot: 'slotB'
          }
        };
        expect(dynamicConnectionUtil._checkConnectionConfig(config)).to.be.true;
      });
    });
    describe('#_identifyConnectionId', function () {
      describe('connectionId is a string', function () {
        it('should be get the config paramater', function () {
          var connectionId = 'xxx';
          dynamicConnectionUtil._identifyConnectionId(connectionId).should.be.equal(connectionId);
        });
      });
      describe('connectionId is a valid object', function () {
        var configObject;
        beforeEach(function () {
          configObject = {
            source: {
              runtimeId: 'fist.elem/elem-tag@1.2.3:second.elem/elem-2@123:member1',
              slot: 'slotX'
            },
            destination: {
              runtimeId: 'destination.runtime.id',
              slot: 'slotY'
            }
          };
        });
        afterEach(function () {
          configObject = null;
        });
        it('should be generate a connectionId', function () {
          var expected = dynamicConnectionUtil.generateConnectionId(configObject);
          dynamicConnectionUtil._identifyConnectionId(configObject).should.equal(expected);
        });
      });
      describe('connectionId is a not valid object', function () {
        var configObject;
        beforeEach(function () {
          configObject = {
            destination: {
              runtimeId: 'destination.runtime.id',
              slot: 'slotX'
            }
          };
        });
        afterEach(function () {
          configObject = null;
        });
        it('should be throw an Error', function () {
          expect(function () {
            dynamicConnectionUtil._identifyConnectionId(configObject);
          }).to.throw(Error);
        });
      });
      describe('connectionId is wether string or object', function () {
        it('should be throw an Error', function () {
          var connectionId = true;
          expect(function () {
            dynamicConnectionUtil._identifyConnectionId(connectionId);
          }).to.throw(Error);
        });
      });
    });
    describe('#_findContextByConnectionId', function () {
      var frameComponent;
      var firstCompoundChild;
      var secondCompoundChild;
      var frameComponentRuntimeId;
      var firstCompoundChildRuntimeId;
      var secondCompoundChildRuntimeId;
      var container;
      before(function () {
        var compoundComponent = window.cubx.cif.compoundComponent;
        container = getContainer();

        // container.Context = new Context(container);
        function createCompound (name, runtimeId, parent) {
          var comp = document.createElement(name);
          var proto = Object.getPrototypeOf(comp);
          _.mixin(proto, compoundComponent);
          _.mixin(proto, dynamicConnectionUtil);
          comp.Context = new Context(comp);
          comp.Context.setParent(parent.Context);
          parent.appendChild(comp);
          comp.setAttribute('runtime-id', runtimeId);
          return comp;
        }

        frameComponentRuntimeId = 'element@1.0.0/frame-component';
        frameComponent = createCompound('frame-component', frameComponentRuntimeId, container);

        firstCompoundChildRuntimeId = frameComponentRuntimeId + ':element@1.0.0/first-compound-child.member1';
        firstCompoundChild =
          createCompound('first-compound-child', firstCompoundChildRuntimeId, frameComponent);

        secondCompoundChildRuntimeId = frameComponentRuntimeId + ':element@1.0.0/second-compound-child.member2';
        secondCompoundChild =
          createCompound('second-compound-child', secondCompoundChildRuntimeId, frameComponent);
      });
      after(function () {
        container.removeChild(frameComponent);
      });
      it('should be get the parent context, if connectionId generated from sibling elements connection ' +
        '(first-compound to secod compound)', function () {
        var combString = firstCompoundChildRuntimeId + '#' + 'slotX' + '>' + secondCompoundChildRuntimeId +
            '#' + 'slotY';
        var connectionId = window.btoa(combString);
        var context = firstCompoundChild._findContextByConnectionId(connectionId);
        context.getRootElement().getAttribute('runtime-id').should.be.equal(frameComponentRuntimeId);
      });
      it('should be get the parent context, if connectionId generated from sibling elements connection' +
        '(second-compound to first-compound)', function () {
        var combString = firstCompoundChildRuntimeId + '#' + 'slotX' + '>' + secondCompoundChildRuntimeId +
            '#' + 'slotY';
        var connectionId = window.btoa(combString);
        var context = secondCompoundChild._findContextByConnectionId(connectionId);
        context.getRootElement().getAttribute('runtime-id').should.be.equal(frameComponentRuntimeId);
      });
      it('should be get the parent context, if connectionId generated from child element connection' +
        '(first-compound to frame-compound)', function () {
        var combString = firstCompoundChildRuntimeId + '#' + 'slotX' + '>' + frameComponent +
            '#' + 'slotY';
        var connectionId = window.btoa(combString);
        var context = firstCompoundChild._findContextByConnectionId(connectionId);
        context.getRootElement().getAttribute('runtime-id').should.be.equal(frameComponentRuntimeId);
      });
      it('should be get the parent context, if connectionId generated from parent element connection ' +
        '(frame-compound to first-compound)', function () {
        var combString = frameComponentRuntimeId + '#' + 'slotX' + '>' + firstCompoundChildRuntimeId +
            '#' + 'slotY';
        var connectionId = window.btoa(combString);
        var context = frameComponent._findContextByConnectionId(connectionId);
        context.getRootElement().getAttribute('runtime-id').should.be.equal(frameComponentRuntimeId);
      });
      it('should get an error, if the connectionId not a valid dynamic connectionId is.', function () {
        var connectionId = window.btoa('xxx');
        expect(function () {
          frameComponent._findContextByConnectionId(connectionId);
        }).to.throw(Error);
      });
    });
  });
  describe('#generateConnectionId', function () {
    var connection;
    before(function () {
      connection = {
        source: {
          runtimeId: 'group.id.name@1.0.0/artifact',
          slot: 'slotA'
        },
        destination: {
          runtimeId: 'group.id.name@1.0.0/artifact:group.id.name@1.0.0/artifact2.member1',
          slot: 'slotB'
        }
      };
    });
    after(function () {
      connection = null;
    });
    beforeEach(function () {
    });
    afterEach(function () {
    });
    it('_checkConnectionConfig should be called once', function () {
      var spyCheckConnectionConfig = sinon.spy(dynamicConnectionUtil, '_checkConnectionConfig');
      dynamicConnectionUtil.generateConnectionId(connection);
      expect(spyCheckConnectionConfig.calledOnce).to.be.true;
      dynamicConnectionUtil._checkConnectionConfig.restore();
    });
    it('should be the base64 encoded string from both runtimeId-s and slots.', function () {
      var id = dynamicConnectionUtil.generateConnectionId(connection);
      var iddecoded = window.atob(id);
      expect(iddecoded === (connection.source.runtimeId + '#' + connection.source.slot + '>' +
        connection.destination.runtimeId + '#' + connection.destination.slot)).to.be.true;
    });
    it('should be throws an error if, connectionConfig not valid.', function () {
      expect(function () {
        dynamicConnectionUtil.generateConnectionId();
      }).to.throw(Error);
    });
  });
  describe('#importConnections', function () {
    var compElem;
    var compElem2;
    var compRuntimeId;
    var comp2RuntimeId;
    var elem1;
    var elem2;
    var elem3;
    var elem4;
    var elem5;
    var elem6;

    var elem1RuntimeId;
    var elem2RuntimeId;
    var elem3RuntimeId;
    var elem4RuntimeId;
    var elem5RuntimeId;
    var elem6RuntimeId;

    /* function createConnection(connectionId, isStatic, source, dest) {
     var con = new window.cubx.cif.ConnectionManager.Connection();
     con.connectionId = connectionId;
     con.source.memberId = 'member1';
     con.source.component = source;
     con.source.slot = 'slot1';
     con.destination.memberId = 'member2';
     con.destination.component = dest;
     con.destination.slot = 'slot2';
     if (typeof isStatic === 'boolean') {
     con.static = isStatic;
     }
     return con;
     } */

    before(function () {
      var container = getContainer();
      // container.Context = new window.cubx.cif.Context(container);
      var constructor = registerCompoundComponentElement('compound-element-import1');
      compElem = new constructor();
      compRuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-import1';
      compElem.setAttribute('runtime-id', compRuntimeId);
      compElem.Context = new window.cubx.cif.Context(compElem);
      container.appendChild(compElem);
      elem1 = createNewElement('element-one-import1');
      elem1RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-one-import1' + '.member1';
      elem1.setAttribute('runtime-id', elem1RuntimeId);
      compElem.appendChild(elem1);
      compElem.Context.addComponent(elem1);

      elem2 = createNewElement('element-two-import1');
      elem2RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-two-import1' + '.member2';
      elem2.setAttribute('runtime-id', elem2RuntimeId);
      compElem.appendChild(elem2);
      compElem.Context.addComponent(elem2);

      elem3 = createNewElement('element-three-import1');
      elem3RuntimeId = compRuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-three-import1' + '.member3';
      elem3.setAttribute('runtime-id', elem3RuntimeId);
      compElem.appendChild(elem3);
      compElem.Context.addComponent(elem3);

      constructor = registerCompoundComponentElement('compound-element-import2');
      compElem2 = new constructor();
      comp2RuntimeId = 'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/comp-elem-import2';
      compElem2.setAttribute('runtime-id', comp2RuntimeId);
      compElem2.Context = new window.cubx.cif.Context(compElem2);
      container.appendChild(compElem2);
      elem4 = createNewElement('element-four-import2');
      elem4RuntimeId = comp2RuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-four-import2' + '.member1';
      elem4.setAttribute('runtime-id', elem4RuntimeId);
      compElem2.appendChild(elem4);
      compElem2.Context.addComponent(elem4);

      elem5 = createNewElement('element-five-import2');
      elem5RuntimeId = comp2RuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-five-import2' + '.member2';
      elem5.setAttribute('runtime-id', elem5RuntimeId);
      compElem2.appendChild(elem5);
      compElem2.Context.addComponent(elem5);

      elem6 = createNewElement('element-six-import2');
      elem6RuntimeId = comp2RuntimeId + ':' +
        'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-six-import2' + '.member3';
      elem6.setAttribute('runtime-id', elem6RuntimeId);
      compElem2.appendChild(elem6);
      compElem2.Context.addComponent(elem6);
    });
    afterEach(function () {
      compElem.Context.getConnectionMgr()._connections = [];
      compElem2.Context.getConnectionMgr()._connections = [];
      compElem.Context.getConnectionMgr()._internalConnections = [];
      compElem2.Context.getConnectionMgr()._internalConnections = [];
      getContainer().Context.getConnectionMgr()._connections = [];
    });
    describe('import connections between elem1 and elem2, imported on elem1', function () {
      var dynamicConnections;
      var dynamicConnectionsJSON;
      var spy;
      var connectionId;
      beforeEach(function () {
        dynamicConnections = [
          {
            source: {
              runtimeId: elem1RuntimeId,
              slot: 'slotA'
            },
            destination: {
              runtimeId: elem2RuntimeId,
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc'
          }
        ];
        spy = sinon.spy(compElem.Context.getConnectionMgr(), 'addDynamicConnection');
        dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
        connectionId = elem1.generateConnectionId(dynamicConnections[ 0 ]);
        elem1.importDynamicConnections(dynamicConnectionsJSON);
      });
      afterEach(function () {
        dynamicConnections = null;
        dynamicConnectionsJSON = null;
        compElem.Context.getConnectionMgr().addDynamicConnection.restore();
      });

      it('should called connectionManager.addDynamicConnection method', function () {
        expect(spy.calledOnce).to.be.true;
      });
      it('should exist in compElem context', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
        var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
        connection.should.have.property('connectionId', connectionId);
        connection.should.have.nested.property('source.memberId', 'member1');
        connection.should.have.nested.property('source.component', elem1);
        connection.should.have.nested.property('source.slot', dynamicConnections[ 0 ].source.slot);
        connection.should.have.nested.property('destination.memberId', 'member2');
        connection.should.have.nested.property('destination.component', elem2);
        connection.should.have.nested.property('destination.slot', dynamicConnections[ 0 ].destination.slot);
        connection.should.have.property('repeatedValues', dynamicConnections[ 0 ].repeatedValues);
        connection.should.have.property('copyValue', dynamicConnections[ 0 ].copyValue);
        connection.should.have.property('hookFunction', dynamicConnections[ 0 ].hookFunction);
      });
    });

    describe(
      'import connections between elem1 and elem2, imported on elem3 (elem3 has the same context ' +
      'as elem1 and elem2)',
      function () {
        var dynamicConnections;
        var dynamicConnectionsJSON;
        var connectionId;
        beforeEach(function () {
          dynamicConnections = [
            {
              source: {
                runtimeId: elem1RuntimeId,
                slot: 'slotA'
              },
              destination: {
                runtimeId: elem2RuntimeId,
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'
            }
          ];
          connectionId = elem1.generateConnectionId(dynamicConnections[ 0 ]);
          dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
          elem3.importDynamicConnections(dynamicConnectionsJSON);
        });
        afterEach(function () {
          dynamicConnections = null;
          dynamicConnectionsJSON = null;
        });

        it('should exist in compElem context', function () {
          compElem.Context.getConnectionMgr()._connections.should.have.length(1);
          compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
          var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
          connection.should.have.property('connectionId', connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', elem1);
          connection.should.have.nested.property('source.slot', dynamicConnections[ 0 ].source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property(
            'destination.component', elem2);
          connection.should.have.nested.property('destination.slot', dynamicConnections[ 0 ].destination.slot);
          connection.should.have.property('repeatedValues', dynamicConnections[ 0 ].repeatedValues);
          connection.should.have.property('copyValue', dynamicConnections[ 0 ].copyValue);
          connection.should.have.property('hookFunction', dynamicConnections[ 0 ].hookFunction);
        });
      });
    describe('import 3 connections for 2 contexts, imported on elem1', function () {
      var dynamicConnections;
      var dynamicConnectionsJSON;
      var connectionIds = [];
      beforeEach(function () {
        dynamicConnections = [
          {

            source: {
              runtimeId: elem1RuntimeId,
              slot: 'slotA'
            },
            destination: {
              runtimeId: elem2RuntimeId,
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc'
          },
          {

            source: {
              runtimeId: elem2RuntimeId,
              slot: 'slotC'
            },
            destination: {
              runtimeId: elem3RuntimeId,
              slot: 'slotD'
            }

          },
          {
            source: {
              runtimeId: elem4RuntimeId,
              slot: 'slotA'
            },
            destination: {
              runtimeId: elem5RuntimeId,
              slot: 'slotB'
            },
            repeatedValues: true,
            copyValue: false,
            hookFunction: 'thirdFunc'
          }
        ];
        connectionIds.push(elem1.generateConnectionId(dynamicConnections[ 0 ]));
        connectionIds.push(elem1.generateConnectionId(dynamicConnections[ 1 ]));
        connectionIds.push(elem1.generateConnectionId(dynamicConnections[ 2 ]));
        dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
        elem1.importDynamicConnections(dynamicConnectionsJSON);
      });
      afterEach(function () {
        dynamicConnections = null;
        dynamicConnectionsJSON = null;
      });

      it('should 2 connections exist in context of compElem', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(2);
        compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
        var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
        connection.should.have.property('connectionId', connectionIds[ 0 ]);

        connection.should.have.nested.property('source.memberId', 'member1');
        connection.should.have.nested.property('source.component', elem1);
        connection.should.have.nested.property('source.slot', dynamicConnections[ 0 ].source.slot);
        connection.should.have.nested.property('destination.memberId', 'member2');
        connection.should.have.nested.property('destination.component', elem2);
        connection.should.have.nested.property('destination.slot', dynamicConnections[ 0 ].destination.slot);
        connection.should.have.property('repeatedValues', dynamicConnections[ 0 ].repeatedValues);
        connection.should.have.property('copyValue', dynamicConnections[ 0 ].copyValue);
        connection.should.have.property('hookFunction', dynamicConnections[ 0 ].hookFunction);
        compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[1]');
        connection = compElem.Context.getConnectionMgr()._connections[ 1 ];
        connection.should.have.property('connectionId', connectionIds[ 1 ]);
        connection.should.have.nested.property('source.memberId', 'member2');
        connection.should.have.nested.property('source.component', elem2);
        connection.should.have.nested.property('source.slot', dynamicConnections[ 1 ].source.slot);
        connection.should.have.nested.property('destination.memberId', 'member3');
        connection.should.have.nested.property('destination.component', elem3);
        connection.should.have.nested.property('destination.slot', dynamicConnections[ 1 ].destination.slot);
        connection.should.have.property('repeatedValues', false);
        connection.should.have.property('copyValue', true);
        connection.should.have.property('hookFunction', null);
      });
      it('should exists in context of compElem2', function () {
        compElem2.Context.getConnectionMgr()._connections.should.have.length(1);
        compElem2.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');

        var connection = compElem2.Context.getConnectionMgr()._connections[ 0 ];
        connection.should.have.property('connectionId', connectionIds[ 2 ]);

        connection.should.have.nested.property('source.memberId', 'member1');
        connection.should.have.nested.property('source.component', elem4);
        connection.should.have.nested.property('source.slot', dynamicConnections[ 2 ].source.slot);
        connection.should.have.nested.property('destination.memberId', 'member2');
        connection.should.have.nested.property('destination.component', elem5);
        connection.should.have.nested.property('destination.slot', dynamicConnections[ 2 ].destination.slot);
        connection.should.have.property('repeatedValues', dynamicConnections[ 2 ].repeatedValues);
        connection.should.have.property('copyValue', dynamicConnections[ 2 ].copyValue);
        connection.should.have.property('hookFunction', dynamicConnections[ 2 ].hookFunction);
      });
    });
    describe(
      'import connections between elem1 and elem2, imported on elem4 (elem4 has an other context ' +
      'as elem1 and elem2)',
      function () {
        var dynamicConnections;
        var dynamicConnectionsJSON;
        var connectionId;
        beforeEach(function () {
          dynamicConnections = [
            {
              source: {
                runtimeId: elem1RuntimeId,
                slot: 'slotA'
              },
              destination: {
                runtimeId: elem2RuntimeId,
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'
            }
          ];
          connectionId = elem1.generateConnectionId(dynamicConnections[ 0 ]);
          dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
          elem4.importDynamicConnections(dynamicConnectionsJSON);
        });
        afterEach(function () {
          dynamicConnections = null;
          dynamicConnectionsJSON = null;
        });

        it('should exist in compElem context', function () {
          compElem.Context.getConnectionMgr()._connections.should.have.length(1);
          compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
          var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
          connection.should.have.property('connectionId', connectionId);
          connection.should.have.nested.property('source.memberId', 'member1');
          connection.should.have.nested.property('source.component', elem1);
          connection.should.have.nested.property('source.slot', dynamicConnections[ 0 ].source.slot);
          connection.should.have.nested.property('destination.memberId', 'member2');
          connection.should.have.nested.property('destination.component', elem2);
          connection.should.have.nested.property('destination.slot', dynamicConnections[ 0 ].destination.slot);
          connection.should.have.property('repeatedValues', dynamicConnections[ 0 ].repeatedValues);
          connection.should.have.property('copyValue', dynamicConnections[ 0 ].copyValue);
          connection.should.have.property('hookFunction', dynamicConnections[ 0 ].hookFunction);
        });
      });
    describe(
      'import connections between elem1 and elem4, imported on elem1 (elem1 and elem4 has different contexts)',
      function () {
        var dynamicConnections;
        var dynamicConnectionsJSON;
        var spy;
        beforeEach(function () {
          dynamicConnections = [
            {
              connectionId: 'myConnection',
              source: {
                runtimeId: elem1RuntimeId,
                slot: 'slotA'
              },
              destination: {
                runtimeId: elem4RuntimeId,
                slot: 'slotB'
              },
              repeatedValues: false,
              copyValue: true,
              hookFunction: 'myFunc'
            }
          ];
          dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
          spy = sinon.spy(console, 'error');
          elem1.importDynamicConnections(dynamicConnectionsJSON);
        });
        afterEach(function () {
          dynamicConnections = null;
          dynamicConnectionsJSON = null;
          console.error.restore();
        });

        it('should log an error and not import the connection', function () {
          compElem.Context.getConnectionMgr()._connections.should.have.length(0);
          expect(spy.calledOnce).to.be.true;
          var errorStr = ' The connection can not be created within the context ' +
            JSON.stringify(dynamicConnections[ 0 ]) +
            '. Ambiguous context: ' +
            'The source context is not the same as a the destination context. ' +
            'It is just allowed to create a connection in the same context.';
          expect(spy.calledWith(errorStr));
        });
      });
    describe(
      'not import connections because context not found',
      function () {
        var dynamicConnections;
        var dynamicConnectionsJSON;
        var spy;
        var elem7;
        var elem8;
        var elem7RuntimeId;
        var elem8RuntimeId;

        before(function () {
          elem7 = createNewElement('element-seven-import1');
          elem7RuntimeId =
            'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-seven-import1' + '.member4';
          elem7.setAttribute('runtime-id', elem7RuntimeId);
          document.querySelector('body').appendChild(elem7);
          elem8 = createNewElement('element-eigth-import1');
          elem8RuntimeId =
            'com.incowia.dynamic-connection-test@1.2.0-SNAPSHOT/element-eight-import1' + '.member4';
          elem8.setAttribute('runtime-id', elem8RuntimeId);
          document.querySelector('body').appendChild(elem8);
        });

        describe('no context for source element', function () {
          beforeEach(function () {
            dynamicConnections = [
              {
                source: {
                  runtimeId: elem7RuntimeId,
                  slot: 'slotA'
                },
                destination: {
                  runtimeId: elem8RuntimeId,
                  slot: 'slotB'
                },
                repeatedValues: false,
                copyValue: true,
                hookFunction: 'myFunc'
              }
            ];
            dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
            spy = sinon.spy(console, 'error');
            elem1.importDynamicConnections(dynamicConnectionsJSON);
          });
          afterEach(function () {
            dynamicConnections = null;
            dynamicConnectionsJSON = null;
            console.error.restore();
          });

          it('should not exist in any context and should log error', function () {
            compElem.Context.getConnectionMgr()._connections.should.have.length(0);
            compElem.Context.getConnectionMgr()._internalConnections.should.have.length(0);
            compElem2.Context.getConnectionMgr()._connections.should.have.length(0);
            compElem2.Context.getConnectionMgr()._internalConnections.should.have.length(0);
            getContainer().Context.getConnectionMgr()._connections.should.have.length(0);

            expect(spy.calledTwice).to.be.true;
            var errorStr = 'The connection can not be created within the context, because no context ' +
              'for the element with runtimeId (' + dynamicConnections[ 0 ].source.runtimeId +
              ') has been found';
            expect(spy.calledWith(errorStr)).to.be.true;
            errorStr = 'The connection can not be created within the context, because no context ' +
              'for the element with runtimeId (' + dynamicConnections[ 0 ].destination.runtimeId +
              ') has been found';
            expect(spy.calledWith(errorStr)).to.be.true;
          });
        });
        describe('no context for destination element', function () {
          beforeEach(function () {
            dynamicConnections = [
              {
                connectionId: 'myConnection',
                source: {
                  runtimeId: elem1RuntimeId,
                  slot: 'slotA'
                },
                destination: {
                  runtimeId: elem7RuntimeId,
                  slot: 'slotB'
                },
                repeatedValues: false,
                copyValue: true,
                hookFunction: 'myFunc'
              }
            ];
            dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
            spy = sinon.spy(console, 'error');
            elem1.importDynamicConnections(dynamicConnectionsJSON);
          });
          afterEach(function () {
            dynamicConnections = null;
            dynamicConnectionsJSON = null;
            console.error.restore();
          });

          it('should not exist in any context and should log error', function () {
            compElem.Context.getConnectionMgr()._connections.should.have.length(0);
            compElem2.Context.getConnectionMgr()._connections.should.have.length(0);
            getContainer().Context.getConnectionMgr()._connections.should.have.length(0);
            expect(spy.calledOnce).to.be.true;
            var errorStr = 'The connection can not be created within the context, because no context ' +
              'for the element with runtimeId (' + dynamicConnections[ 0 ].destination.runtimeId +
              ') has been found';
            console.log(errorStr);
            expect(spy.calledWith(errorStr)).to.be.true;
          });
        });
        describe('no context for source and destination element', function () {
          beforeEach(function () {
            dynamicConnections = [
              {
                connectionId: 'myConnection',
                source: {
                  runtimeId: elem7RuntimeId,
                  slot: 'slotA'
                },
                destination: {
                  runtimeId: elem8RuntimeId,
                  slot: 'slotB'
                },
                repeatedValues: false,
                copyValue: true,
                hookFunction: 'myFunc'
              }
            ];
            dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
            spy = sinon.spy(console, 'error');
            elem1.importDynamicConnections(dynamicConnectionsJSON);
          });
          afterEach(function () {
            dynamicConnections = null;
            dynamicConnectionsJSON = null;
            console.error.restore();
          });

          it('should not exist in any context and should log error', function () {
            compElem.Context.getConnectionMgr()._connections.should.have.length(0);
            compElem2.Context.getConnectionMgr()._connections.should.have.length(0);
            getContainer().Context.getConnectionMgr()._connections.should.have.length(0);
            expect(spy.calledTwice).to.be.true;
            var errorStr = 'The connection can not be created within the context, because no context ' +
              'for the element with runtimeId (' + dynamicConnections[ 0 ].source.runtimeId +
              ') has been found';
            expect(spy.calledWith(errorStr)).to.be.true;
            errorStr = 'The connection can not be created within the context, because no context ' +
              'for the element with runtimeId (' + dynamicConnections[ 0 ].destination.runtimeId +
              ') has been found';
            expect(spy.calledWith(errorStr)).to.be.true;
          });
        });
      });
    describe('import internal connections (from compound to child element)', function () {
      var dynamicConnections;
      var dynamicConnectionsJSON;
      var spy;
      var connectionId;
      beforeEach(function () {
        dynamicConnections = [
          {
            source: {
              runtimeId: compRuntimeId,
              slot: 'slotA'
            },
            destination: {
              runtimeId: elem2RuntimeId,
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc'
          }
        ];
        spy = sinon.spy(compElem.Context.getConnectionMgr(), 'addDynamicConnection');
        dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
        connectionId = elem1.generateConnectionId(dynamicConnections[ 0 ]);
        elem1.importDynamicConnections(dynamicConnectionsJSON);
      });
      afterEach(function () {
        dynamicConnections = null;
        dynamicConnectionsJSON = null;
        compElem.Context.getConnectionMgr().addDynamicConnection.restore();
      });

      it('should called connectionManager.addDynamicConnection method', function () {
        expect(spy.calledOnce).to.be.true;
      });
      it('should exist in compElem context', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
        // compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        // compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
        // var connection = compElem.Context.getConnectionMgr()._connections[0];
        var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
        connection.should.have.property('connectionId', connectionId);
        connection.should.have.nested.property('source.memberId', null);
        connection.should.have.nested.property('source.component', compElem);
        connection.should.have.nested.property('source.slot', dynamicConnections[ 0 ].source.slot);
        connection.should.have.nested.property('destination.memberId', 'member2');
        connection.should.have.nested.property('destination.component', elem2);
        connection.should.have.nested.property('destination.slot', dynamicConnections[ 0 ].destination.slot);
        connection.should.have.property('repeatedValues', dynamicConnections[ 0 ].repeatedValues);
        connection.should.have.property('copyValue', dynamicConnections[ 0 ].copyValue);
        connection.should.have.property('hookFunction', dynamicConnections[ 0 ].hookFunction);
      });
    });

    describe('import internal connections (from child element to compound)', function () {
      var dynamicConnections;
      var dynamicConnectionsJSON;
      var spy;
      var connectionId;
      beforeEach(function () {
        dynamicConnections = [
          {
            source: {
              runtimeId: elem2RuntimeId,
              slot: 'slotA'
            },
            destination: {
              runtimeId: compRuntimeId,
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc'
          }
        ];
        spy = sinon.spy(compElem.Context.getConnectionMgr(), 'addDynamicConnection');
        dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
        connectionId = elem1.generateConnectionId(dynamicConnections[ 0 ]);
        elem1.importDynamicConnections(dynamicConnectionsJSON);
      });
      afterEach(function () {
        dynamicConnections = null;
        dynamicConnectionsJSON = null;
        compElem.Context.getConnectionMgr().addDynamicConnection.restore();
      });

      it('should called connectionManager.addDynamicConnection method', function () {
        expect(spy.calledOnce).to.be.true;
      });
      it('should exist in compElem context', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
        // compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        // compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
        // var connection = compElem.Context.getConnectionMgr()._connections[0];
        var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
        connection.should.have.property('connectionId', connectionId);
        connection.should.have.nested.property('source.memberId', 'member2');
        connection.should.have.nested.property('source.component', elem2);
        connection.should.have.nested.property('source.slot', dynamicConnections[ 0 ].source.slot);
        connection.should.have.nested.property('destination.memberId', null);
        connection.should.have.nested.property('destination.component', compElem);
        connection.should.have.nested.property('destination.slot', dynamicConnections[ 0 ].destination.slot);
        connection.should.have.property('repeatedValues', dynamicConnections[ 0 ].repeatedValues);
        connection.should.have.property('copyValue', dynamicConnections[ 0 ].copyValue);
        connection.should.have.property('hookFunction', dynamicConnections[ 0 ].hookFunction);
      });
    });
    describe('import connections between elem1 and elem2, imported on elem1 with directExecution', function () {
      var dynamicConnections;
      var dynamicConnectionsJSON;
      var spy;
      var connectionId;
      beforeEach(function () {
        dynamicConnections = [
          {
            source: {
              runtimeId: elem1RuntimeId,
              slot: 'slotA'
            },
            destination: {
              runtimeId: elem2RuntimeId,
              slot: 'slotB'
            },
            repeatedValues: false,
            copyValue: true,
            hookFunction: 'myFunc',
            directExecution: true
          }
        ];
        spy = sinon.spy(compElem.Context.getConnectionMgr(), 'addDynamicConnection');
        dynamicConnectionsJSON = JSON.stringify(dynamicConnections);
        connectionId = elem1.generateConnectionId(dynamicConnections[ 0 ]);
        elem1.importDynamicConnections(dynamicConnectionsJSON);
      });
      afterEach(function () {
        dynamicConnections = null;
        dynamicConnectionsJSON = null;
        compElem.Context.getConnectionMgr().addDynamicConnection.restore();
      });

      it('should called connectionManager.addDynamicConnection method', function () {
        expect(spy.calledOnce).to.be.true;
        spy.should.have.been.calledWith(sinon.match.object, true);
      });
      it('should exist in compElem context', function () {
        compElem.Context.getConnectionMgr()._connections.should.have.length(1);
        compElem.Context.getConnectionMgr()._connections.should.have.nested.property('[0]');
        var connection = compElem.Context.getConnectionMgr()._connections[ 0 ];
        connection.should.have.property('connectionId', connectionId);
        connection.should.have.nested.property('source.memberId', 'member1');
        connection.should.have.nested.property('source.component', elem1);
        connection.should.have.nested.property('source.slot', dynamicConnections[ 0 ].source.slot);
        connection.should.have.nested.property('destination.memberId', 'member2');
        connection.should.have.nested.property('destination.component', elem2);
        connection.should.have.nested.property('destination.slot', dynamicConnections[ 0 ].destination.slot);
        connection.should.have.property('repeatedValues', dynamicConnections[ 0 ].repeatedValues);
        connection.should.have.property('copyValue', dynamicConnections[ 0 ].copyValue);
        connection.should.have.property('hookFunction', dynamicConnections[ 0 ].hookFunction);
      });
    });
  });
});
