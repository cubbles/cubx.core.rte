# Webpackage cubx.core.rte
(Cubbles core Runtime Enviroment)

## CRC
(Client Runtime Container)

This utility provides the Runtime of a WebApp.

### Module
#### CRC
The Client Runtime Container is needed to provide the runtime of an App (represented by a Webpackage).

#### DependencyManager
The Dependency Manager resolves the required dependencies and includes them into the document. The requester is attached to the data-referrer attribute.

#### Cache
The Cache holds all referenced components. The key to access a component is its artifactId.
Furthermore, the cache stores the resolvedComponent object, once it is built. The key to access the resolvedComponent is the artifactId of the original component.

#### ComponentResolver
Add the referenced components recursively to the original compound component manifest. So that the whole hierarchy of the compound component is available.

#### StorageManager
Provide the data persistence . (TODO)

#### EventFactory
Manage EventTypes and provide utility methods (e.g. to create CustomEvents, etc.).

#### Utils

## CRCLoader
(Client-Runtime-Container-Loader)

This utility loads the CRC (Client Runtime Container).

### Parameter:
#### loadCIF (default == 'true')
Should the CIF be loaded?

**Posible values:**  'true' | 'false'

**Configuration through**

* The attribute of the CRCLoader Script-Tag: `data-crcinit-loadcif="false"'
* The global property:

        <script>
            window.cubx = {
                "CRCInit": {
                        loadCIF="false"
                    }
                }
        </script>

**Note:** the attribute overwrites the property.

#### runtimeMode (default == 'prod')
An application can be started in different runtime modes.

**Posible values:** 'dev' | 'prod'


**Configuration through**

* The URL parameter `runtimeMode=dev`

### Attributes:
#### data-cubx-startevent (default DOMContentEvent)
Event which is triggered to indicate that the the CRC has loaded.

#### allow-absolute-resource-urls
If is allow-absolute-resource-urls==true, allow usage of absolut resource urls. Default value is false.

... or set direct in CRCInit object...

    <script>
        window.cubx = {
            "CRCInit": {
                "allowAbsoluteResourceUrls": true
            }
        }
    </script>
    
### Root Dependencies
The configuration of the root dependencies can be defined through an initial global configuration object. This object is the only way to load dependencies that are not part of the Cubbles platform

*Example: artifacts from the own webpackage*  
If the dependency is defined in the same webpackage, the webpackageId must not be defined.
 
    <script>
        window.cubx = {
            "CRCInit": {
                "rootDependencies": [
                     {
                        "artifactId": "util1"
                     }
                ]
            }
        }
    </script>

*Example: artifacts from an other webpackage*  
For modelVersion >= 9.0 must be just the webpackageId and the artifactId defined. 
 
    <script>
        window.cubx = {
            "CRCInit": {
                "rootDependencies": [
                     {
                        "webpackageId": "com.incowia.demos.demo5@1.0.0"
                        "artifactId": "util1"
                     }
                ]
            }
        }
    </script>
    
*Example: artifacts from an other webpackage with modelVersion <=8.3.0*  
For modelVersion < 9.0 must be the webpackageId, artifactId and the endpointId defined. 

    <script>
        window.cubx = {
            "CRCInit": {
                "rootDependencies": [
                     {
                        "webpackageId": "com.incowia.demos.demo1@1.0.0"
                        "artifactId": "util1",
                        "endpoint": "main"
                     }
                ]
            }
        }
    </script>

The dependencies of a Cubbles component can be defined using the the attribute ``cubx-webpackage-id`` within its HTML tag. The ``artifactId`` is defined through the tagname of the element. (It is ``my-example-compound``in the below examples.)

*Example: artifacts from the own webpackage*  
If the dependency is defined in the same webpackage, the key word 'this' can be used instead of the webpackageId :

    <my-example-component cubx-webpackage-id="this"></my-example-component>

*Example: artifacts from an other webpackage*  
If the dependency is defined in an other webpackage, it must be in ``cubx-webpackage-id`` attribute the webpackageId (i.e. '[groupId.]webpackageName@version') defined.

    <my-example-component cubx-webpackge-id="examples@0.1-SNAPSHOT"></my-example-component >

*Example: artifacts from an other webpackage with modelVersion <= 8.3.0*  
If the dependency is defined in a webpacakge with an older modelVersion (modelVersion <= 8.3.0), it must be an additional attribute ´´cubx-endpint-id`` defined.
    
    <my-example-component cubx-webpackage-id="examples@0.1-SNAPSHOT/" cubx-endpoint-id="main"></my-example-component >
    
#### Inline manifest definition:

The dependency can be defined as an object with the attributes manifest and endpoint:

    <script>
        window.cubx = {
            "CRCInit": {"rootDependencies": [
               {
                   "endpoint": "this/util1/main",
                   "manifest": {
                       "name": "my-webpackage-name",
                       "groupId": "com.example",
                       "version": "0.1.0",
                       //.... Put your manifest here. Note: this needs to be a full valid webpackage.manifest regarding to document api
                      // for more details see: https://github.com/cubbles/cubx-webpackage-document-api/wiki
                   }
               }
            ]
        }
    </script>



## CIF
(Component Integration Framework)

* The Framework generates the HTML/Javascript code for the Cubbles components. At the same time all members, connections and initializations  defined in the manifest.webpackage are initialized. A subtree will be generated for compound components.
* The Cubbles components can be mixed with HTML tags.
* The Cubbles components can exist within deep levels of Dom hierarchy
* The Cubbles component (slots) can be connected by means of the Cubbles-HTML-API
* The Cubbles component (slots) can be initialized by means of the Cubbles-HTML-API

### Cubbles-HTML-API
#### Definition of connections between Cubbles components

The connections between components can be defined as follows:

    <cubx-core-connections>
      <cubx-core-connection source="message", destination="myMemeber2:textInput" connectionId="connection1"></cubx-core-connection>
      <cubx-core-connection source="switchOn", destination="myMemeber3:switch" connectionId="connection2"></cubx-core-connection>
    </cubx-core-connections>

  * All connections are defined only within the content of the source elements. The `<cubx-core-connections>` tag should be child of the Cubbles component. Additionally, each `<cubx-core-slot-init>` tag is direct child of the  `<cubx-core-connections>` tag.
  * Each `<cubx-core-slot-init>` tag should be defined by means of the `source`, `destination`, and `connection-id` attributes.
   * `connection-id`: id for the connection that is unique within a context.
   * `source`: name of the source slot
   * `destination`: id of the target component and name of the target slot divided by ":".
  * The connections are applied or resolved during runtime in the same order in which they were defined.

Example:

    <my-first-cubbles id="first">
      <cubx-core-connections>
            <cubx-core-connection source="message", destination="second:textInput" connectionId="connection1"></cubx-core-connection>
      </cubx-core-connections>
    </my-first-cubbles>
    ...
    <my-second-cubbles id="second"></my-second-cubbles>

#### Definition of the slots initialization

The slots initialization can be defined as follows:

    <cubx-core-init>
      <cubx-core-slot-init slot="message">"HalloWorld!"</cubx-core-slot-init>
      <cubx-core-slot-init slot="count">5</cubx-core-slot-init>
      <cubx-core-slot-init slot="on">true</cubx-core-slot-init>
      <cubx-core-slot-init slot="config">{ "label": "Name", "value" : "Max Musternamm"}</cubx-core-slot-init>
    </cubx-core-init>

* The initialization of the slots should be defined by means of the `<cubx-core-init>`. The `<cubx-core-init>` is a child of the Cubble component.
* Each slot is defined using the `<cubx-core-slot-init>` tag as child of `<cubx-core-init>`.
 * The `slot` attribute indicates the name of the slot that will be initilized.
 * The text content of the `<cubx-core-slot-init>` indicates the initial value of the slot as JSON.
* The initialization of each slot is carried out in the same order in which they were defined.

Example:

        <my-first-cubbles id="first">
         <cubx-core-init>
              <cubx-core-slot-init slot="message">"HalloWorld!"</cubx-core-slot-init>
         </cubx-core-init>
         <cubx-core-connections>
               <cubx-core-connection source="message", destination="second:textInput" connectionId="connection1"></cubx-core-connection>
         </cubx-core-connections>
        </my-first-cubbles>
        ...
        <my-second-cubbles id="second">
         <cubx-core-init>
                      <cubx-core-slot-init slot="config">{
                        "data": {
                          "title": "Greeting"
                        }</cubx-core-slot-init>
                 </cubx-core-init>
         </my-second-cubbles>

## HTML representation of components
The whole DOM tree is generated based on the component description (manifest.component). At the same time, the HTML tags that represent connections, the elementary components and the compound components are generated.

The attributes of components are:

* `cubx-dependency`: dependency that contains the code needed by the component (`<webpackageId>/<artifactId>/<endpoint>`).
* `cubx-component-id`: id of the component (`<webpackageId>/<artifactId>`)
* `runtime-id`: unique id within the application - it consists of its parent component runtime-id (in case it exists) and its own cubx-component-id, as well as its member-id
* `member-id`: (optional) id attribute of the member component (source:  manifest.webpackage -> membera[x].memberId) (It is used as identifier of sibling components)

Example:

    Root-Tag (compound):
    <cif-test-compound-outer cubx-component-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT" runtime-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT">

    member (compound):
    <cif-test-compound cubx-component-id="com.incowia.jtrs.cif-test-compound-0.1.0-SNAPSHOT" runtime-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT:com.incowia.jtrs.cif-test-compound-0.1.0-SNAPSHOT.member2" member-id="member2"/>

    member (elementary):
    <cif-test-a cubx-component-id="com.incowia.jtrs.cif-test-a-0.1.0-SNAPSHOT" runtime-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT:com.incowia.jtrs.cif-test-compound-0.1.0-SNAPSHOT.2:com.incowia.jtrs.cif-test-a-0.1.0-SNAPSHOT.member1" member-id="member1">

### Components
The manifest.webpackage holds the generated components with their attributes, e.g. `runtime-id`.

### Compound components - Context
Each compound component has its own Context object. Within this context the propagation from slots is performed.

#### Compound component HTML templates
The integration of member components in a compound component can be defined by means of a HTML template. The following is an example of a template for `my-compound` component (my-compound-template.html):

    <template id="my-compound">
         <div>
             <h1>My awsome compound…</h1>
             <div class=”row”>
                <div class=”col-xs-6”>
                    <my-comp1 member-id-ref=”m1”/>
                </div>
                <div class=”col-xs-6”>
                    <my-comp2 member-id-ref=”m2” />
                </div>
              </div>
          <div>
    </template>

It is important that the id attribute of the template references the artifactId of the component. The member components are added as tags whose `member-id-ref` attribute references its `memberId` in the manifest.webpackage.

For the HTML template to be available, it should be added as resource in the endpoint of the component.

If no template is provided, the member components are added in the same order in which they are defined in the manifest.webpackage.

### Connections
The connection information is described in the HTML custom tags "cubx-connections" and "cubx-connection".

After the generation of the HTML tags, the Dom tree is parsed. The connection list is hold by the connection tag, this list manages the slots propagation.

    <cubx-connections style="display: none;">
        <cubx-connection source="slota" destination="2:slotaa"></cubx-connection>
        <cubx-connection source="slotb" destination="2:slotbb" copy-value="false"></cubx-connection>
        <cubx-connection source="slotb" destination="2:slotbb" copy-value="false"></cubx-connection>
         <cubx-connection source="slotb" destination="parent:slotxx" copy-value="false"></cubx-connection>
    </cubx-connections>


### Events

* `cifStart` - indicates when the CIF starts to complete its tasks.
* `cifReady`  - indicates that the CIF initial process (elements generation, connections registration and slots initialization) is completed.
* `cifInitStart` - triggered when the slots initialization starts
* `cifInitReady` - triggered when the slots initialization finishes
* `cifComponentReady`-  triggered by each component and listened by the CIF. When the `cifComponentReady` of all components generated by the CIF are triggered, the `cifAllComponentsReady` event is triggered.
* `cifAllComponentsReady` - indicates that all the components generated by the CIF are ready. After this event is triggered, the connections and inits definitions are applied.


## CubxPolymer
(Cubbles Wrapper for Polymer 1.x Elements)

The CubxPolymer represents a wrapper for the Polymer object. The object is added to the _CubblesComponent-API_ by the wrapper.

It represents the addition of:

1.  a so called _model_,
2. the methods for the external interaction with the model (espacially used by the CIF) and
3. the methods for the internal interaction with the model (inside the component)

## Webcomponents
(3th-party webcomponents library)

The webcomponent.js polyfills enable Web Components in (evergreen) browsers that lack native support.


## How to do it...

### Use of  _hookFunction_
From modelVersion 8.2 it is possible to define a `hookFunction` in each connection. This function will be executed:
* when the connection data is propagated and
* before the propagated data is transferred to the target component and slot

#### Configuration
The attribute `hookFunction` can contain an anonyme function (as string) or the function name of an existing global function (incl. namespace).

The following is an example of a connection with a anonyme `hookFunction`:

    {
        "connectionId": "member-a:c-member-b:c",
        "source": {
          "memberIdRef": "member-a",
          "slot": "c"
        },
        "destination": {
          "memberIdRef": "member-b",
          "slot": "c"
        },
        "hookFunction": "function(value, next) { var newValue = {}; newValue.name = value.firstname ? value.firstname + ' ' : ''; newValue.name += value.name; next(newValue);};"
      }

And the following is an example of a connection with a global `hookFunction`, indicating using its name and namespace:

    {
        "connectionId": "member-a:a-member-b:a",
        "source": {
          "memberIdRef": "member-a",
          "slot": "a"
        },
        "destination": {
          "memberIdRef": "member-b",
          "slot": "a"
        },
        "hookFunction": "cubx.hookFunctions.multiply10"
      }

The global function in the example above (cubx.hookFunctions.multiply10) can be defined for example by means of an Artifact of type Utility. In this example the function is defined in the `window.cubx.hookFunctions`  namespace, as follows:

    window.cubx.hookFunctions.multiply10 = function(value, next) {
        value = Number(value) * 10;
        next(value);
    };

The following two parameters are passed to the _hookFunction_ (_cubx.hookFunctions.multiply10_ in the example):

* `value`: represents the propagate data
* `next`: a function that will further process the of data propagation. It should be called after the modification of the value. This function received the modified value as parameter.

If the `hookFunction`  is employed to validate the propagated date, it can abort the propagation by **not** calling the `next` function.

[![Build Status](https://travis-ci.org/cubbles/cubx.core.rte.svg?branch=master)](https://travis-ci.org/cubbles/cubx.core.rte)
