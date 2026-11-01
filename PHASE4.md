# Phase 4: Finaler Gesamttest und Qualitätssicherung

Prüfdatum: 1. November 2026, Europe/Vienna.

## 1. Ergebnis und Ausgangssicherung

Der geprüfte Stand besteht die bisherigen **64 Regressionstests**, **5 neue
Phase-4-Tests** und **84 echte Playwright-Browserprüfungen**. Im abschließenden
Lauf gab es keine fehlgeschlagenen Prüfungen. Die unten genannten nicht
durchführbaren Prüfungen sind darin ausdrücklich nicht als bestanden gezählt.

Zu Beginn war das Git-Arbeitsverzeichnis sauber:

- Branch: `main`, verfolgt `origin/main`.
- Commit: `ca0633caf656b233d31f5de04845aa319151af16`.
- Nachricht: `Initial commit - Mathe Lernspiel`.

Vor Änderungen wurde ein vollständiges ZIP einschließlich `.git` erstellt:

```text
C:\Users\vicky\.codex\visualizations\2026\11\01\01a19841-490a-79c0-82c7-dd7e8bdfae84\phase4-project-before.zip
```

Der Snapshot enthält 68 Dateien; die ZIP-Integritätsprüfung war erfolgreich.
Die SHA-256-Liste liegt daneben in `phase4-before-sha256.json`. Der Vergleich
nach den Korrekturen bestätigt: Von den vorher vorhandenen Projektdateien wurden
ausschließlich `script.js` und `style.css` verändert. Alle bisherigen Tests und
ihre Hilfsdateien sind byteweise unverändert.

Es wurden keine persönlichen Browserprofile, echten Spielstände oder bestehenden
GitHub-Daten verändert. Browserprüfungen verwenden neue, isolierte Profile und
einen auf `127.0.0.1` gebundenen Testserver. Der Doppelklick-Dateistart wurde
zusätzlich über `file://` geprüft.

## 2. Testumgebungen und Ergebnisse

| Umgebung | Tatsächlich geprüft | Ergebnis |
|---|---|---|
| Node.js | Alle 64 bisherigen Tests | 64 bestanden |
| Node.js | Neue Phase-4-Tests | 5 bestanden |
| Chrome 156.0.8078.80 | Isolierter echter Browser, headless | 42 Prüfungen bestanden |
| Edge 156.0.4314.58 | Isolierter echter Browser, headless | 42 Prüfungen bestanden |
| Firefox | An Standardpfaden und als Playwright-Binary nicht vorhanden | Nicht durchgeführt |
| Safari | Auf diesem Windows-System nicht verfügbar | Nicht durchgeführt |
| Echter Screenreader | Keine Prüfung mit NVDA/JAWS/VoiceOver | Nicht durchgeführt |
| Physische Smartphones/Tablets | Keine realen Geräte verbunden | Nicht durchgeführt |

Playwright wurde aus dem bereits gebündelten Laufzeitpaket verwendet. Es wurden
keine zusätzlichen Browser oder Projektabhängigkeiten installiert. Die lokale
Sandbox blockierte zunächst die Loopback-Verbindung und den Edge-Start. Die
erfolgreichen Browserläufe fanden deshalb mit freigegebenem Prozesszugriff und
isolierten Testprofilen außerhalb dieser Sandbox statt.

## 3. Vollständige Funktionsabläufe

In beiden Browsern wurden folgende Abläufe erfolgreich geprüft:

- Startseite, Themenwahl und Start einer Tagesrunde.
- Eingabe einer Antwort, Tab-Navigation, Unterbrechen der Runde, Weltwechsel
  auf der Startseite, Fortsetzen in der ursprünglichen Welt und Neuladen mit
  erhaltener Antwort.
- Alle sechs Aufgabenabschnitte, einschließlich Geld-/Uhrzeitfeldern und
  Rechengeschichten, sowie die Auswertung von 50 richtigen Antworten.
