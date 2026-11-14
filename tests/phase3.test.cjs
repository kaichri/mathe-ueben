"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");
const stories = require("../geschichten.js");
const byId = new Map(stories.VORLAGEN.map(v => [v.id, v]));
const plain = value => JSON.parse(JSON.stringify(value));

test("6000 story sets retain exactly 3 normal, 1 money, 1 clock and the 3/2 difficulty mix", () => {
  for (const modus of ["bluey", "gabby", "doozie"]) {
    let history = [];
    for (let i = 0; i < 2000; i++) {
      const set = stories.erzeugeGeschichten({modus, zuletzt: history});
      assert.equal(set.length, 5);
      assert.equal(new Set(set.map(k => k.vorlage)).size, 5);
      const templates = set.map(k => byId.get(k.vorlage));
      for (const [category, count] of [["normal", 3], ["geld", 1], ["uhr", 1]]) {
        assert.equal(templates.filter(v => v.kategorie === category).length, count);
      }
      assert.equal(templates.filter(v => v.stufe === 1).length, 3);
      assert.equal(templates.filter(v => v.stufe === 2).length, 2);
      history = set.map(k => k.vorlage).concat(history).slice(0, 30);
    }
  }
});

test("recent money and clock templates are repeated instead of dropping their categories", () => {
  const history = stories.vorlagenIds();
  for (const modus of ["bluey", "gabby", "doozie"]) {
    const set = stories.erzeugeGeschichten({modus, zuletzt: history});
    assert.equal(set.filter(k => byId.get(k.vorlage).kategorie === "geld").length, 1);
    assert.equal(set.filter(k => byId.get(k.vorlage).kategorie === "uhr").length, 1);
  }
});

test("recent templates are avoided while fresh matching templates exist", () => {
  const recent = ["sammeln-dazu", "geld-zwei-eis", "uhr-wie-spaet"];
  for (let i = 0; i < 100; i++) {
    assert(stories.erzeugeGeschichten({modus: "bluey", zuletzt: recent}).every(k => !recent.includes(k.vorlage)));
  }
});

test("the game's story history orders newest first and removes duplicates", () => {
  const g=game();
  g.run("speicher.daten().vortagSchluessel = ['geschichte|old', 'add|1', 'geschichte|new']; speicher.daten().zuletzt = ['new', 'old', 'earlier']");
  assert.deepEqual(plain(g.run('geschichtenAusschluss()')),['new','old','earlier']);
});

