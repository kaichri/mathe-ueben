"use strict";
/* =========================================================================
   Regressionstests für die Befunde aus reports/code-audit.md sowie für die
   beiden angepassten Spielregeln:

   REGEL-1  Wiederholungsrunden: 1 Stern je richtig gelöster Aufgabe, 0 Sterne
            für falsche, keine Obergrenze. Reguläre Tagesrunden unverändert.
   REGEL-2  Abschließen nur nach Bestätigung, sobald mindestens eine Aufgabe
            unbeantwortet ist (50/50 schließt direkt ab).

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
function abgeben(g, anzahlKlicks) {
  const klicks = anzahlKlicks || 6;
  for (let i = 0; i < klicks; i++) g.nodes.get("pruefenKnopf").emit("click");
  if (frageDialogOffen(g)) g.nodes.get("frageJaKnopf").emit("click");
}

/* Baut eine Wiederholungsrunde mit lauter gleichartigen Additionsaufgaben
   (Lösung 7), damit die Sterneregel unabhängig vom Tagesquiz prüfbar ist. */
function baueWiederholung(g, anzahl) {
  g.run(`const karten = Array.from({length: ${anzahl}}, (_, i) => ({
      ident: 'u' + i, bereich: 'add', layout: 'einfach', darstellung: '3 + 4 =',
      schluessel: 'u' + i,
      felder: [{korrekt: 7, anzeige: '7', typ: 'zahl', beschriftung: '', darstellung: '', einheit: ''}]
    }));
    const rr = baueRunde([{ bereich: 'wiederholung', titel: 'Noch einmal üben', untertitel: '', aufgaben: karten }]);
    rr.bereichsArt = 'uebungen';
    zeigeRunde(rr);`);
}
function loeseWiederholung(g, anzahlRichtige, anzahlKarten) {
  g.run(`runde.karten.forEach((karte, i) => {
      const knoten = eingabeZuFeld.get(karte.felder[0]);
      knoten.value = i < ${anzahlRichtige} ? '7' : '';
    });`);
}

/* ================================================================ REGEL-1 */

test("Regular quiz unlocks at 45 of 50 without awarding stars", () => {
  for (const richtig of [0, 44, 45, 50]) {
    const g = game({}, { now: JETZT });
    g.run("zeigeRunde(neuesTagesSet())");
    g.fill(richtig); abgeben(g);
    assert.equal(g.run("weltHeuteFreigeschaltet(\'bluey\')"), richtig >= 45);
    assert.equal(g.data().runden.at(-1).richtig, richtig);
    assert.equal(g.data().runden.at(-1).sterne, undefined);
    assert.equal(g.data().bonusGesamt, 0);
  }
});

test("Practice records answers once and awards no bonus stars", () => {
  const g = game({}, { now: JETZT });
  baueWiederholung(g, 50); loeseWiederholung(g, 50, 50); abgeben(g, 1);
  g.run("fertigAnsicht = false; pruefeRunde()");
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.data().runden[0].richtig, 50);
  assert.equal(g.data().bonusGesamt, 0);
  assert.equal(g.run("weltHeuteFreigeschaltet(\'bluey\')"), false);
});

/* ================================================================ REGEL-2 */

test("REGEL-2: 50 von 50 beantwortet schließt ohne Dialog ab", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(50);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(frageDialogOffen(g), false, "Bei vollständig beantworteter Runde darf kein Dialog erscheinen");
  assert.equal(g.run("fertigAnsicht"), true);
  assert.equal(g.data().runden.length, 1);
});

test("REGEL-2: 49 von 50 beantwortet fragt immer nach", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(49);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");

  assert.equal(frageDialogOffen(g), true, "Bei einer offenen Aufgabe muss der Dialog erscheinen");
  assert.equal(g.run("fertigAnsicht"), false, "Ohne Bestätigung darf nichts abgeschlossen werden");
  assert.equal(g.data().runden.length, 0);
  assert.match(g.nodes.get("frageText").textContent, /1 von 50/,
    "Der Dialog muss die Zahl der offenen Aufgaben nennen");
  assert.match(g.nodes.get("frageText").textContent, /1 von 50 Aufgaben offen/);
  assert.equal(g.nodes.get("frageJaKnopf").textContent, "Trotzdem abgeben");
  assert.equal(g.nodes.get("frageNeinKnopf").textContent, "Weiter üben");
  assert.equal(g.document.activeElement, g.nodes.get("frageNeinKnopf"),
    "Der Standardfokus muss auf 'Weiter üben' liegen");
});

