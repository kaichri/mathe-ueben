"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");

const START = "2026-11-22T12:00:00Z";

test("Standard-Wunschliste enthält alle 6 neuen Gutscheine inklusive Freitext-Option", () => {
  const g = game({}, { now: START });
  const liste = JSON.parse(g.run("JSON.stringify(GESCHENKE)"));
  assert.deepEqual(liste, [
    { text: "Gemütlicher Familien-Filmabend mit Popcorn" },
    { text: "2 Stunden Videospiele spielen oder Lieblingsserie schauen" },
    { text: "Dein Lieblingsessen zu Hause oder ein Besuch im Restaurant" },
    { text: "Ein toller Familien-Ausflug nach deinem Wunsch" },
    { text: "Ein kleines Geschenk selbst aussuchen" },
    { text: "Eigener Wunsch – schreib deine Idee selbst auf!", freitext: true }
  ]);
});

test("Alte Standard-Gutscheine werden sinnvoll migriert, ohne eigene Texte zu verändern", () => {
  const alt = {
    version: 3,
    geschenke: [
      { id: "g1", datum: "2026-09-01", text: "Filmabend mit Popcorn" },
      { id: "g2", datum: "2026-09-02", text: "90 Minuten Film oder Serie anschauen" },
      { id: "g3", datum: "2026-09-03", text: "90 Minuten Videospiel spielen" },
      { id: "g4", datum: "2026-09-04", text: "Ein Geschenk für 2 €" },
      { id: "g5", datum: "2026-09-05", text: "Zwei Nächte mit Mama oder Papa schlafen" },
      { id: "g6", datum: "2026-09-06", text: "Wunsch frei – such dir etwas aus und sag es Mama!" },
      { id: "g7", datum: "2026-09-07", text: "Individueller Wunsch bleibt" },
      { datum: "2026-09-08", text: "Zwei Nächte mit Mama oder Papa schlafen" }
    ]
  };
  const g = game(alt, { now: START });
  const geschenke = JSON.parse(g.run("JSON.stringify(speicher.daten().geschenke)"));
  assert.deepEqual(geschenke.map(x => x.text), [
    "Gemütlicher Familien-Filmabend mit Popcorn",
    "2 Stunden Videospiele spielen oder Lieblingsserie schauen",
    "2 Stunden Videospiele spielen oder Lieblingsserie schauen",
    "Ein kleines Geschenk selbst aussuchen",
    "Eigener Wunsch: Zwei Nächte mit Mama oder Papa schlafen",
    "Eigener Wunsch",
    "Individueller Wunsch bleibt",
    "Eigener Wunsch: Zwei Nächte mit Mama oder Papa schlafen"
  ]);
  // Für Einträge ohne eigene ID bleibt urspruenglicherWunsch für den PC-Abgleich erhalten.
  assert.equal(geschenke[7].urspruenglicherWunsch, "Zwei Nächte mit Mama oder Papa schlafen");

  // Erneutes Laden verändert nichts mehr (idempotent).
  g.run("speicher.speichere()");
  const neu = game(g.saved(), { now: START });
  assert.deepEqual(
    JSON.parse(neu.run("JSON.stringify(speicher.daten().geschenke)")),
    geschenke
  );
});

test("Eigener Wunsch erlaubt Freitext beim Abholen und beim Umtauschen", () => {
  const g = game({ version: 3, bonusGesamt: 25, bonusStufenOffen: [25], geschenke: [] }, { now: START });
  g.run("geschenkAuswahlOeffnen()");
  const karten = g.nodes.get("geschenkeRaster").querySelectorAll(".geschenk-karte");
  const eigenerKnopf = karten.find(k => k.textContent.includes("Eigener Wunsch"));
  assert.ok(eigenerKnopf, "Eigener Wunsch-Karte fehlt");
  assert.equal(g.nodes.get("geschenkFreitextBox").hidden, true);

  eigenerKnopf.emit("click");
  assert.equal(g.nodes.get("geschenkFreitextBox").hidden, false);
  g.nodes.get("geschenkFreitextEingabe").value = "Eis essen am Hauptplatz";
  g.nodes.get("geschenkFreitextSpeichern").emit("click");

  assert.equal(g.nodes.get("geschenkUeberlagerung").hidden, true);
  assert.equal(g.saved().geschenke.length, 1);
  assert.equal(g.saved().geschenke[0].text, "Eigener Wunsch: Eis essen am Hauptplatz");

  // Umtausch mit leerem Freitext speichert schlicht "Eigener Wunsch".
  g.run("tauschGutscheinOeffnen(speicher.daten().geschenke[0].id)");
  const kartenTausch = g.nodes.get("geschenkeRaster").querySelectorAll(".geschenk-karte");
  kartenTausch.find(k => k.textContent.includes("Eigener Wunsch")).emit("click");
  g.nodes.get("geschenkFreitextEingabe").value = "   ";
  g.nodes.get("geschenkFreitextSpeichern").emit("click");
  assert.equal(g.saved().geschenke[0].text, "Eigener Wunsch");
});

