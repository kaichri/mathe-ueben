"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");

function generator() {
  let seed = 8127;
  const math = Object.create(Math);
  math.random = function () {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const context = vm.createContext({ module: { exports: {} }, Math: math });
  vm.runInContext(fs.readFileSync(path.join(root, "aufgaben-bereiche.js"), "utf8"), context);
  return { api: context.module.exports, math, reset() { seed = 8127; } };
}

// Minimal DOM for the real scoring/storage functions; no browser or dependencies.
function game(saved = null) {
  function node() {
    const classes = new Set();
    return {
      hidden: true, value: "", disabled: false, dataset: {}, style: {}, textContent: "",
      classList: {
        add(...names) { names.forEach(n => classes.add(n)); },
        remove(...names) { names.forEach(n => classes.delete(n)); },
        toggle(name, on) { if (on) classes.add(name); else classes.delete(name); }
      },
      appendChild(n) { return n; }, prepend() {}, setAttribute() {},
      addEventListener() {}, scrollIntoView() {}, querySelector: node,
      querySelectorAll() { return []; }
    };
  }
  const nodes = new Map();
  let writes = 0;
  const context = vm.createContext({
    document: {
      body: node(), createElement: node, createElementNS: node,
      getElementById(id) { if (!nodes.has(id)) nodes.set(id, node()); return nodes.get(id); },
      querySelector: node, querySelectorAll() { return []; }, addEventListener() {}
    },
    window: {
      localStorage: {
        getItem() { return JSON.stringify(Object.assign({ sound: "aus" }, saved)); },
        setItem() { writes++; }
      },
      matchMedia() { return { matches: true }; }, scrollTo() {},
      AUFGABEN: generator().api, GESCHICHTEN: require("../geschichten.js")
    }
  });
  vm.runInContext(fs.readFileSync(path.join(root, "script.js"), "utf8"), context);
  const run = code => vm.runInContext(code, context);
  run("EINSTELLUNGEN.spaessig = false;");
  return {
    run, nodes, writes: () => writes,
    data: () => run("speicher.daten()"),
    round(type, count, correct) {
      run(`
        runde = { bereichsArt: ${JSON.stringify(type)}, welt: 'bluey', bereiche: [],
          karten: Array.from({length: ${count}}, (_, i) => ({
            ident: 'test-' + i, bereich: 'add', layout: 'einfach',
            darstellung: '3 + 4 =', felder: [{korrekt: 7, anzeige: '7'}]
          })) };
        runde.anzahl = runde.karten.length;
        eingabeZuFeld = new Map(); kartenEingaben = new Map();
        runde.karten.forEach((karte, i) => {
          const feld = document.createElement('input');
          feld.value = i < ${correct} ? '7' : '0';
          eingabeZuFeld.set(karte.felder[0], feld);
          kartenEingaben.set(karte.ident, [feld]);
        });
        fertigAnsicht = false;
      `);
    },
    answer(index, value) {
      run(`eingabeZuFeld.get(runde.karten[${index}].felder[0]).value = ${JSON.stringify(value)}`);
    }
  };
}

test("seven consecutive sets: new tens tasks first, then only oldest necessary repeat", () => {
  const { api } = generator();
  let excluded = [];
  const seen = new Set();
  let oldest;
  for (let i = 0; i < 7; i++) {
    const round = api.erzeugeRunde({ ausschliessen: excluded });
    assert.equal(round.anzahl, 45);
    assert.equal(new Set(round.aufgaben.map(k => k.schluessel)).size, 45);
    const tens = round.aufgaben.filter(k => k.art === "zehnermaleins");
    assert.equal(tens.length, 3);
    if (i === 0) oldest = tens.map(k => k.schluessel);
    const repeats = tens.filter(k => seen.has(k.schluessel));
    assert.equal(repeats.length, i < 6 ? 0 : 3);
    if (i === 6) assert.deepEqual(new Set(repeats.map(k => k.schluessel)), new Set(oldest));
    tens.forEach(k => seen.add(k.schluessel));
    excluded = excluded.concat(round.aufgaben.map(k => k.schluessel)).slice(-300);
  }
});

test("daily-set integration generates twelve complete sets with growing history", () => {
  const g = game();
  for (let i = 0; i < 12; i++) {
    g.run("neuesTagesSet()");
    assert.equal(g.data().tagesSet.runde.bereiche.reduce((n, b) => n + b.aufgaben.length, 0), 50);
    assert.equal(g.data().tagesSet.fertig, false);
  }
});

test("fully excluded tens pool is relaxed without mutating caller history", () => {
  const { api } = generator();
  const history = [];
  for (const tens of [10, 20, 30, 40, 50]) {
    for (const factor of [2, 3, 4]) {
      if (tens * factor <= 100) {
        history.push(`mul|${tens} × ${factor} =`, `mul|${factor} × ${tens} =`);
      }
    }
  }
  const before = history.slice();
  const tens = api.erzeugeRunde({ ausschliessen: history }).aufgaben.filter(k => k.art === "zehnermaleins");
  assert.equal(tens.length, 3);
  assert.deepEqual(new Set(tens.map(k => k.schluessel)), new Set(history.slice(0, 3)));
  assert.deepEqual(history, before);
});

test("failed generation rolls back internal card numbering", () => {
  const gen = generator();
  const random = gen.math.random;
  let calls = 0;
  gen.math.random = () => { if (++calls === 100) throw new Error("injected failure"); return random(); };
  assert.throws(() => gen.api.erzeugeRunde(), /injected failure/);
  gen.math.random = random; gen.reset();
  assert.deepEqual(JSON.parse(JSON.stringify(gen.api.erzeugeRunde())),
    JSON.parse(JSON.stringify(generator().api.erzeugeRunde())));
});

test("failed daily generation preserves the previous set and history", () => {
  const g = game();
  g.run("neuesTagesSet();");
  const before = JSON.stringify(g.data());
  const writes = g.writes();
  g.run("window.GESCHICHTEN = { erzeugeGeschichten() { throw new Error('story failure'); } };");
  assert.throws(() => g.run("neuesTagesSet()"), /story failure/);
  assert.equal(JSON.stringify(g.data()), before);
  assert.equal(g.writes(), writes);
});

test("checking the same bonus card three times awards one star and one record", () => {
  const g = game(); g.round("bonus", 1, 1);
  g.run("pruefeRunde()"); const writes = g.writes();
  g.run("pruefeRunde(); pruefeRunde()");
  assert.equal(g.data().bonussterne, 1);
  assert.equal(g.data().bonusGesamt, 1);
  assert.equal(g.data().bonusTag.verteilt, 1);
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.data().runden[0].bonusRichtig, 1);
  assert.equal(g.writes(), writes);
});

