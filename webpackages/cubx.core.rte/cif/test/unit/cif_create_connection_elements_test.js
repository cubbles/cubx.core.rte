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

  describe('#_initConnections', function () {
    var rootContextInitConnectionsStub;
    var rootContext;
    beforeEach(function () {
      rootContext = window.cubx.cif.cif._rootContext;
      rootContextInitConnectionsStub = sinon.stub(rootContext, 'initConnections').callsFake(function () {
        // do nothing
      });
    });

    afterEach(function () {
      rootContext.initConnections.restore();
    });

    it('context.initConnections should be called once ', function () {
      cif._initConnections();
      expect(rootContextInitConnectionsStub.calledOnce).to.be.true;
    });
  });
  describe('#_createConnectionsElements', function () {
    var container;
    var compoundEl;
    var subElement1;
    var subElement2;
    var spy;
    beforeEach(function () {
      container = document.querySelector('[cubx-core-crc]');
      var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
      compoundEl = new constructor();
      container.appendChild(compoundEl);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
      subElement1 = new constructor();
      subElement1.setAttribute('member-id', 'a');
      compoundEl.appendChild(subElement1);
      subElement1.Context.setParent(compoundEl.Context);
      compoundEl.Context.addComponent(subElement1);

      constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
      subElement2 = new constructor();
      subElement2.setAttribute('member-id', 'b');
      compoundEl.appendChild(subElement2);
      subElement2.Context.setParent(compoundEl.Context);
      compoundEl.Context.addComponent(subElement2);
      var connections = [ {
        connectionId: 'a:testoutput-b:testinput',
        source: {
          memberIdRef: 'a', slot: 'testoutput'
        },
        destination: {
          memberIdRef: 'b', slot: 'testinput'
        }
      }, {
        connectionId: 'testoutput-c:testinput',
        source: {
          slot: 'testoutput'
        },
        destination: {
          memberIdRef: 'a', slot: 'testinput'
        }
      }, {
        connectionId: 'd:testoutput-testinput',
        source: {
          memberIdRef: 'b', slot: 'testoutput'
        },
        destination: {
          slot: 'testinput'
        }
      } ];
      compoundEl._connections = connections;
      spy = sinon.spy(cif, '_createConnectionElement');
    });
    afterEach(function () {
      cif._createConnectionElement.restore();
      container.removeChild(compoundEl);
      container.Context._children = [];
      container.Context._components = [];
    });

    it('connections Tags should be created under source Elements', function () {
      cif._createConnectionElements(compoundEl);
      compoundEl.firstElementChild.tagName.should.equals('CUBX-CORE-CONNECTIONS');
      expect(compoundEl.firstElementChild.childElementCount).to.be.equals(1);
      compoundEl.firstElementChild.firstElementChild.tagName.should.equals('CUBX-CORE-CONNECTION');
      subElement1.firstElementChild.tagName.should.equals('CUBX-CORE-CONNECTIONS');
      expect(subElement1.firstElementChild.childElementCount).to.be.equals(1);
      subElement1.firstElementChild.firstElementChild.tagName.should.equals('CUBX-CORE-CONNECTION');
      subElement2.firstElementChild.tagName.should.equals('CUBX-CORE-CONNECTIONS');
      expect(subElement2.firstElementChild.childElementCount).to.be.equals(1);
      subElement2.firstElementChild.firstElementChild.tagName.should.equals('CUBX-CORE-CONNECTION');
      expect(spy.calledThrice).to.be.true;
    });

    it('_connections property should be remaned to _createdConnections after create connection tags', function () {
      compoundEl.should.have.property('_connections');
      var compoundElConnections = compoundEl._connections;
      cif._createConnectionElements(compoundEl);
      compoundEl.should.not.have.property('_connections');
      compoundEl.should.have.deep.property('_createdConnections', compoundElConnections);
    });
  });
  describe('#_createConnectionElement', function () {
    var container;
    before(function () {
      container = document.querySelector('[cubx-core-crc]');
    });
    describe('connection between 2 member', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);

        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);

        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under source Element', function () {
        var connection = {
          connectionId: '1:testoutput-2:testinput',
          source: {
            memberIdRef: '1', slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2', slot: 'testinput'
          }
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement1.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement1.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement1.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        expect(connectionTag.getAttribute('copy-value')).to.be.null;
        expect(connectionTag.getAttribute('hook-function')).to.be.null;
        expect(connectionTag.getAttribute('repeated-values')).to.be.null;
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between 2 member, copyValue = false', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under source Element', function () {
        var connection = {
          connectionId: '1:testoutput-2:testinput',
          source: {
            memberIdRef: '1', slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2', slot: 'testinput'
          },
          copyValue: false
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement1.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement1.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement1.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('copy-value').should.be.equal('false');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between 2 member, copyValue = true', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under source Element', function () {
        var connection = {
          connectionId: '1:testoutput-2:testinput',
          source: {
            memberIdRef: '1',
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2',
            slot: 'testinput'
          },
          copyValue: true
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement1.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement1.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement1.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('copy-value').should.be.equal('true');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between 2 member, repeatedValues = false', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under source Element', function () {
        var connection = {
          connectionId: '1:testoutput-2:testinput',
          source: {
            memberIdRef: '1', slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2', slot: 'testinput'
          },
          repeatedValues: false
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement1.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement1.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement1.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('repeated-values').should.be.equal('false');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between 2 member, repeatedValues = true', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        compoundEl.appendChild(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under source Element', function () {
        var connection = {
          connectionId: '1:testoutput-2:testinput',
          source: {
            memberIdRef: '1',
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2',
            slot: 'testinput'
          },
          repeatedValues: true
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement1.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement1.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement1.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('repeated-values').should.be.equal('true');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between compound and member', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        container.appendChild(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: 'testoutput-2:testinput',
          source: {
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: 2, slot: 'testinput'
          }
        };

        cif._createConnectionElement(compoundEl, connection);

        compoundEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = compoundEl.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        expect(connectionTag.getAttribute('copy-value')).to.be.null;
        expect(connectionTag.getAttribute('repeated-values')).to.be.null;
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between compound and member copyValue = true', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: 'testoutput-2:testinput',
          source: {
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: 2, slot: 'testinput'
          },
          copyValue: true
        };

        cif._createConnectionElement(compoundEl, connection);

        compoundEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = compoundEl.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('copy-value').should.be.equal('true');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between compound and member copyValue = false', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: 'testoutput-2:testinput',
          source: {
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2', slot: 'testinput'
          },
          copyValue: false
        };

        cif._createConnectionElement(compoundEl, connection);

        compoundEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = compoundEl.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('copy-value').should.be.equal('false');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between compound and member repeatedValues = true', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: 'testoutput-2:testinput',
          source: {
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: 2, slot: 'testinput'
          },
          repeatedValues: true
        };

        cif._createConnectionElement(compoundEl, connection);

        compoundEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = compoundEl.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('repeated-values').should.be.equal('true');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between compound and member repeatedValues = false', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: 'testoutput-2:testinput',
          source: {
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2', slot: 'testinput'
          },
          repeatedValues: false
        };

        cif._createConnectionElement(compoundEl, connection);

        compoundEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = compoundEl.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('repeated-values').should.be.equal('false');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between member and compound', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: '2:testoutput-testinput',
          source: {
            memberIdRef: '2',
            slot: 'testoutput'
          },
          destination: {
            slot: 'testinput'
          }
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement2.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement2.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement2.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal('parent:' + connection.destination.slot);
        expect(connectionTag.getAttribute('copy-value')).to.be.null;
        expect(connectionTag.getAttribute('repeated-values')).to.be.null;
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between member and compound copyValue = false', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: '2:testoutput-testinput',
          source: {
            memberIdRef: '2', slot: 'testoutput'
          },
          destination: {
            slot: 'testinput'
          },
          copyValue: false
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement2.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement2.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement2.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal('parent:' + connection.destination.slot);
        connectionTag.getAttribute('copy-value').should.be.equal('false');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between member and compound copyValue = true', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: '2:testoutput-testinput',
          source: {
            memberIdRef: '2',
            slot: 'testoutput'
          },
          destination: {
            slot: 'testinput'
          },
          copyValue: true
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement2.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement2.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement2.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal('parent:' + connection.destination.slot);
        connectionTag.getAttribute('copy-value').should.be.equal('true');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between member and compound repeatedValues = false', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: '2:testoutput-testinput',
          source: {
            memberIdRef: '2', slot: 'testoutput'
          },
          destination: {
            slot: 'testinput'
          },
          repeatedValues: false
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement2.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement2.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement2.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal('parent:' + connection.destination.slot);
        connectionTag.getAttribute('repeated-values').should.be.equal('false');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between member and compound repeatedValues = true', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var connection = {
          connectionId: '2:testoutput-testinput',
          source: {
            memberIdRef: '2',
            slot: 'testoutput'
          },
          destination: {
            slot: 'testinput'
          },
          repeatedValues: true
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement2.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement2.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement2.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal('parent:' + connection.destination.slot);
        connectionTag.getAttribute('repeated-values').should.be.equal('true');
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between 2 member, inline hookFunction ', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under source Element', function () {
        var functionStr = 'function(value,next){ next(value);}';
        var connection = {
          connectionId: '1:testoutput-2:testinput',
          source: {
            memberIdRef: '1', slot: 'testoutput'
          },
          destination: {
            memberIdRef: '2', slot: 'testinput'
          },
          hookFunction: functionStr
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement1.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement1.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement1.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('hook-function').should.be.equal(functionStr);
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between compound and member inline hookFunction', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var functionStr = 'function(value,next){ next(value);}';
        var connection = {
          connectionId: 'testoutput-2:testinput',
          source: {
            slot: 'testoutput'
          },
          destination: {
            memberIdRef: 2, slot: 'testinput'
          },
          hookFunction: functionStr
        };

        cif._createConnectionElement(compoundEl, connection);

        compoundEl.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        compoundEl.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = compoundEl.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal(connection.destination.memberIdRef + ':' + connection.destination.slot);
        connectionTag.getAttribute('hook-function').should.be.equal(functionStr);
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
    describe('connection between member and compound inline hookFunction', function () {
      var compoundEl;
      var subElement1;
      var subElement2;
      beforeEach(function () {
        var constructor = cif.getCompoundComponentElementConstructor('ciftest-a');
        compoundEl = new constructor();
        container.appendChild(compoundEl);
        compoundEl.Context.setParent(container.Context);
        container.Context.addComponent(compoundEl);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-b');
        subElement1 = new constructor();
        subElement1.setAttribute('member-id', '1');
        compoundEl.appendChild(subElement1);
        subElement1.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement1);
        constructor = cif.getCompoundComponentElementConstructor('ciftest-c');
        subElement2 = new constructor();
        subElement2.setAttribute('member-id', '2');
        compoundEl.appendChild(subElement2);
        subElement2.Context.setParent(compoundEl.Context);
        compoundEl.Context.addComponent(subElement2);
      });
      afterEach(function () {
        container.removeChild(compoundEl);
        container.Context._children = [];
        container.Context._components = [];
      });
      it('connection Tag should be created under compound Element', function () {
        var functionStr = 'function(value,next){ next(value);}';
        var connection = {
          connectionId: '2:testoutput-testinput',
          source: {
            memberIdRef: '2', slot: 'testoutput'
          },
          destination: {
            slot: 'testinput'
          },
          hookFunction: functionStr
        };
        cif._createConnectionElement(compoundEl, connection);
        subElement2.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTIONS');
        subElement2.firstElementChild.firstElementChild.should.have.property('tagName', 'CUBX-CORE-CONNECTION');
        var connectionTag = subElement2.firstElementChild.firstElementChild;
        connectionTag.getAttribute('source').should.be.equal(connection.source.slot);
        connectionTag.getAttribute('destination').should.be.equal('parent:' + connection.destination.slot);
        connectionTag.getAttribute('hook-function').should.be.equal(functionStr);
        expect(connectionTag.getAttribute('connection-id')).to.be.equals(connection.connectionId);
      });
    });
  });
});
