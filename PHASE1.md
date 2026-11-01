# Phase 1: Aufgabengenerator und Bonuslogik

## Änderungen

- `aufgaben-bereiche.js`: Ausschlüsse aus früheren Sets und innerhalb der
  aktuellen Runde verwendete Aufgaben sind getrennt. Zunächst werden neue
  Aufgaben gesucht. Reichen diese innerhalb der begrenzten Suche nicht aus,
  werden nur die fehlenden Plätze mit den ältesten gefundenen ausgeschlossenen
  Aufgaben gefüllt. Bei mehrfachen Historieneinträgen zählt das jüngste
  Vorkommen. Innerhalb einer Runde bleiben die Aufgaben eindeutig.
- Der Zehnermaleins-Pool enthält tatsächlich **18** Aufgaben (beide
  Faktor-Reihenfolgen eingeschlossen). Die Angabe von 20 im vorherigen Review
  war unzutreffend. Nach sechs Sets ist der Pool vollständig ausgeschöpft.
- Ein gescheiterter Generatorlauf setzt seine interne Kartennummer zurück.
  `neuesTagesSet()` übernimmt Ausschlussliste und Tagesrunde erst, wenn
  Rechenaufgaben und Geschichten vollständig erzeugt wurden. Bei einem Fehler
  bleiben die vorherige Runde, ihre Antworten und die Historie erhalten.
- `script.js`: Jede laufende Bonusrunde merkt sich die bereits belohnten
  Karten. Gelöste, belohnte Eingaben werden gesperrt. Noch ungelöste Karten
  können weiter bearbeitet werden. Erneutes Prüfen vergibt ausschließlich
  Sterne für neu gelöste, noch nicht belohnte Karten, bis zum bestehenden
  Tageslimit.
- Pro Bonusrunde entsteht genau ein Statistikdatensatz. Später erarbeitete
  Sterne ergänzen diesen Datensatz; unveränderte Wiederholungsprüfungen
  erzeugen weder weitere Zeilen noch weitere Sterne oder Speicherschreibvorgänge.
- Die Freischaltung erfolgt ausschließlich für `bereichsArt: "tages"`.
  Die bestehende Schwelle bleibt unverändert: bei 50 Aufgaben öffnen 25
  richtige Antworten die Welt, 24 nicht. Wiederholungsrunden können keine
  Welt öffnen. Eine bereits geöffnete Welt bleibt am selben Tag geöffnet.

## Kompatibilität und Umfang

Das persistente Speicherformat bleibt unverändert. Bestehende Statistiken,
Sterne, Gutscheine und Tagesantworten werden nicht migriert oder gelöscht.
Der neue Belohnungsstatus gehört zur laufenden Bonusrunde; Bonusrunden werden
wie bisher nicht über ein Neuladen der Seite hinweg fortgesetzt.

HTML, CSS, Geschichten, Videos und sonstige Spielfunktionen wurden nicht
geändert. Weitere Befunde aus dem Review, insbesondere das Abschneiden alter
Sterne nach 1.000 Statistikzeilen, sind nicht Bestandteil dieser Phase.

## Tests

Ausführen mit Node.js, ohne zusätzliche Pakete:

```text
node --test tests/phase1.test.cjs
node --check script.js
node --check aufgaben-bereiche.js
```

14 Regressionstests bestanden. Enthalten sind alle sechs angeforderten Fälle
sowie zwölf aufeinanderfolgende vollständige Tagessets, ein vollständig
ausgeschlossener Pool, Fehler während der Erzeugung, schrittweise korrigierte
Bonusantworten, wiederholte Null-Punkte-Prüfungen, der Tagesdeckel, der Erhalt
vorhandener Daten und der Erhalt bereits geöffneter Welten.

Die Tests laden den echten Anwendungscode. DOM, Audio und localStorage sind
simuliert; echte Browser- und Gerätetests wurden nicht durchgeführt.
