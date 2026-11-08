"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Deliberately use a different host zone: the game must still follow Vienna.
process.env.TZ = "Pacific/Honolulu";
const plain = value => JSON.parse(JSON.stringify(value));

function game(saved = {}, options = {}) {
  let now = Date.parse(options.now || "2026-10-31T23:30:00Z");
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const audios = [];
  const outcomes = (options.audio || []).slice();
  const documentEvents = new Map();
  function node(type = "div") {
    const events = new Map();
    let content = "";
    const n = {
      type, className: "", dataset: {}, style: {}, children: [], hidden: false,
      value: "", disabled: false, attributes: {},
      get textContent() { return content + this.children.map(c => c.textContent).join(""); },
      set textContent(value) { content = String(value); this.children = []; },
      appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
      prepend(child) { this.children.unshift(child); child.parentNode = this; },
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(event, handler) { events.set(event, handler); },
      emit(event) { events.get(event)?.(); },
      scrollIntoView() {}, focus() {}, select() {},
      querySelectorAll(selector) { return descendants(this).filter(child => matches(child, selector)); },
      querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    };
    n.classList = {
      add(...names) { n.className = [...new Set(n.className.split(/\s+/).concat(names))].join(" ").trim(); },
      remove(...names) { n.className = n.className.split(/\s+/).filter(s => !names.includes(s)).join(" "); },
      toggle(name, on) { if (on) this.add(name); else this.remove(name); }
    };
    if (type === "audio") {
      n.plays = 0; n.paused = true;
      n.play = function () {
        this.plays++; this.paused = false;
        const outcome = outcomes.shift();
        if (typeof outcome === "function") return outcome();
        if (outcome === "throw") throw new Error("blocked");
        return outcome === "reject" ? Promise.reject(new Error("autoplay blocked")) : Promise.resolve();
      };
      n.pause = function () { this.paused = true; };
      audios.push(n);
    }
    return n;
  }
  function descendants(n) { return n.children.flatMap(c => [c, ...descendants(c)]); }
  function matches(n, selector) {
    if (selector.startsWith(".")) return n.className.split(/\s+/).includes(selector.slice(1));
    const card = selector.match(/^\[data-karten-id="([^"]+)"\]$/);
    return card ? n.dataset.kartenId === card[1] : false;
  }
  const nodes = new Map();
  let stored = JSON.stringify(Object.assign({ sound: "aus" }, saved));
  let writes = 0;
  const document = {
    body: node("body"), createElement: node, createElementNS(ns, type) { return node(type); },
    getElementById(id) {
      if (!nodes.has(id)) {
        const n = node(); n.id = id;
        n.hidden = id !== "startBildschirm";
        if (id.endsWith("Bildschirm")) n.className = "bildschirm";
        nodes.set(id, n);
      }
      return nodes.get(id);
    },
    querySelectorAll(selector) {
      return [...nodes.values()].flatMap(n => [n, ...descendants(n)]).filter(n => matches(n, selector));
    },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    addEventListener(event, handler) { documentEvents.set(event, handler); }
  };
  for (const id of ["startBildschirm", "uebungsBildschirm", "fortschrittBildschirm"]) document.getElementById(id);
  const timers = new Map();
  const contexts = [];
  class AudioContext {
    constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; contexts.push(this); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
    resume() { this.state = "running"; return Promise.resolve(); }
    createOscillator() { return {frequency: {}, connect() {}, start() {}, stop() {}}; }
    createGain() { return {gain: {setValueAtTime() {}, exponentialRampToValueAtTime() {}}, connect() {}}; }
  }
  const context = vm.createContext({ Date: Clock, document, window: {
    localStorage: { getItem() { return stored; }, setItem(key, value) { stored = value; writes++; } },
    AUFGABEN: require("../aufgaben-bereiche.js"), GESCHICHTEN: require("../geschichten.js"),
    AudioContext, matchMedia() { return { matches: true }; }, scrollTo() {}, alert() {},
    setInterval(fn) { const id = timers.size + 1; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); }, setTimeout() {}
  }});
  const run = code => vm.runInContext(code, context);
  run(fs.readFileSync(path.join(__dirname, "../script.js"), "utf8"));
  run("EINSTELLUNGEN.spaessig = false");
  return {
    run, nodes, audios, timers, contexts, data: () => run("speicher.daten()"),
    saved: () => JSON.parse(stored), writes: () => writes,
    time(iso) { now = Date.parse(iso); }, click() { documentEvents.get("click")?.(); },
    fill(count) {
      run(`runde.karten.forEach((karte, i) => {
        kartenEingaben.get(karte.ident).forEach(knoten => { knoten.value = ''; });
        if (i >= ${count}) return;
        karte.felder.forEach(feld => {
          const knoten = eingabeZuFeld.get(feld);
          if (feld.typ === 'geld') {
            const teile = knoten.querySelectorAll('.geld-teil');
            teile[0].value = String(Math.floor(feld.geld.cent / 100));
            teile[1].value = String(feld.geld.cent % 100);
          } else if (feld.typ === 'zeit') {
            knoten.value = feld.zeit.stunde + ':' + feld.zeit.minute;
          } else knoten.value = String(feld.korrekt);
        });
      })`);
    },
    money(euro, cent) {
      return run(`geldWertAus({querySelectorAll() { return [{value: ${JSON.stringify(euro)}}, {value: ${JSON.stringify(cent)}}]; }})`);
    }
  };
}

