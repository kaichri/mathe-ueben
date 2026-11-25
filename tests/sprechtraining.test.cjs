"use strict";
/* =========================================================================
   Tests für „Deutsch üben" (Eltern-Kind-Modus), die Vorlesefunktion und
   die Ton-Einstellungen.

   Regeln, die hier festgehalten werden:
   - Es gibt kein „Tag 1 bis 14" mehr: 14 Geschichten, beliebig oft und in
     beliebiger Reihenfolge übbar. Kein Spielstand-Feld „sprechtraining".
   - Jede Geschichte hat 4 Fragensätze; eine Runde wählt zufällig einen aus
     (ohne denselben Satz direkt zu wiederholen). Zu jedem Satz existieren
     die Vorlese-MP3s für Thorsten und Ramona.
   - Eine Übung läuft in Schritten: Zuhören, Verstehen (Antworten für die
     Begleitung verbergbar), Satz bilden (Hilfe verbergbar), Erzählen mit
     Bewertung (Stichworte + 4 Kriterien mit 3 Stufen), Abschluss mit
     Feedback. Bewertungen bleiben im Gespräch – sie werden nicht gespeichert.
   - Die Übersicht ist wie die Mathe-Startseite aufgebaut: Welt-Auswahl,
     großer „Los geht's!"-Knopf, alle Geschichten immer offen.
   - Der Kopf hat einen Mathe/Deutsch-Umschalter; „Startseite" bringt dich
     zum Start des aktuellen Bereichs.
   - Die Vorlesestimme ist umschaltbar (Thorsten/Ramona/System) und hat
     eine eigene Lautstärke; die Musik hat eine eigene Lautstärke.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { game } = require("./phase3-helper.cjs");

const SPRECHTRAINING = require("../sprechtraining.js");
const JETZT = "2026-10-31T12:00:00Z";
const plain = v => JSON.parse(JSON.stringify(v));

function sicherung(daten) {
  return JSON.stringify({ format: "mathe-sicherung", daten: daten, originalSpeicher: null });
}
function zusammenfuehren(g, text) {
  return plain(g.run("speicher.zusammenfuehren(" + JSON.stringify(text) + ")"));
}
function tageInhalte(g) {
  return g.nodes.get("sprechInhalt").querySelectorAll(".sprech-tag");
}
function offneEinheit(g, nr) {
  g.run("sprech.oeffneEinheit(SPRECHTRAINING.einheit(" + nr + "))");
}
function offneEinheitMitSatz(g, nr, satz) {
  g.run("sprech.oeffneEinheit(SPRECHTRAINING.einheit(" + nr + "), " + satz + ")");
}
function weiter(g) {
  g.nodes.get("sprechInhalt").querySelectorAll(".sprech-weiter").at(-1).emit("click");
}
function aktiverSchritt(g) {
  const aktiv = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-schritt")
    .find(k => k.classList.contains("aktiv"));
  return aktiv ? aktiv.textContent : "";
}
function kriterien(g) {
  return g.nodes.get("sprechInhalt").querySelectorAll(".sprech-kriterium");
}
function setzeStufe(g, kriterium, stufe) {
  kriterien(g)[kriterium].querySelectorAll(".stufen-knopf")[stufe].emit("click");
}

/* ------------------------------------------------------------------ Daten */

test("DATEN: jede Geschichte hat 5–7 Sätze, 4×5 Auswahl-Fragen, 4+4 Satz-Übungen und alle Text-MP3s", () => {
  const ordner = path.join(__dirname, "..", "audio", "sprechtraining");
  assert.equal(SPRECHTRAINING.EINHEITEN.length, 20);
  for (const e of SPRECHTRAINING.EINHEITEN) {
    const nr = ("0" + e.tag).slice(-2);
    const saetze = e.text.split(/[.!?]+/).filter(x => x.trim()).length;
    assert(saetze >= 5 && saetze <= 7,
      "Geschichte " + e.tag + " soll 5-7 Sätze haben, hat aber " + saetze);
    assert(Array.isArray(e.fragenSets) && e.fragenSets.length >= 4,
      "Geschichte " + e.tag + " braucht mindestens 4 Fragensätze");
    e.fragenSets.forEach(function (satz, s) {
      assert.equal(satz.length, 5, "Fragensatz " + (s + 1) + " von Geschichte " + e.tag + " braucht genau 5 Fragen");
      let einzel = 0;
      let mehrfach = 0;
      satz.forEach(function (f) {
        assert(typeof f.frage === "string" && f.frage.trim(), "Frage fehlt: Geschichte " + e.tag);
        assert(Array.isArray(f.optionen) && f.optionen.length >= 3, "Mind. 3 Antwortoptionen: Geschichte " + e.tag);
        assert(Array.isArray(f.richtig) && f.richtig.length >= 1, "Mind. 1 richtige Option: Geschichte " + e.tag);
        f.richtig.forEach(idx => assert(idx >= 0 && idx < f.optionen.length, "Ungültiger Index: Geschichte " + e.tag));
        assert(typeof f.antwort === "string" && f.antwort.trim(), "Antwort fehlt: Geschichte " + e.tag);
        if (f.richtig.length > 1) { mehrfach += 1; } else { einzel += 1; }
      });
      assert(einzel >= 1 && mehrfach >= 1,
        "Fragensatz " + (s + 1) + " von Geschichte " + e.tag + " braucht Radio- und Checkbox-Fragen");
    });
    assert(Array.isArray(e.satzPuzzle) && e.satzPuzzle.length === 4, "4 Satzpuzzles erwartet: Geschichte " + e.tag);
    e.satzPuzzle.forEach(function (p) {
      assert(p.teile.length >= 3 && p.teile.length <= 5, "Puzzle-Bausteine: Geschichte " + e.tag);
      assert.equal(p.teile.join(" "), p.satz, "Puzzle-Satz weicht ab: Geschichte " + e.tag);
    });
    assert(Array.isArray(e.satzVerbinden) && e.satzVerbinden.length === 4, "4 Sätze-verbinden erwartet: Geschichte " + e.tag);
    e.satzVerbinden.forEach(function (v) {
      assert.equal(v.optionen.length, 3);
      assert(v.richtig >= 0 && v.richtig < 3);
      assert(typeof v.loesung === "string" && v.loesung.includes(v.optionen[v.richtig]));
    });
    assert(Array.isArray(e.wichtigePunkte) && e.wichtigePunkte.length === 4,
      "4 Erzähl-Stationen erwartet: Geschichte " + e.tag);
    for (const stimme of ["thorsten", "ramona"]) {
      const datei = path.join(ordner, stimme, "tag" + nr + "-text.mp3");
      assert(fs.existsSync(datei) && fs.statSync(datei).size > 0,
        "Text-Audio fehlt oder leer: " + stimme + "/tag" + nr + "-text.mp3");
    }
    assert(typeof e.bild === "string" && e.bild.endsWith(".webp"),
      "Geschichten-Bildpfad fehlt: Geschichte " + e.tag);
    const bildDatei = path.join(__dirname, "..", e.bild);
    assert(fs.existsSync(bildDatei) && fs.statSync(bildDatei).size > 0,
      "Geschichten-Bild fehlt oder leer: " + e.bild);
  }
});

