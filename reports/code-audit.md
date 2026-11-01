# Code-Audit: „Mathe üben für Emma“ (mathe-ueben)

> **Nachtrag (1. November 2026):** Alle 15 Befunde sind behoben. Die damaligen
> Reproduktionstests wurden in `tests/audit-regressions.test.cjs` überführt und
> prüfen jetzt das korrigierte Verhalten. Einzelheiten, Testbilanz und
> Commit-Stand stehen in [fix-report.md](fix-report.md). Dieser Bericht
> beschreibt weiterhin den analysierten Ausgangsstand.

**Auditdatum:** 1. November 2026 · **Zeitzone:** Europe/Vienna
**Prüfgegenstand:** statische und dynamische Analyse der Browser-Anwendung
**Ergebnis:** 15 nachgewiesene Fehler (0 Critical, 0 High, 3 Medium, 12 Low); Mathematik und Speicherschutz ohne Befund.

---

## 1. Executive Summary

Die Anwendung ist für ein privates Lernspiel außergewöhnlich sorgfältig gebaut. Die
**mathematische Logik ist fehlerfrei**: 18.000 zufällig erzeugte Rechenkarten,
1.800 Bonusaufgaben, 15.000 Rechengeschichten und **alle 93.308 zulässigen
Zahlenkombinationen der 47 Geschichtenvorlagen** (263.298 Einzelprüfungen inklusive
Uhrzeitvarianten) wurden mit **unabhängigen, aus dem angezeigten Aufgabentext
abgeleiteten Orakeln** geprüft. Es gab keine einzige Abweichung zwischen
Aufgabenstellung, hinterlegter Lösung und Anzeige. Auch die
`localStorage`-Behandlung ist defensiv: beschädigtes JSON, zukünftige
Speicherversionen, Lesefehler, Schreibfehler, veraltete Fensterstände und
manipulierte Tagesrunden werden erkannt, ohne den Originaltext zu überschreiben.

Die Schwachstellen liegen **nicht in der Mathematik, sondern in der Spielmechanik,
in Randfällen der Zustandsführung und in der Anzeige**:

| Schweregrad | Anzahl | Kurzfassung |
|---|---:|---|
| Critical | 0 | – |
| High | 0 | – |
| Medium | 3 | Stern-Inflation durch Wiederholungsrunden · endgültiges „Fertig“ ohne Rückfrage · dauerhafte Schreibsperre mit falscher Ursache |
| Low | 12 | Anzeige-/Textfehler, Konfigurationsinkonsistenzen, Randfälle bei Tageswechsel, Bonusrunde, Kalender, Merkzettel und Datenprüfung |

**Gesamtbewertung**

| Kriterium | Bewertung |
|---|---|
| Mathematische Korrektheit | **sehr gut** – keine Abweichung in 263.298 + 18.000 + 1.800 geprüften Fällen |
| Konsistenz Aufgabe ↔ Antwort ↔ Anzeige | **sehr gut** – vollständig textbasiert gegengeprüft |
| Datenintegrität (Sterne, Gutscheine, Historie) | **gut** – Lebenszeitzähler und Gutscheine überstehen Neuladen, Migration und die 1.000-Zeilen-Grenze; eine Lücke bei unbekanntem Speicherinhalt (BEFUND-14) |
| Zuverlässigkeit / Zustandsführung | **gut mit Einschränkung** – keine ungültigen Zustände gefunden, aber zwei Abläufe mit unbeabsichtigter, nicht rückholbarer Wirkung (BEFUND-1, BEFUND-2) |
| Sicherheit | **gut** – kein `innerHTML`, keine dynamischen Skripte, keine externen Abhängigkeiten außer dem YouTube-iframe; CSV-Formelschutz vorhanden |
| Barrierefreiheit | **gut** – Dialoge, Fokusführung, `inert`, Live-Region und Tastaturbedienung funktionieren in echten Browsern; Zeitfelder haben aber ein Eingabeproblem (BEFUND-12) |

Es wurden **keine Anwendungsdateien verändert**, keine Commits, Pushes oder Pull
Requests erzeugt und keine realen Spielstände angefasst. Neu sind ausschließlich
drei Audit-Testdateien und dieser Bericht.

---

## 2. Analysierter Stand und Ausführungsumgebung

### Repository

| Merkmal | Wert |
|---|---|
| Repository | `https://github.com/kaichri/mathe-ueben` |
| Branch | `main` (folgt `origin/main`) |
| **Analysierter Commit** | **`7c46ebacf69f2f8efcd58ed60fd617b161743882`** |
| Commit-Meldung | `Release v1.0.0 - Mathe Lernspiel` |
| Commit-Datum | So 1. Nov 2026, 20:04:19 +0100 |
| Arbeitsbaum vor der Prüfung | sauber (`git status` leer) |
| Arbeitsbaum nach der Prüfung | nur neue, untracked Audit-Dateien: `tests/audit-math.test.cjs`, `tests/audit-invariants.test.cjs`, `tests/audit-repros.test.cjs`, `reports/code-audit.md` |

Der Klon erfolgte frisch in das leere Arbeitsverzeichnis `D:\mathe-ueben`
(`git clone … .`), also kein Update eines vorhandenen Standes und keine Gefahr
für lokale Änderungen.

### Umgebung

| Komponente | Version / Wert |
|---|---|
| Betriebssystem | Windows (Arbeitsverzeichnis `D:\mathe-ueben`) |
| Node.js | v25.7.0 |
| Git | 2.52.0.windows.1 |
| Chrome | 156.0.8078.74 |
| Edge | 156.0.4314.58 |
| Playwright | 1.62.1 (gebündeltes Laufzeitpaket, über `NODE_PATH`) |
| Zeitzone des Rechners | Europe/Vienna |

### Gelesene Dokumentation

`README.md`, `PHASE1.md` … `PHASE4.md`, `So funktioniert es.txt` wurden vollständig
gelesen und als Spezifikation verwendet, aber **nicht als Korrektheitsbeweis**
behandelt. Jede dort behauptete Eigenschaft wurde am Quellcode bzw. durch Tests
überprüft; die Abweichungen sind unten belegt.

### Umfang der Quellcodeanalyse

Vollständig gelesen und in den Zusammenhängen geprüft:

| Datei | Zeilen | Inhalt |
|---|---:|---|
| `script.js` | 2.736 | Spielzustände, Bewertung, Speicher, Audio, Export, UI-Aufbau |
| `aufgaben-bereiche.js` | 763 | Rechenaufgaben und Knobelaufgaben |
| `geschichten.js` | 1.167 | 47 Geschichtenvorlagen, Figuren, Auswahl |
| `index.html` | 289 | Oberfläche und Dialoge |
| `style.css` | 1.147 | Themen, Layout, Fokus, Druckansicht |
| `videos.js` | 39 | Video-Liste |
| `tests/*` (6 Dateien) | 1.578 | vorhandene Regressionstests und Browserprüfung |

---

## 3. Ausgeführte Prüfungen und Testbilanz

### 3.1 Syntaxprüfung (alle JavaScript-Dateien)

