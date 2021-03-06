/* globals _,CustomEvent,HTMLElement,NodeFilter,Promise,guid,MutationSummary, Queue, customElements, Element, Node */
(function () {
  'use strict';

  /**
   * The main class of the Component Integration Framework
   * @global
   * @constructor
   */
  var CIF = function () {
    this._fireCifStart();
    /**
     * List of all root contexts currently managed by the CIF
     * @type {Array}
     * @private
     */
    this._rootContext = null;

    /**
     * Holds an array of constructors for all compound component elements
     * @type {object}
     * @private
     */
    this._compoundComponentElements = {};

    /**
     * Holds a constructor to create a custom cubx-core-connection element
     * @type {function}
     * @private
     */
    this._connectionElement = null;

    /**
     * Holds a constructor to create a custom cubx-core-connections element
     * @type {function}
     * @private
     */
    this._connectionsElement = null;

    /**
     * Holds a constructor to create a custom cubx-core-init element
     * @type {function}
     * @private
     */
    this._initSlot = null;

    /**
     * Holds a constructor to create a custom cubx-core-slot-init element
     * @type {function}
     * @private
     */
    this._slotInitElement = null;

    /**
     * Holds the initializer Instance for Intialize Slots
     * @type {Initializer}
     * @private
     */
    this._initializer = new window.cubx.cif.Initializer();

    /**
     * ObserverSummary Object for observe dynamically created or removed cubbles
     */
    this._observer; // eslint-disable-line chai-friendly/no-unused-expressions

    /**
     * A queue for dynamically added elements. The element of queue will processed separat, one after the other.
     * @type {Queue}
     * @private
     */
    this._elementQueue = new Queue();

    /**
     * Listed all allowed modelVersion.
     * @type {string[]}
     * @private
     */
    this._supportedModelVersionList = [ '10.0' ];

    /**
     * list of elements waiting for componentReady Event
     * @type {object}
     * @private
     */
    this._componentReady = {};
    /**
     * flag for all created components in crc container are ready
     * @type {boolean}
     * @private
     */
    this._cifAllComponentsReady = false;

    /**
     * ready flag for cif
     * @type {boolean}
     * @private
     */
    this._cifReady = false;

    /**
     * type of the mode of processing: 0 = not in process, 1 = initial processing, 2 = processing started from observer
     * @type number
     * @private
     */
    this._processMode = 0;

    /**
     * map of elemnt waiting for create subtree
     * key: runtimeId
     * value: true|false
     * @type {object}
     * @private
     */
    this._elementsDomTreeCreated = {};

    /**
     * Eventfactory instance
     * @type {window.cubx.EventFactory}
     * @private
     */
    this._eventFactory = new window.cubx.EventFactory();

    this._registerConnectionElements();
    this._registerInitializationElements();
    this._init();
  };

  /**
   * return of the intrernal holded initializer instance
   * memberOf CIF
   * @return {Initializer}
   */
  CIF.prototype.getInitializer = function () {
    return this._initializer;
  };

  CIF.prototype.getEventFactory = function () {
    return this._eventFactory;
  };
  /**
   * Create context for given element acting as root context.
   * @memberOf CIF
   * @param {HTMLElement} element The root element for DOM (sub) tree for which the scope is to be created
   * @return {@Context} The created context
   */
  CIF.prototype.createRootContext = function (element) {
    return new window.cubx.cif.Context(element);
  };

  /**
   * Returns a list af all crc Root Nodes that need to be provided with an own context
   * @return {array} An array of HTMLElements
   * @deprecated
   */
  CIF.prototype.getCRCRootNodeList = function () {
    return [ window.cubx.CRC.getCRCElement() ];
  };

  /**
   * Returns a crc Root Node that need to be provided with an own context
   * @return {array} An array of HTMLElements
   */
  CIF.prototype.getCRCRootNode = function () {
    return window.cubx.CRC.getCRCElement();
  };

  /**
   * Return the Constructor for creating new cubx-compound-component element
   * @memberOf CIF
   * @param {string} name
   * @return {function} The Constructor
   */
  CIF.prototype.getCompoundComponentElementConstructor = function (name) {
    // if (this._compoundComponentElements.hasOwnProperty(name)) {
    //   return this._compoundComponentElements[ name ];
    // } else {
    var constructor = this._registerCompoundComponentElement(name);
    // this._compoundComponentElements[ name ] = constructor;
    return constructor;
    // }
  };

  /**
   *
   * @memberOf CIF
   * @return {boolean} true if cif for that crc root is ready. False otherwise
   */
  CIF.prototype.isReady = function () {
    return this._cifReady;
  };

  /**
   *
   * @memberOf CIF
   * @return {boolean} true if all created elementaries  for that crc root are ready. False otherwise
   */
  CIF.prototype.isAllComponentsReady = function () {
    return this._cifAllComponentsReady;
  };

  /* ******************************************************************************************************/
  /* ********************************** private methods****************************************************/
  /* ******************************************************************************************************/

  /**
   * Make initial work for bootstraping CIF
   * @memberOf CIF
   * @private
   */
  CIF.prototype._init = function () {
    // create and set rootContext
    var node = this.getCRCRootNode();

    var rootContext = this.createRootContext(node);
    this._rootContext = rootContext;
    node.Context = this._rootContext;

    var self = this;
    //  Check if all components in the manifestCache has supported modelVersion
    this._checkModelVersionForAllComponents();
    //  get the crc root node node and create new context for it

    if (!window.cubx.CRC.isReady()) {
      node.addEventListener('crcReady', function () {
        self._initForCRCRoot(node);
      });
    } else {
      self._initForCRCRoot(node);
    }
  };

  /**
   * Initialize the context of a crc container.
   * @param {HTMLElement} node root node
   * @private
   */
  CIF.prototype._initForCRCRoot = function (node) {
    // start initial processing
    this._processInitial();
    var me = this;
    node.addEventListener(window.cubx.EventFactory.types.CIF_ALL_COMPONENTS_READY, function () {
      me._afterCreatedElementsReady(node);
    });

    //  dispatch and listen to EventFactory.types.COMPONENT_READY also on CompoundComponents
    node.addEventListener(window.cubx.EventFactory.types.COMPONENT_READY, function (evt) {
      var runtimeId = evt.target.getAttribute('runtime-id');
      // if there is no runtime-id then component's own ready event was fired before mutation observer detects changes
      // and thus before CIF has initialised these components
      if (!runtimeId) {
        me._determineMemberIdAndRuntimeId(evt.target);
        runtimeId = evt.target.getAttribute('runtime-id');
        me._componentReady[ runtimeId ] = {
          ready: true
        };
        return;
      }
      if (me._componentReady[ runtimeId ]) {
        me._componentReady[ runtimeId ].ready = true;
      }
      if (!me._hasElementsWaitingForReady()) {
        me._fireAllComponentsReady(node);
      }
    });

    this._initCubxElements(node);

    if (_.isEmpty(this._componentReady)) {
      this._fireAllComponentsReady(node);
    }
  };

  /**
   * This Method process all functionality, which should wait for all components ready.
   * @param {HTMLElment} node
   * @private
   */
  CIF.prototype._afterCreatedElementsReady = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    this._createConnectionElements(node);
    this._initConnections();
    //  init Tags einfügen
    this._createInitElements(node);
    //  run slot init
    this._initSlots(node);

    if (this._isInitialProcessing()) {
      this._createObserverObject();
    }
    if (this._isObserverTriggeredProcessing()) {
      this._processElementFromQueue();
    }
    //  dispatch ready event
    this._ready(node);
    // reset the processMode to not processed
    this._resetProcessMode();
  };

  /**
   * Check if not ready elements exists.
   * @return {boolean}
   * @private
   */
  CIF.prototype._hasElementsWaitingForReady = function () {
    var firstAttrFalse = _.findKey(this._componentReady, function (ready) {
      if (typeof ready.notReadyMembers === 'boolean') {
        return !ready.ready || ready.notReadyMembers;
      } else {
        return !ready.ready;
      }
    });
    return firstAttrFalse !== undefined;
  };

  /**
   * Create the mutation summary observer
   * @private
   */
  CIF.prototype._createObserverObject = function () {
    var crcRoot = this.getCRCRootNode();
    if (Object.keys(window.cubx.CRC.getCache().getAllComponents()).length === 0) {
      console.warn('Can not initialise Mutation Summary (observer), because the component cache is empty.');
      return;
    }
    var elements = Object.keys(window.cubx.CRC.getCache().getAllComponents());

    var observerConfig = {
      callback: this._detectMutation,
      rootNode: crcRoot,
      queries: [
        {
          element: elements.join(',')
        },
        {
          element: 'cubx-core-connections, cubx-core-connection'
        },
        {
          element: 'cubx-core-slot-init'
        }
      ]
    };
    if (window.cubx.CRC.getRuntimeMode() === 'dev') {
      console.log('mutations-summary config', observerConfig);
    }
    this._observer = new MutationSummary(observerConfig);
  };

  /**
   * Handler methode for mutataion summary (observer)
   * @param {Array} summaries all observed changes
   * @private
   */
  CIF.prototype._detectMutation = function (summaries) {
    if (window.cubx.CRC.getRuntimeMode() === 'dev') {
      console.log('called cif._detectMutation', summaries);
    }
    var cif = window.cubx.cif.cif;
    // added, removed cubbles
    var componentChangeSummary = summaries[ 0 ];
    if (componentChangeSummary.added.length > 0) {
      cif._addPossibleElementToQueue(componentChangeSummary.added);
      cif._processElementFromQueue();
    }
    // TODO: remove forEach. Instead push whole array to queue. Use if to check if array is not empty
    componentChangeSummary.removed.forEach(function (removedEl) {
      cif._handleRemovedCubble(removedEl, componentChangeSummary.getOldParentNode(removedEl));
    });

    // added or removed cubx-core-connections or cubx-core-connection
    componentChangeSummary = summaries[ 1 ];
    componentChangeSummary.added.forEach(function (addedEl) {
      if (addedEl.tagName === 'CUBX-CORE-CONNECTION' && !addedEl.generatedByCif) {
        cif._handleAddedConnection(addedEl);
      }
    });
    componentChangeSummary.removed.forEach(function (removedEl) {
      if (removedEl.tagName === 'CUBX-CORE-CONNECTIONS') {
        cif._handleRemovedConnections(removedEl, componentChangeSummary.getOldParentNode(removedEl));
      }
      if (removedEl.tagName === 'CUBX-CORE-CONNECTION') {
        var parent = componentChangeSummary.getOldParentNode(removedEl).parentNode;
        if (parent) { // handle removed connection just, if the tag is removed from DOM directly. (The oldParentNode is in DOM)
          cif._handleRemovedConnection(removedEl, parent);
        }
      }
    });
  };

  /**
   * Check for exsiting RuntimeId or generate if no one is present.
   * @param element
   * @private
   */
  CIF.prototype._determineMemberIdAndRuntimeId = function (element) {
    var componentName = this._getTagname(element);
    var resolvedComponentManifest = window.cubx.CRC.getResolvedComponent(componentName);
    var originMemberId = element.getAttribute('member-id');
    var originId = element.getAttribute('id');
    var originRuntimeId = element.getAttribute('runtime-id');
    var memberId = originMemberId || originId || guid();
    var componentId = resolvedComponentManifest.webpackageId + '/' + resolvedComponentManifest.artifactId;
    var runtimeId = componentId + '.' + memberId;

    if (originRuntimeId && runtimeId !== originRuntimeId) {
      console.warn('The "runtime-id" attribute is invalid: (' + originRuntimeId + '). It will be set to:' + runtimeId);
      element.setAttribute('runtime-id', runtimeId);
    }
    if (!element.getAttribute('runtime-id')) {
      element.setAttribute('runtime-id', runtimeId);
    }

    if (!originMemberId) {
      element.setAttribute('member-id', memberId);
    }
  };

  CIF.prototype._handleRemovedCubble = function (element, oldParentNode) {
    if (!element || element.generatedByCif) { // no remove handling for elements generated by cif
      return;
    }
    var context;
    if (oldParentNode && oldParentNode.Context) {
      context = oldParentNode.Context;
    } else if (oldParentNode) {
      var parentElem = this._findNextAncestorWithContext(oldParentNode);
      if (parentElem) {
        context = parentElem.Context;
      }
      if (!context && this.getCRCRootNode() && this.getCRCRootNode().Context && this.getCRCRootNode().Context._components.find(function (comp) { return comp === element; })) {
        context = this.getCRCRootNode().Context;
      }
    }
    if (context) {
      // 1. remove connection if element is a source
      // 2. remove internal connections
      // 3. searched for marked connection with element is a destination of
      context._connectionMgr.tidyConnectionsWithCubble(element);
      // remove element from parent context
      var index = context.getComponents().indexOf(element);
      if (index > -1) {
        context.getComponents().splice(index, 1);
      }
    } else {
      console.warn('No context found for removed cubble "' + element.tagName.toLowerCase() + '".');
    }
  };

  /**
   * Check if element descendant of the crcRoot is. If it is, add to the element queue.
   * @param element potentiell html element to add the element queue
   * @private
   */
  CIF.prototype._addPossibleElementToQueue = function (element) {
    // var ancestor = this._findNextAncestorWithContext(element);
    // if (ancestor === this.getCRCRootNode()) {
    //   this._elementQueue.enqueue(element);
    // }

    if (!element.generatedByCif) {
      this._elementQueue.enqueue(element);
    }
  };

  /**
   * Process the next element from the queue.
   * @private
   */
  CIF.prototype._processElementFromQueue = function () {
    // 1. getElement
    var elements = this._elementQueue.dequeue();
    if (!elements) { // end the process, if no element in the queue
      return;
    }
    // flag indicates that there are outstanding components which needs to be processed by CIF (even if elementary components are still ready)
    this._cifAllComponentsReady = false;

    var initOrder = 0;
    var memberIds = [];
    elements.forEach(function (element) {
      if (element.processed) {
        return;
      }
      this._processObserverTriggered();
      // 2. Update cubx-core-connection elements
      this._updateCubxCoreConnections(element);
      // 3. Update cubx-core-slot-init elements
      initOrder = this._updateCubxCoreInit(element, initOrder);
      // 4. for each cubbles call _initCubxElementsInRoot
      this._initCubxElementsInRoot(element, memberIds);
      // check if marked=removed connection exists as destination to this element and activate it
      this._reactivateConnectionIfExists(element);
    }, this);

    // check if all Componentes in CRC are ready and fire all components ready event if so
    if (!this._hasElementsWaitingForReady()) {
      this._fireAllComponentsReady();
    }
  };

  /**
   * Reactivate old connection if exists
   * 1. search in _removedConnection for a connection with destination as the element (memberId)
   * 2. add element as destination.component
   * 3. move connection to _connections
   * 4. propagate throw the connection the source's slot value.
   * @param {HTMLElement} element the cubble as potential destination component
   * @private
   */
  CIF.prototype._reactivateConnectionIfExists = function (element) {
    var parent = this._findNextAncestorWithContext(element);
    if (!parent) {
      return;
    }
    var connectionMgr = parent.Context._connectionMgr;
    connectionMgr.reactivateConnectionIfExists(element);
  };
  /**
   * Find the next ancestor with context property of the element and get it. If no element with context found get undefined.
   * @param {HTMLElement} element
   * @private
   */
  CIF.prototype._findNextAncestorWithContext = function (element) {
    // abort criterion if  the element is BODY
    if (element.tagName === 'BODY') {
      return;
    }
    // abort criterion if no parentNode exists
    if (!element.parentNode) {
      return;
    }
    if (element.parentNode.Context) {
      return element.parentNode;
    } else {
      return this._findNextAncestorWithContext(element.parentNode);
    }
  };

  /**
   * Handle a dynamically added &lt;cubx-core-connection&gt; element
   * The connection will be added to the parent context, considering by following rules:
   * - not internal connections allowed for dynamically added connectins
   * - the dynamically added connection must be in scope of root context
   * - the &lt;cubx-core-connectionsgt; tag must be a child of &lt;cubx-core-connections&gt; tag and
   * - the parent &lt;cubx-core-connections&gt; must be a direct child of an cubbles
   * @param {HTMLElement} connectionElement the &lt;cubx-core-connection&gt; element
   * @private
   */
  CIF.prototype._handleAddedConnection = function (connectionElement) {
    if (!connectionElement || connectionElement.generatedByCif) {
      return;
    }
    if (connectionElement.getType() === 'internal') {
      console.warn('Can\'t handle added element, because it is an internal connection. Added connection:', connectionElement);
      return;
    }
    // get connections
    var connections = connectionElement.parentNode;
    if (!connections || connections.tagName !== 'CUBX-CORE-CONNECTIONS') {
      console.warn('Can\'t handle the added element. A "cubx-core-connection" element must be a child of a "cubx-core-connections" element. Added element:', connectionElement);
      return;
    }
    // get component
    var component = connections.parentNode;
    if (!window.cubx.CRC.getCache().getComponentCacheEntry(component.tagName.toLowerCase())) {
      console.warn('Can\'t handle the added element. A "cubx-core-connections" element must be a child an cubble. The current parent element:', component);
      return;
    }
    // get parent cubbles with context
    var parent = this._findNextAncestorWithContext(component);
    // Just connections in root context allowed
    if (parent !== this.getCRCRootNode()) {
      console.warn('Can\'t handle added element. The connection in not in scope of root context. It is only allowed add connection element dynamically for the root context. Added connection:', connectionElement);
      return;
    }
    if (parent) {
      // create connection in connectionMgr
      parent.Context.getConnectionMgr().createConnectionFromComponent(component, connectionElement);
    }
  };

  /**
   * Handle removed &lt;cubx-core-connections&gt; tags.
   * Handle all &lt;cubx-core-connection&gt; children.
   * @param {HTMLElement} connectionsElement the &lt;cubx-core-connections&gt; element
   * @param oldParentNode the parentNode before the element was removed
   * @private
   */
  CIF.prototype._handleRemovedConnections = function (connectionsElement, oldParentNode) {
    for (var i = 0; i < connectionsElement.children.length; i++) {
      var elem = connectionsElement.children[ i ];
      if (elem.tagName === 'CUBX-CORE-CONNECTION') {
        this._handleRemovedConnection(elem, oldParentNode);
      }
    }
  };

  /**
   * Handle a removed &lt;cubx-core-connection&gt; element.
   * @param {HTMLElement} connectionElement the removed &lt;cubx-core-connection&gt; element
   * @param parentCubble the parent cubble before the element was removed
   * @private
   */
  CIF.prototype._handleRemovedConnection = function (connectionElement, parentCubble) {
    if (connectionElement && connectionElement.generatedByCif) {
      return;
    }
    if (connectionElement.getType() === 'internal') {
      console.warn('Can\'t handle removed element, because it is an internal connection. Removed connection:', connectionElement);
      return;
    }

    // get component
    var component = parentCubble;
    if (!window.cubx.CRC.getCache().getComponentCacheEntry(component.tagName.toLowerCase())) {
      console.warn('Can\'t handle the removed connection element. A "cubx-core-connections" element must be a child an cubble. The current parent element:', component);
      return;
    }
    // get parent cubbles with context
    var parent = this._findNextAncestorWithContext(component);
    // Just connections in root context allowed
    // TODO: change next line to: if (parent && parent !== this.getCRCRootNode())
    if (parent !== this.getCRCRootNode()) {
      console.warn('Can\'t handle removed element. The connection in not in scope of root context. It will only processed a removed connection element in the scope of root context. Removed connection:', connectionElement);
      return;
    }
    parent.Context.getConnectionMgr().removeConnection(connectionElement);
  };
  /**
   * Fire the cifAllComponentsReady Event.
   * @param {HTMLNode} node A crc root-node
   * @private
   */
  CIF.prototype._fireAllComponentsReady = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    if (this._cifAllComponentsReady) {
      return;
    }
    if (window.cubx.CRC.getRuntimeMode() === 'dev') {
      console.log('------------------------allComponentsReady-------------');
    }
    this._cifAllComponentsReady = true;
    var evt = this.getEventFactory().createEvent(window.cubx.EventFactory.types.CIF_ALL_COMPONENTS_READY);
    node.dispatchEvent(evt);
  };

  /**
   * Fire the cifStart Event.
   * @param {HTMLElement} node
   * @private
   */
  CIF.prototype._fireCifStart = function (node) {
    var evt = new CustomEvent(window.cubx.EventFactory.types.CIF_START, { bubbles: true });
    document.dispatchEvent(evt);
  };

  /**
   * Check, if node in crc-_manifestCache  exists.
   * @param {Node} node - Dom-Node
   * @return {boolean} true, if the node crc._manifestCache exists, else false
   * @private
   */
  CIF.prototype._isNodeInCache = function (node) {
    var tagname = this._getTagname(node);
    return window.cubx.CRC.getCache().getWebpackageDocument(tagname);
  };

  /**
   * Initialize all cubx eements in crc container.
   * @param {HTMLNode} rootNode A crc root-node
   * @memberOf CIF
   * @private
   */
  CIF.prototype._initCubxElements = function (rootNode) {
    if (!rootNode) {
      rootNode = this.getCRCRootNode();
    }

    var filter = {
      acceptNode: function (currNode) {
        var except = [ 'CUBX-CORE-CONNECTIONS', 'CUBX-CORE-CONNECTION', 'CUBX-CORE-INIT', 'CUBX-CORE-SLOT-INIT' ];
        if (currNode.nodeType === currNode.ELEMENT_NODE && currNode.tagName.indexOf('-') > -1 && except.indexOf(currNode.tagName) === -1) {
          return NodeFilter.FILTER_ACCEPT;
        } else {
          return NodeFilter.FILTER_SKIP;
        }
      }
    };

    var safeFilter = filter.acceptNode;
    safeFilter.acceptNode = filter.acceptNode;

    // 1. iterate all over children recursive  - treeWalker - collect all cubbes components
    // check all nodes of custom element and if the are cubbles (contained in crc/cache
    var walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT, safeFilter, false);
    // var node = walker.currentNode;
    var elementList = [];
    while (walker.nextNode()) {
      var curNode = walker.currentNode;
      var manifest = window.cubx.CRC.getCache().getComponentCacheEntry(this._getTagname(curNode));
      if (typeof manifest === 'object') {
        elementList.push(curNode);
      }
    }

    var memberIds = [];
    var initOrder = 0;
    elementList.forEach(function (element) {
      // 2. Update cubx-core-connection elements
      this._updateCubxCoreConnections(element);
      // 3. Update cubx-core-slot-init elements
      initOrder = this._updateCubxCoreInit(element, initOrder);
      // 4. for each cubbles call _initCubxElementsInRoot
      this._initCubxElementsInRoot(element, memberIds);
    }, this);
  };

  /**
   * get the tagname of the node as lowercase
   * @param {HTMLElement} node
   * @return {string} tagname for the node as lowercase.
   * @private
   */
  CIF.prototype._getTagname = function (node) {
    return node.tagName.toLowerCase();
  };

  /**
   * Init a root level cubbles element.
   * The following tasks will be done:
   * * If a memberId not exists, will generate a GUID as a memberId. It will check, of the memberIds are all uniq.
   * * a runtimeId will be generated. An existing not valid runtimeId will overriden.
   * * componentId will be genereted. An existing not valid componentId will overriden.
   * * The element will be added to rootContext._components property.
   * * If the element has a Context, the Context._parent will setted to the rootContext
   * * If the element is a compound component, the subtree will created.
   * @memberOf CIF
   * @param {HtmlElement} element
   * @param {array} memberIds
   * @private
   */
  CIF.prototype._initCubxElementsInRoot = function (element, memberIds) {
    var componentName = this._getTagname(element);
    var resolvedComponentManifest = window.cubx.CRC.getResolvedComponent(componentName);
    this._determineMemberIdAndRuntimeId(element);
    var memberId = element.getAttribute('member-id');
    var runtimeId = element.getAttribute('runtime-id');
    if (_.includes(memberIds, memberId)) {
      throw new Error('The member-id "' + memberId + '" is not uniq. The same memberId used before.');
    }
    memberIds.push(memberId);
    this._rootContext.addComponent(element);
    if (this._isElementaryComponent(element)) {
      // tree.setAttribute('runtime-id', runtimeId);
      if (!element._componentReady) {
        this._componentReady[ runtimeId ] = {
          ready: false
        };
      }
      // this._rootContext.addComponent(current); // add created component to contexts component list
      // set parent context if tree is a compound component (so it has a context)
      if (element.hasOwnProperty('Context')) {
        element.Context.setParent(this._rootContext);
      }
    } else {
      element = this._createDOMTreeFromManifest(resolvedComponentManifest, element);
      //  add the comonent to rootcontext BEVOR trigger CIF_COMPONENT_DOMTREE_READY event
      // this._rootContext.addComponent(current); // add created component to contexts component list
      // set parent context if tree is a compound component (so it has a context)
      if (element.hasOwnProperty('Context')) {
        element.Context.setParent(this._rootContext);
      }
      element.fireReadyEvent(element.getAttribute('runtime-id'));
    }
    element.processed = true;
  };

  /**
   * Update the subtree from <cubx-core-init> element.
   *  - It will remove <cubx-core-slot-init> elements with type="internal" attribute, because they are not allowed.
   *  - It will update all <cubx-core-slot-init> children.
   * @memberOf CIF
   * @param {HtmlElement} element
   * @param {number} initOrder
   * @private
   */
  CIF.prototype._updateCubxCoreInit = function (element, initOrder) {
    var cubxCoreInit = element.querySelector('cubx-core-init');
    if (cubxCoreInit) {
      var cubxCoreSlotinits = cubxCoreInit.querySelectorAll('cubx-core-slot-init');
      var removeList = [];
      var i;
      for (i = 0; i < cubxCoreSlotinits.length; i++) {
        if (cubxCoreSlotinits[ i ].getType() && cubxCoreSlotinits[ i ].getType() === 'internal') {
          removeList.push(cubxCoreSlotinits[ i ]);
        } else {
          this._updateCubxCoreSlotInits(cubxCoreSlotinits[ i ], initOrder++);
        }
      }

      for (i = removeList.length - 1; i >= 0; i--) {
        console.error('Internal initialisation in root level per tags not allowed. The following init tag will be deleted: ', removeList[ i ]);
        removeList[ i ].parentNode.removeChild(removeList[ i ]);
      }
    }
    return initOrder;
  };

  /**
   * Update <cubx-core-slot-init> Tags: add the order and deeplevel attribute.
   * The deeplevel will have always the value of 0. Th order attribute will be setted to the value of the order paramemeter.
   *
   * @memberOf CIF
   * @param {HtmlElement} cubxSlotInit the <cubx-core-slot-init> element
   * @param {Number} order the init order
   * @private
   */
  CIF.prototype._updateCubxCoreSlotInits = function (cubxSlotInit, order) {
    cubxSlotInit.setOrder(order);
    cubxSlotInit.setDeepLevel(0);
  };
  /**
   * Update the subtree from <cubx-core-connections> element.
   *  * It will remove <cubx-core-connection> elements with type="internal" attribute, because they are not allowed.
   * @memberOf CIF
   * @param element
   * @private
   */
  CIF.prototype._updateCubxCoreConnections = function (element) {
    var cubxCoreConnectionList = element.querySelectorAll('cubx-core-connection');
    var i;
    for (i = cubxCoreConnectionList.length - 1; i >= 0; i--) {
      var con = cubxCoreConnectionList[ i ];
      if (con.getType() && con.getType() === 'internal') {
        console.error('Internal initialisation in root level per tags not allowed. The following connection tag will be deleted: ', con);
        con.parentNode.removeChild(con);
      }
    }
  };

  /**
   * Init all connections based on the cubx-core-connections tags
   * @memberOf CIF
   * @private
   */
  CIF.prototype._initConnections = function () {
    this._rootContext.initConnections();
  };

  /**
   * Init slots based on the cubx-core-init tags before init fired cifInitStart event, after init
   * fired cifInitReady Event
   * @param {HTMLElement} node
   * @memberOf CIF
   * @private
   */
  CIF.prototype._initSlots = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    var cifInitStartEvent = this.getEventFactory().createEvent(window.cubx.EventFactory.types.CIF_INIT_START);
    node.dispatchEvent(cifInitStartEvent);
    var me = this;
    this._rootContext.collectSlotInits(me);
    this._initializer.sortInitList();
    if (window.cubx.CRC.getRuntimeMode() === 'dev') {
      console.log('cif._initializer._initList (', this._initializer._initList.length, ')', this._initializer._initList);
    }
    this._initializer.initSlots();
    var cifInitReadyEvent = this.getEventFactory().createEvent(window.cubx.EventFactory.types.CIF_INIT_READY);
    node.dispatchEvent(cifInitReadyEvent);
    this._initializer.resetInitList();
  };

  /**
   * Register new element for handling compound components
   * @memberOf CIF
   * @param {string} name
   * @return {function}
   * @private
   */
  CIF.prototype._registerCompoundComponentElement = function (name) {
    if (typeof name !== 'string' || (typeof name === 'string' && name.indexOf('-') < 1)) {
      throw new TypeError('parameter name needs to be of type "string" and needs to contain a "-"');
    }

    function getConstructor () {
      var CompoundComponentClass = function () {
        var htmlEl = HTMLElement.call(this);
        var me;
        if (htmlEl) {
          me = htmlEl;
        } else {
          me = this;
        }
        Object.assign(me, window.cubx.cif.compoundComponent);
        me.createdCallback();
        return htmlEl;
      };
      Object.setPrototypeOf(CompoundComponentClass.prototype, HTMLElement.prototype);
      Object.setPrototypeOf(CompoundComponentClass, HTMLElement);
      return CompoundComponentClass;
    }

    var constructor = customElements.get(name);
    if (!constructor) {
      constructor = getConstructor();
      customElements.define(name, constructor);
    }

    return constructor;
  };

  /**
   * Register new elements for handling connections
   * @memberOf CIF
   * @private
   */
  CIF.prototype._registerConnectionElements = function () {
    function getConnectionConstructor () {
      var ConnectionClass = function () {
        return HTMLElement.call(this);
      };

      ConnectionClass.prototype.setSource = function (slot) {
        this.setAttribute('source', slot);
      };
      ConnectionClass.prototype.getSource = function () {
        return this.getAttribute('source');
      };
      ConnectionClass.prototype.setDestination = function (slot, memberIndex) {
        var destination = memberIndex != null ? memberIndex + ':' + slot : 'parent:' + slot;
        this.setAttribute('destination', destination);
      };
      ConnectionClass.prototype.getDestination = function () {
        return this.getAttribute('destination');
      };
      ConnectionClass.prototype.setType = function (type) {
        this.setAttribute('type', type);
      };
      ConnectionClass.prototype.getType = function () {
        return this.getAttribute('type');
      };
      ConnectionClass.prototype.setConnectionId = function (connectionId) {
        this.setAttribute('connection-id', connectionId);
      };
      ConnectionClass.prototype.getConnectionId = function () {
        return this.getAttribute('connection-id');
      };
      ConnectionClass.prototype.setCopyValue = function (copyValue) {
        this.setAttribute('copy-value', copyValue);
      };
      ConnectionClass.prototype.getCopyValue = function () {
        return this.getAttribute('copy-value');
      };
      ConnectionClass.prototype.setRepeatedValues = function (repeatedValues) {
        this.setAttribute('repeated-values', repeatedValues);
      };
      ConnectionClass.prototype.getRepeatedValues = function () {
        return this.getAttribute('repeated-values');
      };
      ConnectionClass.prototype.setHookFunction = function (hook) {
        this.setAttribute('hook-function', hook);
      };
      ConnectionClass.prototype.getHookFunction = function () {
        return this.getAttribute('hook-function');
      };
      Object.setPrototypeOf(ConnectionClass.prototype, HTMLElement.prototype);
      Object.setPrototypeOf(ConnectionClass, HTMLElement);
      return ConnectionClass;
    }

    var constructorConnection = customElements.get('cubx-core-connection');
    if (!constructorConnection) {
      constructorConnection = getConnectionConstructor();
      customElements.define('cubx-core-connection', constructorConnection);
      this._connectionElement = constructorConnection;
    }

    function getConnectionsConstructor () {
      var ConnectionsClass = function () {
        var htmlEl = HTMLElement.call(this);
        var me;
        if (htmlEl) {
          me = htmlEl;
        } else {
          me = this;
        }
        setTimeout(function () {
          this.style.display = 'none';
        }.bind(me), 0);
        return htmlEl;
      };

      Object.setPrototypeOf(ConnectionsClass.prototype, HTMLElement.prototype);
      Object.setPrototypeOf(ConnectionsClass, HTMLElement);
      return ConnectionsClass;
    }

    var constructorConnections = customElements.get('cubx-core-connections');
    if (!constructorConnections) {
      constructorConnections = getConnectionsConstructor();
      customElements.define('cubx-core-connections', constructorConnections);
      this._connectionsElement = constructorConnections;
    }
  };
  /**
   * Register new elements for handling initialization
   * @memberOf CIF
   * @private
   */
  CIF.prototype._registerInitializationElements = function () {
    function getInitConstructor () {
      var InitClass = function () {
        var htmlEl = HTMLElement.call(this);
        var me;
        if (htmlEl) {
          me = htmlEl;
        } else {
          me = this;
        }
        setTimeout(function () {
          this.style.display = 'none';
        }.bind(me), 0);

        return htmlEl;
      };

      Object.setPrototypeOf(InitClass.prototype, HTMLElement.prototype);
      Object.setPrototypeOf(InitClass, HTMLElement);
      return InitClass;
    }
    var constructorInit = customElements.get('cubx-core-init');
    if (!constructorInit) {
      constructorInit = getInitConstructor();
      customElements.define('cubx-core-init', constructorInit);
      this._initSlot = constructorInit;
    }

    function getSlotInitConstructor () {
      var SlotInitClass = function () {
        return HTMLElement.call(this);
      };

      SlotInitClass.prototype.setSlot = function (slot) {
        this.setAttribute('slot', slot);
      };
      SlotInitClass.prototype.getSlot = function () {
        return this.getAttribute('slot');
      };
      SlotInitClass.prototype.setMember = function (member) {
        this.setAttribute('member', member);
      };
      SlotInitClass.prototype.getMember = function () {
        return this.getAttribute('member');
      };
      SlotInitClass.prototype.setOrder = function (order) {
        this.setAttribute('order', order);
      };
      SlotInitClass.prototype.getOrder = function () {
        return this.getAttribute('order');
      };
      SlotInitClass.prototype.getType = function () {
        return this.getAttribute('type');
      };
      SlotInitClass.prototype.setType = function (type) {
        this.setAttribute('type', type);
      };
      SlotInitClass.prototype.getDeepLevel = function () {
        return this.getAttribute('deeplevel');
      };
      SlotInitClass.prototype.setDeepLevel = function (deeplevel) {
        this.setAttribute('deeplevel', deeplevel);
      };
      Object.setPrototypeOf(SlotInitClass.prototype, HTMLElement.prototype);
      Object.setPrototypeOf(SlotInitClass, HTMLElement);
      Object.defineProperty(SlotInitClass.prototype, 'textContent', {
        get: function () {
          var script = this.querySelector('script');
          if (script) {
            return JSON.parse(script.textContent);
          }
          return Object.getOwnPropertyDescriptor(Node.prototype, 'textContent').get.call(this);
        },
        set: function (newValue) {
          var script = this.querySelector('script');
          if (script) {
            script.textContent = newValue;
          }
          return Object.getOwnPropertyDescriptor(Element.prototype, 'textContent').set.call(this, newValue);
        }
      });
      Object.defineProperty(SlotInitClass.prototype, 'innerHTML', {
        get: function () {
          var script = this.querySelector('script');
          if (script) {
            return JSON.parse(script.innerHTML);
          }
          return Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get.call(this);
        },
        set: function (newValue) {
          var script = this.querySelector('script');
          if (script) {
            script.innerHTML = newValue;
          }
          return Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set.call(this, newValue);
        }
      });
      Object.defineProperty(SlotInitClass.prototype, 'connectedCallback', {
        value: function () {
          // build a <template> element to inject
          const script = document.createElement('script');
          script.innerHTML += JSON.stringify(this.innerHTML);
          this.innerText = ''; // Remove none needed markup from DOM
          this.appendChild(script);
        }
      });
      return SlotInitClass;
    }
    var constructorSlotInit = customElements.get('cubx-core-slot-init');
    if (!constructorSlotInit) {
      constructorSlotInit = getSlotInitConstructor();
      customElements.define('cubx-core-slot-init', constructorSlotInit);
      this._slotInitElement = constructorSlotInit;
    }
  };
  /**
   * Returns the DOMTree on basis of manifest object representing the complete application including all it's used
   * compound and elementary components
   * @memberOf CIF
   * @private
   * @param {object} manifest The manifest object
   * @param {HTMLElement} root tag
   * be a [NamedNodeMap]{@link https:// developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap})
   * @return {object}
   */
  CIF.prototype._createDOMTreeFromManifest = function (manifest, root) {
    if (manifest.artifactId !== root.tagName.toLowerCase()) {
      throw new Error('The manifest has referenced a different tag (' + manifest.artifactId +
        '), than the tag in the CRC container (' + root.tagName.toLowerCase() + ').');
    }
    var runtimeId = root.getAttribute('runtime-id');
    this._componentReady[ runtimeId ] = {
      ready: false,
      notReadyMembers: true

    };
    if (this._isCompoundComponentInManifest(manifest)) {
      this.getCompoundComponentElementConstructor(root.tagName.toLocaleLowerCase());
      _.merge(root.prototype, window.cubx.cif.compoundComponent);
      root.createdCallback();
      root.connectedCallback();
    }

    // root.setAttribute('runtime-id', runtimeId);

    // if there are connections defined on this deeplevel append them to root node for later processing
    if (manifest.hasOwnProperty('connections')) {
      root._connections = manifest.connections;
    }
    root._deeplevel = 0;
    // if there are inits defined on this deeplevel append them to root node for later processing
    if (manifest.hasOwnProperty('inits')) {
      root._inits = manifest.inits;
    }

    // if there are members create corresponding domNodes and attach them to root node
    if (!this._isElementaryComponentInManifest(manifest)) {
      this._componentReady[ runtimeId ].notReadyMembers = true;
      this._attachMembers(root, manifest, 1);
    }

    return root;
  };

  /**
   * Attach the members component to a Compound Component.
   * @memberOf CIF
   * @param {HTMLElement} root root compound
   * @param {object} rootManifest The manifestof the root component
   * @param {number} deeplevel current deeplevel
   * @private
   */
  CIF.prototype._attachMembers = function (root, rootManifest, deeplevel) {
    var rootRuntimeId = root.getAttribute('runtime-id');
    var artifactId = root.tagName.toLowerCase();
    var promise = window.cubx.utils.findTemplate(artifactId);
    var me = this;
    promise.then(
      function (results) {
        var template;
        for (var i = 0; i < results.length; i++) {
          var result = results[ i ];
          if (typeof result === 'object') {
            template = result;
            break;
          }
        }
        if (template) {
          me._attachMembersFromTemplate(root, rootManifest, template, deeplevel);
        } else {
          me._attachMembersFromManifest(root, rootManifest, deeplevel);
        }
        root.fireReadyEvent(rootRuntimeId);
        me._componentReady[ rootRuntimeId ].notReadyMembers = false;
        if (!me._hasElementsWaitingForReady()) {
          me._fireAllComponentsReady(root);
        }
      });
  };

  /**
   * Attach template to the root component.
   * @param {HTMLElement} root root component
   * @param {object} rootManifest the manifest of the root element
   * @param {HTMLTemplateElement} template the template element
   * @param {number} deeplevel the  current deeplevel
   * @memberOf CIF
   * @private
   */
  CIF.prototype._attachMembersFromTemplate = function (root, rootManifest, template, deeplevel) {
    this._checkTemplateForCustomTags(rootManifest, template);
    var rootRuntimeId = root.getAttribute('runtime-id');
    var templateContent = document.importNode(template.content, true);
    var elementList = templateContent.querySelectorAll('[member-id-ref]');

    for (var i = 0; i < elementList.length; i++) {
      var runtimeId;
      var component = elementList[ i ];
      // component will added to dom content by cif -> generatedByCif
      component.generatedByCif = true;
      var memberId = component.getAttribute('member-id-ref');

      var cache = window.cubx.CRC.getCache();
      var manifest = cache.getComponentCacheEntry(component.tagName.toLowerCase());

      if (!manifest) {
        if (window.cubx.CRC.getRuntimeMode() === 'dev') {
          console.warn('The component "' + component.tagName.toLowerCase() +
            '" not referenced yet. Please include the dependency definition to the component "' + root.tagName.toLowerCase() + '".');
        }
        continue;
      }
      if (manifest && !_.find(rootManifest.members, { 'memberId': component.getAttribute('member-id-ref') })) {
        if (window.cubx.CRC.getRuntimeMode() === 'dev') {
          console.warn('The cubbles "' + manifest.artifactId + '" is not a member component of "' + rootManifest.artifactId + '".');
        }
        continue;
      }
      var componentId = manifest.webpackageId + '/' + manifest.artifactId;
      // create runtimeId
      runtimeId = rootRuntimeId + ':' + componentId + '.' + memberId;
      component.setAttribute('runtime-id', runtimeId);
      //  add  Element to list of waiting for Ready Elements --> Ready-Event necessary
      this._componentReady[ runtimeId ] = {
        ready: false
      };
      if (this._isCompoundComponentInManifest(manifest)) {
        // currentMember is a compound component
        this.getCompoundComponentElementConstructor(component.tagName.toLocaleLowerCase());
        _.merge(component, window.cubx.cif.compoundComponent);
        component.createdCallback();
        if (root.hasOwnProperty('Context')) {
          // set parent context
          component.Context.setParent(root.Context);
        }
        // if there are connections defined on this deeplevel append them to compoundEl node for later processing
        if (manifest.hasOwnProperty('connections')) {
          component._connections = manifest.connections;
        }
        if (manifest.hasOwnProperty('inits')) {
          component._inits = manifest.inits;
        }
      }

      if (memberId) {
        component.setAttribute('member-id', memberId);
      }
      if (component.hasAttribute('member-id-ref')) {
        component.removeAttribute('member-id-ref');
      }
      component._deeplevel = deeplevel;

      if (root.hasOwnProperty('Context')) {
        // add created compound component to parent contexts component array
        root.Context.addComponent(component); // add created component to parent contexts component array
      }

      if (manifest.hasOwnProperty('members')) {
        this._componentReady[ runtimeId ].notReadyMembers = true;
        this._attachMembers(component, manifest, deeplevel + 1);
      }
      component.processed = true;
    }
    root.appendChild(templateContent);
  };
  /**
   * Default way to attach the members to the compound (without template).
   * @param {HTMLElement} root the root cubbles element
   * @param {object} rootManifest the manifest for the root element
   * @param {number} deeplevel deeplevel
   * @memberOf CIF
   * @private
   */
  CIF.prototype._attachMembersFromManifest = function (root, rootManifest, deeplevel) {
    var rootRuntimeId = root.getAttribute('runtime-id');
    var members = rootManifest.members;
    for (var i = 0; i < members.length; i++) {
      var runtimeId;
      var currentMember = members[ i ];
      var component = null; // holds the component that is created (either a compound or an elementary one)
      if (!this._isElementaryComponentInManifest(currentMember)) {
        // currentMember is a compound component
        var constructor = this.getCompoundComponentElementConstructor(currentMember.artifactId);
        component = new constructor();
        // component.Context = new window.cubx.cif.Context(component);
        if (root.hasOwnProperty('Context')) {
          // set parent context
          component.Context.setParent(root.Context);
        }
        // if there are connections defined on this deeplevel append them to compoundEl node for later processing
        if (currentMember.hasOwnProperty('connections')) {
          component._connections = currentMember.connections;
        }
        if (currentMember.hasOwnProperty('inits')) {
          component._inits = currentMember.inits;
        }
      } else {
        component = document.createElement(currentMember.artifactId);
      }
      // component will add to dom content by cif
      component.generatedByCif = true;
      if (currentMember.hasOwnProperty('memberId')) {
        component.setAttribute('member-id', currentMember.memberId);
      }
      component._deeplevel = deeplevel;

      if (root.hasOwnProperty('Context')) {
        // add created compound component to parent contexts component array
        root.Context.addComponent(component); // add created component to parent contexts component array
      }
      var componentId = currentMember.webpackageId + '/' + currentMember.artifactId;
      // create runtimeId
      runtimeId = rootRuntimeId + ':' + componentId + '.' + currentMember.memberId;
      component.setAttribute('runtime-id', runtimeId);
      //  add  Element to list of waiting for Ready Elements --> Ready-Event necessary
      this._componentReady[ runtimeId ] = {
        ready: false
      };
      if (currentMember.hasOwnProperty('members')) {
        this._componentReady[ runtimeId ].notReadyMembers = true;
        this._attachMembers(component, currentMember, deeplevel + 1);
      }
      component.processed = true;
      root.appendChild(component);
    }
  };

  /**
   * Check the template content for custom elements:
   * Cubbles elements,, which are not members of the parent compound, will marked with
   * the attribute not-found-in-members = true and cause a warning message..
   * Get an warning if a cubbles element (a custom element contained in Component Cache) not have an attribute "member-id-ref".
   * @param rootManifest
   * @param template
   * @memberOf CIF
   * @private
   */
  CIF.prototype._checkTemplateForCustomTags = function (rootManifest, template) {
    if (window.cubx.CRC.getRuntimeMode() === 'dev') {
      var walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT, null, false);
      var node = walker.currentNode;
      while (node) {
        // Custom Tag
        if (node.nodeType === node.ELEMENT_NODE && node.tagName.indexOf('-') > -1) {
          var manifest = window.cubx.CRC.getCache().getComponentCacheEntry(node.tagName.toLowerCase());
          if (manifest && !node.getAttribute('member-id-ref')) {
            console.warn('The attribute "member-id-ref" is missing in template of the component "' + rootManifest.artifactId +
              '" on tag "' + manifest.artifactId + '".');
          }
        }
        node = walker.nextNode();
      }
    }
  };

  /**
   * Create html connection nodes for representing the connections defined in the manifest
   * @memberOf CIF
   * @param {HTMLElement} root Root node of subTree to process
   * @private
   */
  CIF.prototype._createConnectionElements = function (root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
    var node = walker.currentNode;

    while (node) {
      if (node.hasOwnProperty('_connections')) {
        for (var i = 0; i < node._connections.length; i++) {
          this._createConnectionElement(node, node._connections[ i ]);
        }
        node._createdConnections = node._connections;
        delete node._connections;
      }
      node = walker.nextNode();
    }
  };

  /**
   * Create a single connection by using the cubx-core-connection HTML Custom Element
   * @memberOf CIF
   * @param {HTMLElement} node
   * @param {object} connection
   * @private
   */
  CIF.prototype._createConnectionElement = function (root, connection) {
    var sourceEl;
    var node = root;
    if (connection.source.hasOwnProperty('memberIdRef')) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
      while (node) {
        // walk through all children of node but skip node itself
        if (_.indexOf(root.Context._components, node) > -1 && node.getAttribute('member-id') === connection.source.memberIdRef) {
          sourceEl = node;
          node = null;
        } else {
          node = walker.nextNode();
        }
      }
    } else {
      sourceEl = node;
    }
    // get cubx-core-connections tag or null
    var cubxConnectionsEl = _.find(sourceEl.children, function (element) {
      return element.tagName === 'cubx-core-connections'.toUpperCase();
    });

    //  create cubx-core-connection tag if there is no one yet for this node and insert it as first child
    if (!cubxConnectionsEl) {
      cubxConnectionsEl = new this._connectionsElement();
      cubxConnectionsEl.generatedByCif = true;
      if (sourceEl.childElementCount > 0) {
        sourceEl.insertBefore(cubxConnectionsEl, sourceEl.firstElementChild);
      } else {
        sourceEl.appendChild(cubxConnectionsEl);
      }
    }
    // create cubx-core-connection element and add it to cubx-core-connections element
    var cubxConnectionEl = new this._connectionElement();
    cubxConnectionEl.generatedByCif = true;
    cubxConnectionEl.setSource(connection.source.slot);
    if (connection.connectionId) {
      cubxConnectionEl.setConnectionId(connection.connectionId);
    }
    cubxConnectionEl.setDestination(connection.destination.slot, connection.destination.memberIdRef);
    if (sourceEl.isCompoundComponent && !connection.source.memberIdRef) {
      cubxConnectionEl.setType('internal'); // mark connection as internal for this compoundComponent
    }

    if (typeof connection.copyValue !== 'undefined' && typeof connection.copyValue === 'boolean') {
      cubxConnectionEl.setCopyValue(connection.copyValue);
    }

    if (typeof connection.repeatedValues !== 'undefined' && typeof connection.repeatedValues === 'boolean') {
      cubxConnectionEl.setRepeatedValues(connection.repeatedValues);
    }
    if (typeof connection.hookFunction !== 'undefined' && typeof connection.hookFunction === 'string') {
      cubxConnectionEl.setHookFunction(connection.hookFunction);
    }

    cubxConnectionsEl.appendChild(cubxConnectionEl);
  };
  /**
   * Create html init nodes for representing the connections defined in manifest
   * @memberOf CIF
   * @param {HTMLElement} root
   * @private
   */
  CIF.prototype._createInitElements = function (root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
    var node = walker.currentNode;

    while (node) {
      if (node.hasOwnProperty('_inits')) {
        for (var i = 0; i < node._inits.length; i++) {
          this._createSlotInitElement(node, node._inits[ i ], i);
        }
        node._createdInits = node._inits;
        delete node._inits;
      }
      node = walker.nextNode();
    }
  };

  /**
   * Create a single init tag by using the cubx-core-init HTML Custom Element
   * @memberOf CIF
   * @param {HTMLElement} node
   * @param {object} slotInit
   * @private
   */
  CIF.prototype._createSlotInitElement = function (root, slotInit, order) {
    var el;

    var node = root;
    if (slotInit.hasOwnProperty('memberIdRef')) {
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null, false);
      while (node) {
        if (_.indexOf(root.Context._components, node) > -1 && node.getAttribute('member-id') === slotInit.memberIdRef) {
          el = node;
          node = null;
        } else {
          node = walker.nextNode();
        }
      }
    } else {
      el = node;
    }
    if (!el) {
      console.error('the "_createSlotInitElement" method not found the member element: ', root, 'slotInit', slotInit);
    }
    // get cubx-core-init tag or null
    var cubxInitEl = _.find(el.children, function (element) {
      return element.tagName === 'cubx-core-init'.toUpperCase();
    });

    //  create cubx-core-init tag if there is no one yet for this node and insert it as first child
    if (!cubxInitEl) {
      cubxInitEl = new this._initSlot();
      cubxInitEl.generatedByCif = true;
      if (el.childElementCount > 0) {
        el.insertBefore(cubxInitEl, el.firstElementChild);
      } else {
        el.appendChild(cubxInitEl);
      }
    }
    // create cubx-core-slot-init element and add it to cubx-core-init element

    var cubxSlotInitEl = new this._slotInitElement();
    cubxInitEl.generatedByCif = true;
    cubxSlotInitEl.setSlot(slotInit.slot);

    // var value = slotInit.value.replace(/\\\\"/g, '\"');
    cubxSlotInitEl.innerHTML = JSON.stringify(slotInit.value);
    // cubxSlotInitEl.textContent = JSON.stringify(slotInit.value);

    cubxSlotInitEl.setOrder(order);
    cubxSlotInitEl.setDeepLevel(el._deeplevel);
    if (!slotInit.memberIdRef) {
      cubxSlotInitEl.setType('internal'); // mark connection as internal for this compoundComponent
    }

    cubxInitEl.appendChild(cubxSlotInitEl);
  };

  /**
   * Check whether the given manifest represents an elementary component or not
   * @param {object} manifest The manifest for the given component (processedManifest)
   * @memberOf CIF
   * @returns {boolean} True, if manifest represents an elementary component, otherwise false.
   * @private
   */
  CIF.prototype._isElementaryComponentInManifest = function (manifest) {
    return this._isComponentFromType(manifest, 'elementaryComponent');
  };

  /**
   * Check whether the given manifest represents an compound component or not
   * @param {object} manifest The manifest for the given component (processedManifest)
   * @memberOf CIF
   * @returns {boolean} True, if manifest represents an compound component, otherwise false.
   * @private
   */
  CIF.prototype._isCompoundComponentInManifest = function (manifest) {
    return this._isComponentFromType(manifest, 'compoundComponent');
  };

  /**
   * Check if the given manifets contains a component from given type
   * @param {object} manifest The manifest for the given component (processedManifest)
   * @param {string} type type for check
   * @return {boolean} true if the component is from type, otherwise false.
   * @private
   */
  CIF.prototype._isComponentFromType = function (manifest, type) {
    if (manifest && manifest.hasOwnProperty('artifactType') && manifest.artifactType === type) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Check whether the given component is an elementary one or not
   * @param {HTMLElement} component
   * @memberOf CIF
   * @return {boolean} True, if given component is an elementary one. False otherwise
   * @private
   */
  CIF.prototype._isElementaryComponent = function (component) {
    var manifest = window.cubx.CRC.getCache().getComponentCacheEntry(this._getTagname(component));
    return this._isElementaryComponentInManifest(manifest);
  };

  /**
   * Check whether the given component is an elementary one or not
   * @param {HTMLElement} component
   * @memberOf CIF
   * @return {boolean} True, if given component is an elementary one. False otherwise
   * @private
   */
  CIF.prototype._isCompoundComponent = function (component) {
    var manifest = window.cubx.CRC.getResolvedComponent(this._getTagname(component));
    return this._isCompoundComponentInManifest(manifest);
  };

  /**
   * Set the Context
   * @memberOf CIF
   * @param {HTMLElement} node A crc root-node
   * @private
   */
  CIF.prototype._ready = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    var cifReadyEvent = null;

    if (node.Context) {
      node.Context.setReady();
      if (!this._cifReady) {
        this._cifReady = true;
        if (window.cubx.CRC.getRuntimeMode() === 'dev') {
          console.log('cif is ready');
        }
      }
      if (this._isInitialProcessing()) {
        cifReadyEvent = this.getEventFactory().createEvent(window.cubx.EventFactory.types.CIF_READY);
      }
      if (this._isObserverTriggeredProcessing()) {
        cifReadyEvent = this.getEventFactory().createEvent(window.cubx.EventFactory.types.CIF_DOM_UPDATE_READY);
      }
      if (cifReadyEvent) {
        node.dispatchEvent(cifReadyEvent);
      }
    }
  };

  /**
   * Check, if modelVersion in this crcLoader allowed.
   * Before the check,  the modelVersion will be completed with minor (=0) and patch number (=0), if necessary.
   * @param {string} modelVersion
   * @return {boolean} true if modelVersion allowed
   * @memberOf CIF
   * @private
   */
  CIF.prototype._isModelVersionSupported = function (modelVersion) {
    var correctedModelVersion = window.cubx.CRC.getNormedModelVersion(modelVersion);

    for (var i = 0; i < this._supportedModelVersionList.length; i++) {
      if (this._supportedModelVersionList[ i ] === correctedModelVersion) {
        return true;
      }
    }
    return false;
  };

  /**
   * Check, if modelVersion for all componente is supported in tis CIF.
   * @private
   * @return true if all Component have a supported version, false if not
   * @memberOf CIF
   */
  CIF.prototype._checkModelVersionForAllComponents = function () {
    var allOk = true;
    var cache = window.cubx.CRC.getCache();
    var components = cache.getAllComponents();
    var warnings = [];
    for (var comp in components) {
      if (components.hasOwnProperty(comp)) {
        var component = components[ comp ];
        var id = component.webpackageId + '/' + component.artifactId;
        if (warnings.indexOf(id) === -1 && !this._isModelVersionSupported(component.modelVersion)) {
          warnings.push(id);
          allOk = false;
          console.warn('Webpackage with id ' + id + ' has modelVersion ' +
            component.modelVersion +
            '. This CIF supports the following modelVersion(s): ' + this._supportedModelVersionList);
        }
      }
    }
    return allOk;
  };

  /**
   * Set processMode for initial processing (1)
   * @private
   */
  CIF.prototype._processInitial = function () {
    this._processMode = 1;
  };
  /**
   * Set processMode for observer triggered processing (2)
   * @private
   */
  CIF.prototype._processObserverTriggered = function () {
    this._processMode = 2;
  };

  /**
   * REset the _processMode property to 0 (not processing)
   * @private
   */
  CIF.prototype._resetProcessMode = function () {
    this._processMode = 0;
  };

  /**
   * True during initial prcessing
   * @returns {boolean}
   * @private
   */
  CIF.prototype._isInitialProcessing = function () {
    return this._processMode === 1;
  };

  /**
   * true during observer triggred processing
   * @returns {boolean}
   * @private
   */
  CIF.prototype._isObserverTriggeredProcessing = function () {
    return this._processMode === 2;
  };

  // instantiate the CIF
  if (!window.cubx.__cifError__) {
    window.cubx.cif.cif = new CIF();
  }
})();