test("migration preserves old regular stars, separate bonuses, vouchers and area totals", () => {
  const saved = {
    runden: [{sterne: 5, bonus: false, datum: "2026-10-31"}, {sterne: 3}, {sterne: 0, bonus: true, bonusRichtig: 2}],
    bonussterne: 2, bonusGesamt: 12,
    geschenke: [{id: "g1", datum: "2026-10-28", text: "Gift"}],
    bereichPunkte: {add: {richtig: 30, gesamt: 50}}
  };
  const g = game(saved);
  assert.equal(g.run("gesamtSterne()"), 8);
  assert.equal(g.data().version, 2);
  for (const key of ["runden", "bonussterne", "bonusGesamt", "geschenke", "bereichPunkte"]) {
    assert.deepEqual(plain(g.data()[key]), saved[key]);
  }
  const again = game(g.saved());
  assert.equal(again.run("gesamtSterne()"), 8);
  assert.equal(again.data().bonusGesamt, 12);
});

test("existing lifetime counter is not re-added or reduced by reload", () => {
  const g = game({ version: 2, sterneGesamt: 7000, runden: [{sterne: 5}], bonusGesamt: 30 });
  assert.equal(g.run("gesamtSterne()"), 7000);
  assert.equal(game(g.saved()).run("gesamtSterne()"), 7000);
});

test("new game starts with zero lifetime stars", () => {
  const g = game();
  assert.equal(g.run("gesamtSterne()"), 0);
  assert.equal(g.data().bonusGesamt, 0);
});

test("incomplete lifetime counters recover the available sum without counting bonuses", () => {
  for (const counter of [undefined, null, -1, "5", 0]) {
    const g = game({sterneGesamt: counter, runden: [{sterne: 5}, {sterne: 3}, {bonus: true, sterne: 5}],
      bonussterne: 2, bonusGesamt: 7});
    assert.equal(g.run("gesamtSterne()"), 8);
    assert.equal(g.data().bonusGesamt, 7);
  }
});

test("more than 1000 rows preserve lifetime stars and lifetime area totals", () => {
  const g = game({ runden: Array.from({length: 1000}, () => ({sterne: 5})),
    bereichPunkte: {add: {richtig: 1000, gesamt: 1000}} });
  for (let i = 0; i < 10; i++) g.run("speichernRunde(1, 1, 5, {add: {richtig: 1, gesamt: 1}}, 0, false)");
  assert.equal(g.data().runden.length, 1000);
  assert.equal(g.run("gesamtSterne()"), 5050);
  assert.equal(g.data().bereichPunkte.add.richtig, 1010);
  g.run("speichernRunde(0, 3, 0, {}, 0, true)");
  assert.equal(g.run("gesamtSterne()"), 5050);
  assert.equal(game(g.saved()).run("gesamtSterne()"), 5050);
});

test("legacy daily answers and world survive migration and resuming", () => {
  const before = game(); before.run("setzeModus('gabby'); zeigeRunde(neuesTagesSet())"); before.fill(4);
  before.run("zeigeAbschnitt(3); sichereTagesAntworten()");
  const legacy = before.saved(); legacy.version = 1; delete legacy.sterneGesamt;
  legacy.modus = "doozie";
  const g = game(legacy); g.nodes.get("losKnopf").emit("click");
  assert.deepEqual(plain(g.data().tagesSet), legacy.tagesSet);
  assert.equal(g.run("modus"), "gabby");
  assert.equal(g.run("runde.welt"), "gabby");
});

