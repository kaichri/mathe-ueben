"use strict";
/* =========================================================================
   Tests für „Merge light“ (Spielstände zusammenführen).

   Regeln, die hier festgehalten werden:
   - Runden werden vereinigt (keine Doppelung, nichts geht verloren).
   - Lebenszeitsterne und Bereichssummen werden exakt addiert; der nicht mehr
     sichtbare Rest wird als Maximum übernommen.
   - Gutscheine werden vereinigt (keine Doppelung, Umtauschvermerk bleibt).
   - Tagesrunde: abgeschlossen vor offen, sonst das neuere Datum.
   - Bonus: verdiente Sterne vereinigt, Guthaben = Maximum.
   - Mehrfaches Zusammenführen derselben Datei ändert nichts mehr.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");

const JETZT = "2026-10-31T12:00:00Z";
const plain = v => JSON.parse(JSON.stringify(v));

function runde(zeit, sterne, extra) {
  return Object.assign({
    zeit: zeit, datum: zeit.slice(0, 10), uhrzeit: "12:00",
    richtig: sterne, gesamt: 5, modus: "bluey", bonus: true, bonusRichtig: sterne, bereiche: {}
  }, extra || {});
}
function spielstand(teile) {
  return Object.assign({
    version: 3, modus: "bluey", runden: [], zuletzt: [],
    knobelZuletzt: [], tagesSet: null, vortagSchluessel: [], bonusStufenOffen: [],
    bonusGesamt: 0, geschenke: [], bereichPunkte: {}, sound: "aus",
    bonusTag: null, bonusWelten: []
  }, teile);
}
function sicherung(daten) {
  return JSON.stringify({ format: "mathe-sicherung", daten: daten, originalSpeicher: null });
}
function findeId(n, id) {
  if (n.id === id) return n;
  for (const c of n.children || []) {
    const t = findeId(c, id);
    if (t) return t;
  }
  return null;
}
function oeffneSpielstand(g) {
  g.run("zeigeFortschritt('daten')");
  return g.nodes.get("spielstandInhalt");
}
function meldung(g) {
  const knoten = findeId(g.nodes.get("spielstandInhalt"), "spielstandMeldung");
  return knoten ? knoten.textContent : "";
}
function zusammenfuehren(g, text) {
  return plain(g.run("speicher.zusammenfuehren(" + JSON.stringify(text) + ")"));
}
function frageOffen(g) {
  return !g.nodes.get("frageUeberlagerung").hidden;
}

/* Zwei Stände mit getrennten, aber überlappenden Runden. */
const R1 = runde("2026-10-28T09:00:00.000Z", 5);
const R2 = runde("2026-10-29T09:00:00.000Z", 3);
const R3 = runde("2026-10-30T09:00:00.000Z", 5);
const R4 = runde("2026-10-31T09:00:00.000Z", 4);
function standLokal() {
  return spielstand({ bonusGesamt: 8, runden: [R1, R2] });
}
function standFremd() {
  return spielstand({ bonusGesamt: 14, runden: [R1, R3, R4] });
}

/* ------------------------------------------------------------- Grundregeln */

