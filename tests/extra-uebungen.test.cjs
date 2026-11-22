"use strict";
/* =========================================================================
   Tests für die 7 Mathe-Themen (mathe-themen.js) und die 5 selbstständigen
   Deutsch-Übungen (deutsch-uebungen.js) – Logik, Datenintegrität & UI.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");
const MATHE_THEMEN = require("../mathe-themen.js");
const DEUTSCH_UEBUNGEN = require("../deutsch-uebungen.js");

const JETZT = "2026-11-22T10:00:00Z";

/* =========================================================================
   1. MATHE-THEMEN: mathematische Korrektheit über viele Runden
   ========================================================================= */

test("MATHE-THEMEN: alle 7 Themen erzeugen gültige, eindeutige Aufgaben", () => {
  assert.equal(MATHE_THEMEN.THEMEN.length, 7);
  for (const thema of MATHE_THEMEN.THEMEN) {
    for (let r = 0; r < 30; r++) {
      const paket = MATHE_THEMEN.erzeuge(thema.id, ["bluey", "gabby", "doozie"][r % 3]);
      assert.equal(paket.aufgaben.length, thema.anzahl, thema.id + ": falsche Aufgabenanzahl");
      const schluessel = paket.aufgaben.map(a => a.schluessel);
      assert.equal(new Set(schluessel).size, schluessel.length, thema.id + ": doppelte Aufgabe in Runde");

      for (const a of paket.aufgaben) {
        if (a.typ === "felder") {
          assert(a.felder.length >= 1);
          for (const f of a.felder) {
            assert(Number.isInteger(f.korrekt) && f.korrekt >= 0, thema.id + ": ungültige Lösung");
          }
        } else if (a.typ === "auswahl") {
          assert(a.optionen.length >= 2);
          assert(a.richtig >= 0 && a.richtig < a.optionen.length);
        } else if (a.typ === "ordnen") {
          assert.equal(a.bausteine.length, a.loesung.length);
          const zahlen = a.loesung.map(Number);
          for (let i = 1; i < zahlen.length; i++) {
            assert(zahlen[i] > zahlen[i - 1], "Zahlen nicht streng aufsteigend: " + zahlen);
          }
        } else if (a.typ === "uhr-eingabe") {
          assert(a.uhr.stunde >= 1 && a.uhr.stunde <= 12);
          assert(a.uhr.minute >= 0 && a.uhr.minute < 60);
          assert(a.ziel.stunde >= 1 && a.ziel.stunde <= 12);
          assert(a.ziel.minute >= 0 && a.ziel.minute < 60);
        } else if (a.typ === "mauer") {
          const [sp, m1, m2, x, y, z] = a.steine.map(s => s.wert);
          assert.equal(m1, x + y, "Rechenmauer links falsch");
          assert.equal(m2, y + z, "Rechenmauer rechts falsch");
          assert.equal(sp, m1 + m2, "Rechenmauer Spitze falsch");
          assert(a.steine.some(s => s.offen), "Rechenmauer ohne offene Felder");
        } else if (a.typ === "dreieck") {
          const [i1, i2, i3] = a.innen.map(s => s.wert);
          const [a12, a23, a13] = a.aussen.map(s => s.wert);
          assert.equal(a12, i1 + i2, "Rechendreieck a12 falsch");
          assert.equal(a23, i2 + i3, "Rechendreieck a23 falsch");
          assert.equal(a13, i1 + i3, "Rechendreieck a13 falsch");
        } else if (a.typ === "schriftlich") {
          const erwartet = a.op === "+" ? a.a + a.b : a.a - a.b;
          assert.equal(a.ergebnis, erwartet, "Schriftlich Ergebnis falsch");
          assert(a.ergebnis >= 100 && a.ergebnis <= 999, "Ergebnis nicht dreistellig: " + a.ergebnis);
        } else {
          assert.fail("Unbekannter Aufgabentyp: " + a.typ);
        }
      }
    }
  }
});

test("MATHE-THEMEN: analoge Uhr akzeptiert 12h- und 24h-Format", () => {
  assert.equal(MATHE_THEMEN.uhrAntwortStimmt({ stunde: 3, minute: 25 }, { stunde: 3, minute: 25 }), true);
  assert.equal(MATHE_THEMEN.uhrAntwortStimmt({ stunde: 15, minute: 25 }, { stunde: 3, minute: 25 }), true);
  assert.equal(MATHE_THEMEN.uhrAntwortStimmt({ stunde: 0, minute: 15 }, { stunde: 12, minute: 15 }), true);
  assert.equal(MATHE_THEMEN.uhrAntwortStimmt({ stunde: 4, minute: 25 }, { stunde: 3, minute: 25 }), false);
});

/* =========================================================================
   2. DEUTSCH-ÜBUNGEN: Datenintegrität & Erzeugung
   ========================================================================= */