```
node --check script.js                 OK
node --check aufgaben-bereiche.js      OK
node --check geschichten.js            OK
node --check videos.js                 OK
node --check tests/phase1.test.cjs     OK
node --check tests/phase2.test.cjs     OK
node --check tests/phase3.test.cjs     OK
node --check tests/phase3-helper.cjs   OK
node --check tests/phase4.test.cjs     OK
node --check tests/phase4.browser.cjs  OK
```

### 3.2 Vorhandene Regressionstests

```powershell
node --test tests/phase1.test.cjs tests/phase2.test.cjs tests/phase3.test.cjs tests/phase4.test.cjs
```

**Ergebnis: 69 von 69 bestanden** (14 + 25 + 25 + 5), 0 fehlgeschlagen.

> **Hinweis zur Ausführung:** Der Befehl in der Form `node --test …` startet
> Kindprozesse und scheitert in der DSH-Sandbox mit `spawn EPERM` (dokumentierte
> Grenze, kein Testfehler). Ausgeführt wurde deshalb
> `node --test --test-isolation=none …`; die Tests laufen dabei im selben Prozess.
> Inhalt und Aussagekraft sind identisch.

### 3.3 Vorhandene Playwright-Browsertests

```powershell
node tests/phase4.browser.cjs      # mit NODE_PATH auf das gebündelte Playwright
```

**Ergebnis: 84 von 84 Prüfungen bestanden** – 42 in Chrome, 42 in Edge, 0 fehlgeschlagen.
Ergebnisdatei: `C:\Users\ccckk\AppData\Local\Temp\mathe-audit-browser\browser-results.json`.

Enthalten waren unter anderem: Startseite und Themenwahl, unterbrochene Runde mit
Neuladen, alle sechs Abschnitte, 50 richtige Antworten, Doppelklick auf „Fertig“,
Bonusrunde mit Tagesdeckel, Gutscheinablauf, CSV- und JSON-Download, fünf
Viewports (375×812 bis 1920×1080), Zwei-Fenster-Konflikt, echte MP3-Dekodierung,
Autoplay-Ablehnung mit erneutem Versuch, Doozie-Rückfall, MP4-Dekodierung,
Kontraststichproben, Touch-Emulation, reine Tastaturbedienung und `file://`-Start.

**Nicht durchgeführt** (ehrlich als nicht bestanden gewertet): Firefox (keine
Binärdatei vorhanden), Safari/WebKit (unter Windows nicht verfügbar), echte
Mobilgeräte, echter Screenreader.

### 3.4 Neue Audit-Tests

| Datei | Tests | Ergebnis | Zweck |
|---|---:|---|---|
| `tests/audit-math.test.cjs` | 9 | **9 bestanden** | Mathematik, Generatoren, Text↔Lösung-Konsistenz |
| `tests/audit-invariants.test.cjs` | 14 | **14 bestanden** | Spielzustand, Speicher, Tageswechsel, Invarianten |
| `tests/audit-repros.test.cjs` | 15 | **15 fehlgeschlagen (absichtlich)** | Je ein nachgewiesener Fehler |
| **Summe Audit** | **38** | **23 grün / 15 rot** | |

**Gesamtbilanz aller Tests:** 107 Tests, **92 bestanden**, **15 fehlgeschlagen** –
die 15 Fehlschläge sind genau die 15 nachgewiesenen Fehler (BEFUND-1 … BEFUND-15).

Die Reproduktionstests kodieren bewusst das **erwartete, korrekte** Verhalten und
schlagen auf dem geprüften Stand fehl. Nach einer Korrektur müssen sie grün
werden; sie sind damit zugleich Abnahmekriterien.

### 3.5 Unabhängigkeit der Prüforakel

Die Projekt-Tests prüfen Geschichten mit einer **pro Vorlage fest hinterlegten
Formel**. Übernimmt man einen Fehler aus dem Generator in die Formel, bleibt der
Test grün. Die Audit-Tests gehen deshalb anders vor:

* **Rechenaufgaben:** Die angezeigte Rechnung (`darstellung`) wird mit einem
  eigenen Ausdrucksauswerter nachgerechnet; bei Lückenaufgaben wird die Lösung in
  das `□` eingesetzt und die Gleichung geprüft; bei Divisionsrest wird
  `Dividend = Divisor · Quotient + Rest` mit `0 < Rest < Divisor` geprüft.
* **Bonusaufgaben:** Die erwartete Antwort wird **aus dem Aufgabentext** gelesen
  (z. B. „Die Hälfte davon ist 18“ → 36, „Zwei Seiten sind 7 m und 11 m, der Zaun
  ist 36 m“ → 18) und mit der hinterlegten Lösung verglichen. Alle 14 Knobeltypen
  werden dabei ohne Kenntnis des Generatorzweigs ausgewertet.
* **Rechengeschichten:** Die erwartete Antwort wird aus den **im Text gedruckten
  Zahlen** berechnet (inklusive Cent-Aufteilung und Uhrzeitformaten). Damit
  fallen sowohl Rechenfehler als auch Text-/Anzeigefehler auf.

---

## 4. Befunde nach Schweregrad

Übersicht:

| ID | Schwere | Kurzbeschreibung | Datei | Zeilen |
|---|---|---|---|---|
| BEFUND-1 | Medium | Wiederholungsrunde mit 1 Aufgabe vergibt 5 Sterne | `script.js` | 1205, 1381-1387, 1406-1436, 1511-1522 |
| BEFUND-2 | Medium | „Fertig“ schließt fast leere Runde ohne Rückfrage endgültig ab | `script.js` | 827-829, 855, 1157-1219, 2640-2647 |
| BEFUND-3 | Medium | Extern geänderter Speicher sperrt Schreiben dauerhaft und meldet falsche Ursache | `script.js` | 258-285 (bes. 271-276) |
| BEFUND-4 | Low | Fehlerliste zeigt falsche „Lösungen“ bei Rest und Lücke | `script.js` | 1490-1509 |
| BEFUND-5 | Low | Bonusrunde ohne Tageskontingent über „Neue Aufgaben“ startbar | `script.js` | 699-706, 843-864, 2653-2663 |
| BEFUND-6 | Low | Statistikzeile ohne `sterne` zeigt „★ undefined“ | `script.js` | 1824-1827 |
| BEFUND-7 | Low | Tag mit nur einer Bonusrunde gilt im Kalender als „nicht geübt“ | `script.js` | 1967-1988 |
| BEFUND-8 | Low | `bonusSterneProTag` wird in zwei Meldungen hart mit „3“ überschrieben | `script.js` | 1356-1365, 2551-2553 |
| BEFUND-9 | Low | Geschichten-Merkzettel sammelt Duplikate | `script.js` | 1438-1445 |
| BEFUND-10 | Low | Startseite meldet für Bonusrunden „0 Sterne“ | `script.js` | 1324-1327, 2604-2608 |
| BEFUND-11 | Low | Tageswechsel verwirft angefangene Runde ohne Hinweis | `script.js` | 644-660 |
| BEFUND-12 | Low (Risiko) | Zeitfeld fordert Zifferntastatur an, Parser verlangt Trennzeichen | `script.js` | 396-413, 900 |
| BEFUND-13 | Low (latent) | Keine Idempotenzsicherung gegen erneute Bewertung einer fertigen Runde | `script.js` | 1157-1219 |
| BEFUND-14 | Low | Gültiges JSON ohne bekannte Felder wird überschrieben | `script.js` | 89-101, 202-257 |
| BEFUND-15 | Low | Grammatikfehler „Noch 1 richtige Aufgaben“ | `script.js` | 1475-1478 |

