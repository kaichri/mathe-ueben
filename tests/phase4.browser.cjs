"use strict";
// Run with Playwright on NODE_PATH. Uses isolated browser contexts and localhost.
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium,firefox,webkit}=require('playwright');
const root=path.resolve(__dirname,'..');
const output=path.resolve(process.env.QA_OUTPUT || path.join(require('node:os').tmpdir(),'mathe-phase4-'+Date.now()));
fs.mkdirSync(output,{recursive:true});
const engines=[['Chrome',process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe'],
  ['Edge',process.env.EDGE_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe']];
const result={date:new Date().toISOString(),output,engines:[],unavailable:[],checks:[]};
let currentPage;
const allowed=new Set(['index.html','style.css','script.js','geschichten.js','aufgaben-bereiche.js','videos.js']);
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'') || 'index.html';
  if(!(allowed.has(name) || /^musik\/[\w-]+\.mp[34]$/.test(name))) {res.writeHead(404);return res.end();}
  const filename=path.join(root,name);
  if(!fs.existsSync(filename)){res.writeHead(404);return res.end();}
  const type={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.mp3':'audio/mpeg','.mp4':'video/mp4'}[path.extname(name)];
  res.writeHead(200,{'Content-Type':type,'Content-Length':fs.statSync(filename).size,'Cache-Control':'no-store'});
  fs.createReadStream(filename).pipe(res);
});

async function check(engine,name,fn){
  try{const details=await fn();result.checks.push({engine,name,status:'pass',details});console.log('PASS',engine,name);}
  catch(e){
    let state;
    try { state=await currentPage.evaluate(()=>({dialogs:[...document.querySelectorAll('.ueberlagerung')].map(n=>({id:n.id,hidden:n.hidden})),body:document.body.innerText.slice(-1500)}));
      await currentPage.screenshot({path:path.join(output,engine+'-failure-'+result.checks.length+'.png')});
      await currentPage.keyboard.press('Escape');
    } catch {}
    result.checks.push({engine,name,status:'fail',error:e.message,state});console.log('FAIL',engine,name,e.message.slice(0,220));
  }
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2));
}
async function fillCorrect(page,count=50){
  await page.evaluate(count=>{
    runde.karten.forEach((karte,i)=>karte.felder.forEach(feld=>{
      const n=eingabeZuFeld.get(feld);
      if(feld.typ==='geld'){
        const parts=n.querySelectorAll('.geld-teil');
        parts[0].value=i<count ? String(Math.floor(feld.geld.cent/100)) : '';
        parts[1].value=i<count ? String(feld.geld.cent%100) : '';
        parts.forEach(k=>k.dispatchEvent(new Event('input',{bubbles:true})));
      } else {n.value=i<count ? (feld.typ==='zeit' ? feld.zeit.stunde+':'+feld.zeit.minute : String(feld.korrekt)) : '';n.dispatchEvent(new Event('input',{bubbles:true}));}
    }));
  },count);
}
async function layout(page){return page.evaluate(()=>{
  const visible=n=>n.getClientRects().length && getComputedStyle(n).visibility!=='hidden';
  const scope=document.querySelector('.ueberlagerung:not([hidden])') || document;
  const overflow=[...scope.querySelectorAll('.ausdruck,.eingabe,.geschichte-text,.geschenk-kasten,.bereich-zeile,.verlauf,.sterne-zeile')].filter(visible).filter(n=>{
    const r=n.getBoundingClientRect();
    const card=n.closest('.aufgabe');
    return r.left < -1 || r.right>innerWidth+1 ||
      (card && r.right>card.getBoundingClientRect().right-2) || n.scrollWidth>n.clientWidth+2;
  }).map(n=>({selector:n.className,text:n.textContent.slice(0,50),right:n.getBoundingClientRect().right}));
  return {width:innerWidth,documentWidth:document.documentElement.scrollWidth,overflow};
});}

