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

test("DEUTSCH-ÜBUNGEN: alle 5 Themen und 245 Datenbestände sind widerspruchsfrei und duplikatfrei", () => {
  assert.equal(DEUTSCH_UEBUNGEN.THEMEN.length, 5);
  assert.deepEqual(DEUTSCH_UEBUNGEN.WORTARTEN_LABELS, [
    "Namenwort (Nomen)", "Tunwort (Verb)", "Wiewort (Adjektiv)"
  ]);

  // 1. Rechtschreib-Detektiv (70 Aufgaben, keine doppelten Sätze)
  assert.equal(DEUTSCH_UEBUNGEN.RECHTSCHREIBUNG.length, 70);
  const rsSaetze = new Set();
  for (const r of DEUTSCH_UEBUNGEN.RECHTSCHREIBUNG) {
    assert(r.satz.includes("___"), "Lücke fehlt: " + r.satz);
    assert(!rsSaetze.has(r.satz), "Doppelter Rechtschreib-Satz: " + r.satz);
    rsSaetze.add(r.satz);
    assert.equal(r.optionen.length, 2, "Genau 2 Optionen erwartet: " + r.satz);
    assert.notEqual(r.optionen[0], r.optionen[1], "Identische Optionen: " + r.satz);
    assert(r.richtig >= 0 && r.richtig < r.optionen.length);
    assert(typeof r.regel === "string" && r.regel.length > 0);
    assert(typeof r.erklaerung === "string" && r.erklaerung.length > 10);
  }
  const katze = DEUTSCH_UEBUNGEN.RECHTSCHREIBUNG.find(r => r.optionen.includes("Katze"));
  assert.equal(katze.regel, "tz oder z?");

  // 2. Wortarten (60 Aufgaben, ausgewogen 20/20/20, keine doppelten Sätze)
  assert.equal(DEUTSCH_UEBUNGEN.WORTARTEN.length, 60);
  const waSaetze = new Set();
  const waZaehler = [0, 0, 0];
  for (const w of DEUTSCH_UEBUNGEN.WORTARTEN) {
    assert(w.satz.includes("**" + w.wort + "**"), "Markierung fehlt: " + w.satz);
    assert(!waSaetze.has(w.satz), "Doppelter Wortarten-Satz: " + w.satz);
    waSaetze.add(w.satz);
    assert([0, 1, 2].includes(w.art));
    waZaehler[w.art] += 1;
    assert(typeof w.erklaerung === "string" && w.erklaerung.length > 10);
  }
  assert.deepEqual(waZaehler, [20, 20, 20]);

  // 3. Satzbau-Puzzle (40 eindeutige Sätze)
  assert.equal(DEUTSCH_UEBUNGEN.SATZBAU.length, 40);
  const sbSaetze = new Set();
  for (const s of DEUTSCH_UEBUNGEN.SATZBAU) {
    assert(s.teile.length >= 4 && s.teile.length <= 5, "Baustein-Anzahl unerwartet: " + s.erklaerung);
    assert.equal(s.teile.join(" "), s.erklaerung, "Satzbau weicht ab: " + s.erklaerung);
    assert(s.teile[s.teile.length - 1].endsWith("."), "Satzpunkt fehlt: " + s.erklaerung);
    assert(!sbSaetze.has(s.erklaerung), "Doppelter Satzbau-Satz: " + s.erklaerung);
    sbSaetze.add(s.erklaerung);
  }

  // 4. Leseverständnis (15 Geschichten, je 5 pro Welt)
  assert.equal(DEUTSCH_UEBUNGEN.LESETEXTE.length, 15);
  const leseIds = new Set();
  const leseTitel = new Set();
  for (const welt of ["hunde", "hamster", "weihnachten"]) {
    const passend = DEUTSCH_UEBUNGEN.LESETEXTE.filter(t => t.welt === welt);
    assert.equal(passend.length, 5, "Genau 5 Lesetexte pro Welt erwartet für " + welt);
    for (const t of passend) {
      assert(!leseIds.has(t.id), "Doppelte Lesetext-ID: " + t.id);
      assert(!leseTitel.has(t.titel), "Doppelter Lesetext-Titel: " + t.titel);
      leseIds.add(t.id);
      leseTitel.add(t.titel);
      assert(t.text.length >= 180, "Lesetext zu kurz: " + t.titel);
      assert.equal(t.fragen.length, 3);
      for (const f of t.fragen) {
        assert.equal(f.optionen.length, 3);
        assert.equal(new Set(f.optionen).size, 3, "Doppelte Antwortoption in " + t.titel);
        assert(f.richtig >= 0 && f.richtig < f.optionen.length);
        assert(typeof f.erklaerung === "string" && f.erklaerung.length > 5);
      }
    }
  }

  // 5. Wort-Training (60 Aufgaben, je 15 pro Kategorie)
  assert.equal(DEUTSCH_UEBUNGEN.WORTTRAINING.length, 60);
  const wtFragen = new Set();
  const wtKat = {};
  for (const wt of DEUTSCH_UEBUNGEN.WORTTRAINING) {
    assert(!wtFragen.has(wt.frage), "Doppelte Wort-Training-Frage: " + wt.frage);
    wtFragen.add(wt.frage);
    assert.equal(wt.optionen.length, 3);
    assert.equal(new Set(wt.optionen).size, 3, "Doppelte Optionen bei: " + wt.frage);
    assert(wt.richtig >= 0 && wt.richtig < wt.optionen.length);
    assert(typeof wt.erklaerung === "string" && wt.erklaerung.length > 5);
    wtKat[wt.kategorie] = (wtKat[wt.kategorie] || 0) + 1;
  }
  assert.deepEqual(wtKat, { Gegenteil: 15, Mehrzahl: 15, Wortfamilie: 15, Vergangenheit: 15 });
});

