# Webpackage cubx.core.rte
(Cubbles core Runtime Enviroment)

## CRC
(Client Runtime Container)

Dieser Utility dient dazu die Runtime für eine WebApp bereit zu stellen.

### Module
#### CRC
Der Client Runtime Container wird für die Laufzeit eines Apps benötigt. (repräsetiert durch ein WebPackage)

#### DependencyManager
Der Dependency Manager löst die benötigte Abhängigkeiten auf, und fügt in das Dokument ein. Der Anforderer wird in data-referrer Attribute festgehalten.

#### Cache
Der Cache hält alle referenzierte Komponente. Der Schlüssel zu einem Komponente ist der ArtifactId.
Der Cache speichert weiterhin den resolvedComponent Objekt, sobald es gebildet wurde. Der Schlüssel zu resolvedComponent ist der artifactId der Ursprungskomponente.

#### ComponentResolver
Fügt die referenzierten Komponenten rekursiv in die original Compound-Komponent-Manifest ein. Damit entsteht der Gesamthierarchie der Compound-Komponente.

#### StorageManager
Dient zur Datenpersitenz. (TODO)

#### EventFactory
Verwaltet EventTypes und stellt utility Methoden. (zum Beispiel zu erstellen CustomEvents usw.)

#### Utils

## CRCLoader
(Client-Runtime-Container-Loader)

Diese Utility lädt den CRC (Client Runtime Container).

### Parameter:
#### loadCIF (default == 'true')
Soll das CIF geladen werden?

Mögliche Werte:  'true' | 'false

Konfiguration via