test("MERGE: getrennte Runden werden vereinigt, Sterne exakt addiert", () => {
  const g = game(standLokal(), { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(standFremd()));
  assert.equal(ergebnis.ok, true, ergebnis.grund);

  // R1 ist in beiden Ständen -> nur einmal. Dazu R2 (lokal), R3/R4 (fremd).
  assert.equal(ergebnis.daten.runden.length, 4);
  assert.deepEqual(ergebnis.daten.runden.map(r => r.zeit),
    [R1.zeit, R2.zeit, R3.zeit, R4.zeit]);
  // 5+3 (lokal) + 5+4 (fremd) = 17
  assert.equal(ergebnis.daten.bonusGesamt, 17);
  assert.deepEqual(ergebnis.vorschau, { runden: 2, sterne: 9, geschenke: 0 });
});

test("MERGE: keine lokalen Daten gehen verloren", () => {
  const g = game(standLokal(), { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(standFremd()));
  const vorhanden = new Set(ergebnis.daten.runden.map(r => r.zeit));
  for (const r of standLokal().runden) assert(vorhanden.has(r.zeit), "lokale Runde fehlt: " + r.zeit);
  for (const r of standFremd().runden) assert(vorhanden.has(r.zeit), "fremde Runde fehlt: " + r.zeit);
});

test("MERGE: eine gemeinsame Runde wird nicht doppelt gezählt", () => {
  const lokal = spielstand({ bonusGesamt: 5, runden: [R1] });
  const fremd = spielstand({ bonusGesamt: 5, runden: [R1] });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.daten.runden.length, 1);
  assert.equal(ergebnis.daten.bonusGesamt, 5);
  assert.deepEqual(ergebnis.vorschau, { runden: 0, sterne: 0, geschenke: 0 });
});

test("MERGE: zweimal dieselbe Datei ändert nichts mehr", () => {
  const erstes = zusammenfuehren(game(standLokal(), { now: JETZT }), sicherung(standFremd()));
  const zweites = zusammenfuehren(game(erstes.daten, { now: JETZT }), sicherung(standFremd()));
  assert.deepEqual(zweites.vorschau, { runden: 0, sterne: 0, geschenke: 0 });
  assert.equal(zweites.daten.bonusGesamt, erstes.daten.bonusGesamt);
});

/* ----------------------------------------------------------- abgeschnitten */

test("MERGE: abgeschnittene Historie verliert keine Lebenszeitsterne", () => {
  // Beide Stände haben einen Zähler über der sichtbaren Historie.
  const lokal = spielstand({ bonusGesamt: 500, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  const fremd = spielstand({ bonusGesamt: 300, runden: [runde("2026-10-29T09:00:00.000Z", 3)] });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  // unsichtbar: 495 und 297 -> Maximum 495, plus sichtbar 8
  assert.equal(ergebnis.daten.bonusGesamt, 503);
});

test("MERGE: mehr als 1.000 Runden werden gekürzt, Sterne bleiben erhalten", () => {
  const basis = Date.UTC(2026, 0, 1, 9);
  const viele = (start, anzahl) => Array.from({ length: anzahl }, (_, i) =>
    runde(new Date(basis + (start + i) * 3600000).toISOString(), 2));
  const lokal = spielstand({ bonusGesamt: 1200, runden: viele(0, 600) });
  const fremd = spielstand({ bonusGesamt: 1200, runden: viele(1000, 600) });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.daten.runden.length, 1000, "Historie muss auf 1.000 begrenzt sein");
  assert.equal(ergebnis.daten.bonusGesamt, 2400, "Sterne aller vereinigten Runden müssen zählen");
  // Die neuesten Runden bleiben erhalten.
  const zeiten = ergebnis.daten.runden.map(r => r.zeit);
  assert.equal(zeiten[zeiten.length - 1], new Date(basis + 1599 * 3600000).toISOString());
});

/* --------------------------------------------------------------- Gutscheine */

test("MERGE: Gutscheine werden ohne Doppelung vereinigt", () => {
  const lokal = spielstand({ runden: [], geschenke: [
    { id: "g1", zeitpunkt: "2026-10-28T10:00:00.000Z", datum: "2026-10-28", text: "Filmabend" }] });
  const fremd = spielstand({ runden: [], geschenke: [
    { id: "g1", zeitpunkt: "2026-10-28T10:00:00.000Z", datum: "2026-10-28", text: "Filmabend" },
    { id: "g2", zeitpunkt: "2026-10-29T10:00:00.000Z", datum: "2026-10-29", text: "Picknick" }] });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.daten.geschenke.length, 2);
  assert.deepEqual(ergebnis.daten.geschenke.map(x => x.text).sort(), ["Filmabend", "Picknick"]);
  assert.deepEqual(ergebnis.vorschau.geschenke, 1);
});

test("MERGE: Ein früherer Umtausch aktualisiert den ursprünglichen Gutschein", () => {
  const getauscht = { id: "g1", zeitpunkt: "2026-10-28T10:00:00.000Z", datum: "2026-10-28",
    text: "Filmabend", umgetauschtAm: "2026-10-29", neuerText: "Picknick" };
  const frisch = { id: "g1", zeitpunkt: "2026-10-28T10:00:00.000Z", datum: "2026-10-28", text: "Filmabend" };
  // Der lokale Stand kennt den Umtausch noch nicht, die Datei schon.
  const lokal = spielstand({ geschenke: [frisch] });
  const ersatz = { id: "g2", datum: "2026-10-29", text: "Picknick", umgetauschtVon: "g1" };
  const fremd = spielstand({ geschenke: [getauscht, ersatz] });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.daten.geschenke.length, 1);
  assert.equal(ergebnis.daten.geschenke[0].text, "Picknick");
  assert.equal(ergebnis.daten.geschenke[0].id, "g1");
  assert.equal(ergebnis.daten.geschenke[0].datum, "2026-10-28");
  assert.equal(ergebnis.daten.geschenke[0].umgetauschtAm, undefined);
});

/* --------------------------------------------------------------- Tagesrunde */

