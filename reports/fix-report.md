# Fix-Bericht: Behebung der 15 Audit-Befunde

**Datum:** 1. November 2026 · **Zeitzone:** Europe/Vienna
**Grundlage:** [reports/code-audit.md](code-audit.md) (Commit `7c46ebacf69f2f8efcd58ed60fd617b161743882`)
**Ergebnis:** alle **15 Befunde behoben** (3 Medium, 12 Low), **0 offene Fehler**.

---

## 1. Überblick

| Kennzahl | Vor der Korrektur | Nach der Korrektur |
|---|---:|---:|
| Node-Tests | 69 grün, 15 rot (Reproduktion) | **113 grün, 0 rot** |
| Playwright-Browserprüfungen | 84 grün | **84 grün** |
| Syntaxprüfungen | 13 Dateien OK | **13 Dateien OK** |
| Nachgewiesene Fehler | 15 | **0** |

Die 15 Reproduktionstests (`tests/audit-repros.test.cjs`) wurden in
`tests/audit-regressions.test.cjs` überführt. Sie prüfen jetzt das korrigierte
Verhalten und sind Abnahmekriterien für die Zukunft.

**Umgebung der Prüfung:** Windows, Node.js v25.7.0, Chrome 156.0.8078.74,
Edge 156.0.4314.58, Playwright 1.62.1 (gebündelt).

**Hinweis zur Testausführung:** `node --test` startet Kindprozesse und scheitert
in der DSH-Sandbox mit `spawn EPERM`. Alle Läufe verwenden deshalb
`node --test --test-isolation=none` (gleiche Tests, gleiche Aussage). Die
Playwright-Prüfung wurde mit freigegebenem Prozesszugriff ausgeführt.

---

## 2. Behobene Befunde

### BEFUND-1 — Medium · Wiederholungssterne (Stern-Inflation)

**Ursache:** Die Sternzahl hing nur vom Anteil richtiger Antworten ab. Eine
Wiederholungsrunde mit einer einzigen Aufgabe ergab 100 % → 5 Sterne.

**Lösung:** Neue Funktion `sterneFuerRunde()` (`script.js:1477`), verwendet in
`pruefeRunde()` (`script.js:1270`). Wiederholungsrunden („uebungen“) erhalten
höchstens **einen Stern je zwei Aufgaben der Runde** (mindestens einen); alle
anderen Runden bleiben unverändert. Eine einzelne Aufgabe ergibt 1 Stern, vier
Aufgaben höchstens 2, zehn Aufgaben wieder die volle Spanne.

**Tests:** `BEFUND-1: Wiederholungssterne richten sich nach der Aufgabenzahl`,
`BEFUND-1: größere Wiederholungsrunden bleiben verhältnismäßig`.

**Dokumentation:** README-Sternetabelle und `So funktioniert es.txt` ergänzt.

---

### BEFUND-2 — Medium · „Fertig“ ohne Rückfrage

**Ursache:** Der letzte Abschnitt ist über die Abschnittsleiste sofort
erreichbar; dort schloss „Fertig ✓“ die Runde ohne Prüfung ab, auch bei 1 von 50
Antworten.

**Lösung:** Neue, allgemeine Rückfrage `zeigeFrage()` (`script.js:1677`) mit
eigenem Dialog (`index.html:278-288`, `aria-modal`, `aria-labelledby`,
`aria-describedby`, Fokusstart auf „Abbrechen“). `pruefeRunde()` fragt vor dem
Abgeben, wenn mehr als `EINSTELLUNGEN.abgabeRueckfrageAbOffen` (Standard 0,5) der
Aufgaben offen sind (`script.js:1208-1229`). „Weiter rechnen“ bricht ab,
„Ja, abgeben“ bewertet. Neue Hilfsfunktion `karteIstAusgefuellt()`
(`script.js:1136`) wird auch von der Fortschrittsanzeige genutzt, damit
Anzeige und Rückfrage dieselbe Definition verwenden.

**Tests:** `BEFUND-2: fast leere Runde wird nur nach Rückfrage abgegeben`,
`BEFUND-2: eine weitgehend ausgefüllte Runde wird nicht behelligt`.
**Browser:** Die Tastaturprüfung in `tests/phase4.browser.cjs` bestätigt, dass
der Dialog erscheint, der Fokus auf „Abbrechen“ liegt und die Bestätigung per
Tastatur funktioniert.

**Dokumentation:** README und `So funktioniert es.txt` beschreiben die Rückfrage.

---

### BEFUND-3 — Medium · Dauerhafte Schreibsperre bei geleertem Speicher