---

### BEFUND-1 — Medium · Wiederholungsrunde mit einer Aufgabe vergibt 5 Sterne

**Ort:** `script.js:1205` (`sterne = sterneFuerAnteil(richtig / gesamt)`),
`script.js:1381-1387` (Schwellen), `script.js:1406-1436` (`speichernRunde`),
`script.js:1511-1522` (Wiederholungsknopf).

**Ursache.** Die Sternzahl hängt nur vom **Anteil** richtiger Antworten ab, nicht
von der Aufgabenzahl der Runde. Der Knopf „Nur diese Aufgaben noch einmal üben“
baut eine Runde, die ausschließlich die falschen Karten enthält
(`script.js:1514-1519`). Besteht diese Runde aus genau einer Karte, ist der Anteil
1,0 → `sterneFuerAnteil` liefert 5 Sterne. Dieselbe volle Belohnung erhält ein
Kind für eine perfekte Tagesrunde mit 50 Aufgaben.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-1“)

1. Tagesrunde starten, 49 von 50 Aufgaben richtig beantworten, „Fertig“ drücken.
   → 49/50 = 98 % → **5 Sterne** (`sterneGesamt` = 5).
2. In der Zusammenfassung „Nur diese Aufgaben noch einmal üben“ drücken.
   → Runde mit genau 1 Aufgabe.
3. Diese eine Aufgabe richtig beantworten und prüfen.

**Erwartet:** Eine einzelne Wiederholungsaufgabe darf nicht dieselbe Höchstzahl
erreichen wie eine perfekte Tagesrunde.
**Tatsächlich:** Die Wiederholungsrunde vergibt **5 Sterne**, `sterneGesamt` steht
danach auf **10**, die Historie enthält zwei Zeilen (49/50 und 1/1).
Der Effekt ist kumulierbar: Da nach jeder Wiederholung erneut nur die Fehler
angeboten werden, sind pro Tag mehrere volle Belohnungen erreichbar; mit „Neuer
Versuch“ beliebig oft.

**Auswirkung.** Die Meilensteine (10/25/50/100/200 Sterne,
`script.js:39-45`) und der Lebenszeitzähler verlieren ihre Aussagekraft. Die
Regel „ein bis fünf Sterne nach Anteil“ ist in README und
`So funktioniert es.txt` so dokumentiert – das **Ergebnis** ist dennoch
offensichtlich unbeabsichtigt.

**Empfohlene Lösung.** Sternzahl der Wiederholungsrunde an der Aufgabenzahl
begrenzen, z. B.

```js
const gewicht = runde.bereichsArt === "uebungen"
  ? Math.min(1, gesamt / 10)          // 1 Aufgabe -> höchstens 1 Stern
  : 1;
const sterne = Math.max(1, Math.round(sterneFuerAnteil(richtig / gesamt) * gewicht));
```

Alternativ eine eigene Tabelle für Wiederholungsrunden (z. B. „1 Stern pro 2
richtige, höchstens 3“) und zusätzlich die Zahl der Wiederholungsrunden pro
Tag begrenzen. Die Regel sollte in README und `So funktioniert es.txt` ergänzt
werden.

---

### BEFUND-2 — Medium · „Fertig“ schließt eine fast leere Runde ohne Rückfrage endgültig ab

**Ort:** `script.js:822-831` (Abschnittsleiste springt direkt in jeden Bereich),
`script.js:855` (Knopftext wird ab dem letzten Abschnitt zu „Fertig ✓“),
`script.js:1157-1219` (`pruefeRunde` prüft nicht, wie viel beantwortet ist),
`script.js:2640-2647` (Klickbehandlung des Knopfes).

**Ursache.** Die Abschnittsleiste ist ab dem ersten Abschnitt bedienbar und
erlaubt den Sprung in den letzten Bereich. Dort heißt der Prüfknopf sofort
„Fertig ✓“; ein Klick bewertet die **gesamte** Runde. Es gibt keine Prüfung, ob
alle (oder wenigstens die meisten) Aufgaben beantwortet sind, und – anders als
bei „Neuer Versuch“ – keine Rückfrage. Anschließend sperrt `sperreEingaben()`
(`script.js:835-841`) alle Felder; die restlichen 49 Antworten können nicht mehr
eingegeben werden.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-2“)

1. Tagesrunde starten.
2. In genau **eine** Aufgabe etwas eintragen.
3. In der Abschnittsleiste auf „Geschichten“ (letzter Punkt) klicken.
4. „Fertig ✓“ drücken.

**Erwartet:** Rückfrage (oder Ablehnung) bei offensichtlich unvollständiger Runde,
zumindest ein Hinweis auf die 49 offenen Aufgaben.
**Tatsächlich:** Kein Dialog. `fertigAnsicht === true`, alle Eingabefelder sind
`disabled`, die Zusammenfassung meldet „0 von 50 Aufgaben richtig“. Die Runde ist
für den Tag abgeschlossen; nur „Neuer Versuch“ (mit Rückfrage) erzeugt ein neues
Set und ersetzt dabei die bisherigen Antworten.

**Auswirkung.** Ein Fehlklick (zwei Klicks) beendet die Tagesübung vorzeitig und
unwiderruflich. Das widerspricht der sonst konsequenten Absicherung
destruktiver Aktionen („Neuer Versuch“ fragt nach) und kostet die Tagesrunde.

**Empfohlene Lösung.** Vor der Bewertung einer **Tagesrunde** die Zahl der
beantworteten Karten bestimmen (die Daten liegen bereits vor:
`aktualisiereFortschritt()` zählt sie) und bei einem Anteil unter z. B. 80 %
denselben Dialogmechanismus wie bei „Neuer Versuch“ verwenden:

```js
const offen = runde.karten.filter(k => !istBeantwortet(k)).length;
if (istTagesRunde() && offen > 0 && !bestaetigt) {
  zeigeRueckfrage("Noch " + offen + " Aufgaben sind offen. Trotzdem abgeben?", () => pruefeRunde());
  return;
}
```

Alternativ den Knopf im letzten Abschnitt erst nach vollständiger Bearbeitung
aktivieren und den Rückweg über „Zurück“ offen halten.

---

### BEFUND-3 — Medium · Extern geänderter Speicher sperrt das Schreiben dauerhaft und nennt die falsche Ursache

**Ort:** `script.js:258-285`, Kern in `script.js:271-276`.