function tagesSet(datum, fertig, antworten) {
  return {
    datum: datum, welt: "bluey", fertig: fertig,
    runde: { bereiche: [{ bereich: "add", titel: "Addition", untertitel: "",
      aufgaben: [{ ident: "aufgabe-1", bereich: "add", layout: "einfach", darstellung: "3 + 4 =",
        text: "", schluessel: "add|3 + 4 =", felder: [{ korrekt: 7, typ: "zahl",
          beschriftung: "", darstellung: "", anzeige: "7", einheit: "" }] }] }] },
    antworten: antworten || {}, abschnitt: 0
  };
}

test("MERGE: gleicher Tag – die abgeschlossene Runde gewinnt", () => {
  const lokal = spielstand({ tagesSet: tagesSet("2026-10-31", false, { "aufgabe-1": ["7"] }) });
  const fremd = spielstand({ tagesSet: tagesSet("2026-10-31", true) });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.daten.tagesSet.fertig, true,
    "Eine abgeschlossene Tagesrunde muss gewinnen, sonst würde doppelt bewertet");
});

test("MERGE: unterschiedliche Tage – der neuere Tag gewinnt", () => {
  const lokal = spielstand({ tagesSet: tagesSet("2026-10-30", false, { "aufgabe-1": ["7"] }) });
  const fremd = spielstand({ tagesSet: tagesSet("2026-10-31", false, {}) });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.daten.tagesSet.datum, "2026-10-31");
});

/* -------------------------------------------------------- Bereiche und Bonus */

test("MERGE: Bereichssummen zählen gemeinsame Runden nur einmal", () => {
  const mitBereich = runde("2026-10-28T09:00:00.000Z", 5, { bereiche: { add: { richtig: 10, gesamt: 10 } } });
  const lokal = spielstand({ bonusGesamt: 5, runden: [mitBereich],
    bereichPunkte: { add: { richtig: 10, gesamt: 10 } } });
  const fremd = spielstand({ bonusGesamt: 10, runden: [
    mitBereich, runde("2026-10-29T09:00:00.000Z", 5, { bereiche: { add: { richtig: 8, gesamt: 10 } } })],
    bereichPunkte: { add: { richtig: 18, gesamt: 20 } } });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.deepEqual(ergebnis.daten.bereichPunkte.add, { richtig: 18, gesamt: 20 });
  assert.equal(ergebnis.daten.bonusGesamt, 10);
});

test("MERGE: Bonussterne werden ohne doppelte Runden vereinigt", () => {
  const bonusRunde = (zeit, anzahl) => runde(zeit, 0, { bonus: true, bonusRichtig: anzahl, richtig: anzahl, gesamt: 3 });
  const gemeinsam = bonusRunde("2026-10-28T09:00:00.000Z", 3);
  const lokal = spielstand({ bonusGesamt: 6, runden: [
    gemeinsam, bonusRunde("2026-10-28T10:00:00.000Z", 3)] });
  const fremd = spielstand({ bonusGesamt: 9, runden: [
    gemeinsam, bonusRunde("2026-10-28T10:00:00.000Z", 3), bonusRunde("2026-10-29T09:00:00.000Z", 3)] });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.daten.bonusGesamt, 9, "Verdiente Bonussterne dürfen nicht doppelt zählen");
  assert.deepEqual(ergebnis.daten.bonusStufenOffen, []);
});

/* -------------------------------------------------------- vortagSchluessel */

/* vortagSchluessel wächst am Ende (älteste zuerst). Beim Zusammenführen müssen
   die neuesten Ausschlüsse beider Geräte erhalten bleiben, auch wenn die
   Vereinigung länger als 300 Einträge wird. */
test("MERGE: vortagSchluessel behält die neuesten Ausschlüsse beider Geräte", () => {
  const alt = Array.from({ length: 300 }, (_, i) => "alt|" + i);
  const lokalNeu = ["lokal|neu1", "lokal|neu2"];
  const fremdNeu = ["fremd|neu1", "fremd|neu2"];
  const lokal = spielstand({ vortagSchluessel: alt.concat(lokalNeu) });
  const fremd = spielstand({ vortagSchluessel: alt.concat(fremdNeu) });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.ok, true, ergebnis.grund);
  const schluessel = ergebnis.daten.vortagSchluessel;
  assert.equal(schluessel.length, 300);
  for (const s of lokalNeu) assert(schluessel.includes(s), "lokaler Ausschluss fehlt: " + s);
  for (const s of fremdNeu) assert(schluessel.includes(s), "fremder Ausschluss fehlt: " + s);
  assert(!schluessel.includes("alt|0"), "Die ältesten Ausschlüsse fallen zuerst heraus");
});

