# Phase 2: Statistik, Spielzustände und Audio

## Ausgangsbasis

Vor der Implementierung wurden alle 14 Phase-1-Regressionstests erneut
ausgeführt und bestanden. `git rev-parse --show-toplevel` ergab, dass dieser
Ordner kein Git-Repository ist. Daher wurde kein Sicherungscommit erstellt
und kein neues Repository initialisiert.

## Geänderte Dateien

- `script.js`: die fünf unten beschriebenen Korrekturen.
- `tests/phase2.test.cjs`: 25 neue automatisierte Regressionstests.
- `PHASE2.md`: diese Dokumentation.

`aufgaben-bereiche.js`, `tests/phase1.test.cjs`, `PHASE1.md`, HTML, CSS,
Geschichten, Videos und Mediendateien wurden in Phase 2 nicht geändert.

## 1. Dauerhafte Lebenszeitsterne und Migration

Das Speicherformat verwendet jetzt Version 2 und enthält `sterneGesamt` für
alle regulären Sterne einschließlich der Sterne aus Wiederholungsrunden.
`gesamtSterne()` liest ausschließlich diesen Zähler. Eine neu abgeschlossene
reguläre Runde erhöht ihn einmal, unabhängig davon, welche Statistikzeile
anschließend durch die bestehende Begrenzung auf 1.000 Einträge entfernt wird.

Die Migration läuft beim Laden eines bestehenden Spielstands:

1. Die noch vorhandenen regulären Sterne werden aus der Historie summiert.
   Bonusrunden werden dabei ausdrücklich ausgeschlossen.
2. Ist bereits ein gültiger `sterneGesamt`-Zähler vorhanden, wird der größere
   Wert aus Zähler und verfügbarer historischer Summe übernommen. Die Werte
   werden **nicht addiert**. Dadurch bleiben Neustarts und wiederholtes Laden
   ohne Doppelzählung; ein fehlender oder zu kleiner Zähler verliert keine
   noch nachweisbaren Sterne.
3. Die normale Speicherung beim Start schreibt das ergänzte Format zurück.
   Historische Runden und ihre Datumsangaben werden nicht umgeschrieben.

`bonusGesamt` bleibt der separate Lebenszeitzähler für Bonussterne;
`bonussterne` bleibt das verfügbare Guthaben für Geschenke. Beide bestehenden
Werte werden übernommen. Bonusprüfungen erhöhen den regulären Lebenszeitzähler
nicht. Das Ausgeben von Bonussternen ändert den Lebenszeitertrag nicht.

Bestehende Bereichssummen werden unverändert übernommen und bei neuen
regulären Runden wie bisher einmal ergänzt. Sie bleiben Lebenszeitsummen;
die begrenzte Historie ist kein Ersatz dafür. Gutscheine, Tagesaufgaben,
Antworten und Ausschlusslisten bleiben erhalten.

Die abgeschlossene Ansicht wird vor erneuter regulärer Bewertung abgefangen.
Diese kleine Ergänzung zu `pruefeRunde()` ist erforderlich, damit dieselbe
abgeschlossene Runde nicht nochmals Lebenszeitsterne und Bereichspunkte erhält.
Die Phase-1-Bonusbewertung wurde nicht verändert.

**Rekonstruktionsgrenze:** Sterne aus Statistikzeilen, die schon vor Phase 2
entfernt wurden, können ohne ältere Sicherung nicht exakt bestimmt werden.
Die Bereichssummen enthalten keine einzelnen Rundenergebnisse, aus denen sich
die damaligen Sterne zuverlässig zurückrechnen ließen. Die Migration erfindet
deshalb keine Werte; sie übernimmt sämtliche noch vorhandenen Nachweise.

## 2. Verbindliche Welt je Runde

Eine Runde besitzt ihre Welt in `runde.welt`; auch Wiederholungsrunden
erhalten sie beim Erzeugen. `zeigeRunde()` synchronisiert die aktuelle Auswahl,
das Design und die Musik mit dieser Welt, bevor Aufgaben angezeigt werden.

Beispiel: Eine Bluey-Runde wird unterbrochen, auf der Startseite wird Gabby
gewählt und anschließend „Weiterspielen“ gedrückt. Die Bluey-Runde wird mit
ihren bisherigen Aufgaben, Antworten und ihrem Abschnitt fortgesetzt; die
Auswahl kehrt dabei zu Bluey zurück. Eine bewusst neu erzeugte Runde kann
weiterhin die neu ausgewählte Welt verwenden.

Statistik und Freischaltung verwenden ausdrücklich die Rundenwelt. Der
Freischaltbedingung aus Phase 1 wurde nur die eindeutige Weltzuordnung
hinzugefügt; die Schwelle und der Ausschluss von Wiederholungsrunden bleiben
unverändert. Geschichten werden beim Fortsetzen nicht neu erzeugt.

## 3. Audio und Kino