**Ursache.** `schreibe()` vergleicht vor jedem Schreiben
`localStorage.getItem(SPEICHER_NAME)` mit dem zuletzt **selbst** geschriebenen
Stand (`letzterStand`). Jede Abweichung wird als „ein anderes Fenster hat
weitergespielt“ interpretiert, setzt `gesperrt = true` und blockiert damit **jedes
weitere Speichern für den Rest der Sitzung**. Das trifft auch Fälle, in denen
der Speicher gar nicht von einem zweiten Spielfenster stammt: Löschen der
Website-Daten über die Browsereinstellungen, eine Erweiterung, eine
Speicherbereinigung des Browsers oder ein auf `null` gesetzter Eintrag. Die
Meldung nennt dann eine Ursache, die es nicht gibt.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-3“)

1. Tagesrunde starten, drei Antworten eingeben (wird gespeichert).
2. In einem zweiten Tab der gleichen Seite die Website-Daten löschen – im Test
   simuliert durch `localStorage.setItem(SPEICHER_NAME, "")`.
3. Im ersten Fenster weiterspielen (z. B. Modus wechseln) und speichern lassen.

**Erwartet:** Das Spiel erkennt „Speicher wurde außerhalb dieses Fensters
geleert/geändert“, speichert weiter (neuer Grundstand) oder weist sachlich
korrekt darauf hin.
**Tatsächlich:** Meldung „In einem anderen Fenster wurde weitergespielt …“,
`gesperrt = true`, der Speicher bleibt leer. Alle Fortschritte dieser Sitzung
(inklusive verdienter Sterne) sind beim nächsten Neuladen verloren; der Hinweis
rät zum Sichern, was nur den Sitzungsstand rettet.

**Auswirkung.** Datenverlust der laufenden Sitzung in einem seltenen, aber realen
Fall – verbunden mit einer irreführenden Diagnose. Die Wahrscheinlichkeit ist
gering (externe Speicheränderung während einer offenen Sitzung), die Folge dafür
endgültig.

**Empfohlene Lösung.** Den Fall „Speicher leer/`null`“ vom echten Konflikt
trennen:

```js
const aktuell = window.localStorage.getItem(SPEICHER_NAME);
if (aktuell === null) {                 // Speicher wurde geleert
  letzterStand = null;                   // neu aufsetzen, kein Konflikt
} else if (aktuell !== letzterStand) {
  /* echter Mehrfenster-Konflikt */
}
```

Zusätzlich für den Konfliktfall eine bewusste Entscheidung anbieten
(„Meinen Stand speichern“ / „Neueren Stand übernehmen“) statt einer dauerhaften
Sperre und die Meldung auf die tatsächliche Ursache abstimmen.

---

### BEFUND-4 — Low · Fehlerliste zeigt falsche „Lösungen“ bei Divisionsrest und Lückenaufgaben

**Ort:** `script.js:1490-1509`, insbesondere `script.js:1499-1501`.

**Ursache.** Die Liste „Das kannst du noch üben“ baut ihre Zeilen selbst aus
`(feld.darstellung || karte.darstellung) + " " + feld.anzeige` und ignoriert
`feld.beschriftung`. Für Divisionsrest-Karten entstehen dadurch zwei Zeilen mit
derselben Division und unterschiedlichem Ergebnis; für Lückenaufgaben wird die
Lösung ohne Bezug an den Aufgabentext gehängt. Die Einzelkorrektur auf der Karte
verwendet dagegen korrekt `loesungsText()` (`script.js:1367-1379`).

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-4“)
Eine Runde mit einer Restaufgabe `54 ÷ 7 =` (Lösung 7 Rest 5) und einer
Lückenaufgabe `□ + 27 = 85` (Lösung 58) falsch beantworten, dann die
Zusammenfassung ansehen.

**Erwartet:** „54 ÷ 7 = 7 Rest 5“ und „□ = 58“.
**Tatsächlich:** `54 ÷ 7 = 7   54 ÷ 7 = 5   □ + 27 = 85 58`

**Auswirkung.** Pädagogisch kontraproduktiv: Das Kind liest für dieselbe Division
zwei verschiedene Ergebnisse als „Lösung“. Die Einzelkorrektur auf der Karte ist
gleichzeitig richtig – die Anzeige widerspricht sich selbst.

**Empfohlene Lösung.** Die vorhandene Funktion wiederverwenden:

```js
const zeilen = karte.felder.map(feld => loesungsText(karte, feld));
// ergibt "54 ÷ 7 = 7" + "Rest 5" bzw. "□ = 58"
```

---

### BEFUND-5 — Low · Bonusrunde ohne Tageskontingent über „Neue Aufgaben“ startbar

**Ort:** `script.js:699-706` (`anzahl = Math.min(Math.max(1, offen), 3)`),
`script.js:843-864` (Knopfleiste im Bonusmodus), `script.js:2660-2662`
(Klickbehandlung von „Neue Aufgaben“).

**Ursache.** Auf der Startseite werden die Bonuswelt-Knöpfe bei
`bonusPlaetzeHeute() === 0` korrekt deaktiviert (`script.js:2542-2565`). Im
laufenden Bonusbereich bleibt der Knopf „Neue Aufgaben“ jedoch sichtbar und
aktiv; sein Handler baut ohne Prüfung eine neue Runde. `baueBonusRunde` erzwingt
durch `Math.max(1, offen)` mindestens eine Aufgabe.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-5“)
Bonusrunde mit 3 richtigen Antworten abschließen (Tageskontingent erschöpft),
dann im Bonusbereich „Neue Aufgaben“ drücken.

**Erwartet:** Kein Start einer weiteren Bonusrunde ohne offene Sterne.
**Tatsächlich:** Neue Bonusrunde mit genau einer Aufgabe, ohne jede Belohnung;
jede Runde legt zusätzlich eine Bonus-Statistikzeile an (im Test drei Zeilen bei
einem Tag).

**Auswirkung.** Für das Kind ist nicht erkennbar, warum es knobelt, aber keinen
Stern bekommt (die Rückmeldung sagt „Knobel weiter!“, während oben „Heute sind
alle 3 Bonussterne verteilt“ steht). Die Statistik wird mit belohnungslosen
Bonuszeilen gefüllt.

**Empfohlene Lösung.** In `baueBonusRunde` bei `offen <= 0` keine Runde bauen
(`return null`) und in `aktualisiereKnopfLeiste` den Knopf ausblenden:

```js
neu.hidden = runde.bereichsArt === "bonus" && bonusPlaetzeHeute() === 0;
```

---

### BEFUND-6 — Low · Statistikzeile ohne `sterne` zeigt „★ undefined“

**Ort:** `script.js:1824-1827`; die Ursache liegt in der Validierung
`script.js:122-131`, die `sterne: undefined` ausdrücklich zulässt.

**Ursache.** `zeigeSterneInhalt` fällt bei `richtig`/`gesamt` auf „–“ zurück
(`script.js:1824-1825`), bei `sterne` jedoch nicht: `"★ " + eintrag.sterne`.
Genau dieser Fall ist laut `bereinige()` gültig (fehlende optionale Werte), also
muss die Anzeige ihn abfangen.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-6“)
Spielstand mit `runden: [{richtig: 3, gesamt: 5, datum: "2026-10-01"}]` laden und
„Mein Fortschritt → Sterne“ öffnen.