// Independent answer oracle for every existing template, derived from its story.
const answers = {};
function formulas(ids, fn) { ids.split(" ").forEach(id => { answers[id] = fn; }); }
formulas("sammeln-dazu mehr-als keepy-uppy beide-zusammen-einfach doppeltes-ergaenzen uhr-minuten-zusammen", ([a,b]) => a+b);
formulas("verschenken weniger-als am-bach puppenhaus-aufraeumen quietschtiere parkplaetze-frei wer-hat-mehr", ([a,b]) => a-b);
formulas("gleich-verteilen", ([a,b]) => a/b);
formulas("tueten-gruppen beim-backen hundehaus-modenschau uhr-ueben-pro-woche", ([a,b]) => a*b);
formulas("doppelt-so-viele", ([a]) => 2*a);
formulas("paare-legen", ([a]) => a/2);
formulas("dazu-dann-weg", ([a,b,c]) => a+b-c);
formulas("verloren-und-gefunden sitzreihen-kino", ([a,b,c]) => a-b+c);
formulas("packungen-dann-weg", ([a,b,c]) => a*b-c);
formulas("beide-haben-zusammen uhr-hin-und-zurueck", ([a,b]) => 2*a+b);
formulas("verdoppeln-dann-weg", ([a,b]) => 2*a-b);
formulas("halbierung-dann-dazu", ([a,b]) => a/2+b);
formulas("dreifach-dann-weg", ([a,b]) => 3*a-b);
formulas("kisten-stapeln", ([a,b,c]) => a*b+c);
formulas("geld-zwei-eis", ([a,b]) => 2*(a*100+b*10));
formulas("geld-taschengeld geld-zwei-sachen", ([a,b]) => 100*(a+b));
formulas("geld-rueckgeld", ([a,b,c]) => 100*(a-b-c));
formulas("geld-stueckpreis", ([a]) => a*250);
formulas("geld-drei-freunde", ([a]) => a*300);
formulas("geld-taschengeld-monate", ([a,b]) => a*b*100);
formulas("geld-haelfte-sparschwein", ([a]) => a*50);
formulas("geld-eis-rest", ([a,b,c]) => 100*(a-b)-c*10);
formulas("geld-kinokarten", ([a]) => a*400);
formulas("geld-trikot-ball", ([a,b]) => 100*(2*a+b));
formulas("uhr-zeit-planen", ([a,b]) => 60-a-b);
formulas("uhr-halbe-stunden", ([a]) => 30*a);
formulas("uhr-film-dauer", ([a]) => a);
formulas("uhr-wie-spaet", ([a], extra) => extra.minuten+a);
formulas("uhr-minuten-davor", ([a], extra) => extra.minuten-a);
formulas("uhr-zwei-aktivitaeten", ([a,b], extra) => extra.minuten+a+b);
formulas("alter-rueckwaerts", ([a,b]) => a-b);
formulas("aufzug-mindestfahrten", ([a,b]) => Math.floor((a+b-1)/b));
formulas("tretboote-volle-gruppen", ([a,b]) => a-Math.floor(a/b)*b);
formulas("zahlenweg-huepfen", ([a,b]) => a+b+b+b);
formulas("rechnung-basteltisch", ([a,b,c]) => `${a} − ${b} + ${c}`);
formulas("rechenart-fest", ([,,art]) => ["Plus (+)", "Minus (−)", "Mal (×)", "Geteilt (÷)", "Eine Angabe fehlt"][art]);
formulas("geld-riesenrad-gruppe", ([a,b,c,d]) => (a*c+b*d)*100);
formulas("geld-muenzbeutel", ([a,b,c]) => (a*20+b*2)*100+c*50);

test("every template: all allowed number combinations have correct integer answers and plausible bounds", () => {
  assert.deepEqual(new Set(Object.keys(answers)), new Set(stories.vorlagenIds()));
  let checked = 0;
  for (const v of stories.VORLAGEN) {
    let valid = 0;
    function visit(z) {
      if (z.length < v.zahlen.length) {
        const range = v.zahlen[z.length];
        for (let n=range.min; n<=range.max; n++) visit(z.concat(n));
        return;
      }
      if (v.regeln && !v.regeln(z)) return;
      valid++; checked++;
      const minute = v.id === "uhr-zwei-aktivitaeten" ? 0 : 45;
      const extra = {stunde: 10, minute, minuten: 600+minute, uhrText: "10:"+minute, uhrSprech: "10:"+minute+" Uhr"};
      const c = {z, extra, p1: "Emma", p2: "Bluey", sache: "Sticker", t1: "Malen", t2: "Basteln"};
      const expected = answers[v.id](z, extra);
      const field = v.feld ? v.feld(c) : {korrekt: v.losung(c), typ: "zahl"};
      const actual = field.typ === "zeit" ? field.zeit.stunde*60+field.zeit.minute : field.korrekt;
      assert.equal(field.auswahl ? field.auswahl[actual-1] : actual, expected, v.id);
      assert(Number.isInteger(actual) && actual >= 0, v.id);
      assert(actual <= (field.typ === "geld" ? 10000 : field.typ === "zeit" ? 1439 : 100), v.id);
      if (v.id === "sitzreihen-kino") assert(actual <= z[0]);
      if (v.id === "verloren-und-gefunden") assert(z[2] <= z[1]);
      if (field.typ === "zeit") assert(field.zeit.minute < 60);
      assert(!/undefined|NaN/.test(v.text(c)), v.id);
    }
    visit([]);
    assert(valid > 0, v.id);
  }
  assert(checked > 93308);
});

