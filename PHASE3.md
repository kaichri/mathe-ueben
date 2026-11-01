# Phase 3: Geschichten, Datenspeicherung und UX

## Ausgangsbasis und geänderte Dateien

Vor Beginn wurden die 39 bisherigen Regressionstests ausgeführt und bestanden.
Diese Tests wurden weder entfernt noch verändert.

Geändert beziehungsweise ergänzt wurden:

- `geschichten.js`: Vorlagenauswahl und gezielte inhaltliche Korrekturen.
- `script.js`: Geschichten-Merkzettel, Speicherprüfung/-schutz, Sicherungsdownload,
  Dialogführung, Screenreader-Rückmeldungen, Audio-Fallback und CSV-Export.
- `index.html`: Speicherhinweis mit Sicherungsknopf, Live-Region und Dialogattribute.
- `style.css`: ausschließlich eine Klasse für visuell verborgene Screenreader-Texte.
- `tests/phase3.test.cjs`: 25 neue Regressionstests.
- `tests/phase3-helper.cjs`: Testumgebung mit DOM aus der tatsächlichen HTML-Datei,
  Fokusführung, kontrollierten Speicherfehlern, Audio, Downloads und Timern.
- `PHASE3.md`: diese Dokumentation.

Der Aufgabengenerator aus Phase 1, bestehende Tests und die Mediendateien wurden
nicht verändert. Die reguläre Darstellung und bestehende Spielmechaniken bleiben
erhalten. Der neue Speicherhinweis erscheint ausschließlich bei Speicherproblemen.

## Geschichten: Kategorien, Schwierigkeit und Wiederholungen

Die Auswahl hält zuerst Kategorie und Schwierigkeitsstufe ein. Innerhalb dieser
Gruppe werden noch nicht kürzlich verwendete Vorlagen bevorzugt. Ist die Gruppe
vollständig im Merkzettel, wird ihre am längsten zurückliegende Vorlage erneut
verwendet. Erst wenn eine Gruppe tatsächlich keine unbenutzten Vorlagen für
dieses Set mehr enthält, kommt eine Lockerung von Stufe beziehungsweise Kategorie
in Betracht. Eine Vorlage bleibt innerhalb desselben Sets eindeutig.

Die vorhandenen Vorlagen decken die Standardmischung vollständig ab: pro Set
drei normale Geschichten, eine Geldgeschichte, eine Uhr-/Minutengeschichte sowie
drei Vorlagen der Stufe 1 und zwei der Stufe 2. Der Merkzettel aus der Set-Historie
wird nun einheitlich mit den neuesten Einträgen zuerst und ohne Duplikate
übergeben. Dadurch entspricht die Auswahl der ältesten Wiederholung auch der
tatsächlichen Reihenfolge der gespeicherten Sets.

## Inhaltliche Prüfung aller 47 Vorlagen

Für alle Vorlagen wurden Fragestellung, Lösungsansatz, Zahlenbereiche und
Randbedingungen geprüft. Gezielte Änderungen:

- **Sitzplätze:** Später eintreffende Freunde dürfen die freien Plätze nicht
  überschreiten. Die berechnete Belegung ist damit höchstens die Saalkapazität.
- **Verloren und wiedergefunden:** Es können höchstens so viele Gegenstände
  wiedergefunden werden wie zuvor verloren gingen.
- **Halbierung und Nachschub:** Der Text sagt ausdrücklich, dass die zweite
  Person der ersten Person Gegenstände schenkt. Empfänger und gesuchte Menge
  sind damit eindeutig.
- **Rückgeld:** Der Text nennt ausdrücklich den Betrag, mit dem bezahlt wird.
- **Sparbüchse und Sparschwein:** Beide Geschichten nennen einen anfangs leeren
  Behälter, damit keine unbekannte Ausgangssumme vorausgesetzt wird.
- **Eis und Restgeld:** Der mögliche Euro-Stückpreis wurde von bis zu 20 Euro
  auf 2 bis 5 Euro begrenzt; Rechenart und Geld-/Cent-Eingabe bleiben erhalten.
- **Hunde-Modenschau:** Die Figur organisiert die Reihen mit Hunden; die bisherige
  missverständliche Formulierung, dass die Figur selbst Reihen läuft, entfällt.

Die übrigen Texte wurden nicht umgestaltet. Charaktere, Welten und Rechenarten
bleiben erhalten. Bereits gespeicherte Tagesgeschichten werden nicht rückwirkend
neu erzeugt oder geändert; die Korrekturen gelten für neu erzeugte Geschichten.

