## Auf SecureHub hochladen

Dieses benutzerdefinierte Modul ermöglicht es uns, Dateien auf ein Speicherkonto eines Drittanbieters hochzuladen, wodurch das ``securehub-file-upload``-Webchat-[Plugin](https://github.com/Cognigy/WebchatPlugins/tree/master/plugins/file) ausgelöst wird -hochladen).

**WICHTIG (CORS):**

Beim Ausführen dieser benutzerdefinierten Knoten könnte eine Fehlermeldung angezeigt werden, die besagt, dass der *origin https://webchat-demo.cognigy.ai durch die CORS-Richtlinie* blockiert wurde. Um dies zu beheben, muss die **CORS-Konfiguration** angepasst werden – Sie müssen zulassen, dass der Webchat Dateien am richtigen Ort speichert.

## Auf Securehub-Speicher hochladen

Um das benutzerdefinierte Modul korrekt nutzen zu können, sind einige Elemente erforderlich.

* Ordnernamen

Dies ist der Name des Ordners, in den die Dateien hochgeladen werden.

* Base URL

Die Base URL für die SecureHub-Umgebung. Normalerweise *securehub.yourcompanyname.com* oder ein ähnliches Muster. "https://" usw. sind nicht erforderlich.

* SecureHub Verbindung

Für die Verbindung benötigen wir Ihren Benutzernamen und Ihr Passwort.