**Ursache:** Jede Abweichung vom zuletzt selbst geschriebenen Stand wurde als
Mehrfenster-Konflikt gewertet und sperrte das Schreiben für den Rest der Sitzung.

**Lösung:** `schreibe()` unterscheidet jetzt drei Fälle (`script.js:284-296`):
Speicher leer (`null` oder leerer String) → **neu aufsetzen und weiter
speichern**; echter fremder Stand → Konfliktmeldung wie bisher; sonst normal
schreiben. Ein echter Mehrfenster-Konflikt bleibt also geschützt.

**Tests:** `BEFUND-3: extern geleerter Speicher sperrt das Spiel nicht` (beide
Varianten), `BEFUND-3: ein echter Mehrfenster-Konflikt wird weiterhin erkannt`.

---

### BEFUND-4 — Low · Falsche Lösungen in „Das kannst du noch üben“

**Ursache:** Die Liste baute ihre Zeilen aus `karte.darstellung + anzeige` und
ignorierte Feldbeschriftung und Rest.

**Lösung:** Neue Funktion `fehlerZeilen()` (`script.js:1451`), verwendet in
`zeigeZusammenfassung()` (`script.js:1594`). Restaufgaben erscheinen als
„54 ÷ 7 = 7 Rest 5“, Lücken als „□ = 58“, Textaufgaben unverändert.
`loesungsText()` liefert keine doppelten Leerzeichen mehr.

**Test:** `BEFUND-4: Fehlerliste weist Rest und Lücke korrekt aus`.

---

### BEFUND-5 — Low · Bonusrunde ohne Tageskontingent

**Ursache:** `baueBonusRunde()` erzwang mindestens eine Aufgabe; der Knopf
„Neue Aufgaben“ blieb im Bonusbereich auch bei 0 offenen Sternen bedienbar.

**Lösung:** `baueBonusRunde()` liefert bei erschöpftem Kontingent `null`
(`script.js:728-733`); der Knopf wird ausgeblendet (`script.js:895`) und die
Knopfleiste nach jeder Bonusprüfung aktualisiert (`script.js:1413`). Alle
Aufrufer (`startBonusWelt`, „Neue Aufgaben“) behandeln `null`.

**Tests:** `BEFUND-5: ohne offene Bonussterne startet keine neue Bonusrunde`.

---

### BEFUND-6 — Low · „★ undefined“ bei Altzeilen

**Lösung:** Fehlende Sternzahl wird wie `richtig`/`gesamt` mit „–“ dargestellt
(`script.js:1943`). **Test:** `BEFUND-6: Altzeile ohne Sterne zeigt einen Strich
statt 'undefined'`.

---

### BEFUND-7 — Low · Kalender zählt reine Knobeltage nicht

**Ursache:** „geübt“ wurde aus der Sternzahl abgeleitet; Bonusrunden haben
`sterne: 0`.

**Lösung:** Getrennte Kennzahlen `tage` (höchste Sternzahl, für die Färbung) und
`geuebtAm` (mindestens eine Runde, `script.js:2083-2094`). Ein reiner Knobeltag
erscheint als geübt mit dem Hinweis „Bonusrunde geübt“. Die Tageszählung nutzt
jetzt zusätzlich die korrekte Einzahl („1 Tag“).

**Tests:** `BEFUND-7: ein Tag mit nur einer Bonusrunde gilt als geübt`,
`BEFUND-7: normale Sterntage bleiben unverändert beschriftet`.

---

### BEFUND-8 — Low · Hartcodiertes Tageskontingent

**Lösung:** Beide Meldungen verwenden `EINSTELLUNGEN.bonusSterneProTag`
(`script.js:1427-1428`, `script.js:2677-2679`); die falsche Trennung
„Bonus-kontingent“ wurde zu „Bonuskontingent“. **Test:** `BEFUND-8: Meldungen
nennen das eingestellte Tageskontingent`.

---

### BEFUND-9 — Low · Duplikate im Geschichten-Merkzettel

**Lösung:** `merkeGeschichten()` dedupliziert vor dem Kürzen auf 12 Plätze
(`script.js:1534-1542`). **Test:** `BEFUND-9: der Geschichten-Merkzettel bleibt
duplikatfrei`.

---

### BEFUND-10 — Low · Startseite meldet „0 Sterne“ für Bonusrunden

**Lösung:** `zeigeStartErgebnis()` wertet `bonusRunde` aus und zeigt
„Letzte Bonusrunde: x von y geknobelt“ samt Bonussternzahl statt der regulären
Sternereihe (`script.js:2737-2749`). **Test:** `BEFUND-10: die Startseite meldet
eine Bonusrunde als Bonusrunde`.

---

