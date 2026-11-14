"use strict";
/* =========================================================================
   Audit-Tests (unabhängig von den Projekt-Tests): mathematische Logik.

   Prinzip: Die erwartete Antwort wird NICHT aus dem Generator übernommen,
   sondern aus dem angezeigten Aufgabentext bzw. aus der angezeigten Rechnung
   zurückgerechnet. Damit fallen Abweichungen zwischen Aufgabenstellung und
   hinterlegter Lösung auf.

   Datei ist rein additiv; Anwendungscode bleibt unverändert.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const aufgaben = require("../aufgaben-bereiche.js");
const geschichten = require("../geschichten.js");

const VORLAGE = new Map(geschichten.VORLAGEN.map(v => [v.id, v]));

/* ------------------------- unabhängige Rechenhilfen ------------------------- */

// Kleiner Ausdrucksauswerter (Punkt vor Strich), unabhängig vom Generator.
function rechne(ausdruck) {
  const s = String(ausdruck)
    .replace(/\u00D7/g, "*").replace(/\u00F7/g, "/").replace(/\u2212/g, "-");
  const teile = s.match(/\d+|[+\-*/]/g);
  if (!teile || teile.length % 2 === 0) return NaN;
  const stapel = [Number(teile[0])];
  for (let i = 1; i < teile.length; i += 2) {
    const op = teile[i];
    const n = Number(teile[i + 1]);
    if (op === "*") stapel[stapel.length - 1] *= n;
    else if (op === "/") stapel[stapel.length - 1] /= n;
    else stapel.push(op === "-" ? -n : n);
  }
  return stapel.reduce((a, b) => a + b, 0);
}

// "a op b = " -> linke Seite auswerten
function linkeSeite(darstellung) {
  const i = darstellung.indexOf("=");
  assert(i > 0, "kein Gleichheitszeichen: " + darstellung);
  return rechne(darstellung.slice(0, i));
}

function zahlen(text) {
  return (String(text).match(/\d+/g) || []).map(Number);
}

/* ----------------------------- Rechenaufgaben ----------------------------- */

function pruefeRechenkarte(karte, rundeNr) {
  const wo = rundeNr + " " + karte.darstellung;
  assert.equal(typeof karte.ident, "string");
  assert(Array.isArray(karte.felder) && karte.felder.length > 0, "keine Felder: " + wo);

  // Jedes Feld muss eine ganzzahlige, nichtnegative Lösung haben.
  for (const f of karte.felder) {
    assert.equal(Number.isInteger(f.korrekt), true, "Nicht ganzzahlige Lösung: " + wo);
    assert(f.korrekt >= 0, "Negative Lösung: " + wo);
    if (f.typ === "zahl") {
      assert(f.korrekt <= 100, "Lösung über 100: " + wo + " -> " + f.korrekt);
      assert.equal(f.anzeige, String(f.korrekt), "Anzeige weicht ab: " + wo);
    }
  }

  if (karte.layout === "rest") {
    // Grundrechnung "dividend ÷ divisor ="; Rest separat.
    assert.equal(karte.felder.length, 2, "Restaufgabe mit falscher Feldzahl: " + wo);
    const [dividend, divisor] = zahlen(karte.darstellung);
    assert(divisor > 0, "Divisor 0: " + wo);
    assert.equal(dividend, divisor * karte.felder[0].korrekt + karte.felder[1].korrekt,
      "Dividend/Quotient/Rest passen nicht: " + wo);
    assert.equal(karte.felder[0].korrekt, Math.floor(dividend / divisor), "Quotient falsch: " + wo);
    assert.equal(karte.felder[1].korrekt, dividend % divisor, "Rest falsch: " + wo);
    assert(karte.felder[1].korrekt > 0 && karte.felder[1].korrekt < divisor,
      "Rest nicht im gültigen Bereich (0 < r < Divisor): " + wo);
    assert.equal(karte.felder[1].beschriftung, "Rest");
    return;
  }

  if (karte.layout === "luecke") {
    // Lücke einsetzen und prüfen, dass die Gleichung dann aufgeht.
    assert(karte.darstellung.includes("\u25A1"), "Lücke fehlt: " + wo);
    assert.equal(karte.felder.length, 1, "Lückenaufgabe mit mehreren Feldern: " + wo);
    const gefuellt = karte.darstellung.replace("\u25A1", String(karte.felder[0].korrekt));
    const [links, rechts] = gefuellt.split("=");
    assert.equal(rechne(links), rechne(rechts), "Lücke stimmt nicht: " + wo + " -> " + gefuellt);
  } else {
    // Normale Rechnung: angezeigte Gleichung muss mit der Lösung stimmen.
    assert.equal(linkeSeite(karte.darstellung), karte.felder[0].korrekt,
      "Rechnung und Lösung stimmen nicht überein: " + wo);
  }

  // Zusatzfelder (Umkehraufgaben) müssen für sich stimmen.
  for (const f of karte.felder.slice(1)) {
    assert(f.darstellung, "Zusatzfeld ohne Rechnung: " + wo);
    assert.equal(linkeSeite(f.darstellung), f.korrekt, "Umkehraufgabe falsch: " + f.darstellung);
  }
}