- Schneller Doppelklick auf „Fertig“: eine Bewertung, eine Statistikzeile,
  fünf reguläre Sterne und kein unbeabsichtigter Neustartdialog.
- Freischaltung der passenden Bonuswelt, Bonusrunde, mehrfaches Prüfen ohne
  Mehrfachbelohnung, Tagesdeckel und Anzeige der Bonussterne.
- Geschenkauswahl, vorhandene Gutscheinansicht, Statistik, Kalender und
  heruntergeladene CSV-/JSON-Dateien.
- Runde mit 49 richtigen Antworten und anschließende Wiederholung genau der
  fehlerhaften Aufgabe.
- Vollständige Bedienung einer Runde ausschließlich mit Tab/Enter, Bewertung,
  Schließen des Kinos, Öffnen/Abbrechen des Neustartdialogs und Geschenkauswahl
  ohne Maus. Live-Region und Fokus-Rückgabe wurden dabei geprüft.
- Touch-Emulation mit grobem Zeiger: Themenwahl, Start und Eingabe.
- Dateistart über `file://`: Start einer Runde ohne Anwendungs-Ausnahme.

Gutscheinumtausch, ungültige Antworten, beschädigte Daten, Lesefehler,
Schreibfehler, Migration und die Wiener Datumsgrenzen sind zusätzlich durch die
unverändert erneut ausgeführten Tests der Phasen 1–3 abgedeckt.

**Datenimport:** Es gibt im vorhandenen Spiel keine Importfunktion. Der
Sicherungsdownload wurde geprüft; ein Import beziehungsweise automatischer
Wiederherstellungs-Rundlauf wurde nicht als bestanden gewertet. Entsprechend der
Vorgabe „keine neuen Features“ wurde kein Import ergänzt.

## 4. Responsive Prüfung

In Chrome und Edge wurden alle verlangten Viewports geprüft:

| Viewport | Quiz: alle sechs Abschnitte | Neustartdialog | Statistik/Sterne/Gutscheine/Geschenkauswahl |
|---|---|---|---|
| 375 × 812 | Bestanden | Bestanden | Bestanden |
| 390 × 844 | Bestanden | Bestanden | Bestanden |
| 768 × 1024 | Bestanden | Bestanden | Bestanden |
| 1366 × 768 | Bestanden | Bestanden | Bestanden |
| 1920 × 1080 | Bestanden | Bestanden | Bestanden |

Geprüft wurden Dokumentbreite, seitliche Überläufe, Begrenzungen von
Rechenkarten und Eingabefeldern sowie interne Überläufe des Statistikdiagramms.
Für die Statistik wurde ein Testbestand mit mindestens 14 Runden verwendet,
damit die Prüfung auch den vollständig belegten Verlauf erfasst.

Screenshots wurden für Quiz und Statistik bei allen fünf Größen aufgenommen.
Die schmalen Ansichten wurden zusätzlich visuell kontrolliert. Die
Abschnittsknöpfe sind in der Touch-Emulation rund 39 Pixel hoch; sie sind
bedienbar, liegen aber unter einem großzügigen Komfortziel von 44 Pixeln.
Die Bildschirmtastatur und Bedienung auf echten Mobilgeräten bleiben offen.

## 5. Datenintegrität und Langzeitsimulationen

Die neuen Node-Tests haben erfolgreich simuliert:

1. **500 erzeugte Rechenrunden / 22.500 Rechenkarten:** Prüfung der Ergebnisse
   mit einem unabhängigen Ausdrucksparser, einschließlich Lückenaufgaben,
   Umkehraufgaben, Division mit und ohne Rest.