test("DATEN: fragenSet wählt nach Nummer und läuft am Ende um", () => {
  const e = SPRECHTRAINING.einheit(1);
  assert.deepEqual(plain(SPRECHTRAINING.fragenSet(e, 1)), plain(e.fragenSets[0]));
  assert.deepEqual(plain(SPRECHTRAINING.fragenSet(e, 3)), plain(e.fragenSets[2]));
  assert.deepEqual(plain(SPRECHTRAINING.fragenSet(e, 5)), plain(e.fragenSets[0]));
  assert.deepEqual(plain(SPRECHTRAINING.fragenSet(e, 0)), plain(e.fragenSets[e.fragenSets.length - 1]));
});

test("DATEN: jede Welt hat mindestens 8 Figuren mit Bild-Dateien und passenden Namen", () => {
  const g = game({}, { now: JETZT });
  const welten = plain(g.run("DEUTSCH_WELTEN"));
  for (const [id, welt] of Object.entries(welten)) {
    assert(welt.figuren.length >= 8, "Welt " + id + " braucht mindestens 8 Figuren");
    assert.equal(welt.namen.length, welt.figuren.length, "Namen und Figuren passen zusammen: " + id);
    assert(welt.figuren.includes(welt.figur), "Hauptfigur gehört zur Welt: " + id);
    welt.figuren.forEach(function (figur) {
      const datei = g.run("FIGURENBILDER[" + JSON.stringify(figur) + "]");
      assert(datei, "Figur fehlt in FIGURENBILDER: " + figur);
      assert(fs.existsSync(path.join(__dirname, "..", "bilder", datei + ".webp")),
        "Bild fehlt: " + datei + ".webp");
    });
  }
});

/* -------------------------------------------------------------- Übersicht */

test("SPRECH: Übersicht zeigt Welten & 6 Deutsch-Themen und startet Sprechtraining direkt", () => {
  const g = game({}, { now: JETZT });
  assert.equal(g.data().sprechtraining, undefined, "Es gibt keinen Tag-1-bis-14-Spielstand mehr");
  g.run("sprech.oeffnen()");
  assert.equal(g.nodes.get("sprechBildschirm").hidden, false);
  const inhalt = g.nodes.get("sprechInhalt");
  const welten = inhalt.querySelectorAll(".deutsch-welt");
  assert.equal(welten.length, 3);
  const kacheln = inhalt.querySelectorAll(".themen-kachel");
  assert.equal(kacheln.length, 6, "alle 6 Deutsch-Themen gleichberechtigt als Kacheln");
  assert.equal(kacheln[0].dataset.deutschThema, "sprechtraining");
  assert.equal(inhalt.querySelectorAll(".eltern-kasten").length, 0, "keine Anleitungs-Kästen auf der Startseite");
  const namen = plain(g.run("DEUTSCH_WELTEN.hunde.namen"));
  const reihe = g.nodes.get("sprechMaskottchenReihe").querySelectorAll(".maskottchen");
  assert.equal(reihe.length, 8, "die Maskottchen-Reihe zeigt alle Figuren der Welt");
  assert(reihe.every(k => namen.includes(k.title)), "jedes Maskottchen trägt einen Namen der Welt");

  // Klick auf Sprechtraining-Kachel springt direkt in Schritt 1 (ohne Zwischenseite).
  kacheln[0].emit("click");
  assert.equal(aktiverSchritt(g), "Zuhören");
  assert.equal(inhalt.querySelectorAll(".sprech-los").length, 0, "keine Zwischenseite mit Los-Knopf");
  assert.equal(inhalt.querySelectorAll(".eltern-kasten").length, 0, "kein Anleitungskasten im Zuhören-Schritt");
  assert(!/Mini-Ziel/.test(inhalt.textContent), "Mini-Ziel wurde entfernt");
  assert.equal(inhalt.querySelector(".sprech-weiter").textContent, "Weiter ▶", "knapper Weiter-Button");

  // Klick auf „Andere Geschichte“ öffnet das Auswahl-Pop-up mit allen 20 Geschichten.
  inhalt.querySelector(".sprech-andere").emit("click");
  const dialog = g.nodes.get("geschichtenUeberlagerung");
  assert.equal(dialog.hidden, false, "Geschichten-Pop-up ist geöffnet");
  const eintraege = dialog.querySelectorAll(".geschichte-karte");
  assert.equal(eintraege.length, 20, "alle 20 Geschichten im Pop-up auswählbar");
  eintraege[4].emit("click"); // Geschichte 5: Der Apfelkuchen
  assert.equal(dialog.hidden, true, "Pop-up schließt sich nach Auswahl");
  assert.match(inhalt.querySelector(".sprech-titel").textContent, /Der Apfelkuchen/);
});