test("story choices survive reload, count as answers and are graded", () => {
  const g = game();
  const ident = g.run(`
    const probe = neuesTagesSet();
    const karte = probe.karten.find(k => k.bereich === "geschichte");
    const vorlage = window.GESCHICHTEN.VORLAGEN.find(v => v.id === "rechnung-basteltisch");
    const kontext = {p1: "Emma", z: [25, 6, 13]};
    karte.vorlage = vorlage.id;
    karte.text = vorlage.text(kontext);
    karte.frage = "";
    karte.felder = [vorlage.feld(kontext)];
    zeigeRunde(probe);
    zeigeAbschnitt(probe.bereiche.findIndex(b => b.bereich === "geschichte"));
    const auswahl = eingabeZuFeld.get(karte.felder[0]);
    auswahl.value = String(karte.felder[0].korrekt);
    auswahl.emit("change");
    karte.ident;
  `);
  const neu = game(g.saved());
  neu.nodes.get("losKnopf").emit("click");
  assert.equal(neu.run(`
    const karte = runde.karten.find(k => k.ident === ${JSON.stringify(ident)});
    karteIstAusgefuellt(karte) &&
      Number(eingabeZuFeld.get(karte.felder[0]).value) === karte.felder[0].korrekt
  `), true);
  neu.fill(50);
  neu.run("pruefeRunde()");
  assert.equal(neu.saved().runden[0].richtig, 50);
});

test("contradictory seating and recovered-item examples are rejected", () => {
  assert.equal(byId.get("sitzreihen-kino").regeln([40,13,20]), false);
  assert.equal(byId.get("sitzreihen-kino").regeln([40,13,13]), true);
  assert.equal(byId.get("verloren-und-gefunden").regeln([45,13,27]), false);
});

test("ambiguous story wording states recipient, payment and initially empty savings", () => {
  const c={p1:"Emma",p2:"Bluey",sache:"Sticker",z:[40,12,9]};
  assert.match(byId.get("halbierung-dann-dazu").text(c), /schenkt Bluey Emma/);
  assert.match(byId.get("geld-rueckgeld").text(c), /bezahlt mit den 40/);
  assert.match(byId.get("geld-taschengeld-monate").text(c), /anfangs leere/);
  assert.match(byId.get("geld-haelfte-sparschwein").text(c), /anfangs leere/);
  assert.equal(byId.get("geld-eis-rest").zahlen[1].max, 5);
});

test("malformed JSON, empty stored text and future schemas never overwrite originals", () => {
  for (const raw of ["{broken", "", "null", "[]", "0", '{"version":99,"sterneGesamt":50}']) {
    const g=game({}, {raw});
    g.run("neuesTagesSet(); speicher.speichere()"); g.pagehide();
    assert.equal(g.raw(), raw);
    assert.equal(g.writes(),0);
    assert.equal(g.nodes.get("speicherHinweis").hidden,false);
    assert.equal(g.run("speicher.sicherung().originalSpeicher"),raw);
  }
});

test("read denial starts a usable session without overwriting unread data", () => {
  const options={failRead:true};const g=game({sterneGesamt:50},options);
  assert.equal(g.run("gesamtSterne()"),0);
  g.run("zeigeRunde(neuesTagesSet())");
  assert.equal(g.writes(),0);
  assert.equal(g.saved().sterneGesamt,50);
  assert.match(g.run("speicher.meldung()"), /nicht sicher geöffnet/);
});