Ein eigener `videoAktiv`-Status sperrt Hintergrundmusik und synthetische Töne,
solange das Kino ein Video zeigt. Das gilt auch für hochwandernde Klicks,
Weltwechsel, Musikumschaltungen und „Nächstes Video“. Laufende Ersatzmelodie-
Timer werden gestoppt und ein vorhandener Web-Audio-Kontext wird angehalten.

Beim Schließen wird die Musik entsprechend der weiterhin geltenden
An-/Aus-Einstellung wieder aufgenommen. Eine während des Videos ausgeschaltete
Musik bleibt aus. Die Musikdatei startet dabei wie bisher von vorn.

Eine abgelehnte oder synchron fehlgeschlagene `play()`-Operation merkt sich
den ausstehenden Benutzerklick. Der nächste Klick versucht dieselbe Instanz
erneut abzuspielen. Laufende Abspielversuche werden nicht parallel wiederholt.
Ergebnis-Callbacks veralteter Versuche und Fehler ersetzter Audioknoten werden
ignoriert. Startinitialisierung und Weltwechsel erzeugen keine parallelen
Hintergrundinstanzen für dieselbe Datei.

## 4. Geldparser

Leere Teilfelder werden vor dem Zahlenparsen erkannt. Ein leeres Euro- oder
Centfeld gilt als null, sofern das andere Teilfeld gültig ausgefüllt wurde.
Zwei leere Felder bleiben eine unbeantwortete Aufgabe.

Nichtleere ungültige Teilfelder machen die gesamte Antwort ungültig. Die
bisherigen gültigen Ganzzahlformate einschließlich Leerzeichen, führender
Nullen und eines abschließenden Punkts bleiben akzeptiert. Die Grenzen von
999 Euro und 99 Cent bleiben unverändert.

## 5. Einheitliche Wiener Kalenderdaten

Tagesquiz, Bonus, neue Statistikzeilen und Kalender verwenden ausdrücklich
`Europe/Vienna`, unabhängig von der Zeitzone des ausführenden Rechners.
Statistik-Uhrzeiten und CSV-Zeitstempel verwenden ebenfalls Wien.

Kalender und Serienberechnung verschieben reine Datumswerte um Kalendertage.
Sie subtrahieren keine festen 24 Stunden von lokalen Zeitpunkten mehr. Damit
werden weder Tage bei der Zeitumstellung übersprungen noch doppelt angezeigt.
Die Gutschein-Altersberechnung verwendet ebenfalls Wiener Kalendertage.

ISO-Zeitpunkte bleiben unverändert als absolute Zeitpunkte gespeichert.
Vorhandene historische `datum`- und `uhrzeit`-Felder werden ausdrücklich nicht
aus diesen Zeitpunkten neu berechnet oder rückwirkend verschoben.

## Ausgeführte Tests

```text
node --test tests/phase1.test.cjs
node --test tests/phase1.test.cjs tests/phase2.test.cjs
node --check script.js
node --check aufgaben-bereiche.js
```

- Vor Beginn: **14 von 14** Phase-1-Tests bestanden.
- Nach Implementierung: **39 von 39** Tests bestanden, davon 14 unveränderte
  Phase-1-Tests und 25 neue Phase-2-Tests.
- Beide Syntaxprüfungen bestanden.

Die neuen Tests decken ab: Migration und wiederholtes Laden, bestehende und
unvollständige Lebenszeitzähler, mehr als 1.000 Statistikzeilen, getrennte
Sternarten, Erhalt von Bereichssummen und Gutscheinen, alte Tagesantworten,
Weltwechsel und Weltzuordnung von Statistik/Video/Freischaltung, Musik während
des Videos, aktivierte und deaktivierte Musik, Autoplay-Ablehnung und erneuter
Versuch, verspätete Audio-Callbacks, synthetische Ersatzmusik, ungültige und
gültige Geldangaben, Wiener Mitternacht, Sommer-/Winterzeit, Kalender-Serien
sowie unveränderte historische Daten.

Die Phase-2-Tests laufen absichtlich mit der Rechnerzeitzone
`Pacific/Honolulu`. Die Anwendung muss trotzdem die Wiener Daten liefern.
Sie laden den tatsächlichen Anwendungscode und simulieren DOM, Audio,
localStorage und Uhrzeit. Echte Browser-/Geräte- und YouTube-Wiedergabetests
wurden nicht durchgeführt.

## Noch offene Punkte

- Bereits früher abgeschnittene Runden und ihre Sterne sind ohne zusätzliche
  Sicherung nicht exakt rekonstruierbar; siehe Migrationsgrenze oben.
- Die anderen, nicht beauftragten Review-Befunde bleiben bestehen, etwa die
  Geschichtenauswahl, widersprüchliche Sitzplatzgeschichte, fehlendes
  Speicherfehler-Feedback, Dialog-Barrierefreiheit und CSV-Escaping.
- Die vorhandene Begrenzung der Rundenhistorie bleibt bestehen. Der neue
  Lebenszeitzähler verhindert künftig den dadurch verursachten Sterneverlust.

Es wurden keine visuellen Änderungen, neuen Spielfunktionen oder externen
Abhängigkeiten eingeführt und keine echten Browser-Spielstände zurückgesetzt.