test("REGEL-2: ohne Antwort erscheint der Dialog mit der richtigen Anzahl", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(frageDialogOffen(g), true);
  assert.match(g.nodes.get("frageText").textContent, /50 von 50 Aufgaben offen/);
  assert.equal(g.data().runden.length, 0);
});

test("REGEL-2: Escape bricht den Abschluss ab", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(49);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(frageDialogOffen(g), true);
  g.key("Escape");
  assert.equal(frageDialogOffen(g), false, "Escape muss den Dialog schließen");
  assert.equal(g.run("fertigAnsicht"), false);
  assert.equal(g.data().runden.length, 0, "Nach Escape darf nicht bewertet worden sein");
  assert.equal(g.run("abgabeBestaetigt"), false);
});

test("REGEL-2: 'Weiter üben' bricht ab, danach kann weitergearbeitet werden", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(48);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  g.nodes.get("frageNeinKnopf").emit("click");
  assert.equal(frageDialogOffen(g), false);
  assert.equal(g.run("fertigAnsicht"), false);
  const feld = g.run("kartenEingaben.get(runde.karten[48].ident)[0]");
  feld.value = "1";
  assert.equal(feld.disabled, false, "Die Felder müssen weiter bedienbar sein");
  // Jetzt noch eine Aufgabe offen -> erneuter Versuch fragt wieder
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(frageDialogOffen(g), true);
  assert.match(g.nodes.get("frageText").textContent, /1 von 50/);
});

test("REGEL-2: 'Trotzdem abgeben' schließt ab und sperrt die Felder", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(49);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.run("fertigAnsicht"), true);
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.run("kartenEingaben.get(runde.karten[0].ident)[0].disabled"), true);
});

test("REGEL-2: auch eine Wiederholungsrunde fragt bei offenen Aufgaben nach", () => {
  const g = game({}, { now: JETZT });
  baueWiederholung(g, 5);
  loeseWiederholung(g, 3, 5);
  g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(frageDialogOffen(g), true, "Auch die Wiederholungsrunde muss nachfragen");
  assert.match(g.nodes.get("frageText").textContent, /2 von 5 Aufgaben offen/);
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.data().runden.at(-1).richtig, 3);
});

/* ---------------------------------------------------------------- BEFUND-1 */
test("BEFUND-1: eine einzelne Wiederholungsaufgabe bleibt in der Statistik", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(49);
  abgeben(g);
  assert.equal(g.data().bonusGesamt, 0);
  const knopf = wiederholungsKnopf(g);
  assert(knopf, "Wiederholungsknopf fehlt");
  knopf.emit("click");
  assert.equal(g.run("runde.karten.length"), 1);
  g.fill(1);
  abgeben(g, 3);
  assert.equal(g.data().runden.at(-1).richtig, 1);
  assert.equal(g.data().bonusGesamt, 0);
});

/* ---------------------------------------------------------------- BEFUND-2 */
test("BEFUND-2: Abgeben ohne Bestätigung ist nicht möglich", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  const erstesFeld = g.run("kartenEingaben.get(runde.karten[0].ident)[0]");
  erstesFeld.value = "1";
  g.run("zeigeAbschnitt(5)");
  g.nodes.get("pruefenKnopf").emit("click");

  assert.equal(frageDialogOffen(g), true, "Es muss eine Rückfrage erscheinen");
  assert.equal(g.run("fertigAnsicht"), false);
  assert.equal(g.data().runden.length, 0);
  assert.equal(erstesFeld.disabled, false, "Die Felder bleiben bis zur Bestätigung offen");

  // Solange der Dialog offen ist, ist der Hintergrund gesperrt.
  g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.data().runden.length, 0);

  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.run("fertigAnsicht"), true);
  assert.equal(g.data().runden.length, 1);
  assert.equal(erstesFeld.disabled, true);
});