test("Überraschung ziehen wählt zufällig einen festen Wunsch ohne Freitext", () => {
  const g = game({ version: 3, bonusGesamt: 25, bonusStufenOffen: [25], geschenke: [] }, { now: START });
  g.run("geschenkAuswahlOeffnen()");
  const knopf = g.nodes.get("geschenkUeberraschungKnopf");
  assert.equal(knopf.hidden, false);
  knopf.emit("click");

  assert.equal(g.nodes.get("geschenkUeberlagerung").hidden, true);
  assert.equal(g.saved().geschenke.length, 1);
  const festeWuensche = JSON.parse(g.run("JSON.stringify(GESCHENKE.filter(w => !w.freitext).map(w => w.text))"));
  assert.ok(festeWuensche.includes(g.saved().geschenke[0].text),
    "Gezogener Wunsch nicht in fester Liste: " + g.saved().geschenke[0].text);
});

test("Wunschliste lässt sich in den Einstellungen bearbeiten, zurücksetzen und zwischen PCs abgleichen", () => {
  const g = game({ version: 3 }, { now: START });
  g.run("zeigeFortschritt('geschenke')");
  const inhalt = g.nodes.get("geschenkeInhalt");

  // Neuen Wunsch hinzufügen
  const eingabe = inhalt.querySelector(".wunschliste-eingabe");
  eingabe.value = "Gemeinsam Pfannkuchen backen";
  inhalt.querySelectorAll("button").find(b => b.textContent === "+ Hinzufügen").emit("click");

  assert.ok(Array.isArray(g.saved().wunschListe));
  assert.ok(g.saved().wunschListe.some(w => w.text === "Gemeinsam Pfannkuchen backen"));
  assert.ok(g.saved().wunschListeZeit > 0);

  // Nach einem Neustart bleibt die eigene Wunschliste erhalten.
  const neuGeladen = game(g.saved(), { now: START });
  assert.ok(neuGeladen.data().wunschListe.some(w => w.text === "Gemeinsam Pfannkuchen backen"));

  // Ersten Wunsch entfernen
  const loeschKnoepfe = g.nodes.get("geschenkeInhalt").querySelectorAll(".wunschliste-loeschen");
  const vorher = g.saved().wunschListe.length;
  loeschKnoepfe[0].emit("click");
  assert.equal(g.saved().wunschListe.length, vorher - 1);

  // PC-Abgleich: neueres wunschListeZeit gewinnt auf dem zweiten PC
  const zweiterPC = game({ version: 3 }, { now: START });
  const merge1 = zweiterPC.run("speicher.zusammenfuehren(" + JSON.stringify(JSON.stringify(g.saved())) + ")");
  assert.equal(merge1.ok, true, merge1.grund);
  assert.ok(merge1.daten.wunschListe.some(w => w.text === "Gemeinsam Pfannkuchen backen"));

  // Zurücksetzen auf Standardliste setzt wunschListe auf null mit neuerem Zeitstempel
  g.time("2026-11-22T12:05:00Z");
  g.nodes.get("geschenkeInhalt").querySelectorAll("button")
    .find(b => b.textContent === "Standardliste wiederherstellen").emit("click");
  assert.equal(g.saved().wunschListe, null);

  // Nach dem Abgleich übernimmt auch der zweite PC das Zurücksetzen
  const zweiterAlt = game(merge1.daten, { now: "2026-11-22T12:05:00Z" });
  const merge2 = zweiterAlt.run("speicher.zusammenfuehren(" + JSON.stringify(JSON.stringify(g.saved())) + ")");
  assert.equal(merge2.ok, true, merge2.grund);
  assert.equal(merge2.daten.wunschListe, null);
});

