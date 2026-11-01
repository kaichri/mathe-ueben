# Mathe üben für Emma

Ein deutschsprachiges Mathe-Lernspiel für Kinder der **3. Klasse Volksschule**.
Das Spiel übt die vier Grundrechenarten, Zahlenrätsel sowie Rechengeschichten
mit Geld und Uhrzeiten. Die Rechenaufgaben bewegen sich grundsätzlich im
Zahlenraum 100; Geldbeträge werden intern in Cent und Uhrzeiten in Minuten
verarbeitet.

Die Anwendung besteht aus HTML, CSS und JavaScript. Zum Spielen sind weder
ein Benutzerkonto noch eine Installation oder ein Build-Schritt erforderlich.
Das Spiel funktioniert lokal ohne Internet; die Feier-Videos werden von
YouTube geladen und benötigen eine Internetverbindung.

## Funktionen und Spielregeln

### Tagesquiz

Ein reguläres Set enthält **50 Aufgaben**:

| Bereich | Aufgaben |
|---|---:|
| Addition | 10 |
| Subtraktion | 10 |
| Multiplikation | 10 |
| Division, teilweise mit Rest | 10 |
| Zahlenrätsel | 5 |
| Rechengeschichten | 5 |

Die Geschichten stammen aus 47 Vorlagen. Ein Set enthält drei normale
Geschichten, eine Geldgeschichte und eine Uhr-/Minutengeschichte; drei Vorlagen
gehören zur einfachen und zwei zur zweiten Schwierigkeitsstufe. Bereits kürzlich
verwendete Aufgaben werden möglichst vermieden. Bei erschöpften Aufgabenpools
werden die ältesten Ausschlüsse gelockert.

- Drei Themenwelten: **Bluey**, **Gabbys Puppenhaus** und **Doozies Hundehaus**.
- Eine begonnene Tagesrunde behält ihre Aufgaben, Antworten und ursprüngliche
  Welt. Eine andere Auswahl auf der Startseite verändert diese Runde nicht.
- „Weiter“, „Zurück“ und die Bereichsnavigation wechseln zwischen Abschnitten.
  Erst „Fertig“ bewertet die gesamte Runde und sperrt die Antworten.
- Fehlerhafte Aufgaben lassen sich anschließend in einer Wiederholungsrunde üben.
- „Neuer Versuch“ erzeugt nach einer Rückfrage ein neues Set für denselben Tag.
  Die bisherigen Tagesantworten werden dabei ersetzt; verdiente Sterne,
  Gutscheine und bereits für diesen Tag geöffnete Bonuswelten bleiben erhalten.
- Am nächsten Tag wird beim Starten eine neue Tagesrunde erzeugt. Maßgeblich
  ist die Zeitzone **Europe/Vienna**, einschließlich Sommer-/Winterzeit.

### Sterne, Bonuswelten und Gutscheine

Reguläre Runden und Wiederholungsrunden vergeben ein bis fünf Sterne:

| Anteil richtig | Sterne |
|---|---:|
| Ab 90 % | 5 |
| Ab 80 % | 4 |
| Ab 60 % | 3 |
| Ab 40 % | 2 |
| Darunter | 1 |

Eine abgeschlossene reguläre Tagesrunde mit **mindestens 25 von 50** richtigen
Antworten öffnet die Bonuswelt ihrer Themenwelt für diesen Tag.
Wiederholungsrunden können keine Bonuswelt freischalten.

In den Bonuswelten gibt es Knobelaufgaben mit freundlicher Rückmeldung.
Jede gelöste Bonuskarte vergibt ihren Stern einmal. Noch ungelöste Karten
können weiter bearbeitet werden. Insgesamt sind **höchstens drei Bonussterne
pro Tag über alle Welten zusammen** möglich.

**Fünf Bonussterne ergeben einen auswählbaren Gutschein.** Das verfügbare
Guthaben wird entsprechend vermindert; die insgesamt verdienten Bonussterne
bleiben separat gespeichert. Gutscheine können innerhalb der vorgesehenen
Wochenfrist umgetauscht werden. Der alte Eintrag bleibt mit Umtauschvermerk
erhalten. Der Knopf „Neuen Gutschein einlösen (für Mama)“ erlaubt außerdem
ein Geschenk ohne Bonussterne; er besitzt keine Zugangssperre.

### Weitere Funktionen