test("multiple bonus cards: later corrections reward only new solutions", () => {
  const g = game(); g.round("bonus", 3, 1);
  g.run("pruefeRunde(); pruefeRunde()");
  g.answer(1, "7"); g.run("pruefeRunde(); pruefeRunde()");
  assert.equal(g.data().bonussterne, 2);
  g.answer(2, "7"); g.run("pruefeRunde(); pruefeRunde()");
  assert.equal(g.data().bonussterne, 3);
  assert.equal(g.data().bonusGesamt, 3);
  assert.equal(g.data().bonusTag.verteilt, 3);
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.data().runden[0].richtig, 3);
  assert.equal(g.data().runden[0].bonusRichtig, 3);
  assert.equal(g.run("runde.bonusAuswertung.belohnt.size"), 3);
  assert.equal(g.run("kartenEingaben.get('test-0')[0].disabled"), true);
});

test("three correct bonus cards checked three times produce three stars total", () => {
  const g = game(); g.round("bonus", 3, 3);
  g.run("pruefeRunde(); pruefeRunde(); pruefeRunde()");
  assert.equal(g.data().bonussterne, 3);
  assert.equal(g.data().runden.length, 1);
});

test("zero-point bonus checks create only one record and can be corrected", () => {
  const g = game(); g.round("bonus", 1, 0);
  g.run("pruefeRunde(); pruefeRunde(); pruefeRunde()");
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.data().bonussterne, 0);
  g.answer(0, "7"); g.run("pruefeRunde()");
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.data().runden[0].bonusRichtig, 1);
});

test("daily bonus limit and old statistics/rewards are preserved", () => {
  const old = { bonus: true, richtig: 2, gesamt: 2, sterne: 0, bonusRichtig: 2, bereiche: {} };
  const g = game({ bonussterne: 2, bonusGesamt: 2, runden: [old], geschenke: [{id: 'old', text: 'Gift'}] });
  g.run("holBonusTag().verteilt = 2"); g.round("bonus", 3, 3);
  g.run("pruefeRunde(); pruefeRunde()");
  assert.equal(g.data().bonussterne, 3);
  assert.equal(g.data().bonusTag.verteilt, 3);
  assert.equal(g.data().runden.length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(g.data().runden[0])), old);
  assert.equal(g.data().geschenke[0].text, "Gift");
});

test("one correct practice answer cannot unlock a bonus world", () => {
  const g = game(); g.round("uebungen", 1, 1); g.run("pruefeRunde()");
  assert.equal(g.run("weltHeuteFreigeschaltet('bluey')"), false);
});

test("daily round: exactly 25 of 50 unlocks the world", () => {
  const g = game(); g.round("tages", 50, 25); g.run("pruefeRunde()");
  assert.equal(g.run("weltHeuteFreigeschaltet('bluey')"), true);
});

test("daily round: 24 of 50 cannot unlock the world", () => {
  const g = game(); g.round("tages", 50, 24); g.run("pruefeRunde()");
  assert.equal(g.run("weltHeuteFreigeschaltet('bluey')"), false);
});

test("weaker daily and practice rounds never relock an already open world", () => {
  const g = game(); g.run("schalteWeltFrei('bluey')");
  g.round("tages", 50, 24); g.run("pruefeRunde()");
  g.round("uebungen", 1, 0); g.run("pruefeRunde()");
  assert.equal(g.run("weltHeuteFreigeschaltet('bluey')"), true);
});
