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
  const knopf = tageInhalte(g)[nr - 1];
  knopf.emit("click");
}
function offneEinheitMitSatz(g, nr, satz) {
  g.run("sprech.oeffneEinheit(SPRECHTRAINING.einheit(" + nr + "), " + satz + ")");
}
function weiter(g) {
  g.nodes.get("sprechInhalt").querySelectorAll(".sprech-weiter").at(-1).emit("click");
}
function kriterien(g) {
  return g.nodes.get("sprechInhalt").querySelectorAll(".sprech-kriterium");
}
function setzeStufe(g, kriterium, stufe) {
  kriterien(g)[kriterium].querySelectorAll(".stufen-knopf")[stufe].emit("click");
}

/* ------------------------------------------------------------------ Daten */

test("DATEN: jede Geschichte hat 4 Fragensätze und alle Audio-Clips vorhanden", () => {
  const ordner = path.join(__dirname, "..", "audio", "sprechtraining");
  assert.equal(SPRECHTRAINING.EINHEITEN.length, 14);
  for (const e of SPRECHTRAINING.EINHEITEN) {
    const nr = ("0" + e.tag).slice(-2);
    assert(Array.isArray(e.fragenSets) && e.fragenSets.length >= 4,
      "Geschichte " + e.tag + " braucht mindestens 4 Fragensätze");
    e.fragenSets.forEach(function (satz, s) {
      assert(satz.length >= 3, "Fragensatz " + (s + 1) + " von Geschichte " + e.tag + " hat genug Fragen");
      satz.forEach(function (f, i) {
        assert(typeof f.frage === "string" && f.frage.trim(), "Frage fehlt: Geschichte " + e.tag);
        assert(typeof f.antwort === "string" && f.antwort.trim(), "Antwort fehlt: Geschichte " + e.tag);
        for (const stimme of ["thorsten", "ramona"]) {
          assert(fs.existsSync(path.join(ordner, stimme, "tag" + nr + "-s" + (s + 1) + "-f" + (i + 1) + ".mp3")),
            "Audio fehlt: " + stimme + "/tag" + nr + "-s" + (s + 1) + "-f" + (i + 1) + ".mp3");
        }
      });
    });
    for (const rest of ["text", "hinweis"]) {
      for (const stimme of ["thorsten", "ramona"]) {
        assert(fs.existsSync(path.join(ordner, stimme, "tag" + nr + "-" + rest + ".mp3")),
          "Audio fehlt: " + stimme + "/tag" + nr + "-" + rest + ".mp3");
      }
    }
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

test("SPRECH: Übersicht zeigt Welten, Los-Knopf und alle Geschichten offen", () => {
  const g = game({}, { now: JETZT });
  assert.equal(g.data().sprechtraining, undefined, "Es gibt keinen Tag-1-bis-14-Spielstand mehr");
  g.run("sprech.oeffnen()");
  assert.equal(g.nodes.get("sprechBildschirm").hidden, false);
  const inhalt = g.nodes.get("sprechInhalt");
  const welten = inhalt.querySelectorAll(".deutsch-welt");
  assert.equal(welten.length, 3);
  assert.equal(inhalt.querySelectorAll(".sprech-los").length, 1, "großer Start-Knopf");
  const tage = tageInhalte(g);
  assert.equal(tage.length, 14);
  assert(tage.every(t => !t.disabled), "keine Geschichte ist gesperrt");
  assert.match(inhalt.textContent, /bestimmte Geschichte aussuchen/);
  const namen = plain(g.run("DEUTSCH_WELTEN.hunde.namen"));
  const reihe = g.nodes.get("sprechMaskottchenReihe").querySelectorAll(".maskottchen");
  assert.equal(reihe.length, 8, "die Maskottchen-Reihe zeigt alle Figuren der Welt");
  assert(reihe.every(k => namen.includes(k.title)), "jedes Maskottchen trägt einen Namen der Welt");
});

test("SPRECH: eine Geschichte aus dem Raster öffnet die Übung mit Zufallssatz", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheit(g, 1);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.match(inhalt.textContent, /1\. Zuhören/);
  assert.match(inhalt.textContent, /Emma geht am Nachmittag in den Garten/);
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
  assert.match(g.nodes.get("sprechInhalt").textContent, /1\. Zuhören/);

  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(g.nodes.get("sprechBildschirm").hidden, false, "bleibt im Deutsch-Bereich");
  assert.equal(g.nodes.get("sprechInhalt").querySelectorAll(".sprech-los").length, 1,
    "Deutsch-Startseite, nicht die laufende Übung");

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
  assert.match(inhalt.textContent, /1\. Zuhören/);
  assert.match(inhalt.textContent, /Emma geht am Nachmittag in den Garten/);
  inhalt.querySelectorAll(".vorlesen-knopf")[0].emit("click");
  assert.equal(g.audios.length, 1);
  assert.equal(g.audios[0].src, "audio/sprechtraining/thorsten/tag01-text.mp3");
  assert.equal(g.audios[0].volume, 1);
  assert.equal(g.audios[0].plays, 1);
  assert.equal(g.run("sprechAudio.aktuell()"), "tag01-text");
  inhalt.querySelectorAll(".vorlesen-knopf")[0].emit("click"); // Stoppen
  assert.equal(g.run("sprechAudio.aktuell()"), null);
});

test("SPRECH: Verstehen – Antworten für die Begleitung sind verbergbar", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  weiter(g);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.match(inhalt.textContent, /2\. Verstehen/);
  assert.match(inhalt.textContent, /Wer geht in den Garten\?/);
  assert.match(inhalt.textContent, /→ Emma geht in den Garten\./);
  const antworten = inhalt.querySelectorAll(".sprech-antwort");
  assert(antworten.every(a => a.classList.contains("verborgen")), "Antworten sind anfangs verborgen");
  inhalt.querySelectorAll("button").find(b => /Antworten zeigen/.test(b.textContent)).emit("click");
  const sichtbar = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-antwort");
  assert(!sichtbar.some(a => a.classList.contains("verborgen")), "Antworten sind sichtbar");
});

test("SPRECH: Fragensätze wechseln – Satz 2 fragt anders als Satz 1", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 2);
  weiter(g);
  const text = g.nodes.get("sprechInhalt").textContent;
  assert.match(text, /Wann geht Emma in den Garten\?/);
  assert(!text.includes("Wer geht in den Garten?"), "Satz 2 ist nicht einfach Satz 1");
  const vorlesen = g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf");
  vorlesen[0].emit("click");
  assert.equal(g.audios[0].src, "audio/sprechtraining/thorsten/tag01-s2-f1.mp3",
    "auch die Alternativfragen haben ihren eigenen Clip");
});