**Erwartet:** „★ –“ (analog zu den Aufgabenzahlen).
**Tatsächlich:** `… 01.10.2026  3 von 5  ★ undefined`

**Auswirkung.** Sichtbarer Technik-Text in einer Kind-App. Die Zusage aus
`PHASE3.md` („Fehlende historische Aufgabenzahlen werden … mit einem Strich statt
`undefined` beziehungsweise `NaN` dargestellt“) wird für `richtig`/`gesamt`
eingehalten, für die Sternspalte aber nicht.

**Empfohlene Lösung.**
`"★ " + (eintrag.sterne === undefined ? "–" : eintrag.sterne)`.

---

### BEFUND-7 — Low · Tag mit nur einer Bonusrunde gilt im Kalender als „nicht geübt“

**Ort:** `script.js:1967-1972` und `script.js:1978-1988`.

**Ursache.** Der Kalender speichert pro Tag nur die **höchste Sternzahl**
(`tage[d] = Math.max(…, eintrag.sterne || 0)`) und wertet einen Tag als geübt,
wenn dieser Wert truthy ist. Bonusrunden werden mit `sterne: 0` gespeichert
(`script.js:1419`). Ein Tag, an dem ausschließlich geknobelt wurde, hat damit
Stern 0 → „nicht geübt“. Die Serienberechnung (`datenFuerStreak`,
`script.js:1992-2004`) zählt denselben Tag dagegen als geübt – Kalenderpunkt und
Serie widersprechen sich.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-7“)
Spielstand mit einer einzigen Bonusrunde von heute laden, Statistik öffnen.

**Erwartet:** Der Tag ist als geübt markiert (z. B. neutral gefärbt mit Hinweis
„Bonuswelt“).
**Tatsächlich:** `31.10.2026: nicht geübt`, darunter „0 Tage geübt in den letzten
4 Wochen“.

**Auswirkung.** Falsche Rückmeldung über den eigenen Fleiß; die Serie und der
Kalender widersprechen sich.

**Empfohlene Lösung.** Zwei getrennte Kennzahlen führen: „geübt“ (mindestens eine
Runde an diesem Tag, unabhängig von Sternen) und „Sterne an diesem Tag“ (für die
Färbung). Beim Aufbau:

```js
const geuebt = Object.create(null);
daten.runden.forEach(e => { if (e.datum) { geuebt[e.datum] = true; … } });
```

---

### BEFUND-8 — Low · `bonusSterneProTag` wird in zwei Meldungen hart mit „3“ überschrieben

**Ort:** `script.js:1360-1361` (`bonusTagesText`) und `script.js:2552`
(`aktualisiereBonusweltKnoepfe`).

**Ursache.** Beide Texte setzen „3 neue“ als Literal, obwohl das Kontingent im
selben Satz aus `EINSTELLUNGEN.bonusSterneProTag` gelesen wird. Laut
`So funktioniert es.txt` (Zeilen 103-105) ist dieser Wert ausdrücklich zum
Verstellen gedacht.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-8“)
`EINSTELLUNGEN.bonusSterneProTag = 5` setzen, Kontingent aufbrauchen,
`bonusTagesText()` bzw. die Startseite ansehen.

**Erwartet:** „Heute sind alle 5 Bonussterne verteilt. Morgen warten 5 neue auf
dich!“
**Tatsächlich:** „Heute sind alle 5 Bonussterne verteilt. Morgen warten **3** neue
auf dich!“ – ebenso im Bonus-Knopf „morgen warten 3 neue!“.

**Auswirkung.** Nach einer Konfigurationsänderung sind die Meldungen falsch.
Zusätzlich ist der zweite Text mit „Bonus-kontingent“ falsch getrennt.

**Empfohlene Lösung.** `EINSTELLUNGEN.bonusSterneProTag` in beiden Texten
verwenden; den Bindestrich entfernen.

---

### BEFUND-9 — Low · Geschichten-Merkzettel sammelt Duplikate

**Ort:** `script.js:1438-1445` (`merkeGeschichten`).

**Ursache.** `daten.zuletzt = ids.concat(daten.zuletzt).slice(0, 12)` hängt die
Vorlagenkennungen ohne Duplikatprüfung an. `merkeGeschichten` wird auch für
Wiederholungsrunden aufgerufen, die dieselben Vorlagen erneut enthalten. Der
12-Plätze-Merkzettel enthält dadurch Mehrfacheinträge und vergisst ältere
Vorlagen früher als nötig – die Auswahl wiederholt Geschichten häufiger.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-9“)
Tagesrunde mit einer falsch beantworteten Geschichte abschließen, die
Wiederholungsrunde (eine Geschichte) richtig beantworten.

**Erwartet:** `daten.zuletzt` enthält sechs verschiedene Kennungen.
**Tatsächlich:** fünf verschiedene, eine doppelt:
`["geld-zwei-sachen","uhr-zeit-planen","kisten-stapeln","doppelt-so-viele","verschenken","geld-zwei-sachen"]`

**Auswirkung.** Qualitätsverlust (häufigere Wiederholungen) – kein Datenverlust.

**Empfohlene Lösung.**
`daten.zuletzt = Array.from(new Set(ids.concat(daten.zuletzt))).slice(0, EINSTELLUNGEN.merkzettelGroesse)`.

---

### BEFUND-10 — Low · Startseite meldet für Bonusrunden „0 Sterne“

**Ort:** `script.js:1324-1327` (`letzteZusammenfassung` der Bonusrunde setzt
`sterne: 0`) und `script.js:2604-2608` (Anzeige auf der Startseite).

**Ursache.** Bonusrunden vergeben Bonussternen und speichern in der Statistik
`sterne: 0`. Die Startseite zeigt für die letzte Zusammenfassung aber immer die
reguläre Sternereihe.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-10“)
Bonusrunde mit 2 richtigen von 3 Aufgaben abschließen, dann „Zur Startseite“.

**Erwartet:** Hinweis auf die Bonusrunde („2 von 3 geknobelt, 🌟 2 Bonusstern“).
**Tatsächlich:** „Letzte Runde: 2 von 3 richtig · ☆☆☆☆☆ 0 Sterne“.

**Auswirkung.** Das Kind sieht nach einer erfolgreichen Bonusrunde „0 Sterne“ –
eine frustrierende und sachlich falsche Rückmeldung.

**Empfohlene Lösung.** Das bereits gesetzte Feld `bonusRunde: true`
(`script.js:1326`) in `zeigeStartErgebnis` auswerten und statt der Sternereihe
die Bonussternen anzeigen.

---

### BEFUND-11 — Low · Tageswechsel verwirft eine angefangene Runde ohne Hinweis

**Ort:** `script.js:644-660` (`starteTagesRunde`).

