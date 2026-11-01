"use strict";
/* =========================================================================
   Regressionstests für die 15 Befunde aus reports/code-audit.md.

   Jeder Test prüft das KORRIGIERTE Verhalten. Vor der Korrektur schlugen
   diese Fälle fehl (damals als tests/audit-repros.test.cjs geführt).
   Erwartung: alle Tests grün.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");

const JETZT = "2026-10-31T12:00:00Z";
const plain = v => JSON.parse(JSON.stringify(v));

function kartenKnoten(n, treffer) {
  if (treffer(n)) return n;
  for (const c of n.children) { const t = kartenKnoten(c, treffer); if (t) return t; }
  return null;
}
function wiederholungsKnopf(g) {
  return kartenKnoten(g.nodes.get("ergebnisKasten"), n => n.type === "button" && /noch einmal/.test(n.textContent));
}
function dialogOffen(g, id) {
  return !g.nodes.get(id).hidden;
}
function frageDialogOffen(g) {
  return dialogOffen(g, "frageUeberlagerung");
}
/* Runde abschließen und eine eventuelle Rückfrage bestätigen. */
function abgeben(g) {
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  if (frageDialogOffen(g)) g.nodes.get("frageJaKnopf").emit("click");
}

/* ---------------------------------------------------------------- BEFUND-1 */
test("BEFUND-1: Wiederholungssterne richten sich nach der Aufgabenzahl", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(49);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.run("gesamtSterne()"), 5, "Ausgangslage: 49 von 50 ergibt 5 Sterne");
  const knopf = wiederholungsKnopf(g);
  assert(knopf, "Wiederholungsknopf fehlt");
  knopf.emit("click");
  assert.equal(g.run("runde.karten.length"), 1);
  g.fill(1);
  for (let i = 0; i < 3; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.data().runden.at(-1).sterne, 1,
    "Eine einzelne richtige Wiederholungsaufgabe muss genau einen Stern geben");
  assert.equal(g.run("gesamtSterne()"), 6);
});

test("BEFUND-1: größere Wiederholungsrunden bleiben verhältnismäßig", () => {
  // 4 Aufgaben richtig -> höchstens 2 Sterne
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(46);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  wiederholungsKnopf(g).emit("click");
  assert.equal(g.run("runde.karten.length"), 4);
  g.fill(4);
  for (let i = 0; i < 3; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.data().runden.at(-1).sterne, 2);

  // 10 Aufgaben richtig -> wieder die volle Spanne bis 5 Sterne
  const g2 = game({}, { now: JETZT });
  g2.run("zeigeRunde(neuesTagesSet())");
  g2.fill(40);
  for (let i = 0; i < 6; i++) g2.nodes.get("pruefenKnopf").emit("click");
  wiederholungsKnopf(g2).emit("click");
  assert.equal(g2.run("runde.karten.length"), 10);
  g2.fill(10);
  for (let i = 0; i < 3; i++) g2.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g2.data().runden.at(-1).sterne, 5);
});

/* ---------------------------------------------------------------- BEFUND-2 */
test("BEFUND-2: fast leere Runde wird nur nach Rückfrage abgegeben", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  const erstesFeld = g.run("kartenEingaben.get(runde.karten[0].ident)[0]");
  erstesFeld.value = "1";
  g.run("zeigeAbschnitt(5)");
  g.nodes.get("pruefenKnopf").emit("click");

  assert.equal(frageDialogOffen(g), true, "Es muss eine Rückfrage erscheinen");
  assert.equal(g.run("fertigAnsicht"), false, "Vor der Bestätigung darf nichts bewertet werden");
  assert.equal(g.data().runden.length, 0);
  assert.equal(erstesFeld.disabled, false, "Die Felder bleiben bis zur Bestätigung offen");
  assert.match(g.nodes.get("frageText").textContent, /49 von 50/);

  // Abbrechen: nichts passiert
  g.nodes.get("frageNeinKnopf").emit("click");
  assert.equal(frageDialogOffen(g), false);
  assert.equal(g.run("fertigAnsicht"), false);
  assert.equal(g.run("abgabeBestaetigt"), false);

  // Erneut abgeben und bestätigen
  g.nodes.get("pruefenKnopf").emit("click");
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.run("fertigAnsicht"), true);
  assert.equal(g.data().runden.length, 1);
  assert.equal(erstesFeld.disabled, true);
});

test("BEFUND-2: eine weitgehend ausgefüllte Runde wird nicht behelligt", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(49); // nur eine Aufgabe offen
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(frageDialogOffen(g), false);
  assert.equal(g.run("fertigAnsicht"), true);
});

