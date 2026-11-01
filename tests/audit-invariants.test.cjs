"use strict";
/* =========================================================================
   Audit-Tests (unabhängig von den Projekt-Tests): Spielzustand, Speicher,
   Tageswechsel. Diese Datei prüft Invarianten, die ausnahmslos gelten müssen.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");

const plain = v => JSON.parse(JSON.stringify(v));
const summe = (liste, f) => liste.reduce((n, x) => n + f(x), 0);
const JETZT = "2026-10-31T12:00:00Z"; // 13:00 Wien, eindeutig ein Tag

function kartenKnoten(n, treffer) {
  if (treffer(n)) return n;
  for (const c of n.children) { const t = kartenKnoten(c, treffer); if (t) return t; }
  return null;
}
function wiederholungsKnopf(g) {
  return kartenKnoten(g.nodes.get("ergebnisKasten"), n => n.type === "button" && /noch einmal/.test(n.textContent));
}
function neuLaden(g, jetzt) {
  return game({}, { now: jetzt || JETZT, raw: g.raw() });
}

/* Eine Runde vollständig durchklicken: Abschnitte vor, dann Fertig. */
function spieleRunde(g, richtig) {
  g.fill(richtig);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
}

function pruefeGrundInvarianten(g, kontext) {
  const d = g.data();
  // Lebenszeitsterne == Summe der regulären Rundensterne (unter 1000 Zeilen)
  if (d.runden.length < 1000) {
    assert.equal(d.sterneGesamt, summe(d.runden.filter(r => !r.bonus), r => r.sterne || 0),
      kontext + ": Lebenszeitsterne weichen von der Rundenhistorie ab");
  }
  // Bonusguthaben: verdient minus ausgegeben ist immer ein Vielfaches von 5
  assert.equal((d.bonusGesamt - d.bonussterne) % 5, 0,
    kontext + ": Bonusguthaben passt nicht zu den verdienten Bonussternen");
  assert(d.bonussterne >= 0, kontext + ": negatives Bonusguthaben");
  assert(d.bonusGesamt >= d.bonussterne, kontext + ": mehr Guthaben als verdient");
  assert(d.bonusTag.verteilt >= 0 && d.bonusTag.verteilt <= 3, kontext + ": Tageskontingent verletzt");
  assert.equal(new Set(d.bonusWelten).size, d.bonusWelten.length, kontext + ": doppelte Bonuswelt");
  for (const welt of d.bonusWelten) assert(["bluey", "gabby", "doozie"].includes(welt), kontext + ": unbekannte Welt");
  // Gutscheine: Kennungen eindeutig, Umtausch 1:1
  const ids = d.geschenke.map(x => x.id);
  assert.equal(new Set(ids).size, ids.length, kontext + ": doppelte Gutschein-Kennung");
  assert.equal(d.geschenke.filter(x => x.umgetauschtAm).length,
    d.geschenke.filter(x => x.umgetauschtVon).length, kontext + ": Umtauschvermerke passen nicht zusammen");
  for (const gs of d.geschenke) assert.equal(typeof gs.text, "string", kontext + ": Gutschein ohne Text");
  // Tagesrunde: 50 Aufgaben, eindeutige Kennungen
  if (d.tagesSet) {
    const karten = d.tagesSet.runde.bereiche.flatMap(b => b.aufgaben);
    assert.equal(karten.length, 50, kontext + ": Tagesrunde ohne 50 Aufgaben");
    assert.equal(new Set(karten.map(k => k.ident)).size, 50, kontext + ": doppelte Kartenkennung");
    assert.match(d.tagesSet.datum, /^\d{4}-\d{2}-\d{2}$/, kontext + ": ungültiges Tagesdatum");
    for (const a of Object.values(d.tagesSet.antworten)) {
      assert(Array.isArray(a) && a.every(v => typeof v === "string"), kontext + ": ungültige Antwort");
    }
  }
}