2. **100 vollständige Tagesrunden über 25 Tage:** vier reguläre Runden pro Tag,
   wechselnde Welten, richtige Antworten, tägliche Bonusrunde, Geschenke und
   25 Wiederöffnungen mit dem gespeicherten Zustand. Ergebnis: 500 neu verdiente
   reguläre Sterne, 75 neue Bonussterne, 15 neue Gutscheine. Vorgegebene elf
   reguläre Sterne, fünf frühere Bonussterne und ein alter Gutschein bleiben
   erhalten. Die täglichen Freischaltungen und Tagesgrenzen wurden geprüft.
3. **1.100 Statistikzeilen und erneutes Öffnen:** Historie wie vorgesehen auf
   1.000 Zeilen begrenzt, weiterhin 5.500 reguläre Lebenszeitsterne, 1.100
   Bereichsaufgaben und erhaltener Gutschein.
4. **Veralteter Fensterstand:** Neuere gespeicherte Sterne, Bonuswerte,
   Gutscheine und Freischaltungen werden nicht überschrieben.
5. **Zweiter Klick nach Abschluss:** Ein Klick mit `detail: 2` auf den neu
   eingeblendeten Versuchsknopf öffnet keinen Dialog; ein normaler Klick bleibt
   möglich.

Der Mehrfensterfehler wurde außerdem in beiden echten Browsern reproduziert
und nach der Korrektur erneut geprüft: Zwei Seiten desselben Browserkontexts
teilen denselben Speicher. Fenster A verdient Sterne; Fenster B versucht danach
einen älteren Stand zu speichern. Die Sterne bleiben erhalten und Fenster B
zeigt die Konfliktmeldung.

Dies ist ein Schutz gegen veraltete Schreibstände, **keine automatische
Zusammenführung und keine atomare Mehrfenster-Transaktion**. Die Sitzungsdaten
des blockierten Fensters bleiben zur Sicherung verfügbar. Für extrem zeitgleiche
Schreibvorgänge aus mehreren Prozessen gibt es weiterhin keine formale
Transaktionsgarantie. Empfohlen bleibt ein aktives Spielfenster.

## 6. Audio, Videos, Ressourcen und Barrierefreiheit

In Chrome und Edge wurden reale Medien und Browser-APIs statt Audio-Mocks
beobachtet:

- `blau.mp3` und `puppenhaus.mp3`: `readyState: 4`, laufende Wiedergabe und
  fortschreitende Abspielzeit.
- Tatsächliche anfängliche `NotAllowedError`-Autoplay-Ablehnung und erfolgreicher
  erneuter Abspielversuch nach einem Benutzerklick ohne zusätzliche Instanz.
- Während des Kinos keine laufende Hintergrund-Audioinstanz, anschließend
  Wiederaufnahme. Zu keinem geprüften Zeitpunkt mehr als eine laufende
  Hintergrundinstanz.
- `doozie.mp3` fehlt tatsächlich. Der erwartete 404-/Medienfehler löst den
  funktionierenden Rückfall auf `puppenhaus.mp3` aus; es wurde keine neue Datei
  hinzugefügt.
- Bei gezielt per Test-Routing fehlenden MP3-Dateien erzeugt der echte
  Web-Audio-Kontext Ersatznoten. Beim Öffnen des Kinos wird er angehalten.
- Beide vorhandenen MP4-Dateien wurden lokal dekodiert und angespielt.
- Die Inline-SVG-Verweise zeigen auf vorhandene Symbole.
- YouTube wurde nicht nur als gesetzte iframe-Adresse geprüft: Im abschließenden
  Lauf liefen im echten eingebetteten Player ein Bluey-Clip in Chrome und ein
  Bluey-Clip in Edge mit `paused: false`, fortschreitender Abspielzeit und
  `readyState: 4`. Nicht alle externen Clips und Regionen wurden geprüft.

Im geprüften Anwendungsablauf wurden keine ungefangenen JavaScript-Ausnahmen
gemeldet. Erforderliche lokale Ressourcen luden ohne unerwartete Ausfälle.
Erwartete Fehler der optionalen Doozie-Datei, gezielt injizierte Medienfehler und
abgebrochene iframe-Anfragen beim schnellen Schließen/Wechseln sind getrennt
zu betrachten; es wird keine vollständig leere Netzwerkkonsole behauptet.