- Lebenszeitsterne, Bonussterne, Meilensteine, Bereichsauswertung und Übekalender.
- Statistikexport als CSV und JSON-Sicherung des Sitzungsstands.
- Hintergrundmusik, synthetische Ersatzmelodie bei fehlenden Dateien und
  Feier-Videos mit pausierter Hintergrundmusik.
- Tastaturbedienung mit Tab, Enter und Pfeiltasten sowie Dialognavigation mit
  Tab/Umschalt+Tab und Escape.
- Zugängliche Dialogtitel, Fokusführung und eine Live-Region für Ergebnisse.
- Responsive Darstellung, Druckansicht und Berücksichtigung reduzierter Bewegung.

## Herunterladen und starten

1. Das vollständige Repository oder dessen ZIP-Datei herunterladen.
2. Eine ZIP-Datei vollständig entpacken. Die Dateien und der Ordner `musik/`
   müssen in ihrer vorhandenen Struktur zusammenbleiben.
3. **`index.html` in Chrome oder Edge öffnen**, beispielsweise per Doppelklick.
4. Eine Welt auswählen und „Los geht's!“ drücken.

Alternativ kann das Verzeichnis mit einem lokalen statischen HTTP-Server
bereitgestellt werden. Dafür ist kein Anwendungsserver erforderlich.

Für die lokale Dateiversion immer denselben Browser und denselben Speicherort
verwenden. Die Behandlung von `localStorage` bei `file://` hängt vom Browser ab;
ein anderer Browser, eine andere Adresse oder ein verschobener Ordner kann
einen anderen Speicherbereich verwenden. Node.js und Playwright werden nur für
die Entwicklung und Tests benötigt.

### Antworten eingeben

- **Zahlen:** Ganze, nichtnegative Zahlen eingeben.
- **Division mit Rest:** Ergebnis und Rest in die beiden vorgesehenen Felder schreiben.
- **Geld:** Euro und Cent getrennt eingeben, beispielsweise `16` und `50`.
  Ein einzelnes leeres Teilfeld gilt als null; zwei leere Felder bleiben
  unbeantwortet. Nichtleere ungültige Angaben machen die Antwort ungültig.
- **Uhrzeit:** Zum Beispiel `9:25`, `9.25` oder `9 Uhr 25`.

## Projektstruktur

```text
mathe-ueben/
├── index.html                  Oberfläche und Dialoge
├── style.css                   Themen, Layout, Fokus und Druckansicht
├── script.js                   Spielzustände, Bewertung, Speicher, Audio und Export
├── aufgaben-bereiche.js         Rechenaufgaben und Bonusaufgaben
├── geschichten.js              47 Geschichtenvorlagen und ihre Auswahl
├── videos.js                   Liste der externen Feier-Videos
├── musik/
│   ├── blau.mp3
│   ├── puppenhaus.mp3
│   ├── blau.mp4
│   └── puppenhaus.mp4
├── tests/
│   ├── phase1.test.cjs
│   ├── phase2.test.cjs
│   ├── phase3.test.cjs
│   ├── phase3-helper.cjs
│   ├── phase4.test.cjs
│   └── phase4.browser.cjs
├── PHASE1.md … PHASE4.md        Entwicklungs- und Prüfberichte
├── So funktioniert es.txt       Zusätzliche Bedienungsanleitung
└── README.md
```

Die Hintergrundmusik verwendet die MP3-Dateien. Eine optionale
`musik/doozie.mp3` ist **nicht enthalten**; in Doozies Welt wird bei ihrem Fehlen
auf `puppenhaus.mp3` zurückgefallen. Die vorhandenen MP4-Dateien werden nicht
für das YouTube-Kino benötigt. Externe Videos können sich ändern oder regional
nicht verfügbar sein.

## Lokale Datenspeicherung

Das Spiel speichert seine Daten im **`localStorage` des Browsers** unter
`mathe-ueben-fuer-emma`, aktuell im Speicherformat Version 2. Gespeichert werden
unter anderem:

- Tagesaufgaben, eingegebene Antworten und aktueller Abschnitt;
- reguläre Lebenszeitsterne, Bonusguthaben und insgesamt verdiente Bonussterne;
- Gutscheine einschließlich Umtauschvermerken;
- Rundenhistorie, Bereichssummen, Tagesfreischaltungen und Einstellungen.

Die Rundenhistorie ist auf 1.000 Einträge begrenzt. Lebenszeitsterne und
Bereichssummen werden davon unabhängig erhalten. Beim Laden älterer Spielstände
werden die noch nachweisbaren regulären Sterne übernommen, ohne sie bei jedem
Neustart erneut zu addieren. Bereits vor dieser Migration entfernte
Statistikzeilen lassen sich ohne ältere Sicherung nicht rekonstruieren.