test("AUDIT Rechenaufgaben: 400 Runden, Rechnung gleich Lösung", () => {
  let karten = 0;
  for (let i = 0; i < 400; i++) {
    const runde = aufgaben.erzeugeRunde({ divisionMitRestAktiv: i % 2 === 0 });
    for (const karte of runde.aufgaben) {
      pruefeRechenkarte(karte, i);
      karten += 1;
    }
  }
  assert(karten >= 400 * 45, "zu wenige Karten geprüft: " + karten);
});

test("AUDIT Rechenaufgaben: Sollverteilung, Eindeutigkeit und keine Wiederholung", () => {
  for (let i = 0; i < 120; i++) {
    const runde = aufgaben.erzeugeRunde({ divisionMitRestAktiv: i % 2 === 0 });
    const proBereich = {};
    for (const b of runde.bereiche) proBereich[b.bereich] = b.aufgaben.length;
    assert.deepEqual(proBereich, { add: 10, sub: 10, mul: 10, div: 10, raetsel: 5 },
      "Bereichsverteilung weicht ab");
    assert.equal(runde.anzahl, 45);
    const schluessel = runde.aufgaben.map(k => k.schluessel);
    assert.equal(new Set(schluessel).size, schluessel.length, "doppelte Aufgabe in einer Runde");
    const idents = runde.aufgaben.map(k => k.ident);
    assert.equal(new Set(idents).size, idents.length, "doppelte Kartenkennung");
    // Umkehraufgaben: genau drei Karten der Multiplikation haben zwei Felder.
    const mitZusatz = runde.aufgaben.filter(k => k.bereich === "mul" && k.felder.length > 1);
    assert.equal(mitZusatz.length, 3, "Umkehraufgaben-Anzahl weicht ab");
    // Restaufgaben nur bei aktivierter Option.
    const mitRest = runde.aufgaben.filter(k => k.layout === "rest");
    assert.equal(mitRest.length, i % 2 === 0 ? 4 : 0, "Restaufgaben-Anzahl weicht ab");
    if (i % 2 !== 0) {
      for (const k of runde.aufgaben.filter(k => k.bereich === "div")) {
        assert.equal(k.layout, "einfach");
        const [dividend, divisor] = zahlen(k.darstellung);
        assert.equal(dividend % divisor, 0, "Division ohne Rest geht nicht auf: " + k.darstellung);
      }
    }
  }
});

test("AUDIT Rechenaufgaben: keine negativen Zwischen- oder Endwerte, Zahlenraum 100", () => {
  for (let i = 0; i < 200; i++) {
    for (const karte of aufgaben.erzeugeRunde().aufgaben) {
      const alle = zahlen(karte.darstellung);
      for (const n of alle) assert(n <= 100, "Zahl über 100: " + karte.darstellung);
      for (const f of karte.felder) {
        if (f.darstellung) for (const n of zahlen(f.darstellung)) assert(n <= 100);
      }
      // Kettenaufgaben dürfen unterwegs nicht negativ werden.
      const s = karte.darstellung.replace(/\u2212/g, "-");
      if ((s.match(/-/g) || []).length && karte.bereich === "sub") {
        const teile = s.match(/\d+|[+-]/g);
        let wert = Number(teile[0]);
        assert(wert >= 0);
        for (let t = 1; t < teile.length; t += 2) {
          wert += teile[t] === "-" ? -Number(teile[t + 1]) : Number(teile[t + 1]);
          assert(wert >= 0, "Zwischenergebnis negativ: " + karte.darstellung);
        }
      }
    }
  }
});

