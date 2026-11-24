# Mathe üben für Emma

Ein deutschsprachiges Mathe-Lernspiel für Kinder der **3. Klasse Volksschule**.
Das Spiel übt die vier Grundrechenarten, Zahlenrätsel sowie Rechengeschichten
mit Geld und Uhrzeiten. Die Rechenaufgaben bewegen sich grundsätzlich im
Zahlenraum 1000; Geldbeträge werden intern in Cent und Uhrzeiten in Minuten
verarbeitet. Zusätzlich enthält es ein endlos wiederholbares
**Deutsch-Sprechtraining** (Eltern-Kind-Modus) mit eingebetteter
Vorlesefunktion.

Die Anwendung besteht aus HTML, CSS und JavaScript. Zum Spielen sind weder
ein Benutzerkonto noch eine Installation oder ein Build-Schritt erforderlich.
Das Spiel funktioniert lokal ohne Internet.

Die Figurenbilder für Bluey und Gabbys Puppenhaus stammen von den offiziellen Seiten
zu [Bluey](https://www.bluey.tv/characters/) und
[Gabbys Puppenhaus](https://www.gabbysdollhouse.com/uk/characters).
Die freigestellten Hunde wurden mit Imagegen anhand offizieller
[Figuren- und Musikclips](https://www.youtube.com/@GabbysDollhouseDeutschland)
und des Serienposters erstellt.
Doozies freigestellte Figur stammt aus [„Doozie“ von marybethmaria1423](https://www.deviantart.com/marybethmaria1423/art/Doozie-1400008346).

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

Die Geschichten stammen aus 55 Vorlagen. Ein Set enthält drei normale
Geschichten, eine Geldgeschichte und eine Uhr-/Minutengeschichte; drei Vorlagen
gehören zur einfachen und zwei zur zweiten Schwierigkeitsstufe. Bereits kürzlich
verwendete Aufgaben werden möglichst vermieden. Bei erschöpften Aufgabenpools
werden die ältesten Ausschlüsse gelockert.

- Drei Themenwelten: **Bluey**, **Gabbys Puppenhaus** und **Doozies Hundehaus**.
- Eine begonnene Tagesrunde behält ihre Aufgaben, Antworten und ursprüngliche
  Welt. Eine andere Auswahl auf der Startseite verändert diese Runde nicht.
- „Weiter“, „Zurück“ und die Bereichsnavigation wechseln zwischen Abschnitten.
  Erst „Fertig“ bewertet die gesamte Runde und sperrt die Antworten. Ist auch nur
  eine Aufgabe unbeantwortet, fragt das Spiel vorher nach („Weiter üben“ /
  „Trotzdem abgeben“); bei 50 von 50 Antworten schließt es direkt ab.
- Fehlerhafte Aufgaben lassen sich anschließend in einer Wiederholungsrunde üben.
- „Neuer Versuch“ erzeugt nach einer Rückfrage ein neues Set für denselben Tag.
  Die bisherigen Tagesantworten werden dabei ersetzt; verdiente Bonussterne,
  Gutscheine und bereits für diesen Tag geöffnete Bonuswelten bleiben erhalten.
- Am nächsten Tag wird beim Starten eine neue Tagesrunde erzeugt. Maßgeblich
  ist die Zeitzone **Europe/Vienna**, einschließlich Sommer-/Winterzeit. Sind
  von der Runde des Vortags noch Antworten gespeichert, fragt das Spiel vor dem
  Verwerfen nach.

### Bonussterne, Bonuswelten und Gutscheine

Mit **45 von 50 richtigen Antworten** in einer regulären Tagesrunde öffnet
sich die Bonuswelt dieser Themenwelt für den Rest des Tages. Sie übernimmt
ihren Platz in der Auswahl. Das Haus oben führt zurück zur Startseite.

Pro richtig gelöster Knobelaufgabe gibt es **einen Bonusstern**, insgesamt
bis zu **fünf pro Tag über alle Welten zusammen**. Jede Bonusrunde enthält
so viele Aufgaben, wie an diesem Tag noch Bonussterne zu holen sind.

Alle **25 Bonussterne** ist eine neue Stufe erreicht. Für jede neue Stufe
kann Emma einen Gutschein auswählen. Ihre Bonussterne sammelt sie weiter.
Beim Umtausch eines offenen Gutscheins bleiben Datum und Platz erhalten.

### Deutsch üben – Sprechtraining (Eltern-Kind-Modus)

Der **Umschalter „Mathe / Deutsch“** im oberen Seitenbereich wechselt zwischen
den beiden Bereichen; der **Startseite**-Knopf öffnet dabei stets die
Startseite des gerade aktiven Bereichs. Die Deutsch-Startseite ist wie die
Mathe-Startseite aufgebaut (Maskottchen, Welt-Auswahl und „Los geht's!“) und
bietet zusätzlich einen Kasten zum direkten Aussuchen einer Geschichte. Es
gibt **14 Geschichten mit je vier Fragensätzen** zum mündlichen Erzählen
(Inhalt aus dem PDF „Emma_Deutsch_Sprechtraining_14_Tage"). Eine erwachsene
Person begleitet: Stellt Fragen mündlich, hört zu und bewertet am Ende in der
App.

- Drei Welten mit je **acht süßen, animierten Figuren** stehen für das
  Deutsch-Üben bereit: **Süße Hunde** (Wuffi, Bello, Flocki, Mopsi, Coco,
  Schnuffel, Struppi und Bella), **Flauschige Hamster** (Knuspel, Wommel, Pip,
  Bommel, Nussi, Flauschi, Krummel und Zucker) und **Weihnachtswelt**
  (Weihnachtsmann, Christkind, Rudolph, Elfe, Wichtel, Schneemann, Griesgram
  und Lebkuchenmann). Die Welt wird in der Übersicht gewählt, begleitet jede
  Übung als kleine Figur und gratuliert am Ende. Die Wahl bleibt auf dem Gerät
  gespeichert und wird im Abgleich wie die Ton-Einstellungen behandelt (der
  eigene Stand gewinnt). Die Figuren lassen sich wie in Mathe mit der Maus
  verschieben.

- Jede Übung dauert etwa 10 Minuten und läuft in vier Schritten:
  **Zuhören** (Text wird vorgelesen), **Verstehen** (Fragen mit verbergbaren
  Antworten für die Begleitung), **Satz bilden** (Satzanfänge erst auf Wunsch)
  und **Erzählen** mit Bewertung. Ein „◀ Zurück“-Knopf blättert wie in
  Mathe einen Schritt zurück.
- Die Bewertung umfasst angekreuzte wichtige Punkte des Textes sowie vier
  Kriterien mit je drei Stufen: Reihenfolge, ganze Sätze & Grammatik,
  Aussprache und Zusammengehörigkeit. Abschluss erst, wenn alles gesetzt ist.
- Am Ende gibt es eine kurze Einschätzung: Was war schon stark, worauf beim
  nächsten Mal achten. Ein gelber Kasten enthält die Anleitung für die
  Begleitung.
- **Endlos üben statt Tagesplan:** Es gibt keine feste Reihenfolge und keine
  Tagesfolge; jede Geschichte ist jederzeit offen. „Los geht's!“ startet eine
  zufällige Geschichte und darin einen der vier Fragensätze – derselbe Satz
  wie in der vorigen Runde wird vermieden. Die Bewertung gilt nur für die
  laufende Übung und wird nicht gespeichert; danach geht es direkt mit
  „Neue Übung“ weiter.

**Vorlesen und Ton:** Jeder Text, jede Frage und der Hinweis lassen sich mit
einem 🔊-Knopf vorlesen. Der Knopf schaltet um: erster Klick spielt, zweiter
pausiert, dritter setzt an derselben Stelle fort. Unter „Einstellungen → Ton & Vorlesen" sind die
Stimme (Thorsten, Ramona oder Windows-Systemstimme mit Stimmenauswahl) sowie
getrennte Lautstärken für Vorlesen und Musik einstellbar. Die Lautstärken und
die Stimmenwahl bleiben auf dem jeweiligen Gerät; beim Vorlesen wird die
Hintergrundmusik automatisch leiser.

Die eingebetteten Stimmen wurden offline mit dem Open-Source-Werkzeug
[Piper](https://github.com/rhasspy/piper) (MIT-Lizenz) erzeugt: **Thorsten**
(de_DE-thorsten-high, Stimme von Thorsten, CC-BY) und **Ramona**
(de_DE-ramona-low). Die fertigen MP3-Dateien liegen unter
`audio/sprechtraining/`; zur Neuerzeugung dient `tools/sprechtraining-audio.cjs`.

### Weitere Funktionen

- Bonussterne, Meilensteine, Bereichsauswertung und Übekalender.
- Laufende Übezeit in der sichtbaren Runde sowie Zeit pro Bereich in der Statistik
  und im CSV-Export. Alte Runden bleiben ohne nachträgliche Zeitangabe erhalten.
- Optionaler automatischer Abgleich über ein privates GitHub-Repository
  (Zusammenführen statt Überschreiben).
- Statistikexport als CSV sowie Spielstand-Sicherung und -Wiederherstellung als
  JSON-Datei (Umzug auf einen anderen PC, „Einstellungen → Spielstand“).
- Hintergrundmusik mit eigenen Melodien für die drei Deutsch-Welten und
  synthetische Ersatzmelodie bei fehlenden Dateien.
- Ton-Einstellungen: Vorlesestimme (Thorsten/Ramona/Windows-Systemstimme) und
  getrennte Lautstärken für Vorlesen und Musik.
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

### Windows-Starter mit automatischen Updates

Im App-Ordner einmal **`Desktop-Symbol erstellen.bat`** doppelklicken. Sie
erstellt oder aktualisiert das Desktop-Symbol **Mathe üben**, das den
Update-Starter `Mathe üben.cmd` aufruft. Der Starter öffnet die App im
bestehenden Chrome-Profil. Wenn Chrome vollständig beendet war, erlaubt der
Startparameter die automatische Musikwiedergabe. Läuft Chrome bereits, kann
weiterhin ein Klick nötig sein. Ohne Chrome öffnet der Starter den
Windows-Standardbrowser. Für den bisherigen Spielstand müssen App-Pfad und
Browserprofil gleich bleiben.

Der Starter holt verfügbare Updates von `origin/main`, wenn Git installiert
ist, der Ordner auf `main` steht und die verwalteten Dateien unverändert sind.
Für ein privates Repository braucht Git einen bereits eingerichteten Zugang.
Ohne Internet, bei lokalen Änderungen oder wenn Git fehlt, öffnet der Starter
die vorhandene Version. Eine entpackte ZIP-Kopie lässt sich damit öffnen,
Updates setzen aber eine Git-Kopie voraus. Jede Update-Prüfung schreibt ihren
Verlauf in `starter.log` neben der Starterdatei; dort steht auch der Grund,
wenn kein Update geholt wurde.

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
- **Uhrzeit:** Zum Beispiel `9:25`, `9.25`, `9 Uhr 25` oder kurz `925`.

## Projektstruktur

```text
mathe-ueben/
├── index.html                  Oberfläche und Dialoge
├── style.css                   Themen, Layout, Fokus und Druckansicht
├── script.js                   Spielzustände, Bewertung, Speicher, Audio und Export
├── aufgaben-bereiche.js         Rechenaufgaben und Bonusaufgaben
├── geschichten.js              Geschichtenvorlagen und ihre Auswahl
├── sprechtraining.js           Deutsch-Sprechtraining (14 Geschichten, je 4 Fragensätze)
├── musik/
│   ├── blau.mp3
│   ├── puppenhaus.mp3
│   ├── blau.mp4
│   ├── doozie.mp3
│   ├── puppenhaus.mp4
│   ├── hunde.mp3
│   ├── hamster.mp3
│   ├── weihnachten-a.mp3
│   └── weihnachten-b.mp3
├── audio/sprechtraining/       Vorlese-MP3s der Stimmen Thorsten und Ramona
├── tools/
│   ├── sprechtraining-audio.cjs  Erzeugung der Vorlese-MP3s (Piper, offline)
│   └── welt-figuren-bilder.cjs   Freistellung der Welt-Figuren (Pillow, offline)
├── tests/
│   ├── phase1.test.cjs
│   ├── phase2.test.cjs
│   ├── phase3.test.cjs
│   ├── phase3-helper.cjs
│   ├── phase4.test.cjs
│   ├── phase4.browser.cjs
│   ├── sprechtraining.test.cjs     Deutsch-Üben, Navigation, Vorlesen und Ton-Einstellungen
│   ├── audit-math.test.cjs         Mathematik mit unabhängigen Orakeln
│   ├── audit-invariants.test.cjs   Zustand, Speicher, Tageswechsel
│   ├── audit-regressions.test.cjs  Regressionstests der Audit-Korrekturen
│   ├── audit-spielstand.test.cjs   Sichern, Laden und Zusammenführen
│   ├── audit-merge.test.cjs        Regeln des Zusammenführens
│   └── audit-sync.test.cjs         GitHub-Abgleich (nachgebildete API)
├── PHASE1.md … PHASE4.md        Entwicklungs- und Prüfberichte
├── reports/
│   ├── code-audit.md           Code-Audit mit 15 Befunden
│   └── fix-report.md           Bericht zu den Korrekturen
├── So funktioniert es.txt       Zusätzliche Bedienungsanleitung
└── README.md
```

Die Hintergrundmusik verwendet lokale MP3-Dateien. Doozies Hundehaus spielt
`musik/doozie.mp3` und verwendet bei einem Ladefehler `puppenhaus.mp3`. Die drei
Deutsch-Welten haben eigene Melodien (Hunde: `hunde.mp3`, Hamster:
`hamster.mp3`, Weihnachtswelt: `weihnachten-a.mp3` und `weihnachten-b.mp3`, die
abwechselnd laufen); beim Wechsel zwischen Mathe und Deutsch sowie beim
Weltwechsel springt die passende Melodie um.

Der **Musik-Knopf oben** pausiert die Melodie: beim nächsten Einschalten läuft
sie an derselben Stelle weiter. Nach einem Weltwechsel startet die Musik wieder
vom Anfang.

## Lokale Datenspeicherung

Das Spiel speichert seine Daten im **`localStorage` des Browsers** unter
`mathe-ueben-fuer-emma`, aktuell im Speicherformat Version 3. Gespeichert werden
unter anderem:

- Tagesaufgaben, eingegebene Antworten und aktueller Abschnitt;
- insgesamt verdiente Bonussterne und noch offene Stufengutscheine;
- Gutscheine mit ihrem aktuellen Wunsch und gegebenenfalls dem Einlösedatum;
- Rundenhistorie, Bereichssummen, Tagesfreischaltungen und Einstellungen.

Optional liegen die Zugangsdaten für die GitHub-Synchronisierung unter einem
**eigenen Schlüssel** `mathe-ueben-sync` (Repository, Dateiname, Token). Dieser
Eintrag ist **nicht** Teil des Spielstands und wird weder exportiert noch
mitgesichert; „Synchronisierung entfernen“ löscht ihn.

Die Rundenhistorie ist auf 1.000 Einträge begrenzt. Bonussterne und
Bereichssummen werden davon unabhängig erhalten. Ältere Spielstände behalten
ihre Bonussterne, Gutscheine, Runden und erfassten Übezeiten. Beim Wechsel
auf Version 3 entstehen keine Gutscheine für bereits erreichte Stufen.

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
kann gespeicherte Fortschritte entfernen.

## Sicherung, Umzug und Export

### Spielstand sichern, laden und zusammenführen

Unter **„Einstellungen“ → „Spielstand“** stehen drei Knöpfe:

- **„Spielstand sichern (Datei)“** lädt eine JSON-Datei
  (`mathe-spielstand-JJJJ-MM-TT.json`) mit dem aktuellen Sitzungsstand unter
  `daten`, dem ursprünglich gelesenen Speichertext unter `originalSpeicher` und
  einer Formatkennung. Auch beschädigter ursprünglicher Speichertext bleibt
  dadurch in der Sicherung erhalten, sofern er gelesen werden konnte.
- **„Spielstand laden (Datei)“** liest eine solche Datei wieder ein und
  **ersetzt** den vorhandenen Stand. Vor dem Ersetzen prüft das Spiel den Inhalt
  mit derselben Prüfung wie beim Start (Version, Runden, Gutscheine,
  Bereichssummen, Tagesrunde, Antworten). Ist die Datei unbrauchbar, bleibt der
  bisherige Stand unverändert und es erscheint eine Meldung. Ist sie brauchbar,
  zeigt eine Rückfrage, was enthalten ist (Bonussterne, Runden, Gutscheine, Datum);
  erst nach „Trotzdem laden“ wird geschrieben. Der bisherige Stand wird dabei
  automatisch als `mathe-vor-import-JJJJ-MM-TT.json` gesichert, danach startet
  das Spiel neu.
- **„Spielstand zusammenführen (Datei)“** vereinigt beide Stände statt zu
  ersetzen (siehe nächster Abschnitt).

Kann der Browser die Sicherung des bisherigen Standes nicht anlegen (etwa weil
Downloads blockiert sind), wird **weder** geladen **noch** zusammengeführt und
der vorhandene Stand bleibt unverändert.

Damit lässt sich ein Spielstand auf einen anderen PC übertragen: auf dem alten
Gerät sichern, die Datei mitnehmen, auf dem neuen Gerät im **gleichen Browser
und über dieselbe Adresse** laden. Ein Roh-Spielstand (der reine
`localStorage`-Inhalt) wird ebenfalls akzeptiert.

### Zusammenführen („Merge light“)

Wurde auf zwei Geräten gespielt, vereinigt „Spielstand zusammenführen“ den
eigenen Stand mit der Datei:

| Daten | Regel beim Zusammenführen |
|---|---|
| Runden der Historie | Vereinigung ohne Doppelung (Schlüssel ist der Zeitstempel), nach Zeit sortiert, neueste 1.000 bleiben |
| Bereichssummen | gleiche Rechnung je Bereich über die Runden hinweg |
| Gutscheine | Vereinigung ohne Doppelung; der zuletzt geänderte Wunsch und der Einlösestatus bleiben erhalten |
| Bonussterne | verdiente Bonussterne aus beiden Historien werden ohne Doppelung vereinigt |
| Tagesrunde | eine abgeschlossene Runde gewinnt vor einer offenen (verhindert Doppelbewertung), sonst das neuere Datum |
| Merkzettel, Ausschlusslisten | Vereinigung, gekappt |
| Bonus-Tag | neueres Datum; bei gleichem Tag `verteilt` = Maximum |

Vor dem Schreiben zeigt eine Rückfrage, was hinzukommt („+2 Runden, +9 Bonussterne,
+0 Gutscheine“); der bisherige Stand wird als `mathe-vor-merge-JJJJ-MM-TT.json`
gesichert. Enthalten beide Stände bereits alles, meldet das Spiel „nichts zu
ergänzen“ und schreibt nicht. Das Zusammenführen ist wiederholbar: dieselbe
Datei ein zweites Mal ergänzt nichts mehr.

**Grenzen:** Es ist kein echter Drei-Wege-Merge. Ein nach dem Auseinanderlaufen
auf beiden Geräten *unterschiedlich* veränderter Tagesstand kann nicht vereinigt
werden – hier gewinnt die abgeschlossene bzw. die neuere Runde.

### Automatische Synchronisierung über GitHub (optional)

Für häufige Gerätewechsel lässt sich der Abgleich automatisieren. Der Spielstand
liegt dann als **eine JSON-Datei** in einem **eigenen, privaten Repository**;
GitHub dient nur als Ablage (es wird kein Code dorthin geschrieben).

**Einrichtung (einmal pro Gerät)**

1. Privates Repository anlegen, z. B. `mathe-sync` (eine Datei `spielstand.json`
   entsteht automatisch).
2. Feingranulares Token anlegen: *Settings → Developer settings → Personal access
   tokens → Fine-grained tokens*, **nur dieses Repository**, Recht
   **Contents: Read and write**, mit Ablaufdatum.
3. Im Spiel unter **„Einstellungen“ → „Spielstand“** Repository
   (`besitzer/name`) und Token eintragen, „Speichern & prüfen“ drücken. Beim
   ersten Mal wird die Datei angelegt.

**Wann geschrieben wird**

| Auslöser | Verhalten |
|---|---|
| Start des Spiels | Datei lesen, mit dem lokalen Stand **zusammenführen**, bei Änderungen übernehmen und neu laden |
| Abschluss einer Runde, Gutschein, neues Tagesset | sofort schreiben |
| Verlassen/Ausblenden der Seite | sofort schreiben (best effort) |
| Tippen während einer Runde | höchstens einmal pro Minute (`syncVerzoegerungMs`) |
| „Jetzt synchronisieren“ | sofort lesen, zusammenführen, schreiben |

Es wird **nie einfach überschrieben**: Vor jedem Schreiben wird der Serverstand
gelesen und mit dem lokalen Stand vereinigt. Antwortet GitHub mit `409`
(gleichzeitige Änderung), wird erneut gelesen, zusammengeführt und nochmals
geschrieben (bis zu drei Versuche). Der Server enthält damit immer die
Vereinigung; die laufende Sitzung wird dabei nicht verändert (das passiert erst
beim nächsten Start).

**Sicherheit und Grenzen**

- Das Token wird **nur lokal** unter dem Schlüssel `mathe-ueben-sync` gespeichert –
  nicht im Spielstand, nicht in Sicherungsdateien und nicht im Repository. Wer
  Zugriff auf den PC hat, kann es lesen; deshalb minimaler Scope, Ablaufdatum und
  bei Verlust sofort widerrufen.
- Das Spiel bleibt offline nutzbar; Fehlversuche werden gemeldet und beim
  nächsten Auslöser wiederholt.
- Jede Synchronisierung erzeugt einen **Commit** im Repository. Deshalb der
  Mindestabstand beim Tippen.
- Der Aufruf von `api.github.com` aus dem Browser ist üblich, aber nicht
  offiziell garantiert. Beim Öffnen per Doppelklick (`file://`) kann der Browser
  die Anfrage blockieren; dann das Spiel über einen lokalen Server öffnen oder
  beim manuellen Sichern/Laden bleiben.
- GitHub ist kein zugesicherter Datenspeicher. Der Stand liegt zusätzlich immer
  lokal; die manuellen Wege (Sichern/Laden/Zusammenführen) bleiben unverändert
  verfügbar.

Bei einer Speicher- oder Konfliktmeldung erscheint zusätzlich der Knopf
**„Daten sichern“** mit derselben Datei. Bei verweigertem Lesezugriff kann der
ursprüngliche Inhalt nicht exportiert werden.

**Ohne Einrichtung arbeiten die Geräte getrennt.** Zwei Geräte führen eigene
Spielstände; Laden ersetzt, Zusammenführen vereinigt, die optionale
GitHub-Synchronisierung gleicht automatisch ab. Persönliche JSON-Sicherungen und
CSV-Exporte werden durch `.gitignore` von der Versionsverwaltung ausgeschlossen.

### Statistik als CSV

Unter **„Einstellungen“ → „Statistik“ → „Statistik herunterladen“** entsteht
eine CSV-Datei mit Runden, Bereichswerten, Bonusdaten und Gutscheinen.
Sonderzeichen, Anführungszeichen und Zeilenumbrüche werden für CSV behandelt.
Die Datei dient der Auswertung und ist kein automatisch wiederherstellbarer
Spielstand.

## Automatisierte Tests

### Regression und Syntax

Die 70 Regressionstests der Phasen 1–4 verwenden den integrierten
Node.js-Testläufer und benötigen keine zusätzlichen npm-Pakete. Dazu kommen 109
Audit-Tests: Mathematik mit unabhängigen, aus dem Aufgabentext abgeleiteten
Orakeln, Invarianten für Zustand und Speicher, Regressionstests für die
Audit-Befunde und die beiden angepassten Spielregeln (Wiederholungssterne,
Bestätigung beim Abschließen) sowie Tests für Sichern, Laden, Zusammenführen und
den GitHub-Abgleich des Spielstands. Weitere 25 Tests decken das Deutsch-Üben
(Sprechtraining), die Navigation zwischen Mathe und Deutsch, die Vorlesefunktion
und die Ton-Einstellungen ab. Node.js 24
wurde für die dokumentierten Prüfungen verwendet; zum Spielen ist Node.js
nicht erforderlich.

Im Projektverzeichnis ausführen:

```powershell
# Alle Node-Tests
node --test tests/*.test.cjs

node --check script.js
node --check aufgaben-bereiche.js
node --check geschichten.js
node --check sprechtraining.js
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
| Audit- und Regeltests | 100 bestanden (Mathematik, Invarianten, Befunde, Spielstand, Zusammenführen, GitHub-Abgleich) |
| Echte Chrome-/Edge-Prüfungen | 90 bestanden: je 45 |
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

## Versionierung und Veröffentlichung

Jeder Push auf `main` erhält sinnvollerweise eine neue Version und einen
Release-Tag:

1. Vor dem Push in `script.js` `APP_VERSION` erhöhen und `VERSION_STAND` auf
   das Datum setzen, dazu einen Eintrag in der Versionshistorie ergänzen.
2. Gewöhnliche Pushes erhöhen die letzte Zahl (1.0.6 → 1.0.7); größere neue
   Funktionen erhöhen die mittlere Zahl (1.0.6 → 1.1.0).
3. Tag in der Form `v` + Versionsnummer setzen und mit dem Commit pushen:

   ```sh
   git tag v1.0.7
   git push origin main v1.0.7
   ```

**Ausnahme:** Folgt ein weiterer Push kurz nach dem vorigen (innerhalb
weniger Minuten), wird die Version nicht erneut erhöht. Stattdessen wandert
der bestehende Tag auf den neuesten Commit:

```sh
git tag -f v1.0.7
git push --force origin v1.0.7
```

Der Desktop-Starter beachtet Tags nicht; er holt beim Start nur den Stand auf
`main`. Ältere Fassungen vor dieser Regel bleiben ohne nachgetragenen Tag.

## Versionshistorie

### 1.3.4 — Sprechtraining komplett überarbeitet, Geschichten-Bilder & einheitliche Deutsch-Startseite

- **Einheitliche Deutsch-Startseite:** Alle 6 Deutsch-Übungen (inkl. **Sprechtraining**)
  stehen gleichberechtigt als Kacheln unter der Welt-Auswahl; ein Klick auf
  *Sprechtraining* startet direkt in Schritt 1 ohne Zwischenseite und ohne
  Anleitungskästen.
- **Neues Layout & Geschichten-Pop-up:** Klickbare Breadcrumbs (*Zuhören ›
  Verstehen › Satz bilden › Erzählen*) ganz oben, kein Mini-Ziel und keine
  doppelten Schritt-Überschriften im Textblock; „📖 Andere Geschichte“ öffnet ein
  Auswahl-Pop-up mit allen 20 Geschichten (plus Zufalls-Knopf). Einheitliche
  Button-Höhen für *Zurück* und *Weiter*.
- **Längere Geschichten (6 Sätze), neue MP3s & süße Bilder:** Alle 20 Geschichten
  auf 6 Sätze ausgebaut, alle 40 Text-MP3s (Thorsten & Ramona) neu mit Piper
  erzeugt und die ersten 12 liebevollen Aquarell-Illustrationen (960×720 `.webp`
  inkl. Klick-Großansicht als Pop-up) auf Seite 1 eingebunden.
- **Interaktives Verstehen-Quiz (Schritt 2):** 5 Verständnisfragen pro Runde mit
  Radio-Buttons (Einzelauswahl) und Checkboxes (Mehrfachauswahl) sowie
  „Antworten prüfen ✓“.
- **Satz bilden ausgebaut (Schritt 3):** 4 Satz-Baukasten-Puzzles (mit `.benutzt`-
  Sperrung und „↺ Neu legen“ wie beim Satzbau-Puzzle) + 4 Sätze-verbinden-Aufgaben
  (`weil`, `deshalb`, `aber`, `danach`) pro Geschichte.
- **Einfaches Erzählen & Gesamtauswertung (Schritt 4):** Direkte 4-Stationen-Karten
  zum Abhaken (mit optionalem Verdecken) und vollständiger Abschlussübersicht über
  *Verstehen*, *Satz bilden* und *Erzählen* (246 Node-Tests grün).

### 1.3.3 — Mehr Deutsch-Übungsaufgaben (245 Einträge) & erweiterte Tests

- **Aufgabenpool der 5 Deutsch-Übungen mehr als verdoppelt** (`deutsch-uebungen.js`):
  Rechtschreib-Detektiv (30 → 70), Wortarten sortieren (24 → 60, exakt 20/20/20),
  Satzbau-Puzzle (16 → 40), Leseverständnis (6 → 15, je 5 Geschichten pro Welt)
  und Wort-Training (24 → 60, je 15 pro Kategorie).
- **Wiederholungsschutz pro Sitzung:** Aufeinanderfolgende Runden in den
  Deutsch-Übungen wiederholen keine Aufgaben unmittelbar.
- **Erweiterte Deutsch-Testsuite:** Duplikat-, Ausgewogenheits- und komplette
  UI-Durchlauftests für alle 5 Deutsch-Übungen (246 Node-Tests grün).

### 1.3.2 — Präzisere Ergebnis-Rückmeldungen

- **Genauere Lob-Stufen:** 100 % meldet nun „Alles richtig“ (statt „Fast alles
  richtig“), „Fast alles richtig“ gilt ab 90 % sowie bei genau 1 Fehler ab
  5 Aufgaben (z. B. 4/5, 5/6, 7/8, 9/10), und 0 richtige Aufgaben erhalten eine
  eigene, ehrliche Rückmeldung.
- **Einzel-Rückmeldungen & Singular/Plural:** Leere Karten im Quiz melden
  „Nicht beantwortet.“ (statt „Da war ein Fehler.“), falsche Antworten in den
  Extra-Übungen „✗ Nicht ganz:“ (statt „Fast!“), und Singular/Plural bei
  „1 neuer Bonusstern“ sowie „1 Aufgabe“ stimmt jetzt überall.

### 1.3.1 — Rechendreiecke als echtes SVG-Dreieck

- **Rechendreiecke klarer dargestellt:** Unter *Mathe → Rechenmauern & Dreiecke*
  werden Rechendreiecke nun als echtes, farbig gefülltes SVG-Dreieck mit drei
  getrennten Innenkammern und drei deutlich außerhalb der Kanten liegenden,
  runden Außenzahlen-Feldern (inkl. Kanten-Verbindungsstrichen) gezeichnet.

### 1.3.0 — Neues Gutschein-System (Wunschliste, Freitext, JPG-Export, Überraschung & Eltern-Bestätigung)

- **Neue Standard-Wunschliste** (`Gemütlicher Familien-Filmabend mit Popcorn`,
  `2 Stunden Videospiele spielen oder Lieblingsserie schauen`, `Dein
  Lieblingsessen zu Hause oder ein Besuch im Restaurant`, `Ein toller
  Familien-Ausflug nach deinem Wunsch`, `Ein kleines Geschenk selbst aussuchen`,
  `Eigener Wunsch – schreib deine Idee selbst auf!` mit Freitext). Bestehende
  Gutscheine mit früheren Standardtexten werden automatisch passend umgestellt
  (ohne Match als `Eigener Wunsch: <alter Wunsch>`).
- **Wunschliste in den Einstellungen bearbeiten:** Unter *Einstellungen →
  Gutscheine* können Eltern Wünsche hinzufügen, entfernen oder auf die
  Standardliste zurücksetzen – ganz ohne Code, inklusive Abgleich über
  GitHub-Sync und Spielstand-Merge.
- **Eigener Wunsch mit Freitext** (beim Abholen und beim Umtausch) sowie
  **„🎲 Überraschung ziehen!“** für eine zufällige Auswahl.
- **Gutschein als JPG speichern:** Jede Gutschein-Karte lässt sich direkt als
  schöne Bildkarte (`gutschein-emma-….jpg`, reines Canvas-2D, auch offline unter
  `file://`, ohne automatisches Drucken) herunterladen.
- **Eltern-Bestätigung beim Einlösen:** Zum Markieren eines Gutscheins als
  eingelöst ist ein Bestätigungshaken nötig, damit nichts versehentlich
  weggeklickt wird.

### 1.2.0 — 7 Mathe-Themen, 5 selbstständige Deutsch-Übungen & 6 neue Welt-Geschichten

- **7 frei wählbare Mathe-Themen** auf der Mathe-Startseite (unabhängig vom
  50er-Quiz): **Längen & Gewichte**, **Stellenwert & Nachbarn** (inkl. Ordnen),
  **Runden & Überschlagen**, **Analoge Uhr** (SVG-Zifferblatt), **Geometrie &
  Spiegelbilder** (Formen, Körper, Spiegelachsen, 3D-Würfelgebäude),
  **Rechenmauern & Rechendreiecke** sowie **Schriftliches Rechnen** untereinander
  mit Merkfeld. Rechenmauern gibt es zusätzlich auch in der Bonuswelt.
- **5 selbstständige Deutsch-Übungen** im Deutsch-Bereich: **Rechtschreib-Detektiv**
  (Groß/Klein, ie/i, Doppelmitlaute, ck/tz, b/p/d/t/g/k, ä/äu), **Wortarten
  sortieren** (*Namenwort (Nomen)*, *Tunwort (Verb)*, *Wiewort (Adjektiv)*),
  **Satzbau-Puzzle**, **Leseverständnis** (Geschichten aus Hunde-, Hamster- und
  Weihnachtswelt) sowie **Wort-Training** (Gegenteile, Mehrzahl, Wortfamilien,
  Vergangenheit).
- **6 neue Sprechtraining-Geschichten** (Übung 15–20, je zwei für Süße Hunde,
  Flauschige Hamster und Weihnachtswelt) inkl. neu erzeugter Offline-MP3s für
  Thorsten und Ramona.

### 1.1.9 — Leichtere Aufgaben im Zahlenraum 1000

- **Aufgaben im Zahlenraum 1000 kindgerechter abgestuft** (3. Klasse
  Volksschule): Addition und Subtraktion ohne doppelten Übertrag bzw. ohne
  doppeltes Borgen, Kettenaufgaben mit glatten Zehnern/Hundertern,
  halbschriftliche Multiplikation bis 49 × 5, Division mit Rest bis 150 sowie
  Zahlenrätsel mit Einmaleins und glatten Zehnern/Hundertern.

### 1.1.8 — Mehrtägige Quizze, freie Weltenwahl & Fehlerkorrekturen

- **Quizze über mehrere Tage fortsetzen:** Ein angefangenes 50-Aufgaben-Quiz
  bleibt auch am Folgetag (und per GitHub-Sync oder Datei-Merge über mehrere
  PCs) erhalten. Beim Abschluss zählt der Abschlusstag für Statistik und
  Bonuswelt.
- **Direkt neues Quiz starten & freie Weltenwahl:** Nach Abschluss eines Quiz
  lassen sich sofort neue Aufgaben in jeder der drei Welten starten (das
  Tageslimit von max. 5 Bonussternen bleibt bestehen).
- **Fehlerkorrekturen:** Fehlerliste zeigt wieder vollständige Rechnungen,
  Bonus-Knobelaufgaben zeigen ihre Fragetexte, Systemstimme unterstützt
  Pause/Weiter und Musik-Ducking, Vorlesen stoppt bei Schritt-/Ansichtswechsel,
  Hinweis-Vorleseknopf in Schritt 4, korrigierte Texte & neu erzeugte MP3-Clips,
  Merge/Sync-Verbesserungen sowie Layout-Anpassungen für den Zahlenraum 1000.

### 1.1.7 — Rechnen im Zahlenraum 1000

- **Plus, minus, mal und Division rechnen jetzt im Zahlenraum 1000** (statt
  100): dreistellige Summen mit Übertrag, Subtraktionen mit Borgen,
  halbschriftliche Multiplikation (zweistellig × einstellig, z. B. 94 × 4),
  Hunderterdivision (z. B. 800 ÷ 4) und Divisionen mit Rest bis ca. 900. Das
  kleine Einmaleins bleibt als Grundlage erhalten. Die Zahlenrätsel folgen dem
  neuen Zahlenraum.
- Titelzeile: „3. Klasse · Raum 1000".

### 1.1.6 — Weihnachtsmix in zwei Teilen und Pause-Weiter-Knopf

- Die **Weihnachtswelt** spielt alle 50 Lieder als zwei ~75-Minuten-Teile in
  **128 kbit/s** (bessere Qualität als die 32-Minuten-Fassung), die abwechselnd
  laufen: Teil A → Teil B → Teil A …
- Der **Musik-Knopf** pausiert jetzt: nach dem Wieder-Einschalten läuft die
  Melodie **an derselben Stelle weiter**. Nach einem Welt- oder Themenwechsel
  startet sie wieder vom Anfang.

### 1.1.5 — Weihnachtswelt spielt die ganze Liedersammlung

- Die **Weihnachtswelt** spielt jetzt alle **50 Lieder der Weihnachtsplaylist
  als einen durchgehenden Mix (~2,5 Stunden)** statt des 32-Minuten-Ausschnitts.
  Gleiches Volumen wie die anderen Welten, weiches Ausblenden am Ende.

### 1.1.4 — Längere Weihnachtsmusik

- Die **Weihnachtswelt** spielt jetzt einen ~32-minütigen Liedermix aus der
  selben Compilation statt nur dem ersten Lied (vorher 4 Minuten). Gleiches
  Volumen wie die anderen Welten, weiches Ausblenden am Ende.

### 1.1.3 — Ziehbare Deutsch-Figuren

- Die acht Figuren der Deutsch-Welt lassen sich jetzt **wie in Mathe mit der
  Maus oder dem Finger verschieben**: frei auf der Seite ablegen, mit Schwung
  werfen (sie prallen am Rand ab) und durch Antippen hüpfen lassen. Öffnet
  man eine Übung, ruhen die Figuren; zurück in der Übersicht stehen sie dort,
  wo sie abgelegt wurden.

### 1.1.2 — Spur der Deutsch-Welten und bessere Stimmprobe

- Die **Maus-Spur** folgt jetzt auch im Deutsch-Bereich der gewählten Welt:
  Hunde-Welt hinterlässt Pfoten und Knochen, Hamster-Welt Hamstergesichter
  und Sonnenblumenkerne, die Weihnachtswelt Tannenbäume und Schneeflocken
  (die Mathe-Welten behalten ihre bisherigen Motive).
- Die **Stimmprobe** unter „Einstellungen → Ton & Vorlesen" schaltet nun wie
  der Vorlese-Knopf zwischen Play, Pause und Weiter um (zweiter Klick
  pausiert, dritter setzt an derselben Stelle fort). Beim Wechseln der
  Stimme stoppt eine laufende Probe und die nächste startet in der neuen
  Stimme.
- 27 Tests (`tests/sprechtraining.test.cjs`), Suitensumme 212.

### 1.1.1 — Vorlese-Knopf mit Pause und Zurück-Blättern

- Der 🔊-Vorlese-Knopf ist jetzt ein **Wiedergabe-Schalter**: erster Klick
  startet das Vorlesen, zweiter pausiert, dritter setzt **an derselben
  Stelle** fort (statt alles neu zu starten). Während der Pause läuft die
  Musik wieder normal weiter, beim Fortsetzen wird sie wieder leiser.
- **„◀ Zurück“ auch in Deutsch üben:** wie in Mathe blättert ein Zurück-
  Knopf in der Übung einen Schritt zurück (Verstehen → Zuhören usw.) und
  bleibt auch neben „Übung abschließen ✓“ verfügbar. Ausgewählte
  Bewertungspunkte überstehen das Hin- und Zurblättern.
- Weltname „Süße Hamster“ → **„Flauschige Hamster“**.
- 26 Tests (`tests/sprechtraining.test.cjs`), Suitensumme 210.

### 1.1.0 — Deutsch-Sprechtraining, Vorlesen und Ton-Einstellungen

- Neuer Bereich **„Deutsch üben“** mit **Umschalter „Mathe / Deutsch“** im
  oberen Seitenbereich; der Startseite-Knopf öffnet stets die Startseite des
  aktiven Bereichs, der Umschalter wechselt in beide Richtungen.
  Die Deutsch-Startseite ist wie die Mathe-Startseite aufgebaut (Maskottchen,
  Welt-Auswahl und großer Los-Knopf) und bietet zusätzlich einen Kasten zum
  direkten Aussuchen einer Geschichte.
- **Endlos üben statt Tagesplan:** 14 Geschichten zum mündlichen Erzählen
  (Zuhören, Verstehen, Satz bilden, Erzählen) mit Bewertung durch die
  Begleitung — wichtige Punkte ankreuzen und vier Kriterien (Reihenfolge,
  Grammatik, Aussprache, Zusammengehörigkeit) in je drei Stufen. Keine
  Freischaltung und keine Tagesfolge: „Los geht's!“ wählt eine zufällige
  Geschichte und darin einen von **vier Fragensätzen je Geschichte** (der
  Satz der vorigen Runde wird vermieden); die Bewertung bleibt ungespeichert.
- **Drei Welten mit je acht süßen Figuren** (animiert): Süße Hunde (Wuffi,
  Bello, Flocki, Mopsi, Coco, Schnuffel, Struppi, Bella), Flauschige Hamster
  (Knuspel, Wommel, Pip, Bommel, Nussi, Flauschi, Krummel, Zucker) und
  Weihnachtswelt (Weihnachtsmann, Christkind, Rudolph, Elfe, Wichtel,
  Schneemann, Griesgram, Lebkuchenmann). Welt-Auswahl in der Übersicht,
  Begleitfigur in jeder Übung und Lob der Welt auf der Abschlusskarte. Die
  Wahl bleibt gerätebezogen gespeichert (Feld `deutschWelt`, im Merge gewinnt
  der eigene Stand; die entfernte Welt „Legami-Freunde“ fällt auf die
  Hundewelt zurück).
- Bewertung mit kurzer Einschätzung (Stärken, „Nächstes Mal drauf achten“).
  Inhalte in `sprechtraining.js`.
- **Vorlesefunktion** für alle Texte und Fragen mit eingebetteten Offline-
  Stimmen **Thorsten** und **Ramona** (erzeugt mit Piper, siehe
  „Deutsch-Sprechtraining“) sowie wahlweise der Windows-Systemstimme mit
  Stimmenauswahl. Beim Vorlesen wird die Musik automatisch leiser; Wechsel
  des Bildschirms stoppt die Sprachausgabe.
- Neuer Einstellungen-Reiter **„Ton & Vorlesen“**: Stimmenwahl und getrennte
  Lautstärkeregler für Vorlesen und Musik (gerätebezogen, im Merge bleibt der
  eigene Stand). Standard-Musiklautstärke 30 % passend zur Regler-Stufe.
- Spielstand um die Felder `deutschWelt`, `vorleseStimme`,
  `vorleseSystemStimme`, `stimmeLautstaerke` und `musikLautstaerke` erweitert
  (Speicherformat bleibt Version 3); `deutschWelt` wird im Merge wie die
  Ton-Einstellungen behandelt (der eigene Stand gewinnt). Der Fortschritt des
  Deutsch-Übens wird bewusst nicht gespeichert.
- 25 aktualisierte Tests (`tests/sprechtraining.test.cjs`), Suitensumme 204.

### 1.0.6 — Version-Reiter und korrigierte Befunde

- Neuer Reiter **„Version"** in den Einstellungen: zeigt Programmversion und
  Stand, das Speicherformat und die Browserumgebung – zum Gegenprüfen, ob ein
  Gerät den neuesten Stand hat. Verweist auch auf `starter.log`.
- Der Desktop-Starter protokolliert jede Update-Prüfung in `starter.log`
  neben der Starterdatei (auch der Grund, wenn kein Update geholt wurde).
- Korrigierte Befunde der Codeanalyse: „Neue Aufgaben" startet nach
  Mitternacht keine neue Bonusrunde, das Zusammenführen behält die neuesten
  Aufgaben-Ausschlüsse und das weitergebrachte Bonus-Set, die
  Statistik-Zusammenfassung zählt alte Runden ohne Quiztyp, Runden zählen für
  den Tag, zu dem sie gehören, korrigierte Texte in zwei Rechengeschichten und
  im CSV-Export, der Sternenregen schneidet die langsamsten Tropfen nicht mehr.

### 1.0.5 — automatische Synchronisierung über GitHub (optional)

- Neuer Abschnitt im Reiter „Spielstand“: Repository (`besitzer/name`) und
  feingranulares Token eintragen, „Speichern & prüfen“, „Jetzt synchronisieren“,
  „Synchronisierung entfernen“.
- **Start:** Datei holen, mit dem lokalen Stand zusammenführen, bei Änderungen
  übernehmen und neu laden. **Schreiben:** sofort nach Abschluss/Gutschein/
  neuem Tagesset und beim Verlassen, beim Tippen höchstens einmal pro Minute.
- Vor jedem Schreiben wird der Serverstand erneut gelesen und vereinigt; `409`
  wird durch erneutes Zusammenführen gelöst. Der Server verliert nie Daten.
- Token nur lokal unter `mathe-ueben-sync`, nicht im Spielstand und nicht in
  Sicherungsdateien. Ohne Einrichtung bleibt alles wie bisher.

### 1.0.4 — Spielstände zusammenführen („Merge light“)

- Neuer Knopf **„Spielstand zusammenführen (Datei)“** im Reiter „Spielstand“.
- Runden und Gutscheine werden vereinigt (keine Doppelung, nichts geht verloren);
  Lebenszeitsterne und Bereichssummen werden aus der vereinigten Historie exakt
  berechnet, der nicht mehr sichtbare Rest wird als Maximum übernommen.
- Bonusguthaben bleibt konservativ das Maximum; die Tagesrunde gewinnt
  abgeschlossen vor offen bzw. nach Datum.
- Rückfrage mit Vorschau („+2 Runden, +9 Sterne …“), automatische Sicherung als
  `mathe-vor-merge-…json`, Neustart danach.
- Kein Drei-Wege-Merge; weiterhin **keine** automatische Synchronisierung.

### 1.0.3 — Spielstand sichern und laden (Umzug auf einen anderen PC)

- Neuer Reiter **„Einstellungen → Spielstand“** mit „Spielstand sichern
  (Datei)“ und „Spielstand laden (Datei)“.
- Import prüft die Datei mit derselben Logik wie der Start, fragt vor dem
  Ersetzen nach, sichert den bisherigen Stand automatisch als
  `mathe-vor-import-…json` und startet danach neu.
- Rohe `localStorage`-Spielstände und Sicherungsdateien werden gleichermaßen
  akzeptiert; Spielstände der Versionen 1 und 2 werden weiterhin übernommen.
- Weiterhin **keine** automatische Synchronisierung zwischen Geräten.

### 1.0.2 — angepasste Spielregeln

- **Wiederholungsrunden:** genau ein Stern je richtig gelöster Aufgabe, falsche
  Aufgaben geben keinen Stern; keine Obergrenze. Die frühere Regel „ein Stern je
  zwei Aufgaben“ entfällt. Reguläre Tagesrunden bleiben unverändert, bereits
  gespeicherte Sterne werden nicht rückwirkend verändert.
- **Abschließen:** Sobald mindestens eine Aufgabe unbeantwortet ist, fragt das
  Spiel vor dem endgültigen Abschluss nach („Weiter üben“ / „Trotzdem abgeben“,
  Standardfokus auf „Weiter üben“, Escape bricht ab). Bei 50 von 50 Antworten
  wird direkt abgeschlossen.

### 1.0.1 — Korrekturen nach dem Code-Audit

Behebt die 15 Befunde aus [reports/code-audit.md](reports/code-audit.md);
Einzelheiten und Testbilanz stehen im [Fix-Bericht](reports/fix-report.md).
Kurzfassung:

- Wiederholungsrunden vergeben höchstens einen Stern je zwei Aufgaben.
  *(in 1.0.2 ersetzt: ein Stern je richtig gelöster Aufgabe, ohne Obergrenze)*
- Vor dem Abgeben einer Runde mit offenen Aufgaben und vor dem Verwerfen der
  Runde des Vortags fragt das Spiel nach.
  *(in 1.0.2 verschärft: Rückfrage schon bei einer einzigen offenen Aufgabe)*
- Ein außerhalb des Spiels geleerter Speicher sperrt das Schreiben nicht mehr;
  gültiges JSON ohne bekannte Felder wird nicht mehr überschrieben.
- Anzeige- und Textfehler behoben (Rest/Lücke in der Übe-Liste, fehlende Sterne,
  Bonusrunde auf der Startseite, Kalender, Tageskontingent, Merkzettel).
- Zeitangaben sind auch ohne Trennzeichen eingebbar; ein zweites Bewerten einer
  bereits abgeschlossenen Tagesrunde ist ausgeschlossen.

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