test("AUDIT Zustand: 20 Spieltage mit Neustarts halten alle Invarianten", () => {
  let gespeichert = {};
  for (let tag = 0; tag < 20; tag++) {
    const jetzt = new Date(Date.UTC(2026, 9, 25 + tag, 9)).toISOString();
    let g = game(gespeichert, { now: jetzt });
    const welt = ["bluey", "gabby", "doozie"][tag % 3];

    g.run(`setzeModus('${welt}'); zeigeRunde(neuesTagesSet())`);
    spieleRunde(g, tag % 2 ? 50 : 25);
    assert.equal(g.run("fertigAnsicht"), true);
    pruefeGrundInvarianten(g, `Tag ${tag} nach Tagesrunde`);
    assert.equal(g.run(`weltHeuteFreigeschaltet('${welt}')`), true, `Tag ${tag}: Welt nicht freigeschaltet`);

    // Bonusrunde am selben Tag
    g.nodes.get("abbruchKnopf").emit("click");
    g.run(`startBonusWelt('${welt}')`);
    g.fill(g.run("runde.karten.length"));
    g.run("pruefeRunde()");
    pruefeGrundInvarianten(g, `Tag ${tag} nach Bonusrunde`);
    assert.equal(g.data().bonusTag.verteilt, 3, `Tag ${tag}: Bonuskontingent nicht ausgeschöpft`);

    // Neustart: identischer Stand
    g = neuLaden(g, jetzt);
    pruefeGrundInvarianten(g, `Tag ${tag} nach Neustart`);
    gespeichert = g.saved();
  }
  assert.equal(gespeichert.runden.length, 40);
  assert.equal(gespeichert.bonusGesamt, 60);
  assert.equal(gespeichert.bonussterne, 60);
  assert.equal(gespeichert.geschenke.length, 0);
  assert.equal(gespeichert.sterneGesamt, summe(gespeichert.runden.filter(r => !r.bonus), r => r.sterne));
});

test("AUDIT Zustand: Speichern und Neuladen ist verlustfrei und idempotent", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(37);
  g.run("sichereTagesAntworten(); speicher.speichere()");
  const erst = g.raw();
  const g2 = game({}, { now: JETZT, raw: erst });
  g2.run("speicher.speichere()");
  assert.equal(g2.raw(), erst, "Neuladen verändert den gespeicherten Stand");
  assert.deepEqual(plain(g2.data().tagesSet), plain(g.data().tagesSet));
  // Nochmal laden: weiterhin identisch
  const g3 = game({}, { now: JETZT, raw: g2.raw() });
  assert.equal(g3.raw(), erst);
});

test("AUDIT Zustand: Antworten überleben Abschnittswechsel und Neuladen", () => {
  const g = game({}, { now: JETZT });
  g.run("zeigeRunde(neuesTagesSet())");
  const ids = plain(g.run("runde.karten.slice(0, 6).map(k => k.ident)"));
  g.run(`runde.karten.slice(0, 6).forEach((karte, i) => {
    const knoten = eingabeZuFeld.get(karte.felder[0]);
    knoten.value = String(10 + i);
    knoten.dispatchEvent ? null : null;
    sichereTagesAntworten();
  });`);
  g.run("zeigeAbschnitt(3); zeigeAbschnitt(0); sichereTagesAntworten()");
  const g2 = neuLaden(g);
  g2.run("zeigeRunde(starteTagesRunde())");
  const werte = g2.run(`(${JSON.stringify(ids)}).map(id => {
    const teile = kartenEingaben.get(id);
    return teile ? teile.map(n => n.value) : null;
  })`);
  assert.deepEqual(plain(werte), ids.map((_, i) => [String(10 + i)]));
  assert.equal(g2.run("abschnittZeiger"), 0);
});