test("SPRECH: eine geöffnete Einheit zeigt Breadcrumbs oben, kein Mini-Ziel und keine doppelte Schritt-Überschrift", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheit(g, 1);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.equal(g.nodes.get("sprechUeberschrift").hidden, true, "überflüssige Hauptüberschrift ist in der Übung ausgeblendet");
  assert.equal(inhalt.children[0].className, "sprech-topbar");
  assert.equal(inhalt.children[1].className, "sprech-schritte", "Breadcrumbs stehen ganz oben unter der Topbar");
  assert.equal(inhalt.querySelectorAll(".sprech-ziel").length, 0, "kein Mini-Ziel");
  const karte = inhalt.querySelector(".sprech-karte");
  assert(!/1\. Zuhören/.test(karte.textContent), "keine redundante 1. Zuhören-Überschrift im Textblock");
  const bild = karte.querySelector(".sprech-bild");
  assert(bild && bild.src === "bilder/geschichten/tag01.webp", "passendes Geschichten-Bild auf Seite 1");
  karte.querySelector(".sprech-bild-knopf").emit("click");
  assert.equal(g.nodes.get("bildUeberlagerung").hidden, false, "Klick auf Bild öffnet Großansicht-Pop-up");
  assert.equal(g.nodes.get("bildGrossImg").src, "bilder/geschichten/tag01.webp");
  assert.equal(g.nodes.get("bildTitel").textContent, "Emma im Garten");
  g.nodes.get("bildWegKnopf").emit("click");
  assert.equal(g.nodes.get("bildUeberlagerung").hidden, true, "Großansicht-Pop-up schließt wieder sauber");
  assert.match(karte.textContent, /Emma geht am Nachmittag in den sonnigen Garten/);
  assert(!/Erst hören, dann sprecht ihr darüber/.test(inhalt.textContent), "Erklärsatz entfernt");
  assert(!/Tag 1/.test(inhalt.textContent), "die Tageszählung ist verschwunden");
  assert.equal(inhalt.querySelectorAll(".sprech-figur").length, 1, "Welt-Figur begleitet die Übung");
});

/* ------------------------------------------------------------------- NAVI */

test("NAVI: Kopf-Umschalter wechselt zwischen Mathe und Deutsch", () => {
  const g = game({}, { now: JETZT });
  assert(g.nodes.get("matheUmschalter").classList.contains("aktiv"), "Mathe ist anfangs aktiv");
  assert.equal(g.nodes.get("matheUmschalter").getAttribute("aria-pressed"), "true");

  g.nodes.get("deutschUmschalter").emit("click");
  assert.equal(g.nodes.get("sprechBildschirm").hidden, false);
  assert(g.nodes.get("deutschUmschalter").classList.contains("aktiv"));
  assert.equal(g.nodes.get("deutschUmschalter").getAttribute("aria-pressed"), "true");
  assert(!g.nodes.get("matheUmschalter").classList.contains("aktiv"));

  g.nodes.get("matheUmschalter").emit("click");
  assert.equal(g.nodes.get("startBildschirm").hidden, false);
  assert(g.nodes.get("matheUmschalter").classList.contains("aktiv"));
  assert(!g.nodes.get("deutschUmschalter").classList.contains("aktiv"));
});

test("NAVI: Startseite-Knopf geht zum Start des aktuellen Bereichs", () => {
  const g = game({}, { now: JETZT });
  g.nodes.get("deutschUmschalter").emit("click");
  g.run("sprech.oeffneEinheit(SPRECHTRAINING.einheit(1), 1)");
  assert.equal(aktiverSchritt(g), "Zuhören");

  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(g.nodes.get("sprechBildschirm").hidden, false, "bleibt im Deutsch-Bereich");
  assert.equal(g.nodes.get("sprechInhalt").querySelectorAll(".themen-kachel").length, 6,
    "Deutsch-Startseite mit allen 6 Themen, nicht die laufende Übung");

  g.nodes.get("matheUmschalter").emit("click");
  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(g.nodes.get("startBildschirm").hidden, false);
});