test("an exception during migration never commits a partial state over the original", () => {
  const raw=JSON.stringify({sterneGesamt:50,runden:[{sterne:5}],geschenke:[{id:'g1',text:'Gift'}]});
  const g=game({}, {raw,failMigration:true});
  assert.equal(g.raw(),raw);assert.equal(g.writes(),0);
  assert.equal(g.run("speicher.sicherung().originalSpeicher"),raw);
  assert.equal(g.nodes.get('speicherHinweis').hidden,false);
});

test("write denial is visible, retains in-memory answers and permits later retry", () => {
  const options={failWrite:true};const g=game({bonusGesamt:12},options);
  assert.equal(g.nodes.get("speicherHinweis").hidden,false);
  g.run("zeigeRunde(neuesTagesSet())");g.fill(3);g.run("sichereTagesAntworten()");
  assert(Object.keys(g.data().tagesSet.antworten).length===3);
  assert.equal(g.run("gesamtSterne()"),12);
  options.failWrite=false;g.run("speicher.speichere()");
  assert.equal(g.nodes.get("speicherHinweis").hidden,true);
  assert.equal(Object.keys(g.saved().tagesSet.antworten).length,3);
});

test("corrupt nested rows are isolated and all source data stays protected", () => {
  const saved={sterneGesamt:20,bonussterne:2,bonusGesamt:7,
    runden:[null,{sterne:5},{datum:23},{sterne:-1},{gesamt:Infinity}],
    geschenke:[null,{id:'g1',text:'Gift'},{text:3}],
    bereichPunkte:{add:{richtig:8,gesamt:10},sub:null},
    bonusTag:{datum:'2026-11-01',verteilt:'oops'},modus:42};
  const raw=JSON.stringify(saved);const g=game({}, {raw});
  g.run("zeigeFortschritt('statistik'); zeigeFortschritt('geschenke'); zeigeFortschritt('sterne')");
  assert.equal(g.run("gesamtSterne()"),7);
  assert.equal(g.data().geschenke.length,1);
  assert.equal(g.data().bereichPunkte.add.richtig,8);
  assert.equal(g.raw(),raw);
  assert.equal(g.writes(),0);
});

test("damaged daily task, answer and section data cannot crash or overwrite storage", () => {
  const source=game();source.run("zeigeRunde(neuesTagesSet())");source.fill(3);source.run("sichereTagesAntworten()");
  for(const damage of [
    s=>s.tagesSet.runde.bereiche[0].aufgaben[0].felder=null,
    s=>s.tagesSet.runde.bereiche[0].aufgaben[0].bereich='__proto__',
    s=>s.tagesSet.antworten=17,
    s=>s.tagesSet.abschnitt=Infinity,
    s=>s.tagesSet.runde.bereiche[0].aufgaben.push(s.tagesSet.runde.bereiche[0].aufgaben[0])
  ]) {
    const saved=source.saved();damage(saved);const raw=JSON.stringify(saved);
    const g=game({}, {raw});g.run("zeigeRunde(starteTagesRunde())");
    assert.equal(g.raw(),raw);assert.equal(g.writes(),0);
    assert.equal(g.run("runde.anzahl"),50);
  }
});

test("missing optional fields migrate without losing valid history or vouchers", () => {
  const g=game({runden:[{bonus:true,bonusRichtig:4}],geschenke:[{text:'Gift'}]});
  assert.equal(g.run("gesamtSterne()"),4);
  assert.equal(g.saved().runden[0].bonusRichtig,4);
  assert.equal(g.saved().geschenke[0].text,'Gift');
  assert(g.saved().geschenke[0].id);
  assert.equal(g.run("speicher.meldung()"),'');
  g.run("zeigeFortschritt('statistik')");
  assert(!/NaN|undefined/.test(g.nodes.get('statistikInhalt').textContent));
  g.run("zeigeFortschritt('sterne')");
  assert(!/NaN|undefined/.test(g.nodes.get('sterneInhalt').textContent));
});