Eingaben gelangen sofort in den Arbeitsspeicher; vollständige Schreibvorgänge
werden beim Tippen um 250 ms gebündelt. Feld-/Abschnittswechsel, Bewertung und
das Verlassen beziehungsweise Ausblenden der Seite schreiben unmittelbar.
Bei einem harten Browser- oder Systemabsturz können die letzten noch nicht
geschriebenen Zeichen verloren gehen.

Bei beschädigten Daten oder einer fehlgeschlagenen Migration schützt das Spiel
den ursprünglichen Speichertext vor automatischem Überschreiben. Bei
Schreibproblemen erscheint ein verständlicher Hinweis. Bis zur Behebung sind
Änderungen gegebenenfalls nur im geöffneten Fenster verfügbar.

**Mehrfensterschutz bedeutet keine automatische Synchronisierung.** Ein älterer
Fensterstand darf einen erkannten neueren Speicherstand nicht überschreiben.
Das betroffene Fenster zeigt eine Meldung und erlaubt die Sicherung seiner
Sitzungsdaten. Eine automatische Zusammenführung oder eine atomare Garantie
für exakt gleichzeitige Schreibvorgänge gibt es nicht. Ein aktives Spielfenster
ist deshalb empfohlen.

Es gibt keinen eigenen Spielstand-Server und keine Anmeldung im Spiel.
Das Löschen von Browserdaten oder die Verwendung eines privaten Browserfensters
kann gespeicherte Fortschritte entfernen. Die YouTube-Einbettung ist eine
externe Verbindung; das Spiel ist daher beim Öffnen des Kinos nicht vollständig
offline.

## Sicherung und Export

### Statistik als CSV

Unter **„Mein Fortschritt“ → „Statistik“ → „Statistik herunterladen“** entsteht
eine CSV-Datei mit Runden, Bereichswerten, Bonusdaten und Gutscheinen.
Sonderzeichen, Anführungszeichen und Zeilenumbrüche werden für CSV behandelt.
Die Datei dient der Auswertung und ist kein automatisch wiederherstellbarer
Spielstand.

### Spielstand als JSON sichern

Bei einer Speicher- oder Konfliktmeldung erscheint **„Daten sichern“**.
Der Download enthält den aktuellen Sitzungsstand unter `daten`, den ursprünglich
gelesenen Speichertext unter `originalSpeicher` und eine Formatkennung.
Auch beschädigter ursprünglicher Speichertext bleibt dadurch in der Sicherung
erhalten, sofern er gelesen werden konnte. Bei verweigertem Lesezugriff kann
dieser ursprüngliche Inhalt nicht exportiert werden.

**Eine Importfunktion existiert nicht.** Es gibt keinen Importdialog und keine
automatische Wiederherstellung einer JSON-Sicherung. Bei einer Fehlermeldung
das Fenster bis zur Sicherung offen lassen und die Datei aufbewahren.
Persönliche JSON-Sicherungen und CSV-Exporte werden durch `.gitignore` von der
Versionsverwaltung ausgeschlossen.

## Automatisierte Tests

### Regression und Syntax

Die 69 Regressionstests verwenden den integrierten Node.js-Testläufer und
benötigen keine zusätzlichen npm-Pakete. Node.js 24 wurde für die dokumentierten
Prüfungen verwendet; zum Spielen ist Node.js nicht erforderlich.

Im Projektverzeichnis ausführen:

```powershell
node --test tests/phase1.test.cjs tests/phase2.test.cjs tests/phase3.test.cjs tests/phase4.test.cjs

node --check script.js
node --check aufgaben-bereiche.js
node --check geschichten.js
node --check videos.js
```

Die Tests simulieren unter anderem DOM, Browser-Speicher, Audiofehler und
Datumswechsel. Zusätzlich prüfen sie Aufgaben und Geschichten mit unabhängigen
Lösungserwartungen sowie längere Folgen von Runden und Wiederöffnungen.

### Echte Browserprüfungen

`tests/phase4.browser.cjs` benötigt ein verfügbares **Playwright-Paket** sowie
installiertes Chrome und Edge. Das Projekt enthält keine eigene npm-Konfiguration
oder einen Build-Schritt. Bei der dokumentierten Prüfung wurde das bereits
gebündelte Playwright-Paket verwendet; sein Modulverzeichnis muss für Node.js
erreichbar sein, beispielsweise über `NODE_PATH`.