(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port+'/';
  for(const [engine,executablePath] of engines){
    if(!fs.existsSync(executablePath)){result.unavailable.push({engine,reason:'binary missing'});continue;}
    let browser;
    try{
      const profile=await chromium.launchPersistentContext(path.join(output,engine+'-profile'),{
        executablePath,headless:true,ignoreDefaultArgs:['--mute-audio'],timeout:20000});
      browser=profile.browser();
      result.engines.push({engine,version:browser.version()});
    }catch(e){result.unavailable.push({engine,reason:e.message.slice(0,700)});continue;}
    const context=await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true});
    await context.addInitScript(()=>{if(localStorage.getItem('mathe-ueben-fuer-emma')===null)localStorage.setItem('mathe-ueben-fuer-emma',JSON.stringify({sound:'aus'}));});
    const page=await context.newPage();
    currentPage=page;
    const errors=[],resourceFailures=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>resourceFailures.push({url:r.url(),error:r.failure()?.errorText}));
    page.on('response',r=>{if(r.status()>=400)resourceFailures.push({url:r.url(),status:r.status()});});
    page.setDefaultTimeout(5000);
    await page.goto(url);

    await check(engine,'keyboard, world selection, interrupted quiz and reload',async()=>{
      await page.locator('[data-modus="gabby"]').click();
      assert.equal(await page.locator('body').getAttribute('data-thema'),'gabby');
      await page.locator('#losKnopf').click();
      const first=page.locator('.bereich:not([hidden]) input').first();
      await first.fill('42');await first.press('Tab');
      assert(await page.evaluate(()=>document.activeElement.classList.contains('eingabe')));
      await page.locator('#abbruchKnopf').click();
      await page.locator('[data-modus="doozie"]').click();await page.locator('#losKnopf').click();
      assert.equal(await first.inputValue(),'42');
      assert.equal(await page.locator('body').getAttribute('data-thema'),'gabby');
      await page.reload();await page.locator('#losKnopf').click();assert.equal(await first.inputValue(),'42');
    });

    for(const [width,height] of [[375,812],[390,844],[768,1024],[1366,768],[1920,1080]]){
      await page.setViewportSize({width,height});
      await page.evaluate(()=>zeigeAbschnitt(1));
      await page.screenshot({path:path.join(output,engine+'-'+width+'-quiz.png')});
      await check(engine,'responsive quiz '+width+'x'+height,async()=>{
        const sections=[];
        for(let section=0;section<6;section++){
          await page.evaluate(n=>zeigeAbschnitt(n),section);
          const info=await layout(page);sections.push(info);
          assert(info.documentWidth<=width+1 && info.overflow.length===0,JSON.stringify({section,...info}));
        }return sections;
      });
      await page.evaluate(()=>zeigeNeuerVersuchFrage(function(){}));
      await check(engine,'responsive dialog and focus '+width,async()=>{
        assert.equal(await page.evaluate(()=>document.activeElement.id),'versuchAbbrechenKnopf');
        await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'versuchBestaetigenKnopf');
        await page.keyboard.press('Shift+Tab');assert.equal(await page.evaluate(()=>document.activeElement.id),'versuchAbbrechenKnopf');
        const info=await layout(page);assert(info.overflow.length===0,JSON.stringify(info));
      });
      await page.keyboard.press('Escape');
      assert(await page.locator('#versuchUeberlagerung').isHidden());
    }
    await page.setViewportSize({width:1366,height:768});

    await check(engine,'50 correct answers, double click, bonus and gift',async()=>{
      await fillCorrect(page);
      await page.locator('.abschnitts-punkt').last().click();await page.locator('#pruefenKnopf').dblclick();
      assert.match(await page.locator('#ergebnisKasten').innerText(),/50 von 50/);
      assert.equal(await page.locator('#uebungsBildschirm iframe').count(),0);
      assert.equal(await page.evaluate(()=>speicher.daten().runden.length),1);
      assert.equal(await page.evaluate(()=>gesamtSterne()),5);
      await page.locator('#abbruchKnopf').click();
      assert.equal(await page.locator('.themen-knopf').count(),3);
      assert.match(await page.locator('.themen-knopf[data-modus="gabby"] .thema-titel').innerText(),/Bonuswelt/);
      await page.evaluate(()=>Object.assign(speicher.daten(), {bonussterne: 2, bonusGesamt: 2}));
      await page.locator('#losKnopf').click();await fillCorrect(page,3);
      await page.locator('#pruefenKnopf').click();
      assert.equal(await page.evaluate(()=>speicher.daten().bonussterne),5);
      assert.equal(await page.evaluate(()=>speicher.daten().runden.length),2);
      await page.keyboard.press('Enter');assert(await page.locator('#geschenkUeberlagerung').isHidden());
      await page.locator('#abbruchKnopf').click();await page.locator('#sterneKnopf').click();
      await page.locator('[data-reiter="geschenke"]').click();
      assert.equal(await page.evaluate(()=>speicher.daten().geschenke.length),1);
    });

    await check(engine,'statistics CSV and backup JSON downloads',async()=>{
      await page.evaluate(()=>zeigeFortschritt('statistik'));
      const [downloaded]=await Promise.all([page.waitForEvent('download'),page.locator('#csvKnopf').click()]);
      await downloaded.saveAs(path.join(output,engine+'-statistics.csv'));
      assert(fs.readFileSync(path.join(output,engine+'-statistics.csv'),'utf8').includes('BONUSRUNDE'));
      const [json]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>sichereDatenDownload())]);
      await json.saveAs(path.join(output,engine+'-backup.json'));
      assert.equal(JSON.parse(fs.readFileSync(path.join(output,engine+'-backup.json'),'utf8')).daten.sterneGesamt,5);
    });

    await check(engine,'Spielstand sichern und auf einem zweiten Browser laden',async()=>{
      // "Alter PC": Runde spielen und den Spielstand als Datei sichern.
      const quelle=await browser.newContext({acceptDownloads:true});
      await quelle.addInitScript(()=>{if(localStorage.getItem('mathe-ueben-fuer-emma')===null)localStorage.setItem('mathe-ueben-fuer-emma',JSON.stringify({sound:'aus'}));});
      const p=await quelle.newPage();await p.goto(url);
      await p.locator('#losKnopf').click();await fillCorrect(p);
      await p.locator('.abschnitts-punkt').last().click();await p.locator('#pruefenKnopf').dblclick();

      const sterne=await p.evaluate(()=>speicher.daten().sterneGesamt);
      assert.equal(sterne,5);
      await p.locator('#sterneKnopf').click();
      await p.locator('[data-reiter="daten"]').click();
      const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#spielstandSichernKnopf').click()]);
      const datei=path.join(output,engine+'-spielstand.json');
      await download.saveAs(datei);
      assert.match(download.suggestedFilename(),/^mathe-spielstand-\d{4}-\d{2}-\d{2}\.json$/);
      const gesichert=JSON.parse(fs.readFileSync(datei,'utf8'));
      assert.equal(gesichert.format,'mathe-sicherung');
      assert.equal(gesichert.daten.sterneGesamt,5);
      await quelle.close();

      // "Neuer PC": leerer Speicher, Datei laden, Rückfrage bestätigen.
      const ziel=await browser.newContext({acceptDownloads:true});
      const q=await ziel.newPage();await q.goto(url);
      assert.equal(await q.evaluate(()=>speicher.daten().sterneGesamt),0);
      const downloads=[];q.on('download',d=>downloads.push(d.suggestedFilename()));
      await q.locator('#sterneKnopf').click();
      await q.locator('[data-reiter="daten"]').click();
      assert.match(await q.locator('#spielstandInhalt').innerText(),/0 Sterne/);
      await q.locator('#spielstandDatei').setInputFiles(datei);
      await q.locator('#frageUeberlagerung').waitFor({state:'visible',timeout:5000});
      assert.match(await q.locator('#frageText').innerText(),/5 Sterne/);
      await q.locator('#frageJaKnopf').click().catch(()=>{});
      await q.waitForTimeout(900);
      await q.reload();
      assert.equal(await q.evaluate(()=>speicher.daten().sterneGesamt),5,'Spielstand wurde nicht übernommen');
      assert.equal(await q.evaluate(()=>speicher.meldung()),'');
      assert.equal(await q.evaluate(()=>speicher.daten().runden.length),1);
      assert(downloads.some(n=>/^mathe-vor-import-/.test(n)),'Rettungssicherung vor dem Import fehlt');
      await ziel.close();
      return {sterne,rettung:downloads};
    });

    await check(engine,'Spielstände zusammenführen',async()=>{
      // Zwei getrennte "Geräte" spielen je eine andere Tagesrunde.
      async function spiele(anzahlRichtige){
        const ctx=await browser.newContext({acceptDownloads:true});
        await ctx.addInitScript(()=>{if(localStorage.getItem('mathe-ueben-fuer-emma')===null)localStorage.setItem('mathe-ueben-fuer-emma',JSON.stringify({sound:'aus'}));});
        const p=await ctx.newPage();await p.goto(url);
        await p.locator('#losKnopf').click();
        await fillCorrect(p,anzahlRichtige);
        await p.locator('.abschnitts-punkt').last().click();
        await p.locator('#pruefenKnopf').click();
        if(await p.locator('#frageUeberlagerung').isVisible())await p.locator('#frageJaKnopf').click();

        assert.equal(await p.evaluate(()=>speicher.daten().runden.length),1);
        return {ctx,p};
      }
      const A=await spiele(50);   // 5 Sterne
      const B=await spiele(25);   // 2 Sterne (50 %)
      assert.equal(await A.p.evaluate(()=>speicher.daten().sterneGesamt),5);
      assert.equal(await B.p.evaluate(()=>speicher.daten().sterneGesamt),2);

      // Gerät A sichert, Gerät B führt zusammen.
      await A.p.locator('#sterneKnopf').click();await A.p.locator('[data-reiter="daten"]').click();
      const [dl]=await Promise.all([A.p.waitForEvent('download'),A.p.locator('#spielstandSichernKnopf').click()]);
      const datei=path.join(output,engine+'-merge-A.json');await dl.saveAs(datei);
      await A.ctx.close();

      const downloads=[];B.p.on('download',d=>downloads.push(d.suggestedFilename()));
      await B.p.locator('#sterneKnopf').click();await B.p.locator('[data-reiter="daten"]').click();
      await B.p.locator('#spielstandMergeDatei').setInputFiles(datei);
      await B.p.locator('#frageUeberlagerung').waitFor({state:'visible',timeout:5000});
      assert.match(await B.p.locator('#frageText').innerText(),/1 Runde/);
      assert.match(await B.p.locator('#frageText').innerText(),/5 Sterne/);
      await B.p.locator('#frageJaKnopf').click().catch(()=>{});
      await B.p.waitForTimeout(900);
      await B.p.reload();
      assert.equal(await B.p.evaluate(()=>speicher.daten().runden.length),2,'Runden wurden nicht vereinigt');
      assert.equal(await B.p.evaluate(()=>speicher.daten().sterneGesamt),7,'Sterne wurden nicht vereinigt');
      assert.equal(await B.p.evaluate(()=>speicher.meldung()),'');
      assert(downloads.some(n=>/^mathe-vor-merge-/.test(n)),'Sicherung vor dem Zusammenführen fehlt');
      await B.ctx.close();
      return {runden:2,sterne:7,downloads};
    });

    await check(engine,'Spielstand über GitHub synchronisieren',async()=>{
      // Nachgebildete GitHub-Contents-API (kein echtes Repository).
      const github={text:null,sha:null,nummer:1};
      const cors={"access-control-allow-origin":"*",
        "access-control-allow-methods":"GET, PUT, OPTIONS",
        "access-control-allow-headers":"authorization, content-type, accept, x-github-api-version",
        "access-control-max-age":"0"};
      async function gitHub(route){
        const req=route.request(), methode=req.method();
        if(methode==='OPTIONS')return route.fulfill({status:204,headers:cors});
        const auth=req.headers()['authorization']||'';
        if(!/^Bearer \S+/.test(auth))return route.fulfill({status:401,headers:cors,contentType:'application/json',body:'{"message":"Bad credentials"}'});
        if(methode==='GET'){
          if(github.text===null)return route.fulfill({status:404,headers:cors,contentType:'application/json',body:'{}'});
          return route.fulfill({status:200,headers:cors,contentType:'application/json',
            body:JSON.stringify({content:Buffer.from(github.text,'utf8').toString('base64'),sha:github.sha})});
        }
        if(methode==='PUT'){
          const koerper=JSON.parse(req.postData()||'{}');
          if(github.text!==null && koerper.sha!==github.sha)return route.fulfill({status:409,headers:cors,contentType:'application/json',body:'{}'});
          github.text=Buffer.from(koerper.content,'base64').toString('utf8');
          github.sha='sha-'+(++github.nummer);
          return route.fulfill({status:201,headers:cors,contentType:'application/json',body:JSON.stringify({content:{sha:github.sha}})});
        }
        return route.fulfill({status:405,headers:cors,body:''});
      }
      async function geraet(){
        const ctx=await browser.newContext({acceptDownloads:true});
        await ctx.route('https://api.github.com/**',gitHub);
        await ctx.addInitScript(()=>{if(localStorage.getItem('mathe-ueben-fuer-emma')===null)localStorage.setItem('mathe-ueben-fuer-emma',JSON.stringify({sound:'aus'}));});
        const p=await ctx.newPage();await p.goto(url);
        return {ctx,p};
      }

      // Gerät A: Runde spielen und die Synchronisierung einrichten.
      const A=await geraet();
      await A.p.locator('#losKnopf').click();await fillCorrect(A.p,50);
      await A.p.locator('.abschnitts-punkt').last().click();await A.p.locator('#pruefenKnopf').dblclick();

      assert.equal(await A.p.evaluate(()=>speicher.daten().sterneGesamt),5);
      await A.p.locator('#sterneKnopf').click();await A.p.locator('[data-reiter="daten"]').click();
      assert(await A.p.locator('#syncRepo').count()===1,'Synchronisierungsfelder fehlen');
      await A.p.locator('#syncRepo').fill('kaichri/mathe-sync');
      await A.p.locator('#syncToken').fill('ghp_browsertest');
      await A.p.locator('#syncSpeichernKnopf').click();
      await A.p.waitForFunction(()=>/gespeichert|Abgeglichen/i.test(sync.status().text),null,{timeout:15000});
      assert.notEqual(github.text,null,'Gerät A hat nichts geschrieben');
      const vonA=JSON.parse(github.text);
      assert.equal(vonA.sterneGesamt,5);
      assert.equal(vonA.runden.length,1);
      // Das Token darf nicht im Spielstand landen.
      const spielstandA=await A.p.evaluate(()=>localStorage.getItem('mathe-ueben-fuer-emma'));
      assert(!spielstandA.includes('ghp_browsertest'),'Token steht im Spielstand');
      const einstA=await A.p.evaluate(()=>localStorage.getItem('mathe-ueben-sync'));
      assert(einstA.includes('ghp_browsertest'),'Token fehlt in den Sync-Einstellungen');
      await A.ctx.close();

      // Gerät B: leer, gleiche Zugangsdaten -> Start gleicht ab und übernimmt.
      const B=await geraet();
      assert.equal(await B.p.evaluate(()=>speicher.daten().sterneGesamt),0);
      await B.p.locator('#sterneKnopf').click();await B.p.locator('[data-reiter="daten"]').click();
      await B.p.locator('#syncRepo').fill('kaichri/mathe-sync');
      await B.p.locator('#syncToken').fill('ghp_browsertest');
      await B.p.locator('#syncSpeichernKnopf').click().catch(()=>{});
      await B.p.waitForTimeout(1500);
      await B.p.reload();
      assert.equal(await B.p.evaluate(()=>speicher.daten().sterneGesamt),5,'Gerät B hat den Stand nicht übernommen');
      assert.equal(await B.p.evaluate(()=>speicher.daten().runden.length),1);
      assert.equal(await B.p.evaluate(()=>speicher.meldung()),'');
      await B.ctx.close();
      return {vonA:vonA.sterneGesamt,beiB:5};
    });

    await page.evaluate(()=>{const rows=speicher.daten().runden;if(rows.length) while(rows.length<14)rows.push({...rows[0]});});
    for(const [width,height] of [[375,812],[390,844],[768,1024],[1366,768],[1920,1080]]) {
      await page.setViewportSize({width,height});
      await page.evaluate(()=>zeigeFortschritt('statistik'));
      await check(engine,'responsive statistics '+width,async()=>{const info=await layout(page);assert(info.documentWidth<=width+1 && !info.overflow.length,JSON.stringify(info));});
      await page.screenshot({path:path.join(output,engine+'-'+width+'-statistics.png')});
      await page.evaluate(()=>zeigeFortschritt('geschenke'));
      await check(engine,'responsive vouchers '+width,async()=>{const info=await layout(page);assert(info.documentWidth<=width+1 && !info.overflow.length,JSON.stringify(info));});
      await page.evaluate(()=>zeigeFortschritt('sterne'));
      await check(engine,'responsive stars '+width,async()=>{const info=await layout(page);assert(info.documentWidth<=width+1 && !info.overflow.length,JSON.stringify(info));});
      // Spielstand-Reiter mit den Synchronisierungsfeldern
      await page.evaluate(()=>zeigeFortschritt('daten'));
      await check(engine,'responsive savegame '+width,async()=>{const info=await layout(page);assert(info.documentWidth<=width+1 && !info.overflow.length,JSON.stringify(info));});
      await page.screenshot({path:path.join(output,engine+'-'+width+'-savegame.png')});
      await page.evaluate(()=>geschenkAuswahlOeffnen());
      await check(engine,'responsive gift selection '+width,async()=>{const info=await layout(page);assert(!info.overflow.length,JSON.stringify(info));});
      await page.keyboard.press('Escape');
    }

    await check(engine,'wrong answers and repetition',async()=>{
      await page.evaluate(()=>zeigeRunde(neuesTagesSet()));await fillCorrect(page,49);
      await page.locator('.abschnitts-punkt').last().click();await page.locator('#pruefenKnopf').click();
      // Eine Aufgabe ist offen: die Rückfrage muss erscheinen und bestätigt werden.
      assert.equal(await page.evaluate(()=>document.getElementById('frageUeberlagerung').hidden),false);
      assert.match(await page.locator('#frageText').innerText(),/1 von 50/);
      await page.locator('#frageJaKnopf').click();

      await page.getByRole('button',{name:'Nur diese Aufgaben noch einmal üben'}).click();
      assert.equal(await page.evaluate(()=>runde.bereichsArt),'uebungen');
      assert.equal(await page.evaluate(()=>runde.karten.length),1);
      await fillCorrect(page,1);await page.locator('#pruefenKnopf').click();
      assert.match(await page.locator('#ergebnisKasten').innerText(),/1 von 1/);
      // Wiederholungsrunde: eine richtige Aufgabe = genau ein Stern.
      assert.match(await page.locator('#ergebnisKasten').innerText(),/1 Stern/);

    });

    await check(engine,'two windows cannot silently overwrite an earned round',async()=>{
      const shared=await browser.newContext();const a=await shared.newPage(),b=await shared.newPage();
      await a.goto(url);await b.goto(url);
      await a.evaluate(()=>{speicher.daten().sound='aus';musik.umschalten();});
      await a.locator('#losKnopf').click();await fillCorrect(a);
      await a.locator('.abschnitts-punkt').last().click();await a.locator('#pruefenKnopf').click();
      const before=await a.evaluate(()=>JSON.parse(localStorage.getItem(SPEICHER_NAME)).sterneGesamt);
      await b.locator('[data-modus="gabby"]').click();
      const after=await a.evaluate(()=>JSON.parse(localStorage.getItem(SPEICHER_NAME)).sterneGesamt);
      const warned=await b.locator('#speicherHinweis').isVisible();
      await shared.close();
      assert.equal(after,before,'second window overwrote lifetime stars');assert(warned,'missing conflict warning');
    });

    await check(engine,'no application exceptions and all core local resources load',async()=>{
      assert.deepEqual(errors,[]);
      const core=resourceFailures.filter(r=>r.url.startsWith(url));
      assert.deepEqual(core,[]);return {externalFailures:resourceFailures.filter(r=>!r.url.startsWith(url))};
    });

    await check(engine,'real MP3 decoding and Doozie fallback',async()=>{
      const mediaContext=await browser.newContext();const p=await mediaContext.newPage();
      await p.goto(url);
      await p.locator('#losKnopf').click();
      await p.waitForFunction(()=>document.getElementById('musikKnopf').getAttribute('aria-pressed')==='true');
      // Audio is intentionally detached from the DOM; observe the real elements without replacing them.
      await mediaContext.close();
      const observed=await browser.newContext();
      await observed.addInitScript(()=>{
        window.qaContexts=[];window.qaTones=0;
        const NativeContext=window.AudioContext;
        if(NativeContext)window.AudioContext=class extends NativeContext{
          constructor(...args){super(...args);qaContexts.push(this);}
          createOscillator(){const n=super.createOscillator(),start=n.start.bind(n);n.start=function(...args){qaTones++;return start(...args);};return n;}
        };
        window.qaAudio=[];window.qaRejections=[];const original=document.createElement.bind(document);
        document.createElement=function(tag,...args){const n=original(tag,...args);if(tag==='audio'){
          window.qaAudio.push(n);const play=n.play.bind(n);
          n.play=function(){const p=play();p?.catch(e=>qaRejections.push(e.name));return p;};
        }return n;};
      });
      const q=await observed.newPage();
      await q.goto(url);
      let autoplayRejected=false;
      try{await q.waitForFunction(()=>qaRejections.includes('NotAllowedError'),{},{timeout:2000});autoplayRejected=true;}
      catch{result.unavailable.push({engine:engine+' autoplay rejection',reason:'Browser did not reject initial playback under its active policy.'});}
      await q.locator('#losKnopf').click();
      await q.waitForFunction(()=>qaAudio.some(a=>!a.paused && a.currentTime>0.2),{},{timeout:10000});
      if(autoplayRejected)assert.equal(await q.evaluate(()=>qaAudio.length),1);
      const active=await q.evaluate(()=>qaAudio.filter(a=>!a.paused).length);assert.equal(active,1);
      await q.evaluate(()=>setzeModus('doozie'));
      await q.waitForFunction(()=>qaAudio.some(a=>a.src.endsWith('doozie.mp3') && !a.paused && a.currentTime>0.2),{},{timeout:10000});
      await observed.route('**/musik/doozie.mp3',route=>route.fulfill({status:404,body:''}));
      await q.evaluate(()=>{setzeModus('bluey');setzeModus('doozie');});
      await q.waitForFunction(()=>qaAudio.some(a=>a.src.endsWith('puppenhaus.mp3') && !a.paused && a.currentTime>0.2),{},{timeout:10000});
      assert.equal(await q.evaluate(()=>qaAudio.filter(a=>!a.paused).length),1);
      const audio=await q.evaluate(()=>qaAudio.map(a=>({src:a.src,paused:a.paused,currentTime:a.currentTime,readyState:a.readyState,error:a.error?.code})));
      // Real media failures injected only into this isolated context; original files stay untouched.
      await observed.route('**/musik/*.mp3',route=>route.fulfill({status:404,body:''}));
      await q.evaluate(()=>setzeModus('bluey'));await q.locator('#kopfName').click();
      await q.waitForFunction(()=>qaTones>0&&qaContexts.some(c=>c.state==='running'),{},{timeout:4000});
      const syntheticFallback=await q.evaluate(()=>({tones:qaTones,contexts:qaContexts.map(c=>c.state)}));
      await observed.close();return {audio,autoplayRejected,syntheticFallback};
    });

    await check(engine,'local MP4 assets decode and SVG symbol references exist',async()=>{
      const assets=await browser.newContext();
      await assets.addInitScript(()=>localStorage.setItem('mathe-ueben-fuer-emma',JSON.stringify({sound:'aus'})));
      const p=await assets.newPage();await p.goto(url);
      const broken=await p.evaluate(()=>[...document.querySelectorAll('use')].map(n=>n.getAttribute('href')).filter(ref=>ref?.startsWith('#')&&!document.getElementById(ref.slice(1))));
      assert.deepEqual(broken,[]);
      const videos=[];
      for(const file of ['blau.mp4','puppenhaus.mp4']){
        await p.evaluate(file=>{const old=document.querySelector('video');old?.remove();const v=document.createElement('video');v.muted=true;v.src='musik/'+file;document.body.appendChild(v);v.play().catch(()=>{});},file);
        await p.waitForFunction(()=>document.querySelector('video').currentTime>0.2,{},{timeout:10000});
        videos.push(await p.evaluate(()=>{const v=document.querySelector('video');return{src:v.src,width:v.videoWidth,height:v.videoHeight,duration:v.duration,readyState:v.readyState};}));
      }
      await assets.close();return videos;
    });

    await check(engine,'text contrast samples across all three worlds',async()=>{
      const samples=[];
      for(const world of ['bluey','gabby','doozie']){
        await page.evaluate(world=>{setzeModus(world);zeigeFortschritt('sterne');},world);
        samples.push(...await page.evaluate(world=>{
          const rgb=s=>{const a=s.match(/[\d.]+/g)?.map(Number)||[0,0,0,0];return[a[0],a[1],a[2],a[3]??1];};
          const mix=(a,b,t)=>a.slice(0,3).map((v,i)=>v*t+b[i]*(1-t));
          function background(n){if(!n)return[255,255,255];const parent=background(n.parentElement),c=rgb(getComputedStyle(n).backgroundColor);return mix(c,parent,c[3]);}
          const lum=c=>c.map(v=>{v/=255;return v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[0.2126,0.7152,0.0722][i],0);
          return ['#musikKnopf','.meilenstein.leer','.sterne-summe','.reiter.aktiv','.kopf-zeile'].map(selector=>{
            const n=document.querySelector(selector),s=getComputedStyle(n);let fg=rgb(s.color).slice(0,3),bg=background(n);
            let fade=n;while(fade&&Number(getComputedStyle(fade).opacity)===1)fade=fade.parentElement;
            if(fade){const outer=background(fade.parentElement),alpha=Number(getComputedStyle(fade).opacity);fg=mix(fg,outer,alpha);bg=mix(bg,outer,alpha);}
            const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05);
            const size=parseFloat(s.fontSize),bold=parseFloat(s.fontWeight)>=700;
            return{world,selector,ratio,required:size>=24 || (bold&&size>=18.666) ? 3 : 4.5};
          });
        },world));
      }
      const failed=samples.filter(s=>s.ratio<s.required);
      assert.deepEqual(failed,[],JSON.stringify(failed));return samples;
    });

    await check(engine,'touch emulation and visible keyboard focus',async()=>{
      const touch=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true});
      const p=await touch.newPage();await p.goto(url);
      await p.locator('[data-modus="gabby"]').tap();await p.locator('#losKnopf').tap();
      assert.equal(await p.evaluate(()=>runde.welt),'gabby');
      const field=p.locator('.bereich:not([hidden]) input').first();await field.tap();await field.fill('7');await field.press('Tab');
      const focus=await p.evaluate(()=>{const n=document.activeElement,s=getComputedStyle(n);return {tag:n.tagName,outline:s.outlineStyle,width:s.outlineWidth,shadow:s.boxShadow};});
      assert(focus.outline!=='none' || focus.shadow!=='none');
      const sizes=await p.locator('.abschnitts-punkt').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height})));
      await touch.close();return {focus,sizes};
    });

    await check(engine,'keyboard-only quiz, evaluation, restart cancellation and gift selection',async()=>{
      const keys=await browser.newContext();
      await keys.addInitScript(()=>localStorage.setItem('mathe-ueben-fuer-emma',JSON.stringify({sound:'aus'})));
      const p=await keys.newPage();await p.goto(url);
      async function target(selector,activate=true){
        for(let i=0;i<100;i++){
          if(await p.evaluate(selector=>document.activeElement.matches(selector),selector)){
            if(activate)await p.keyboard.press('Enter');return;
          }
          await p.keyboard.press('Tab');
        }
        throw new Error('Keyboard could not reach '+selector);
      }
      await target('[data-modus="gabby"]');await target('#losKnopf');
      await target('.bereich:not([hidden]) input',false);await p.keyboard.type('7');
      for(let section=0;section<6;section++)await target('#pruefenKnopf');
      // Fast leere Runde: die Rückfrage muss erscheinen und per Tastatur bestätigbar sein.
      assert.equal(await p.evaluate(()=>document.getElementById('frageUeberlagerung').hidden),false,'Rückfrage vor dem Abgeben fehlt');
      assert.equal(await p.evaluate(()=>document.activeElement.id),'frageNeinKnopf','Fokus muss auf "Abbrechen" liegen');
      await target('#frageJaKnopf');
      assert.equal(await p.evaluate(()=>fertigAnsicht),true);
      assert.equal(await p.evaluate(()=>speicher.daten().runden.length),1);
      assert.match(await p.locator('#rueckmeldung').textContent(),/von 50/);
      await target('#neuKnopf');
      assert.equal(await p.evaluate(()=>document.activeElement.id),'versuchAbbrechenKnopf');
      await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'neuKnopf');
      await target('#sterneKnopf');await target('[data-reiter="geschenke"]');
      await keys.close();
    });

    await check(engine,'file protocol smoke test',async()=>{
      const isolated=await browser.newContext();const p=await isolated.newPage();const failures=[];p.on('pageerror',e=>failures.push(e.message));
      await p.goto(pathToFileURL(path.join(root,'index.html')).href);await p.locator('#losKnopf').click();
      assert.equal(await p.locator('.bereich:not([hidden]) input').count(),10);assert.deepEqual(failures,[]);await isolated.close();
    });

    await context.close();await browser.close();
  }
  for(const [engine,type] of [['Firefox',firefox],['Safari',webkit]]) result.unavailable.push({engine,reason:engine==='Safari' ? 'Safari is not available on Windows; WebKit is not Safari.' : 'No installed Firefox or bundled Playwright Firefox binary.'});
  fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(result,null,2));
  console.log('RESULTS',path.join(output,'browser-results.json'));
  console.log(JSON.stringify({pass:result.checks.filter(c=>c.status==='pass').length,fail:result.checks.filter(c=>c.status==='fail').length,unavailable:result.unavailable}));
  server.close();process.exitCode=result.checks.some(c=>c.status==='fail') ? 1 : 0;
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