test("backup download includes current session and exact damaged source, then releases URL", async () => {
  const g=game({}, {raw:'{broken'});g.nodes.get('sicherungKnopf').emit('click');
  assert.equal(g.downloads.length,1);
  const backup=JSON.parse(await g.downloads[0].blob.text());
  assert.equal(backup.originalSpeicher,'{broken');
  assert.equal(backup.daten.version,3);
  assert.match(g.downloads[0].name,/\.json$/);
  g.flush();assert.deepEqual(g.revoked,[g.downloads[0].href]);
});

test("typing is batched, unchanged saves are skipped and blur flushes pending answers", () => {
  const g=game();g.run("zeigeRunde(neuesTagesSet())");
  const input=g.run("kartenEingaben.get(runde.karten[0].ident)[0]");
  const before=g.writes();input.value='1';input.emit('input');input.value='12';input.emit('input');
  assert.equal(g.writes(),before);
  g.flush();assert.equal(g.writes(),before+1);
  g.run("speicher.speichere(); speicher.speichere()");assert.equal(g.writes(),before+1);
  input.value='13';input.emit('input');input.emit('blur');
  assert.equal(g.writes(),before+2);
  g.flush();assert.equal(g.writes(),before+2);
});

test("pagehide and hiding the document flush pending input immediately", () => {
  for(const event of ['pagehide','visibility']) {
    const g=game();g.run("zeigeRunde(neuesTagesSet())");
    const input=g.run("kartenEingaben.get(runde.karten[0].ident)[0]");input.value='42';input.emit('input');
    g[event]();assert.equal(Object.values(g.saved().tagesSet.antworten)[0][0],'42');
  }
});

test("the version tab shows build information", () => {
  const g=game();g.run("zeigeFortschritt('version')");
  const text=g.nodes.get("versionInhalt").textContent;
  assert.match(text,/Version 1\.0\.6/);
  assert.match(text,/Speicherformat: Version 3/);
  assert.match(text,/starter\.log/);
  assert.equal(g.run("Object.keys(FORTSCHRITT_TABS).length"),5);
  g.run("zeigeFortschritt('sterne')");
  assert.equal(g.nodes.get("versionInhalt").hidden,true);
  assert.equal(g.nodes.get("sterneInhalt").hidden,false);
});

test("CSV quotes semicolons, quotes and newlines, neutralizes formulas and revokes URL", async () => {
  const text='Gift; "special"\nsecond line';
  const g=game({geschenke:[{id:'g1',datum:'2026-10-28',text},{id:'g2',datum:'2026-10-29',text:'=1+1',wunschGeaendertAm:'2026-11-01T10:00:00.000Z'}]});g.run("csvHerunterladen()");
  const csv=await g.downloads[0].blob.text();
  assert(csv.includes('"Gift; ""special""\nsecond line"'));
  assert(csv.includes("'=1+1"));
  assert.match(g.downloads[0].name,/\.csv$/);
  g.flush();assert.deepEqual(g.revoked,[g.downloads[0].href]);
});

test("a failed download still releases the created Blob URL", () => {
  const g=game({}, {failDownload:true});g.run("csvHerunterladen()");g.flush();
  assert.deepEqual(g.revoked,['blob:0']);
});

test("Doozie file is attempted and missing file falls back to Puppenhaus without overlap", async () => {
  const g=game({sound:'an',modus:'doozie'});await Promise.resolve();
  assert.equal(g.audios[0].src,'musik/doozie.mp3');
  g.audios[0].emit('error');await Promise.resolve();
  assert.equal(g.audios[1].src,'musik/puppenhaus.mp3');
  assert.equal(g.audios[0].paused,true);
  assert.equal(g.audios.filter(a=>!a.paused).length,1);
});