* Attribut am CRCLoader Script-Tag: `data-crcinit-loadcif="false"
* Globale Property

        <script>
            window.cubx = {
                "CRCInit": {
                        loadCIF="false"
                    }
                }
        </script>

Hinweis: Das Attribut überschreibt die Property.

#### runtimeMode (default == 'prod')
Eine Applikation kann in verschiedenen Laufzeit-Modi gestartet werden.

Mögliche Werte: 'dev' | 'prod'

Konfiguration via

* URL Parameter `runtimeMode=dev`
### Attributes:
#### data-cubx-startevent (default DOMContentEvent)
Trigger-Event für Laden der CRC. Der Konfigurierte Event muss eintreffen (oder muss bereits eingetroffen sein), bevor der CRC geladen wird.

### Root Dependencies

Die Konfiguration der Root dependencies kann in einem initiale globale  Konfigurationsobjekt festgelegt werden.
Bei Abhängigkeiten, die keine Cubbles sind, ist es auch die einzige möglichkeit.

    <script>
        window.cubx = {
            "CRCInit": {
                "rootDependencies": [
                    "this/util1/main"
                ]
            }
        }
    </script>

Dependencies zu Cubbles können in der HTML-Tag mit der Attribute "cubx-dependency" definiert werden.

    <my-example-element cubx-dependency="examples@0.1-SNAPSHOT/my-example-element/main"></my-example-element>

oder Definition in der selben Webpackage

    <my-example-element cubx-dependency="this/my-example-element/main"></my-example-element>

## CIF
(Component Integration Framework)

* Der Framework erstellt den HTML/Javascript Code für die Cubbles-Komponenten.
* Der Framework integriert Komponenten über sog. 'Connections'.

## Standalone Fall

Der Standalone FAll ist folgender Weise definiert:
    * In der CRC-Root-Element (markiert mit attribute cubx-core-crc) gibt es genau ein HTML-Tag, und diese Tag ist ein Cubbles-Komponent.

In Standalone Fall wird entweder ein Elementary-Komponent behandelt, oder der Dom-Baum eines Compound-Komponents erstellt.
Dabei werden die Connections als HTML-Tags erzeugt.

## Composite Fall
Der Composit Fall ist folgender Weise definiert:
    * In der CRC-Root-Element gibt es mehrere HTML Tags.
    * Es können gemischt Cubbles-Komponenten und anderen HTML-Tags vorhanden sein.
    * Cubbles Komponenten können in der Dom-Hierarchie in tiefern Ebenen vorhanden sein.

*TODO: noch nicht realisiert!!*

## HTML Repräsentation der Komponenten

An Hand der Komponenten Beschreibung (manifest.component) wird rekursiv das gesamte DOM-Baum generiert.
Dabei werden sowohl die HTML-Tags, welche Connections abbilden, als auch Elementary-Komponenten und Compound-Komponenten erzeugt.

Attribute der Komponenten:
* cubx-dependency: Dependency der den Code der Komponente enthält (<webpackageId>/<artifactId>/<endpoint>)
* cubx-component-id: Id der Komponente: (<webpackageId>/<artifactId>)
* runtime-id: eindeutige Id innerhalb des Anwendungs - setzt sich zusammen aus parent runtime-id (sofern parent
Komponente existiert) und der eigene cubx-component-id, sowie member-id
* member-id: (optional) Id-Attribut der Member-Komponente. (Quelle manifest.webpackage -> membera[x].memberId) (Es wird als Identifikator von Geschwisterkomponenten verwendet.)

Beispiele:

    Root-Tag (compound):
    <cif-test-compound-outer cubx-component-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT" runtime-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT">
    member (compound):
    <cif-test-compound cubx-component-id="com.incowia.jtrs.cif-test-compound-0.1.0-SNAPSHOT" runtime-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT:com.incowia.jtrs.cif-test-compound-0.1.0-SNAPSHOT.member2" member-id="member2"/>

    member (elementary):
    <cif-test-a cubx-component-id="com.incowia.jtrs.cif-test-a-0.1.0-SNAPSHOT" runtime-id="com.incowia.jtrs.cif-test-compound-outer-0.1.0-SNAPSHOT:com.incowia.jtrs.cif-test-compound-0.1.0-SNAPSHOT.2:com.incowia.jtrs.cif-test-a-0.1.0-SNAPSHOT.member1" member-id="member1">

### Komponenten
An der manifest.webpackage generierte Komponenten werden mit Attributen, wie zum Beispiel `runtime-id` angereichert.

### Compound Komponenten - Context
Jede Coumpound Komponent hat sein eigenes Context-Objekt.  Innerhalb dieses Kontextes wird die Propagierung der Slots realisiert.

#### Compound Komponent HTML-Templates
Ein Compound Komponent __kann__ die Integration der Member-Komponenten durch ein HTML-Template definieren.
Ein Beispiel für eine Template für `my-compound`

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

Wenn kein HTML Template für die Compound Komponent eingebunden ist, werden die Member Komponente in der Definitionsreihenfolge als direkte Kinder zugefügt.


### Connections
Die Connection-Informationen werden in der HTML-Cutom-Tags "cubx-connections" und "cubx-connection" beschrieben.
Nach Abschluss der Generierung der HTML Tags wird der Dom-Baum geparst, und an Hand der Connection-Tags wird es
in der Connection-Liste aufgenommen und gehalten. Diese interne Liste steuert die Propagation des Slots.

    <cubx-connections style="display: none;">
        <cubx-connection source="slota" destination="2:slotaa"></cubx-connection>
        <cubx-connection source="slotb" destination="2:slotbb" copy-value="false"></cubx-connection>
        <cubx-connection source="slotb" destination="2:slotbb" copy-value="false"></cubx-connection>
         <cubx-connection source="slotb" destination="parent:slotxx" copy-value="false"></cubx-connection>
    </cubx-connections>


### Events

* `cifStart` - Zeigt an wann der Cif anfängt seine Aufgaben abarbeiten.
* `cifReady`  - Zeigt an, das der CIF Initial Processe (Elemente erzeugen, Connections registrieren und Slotinitialisierung durchführen)
 abgeschlossen ist
* `cifInitStart` - Wird bei Start der Slotinitialisierung geworfen
* `cifInitReady` - Wird nach Beendigung der Slotinitialisierung geworfen
* `cifComponentReady`- Wird von dem einzelnen Komponenten geworfen und in CIF empfangen. Wenn für alle Komponente, die von CIF generiert wurden, den `cifComponentReady` Event empfangen wurde, wird `cifAllComponentsReady` Event geworfen.
* `cifAllComponentsReady` - Imliziert, dass alle von CIF generierten Komponenten fertig sind. Nach Empfang dieser Events werden erst die Connections and Inits Definitionen umgesetzt.


## CubxPolymer
(Cubbles Wrapper for Polymer 1.x Elements)

CubxPolymer bildet einen Wrapper für das Polymer-Objekt. Durch den Wrapper wird das Objekt um die
_CubblesComponent-API_ erweitert.

Konkret bedeutet das

1. die Erweiterung um ein sog. _model_ und
2. Methoden zur externen Interaktion mit dem Model (vorzugsweise genutzt durch das CIF) und
3. Methoden zur internen Interaktion mit dem Model (innerhalb der Komponente).

## Webcomponents
(3th-party webcomponents library)

The webcomponent.js polyfills enable Web Components in (evergreen) browsers that lack native support.


## So wirds gemacht...

### Verwendung von _hookFunction_

Ab modelVersion 8.2 ist es möglich, an jede definierte Connection eine `hookFunction` zu definieren.
Diese Funktion wird ausgeführt

* wenn durch die Connection Daten propagiert werden und
* before die propagierte Daten in die Zielkomponente und Slot übergeben werden.

#### Konfiguration
Das Attribut `hookFunction` kann sowohl eine anonyme Funktion (als String) als auch den Funktionsname
eines existierenden globalen Funktion (incl. Namespace) enthalten.

Connection Beispiel - mit `hookFunction` mittels anonyme Funktion

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

Connection Beispiel - mit `hookFunction` mittels globale Funktionsname

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

In der oberen Beispiel verwendete globale Funktion (cubx.hookFunctions.multiply10) kann z.Bsp.
in einem Artifact von Typ Utility definiert werden. Der Funktion wird in diesem Beispiel in der Namespace `window.cubx.hookFunctions` definiert.

Beispiel für Funktionsdefinition

    window.cubx.hookFunctions.multiply10 = function(value, next) {
        value = Number(value) * 10;
        next(value);
    };


Den _hookFunction_ (in dem oberen Beispiel _cubx.hookFunctions.multiply10_) wird bei Aufruf zwei Parameter übergeben:

* value - entspricht die propagierte Daten.
* next - eine Funktion, welches der Weiterverarbeitung der Datentransport initiiert. Der Aufruf von `next` sollte nach
 der Modifizierung der propagierten Daten erfolgen. Als Parameter bekommt sie einen Parameter, welcher die modifizierte Daten enthält.

Wenn der `hookFunction` für Validierung der propagierten Daten verwendet wird, kann bei invaliden Daten eine Abbruch erfolgen.
Ein Abbruch der Datentransport wird  dadurch erreicht, dass der `next`-Funktion _nicht_ aufgerufen wird.