test("BEFUND-2: eine vollständige Runde wird nicht behelligt", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(50);
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
  g.run("speicher.daten().bonusGesamt = 4; speicher.speichere()");
  assert.doesNotMatch(g.run("speicher.meldung()"), /anderen Fenster/,
    "Das Löschen der Browserdaten ist kein Mehrfenster-Konflikt");
  assert.equal(g.nodes.get("speicherHinweis").hidden, true);
  const gespeichert = JSON.parse(g.raw());
  assert.equal(gespeichert.bonusGesamt, 4, "Der Stand muss neu geschrieben werden");
  assert.equal(Object.keys(gespeichert.tagesSet.antworten).length, 3);

  // Fall 2: Eintrag wurde geleert (leerer String ist kein gültiger Spielstand)
  const g2 = game({}, { now: JETZT });
  g2.run("speicher.daten().bonusGesamt = 2; speicher.speichere()");
  g2.run("window.localStorage.setItem(SPEICHER_NAME, ''); speicher.daten().bonusGesamt = 7; speicher.speichere()");
  assert.doesNotMatch(g2.run("speicher.meldung()"), /anderen Fenster/);
  assert.equal(JSON.parse(g2.raw()).bonusGesamt, 7);
});

test("BEFUND-3: ein echter Mehrfenster-Konflikt wird weiterhin erkannt", () => {
  const g = game({}, { now: JETZT });
  g.run(`window.localStorage.setItem(SPEICHER_NAME, JSON.stringify(Object.assign({}, speicher.daten(), {bonusGesamt: 99})));
    speicher.daten().bonusGesamt = 1; speicher.speichere()`);
  assert.match(g.run("speicher.meldung()"), /anderen Fenster/);
  assert.equal(JSON.parse(g.raw()).bonusGesamt, 99, "Der neuere Stand darf nicht überschrieben werden");
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
  abgeben(g, 1);
  const text = g.nodes.get("ergebnisKasten").textContent.replace(/\s+/g, " ");
  assert.doesNotMatch(text, /54 \u00F7 7 = 5/, "Der Rest darf nicht als zweites Ergebnis erscheinen");
  assert.match(text, /54 \u00F7 7 = 7 Rest 5/);
  assert.match(text, /\u25A1 = 58/);
});

/* ---------------------------------------------------------------- BEFUND-5 */
test("BEFUND-5: ohne offene Bonussterne startet keine neue Bonusrunde", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50); g.run("pruefeRunde()");
  g.run("zeigeRunde(baueBonusRunde('bluey'))"); g.fill(5); g.run("pruefeRunde()");
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
  assert.match(text, /3 von 5/);
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
  assert.match(heute.className, /heute/);
  assert.equal(heute.children[0].textContent, "Heute");
  assert.equal(heute.children[1].textContent, "🌟 2");
  assert.doesNotMatch(heute.className, /tagesmaximum/);
  assert.match(kalender.children[3].textContent, /^1 Tag ge\u00fcbt/);
});

test("BEFUND-7: normale Runden bleiben als geuebte Tage sichtbar", () => {
  const g = game({ runden: [{ datum: "2026-10-31", sterne: 3 }] }, { now: JETZT });
  const kalender = g.run("baueKalender(speicher.daten())");
  const punkte = kalender.children[1].children;
  const heute = punkte[punkte.length - 1];
  assert.equal(heute.title, "31.10.2026: 0 Bonussterne");
  assert.doesNotMatch(heute.className, /tagesmaximum/);
});

test("Der Übekalender summiert Bonussterne pro Tag und markiert das Tagesmaximum", () => {
  const g = game({ runden: [
    { bonus: true, bonusRichtig: 2, datum: "2026-10-30" },
    { bonus: true, bonusRichtig: 3, datum: "2026-10-30" }
  ] }, { now: JETZT });
  const kalender = g.run("baueKalender(speicher.daten())");
  const punkte = kalender.children[1].children;
  const gestern = punkte[punkte.length - 2];
  assert.equal(gestern.children[1].textContent, "🌟 5");
  assert.match(gestern.className, /tagesmaximum/);
  assert.match(kalender.children[2].textContent, /5 Bonussterne = Tagesmaximum/);
});