test("MERGE: eigene neue vortagSchluessel bleiben auch ohne fremde Neuzugänge erhalten", () => {
  const alt = Array.from({ length: 300 }, (_, i) => "alt|" + i);
  const lokal = spielstand({ vortagSchluessel: alt.concat(["lokal|neu1", "lokal|neu2"]) });
  const fremd = spielstand({ vortagSchluessel: alt.slice() });
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  const schluessel = ergebnis.daten.vortagSchluessel;
  assert.equal(schluessel.length, 300);
  assert(schluessel.includes("lokal|neu1") && schluessel.includes("lokal|neu2"),
    "Die neuesten Ausschlüsse des eigenen Geräts müssen bleiben");
  assert(!schluessel.includes("alt|0") && !schluessel.includes("alt|1"));
});

/* ------------------------------------------------------------------ Fehler */

test("MERGE: ungültige Dateien ändern nichts", () => {
  const g = game(spielstand({ bonusGesamt: 7, runden: [R1] }), { now: JETZT });
  const vorher = g.raw();
  for (const text of ["{kaputt", "[]", '{"foo":1}', JSON.stringify({ version: 99, runden: [] })]) {
    const ergebnis = zusammenfuehren(g, text);
    assert.equal(ergebnis.ok, false, "Datei hätte abgelehnt werden müssen: " + text);
    assert(g.run("speicher.meldung()") === "", "Die Prüfung darf den Speicher nicht sperren");
    assert.equal(g.raw(), vorher);
  }
});

/* --------------------------------------------------------------- Bedienung */

test("MERGE: Knopf, Rückfrage, Sicherung und Neustart", () => {
  const g = game(standLokal(), { now: JETZT });
  oeffneSpielstand(g);
  assert(findeId(g.nodes.get("spielstandInhalt"), "spielstandMergeKnopf"), "Knopf zum Zusammenführen fehlt");
  assert(findeId(g.nodes.get("spielstandInhalt"), "spielstandLadenKnopf"), "Ladeknopf fehlt");

  g.run("fuehreSpielstaendeZusammen(" + JSON.stringify(sicherung(standFremd())) + ")");
  assert.equal(frageOffen(g), true, "Vor dem Zusammenführen muss gefragt werden");
  assert.match(g.nodes.get("frageText").textContent, /2 Runden/);
  assert.match(g.nodes.get("frageText").textContent, /9 Bonussterne/);
  assert.equal(g.nodes.get("frageJaKnopf").textContent, "Ja, zusammenführen");
  assert.equal(g.nodes.get("frageNeinKnopf").textContent, "Abbrechen");
  assert.equal(g.document.activeElement, g.nodes.get("frageNeinKnopf"),
    "Standardfokus muss auf Abbrechen liegen");

  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.reloads(), 1, "Nach dem Zusammenführen muss neu gestartet werden");
  assert.equal(g.saved().bonusGesamt, 17);
  assert.equal(g.saved().runden.length, 4);
  assert.equal(g.downloads.length, 1);
  assert.match(g.downloads[0].name, /^mathe-vor-merge-\d{4}-\d{2}-\d{2}\.json$/,
    "Vor dem Zusammenführen muss der alte Stand gesichert werden");
});

test("MERGE: Abbrechen ändert nichts", () => {
  const g = game(standLokal(), { now: JETZT });
  oeffneSpielstand(g);
  const vorher = g.raw();
  g.run("fuehreSpielstaendeZusammen(" + JSON.stringify(sicherung(standFremd())) + ")");
  g.nodes.get("frageNeinKnopf").emit("click");
  assert.equal(g.raw(), vorher);
  assert.equal(g.reloads(), 0);
});

test("MERGE: ohne Rettungssicherung wird nicht zusammengeführt", () => {
  const g = game(standLokal(), { now: JETZT, failDownload: true });
  oeffneSpielstand(g);
  const vorher = g.raw();
  g.run("fuehreSpielstaendeZusammen(" + JSON.stringify(sicherung(standFremd())) + ")");
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.raw(), vorher, "Ohne Sicherung darf nichts geschrieben werden");
  assert.equal(g.reloads(), 0);
  assert.match(meldung(g), /abgebrochen/);
});

test("MERGE: identische Stände melden, dass nichts zu ergänzen ist", () => {
  const g = game(standLokal(), { now: JETZT });
  oeffneSpielstand(g);
  g.run("fuehreSpielstaendeZusammen(" + JSON.stringify(sicherung(standLokal())) + ")");
  assert.equal(frageOffen(g), false, "Bei identischen Ständen darf kein Dialog kommen");
  assert.match(meldung(g), /nichts zu ergänzen/);
});