/* ------------------------------ Bonussaufgaben ----------------------------- */

// Textbasierte, unabhängige Auswertung der Knobelaufgaben.
function knobelAntwort(text) {
  let m;
  if ((m = text.match(/Die H\u00e4lfte davon ist (\d+)\./)))
    return 2 * Number(m[1]);
  if ((m = text.match(/Wenn ich sie verdopple, bekomme ich (\d+)\./)))
    return Number(m[1]) / 2;
  if ((m = text.match(/Ich ziehe (\d+) ab, dann bleiben (\d+) \u00fcbrig/)))
    return Number(m[1]) + Number(m[2]);
  if ((m = text.match(/mit (\d+) multipliziere, kommt (\d+)\./)))
    return Number(m[2]) / Number(m[1]);
  if ((m = text.match(/verdreifache, bekomme ich (\d+)\./)))
    return Number(m[1]) / 3;
  if ((m = text.match(/Wie hei\u00dft die n\u00e4chste Zahl\?\s+(.+?), \u25A1/))) {
    const reihe = m[1].split(",").map(s => Number(s.trim()));
    const d = reihe.slice(1).map((n, i) => n - reihe[i]);
    const q = reihe.slice(1).map((n, i) => n / reihe[i]);
    if (q.every(x => x === 2)) return reihe[reihe.length - 1] * 2;
    if (q.every(x => x === 0.5)) return reihe[reihe.length - 1] / 2;
    if (d.every(x => x === d[0])) return reihe[reihe.length - 1] + d[0];
    if (d.slice(1).every((x, i) => x - d[i] === 1)) return reihe[reihe.length - 1] + d[d.length - 1] + 1;
    throw new Error("unbekanntes Reihenmuster: " + text);
  }
  if ((m = text.match(/Das ist genau die H\u00e4lfte von dem, was .+? hat/)))
    return 2 * Number(zahlen(text)[0]);
  if ((m = text.match(/hat (\d+) .+? und bekommt noch einmal genauso viele dazu\. Dann verschenkt .+? (\d+) St\u00fcck/)))
    return 2 * Number(m[1]) - Number(m[2]);
  if ((m = text.match(/hat (\d+) .+? und .+? hat das Dreifache davon\. Zusammen verschenken sie (\d+) St\u00fcck/)))
    return 4 * Number(m[1]) - Number(m[2]);
  if ((m = text.match(/ist (\d+) Jahre alt\. .+? ist (\d+) Jahre \u00e4lter\. Wie viele Jahre alt ist .+? in (\d+) Jahren/)))
    return Number(m[1]) + Number(m[2]) + Number(m[3]);
  if ((m = text.match(/(\d+) \+ (\d+) = (\d+) \+ \u25A1/)))
    return Number(m[1]) + Number(m[2]) - Number(m[3]);
  if ((m = text.match(/Erst rechne ich plus (\d+), dann mal (\d+)\. Es kommt (\d+) heraus/)))
    return Number(m[3]) / Number(m[2]) - Number(m[1]);
  if ((m = text.match(/f\u00fcr (\d+) \u20AC und bekommt (\d+) \u20AC zur\u00fcck/)))
    return Number(m[1]) + Number(m[2]);
  if ((m = text.match(/Zwei Seiten sind (\d+) m und (\d+) m lang, der ganze Zaun ist (\d+) m/)))
    return Number(m[3]) - Number(m[1]) - Number(m[2]);
  return null;
}