**Ursache.** Ist das gespeicherte Set von einem früheren Tag, werden nur seine
Aufgabenschlüssel in die Ausschlussliste übernommen, `daten.tagesSet = null`
gesetzt und sofort ein neues Set erzeugt. Die gespeicherten Antworten der
offenen Runde werden verworfen – ohne Meldung, ohne Rückfrage.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-11“)

1. Um 23:55 (Wien) Tagesrunde starten und 4 Aufgaben beantworten.
2. Uhr auf 00:10 des Folgetags stellen (Seite bleibt offen).
3. Startknopf drücken.

**Erwartet:** Hinweis, dass die Runde von gestern nicht fortgesetzt wird (oder
Rückfrage), damit der Verlust nicht unbemerkt bleibt.
**Tatsächlich:** Neue Runde mit 0 Antworten, `vortagSchluessel` = 50; die vier
Antworten sind weg. Kein Dialog, keine Live-Region-Meldung.

**Auswirkung.** Unbemerkter Fortschrittsverlust in einem realistischen Fall
(Kind rechnet abends, macht morgens weiter).

**Empfohlene Lösung.** Beim Verwerfen eines unfertigen Sets mit mindestens einer
Antwort eine Meldung in `#rueckmeldung` setzen und/oder denselben
Bestätigungsdialog wie bei „Neuer Versuch“ verwenden.

---

### BEFUND-12 — Low (Risiko) · Zeitfeld fordert Zifferntastatur an, Parser verlangt ein Trennzeichen

**Ort:** `script.js:900` (`feldknoten.inputMode = feld.typ === "zeit" ? "numeric" : "numeric";`),
Parser `script.js:396-413`.

**Ursache.** Der Bedingungsausdruck liefert in beiden Zweigen `"numeric"` – eine
Zeitangabe erhält also eine reine Zifferntastatur. `parseZeit` akzeptiert jedoch
nur Formen mit Trennzeichen (`9:25`, `9.25`, `9,25`, `9 Uhr 25`, `9uhr25`,
`9u25`). Die kompakte Eingabe `925` wird abgelehnt. Auf Bildschirmtastaturen ohne
`:` `.` `,` (typisch für `inputMode="numeric"` auf iOS, teils Android) ist die
Aufgabe damit nicht lösbar.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-12“)
`neuesEingabefeld({typ:'zeit', …})` erzeugen und `inputMode` prüfen;
`parseZeit("925")` liefert `null`.

**Erwartet:** `inputMode` erlaubt ein Trennzeichen (oder der Parser akzeptiert
`925`).
**Tatsächlich:** `inputMode === "numeric"`, `parseZeit("925") === null`.

**Auswirkung.** Nicht auf einem echten Gerät verifiziert (siehe Abschnitt 6),
aber der Code widerspricht sich selbst: Ein Feld, das ein Trennzeichen verlangt,
fordert eine Tastatur ohne Trennzeichen an.

**Empfohlene Lösung.** Für Zeitfelder `inputMode = "text"` (oder `"decimal"`)
setzen – der sinnlose Ternary fällt dabei weg – und/oder den Parser um die Form
`^(\d{1,2})(\d{2})$` erweitern (dann ist „925“ = 9:25).

---

### BEFUND-13 — Low (latent) · Keine Idempotenzsicherung gegen erneute Bewertung einer fertigen Runde

**Ort:** `script.js:1157-1219` (`pruefeRunde`).

**Ursache.** Gegen Doppelbewertung schützt ausschließlich das Laufzeit-Flag
`fertigAnsicht`. Das gespeicherte `daten.tagesSet.fertig` wird nicht geprüft.
`starteTagesRunde` respektiert es zwar (`script.js:655`), `pruefeRunde` nicht.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-13“ – nur
programmatisch)

1. Tagesrunde vollständig beantworten und abschließen → 5 Sterne, 1 Zeile.
2. Zur Startseite, dann `zeigeRunde(rundeAusSet(speicher.daten().tagesSet))`.
3. Sechsmal prüfen (Abschnitte bis „Fertig“).

**Erwartet:** Keine zweite Belohnung für dieselbe Runde.
**Tatsächlich:** `sterneGesamt` 5 → **10**, zwei Statistikzeilen, obwohl
`tagesSet.fertig === true` bleibt.

**Auswirkung.** Über die Oberfläche derzeit **nicht erreichbar** (der Startknopf
prüft `set.fertig` und öffnet den Rückfragedialog). Der Befund ist eine
Verteidigungslücke: Jede künftige Änderung, die eine gespeicherte Runde erneut
anzeigt (z. B. Wiederherstellung, neuer Navigationsweg), verdoppelt Sterne.

**Empfohlene Lösung.** In `pruefeRunde` zu Beginn:

```js
if (istTagesRunde() && speicher.daten().tagesSet && speicher.daten().tagesSet.fertig) return;
```

---

### BEFUND-14 — Low · Gültiges JSON ohne bekannte Felder wird überschrieben

**Ort:** `script.js:89-101` (`bereinige` meldet nur, was es prüft) und
`script.js:202-257` (`lies`).

**Ursache.** `bereinige()` setzt `gesperrt` nur, wenn es einen Wert **als
ungültig erkennt**. Ein syntaktisch gültiges Objekt ohne ein einziges bekanntes
Feld – etwa `{"runde":1}` (Tippfehler im Feldnamen, halb überschriebener Eintrag)
– enthält nichts Prüfbares, wird als leerer Spielstand interpretiert und beim
ersten Speichern überschrieben. Andere Beschädigungsformen (ungültiges JSON,
`null`, Array, unbekannte Version) werden dagegen korrekt geschützt.

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-14“)
Spielstand `{"runde":1}` laden, eine Runde starten und speichern.

**Erwartet:** Der vorhandene Text bleibt erhalten, der Speicherhinweis erscheint
(wie bei `{kaputt` oder `{"version":99}`).
**Tatsächlich:** Der Text wird durch einen vollständigen neuen Spielstand ersetzt;
kein Hinweis.

**Auswirkung.** Letzte Lücke im sonst guten Speicherschutz. Sie betrifft nur
bereits beschädigte Stände, verhindert dann aber die Rettung per „Daten sichern“.

**Empfohlene Lösung.** In `bereinige` prüfen, ob überhaupt ein bekanntes Feld
vorhanden ist:

```js
const bekannt = ["version","sterneGesamt","runden","zuletzt","knobelZuletzt","tagesSet",
  "vortagSchluessel","bonussterne","bonusGesamt","geschenke","bereichPunkte","sound",
  "bonusTag","bonusWelten","modus"];
if (!bekannt.some(k => Object.prototype.hasOwnProperty.call(geladen, k))) { problem(); return {}; }
```

---

### BEFUND-15 — Low · Grammatikfehler „Noch 1 richtige Aufgaben“

**Ort:** `script.js:1475-1478`.

**Ursache.** Der Hinweis wird immer mit „richtige Aufgaben“ gebildet, auch wenn
genau eine Aufgabe fehlt (`Math.max(1, …)` erzeugt genau dann 1).