test("NAVI: Der Zurück-Knopf kehrt aus den Einstellungen zum aktuellen Bereich zurück", () => {
  const g = game({}, { now: JETZT });
  g.nodes.get("deutschUmschalter").emit("click");
  g.run("zeigeFortschritt('statistik')");
  assert.equal(g.nodes.get("fortschrittBildschirm").hidden, false);
  g.nodes.get("fortschrittZurueckKnopf").emit("click");
  assert.equal(g.nodes.get("sprechBildschirm").hidden, false, "zurück zu Deutsch");

  g.nodes.get("matheUmschalter").emit("click");
  g.run("zeigeFortschritt('statistik')");
  g.nodes.get("fortschrittZurueckKnopf").emit("click");
  assert.equal(g.nodes.get("startBildschirm").hidden, false, "zurück zu Mathe");
});

/* ------------------------------------------------------------------ Ablauf */

test("SPRECH: Zuhören spielt die eingebettete Thorsten-Stimme", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.equal(aktiverSchritt(g), "Zuhören");
  assert.match(inhalt.textContent, /Emma geht am Nachmittag in den sonnigen Garten/);
  const vorlesen = () => inhalt.querySelectorAll(".vorlesen-knopf")[0];
  vorlesen().emit("click");
  assert.equal(g.audios.length, 1);
  assert.equal(g.audios[0].src, "audio/sprechtraining/thorsten/tag01-text.mp3");
  assert.equal(g.audios[0].volume, 1);
  assert.equal(g.audios[0].plays, 1);
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");
  assert.equal(vorlesen().textContent, "⏸ Pause");
  vorlesen().emit("click"); // Pause
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");
  assert.equal(g.run("sprechAudio.pausiert()"), true);
  assert.equal(g.audios[0].paused, true);
  assert.equal(vorlesen().textContent, "▶ Weiter");
  vorlesen().emit("click"); // Weiter ab derselben Stelle
  assert.equal(g.run("sprechAudio.pausiert()"), false);
  assert.equal(g.audios.length, 1, "derselbe Clip läuft weiter, kein neuer");
  assert.equal(g.audios[0].plays, 2);
  assert.equal(vorlesen().textContent, "⏸ Pause");
  g.run("sprechAudio.stoppe()");
  assert.equal(g.run("sprechAudio.aktuell()"), null);
});

test("SPRECH: eine späte Absage der unterbrochenen Wiedergabe setzt nichts zurück", async () => {
  const g = game({}, { now: JETZT, audio: [
    () => new Promise((loesen, abweisen) => { g.späteAbsage = abweisen; })
  ] });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  const vorlesen = () => g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf")[0];
  vorlesen().emit("click"); // das erste play() bleibt wie im echten Browser beim Laden hängen
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");
  vorlesen().emit("click"); // Pause: bricht das play() im Browser mit AbortError ab
  assert.equal(g.run("sprechAudio.pausiert()"), true);
  vorlesen().emit("click"); // Weiter ab derselben Stelle
  assert.equal(g.audios[0].plays, 2);
  assert.equal(vorlesen().textContent, "⏸ Pause");
  g.späteAbsage(new Error("AbortError")); // die alte Zusicherung wird erst jetzt abgewiesen
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text",
    "die späte Absage zerstört die laufende Wiedergabe nicht");
  assert.equal(vorlesen().textContent, "⏸ Pause");
});

test("SPRECH: Verstehen – 5 Fragen mit Radio/Checkbox-Auswahl und Prüfen-Button", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  weiter(g);
  const inhalt = g.nodes.get("sprechInhalt");
  const karte = inhalt.querySelector(".sprech-karte");
  assert(!/2\. Verstehen/.test(karte.textContent), "keine redundante 2. Verstehen-Überschrift im Textblock");
  const fragenBloecke = inhalt.querySelectorAll(".sprech-frage");
  assert.equal(fragenBloecke.length, 5, "genau 5 Verständnisfragen");
  assert.equal(inhalt.querySelectorAll(".vorlesen-knopf").length, 0, "keine Vorlesen-Buttons bei Fragen");
  assert(!/Antworten zeigen/.test(inhalt.textContent), "kein Antworten-zeigen-Button mehr");

  const fragen = SPRECHTRAINING.fragenSet(SPRECHTRAINING.einheit(1), 1);
  let hatRadio = false;
  let hatCheckbox = false;
  fragen.forEach((f, fIdx) => {
    const inputs = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-frage")[fIdx].querySelectorAll("input");
    const erwartetTyp = f.richtig.length > 1 ? "checkbox" : "radio";
    if (erwartetTyp === "radio") { hatRadio = true; } else { hatCheckbox = true; }
    assert.equal(inputs[0].getAttribute("type"), erwartetTyp, "passender Eingabetyp bei Frage " + (fIdx + 1));
    f.richtig.forEach(optIdx => {
      const aktuell = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-frage")[fIdx].querySelectorAll("input")[optIdx];
      aktuell.checked = true;
      aktuell.emit("change");
    });
  });
  assert(hatRadio && hatCheckbox, "sowohl Radio-Buttons als auch Checkboxes vorhanden");

  g.nodes.get("sprechInhalt").querySelector(".sprech-verstehen-pruefen").emit("click");
  assert.match(g.nodes.get("sprechInhalt").textContent, /5 von 5 richtig – Alles richtig/);
});