test("AUDIT Bonusaufgaben: Text und Lösung stimmen überein (alle Typen, 3000 Aufgaben)", () => {
  const typen = new Set();
  let geprueft = 0;
  for (const welt of ["bluey", "gabby", "doozie", "gemischt", "unbekannt"]) {
    for (let i = 0; i < 120; i++) {
      for (const karte of aufgaben.erzeugeBonus(3, welt, [])) {
        typen.add(karte.art);
        assert.equal(karte.felder.length, 1, "Bonusaufgabe mit mehreren Feldern: " + karte.art);
        assert(!/undefined|NaN/.test(karte.text), "kaputter Text: " + karte.text);
        const erwartet = knobelAntwort(karte.text);
        assert.notEqual(erwartet, null, "kein Orakel für: " + karte.text);
        assert.equal(karte.felder[0].korrekt, erwartet,
          "Text und Lösung weichen ab: " + karte.text);
        assert(Number.isInteger(karte.felder[0].korrekt) && karte.felder[0].korrekt >= 0,
          "ungültige Lösung: " + karte.text);
        geprueft += 1;
      }
    }
  }
  assert(geprueft >= 1500, "zu wenige Bonusaufgaben geprüft: " + geprueft);
  assert.equal(typen.size, 14, "nicht alle Knobeltypen erzeugt: " + [...typen].sort().join(","));
});

test("AUDIT Bonusaufgaben: Merkzettel, Eindeutigkeit und Tageskontingent", () => {
  // Ohne Merkzettel: drei verschiedene Aufgaben.
  for (let i = 0; i < 200; i++) {
    const liste = aufgaben.erzeugeBonus(3, "bluey", []);
    assert.equal(liste.length, 3);
    assert.equal(new Set(liste.map(k => k.schluessel)).size, 3, "doppelte Bonusaufgabe");
  }
  // Voller Merkzettel darf die Erzeugung nicht verhindern.
  const alle = new Set();
  for (let i = 0; i < 400; i++) {
    for (const k of aufgaben.erzeugeBonus(3, "gabby", [])) alle.add(k.schluessel);
  }
  const voll = [...alle];
  assert(voll.length > 20);
  for (let i = 0; i < 20; i++) {
    const liste = aufgaben.erzeugeBonus(3, "gabby", voll.slice(0, 12));
    assert.equal(liste.length, 3, "Erzeugung bei vollem Merkzettel gescheitert");
    assert.equal(new Set(liste.map(k => k.schluessel)).size, 3);
  }
});

/* ------------------------------- Geschichten ------------------------------- */

// Uhrzeit im Text lesen: entweder "9:25 Uhr" oder "9 Uhr" (bei Minute 0).
function liesUhr(text) {
  const m = String(text).match(/(\d+)(?::(\d+))? Uhr/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2] || 0);
}