### BEFUND-11 — Low · Tageswechsel verwirft Antworten ohne Hinweis

**Lösung:** Der Startknopf prüft vor dem Start, ob eine offene Runde von gestern
mit Antworten vorliegt, und fragt über denselben Dialog nach
(`script.js:2783-2802`). „Abbrechen“ lässt den gespeicherten Stand unangetastet,
„Neue Aufgaben starten“ erzeugt die neue Tagesrunde. Die vorhandene Logik in
`starteTagesRunde()` bleibt unverändert (kein doppeltes Verwerfen).

**Test:** `BEFUND-11: Tageswechsel fragt vor dem Verwerfen offener Antworten`.

---

### BEFUND-12 — Low · Zeitangaben auf Zifferntastaturen

**Lösung:** Zeitfelder fordern `inputMode="text"` an (`script.js:935`), und
`parseZeit()` akzeptiert zusätzlich die Kompaktform ohne Trennzeichen
(„925“ → 9:25, „1025“ → 10:25) mit Gültigkeitsprüfung
(`script.js:427-434`).

**Test:** `BEFUND-12: Zeitangaben sind auch ohne Trennzeichen eingebbar`
(inkl. Ablehnung von „2560“ und „25“).

---

### BEFUND-13 — Low (latent) · Keine Idempotenzsicherung

**Lösung:** `pruefeRunde()` bricht ab, wenn die gespeicherte Tagesrunde bereits
`fertig` ist (`script.js:1194-1206`) – zusätzlich zum Laufzeit-Flag
`fertigAnsicht`. **Test:** `BEFUND-13: eine abgeschlossene Tagesrunde wird nicht
erneut bewertet`.

---

### BEFUND-14 — Low · Gültiges JSON ohne bekannte Felder überschrieben

**Lösung:** `bereinige()` prüft, ob überhaupt ein bekanntes Feld vorhanden ist
(`script.js:99-110`). `{"runde":1}`, `{}` und `{"foo":"bar"}` gelten als
beschädigt: der Originaltext bleibt erhalten, der Speicherhinweis erscheint und
es wird nicht geschrieben. Echte Spielstände (Version 1 und 2) sind unverändert
ladbar.

**Tests:** `BEFUND-14: gültiges JSON ohne bekannte Felder bleibt geschützt`,
`BEFUND-14: echte Spielstände werden weiterhin normal geladen`.

---

### BEFUND-15 — Low · „Noch 1 richtige Aufgaben“

**Lösung:** Einzahl/Mehrzahl im Bonus-Hinweis (`script.js:1574-1579`).
**Tests:** `BEFUND-15: Einzahl bei genau einer fehlenden Aufgabe`,
`BEFUND-15: Mehrzahl bleibt korrekt`.

---

## 3. Erhalt bestehender Spielstände

Alle Änderungen sind **abwärtskompatibel**; es gibt keine neue Speicherversion
und keine Migration:

* Das Speicherformat bleibt Version 2 mit denselben Feldern. `bereinige()`
  akzeptiert weiterhin Version 1 und 2 sowie alle bisher gültigen optionalen
  Felder; nur Objekte **ohne jedes bekannte Feld** gelten jetzt als beschädigt.
* Lebenszeitsterne (`sterneGesamt`), Bonusguthaben (`bonussterne`,
  `bonusGesamt`), Gutscheine, Rundenhistorie, Bereichssummen, Tagesfreischaltungen
  und der Übekalender werden unverändert übernommen.
* Bereits gespeicherte Wiederholungsrunden behalten ihre damals vergebenen
  Sterne in der Historie; die neue Regel gilt nur für künftige Runden.
* Der neue Dialog ist rein additiv (`#frageUeberlagerung`) und wird nur bei
  Bedarf eingeblendet.
* Verifiziert durch die vorhandenen Migrationstests der Phase 2/3 und die neuen
  Invariantentests (20 Spieltage mit Neuladen, 1.005 Runden, Gutschein- und
  Sterneerhalt, Neuladen ohne Verlust).

---

## 4. Geänderte Dateien