**Reproduktion** (`tests/audit-repros.test.cjs`, Test „BEFUND-15“)
24 von 50 Aufgaben richtig beantworten (eine fehlt zur Hälfte), abschließen.

**Erwartet:** „Noch 1 richtige Aufgabe – du schaffst das!“
**Tatsächlich:** „Noch 1 richtige Aufgaben – du schaffst das!“

**Auswirkung.** Sprachfehler in einem Satz, den das Kind in einer häufigen
Situation liest.

**Empfohlene Lösung.**
`fehlen === 1 ? "richtige Aufgabe" : "richtige Aufgaben"`.

---

## 5. Ohne Befund geprüfte Bereiche

Damit die Bewertung nachvollziehbar bleibt, hier die positiv geprüften Punkte –
jeweils mit Nachweis.

### 5.1 Mathematik

| Prüfung | Umfang | Ergebnis |
|---|---|---|
| Rechenkarten (Add/Sub/Mul/Div/Rätsel) | 18.000 Karten in 400 Runden, Rechnung unabhängig nachgerechnet | **fehlerfrei** |
| Divisionsrest | `Dividend = Divisor·Quotient + Rest`, `0 < Rest < Divisor` in allen Restaufgaben | **fehlerfrei** |
| Umkehraufgaben (3 pro Runde) | `Produkt ÷ erster = zweiter` unabhängig geprüft | **fehlerfrei** |
| Lückenaufgaben | Lösung in `□` eingesetzt, Gleichung geprüft | **fehlerfrei** |
| Zahlenraum / Vorzeichen | keine Zahl > 100, keine negativen Zwischen- oder Endergebnisse | **fehlerfrei** |
| Bereichsverteilung | 10/10/10/10/5 + 5 Geschichten = 50, in 120 Runden | **fehlerfrei** |
| Knobelaufgaben | 1.800 Aufgaben, alle 14 Typen, Antwort **aus dem Text** | **fehlerfrei** |
| Knobel-Merkzettel | 200 Durchgänge ohne Doppelung; voller Merkzettel blockiert nicht | **fehlerfrei** |
| Geschichtenvorlagen | 15.000 Instanzen (3 Welten × 1.000 Sets), Antwort aus dem Text | **fehlerfrei** |
| Geschichten – vollständig | **alle 93.308 zulässigen Zahlenkombinationen × 192 Uhrzeitvarianten = 263.298 Prüfungen** | **fehlerfrei** |
| Geschichten – Mischung | 3 normal / 1 Geld / 1 Uhr, 3× Stufe 1 und 2× Stufe 2, Weltzugehörigkeit | **fehlerfrei** |
| Zeitanzeige | `H:MM Uhr` bzw. `H Uhr`, Stunde < 24, Minute < 60 | **fehlerfrei** |
| Geldanzeige | `E € C` mit korrekter Cent-Trennung | **fehlerfrei** |

Besonders geprüft und in Ordnung: Divisionsrest, Geld-/Cent-Umrechnung,
Uhrzeitdifferenzen, „0“, „1“, „10“, „100“ als Grenzwerte, `999 € 99` als
Geldgrenze, Kettenaufgaben ohne negativen Zwischenwert, Zahlenrätsel mit
vertauschter Position der Lücke.

### 5.2 Spielmechanik und Zustand

* 20 Spieltage mit je einer Tages- und einer Bonusrunde und Neuladen nach jedem
  Tag: `sterneGesamt` entspricht in jedem Schritt exakt der Summe der regulären
  Rundensterne (keine Doppelzählung, kein Verlust).
* Bonusinvarianten: höchstens 3 Sterne pro Tag, `bonusGesamt − bonussterne` immer
  ein Vielfaches von 5, Bonuswelten ohne Duplikate, Tageswechsel setzt das
  Kontingent zurück, ohne verdiente Sterne zu verändern.
* „Blättern“ durch alle Abschnitte bewertet nichts; erst der letzte Klick bewertet
  genau einmal; zweimal „Fertig“ bewertet nicht doppelt.
* Zwei „Neuer Versuch“-Sets am selben Tag enthalten keine doppelte Rechenaufgabe
  (6 Sets, 0 Überschneidungen); Geschichten werden über die Vortagsschlüssel
  ebenfalls ausgeschlossen.
* Antworten überleben Abschnittswechsel, Startseitenwechsel und Neuladen; der
  ursprüngliche Abschnitt wird wiederhergestellt.
* Weltbindung: eine unterbrochene Runde behält Aufgaben, Antworten und Welt, auch
  wenn auf der Startseite eine andere Welt gewählt wurde (durch den vorhandenen
  Phase-2-Test bestätigt).
* Freischaltung: 24/50 öffnet nicht, 25/50 öffnet, Wiederholungsrunden öffnen
  nicht, eine offene Welt bleibt offen.

### 5.3 Datenspeicherung

* Unveränderter Speichertext bei: ungültigem JSON, leerem Text, `"null"`, `[]`,
  `0`, unbekannter Version, beschädigten verschachtelten Werten, beschädigter
  Tagesrunde – jeweils ohne Schreibvorgang und mit Sicherungsmöglichkeit
  (`tests/audit-invariants.test.cjs`, vorhandene Tests).
* Lesefehler (verweigerter Zugriff): Sitzung bleibt nutzbar, kein Überschreiben.
* Schreibfehler (Quota): verständliche Meldung, Antworten bleiben im
  Arbeitsspeicher, späterer Erfolg repariert den Zustand.
* Veralteter Fensterstand überschreibt keinen neueren Stand (Sterne, Bonussternen,
  Gutscheine, Freischaltungen bleiben erhalten).
* 1.005 Runden → Historie auf 1.000 begrenzt, Lebenszeitsterne (5.025) und
  Bereichssummen (1.005) bleiben, Gutschein bleibt.
* Gutschein-Umtausch: alter Eintrag bleibt mit Vermerk, neuer kommt hinzu,
  Bonussternen werden nicht verändert.
* Speichern/Neuladen ist idempotent: der serialisierte Stand ist nach dem Laden
  und erneuten Speichern byteweise identisch.

### 5.4 Sicherheit

* Kein `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`,
  `new Function`, `srcdoc` oder `javascript:`-URL im gesamten Code.
* Alle dynamischen Texte (Figuren, Geschichten, Gutscheintexte) werden über
  `textContent` bzw. `element(..., text)` gesetzt.
* Kartenselektoren (`[data-karten-id="…"]`) verwenden ausschließlich Kennungen,
  die bei gespeicherten Daten gegen `/^[\w-]+$/` validiert werden
  (`script.js:178`).
* CSV-Export neutralisiert Formeln (führendes `=`, `+`, `-`, `@`, Tab, CR) und
  quotiert `;`, `"`, Zeilenumbrüche korrekt (`script.js:2031-2035`).
* Keine externen Skripte, Schriften oder Bibliotheken; einzige externe Verbindung
  ist der YouTube-iframe (`script.js:2396-2402`).
* `Object.assign(Object.create(null), …)` verhindert Prototype-Pollution über
  gespeicherte Daten; unbekannte Felder werden nicht übernommen.