// Textbasiertes Orakel: Zahlen werden aus dem angezeigten Text gelesen.
const GESCHICHTEN_ORAKEL = {
  "sammeln-dazu": t => { const [, a, b] = t.match(/hat schon (\d+) St\u00fcck\. .+? legt noch (\d+) dazu/); return +a + +b; },
  "verschenken": t => { const [, a, b] = t.match(/^.+? hat (\d+) .+?\. (\d+) St\u00fcck verschenkt/); return +a - +b; },
  "mehr-als": t => { const [, a, b] = t.match(/hat (\d+) .+? hat (\d+) .+? mehr als/); return +a + +b; },
  "weniger-als": t => { const [, a, b] = t.match(/hat (\d+) .+?, .+? hat (\d+) weniger/); return +a - +b; },
  "gleich-verteilen": t => { const [, a, b] = t.match(/verteilt (\d+) .+? auf (\d+) Freundinnen/); return +a / +b; },
  "tueten-gruppen": t => { const [, a, b] = t.match(/f\u00fcllt (\d+) T\u00fcten und legt in jede T\u00fcte (\d+)/); return +a * +b; },
  "keepy-uppy": t => { const [, a, b] = t.match(/tippt den Ball (\d+) Mal, .+? tippt ihn (\d+) Mal/); return +a + +b; },
  "am-bach": t => { const [, a, b] = t.match(/Am Bach liegen (\d+) St\u00f6cke\. (\d+) St\u00f6cke nimmt/); return +a - +b; },
  "beim-backen": t => { const [, a, b] = t.match(/backt (\d+) Bleche mit je (\d+)/); return +a * +b; },
  "puppenhaus-aufraeumen": t => { const [, a, b] = t.match(/Es stehen (\d+) Tassen und (\d+) Teller/); return +a - +b; },
  "hundehaus-modenschau": t => { const [, a, b] = t.match(/organisiert .+? (\d+) Reihen mit je (\d+) Hunden/); return +a * +b; },
  "quietschtiere": t => { const [, a, b] = t.match(/hat (\d+) Quietsch-Enten.+? (\d+) davon sind schon kaputt/); return +a - +b; },
  "beide-zusammen-einfach": t => { const [, a, b] = t.match(/hat (\d+) .+? und .+? hat (\d+) .+? Wie viele .+? haben beide zusammen/); return +a + +b; },
  "doppelt-so-viele": t => { const [, a] = t.match(/schafft (\d+) .+? schafft doppelt so viele/); return 2 * +a; },
  "paare-legen": t => { const [, a] = t.match(/r\u00e4umt (\d+) .+? immer zwei zusammen/); return +a / 2; },
  "parkplaetze-frei": t => { const [, a, b] = t.match(/gibt es (\d+) Pl\u00e4tze\. (\d+) Pl\u00e4tze sind noch frei/); return +a - +b; },
  "wer-hat-mehr": t => { const [, a, b] = t.match(/sammelt (\d+) .+?, .+? sammelt (\d+)\./); return +a - +b; },
  "dazu-dann-weg": t => { const [, a, b, c] = t.match(/hat (\d+) .+? schenkt .+? noch (\d+) dazu\. Dann gibt .+? (\d+) St\u00fcck/); return +a + +b - +c; },
  "verloren-und-gefunden": t => { const [, a, b, c] = t.match(/hat (\d+) .+? Unterwegs gehen (\d+) St\u00fcck verloren, sp\u00e4ter findet .+? aber (\d+) St\u00fcck wieder/); return +a - +b + +c; },
  "packungen-dann-weg": t => { const [, a, b, c] = t.match(/kauft (\d+) Packungen mit je (\d+) .+? Davon gibt .+? (\d+) St\u00fcck/); return +a * +b - +c; },
  "beide-haben-zusammen": t => { const [, a, b] = t.match(/hat (\d+) .+? hat (\d+) .+? mehr als .+? Wie viele .+? haben beide zusammen/); return 2 * +a + +b; },
  "verdoppeln-dann-weg": t => { const [, a, b] = t.match(/hat (\d+) .+? verdoppelt die Zahl\. Danach gehen (\d+) St\u00fcck kaputt/); return 2 * +a - +b; },
  "halbierung-dann-dazu": t => { const [, a, b] = t.match(/verschenkt die H\u00e4lfte von (\d+) .+? noch (\d+) .+? dazu/); return +a / 2 + +b; },
  "dreifach-dann-weg": t => { const [, a, b] = t.match(/hat (\d+) .+? hat das Dreifache davon\. Dann verschenkt .+? (\d+) St\u00fcck/); return 3 * +a - +b; },
  "kisten-stapeln": t => { const [, a, b, c] = t.match(/stellt (\d+) Kisten mit je (\d+) .+? Oben drauf legt .+? noch (\d+)/); return +a * +b + +c; },
  "doppeltes-ergaenzen": t => { const [, a, b] = t.match(/hat (\d+) .+? und .+? hat (\d+) .+? genau das Doppelte davon/); return +a + +b; },
  "sitzreihen-kino": t => { const [, a, b, c] = t.match(/sind (\d+) Sitze\. (\d+) Sitze bleiben frei\. Dann kommen (\d+) Freunde/); return +a - +b + +c; },
  "geld-zwei-eis": t => { const [, a, b] = t.match(/Ein Eis kostet (\d+) \u20AC (\d+) Cent/); return 2 * (+a * 100 + +b); },
  "geld-taschengeld": t => { const [, a, b] = t.match(/hat (\d+) \u20AC Taschengeld und bekommt .+? noch (\d+) \u20AC/); return (+a + +b) * 100; },
  "geld-rueckgeld": t => { const [, a, b, c] = t.match(/hat (\d+) \u20AC dabei\. Das Buch kostet (\d+) \u20AC und die Stifte kosten (\d+) \u20AC/); return (+a - +b - +c) * 100; },
  "geld-stueckpreis": t => { const [, a] = t.match(/kauft (\d+) .+? Jedes St\u00fcck kostet 2 \u20AC 50/); return +a * 250; },
  "geld-drei-freunde": t => { const [, a] = t.match(/Jeder zahlt (\d+) \u20AC/); return +a * 300; },
  "geld-taschengeld-monate": t => { const [, a, b] = t.match(/jeden Monat (\d+) \u20AC .+? nach (\d+) Monaten/); return +a * +b * 100; },
  "geld-zwei-sachen": t => { const [, a, b] = t.match(/Rucksack kostet (\d+) \u20AC und eine Trinkflasche kostet (\d+) \u20AC/); return (+a + +b) * 100; },
  "geld-haelfte-sparschwein": t => { const [, a] = t.match(/bekommt (\d+) \u20AC geschenkt und legt genau die H\u00e4lfte/); return +a * 50; },
  "geld-eis-rest": t => { const [, a, b, c] = t.match(/hat (\d+) \u20AC dabei\. Ein Eis kostet (\d+) \u20AC (\d+) Cent/); return (+a - +b) * 100 - +c; },
  "geld-kinokarten": t => { const [, a] = t.match(/Eine Kinokarte kostet (\d+) \u20AC/); return +a * 400; },
  "geld-trikot-ball": t => { const [, a, b] = t.match(/Ein Ball kostet (\d+) \u20AC\. Ein Trikot kostet (\d+) \u20AC mehr/); return (2 * +a + +b) * 100; },
  "uhr-minuten-zusammen": t => { const [, a, b] = t.match(/spielt (\d+) Minuten .+? und danach (\d+) Minuten/); return +a + +b; },
  "uhr-zeit-planen": t => { const [, a, b] = t.match(/Der Weg dauert (\d+) Minuten und die Pause (\d+) Minuten/); return 60 - +a - +b; },
  "uhr-hin-und-zurueck": t => { const [, a, b] = t.match(/Weg zum See dauert (\d+) Minuten.+? unterwegs (\d+) Minuten Pause/); return 2 * +a + +b; },
  "uhr-halbe-stunden": t => {
    const m = t.match(/genau (\d+) halbe Stunden/) || t.match(/genau eine halbe Stunde/);
    return 30 * (m[1] ? +m[1] : 1);
  },
  "uhr-ueben-pro-woche": t => { const [, a, b] = t.match(/\u00fcbt jeden Tag (\d+) Minuten .+? an (\d+) Tagen/); return +a * +b; },
  "uhr-film-dauer": t => {
    const [, h1, m1, h2, m2] = t.match(/von (\d+):(\d+) Uhr bis (\d+):(\d+) Uhr/);
    return (+h2 * 60 + +m2) - (+h1 * 60 + +m1);
  },
  "uhr-wie-spaet": t => { const [, n] = t.match(/In (\d+) Minuten beginnt der Film/); return liesUhr(t) + +n; },
  "uhr-minuten-davor": t => { const [, n] = t.match(/Vor (\d+) Minuten hat/); return liesUhr(t) - +n; },
  "uhr-zwei-aktivitaeten": t => { const [, a, b] = t.match(/macht (\d+) Minuten .+? und danach (\d+) Minuten/); const [, h] = t.match(/Um (\d+) Uhr hat/); return +h * 60 + +a + +b; },
  "alter-rueckwaerts": t => { const [, a, b] = t.match(/(\d+) Jahre alt und damit um (\d+) Jahre/); return +a - +b; },
  "aufzug-mindestfahrten": t => { const [, a, b] = t.match(/(\d+) wartende Personen.*höchstens (\d+) Personen/); return Math.ceil(+a / +b); },
  "tretboote-volle-gruppen": t => { const [, a, b] = t.match(/(\d+) Kinder auf Tretboote.*genau (\d+) Kinder/); return +a % +b; },
  "zahlenweg-huepfen": t => { const [, b, c] = t.match(/Landefelder sind \d+, (\d+) und (\d+)/); return 2 * +c - +b; },
  "rechnung-basteltisch": t => {
    const [, a, b, c] = t.match(/(\d+) Bastelperlen.*gibt (\d+) Perlen her und bekommt danach (\d+) neue dazu/);
    return `${a} − ${b} + ${c}`;
  },
  "rechenart-fest": t => {
    if (t.includes("gleichmäßig auf")) return "Geteilt (÷)";
    if (t.includes("mit je")) return "Mal (×)";
    if (t.includes("Davon platzen")) return "Minus (−)";
    if (t.includes("rote und")) return "Plus (+)";
    assert.match(t, /Auch .+? bringt Ballons mit/);
    return "Eine Angabe fehlt";
  },
  "geld-riesenrad-gruppe": t => {
    const [, a, b, c, d] = t.match(/(\d+) € pro Erwachsenem und (\d+) € pro Kind.*(\d+) Erwachsene und (\d+) Kinder/);
    return 100 * (+a * +c + +b * +d);
  },
  "geld-muenzbeutel": t => {
    const [, a, b, c] = t.match(/20-€-Scheine \((\d+) Stück\), 2-€-Münzen \((\d+) Stück\) und 50-Cent-Münzen \((\d+) Stück\)/);
    return 2000 * +a + 200 * +b + 50 * +c;
  }
};

