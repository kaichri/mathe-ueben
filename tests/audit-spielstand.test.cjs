"use strict";
/* =========================================================================
   Tests für „Spielstand sichern“ und „Spielstand laden“ (Umzug auf einen
   anderen PC). Geprüft werden Dateiinhalt, Prüfung vor dem Überschreiben,
   Rettungssicherung, Rückfrage und der vollständige Rundlauf.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");

const JETZT = "2026-10-31T12:00:00Z";
const plain = v => JSON.parse(JSON.stringify(v));

function findeId(n, id) {
  if (n.id === id) return n;
  for (const c of n.children || []) {
    const t = findeId(c, id);
    if (t) return t;
  }
  return null;
}
function imSpielstandTab(g, id) {
  return findeId(g.nodes.get("spielstandInhalt"), id);
}
function oeffneSpielstand(g) {
  g.run("zeigeFortschritt('daten')");
  return g.nodes.get("spielstandInhalt");
}
function importiere(g, text) {
  g.run("importiereSpielstand(" + JSON.stringify(text) + ")");
}
function frageOffen(g) {
  return !g.nodes.get("frageUeberlagerung").hidden;
}
function meldung(g) {
  const knoten = findeId(g.nodes.get("spielstandInhalt"), "spielstandMeldung");
  return knoten ? knoten.textContent : "";
}

/* Baut einen Spielstand mit Fortschritt (5 Sterne, 1 Runde, 1 Gutschein). */
function spielstandMitFortschritt() {
  const g = game({ geschenke: [{ id: "g1", datum: "2026-10-30", text: "Filmabend" }] }, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(50);
  g.run("pruefeRunde()");
  return g;
}
function sicherungVon(g) {
  return JSON.stringify({ format: "mathe-sicherung", daten: g.data(), originalSpeicher: g.raw() });
}

/* ------------------------------------------------------------------ Export */

test("SPIELSTAND: Sichern erzeugt eine Datei mit dem aktuellen Stand", async () => {
  const g = spielstandMitFortschritt();
  oeffneSpielstand(g);
  const knopf = imSpielstandTab(g, "spielstandSichernKnopf");
  assert(knopf, "Sicherungsknopf fehlt im Spielstand-Reiter");
  knopf.emit("click");

  assert.equal(g.downloads.length, 1);
  const datei = g.downloads[0];
  assert.match(datei.name, /^mathe-spielstand-\d{4}-\d{2}-\d{2}\.json$/);
  const inhalt = JSON.parse(await datei.blob.text());
  assert.equal(inhalt.format, "mathe-sicherung");
  assert.equal(typeof inhalt.originalSpeicher, "string");
  assert.equal(inhalt.daten.sterneGesamt, 5);
  assert.equal(inhalt.daten.runden.length, 1);
  assert.equal(inhalt.daten.geschenke.length, 1);
});

function findeKnoten(n, treffer) {
  if (treffer(n)) return n;
  for (const c of n.children || []) {
    const t = findeKnoten(c, treffer);
    if (t) return t;
  }
  return null;
}

test("SPIELSTAND: Reiter zeigt den aktuellen Stand und beide Knöpfe", () => {
  const g = spielstandMitFortschritt();
  oeffneSpielstand(g);
  const reiter = g.nodes.get("fortschrittReiter");
  assert(findeKnoten(reiter, n => n.dataset && n.dataset.reiter === "daten"),
    "Reiter „Spielstand“ fehlt");
  assert.equal(g.nodes.get("spielstandInhalt").hidden, false);
  assert(imSpielstandTab(g, "spielstandSichernKnopf"));
  assert(imSpielstandTab(g, "spielstandLadenKnopf"));
  assert.match(g.nodes.get("spielstandInhalt").textContent, /5 Sterne/);
  // Beim Wechsel auf einen anderen Reiter wird der Inhalt geräumt.
  g.run("zeigeFortschritt('sterne')");
  assert.equal(g.nodes.get("spielstandInhalt").hidden, true);
});

/* --------------------------------------------------------------- Rundlauf */

test("SPIELSTAND: Sichern und auf einem leeren Gerät laden stellt alles wieder her", () => {
  const quelle = spielstandMitFortschritt();
  const text = sicherungVon(quelle);
  const erwartet = plain(quelle.data());

  const ziel = game({}, { now: JETZT });
  assert.equal(ziel.run("gesamtSterne()"), 0, "Zielgerät startet leer");
  importiere(ziel, text);
  assert.equal(frageOffen(ziel), true, "Vor dem Ersetzen muss gefragt werden");
  assert.match(ziel.nodes.get("frageText").textContent, /5 Sterne/);
  assert.match(ziel.nodes.get("frageText").textContent, /1 Runde/);
  assert.match(ziel.nodes.get("frageText").textContent, /1 Gutschein/);
  ziel.nodes.get("frageJaKnopf").emit("click");

  const gespeichert = ziel.saved();
  assert.equal(gespeichert.sterneGesamt, erwartet.sterneGesamt);
  assert.equal(gespeichert.bonusGesamt, erwartet.bonusGesamt);
  assert.equal(gespeichert.runden.length, erwartet.runden.length);
  assert.deepEqual(plain(gespeichert.geschenke), plain(erwartet.geschenke));
  assert.deepEqual(plain(gespeichert.bereichPunkte), plain(erwartet.bereichPunkte));
  assert.deepEqual(plain(gespeichert.tagesSet), plain(erwartet.tagesSet));
  assert.equal(ziel.reloads(), 1, "Nach dem Laden muss das Spiel neu starten");

  const nachher = game({}, { now: JETZT, raw: ziel.raw() });
  assert.equal(nachher.run("gesamtSterne()"), 5);
  assert.equal(nachher.run("speicher.meldung()"), "");
});

test("SPIELSTAND: ein roher Spielstand ohne Sicherungsrahmen wird akzeptiert", () => {
  const quelle = spielstandMitFortschritt();
  const ziel = game({}, { now: JETZT });
  importiere(ziel, quelle.raw());
  assert.equal(frageOffen(ziel), true);
  ziel.nodes.get("frageJaKnopf").emit("click");
  assert.equal(ziel.saved().sterneGesamt, 5);
});

/* -------------------------------------------------------------- Rückfrage */

test("SPIELSTAND: ohne Bestätigung wird nichts überschrieben", () => {
  const quelle = spielstandMitFortschritt();
  const ziel = game({}, { now: JETZT });
  ziel.run("speicher.daten().sterneGesamt = 2; speicher.speichere()");
  const vorher = ziel.raw();

  importiere(ziel, sicherungVon(quelle));
  assert.equal(frageOffen(ziel), true);
  assert.equal(ziel.raw(), vorher, "Vor der Bestätigung darf nichts geschrieben werden");
  assert.equal(ziel.reloads(), 0);

  ziel.nodes.get("frageNeinKnopf").emit("click");
  assert.equal(ziel.raw(), vorher, "Abbrechen darf nichts ändern");
  assert.equal(ziel.reloads(), 0);
  assert.equal(ziel.run("speicher.daten().sterneGesamt"), 2);
});

test("SPIELSTAND: der bisherige Stand wird vor dem Ersetzen gesichert", async () => {
  const quelle = spielstandMitFortschritt();
  const ziel = game({}, { now: JETZT });
  ziel.run("speicher.daten().sterneGesamt = 3; speicher.daten().geschenke.push({id: 'alt', datum: '2026-10-29', text: 'Alter Gutschein'}); speicher.speichere()");

  importiere(ziel, sicherungVon(quelle));
  ziel.nodes.get("frageJaKnopf").emit("click");

  assert.equal(ziel.downloads.length, 1, "Es muss genau eine Rettungssicherung geben");
  assert.match(ziel.downloads[0].name, /^mathe-vor-import-\d{4}-\d{2}-\d{2}\.json$/);
  const rettung = JSON.parse(await ziel.downloads[0].blob.text());
  assert.equal(rettung.daten.sterneGesamt, 3);
  assert.equal(rettung.daten.geschenke[0].text, "Alter Gutschein");
  assert.equal(ziel.saved().sterneGesamt, 5, "Danach gilt der importierte Stand");
});

/* --------------------------------------------------------- ungültige Datei */

test("SPIELSTAND: ungültige Dateien werden abgelehnt und nichts wird geändert", () => {
  const faelle = [
    ["kein JSON", "{kaputt"],
    ["leerer Text", ""],
    ["Array", "[]"],
    ["null", "null"],
    ["ohne bekannte Felder", '{"foo":"bar"}'],
    ["Sicherungsrahmen ohne Daten", '{"format":"mathe-sicherung"}'],
    ["Zukunftsversion", JSON.stringify({ version: 99, sterneGesamt: 50, runden: [] })],
    ["kaputte Runde", JSON.stringify({ sterneGesamt: 1, runden: [{ sterne: -1 }] })]
  ];
  for (const [name, text] of faelle) {
    const ziel = game({}, { now: JETZT });
    oeffneSpielstand(ziel);
    ziel.run("speicher.daten().sterneGesamt = 7; speicher.speichere()");
    const vorher = ziel.raw();
    importiere(ziel, text);
    assert.equal(frageOffen(ziel), false, name + ": es darf kein Bestätigungsdialog erscheinen");
    assert.equal(ziel.raw(), vorher, name + ": der Spielstand darf nicht verändert werden");
    assert.equal(ziel.reloads(), 0, name + ": kein Neustart");
    assert.match(meldung(ziel), /nicht geladen werden/, name + ": es muss eine Meldung geben");
    assert.match(ziel.nodes.get("rueckmeldung").textContent, /nicht geladen werden/,
      name + ": die Meldung muss auch angekündigt werden");
  }
});

test("SPIELSTAND: ein geschützter/beschädigter Speicher kann durch Import gerettet werden", () => {
  const quelle = spielstandMitFortschritt();
  const ziel = game({}, { raw: '{"runde":1}', now: JETZT });
  assert.equal(ziel.nodes.get("speicherHinweis").hidden, false, "Ausgangslage: Speicher geschützt");
  assert.match(ziel.run("speicher.meldung()"), /nicht gelesen/);

  importiere(ziel, sicherungVon(quelle));
  assert.equal(frageOffen(ziel), true, "Der Import muss trotz Schreibsperre möglich sein");
  ziel.nodes.get("frageJaKnopf").emit("click");
  assert.equal(ziel.saved().sterneGesamt, 5, "Der gerettete Stand muss geschrieben sein");
  assert.equal(ziel.reloads(), 1);
});

test("SPIELSTAND: alte Spielstände (Version 1) werden beim Import übernommen", () => {
  const alt = {
    version: 1,
    modus: "gabby",
    runden: [{ richtig: 50, gesamt: 50, sterne: 5, datum: "2026-10-20" }],
    geschenke: [{ id: "alt", datum: "2026-10-21", text: "Alter Gutschein" }],
    bonussterne: 2, bonusGesamt: 9
  };
  const ziel = game({}, { now: JETZT });
  importiere(ziel, JSON.stringify({ format: "mathe-sicherung", daten: alt, originalSpeicher: null }));
  assert.equal(frageOffen(ziel), true);
  ziel.nodes.get("frageJaKnopf").emit("click");
  const geladen = game({}, { now: JETZT, raw: ziel.raw() });
  assert.equal(geladen.run("gesamtSterne()"), 5);
  assert.equal(geladen.data().bonusGesamt, 9);
  assert.equal(geladen.data().geschenke[0].text, "Alter Gutschein");
  assert.equal(geladen.run("speicher.meldung()"), "");
});