### 5.5 Browser und Bedienung

84 echte Prüfungen in Chrome und Edge bestanden, darunter Layout bei 375×812,
390×844, 768×1024, 1366×768 und 1920×1080 ohne Überlauf, Dialogfokus und
`inert`, reine Tastaturbedienung, Touch-Emulation, sichtbarer Fokusring,
Kontraststichproben in allen drei Welten, echte MP3/MP4-Dekodierung, Autoplay-
Ablehnung mit Wiederholung, Musikpause im Kino und `file://`-Start ohne
Anwendungsausnahme.

---

## 6. Fehlende Tests und verbleibende Risiken

Ehrlich **nicht** geprüft – diese Punkte dürfen nicht als bestanden gelten:

1. **Firefox und Safari/WebKit.** Keine Binärdateien vorhanden. `Intl`-Verhalten,
   `inert`, `AudioContext`-Autoplay und Layout sind dort ungetestet.
2. **Echte Mobilgeräte und Bildschirmtastaturen.** Die Zeitfelder (BEFUND-12)
   wurden nur im Code und im Parser geprüft, nicht auf einem Gerät.
3. **Screenreader-Ausgabe.** Attribute, Fokusführung und Live-Region wurden
   technisch geprüft, die tatsächliche Aussprache nicht.
4. **Druckansicht als PDF.** `@media print` (`style.css:617-623`) blendet
   Bedienelemente aus; da nur der aktuelle Abschnitt sichtbar ist
   (`[hidden] { display: none !important; }`, `style.css:258`), druckt Strg+P
   **nur einen Abschnitt**, obwohl `So funktioniert es.txt` „eine Runde“
   verspricht. Nicht als Fehler gezählt, weil kein Drucktest ausgeführt wurde –
   als UX-Hinweis vorgemerkt.
5. **Echter Mehrprozess-Gleichzeitigkeitsfall.** Der Zwei-Fenster-Konflikt ist
   geprüft, eine formal atomare Transaktion gibt es bauartbedingt nicht
   (dokumentiert).
6. **Stromausfall/harter Absturz im 250-ms-Bündelungsfenster.** Bauartbedingt
   können die letzten Zeichen verloren gehen (dokumentiert).
7. **YouTube-Verfügbarkeit.** Die Wiedergabe wurde in Chrome und Edge real
   beobachtet; regionale Sperren und spätere Löschungen sind nicht abgedeckt.
8. **Lange reale Sitzungen.** Die 20-Tage-Simulation ist beschleunigt.
9. **`localStorage`-Quota-Erschöpfung durch viele Gutscheine.** `geschenke` ist
   nicht begrenzt (nur `runden` ist auf 1.000 begrenzt). Für realistische
   Nutzung unkritisch, bei sehr vielen „Für Mama“-Gutscheinen aber ein
   Wachstumspfad – nicht als Fehler gezählt.
10. **Konfigurationsänderungen** außer `bonusSterneProTag` (z. B.
    `divisionMitRestAktiv: false`, `spaessig: false`) sind nur indirekt
    abgedeckt; `bonusAbAnteil ≠ 0.5` würde die Texte „ab der Hälfte“ und
    `Math.ceil(gesamt / 2)` falsch lassen (gleiche Klasse wie BEFUND-8).

---

## 7. Priorisierte Empfehlungen

| Priorität | Maßnahme | Begründung |
|---|---|---|
| **P1** | BEFUND-2 beheben: Rückfrage bei unvollständiger Tagesrunde | einziger Ablauf, der durch zwei Fehlklicks die Tagesübung unwiderruflich beendet |
| **P1** | BEFUND-3 beheben: „Speicher geleert“ vom Mehrfenster-Konflikt trennen | verhindert Sitzungsdatenverlust und eine falsche Fehlermeldung |
| **P2** | BEFUND-1 beheben: Sterne der Wiederholungsrunde an der Aufgabenzahl begrenzen | stellt die Aussagekraft von Meilensteinen und Lebenszeitsternen wieder her |
| **P2** | BEFUND-13 beheben: `tagesSet.fertig` in `pruefeRunde` prüfen | billige Verteidigung gegen künftige Doppelbelohnung |
| **P3** | BEFUND-14 beheben: unbekannten Speicherinhalt als Problem behandeln | schließt die letzte Lücke im Datenretten |
| **P3** | BEFUND-11 beheben: Hinweis beim Verwerfen einer offenen Runde | verhindert unbemerkten Fortschrittsverlust |
| **P4** | BEFUND-4, -6, -7, -10, -15 beheben: Anzeige- und Textfehler | direkt sichtbar für das Kind, geringer Aufwand |
| **P4** | BEFUND-5, -8, -9, -12 beheben: Konsistenz von Bonusrunden, Konfiguration, Merkzettel, Eingabe | verhindert Verwirrung und Folgefehler |
| **P5** | Druckansicht dokumentieren oder alle Abschnitte druckbar machen | Erwartung aus `So funktioniert es.txt` |

**Vorgehen nach der Korrektur.** Die 15 Tests in
`tests/audit-repros.test.cjs` sind die Abnahmekriterien: Sie müssen grün werden,
ohne dass `audit-invariants` oder `audit-math` rot werden. Anschließend die
vorhandenen 69 Regressionstests und die 84 Browserprüfungen erneut ausführen.

---

## 8. Anhang: Reproduktion

### Getesteter Stand

```
git clone https://github.com/kaichri/mathe-ueben.git .
git checkout 7c46ebacf69f2f8efcd58ed60fd617b161743882
```

### Vorhandene Prüfungen

```powershell
node --test --test-isolation=none tests/phase1.test.cjs tests/phase2.test.cjs tests/phase3.test.cjs tests/phase4.test.cjs
node --check script.js
node --check aufgaben-bereiche.js
node --check geschichten.js
node --check videos.js

# Browser (Playwright über NODE_PATH, Ausgabe außerhalb des Projekts)
$env:NODE_PATH = 'C:\Users\ccckk\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:QA_OUTPUT = "$env:TEMP\mathe-audit-browser"
node tests/phase4.browser.cjs
```

### Neue Audit-Prüfungen

```powershell
# grün: Mathematik und Textkonsistenz
node --test --test-isolation=none tests/audit-math.test.cjs

# grün: Zustand, Speicher, Tageswechsel
node --test --test-isolation=none tests/audit-invariants.test.cjs

# rot: 15 nachgewiesene Fehler (erwartetes Verhalten, derzeit verletzt)
node --test --test-isolation=none tests/audit-repros.test.cjs
```

### Geänderte bzw. neue Dateien

| Datei | Status |
|---|---|
| `tests/audit-math.test.cjs` | neu (9 Tests, grün) |
| `tests/audit-invariants.test.cjs` | neu (14 Tests, grün) |
| `tests/audit-repros.test.cjs` | neu (15 Tests, rot = 15 Befunde) |
| `reports/code-audit.md` | neu (dieser Bericht) |
| alle Anwendungsdateien | **unverändert** |

Es wurden keine Commits, Pushes oder Pull Requests erzeugt.
