"use strict";
/* =========================================================================
   Tests für die automatische Synchronisierung über GitHub.

   Die GitHub-API wird nachgebildet (GET/PUT auf eine Datei, sha-Prüfung,
   401/403/404/409, Netzfehler). Es wird nie ein echtes Repository berührt.
   ========================================================================= */

const test = require("node:test");
const assert = require("node:assert/strict");
const { game } = require("./phase3-helper.cjs");

const JETZT = "2026-10-31T12:00:00Z";
const plain = v => JSON.parse(JSON.stringify(v));

function runde(zeit, sterne) {
  return { zeit: zeit, datum: zeit.slice(0, 10), uhrzeit: "12:00", richtig: sterne, gesamt: 5, modus: "bluey", bonus: true, bonusRichtig: sterne, bereiche: {} };
}
function spielstand(teile) {
  return Object.assign({ version: 3, modus: "bluey", runden: [], zuletzt: [],
    knobelZuletzt: [], tagesSet: null, vortagSchluessel: [], bonusStufenOffen: [], bonusGesamt: 0,
    geschenke: [], bereichPunkte: {}, sound: "aus", bonusTag: null, bonusWelten: [] }, teile || {});
}

function antwort(status, koerper) {
  return { status: status, ok: status >= 200 && status < 300, json: async () => koerper };
}

/* Nachgebildete GitHub-Contents-API für genau eine Datei. */
function fakeGithub(start) {
  const zustand = {
    text: start && start.text !== undefined ? start.text : null,
    sha: start && start.text !== undefined ? "sha-1" : null,
    nummer: 1
  };
  const aufrufe = [];
  const steuerung = { netzfehler: false, ungueltig: false, konfliktEinmal: false };
  async function fetchFn(url, init) {
    const methode = (init && init.method) || "GET";
    const kopf = (init && init.headers) || {};
    aufrufe.push({ methode: methode, url: String(url), body: init && init.body, kopf: kopf });
    if (steuerung.netzfehler) { throw new TypeError("Failed to fetch"); }
    const auth = kopf.Authorization || kopf.authorization || "";
    if (!/^Bearer \S+/.test(auth)) { return antwort(401, { message: "Bad credentials" }); }
    if (steuerung.ungueltig) { return antwort(403, { message: "Resource not accessible" }); }
    if (methode === "GET") {
      if (zustand.text === null) { return antwort(404, { message: "Not Found" }); }
      return antwort(200, {
        content: Buffer.from(zustand.text, "utf8").toString("base64"),
        sha: zustand.sha
      });
    }
    if (methode === "PUT") {
      const koerper = JSON.parse(init.body || "{}");
      if (steuerung.konfliktEinmal) {
        // Jemand anderes schreibt genau zwischen Lesen und Schreiben.
        steuerung.konfliktEinmal = false;
        zustand.text = JSON.stringify(spielstand({ bonusGesamt: 3,
          runden: [runde("2026-10-29T09:00:00.000Z", 3)] }));
        zustand.sha = "sha-" + (++zustand.nummer);
        return antwort(409, { message: "sha does not match" });
      }
      if (zustand.text !== null && koerper.sha !== zustand.sha) {
        return antwort(409, { message: "sha does not match" });
      }
      zustand.text = Buffer.from(String(koerper.content || ""), "base64").toString("utf8");
      zustand.sha = "sha-" + (++zustand.nummer);
      return antwort(201, { content: { sha: zustand.sha } });
    }
    return antwort(405, {});
  }
  return { fetch: fetchFn, zustand: zustand, aufrufe: aufrufe, steuerung: steuerung };
}

function verbinde(g, extra) {
  g.run("sync.speichere(" + JSON.stringify(Object.assign({
    repo: "kaichri/mathe-sync", datei: "spielstand.json", token: "ghp_test", aktiv: true
  }, extra || {})) + ")");
}
function spielMit(fake, teile, optionen) {
  const g = game(spielstand(teile), Object.assign({ now: JETZT }, optionen || {}));
  g.window.fetch = fake.fetch;
  verbinde(g);
  return g;
}
async function tick() {
  for (let i = 0; i < 8; i++) { await new Promise(r => setImmediate(r)); }
}

/* ---------------------------------------------------------- Einrichtung */