```powershell
# NODE_PATH bei Bedarf auf das vorhandene Verzeichnis mit Playwright setzen.
node tests/phase4.browser.cjs
```

Optional steuern `CHROME_PATH` und `EDGE_PATH` die Browserpfade und `QA_OUTPUT`
das Ausgabeverzeichnis. Die Prüfung startet einen lokalen Testserver, verwendet
isolierte Profile und schreibt Ergebnisse/Screenshots außerhalb des Projekts.
Details und der konkret verwendete Paketpfad stehen in [PHASE4.md](PHASE4.md).

## Qualitätssicherung und Grenzen

Der in Phase 4 geprüfte Stand erreichte:

| Prüfung | Ergebnis |
|---|---|
| Regressionstests | 69 bestanden: 14 + 25 + 25 + 5 |
| Echte Chrome-/Edge-Prüfungen | 84 bestanden: je 42 |
| Geschichtenvorlagen | 47 geprüft |
| Zulässige Zahlenkombinationen der Geschichten | 93.308 geprüft |
| Zufällige Geschichtensets | 6.000 geprüft |
| Langzeitsimulation | 100 reguläre Runden über 25 Spieltage, einschließlich Wiederöffnungen und Bonus |
| Statistikgrenze | 1.100 Zeilen bei erhaltenen Lebenszeitsummen geprüft |
| Responsive Viewports | 375×812, 390×844, 768×1024, 1366×768 und 1920×1080 |

Chrome 156.0.8078.80 und Edge 156.0.4314.58 wurden automatisiert getestet.
Reale Medienzustände belegten MP3-, MP4- und stichprobenartige
YouTube-Wiedergabe, Autoplay-Wiederholung, Musikpause und Wiederaufnahme.
Die Lautsprecher-/Kopfhörerausgabe wurde nicht durch Anhören geprüft.

Die Testergebnisse gelten für den dokumentierten Umfang:

- **Firefox und Safari wurden nicht getestet.**
- **Echte Mobilgeräte wurden nicht getestet.** Responsive Darstellung und
  Touch-Ereignisse wurden im Browser emuliert.
- **Screenreader-Ausgabe wurde nicht geprüft.** Dialogattribute, Tastaturführung,
  Fokus und Live-Region wurden technisch geprüft.
- Die Kontrastprüfung war eine Stichprobe und keine vollständige
  WCAG-Konformitätsprüfung.
- Nicht alle YouTube-Clips, Regionen und späteren Verfügbarkeitsänderungen sind
  abgedeckt.
- Die Langzeitprüfung ist eine beschleunigte Simulation und kein Nachweis
  stundenlanger realer Sitzungen oder einer Wiederherstellung nach Stromausfall.

## Versionshistorie

### 1.0.0 — erste stabile Fassung

Zusammengeführter Stand der vier Entwicklungs- und Qualitätssicherungsphasen:

| Phase | Schwerpunkt | Kumulativer Teststand |
|---|---|---:|
| 1 | Aufgabenpool, eindeutige Bonusbelohnung und Freischaltung | 14 |
| 2 | Lebenszeitsterne, Rundenwelt, Audio, Geldparser und Wiener Datum | 39 |
| 3 | Geschichten, Speicherschutz, Sicherung, Exporte und Dialoge | 64 |
| 4 | Gesamttest, Langzeit-/Browserprüfung, mobile Darstellung und weitere Korrekturen | 69 + 84 Browserprüfungen |

Diese Version bündelt die abgeschlossenen Phasen; für die einzelnen Phasen
wurden keine separaten Release-Versionen nachträglich erfunden.

## Entwicklungs- und Prüfberichte

- [PHASE1.md — Aufgabengenerator und Bonuslogik](PHASE1.md)
- [PHASE2.md — Statistik, Spielzustände und Audio](PHASE2.md)
- [PHASE3.md — Geschichten, Datenspeicherung und UX](PHASE3.md)
- [PHASE4.md — Finaler Gesamttest und Qualitätssicherung](PHASE4.md)

Die Phasenberichte beschreiben jeweils den damaligen Stand. Spätere
Korrekturen ergänzen frühere Aussagen, beispielsweise die Speicherformatmigration
in Phase 2 und die echten Browserprüfungen beziehungsweise den Mehrfensterschutz
in Phase 4. Maßgeblich für die aktuelle Bedienung und bekannte Grenzen ist
diese README zusammen mit dem abschließenden Phase-4-Bericht.
