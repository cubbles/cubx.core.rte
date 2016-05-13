/* globals _,CustomEvent,HTMLElement,NodeFilter,Promise */
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
    this._rootContextList = [];

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
     * Holds a constructor to create a custom cubx-core-slot element
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
     * Static values for possible runtime modes
     * @type {object}
     * @private
     */
    this._runtimeModes = {
      composite: 'composite', //  more then one tags (nested or not) or components used in crc root tag
      standalone: 'standalone', //  only one single tag in crc root with tag name being the component name
      none: 'none' //  no tags in crc root
    };
    /**
     * Listed all allowed modelVersion.
     * @type {string[]}
     * @private
     */
    this._supportedModelVersionList = [ '8.0', '8.1', '8.2', '8.3' ];

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
    this._cifAllComponentsReady = {};

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
    if (this._compoundComponentElements.hasOwnProperty(name)) {
      return this._compoundComponentElements[ name ];
    } else {
      var constructor = this._registerCompoundComponentElement(name);
      this._compoundComponentElements[ name ] = constructor;
      return constructor;
    }
  };

  /**
   *
   * @memberOf CIF
   * @param {HTMLElement} node A crc root node
   * @return {boolean} true if cif for that crc root is ready. False otherwise
   */
  CIF.prototype.isReady = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    var context = _.find(this._rootContextList, function (item) {
      return item.getRootElement() === node;
    }, this);

    return context ? context.isReady() : false;
  };

  /**
   *
   * @memberOf CIF
   * @param {HTMLElement} node A crc root node
   * @return {boolean} true if all created elementaries  for that crc root are ready. False otherwise
   */
  CIF.prototype.isAllComponentsReady = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    return this._cifAllComponentsReady[ node ];
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
    var self = this;
    //  Check if all components in the manifestCache has supported modelVersion
    this._checkModelVersionForAllComponents();
    //  get the crc root node node and create new context for it

    var node = this.getCRCRootNode();
    this._cifAllComponentsReady[ node ] = false;

    if (!window.cubx.CRC.isReady()) {
      node.addEventListener('crcReady', function () {
        self._initForCRCRoot(node);
      });
    } else {
      self._initForCRCRoot(node);
    }
  };

  /**
   * Initialize the context of a crc container depend on runtime mode.
   * @param {HTMLElement} node root node
   * @private
   */
  CIF.prototype._initForCRCRoot = function (node) {
    var runtimeMode = this._determineRuntimeMode(node);
    var me = this;
    node.addEventListener(window.cubx.EventFactory.types.CIF_ALL_COMPONENTS_READY, function () {
      me._afterCreatedElementsReady(node);
    });

    //  dispatch and listen to EventFactory.types.COMPONENT_READY also on CompoundComponents
    node.addEventListener(window.cubx.EventFactory.types.COMPONENT_READY, function (evt) {
      if (!me.isReady(node)) {
        var runtimeId = evt.target.getAttribute('runtime-id');
        if (me._componentReady[ runtimeId ]) {
          me._componentReady[ runtimeId ].ready = true;
        }
        if (!me._hasElementsWaitingForReady()) {
          me._fireAllComponentsReady(node);
        }
      }
    });

    switch (runtimeMode) {
      case this._runtimeModes.composite :
        this._initComposite(node);
        break;
      case this._runtimeModes.standalone :
        this._initStandalone(node);
        break;
      case this._runtimeModes.none :
        this._ready(node);
        return;
    }
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
    //  dispatch ready event
    this._ready(node);
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
   * Fire the cifAllComponentsReady Event.
   * @param {HTMLElement} node
   * @private
   */
  CIF.prototype._fireAllComponentsReady = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    if (window.cubx.CRC.getRuntimeMode() === 'dev') {
      console.log('------------------------allComponentsReady-------------');
    }
    this._cifAllComponentsReady[ node ] = true;
    var evt = this._eventFactory.createEvent(window.cubx.EventFactory.types.CIF_ALL_COMPONENTS_READY);
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
   * Initialize composite mode
   * @memberOf CIF
   * @param {HTMLElement} node A crc root node
   * @private
   */
  CIF.prototype._initComposite = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    //  TODO composite fall interpretieren
    //  1.durch alle Kinder recursive iterieren - treeWalker
    //  jede Knoten prüfen, ob cubixx Element und die gefunden cubixx-Elemente  merken
    //  für jedes cubixx element _initStandalona aufrufen (Achtung _initStandalone vorher anpassen!)
    console.warn('composite mode not implemented yet.');
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
   * @memberOf CIF
   * @param {HTMLElement} node A crc root node
   * @private
   */
  CIF.prototype._initStandalone = function (node) {
    if (!node) {
      node = this.getCRCRootNode();
    }
    var tree;
    //  TODO   manuel in rootContext (crcRoot) erstellen
    var rootContext = this.createRootContext(node);
    this._rootContextList.push(rootContext);
    //  TODO   manuel an crcRoot setzen
    node.Context = rootContext;

    var firstElement = node.firstElementChild;
    var componentName = this._getTagname(firstElement);
    var resolvedComponentManifest = window.cubx.CRC.getResolvedComponent(componentName);
    var runtimeId = resolvedComponentManifest.webpackageId + '/' + resolvedComponentManifest.artifactId;

    if (this._isElementaryComponent(firstElement)) {
      //  Dieses Attribute markiert Tags, die nicht durch CIF geschrieben werden
      tree = firstElement;
      tree.setAttribute('runtime-id', runtimeId);
      if (!tree.isComponentReady) {
        this._componentReady[ runtimeId ] = {
          ready: false
        };
      }
      rootContext.addComponent(tree); // add created component to contexts component list
      // set parent context if tree is a compound component (so it has a context)
      if (tree.hasOwnProperty('Context')) {
        tree.Context.setParent(rootContext);
      }
    } else {
      tree = this._createDOMTreeFromManifest(resolvedComponentManifest, firstElement);
      //  add the comonent to rootcontext BEVOR trigger CIF_COMPONENT_DOMTREE_READY event
      rootContext.addComponent(tree); // add created component to contexts component list
      // set parent context if tree is a compound component (so it has a context)
      if (tree.hasOwnProperty('Context')) {
        tree.Context.setParent(rootContext);
      }
    }
  };

  /**
   * Init all connections based on the cubx-core-connections tags
   * @memberOf CIF
   * @private
   */
  CIF.prototype._initConnections = function () {
    _.forEach(this._rootContextList, function (context) {
      context.initConnections();
    });
  };

  /**
   * Init slots based on the cubx-core-init tags before init fired cifInitStart event, after init
   * fired cifInitReady Event
   * @param {HTMLElement} node
   * @memberOf CIF
   * @private
   */
  CIF.prototype._initSlots = function (node) {
    var cifInitStartEvent = this._eventFactory.createEvent(window.cubx.EventFactory.types.CIF_INIT_START);
    node.dispatchEvent(cifInitStartEvent);
    var me = this;
    _.forEach(this._rootContextList, function (context) {
      context.collectSlotInits(me);
    });
    this._initializer.sortInitList();
    console.log('cif._initializer._initList (', this._initializer._initList.length, ')',
      this._initializer._initList);
    this._initializer.initSlots();
    var cifInitReadyEvent = this._eventFactory.createEvent(window.cubx.EventFactory.types.CIF_INIT_READY);
    node.dispatchEvent(cifInitReadyEvent);
  };

  /**
   * Determine runtime mode for given crc root node
   * @memberOf CIF
   * @param {object} crcRoot The crcRoot node
   * @return {string}
   * @private
   */
  CIF.prototype._determineRuntimeMode = function (crcRoot) {
    if (!crcRoot) {
      crcRoot = this.getCRCRootNode();
    }
    var mode = '';
    //  TODO element in der manifestCache vorhanden ? || composit -> auch dann wenn andere html standardtags vorhanden sind.
    if (crcRoot && crcRoot.childElementCount === 1 && crcRoot.firstElementChild.tagName.indexOf('-')) {
      mode = this._runtimeModes.standalone;
    } else if (crcRoot && crcRoot.childElementCount > 1) {
      mode = this._runtimeModes.composite;
    } else {
      mode = this._runtimeModes.none;
    }

    return mode;
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

    var CompoundComponentPrototype = Object.create(HTMLElement.prototype);
    // extend prototype with specific CompoundComponent properties
    _.merge(CompoundComponentPrototype, window.cubx.cif.compoundComponent);

    var constructor = document.registerElement(name, { prototype: CompoundComponentPrototype });
    return constructor;
  };

  /**
   * Register new elements for handling connections
   * @memberOf CIF
   * @private
   */
  CIF.prototype._registerConnectionElements = function () {
    var ConnectionPrototype = Object.create(HTMLElement.prototype);
    ConnectionPrototype.setSource = function (slot) {
      this.setAttribute('source', slot);
    };
    ConnectionPrototype.getSource = function () {
      return this.getAttribute('source');
    };
    ConnectionPrototype.setDestination = function (slot, memberIndex) {
      var destination = memberIndex != null ? memberIndex + ':' + slot : 'parent:' + slot;
      this.setAttribute('destination', destination);
    };
    ConnectionPrototype.getDestination = function () {
      return this.getAttribute('destination');
    };
    ConnectionPrototype.setType = function (type) {
      this.setAttribute('type', type);
    };
    ConnectionPrototype.getType = function () {
      return this.getAttribute('type');
    };
    ConnectionPrototype.setConnectionId = function (connectionId) {
      this.setAttribute('connection-id', connectionId);
    };
    ConnectionPrototype.getConnectionId = function () {
      return this.getAttribute('connection-id');
    };
    ConnectionPrototype.setCopyValue = function (copyValue) {
      this.setAttribute('copy-value', copyValue);
    };
    ConnectionPrototype.getCopyValue = function () {
      return this.getAttribute('copy-value');
    };
    ConnectionPrototype.setRepeatedValues = function (repeatedValues) {
      this.setAttribute('repeated-values', repeatedValues);
    };
    ConnectionPrototype.getRepeatedValues = function () {
      return this.getAttribute('repeated-values');
    };
    ConnectionPrototype.setHookFunction = function (hook) {
      this.setAttribute('hook-function', hook);
    };
    ConnectionPrototype.getHookFunction = function () {
      return this.getAttribute('hook-function');
    };
    this._connectionElement = document.registerElement('cubx-core-connection', { prototype: ConnectionPrototype });

    var ConnectionsPrototype = Object.create(HTMLElement.prototype);
    ConnectionsPrototype.createdCallback = function () {
      this.style.display = 'none';
    };
    this._connectionsElement = document.registerElement('cubx-core-connections', { prototype: ConnectionsPrototype });
  };
  /**
   * Register new elements for handling initialization
   * @memberOf CIF
   * @private
   */
  CIF.prototype._registerInitializationElements = function () {
    var InitPrototype = Object.create(HTMLElement.prototype);
    InitPrototype.createdCallback = function () {
      this.style.display = 'none';
    };
    this._initSlot = document.registerElement('cubx-core-init', { prototype: InitPrototype });

    var InitSlotPrototype = Object.create(HTMLElement.prototype);
    InitSlotPrototype.setSlot = function (slot) {
      this.setAttribute('slot', slot);
    };
    InitSlotPrototype.getSlot = function (slot) {
      return this.getAttribute('slot');
    };
    InitSlotPrototype.setMember = function (member) {
      this.setAttribute('member', member);
    };
    InitSlotPrototype.getMember = function (member) {
      return this.getAttribute('member');
    };
    InitSlotPrototype.setOrder = function (order) {
      this.setAttribute('order', order);
    };
    InitSlotPrototype.getOrder = function (order) {
      return this.getAttribute('order');
    };
    InitSlotPrototype.getType = function () {
      return this.getAttribute('type');
    };
    InitSlotPrototype.setType = function (type) {
      this.setAttribute('type', type);
    };
    InitSlotPrototype.getDeepLevel = function () {
      return this.getAttribute('deeplevel');
    };
    InitSlotPrototype.setDeepLevel = function (deeplevel) {
      this.setAttribute('deeplevel', deeplevel);
    };

    this._slotInitElement = document.registerElement('cubx-core-slot', { prototype: InitSlotPrototype });
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
      throw new Error('The manifest referenz a different tag (' + manifest.artifactId +
        ') as in cubx-core-crc container found tag (' + root.tagName.toLowerCase() + ').');
    }
    var runtimeId = manifest.webpackageId + '/' + manifest.artifactId;
    this._componentReady[ runtimeId ] = {
      ready: false,
      notReadyMembers: true

    };
    if (this._isCompoundComponentInManifest(manifest)) {
      this.getCompoundComponentElementConstructor(root.tagName.toLocaleLowerCase());
      _.merge(root.prototype, window.cubx.cif.compoundComponent);
      root.createdCallback();
      root.attachedCallback();
    }

    root.setAttribute('cubx-component-id', manifest.webpackageId + '/' + manifest.artifactId);
    root.setAttribute('runtime-id', runtimeId);

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
    var compId = root.getAttribute('cubx-component-id');
    var artifactId = compId.substring(compId.lastIndexOf('/') + 1);
    var promise = this._findTemplate(artifactId);
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

        me._componentReady[ root.getAttribute('runtime-id') ].notReadyMembers = false;
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
      component.setAttribute('cubx-component-id', componentId);
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

      if (currentMember.hasOwnProperty('memberId')) {
        component.setAttribute('member-id', currentMember.memberId);
      }
      component._deeplevel = deeplevel;

      if (root.hasOwnProperty('Context')) {
        // add created compound component to parent contexts component array
        root.Context.addComponent(component); // add created component to parent contexts component array
      }
      component.setAttribute('cubx-component-id', currentMember.componentId);
      // create runtimeId
      runtimeId = rootRuntimeId + ':' + currentMember.componentId + '.' + currentMember.memberId;
      component.setAttribute('runtime-id', runtimeId);
      //  add  Element to list of waiting for Ready Elements --> Ready-Event necessary
      this._componentReady[ runtimeId ] = {
        ready: false
      };
      if (currentMember.hasOwnProperty('members')) {
        this._componentReady[ runtimeId ].notReadyMembers = true;
        this._attachMembers(component, currentMember, deeplevel + 1);
      }
      root.appendChild(component);
    }
  };

  /**
   * Search for a template with the id, and get the first template with the id. If not found returns undefined.
   * @param {string} id - wanted id attribute
   * @returns {HTMLTemplateElement|undefined}
   * @memberOf CIF
   * @private
   */
  CIF.prototype._findTemplate = function (id) {
    var promises = [];
    var importDocList = document.querySelectorAll('link[rel=import]');
    var me = this;
    var importDoc;
    for (var i = 0; i < importDocList.length; i++) {
      importDoc = importDocList[ i ];

      promises.push(new Promise(function (resolve, reject) {
        if (importDoc.import) {
          me._resolveTemplateContent(importDoc, id, resolve, reject);
        } else {
          importDoc.addEventListener('load', function (event) {
            me._resolveTemplateContent(event.target, id, resolve, reject);
          });
        }
      }));
    }
    return Promise.all(promises);
  };

  /**
   * Import the template document and call resolve for the template id attribute equals with the parameter id, otherwise resolve with false.
   * @memberOf CIF
   * @param {HTMLLinkElement} importDoc - Link import Tag
   * @param {string} id -
   * @param resolve
   * @param reject
   * @private
   */
  CIF.prototype._resolveTemplateContent = function (importDoc, id, resolve, reject) {
    var content;
    var template;
    if (importDoc) {
      content = importDoc.import;
    }
    if (content) {
      template = content.querySelector('#' + id);
    }
    if (template) {
      resolve(template);
    } else {
      resolve(false);
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
   * Return the node or (if Polymer exists) the Polymer wrapper of the node
   * @param {HTMLElement} node
   * @return {*}
   * @private
   */
  CIF.prototype._getNode = function (node) {
    return window.Polymer && typeof node.root === 'object' && this._isElementaryComponent(node) ? window.Polymer.dom(node.root) : node;
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
      if (sourceEl.childElementCount > 0) {
        this._getNode(sourceEl).insertBefore(cubxConnectionsEl, this._getNode(sourceEl).firstElementChild);
      } else {
        this._getNode(sourceEl).appendChild(cubxConnectionsEl);
      }
    }
    // create cubx-core-connection element and add it to cubx-core-connections element
    var cubxConnectionEl = new this._connectionElement();
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

    this._getNode(cubxConnectionsEl).appendChild(cubxConnectionEl);
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
      console.error('_createSlotInitElement element not found root: ', root, 'slotInit', slotInit);
    }
    // get cubx-core-init tag or null
    var cubxSlotInitEl = _.find(el.children, function (element) {
      return element.tagName === 'cubx-core-init'.toUpperCase();
    });

    //  create cubx-core-init tag if there is no one yet for this node and insert it as first child
    if (!cubxSlotInitEl) {
      cubxSlotInitEl = new this._initSlot();
      if (el.childElementCount > 0) {
        this._getNode(el).insertBefore(cubxSlotInitEl, this._getNode(el).firstElementChild);
      } else {
        this._getNode(el).appendChild(cubxSlotInitEl);
      }
    }
    // create cubx-core-slot element and add it to cubx-core-init element

    var cubxInitSlotEl = new this._slotInitElement();
    cubxInitSlotEl.setSlot(slotInit.slot);

    cubxInitSlotEl.innerHTML = JSON.stringify(slotInit.value);

    cubxInitSlotEl.setOrder(order);
    cubxInitSlotEl.setDeepLevel(el._deeplevel);
    if (!slotInit.memberIdRef) {
      cubxInitSlotEl.setType('internal'); // mark connection as internal for this compoundComponent
    }

    cubxSlotInitEl.appendChild(cubxInitSlotEl);
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
      cifReadyEvent = this._eventFactory.createEvent(window.cubx.EventFactory.types.CIF_READY);
      node.dispatchEvent(cifReadyEvent);
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

  // instantiate the CIF
  if (!window.cubx.__cifError__) {
    window.cubx.cif.cif = new CIF();
  }
})();