## Speicherprüfung, Fehlerbehandlung und Sicherung

Geladene Daten werden vor der Übernahme geprüft: Grundstruktur, bekannte
Speicherversion, Zahlenwerte, Runden, Gutscheine, Bereichssummen, Welt-/Musikwerte,
Bonusdatum, Tagesbereiche, Kartenkennungen, Antwortfelder und gespeicherte
Antworten. Doppelte Kartenkennungen, ungültige Aufgabenstrukturen und ungültige
Kalenderdaten werden ebenfalls erkannt. Fehlende optionale Werte erhalten die
bestehenden Standardwerte. Fehlende historische Aufgabenzahlen werden in der
Anzeige mit einem Strich statt `undefined` beziehungsweise `NaN` dargestellt.

Verwendbare Teile beschädigter Daten bleiben in der Sitzung zugänglich. Eine
unbrauchbare Tagesrunde wird nur in der Sitzung ausgespart; der beschädigte
Originalinhalt im Browser bleibt unverändert. Bei Parse-/Lesefehlern,
unbekannten zukünftigen Versionen, beschädigten Werten oder einem Fehler während
der Migration wird automatisches Zurückschreiben für diese Sitzung gesperrt.
Die Migration übernimmt ihren Kandidaten erst nach vollständigem Erfolg.

Bei Schreibfehlern, etwa wegen voller oder verweigerter Speicherung, bleiben die
aktuellen Daten im Arbeitsspeicher und die Oberfläche zeigt einen verständlichen
Hinweis. Ein später erfolgreicher Schreibversuch kann diesen Fehler beheben.
Wiederholte identische Warntexte werden nicht ständig neu angekündigt.

Der Knopf **„Daten sichern“** lädt eine JSON-Datei herunter. Sie enthält:

- den aktuellen Sitzungsstand unter `daten`;
- den exakt ursprünglich gelesenen Speichertext unter `originalSpeicher`;
- eine Formatkennung zur Unterscheidung vom normalen Spielstand.

Damit bleibt auch syntaktisch beschädigter Speichertext in der Sicherung
unverändert erhalten. Wenn schon der Lesezugriff verweigert wird, kann der
ursprüngliche Inhalt nicht ausgelesen und folglich auch nicht exportiert werden;
in diesem Fall bleibt `originalSpeicher` null und die Sicherung enthält den
verfügbaren Sitzungsstand. Es gibt keinen automatischen Import oder eine
automatische Reparatur, die unbemerkt geschützte Originaldaten ersetzt.

Die Speicherkennung und Version 2 bleiben erhalten. Gültige Spielstände,
Lebenszeitsterne, Bonusguthaben, Gutscheine und historische Datumsangaben werden
nicht zurückgesetzt. Tatsächliche Browser-Spielstände wurden bei der Entwicklung
nicht geöffnet oder geändert; die Tests verwenden simulierte Speicher.

## Gebündelte Speicherung

Eingaben aktualisieren den Sitzungsstand sofort. Die vollständige Serialisierung
und Speicherung wird beim Tippen um 250 ms gebündelt. Reine Tastaturbewegungen
lösen keinen vollständigen Schreibvorgang mehr aus. Identische Daten werden
über einen Vergleich mit dem letzten erfolgreich gespeicherten Stand nicht
nochmals geschrieben.

Feldwechsel, Abschnittswechsel, Bewertung und andere bisher unmittelbare
Speicheraktionen bleiben unmittelbar. `pagehide` und der Wechsel des Dokuments
in den Hintergrund schreiben ausstehende Antworten ebenfalls sofort. Fehlerhafte
Schreibversuche gelten nicht als erfolgreich gespeichert und können erneut
versucht werden.

## Dialoge und Screenreader

Beide Überlagerungen besitzen Dialogrolle, `aria-modal` und einen zugänglichen
Titel. Der Neustartdialog verweist zusätzlich auf seinen Erklärungstext.

- Der Neustartdialog fokussiert zuerst „Abbrechen“, damit eine Bestätigung nicht
  versehentlich durch den nächsten Tastendruck erfolgt.
- Die Geschenkauswahl fokussiert die erste Auswahlmöglichkeit.
- Tab und Umschalt+Tab bleiben innerhalb des geöffneten Dialogs.
- Der Hintergrund ist währenddessen `inert` und damit nicht bedienbar.
- Escape schließt ohne Bestätigung. Die Bestätigungsaktion wird beim Abbrechen
  verworfen.