test("SPRECH: Fragensätze wechseln – Satz 2 fragt anders als Satz 1", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 2);
  weiter(g);
  const text = g.nodes.get("sprechInhalt").textContent;
  assert.match(text, /Wie ist das Wetter im Garten\?/);
  assert(!text.includes("Wann geht Emma in den Garten?"), "Satz 2 ist nicht einfach Satz 1");
});

test("SPRECH: Satzbildung – 4 Wortpuzzles + 4 Sätze verbinden prüfen", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  weiter(g); weiter(g);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.equal(inhalt.querySelectorAll(".sprech-puzzle-vorrat").length, 4, "4 Satzpuzzles");
  assert.equal(inhalt.querySelectorAll(".sprech-verbinden-block").length, 4, "4 Sätze-verbinden-Aufgaben");

  const einheit = SPRECHTRAINING.einheit(1);
  einheit.satzPuzzle.forEach((p, idx) => {
    for (const teil of p.teile) {
      const vorrat = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-puzzle-vorrat")[idx];
      const chip = vorrat.querySelectorAll(".extra-chip").find(c => c.textContent === teil && !c.disabled);
      chip.emit("click");
    }
    const vorratNachher = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-puzzle-vorrat")[idx];
    assert(vorratNachher.querySelectorAll(".extra-chip").every(c => c.classList.contains("benutzt") && c.disabled),
      "angeklickte Wortkarten sind im Vorrat als benutzt markiert und gesperrt");
    const zielNachher = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-puzzle-ziel")[idx];
    assert(zielNachher.querySelectorAll(".extra-chip").every(c => c.classList.contains("gewaehlt")),
      "gelegte Wortkarten im Ziel tragen die Klasse gewaehlt wie beim Satzbau-Puzzle");
  });
  einheit.satzVerbinden.forEach((v, idx) => {
    const block = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-verbinden-block")[idx];
    block.querySelectorAll(".sprech-bindewort")[v.richtig].emit("click");
  });

  g.nodes.get("sprechInhalt").querySelector(".sprech-satz-pruefen").emit("click");
  assert.match(g.nodes.get("sprechInhalt").textContent, /8 von 8 richtig – Alles richtig/);
});

test("SPRECH: Erzählen – direkt einfach mit 4 Karten und Feier", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  weiter(g); weiter(g); weiter(g);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.equal(inhalt.querySelectorAll(".sprech-ordnen-pruefen").length, 0, "keine komplizierte Vor-Phase mehr");
  assert.equal(inhalt.querySelectorAll(".sprech-profi-knopf").length, 0, "kein Karten-verdecken-Knopf mehr");
  assert.equal(inhalt.querySelectorAll(".sprech-bingo-karte").length, 4, "sofort alle 4 Erzähl-Karten sichtbar");

  // 2 Stationen abhaken
  g.nodes.get("sprechInhalt").querySelectorAll(".sprech-bingo-karte")[0].emit("click");
  g.nodes.get("sprechInhalt").querySelectorAll(".sprech-bingo-karte")[2].emit("click");
  assert.equal(g.nodes.get("sprechInhalt").querySelectorAll(".sprech-bingo-karte")
    .filter(k => k.classList.contains("erzaehlt")).length, 2);

  g.nodes.get("sprechInhalt").querySelector(".sprech-fertig-knopf").emit("click");
  const karte = g.nodes.get("sprechInhalt").textContent;
  assert.match(karte, /Übung geschafft/);
  assert.match(karte, /Verstehen0 von 5 richtig/);
  assert.match(karte, /Satz bilden0 von 8 richtig/);
  assert.match(karte, /Erzählen2 von 4 Stationen/);
  assert.match(karte, /Gesamt: 0 von 13 Aufgaben richtig/);
  assert.equal(g.data().sprechtraining, undefined, "Bewertungen landen nicht im Spielstand");
  assert(g.nodes.get("sprechInhalt").querySelectorAll("button")
    .some(b => /Neue Übung/.test(b.textContent)), "es geht direkt weiter mit einer neuen Übung");
});

test("SPRECH: Die Schaltfläche „Neue Übung“ startet wieder eine Geschichte", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  g.run("sprech.starteZufaellig()");
  const vorlesen = g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf");
  assert(vorlesen.length >= 1, "eine Übung ist offen");
  assert.equal(aktiverSchritt(g), "Zuhören");
});

/* --------------------------------------------------------- Vorlesestimmen */

test("SPRECH: Systemstimme ohne Sprachausgabe endet still und ohne Fehler", () => {
  const g = game({}, { now: JETZT });
  g.data().vorleseStimme = "system";
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf")[0].emit("click");
  assert.equal(g.audios.length, 0, "Bei Systemstimme wird keine Audiodatei geladen");
  assert.equal(g.run("sprechAudio.aktuell()"), null);
});

test("SPRECH: Ramona spielt aus ihrem Ordner, Lautstärke wird übernommen", () => {
  const g = game({}, { now: JETZT });
  g.data().vorleseStimme = "ramona";
  g.data().stimmeLautstaerke = 0.6;
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf")[0].emit("click");
  assert.equal(g.audios[0].src, "audio/sprechtraining/ramona/tag01-text.mp3");
  assert.equal(g.audios[0].volume, 0.6);
  assert.equal(g.run("sprechAudio.stimme()"), "ramona");
});