test("AUDIT Zustand: Umkehr-, Geld- und Zeitantworten überleben das Neuladen", () => {
  const g = game({}, { now: JETZT });
  let info = null;
  for (let versuch = 0; versuch < 30 && !info; versuch++) {
    g.run("zeigeRunde(neuesTagesSet())");
    const gefunden = plain(g.run(`(() => {
      const out = { umkehr: null, geld: null, zeit: null };
      for (const k of runde.karten) {
        const teile = kartenEingaben.get(k.ident);
        if (!out.umkehr && teile.length > 1) out.umkehr = k.ident;
        if (!out.geld && k.felder.some(f => f.typ === 'geld')) out.geld = k.ident;
        if (!out.zeit && k.felder.some(f => f.typ === 'zeit')) out.zeit = k.ident;
      }
      return out;
    })()`));
    if (gefunden.umkehr && gefunden.geld && gefunden.zeit) info = gefunden;
  }
  assert(info, "in 30 Sets keine Runde mit allen drei Feldtypen gefunden");
  const werte = plain(g.run(`(() => {
    const res = [];
    const setze = (id, vals) => { kartenEingaben.get(id).forEach((n, i) => { n.value = vals[i]; }); res.push([id, vals]); };
    setze(${JSON.stringify(info.umkehr)}, ["42", "7"]);
    setze(${JSON.stringify(info.geld)}, ["16", "50"]);
    setze(${JSON.stringify(info.zeit)}, ["9:25"]);
    sichereTagesAntworten();
    return res;
  })()`));
  const g2 = neuLaden(g);
  g2.run("zeigeRunde(starteTagesRunde())");
  const zurueck = plain(g2.run(`(${JSON.stringify(werte.map(w => w[0]))}).map(id => kartenEingaben.get(id).map(n => n.value))`));
  assert.deepEqual(zurueck, werte.map(w => w[1]),
    "Antworten in Zusatz-/Geld-/Zeitfeldern wurden beim Neuladen nicht wiederhergestellt");
});

test("AUDIT Zustand: Blättern durch alle Abschnitte bewertet nichts", () => {
  const g = game();
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(50);
  for (let i = 0; i < 5; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.data().runden.length, 0, "Weiter/Weiter hat bereits bewertet");
  assert.equal(g.run("gesamtSterne()"), 0);
  assert.equal(g.run("fertigAnsicht"), false);
  g.nodes.get("zurueckKnopf").emit("click");
  assert.equal(g.data().runden.length, 0, "Zurück hat bewertet");
  // Erst der letzte Klick bewertet genau einmal.
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.run("gesamtSterne()"), 5);
  assert.equal(g.data().runden[0].gesamt, 50);
});

test("AUDIT Zustand: zweimal Fertig bewertet nur einmal", () => {
  const g = game();
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(40);
  for (let i = 0; i < 6; i++) g.nodes.get("pruefenKnopf").emit("click");
  const nachher = g.run("gesamtSterne()");
  g.nodes.get("pruefenKnopf").emit("click");
  g.nodes.get("pruefenKnopf").emit("click");
  assert.equal(g.run("gesamtSterne()"), nachher);
  assert.equal(g.data().runden.length, 1);
});

test("AUDIT Zustand: zwei Sets am selben Tag enthalten keine doppelten Rechenaufgaben", () => {
  const g = game();
  let vorher = null;
  for (let i = 0; i < 6; i++) {
    g.run("zeigeRunde(neuesTagesSet())");
    const karten = g.data().tagesSet.runde.bereiche.filter(b => b.bereich !== "geschichte").flatMap(b => b.aufgaben);
    const keys = new Set(karten.map(k => k.schluessel));
    assert.equal(keys.size, karten.length, "doppelte Aufgabe innerhalb einer Runde");
    if (vorher) {
      const gemeinsam = [...keys].filter(k => vorher.has(k));
      assert.equal(gemeinsam.length, 0, "Aufgabe aus dem vorherigen Set wiederholt: " + gemeinsam.join(","));
    }
    vorher = keys;
  }
});