test("DEUTSCH-ÜBUNGEN: aufeinanderfolgende Runden vermeiden direkte Wiederholungen und mischen Satzbau", () => {
  for (const id of ["rechtschreibung", "wortarten", "satzbau", "worttraining"]) {
    const r1 = DEUTSCH_UEBUNGEN.erzeuge(id, "hunde");
    const r2 = DEUTSCH_UEBUNGEN.erzeuge(id, "hunde");
    const schluessel = a => (id === "satzbau" ? a.erklaerung : (a.frage || a.satz));
    const k1 = new Set(r1.aufgaben.map(schluessel));
    const k2 = r2.aufgaben.map(schluessel);
    for (const key of k2) {
      assert(!k1.has(key), `${id}: Aufgabe wiederholte sich direkt in Runde 2: ${key}`);
    }
    if (id === "satzbau") {
      for (const a of r1.aufgaben.concat(r2.aufgaben)) {
        assert(!a.bausteine.every((t, i) => t === a.loesung[i]), "Satzbau nicht gemischt: " + a.erklaerung);
      }
    }
  }

  // Leseverständnis bevorzugt aktive Welt und wiederholt nicht direkt
  for (const welt of ["hunde", "hamster", "weihnachten"]) {
    const l1 = DEUTSCH_UEBUNGEN.erzeuge("lesen", welt);
    assert.equal(l1.lesetext.welt, welt);
    const l2 = DEUTSCH_UEBUNGEN.erzeuge("lesen", welt, l1.lesetext.id);
    assert.equal(l2.lesetext.welt, welt);
    assert.notEqual(l2.lesetext.id, l1.lesetext.id);
  }
});