test("regular completion and repeated bonus checks never double-count either star type", () => {
  const g = game({sterneGesamt: 10, bonussterne: 1, bonusGesamt: 6});
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(50);
  g.run("pruefeRunde(); pruefeRunde()");
  assert.equal(g.run("gesamtSterne()"), 15);
  assert.equal(g.data().runden.length, 1);
  g.run("zeigeRunde(baueBonusRunde('bluey'))"); g.fill(3);
  g.run("pruefeRunde(); pruefeRunde(); pruefeRunde()");
  assert.equal(g.run("gesamtSterne()"), 15);
  assert.equal(g.data().bonussterne, 4);
  assert.equal(g.data().bonusGesamt, 9);
  assert.equal(g.data().runden.length, 2);
  const again = game(g.saved());
  assert.equal(again.run("gesamtSterne()"), 15);
  assert.equal(again.data().bonusGesamt, 9);
});

test("resuming after a world change preserves answers, tasks, section and original world", () => {
  const g = game();
  g.run("zeigeRunde(neuesTagesSet())"); g.fill(3);
  g.run("zeigeAbschnitt(2); sichereTagesAntworten()");
  const before = plain(g.data().tagesSet);
  g.nodes.get("abbruchKnopf").emit("click");
  g.run("setzeModus('gabby')");
  g.nodes.get("losKnopf").emit("click");
  assert.equal(g.run("modus"), "bluey");
  assert.equal(g.run("runde.welt"), "bluey");
  assert.equal(g.run("document.body.dataset.thema"), "bluey");
  assert.deepEqual(plain(g.data().tagesSet), before);
  assert.equal(g.run("abschnittZeiger"), 2);
  assert(g.run("runde.karten.filter(k => k.thema).every(k => k.thema === 'bluey')"));
  assert(g.run("[...kartenEingaben.values()].some(teile => teile.some(k => k.value !== ''))"));
  const reload = game(g.saved()); reload.nodes.get("losKnopf").emit("click");
  assert.deepEqual(plain(reload.data().tagesSet), before);
});

test("statistics and unlocking follow the resumed round's original world", () => {
  const g = game(); g.run("zeigeRunde(neuesTagesSet())");
  g.run("setzeModus('gabby'); zeigeRunde(starteTagesRunde())"); g.fill(25);
  g.run("pruefeRunde()");
  // 25 von 50 beantwortet: die Rückfrage vor dem Abschließen bestätigen.
  assert.equal(g.nodes.get("frageUeberlagerung").hidden, false);
  g.nodes.get("frageJaKnopf").emit("click");
  assert.equal(g.data().runden[0].modus, "bluey");
  assert.equal(g.run("weltHeuteFreigeschaltet('bluey')"), true);
  assert.equal(g.run("weltHeuteFreigeschaltet('gabby')"), false);
});

test("new rounds and bonus rounds may explicitly use a newly selected world", () => {
  const g = game();
  g.run("setzeModus('gabby'); zeigeRunde(neuesTagesSet())");
  assert.equal(g.run("runde.welt"), "gabby");
  g.run("schalteWeltFrei('doozie'); startBonusWelt('doozie')");
  assert.equal(g.run("runde.welt"), "doozie");
  assert.equal(g.run("modus"), "doozie");
});

test("autoplay rejection retries the same instance on a later click", async () => {
  const g = game({sound: "an"}, {audio: ["reject", "resolve"]});
  await Promise.resolve(); assert.equal(g.audios[0].plays, 1);
  g.click(); await Promise.resolve();
  assert.equal(g.audios.length, 1);
  assert.equal(g.audios[0].plays, 2);
  g.click(); assert.equal(g.audios[0].plays, 2);
});

test("synchronous play failure also permits a retry", async () => {
  const g = game({sound: "an"}, {audio: ["throw", "resolve"]});
  assert.equal(g.audios[0].plays, 1);
  g.click(); await Promise.resolve();
  assert.equal(g.audios.length, 1);
  assert.equal(g.audios[0].plays, 2);
});

test("the local date uses Vienna calendar days across DST", () => {
  const g = game({}, {now: "2026-03-30T22:30:00Z"});
  assert.equal(g.run("heutigesDatum()"), "2026-03-31");
});

test("pending autoplay and stale callbacks cannot create duplicate audio instances", async () => {
  let reject;
  const g = game({sound: "an"}, {audio: [() => new Promise((resolve, no) => { reject = no; })]});
  g.click(); g.click();
  assert.equal(g.audios[0].plays, 1);
  g.run("musik.umschalten()"); reject(new Error("late rejection")); await Promise.resolve();
  g.audios[0].emit("error"); g.click();
  assert.equal(g.audios.length, 1);
  assert.equal(g.timers.size, 0);
  g.run("musik.umschalten()"); await Promise.resolve(); g.click();
  assert.equal(g.audios.length, 2);
  assert.equal(g.audios[1].plays, 1);
});