test("SYNC: Zugangsdaten liegen getrennt vom Spielstand", () => {
  const fake = fakeGithub();
  const g = spielMit(fake, {});
  assert.doesNotMatch(g.run("JSON.stringify(speicher.sicherung())"), /ghp_test/,
    "Das Token darf nicht im Export stehen");
  assert.doesNotMatch(g.raw(), /ghp_test/, "Das Token darf nicht im Spielstand stehen");
  assert.match(g.syncDaten(), /ghp_test/, "Das Token muss lokal gespeichert sein");
  assert.equal(g.run("sync.istKonfiguriert()"), true);
});

test("SYNC: 'Synchronisierung entfernen' löscht die Zugangsdaten", () => {
  const fake = fakeGithub();
  const g = spielMit(fake, {});
  g.run("sync.vergessen()");
  assert.equal(g.syncDaten(), undefined);
  assert.equal(g.run("sync.istKonfiguriert()"), false);
});

/* ------------------------------------------------------------- Schreiben */

test("SYNC: erster Abgleich legt die Datei an", async () => {
  const fake = fakeGithub();
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  const ergebnis = await g.run("sync.schieben({erzwingen:true})");
  assert.equal(ergebnis.ok, true, JSON.stringify(ergebnis));
  assert.equal(fake.aufrufe.filter(a => a.methode === "PUT").length, 1);
  const gespeichert = JSON.parse(fake.zustand.text);
  assert.equal(gespeichert.bonusGesamt, 5);
  assert.equal(gespeichert.runden.length, 1);
  assert.match(fake.aufrufe[0].kopf.Authorization, /^Bearer ghp_test$/);
});

test("SYNC: Umlaute und Emoji überstehen die Base64-Kodierung", () => {
  const g = spielMit(fakeGithub(), {});
  const text = "Grüße – 🎁 „Ärger“ über Öl";
  assert.equal(g.run("base64Dekodiere(base64Kodiere(" + JSON.stringify(text) + "))"), text);
  assert.equal(g.run("base64Dekodiere(base64Kodiere(''))"), "");
});

/* ---------------------------------------------------------------- Ziehen */

test("SYNC: Start holt den Serverstand und vereinigt ihn ohne Verlust", async () => {
  const fake = fakeGithub({ text: JSON.stringify(spielstand({ bonusGesamt: 3,
    runden: [runde("2026-10-29T09:00:00.000Z", 3)] })) });
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  await g.run("sync.starten()");
  assert.equal(g.reloads(), 1, "Nach dem Übernehmen muss neu geladen werden");
  assert.equal(g.saved().runden.length, 2);
  assert.equal(g.saved().bonusGesamt, 8);
});