/* ---------------------------------------------------------------- BEFUND-3 */
test("BEFUND-3: extern geleerter Speicher sperrt das Spiel nicht", () => {
  // Fall 1: Browserdaten gelöscht -> getItem liefert null
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(3);
  g.run("sichereTagesAntworten(); speicher.speichere()");
  g.run("window.localStorage.getItem = function () { return null; }");
  g.run("speicher.daten().sterneGesamt = 4; speicher.speichere()");
  assert.doesNotMatch(g.run("speicher.meldung()"), /anderen Fenster/,
    "Das Löschen der Browserdaten ist kein Mehrfenster-Konflikt");
  assert.equal(g.nodes.get("speicherHinweis").hidden, true);
  const gespeichert = JSON.parse(g.raw());
  assert.equal(gespeichert.sterneGesamt, 4, "Der Stand muss neu geschrieben werden");
  assert.equal(Object.keys(gespeichert.tagesSet.antworten).length, 3);

  // Fall 2: Eintrag wurde geleert (leerer String ist kein gültiger Spielstand)
  const g2 = game({}, { now: JETZT });
  g2.run("speicher.daten().sterneGesamt = 2; speicher.speichere()");
  g2.run("window.localStorage.setItem(SPEICHER_NAME, ''); speicher.daten().sterneGesamt = 7; speicher.speichere()");
  assert.doesNotMatch(g2.run("speicher.meldung()"), /anderen Fenster/);
  assert.equal(JSON.parse(g2.raw()).sterneGesamt, 7);
});

test("BEFUND-3: ein echter Mehrfenster-Konflikt wird weiterhin erkannt", () => {
  const g = game({}, { now: JETZT });
  g.run(`window.localStorage.setItem(SPEICHER_NAME, JSON.stringify(Object.assign({}, speicher.daten(), {sterneGesamt: 99})));
    speicher.daten().sterneGesamt = 1; speicher.speichere()`);
  assert.match(g.run("speicher.meldung()"), /anderen Fenster/);
  assert.equal(JSON.parse(g.raw()).sterneGesamt, 99, "Der neuere Stand darf nicht überschrieben werden");
});

/* ---------------------------------------------------------------- BEFUND-4 */
test("BEFUND-4: Fehlerliste weist Rest und Lücke korrekt aus", () => {
  const g = game({}, { now: JETZT });
  g.run(`const karten = [
      { ident: 'r1', bereich: 'div', layout: 'rest', darstellung: '54 \\u00F7 7 =', schluessel: 'x1',
        felder: [{korrekt: 7, anzeige: '7', typ: 'zahl', beschriftung: ''},
                  {korrekt: 5, anzeige: '5', typ: 'zahl', beschriftung: 'Rest'}] },
      { ident: 'l1', bereich: 'raetsel', layout: 'luecke', darstellung: '\\u25A1 + 27 = 85', schluessel: 'x2',
        felder: [{korrekt: 58, anzeige: '58', typ: 'zahl', beschriftung: '\\u25A1 = '}] }
    ];
    const rr = baueRunde([{ bereich: 'wiederholung', titel: 'Noch einmal üben', untertitel: '', aufgaben: karten }]);
    rr.bereichsArt = 'uebungen';
    zeigeRunde(rr);`);
  g.run("pruefeRunde()");
  const text = g.nodes.get("ergebnisKasten").textContent.replace(/\s+/g, " ");
  assert.doesNotMatch(text, /54 \u00F7 7 = 5/, "Der Rest darf nicht als zweites Ergebnis erscheinen");
  assert.match(text, /54 \u00F7 7 = 7 Rest 5/);
  assert.match(text, /\u25A1 = 58/);
});

/* ---------------------------------------------------------------- BEFUND-5 */
test("BEFUND-5: ohne offene Bonussterne startet keine neue Bonusrunde", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50); g.run("pruefeRunde()");
  g.run("zeigeRunde(baueBonusRunde('bluey'))"); g.fill(3); g.run("pruefeRunde()");
  assert.equal(g.run("bonusPlaetzeHeute()"), 0);
  assert.equal(g.nodes.get("neuKnopf").hidden, true, "Der Knopf muss bei 0 offenen Sternen verborgen sein");
  assert.equal(g.run("baueBonusRunde('bluey')"), null);
  const bonusZeilen = g.data().runden.filter(r => r.bonus).length;
  g.nodes.get("neuKnopf").emit("click");
  assert.equal(g.data().runden.filter(r => r.bonus).length, bonusZeilen);
});