test("both dialogs have accessible roles/titles and the restart has a description", () => {
  const g=game();
  for(const id of ['versuchUeberlagerung','geschenkUeberlagerung']) {
    const dialog=g.nodes.get(id);assert.equal(dialog.getAttribute('role'),'dialog');
    assert.equal(dialog.getAttribute('aria-modal'),'true');
    assert(g.nodes.has(dialog.getAttribute('aria-labelledby')));
  }
  assert(g.nodes.has(g.nodes.get('versuchUeberlagerung').getAttribute('aria-describedby')));
});

test("restart focus starts on cancel, cycles with Tab/Shift-Tab and Escape restores opener", () => {
  const g=game();const opener=g.nodes.get('losKnopf');opener.focus();
  g.run("zeigeNeuerVersuchFrage(function(){throw new Error('must not confirm')})");
  const cancel=g.nodes.get('versuchAbbrechenKnopf'),yes=g.nodes.get('versuchBestaetigenKnopf');
  assert.equal(g.document.activeElement,cancel);
  g.key('Tab');assert.equal(g.document.activeElement,yes);
  g.key('Tab',true);assert.equal(g.document.activeElement,cancel);
  opener.focus();assert.equal(g.document.activeElement,cancel);
  g.key('Escape');assert.equal(g.document.activeElement,opener);
  assert.equal(g.nodes.get('versuchUeberlagerung').hidden,true);
  assert.equal(g.run("versuchAngelegenheit"),null);
});

test("confirm/cancel and gift dismissal restore focus without navigating behind the dialog", () => {
  const g=game();const opener=g.nodes.get('losKnopf');opener.focus();
  g.run("let confirmations=0; zeigeNeuerVersuchFrage(function(){confirmations++})");
  g.nodes.get('versuchBestaetigenKnopf').emit('click');
  assert.equal(g.run('confirmations'),1);assert.equal(g.document.activeElement,opener);
  g.run("zeigeNeuerVersuchFrage(function(){confirmations++})");
  g.nodes.get('versuchAbbrechenKnopf').emit('click');assert.equal(g.run('confirmations'),1);
  g.run("geschenkAuswahlOeffnen()");
  const dialog=g.nodes.get('geschenkUeberlagerung');assert(dialog.contains(g.document.activeElement));
  for(let i=0;i<10;i++) {g.key('Tab');assert(dialog.contains(g.document.activeElement));}
  g.nodes.get('geschenkWegKnopf').emit('click');assert.equal(g.document.activeElement,opener);
  assert.equal(g.nodes.get('startBildschirm').parentNode.inert,false);
});

test("results have a polite live region and announce real scoring", () => {
  const g=game();assert.equal(g.nodes.get('rueckmeldung').getAttribute('aria-live'),'polite');
  g.run("zeigeRunde(neuesTagesSet())");g.fill(25);g.run("pruefeRunde()");
  // 25 von 50 beantwortet: die Rückfrage vor dem Abschließen bestätigen.
  assert.equal(g.nodes.get('frageUeberlagerung').hidden,false);
  g.nodes.get('frageJaKnopf').emit('click');
  assert.match(g.nodes.get('rueckmeldung').textContent,/25 von 50/);
});

test("selecting a gift and exchanging a voucher close the dialog and leave usable focus", () => {
  const g=game({version:3,bonusGesamt:25,bonusStufenOffen:[25]});const opener=g.nodes.get('losKnopf');opener.focus();
  g.run("geschenkAuswahlOeffnen()");
  g.document.activeElement.emit('click');
  assert.equal(g.data().geschenke.length,1);assert.equal(g.data().bonusGesamt,25);
  assert.equal(g.nodes.get('geschenkUeberlagerung').hidden,true);
  assert.equal(g.document.activeElement,opener);
  g.run("zeigeFortschritt('geschenke'); tauschGutscheinOeffnen(speicher.daten().geschenke[0].id)");
  g.document.activeElement.emit('click');
  assert.equal(g.data().geschenke.length,1);
  assert.equal(g.document.activeElement,g.nodes.get('fortschrittZurueckKnopf'));
});