test("SYNC: sind beide gleich, wird nicht neu geladen", async () => {
  const lokal = spielstand({ bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  const fake = fakeGithub({ text: JSON.stringify(lokal) });
  const g = spielMit(fake, plain(lokal));
  await g.run("sync.starten()");
  assert.equal(g.reloads(), 0);
  assert.equal(g.saved().runden.length, 1);
});

test("SYNC: zweimal starten ändert nichts mehr", async () => {
  const fake = fakeGithub({ text: JSON.stringify(spielstand({ bonusGesamt: 3,
    runden: [runde("2026-10-29T09:00:00.000Z", 3)] })) });
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  await g.run("sync.starten()");
  const g2 = game(g.saved(), { now: JETZT });
  g2.window.fetch = fake.fetch;
  verbinde(g2);
  await g2.run("sync.starten()");
  assert.equal(g2.reloads(), 0);
  assert.equal(g2.saved().bonusGesamt, 8);
});

test("SYNC: beim Schreiben geht der Serverstand nicht verloren", async () => {
  const fake = fakeGithub({ text: JSON.stringify(spielstand({ bonusGesamt: 3,
    runden: [runde("2026-10-29T09:00:00.000Z", 3)] })) });
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  await g.run("sync.schieben({erzwingen:true})");
  const server = JSON.parse(fake.zustand.text);
  assert.equal(server.runden.length, 2, "Der Server muss beide Runden enthalten");
  assert.equal(server.bonusGesamt, 8);
  // Die laufende Sitzung bleibt unangetastet (kein stiller Zustandswechsel).
  assert.equal(g.data().runden.length, 1);
  assert.equal(g.reloads(), 0);
});

/* -------------------------------------------------------------- Konflikte */

test("SYNC: 409 wird durch erneutes Zusammenführen gelöst", async () => {
  const fake = fakeGithub();
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  await g.run("sync.schieben({erzwingen:true})");

  const g2 = game(g.saved(), { now: JETZT });
  g2.window.fetch = fake.fetch;
  verbinde(g2);
  fake.steuerung.konfliktEinmal = true;
  const ergebnis = await g2.run("sync.schieben({erzwingen:true})");
  assert.equal(ergebnis.ok, true, JSON.stringify(ergebnis));
  assert.equal(fake.aufrufe.filter(a => a.methode === "PUT").length >= 2, true,
    "Nach dem Konflikt muss erneut geschrieben werden");
  const nachher = JSON.parse(fake.zustand.text);
  assert.equal(nachher.runden.length, 2, "Beide Runden müssen im Serverstand sein");
  assert.equal(nachher.bonusGesamt, 8);
});

/* ---------------------------------------------------------------- Fehler */

test("SYNC: ungültiges Token meldet einen Fehler und ändert nichts", async () => {
  const fake = fakeGithub();
  fake.steuerung.ungueltig = true;
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  const vorher = g.raw();
  const ergebnis = await g.run("sync.jetzt()");
  assert.equal(ergebnis.ok, false);
  assert.match(g.run("sync.status().text"), /lehnt den Zugang ab/);
  assert.equal(g.raw(), vorher);
  assert.equal(g.reloads(), 0);
});

test("SYNC: Netzfehler meldet einen Fehler und ändert nichts", async () => {
  const fake = fakeGithub();
  fake.steuerung.netzfehler = true;
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  const vorher = g.raw();
  const ergebnis = await g.run("sync.jetzt()");
  assert.equal(ergebnis.ok, false);
  assert.match(g.run("sync.status().text"), /Keine Verbindung zu GitHub/);
  assert.equal(g.raw(), vorher);
});

test("SYNC: leerer Server wird beim ersten Schreiben angelegt", async () => {
  const fake = fakeGithub();
  const g = spielMit(fake, { bonusGesamt: 5, runden: [runde("2026-10-30T09:00:00.000Z", 5)] });
  await g.run("sync.starten()");
  assert.equal(g.reloads(), 0);
  assert.equal(JSON.parse(fake.zustand.text).bonusGesamt, 5);
});

/* -------------------------------------------------------------- Auslöser */

test("SYNC: Abschluss einer Runde stößt das Schreiben an", async () => {
  const fake = fakeGithub();
  const g = spielMit(fake, {});
  await g.run("sync.schieben({erzwingen:true})");
  const vorher = fake.aufrufe.length;

  g.run("speichernRunde(50, 50, {}, 0, false)");
  g.flush();
  await tick();
  assert(fake.aufrufe.length > vorher, "Nach dem Abschluss muss geschrieben werden");
});

test("SYNC: Tippen plant nur einen Schreibvorgang", async () => {
  const fake = fakeGithub();
  const g = spielMit(fake, {});
  await g.run("sync.schieben({erzwingen:true})");
  const vorher = fake.aufrufe.length;

  g.run("speicher.daten().bonusGesamt = 9; speicher.speichere()");
  g.run("sync.nachAenderung(false); sync.nachAenderung(false); sync.nachAenderung(false)");
  g.flush();
  await tick();
  // Genau ein GET und ein PUT für drei ausgelöste Änderungen.
  assert.equal(fake.aufrufe.length - vorher, 2,
    "Drei Änderungen dürfen nur einen Abgleich auslösen: " + JSON.stringify(fake.aufrufe.slice(vorher)));
});

test("SYNC: nicht eingerichtet passiert nichts", async () => {
  const fake = fakeGithub();
  const g = game(spielstand({}), { now: JETZT });
  g.window.fetch = fake.fetch;
  assert.equal(g.run("sync.istKonfiguriert()"), false);
  await g.run("sync.starten()");
  const ergebnis = await g.run("sync.schieben()");
  assert.equal(ergebnis.uebersprungen, true);
  assert.equal(fake.aufrufe.length, 0);
});
