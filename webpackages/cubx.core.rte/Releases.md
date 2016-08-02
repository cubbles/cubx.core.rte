# Releases

## 1.10.0

### Improvement
* PLAT-524: Capability to define inline manifest object directly on rootDependency item
* PLAT-538: Cache manifest.webpackage files using webpackage id as key
* fire cifReady Event just first time (PLAT-545)
* BDE-230: Resources with absolute urls are allowed by means of the 'allowAbsoluteResourceUrls' attribute from CRCInit object

## BugFixes
* Fixed: Not direct children was ignored (Jira:PLAT-534)

## 1.9.0
 * Composite Case
    * Coder can combine any html elements inside of crc-root
    * It can be defined connections between cubbles,
    * Cubbles can be initialized with slot values

## 1.8.0

### Improvement
* PLAT-433 Use HTML templates for compound components
** added Polyfill es6 Promise
* PLAT-459: CRC and CIF checked the modelVersion just major and minor versionslevel not patch versinslevel.

### BugFix
* PLAT-462: Internal connections are not propagated, if the memberID of the parent and member is the same - fixed
* PLAT-459_ Compound Components: Slot value propagation of internal output connections is defekt - fixed
* PLAT-475: initialisation happend sometimes in false order - fixed

## 1.7.0
* PLAT-340:
 ** dependency of a cubbles element can configured directy in the tag by attribute "cubx-dependency"
 ** The attribute `data-CRCInit.loadCIF` changed in `data-crcinit-loadcif`
 ** The event to trigger loading CRC kann be configured with the `data-cubx-startevent` attribute. The default event is `DOMContentLoaded`.

## 1.6.0
* PLAT-259: added PolyFills for IE 11
* PLAT-436: directExecution attribute allow for import JSON format (Method #importDynamicConnections)

## 1.5.0

### Improvement
* PLAT-409
    * compound components have an internal model similar to elementary components
    * direct execution: `addDynamicConnection` method propagate the slot value, if the property directExecution = true
* PLAT-423: internal Variable "component" renamed  in less common name  ___cubxManifest___

### BugFix
* PLAT-415 Fixed: The defined hook function is calling when propagation to compound components.
* PLAT-422 Fixed: Outgoing internal connection will just propagated, if the destination slot an outputslot is.
* PLAT-421 cubxPolymer elements generate an own `runtime-id` attribute, if it not exists.

## 1.4.0

### Improvement
* support modelVersion 8.3.0
* PLAT-379: CubxPolymer - default initailisation of object and array change to undefined
* PLAT-377: CubxPolymer - add call of lifecycle method "cubxReady"
* PLAT-306: The origin compound-element remains preserved. (Before this,  was  this deleted and  instead it   a new element created.)
* PLAT-335: Dynamic connections (add, remove, export, import)

### BugFix
* PLAT-383
 ** if the crc container (element with attribute "cubx-core-crc") missed, will a warning logged.
 ** logs an other warning, because the attributes "data-crc-id" und "data-crc-version" can not written
 ** the events crcReady und crcDepMgrReady will dispatched on body element.
* PLAT-406
 * Fixed: Sometimes it has been attempted to initialize before all components were finished or the relations
 of the contexts were built.
* PLAT-408:
  * Fixed: hookFunction of the one connection called in other connection too, by the same sourceElement.
* PLAT-413
  * Fixed: Various instances of Elementary Component use the same model

## 1.3.0
* PLAT-109 - hook function for connections

## 1.2.1
* BugFix: dependency resolution for stores different to root-store

## 1.2.0
* compoundComponents/member: can use "this" similar to dependencies
* support modelVersion 8.2
* PLAT-369 - Coders can define 'runnables' on webpackage AND artifact -level
* PLAT-367 - modelVersion8/compoundComponent: members can referenced this/artifactId

## 1.1.1

### BugFix
* Bugfix cifReady for Standalone Elementary Components

## 1.1.0
* PLAT-280: new connection attribute "repeatedValues"
* modelVersion 8.1
### BugFixes/Improvement
* crc: load cif as first dependency
* cubxpolymer: trigger "modelChange" events only, if all the from cif created elementaries are ready.
* cubxpolymer: the dependency polymer pointend to version 1.2.3
* webcomponents version 0.7.18
* included readme.html and releases.html
* cif: new event "cifStart" included
* cif: new method isElementariesReady

## 1.0.0
* initial version for  modelVersion 8