test("SPRECH: „◀ Zurück“ blättert wie in Mathe einen Schritt zurück", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  const inhalt = g.nodes.get("sprechInhalt");
  const zurueckKnopf = () => inhalt.querySelectorAll("button").find(b => b.textContent === "◀ Zurück");
  assert(!zurueckKnopf(), "Schritt 1 hat keinen Zurück-Knopf");
  weiter(g);
  assert.equal(aktiverSchritt(g), "Verstehen");
  zurueckKnopf().emit("click");
  assert.equal(aktiverSchritt(g), "Zuhören", "Zurück führt zu Zuhören");
  assert(!zurueckKnopf(), "am Anfang gibt es keinen Zurück-Knopf");
  weiter(g);
  weiter(g);
  assert.equal(aktiverSchritt(g), "Satz bilden");
  zurueckKnopf().emit("click");
  assert.equal(aktiverSchritt(g), "Verstehen");
  weiter(g);
  weiter(g);
  assert.equal(aktiverSchritt(g), "Erzählen");
  assert(zurueckKnopf(), "auch Schritt 4 hat einen Zurück-Knopf");
  // Abgehakte Erzähl-Stationen bleiben beim Hin- und Zurückblättern erhalten.
  g.nodes.get("sprechInhalt").querySelectorAll(".sprech-bingo-karte")[0].emit("click");
  zurueckKnopf().emit("click");
  weiter(g);
  const an = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-bingo-karte")[0];
  assert(an.classList.contains("erzaehlt"), "die Markierung übersteht das Blättern");
});

/* ----------------------------------------------------------- Ton-Reiter */

test("DEUTSCH: Welt-Auswahl speichert die Welt und markiert sie aktiv", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  const inhalt = g.nodes.get("sprechInhalt");
  const welten = inhalt.querySelectorAll(".deutsch-welt");
  assert.equal(welten.length, 3);
  assert.equal(g.data().deutschWelt, "hunde", "Standard ist die Hundewelt");
  assert(welten[0].classList.contains("aktiv"));
  assert.equal(welten[0].getAttribute("aria-pressed"), "true");
  welten[1].emit("click");
  assert.equal(g.data().deutschWelt, "hamster");
  assert.equal(g.saved().deutschWelt, "hamster");
  const aktiv = inhalt.querySelectorAll(".deutsch-welt").filter(k => k.classList.contains("aktiv"));
  assert.equal(aktiv.length, 1);
  assert.match(aktiv[0].textContent, /Flauschige Hamster/);
  const zweite = game(g.saved(), { now: JETZT });
  zweite.run("sprech.oeffnen()");
  assert.equal(zweite.data().deutschWelt, "hamster", "die Weltwahl bleibt gespeichert");
});

test("DEUTSCH: unbekannte Welten fallen auf Hunde zurück", () => {
  const g = game({ deutschWelt: "katzen" }, { now: JETZT });
  assert.equal(g.data().deutschWelt, "hunde");
  g.run("sprech.oeffnen()");
  const aktiv = g.nodes.get("sprechInhalt").querySelectorAll(".deutsch-welt").filter(k => k.classList.contains("aktiv"));
  assert.equal(aktiv.length, 1);
  assert.match(aktiv[0].textContent, /Süße Hunde/);
});

test("DEUTSCH: das entfernte legami wird still auf hunde umgestellt", () => {
  const g = game({ deutschWelt: "legami" }, { now: JETZT });
  assert.equal(g.data().deutschWelt, "hunde");
  assert(g.writes() > 0, "der Spielstand wird normal weitergeschrieben, nichts ist gesperrt");
});

test("DEUTSCH: die Zeigerspur malt Motive der Deutsch-Welten", () => {
  const g = game({}, { now: JETZT });
  for (const welt of ["hunde", "hamster", "weihnachten"]) {
    const motiv = plain(g.run(`SPUR_MOTIVE['${welt}']`));
    assert(motiv && motiv.haupt && motiv.extra && motiv.farben.length >= 3,
      "die Welt " + welt + " braucht Hauptmotiv, Extra-Motiv und Farben");
  }
  const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
  for (const id of ["spur-pfote", "spur-knochen", "spur-hamster", "spur-korn",
    "spur-tannenbaum", "spur-schneeflocke"]) {
    assert(html.includes(`id="${id}"`), "SVG-Symbol fehlt: " + id);
  }
});