test("Eltern-Bestätigung gilt nur fürs Einlösen und wird bei normalen Rückfragen zurückgesetzt", () => {
  const g = game({
    version: 3,
    geschenke: [{ id: "g1", datum: "2026-11-01", text: "Ein toller Familien-Ausflug nach deinem Wunsch" }]
  }, { now: START });

  g.run("zeigeFortschritt('geschenke')");
  const einloesen = g.nodes.get("geschenkeInhalt").querySelector(".gutschein-karte")
    .children.find(k => k.textContent === "Als eingelöst markieren");
  einloesen.emit("click");
  assert.equal(g.nodes.get("frageElternPruefung").hidden, false);
  assert.equal(g.nodes.get("frageJaKnopf").disabled, true);

  // Abbrechen setzt Eltern-Bestätigung zurück.
  g.nodes.get("frageNeinKnopf").emit("click");
  assert.equal(g.nodes.get("frageElternPruefung").hidden, true);
  assert.equal(g.nodes.get("frageJaKnopf").disabled, false);

  // Eine normale Rückfrage danach ist sofort ohne Haken klickbar.
  let ausgefuehrt = false;
  g.window.__testCallback = () => { ausgefuehrt = true; };
  g.run("zeigeFrage({ titel: 'Test', text: 'OK?', dann: window.__testCallback })");
  assert.equal(g.nodes.get("frageElternPruefung").hidden, true);
  assert.equal(g.nodes.get("frageJaKnopf").disabled, false);
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(ausgefuehrt, true);
});

test("Gutschein als JPG speichern zeichnet eine Bildkarte und lädt eine JPG-Datei herunter", () => {
  const g = game({
    version: 3,
    geschenke: [
      { id: "g1", datum: "2026-11-22", text: "Gemütlicher Familien-Filmabend mit Popcorn" },
      { id: "g2", datum: "2026-11-20", text: "Ein kleines Geschenk selbst aussuchen", eingeloestAm: "2026-11-21" }
    ]
  }, { now: START });

  // Fake-2D-Canvas-Kontext für den Testlauf bereitstellen (ohne window.print).
  let printAufgerufen = false;
  g.window.print = () => { printAufgerufen = true; };
  const texte = [];
  const origCreate = g.document.createElement;
  g.document.createElement = function (tag) {
    const knoten = origCreate.call(this, tag);
    if (tag === "canvas") {
      knoten.getContext = function (art) {
        if (art !== "2d") return null;
        return {
          createLinearGradient() { return { addColorStop() {} }; },
          fillRect() {}, stroke() {}, fill() {}, beginPath() {}, closePath() {},
          moveTo() {}, lineTo() {}, quadraticCurveTo() {}, ellipse() {},
          save() {}, restore() {}, translate() {}, rotate() {}, setLineDash() {},
          measureText(t) { return { width: String(t).length * 16 }; },
          fillText(t) { texte.push(String(t)); }
        };
      };
      knoten.toBlob = function (cb, mime) {
        cb(new g.window.Blob(["FAKE-JPEG-BYTES"], { type: mime }));
      };
    }
    return knoten;
  };

  g.run("zeigeFortschritt('geschenke')");
  const jpgKnoepfe = g.nodes.get("geschenkeInhalt").querySelectorAll("button")
    .filter(b => b.textContent.includes("Als JPG speichern"));
  assert.equal(jpgKnoepfe.length, 2);

  jpgKnoepfe[0].emit("click");
  jpgKnoepfe[1].emit("click");

  assert.equal(printAufgerufen, false, "Es darf nicht direkt gedruckt werden");
  assert.equal(g.downloads.length, 2);
  assert.match(g.downloads[0].name, /^gutschein-emma-2026-11-20-.*\.jpg$/);
  assert.equal(g.downloads[0].blob.type, "image/jpeg");
  assert.match(g.downloads[1].name, /^gutschein-emma-2026-11-22-gemuetlicher-familien-filmabend\.jpg$/);
  assert.ok(texte.some(t => t.includes("EINGELÖST")));
  assert.ok(texte.some(t => t.includes("Gemütlicher Familien-Filmabend")));
});