/* ---------------------------------------------------------------- BEFUND-6 */
test("BEFUND-6: Altzeile ohne Sterne zeigt einen Strich statt 'undefined'", () => {
  const g = game({ runden: [{ richtig: 3, gesamt: 5, datum: "2026-10-01" }] }, { now: JETZT });
  g.run("zeigeFortschritt('sterne')");
  const text = g.nodes.get("sterneInhalt").textContent;
  assert.doesNotMatch(text, /undefined/, "Anzeige enthält 'undefined'");
  assert.match(text, /\u2605 \u2013/, "Erwartet wird '★ –'");
});

/* ---------------------------------------------------------------- BEFUND-7 */
test("BEFUND-7: ein Tag mit nur einer Bonusrunde gilt als geübt", () => {
  const g = game({ runden: [{ bonus: true, sterne: 0, bonusRichtig: 2, richtig: 2, gesamt: 3, datum: "2026-10-31" }] },
    { now: JETZT });
  const kalender = g.run("baueKalender(speicher.daten())");
  const punkte = kalender.children[1].children;
  const heute = punkte[punkte.length - 1];
  assert.doesNotMatch(heute.title, /nicht ge\u00fcbt/, "Tag mit Bonusrunde gilt als nicht geübt");
  assert.match(heute.className, /geuebt/);
  assert.match(kalender.children[2].textContent, /^1 Tag ge\u00fcbt/);
});

test("BEFUND-7: normale Sterntage bleiben unverändert beschriftet", () => {
  const g = game({ runden: [{ datum: "2026-10-31", sterne: 3 }] }, { now: JETZT });
  const kalender = g.run("baueKalender(speicher.daten())");
  const punkte = kalender.children[1].children;
  const heute = punkte[punkte.length - 1];
  assert.equal(heute.title, "31.10.2026: 3 Sterne");
  assert.match(heute.className, /n3/);
});

/* ---------------------------------------------------------------- BEFUND-8 */
test("BEFUND-8: Meldungen nennen das eingestellte Tageskontingent", () => {
  const g = game({}, { now: JETZT });
  g.run("EINSTELLUNGEN.bonusSterneProTag = 5; holBonusTag().verteilt = 5");
  const text = g.run("bonusTagesText()");
  assert.match(text, /5 neue/);
  assert.doesNotMatch(text, /3 neue/);
  g.run("aktualisiereBonusweltKnoepfe()");
  const knopf = g.run("document.querySelectorAll('.bonus-welt-knopf')[0]");
  assert.match(knopf.querySelector(".bonus-welt-status").textContent, /5 neue/);
  assert.doesNotMatch(knopf.querySelector(".bonus-welt-status").textContent, /Bonus-kontingent/);
});

/* ---------------------------------------------------------------- BEFUND-9 */
test("BEFUND-9: der Geschichten-Merkzettel bleibt duplikatfrei", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(g.run("runde.karten.length") - 1);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  const vorher = plain(g.data().zuletzt);
  wiederholungsKnopf(g).emit("click");
  assert(g.run("runde.karten.some(k => k.vorlage)"), "Wiederholung enthält keine Geschichte");
  g.fill(g.run("runde.karten.length"));
  for (let i = 0; i < 3; i++) g.nodes.get("pruefenKnopf").emit("click");
  const zuletzt = plain(g.data().zuletzt);
  assert.equal(new Set(zuletzt).size, zuletzt.length, "Merkzettel enthält Duplikate: " + JSON.stringify(zuletzt));
  assert.equal(zuletzt[0], vorher[vorher.length - 1], "Die wiederholte Geschichte steht jetzt vorn");
  assert(zuletzt.length <= 12);
});

/* --------------------------------------------------------------- BEFUND-10 */
test("BEFUND-10: die Startseite meldet eine Bonusrunde als Bonusrunde", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50); g.run("pruefeRunde(); versteckeKino()");
  g.run("zeigeRunde(baueBonusRunde('bluey'))"); g.fill(2); g.run("pruefeRunde()");
  g.nodes.get("abbruchKnopf").emit("click");
  const text = g.nodes.get("startErgebnis").textContent.replace(/\s+/g, " ");
  assert.doesNotMatch(text, /0 Sterne/, "Startseite meldet für die Bonusrunde 0 Sterne");
  assert.match(text, /Letzte Bonusrunde: 2 von 3 geknobelt/);
  assert.match(text, /\uD83C\uDF1F 2 Bonussterne/);
});