test("DEUTSCH: Welt-Figuren begleiten die Einheit und der Abschluss lobt die Welt", () => {
  const g = game({ deutschWelt: "weihnachten" }, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheit(g, 1);
  assert.equal(g.nodes.get("sprechInhalt").querySelectorAll(".sprech-figur").length, 1);
  weiter(g); weiter(g); weiter(g);
  g.nodes.get("sprechInhalt").querySelectorAll(".sprech-bingo-karte")[0].emit("click");
  g.nodes.get("sprechInhalt").querySelector(".sprech-fertig-knopf").emit("click");
  const karte = g.nodes.get("sprechInhalt");
  const figuren = karte.querySelectorAll(".sprech-figuren")[0].children;
  assert.equal(figuren.length, 8);
  assert.equal(figuren[0].src, "bilder/weihnachtsmann.webp");
  assert.match(karte.textContent, /Frohe Weihnachten/);
});

test("SPRECH: die Welt-Figuren lassen sich wie in Mathe ziehen", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  const figur = g.nodes.get("sprechMaskottchenReihe").querySelectorAll(".maskottchen")[0];
  figur.emit("pointerdown", { isPrimary: true, button: 0, pointerId: 1,
    clientX: 100, clientY: 100, timeStamp: 0 });
  figur.emit("pointermove", { pointerId: 1, clientX: 150, clientY: 130, timeStamp: 60 });
  assert(figur.classList.contains("verschoben"), "die Figur wird beim Ziehen frei positioniert");
  assert(figur.classList.contains("wird-gezogen"), "die Figur hebt beim Ziehen ab");
  assert.equal(figur.style.left, "50px");
  assert.equal(figur.style.top, "30px");
  figur.emit("lostpointercapture", { pointerId: 1, timeStamp: 70 });
  assert(!figur.classList.contains("wird-gezogen"), "nach dem Loslassen hört das Ziehen auf");
  assert(figur.classList.contains("verschoben"), "die Figur bleibt dort liegen, wo sie abgelegt wurde");
});

test("TON: Reiter zeigt Stimmauswahl und Lautstärkeregler", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeFortschritt('ton')");
  assert.equal(g.nodes.get("tonInhalt").hidden, false);
  const text = g.nodes.get("tonInhalt").textContent;
  assert.match(text, /Vorlesestimme/);
  assert.match(text, /Thorsten/);
  assert.match(text, /Ramona/);
  assert.match(text, /Systemstimme/);
  const regler = g.nodes.get("tonInhalt").querySelectorAll("input");
  assert.equal(regler.length, 2);
  assert.equal(regler[0].value, "100", "Vorlesen startet bei voller Lautstärke");
  assert.equal(regler[1].value, "30", "Musik nutzt den Standardwert");
});

test("TON: Stimmenwechsel und Regler werden gespeichert", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeFortschritt('ton')");
  g.nodes.get("tonInhalt").querySelectorAll(".ton-stimme")[1].emit("click"); // Ramona
  assert.equal(g.data().vorleseStimme, "ramona");

  const regler = g.nodes.get("tonInhalt").querySelectorAll("input");
  regler[0].value = "60";
  regler[0].emit("input");
  assert.equal(g.data().stimmeLautstaerke, 0.6);
  regler[1].value = "50";
  regler[1].emit("input");
  assert.equal(g.data().musikLautstaerke, 0.5);
  assert.equal(g.run("musik.lautstaerke()"), 0.5);

  g.run("zeigeFortschritt('statistik')");
  assert.equal(g.nodes.get("tonInhalt").hidden, true);
});

test("TON: die Stimmprobe schaltet zwischen Play, Pause und Weiter um", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeFortschritt('ton')");
  const probe = () => g.nodes.get("tonInhalt").querySelectorAll("button")
    .find(b => /Stimmprobe|Pause|Weiter/.test(b.textContent));
  probe().emit("click");
  assert.equal(g.audios[0].src, "audio/sprechtraining/thorsten/tag01-text.mp3");
  assert.equal(g.audios[0].plays, 1);
  assert.equal(probe().textContent, "⏸ Pause");
  probe().emit("click"); // Pause
  assert.equal(g.run("sprechAudio.pausiert()"), true);
  assert.equal(g.audios[0].paused, true);
  assert.equal(probe().textContent, "▶ Weiter");
  probe().emit("click"); // Weiter ab derselben Stelle
  assert.equal(g.audios.length, 1, "derselbe Clip läuft weiter");
  assert.equal(g.audios[0].plays, 2);
  assert.equal(probe().textContent, "⏸ Pause");
  // Ein Stimmenwechsel stoppt die Probe; die nächste startet in der neuen Stimme.
  g.nodes.get("tonInhalt").querySelectorAll(".ton-stimme")[1].emit("click"); // Ramona
  assert.equal(g.run("sprechAudio.aktuell()"), null);
  const naechste = g.nodes.get("tonInhalt").querySelectorAll("button")
    .find(b => /Stimmprobe/.test(b.textContent));
  naechste.emit("click");
  assert.equal(g.audios[1].src, "audio/sprechtraining/ramona/tag01-text.mp3");
});

/* ------------------------------------------------------------------ Merge */

test("MERGE: alte Sprechtraining-Daten in einer Sicherung werden ignoriert", () => {
  const lokal = {
    version: 3, runden: [], geschenke: [],
    vorleseStimme: "ramona", stimmeLautstaerke: 0.5, musikLautstaerke: 0.2,
    deutschWelt: "hamster"
  };
  const fremd = {
    version: 3, runden: [], geschenke: [],
    sprechtraining: { einheiten: {
      "1": { datum: "2026-10-29", punkte: ["Garten"], reihenfolge: 9, grammatik: 1, aussprache: 1, zusammen: 1 }
    } },
    vorleseStimme: "system", stimmeLautstaerke: 0.9, musikLautstaerke: 0.7,
    deutschWelt: "weihnachten"
  };
  const g = game(lokal, { now: JETZT });
  const ergebnis = zusammenfuehren(g, sicherung(fremd));
  assert.equal(ergebnis.ok, true, ergebnis.grund);
  assert.equal(ergebnis.daten.sprechtraining, undefined,
    "Bewertungen gehören nicht mehr zur Sicherung – das Feld wandert nicht mit");
  assert.equal(ergebnis.daten.vorleseStimme, "ramona", "Ton-Einstellungen: der eigene Stand gewinnt");
  assert.equal(ergebnis.daten.stimmeLautstaerke, 0.5);
  assert.equal(ergebnis.daten.musikLautstaerke, 0.2);
  assert.equal(ergebnis.daten.deutschWelt, "hamster", "auch die Deutsch-Welt bleibt beim eigenen Gerät");
});