test("AUDIT Zustand: Bonussterne einmalig, Tagesdeckel und Welten getrennt", () => {
  const g = game();
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50); g.run("pruefeRunde()");
  g.run("zeigeRunde(baueBonusRunde('bluey'))");
  const anzahl = g.run("runde.karten.length");
  assert.equal(anzahl, 3);
  g.fill(anzahl);
  g.run("pruefeRunde(); pruefeRunde(); pruefeRunde()");
  assert.equal(g.data().bonussterne, 3, "Bonussterne mehrfach vergeben");
  assert.equal(g.data().bonusGesamt, 3);
  assert.equal(g.data().runden.filter(r => r.bonus).length, 1, "mehrere Bonus-Statistikzeilen");
  assert.equal(g.run("bonusPlaetzeHeute()"), 0, "Tagesdeckel nicht erreicht");
  // Keine weitere Bonusrunde über die Startseite möglich
  g.run("startBonusWelt('gabby')");
  assert.equal(g.run("runde.bereichsArt"), "bonus");
  assert.equal(g.data().bonusGesamt, 3);
  // Nächster Tag: neues Kontingent, alte Sterne bleiben
  g.time("2026-11-02T12:00:00Z");
  assert.equal(g.run("bonusPlaetzeHeute()"), 3);
  assert.equal(g.data().bonusGesamt, 3);
  assert.deepEqual(plain(g.data().bonusWelten), []);
});

test("AUDIT Zustand: Tageswechsel erzeugt neue Aufgaben und behält Sterne und Gutscheine", () => {
  const g = game({ geschenke: [{ id: "alt", datum: "2026-10-31", text: "Gift" }] }, { now: "2026-10-31T12:00:00Z" });
  g.run("zeigeRunde(neuesTagesSet())");
  const alteKeys = g.run("runde.karten.map(k => k.schluessel)");
  g.fill(50);
  g.run("pruefeRunde(); versteckeKino()");
  const sterne = g.run("gesamtSterne()");
  assert.equal(sterne, 5);
  g.time("2026-11-01T12:00:00Z");
  g.nodes.get("abbruchKnopf").emit("click");
  g.nodes.get("losKnopf").emit("click");
  assert.equal(g.data().tagesSet.datum, "2026-11-01");
  assert.equal(Object.keys(g.data().tagesSet.antworten).length, 0);
  assert.equal(g.run("gesamtSterne()"), 5, "Sterne beim Tageswechsel verloren");
  assert.equal(g.data().geschenke.length, 1, "Gutschein beim Tageswechsel verloren");
  const neueKeys = new Set(g.run("runde.karten.map(k => k.schluessel)"));
  const gemeinsam = alteKeys.filter(k => neueKeys.has(k));
  assert.equal(gemeinsam.length, 0, "Aufgaben des Vortags wiederholt: " + gemeinsam.slice(0, 5).join(","));
});

test("AUDIT Zustand: beschädigte Daten werden geschützt und gesichert", () => {
  for (const raw of ['{kaputt', '{"version":99}', 'null', '[]', '0', JSON.stringify({ tagesSet: { datum: "2026-10-31" } })]) {
    const g = game({}, { raw });
    g.run("zeigeRunde(neuesTagesSet()); speicher.speichere()");
    g.pagehide();
    assert.equal(g.raw(), raw, "beschädigter Speicher wurde überschrieben");
    assert.equal(g.writes(), 0);
    assert.equal(g.nodes.get("speicherHinweis").hidden, false, "kein Speicherhinweis");
    assert.equal(g.run("speicher.sicherung().originalSpeicher"), raw);
    assert(g.run("speicher.meldung()").length > 0);
  }
});