test("Die Zusammenfassung zeigt nur Quiz und Bonusquiz", () => {
  const g = game({ runden: [
    { wiederholung: false, richtig: 40, gesamt: 50 },
    { uebezeiten: { wiederholung: 1000 }, richtig: 2, gesamt: 4 },
    { bonus: true, bonusRichtig: 5, richtig: 5, gesamt: 5 },
    { richtig: 3, gesamt: 5 }
  ] }, { now: JETZT });
  g.run("zeigeStatistikInhalt()");
  const statistik = g.nodes.get("statistikInhalt").textContent;
  assert.match(statistik, /Quiz · 1 abgeschlossen · 40 von 50 Aufgaben richtig \(80 %\)/);
  assert.match(statistik, /Bonusquiz · 1 abgeschlossen · 5 von 5 Aufgaben richtig/);
  assert.doesNotMatch(statistik, /Wiederholungen|Ältere Übungen ohne Quiztyp/);
});

test("Die Bereichsstatistik mittelt nur die letzten zehn Übungen je Bereich", () => {
  const runden = [
    { bereiche: { add: { richtig: 0, gesamt: 10 }, sub: { richtig: 1, gesamt: 2 } } },
    ...Array.from({ length: 9 }, () => ({ bereiche: { add: { richtig: 1, gesamt: 1 } } })),
    { bereiche: { add: { richtig: 0, gesamt: 10 } } },
    { bonus: true },
    {}
  ];
  const g = game({ runden }, { now: JETZT });
  g.run("zeigeStatistikInhalt()");
  const statistik = g.nodes.get("statistikInhalt").textContent;
  assert.match(statistik, /Addition90 %/);
  assert.match(statistik, /Subtraktion50 %/);
  assert.doesNotMatch(statistik, /So war es in deinen letzten Runden/);
});

/* ---------------------------------------------------------------- BEFUND-8 */
test("BEFUND-8: Meldungen nennen das eingestellte Tageskontingent", () => {
  const g = game({}, { now: JETZT });
  g.run("EINSTELLUNGEN.bonusSterneProTag = 5; holBonusTag().verteilt = 5");
  const text = g.run("bonusTagesText()");
  assert.match(text, /5 neue/);
  assert.doesNotMatch(text, /3 neue/);
  g.run("schalteWeltFrei('bluey'); aktualisiereWeltwahl()");
  const knopf = g.run("document.querySelectorAll('.themen-knopf')[0]");
  assert.match(knopf.querySelector(".thema-bonusstatus").textContent, /5 neue/);
  assert.doesNotMatch(knopf.querySelector(".thema-bonusstatus").textContent, /Bonus-kontingent/);
});

test("Die geschaffte Welt wird bis zum Tageswechsel durch ihre Bonuswelt ersetzt", () => {
  const g = game({}, { now: JETZT });
  const karte = g.run("document.querySelectorAll('.themen-knopf')[1]");
  karte.emit("click");
  assert.equal(g.nodes.get("homeHaus").attributes.href, "#haus-gabby");
  g.nodes.get("losKnopf").emit("click");
  g.fill(50);
  g.run("pruefeRunde()");
  g.nodes.get("abbruchKnopf").emit("click");

  assert.match(karte.querySelector(".thema-titel").textContent, /Bonuswelt Gabbys Puppenhaus/);
  assert.equal(g.run("document.querySelectorAll('.themen-knopf').length"), 3);
  assert.equal(g.run("document.querySelectorAll('.themen-bonus').length"), 1);
  assert.equal(g.run("document.querySelectorAll('.themen-knopf')[0].disabled"), true);
  assert.equal(g.run("document.querySelectorAll('.themen-knopf')[2].disabled"), true);
  assert.equal(karte.disabled, false);
  g.nodes.get("losKnopf").emit("click");
  assert.equal(g.run("runde.bereichsArt"), "bonus");
  assert.equal(g.run("runde.welt"), "gabby");

  g.time("2026-11-01T15:00:00Z");
  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(karte.querySelector(".thema-titel").textContent, "Gabbys Puppenhaus");
  assert.equal(karte.querySelector(".thema-bonusstatus").hidden, true);
  assert.equal(g.run("document.querySelectorAll('.themen-knopf')[0].disabled"), false);
});

