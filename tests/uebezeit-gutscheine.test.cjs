"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");

const START = "2026-11-02T15:00:00Z";

test("Übezeit bleibt pro Abschnitt erhalten und zählt im Hintergrund nicht weiter", () => {
  const alt = { datum: "2026-11-01", gesamt: 50, richtig: 44, sterne: 4 };
  const g = game({ version: 2, runden: [alt] }, { now: START });
  g.nodes.get("losKnopf").emit("click");
  g.time("2026-11-02T15:00:12Z");
  g.nodes.get("pruefenKnopf").emit("click");
  g.time("2026-11-02T15:00:20Z");
  g.visibility();
  g.time("2026-11-02T15:05:00Z");
  g.pagehide();

  const neu = game(g.saved(), { now: "2026-11-02T15:05:00Z" });
  neu.nodes.get("losKnopf").emit("click");
  neu.time("2026-11-02T15:05:04Z");
  neu.fill(50);
  neu.run("pruefeRunde()");

  const [altGespeichert, eintrag] = neu.saved().runden;
  assert.deepEqual(altGespeichert, { datum: alt.datum, gesamt: alt.gesamt, richtig: alt.richtig });
  assert.deepEqual(eintrag.uebezeiten, { add: 12000, sub: 12000 });
  neu.nodes.get("statistikKnopf").emit("click");
  assert.match(neu.nodes.get("statistikInhalt").textContent, /1 von 2 Runden mit Zeitmessung/);
  assert.match(neu.nodes.get("statistikInhalt").textContent, /Subtraktion: 0:12/);
});

test("Einlösen speichert das Datum und sperrt Umtausch auch nach erneutem Laden", () => {
  const gutschein = { id: "g1", text: "Spieleabend", datum: "2026-07-01" };
  const g = game({ version: 2, geschenke: [gutschein] }, { now: START });
  assert.equal(g.nodes.get("offeneGutscheine").textContent, "1");
  g.run("zeigeFortschritt('geschenke')");
  const inhalt = g.nodes.get("geschenkeInhalt");
  assert.match(inhalt.textContent, /Anderes aussuchen/);
  const knopf = inhalt.querySelector(".gutschein-karte").children.find(k => k.textContent === "Als eingelöst markieren");
  knopf.emit("click");
  g.nodes.get("frageNeinKnopf").emit("click");
  assert.equal(g.data().geschenke[0].eingeloestAm, undefined);
  knopf.emit("click");
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.nodes.get("offeneGutscheine").textContent, "0");
  const neu = game(g.saved(), { now: START });
  neu.run("zeigeFortschritt('geschenke')");
  const text = neu.nodes.get("geschenkeInhalt").textContent;
  assert.match(text, /Eingelöst am 02.11.2026/);
  assert.doesNotMatch(text, /Anderes aussuchen|Als eingelöst markieren/);
  assert.equal(neu.data().geschenke.length, 1);
});

test("Zusammenführen behält Zeitmessung und Einlösedatum aus dem neueren Stand", () => {
  const runde = { zeit: START, richtig: 50, gesamt: 50, sterne: 5 };
  const gutschein = { id: "g1", text: "Spieleabend", datum: "2026-07-01" };
  const alt = { version: 2, runden: [runde], geschenke: [gutschein] };
  const neu = {
    version: 2,
    runden: [{ ...runde, uebezeiten: { add: 12000 } }],
    geschenke: [{ ...gutschein, eingeloestAm: "2026-11-02" }]
  };
  for (const [lokal, fremd] of [[alt, neu], [neu, alt]]) {
    const g = game(lokal, { now: START });
    const ergebnis = g.run("speicher.zusammenfuehren(" + JSON.stringify(JSON.stringify(fremd)) + ")");
    assert.equal(ergebnis.ok, true, ergebnis.grund);
    assert.equal(ergebnis.daten.runden.length, 1);
    assert.equal(ergebnis.daten.runden[0].uebezeiten.add, 12000);
    assert.equal(ergebnis.daten.geschenke.length, 1);
    assert.equal(ergebnis.daten.geschenke[0].eingeloestAm, "2026-11-02");
  }
});