/* --------------------------------------------------------------- BEFUND-11 */
test("BEFUND-11: Tageswechsel fragt vor dem Verwerfen offener Antworten", () => {
  const g = game({}, { now: "2026-10-31T22:55:00Z" }); // 23:55 Wien
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(4);
  g.run("sichereTagesAntworten()");
  const alteDatum = g.data().tagesSet.datum;
  g.time("2026-10-31T23:10:00Z"); // 00:10 Wien am Folgetag
  g.nodes.get("startBildschirm").hidden = false;
  g.nodes.get("losKnopf").emit("click");

  assert.equal(frageDialogOffen(g), true, "Es muss eine Rückfrage erscheinen");
  assert.match(g.nodes.get("frageText").textContent, /4 von 50/);
  // Abbrechen: die alte Runde bleibt erhalten
  g.nodes.get("frageNeinKnopf").emit("click");
  assert.equal(g.data().tagesSet.datum, alteDatum);
  assert.equal(Object.keys(g.data().tagesSet.antworten).length, 4);
  // Bestätigen: neue Aufgaben, Antworten verworfen, Sterne/Gutscheine bleiben
  g.nodes.get("losKnopf").emit("click");
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.data().tagesSet.datum, "2026-11-01");
  assert.equal(Object.keys(g.data().tagesSet.antworten).length, 0);
});

/* --------------------------------------------------------------- BEFUND-12 */
test("BEFUND-12: Zeitangaben sind auch ohne Trennzeichen eingebbar", () => {
  const g = game({}, { now: JETZT });
  const feld = g.run("neuesEingabefeld({typ: 'zeit', korrekt: 565, zeit: {stunde: 9, minute: 25}, anzeige: '9:25 Uhr'}, {ident: 'probe'})");
  assert.notEqual(feld.inputMode, "numeric", "Zeitfeld darf keine reine Zifferntastatur anfordern");
  assert.deepEqual(plain(g.run("parseZeit('925')")), { stunde: 9, minute: 25 });
  assert.deepEqual(plain(g.run("parseZeit('1025')")), { stunde: 10, minute: 25 });
  assert.deepEqual(plain(g.run("parseZeit('9:25')")), { stunde: 9, minute: 25 });
  assert.equal(g.run("parseZeit('2560')"), null, "Ungültige Kompaktangabe muss abgelehnt werden");
  assert.equal(g.run("parseZeit('25')"), null);
  // und die Bewertung akzeptiert die Kompaktform
  assert.equal(g.run(`feldIstRichtig({typ: 'zeit', zeit: {stunde: 9, minute: 25}}, '925')`), true);
});

/* --------------------------------------------------------------- BEFUND-13 */
test("BEFUND-13: eine abgeschlossene Tagesrunde wird nicht erneut bewertet", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.run("gesamtSterne()"), 5);
  g.nodes.get("abbruchKnopf").emit("click");
  g.run("zeigeRunde(rundeAusSet(speicher.daten().tagesSet))");
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.run("gesamtSterne()"), 5, "Die fertige Runde wurde erneut belohnt");
  assert.equal(g.data().runden.length, 1);
});

/* --------------------------------------------------------------- BEFUND-14 */
test("BEFUND-14: gültiges JSON ohne bekannte Felder bleibt geschützt", () => {
  for (const raw of ['{"runde":1}', "{}", '{"foo":"bar"}']) {
    const g = game({}, { raw, now: JETZT });
    g.run("speicher.speichere()");
    assert.equal(g.raw(), raw, "Vorhandener Speicherinhalt wurde überschrieben: " + raw);
    assert.equal(g.nodes.get("speicherHinweis").hidden, false, "Kein Hinweis auf unlesbare Daten");
    assert(g.run("speicher.meldung()").length > 0);
  }
});

test("BEFUND-14: echte Spielstände werden weiterhin normal geladen", () => {
  const quelle = game({}, { now: JETZT });
  quelle.run("zeigeRunde(neuesTagesSet())");
  quelle.fill(5);
  quelle.run("sichereTagesAntworten(); speicher.daten().sterneGesamt = 12; speicher.speichere()");
  const g = game({}, { raw: quelle.raw(), now: JETZT });
  assert.equal(g.run("speicher.meldung()"), "");
  assert.equal(g.run("gesamtSterne()"), 12);
  assert.equal(Object.keys(g.data().tagesSet.antworten).length, 5);
});

/* --------------------------------------------------------------- BEFUND-15 */
test("BEFUND-15: Einzahl bei genau einer fehlenden Aufgabe", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(24);
  abgeben(g);
  const text = g.nodes.get("ergebnisKasten").textContent;
  assert.doesNotMatch(text, /1 richtige Aufgaben/);
  assert.match(text, /Noch 1 richtige Aufgabe /);
});

test("BEFUND-15: Mehrzahl bleibt korrekt", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(20);
  abgeben(g);
  assert.match(g.nodes.get("ergebnisKasten").textContent, /Noch 5 richtige Aufgaben/);
});
