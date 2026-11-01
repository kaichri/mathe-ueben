"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {game} = require("./phase3-helper.cjs");
const tasks = require("../aufgaben-bereiche.js");

function arithmetic(text) {
  const tokens = text.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").match(/\d+|[+*/-]/g);
  const terms = [Number(tokens[0])];
  for (let i=1; i<tokens.length; i+=2) {
    const op=tokens[i], n=Number(tokens[i+1]);
    if(op==='*') terms[terms.length-1]*=n;
    else if(op==='/') terms[terms.length-1]/=n;
    else terms.push(op==='-' ? -n : n);
  }
  return terms.reduce((a,b)=>a+b,0);
}

test("500 generated rounds: all arithmetic, inverse problems, blanks and remainders", () => {
  for(let i=0;i<500;i++) for(const card of tasks.erzeugeRunde({divisionMitRestAktiv:i%2===0}).aufgaben) {
    if(card.layout==='rest') {
      const [dividend,divisor]=card.darstellung.match(/\d+/g).map(Number);
      assert.equal(card.felder[0].korrekt,Math.floor(dividend/divisor));
      assert.equal(card.felder[1].korrekt,dividend%divisor);
    } else {
      const [left,right]=card.darstellung.replace('□',String(card.felder[0].korrekt)).split('=');
      assert.equal(arithmetic(left),right.trim() ? arithmetic(right) : card.felder[0].korrekt,card.darstellung);
      for(const field of card.felder.slice(1)) assert.equal(arithmetic(field.darstellung.split('=')[0]),field.korrekt);
    }
  }
});

test("100 full rounds over 25 days: worlds, 25 reloads, stars, vouchers and daily limits", () => {
  let saved={sterneGesamt:11,bonusGesamt:5,bonussterne:0,geschenke:[{id:'original',datum:'2026-10-01',text:'Original gift'}]};
  for(let day=0;day<25;day++) {
    const instant=new Date(Date.UTC(2026,10,1+day,12)).toISOString();
    const g=game(saved,{now:instant});
    for(let round=0;round<4;round++) {
      const world=['bluey','gabby','doozie'][(day+round)%3];
      g.run(`setzeModus('${world}'); zeigeRunde(neuesTagesSet())`);g.fill(50);
      g.run('pruefeRunde(); pruefeRunde()');
      assert.equal(g.run(`weltHeuteFreigeschaltet('${world}')`),true);
      if(round===0) {
        g.run(`zeigeRunde(baueBonusRunde('${world}'))`);g.fill(3);
        g.run('pruefeRunde(); pruefeRunde()');
        if(g.data().bonussterne>=5) g.run('geschenkGewaehlt(GESCHENKE[0].text, 5)');
        assert.equal(g.data().bonusTag.verteilt,3);
      }
    }
    const sameDay=game(g.saved(),{now:instant});
    assert.equal(sameDay.data().sterneGesamt,11+(day+1)*20);
    assert.equal(sameDay.data().bonusGesamt,5+(day+1)*3);
    assert.equal(sameDay.data().bonusTag.verteilt,3);
    assert.equal(sameDay.data().bonusWelten.length,3);
    assert.equal(sameDay.data().geschenke[0].text,'Original gift');
    saved=sameDay.saved();
  }
  assert.equal(saved.runden.length,125);
  assert.equal(saved.sterneGesamt,511);
  assert.equal(saved.bonusGesamt,80);
  assert.equal(saved.bonussterne,0);
  assert.equal(saved.geschenke.length,16);
  assert.equal(Object.values(saved.bereichPunkte).reduce((n,p)=>n+p.gesamt,0),5000);
});

test("1100 statistic rows survive history truncation and reopening without loss of lifetime totals", () => {
  const g=game({geschenke:[{id:'g1',text:'Keep me'}]});
  for(let i=0;i<1100;i++) g.run('speichernRunde(1,1,5,{add:{richtig:1,gesamt:1}},0,false)');
  const again=game(g.saved());
  assert.equal(again.data().runden.length,1000);
  assert.equal(again.data().sterneGesamt,5500);
  assert.equal(again.data().bereichPunkte.add.gesamt,1100);
  assert.equal(again.data().geschenke[0].text,'Keep me');
});

test("a stale window cannot overwrite newer stars, vouchers or unlocked worlds", () => {
  const g=game();
  g.run(`window.localStorage.setItem(SPEICHER_NAME, JSON.stringify({
    ...speicher.daten(), sterneGesamt:7, bonussterne:3, bonusGesamt:8,
    geschenke:[{id:'other',text:'Preserve gift'}],bonusWelten:['bluey']
  })); setzeModus('gabby'); speicher.speichere()`);
  assert.equal(g.saved().sterneGesamt,7);
  assert.equal(g.saved().bonusGesamt,8);
  assert.equal(g.saved().geschenke[0].text,'Preserve gift');
  assert.deepEqual(g.saved().bonusWelten,['bluey']);
  assert.match(g.run('speicher.meldung()'),/anderen Fenster/);
});

test("a second click landing on the newly shown new-attempt button does not open its dialog", () => {
  const g=game();g.run('zeigeRunde(neuesTagesSet())');g.fill(50);g.run('pruefeRunde()');
  g.nodes.get('neuKnopf').emit('click',{detail:2});
  assert.equal(g.nodes.get('versuchUeberlagerung').hidden,true);
  g.nodes.get('neuKnopf').emit('click',{detail:1});
  assert.equal(g.nodes.get('versuchUeberlagerung').hidden,false);
});