function pruefeGeschichte(karte, zaehler) {
  const vorlage = VORLAGE.get(karte.vorlage);
  assert(vorlage, "unbekannte Vorlage: " + karte.vorlage);
  assert(!/undefined|NaN/.test(karte.text), "kaputter Text: " + karte.text);
  assert.equal(karte.felder.length, 1, "Geschichte mit mehreren Feldern");
  const feld = karte.felder[0];
  const orakel = GESCHICHTEN_ORAKEL[karte.vorlage];
  assert(orakel, "kein Orakel für " + karte.vorlage);
  const erwartet = orakel(karte.text);
  if (feld.auswahl) {
    assert.equal(feld.auswahl[feld.korrekt - 1], erwartet);
    assert.equal(feld.anzeige, erwartet);
    assert.equal(new Set(feld.auswahl).size, feld.auswahl.length);
  } else if (feld.typ === "zeit") {
    const tatsaechlich = feld.zeit.stunde * 60 + feld.zeit.minute;
    assert.equal(tatsaechlich, erwartet, "Uhrzeit weicht ab: " + karte.text);
    assert(feld.zeit.stunde >= 0 && feld.zeit.stunde < 24, "Stunde ungültig: " + karte.text);
    assert(feld.zeit.minute >= 0 && feld.zeit.minute < 60, "Minute ungültig: " + karte.text);
    const anzeige = feld.zeit.minute === 0
      ? feld.zeit.stunde + " Uhr"
      : feld.zeit.stunde + ":" + String(feld.zeit.minute).padStart(2, "0") + " Uhr";
    assert.equal(feld.anzeige, anzeige, "Zeitanzeige weicht ab: " + karte.text);
  } else if (feld.typ === "geld") {
    assert.equal(feld.geld.cent, erwartet, "Geldbetrag weicht ab: " + karte.text);
    const euro = Math.floor(erwartet / 100), rest = erwartet % 100;
    const anzeige = rest === 0 ? euro + " \u20AC" : euro + " \u20AC " + rest;
    assert.equal(feld.anzeige, anzeige, "Geldanzeige weicht ab: " + karte.text);
    assert(feld.geld.cent % 1 === 0 && feld.geld.cent >= 0);
  } else {
    assert.equal(feld.korrekt, erwartet, "Lösung weicht vom Text ab: " + karte.text);
    assert(Number.isInteger(feld.korrekt) && feld.korrekt >= 0, "ungültige Lösung");
  }
  zaehler.n += 1;
  zaehler.ids.add(karte.vorlage);
}

