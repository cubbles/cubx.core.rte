/* globals _,guid */
(function () {
  'use strict';

  /**
   * Provides a context for interaction of components
   * @global
   * @constructor
   * @param {HTMLElement} element The element for which the context is to be created.
   */
  var Context = function (element) {
    /**
     * The parent context (if there is any)
     * @type {object}
     * @private
     */
    this._parent = null;

    /**
     * Holds a list of all child contexts assigned to this context
     * @type {Array}
     * @private
     */
    this._children = [];

    /**
     * The HTMLElement the context is bound to.
     * @private
     * @type {HTMLElement}
     */
    this._rootElement = null;

    /**
     * Holds all components that will be called with an Model Change Event if something changed
     * @type {Array}
     * @private
     */
    this._components = [];

    /**
     * Set to true if CIF has processed the associated HTML tree and all connections are set up
     * @type {boolean}
     * @default
     * @private
     */
    this._ready = false;

    this._guid = guid();
    /**
     * The ConnectionManager instance bound to this context instance
     * @type {ConnectionManager}
     * @private
     */
    this._connectionMgr = new window.cubx.cif.ConnectionManager(this);

    if (element == null) {
      throw new TypeError('parameter "element" needs to be an HTMLElement');
    } else {
      this._rootElement = element;
    }

    this._registerCIFListener();
  };

  /* ****************************************************************************
   *
   **************************************************************************** */
  /**
   * Chick if self the same is as the Context parameter
   * @param {window.cubx.cif.Context} otherContext
   * @returns {boolean} returns true, if the Context parameter is the same as self, otherwise returns true
   */
  Context.prototype.isSame = function (otherContext) {
    return otherContext ? this._guid === otherContext._guid : false;
  };

  /**
   * Returns the ConnectionsManager object
   * @returns {ConnectionManager}
   */
  Context.prototype.getConnectionMgr = function () {
    return this._connectionMgr;
  };

  /**
   * Set this contexts parent context
   * @memberOf Context
   * @param {object} parent A Context instance
   */
  Context.prototype.setParent = function (parent) {
    this._parent = parent;
    parent.addChildContext(this);
  };

  /*
   * get the contexts parent context
   * @memberOf Context
   */
  Context.prototype.getParent = function () {
    return this._parent;
  };

  /**
   * get the root element for this context (this is indeed the compound component element this context is assigned to)
   * @memberOf Context
   * @return {HTMLElement}
   */
  Context.prototype.getRootElement = function () {
    return this._rootElement;
  };

  /**
   * get the contained child contexts for this
   * @return {Array}
   */
  Context.prototype.getChildren = function () {
    return this._children;
  };
  /**
   * get the contained components for this
   * @return {Array}
   */
  Context.prototype.getComponents = function () {
    return this._components;
  };

  /**
   * Add the given child context to list of children
   * @memberOf Context
   * @param {object} child A Context instance
   */
  Context.prototype.addChildContext = function (child) {
    this._children.push(child);
  };

  /**
   * Add the given component to list of components
   * @memberOf Context
   * @param {object} component
   */
  Context.prototype.addComponent = function (component) {
    this._components.push(component);
  };

  /**
   * Init all connections based on the given cubx-core-connections tags in scope of this context
   * @memberOf Context
   */
  Context.prototype.initConnections = function () {
    this._initConnections();
    _.forEach(this._children, function (context) {
      context.initConnections();
    });
  };

  /**
   * Init create a slotInit-List  on the given cubx-core-init tags in scope of this context
   * @memberOf Context
   */
  Context.prototype.collectSlotInits = function () {
    var cif;
    if (arguments.length === 0) {
      cif = window.cubx.cif.cif;
    } else {
      cif = arguments[ 0 ];
    }
    this._collectSlotInits(cif);
  };

  /**
   * Process all internal connections of corresponding compound component
   * @memberOf Context
   * @param {string} slotName
   * @param {object} payloadObject
   */
  Context.prototype.processInternalConnections = function (slotName, payloadObject) {
    this._connectionMgr.processInternalConnections(slotName, payloadObject);
  };

  /**
   * Recursively set all descendant contexts to ready
   * @memberOf Context
   */
  Context.prototype.setReady = function (value) {
    var readyValue;
    if (arguments.length === 0) {
      readyValue = true;
    } else {
      readyValue = value;
    }
    _.forEach(this._children, function (child) {
      child.setReady(readyValue);
    }, this);
    this._ready = readyValue;
  };

  /**
   * Check if context is ready
   * @memberOf Context
   * @return {boolean} true if context is ready, false otherwise
   */
  Context.prototype.isReady = function () {
    return this._ready;
  };

  /**
   * Find the Parent Context of the given element
   * @param {HTMLElement} element
   * @returns {*}
   */
  Context.prototype.findParentContextOfElement = function (element) {
    if (element.parentNode.hasOwnProperty('Context')) {
      return element.parentNode.Context;
    } else {
      return this.findParentContextOfElement(element.parentNode);
    }
  };

  /**
   * Private method that triggers the connection initialisation based on the components handled by this context and
   * their cubx-core-connections tags
   * @memberOf Context
   * @private
   */
  Context.prototype._initConnections = function () {
    // console.log('init Connections for ' + this._rootElement.tagName);
    this._connectionMgr.parseConnectionsFromComponentList(this._components);
  };

  /**
   * Private method that triggers the Slot-Inits parsed and collect.
   * @memberOf Context
   * @private
   * @private
   */
  Context.prototype._collectSlotInits = function (cif) {
    // console.log('_collectSlotInits:context',this);
    // console.log('_collectSlotInits:context._rootElement._componentCreated',this._rootElement._componentCreated);
    cif.getInitializer().parseInitSlotsForContext(this);
  };

  /**
   * Register the listeners that will handle CIF specific events
   * @memberOf Context
   * @private
   */
  Context.prototype._registerCIFListener = function () {
    var self = this;
    if (this._rootElement != null) {
      this._rootElement
        .addEventListener(window.cubx.EventFactory.types.CIF_MODEL_CHANGE, function (event) {
          self._handleModelChangeEvent(event);
        });
    }
  };

  /**
   * Handle Model Change events and stop further propagation of them
   * @memberOf Context
   * @param {object} event
   * @private
   */
  Context.prototype._handleModelChangeEvent = function (event) {
    /**
     * if event dispatcher is the compound component  itself this context belongs to it just will be ignored so
     * parent context will handle this.
     */
    if (event.target !== this._rootElement) {
      // console.log('_handleModelChangeEvent->_connectionMgr.processConnections', event.target);
      this._connectionMgr.processConnections(event.target, event.detail);
      event.stopPropagation(); // stop propagation of Model Change events
    }
  };

  // provide Context class in global scope
  if (!window.cubx.__cifError__) {
    window.cubx.cif.Context = Context;
  }
})();