test("invalid nonempty euro or cent makes the entire money answer invalid", () => {
  const g = game();
  for (const bad of ["abc", "-1", "1,5", "1.5", "€", "Infinity"]) {
    assert.equal(g.money(bad, "50"), null, `Euro: ${bad}`);
    assert.equal(g.money("1", bad), null, `Cent: ${bad}`);
  }
  assert.equal(g.money("1000", "0"), null);
  assert.equal(g.money("1", "100"), null);
  assert.equal(g.money("", ""), null);
  assert.equal(g.money(" ", " "), null);
});

test("valid money formats, zero and one empty component remain accepted", () => {
  const g = game();
  for (const [euro, cent, expected] of [["", "50", 50], ["16", "", 1600],
    ["16", "5", 1605], [" 16 ", " 50 ", 1650], ["16.", "05", 1605],
    ["0", "0", 0], ["999", "99", 99999]]) {
    assert.equal(g.money(euro, cent), expected);
  }
});

test("invalid money cannot be scored as a correct answer", () => {
  const g = game();
  assert.equal(g.run(`bewerteEingabeFeld({typ: 'geld', geld: {cent: 50}}, {
    querySelectorAll() { return [{value: 'abc', classList: {remove(){}, add(){}}},
      {value: '50', classList: {remove(){}, add(){}}}]; }
  }, 'falsch')`), false);
});

test("Vienna midnight is shared by daily quiz, bonus, statistics and calendar", () => {
  const g = game({}, {now: "2026-10-31T22:59:00Z"});
  assert.equal(g.run("heutigesDatum()"), "2026-10-31");
  g.run("zeigeRunde(neuesTagesSet()); holBonusTag().verteilt = 2");
  g.time("2026-10-31T23:01:00Z");
  assert.equal(g.run("heutigesDatum()"), "2026-11-01");
  assert.equal(g.run("holBonusTag().verteilt"), 0);
  g.run("zeigeRunde(starteTagesRunde()); speichernRunde(1, 1, 1, {}, 0, false)");
  assert.equal(g.data().tagesSet.datum, "2026-11-01");
  assert.equal(g.data().bonusTag.datum, "2026-11-01");
  assert.equal(g.data().runden[0].datum, "2026-11-01");
  assert.equal(g.data().runden[0].uhrzeit, "00:01");
  const calendar = g.run("baueKalender(speicher.daten())");
  const last = calendar.children[1].children.at(-1);
  assert.equal(last.textContent, "1"); assert.match(last.title, /01\.11\.2026: 1 Sterne/);
});

for (const [name, now, today, previous, future] of [
  ["summer time", "2026-03-29T22:30:00Z", "2026-03-30", "2026-03-29", "2026-03-31"],
  ["winter time", "2026-10-25T23:30:00Z", "2026-10-26", "2026-10-25", "2026-10-27"]
]) {
  test(`calendar days and streaks across ${name}`, () => {
    const g = game({runden: [today, previous].map(datum => ({datum, sterne: 1}))}, {now});
    assert.equal(g.run("heutigesDatum()"), today);
    assert.equal(g.run(`verschiebeKalendertag('${today}', -1)`), previous);
    assert.equal(g.run(`verschiebeKalendertag('${today}', 1)`), future);
    const calendar = g.run("baueKalender(speicher.daten())");
    const days = calendar.children[1].children;
    assert.equal(new Set(days.map(n => n.title.split(": ")[0])).size, 28);
    assert.match(calendar.textContent, /2 Tage hintereinander/);
  });
}

test("Vienna clock handles the skipped and repeated hour at DST transitions", () => {
  const g = game();
  for (const [instant, date, hour, minute] of [
    ["2026-03-29T00:59:00Z", "2026-03-29", "01", "59"],
    ["2026-03-29T01:01:00Z", "2026-03-29", "03", "01"],
    ["2026-10-25T00:30:00Z", "2026-10-25", "02", "30"],
    ["2026-10-25T01:30:00Z", "2026-10-25", "02", "30"]
  ]) {
    g.time(instant);
    assert.equal(g.run("heutigesDatum()"), date);
    assert.equal(g.run("wienerDatumTeile().hour"), hour);
    assert.equal(g.run("wienerDatumTeile().minute"), minute);
  }
});

test("migration never shifts historical stored dates", () => {
  const history = [{zeit: "2026-10-31T23:30:00Z", datum: "2026-10-31", uhrzeit: "00:30", sterne: 5}];
  const g = game({runden: history});
  assert.deepEqual(plain(g.data().runden), history);
  g.run("baueKalender(speicher.daten()); speicher.speichere()");
  assert.deepEqual(g.saved().runden, history);
});