test("AUDIT Geschichten: Text, Rechnung und Lösung stimmen überein (3000 Sets)", () => {
  const zaehler = { n: 0, ids: new Set() };
  for (const modus of ["bluey", "gabby", "doozie"]) {
    let zuletzt = [];
    for (let i = 0; i < 1000; i++) {
      const set = geschichten.erzeugeGeschichten({ modus, zuletzt });
      assert.equal(set.length, 5, "kein vollständiges Geschichtenset");
      assert.equal(new Set(set.map(k => k.vorlage)).size, 5, "doppelte Vorlage im Set");
      for (const karte of set) pruefeGeschichte(karte, zaehler);
      zuletzt = set.map(k => k.vorlage).concat(zuletzt).slice(0, 30);
    }
  }
  assert.equal(zaehler.n, 15000);
  assert.equal(zaehler.ids.size, geschichten.VORLAGEN.length,
    "nicht alle Vorlagen geprüft: " + [...VORLAGE.keys()].filter(id => !zaehler.ids.has(id)));
});

test("AUDIT Geschichten: Kategorien, Stufen und Weltzugehörigkeit", () => {
  for (const modus of ["bluey", "gabby", "doozie"]) {
    for (let i = 0; i < 300; i++) {
      const set = geschichten.erzeugeGeschichten({ modus });
      const vorlagen = set.map(k => VORLAGE.get(k.vorlage));
      assert.equal(vorlagen.filter(v => v.kategorie === "normal").length, 3);
      assert.equal(vorlagen.filter(v => v.kategorie === "geld").length, 1);
      assert.equal(vorlagen.filter(v => v.kategorie === "uhr").length, 1);
      assert.equal(vorlagen.filter(v => v.stufe === 1).length, 3);
      assert.equal(vorlagen.filter(v => v.stufe === 2).length, 2);
      for (const v of vorlagen) assert(v.themen.includes(modus), "falsche Welt: " + v.id);
      for (const k of set) assert.equal(k.thema, modus);
    }
  }
});