test("AUDIT Zustand: neuerer Stand eines anderen Fensters bleibt erhalten", () => {
  const g = game();
  g.run(`window.localStorage.setItem(SPEICHER_NAME, JSON.stringify(Object.assign({}, speicher.daten(), {
    sterneGesamt: 42, bonussterne: 5, bonusGesamt: 10,
    geschenke: [{id:'fremd', datum:'2026-10-31', text:'Fremder Gutschein'}], bonusWelten: ['gabby']
  }))); setzeModus('gabby'); speicher.speichere()`);
  const d = g.saved();
  assert.equal(d.sterneGesamt, 42);
  assert.equal(d.bonusGesamt, 10);
  assert.equal(d.geschenke[0].text, "Fremder Gutschein");
  assert.deepEqual(d.bonusWelten, ["gabby"]);
  assert.match(g.run("speicher.meldung()"), /anderen Fenster/);
  assert.equal(g.nodes.get("speicherHinweis").hidden, false);
});

test("AUDIT Zustand: Schreibfehler sind sichtbar und werden nachgeholt", () => {
  const g = game({ sterneGesamt: 7 });
  g.run("zeigeRunde(neuesTagesSet())");
  g.fill(2);
  assert.equal(g.nodes.get("speicherHinweis").hidden, true);
  g.options.failWrite = true;
  g.run("sichereTagesAntworten()");
  assert.equal(g.nodes.get("speicherHinweis").hidden, false, "Schreibfehler nicht sichtbar");
  assert.match(g.run("speicher.meldung()"), /nur in diesem Fenster/);
  assert.equal(Object.keys(g.data().tagesSet.antworten).length, 2);
  g.options.failWrite = false;
  g.run("speicher.speichere()");
  assert.equal(g.nodes.get("speicherHinweis").hidden, true, "Hinweis bleibt nach Erfolg stehen");
  assert.equal(Object.keys(g.saved().tagesSet.antworten).length, 2);
  assert.equal(g.saved().sterneGesamt, 7);
});

test("AUDIT Zustand: Gutschein überlebt Neuladen und Umtausch löscht nichts", () => {
  let g = game({ bonusGesamt: 5, geschenke: [{ id: "g1", datum: "2026-10-31", text: "Filmabend" }] },
    { now: "2026-10-31T12:00:00Z" });
  g = neuLaden(g, "2026-10-31T12:00:00Z");
  g.run("zeigeFortschritt('geschenke')");
  assert.equal(g.data().geschenke.length, 1);
  assert.equal(g.run("geschenkIstTauschbar(speicher.daten().geschenke[0])"), true);
  g.run("tauschGutscheinOeffnen(speicher.daten().geschenke[0].id)");
  const dlg = g.nodes.get("geschenkUeberlagerung");
  const karte = kartenKnoten(dlg, n => /geschenk-karte/.test(n.className));
  karte.emit("click");
  assert.equal(g.data().geschenke.length, 2, "Umtausch löscht den alten Gutschein");
  assert.equal(g.data().geschenke[0].text, "Filmabend");
  assert.match(g.data().geschenke[0].umgetauschtAm, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(g.data().geschenke[1].umgetauschtVon, "g1");
  assert.equal(g.data().bonusGesamt, 5, "Umtausch verändert die Lebenszeitbonussterne");
  // Nach einer Woche ist der neue Gutschein nicht mehr tauschbar? (er ist neu, also doch)
  g.time("2026-11-09T12:00:00Z");
  assert.equal(g.run("geschenkIstTauschbar(speicher.daten().geschenke[1])"), false,
    "Gutschein nach mehr als einer Woche noch tauschbar");
});

test("AUDIT Zustand: Statistikgrenze erhält Lebenszeitwerte nach Neuladen", () => {
  const g = game({ geschenke: [{ id: "g1", text: "Bleibt" }] });
  for (let i = 0; i < 1005; i++) g.run("speichernRunde(1, 1, 5, {add: {richtig: 1, gesamt: 1}}, 0, false)");
  const g2 = neuLaden(g);
  assert.equal(g2.data().runden.length, 1000);
  assert.equal(g2.run("gesamtSterne()"), 5025);
  assert.equal(g2.data().bereichPunkte.add.gesamt, 1005);
  assert.equal(g2.data().geschenke[0].text, "Bleibt");
});