Die Wiedergabe wurde technisch über Browser-Medienzustände nachgewiesen. Eine
Hörprüfung der Lautsprecher-/Kopfhörerausgabe erfolgte nicht.

Die Kontrastprüfung erfasst fünf Textarten in allen drei Farbwelten. Nach der
Korrektur erreichen diese Stichproben die größenabhängigen Mindestwerte
(4,5:1 für normalen Text beziehungsweise 3:1 für großen Text). Grundlage:
[W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
Das ist keine vollständige WCAG-Konformitätsprüfung. Die sichtbare
Eingabefokus-Markierung, Dialogrollen, zugänglichen Titel, Tab-/Umschalt-Tab-
Führung, Escape, Fokus-Rückgabe und Ergebnis-Live-Region wurden geprüft.
Die tatsächliche Aussprache durch einen Screenreader bleibt ungeprüft.

## 7. Reproduzierte Fehler und gezielte Korrekturen

| Problem vor der Korrektur | Nachweis | Änderung | Nachprüfung |
|---|---|---|---|
| Mobile Rechenkarten liefen seitlich aus dem Bild; Dokument bis 468 Pixel breit bei 375-Pixel-Viewport | Chrome und Edge, Screenshots/Breitenmessung | Einspaltiges Raster unter 640 Pixeln | Alle Abschnitte bei allen fünf Größen bestanden |
| Lange Geschichtenüberschrift plus Aufgabenzähler überschritt die Bildschirmbreite | Beide Browser, Abschnitt Geschichten | Bereichskopf darf auf schmalen Bildschirmen umbrechen | Bestanden |
| Verlauf mit 14 Balken lief intern über seine Fläche | Beide Browser, vollständiger Testverlauf | Kleinere mobile Abstände und schrumpfbare Balken | Bestanden |
| Zweiter Klick auf „Fertig“ traf bereits „Neuer Versuch“ | Echter Doppelklick; unerwarteter Dialog fing weitere Klicks ab | Versuchsknopf ignoriert Folge-Klick eines Doppelklicks | Browser- und Node-Test bestanden |
| Älteres Fenster überschrieb neu verdiente Sterne: 5 → 0 | Zwei echte Seiten mit gemeinsamem localStorage | Vor dem Schreiben Vergleich mit dem zuletzt bekannten Stand; bei Konflikt Schreibsperre mit bestehender Sicherungsmeldung | In beiden Browsern und Node-Test bestanden |
| Transparente Beschriftung „Musik aus“ und unerreichte Meilensteine unterschritten den normalen Textkontrast | Alle drei Welten: Musik ca. 2,35–2,51:1, Meilensteine ca. 3,05–3,09:1 | Nur das Musiksymbol bleibt transparent; unerreichte Meilensteine erhalten statt Transparenz einen gestrichelten Rand | Kontrast-Stichproben bestanden |

Nur `script.js` und `style.css` erhielten Produktkorrekturen. Es wurden weder
Aufgabenregeln noch Sterneschwellen, Medieninhalte oder historische Daten
umgestaltet. Neue Dateien: `tests/phase4.test.cjs`, `tests/phase4.browser.cjs`
und dieser Bericht. Die Änderungen sind nicht automatisch committet oder
auf GitHub veröffentlicht worden.

## 8. Fehlgeschlagene und nicht durchgeführte Prüfungen

- Die anfänglichen Browserläufe schlugen bei den oben dokumentierten Fehlern
  fehl. Diese Ergebnisse wurden aufbewahrt, nicht als erfolgreich umgedeutet.
- Eine CSV-Prüfung schlug anfangs als Folge des unbeabsichtigt offenen
  Neustartdialogs fehl, weil der Bonusablauf nicht erreicht wurde. Nach der
  Doppelklickkorrektur bestehen der vollständige Bonusablauf und beide Exporte.
- Eine frühe YouTube-Beobachtung erfolgte zu früh vor der iframe-Navigation und
  belegte keine Wiedergabe. Der Test wartet nun auf die tatsächliche Navigation
  und die laufende Videospur; die abschließenden Prüfungen bestanden.
- Final: **69 Node-Tests und 84 Browserprüfungen bestanden, 0 fehlgeschlagen**.
- Firefox, Safari, physische Mobilgeräte, reale Screenreader-Ausgabe und
  Datenimport wurden nicht durchgeführt beziehungsweise sind nicht vorhanden.
- Es wurden keine stundenlangen realen Spielsitzungen, keine Wiederherstellung
  nach Stromausfall und keine vollständig atomaren parallelen Schreibvorgänge
  getestet. Die 100-Runden-Prüfung ist eine beschleunigte Simulation.

## 9. Reproduzieren und Nachweise

```powershell
node --test tests/phase1.test.cjs tests/phase2.test.cjs tests/phase3.test.cjs tests/phase4.test.cjs
node --check script.js
node --check aufgaben-bereiche.js
node --check geschichten.js
node --check videos.js

# Playwright liegt auf diesem Rechner im gebündelten Laufzeitpaket:
$env:NODE_PATH = 'C:\Users\vicky\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node tests/phase4.browser.cjs
```

`QA_OUTPUT` legt optional das Artefaktverzeichnis fest; standardmäßig werden
neue temporäre Testprofile und Ergebnisse außerhalb des Projekts angelegt.
`CHROME_PATH` und `EDGE_PATH` können die installierten Browserpfade vorgeben.

Die abschließenden maschinenlesbaren Browserergebnisse und Screenshots liegen in:

```text
C:\Users\vicky\.codex\visualizations\2026\11\01\01a19841-490a-79c0-82c7-dd7e8bdfae84\phase4-browser-release\browser-results.json
```

Daneben befinden sich unter anderem `Chrome-375-quiz.png`,
`Chrome-375-statistics.png` und die entsprechenden Dateien für alle weiteren
Größen und Edge. Frühere Fehlernachweise liegen in den Verzeichnissen
`phase4-browser-before`, `phase4-browser-after` und `phase4-browser-media-a11y`.

## 10. Verbleibende Risiken und Empfehlungen

1. Mit Firefox/Gecko und Safari/WebKit sowie einem echten Mobilgerät nachtesten,
   bevor vollständige Browser- und Gerätekompatibilität behauptet wird.
2. NVDA/JAWS/VoiceOver praktisch prüfen. Eingabebeschriftungen sind teilweise
   allgemein gehalten; ihre Verständlichkeit im tatsächlichen Lesefluss sollte
   mit einem Screenreader beurteilt werden.
3. Das Spiel bevorzugt in einem Fenster verwenden. Eine Konfliktmeldung ernst
   nehmen, Sitzungsdaten sichern und neu öffnen; es gibt keine automatische
   Zusammenführung konkurrierender Runden.
4. Der vorhandene JSON-Export besitzt weiterhin keinen Importdialog. Eine
   komfortable Wiederherstellung wäre eine getrennt zu beauftragende Funktion.
5. Die bekannten Grenzen bleiben: letzte Zeichen bei hartem Absturz im kurzen
   Speicherbündelungsfenster, verweigerter Browserspeicher, nicht rekonstruierbare
   bereits früher abgeschnittene Historie und wechselnde Verfügbarkeit externer
   YouTube-Videos.
6. Vor der nächsten Entwicklungsphase diesen geprüften Stand gezielt sichern:

```powershell
git add -- script.js style.css tests/phase4.test.cjs tests/phase4.browser.cjs PHASE4.md
git commit -m "Phase 4: Regression and quality assurance"
git push
```

Diese Git-Befehle sind eine Empfehlung, keine Behauptung eines bereits
durchgeführten Commits oder Pushs.
