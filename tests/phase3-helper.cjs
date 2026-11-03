"use strict";
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
function game(saved = {}, options = {}) {
  let now = Date.parse(options.now || "2026-10-31T23:30:00Z");
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const audios = [];
  const outcomes = (options.audio || []).slice();
  const documentEvents = new Map();
  const windowEvents = new Map();
  const downloads = []; const revoked = []; const blobs = new Map();
  let timerId = 0; const pending = new Map();
  function emitDoc(name, event = {}) { (documentEvents.get(name) || []).forEach(fn => fn(event)); }
  function blocked(n) { while (n) { if(n.hidden || n.inert) return true; n = n.parentNode; } return false; }
  function node(type = "div") {
    const events = new Map();
    let content = "";
    const n = {
      type, className: "", dataset: {}, style: {}, children: [], hidden: false, inert: false,
      value: "", disabled: false, attributes: {}, tabIndex: type === 'button' || type === 'input' || type === 'a' ? 0 : -1,
      get textContent() { return content + this.children.map(c => c.textContent).join(""); },
      set textContent(value) { content = String(value); this.children = []; },
      appendChild(child) { this.children.push(child); child.parentNode = this; return child; },
      prepend(child) { this.children.unshift(child); child.parentNode = this; },
      setAttribute(key, value) { this.attributes[key] = value; if(key==='tabindex') this.tabIndex=Number(value); },
      getAttribute(key) { return this.attributes[key] ?? null; },
      contains(child) { while(child) { if(child === this) return true; child=child.parentNode; } return false; },
      removeChild(child) { this.children=this.children.filter(n=>n!==child); child.parentNode=null; },
      click() { if(type === 'a' && this.download) { if(options.failDownload) throw new Error('download failed'); downloads.push({href:this.href, name:this.download, blob:blobs.get(this.href)}); } else this.emit('click'); },
      addEventListener(event, handler) { events.set(event, handler); },
      emit(name, extra = {}) { const event = Object.assign({target:this, preventDefault(){this.defaultPrevented=true;}}, extra); if(blocked(this) || this.disabled) return event; events.get(name)?.(event); emitDoc(name,event); return event; },
      scrollIntoView() {}, focus() { if(!blocked(this)) { document.activeElement=this; emitDoc('focusin', {target:this}); } }, select() {},
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
    if (selector.includes(',')) return selector.split(',').some(s=>matches(n,s.trim()));
    if(selector==='button' || selector==='input' || selector==='select' || selector==='textarea') return n.type===selector;
    if(selector==='[href]') return n.attributes.href !== undefined;
    if(selector==='[tabindex]') return n.attributes.tabindex !== undefined;
    if (selector.startsWith(".")) return n.className.split(/\s+/).includes(selector.slice(1));
    const card = selector.match(/^\[data-karten-id="([^"]+)"\]$/);
    return card ? n.dataset.kartenId === card[1] : false;
  }
  const nodes = new Map();
  const speicher = new Map();
  const SPIELSTAND = 'mathe-ueben-fuer-emma';
  speicher.set(SPIELSTAND, Object.hasOwn(options, 'raw') ? String(options.raw)
    : JSON.stringify(Object.assign({ sound: "aus" }, saved)));
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
      return [this.body, ...descendants(this.body)].filter(n=>matches(n,selector));
    },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    addEventListener(event, handler) { const list=documentEvents.get(event)||[]; list.push(handler); documentEvents.set(event,list); }
  };
  // Build the test DOM from the actual HTML, including roles and dialog nesting.
  const stack=[]; const html=fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  for(const token of html.matchAll(/<(\/?)([\w-]+)([^>]*)>/g)) {
    const [,closing,type,attrs]=token;
    if(closing) { while(stack.length) { if(stack.pop().type===type) break; } continue; }
    const n=node(type);
    for(const attr of attrs.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      const key=attr[1], value=attr[2] ?? '';
      n.setAttribute(key,value);
      if(key==='id') {n.id=value; nodes.set(value,n);}
      if(key==='class') n.className=value;
      if(key==='hidden') n.hidden=true;
      if(key==='disabled') n.disabled=true;
      if(key.startsWith('data-')) n.dataset[key.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;
    }
    if(stack.length) stack.at(-1).appendChild(n);
    if(type==='body') document.body=n;
    if(!['meta','link','input','br','hr','img'].includes(type) && !attrs.trim().endsWith('/')) stack.push(n);
  }
  document.activeElement=document.body;
  const timers = new Map();
  const contexts = [];
  class AudioContext {
    constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; contexts.push(this); }
    suspend() { this.state = "suspended"; return Promise.resolve(); }
    resume() { this.state = "running"; return Promise.resolve(); }
    createOscillator() { return {frequency: {}, connect() {}, start() {}, stop() {}}; }
    createGain() { return {gain: {setValueAtTime() {}, exponentialRampToValueAtTime() {}}, connect() {}}; }
  }
  const math = Object.create(Math);
  if (options.failMigration) { math.max = function () { math.max = Math.max; throw new Error('migration failed'); }; }
  let reloads = 0;
  const windowObjekt = {
    localStorage: {
      getItem(key) { if (options.failRead) throw new Error('read denied'); return speicher.has(key) ? speicher.get(key) : null; },
      setItem(key, value) { if (options.failWrite) throw new Error('quota'); speicher.set(key, String(value)); writes++; },
      removeItem(key) { speicher.delete(key); }
    },
    AUFGABEN: require("../aufgaben-bereiche.js"), GESCHICHTEN: require("../geschichten.js"),
    VIDEOS: ["bluey", "gabby", "doozie"].map(welt => ({welt, video: welt, titel: welt})),
    AudioContext, matchMedia() { return { matches: true }; }, scrollTo() {}, alert() {},
    location: { reload() { reloads += 1; } },
    Blob, URL: { createObjectURL(blob) { const id='blob:'+blobs.size; blobs.set(id,blob); return id; }, revokeObjectURL(id) { revoked.push(id); blobs.delete(id); } },
    addEventListener(name, fn) { windowEvents.set(name, fn); },
    setInterval(fn) { const id = timers.size + 1; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); },
    setTimeout(fn, delay) { const id=++timerId; pending.set(id,{fn,delay}); return id; },
    clearTimeout(id) { pending.delete(id); }
  };
  if (typeof options.fetch === "function") { windowObjekt.fetch = options.fetch; }
  const context = vm.createContext({ Date: Clock, Math: math, document, window: windowObjekt });
  const run = code => vm.runInContext(code, context);
  run(fs.readFileSync(path.join(__dirname, "../script.js"), "utf8"));
  run("EINSTELLUNGEN.spaessig = false");
  return {
    run, nodes, audios, timers, contexts, document, downloads, revoked, options, window: windowObjekt,
    raw:()=>speicher.get(SPIELSTAND),
    reloads: () => reloads,
    syncDaten: () => speicher.get("mathe-ueben-sync"),
    speicherSchluessel: () => [...speicher.keys()],
    flush() { const list=[...pending.values()]; pending.clear(); list.forEach(t=>t.fn()); },
    pagehide() { windowEvents.get('pagehide')?.(); },
    key(key, shiftKey=false) { return document.activeElement.emit('keydown', {key, shiftKey}); },
    visibility() { document.visibilityState='hidden'; emitDoc('visibilitychange'); },
    data: () => run("speicher.daten()"),
    saved: () => JSON.parse(speicher.get(SPIELSTAND)), writes: () => writes,
    time(iso) { now = Date.parse(iso); }, click() { emitDoc('click'); },
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

module.exports = { game };