test("MERGE: ungültige Ton-Daten in der Datei werden abgelehnt", () => {
  const g = game({ runden: [], geschenke: [] }, { now: JETZT });
  for (const roh of [
    { vorleseStimme: "opera" },
    { stimmeLautstaerke: 3 }
  ]) {
    const ergebnis = zusammenfuehren(g, sicherung(Object.assign({ version: 3, runden: [], geschenke: [] }, roh)));
    assert.equal(ergebnis.ok, false, "Datei hätte abgelehnt werden müssen: " + JSON.stringify(roh));
    assert(g.run("speicher.meldung()") === "", "Die Prüfung darf den Speicher nicht sperren");
  }
});

test("SPRECH: Systemstimme pausiert, setzt fort, duckt Musik und ignoriert verspätetes onend", () => {
  const g = game({ vorleseStimme: "system", sound: "an" }, { now: JETZT });
  g.run(`
    window.__gesprochen = [];
    window.__sys = { pausiert: 0, fortgesetzt: 0, abgebrochen: 0 };
    window.SpeechSynthesisUtterance = function (text) { this.text = text; };
    window.speechSynthesis = {
      getVoices: function () { return []; },
      speak: function (u) { window.__gesprochen.push(u); },
      pause: function () { window.__sys.pausiert += 1; },
      resume: function () { window.__sys.fortgesetzt += 1; },
      cancel: function () { window.__sys.abgebrochen += 1; }
    };
  `);
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  const knopf = () => g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf")[0];
  knopf().emit("click");
  assert.equal(g.run("window.__gesprochen.length"), 1);
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");
  assert.equal(knopf().textContent, "⏸ Pause");
  assert(g.run("musik.lautstaerke()") < 0.25, "Musik muss während Systemstimme leiser werden");

  knopf().emit("click"); // Pause
  assert.equal(g.run("window.__sys.pausiert"), 1);
  assert.equal(knopf().textContent, "▶ Weiter");

  knopf().emit("click"); // Weiter
  assert.equal(g.run("window.__sys.fortgesetzt"), 1);
  assert.equal(knopf().textContent, "⏸ Pause");

  // Ein neues Vorlesen startet eine zweite Ausgabe; verspätetes onend der ersten darf nichts abbrechen.
  g.run("sprechAudio.spiele('tag01-text', 'Neu')");
  assert.equal(g.run("window.__gesprochen.length"), 2);
  g.run("window.__gesprochen[0].onend()");
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");
  g.run("window.__gesprochen[1].onend()");
  assert.equal(g.run("sprechAudio.aktuell()"), null);
  assert(g.run("window.__sys.abgebrochen") >= 1);
});

test("SPRECH: Schrittwechsel und Startseite stoppen laufendes Audio sauber", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf")[0].emit("click");
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");

  // Weiter in Schritt 2 muss das Vorlesen aus Schritt 1 stoppen.
  weiter(g);
  assert.equal(g.run("sprechAudio.aktuell()"), null);

  // Zurück zu Schritt 1, Audio starten, dann über Startseite-Knopf stoppen.
  g.nodes.get("sprechInhalt").querySelectorAll("button").find(b => b.textContent === "◀ Zurück").emit("click");
  g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf")[0].emit("click");
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");
  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(g.run("sprechAudio.aktuell()"), null);
});

test("NAVI: Kopfzeile wechselt Titel und Unterzeile zwischen Mathe und Deutsch", () => {
  const g = game({}, { now: JETZT });
  assert.equal(g.nodes.get("kopfTitel").textContent, "Mathe üben");
  assert.match(g.nodes.get("kopfZeile").textContent, /Raum 1000/);
  g.nodes.get("deutschUmschalter").emit("click");
  assert.equal(g.nodes.get("kopfTitel").textContent, "Deutsch üben");
  assert.match(g.nodes.get("kopfZeile").textContent, /Sprechtraining/);
  g.nodes.get("matheUmschalter").emit("click");
  assert.equal(g.nodes.get("kopfTitel").textContent, "Mathe üben");
});

test("TON: Vorlesen-Regler ändert laufende Stimmprobe live und Musik-Regler hält Ducking", () => {
  const g = game({ sound: "an" }, { now: JETZT });
  g.run("zeigeFortschritt('ton')");
  const probe = g.nodes.get("tonInhalt").querySelectorAll("button")
    .find(b => /Stimmprobe/.test(b.textContent));
  probe.emit("click");
  const regler = g.nodes.get("tonInhalt").querySelectorAll("input");
  regler[0].value = "40";
  regler[0].emit("input");
  assert.equal(g.audios[g.audios.length - 1].volume, 0.4);
  regler[1].value = "60";
  regler[1].emit("input");
  assert(Math.abs(g.run("musik.lautstaerke()") - 0.27) < 0.001,
    "Musik bleibt während der Stimmprobe geduckt (45 % von 0.6 = 0.27)");
});