| Datei | Änderung |
|---|---|
| `script.js` | 15 Korrekturen; +Hilfsfunktionen `karteIstAusgefuellt`, `fehlerZeilen`, `sterneFuerRunde`, `zeigeFrage`, `frageSchliessen`; neues Feld `abgabeBestaetigt`; neue Einstellung `abgabeRueckfrageAbOffen` |
| `index.html` | neuer Dialog `#frageUeberlagerung` (11 Zeilen) |
| `tests/phase4.browser.cjs` | Tastaturprüfung um die neue Rückfrage erweitert (4 Zeilen) |
| `tests/audit-regressions.test.cjs` | neu: 21 Regressionstests für die 15 Befunde |
| `tests/audit-math.test.cjs`, `tests/audit-invariants.test.cjs` | unverändert aus dem Audit übernommen (9 + 14 Tests) |
| `README.md` | Sterneregel, Rückfragen, Uhrzeit-Eingabe, neue Tests, Projektstruktur, Versionshistorie 1.0.1 |
| `So funktioniert es.txt` | Ablauf, Rückfragen, Wiederholungssterne, Uhrzeit-Eingabe |
| `reports/code-audit.md` | Nachtrag: Befunde behoben, Verweis auf diesen Bericht |
| `reports/fix-report.md` | dieser Bericht |

Nicht geändert: `aufgaben-bereiche.js`, `geschichten.js`, `videos.js`,
`style.css`, `tests/phase1–phase4` (Inhalt), Mediendateien.

---

## 5. Git-Diff-Prüfung

Geprüft mit `git status`, `git diff` und `git diff --stat`:

```
 README.md                |  53 +++++++--
 So funktioniert es.txt   |  12 +-
 index.html               |  12 ++
 script.js                | 292 +++++++++++++++++++++++++++++++++++++---------
 tests/phase4.browser.cjs |   4 +
 5 Dateien geändert, 308 Einfügungen, 64 Löschungen
```

Neu (untracked, dem Commit hinzugefügt): `tests/audit-math.test.cjs`,
`tests/audit-invariants.test.cjs`, `tests/audit-regressions.test.cjs`,
`reports/code-audit.md`, `reports/fix-report.md`.

Jede Änderung ist einem Befund zugeordnet (Abschnitt 2). Es sind **keine**
Debug-Ausgaben, auskommentierten Blöcke, temporären Dateien oder Änderungen an
Aufgabeninhalten, Sternschwellen der Tagesrunde, Geschichten, Videos oder
Mediendateien enthalten. `.gitignore` bleibt unverändert; persönliche Exporte
sind weiterhin ausgeschlossen.

---

## 6. Testbilanz im Detail

| Suite | Tests | Ergebnis |
|---|---:|---|
| `tests/phase1.test.cjs` | 14 | 14 bestanden |
| `tests/phase2.test.cjs` | 25 | 25 bestanden |
| `tests/phase3.test.cjs` | 25 | 25 bestanden |
| `tests/phase4.test.cjs` | 5 | 5 bestanden |
| `tests/audit-math.test.cjs` | 9 | 9 bestanden |
| `tests/audit-invariants.test.cjs` | 14 | 14 bestanden |
| `tests/audit-regressions.test.cjs` | 21 | 21 bestanden |
| **Node gesamt** | **113** | **113 bestanden, 0 fehlgeschlagen** |
| Playwright (Chrome + Edge) | 84 | 84 bestanden, 0 fehlgeschlagen |
| `node --check` (13 Dateien) | 13 | 13 OK |

Nicht ausgeführt (unverändert gegenüber dem Audit): Firefox, Safari/WebKit,
echte Mobilgeräte, echter Screenreader, Druck als PDF.

---

## 7. Verbleibende Risiken

Diese Punkte sind **keine** Audit-Befunde und wurden bewusst nicht geändert:

1. **Firefox/Safari und echte Mobilgeräte** bleiben ungetestet. Die
   Zeitfeld-Eingabe (BEFUND-12) ist jetzt zusätzlich ohne Trennzeichen möglich,
   aber auf einem echten Gerät nicht verifiziert.
2. **Druckansicht:** Strg+P zeigt weiterhin nur den aktuellen Abschnitt
   (`@media print`, `[hidden]`). Das ist im Audit als UX-Hinweis notiert, aber
   nicht als Fehler gezählt; eine Änderung hätte das Layout der Runde umgebaut.
3. **Sehr viele „Für Mama“-Gutscheine** wachsen unbegrenzt (nur `runden` ist auf
   1.000 begrenzt). Unkritisch für realistische Nutzung.
4. **`bonusAbAnteil ≠ 0,5`** würde die Texte „ab der Hälfte“ weiterhin nicht
   mitziehen (gleiche Klasse wie BEFUND-8, aber ohne konkreten Fehlernachweis).
5. **Gleichzeitige Schreibvorgänge** aus mehreren Prozessen bleiben ohne formale
   Transaktionsgarantie; der Zwei-Fenster-Schutz ist geprüft.

---

## 8. Commit

Alle Änderungen wurden in **einem** Commit zusammengefasst
(`fix: resolve 15 code audit findings and add regression tests`). Der Hash steht
in der Commit-Historie (`git log -1 --format=%H`). Es wurde **kein Push**
durchgeführt.