test("UI: alle 5 Deutsch-Übungen lassen sich vollständig durchspielen und korrekt bewerten", () => {
  const g = game({}, { now: JETZT });
  g.nodes.get("deutschUmschalter").emit("click");
  const inhalt = g.nodes.get("sprechInhalt");

  // 1. Rechtschreib-Detektiv: alle 8 richtig -> „Alles richtig“
  g.run("sprech.oeffneDeutschUebung('rechtschreibung')");
  const rsKarten = inhalt.querySelectorAll(".extra-aufgabe");
  assert.equal(rsKarten.length, 8);
  for (const karte of rsKarten) {
    const frage = karte.querySelector(".extra-frage").textContent;
    const eintrag = DEUTSCH_UEBUNGEN.RECHTSCHREIBUNG.find(e => e.satz === frage);
    assert(eintrag, "Rechtschreib-Eintrag nicht gefunden: " + frage);
    karte.querySelectorAll(".extra-option")[eintrag.richtig].emit("click");
  }
  inhalt.querySelector(".extra-pruefen").emit("click");
  assert.match(inhalt.querySelector(".extra-ergebnis").textContent, /8 von 8 richtig!.*Alles richtig/);

  // 2. Wortarten: 7 von 8 richtig (genau 1 Fehler) -> „Fast alles richtig“
  g.run("sprech.oeffneDeutschUebung('wortarten')");
  const waKarten = inhalt.querySelectorAll(".extra-aufgabe");
  assert.equal(waKarten.length, 8);
  waKarten.forEach((karte, idx) => {
    const satzText = karte.querySelector(".extra-frage").textContent;
    const markiert = karte.querySelector(".wort-markiert").textContent;
    const eintrag = DEUTSCH_UEBUNGEN.WORTARTEN.find(e =>
      e.satz.replace(/\*\*/g, "") === satzText && e.wort === markiert);
    assert(eintrag, "Wortarten-Eintrag nicht gefunden: " + satzText + " / " + markiert);
    const wahl = idx === 0 ? (eintrag.art + 1) % 3 : eintrag.art;
    karte.querySelectorAll(".extra-option")[wahl].emit("click");
  });
  inhalt.querySelector(".extra-pruefen").emit("click");
  assert.match(inhalt.querySelector(".extra-ergebnis").textContent, /7 von 8 richtig!.*Fast alles richtig/);

  // 3. Satzbau-Puzzle: Baustein ablegen, wieder entfernen und korrekt legen
  g.run("sprech.oeffneDeutschUebung('satzbau')");
  const sbKarten = inhalt.querySelectorAll(".extra-aufgabe");
  assert.equal(sbKarten.length, 6);
  const ersteVorrat = sbKarten[0].querySelector(".extra-ordnen-vorrat").querySelectorAll(".extra-chip");
  ersteVorrat[0].emit("click");
  assert.equal(sbKarten[0].querySelector(".extra-ordnen-ziel").querySelectorAll(".extra-chip").length, 1);
  sbKarten[0].querySelector(".extra-ordnen-ziel").querySelectorAll(".extra-chip")[0].emit("click");
  assert.equal(sbKarten[0].querySelector(".extra-ordnen-ziel").querySelectorAll(".extra-chip").length, 0);
  for (const karte of sbKarten) {
    const chips = karte.querySelector(".extra-ordnen-vorrat").querySelectorAll(".extra-chip");
    const texte = chips.map(c => c.textContent);
    const eintrag = DEUTSCH_UEBUNGEN.SATZBAU.find(s =>
      s.teile.length === texte.length && s.teile.every(t => texte.includes(t)));
    assert(eintrag, "Satzbau-Eintrag nicht gefunden");
    for (const teil of eintrag.teile) {
      chips.find(c => c.textContent === teil && !c.disabled).emit("click");
    }
  }
  inhalt.querySelector(".extra-pruefen").emit("click");
  assert.match(inhalt.querySelector(".extra-ergebnis").textContent, /6 von 6 richtig!.*Alles richtig/);

  // 4. Leseverständnis: Text sichtbar, 0 Antworten -> „noch keine Aufgabe geklappt“ + „✗ Nicht ganz:“
  g.run("sprech.oeffneDeutschUebung('lesen')");
  assert(inhalt.querySelector(".extra-lesetext"), "Lesetext-Kasten fehlt");
  assert.equal(inhalt.querySelectorAll(".extra-aufgabe").length, 3);
  inhalt.querySelector(".extra-pruefen").emit("click");
  assert.match(inhalt.querySelector(".extra-ergebnis").textContent, /0 von 3 richtig!.*noch keine Aufgabe geklappt/);
  assert.match(inhalt.textContent, /✗ Nicht ganz:/);

  // 5. Wort-Training: alle 8 richtig + „Neue Übung“ erzeugt frische Runde
  g.run("sprech.oeffneDeutschUebung('worttraining')");
  const wtKarten = inhalt.querySelectorAll(".extra-aufgabe");
  assert.equal(wtKarten.length, 8);
  const ersteFragen = new Set();
  for (const karte of wtKarten) {
    const frage = karte.querySelector(".extra-frage").textContent;
    ersteFragen.add(frage);
    const eintrag = DEUTSCH_UEBUNGEN.WORTTRAINING.find(e => e.frage === frage);
    assert(eintrag, "Wort-Training-Eintrag nicht gefunden: " + frage);
    karte.querySelectorAll(".extra-option")[eintrag.richtig].emit("click");
  }
  inhalt.querySelector(".extra-pruefen").emit("click");
  assert.match(inhalt.querySelector(".extra-ergebnis").textContent, /8 von 8 richtig!.*Alles richtig/);
  inhalt.querySelector(".extra-neu").emit("click");
  const zweiteFragen = inhalt.querySelectorAll(".extra-aufgabe").map(k => k.querySelector(".extra-frage").textContent);
  assert.equal(zweiteFragen.length, 8);
  for (const f of zweiteFragen) {
    assert(!ersteFragen.has(f), "Neue Wort-Training-Runde wiederholte sofort Frage: " + f);
  }

  // Deutsch-Übungen lassen Bonussterne und Quiz-Statistik unberührt
  assert.equal(g.data().bonusGesamt, 0);
  assert.equal(g.data().runden.length, 0);
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

test("UI: Deutsch-Übersicht zeigt alle 6 Deutsch-Übungen inkl. Sprechtraining, Satzbau-Puzzle & Wortarten", () => {
  const g = game({}, { now: JETZT });
  g.nodes.get("deutschUmschalter").emit("click");
  const kacheln = g.nodes.get("sprechInhalt").querySelectorAll(".themen-kachel");
  assert.equal(kacheln.length, 6);
  assert.equal(kacheln[0].dataset.deutschThema, "sprechtraining");

  // Wortarten öffnen und eine Option wählen
  kacheln[2].emit("click"); // wortarten (0=sprechtraining, 1=rechtschreibung, 2=wortarten)
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

  // Startseite-Knopf führt zurück zur Deutsch-Übersicht mit allen 6 Themen
  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(g.nodes.get("sprechInhalt").querySelectorAll(".themen-kachel").length, 6);
});

test("UI: Rechendreieck zeichnet echtes SVG-Dreieck mit 3 Innen- und 3 Außenfeldern", () => {
  const g = game({}, { now: JETZT });
  g.run("extraUebung.oeffneMatheThema('mauern')");
  const inhalt = g.nodes.get("matheThemaInhalt");
  const dreiecke = inhalt.querySelectorAll(".rechendreieck");
  assert(dreiecke.length >= 1, "Mindestens ein Rechendreieck erwartet");
  for (const d of dreiecke) {
    const buehne = d.querySelector(".rechendreieck-feld");
    assert(buehne, "Rechendreieck-Bühne fehlt");
    const svg = buehne.children.find(c => c.type === "svg");
    assert(svg, "SVG-Dreieck fehlt");
    assert.equal(svg.getAttribute("class"), "rechendreieck-svg");
    assert(svg.children.some(c => c.getAttribute("class") === "rechendreieck-form"), "Dreiecks-Polygon fehlt");
    assert.equal(svg.children.filter(c => c.getAttribute("class") === "rechendreieck-teiler").length, 3, "3 innere Trennlinien erwartet");
    assert.equal(svg.children.filter(c => c.getAttribute("class") === "rechendreieck-zeiger").length, 3, "3 Außen-Verbindungslinien erwartet");
    assert.equal(d.querySelectorAll(".dreieck-platz").length, 6, "6 Zahlenfelder (3 innen + 3 außen) erwartet");
    assert.equal(d.querySelectorAll(".dreieck-innen").length, 3, "3 Innenzahlen erwartet");
    assert.equal(d.querySelectorAll(".dreieck-aussen").length, 3, "3 Außenzahlen erwartet");
  }
});

test("Rückmeldungen: lobFuerAnteil unterscheidet Alles richtig, Fast alles richtig und 0 richtig genau", () => {
  const g = game({}, { now: JETZT });
  const lob = (r, n) => g.run(`lobFuerAnteil(${n > 0 ? r / n : 0}, ${r}, ${n})`);

  // 100 %: immer „Alles richtig“, niemals „Fast alles richtig“
  for (const n of [1, 3, 5, 6, 8, 10, 50]) {
    const text = lob(n, n);
    assert.match(text, /^Alles richtig/, `${n}/${n} muss „Alles richtig“ melden, bekam: ${text}`);
    assert.doesNotMatch(text, /Fast alles/i);
  }

  // Fast alles richtig: 90–98 % bzw. genau 1 Fehler bei mind. 5 Aufgaben (4/5, 5/6, 7/8, 9/10, 45–49/50)
  for (const [r, n] of [[4, 5], [5, 6], [7, 8], [9, 10], [45, 50], [49, 50]]) {
    assert.match(lob(r, n), /^Fast alles richtig/, `${r}/${n} muss „Fast alles richtig“ melden`);
  }

  // Richtig gut (75–89 % ohne 1-Fehler-Sonderfall)
  for (const [r, n] of [[3, 4], [6, 8], [8, 10], [40, 50]]) {
    assert.match(lob(r, n), /richtig gut/, `${r}/${n} muss „richtig gut“ melden`);
  }

  // Mittelfeld (55–74 %) inkl. Singular bei 2/3
  assert.match(lob(2, 3), /Die eine Aufgabe/);
  assert.match(lob(30, 50), /Schon gut/);

  // Durchgehalten (35–54 %)
  assert.match(lob(20, 50), /durchgehalten/);
  assert.match(lob(1, 2), /durchgehalten/);

  // Wenige richtig (1–34 %)
  assert.match(lob(5, 50), /Anfang ist gemacht/);

  // 0 richtig: nie „nicht alles rund“, Singular bei 0/1
  assert.match(lob(0, 50), /noch keine Aufgabe geklappt/);
  assert.match(lob(0, 1), /noch nicht geklappt.*die Lösung\b/);
  assert.doesNotMatch(lob(0, 50), /nicht alles rund/i);
});