test("Nach einem abgeschlossenen Quiz bleiben andere Welten beim erneuten Versuch gesperrt", () => {
  const g = game({}, { now: JETZT });
  const andereWelt = g.run("document.querySelectorAll('.themen-knopf')[1]");
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(40);
  abgeben(g);
  g.nodes.get("abbruchKnopf").emit("click");
  assert.equal(andereWelt.disabled, true);
  andereWelt.emit("click");
  assert.equal(g.run("modus"), "bluey");
  g.run("neuesTagesSet(); aktualisiereWeltwahl()");
  assert.equal(andereWelt.disabled, true);
  assert.equal(g.nodes.get("losKnopf").disabled, false);
});

test("Ballons feiern erst den letzten Bonusstern des Tages", () => {
  const g = game({}, { now: JETZT });
  g.run("EINSTELLUNGEN.spaessig = true; zeigeRunde(neuesTagesSet())");
  g.fill(50);
  g.run("pruefeRunde(); startBonusWelt('bluey')");
  g.fill(4);
  abgeben(g, 1);
  const regen = g.nodes.get("regen");
  assert.equal(regen.classList.contains("ballon-feier"), false);
  g.fill(5);
  g.run("pruefeRunde()");
  assert.equal(regen.classList.contains("ballon-feier"), true);
  assert.equal(regen.children.filter(kind => kind.className === "regen-ballon").length, 12);
});

/* ---------------------------------------------------------------- BEFUND-9 */
test("BEFUND-9: der Geschichten-Merkzettel bleibt duplikatfrei", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(g.run("runde.karten.length") - 1);
  abgeben(g);
  const vorher = plain(g.data().zuletzt);
  wiederholungsKnopf(g).emit("click");
  assert(g.run("runde.karten.some(k => k.vorlage)"), "Wiederholung enthält keine Geschichte");
  g.fill(g.run("runde.karten.length"));
  abgeben(g, 3);
  const zuletzt = plain(g.data().zuletzt);
  assert.equal(new Set(zuletzt).size, zuletzt.length, "Merkzettel enthält Duplikate: " + JSON.stringify(zuletzt));
  assert.equal(zuletzt[0], vorher[vorher.length - 1], "Die wiederholte Geschichte steht jetzt vorn");
  assert(zuletzt.length <= 12);
});

/* --------------------------------------------------------------- BEFUND-10 */
test("BEFUND-10: die Startseite meldet eine Bonusrunde als Bonusrunde", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50); g.run("pruefeRunde()");
  g.run("zeigeRunde(baueBonusRunde('bluey'))"); g.fill(2); g.run("pruefeRunde()");
  g.nodes.get("abbruchKnopf").emit("click");
  const text = g.nodes.get("startErgebnis").textContent.replace(/\s+/g, " ");
  assert.doesNotMatch(text, /0 Sterne/, "Startseite meldet für die Bonusrunde 0 Sterne");
  assert.match(text, /Letzte Bonusrunde: 2 von 5 geknobelt/);
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
  assert.equal(g.run(`feldIstRichtig({typ: 'zeit', zeit: {stunde: 9, minute: 25}}, '925')`), true);
});

/* --------------------------------------------------------------- BEFUND-13 */
test("BEFUND-13: eine abgeschlossene Tagesrunde wird nicht erneut bewertet", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.run("gesamtSterne()"), 0);
  g.nodes.get("abbruchKnopf").emit("click");
  g.run("zeigeRunde(rundeAusSet(speicher.daten().tagesSet))");
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.run("gesamtSterne()"), 0, "Die fertige Runde wurde erneut belohnt");
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
  quelle.run("sichereTagesAntworten(); speicher.daten().bonusGesamt = 12; speicher.speichere()");
  const g = game({}, { raw: quelle.raw(), now: JETZT });
  assert.equal(g.run("speicher.meldung()"), "");
  assert.equal(g.run("gesamtSterne()"), 12);
  assert.equal(Object.keys(g.data().tagesSet.antworten).length, 5);
});

/* --------------------------------------------------------------- BEFUND-15 */
test("BEFUND-15: Einzahl bei genau einer fehlenden Aufgabe", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(44);
  abgeben(g);
  const text = g.nodes.get("ergebnisKasten").textContent;
  assert.doesNotMatch(text, /1 richtige Aufgaben/);
  assert.match(text, /Noch 1 richtige Aufgabe /);
});

test("BEFUND-15: Mehrzahl bleibt korrekt", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(40);
  abgeben(g);
  assert.match(g.nodes.get("ergebnisKasten").textContent, /Noch 5 richtige Aufgaben/);
});
