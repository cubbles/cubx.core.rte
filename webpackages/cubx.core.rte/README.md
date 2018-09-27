# Webpackage cubx.core.rte [![Build Status](https://travis-ci.org/cubbles/cubx.core.rte.svg?branch=master)](https://travis-ci.org/cubbles/cubx.core.rte)
This webpackage contains certain artifacts representing the [Cubbles Runtime Environment (RTE)](https://cubbles.atlassian.net/wiki/display/RTE/Intro):
* [crc-loader](#crc-loader)
  * [configuration options](#configuration-options)
* [crc (client runtime container)](#crc)
* [cif (component interaction framework)](#cif)
  * [Cubbles TAG API](#the-cubbles-tag-api)
* [cubx-component-mixin](#cubx-component-mixin)
* [cubxcomponent](#cubxcomponent)
* [dom-tree-utils](#dom-tree-utils)
* [dynamic-connection-utils](#dynamic-connection-utils)
* [es6-promise](#es6-promise)
* [guid-utility](#guid-utility)
* [iframe](#iframe)
* [iframe-resizer](#iframe-resizer)
* [webcomponents](#webcomponents)
* [webcomponents-lite](#webcomponents-lite)


## CRC-Loader
The CRC-Loader is responsible for getting the **C**lient **R**untime **C**ontainer (CRC). To integrate the Cubbles runtime into your web app you need to include the CRC-Loader via script tag:

    <head>
    ...
    
    <!--  
        Replace "https://cubbles.world/core" with the url of the Cubbles Base Store you would like to use.   
        Include webcomopnents polyfill. This is needed to enable HTML5 Features in IE11 and Firefox.  
    --> 
    <script src="https://cubbles.world/core/webcomponents-lite/webcomponents-lite.min.js"></script>
    
    <script src="https://cubbles.world/core/cubx.core.rte@2.1.0/crc-loader/js/main.js"></script>
    ...
    </head>
    
### Configuration options
There are several options for configuring the CRC-Loader respectively the loaded CRC:

#### loadCIF (default = true)
If true the CIF is loaded. Set this to false to prevent CRC from loading the CIF. This can be set using attribute `data-crcinit-loadcif="true|false"` on the `<script>` tag of the CRC-Loader.
Alternatively you can use global `window.cubx.CRCInit` object:

    <script>
        window.cubx = {
            CRCInit: {
                loadCIF: true|false
            }
        }
    </script>

#### runtimeMode (default = "prod")
Declare the runtimeMode that is used. Each artifact can have an arbitrary number of resources defined (JS, HTML Imports, CSS). Each of those resource can have properties `dev` and `prod` holding the filename
used for the corresponding runtime mode. If runtime mode is set to `prod` the file given from property `prod` is used. If runtime mode is set to `dev` the file given for property `dev`is used instead.

Set runtime mode using URL-Search parameter `?runtimeMode=dev|prod` or global `windwo.cubx.CRCInit` object: 

    <script>
        window.cubx = {
            CRCInit: {
                runtimeMode: "dev|prod"
            }
        }
    </script>

#### allowAbsoluteResourceUrls (default = false)
If set to true it is possible to use absolute urls for resources. Set it using `allow-absolute-resource-urls="true|false"` on the `<script>` tag of the CRC-Loader.
Alternatively you can use global `window.cubx.CRCInit` object:

    <script>
        window.cubx = {
            CRCInit: {
                allowAbsoluteResourceUrls: true|false
            }
        }
    </script>

#### data-cubx-startevent (default = "DOMContentLoaded")
Set a custom event name to trigger RTE bootstrap process using `data-cubx-startevent="[eventName]"` on the `<script>` tag of the CRC-Loader. The listener for this event will be attached to `document`.

#### rootDependencies
Set dependencies which should be resolved by CRC during bootstrap. Use global `window.cubx.CRCInit.rootDependencies` array to set.

    <script>
        window.cubx = {
            CRCInit: {
                rootDependencies: [
                    {
                        artifactId: 'first-demo-component'
                        webpackageId: 'demo-package@1.0',
                        
                        // optional properties
                        endpointId: 'main-endpoint', // needed when referenced webpackage uses modelVersion < 9
                        manifest: {
                            //.... Put your manifest here. Note: this needs to be a full valid webpackage.manifest regarding to document api
                           // for more details see: https://github.com/cubbles/cubx-webpackage-document-api/wiki
                        }
                    }
                ]
            }
        }
    </script>
  
This will add artifact `first-demo-component` from webpackage `demo-package@1.0`.
  
#### rootDependencyExcludes
Set dependencies which should be excluded during dependency resolution process. Use global `window.cubx.CRCInit.rootDepenencyExcludes` array to set.
    
    <script>
            window.cubx = {
                CRCInit: {
                    rootDependencyExcludes: [
                        {
                            artifactId: 'first-demo-component'
                            webpackageId: 'demo-package@1.0',
                            
                            // optional properties
                            endpointId: 'main-endpoint', // needed when referenced webpackage uses modelVersion < 9
                        }
                    ]
                }
            }
        </script>

This will exclude artifact `first-demo-component` from webpackage `demo-package@1.0`.

## CRC
The **C**lient **R**untime **C**ontainer provides the basic runtime for Cubbles components including:
 * identify Cubbles components used in the web app
 * resolving the resources needed for instantiating the used components
 * make your browser download the needed resources (JS, CSS, HTML Imports etc.)

## CIF
The **C**omponent **I**nteraction **F**ramework takes care of rendering Cubbles components at runtime inside the DOM tree and 
establishing and managing data propagation between these Cubbles components based on their declared connections.
Furthermore the CIF provides the [Cubbles TAG API](#the-cubbles-tag-api).

Enable the CIF inside your web app by including the [crc-loader](#crc-loader) script with attribute `data-crcinit-loadcif="true"`.

### The Cubbles TAG API
A detailed description of the Cubbles TAG API can be found in our [Cubbles Confluence Wiki](https://cubbles.atlassian.net/wiki/x/K4Cc).

#### Create a Cubble
Instantiate a Cubble Component by adding a custom html tag where the tag name is equal to the name of the component (so called `artifactId` of the component). The mandatory attribute `cubx-webpackage-id` points to the webpackage in which the component resides.

*Note: The webpackage you are requesting the component from using* `cubx-wepackage-id` *needs to be located in the same store like the one where the RTE is requested from.*

    <body>
    ...
    <first-demo-component cubx-webpackage-id="demo-package@1.0"></first-demo-component>
    ...
    </body>

If you want to create a Cubble that is located in a webpackage with `webpackage.modelVersion  < 9` you additionally need to provide an endpointId:

    <first-demo-component cubx-webpackage-id="demo-package@1.0" cubx-endpoint-id="main"></first-demo-component>
    
The corresponding dependency needed for instantiating the `first-demo-component` will be automatically added to `window.cubx.CRCInit.rootDependencies` array (if it is not already there).

#### Slot initializations
In many cases you want to set initial values for the input slots the created Cubble provides. This can be done using the `<cubx-core-init>` and `<cubx-core-slot-init>` tags.

*Note: Setting* `style="display:none;"` *on the* `<cubx-core-init>` *tag prevents the browser from displaying the innerHtml values of each* `<cubx-core-slot-init>` *before CIF is loaded and bootstraped.* 
 
    <first-demo-component cubx-webpackage-id="demo-package@1.0">
        <cubx-core-init style="display:none;">
            <cubx-core-slot-init slot="message">"Hello World!"</cubx-core-slot-init>
            <cubx-core-slot-init slot="count">5</cubx-core-slot-init>
            <cubx-core-slot-init slot="on">true</cubx-core-slot-init>
            <cubx-core-slot-init slot="config">{"label":"Name","value":"Max Musternamm"}</cubx-core-slot-init>
        </cubx-core-init>
    </first-demo-component>
    
Each `<cubx-core-slot-init>` needs to have the attribute `slot` holding the name of the slot for which to set the value. The inner html inside the `<cubx-core-slot-init>` tag is the value which should be set. This value needs to be valid json. 
Depending on the type of value the slot expects you can set `boolean`, `string`, `number` or `object` values. The slot initializations are proceeded by the CIF in the same order there where declared inside the `<cubx.core.init>` tag. 

#### Connection declaration
If you create more then one Cubbles inside your web page it is possible to define connections between them (respectively their provided slots). This can be done using the `<cubx-core-connections>` and `<cubx-core-connection>` tags.

    <first-demo-component cubx-webpackage-id="demo-package@1.0">
        <cubx-core-init style="display:none;">
            <cubx-core-slot-init slot="message">"Hello World!"<cubx-core-slot-init>
        </cubx-core-init>
        <cubx-core-connections>
            <cubx-core-connection connection-id="connection1" source="message" destination="second:textInput"></cubx-core-connection>
        </cubx-core-connections>
    </first-demo-component>
    ...
    <second-demo-component id="second" cubx-webpackage-id=""demo-package@1.0"></second-demo-component>
    
Each `<cubx-core-connection>` needs attributes

1. `conection-id` for setting a unique connection id
2. `source` for setting the output slot name acting as source for this connection
3. `destination` for setting the target of this connection using `[id-of-target]:[name-of-input-slot]`
 
The above example establishes a connection between output slot `message` of Cubble `<first-demo-component>` and input slot `textInput` of Cubble `<second-demo-component>` with `id=second`. 
Each time the value of slot `message` changes the CIF takes care of propagating the new value to slot `textInput`. Assuming slot `message` is output and input slot after initialisation the value `"Hello Wolrd!` is immediately propagated
to slot `textInput`.

There are additional options available for each `<cubx-core-connection>`:

##### repeated-value (default = false)
In case the value of an output slot is renewed without changing the value itself the value ist NOT propagated to the connected slots. This is the default behaviour.
If attribute `repeated-value` is set to `true` the connection is propagated each time the value for source slot is set also when the value itself is unchanged.

    <cubx-core-connection ... repeated-value="true"></cubx-core-connection>
 
##### copy-value (default = true)
By default the destination slot of a connection will receive a copy of the propagated value. This isolates the models of different Cubbles of each other. In most cases this is the expected behaviour.
If attribute `copy-value` is set to `false` the propagated value is not copied. This only is useful if the propagated value is of type `object`. Depending on the size of the propagated object it is much faster to not copy the value. 

    <cubx-core-connection ... copy-value="false"></cubx-core-connection>

##### hook-function
It's possible to declare a hook function that is called with propagated value each time the connection triggers. This can be useful if you need to do some data transformation to fit the target slots expected structure.
The hook function will be called with the propagated value and a next callback. The continue the propagation of the connection you have to call the next callback with the value the propagation should be continued:

    function (value, next) {
        // do your data transformation based on value
        var newValue = value * 2;
        
        // call next callback with transformed value
        next(newValue);
    }
    
To apply such a hook function to a connection just add the `hook-function` attribute as follows:
  
Either provide the function string inline 

    <cubx-core-connection ... hook-function="function (value, next){ var newValue = value; next(newValue); }"></cubx-core-connection>

or provide the name of a function available in global `window` scope

    <cubx-core-connection ... hook-function="myHookFunction"></cubx-core-connection>

#### Adding dependencies
Use the `<cubx-dependencies>` and `<cubx-dependency>` tags to add additional dependencies. This can be useful if you have only permission to edit certain parts of the DOM tree e.g. when you are a page editor using a cms like Wordpress
and want to add dependencies. Otherwise it's also possible to add dependencies using the global `window.cubx.CRCInit.rootDependencies` property (see [rootDependencies](#rootdependencies)).

    <first-demo-component cubx-webpackage-id="demo-package@1.0">
        <cubx-dependencies>
            <cubx-dependency artifact-id="third-party-utility" webpackage-id="third-party-pkg@1.0"></cubx-dependency>
        </cubx-dependencies>
    </first-demo-component>

Each `<cubx-dependencies>` tag can have an arbitrary number of `<cubx-dependency>` children. Each `<cubx-dependency>` tag needs attributes

1. `artifact-id` sets the artifactId (= component name) of the dependency to add
2. `webpackage-id` (optional) sets the webpackage-id in which the given artifact should is located. If this attribute is omitted the artifact will be searched in the same webpackage like the parent Cubble.
3. `endpoint-id` (optional) sets the endpoint-id of the dependency to add. This is only needed if you reference a webpackage with `webpackage.modelVersion < 9`

#### Exlcuding dependencies
Analogous to adding dependencies it is also possible to exclude certain dependencies. Use the `<cubx-dependency-excludes>` and `<cubx-dependency-exclude>` tags to do so.

    <first-demo-component cubx-webpackage-id="demo-package@1.0">
        <cubx-dependency-excludes>
            <cubx-dependency-exclude artifact-id="third-party-utility" webpackage-id="third-party-pkg@1.0"></cubx-dependency-exclude>
        </cubx-dependency-excludes>
    </first-demo-component>
    
Each `<cubx-dependency-excludes>` tag can have an arbitrary number of `<cubx-dependency-excludes>` children. Each `<cubx-dependency-exclude>` tag needs attributes

1. `artifact-id` sets the artifactId (= component name) of the dependency to exclude
2. `webpackage-id` (optional) sets the webpackage-id in which the given artifact is located. If this attribute is omitted the artifact will be searched in the same webpackage like the parent Cubble.
3. `endpoint-id` (optional) sets the endpoint-id of the dependency to exclude. This is only needed if you reference a webpackage with `webpackage.modelVersion < 9`

*Note: When you exclude a dependency that is needed by other Cubbles in your DOM tree this exclude will be ignored. In such a case you have to make sure to exclude this specific dependency for each Cubble that uses the dependency.*

To make sure a dependency is always excluded you can add it to the global `window.cubx.CRCInit.rootDependencyExclucdes` array (see [rootDependencyExcludes](#rootdependencyexcludes)).

## cubx-component-mixin
A collection of instance methods which each Cubble provides no matter if it is a compound Cubble or an elementary Cubble.

## cubxcomponent
Provides the global `CubxComponent()` function used for registering a new Cubble component. This is nessecary for implement elementary Cubbles components. 

## dom-tree-utils
Some helpers for DOM tree manipulation.

## dynamic-connection-utils
A set of instance methods which each Cubble provides for handling dynamic connections.

## es6-promise
Polyfill to get global `Promise` support in IE. For more details see [es6-promise](https://github.com/stefanpenner/es6-promise).

## guid-utility
Small utility for generation a guid.

## iframe
A small app artifact which you can use to render an arbitrary component given by url search parameter inside an iframe. This can be useful if you want to include a Cubble inside your web app
but there is no RTE available on the page. For example if you are only allowed to add standard html when editing a page in a cms like wordpress. 

Include component `first-demo-component` from webpackage `demo-package@1.0` into your page using iframe:

    <iframe src='https://cubbles.world/sandbox/cubx.core.rte@2.1.0/iframe/index.html?webpackage-id=demo-package@1.0&artifact-id=first-demo-component'/>

You can also init slots of the component rendered within the iframe:

    <iframe src='https://cubbles.world/sandbox/cubx.core.rte@2.1.0/iframe/index.html?webpackage-id=demo-package@1.0&artifact-id=first-demo-component
                 &inits={"message":"Hello World!","config":{"label":"Name","value":"Max Musternamm"}}'/>

And finally add additional dependencies:

    <iframe src='https://cubbles.world/sandbox/cubx.core.rte@2.1.0/iframe/index.html?webpackage-id=demo-package@1.0&artifact-id=first-demo-component
                 &inits={"message":"Hello World!","config":{"label":"Name","value":"Max Musternamm"}}
                 &dependencies=[{"webpackage-id":"third-party-pkg@1.0","artifact-id":"third-party-utility"}]'/>

## iframe-resizer
The purpose of the iframe-resizer is to resize the iframe that displays a Cubbles component automatically according to it's content. The width of the iframe will always be `100%` while the 
height is set to the content's height.

To enable resize support for your iframe you need to include `resize.js` script in the iframe's parent page

    <head>
       <script src="https://cubbles.world/core/cubx.core.rte@2.1.0/iframe-resizer/resize.js"/>
    </head>

and set the iframe's `id` value which needs to be provided in the `src` using the `iframe-id` url search parameter.

    <body>
      <iframe id="myIframe" src="https://cubbles.world/core/rte@2.1.0/iframe/index.html?iframe-id=myIframe&webpackage-id=demo-package@1.0&artifact-id=first-demo-component"/>
    </body>

## webcomponents
Webcomponents polyfill. This needs to be included before the crc-loader script. It is sufficient to use [webcompents-lite](#webcomponents-lite). 

## webcomponents-lite
Webcomponents polyfill. This needs to be included before the crc-loader script (see [crc-loader](#crc-loader) section).
For more details see [webcomponents.org](http://webcomponents.org/polyfills/).
                     