test("SPRECH: Satzbildung – Satzanfänge erst auf „Hilfe zeigen“", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  weiter(g); weiter(g);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.match(inhalt.textContent, /3\. Satz bilden/);
  assert(inhalt.querySelectorAll(".sprech-satzanfaenge")[0].classList.contains("verborgen"));
  inhalt.querySelectorAll("button").find(b => /Hilfe zeigen/.test(b.textContent)).emit("click");
  assert(!g.nodes.get("sprechInhalt").querySelectorAll(".sprech-satzanfaenge")[0].classList.contains("verborgen"));
  assert.match(g.nodes.get("sprechInhalt").textContent, /Emma geht …/);
});

test("SPRECH: Bewertung – Stichworte und Stufen, Abschluss zeigt Rückmeldung", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheitMitSatz(g, 1, 1);
  weiter(g); weiter(g); weiter(g);
  const inhalt = g.nodes.get("sprechInhalt");
  assert.match(inhalt.textContent, /4\. Erzählen/);
  assert.match(inhalt.textContent, /Hinweis heute: Emma soll drei Informationen finden/);

  const abschluss = inhalt.querySelectorAll(".sprech-fertig-knopf")[0];
  assert.equal(abschluss.disabled, true, "Ohne Bewertung darf nicht abgeschlossen werden");

  inhalt.querySelectorAll(".sprech-chip")[0].emit("click"); // „Garten"
  inhalt.querySelectorAll(".sprech-chip")[2].emit("click"); // „hebt auf"
  setzeStufe(g, 0, 1); // Reihenfolge: größtenteils richtig
  assert.equal(abschluss.disabled, true);
  setzeStufe(g, 1, 2); // Grammatik: selbstständig
  setzeStufe(g, 2, 1); // Aussprache: meistens verständlich
  setzeStufe(g, 3, 1); // Zusammengehörigkeit: verbindet schon

  const fertig = g.nodes.get("sprechInhalt").querySelectorAll(".sprech-fertig-knopf")[0];
  assert.equal(fertig.disabled, false);
  fertig.emit("click");

  const karte = g.nodes.get("sprechInhalt").textContent;
  assert.match(karte, /Übung geschafft/);
  assert.match(karte, /Heute schon richtig stark: Ganze Sätze & Grammatik/);
  assert.match(karte, /Nächstes Mal drauf achten: Reihenfolge/);
  assert.match(karte, /2 von 4 wichtigen Dingen/);
  assert.equal(g.data().sprechtraining, undefined, "Bewertungen landen nicht mehr im Spielstand");
  assert(g.nodes.get("sprechInhalt").querySelectorAll("button")
    .some(b => /Neue Übung/.test(b.textContent)), "es geht direkt weiter mit einer neuen Übung");
});

test("SPRECH: Die Schaltfläche „Neue Übung“ startet wieder eine Geschichte", () => {
  const g = game({}, { now: JETZT });
  g.run("sprech.oeffnen()");
  g.run("sprech.starteZufaellig()");
  const vorlesen = g.nodes.get("sprechInhalt").querySelectorAll(".vorlesen-knopf");
  assert(vorlesen.length >= 1, "eine Übung ist offen");
  assert.match(g.nodes.get("sprechInhalt").textContent, /1\. Zuhören/);
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
  assert.match(aktiv[0].textContent, /Süße Hamster/);
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

test("DEUTSCH: Welt-Figuren begleiten die Einheit und der Abschluss lobt die Welt", () => {
  const g = game({ deutschWelt: "weihnachten" }, { now: JETZT });
  g.run("sprech.oeffnen()");
  offneEinheit(g, 1);
  assert.equal(g.nodes.get("sprechInhalt").querySelectorAll(".sprech-figur").length, 1);
  weiter(g); weiter(g); weiter(g);
  const inhalt = g.nodes.get("sprechInhalt");
  inhalt.querySelectorAll(".sprech-chip")[0].emit("click");
  for (let i = 0; i < 4; i += 1) { setzeStufe(g, i, 2); }
  inhalt.querySelectorAll(".sprech-fertig-knopf")[0].emit("click");
  const karte = g.nodes.get("sprechInhalt");
  const figuren = karte.querySelectorAll(".sprech-figuren")[0].children;
  assert.equal(figuren.length, 8);
  assert.equal(figuren[0].src, "bilder/weihnachtsmann.webp");
  assert.match(karte.textContent, /Frohe Weihnachten/);
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