test("AUDIT Geschichten: alle zulässigen Zahlenkombinationen, Antwort aus dem Text", () => {
  // Vollständige Aufzählung aller zulässigen Parameterkombinationen. Die
  // erwartete Antwort wird ausschließlich aus dem erzeugten Text gelesen.
  let geprueft = 0;
  const abgedeckt = new Set();
  for (const v of geschichten.VORLAGEN) {
    const orakel = GESCHICHTEN_ORAKEL[v.id];
    assert(orakel, "kein Orakel für " + v.id);
    const extras = [];
    if (v.vorbereitung) {
      // Reale Vorbereitungsbereiche der App: Stunden 1..16, Minuten in 5er-Schritten.
      for (let h = 1; h <= 16; h++) for (let m = 0; m < 60; m += 5) extras.push({ stunde: h, minute: m });
    } else extras.push({ stunde: 10, minute: 0 });
    function pruefe(z) {
      if (v.regeln && !v.regeln(z)) return;
      for (const e of extras) {
        const extra = Object.assign({}, e, {
          minuten: e.stunde * 60 + e.minute,
          uhrText: e.stunde + ":" + String(e.minute).padStart(2, "0"),
          uhrSprech: e.minute === 0 ? e.stunde + " Uhr" : e.stunde + ":" + String(e.minute).padStart(2, "0") + " Uhr"
        });
        const c = { z, extra, p1: "Emma", p2: "Bluey", sache: "Sticker", t1: "Malen", t2: "Basteln" };
        const text = v.text(c);
        const feld = v.feld ? v.feld(c) : { korrekt: v.losung(c), typ: "zahl", anzeige: String(v.losung(c)) };
        const erwartet = orakel(text);
        const tatsaechlich = feld.typ === "zeit"
          ? feld.zeit.stunde * 60 + feld.zeit.minute
          : feld.typ === "geld" ? feld.geld.cent : feld.auswahl ? feld.auswahl[feld.korrekt - 1] : feld.korrekt;
        assert.equal(tatsaechlich, erwartet, `${v.id}: "${text}" -> ${tatsaechlich} statt ${erwartet}`);
        geprueft += 1;
      }
      abgedeckt.add(v.id);
    }
    function visit(z) {
      if (z.length < v.zahlen.length) {
        const r = v.zahlen[z.length];
        for (let n = r.min; n <= r.max; n++) visit(z.concat(n));
        return;
      }
      pruefe(z);
    }
    visit([]);
    assert(abgedeckt.has(v.id), "Vorlage ohne gültige Kombination: " + v.id);
  }
  assert(geprueft >= 93308, "zu wenige Kombinationen: " + geprueft);
});

test("AUDIT Geschichten: keine verbotenen Figuren und keine doppelten Figuren", () => {
  for (const modus of ["bluey", "gabby", "doozie"]) {
    for (let i = 0; i < 200; i++) {
      for (const karte of geschichten.erzeugeGeschichten({ modus })) {
        const vorlage = VORLAGE.get(karte.vorlage);
        if (vorlage.kategorie === "geld") {
          assert(!/Socks |Baby Box |Pogi |Hamsterh\u00fcndchen /.test(karte.text),
            "Kleinkind in Geldgeschichte: " + karte.text);
        }
        assert(!/\b(\w+) hat \1\b/.test(karte.text), "doppelte Figur: " + karte.text);
      }
    }
  }
});