test("DEUTSCH-ÜBUNGEN: alle 5 Themen und Datenbestände sind widerspruchsfrei", () => {
  assert.equal(DEUTSCH_UEBUNGEN.THEMEN.length, 5);
  assert.deepEqual(DEUTSCH_UEBUNGEN.WORTARTEN_LABELS, [
    "Namenwort (Nomen)", "Tunwort (Verb)", "Wiewort (Adjektiv)"
  ]);

  for (const r of DEUTSCH_UEBUNGEN.RECHTSCHREIBUNG) {
    assert(r.satz.includes("___"), "Lücke fehlt: " + r.satz);
    assert(r.richtig >= 0 && r.richtig < r.optionen.length);
  }
  for (const w of DEUTSCH_UEBUNGEN.WORTARTEN) {
    assert(w.satz.includes("**" + w.wort + "**"), "Markierung fehlt: " + w.satz);
    assert([0, 1, 2].includes(w.art));
  }
  for (const s of DEUTSCH_UEBUNGEN.SATZBAU) {
    assert.equal(s.teile.join(" "), s.erklaerung, "Satzbau weicht ab: " + s.erklaerung);
  }
  for (const welt of ["hunde", "hamster", "weihnachten"]) {
    const passend = DEUTSCH_UEBUNGEN.LESETEXTE.filter(t => t.welt === welt);
    assert(passend.length >= 2, "Zu wenige Lesetexte für Welt " + welt);
    for (const t of passend) {
      assert.equal(t.fragen.length, 3);
      for (const f of t.fragen) {
        assert(f.richtig >= 0 && f.richtig < f.optionen.length);
      }
    }
  }
  for (const wt of DEUTSCH_UEBUNGEN.WORTTRAINING) {
    assert(wt.richtig >= 0 && wt.richtig < wt.optionen.length);
  }

  // Alle 5 Übungen erzeugen gültige Pakete; Leseverständnis vermeidet sofortige Wiederholung.
  for (const thema of DEUTSCH_UEBUNGEN.THEMEN) {
    const p1 = DEUTSCH_UEBUNGEN.erzeuge(thema.id, "hunde");
    assert(p1.aufgaben.length >= 3);
    if (thema.id === "lesen") {
      assert.equal(p1.lesetext.welt, "hunde");
      const p2 = DEUTSCH_UEBUNGEN.erzeuge("lesen", "hunde", p1.lesetext.id);
      assert.notEqual(p2.lesetext.id, p1.lesetext.id);
    }
  }
});

/* =========================================================================
   3. UI-INTEGRATION: Mathe-Themen & Deutsch-Übungen im DOM
   ========================================================================= */

test("UI: Mathe-Startseite zeigt alle 7 Mathe-Themen und bewertet ohne Bonussterne zu ändern", () => {
  const g = game({}, { now: JETZT });
  const kacheln = g.nodes.get("matheThemenListe").querySelectorAll(".themen-kachel");
  assert.equal(kacheln.length, 7);

  // Jedes Thema lässt sich öffnen und prüfen
  for (const thema of MATHE_THEMEN.THEMEN) {
    g.run("extraUebung.oeffneMatheThema('" + thema.id + "')");
    assert.equal(g.nodes.get("matheThemaBildschirm").hidden, false);
    assert.equal(g.nodes.get("startBildschirm").hidden, true);
    const inhalt = g.nodes.get("matheThemaInhalt");
    assert.match(inhalt.textContent, new RegExp(thema.titel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    const pruefen = inhalt.querySelector(".extra-pruefen");
    assert(pruefen, "Prüfen-Knopf fehlt bei " + thema.id);
    pruefen.emit("click");
    assert.equal(inhalt.querySelector(".extra-ergebnis").hidden, false);
    assert.equal(inhalt.querySelector(".extra-neu").hidden, false);
  }
  assert.equal(g.data().bonusGesamt, 0, "Extra-Übungen verändern keine Bonussterne");
  assert.equal(g.data().runden.length, 0, "Extra-Übungen verändern nicht die Quiz-Statistik");
});

test("UI: Deutsch-Übersicht zeigt 5 selbstständige Übungen inkl. Satzbau-Puzzle & Wortarten", () => {
  const g = game({}, { now: JETZT });
  g.nodes.get("deutschUmschalter").emit("click");
  const kacheln = g.nodes.get("sprechInhalt").querySelectorAll(".themen-kachel");
  assert.equal(kacheln.length, 5);

  // Wortarten öffnen und eine Option wählen
  kacheln[1].emit("click"); // wortarten
  const inhalt = g.nodes.get("sprechInhalt");
  assert.match(inhalt.textContent, /Namenwort \(Nomen\)/);
  assert.match(inhalt.textContent, /Tunwort \(Verb\)/);
  assert.match(inhalt.textContent, /Wiewort \(Adjektiv\)/);
  inhalt.querySelectorAll(".extra-option")[0].emit("click");
  inhalt.querySelector(".extra-pruefen").emit("click");
  assert.equal(inhalt.querySelector(".extra-ergebnis").hidden, false);

  // Satzbau-Puzzle öffnen, Bausteine anklicken & prüfen
  g.run("sprech.oeffneDeutschUebung('satzbau')");
  const chips = inhalt.querySelectorAll(".extra-ordnen-vorrat")[0].querySelectorAll(".extra-chip");
  assert(chips.length >= 4);
  chips[0].emit("click");
  assert.equal(inhalt.querySelectorAll(".extra-ordnen-ziel")[0].querySelectorAll(".extra-chip").length, 1);
  inhalt.querySelector(".extra-pruefen").emit("click");
  assert.equal(inhalt.querySelector(".extra-ergebnis").hidden, false);

  // Startseite-Knopf führt zurück zur Deutsch-Übersicht
  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(g.nodes.get("sprechInhalt").querySelectorAll(".themen-kachel").length, 5);
});