- Beim Schließen wird der Fokus zum Auslöser zurückgegeben. Nach einem
  Gutscheinumtausch erhält der weiterhin vorhandene Zurück-Knopf den Fokus,
  weil die Gutscheinansicht neu aufgebaut wird.
- Eine höfliche Live-Region meldet reguläre Ergebnisse und Bonusrückmeldungen.

## Audio, CSV und Downloadressourcen

In Doozies Welt wird jetzt `musik/doozie.mp3` tatsächlich versucht. Fehlt die
Datei, wird für diese Sitzung auf `musik/puppenhaus.mp3` zurückgefallen. Fehlt
auch diese, greift die vorhandene synthetische Ersatzmusik. Die bisherige
Videosperre und der Schutz vor parallelen Audioinstanzen bleiben erhalten.
Eine Doozie-Datei wurde nicht hinzugefügt.

CSV-Zellen werden bei Semikolons, Anführungszeichen und Zeilenumbrüchen korrekt
quotiert; enthaltene Anführungszeichen werden verdoppelt. Potenzielle Formeln
mit führendem `=`, `+`, `-` oder `@` werden als Text ausgegeben. Sowohl CSV- als
auch JSON-Downloads geben ihre Blob-URL nach einer kurzen Verzögerung frei,
auch wenn das Auslösen des Downloads fehlschlägt.

## Tatsächlich ausgeführte Tests

```text
node --test tests/phase1.test.cjs tests/phase2.test.cjs
node --test tests/phase1.test.cjs tests/phase2.test.cjs tests/phase3.test.cjs
node --check script.js
node --check geschichten.js
```

Ergebnis nach der Implementierung: **64 Tests bestanden, 0 fehlgeschlagen**.
Davon sind 39 unveränderte Regressionstests und 25 neue Phase-3-Tests. Beide
Syntaxprüfungen bestanden.

Die neuen Tests prüfen unter anderem:

- 6.000 zufällige Geschichtensets über alle drei Welten mit genau eingehaltenen
  Kategorien und Schwierigkeitsstufen;
- alle 93.308 zulässigen Kombinationen der Zahlenparameter aller 47 Vorlagen
  mit einer unabhängigen Lösungstabelle, ganzzahligen Ergebnissen und
  repräsentativen Uhrzeitkontexten;
- die bekannten unmöglichen Beispiele und die korrigierten eindeutigen Texte;
- Fehler beim Lesen, Schreiben und während der Migration, beschädigtes JSON,
  zukünftige Versionen, beschädigte verschachtelte Werte und fehlende Felder;
- Erhalt des Originalspeichers, Sicherungsinhalt und spätere Schreibwiederholung;
- gebündelte Eingaben, übersprungene identische Schreibvorgänge und sofortiges
  Speichern bei Feldwechsel, Ausblenden und Verlassen;
- CSV-Sonderzeichen, Formelschutz und URL-Freigabe bei Erfolg und Fehler;
- Doozie-Audio und Fallback ohne überlappende Wiedergabe;
- Dialogattribute, Tab/Umschalt+Tab, Escape, Bestätigen, Abbrechen, Geschenkwahl,
  Gutscheinumtausch, Fokus-Rückgabe und Ergebnis-Live-Region.

## Grenzen und offene Punkte

- DOM, Audio, Speicher und Downloads werden automatisiert simuliert. Die neue
  Testumgebung liest die tatsächliche HTML-Struktur ein, ersetzt aber keinen
  echten Browser-, Mobilgeräte- oder Screenreader-Test.
- Die vollständige Zahlenprüfung beweist keine allgemeine sprachliche oder
  pädagogische Eignung aller Text-/Figurenkombinationen. Die Texte wurden
  zusätzlich inhaltlich geprüft und nur bei konkreten Unklarheiten geändert.
- Ein harter Browser-/Systemabsturz während des kurzen Bündelungsfensters kann
  die allerletzten, noch nicht geschriebenen Zeichen verlieren. Die normalen
  Fokus-/Seiten-Lebenszyklusereignisse sind abgesichert. Kein lokaler Speicher
  kann einen erfolgreichen Schreibvorgang bei verweigertem Zugriff garantieren.
- Bei beschädigten Daten bleibt automatisches Speichern bewusst gesperrt,
  bis die Ursache außerhalb dieser Sitzung behoben wurde. Die Sicherung ist
  dafür vorgesehen; eine automatische Wiederherstellung ist nicht enthalten.
- Früher bereits entfernte Runden beziehungsweise Sterne sind ohne ältere
  Sicherung weiterhin nicht exakt rekonstruierbar.