test("Die Bonusrunde bleibt mit Antworten, Übezeit und vergebenen Sternen beim Abgleich erhalten", () => {
  const g = game({}, { now: START });
  g.run("schalteWeltFrei('bluey'); startBonusWelt('bluey')");
  g.fill(1);
  g.time("2026-11-02T15:00:10Z");
  g.run("sichereTagesAntworten()");
  const vorPruefung = g.saved();
  assert.equal(Object.keys(vorPruefung.bonusSet.antworten).length, 1);
  assert.equal(vorPruefung.bonusSet.uebezeiten.bonus, 10000);

  const zweiterPC = game({}, { now: START });
  const abgleich = zweiterPC.run("speicher.zusammenfuehren(" + JSON.stringify(JSON.stringify(vorPruefung)) + ")");
  assert.equal(abgleich.ok, true, abgleich.grund);
  const fortgesetzt = game(abgleich.daten, { now: START });
  fortgesetzt.run("startBonusWelt('bluey')");
  assert.equal(fortgesetzt.run("runde.bonusSet.id"), vorPruefung.bonusSet.id);
  assert.deepEqual(fortgesetzt.saved().bonusSet.antworten, vorPruefung.bonusSet.antworten);
  fortgesetzt.run("pruefeRunde()");
  assert.equal(fortgesetzt.saved().bonusGesamt, 1);

  const nachPruefung = game(fortgesetzt.saved(), { now: START });
  nachPruefung.run("startBonusWelt('bluey')");
  assert.equal(nachPruefung.run("kartenEingaben.get(runde.karten[0].ident)[0].disabled"), true);
  nachPruefung.run("pruefeRunde()");
  assert.equal(nachPruefung.saved().bonusGesamt, 1);
  assert.equal(nachPruefung.saved().runden.length, 1);

  g.run("pruefeRunde()");
  const zusammen = nachPruefung.run("speicher.zusammenfuehren(" + JSON.stringify(JSON.stringify(g.saved())) + ")");
  assert.equal(zusammen.ok, true, zusammen.grund);
  assert.equal(zusammen.daten.bonusGesamt, 1);
  assert.equal(zusammen.daten.runden.length, 1);
});

test("Alte Bonussterne bleiben erhalten und nur die nächste Stufe bringt einen Gutschein", () => {
  const alt = {
    version: 2, sterneGesamt: 500, bonussterne: 4, bonusGesamt: 74,
    geschenke: [{ id: "g1", datum: "2026-10-01", text: "Spieleabend" }],
    bonusTag: { datum: "2026-11-02", verteilt: 2 }, bonusWelten: ["bluey"]
  };
  const g = game(alt, { now: START });
  assert.equal(g.saved().bonusGesamt, 74);
  assert.equal(g.saved().sterneGesamt, undefined);
  assert.deepEqual(g.saved().bonusStufenOffen, []);
  assert.equal(g.saved().geschenke.length, 1);
  assert.equal(g.run("weltHeuteFreigeschaltet('bluey')"), false);

  g.nodes.get("losKnopf").emit("click");
  g.fill(45);
  g.run("pruefeRunde()");
  g.nodes.get("frageJaKnopf").emit("click");
  g.nodes.get("abbruchKnopf").emit("click");
  g.nodes.get("losKnopf").emit("click");
  assert.equal(g.run("runde.karten.length"), 3, "Zwei Bonussterne sind an diesem Tag schon vergeben");
  g.fill(1);
  g.run("pruefeRunde(); pruefeRunde()");
  assert.equal(g.saved().bonusGesamt, 75);
  assert.deepEqual(g.saved().bonusStufenOffen, [75]);

  const neu = game(g.saved(), { now: START });
  neu.nodes.get("gutscheinZaehlerKnopf").emit("click");
  const abholen = neu.nodes.get("geschenkeInhalt").children.find(n => n.textContent === "Gutschein abholen");
  abholen.emit("click");
  neu.document.activeElement.emit("click");
  assert.equal(neu.saved().bonusGesamt, 75);
  assert.equal(neu.saved().geschenke[0].text, "Spieleabend");
  assert.equal(neu.saved().geschenke[1].id, "bonus-stufe-75");
  assert.deepEqual(neu.saved().bonusStufenOffen, []);
  neu.run("geschenkGewaehlt('Zweiter Gutschein')");
  assert.equal(neu.saved().geschenke.length, 2);
});
