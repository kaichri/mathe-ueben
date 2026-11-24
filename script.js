/* =========================================================
   script.js – verbindet alles miteinander
   Hier kannst du unten bei SPIELERIN den Namen ändern
   und bei EINSTELLUNGEN / GESCHENKE alles verstellen.
   ========================================================= */

"use strict";

/* ------------- Name und Einstellungen ------------- */

const SPIELERIN = "Emma";

/* Programmversion für den Reiter „Version" in den Einstellungen; Historie im README. */
const APP_VERSION = "1.3.3";
const VERSION_STAND = "24. November 2026";

const EINSTELLUNGEN = {
  divisionMitRestAktiv: true, // true = 4 Divisionen mit Rest, false = ohne Rest
  geschichtenAnzahl: 5,
  merkzettelGroesse: 12,      // so viele letzte Geschichte-Merkmale merkt sich das Programm
  knobelMerken: 9,            // so viele letzte Knobelaufgaben merkt es sich
  bonusSterneProTag: 5,
  bonusAbAnteil: 0.9,
  hintergrundMusikAn: true,   // Standard, falls noch nichts gespeichert ist
  musikLautstaerke: 0.3,      // 0 = stumm, 1 = voll (Vielfaches des Regler-Schritts 5 %)
  syncVerzoegerungMs: 60000,  // beim Tippen höchstens einmal pro Minute zu GitHub
  spaessig: true,             // Maskottchen, Sprünge und Sternenregen an?
  zeigerSpur: true            // kleine Welt-Symbole folgen der Maus?
};

/* Die Standard-Gutscheine – Mama & Papa können die Liste auch direkt in den Einstellungen anpassen. */
const GESCHENKE = [
  { text: "Gemütlicher Familien-Filmabend mit Popcorn" },
  { text: "2 Stunden Videospiele spielen oder Lieblingsserie schauen" },
  { text: "Dein Lieblingsessen zu Hause oder ein Besuch im Restaurant" },
  { text: "Ein toller Familien-Ausflug nach deinem Wunsch" },
  { text: "Ein kleines Geschenk selbst aussuchen" },
  { text: "Eigener Wunsch – schreib deine Idee selbst auf!", freitext: true }
];

/* Migration früherer Standard-Gutscheine auf die neue Wunschliste.
   Wünsche ohne passenden Ersatz werden als „Eigener Wunsch“ samt altem Text erhalten. */
const ALT_GUTSCHEIN_ZUORDNUNG = {
  "Filmabend mit Popcorn": "Gemütlicher Familien-Filmabend mit Popcorn",
  "90 Minuten Film oder Serie anschauen": "2 Stunden Videospiele spielen oder Lieblingsserie schauen",
  "90 Minuten Videospiel spielen": "2 Stunden Videospiele spielen oder Lieblingsserie schauen",
  "Ein Geschenk für 2 €": "Ein kleines Geschenk selbst aussuchen",
  "Zwei Nächte mit Mama oder Papa schlafen": "Eigener Wunsch: Zwei Nächte mit Mama oder Papa schlafen",
  "Wunsch frei – such dir etwas aus und sag es Mama!": "Eigener Wunsch"
};

const SPEICHER_NAME = "mathe-ueben-fuer-emma";

/* Deutsch üben & Extra-Themen (laden vor script.js). */
const SPRECHTRAINING = window.SPRECHTRAINING;
const MATHE_THEMEN = window.MATHE_THEMEN;
const DEUTSCH_UEBUNGEN = window.DEUTSCH_UEBUNGEN;

const BONUS_STUFEN_SCHRITT = 25;
const MEILENSTEINE = [
  { figur: "hund", motiv: "motiv-ballons", text: "So hoch wie ein Keepy-Uppy-Sprung!" },
  { figur: "kittyFee", motiv: "spur-glitzer", text: "Kitty Fee streut Glitzer für dich." },
  { figur: "hund", motiv: "meilenstein-diamant", text: "Diamond Bluey! Du bist eine Mathe-Heldin." },
  { figur: "panda", motiv: "meilenstein-pokal", text: "Pandy-Pokal für dich!" },
  { figur: "bandit", motiv: "meilenstein-hut", text: "Bandit zieht den Hut vor dir." }
];

function naechsteBonusStufe(sterne) {
  return (Math.floor(sterne / BONUS_STUFEN_SCHRITT) + 1) * BONUS_STUFEN_SCHRITT;
}

function bonusGutscheinId(stufe) { return "bonus-stufe-" + stufe; }

function offeneStufenOhneGutschein(stufen, geschenke) {
  const kennungen = new Set(geschenke.map(g => g.id));
  return Array.from(new Set(stufen)).filter(stufe => !kennungen.has(bonusGutscheinId(stufe)))
    .sort((a, b) => a - b);
}

const BEREICH_NAMEN = {
  add: "Addition",
  sub: "Subtraktion",
  mul: "Multiplikation",
  div: "Division",
  raetsel: "Zahlenrätsel",
  geschichte: "Rechengeschichten"
};

const ZEITBEREICHE = { ...BEREICH_NAMEN, wiederholung: "Wiederholung", bonus: "Bonuswelt" };

function gueltigeUebezeiten(zeiten) {
  return zeiten && typeof zeiten === "object" && !Array.isArray(zeiten) &&
    Object.entries(zeiten).every(function ([bereich, ms]) {
      return Object.prototype.hasOwnProperty.call(ZEITBEREICHE, bereich) &&
        Number.isSafeInteger(ms) && ms >= 0;
    });
}

function uebezeitSumme(zeiten) {
  return Object.values(zeiten || {}).reduce((summe, ms) => summe + ms, 0);
}

/* ------------- Speicher (Sterne, Bonussterne, Gutscheine, Merkzettel) ------ */

function geschenkIstTauschbar(geschenk) {
  return !geschenk.eingeloestAm;
}

/* Alte Standard-Wünsche werden einmalig auf die neue Wunschliste umgestellt
   (ohne Match als „Eigener Wunsch: <alter Wunsch>“). Individuelle Texte bleiben unberührt. */
function migriereAltGutscheinText(geschenke) {
  return geschenke.map(function (geschenk) {
    if (!geschenk || !Object.prototype.hasOwnProperty.call(ALT_GUTSCHEIN_ZUORDNUNG, geschenk.text)) {
      return geschenk;
    }
    const kopie = { ...geschenk, text: ALT_GUTSCHEIN_ZUORDNUNG[geschenk.text] };
    if (!kopie.id || kopie.id.startsWith("alt-")) {
      kopie.urspruenglicherWunsch = geschenk.urspruenglicherWunsch ?? geschenk.text;
    }
    return kopie;
  });
}

/* Frühere Umtausche haben einen Nachfolger angelegt. Dessen Wunsch und
   Einlösestatus gehören jetzt wieder zum Gutschein am ursprünglichen Platz. */
function migriereGutscheinUmtausch(geschenke) {
  const nachfolger = new Map();
  geschenke.forEach(function (geschenk) {
    if (!geschenk.umgetauschtVon) { return; }
    const gruppe = nachfolger.get(geschenk.umgetauschtVon) || [];
    gruppe.push(geschenk);
    nachfolger.set(geschenk.umgetauschtVon, gruppe);
  });
  const verbindungen = new Map();
  const ersatzEintraege = new Set();
  geschenke.forEach(function (geschenk) {
    if (!geschenk.id || !geschenk.umgetauschtAm) { return; }
    const kandidaten = (nachfolger.get(geschenk.id) || []).filter(g => g !== geschenk);
    const passend = kandidaten.filter(g => g.text === geschenk.neuerText);
    const ersatz = passend.length === 1 ? passend[0] : kandidaten.length === 1 ? kandidaten[0] : null;
    if (ersatz) {
      verbindungen.set(geschenk, ersatz);
      ersatzEintraege.add(ersatz);
    }
  });
  const entfernt = new Set();
  const repariert = new Map();
  geschenke.forEach(function (original) {
    if (ersatzEintraege.has(original) || !original.umgetauschtAm) { return; }
    const gutschein = { ...original };
    if (!gutschein.id || gutschein.id.startsWith("alt-")) {
      gutschein.urspruenglicherWunsch = original.urspruenglicherWunsch ?? original.text;
    }
    let aktuell = original;
    while (aktuell.umgetauschtAm) {
      const ersatz = verbindungen.get(aktuell);
      gutschein.text = ersatz ? ersatz.text : aktuell.neuerText || aktuell.text;
      gutschein.wunschGeaendertAm = ersatz && ersatz.zeitpunkt ||
        aktuell.umgetauschtAm + "T00:00:00.000Z";
      if (!ersatz || entfernt.has(ersatz)) { break; }
      entfernt.add(ersatz);
      if (ersatz.eingeloestAm) { gutschein.eingeloestAm = ersatz.eingeloestAm; }
      aktuell = ersatz;
    }
    delete gutschein.umgetauschtAm;
    delete gutschein.umgetauschtVon;
    delete gutschein.neuerText;
    repariert.set(original, gutschein);
  });
  return geschenke.filter(g => !entfernt.has(g)).map(g => repariert.get(g) || g);
}

const speicher = (function () {
  let originalRoh = null;
  let gesperrt = false;
  let meldung = "";
  let letzterStand = null;
  let schreibTimer = null;
  let daten = {
    version: 3, modus: "bluey", deutschWelt: "hunde", runden: [], zuletzt: [],
    knobelZuletzt: [], // die letzten Knobelaufgaben – damit nicht bald dasselbe Rätsel kommt
    bonusSet: null,
    tagesSet: null,    // { datum, welt, fertig, runde, antworten, abschnitt } – das heutige Quiz
    vortagSchluessel: [], // die Aufgaben von gestern: nur zum Ausschluss beim Bauen
    bonusGesamt: 0, bonusStufenOffen: [], geschenke: [], bereichPunkte: {}, sound: null,
    wunschListe: null,          // null = Standard-GESCHENKE; sonst Array von { text, freitext? }
    wunschListeZeit: 0,         // Zeitstempel (ms) der letzten Wunschlisten-Änderung für Abgleich
    bonusTag: null,     // { datum, verteilt } – wie viele Bonussterne heute schon vergeben sind
    bonusWelten: [],    // ["bluey", ...] – welche Bonuswelten sind heute schon offen
    vorleseStimme: null,        // null = Standard ("thorsten"); "thorsten", "ramona" oder "system"
    vorleseSystemStimme: null,  // voiceURI der gewählten Systemstimme (falls vorleseStimme === "system")
    stimmeLautstaerke: null,    // 0 bis 1; null = voll (1)
    musikLautstaerke: null      // 0 bis 1; null = EINSTELLUNGEN.musikLautstaerke
  };
  function bereinige(geladen) {
    function objekt(wert) { return wert !== null && typeof wert === "object" && !Array.isArray(wert); }
    function zahl(wert) { return Number.isSafeInteger(wert) && wert >= 0; }
    function problem() {
      gesperrt = true;
      meldung = "Ein Teil deiner gespeicherten Daten konnte nicht gelesen werden. Die alten Daten bleiben geschützt. Bitte sichere sie mit Mama oder Papa.";
    }
    if (!objekt(geladen)) { problem(); return {}; }
    /* Ein gültiges JSON-Objekt ohne ein einziges bekanntes Feld ist kein
       Spielstand (z. B. "runde" statt "runden"): nicht als leerer Stand
       behandeln, sondern wie beschädigte Daten schützen. */
    const BEKANNTE_FELDER = ["version", "sterneGesamt", "modus", "deutschWelt", "runden", "zuletzt",
      "knobelZuletzt", "tagesSet", "bonusSet", "vortagSchluessel", "bonussterne", "bonusGesamt",
      "geschenke", "wunschListe", "wunschListeZeit", "bereichPunkte", "sound", "bonusTag", "bonusWelten",
      "bonusStufenOffen", "vorleseStimme", "vorleseSystemStimme", "stimmeLautstaerke", "musikLautstaerke"];
    if (!BEKANNTE_FELDER.some(function (name) {
      return Object.prototype.hasOwnProperty.call(geladen, name);
    })) {
      problem();
      return {};
    }
    if (geladen.version !== undefined && ![1, 2, 3].includes(geladen.version)) { problem(); }
    const neu = Object.assign(Object.create(null), geladen);
    function datum(wert) {
      return typeof wert === "string" && /^\d{4}-\d{2}-\d{2}$/.test(wert) &&
        Number.isFinite(Date.parse(wert + "T12:00:00Z")) &&
        new Date(wert + "T12:00:00Z").toISOString().slice(0, 10) === wert;
    }
    function liste(name, gueltig) {
      if (neu[name] === undefined) { return; }
      if (!Array.isArray(neu[name])) { problem(); neu[name] = []; return; }
      neu[name] = neu[name].filter(function (wert) {
        if (gueltig(wert)) { return true; }
        problem(); return false;
      });
    }
    function optionaleTexte(wert, namen) {
      return namen.every(function (name) { return wert[name] === undefined || typeof wert[name] === "string"; });
    }
    function punkte(wert) {
      return objekt(wert) && Object.keys(wert).every(function (name) {
        const p = wert[name];
        return Object.prototype.hasOwnProperty.call(BEREICH_NAMEN, name) && objekt(p) &&
          zahl(p.richtig) && zahl(p.gesamt) && p.richtig <= p.gesamt;
      });
    }
    liste("runden", function (r) {
      return objekt(r) && optionaleTexte(r, ["zeit", "datum", "uhrzeit", "modus", "bonusId"]) &&
        ["sterne", "richtig", "gesamt", "bonusRichtig"].every(function (name) {
        return r[name] === undefined || zahl(r[name]);
        }) && (r.bonus === undefined || typeof r.bonus === "boolean") &&
        (r.datum === undefined || r.datum === "" || datum(r.datum)) &&
        (r.richtig === undefined || r.gesamt === undefined || r.richtig <= r.gesamt) &&
        (r.bereiche === undefined || punkte(r.bereiche));
    });
    (neu.runden || []).forEach(function (r) {
      delete r.sterne;
      // Fehlerhafte optionale Zeitdaten dürfen die alten Ergebnisse nicht entwerten.
      if (r.uebezeiten !== undefined && !gueltigeUebezeiten(r.uebezeiten)) {
        delete r.uebezeiten;
      }
    });
    liste("geschenke", function (g) {
      return objekt(g) && typeof g.text === "string" && optionaleTexte(g,
        ["id", "datum", "zeitpunkt", "umgetauschtAm", "neuerText", "umgetauschtVon", "eingeloestAm",
          "wunschGeaendertAm", "urspruenglicherWunsch"]) &&
        ["datum", "umgetauschtAm", "eingeloestAm"].every(function (name) { return !g[name] || datum(g[name]); });
    });
    if (neu.geschenke) {
      neu.geschenke = migriereAltGutscheinText(migriereGutscheinUmtausch(neu.geschenke));
    }
    if (neu.wunschListe !== undefined && neu.wunschListe !== null) {
      if (!Array.isArray(neu.wunschListe) || neu.wunschListe.length === 0 ||
          !neu.wunschListe.every(function (w) {
            return objekt(w) && typeof w.text === "string" && w.text.trim().length > 0 &&
              (w.freitext === undefined || typeof w.freitext === "boolean");
          })) {
        problem();
        neu.wunschListe = null;
      } else {
        neu.wunschListe = neu.wunschListe.map(function (w) {
          const eintrag = { text: w.text.trim() };
          if (w.freitext === true) { eintrag.freitext = true; }
          return eintrag;
        });
      }
    }
    if (neu.wunschListeZeit !== undefined && !zahl(neu.wunschListeZeit)) {
      problem();
      neu.wunschListeZeit = 0;
    }
    ["zuletzt", "knobelZuletzt", "vortagSchluessel"].forEach(function (name) {
      liste(name, function (wert) { return typeof wert === "string"; });
    });
    liste("bonusWelten", function (welt) { return ["bluey", "gabby", "doozie"].includes(welt); });
    ["sterneGesamt", "bonussterne", "bonusGesamt"].forEach(function (name) {
      if (neu[name] !== undefined && !zahl(neu[name])) { problem(); delete neu[name]; }
    });
    const bonusAusRunden = (neu.runden || []).reduce((summe, r) =>
      summe + (r.bonus ? r.bonusRichtig || 0 : 0), 0);
    neu.bonusGesamt = Math.max(neu.bonusGesamt || 0, neu.bonussterne || 0, bonusAusRunden);
    delete neu.sterneGesamt;
    delete neu.bonussterne;
    if (geladen.version !== 3) {
      // Alte erreichte Stufen erhalten rückwirkend keine Gutscheine.
      neu.bonusStufenOffen = [];
      neu.bonusWelten = [];
    }
    liste("bonusStufenOffen", stufe => zahl(stufe) && stufe > 0 &&
      stufe % BONUS_STUFEN_SCHRITT === 0 && stufe <= neu.bonusGesamt);
    neu.bonusStufenOffen = offeneStufenOhneGutschein(neu.bonusStufenOffen || [], neu.geschenke || []);
    neu.version = 3;
    if (neu.bereichPunkte !== undefined && !punkte(neu.bereichPunkte)) {
      problem();
      const alt = neu.bereichPunkte;
      neu.bereichPunkte = {};
      if (objekt(alt)) { Object.keys(BEREICH_NAMEN).forEach(function (name) {
        if (punkte({ [name]: alt[name] })) { neu.bereichPunkte[name] = alt[name]; }
      }); }
    }
    if (neu.modus !== undefined && !["bluey", "gabby", "doozie", "gemischt"].includes(neu.modus)) {
      problem(); neu.modus = "bluey";
    }
    if (neu.deutschWelt === "legami") { neu.deutschWelt = "hunde"; } // Welt wurde ersetzt, still umstellen
    if (neu.deutschWelt !== undefined && !["hunde", "hamster", "weihnachten"].includes(neu.deutschWelt)) {
      problem(); neu.deutschWelt = "hunde";
    }
    if (neu.sound !== undefined && ![null, "an", "aus"].includes(neu.sound)) { problem(); neu.sound = null; }
    if (neu.vorleseStimme !== undefined && neu.vorleseStimme !== null &&
        !["thorsten", "ramona", "system"].includes(neu.vorleseStimme)) { problem(); neu.vorleseStimme = null; }
    if (neu.vorleseSystemStimme !== undefined && neu.vorleseSystemStimme !== null &&
        typeof neu.vorleseSystemStimme !== "string") { problem(); neu.vorleseSystemStimme = null; }
    function anteil(wert) {
      return typeof wert === "number" && Number.isFinite(wert) && wert >= 0 && wert <= 1;
    }
    if (neu.stimmeLautstaerke !== undefined && neu.stimmeLautstaerke !== null && !anteil(neu.stimmeLautstaerke)) {
      problem(); neu.stimmeLautstaerke = null;
    }
    if (neu.musikLautstaerke !== undefined && neu.musikLautstaerke !== null && !anteil(neu.musikLautstaerke)) {
      problem(); neu.musikLautstaerke = null;
    }
    if (neu.bonusTag !== undefined && neu.bonusTag !== null &&
        (!objekt(neu.bonusTag) || !datum(neu.bonusTag.datum) || !zahl(neu.bonusTag.verteilt))) {
      problem(); neu.bonusTag = null;
    }
    function feldGueltig(f) {
      if (!objekt(f) || !zahl(f.korrekt) || !["zahl", "zeit", "geld"].includes(f.typ) ||
          !optionaleTexte(f, ["beschriftung", "darstellung", "anzeige", "einheit"])) { return false; }
      if (f.auswahl !== undefined &&
          (f.typ !== "zahl" || !Array.isArray(f.auswahl) || f.auswahl.length < 2 ||
            !f.auswahl.every(text => typeof text === "string" && text.trim()) ||
            new Set(f.auswahl).size !== f.auswahl.length || f.korrekt < 1 ||
            f.korrekt > f.auswahl.length || f.anzeige !== f.auswahl[f.korrekt - 1])) { return false; }
      if (f.typ === "zeit") {
        return objekt(f.zeit) && zahl(f.zeit.stunde) && f.zeit.stunde < 24 && zahl(f.zeit.minute) && f.zeit.minute < 60;
      }
      return f.typ !== "geld" || (objekt(f.geld) && zahl(f.geld.cent));
    }
    for (const name of ["tagesSet", "bonusSet"]) {
      const set = neu[name];
      if (set === undefined || set === null) { continue; }
      const istBonus = name === "bonusSet";
      const bereichGueltig = bereich => istBonus ? bereich === "bonus" : Object.hasOwn(BEREICH_NAMEN, bereich);
      const kennungen = new Set();
      const gueltig = objekt(set) && datum(set.datum) &&
        ["bluey", "gabby", "doozie"].includes(set.welt) && typeof set.fertig === "boolean" &&
        (!istBonus || (typeof set.id === "string" && set.id.length > 0)) &&
        objekt(set.runde) && Array.isArray(set.runde.bereiche) && set.runde.bereiche.length > 0 &&
        set.runde.bereiche.every(function (b) {
          return objekt(b) && bereichGueltig(b.bereich) && typeof b.titel === "string" &&
            typeof b.untertitel === "string" && Array.isArray(b.aufgaben) && b.aufgaben.length > 0 &&
            b.aufgaben.every(function (k) {
              if (!objekt(k) || typeof k.ident !== "string" || !/^[\w-]+$/.test(k.ident) || kennungen.has(k.ident)) { return false; }
              kennungen.add(k.ident);
              return bereichGueltig(k.bereich) && typeof k.darstellung === "string" &&
                ["einfach", "rest", "luecke", "text"].includes(k.layout) && optionaleTexte(k, ["text", "frage"]) &&
                Array.isArray(k.felder) && k.felder.length > 0 && k.felder.every(feldGueltig) &&
                (k.layout !== "rest" || k.felder.length === 2);
            });
        });
      if (!gueltig) { problem(); neu[name] = null; }
      else {
        if (istBonus) {
          if (typeof set.antwortenZeit !== "number" || !Number.isFinite(set.antwortenZeit)) {
            delete set.antwortenZeit;
          }
          set.belohnt = Array.isArray(set.belohnt)
            ? [...new Set(set.belohnt.filter(id => kennungen.has(id)))] : [];
        } else {
          if (set.id !== undefined && (typeof set.id !== "string" || set.id.length === 0)) {
            delete set.id;
          }
          if (typeof set.gestartetAm !== "number" || !Number.isFinite(set.gestartetAm)) {
            delete set.gestartetAm;
          }
          if (typeof set.antwortenZeit !== "number" || !Number.isFinite(set.antwortenZeit)) {
            delete set.antwortenZeit;
          }
        }
        if (!gueltigeUebezeiten(set.uebezeiten)) { delete set.uebezeiten; }
        if (!objekt(set.antworten)) { if (set.antworten !== undefined) { problem(); } set.antworten = {}; }
        Object.keys(set.antworten).forEach(function (id) {
          if (!kennungen.has(id) || !Array.isArray(set.antworten[id]) ||
              !set.antworten[id].every(function (wert) { return typeof wert === "string"; })) {
            problem(); delete set.antworten[id];
          }
        });
        if (!zahl(set.abschnitt) || set.abschnitt >= set.runde.bereiche.length) {
          if (set.abschnitt !== undefined) { problem(); } set.abschnitt = 0;
        }
      }
    }
    return neu;
  }
  function lies() {
    try {
      const rohwert = window.localStorage.getItem(SPEICHER_NAME);
      originalRoh = rohwert;
      letzterStand = rohwert;
      if (rohwert !== null && rohwert !== undefined) {
        const geladen = bereinige(JSON.parse(rohwert));
        if (geladen && typeof geladen === "object") {
          let modusWert = geladen.modus || "bluey";
          if (modusWert === "gemischt") {
            modusWert = "bluey"; // die alte Misch-Welt gibt es nicht mehr
          }
          const kandidat = {
            version: 3,
            modus: modusWert,
            deutschWelt: geladen.deutschWelt || "hunde",
            runden: Array.isArray(geladen.runden) ? geladen.runden : [],
            zuletzt: Array.isArray(geladen.zuletzt) ? geladen.zuletzt : [],
            knobelZuletzt: Array.isArray(geladen.knobelZuletzt) ? geladen.knobelZuletzt : [],
            bonusSet: geladen.bonusSet || null,
            tagesSet: (geladen.tagesSet && typeof geladen.tagesSet === "object" &&
              geladen.tagesSet.runde) ? geladen.tagesSet : null,
            vortagSchluessel: Array.isArray(geladen.vortagSchluessel) ? geladen.vortagSchluessel : [],
            bonusGesamt: Number(geladen.bonusGesamt) || 0,
            bonusStufenOffen: geladen.bonusStufenOffen || [],
            geschenke: Array.isArray(geladen.geschenke) ? geladen.geschenke : [],
            wunschListe: Array.isArray(geladen.wunschListe) ? geladen.wunschListe : null,
            wunschListeZeit: Number.isSafeInteger(geladen.wunschListeZeit) ? geladen.wunschListeZeit : 0,
            bereichPunkte: (geladen.bereichPunkte && typeof geladen.bereichPunkte === "object")
              ? geladen.bereichPunkte : {},
            sound: geladen.sound || null,
            bonusTag: (geladen.bonusTag && typeof geladen.bonusTag === "object") ? geladen.bonusTag : null,
            bonusWelten: Array.isArray(geladen.bonusWelten) ? geladen.bonusWelten : [],
            vorleseStimme: geladen.vorleseStimme || null,
            vorleseSystemStimme: geladen.vorleseSystemStimme || null,
            stimmeLautstaerke: geladen.stimmeLautstaerke === undefined ? null : geladen.stimmeLautstaerke,
            musikLautstaerke: geladen.musikLautstaerke === undefined ? null : geladen.musikLautstaerke
          };
          /* Alte Gutscheine bekommen nachträglich eine Kennung,
             damit man sie umtauschen kann. Der Text bleibt, wie er ist. */
          kandidat.geschenke.forEach(function (geschenk, nummer) {
            if (!geschenk.id) {
              geschenk.id = "alt-" + nummer;
            }
          });
          daten = kandidat;
        }
      }
    } catch (fehler) {
      gesperrt = true;
      meldung = "Deine gespeicherten Daten konnten nicht sicher geöffnet werden. Sie werden nicht überschrieben. Bitte sichere die Daten mit Mama oder Papa.";
    }
    return daten;
  }
  function schreibe(aufgeschoben) {
    if (schreibTimer !== null && window.clearTimeout) {
      window.clearTimeout(schreibTimer); schreibTimer = null;
    }
    if (aufgeschoben) {
      schreibTimer = window.setTimeout(function () { schreibTimer = null; schreibe(); }, 250);
      return;
    }
    if (gesperrt) { aktualisiereSpeicherHinweis(); return; }
    try {
      const stand = JSON.stringify(daten);
      if (stand !== letzterStand) {
        const vorhanden = window.localStorage.getItem(SPEICHER_NAME);
        if (vorhanden === null || vorhanden === "") {
          /* Außerhalb dieses Fensters wurde der Speicher geleert (Browserdaten
             gelöscht, Erweiterung, Speicherbereinigung). Das ist kein Konflikt mit
             einem zweiten Spielfenster: mit dem Sitzungsstand neu aufsetzen. */
          letzterStand = null;
        } else if (vorhanden !== letzterStand) {
          // Keine neueren Daten eines anderen Fensters durch unseren alten Stand ersetzen.
          gesperrt = true;
          meldung = "In einem anderen Fenster wurde weitergespielt. Dessen Daten bleiben geschützt. Sichere deine Antworten hier und öffne das Spiel danach neu.";
          aktualisiereSpeicherHinweis();
          return;
        }
        window.localStorage.setItem(SPEICHER_NAME, stand);
        letzterStand = stand;
      }
      meldung = "";
    } catch (fehler) {
      meldung = "Deine Antworten sind gerade nur in diesem Fenster gespeichert. Bitte lass es offen und sichere die Daten mit Mama oder Papa.";
    }
    aktualisiereSpeicherHinweis();
  }
  lies();

  /* Prüft einen eingelesenen Spielstand, ohne den laufenden Speicher zu verändern.
     Nutzt dieselbe Prüfung wie das Laden (bereinige), damit eine importierte
     Datei genau so streng behandelt wird wie ein vorhandener Spielstand. */
  function istObjekt(wert) {
    return wert !== null && typeof wert === "object" && !Array.isArray(wert);
  }
  function pruefeImport(text) {
    const ergebnis = { ok: false, grund: "", daten: null, sterne: 0, runden: 0, geschenke: 0, stand: "" };
    let roh;
    try {
      roh = JSON.parse(String(text));
    } catch (fehler) {
      ergebnis.grund = "Die Datei ist kein gültiges JSON.";
      return ergebnis;
    }
    let kandidat = roh;
    if (istObjekt(roh) && roh.format === "mathe-sicherung") {
      if (!istObjekt(roh.daten)) {
        ergebnis.grund = "Die Sicherungsdatei enthält keinen Spielstand.";
        return ergebnis;
      }
      kandidat = roh.daten;
    }
    if (!istObjekt(kandidat)) {
      ergebnis.grund = "Die Datei enthält keinen Spielstand.";
      return ergebnis;
    }
    /* Trockenlauf der echten Prüfung. bereinige() setzt bei Problemen die
       Schreibsperre; dieser Zustand wird danach wiederhergestellt. */
    const alteSperre = gesperrt;
    const alteMeldung = meldung;
    gesperrt = false;
    meldung = "";
    let bereinigt = null;
    try {
      bereinigt = bereinige(kandidat);
    } catch (fehler) {
      bereinigt = null;
    }
    const fehlgeschlagen = gesperrt || !bereinigt || Object.keys(bereinigt).length === 0;
    const grund = fehlgeschlagen
      ? (meldung || "Der Spielstand konnte nicht gelesen werden.")
      : "";
    gesperrt = alteSperre;
    meldung = alteMeldung;
    if (fehlgeschlagen) {
      ergebnis.grund = grund;
      return ergebnis;
    }
    const zeilen = Array.isArray(bereinigt.runden) ? bereinigt.runden : [];
    const letzte = zeilen.length ? zeilen[zeilen.length - 1] : null;
    ergebnis.ok = true;
    ergebnis.daten = bereinigt;
    ergebnis.sterne = bereinigt.bonusGesamt;
    ergebnis.runden = zeilen.length;
    ergebnis.geschenke = Array.isArray(bereinigt.geschenke) ? bereinigt.geschenke.length : 0;
    ergebnis.stand = (letzte && letzte.datum) ||
      (bereinigt.tagesSet && bereinigt.tagesSet.datum) || "";
    return ergebnis;
  }

  /* Führt den geprüften Fremdstand mit dem laufenden Stand zusammen.
     „Merge light“: sichtbare Runden, Gutscheine und Memos werden vereinigt und
     exakt gezählt; der nicht mehr sichtbare Rest (abgeschnittene Historie) wird
     als Maximum übernommen, damit nichts doppelt entsteht. */
  function zusammenfuehren(text) {
    const ergebnis = { ok: false, grund: "", daten: null, vorschau: null, stand: "" };
    const pruefung = pruefeImport(text);
    if (!pruefung.ok) {
      ergebnis.grund = pruefung.grund;
      return ergebnis;
    }
    const verschmolzen = verschmelzeSpielstande(daten, pruefung.daten);
    /* Das Ergebnis muss dieselbe Prüfung bestehen wie jeder Spielstand. */
    const alteSperre = gesperrt;
    const alteMeldung = meldung;
    gesperrt = false;
    meldung = "";
    let bereinigt = null;
    try {
      bereinigt = bereinige(verschmolzen);
    } catch (fehler) {
      bereinigt = null;
    }
    const fehlgeschlagen = gesperrt || !bereinigt || Object.keys(bereinigt).length === 0;
    const grund = fehlgeschlagen
      ? (meldung || "Der zusammengeführte Spielstand ist ungültig.")
      : "";
    gesperrt = alteSperre;
    meldung = alteMeldung;
    if (fehlgeschlagen) {
      ergebnis.grund = grund;
      return ergebnis;
    }
    ergebnis.ok = true;
    ergebnis.daten = bereinigt;
    ergebnis.stand = pruefung.stand;
    ergebnis.vorschau = {
      runden: (bereinigt.runden || []).length - (daten.runden || []).length,
      sterne: bereinigt.bonusGesamt - daten.bonusGesamt,
      geschenke: (bereinigt.geschenke || []).length - (daten.geschenke || []).length
    };
    ergebnis.veraendert = stabilStringify(bereinigt) !== stabilStringify(daten);
    return ergebnis;
  }

  return {
    daten: function () { return daten; },
    speichere: schreibe,
    meldung: function () { return meldung; },
    pruefeImport: pruefeImport,
    zusammenfuehren: zusammenfuehren,
    /* Übernimmt einen bereits geprüften Stand (nur für den Abgleich). */
    uebernehmen: function (neueDaten) {
      daten = neueDaten;
      schreibe();
    },
    sicherung: function () { return { format: "mathe-sicherung", daten: daten, originalSpeicher: originalRoh }; }
  };
})();

/* Vergleicht zwei Datenbäume unabhängig von der Schlüsselreihenfolge. */
function stabilStringify(wert) {
  if (wert === null || typeof wert !== "object") { return JSON.stringify(wert); }
  if (Array.isArray(wert)) { return "[" + wert.map(stabilStringify).join(",") + "]"; }
  return "{" + Object.keys(wert).sort().map(function (name) {
    return JSON.stringify(name) + ":" + stabilStringify(wert[name]);
  }).join(",") + "}";
}

/* =========================================================================
   Zusammenführen zweier Spielstände („Merge light“)

   Regeln:
   - Runden: Vereinigung ohne Doppelung (Schlüssel ist der Zeitstempel, sonst
     Datum/Uhrzeit/Ergebnis), nach Zeit sortiert, neueste 1.000 bleiben.
   - Lebenszeitsterne und Bereichssummen: die aus der Historie sichtbaren Werte
     werden exakt addiert; der nicht mehr sichtbare Rest (abgeschnittene
     Historie) wird als Maximum der beiden Stände übernommen. Dadurch entsteht
     nichts doppelt und nichts geht verloren.
   - Gutscheine: Vereinigung ohne Doppelung (erzeugte Kennung, sonst Inhalt).
   - Bonus: verdiente Bonussterne über bonusRichtig. Offene Stufengutscheine
     werden vereinigt und bereits abgeholte Stufen ausgeschlossen.
   - Tagesrunde: abgeschlossene Runde vor offener (verhindert Doppelbewertung),
     sonst mehr Antworten, sonst das neuere Datum.
   - Merkzettel und Ausschlusslisten: Vereinigung, gekappt.
   - Bonus-Tag: neueres Datum, bei gleichem Tag verteilt = Maximum.
   ========================================================================= */

function verschmelzeSpielstande(lokal, fremd) {
  const A = (lokal && typeof lokal === "object") ? lokal : {};
  const B = (fremd && typeof fremd === "object") ? fremd : {};
  const liste = wert => (Array.isArray(wert) ? wert : []);

  function zeitVon(eintrag) {
    return String((eintrag && eintrag.zeit) ||
      (eintrag && eintrag.datum ? eintrag.datum + "T" + (eintrag.uhrzeit || "00:00") : ""));
  }
  function rundenKennung(r) {
    if (r?.bonus && r.bonusId) { return "bonus:" + r.bonusId; }
    if (r && typeof r.zeit === "string" && r.zeit) { return "zeit:" + r.zeit; }
    return "alt:" + [r && r.datum, r && r.uhrzeit, r && r.modus, r && r.richtig,
      r && r.gesamt, r && r.bonus, r && r.bonusRichtig].join("|");
  }
  function gutscheinKennung(g) {
    const id = g && g.id;
    // Erzeugte Kennungen ("g...") sind eindeutig; alte "alt-N" hängen an der
    // Reihenfolge und taugen nicht zum Vergleich.
    if (typeof id === "string" && id.indexOf("alt-") !== 0) { return "id:" + id; }
    return "inhalt:" + [g.urspruenglicherWunsch ?? g.text, g.datum, g.zeitpunkt].join("|");
  }
  function vereinigeRunden(a, b) {
    const karte = new Map();
    liste(a).concat(liste(b)).forEach(function (r) {
      if (!r || typeof r !== "object") { return; }
      const k = rundenKennung(r);
      const alt = karte.get(k);
      if (!alt) { karte.set(k, r); return; }
      const eintrag = (r.bonusRichtig || 0) > (alt.bonusRichtig || 0) ? r : alt;
      const zeitA = gueltigeUebezeiten(alt.uebezeiten) ? alt.uebezeiten : undefined;
      const zeitB = gueltigeUebezeiten(r.uebezeiten) ? r.uebezeiten : undefined;
      const zeiten = zeitB && (!zeitA || uebezeitSumme(zeitB) > uebezeitSumme(zeitA)) ? zeitB : zeitA;
      karte.set(k, zeiten ? { ...eintrag, uebezeiten: zeiten } : eintrag);
    });
    const alle = Array.from(karte.values());
    alle.sort(function (x, y) {
      const u = zeitVon(x), v = zeitVon(y);
      return u < v ? -1 : u > v ? 1 : 0;
    });
    return alle;
  }
  function vereinigeGutscheine(a, b) {
    const karte = new Map();
    liste(a).concat(liste(b)).forEach(function (g) {
      if (!g || typeof g !== "object") { return; }
      const k = gutscheinKennung(g);
      const alt = karte.get(k);
      if (!alt) { karte.set(k, g); return; }
      const neuer = (g.wunschGeaendertAm || "") > (alt.wunschGeaendertAm || "") ? g : alt;
      const eingeloestAm = neuer.eingeloestAm || alt.eingeloestAm || g.eingeloestAm;
      karte.set(k, eingeloestAm && !neuer.eingeloestAm ? { ...neuer, eingeloestAm } : neuer);
    });
    return Array.from(karte.values()).sort(function (x, y) {
      const u = String((x && (x.zeitpunkt || x.datum)) || "");
      const v = String((y && (y.zeitpunkt || y.datum)) || "");
      return u < v ? -1 : u > v ? 1 : 0;
    });
  }
  function summieren(zeilen, feld, bonus) {
    return liste(zeilen).reduce(function (summe, r) {
      if (!r || !!r.bonus !== !!bonus) { return summe; }
      const wert = r[feld];
      return summe + (Number.isSafeInteger(wert) && wert > 0 ? wert : 0);
    }, 0);
  }
  function bereichsSumme(zeilen) {
    const summe = {};
    liste(zeilen).forEach(function (r) {
      if (!r || !r.bereiche || typeof r.bereiche !== "object") { return; }
      Object.keys(r.bereiche).forEach(function (name) {
        const p = r.bereiche[name];
        if (!p || !Number.isSafeInteger(p.richtig) || !Number.isSafeInteger(p.gesamt)) { return; }
        const ziel = summe[name] || (summe[name] = { richtig: 0, gesamt: 0 });
        ziel.richtig += p.richtig;
        ziel.gesamt += p.gesamt;
      });
    });
    return summe;
  }
  function lebenswert(gesamtA, sichtbarA, gesamtB, sichtbarB, sichtbarVereinigt) {
    const unsichtbarA = Math.max(0, (gesamtA || 0) - sichtbarA);
    const unsichtbarB = Math.max(0, (gesamtB || 0) - sichtbarB);
    return Math.max(unsichtbarA, unsichtbarB) + sichtbarVereinigt;
  }
  function vereinigeTexte(a, b, max) {
    const gesehen = new Set();
    const ergebnis = [];
    liste(b).concat(liste(a)).forEach(function (wert) {
      if (typeof wert === "string" && !gesehen.has(wert)) {
        gesehen.add(wert);
        ergebnis.push(wert);
      }
    });
    return ergebnis.slice(0, max);
  }
  /* vortagSchluessel wächst am Ende (älteste zuerst). Darum beim Vereinigen
     hinten kürzen, damit die neuesten Ausschlüsse beider Geräte erhalten
     bleiben; die Liste des eigenen Geräts steht als jüngere zuletzt. */
  function vereinigeAeltesteZuerst(fremd, eigen, max) {
    const gesehen = new Set();
    const ergebnis = [];
    liste(fremd).concat(liste(eigen)).forEach(function (wert) {
      if (typeof wert === "string" && !gesehen.has(wert)) {
        gesehen.add(wert);
        ergebnis.push(wert);
      }
    });
    return ergebnis.slice(-max);
  }
  function waehleTagesSet(a, b) {
    if (!a) { return b || null; }
    if (!b) { return a; }
    const antworten = set => Object.keys((set && set.antworten) || {}).length;
    const gleicheRunde = (a.id && b.id) ? (a.id === b.id) : (a.datum === b.datum);
    if (gleicheRunde) {
      // Selbes Quiz: eine abgeschlossene Runde gewinnt, damit nichts doppelt bewertet wird.
      if (!!a.fertig !== !!b.fertig) { return a.fertig ? a : b; }
      const anzA = antworten(a);
      const anzB = antworten(b);
      if (anzA !== anzB) { return anzB > anzA ? b : a; }
      if ((a.antwortenZeit || 0) !== (b.antwortenZeit || 0)) {
        return (b.antwortenZeit || 0) > (a.antwortenZeit || 0) ? b : a;
      }
      return a;
    }
    // Verschiedene Quizze: das später gestartete Quiz gewinnt (damit ein
    // abgeschlossenes älteres Quiz kein danach gestartetes neues Quiz verdrängt).
    const startA = typeof a.gestartetAm === "number" ? a.gestartetAm : (Date.parse(a.datum + "T00:00:00Z") || 0);
    const startB = typeof b.gestartetAm === "number" ? b.gestartetAm : (Date.parse(b.datum + "T00:00:00Z") || 0);
    if (startA !== startB) { return startB > startA ? b : a; }
    if (a.datum !== b.datum) { return String(a.datum) > String(b.datum) ? a : b; }
    if (!!a.fertig !== !!b.fertig) { return a.fertig ? a : b; }
    if (antworten(a) !== antworten(b)) { return antworten(b) > antworten(a) ? b : a; }
    return String(b.id || "") > String(a.id || "") ? b : a;
  }

  function waehleBonusSet(a, b) {
    if (!a || !b || a.datum !== b.datum) { return waehleTagesSet(a, b); }
    if (a.id === b.id) {
      if (a.belohnt.length !== b.belohnt.length) { return a.belohnt.length > b.belohnt.length ? a : b; }
      if (a.fertig === b.fertig && a.antwortenZeit !== b.antwortenZeit) {
        return (a.antwortenZeit || 0) > (b.antwortenZeit || 0) ? a : b;
      }
      return waehleTagesSet(a, b);
    }
    /* Verschiedene Sets am selben Tag (je ein „Neue Aufgaben" pro Gerät): das
       weitergebrachte Set gewinnt, damit bereits gespielte Arbeit erhalten bleibt. */
    if (!!a.fertig !== !!b.fertig) { return a.fertig ? a : b; }
    const antworten = satz => Object.keys((satz && satz.antworten) || {}).length;
    if (antworten(a) !== antworten(b)) { return antworten(a) > antworten(b) ? a : b; }
    if (a.belohnt.length !== b.belohnt.length) { return a.belohnt.length > b.belohnt.length ? a : b; }
    return a.id > b.id ? a : b;
  }

  const rundenAlle = vereinigeRunden(A.runden, B.runden);
  /* Die Summen werden aus der vollständigen Vereinigung berechnet, nicht aus der
     auf 1.000 gekürzten Liste – sonst gingen die Sterne abgeschnittener Runden
     verloren. */
  const bonusSichtbar = summieren(rundenAlle, "bonusRichtig", true);
  const bonusGesamt = lebenswert(A.bonusGesamt, summieren(A.runden, "bonusRichtig", true),
    B.bonusGesamt, summieren(B.runden, "bonusRichtig", true), bonusSichtbar);
  const geschenke = vereinigeGutscheine(A.geschenke, B.geschenke);
  const runden = rundenAlle.length > 1000 ? rundenAlle.slice(-1000) : rundenAlle;

  const punkteA = (A.bereichPunkte && typeof A.bereichPunkte === "object") ? A.bereichPunkte : {};
  const punkteB = (B.bereichPunkte && typeof B.bereichPunkte === "object") ? B.bereichPunkte : {};
  const sichtA = bereichsSumme(A.runden);
  const sichtB = bereichsSumme(B.runden);
  const sichtVereinigt = bereichsSumme(rundenAlle);
  const bereichPunkte = {};
  const bereicheNamen = new Set(Object.keys(punkteA).concat(Object.keys(punkteB), Object.keys(sichtVereinigt)));
  bereicheNamen.forEach(function (name) {
    const a = punkteA[name] || { richtig: 0, gesamt: 0 };
    const b = punkteB[name] || { richtig: 0, gesamt: 0 };
    const sa = sichtA[name] || { richtig: 0, gesamt: 0 };
    const sb = sichtB[name] || { richtig: 0, gesamt: 0 };
    const sv = sichtVereinigt[name] || { richtig: 0, gesamt: 0 };
    const gesamt = lebenswert(a.gesamt, sa.gesamt, b.gesamt, sb.gesamt, sv.gesamt);
    const richtig = Math.min(gesamt, lebenswert(a.richtig, sa.richtig, b.richtig, sb.richtig, sv.richtig));
    bereichPunkte[name] = { richtig: richtig, gesamt: gesamt };
  });

  const heute = heutigesDatum();
  const welten = [];
  [[A.bonusTag, A.bonusWelten], [B.bonusTag, B.bonusWelten]].forEach(function (paar) {
    if (paar[0] && paar[0].datum === heute) {
      liste(paar[1]).forEach(function (welt) { welten.push(welt); });
    }
  });
  let bonusTag = null;
  if (A.bonusTag && B.bonusTag) {
    if (A.bonusTag.datum === B.bonusTag.datum) {
      bonusTag = { datum: A.bonusTag.datum,
        verteilt: Math.max(A.bonusTag.verteilt || 0, B.bonusTag.verteilt || 0) };
    } else {
      bonusTag = String(A.bonusTag.datum) > String(B.bonusTag.datum) ? A.bonusTag : B.bonusTag;
    }
  } else {
    bonusTag = A.bonusTag || B.bonusTag || null;
  }

  const stufenNeu = [];
  const vorherMax = Math.max(A.bonusGesamt || 0, B.bonusGesamt || 0);
  for (let stufe = naechsteBonusStufe(vorherMax); stufe <= bonusGesamt; stufe += BONUS_STUFEN_SCHRITT) {
    stufenNeu.push(stufe);
  }

  const wunschZeitA = Number.isSafeInteger(A.wunschListeZeit) ? A.wunschListeZeit : 0;
  const wunschZeitB = Number.isSafeInteger(B.wunschListeZeit) ? B.wunschListeZeit : 0;
  let wunschListe = A.wunschListe !== undefined ? A.wunschListe : null;
  let wunschListeZeit = wunschZeitA;
  if (wunschZeitB > wunschZeitA || (wunschZeitB === wunschZeitA && !wunschListe && B.wunschListe)) {
    wunschListe = B.wunschListe !== undefined ? B.wunschListe : null;
    wunschListeZeit = wunschZeitB;
  }

  return {
    version: 3,
    modus: A.modus || B.modus || "bluey",
    /* Deutsch-Welt: der eigene Stand gewinnt – die Weltwahl gehört zum Gerät. */
    deutschWelt: A.deutschWelt || B.deutschWelt || "hunde",
    runden: runden,
    /* Merkzettel: die Einträge des eigenen Geräts gelten als die neuesten,
       deshalb zuerst (vereinigeTexte gibt den zweiten Parameter zuerst aus). */
    zuletzt: vereinigeTexte(B.zuletzt, A.zuletzt, EINSTELLUNGEN.merkzettelGroesse),
    knobelZuletzt: vereinigeTexte(B.knobelZuletzt, A.knobelZuletzt, EINSTELLUNGEN.knobelMerken),
    tagesSet: waehleTagesSet(A.tagesSet, B.tagesSet),
    bonusSet: waehleBonusSet(A.bonusSet, B.bonusSet),
    vortagSchluessel: vereinigeAeltesteZuerst(B.vortagSchluessel, A.vortagSchluessel, 300),
    bonusGesamt: bonusGesamt,
    bonusStufenOffen: offeneStufenOhneGutschein(
      liste(A.bonusStufenOffen).concat(liste(B.bonusStufenOffen), stufenNeu), geschenke),
    geschenke: geschenke,
    wunschListe: wunschListe,
    wunschListeZeit: wunschListeZeit,
    bereichPunkte: bereichPunkte,
    sound: A.sound !== undefined ? A.sound : (B.sound !== undefined ? B.sound : null),
    bonusTag: bonusTag,
    bonusWelten: Array.from(new Set(welten)).filter(function (welt) {
      return ["bluey", "gabby", "doozie"].includes(welt);
    }),
    /* Ton-Einstellungen: der eigene Stand gewinnt – Lautstärke und Stimme
       sind Geräteware und sollen sich beim Abgleich nicht verstellen. */
    vorleseStimme: A.vorleseStimme !== undefined ? A.vorleseStimme
      : (B.vorleseStimme !== undefined ? B.vorleseStimme : null),
    vorleseSystemStimme: A.vorleseSystemStimme !== undefined ? A.vorleseSystemStimme
      : (B.vorleseSystemStimme !== undefined ? B.vorleseSystemStimme : null),
    stimmeLautstaerke: A.stimmeLautstaerke !== undefined ? A.stimmeLautstaerke
      : (B.stimmeLautstaerke !== undefined ? B.stimmeLautstaerke : null),
    musikLautstaerke: A.musikLautstaerke !== undefined ? A.musikLautstaerke
      : (B.musikLautstaerke !== undefined ? B.musikLautstaerke : null)
  };
}

/* =========================================================================
   Automatische Synchronisierung über GitHub (optional, standardmäßig aus)

   Der Spielstand liegt als eine JSON-Datei in einem (privaten) Repository.
   Ablauf:
   - Beim Start: Datei holen, mit dem lokalen Stand zusammenführen (Merge
     light), bei Änderungen lokal übernehmen und neu starten.
   - Beim Abschluss einer Runde, bei Gutscheinen und beim Verlassen sofort
     schreiben; beim Tippen höchstens alle `syncVerzoegerungMs`.
   - Vor jedem Schreiben wird der Serverstand erneut geholt und mit dem
     lokalen Stand vereinigt. Dadurch kann kein Stand einen anderen
     überschreiben; bei gleichzeitigen Änderungen (409) wird neu versucht.
   - Das Token wird nur lokal unter einem eigenen Schlüssel gespeichert und
     ist weder im Spielstand noch in Sicherungsdateien enthalten.
   ========================================================================= */

const SYNC_SCHLUESSEL = "mathe-ueben-sync";
const SYNC_VORGABEN = { repo: "", datei: "spielstand.json", branch: "main", token: "", aktiv: true };

function utf8ZuBytes(text) {
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    let code = text.charCodeAt(i);
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < text.length) {
      const naechstes = text.charCodeAt(i + 1);
      if (naechstes >= 0xDC00 && naechstes <= 0xDFFF) {
        code = 0x10000 + ((code - 0xD800) << 10) + (naechstes - 0xDC00);
        i += 1;
      }
    }
    if (code < 0x80) { bytes.push(code); }
    else if (code < 0x800) { bytes.push(0xC0 | (code >> 6), 0x80 | (code & 0x3F)); }
    else if (code < 0x10000) {
      bytes.push(0xE0 | (code >> 12), 0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
    } else {
      bytes.push(0xF0 | (code >> 18), 0x80 | ((code >> 12) & 0x3F),
        0x80 | ((code >> 6) & 0x3F), 0x80 | (code & 0x3F));
    }
  }
  return bytes;
}

function bytesZuUtf8(bytes) {
  let text = "";
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i++];
    let code;
    if (b < 0x80) { code = b; }
    else if (b >= 0xC0 && b < 0xE0) { code = ((b & 0x1F) << 6) | (bytes[i++] & 0x3F); }
    else if (b >= 0xE0 && b < 0xF0) {
      code = ((b & 0x0F) << 12) | ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F);
    } else {
      code = ((b & 0x07) << 18) | ((bytes[i++] & 0x3F) << 12) |
        ((bytes[i++] & 0x3F) << 6) | (bytes[i++] & 0x3F);
    }
    if (code > 0xFFFF) {
      code -= 0x10000;
      text += String.fromCharCode(0xD800 + (code >> 10), 0xDC00 + (code & 0x3FF));
    } else {
      text += String.fromCharCode(code);
    }
  }
  return text;
}

function base64Kodiere(text) {
  const bytes = utf8ZuBytes(String(text));
  const zeichen = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let ergebnis = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = bytes[i + 1];
    const b2 = bytes[i + 2];
    ergebnis += zeichen[b0 >> 2];
    ergebnis += zeichen[((b0 & 3) << 4) | ((b1 === undefined ? 0 : b1) >> 4)];
    ergebnis += b1 === undefined ? "=" : zeichen[((b1 & 15) << 2) | ((b2 === undefined ? 0 : b2) >> 6)];
    ergebnis += b2 === undefined ? "=" : zeichen[b2 & 63];
  }
  return ergebnis;
}

function base64Dekodiere(text) {
  const zeichen = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const sauber = String(text).replace(/[\s=]/g, "");
  const bytes = [];
  let puffer = 0;
  let bits = 0;
  for (let i = 0; i < sauber.length; i++) {
    const wert = zeichen.indexOf(sauber[i]);
    if (wert < 0) { continue; }
    puffer = (puffer << 6) | wert;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((puffer >> bits) & 0xFF);
    }
  }
  return bytesZuUtf8(bytes);
}

const sync = (function () {
  let einstellungen = Object.assign({}, SYNC_VORGABEN);
  let status = { text: "Nicht eingerichtet.", art: "info" };
  let laeuft = false;
  let timer = null;
  let timerSofort = false;
  let zuletztGepusht = null;
  let geladen = false;

  function setzeStatus(text, art) {
    status = { text: text, art: art || "info" };
    if (typeof aktualisiereSyncStatus === "function") { aktualisiereSyncStatus(); }
  }

  function lade() {
    if (geladen) { return einstellungen; }
    geladen = true;
    try {
      const roh = window.localStorage.getItem(SYNC_SCHLUESSEL);
      if (roh) {
        const gespeichert = JSON.parse(roh);
        ["repo", "datei", "branch", "token"].forEach(function (name) {
          if (typeof gespeichert[name] === "string") { einstellungen[name] = gespeichert[name]; }
        });
        if (typeof gespeichert.aktiv === "boolean") { einstellungen.aktiv = gespeichert.aktiv; }
        if (!einstellungen.datei) { einstellungen.datei = SYNC_VORGABEN.datei; }
        if (!einstellungen.branch) { einstellungen.branch = SYNC_VORGABEN.branch; }
      }
    } catch (fehler) {
      einstellungen = Object.assign({}, SYNC_VORGABEN);
    }
    return einstellungen;
  }

  function speichere(neu) {
    lade();
    const pruefen = Object.assign({}, einstellungen, neu || {});
    /* Repository muss "besitzer/name" sein, Dateiname ein relativer Pfad. */
    if (!/^[\w.-]+\/[\w.-]+$/.test(String(pruefen.repo || ""))) {
      setzeStatus("Bitte das Repository als „besitzer/name“ eintragen.", "fehler");
      return false;
    }
    const datei = String(pruefen.datei || "");
    if (!datei || datei.indexOf("..") >= 0 || datei.indexOf("//") >= 0 || datei[0] === "/") {
      setzeStatus("Bitte einen gültigen Dateinamen angeben (z. B. spielstand.json).", "fehler");
      return false;
    }
    try {
      window.localStorage.setItem(SYNC_SCHLUESSEL, JSON.stringify(pruefen));
    } catch (fehler) {
      setzeStatus("Die Zugangsdaten konnten nicht gespeichert werden.", "fehler");
      return false;
    }
    einstellungen = pruefen;
    zuletztGepusht = null;
    return true;
  }

  function einstellungenAktuell() {
    lade();
    return Object.assign({}, einstellungen);
  }

  function istKonfiguriert() {
    const e = einstellungenAktuell();
    return !!(e.aktiv && e.repo && e.repo.indexOf("/") > 0 && e.token);
  }

  function apiAdresse() {
    const e = einstellungenAktuell();
    /* Pfad segmentweise kodieren, damit Unterordner möglich bleiben. */
    const pfad = String(e.datei).split("/").map(encodeURIComponent).join("/");
    return "https://api.github.com/repos/" + e.repo + "/contents/" + pfad;
  }

  function kopfzeilen() {
    const e = einstellungenAktuell();
    return {
      "Authorization": "Bearer " + e.token,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }

  function fetchBereit() {
    return typeof window.fetch === "function";
  }

  async function holeStand() {
    if (!fetchBereit()) { throw new Error("Dieser Browser kann nicht synchronisieren."); }
    const e = einstellungenAktuell();
    let antwort;
    try {
      antwort = await window.fetch(apiAdresse() + "?ref=" + encodeURIComponent(e.branch),
        { headers: kopfzeilen(), cache: "no-store" });
    } catch (fehler) {
      throw new Error("Keine Verbindung zu GitHub (Internet oder Browserfreigabe prüfen).");
    }
    if (antwort.status === 404) { return { vorhanden: false, text: "", sha: null }; }
    if (antwort.status === 401 || antwort.status === 403) {
      throw new Error("GitHub lehnt den Zugang ab (Token, Repo oder Recht „Contents“ prüfen).");
    }
    if (!antwort.ok) { throw new Error("GitHub antwortet mit " + antwort.status + "."); }
    const daten = await antwort.json();
    return {
      vorhanden: true,
      text: base64Dekodiere(daten.content || ""),
      sha: daten.sha || null
    };
  }

  async function schreibeStand(text, sha) {
    const e = einstellungenAktuell();
    const koerper = {
      message: "Spielstand " + heutigesDatum() + " " + new Date().toISOString(),
      content: base64Kodiere(text),
      branch: e.branch
    };
    if (sha) { koerper.sha = sha; }
    let antwort;
    try {
      antwort = await window.fetch(apiAdresse(), {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, kopfzeilen()),
        body: JSON.stringify(koerper)
      });
    } catch (fehler) {
      throw new Error("Keine Verbindung zu GitHub (Internet oder Browserfreigabe prüfen).");
    }
    if (antwort.status === 409) { return { konflikt: true }; }
    if (antwort.status === 401 || antwort.status === 403) {
      throw new Error("GitHub lehnt den Zugang ab (Token, Repo oder Recht „Contents“ prüfen).");
    }
    if (!antwort.ok) { throw new Error("Schreiben fehlgeschlagen (" + antwort.status + ")."); }
    const daten = await antwort.json().catch(function () { return null; });
    return { ok: true, sha: daten && daten.content ? daten.content.sha : null };
  }

  /* Holt den Serverstand und vereinigt ihn mit dem lokalen Stand.
     Gibt zurück, ob sich dadurch lokal etwas geändert hat. */
  async function ziehen() {
    if (!istKonfiguriert()) { return { geaendert: false, uebersprungen: true }; }
    const stand = await holeStand();
    if (!stand.vorhanden) {
      setzeStatus("Noch kein Spielstand im Repository – wird beim nächsten Schreiben angelegt.", "info");
      return { geaendert: false, vorhanden: false };
    }
    const ergebnis = speicher.zusammenfuehren(stand.text);
    if (!ergebnis.ok) {
      throw new Error("Der Spielstand im Repository ist unlesbar: " + ergebnis.grund);
    }
    if (!ergebnis.veraendert) {
      setzeStatus("Abgeglichen – lokal und Repository sind gleich.", "ok");
      return { geaendert: false, vorhanden: true };
    }
    speicher.uebernehmen(ergebnis.daten);
    setzeStatus("Spielstand vom Repository übernommen.", "ok");
    return { geaendert: true, vorhanden: true, vorschau: ergebnis.vorschau };
  }

  /* Schreibt den lokalen Stand, nachdem er mit dem Serverstand vereinigt wurde.
     Der Server verliert dadurch nie Daten; gleichzeitige Änderungen (409)
     werden erneut zusammengeführt. */
  async function schieben(optionen) {
    const opts = optionen || {};
    if (!istKonfiguriert()) { return { ok: false, uebersprungen: true }; }
    if (laeuft) { return { ok: false, laeuft: true }; }
    laeuft = true;
    try {
      if (!opts.erzwingen && zuletztGepusht === stabilStringify(speicher.daten())) {
        return { ok: true, unveraendert: true };
      }
      let letzterGrund = "";
      for (let versuch = 0; versuch < 3; versuch++) {
        const stand = await holeStand();
        const lokalStand = stabilStringify(speicher.daten());
        let zuSchreiben = JSON.stringify(speicher.daten());
        if (stand.vorhanden && stand.text) {
          const ergebnis = speicher.zusammenfuehren(stand.text);
          if (!ergebnis.ok) {
            throw new Error("Der Spielstand im Repository ist unlesbar: " + ergebnis.grund);
          }
          /* Nur zum Schreiben zusammenführen; der lokale Sitzungsstand bleibt
             unangetastet, damit eine laufende Runde nicht wechselt. */
          zuSchreiben = JSON.stringify(ergebnis.daten);
        }
        const antwort = await schreibeStand(zuSchreiben, stand.sha);
        if (antwort.konflikt) { letzterGrund = "gleichzeitige Änderung"; continue; }
        zuletztGepusht = lokalStand;
        setzeStatus("Gespeichert (" + new Date().toLocaleTimeString("de-DE",
          { timeZone: "Europe/Vienna" }) + " Uhr).", "ok");
        return { ok: true };
      }
      throw new Error("Schreiben nicht möglich (" + letzterGrund + ").");
    } finally {
      laeuft = false;
    }
  }

  async function jetzt() {
    if (!istKonfiguriert()) {
      setzeStatus("Bitte Repository und Token eintragen.", "fehler");
      return { ok: false };
    }
    setzeStatus("Gleiche ab …", "info");
    try {
      const gezogen = await ziehen();
      if (gezogen.geaendert) {
        setzeStatus("Spielstand übernommen – das Spiel wird neu gestartet.", "ok");
        ladeSpielstandNeu();
        return { ok: true, neustart: true, vorschau: gezogen.vorschau };
      }
      const geschoben = await schieben({ erzwingen: true });
      if (geschoben.ok) { setzeStatus("Abgeglichen und gespeichert.", "ok"); }
      return { ok: geschoben.ok !== false };
    } catch (fehler) {
      setzeStatus(fehler.message || String(fehler), "fehler");
      return { ok: false, fehler: fehler.message || String(fehler) };
    }
  }

  function planeSchieben(sofort) {
    if (!istKonfiguriert()) { return; }
    if (timer) {
      if (sofort && !timerSofort) {
        window.clearTimeout(timer);
        timer = null;
      } else {
        return;
      }
    }
    timerSofort = Boolean(sofort);
    const wartezeit = sofort ? 0 : EINSTELLUNGEN.syncVerzoegerungMs;
    timer = window.setTimeout(function () {
      timer = null;
      timerSofort = false;
      schieben().catch(function (fehler) {
        setzeStatus(fehler.message || String(fehler), "fehler");
      });
    }, wartezeit);
  }

  /* Wird vom Spiel nach Änderungen aufgerufen. */
  function nachAenderung(sofort) {
    if (!istKonfiguriert()) { return; }
    planeSchieben(sofort === true);
  }

  /* Beim Start: abgleichen; bei Änderungen neu laden, sonst lokal schreiben. */
  async function starten() {
    if (!istKonfiguriert()) { return; }
    try {
      const gezogen = await ziehen();
      if (gezogen.geaendert) {
        ladeSpielstandNeu();
        return;
      }
      await schieben();
    } catch (fehler) {
      setzeStatus(fehler.message || String(fehler), "fehler");
    }
  }

  function vergessen() {
    try { window.localStorage.removeItem(SYNC_SCHLUESSEL); } catch (fehler) {}
    einstellungen = Object.assign({}, SYNC_VORGABEN);
    geladen = true;
    zuletztGepusht = null;
    if (timer) { window.clearTimeout(timer); timer = null; timerSofort = false; }
    setzeStatus("Synchronisierung entfernt.", "info");
  }

  return {
    istKonfiguriert: istKonfiguriert,
    einstellungen: einstellungenAktuell,
    speichere: speichere,
    vergessen: vergessen,
    ziehen: ziehen,
    schieben: schieben,
    jetzt: jetzt,
    starten: starten,
    nachAenderung: nachAenderung,
    status: function () { return status; },
    setzeStatus: setzeStatus
  };
})();

function gesamtSterne() {
  return speicher.daten().bonusGesamt;
}

function aktualisiereSpeicherHinweis() {
  const hinweis = document.getElementById("speicherHinweis");
  if (hinweis) {
    hinweis.hidden = !speicher.meldung();
    const text = document.getElementById("speicherMeldung");
    if (text.textContent !== speicher.meldung()) { text.textContent = speicher.meldung(); }
  }
}

function datenHerunterladen(inhalt, typ, dateiname) {
  const blob = (typeof window.Blob === "function" && inhalt instanceof window.Blob)
    ? inhalt
    : new window.Blob([inhalt], { type: typ });
  const url = window.URL.createObjectURL(blob);
  const knoten = element("a");
  try {
    knoten.href = url;
    knoten.download = dateiname;
    document.body.appendChild(knoten);
    knoten.click();
  } finally {
    if (knoten.parentNode) { knoten.parentNode.removeChild(knoten); }
    window.setTimeout(function () { window.URL.revokeObjectURL(url); }, 1000);
  }
}

/* Liefert true, wenn die Sicherungsdatei tatsächlich angestoßen wurde. Der
   Rückgabewert entscheidet beim Import, ob ersetzt werden darf. */
function sichereDatenDownload(dateiname) {
  try {
    datenHerunterladen(JSON.stringify(speicher.sicherung(), null, 2), "application/json;charset=utf-8",
      dateiname || "mathe-sicherung-" + heutigesDatum() + ".json");
    return true;
  } catch (fehler) {
    window.alert("Die Sicherung konnte nicht heruntergeladen werden. Bitte lass dieses Fenster offen und hole Mama oder Papa dazu.");
    return false;
  }
}

function meldeRueckmeldung(text) {
  const knoten = document.getElementById("rueckmeldung");
  if (knoten) { knoten.textContent = text; }
}

/* ------------- Helfer ------------- */

function element(typ, klassen, text) {
  const knoten = document.createElement(typ);
  if (klassen) {
    knoten.className = klassen;
  }
  if (text !== undefined) {
    knoten.textContent = text;
  }
  return knoten;
}

function symbol(name, klassen) {
  const knoten = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  knoten.setAttribute("class", "symbol " + (klassen || ""));
  knoten.setAttribute("aria-hidden", "true");
  const nutzung = document.createElementNS("http://www.w3.org/2000/svg", "use");
  nutzung.setAttribute("href", "#" + name);
  knoten.appendChild(nutzung);
  return knoten;
}

let bereichAktuell = "mathe";   // "mathe" oder "deutsch" – für Umschalter und Startseite-Knopf

function aktualisiereBereichsSchalter() {
  ["matheUmschalter", "deutschUmschalter"].forEach(function (id) {
    const knopf = document.getElementById(id);
    if (!knopf) { return; }
    const aktiv = (id === "matheUmschalter") === (bereichAktuell === "mathe");
    knopf.classList.toggle("aktiv", aktiv);
    knopf.setAttribute("aria-pressed", String(aktiv));
  });
  const titel = document.getElementById("kopfTitel");
  if (titel) { titel.textContent = bereichAktuell === "deutsch" ? "Deutsch üben" : "Mathe üben"; }
  const zeile = document.getElementById("kopfZeile");
  if (zeile) {
    zeile.textContent = bereichAktuell === "deutsch"
      ? "3. Klasse \u00B7 Deutsch & Sprechtraining"
      : "3. Klasse \u00B7 Raum 1000";
  }
}

function zeigeBildschirm(id) {
  if (id !== "uebungsBildschirm") { pausiereUebezeit(); }
  if (id !== "sprechBildschirm") { sprechAudio.stoppe(); }
  if (id === "sprechBildschirm") { bereichAktuell = "deutsch"; }
  else if (id === "startBildschirm" || id === "uebungsBildschirm" || id === "matheThemaBildschirm") {
    bereichAktuell = "mathe";
  }
  musik.modusWechsel(); // Melodie wechselt mit, sobald der Bereich (und damit die Musik) wechselt
  aktualisiereBereichsSchalter();
  document.querySelectorAll(".bildschirm").forEach(function (schirm) {
    schirm.hidden = schirm.id !== id;
  });
  if (id === "uebungsBildschirm") { starteUebezeit(); }
  window.scrollTo(0, 0);
}

/* ------------- Antworten prüfen ------------- */

function parseZahl(roh) {
  const text = String(roh || "").replace(/\s/g, "").replace(/\.$/, "");
  if (!/^\d{1,4}$/.test(text)) {
    return null;
  }
  return Number(text);
}

/* Geldantworten: zwei Felder – eins für Euro, eins für Cent.
   Ein leeres Feld zählt als 0; zusammen darf es nicht mehr als 999 € 99 ct sein. */
function geldWertAus(eingabeKnoten) {
  const teile = eingabeKnoten.querySelectorAll(".geld-teil");
  if (teile.length !== 2) {
    return null;
  }
  const euroLeer = teile[0].value.trim() === "";
  const centLeer = teile[1].value.trim() === "";
  const euro = euroLeer ? 0 : parseZahl(teile[0].value);
  const cent = centLeer ? 0 : parseZahl(teile[1].value);
  if (euroLeer && centLeer) {
    return null;   // da hat noch niemand etwas eingetragen
  }
  if (euro === null || cent === null || euro > 999 || cent > 99) {
    return null;   // unzulässige Werte (100 Cent gibt es nicht)
  }
  return euro * 100 + cent;
}

function parseZeit(roh) {
  const text = String(roh || "").trim().toLowerCase().replace(/\s+/g, " ");
  let treffer = text.match(/^(\d{1,2})\s*(?:(:|\.|,)\s*(\d{1,2})(?:\s*(?:uhr|u))?|(?:uhr|u)\s*(\d{1,2}))$/);
  if (treffer) {
    const stunde = Number(treffer[1]);
    const minute = Number(treffer[3] !== undefined ? treffer[3] : treffer[4]);
    if (stunde <= 23 && minute <= 59) {
      return { stunde: stunde, minute: minute };
    }
    return null;
  }
  treffer = text.match(/^(\d{1,2})(\d{2})$/);
  if (treffer) {
    // Kompakteingabe ohne Trennzeichen: "925" heißt 9:25, "1025" heißt 10:25.
    const stunde = Number(treffer[1]);
    const minute = Number(treffer[2]);
    return stunde <= 23 && minute <= 59 ? { stunde: stunde, minute: minute } : null;
  }
  treffer = text.match(/^(\d{1,2})\s*uhr$/);
  if (treffer) {
    const stunde = Number(treffer[1]);
    return stunde <= 23 ? { stunde: stunde, minute: 0 } : null;
  }
  return null;
}

function feldIstRichtig(feld, roh) {
  if (feld.typ === "zeit") {
    const zeit = parseZeit(roh);
    return zeit !== null && zeit.stunde === feld.zeit.stunde && zeit.minute === feld.zeit.minute;
  }
  const zahl = parseZahl(roh);
  return zahl !== null && zahl === feld.korrekt;
}

/* ------------- Zustände ------------- */

let modus = speicher.daten().modus || "bluey";
let runde = null;
let eingabeZuFeld = new Map();
let letzteZusammenfassung = null;
let abschnittZeiger = 0;      // welcher Bereich gerade gezeigt wird
let abschnittsModusAktiv = false; // true = ein Bereich nach dem anderen
let fertigAnsicht = false;    // die Runde ist geprüft und kann nicht mehr geändert werden
let abgabeBestaetigt = false; // die Rückfrage vor dem Abgeben wurde bestätigt
let bereichsKnoten = [];      // DOM-Knoten der Bereiche der aktuellen Runde
let kartenEingaben = new Map(); // Kartenkennung -> alle Eingabefelder der Karte (Reihenfolge)

const WELT_NAMEN = { bluey: "Bluey", gabby: "Gabbys Puppenhaus", doozie: "Doozies Hundehaus" };

function themenSymbol() {
  if (modus === "bluey") {
    return "hund";
  }
  if (modus === "gabby") {
    return "gabbykopf";
  }
  return "dooziekopf";
}

const FIGURENBILDER = {
  hund: "bluey", bingo: "bingo", chilli: "chilli", bandit: "bandit",
  muffin: "muffin", socks: "socks", rusty: "rusty", chloe: "chloe",
  mackenzie: "mackenzie", snickers: "snickers",
  gabbykopf: "gabby", panda: "pandy", kuchi: "kuchi", meerkatze: "meerkatze",
  carlita: "carlita", ratkatz: "ratkatz", kittyFee: "kitty-fee", dooziekopf: "doozie", puggie: "puggie",
  paillette: "paillette", traumpfoetchen: "traumpfoetchen",
  pixiepfoetchen: "pixiepfoetchen", spielpfoetchen: "spielpfoetchen", swenny: "swenny",
  sahnepfoetchen: "sahnepfoetchen", babybox: "babybox", djKatzenminze: "dj-katzenminze",
  kuschelkatze: "kuschelkatze", marty: "marty", bastelpfoetchen: "bastelpfoetchen",
  crouton: "crouton",
  deutschWuffi: "hund-wuffi", deutschBello: "hund-bello", deutschFlocki: "hund-flocki",
  deutschMopsi: "hund-mopsi", deutschCoco: "hund-coco", deutschSchnuffel: "hund-schnuffel",
  deutschStruppi: "hund-struppi", deutschBella: "hund-bella",
  deutschKnuspel: "hamster-knuspel", deutschWommel: "hamster-wommel", deutschPip: "hamster-pip",
  deutschBommel: "hamster-bommel", deutschNussi: "hamster-nussi", deutschFlauschi: "hamster-flauschi",
  deutschKrummel: "hamster-krummel", deutschZucker: "hamster-zucker",
  deutschWeihnachtsmann: "weihnachtsmann", deutschChristkind: "christkind", deutschRudolph: "rudolph",
  deutschElfe: "elfe", deutschWichtel: "wichtel", deutschSchneemann: "schneemann",
  deutschGriesgram: "griesgram", deutschLebkuchenmann: "lebkuchenmann"
};

const MASKOTTCHEN_NAMEN = {
  kittyFee: "Kitty Fee",
  babybox: "Baby Box",
  djKatzenminze: "DJ Katzenminze"
};

/* Deutsch üben: die Welten des Sprechtrainings. Die Figuren liegen als
   freigestellte webp-Dateien in bilder/ und gehören zum Spielstand-Feld
   deutschWelt (gerätebezogen, im Merge gewinnt der eigene Stand). */
const DEUTSCH_WELTEN = {
  hunde: {
    titel: "Süße Hunde",
    beschreibung: "Mit Wuffi, Bello und Flocki – acht aufgeweckte Welpen",
    figur: "deutschWuffi",
    figuren: ["deutschWuffi", "deutschBello", "deutschFlocki", "deutschMopsi", "deutschCoco", "deutschSchnuffel", "deutschStruppi", "deutschBella"],
    namen: ["Wuffi", "Bello", "Flocki", "Mopsi", "Coco", "Schnuffel", "Struppi", "Bella"],
    lob: "Alle acht Welpen wedeln ganz stolz mit dem Schwanz!"
  },
  hamster: {
    titel: "Flauschige Hamster",
    beschreibung: "Mit Knuspel, Wommel und Pip – acht knuffige Hamster",
    figur: "deutschKnuspel",
    figuren: ["deutschKnuspel", "deutschWommel", "deutschPip", "deutschBommel", "deutschNussi", "deutschFlauschi", "deutschKrummel", "deutschZucker"],
    namen: ["Knuspel", "Wommel", "Pip", "Bommel", "Nussi", "Flauschi", "Krummel", "Zucker"],
    lob: "Alle acht Hamster klatschen begeistert für dich!"
  },
  weihnachten: {
    titel: "Weihnachtswelt",
    beschreibung: "Mit Weihnachtsmann, Rudolph und Elfen – frohes Fest beim Üben",
    figur: "deutschWeihnachtsmann",
    figuren: ["deutschWeihnachtsmann", "deutschChristkind", "deutschRudolph", "deutschElfe", "deutschWichtel", "deutschSchneemann", "deutschGriesgram", "deutschLebkuchenmann"],
    namen: ["Weihnachtsmann", "Christkind", "Rudolph", "Elfe", "Wichtel", "Schneemann", "Griesgram", "Lebkuchenmann"],
    lob: "Weihnachtsmann, Rudolph und alle Elfen rufen: Frohe Weihnachten!"
  }
};

function deutschWeltId() {
  const wert = speicher.daten().deutschWelt;
  return DEUTSCH_WELTEN[wert] ? wert : "hunde";
}

const DOOZIE_GESCHICHTENFIGUREN = new Map([
  ["paillette", "paillette"], ["seaquin", "paillette"],
  ["traumpfötchen", "traumpfoetchen"], ["dreampup", "traumpfoetchen"],
  ["pixiepfötchen", "pixiepfoetchen"], ["pixiepup", "pixiepfoetchen"],
  ["spielpfötchen", "spielpfoetchen"], ["gamepup", "spielpfoetchen"],
  ["swenny", "swenny"], ["swaggy", "swenny"],
  ["sahnepfötchen", "sahnepfoetchen"], ["creampup", "sahnepfoetchen"],
  ["bastelpfötchen", "bastelpfoetchen"]
]);

function geschichtenFigur(karte) {
  const text = typeof karte.text === "string" ? karte.text.toLowerCase() : "";
  const woerter = text.split(/[^\p{L}]+/u);
  if (modus === "doozie") {
    for (const wort of woerter) {
      if (DOOZIE_GESCHICHTENFIGUREN.has(wort)) { return DOOZIE_GESCHICHTENFIGUREN.get(wort); }
    }
  }
  return mascottchenAuswahl(true).find(function (figur) {
    const name = MASKOTTCHEN_NAMEN[figur];
    if (name && text.includes(name.toLowerCase())) { return true; }
    return woerter.includes(FIGURENBILDER[figur]);
  }) || themenSymbol();
}

function figurBild(figur, klassen) {
  const datei = FIGURENBILDER[figur];
  if (!datei) { return symbol(figur, klassen); }
  const bild = element("img", "symbol figurenbild" + (klassen ? " " + klassen : ""));
  bild.src = "bilder/" + datei + ".webp";
  bild.alt = "";
  return bild;
}

/* ------------- Eine Runde bauen ------------- */

/* --- Tages-Regie für die Bonuswelten --- */

function wienerDatumTeile(zeitpunkt) {
  const teile = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Vienna", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23"
  }).formatToParts(zeitpunkt || new Date()).forEach(function (teil) {
    teile[teil.type] = teil.value;
  });
  return teile;
}

function lokalesDatum(zeitpunkt) {
  const teile = wienerDatumTeile(zeitpunkt);
  return teile.year + "-" + teile.month + "-" + teile.day;
}

function heutigesDatum() {
  return lokalesDatum(new Date());
}

function initialisiereWintermodus() {
  const schluessel = "mathe-ueben-winter";
  const knopf = document.getElementById("winterKnopf");
  const schnee = document.getElementById("winterSchnee");
  for (let i = 0; i < 15; i += 1) {
    const flocke = symbol("schneeflocke", "winter-flocke");
    flocke.setAttribute("style", "left:" + (5 + (i * 37) % 90) + "%;" +
      "--flocken-groesse:" + (7 + (i * 7) % 20) + "px;" +
      "--fallzeit:" + (16 + (i * 3) % 11) + "s;" +
      "--fallstart:-" + (i * 7 % 19) + "s");
    schnee.appendChild(flocke);
  }
  function setzeWinter(aktiv) {
    schnee.hidden = !aktiv;
    knopf.setAttribute("aria-pressed", String(aktiv));
  }
  let gespeichert = false;
  try {
    gespeichert = window.localStorage.getItem(schluessel) === "an";
  } catch (fehler) {
    // Ohne Browser-Speicher bleibt der Wintermodus beim Start aus.
  }
  setzeWinter(gespeichert);
  knopf.addEventListener("click", function () {
    const aktiv = schnee.hidden;
    setzeWinter(aktiv);
    try {
      window.localStorage.setItem(schluessel, aktiv ? "an" : "aus");
    } catch (fehler) {
      // Der Schalter funktioniert auch ohne Browser-Speicher.
    }
  });
}

function verschiebeKalendertag(datum, tage) {
  // UTC nur als Rechenhilfe für reine Kalenderdaten, niemals als Spielzeitzone.
  const tag = new Date(datum + "T12:00:00Z");
  tag.setUTCDate(tag.getUTCDate() + tage);
  return tag.toISOString().slice(0, 10);
}

function holBonusTag() {
  const daten = speicher.daten();
  const heute = heutigesDatum();
  if (!daten.bonusTag || daten.bonusTag.datum !== heute) {
    daten.bonusTag = { datum: heute, verteilt: 0 };
    daten.bonusWelten = [];   // ein neuer Tag, ein neues Knobelvergnuegen
    speicher.speichere();
  }
  return daten.bonusTag;
}

function bonusPlaetzeHeute() {
  return Math.max(0, EINSTELLUNGEN.bonusSterneProTag - holBonusTag().verteilt);
}

function weltHeuteFreigeschaltet(welt) {
  holBonusTag();
  return (speicher.daten().bonusWelten || []).indexOf(welt) >= 0;
}

function schalteWeltFrei(welt) {
  holBonusTag();
  const daten = speicher.daten();
  if (daten.bonusWelten.indexOf(welt) < 0) {
    daten.bonusWelten.push(welt);
    speicher.speichere();
    return true;  // gerade erst aufgegangen
  }
  return false;   // war schon offen
}

/* --- gewöhnliche Übungsrunde (50 Aufgaben, ohne Knobeln) --- */

function baueRunde(bereiche) {
  if (!bereiche) {
    const aufgaben = window.AUFGABEN.erzeugeRunde({
      divisionMitRestAktiv: EINSTELLUNGEN.divisionMitRestAktiv
    });
    const geschichten = window.GESCHICHTEN.erzeugeGeschichten({
      anzahl: EINSTELLUNGEN.geschichtenAnzahl,
      modus: modus,
      name: SPIELERIN,
      zuletzt: speicher.daten().zuletzt
    });
    bereiche = aufgaben.bereiche.concat([{
      bereich: "geschichte",
      titel: "Rechengeschichten",
      untertitel: "Lies die Geschichte genau und rechne dann.",
      aufgaben: geschichten
    }]);
  }

  return {
    welt: modus,
    bereiche: bereiche,
    karten: bereiche.reduce(function (liste, bereich) {
      return liste.concat(bereich.aufgaben);
    }, []),
    anzahl: bereiche.reduce(function (summe, bereich) {
      return summe + bereich.aufgaben.length;
    }, 0)
  };
}

/* --- das feste Fragen-Set für den heutigen Tag (für alle Welten gleich) ---

   Der Tag gehört zu dem Set, an dem es erzeugt wurde. Ein Weltwechsel
   ändert die Fragen nicht. Die Antworten werden bei jeder Eingabe
   gespeichert, damit nichts verloren geht. Einmal „Fertig" angekreuzt,
   kann das Set nicht mehr verändert werden – mit „Neuer Versuch" gibt
   es aber ein frisches Set für denselben Tag. */

function istTagesRunde() {
  return !!runde && runde.bereichsArt === "tages";
}

let uebezeitSegment = null;

function uebezeitJetzt() {
  return window.performance ? Math.floor(window.performance.now()) : Date.now();
}

function dauerText(ms) {
  const sekunden = Math.floor(ms / 1000);
  return Math.floor(sekunden / 60) + ":" + String(sekunden % 60).padStart(2, "0") + " min";
}

/* Die Übezeit läuft unsichtbar mit und ist nur in der Statistik zu sehen. */
function starteUebezeit() {
  if (!runde || fertigAnsicht || runde.zeitBeendet || uebezeitSegment ||
      document.visibilityState === "hidden" || document.getElementById("uebungsBildschirm").hidden) { return; }
  const bereich = runde.bereiche[abschnittZeiger].bereich;
  uebezeitSegment = { bereich: bereich, seit: uebezeitJetzt() };
}

function bucheUebezeit() {
  if (!uebezeitSegment) { return; }
  const jetzt = uebezeitJetzt();
  const bereich = uebezeitSegment.bereich;
  const zeiten = runde.uebezeiten || (runde.uebezeiten = {});
  zeiten[bereich] = (zeiten[bereich] || 0) + Math.max(0, jetzt - uebezeitSegment.seit);
  uebezeitSegment.seit = jetzt;
}

function pausiereUebezeit() {
  if (!uebezeitSegment) { return; }
  bucheUebezeit();
  uebezeitSegment = null;
  sichereTagesAntworten();
  const bonusStatistik = runde.bonusAuswertung && runde.bonusAuswertung.statistik;
  if (bonusStatistik) {
    bonusStatistik.uebezeiten = { ...runde.uebezeiten };
    speicher.speichere();
    sync.nachAenderung(false);
  }
}

function schluesselDerSetRunde(setRunde) {
  if (!setRunde || !Array.isArray(setRunde.bereiche)) {
    return [];
  }
  const liste = [];
  setRunde.bereiche.forEach(function (bereich) {
    (bereich.aufgaben || []).forEach(function (karte) {
      if (karte.schluessel) {
        liste.push(karte.schluessel);
      }
    });
  });
  return liste;
}

function rundeAusSet(set) {
  const bereiche = set.runde.bereiche;
  const karten = [];
  bereiche.forEach(function (bereich) {
    karten.push.apply(karten, bereich.aufgaben);
  });
  return {
    bereichsArt: "tages",
    tagesSet: set,
    uebezeiten: set.uebezeiten ? { ...set.uebezeiten } : undefined,
    welt: set.welt,
    bereiche: bereiche,
    karten: karten,
    anzahl: karten.length
  };
}

function geschichtenAusSchluesseln(schluessel) {
  const ids = [];
  (schluessel || []).forEach(function (s) {
    if (String(s).indexOf("geschichte|") === 0) {
      ids.push(String(s).slice("geschichte|".length));
    }
  });
  return ids;
}

/* geschichten der letzten Sätze merken – damit sie nicht bald
   noch einmal kommen. Nicht zu viele auf einmal ausschießen, sonst
   geht einer Welt irgendwann die Vorlagen aus. */
function geschichtenAusschluss(ausschluss) {
  const daten = speicher.daten();
  // Die Set-Historie ist älteste zuerst, der Generator erwartet neueste zuerst.
  const ids = geschichtenAusSchluesseln(ausschluss || daten.vortagSchluessel)
    .reverse().concat(daten.zuletzt || []);
  return Array.from(new Set(ids)).slice(0, 30);
}

function neuesTagesSet() {
  const daten = speicher.daten();
  /* Ein beendeter oder verworfener Set kommt in die Ausschlussliste –
     seine Aufgaben soll es an diesem Tag nicht zweimal geben. */
  const alt = schluesselDerSetRunde(daten.tagesSet && daten.tagesSet.runde);
  const ausschluss = (daten.vortagSchluessel || []).concat(alt).slice(-300);
  const aufgaben = window.AUFGABEN.erzeugeRunde({
    divisionMitRestAktiv: EINSTELLUNGEN.divisionMitRestAktiv,
    ausschliessen: ausschluss
  });
  const geschichten = window.GESCHICHTEN.erzeugeGeschichten({
    anzahl: EINSTELLUNGEN.geschichtenAnzahl,
    modus: modus,
    name: SPIELERIN,
    zuletzt: geschichtenAusschluss(ausschluss)
  });
  const bereiche = aufgaben.bereiche.concat([{
    bereich: "geschichte",
    titel: "Rechengeschichten",
    untertitel: "Lies die Geschichte genau und rechne dann.",
    aufgaben: geschichten
  }]);
  // Erst nach vollständiger Erzeugung den bisherigen Spielstand ersetzen.
  daten.vortagSchluessel = ausschluss;
  daten.tagesSet = {
    id: new Date().toISOString() + "-" + Math.random().toString(36).slice(2),
    gestartetAm: Date.now(),
    datum: heutigesDatum(),
    welt: modus,
    fertig: false,
    runde: { bereiche: bereiche },
    antworten: {},
    abschnitt: 0
  };
  speicher.speichere();
  sync.nachAenderung(true);
  return rundeAusSet(daten.tagesSet);
}

/* Ein noch offenes Quiz wird – auch an Folgetagen – mit allen Antworten
   fortgesetzt. Erst nach Abschluss (oder wenn keines offen ist) entsteht ein
   frisches Set. */
function starteTagesRunde() {
  const daten = speicher.daten();
  const set = daten.tagesSet;
  if (set && !set.fertig && set.runde && Array.isArray(set.runde.bereiche)) {
    return rundeAusSet(set);
  }
  return neuesTagesSet();
}

/* Alle jetzigen Eingaben der Tagesrunde im Speicher ablegen. */
function sichereTagesAntworten(aufgeschoben) {
  const daten = speicher.daten();
  const set = runde?.bonusSet ? daten.bonusSet : daten.tagesSet;
  if (!set || (set !== runde?.tagesSet && set !== runde?.bonusSet)) {
    return;
  }
  bucheUebezeit();
  if (runde.uebezeiten) { set.uebezeiten = { ...runde.uebezeiten }; }
  const antworten = (set.antworten && typeof set.antworten === "object")
    ? set.antworten : (set.antworten = {});
  let geaendert = false;
  runde.karten.forEach(function (karte) {
    const teile = kartenEingaben.get(karte.ident);
    if (!teile) {
      return;
    }
    let alleLeer = true;
    const werte = teile.map(function (knoten) {
      const wert = String(knoten.value || "");
      if (wert.trim() !== "") {
        alleLeer = false;
      }
      return wert;
    });
    if (alleLeer) {
      if (Object.hasOwn(antworten, karte.ident)) { geaendert = true; }
      delete antworten[karte.ident];
    } else {
      const alt = antworten[karte.ident];
      if (!alt || alt.length !== werte.length || werte.some((wert, i) => wert !== alt[i])) { geaendert = true; }
      antworten[karte.ident] = werte;
    }
  });
  if (geaendert) { set.antwortenZeit = Date.now(); }
  set.abschnitt = abschnittZeiger;
  speicher.speichere(aufgeschoben === true);
  // Beim Tippen nur geplant (höchstens einmal pro Minute), nicht sofort.
  sync.nachAenderung(false);
}

/* --- die Bonuswelt: nur Knobelaufgaben, nie mehr als die offenen Plätze --- */

function baueBonusRunde(welt, neuerVersuch = false) {
  const offen = bonusPlaetzeHeute();
  if (offen <= 0) {
    // Tageskontingent erschöpft: keine belohnungslose Bonusrunde bauen.
    return null;
  }
  const daten = speicher.daten();
  const heute = heutigesDatum();
  const vorhanden = daten.bonusSet;
  if (!neuerVersuch && vorhanden?.datum === heute && vorhanden.welt === welt && !vorhanden.fertig) {
    return rundeAusBonusSet(vorhanden, daten.runden);
  }
  const anzahl = offen;
  const aufgaben = window.AUFGABEN.erzeugeBonus(anzahl, welt, daten.knobelZuletzt);
  // merken, welche Knobelaufgaben Emma gerade bekam – die kommen so schnell nicht wieder
  daten.knobelZuletzt = aufgaben
    .map(function (aufgabe) { return aufgabe.schluessel; })
    .concat(daten.knobelZuletzt || [])
    .slice(0, EINSTELLUNGEN.knobelMerken);
  const bereiche = [{
    bereich: "bonus",
    titel: "Bonuswelt " + WELT_NAMEN[welt],
    untertitel: "Knobelaufgaben zum Feilen und Tüfteln. Hier gibt es nichts rot – " +
      "jede richtige Aufgabe bringt einen Bonusstern 🌟. " +
      "Heute sind noch " + offen + " von " + EINSTELLUNGEN.bonusSterneProTag +
      " Bonussternen zu holen.",
    aufgaben: aufgaben
  }];
  const set = {
    id: new Date().toISOString() + "-" + Math.random().toString(36).slice(2),
    datum: heute, welt: welt, fertig: false,
    runde: { bereiche: bereiche }, antworten: {}, abschnitt: 0, belohnt: []
  };
  daten.bonusSet = set;
  speicher.speichere();
  sync.nachAenderung(true);
  return rundeAusBonusSet(set, daten.runden);
}

function rundeAusBonusSet(set, historie) {
  const spielrunde = rundeAusSet(set);
  delete spielrunde.tagesSet;
  spielrunde.bereichsArt = "bonus";
  spielrunde.bonusDatum = set.datum;
  spielrunde.bonusSet = set;
  spielrunde.bonusAuswertung = {
    belohnt: new Set(set.belohnt),
    statistik: historie.find(eintrag => eintrag.bonus && eintrag.bonusId === set.id) || null
  };
  return spielrunde;
}

/* ------------- Aufgaben auf der Seite anzeigen ------------- */

function zeigeRunde(neueRunde) {
  pausiereUebezeit();
  runde = neueRunde;
  // Die Aufgabenwelt gehört zur Runde, nicht zur zuletzt angeklickten Auswahl.
  runde.welt = runde.welt || modus;
  setzeModus(runde.welt);
  eingabeZuFeld = new Map();
  kartenEingaben = new Map();
  fertigAnsicht = false;
  abgabeBestaetigt = false;
  abschnittsModusAktiv = (runde.bereichsArt === "tages" || runde.bereichsArt === "uebungen");
  abschnittZeiger = 0;
  const behaelter = document.getElementById("bereiche");
  /* Alte Runde komplett verschwinden lassen (auch aus dem Speicher-Gedächtnis). */
  bereichsKnoten.forEach(function (knoten) {
    knoten.hidden = true;
  });
  behaelter.textContent = "";

  if (runde.bereichsArt === "bonus") {
    behaelter.appendChild(element("p", "bonus-start-hinweis",
      "Willkommen in der Bonuswelt " + WELT_NAMEN[runde.welt] + "! " + bonusTagesText() +
      " Hier wird nichts rot – einfach knobeln und staunen."));
  }

  bereichsKnoten = runde.bereiche.map(function (bereich) {
    return behaelter.appendChild(baueBereich(bereich));
  });

  /* Gespeicherte Antworten wieder eintragen. */
  const set = runde.tagesSet || runde.bonusSet;
  if (set && set.antworten) {
    runde.karten.forEach(function (karte) {
      const werte = set.antworten[karte.ident];
      const teile = kartenEingaben.get(karte.ident);
      const belohnt = Boolean(runde.bonusAuswertung?.belohnt.has(karte.ident));
      if (Array.isArray(werte) && Array.isArray(teile)) {
        werte.forEach(function (wert, stelle) {
          if (teile[stelle]) {
            teile[stelle].value = wert;
            if (belohnt) { teile[stelle].disabled = true; }
          }
        });
      }
      if (belohnt) {
        const kasten = document.querySelector('[data-karten-id="' + karte.ident + '"]');
        if (kasten) {
          kasten.classList.add("richtig", "bonus-punkt");
          const kontrolle = kasten.querySelector(".kontrolle");
          if (kontrolle) {
            kontrolle.textContent = "";
            kontrolle.appendChild(element("span", "markierung", "🌟 Toll geknobelt!"));
          }
        }
      }
    });
    const gemerkt = Number(set.abschnitt) || 0;
    abschnittZeiger = Math.max(0, Math.min(runde.bereiche.length - 1, gemerkt));
  }

  zeigeAbschnitt(abschnittZeiger);

  document.getElementById("ergebnisKasten").hidden = true;
  document.getElementById("ergebnisKasten").textContent = "";
  aktualisiereFortschritt();
  zeigeBildschirm("uebungsBildschirm");
}

/* Ein Bereich wird gezeigt, die anderen bleiben eingeklappt. */
function zeigeAbschnitt(stelle) {
  if (!runde) {
    return;
  }
  const letzte = runde.bereiche.length - 1;
  const lief = !!uebezeitSegment;
  if (lief) { bucheUebezeit(); }
  abschnittZeiger = Math.max(0, Math.min(letzte, stelle));
  if (lief) { uebezeitSegment.bereich = runde.bereiche[abschnittZeiger].bereich; }
  bereichsKnoten.forEach(function (knoten, nr) {
    knoten.hidden = abschnittsModusAktiv && !fertigAnsicht && nr !== abschnittZeiger;
  });
  aktualisiereAbschnittsNav();
  aktualisiereKnopfLeiste();
  aktualisiereFortschritt();
  sichereTagesAntworten();
  if (typeof window.scrollTo === "function") {
    window.scrollTo(0, 0);
  }
}

const BEREICH_KURZ = {
  add: "Addition", sub: "Subtraktion", mul: "Multiplikation", div: "Division",
  raetsel: "Rätsel", geschichte: "Geschichten", wiederholung: "Wiederholung"
};

function aktualisiereAbschnittsNav() {
  const nav = document.getElementById("abschnittsNav");
  if (!nav) {
    return;
  }
  if (!runde || !abschnittsModusAktiv || fertigAnsicht || runde.bereiche.length < 2) {
    nav.hidden = true;
    nav.textContent = "";
    return;
  }
  nav.hidden = false;
  nav.textContent = "";
  runde.bereiche.forEach(function (bereich, nr) {
    const punkt = element("button", "abschnitts-punkt" + (nr === abschnittZeiger ? " aktuell" : ""),
      BEREICH_KURZ[bereich.bereich] || bereich.titel);
    punkt.type = "button";
    punkt.title = bereich.titel;
    if (nr === abschnittZeiger) { punkt.setAttribute("aria-current", "step"); }
    punkt.addEventListener("click", function () {
      zeigeAbschnitt(nr);
    });
    nav.appendChild(punkt);
  });
}

/* Nach dem Fertig: keine Eingabe mehr veränderbar. */
function sperreEingaben() {
  kartenEingaben.forEach(function (teile) {
    teile.forEach(function (knoten) {
      knoten.disabled = true;
    });
  });
}

function aktualisiereKnopfLeiste() {
  const pruefen = document.getElementById("pruefenKnopf");
  const zurueck = document.getElementById("zurueckKnopf");
  const neu = document.getElementById("neuKnopf");
  if (fertigAnsicht) {
    pruefen.hidden = true;
    zurueck.hidden = true;
    neu.hidden = istTagesRunde() ? false : true;
    neu.textContent = "Neuer Versuch";
  } else if (abschnittsModusAktiv) {
    zurueck.hidden = abschnittZeiger === 0;
    pruefen.hidden = false;
    pruefen.textContent = abschnittZeiger >= runde.bereiche.length - 1 ? "Fertig ✓" : "Weiter ▶";
    neu.hidden = true;
  } else {
    zurueck.hidden = true;
    const bonusFertig = Boolean(runde && runde.bereichsArt === "bonus" &&
      ((runde.bonusSet && runde.bonusSet.fertig) ||
        (runde.bonusAuswertung && runde.bonusAuswertung.belohnt.size >= runde.karten.length) ||
        bonusPlaetzeHeute() <= 0));
    pruefen.hidden = bonusFertig;
    pruefen.textContent = "Prüfen";
    // Ohne offene Bonussternen bringt eine weitere Bonusrunde keinen Stern.
    neu.hidden = bonusPlaetzeHeute() <= 0;
    neu.textContent = "Neue Aufgaben";
  }
}

function baueBereich(bereich) {
  const abschnitt = element("section", "bereich bereich-" + bereich.bereich);

  const kopf = element("div", "bereich-kopf");
  kopf.appendChild(figurBild(
    bereich.bereich === "raetsel" ? "wuerfel"
      : themenSymbol()
  ));
  kopf.appendChild(element("h2", null, bereich.titel));
  kopf.appendChild(element("span", "zaehler",
    bereich.aufgaben.length + (bereich.aufgaben.length === 1 ? " Aufgabe" : " Aufgaben")));
  abschnitt.appendChild(kopf);
  abschnitt.appendChild(element("p", "bereich-untertitel", bereich.untertitel));

  let raster = null;
  bereich.aufgaben.forEach(function (karte) {
    if (karte.layout === "text") {
      abschnitt.appendChild(baueGeschichte(karte));
      return;
    }
    if (!raster) {
      raster = element("div", "aufgaben-raster");
      abschnitt.appendChild(raster);
    }
    raster.appendChild(baueAufgabe(karte));
  });
  return abschnitt;
}

function neuesEingabefeld(feld, karte) {
  if (feld.auswahl) {
    const auswahl = element("select", "eingabe geschichte-auswahl");
    auswahl.setAttribute("aria-label", "Antwort auswählen");
    auswahl.setAttribute("aria-describedby", karte.ident + "-text");
    const leer = element("option", null, "Bitte auswählen …");
    leer.value = "";
    auswahl.appendChild(leer);
    feld.auswahl.forEach(function (text, index) {
      const option = element("option", null, text);
      option.value = String(index + 1);
      auswahl.appendChild(option);
    });
    auswahl.addEventListener("change", function () {
      aktualisiereFortschritt();
      sichereTagesAntworten();
    });
    eingabeZuFeld.set(feld, auswahl);
    eingabeRegistrieren(karte, auswahl);
    return auswahl;
  }
  if (feld.typ === "geld") {
    return neuesGeldEingabefeld(feld, karte);
  }
  const feldknoten = element("input", "eingabe");
  feldknoten.type = "text";
  // Zeitangaben brauchen ein Trennzeichen (":", ".", ",") – keine reine Zifferntastatur.
  feldknoten.inputMode = feld.typ === "zeit" ? "text" : "numeric";
  feldknoten.autocomplete = "off";
  feldknoten.spellcheck = false;
  feldknoten.dataset.kartenId = karte.ident;
  if (feld.typ === "zeit") {
    feldknoten.classList.add("mittel");
    feldknoten.placeholder = "8:45";
    feldknoten.setAttribute("aria-label", "Uhrzeit");
  } else if (feld.beschriftung === "Rest") {
    feldknoten.setAttribute("aria-label", "Rest");
  } else {
    feldknoten.placeholder = "?";
    feldknoten.setAttribute("aria-label", "Antwort");
  }
  verbindeEingabe(feldknoten);
  eingabeZuFeld.set(feld, feldknoten);
  eingabeRegistrieren(karte, feldknoten);
  return feldknoten;
}

/* Merkt sich alle Eingabefelder einer Karte (in Anzeigereihenfolge),
   damit man Antworten speichern und wieder eintragen kann. */
function eingabeRegistrieren(karte, knoten) {
  const liste = kartenEingaben.get(karte.ident) || [];
  liste.push(knoten);
  kartenEingaben.set(karte.ident, liste);
}

/* Geld-Aufgaben bekommen zwei Felder: [Euro] € [Cent] Cent.
   Zusammen bleiben sie ein Aufgabenfeld – ausgefuellt zaehlt das,
   sobald in einem der beiden etwas steht. */
function neuesGeldEingabefeld(feld, karte) {
  const rahmen = element("span", "geld-eingabe");
  rahmen.dataset.kartenId = karte.ident;
  rahmen.appendChild(neuesGeldTeil(karte, "euro", "?", 3, "Antwort in Euro"));
  rahmen.appendChild(element("span", "geld-zeichen", "\u20AC"));
  rahmen.appendChild(neuesGeldTeil(karte, "cent", "?", 2, "Antwort in Cent"));
  rahmen.appendChild(element("span", "geld-zeichen", "Cent"));
  eingabeZuFeld.set(feld, rahmen);
  return rahmen;
}

function neuesGeldTeil(karte, rolle, platzhalter, laenge, ariaText) {
  const knoten = element("input", "eingabe geld-teil");
  knoten.type = "text";
  knoten.inputMode = "numeric";
  knoten.autocomplete = "off";
  knoten.spellcheck = false;
  knoten.maxLength = laenge;
  knoten.placeholder = platzhalter;
  knoten.dataset.kartenId = karte.ident;
  knoten.dataset.geldRolle = rolle;
  knoten.setAttribute("aria-label", ariaText);
  verbindeEingabe(knoten);
  eingabeRegistrieren(karte, knoten);
  return knoten;
}

/* Eingabefelder koennen mit Enter und den Cursortasten gewechselt werden:
   rauf/unterspringt immer ins Nachbarfeld, links/rechts nur am Feldrand.
   Antworten werden bei input sofort im Arbeitsspeicher aktualisiert und
   gebündelt geschrieben; blur und das Verlassen der Seite schreiben sofort. */
function verbindeEingabe(knoten) {
  knoten.addEventListener("input", function () {
    aktualisiereFortschritt();
    sichereTagesAntworten(true);
  });
  knoten.addEventListener("blur", sichereTagesAntworten);
  knoten.addEventListener("keydown", function (ereignis) {
    if (ereignis.key === "Enter" || ereignis.key === "ArrowDown") {
      ereignis.preventDefault();
      springeNachbar(knoten, 1);
    } else if (ereignis.key === "ArrowUp") {
      ereignis.preventDefault();
      springeNachbar(knoten, -1);
    } else if (ereignis.key === "ArrowRight" && amFeldende(knoten)) {
      ereignis.preventDefault();
      springeNachbar(knoten, 1);
    } else if (ereignis.key === "ArrowLeft" && amFeldanfang(knoten)) {
      ereignis.preventDefault();
      springeNachbar(knoten, -1);
    }
  });
}

function amFeldanfang(knoten) {
  return typeof knoten.selectionStart !== "number" || knoten.selectionStart === 0;
}

function amFeldende(knoten) {
  if (typeof knoten.selectionStart !== "number") {
    return true;
  }
  return knoten.selectionStart === String(knoten.value || "").length;
}

/* Sprung ins Nachbarfeld –felder in ausgeblendeten Bereichen werden übersprungen. */
function springeNachbar(knoten, richtung) {
  const alle = Array.prototype.slice.call(document.querySelectorAll(".eingabe"))
    .filter(istInZeigbaremBereich);
  const stelle = alle.indexOf(knoten);
  const ziel = stelle >= 0 ? alle[stelle + richtung] : null;
  if (ziel) {
    ziel.focus();
    if (typeof ziel.select === "function") { ziel.select(); }
  }
}

function istInZeigbaremBereich(knoten) {
  let aktuelles = knoten;
  while (aktuelles) {
    if (aktuelles.hidden) {
      return false;
    }
    aktuelles = aktuelles.parentNode || null;
  }
  return true;
}

function baueAufgabe(karte) {
  const kasten = element("div", "aufgabe");
  kasten.dataset.kartenId = karte.ident;

  if (karte.layout === "rest") {
    kasten.appendChild(rechnungsReihe([
      ausdruck(karte.darstellung),
      neuesEingabefeld(karte.felder[0], karte)
    ]));
    kasten.appendChild(rechnungsReihe([
      element("span", "rand", "Rest"),
      neuesEingabefeld(karte.felder[1], karte)
    ]));
  } else if (karte.layout === "luecke") {
    kasten.appendChild(rechnungsReihe([ausdruck(karte.darstellung)]));
    kasten.appendChild(rechnungsReihe([
      element("span", "rand", karte.felder[0].beschriftung || "\u25A1 ="),
      neuesEingabefeld(karte.felder[0], karte)
    ]));
  } else {
    kasten.appendChild(rechnungsReihe([
      ausdruck(karte.darstellung),
      neuesEingabefeld(karte.felder[0], karte)
    ]));
  }

  // Umkehraufgabe (gehört zur gleichen Aufgabe)
  if (karte.felder.length > 1 && karte.felder[1].darstellung) {
    const umkehr = element("div", "umkehr");
    umkehr.appendChild(element("span", "rand", karte.felder[1].beschriftung || "Umkehraufgabe"));
    umkehr.appendChild(rechnungsReihe([
      ausdruck(karte.felder[1].darstellung),
      neuesEingabefeld(karte.felder[1], karte)
    ]));
    kasten.appendChild(umkehr);
  }

  kasten.appendChild(element("div", "kontrolle"));
  return kasten;
}

/* Der Text der Rechnung; lange Ausdrücke bekommen eine kleinere Schrift. */
function ausdruck(text) {
  const klasse = text.length > 13 ? "ausdruck sehr-lang"
    : text.length > 9 ? "ausdruck lang" : "ausdruck";
  return element("span", klasse, text);
}

function rechnungsReihe(kinder) {
  const reihe = element("div", "rechnung");
  kinder.forEach(function (kind) {
    reihe.appendChild(kind);
  });
  return reihe;
}

const GESCHICHTEN_MOTIVE = {
  "verschenken": "geschenk", "keepy-uppy": "motiv-ballons",
  "beim-backen": "motiv-feier", "puppenhaus-aufraeumen": "motiv-kiste",
  "packungen-dann-weg": "motiv-kiste", "kisten-stapeln": "motiv-kiste",
  "tueten-gruppen": "motiv-kiste", "parkplaetze-frei": "motiv-auto",
  "hundehaus-modenschau": "motiv-pfote", "quietschtiere": "motiv-pfote",
  "sitzreihen-kino": "motiv-karte", "geld-kinokarten": "motiv-karte",
  "uhr-film-dauer": "motiv-karte",
  "geld-zwei-eis": "motiv-eis", "geld-eis-rest": "motiv-eis",
  "alter-rueckwaerts": "motiv-feier", "aufzug-mindestfahrten": "motiv-aufzug",
  "tretboote-volle-gruppen": "motiv-boot", "zahlenweg-huepfen": "motiv-zahlenweg",
  "rechnung-basteltisch": "motiv-basteln", "rechenart-fest": "motiv-ballons",
  "geld-riesenrad-gruppe": "motiv-riesenrad", "geld-muenzbeutel": "motiv-geld"
};

function baueGeschichte(karte) {
  const kasten = element("div", karte.bereich === "bonus" ? "geschichte knobel" : "geschichte");
  kasten.dataset.kartenId = karte.ident;
  const kopf = element("div", "geschichte-kopf");
  const bild = element("span", "geschichte-bild");
  bild.setAttribute("aria-hidden", "true");
  bild.appendChild(figurBild(geschichtenFigur(karte)));
  const vorlage = typeof karte.vorlage === "string" ? karte.vorlage : "";
  const motiv = GESCHICHTEN_MOTIVE[vorlage] ||
    (vorlage.startsWith("uhr-") ? "motiv-uhr" : vorlage.startsWith("geld-") ? "motiv-geld" : "motiv-basteln");
  bild.appendChild(symbol(motiv, "geschichte-motiv"));
  kopf.appendChild(bild);
  const text = element("p", "geschichte-text", karte.text);
  text.id = karte.ident + "-text";
  kopf.appendChild(text);
  kasten.appendChild(kopf);

  const zeile = element("div", "geschichte-zeile");
  const feld = karte.felder[0];
  if (karte.frage) {
    zeile.appendChild(element("span", "rand", karte.frage));
  }
  zeile.appendChild(neuesEingabefeld(feld, karte));
  const hinweis = feld.einheit
    ? "Antwort in " + feld.einheit
    : (karte.frage || "");
  if (hinweis && karte.frage) {
    // Die Frage wurde schon links vom Feld gezeigt – nicht doppelt.
  } else if (hinweis) {
    zeile.appendChild(element("span", "rand", hinweis));
  }
  kasten.appendChild(zeile);
  kasten.appendChild(element("div", "kontrolle"));
  return kasten;
}

/* ------------- Fortschritt ------------- */

/* Ist die Karte vollständig ausgefüllt? Bei Geld genügt eines der beiden
   Teilfelder, sonst müssen alle Felder (auch die Umkehraufgabe) gefüllt sein. */
function karteIstAusgefuellt(karte) {
  return karte.felder.every(function (feld) {
    const feldknoten = eingabeZuFeld.get(feld);
    if (!feldknoten) {
      return false;
    }
    if (feld.typ === "geld") {
      return Array.prototype.some.call(feldknoten.querySelectorAll(".geld-teil"), function (teil) {
        return teil.value.trim() !== "";
      });
    }
    return feldknoten.value.trim() !== "";
  });
}

function aktualisiereFortschritt() {
  if (!runde) {
    return;
  }
  const bereich = (abschnittsModusAktiv && !fertigAnsicht)
    ? runde.bereiche[abschnittZeiger] : null;
  const karten = bereich ? bereich.aufgaben : runde.karten;
  const ausgefuellt = karten.filter(karteIstAusgefuellt).length;
  const abschnittsInfo = bereich
    ? "Abschnitt " + (abschnittZeiger + 1) + " von " + runde.bereiche.length +
      " · " + bereich.titel + " – "
    : "";
  document.getElementById("fortschritt").textContent =
    abschnittsInfo + ausgefuellt + " von " + karten.length + " Aufgaben ausgefüllt";
}

/* ------------- Prüfen ------------- */

/* Prueft ein Eingabefeld und faerbt es ein. Bei Geld werden beide
   Teilfelder (Euro und Cent) gemeinsam richtig bzw. falsch. */
function bewerteEingabeFeld(feld, feldknoten, falschKlasse) {
  const teile = feld.typ === "geld"
    ? Array.prototype.slice.call(feldknoten.querySelectorAll(".geld-teil"))
    : [feldknoten];
  teile.forEach(function (knoten) {
    knoten.classList.remove("richtig", "falsch", "knobel-offen");
  });

  let richtig;
  if (feld.typ === "geld") {
    const wert = geldWertAus(feldknoten);
    richtig = wert !== null && wert === feld.geld.cent;
  } else {
    richtig = feldIstRichtig(feld, feldknoten.value);
  }
  teile.forEach(function (knoten) {
    knoten.classList.add(richtig ? "richtig" : falschKlasse);
  });
  return richtig;
}

function pruefeRunde() {
  if (!runde || fertigAnsicht) {
    return;
  }
  if (runde.bereichsArt === "bonus") {
    pruefeBonusRunde();
    return;
  }
  /* Eine bereits abgeschlossene Tagesrunde darf niemals ein zweites Mal
     bewertet werden – auch dann nicht, wenn sie erneut angezeigt wurde. */
  if (runde.abgeschlossen) {
    return;
  }
  if (istTagesRunde()) {
    const gespeichertesSet = speicher.daten().tagesSet;
    if (gespeichertesSet && gespeichertesSet.fertig) {
      return;
    }
  }
  /* Sobald auch nur eine Aufgabe unbeantwortet ist, darf die Runde nicht ohne
     ausdrückliche Bestätigung abgeschlossen werden. */
  if (!abgabeBestaetigt) {
    const gesamtKarten = runde.karten.length;
    const offen = runde.karten.filter(function (karte) {
      return !karteIstAusgefuellt(karte);
    }).length;
    if (gesamtKarten > 0 && offen > 0) {
      zeigeFrage({
        titel: "Runde abschließen?",
        text: "Du hast noch " + offen + " von " + gesamtKarten + " Aufgaben offen. " +
          "Wenn du jetzt abschließt, kannst du sie nicht mehr ausfüllen. " +
          "Deine Bonussterne und Gutscheine bleiben erhalten.",
        ja: "Trotzdem abgeben",
        nein: "Weiter üben",
        dann: function () {
          abgabeBestaetigt = true;
          pruefeRunde();
        }
      });
      return;
    }
  }

  let richtig = 0;
  const falschKarten = [];
  const bereichErgebnis = {};

  /* Fertig: ab jetzt werden alle Bereiche gezeigt und nichts mehr bewertet. */
  bereichsKnoten.forEach(function (knoten) {
    knoten.hidden = false;
  });

  runde.karten.forEach(function (karte) {
    const kasten = document.querySelector('[data-karten-id="' + karte.ident + '"]');
    kasten.classList.remove("richtig", "falsch");
    const kontrolle = kasten.querySelector(".kontrolle");
    kontrolle.textContent = "";

    let alleRichtig = true;
    karte.felder.forEach(function (feld) {
      const feldknoten = eingabeZuFeld.get(feld);
      if (!bewerteEingabeFeld(feld, feldknoten, "falsch")) {
        alleRichtig = false;
        kontrolle.appendChild(element("span", "loesung", loesungsText(karte, feld)));
      }
    });

    const ergebnis = bereichErgebnis[karte.bereich] || (bereichErgebnis[karte.bereich] = { richtig: 0, gesamt: 0 });
    ergebnis.gesamt += 1;
    if (alleRichtig) {
      richtig += 1;
      ergebnis.richtig += 1;
      kasten.classList.add("richtig");
      kontrolle.prepend(element("span", "markierung", "Genau!"));
    } else {
      const hatEingabe = (kartenEingaben.get(karte.ident) || []).some(function (knoten) {
        return String(knoten.value || "").trim() !== "";
      });
      kasten.classList.add("falsch");
      kontrolle.prepend(element("span", "markierung",
        hatEingabe ? "Da war ein Fehler." : "Nicht beantwortet."));
      falschKarten.push(karte);
    }
  });

  const gesamt = runde.karten.length;
  const anteil = gesamt > 0 ? richtig / gesamt : 0;
  const lob = lobFuerAnteil(anteil, richtig, gesamt);

  pausiereUebezeit();
  speichernRunde(richtig, gesamt, bereichErgebnis, 0, false);

  /* Die Tagesrunde ist jetzt abgeschlossen: nichts mehr ausbessern. */
  if (istTagesRunde()) {
    const daten = speicher.daten();
    sichereTagesAntworten();
    if (daten.tagesSet) {
      daten.tagesSet.fertig = true;
    }
    speicher.speichere();
  }
  fertigAnsicht = true;
  runde.abgeschlossen = true;
  sperreEingaben();
  aktualisiereAbschnittsNav();
  aktualisiereKnopfLeiste();
  aktualisiereFortschritt();

  /* Nur eine reguläre Quizrunde öffnet die Bonuswelt ab 90 % – auch wenn sie
     an einem früheren Tag begonnen wurde (Abschlusstag zählt). */
  const welt = runde.welt || modus;
  const offenVorher = weltHeuteFreigeschaltet(welt);
  const ebenFreigeschaltet = (istTagesRunde() && richtig / gesamt >= EINSTELLUNGEN.bonusAbAnteil)
    ? schalteWeltFrei(welt) : false;

  zeigeZusammenfassung(richtig, gesamt, lob, falschKarten,
    { ebenFreigeschaltet: ebenFreigeschaltet, weltOffen: offenVorher || ebenFreigeschaltet });

  if (anteil >= 0.8) {
    musik.fanfare(anteil >= EINSTELLUNGEN.bonusAbAnteil ? 5 : 4);
  }
  if (anteil >= EINSTELLUNGEN.bonusAbAnteil && EINSTELLUNGEN.spaessig) {
    sternenRegen();
  }
  aktualisiereWeltwahl();
}

/* --- die Bonuswelt prüfen: nie rot, nie Meckern, Sterne bis zum Tagesdeckel --- */

/* Eine angezeigte Bonusrunde von gestern zählt nach Mitternacht nicht mehr:
   zurück zur Startseite, damit zuerst das heutige Quiz gespielt wird. */
function bonusRundeVonGestern() {
  if (!runde.bonusDatum || runde.bonusDatum === heutigesDatum()) { return false; }
  window.alert("Ein neuer Tag! Spiele zuerst das heutige Mathe-Quiz, um die Bonuswelt zu öffnen.");
  zeigeStartErgebnis();
  zeigeBildschirm("startBildschirm");
  return true;
}

function pruefeBonusRunde() {
  if (bonusRundeVonGestern()) { return; }
  // Gehört zur laufenden Bonusrunde und bleibt bei erneutem Prüfen erhalten.
  const auswertung = runde.bonusAuswertung || (runde.bonusAuswertung = {
    belohnt: new Set(), statistik: null
  });
  let bonusRichtig = 0;
  const neuRichtig = [];
  const kartenRichtig = new Map();
  runde.karten.forEach(function (karte) {
    const kasten = document.querySelector('[data-karten-id="' + karte.ident + '"]');
    kasten.classList.remove("richtig", "falsch", "bonus-punkt", "bonus-offen");
    const kontrolle = kasten.querySelector(".kontrolle");
    kontrolle.textContent = "";

    const schonBelohnt = auswertung.belohnt.has(karte.ident);
    let alleRichtig = true;
    if (!schonBelohnt) {
      karte.felder.forEach(function (feld) {
        const feldknoten = eingabeZuFeld.get(feld);
        // Beim Bonus wird nichts rot markiert – es heißt nur "Knobel weiter!".
        if (!bewerteEingabeFeld(feld, feldknoten, "knobel-offen")) {
          alleRichtig = false;
        }
      });
    }

    kartenRichtig.set(karte.ident, alleRichtig);
    if (alleRichtig) {
      bonusRichtig += 1;
      if (!schonBelohnt) {
        neuRichtig.push(karte);
      }
    }
  });

  const offenVorher = bonusPlaetzeHeute();
  const vergeben = Math.min(neuRichtig.length, offenVorher);

  const daten = speicher.daten();
  if (vergeben > 0) {
    neuRichtig.slice(0, vergeben).forEach(function (karte) {
      auswertung.belohnt.add(karte.ident);
      // Erarbeitete Lösungen bleiben sichtbar und können nicht verloren gehen.
      (kartenEingaben.get(karte.ident) || []).forEach(function (knoten) {
        knoten.disabled = true;
      });
    });
    holBonusTag().verteilt += vergeben;
    const vorher = daten.bonusGesamt;
    daten.bonusGesamt += vergeben;
    for (let stufe = naechsteBonusStufe(vorher); stufe <= daten.bonusGesamt; stufe += BONUS_STUFEN_SCHRITT) {
      daten.bonusStufenOffen.push(stufe);
    }
    aktualisiereBonusAnzeige();
  }

  runde.karten.forEach(function (karte) {
    const kasten = document.querySelector('[data-karten-id="' + karte.ident + '"]');
    const kontrolle = kasten.querySelector(".kontrolle");
    if (kartenRichtig.get(karte.ident)) {
      kasten.classList.add("richtig", "bonus-punkt");
      kontrolle.prepend(element("span", "markierung", "🌟 Toll geknobelt!"));
    } else {
      kasten.classList.add("bonus-offen");
      kontrolle.prepend(element("span", "markierung", "Knobel ein anderes Mal weiter!"));
    }
  });

  if (runde.bonusSet) {
    runde.bonusSet.belohnt = [...auswertung.belohnt];
    runde.bonusSet.fertig = bonusRichtig === runde.karten.length || bonusPlaetzeHeute() === 0;
    sichereTagesAntworten(true);
  }

  // Genau ein Statistikdatensatz pro Bonusrunde, auch bei späteren Korrekturen.
  bucheUebezeit();
  if (!auswertung.statistik) {
    speichernRunde(vergeben, runde.karten.length, {}, vergeben, true);
    auswertung.statistik = daten.runden[daten.runden.length - 1];
  } else {
    auswertung.statistik.richtig += vergeben;
    auswertung.statistik.bonusRichtig += vergeben;
    auswertung.statistik.uebezeiten = { ...runde.uebezeiten };
    speicher.speichere();
    sync.nachAenderung(vergeben > 0);
  }
  if (bonusRichtig === runde.karten.length || bonusPlaetzeHeute() === 0) {
    runde.zeitBeendet = true;
    pausiereUebezeit();
  }

  letzteZusammenfassung = {
    richtig: auswertung.belohnt.size, gesamt: runde.karten.length,
    lob: "", falschKarten: [], bonusRunde: true
  };

  const kasten = document.getElementById("ergebnisKasten");
  kasten.textContent = "";
  kasten.hidden = false;
  if (vergeben > 0) {
    kasten.appendChild(element("p", "ergebnis-zeile",
      "🌟 " + vergeben + " Bonusstern" + (vergeben === 1 ? "" : "e") + " geschafft!"));
    if (EINSTELLUNGEN.spaessig) {
      sternenRegen(vergeben === offenVorher);
    }
    musik.fanfare(5);
  } else if (bonusRichtig === runde.karten.length) {
    kasten.appendChild(element("p", "ergebnis-zeile",
      "🌟 Alle Knobelaufgaben dieser Runde sind schon gelöst!"));
  } else {
    kasten.appendChild(element("p", "ergebnis-zeile",
      "Knobel weiter! Beim nächsten Versuch klappt es bestimmt."));
  }
  kasten.appendChild(element("p", "bonus-hinweis", bonusTagesText()));
  kasten.scrollIntoView({ block: "start" });

  aktualisiereWeltwahl();
  // "Neue Aufgaben" verschwindet, sobald das Tageskontingent erschöpft ist.
  aktualisiereKnopfLeiste();
  meldeRueckmeldung((vergeben === 1 ? "1 neuer Bonusstern. " : vergeben + " neue Bonussterne. ") + bonusTagesText());

  if (daten.bonusStufenOffen.length > 0 &&
      document.getElementById("geschenkUeberlagerung").hidden) {
    geschenkAuswahlOeffnen();
  }
}

/* Ein freundlicher Satz, was der Tag an Bonussternen noch bringt. */
function bonusTagesText() {
  const verteilt = holBonusTag().verteilt;
  const offen = EINSTELLUNGEN.bonusSterneProTag - verteilt;
  if (offen <= 0) {
    return "Heute sind alle " + EINSTELLUNGEN.bonusSterneProTag +
      " Bonussterne verteilt. Morgen warten " + EINSTELLUNGEN.bonusSterneProTag + " neue auf dich! 🌟";
  }
  return "Heute sind noch " + offen + " von " + EINSTELLUNGEN.bonusSterneProTag +
    " Bonussternen zu holen (über alle Welten zusammen).";
}

/* Zeigt die richtige Lösung neben einer falsch gerechneten Aufgabe an. */
function loesungsText(karte, feld) {
  if (feld.beschriftung === "Rest") {
    return "Rest " + feld.anzeige;
  }
  if (feld.darstellung) {
    return feld.darstellung.replace("=", "").trim() + " = " + feld.anzeige;
  }
  if (feld.beschriftung) {
    return feld.beschriftung.trim() + " " + feld.anzeige;
  }
  return feld.anzeige;
}

/* Zeile(n) für die Liste „Das kannst du noch üben“. Bei Divisionsrest und
   Lückenaufgaben muss die Lösung als Rest bzw. als Lücke erscheinen, nicht als
   zweites Ergebnis derselben Rechnung. */
function fehlerZeilen(karte) {
  if (karte.layout === "text") {
    return [karte.text];
  }
  if (karte.layout === "rest" && karte.felder.length === 2) {
    return [karte.darstellung.replace("=", "").trim() + " = " +
      karte.felder[0].anzeige + " Rest " + karte.felder[1].anzeige];
  }
  if (karte.layout === "luecke" && karte.felder.length === 1) {
    const gleichung = (karte.darstellung || "").trim();
    const loesung = loesungsText(karte, karte.felder[0]);
    return [gleichung ? gleichung + "  (" + loesung + ")" : loesung];
  }
  return karte.felder.map(function (feld, stelle) {
    if (stelle === 0 && !feld.darstellung && karte.darstellung) {
      return karte.darstellung.replace("=", "").trim() + " = " + feld.anzeige;
    }
    return loesungsText(karte, feld);
  });
}

function lobFuerAnteil(anteil, richtig, gesamt) {
  const hatZahlen = typeof richtig === "number" && typeof gesamt === "number" && gesamt > 0;
  const alleRichtig = hatZahlen ? richtig === gesamt : anteil >= 1;
  const keineRichtig = hatZahlen ? richtig === 0 : anteil <= 0;
  const fehler = hatZahlen ? gesamt - richtig : null;

  if (alleRichtig) {
    return "Alles richtig – fantastisch gemacht, " + SPIELERIN + "!";
  }
  // „Fast alles richtig“: ab 90 % (z. B. 45–49/50, 9/10) oder genau 1 Fehler bei mind. 5 Aufgaben (4/5, 5/6, 7/8).
  if (anteil >= 0.9 || (hatZahlen && gesamt >= 5 && fehler === 1)) {
    return "Fast alles richtig – stark gemacht, " + SPIELERIN + "!";
  }
  if (anteil >= 0.75) {
    return "Das war richtig gut, " + SPIELERIN + "! Weiter so!";
  }
  if (anteil >= 0.55) {
    return fehler === 1
      ? "Schon gut! Die eine Aufgabe üben wir noch einmal."
      : "Schon gut! Schau dir die Fehler noch einmal in Ruhe an.";
  }
  if (anteil >= 0.35) {
    return "Du hast durchgehalten – das zählt. Schau dir in Ruhe an, wo es noch gehakt hat, dann klappt es beim nächsten Mal besser.";
  }
  if (!keineRichtig) {
    return "Ein Anfang ist gemacht – schau dir die Lösungen in Ruhe an und probier es noch einmal. Du schaffst das!";
  }
  return (hatZahlen && gesamt === 1)
    ? "Diesmal hat es noch nicht geklappt – schau dir die Lösung in Ruhe an und probier es noch einmal. Du schaffst das!"
    : "Diesmal hat noch keine Aufgabe geklappt – schau dir die Lösungen in Ruhe an und probier es noch einmal. Du schaffst das!";
}

/* Alles wird angehängt – nichts wird überschrieben. */
function speichernRunde(richtig, gesamt, bereichErgebnis, bonusRichtig, istBonus) {
  const daten = speicher.daten();
  const jetzt = new Date();
  const zeitTeile = wienerDatumTeile(jetzt);
  daten.runden.push({
    zeit: jetzt.toISOString(),
    /* Quizrunden zählen für den Abschlusstag (auch bei mehrtägigen Runden);
       Bonusrunden bleiben an ihren Bonustag gebunden. */
    datum: (istBonus && runde && runde.bonusDatum) || lokalesDatum(jetzt),
    uhrzeit: zeitTeile.hour + ":" + zeitTeile.minute,
    richtig: richtig,
    gesamt: gesamt,
    modus: runde && runde.welt ? runde.welt : modus,
    bonus: !!istBonus,
    ...(istBonus && runde?.bonusSet && { bonusId: runde.bonusSet.id }),
    ...(!istBonus && runde && { wiederholung: runde.bereichsArt === "uebungen" }),
    bonusRichtig: bonusRichtig || 0,
    bereiche: bereichErgebnis,
    ...(runde && runde.uebezeiten && { uebezeiten: { ...runde.uebezeiten } })
  });
  if (daten.runden.length > 1000) {
    daten.runden = daten.runden.slice(-1000); // nur der Schutz vor Speicherplatz-Not
  }
  Object.keys(bereichErgebnis).forEach(function (bereich) {
    const punkt = daten.bereichPunkte[bereich] || (daten.bereichPunkte[bereich] = { richtig: 0, gesamt: 0 });
    punkt.richtig += bereichErgebnis[bereich].richtig;
    punkt.gesamt += bereichErgebnis[bereich].gesamt;
  });
  daten.modus = modus;
  speicher.speichere();
  // Abschluss einer Runde: sofort zum Repository spiegeln.
  sync.nachAenderung(true);
}

function merkeGeschichten(karten) {
  const daten = speicher.daten();
  const ids = karten
    .filter(function (karte) { return karte.vorlage; })
    .map(function (karte) { return karte.vorlage; });
  // Duplikate entfernen: eine Wiederholungsrunde enthält dieselben Vorlagen erneut.
  daten.zuletzt = Array.from(new Set(ids.concat(daten.zuletzt)))
    .slice(0, EINSTELLUNGEN.merkzettelGroesse);
  speicher.speichere();
}

function zeigeZusammenfassung(richtig, gesamt, lob, falschKarten, hinweise) {
  const aufgabenWort = gesamt === 1 ? "Aufgabe" : "Aufgaben";
  meldeRueckmeldung(richtig + " von " + gesamt + " " + aufgabenWort + " richtig.");
  letzteZusammenfassung = {
    richtig: richtig,
    gesamt: gesamt,
    lob: lob,
    falschKarten: falschKarten
  };
  const kasten = document.getElementById("ergebnisKasten");
  kasten.textContent = "";
  kasten.hidden = false;

  kasten.appendChild(element("p", "ergebnis-zeile",
    "Du hast " + richtig + " von " + gesamt + " " + aufgabenWort + " richtig!"));
  kasten.appendChild(element("p", "ergebnis-lob", lob));

  /* Freundlicher Hinweis zur Bonuswelt dieser Welt */
  const offen = (hinweise && hinweise.weltOffen) || weltHeuteFreigeschaltet(modus);
  if (hinweise && hinweise.ebenFreigeschaltet) {
    kasten.appendChild(element("p", "bonus-hinweis",
      "🌟 Super! Die Bonuswelt " + WELT_NAMEN[modus] + " ist jetzt für heute offen – " +
      "auf der Startseite steht jetzt deine Bonuswelt!"));
  } else if (offen) {
    kasten.appendChild(element("p", "bonus-hinweis",
      "🌟 Die Bonuswelt " + WELT_NAMEN[modus] + " ist heute weiterhin offen."));
  } else if (istTagesRunde()) {
    const ziel = Math.ceil(gesamt * EINSTELLUNGEN.bonusAbAnteil);
    const fehlen = ziel - richtig;
    kasten.appendChild(element("p", "bonus-hinweis",
      "Tipp: Wenn du in " + WELT_NAMEN[modus] + " mindestens " + ziel + " Aufgaben richtig löst, " +
      "öffnet sich die Bonuswelt. Noch " + fehlen +
      (fehlen === 1 ? " richtige Aufgabe" : " richtige Aufgaben") + " – du schaffst das!"));
  }

  if (EINSTELLUNGEN.spaessig) {
    const ecke = element("div", "ergebnis-maskottchen");
    mascottchenAuswahl().forEach(function (figur) {
      const bild = figurBild(figur, "maskottchen-gross" +
        (richtig / gesamt >= EINSTELLUNGEN.bonusAbAnteil ? " purzelbaum" : ""));
      ecke.appendChild(bild);
    });
    kasten.appendChild(ecke);
  }

  if (falschKarten.length > 0) {
    const liste = element("div", "uebe-liste");
    liste.appendChild(element("h3", null, "Das kannst du noch üben"));
    const ul = element("ul");
    falschKarten.slice(0, 14).forEach(function (karte) {
      const zeilen = fehlerZeilen(karte);
      const aufzaehlung = element("li");
      aufzaehlung.appendChild(element("span", null, zeilen.join("   ")));
      ul.appendChild(aufzaehlung);
    });
    if (falschKarten.length > 14) {
      ul.appendChild(element("li", null, "… und noch " + (falschKarten.length - 14) + " weitere"));
    }
    liste.appendChild(ul);
    const knopf = element("button", "knopf", "Nur diese Aufgaben noch einmal üben");
    knopf.type = "button";
    knopf.addEventListener("click", function () {
      const uebeRunde = baueRunde([{
        bereich: "wiederholung",
        titel: "Noch einmal üben",
        untertitel: "Das waren deine Fehler – du schaffst das!",
        aufgaben: letzteZusammenfassung.falschKarten
      }]);
      uebeRunde.bereichsArt = "uebungen";
      zeigeRunde(uebeRunde);
    });
    liste.appendChild(knopf);
    kasten.appendChild(liste);
  }

  kasten.scrollIntoView({ block: "start" });
  merkeGeschichten(runde.karten);
}

/* ------------- Bonussterne und Gutscheine ------------- */

let aktiverDialog = null;
let dialogRuecksprung = null;
let dialogHintergrund = [];

function dialogFelder(dialog) {
  return Array.from(dialog.querySelectorAll("button, [href], input, select, textarea, [tabindex]"))
    .filter(function (knoten) {
      return !knoten.disabled && !knoten.inert && knoten.tabIndex !== -1 && istInZeigbaremBereich(knoten);
    });
}

function dialogFokus(knoten) {
  if (knoten && typeof knoten.focus === "function") { knoten.focus(); }
}

function dialogOeffnen(id) {
  const dialog = document.getElementById(id);
  if (aktiverDialog === dialog) { return; }
  if (aktiverDialog) { dialogSchliessen(aktiverDialog.id); }
  dialogRuecksprung = document.activeElement;
  aktiverDialog = dialog;
  dialog.hidden = false;
  dialogHintergrund = Array.from(document.body.children || []).filter(function (knoten) {
    return knoten !== dialog;
  }).map(function (knoten) {
    const vorher = knoten.inert;
    knoten.inert = true;
    return { knoten: knoten, vorher: vorher };
  });
  const startFokus = {
    versuchUeberlagerung: "versuchAbbrechenKnopf",
    frageUeberlagerung: "frageNeinKnopf"
  }[id];
  dialogFokus(startFokus
    ? document.getElementById(startFokus) : dialogFelder(dialog)[0] || dialog);
}

/* Allgemeine Ja/Nein-Rückfrage: wird vor dem Abgeben einer fast leeren Runde,
   beim Tageswechsel mit noch offenen Antworten und mit optionaler Eltern-Bestätigung
   beim Einlösen von Gutscheinen verwendet. */
let frageAngelegenheit = null;
let frageBrauchtEltern = false;

function frageElternZuruecksetzen() {
  frageBrauchtEltern = false;
  const box = document.getElementById("frageElternPruefung");
  const haken = document.getElementById("frageElternHaken");
  const ja = document.getElementById("frageJaKnopf");
  if (box) { box.hidden = true; }
  if (haken) { haken.checked = false; }
  if (ja) { ja.disabled = false; }
}

function zeigeFrage(optionen) {
  const angaben = optionen || {};
  document.getElementById("frageTitel").textContent = angaben.titel || "Bist du sicher?";
  document.getElementById("frageText").textContent = angaben.text || "";
  const ja = document.getElementById("frageJaKnopf");
  ja.textContent = angaben.ja || "Ja";
  document.getElementById("frageNeinKnopf").textContent = angaben.nein || "Abbrechen";
  frageAngelegenheit = angaben.dann || null;
  frageBrauchtEltern = !!angaben.elternPruefung;
  const box = document.getElementById("frageElternPruefung");
  const haken = document.getElementById("frageElternHaken");
  if (box && haken) {
    box.hidden = !frageBrauchtEltern;
    haken.checked = false;
  }
  ja.disabled = frageBrauchtEltern;
  dialogOeffnen("frageUeberlagerung");
}

function frageSchliessen() {
  dialogSchliessen("frageUeberlagerung");
  frageAngelegenheit = null;
  frageElternZuruecksetzen();
}

function dialogSchliessen(id) {
  const dialog = document.getElementById(id);
  dialog.hidden = true;
  if (aktiverDialog !== dialog) { return; }
  dialogHintergrund.forEach(function (eintrag) { eintrag.knoten.inert = eintrag.vorher; });
  aktiverDialog = null;
  dialogHintergrund = [];
  if (dialogRuecksprung && istInZeigbaremBereich(dialogRuecksprung)) {
    dialogFokus(dialogRuecksprung);
  }
  dialogRuecksprung = null;
}

document.addEventListener("keydown", function (ereignis) {
  if (!aktiverDialog) { return; }
  if (ereignis.key === "Escape") {
    ereignis.preventDefault();
    const id = aktiverDialog.id;
    dialogSchliessen(id);
    if (id === "versuchUeberlagerung") { versuchAngelegenheit = null; }
    if (id === "frageUeberlagerung") { frageAngelegenheit = null; frageElternZuruecksetzen(); }
  } else if (ereignis.key === "Tab") {
    ereignis.preventDefault();
    const felder = dialogFelder(aktiverDialog);
    const position = felder.indexOf(document.activeElement);
    const ziel = ereignis.shiftKey
      ? (position <= 0 ? felder.length - 1 : position - 1)
      : (position + 1) % felder.length;
    dialogFokus(felder[ziel] || aktiverDialog);
  }
});

document.addEventListener("focusin", function (ereignis) {
  if (!aktiverDialog) { return; }
  let knoten = ereignis.target;
  while (knoten && knoten !== aktiverDialog) { knoten = knoten.parentNode; }
  if (!knoten) { dialogFokus(dialogFelder(aktiverDialog)[0] || aktiverDialog); }
});

let geschenkModus = { art: "neu", tauschId: null };
let aktuelleAuswahlListe = [];

function aktuelleWunschListe() {
  const eigen = speicher.daten().wunschListe;
  if (Array.isArray(eigen) && eigen.length > 0) { return eigen; }
  return GESCHENKE;
}

function istFreitextWunsch(geschenk) {
  return !!(geschenk && (geschenk.freitext === true ||
    String(geschenk.text || "").startsWith("Eigener Wunsch")));
}

function geschenkAuswahlOeffnen(modusOptionen, ueberschrift) {
  const optionen = Object.assign({ art: "neu", tauschId: null }, modusOptionen || {});
  const stufe = speicher.daten().bonusStufenOffen[0];
  geschenkModus = optionen;
  const titel = document.getElementById("geschenkTitel");
  const raster = document.getElementById("geschenkeRaster");
  const freitextBox = document.getElementById("geschenkFreitextBox");
  const freitextEingabe = document.getElementById("geschenkFreitextEingabe");
  const freitextLabel = document.getElementById("geschenkFreitextLabel");
  const ueberraschungKnopf = document.getElementById("geschenkUeberraschungKnopf");
  if (freitextBox) { freitextBox.hidden = true; }
  if (freitextEingabe) { freitextEingabe.value = ""; }

  aktuelleAuswahlListe = aktuelleWunschListe();

  titel.textContent = ueberschrift || (optionen.art === "tausch"
    ? "🔄 Was möchtest du stattdessen haben?"
    : stufe ? "🎉 " + stufe + " Bonussterne! Such dir etwas aus!" : "Such dir ein Geschenk aus!");
  raster.textContent = "";
  aktuelleAuswahlListe.forEach(function (geschenk) {
    const karte = element("button", "geschenk-karte");
    karte.type = "button";
    karte.appendChild(symbol("geschenk"));
    karte.appendChild(element("span", "geschenk-text", geschenk.text));
    const freitext = istFreitextWunsch(geschenk);
    karte.appendChild(element("span", "geschenk-waehlen", freitext ? "Selbst aufschreiben ✏️" : "Das möchte ich!"));
    karte.addEventListener("click", function () {
      if (freitext && freitextBox && freitextEingabe) {
        if (freitextLabel) {
          freitextLabel.textContent = "Was ist dein eigener Wunsch?";
        }
        freitextBox.hidden = false;
        dialogFokus(freitextEingabe);
        return;
      }
      geschenkAusgewaehlt(geschenk.text);
    });
    raster.appendChild(karte);
  });
  if (ueberraschungKnopf) {
    const kandidaten = aktuelleAuswahlListe.filter(g => !istFreitextWunsch(g));
    ueberraschungKnopf.hidden = kandidaten.length === 0;
  }
  dialogOeffnen("geschenkUeberlagerung");
  musik.ton("freude");
}

function geschenkFreitextAbsenden() {
  const eingabe = document.getElementById("geschenkFreitextEingabe");
  const text = String((eingabe && eingabe.value) || "").trim();
  geschenkAusgewaehlt(text ? "Eigener Wunsch: " + text : "Eigener Wunsch");
}

function geschenkUeberraschungZiehen() {
  const kandidaten = aktuelleAuswahlListe.filter(g => !istFreitextWunsch(g));
  if (kandidaten.length === 0) { return; }
  const wahl = kandidaten[Math.floor(Math.random() * kandidaten.length)];
  geschenkAusgewaehlt(wahl.text);
}

function geschenkAusgewaehlt(text) {
  if (geschenkModus.art === "tausch") {
    tauschGutscheinEin(geschenkModus.tauschId, text);
  } else {
    geschenkGewaehlt(text);
  }
}

function geschenkGewaehlt(text) {
  const daten = speicher.daten();
  const stufe = daten.bonusStufenOffen[0];
  if (!stufe) { return; }
  daten.geschenke.push({
    id: bonusGutscheinId(stufe),
    zeitpunkt: new Date().toISOString(),
    datum: heutigesDatum(),
    text: text
  });
  daten.bonusStufenOffen.shift();
  speicher.speichere();
  dialogSchliessen("geschenkUeberlagerung");
  aktualisiereGutscheinAnzeige();
  if (!document.getElementById("fortschrittBildschirm").hidden) {
    zeigeFortschritt("geschenke");
    dialogFokus(document.getElementById("fortschrittZurueckKnopf"));
  }
  sync.nachAenderung(true);

  const kasten = document.getElementById("ergebnisKasten");
  if (!kasten.hidden) {
    kasten.appendChild(element("p", "geschenk-hinweis",
      "🎁 Gutschein abgeholt: „" + text + "“ – sag es Mama! Es warten schon wieder neue Bonussterne auf dich."));
  }
  if (EINSTELLUNGEN.spaessig) {
    sternenRegen();
  }
}

/* Umtausch: Der Gutschein behält Kennung, Datum und Position. */
function tauschGutscheinOeffnen(geschenkId) {
  const geschenk = findeGutschein(geschenkId);
  if (!geschenk || !geschenkIstTauschbar(geschenk)) {
    return;
  }
  geschenkAuswahlOeffnen({ art: "tausch", tauschId: geschenkId },
    "🔄 „" + geschenk.text + "“ umtauschen – was möchtest du stattdessen?");
}

function findeGutschein(geschenkId) {
  const daten = speicher.daten();
  for (let i = 0; i < daten.geschenke.length; i++) {
    if (daten.geschenke[i].id === geschenkId) {
      return daten.geschenke[i];
    }
  }
  return null;
}

function tauschGutscheinEin(geschenkId, neueText) {
  const alte = findeGutschein(geschenkId);
  if (!alte || !geschenkIstTauschbar(alte)) {
    return;
  }
  if (alte.text !== neueText) {
    if (alte.id.startsWith("alt-")) {
      alte.urspruenglicherWunsch = alte.urspruenglicherWunsch ?? alte.text;
    }
    alte.text = neueText;
    alte.wunschGeaendertAm = new Date().toISOString();
    speicher.speichere();
    sync.nachAenderung(true);
  }
  dialogSchliessen("geschenkUeberlagerung");
  if (EINSTELLUNGEN.spaessig) {
    sternenRegen();
  }
  zeigeFortschritt("geschenke");
  dialogFokus(document.getElementById("fortschrittZurueckKnopf"));
}

function aktualisiereBonusAnzeige() {
  document.getElementById("bonusSterne").textContent = String(gesamtSterne());
}

function aktualisiereGutscheinAnzeige() {
  const offen = speicher.daten().geschenke.filter(geschenkIstTauschbar).length;
  document.getElementById("offeneGutscheine").textContent = String(offen);
}

/* ------------- Einstellungen ------------- */

const FORTSCHRITT_TABS = {
  sterne: "Bonussterne",
  geschenke: "Gutscheine",
  statistik: "Statistik",
  ton: "Ton & Vorlesen",
  daten: "Spielstand",
  version: "Version"
};

function zeigeFortschritt(tab) {
  pausiereUebezeit();
  const aktuellerTab = tab || "sterne";
  const reiter = document.getElementById("fortschrittReiter");
  if (reiter) {
    reiter.textContent = "";
    Object.keys(FORTSCHRITT_TABS).forEach(function (name) {
      const knopf = element("button", "reiter" + (name === aktuellerTab ? " aktiv" : ""),
        FORTSCHRITT_TABS[name]);
      knopf.type = "button";
      knopf.dataset.reiter = name;
      knopf.setAttribute("aria-pressed", String(name === aktuellerTab));
      knopf.addEventListener("click", function () {
        zeigeFortschritt(name);
      });
      reiter.appendChild(knopf);
    });
  }

  // Es wird immer nur der gewählte Bereich gezeigt – die anderen sind zu.
  const inhalte = {
    sterne: document.getElementById("sterneInhalt"),
    statistik: document.getElementById("statistikInhalt"),
    geschenke: document.getElementById("geschenkeInhalt"),
    ton: document.getElementById("tonInhalt"),
    daten: document.getElementById("spielstandInhalt"),
    version: document.getElementById("versionInhalt")
  };
  Object.keys(inhalte).forEach(function (name) {
    const knoten = inhalte[name];
    knoten.hidden = name !== aktuellerTab;
    if (knoten.hidden) {
      knoten.textContent = "";
    }
  });
  const csvKnopf = document.getElementById("csvKnopf");
  if (csvKnopf) {
    csvKnopf.hidden = aktuellerTab !== "statistik";
  }

  if (aktuellerTab === "statistik") {
    zeigeStatistikInhalt();
  } else if (aktuellerTab === "geschenke") {
    zeigeGeschenkeInhalt();
  } else if (aktuellerTab === "ton") {
    zeigeTonInhalt();
  } else if (aktuellerTab === "daten") {
    zeigeSpielstandInhalt();
  } else if (aktuellerTab === "version") {
    zeigeVersionInhalt();
  } else {
    zeigeSterneInhalt();
  }
  zeigeBildschirm("fortschrittBildschirm");
}

/* Build-Infos zum Gegenprüfen, ob ein Gerät den neuesten Stand hat. */
function zeigeVersionInhalt() {
  const inhalt = document.getElementById("versionInhalt");
  inhalt.textContent = "";
  const karte = element("div", "sterne-karte");
  karte.appendChild(element("h3", null, "Version " + APP_VERSION));
  karte.appendChild(element("p", null,
    "Stand: " + VERSION_STAND + " · Speicherformat: Version " + speicher.daten().version));
  karte.appendChild(element("p", "rand",
    "Wird die App über den Desktop-Starter gestartet, steht die letzte Update-Prüfung " +
    "in starter.log im App-Ordner."));
  inhalt.appendChild(karte);
  const geraet = element("div", "sterne-karte");
  geraet.appendChild(element("h3", null, "Gerät"));
  geraet.appendChild(element("p", "rand",
    (window.navigator && window.navigator.userAgent) || "Browserinformation nicht verfügbar"));
  inhalt.appendChild(geraet);
}

/* Einstellungen für Vorlesestimme und Lautstärken (Sprechtraining + Musik). */
function zeigeTonInhalt() {
  const inhalt = document.getElementById("tonInhalt");
  inhalt.textContent = "";
  sprechAudio.ohneHoerer();

  const stimmeKarte = element("div", "sterne-karte");
  stimmeKarte.appendChild(element("h3", null, "Vorlesestimme (Sprechtraining)"));
  stimmeKarte.appendChild(element("p", "rand",
    "Thorsten und Ramona stecken in der App und brauchen kein Internet. " +
    "Die Systemstimme ist die Sprachausgabe von Windows."));
  const auswahl = element("div", "stufen-gruppe ton-stimmen");
  const aktuell = speicher.daten().vorleseStimme || "thorsten";
  [["thorsten", "Thorsten", "männlich, klare Qualität"],
   ["ramona", "Ramona", "weiblich"],
   ["system", "Systemstimme", "Windows-Sprachausgabe"]].forEach(function (wahl) {
    const knopf = element("button", "stufen-knopf ton-stimme" + (aktuell === wahl[0] ? " aktiv" : ""),
      wahl[1] + "\u00A0· " + wahl[2]);
    knopf.type = "button";
    knopf.setAttribute("aria-pressed", String(aktuell === wahl[0]));
    knopf.addEventListener("click", function () {
      sprechAudio.stoppe();
      speicher.daten().vorleseStimme = wahl[0];
      speicher.speichere();
      zeigeTonInhalt();
    });
    auswahl.appendChild(knopf);
  });
  stimmeKarte.appendChild(auswahl);

  if (aktuell === "system") {
    const stimmen = sprechAudio.systemStimmen();
    const zeile = element("div", "sprech-zeile ton-systemzeile");
    const liste = document.createElement("select");
    liste.className = "ton-stimmenliste";
    liste.setAttribute("aria-label", "Systemstimme wählen");
    if (stimmen.length === 0) {
      liste.disabled = true;
      const leer = document.createElement("option");
      leer.textContent = "Keine deutschen Systemstimmen gefunden";
      liste.appendChild(leer);
      if (window.speechSynthesis && typeof window.speechSynthesis.addEventListener === "function") {
        window.speechSynthesis.addEventListener("voiceschanged", function aktualisiereStimmen() {
          if (typeof window.speechSynthesis.removeEventListener === "function") {
            window.speechSynthesis.removeEventListener("voiceschanged", aktualisiereStimmen);
          }
          if (!inhalt.hidden && speicher.daten().vorleseStimme === "system") {
            zeigeTonInhalt();
          }
        });
      }
    } else {
      const gewuenscht = speicher.daten().vorleseSystemStimme;
      stimmen.forEach(function (s) {
        const eintrag = document.createElement("option");
        eintrag.value = s.voiceURI;
        eintrag.textContent = s.name || s.voiceURI;
        eintrag.selected = gewuenscht ? s.voiceURI === gewuenscht : !!s.default;
        liste.appendChild(eintrag);
      });
      liste.addEventListener("change", function () {
        sprechAudio.stoppe();
        speicher.daten().vorleseSystemStimme = liste.value;
        speicher.speichere();
      });
    }
    zeile.appendChild(liste);
    stimmeKarte.appendChild(zeile);
  }

  const probe = element("button", "knopf schlicht", "🔊 Stimmprobe hören");
  probe.type = "button";
  let probeStimme = null;
  function probeAuffrischen() {
    const laeuft = sprechAudio.aktuell() === "tag01-text" && !sprechAudio.pausiert();
    const wartet = sprechAudio.aktuell() === "tag01-text" && sprechAudio.pausiert();
    probe.textContent = laeuft ? "⏸ Pause" : wartet ? "▶ Weiter" : "🔊 Stimmprobe hören";
    probe.setAttribute("aria-pressed", String(laeuft));
  }
  probe.addEventListener("click", function () {
    const e = window.SPRECHTRAINING && window.SPRECHTRAINING.EINHEITEN[0];
    if (!e) { return; }
    const gleich = probeStimme === (speicher.daten().vorleseStimme || "thorsten");
    if (sprechAudio.aktuell() === "tag01-text" && gleich) {
      if (sprechAudio.pausiert()) { sprechAudio.weiter(); } else { sprechAudio.pausiere(); }
    } else {
      probeStimme = speicher.daten().vorleseStimme || "thorsten";
      sprechAudio.spiele("tag01-text", e.text);
    }
  });
  sprechAudio.aufAenderung(probeAuffrischen);
  probeAuffrischen();
  stimmeKarte.appendChild(probe);
  inhalt.appendChild(stimmeKarte);

  const lautKarte = element("div", "sterne-karte");
  lautKarte.appendChild(element("h3", null, "Lautstärke"));
  const regler = [
    { name: "stimmeLautstaerke", titel: "Vorlesen", falle: 1 },
    { name: "musikLautstaerke", titel: "Musik", falle: EINSTELLUNGEN.musikLautstaerke }
  ];
  regler.forEach(function (r) {
    const wert = speicher.daten()[r.name];
    const anteil = typeof wert === "number" && Number.isFinite(wert) ? wert : r.falle;
    const zeile = element("div", "ton-zeile");
    const reglerId = "tonRegler-" + r.name;
    const titel = element("label", null, r.titel);
    titel.setAttribute("for", reglerId);
    zeile.appendChild(titel);
    const slider = document.createElement("input");
    slider.id = reglerId;
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.step = "5";
    slider.value = String(Math.round(anteil * 100));
    slider.className = "ton-regler";
    slider.setAttribute("aria-label", "Lautstärke " + r.titel);
    const zahlAnzeige = element("span", "ton-lautstaerke", Math.round(anteil * 100) + " %");
    slider.addEventListener("input", function () {
      const neu = Number(slider.value) / 100;
      speicher.daten()[r.name] = neu;
      speicher.speichere();
      zahlAnzeige.textContent = slider.value + " %";
      if (r.name === "musikLautstaerke") { musik.setzeLautstaerke(neu); }
      else if (r.name === "stimmeLautstaerke") { sprechAudio.setzeLautstaerke(neu); }
    });
    zeile.appendChild(slider);
    zeile.appendChild(zahlAnzeige);
    lautKarte.appendChild(zeile);
  });
  lautKarte.appendChild(element("p", "rand",
    "Die Lautstärken bleiben auf diesem Gerät erhalten."));
  inhalt.appendChild(lautKarte);
}

function zeigeSterneInhalt() {
  const inhalt = document.getElementById("sterneInhalt");
  inhalt.textContent = "";

  const daten = speicher.daten();
  const summe = gesamtSterne();
  const ziel = naechsteBonusStufe(summe);
  inhalt.appendChild(element("p", "sterne-summe", "Du hast schon " + summe + " Bonussterne gesammelt."));
  const letzteStufe = Math.max(MEILENSTEINE.length, ziel / BONUS_STUFEN_SCHRITT);
  const ersteStufe = Math.max(1, letzteStufe - MEILENSTEINE.length + 1);
  for (let stufe = ersteStufe; stufe <= letzteStufe; stufe += 1) {
    const punkte = stufe * BONUS_STUFEN_SCHRITT;
    const stein = MEILENSTEINE[(stufe - 1) % MEILENSTEINE.length];
    const erreicht = summe >= punkte;
    const zeile = element("div", "meilenstein" + (erreicht ? "" : " leer"));
    const bild = element("span", "meilenstein-bild");
    bild.setAttribute("aria-hidden", "true");
    bild.appendChild(figurBild(stein.figur));
    bild.appendChild(symbol(stein.motiv, "meilenstein-motiv"));
    zeile.appendChild(bild);
    zeile.appendChild(element("span", null, (erreicht ? "✓ " : "○ ") + punkte + " Bonussterne – " + stein.text));
    inhalt.appendChild(zeile);
  }

  // Bonussterne: gesamt, offen fürs Geschenk und der Tagesdeckel
  const bonusKarte = element("div", "sterne-karte bonus-sterne-karte");
  bonusKarte.setAttribute("tabindex", "-1");
  bonusKarte.appendChild(element("h3", null, "Nächste Stufe: " + ziel + " Bonussterne"));
  bonusKarte.appendChild(element("p", null, "Noch " + (ziel - summe) + " bis zum nächsten Gutschein."));
  const balken = element("div", "bonus-balken");
  const fuellung = element("div", "bonus-fuellung");
  fuellung.style.width = ((summe % BONUS_STUFEN_SCHRITT) / BONUS_STUFEN_SCHRITT * 100) + "%";
  balken.appendChild(fuellung);
  bonusKarte.appendChild(balken);
  bonusKarte.appendChild(element("p", "rand", bonusTagesText()));
  if (daten.bonusStufenOffen.length) {
    const abholen = element("button", "knopf klein", "Gutschein abholen");
    abholen.type = "button";
    abholen.addEventListener("click", function () { geschenkAuswahlOeffnen(); });
    bonusKarte.appendChild(abholen);
  }
  inhalt.appendChild(bonusKarte);

  if (daten.runden.length === 0) {
    inhalt.appendChild(element("p", null, "Hier erscheinen deine letzten Übungsrunden."));
  } else {
    const karten = element("div", "sterne-karte");
    karten.appendChild(element("h3", null, "Deine letzten Runden"));
    daten.runden.slice(-12).reverse().forEach(function (eintrag) {
      const zeile = element("div", "sterne-zeile");
      zeile.appendChild(element("span", null, datumText(eintrag.datum)));
      zeile.appendChild(element("span", null, (WELT_NAMEN[eintrag.modus] || eintrag.modus || "") +
        (eintrag.bonus ? " · Bonuswelt" : "")));
      zeile.appendChild(element("span", null, (eintrag.richtig === undefined ? "–" : eintrag.richtig) +
        " von " + (eintrag.gesamt === undefined ? "–" : eintrag.gesamt)));
      zeile.appendChild(element("span", null, eintrag.bonus ? "🌟 " + (eintrag.bonusRichtig || 0) : ""));
      karten.appendChild(zeile);
    });
    inhalt.appendChild(karten);
  }
}

/* Gutschein als JPG-Bildkarte speichern (reines Canvas-2D, funktioniert auch offline per file://). */
function gutscheinDateiname(geschenk) {
  const datum = (geschenk && geschenk.datum) || heutigesDatum();
  const kurz = String((geschenk && geschenk.text) || "gutschein")
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-").slice(0, 32).replace(/^-+|-+$/g, "") || "gutschein";
  return "gutschein-" + SPIELERIN.toLowerCase() + "-" + datum + "-" + kurz + ".jpg";
}

function zeichneAbgerundetesRechteck(ctx, x, y, breite, hoehe, radius) {
  const r = Math.min(radius, breite / 2, hoehe / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + breite - r, y);
  ctx.quadraticCurveTo(x + breite, y, x + breite, y + r);
  ctx.lineTo(x + breite, y + hoehe - r);
  ctx.quadraticCurveTo(x + breite, y + hoehe, x + breite - r, y + hoehe);
  ctx.lineTo(x + r, y + hoehe);
  ctx.quadraticCurveTo(x, y + hoehe, x, y + hoehe - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function zeichneStern(ctx, cx, cy, aussen, innen, zacken) {
  ctx.beginPath();
  for (let i = 0; i < zacken * 2; i++) {
    const r = i % 2 === 0 ? aussen : innen;
    const winkel = (Math.PI * i) / zacken - Math.PI / 2;
    const x = cx + Math.cos(winkel) * r;
    const y = cy + Math.sin(winkel) * r;
    if (i === 0) { ctx.moveTo(x, y); } else { ctx.lineTo(x, y); }
  }
  ctx.closePath();
  ctx.fill();
}

function zeichneGeschenkSymbol(ctx, cx, cy, kastenFarbe, bandFarbe) {
  ctx.save();
  ctx.fillStyle = kastenFarbe;
  zeichneAbgerundetesRechteck(ctx, cx - 34, cy - 18, 68, 52, 8);
  ctx.fill();
  zeichneAbgerundetesRechteck(ctx, cx - 40, cy - 30, 80, 18, 6);
  ctx.fill();
  ctx.fillStyle = bandFarbe;
  ctx.fillRect(cx - 7, cy - 30, 14, 64);
  ctx.fillRect(cx - 34, cy + 2, 68, 12);
  ctx.strokeStyle = bandFarbe;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(cx - 14, cy - 38, 13, 8, -0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx + 14, cy - 38, 13, 8, 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function umbrecheCanvasText(ctx, text, maxBreite, maxZeilen) {
  const woerter = String(text || "").split(/\s+/).filter(Boolean);
  const zeilen = [];
  let aktuell = "";
  woerter.forEach(function (wort) {
    const test = aktuell ? aktuell + " " + wort : wort;
    if (ctx.measureText(test).width <= maxBreite || !aktuell) {
      aktuell = test;
    } else {
      zeilen.push(aktuell);
      aktuell = wort;
    }
  });
  if (aktuell) { zeilen.push(aktuell); }
  if (zeilen.length > maxZeilen) {
    const gekuerzt = zeilen.slice(0, maxZeilen);
    gekuerzt[maxZeilen - 1] = gekuerzt[maxZeilen - 1].replace(/[.,;:\s]+$/, "") + " …";
    return gekuerzt;
  }
  return zeilen;
}

function ladeGutscheinAlsJpg(geschenk) {
  if (!geschenk) { return false; }
  const leinwand = document.createElement("canvas");
  leinwand.width = 1200;
  leinwand.height = 750;
  const ctx = typeof leinwand.getContext === "function" ? leinwand.getContext("2d") : null;
  if (!ctx) {
    meldeRueckmeldung("Das Speichern als Bild wird in diesem Browser leider nicht unterstützt.");
    return false;
  }
  const W = leinwand.width;
  const H = leinwand.height;

  // Hintergrund-Verlauf
  const verlauf = ctx.createLinearGradient(0, 0, W, H);
  verlauf.addColorStop(0, "#fffdf5");
  verlauf.addColorStop(1, "#fff0c4");
  ctx.fillStyle = verlauf;
  ctx.fillRect(0, 0, W, H);

  // Äußerer & innerer Rahmen
  ctx.strokeStyle = "#d8a723";
  ctx.lineWidth = 14;
  zeichneAbgerundetesRechteck(ctx, 28, 28, W - 56, H - 56, 36);
  ctx.stroke();

  ctx.save();
  ctx.strokeStyle = "#e4c76a";
  ctx.lineWidth = 4;
  if (typeof ctx.setLineDash === "function") { ctx.setLineDash([14, 10]); }
  zeichneAbgerundetesRechteck(ctx, 52, 52, W - 104, H - 104, 24);
  ctx.stroke();
  ctx.restore();

  // Sterne in den Ecken
  ctx.fillStyle = "#e7b62c";
  [[104, 104], [W - 104, 104], [104, H - 104], [W - 104, H - 104]].forEach(function (punkt) {
    zeichneStern(ctx, punkt[0], punkt[1], 24, 11, 5);
  });
  ctx.fillStyle = "#f4c430";
  [[152, 118], [W - 152, 118], [152, H - 118], [W - 152, H - 118]].forEach(function (punkt) {
    zeichneStern(ctx, punkt[0], punkt[1], 12, 5, 5);
  });

  // Geschenk-Illustration oben mittig
  zeichneGeschenkSymbol(ctx, W / 2, 132, "#e06d53", "#f4c430");

  // Kopfzeile & Name
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#7a5c11";
  ctx.font = "bold 52px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("GUTSCHEIN", W / 2, 224);

  ctx.fillStyle = "#5c4a1e";
  ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Für " + SPIELERIN, W / 2, 276);

  // Weißer Wunsch-Kasten in der Mitte
  ctx.fillStyle = "#ffffff";
  zeichneAbgerundetesRechteck(ctx, 110, 318, W - 220, 232, 24);
  ctx.fill();
  ctx.strokeStyle = "#e4c76a";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Wunschtext automatisch skalieren und umbrechen
  const wunschText = String(geschenk.text || "");
  let schriftGroesse = wunschText.length > 55 ? 32 : wunschText.length > 34 ? 38 : 44;
  ctx.font = "bold " + schriftGroesse + "px 'Segoe UI', Arial, sans-serif";
  const zeilen = umbrecheCanvasText(ctx, wunschText, W - 290, 4);
  const zeilenHoehe = Math.round(schriftGroesse * 1.32);
  const startY = 434 - ((zeilen.length - 1) * zeilenHoehe) / 2;
  ctx.fillStyle = "#2b2b36";
  zeilen.forEach(function (zeile, idx) {
    ctx.fillText(zeile, W / 2, startY + idx * zeilenHoehe);
  });

  // Fußzeile (Datum & Status)
  ctx.fillStyle = "#6e5a2b";
  ctx.font = "600 24px 'Segoe UI', Arial, sans-serif";
  const linksText = geschenk.datum ? "Erhalten am " + datumText(geschenk.datum) : "Gutschein";
  const rechtsText = geschenk.eingeloestAm
    ? "✓ Eingelöst am " + datumText(geschenk.eingeloestAm)
    : "★ Offen · Einlösbar bei Mama & Papa";
  ctx.textAlign = "left";
  ctx.fillText(linksText, 120, 610);
  ctx.textAlign = "right";
  ctx.fillText(rechtsText, W - 120, 610);

  ctx.textAlign = "center";
  ctx.fillStyle = "#9c8960";
  ctx.font = "600 19px 'Segoe UI', Arial, sans-serif";
  ctx.fillText("Mathe & Deutsch üben · " + SPIELERIN, W / 2, 666);

  // Stempel falls bereits eingelöst
  if (geschenk.eingeloestAm) {
    ctx.save();
    ctx.translate(W - 220, 178);
    ctx.rotate(-0.18);
    ctx.strokeStyle = "#1f7a4c";
    ctx.fillStyle = "rgba(255, 255, 255, 0.88)";
    ctx.lineWidth = 6;
    zeichneAbgerundetesRechteck(ctx, -118, -32, 236, 64, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1f7a4c";
    ctx.font = "bold 30px 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EINGELÖST ✓", 0, 2);
    ctx.restore();
  }

  const dateiname = gutscheinDateiname(geschenk);
  try {
    if (typeof leinwand.toBlob === "function") {
      leinwand.toBlob(function (blob) {
        if (!blob) {
          meldeRueckmeldung("Der Gutschein konnte leider nicht als JPG erstellt werden.");
          return;
        }
        try {
          datenHerunterladen(blob, "image/jpeg", dateiname);
          meldeRueckmeldung("Gutschein als JPG gespeichert.");
        } catch (fehler) {
          meldeRueckmeldung("Das Herunterladen hat leider nicht geklappt.");
        }
      }, "image/jpeg", 0.94);
      return true;
    }
    if (typeof leinwand.toDataURL === "function") {
      const dataUrl = leinwand.toDataURL("image/jpeg", 0.94);
      const link = element("a");
      link.href = dataUrl;
      link.download = dateiname;
      document.body.appendChild(link);
      try { link.click(); } finally {
        if (link.parentNode) { link.parentNode.removeChild(link); }
      }
      meldeRueckmeldung("Gutschein als JPG gespeichert.");
      return true;
    }
  } catch (fehler) {
    meldeRueckmeldung("Der Gutschein konnte leider nicht als JPG gespeichert werden.");
  }
  return false;
}

let wunschEditorOffen = false;

function zeigeGeschenkeInhalt() {
  const inhalt = document.getElementById("geschenkeInhalt");
  inhalt.textContent = "";
  const daten = speicher.daten();

  if (daten.bonusStufenOffen.length) {
    const abholen = element("button", "knopf primaer", "Gutschein abholen");
    abholen.type = "button";
    abholen.addEventListener("click", function () { geschenkAuswahlOeffnen(); });
    inhalt.appendChild(abholen);
  }

  if (daten.geschenke.length === 0 && !daten.bonusStufenOffen.length) {
    inhalt.appendChild(element("p", null, "Hier erscheinen deine Gutscheine, sobald du einen abgeholt hast."));
  } else {
    daten.geschenke.slice().reverse().forEach(function (geschenk) {
      const karte = element("div", "gutschein-karte");
      const kopf = element("div", "gutschein-kopf");
      kopf.appendChild(element("span", "gutschein-datum", datumText(geschenk.datum)));
      const status = element("span", "gutschein-status");
      if (geschenk.eingeloestAm) {
        status.textContent = "✓ Eingelöst am " + datumText(geschenk.eingeloestAm);
      } else {
        status.textContent = "offen · tauschbar";
      }
      kopf.appendChild(status);
      karte.appendChild(kopf);
      karte.appendChild(element("p", "gutschein-text", "🎁 " + geschenk.text));
      if (geschenkIstTauschbar(geschenk)) {
        const tausch = element("button", "knopf klein", "🔄 Anderes aussuchen");
        tausch.type = "button";
        tausch.addEventListener("click", function () {
          tauschGutscheinOeffnen(geschenk.id);
        });
        karte.appendChild(tausch);
        const einloesen = element("button", "knopf klein", "Als eingelöst markieren");
        einloesen.type = "button";
        einloesen.addEventListener("click", function () {
          zeigeFrage({
            titel: "Gutschein als eingelöst markieren?",
            text: "„" + geschenk.text + "“ wird mit dem heutigen Datum als eingelöst gespeichert.",
            ja: "Als eingelöst markieren",
            nein: "Abbrechen",
            elternPruefung: true,
            dann: function () {
              const aktuell = findeGutschein(geschenk.id);
              if (!aktuell || !geschenkIstTauschbar(aktuell)) { return; }
              aktuell.eingeloestAm = heutigesDatum();
              speicher.speichere();
              aktualisiereGutscheinAnzeige();
              sync.nachAenderung(true);
              zeigeGeschenkeInhalt();
              meldeRueckmeldung("Gutschein als eingelöst markiert.");
              dialogFokus(document.getElementById("fortschrittZurueckKnopf"));
            }
          });
        });
        karte.appendChild(einloesen);
      }
      const jpgKnopf = element("button", "knopf klein schlicht", "🖼️ Als JPG speichern");
      jpgKnopf.type = "button";
      jpgKnopf.addEventListener("click", function () {
        ladeGutscheinAlsJpg(geschenk);
      });
      karte.appendChild(jpgKnopf);
      inhalt.appendChild(karte);
    });
  }

  // Wunschliste bearbeiten (für Eltern, ohne Code anzufassen)
  const editor = element("details", "sterne-karte wunschliste-editor");
  if (wunschEditorOffen) { editor.open = true; editor.setAttribute("open", ""); }
  editor.addEventListener("toggle", function () { wunschEditorOffen = !!editor.open; });
  const titel = element("summary", "wunschliste-titel", "⚙️ Wunschliste bearbeiten (für Eltern)");
  editor.appendChild(titel);
  editor.appendChild(element("p", "rand",
    "Hier kannst du die Gutschein-Wünsche für neue Auswahlen anpassen. Änderungen werden beim Abgleich mit anderen PCs übernommen."));

  const aktuelle = aktuelleWunschListe();
  const ul = element("ul", "wunschliste-zeilen");
  aktuelle.forEach(function (wunsch, idx) {
    const li = element("li", "wunschliste-zeile");
    li.appendChild(element("span", "wunschliste-text",
      wunsch.text + (istFreitextWunsch(wunsch) ? " (mit Freitext)" : "")));
    const entfernen = element("button", "knopf klein schlicht wunschliste-loeschen", "✕");
    entfernen.type = "button";
    entfernen.setAttribute("aria-label", "Wunsch „" + wunsch.text + "“ entfernen");
    entfernen.disabled = aktuelle.length <= 1;
    entfernen.addEventListener("click", function () {
      if (aktuelle.length <= 1) { return; }
      const neu = aktuelle.filter(function (_, i) { return i !== idx; })
        .map(w => w.freitext ? { text: w.text, freitext: true } : { text: w.text });
      daten.wunschListe = neu;
      daten.wunschListeZeit = Date.now();
      wunschEditorOffen = true;
      speicher.speichere();
      sync.nachAenderung(true);
      zeigeGeschenkeInhalt();
      meldeRueckmeldung("Wunsch entfernt.");
    });
    li.appendChild(entfernen);
    ul.appendChild(li);
  });
  editor.appendChild(ul);

  const neuZeile = element("div", "wunschliste-neu");
  const eingabe = element("input", "eingabe wunschliste-eingabe");
  eingabe.type = "text";
  eingabe.maxLength = 80;
  eingabe.placeholder = "Neuer Wunsch, z. B. Eis essen gehen";
  eingabe.setAttribute("aria-label", "Neuer Gutschein-Wunsch");
  const hinzuKnopf = element("button", "knopf klein primaer", "+ Hinzufügen");
  hinzuKnopf.type = "button";
  function fuegeWunschHinzu() {
    const text = String(eingabe.value || "").trim();
    if (!text) { return; }
    if (aktuelle.some(w => w.text.toLowerCase() === text.toLowerCase())) {
      meldeRueckmeldung("Dieser Wunsch steht schon in der Liste.");
      return;
    }
    const neu = aktuelle.map(w => w.freitext ? { text: w.text, freitext: true } : { text: w.text });
    neu.push({ text: text });
    daten.wunschListe = neu;
    daten.wunschListeZeit = Date.now();
    wunschEditorOffen = true;
    speicher.speichere();
    sync.nachAenderung(true);
    zeigeGeschenkeInhalt();
    meldeRueckmeldung("Wunsch hinzugefügt.");
  }
  hinzuKnopf.addEventListener("click", fuegeWunschHinzu);
  eingabe.addEventListener("keydown", function (ereignis) {
    if (ereignis.key === "Enter") {
      ereignis.preventDefault();
      fuegeWunschHinzu();
    }
  });
  neuZeile.appendChild(eingabe);
  neuZeile.appendChild(hinzuKnopf);
  editor.appendChild(neuZeile);

  if (daten.wunschListe !== null) {
    const zurueck = element("button", "knopf klein schlicht", "Standardliste wiederherstellen");
    zurueck.type = "button";
    zurueck.addEventListener("click", function () {
      daten.wunschListe = null;
      daten.wunschListeZeit = Date.now();
      wunschEditorOffen = true;
      speicher.speichere();
      sync.nachAenderung(true);
      zeigeGeschenkeInhalt();
      meldeRueckmeldung("Standard-Wunschliste wiederhergestellt.");
    });
    editor.appendChild(zurueck);
  }
  inhalt.appendChild(editor);
}

/* ------------- Spielstand sichern und laden (Umzug auf einen anderen PC) --------------- */

/* Verweis auf die Meldungszeile im Spielstand-Reiter. Ein reiner
   getElementById-Aufruf würde nach einem Reiterwechsel ins Leere laufen. */
let spielstandMeldungKnoten = null;

function zeigeImportMeldung(text) {
  meldeRueckmeldung(text);
  if (spielstandMeldungKnoten) {
    spielstandMeldungKnoten.textContent = text;
  }
}

let wirdNeuGeladen = false;

function ladeSpielstandNeu() {
  if (window.location && typeof window.location.reload === "function") {
    window.location.reload();
  }
}

/* Sichert den bisherigen Stand und schreibt den neuen. Gibt false zurück, wenn
   das nicht vollständig gelingt – dann bleibt der alte Stand unverändert. */
function uebernehmeSpielstand(daten, erfolgsmeldung, sicherungsPraefix) {
  if (sichereDatenDownload((sicherungsPraefix || "mathe-vor-import-") + heutigesDatum() + ".json") === false) {
    zeigeImportMeldung("Der bisherige Spielstand konnte nicht gesichert werden " +
      "(vermutlich sind Downloads blockiert). Der Vorgang wurde abgebrochen – " +
      "bitte Downloads für diese Seite erlauben und erneut versuchen.");
    return false;
  }
  try {
    window.localStorage.setItem(SPEICHER_NAME, JSON.stringify(daten));
  } catch (fehler) {
    zeigeImportMeldung("Der Spielstand konnte nicht gespeichert werden. " +
      "Bitte prüfen, ob der Browser Daten speichern darf, und es dann noch einmal versuchen.");
    return false;
  }
  wirdNeuGeladen = true;
  zeigeImportMeldung(erfolgsmeldung);
  ladeSpielstandNeu();
  return true;
}

/* Nimmt den Text einer Sicherungsdatei (oder eines rohen Spielstands) entgegen,
   prüft ihn und fragt vor dem Ersetzen nach. */
function importiereSpielstand(text) {
  const pruefung = speicher.pruefeImport(text);
  if (!pruefung.ok) {
    zeigeImportMeldung("Diese Datei kann nicht geladen werden: " + pruefung.grund);
    return;
  }
  const teile = [pruefung.sterne + (pruefung.sterne === 1 ? " Bonusstern" : " Bonussterne"),
    pruefung.runden + (pruefung.runden === 1 ? " Runde" : " Runden"),
    pruefung.geschenke + (pruefung.geschenke === 1 ? " Gutschein" : " Gutscheine")];
  zeigeFrage({
    titel: "Spielstand laden?",
    text: "Die Datei enthält " + teile.join(", ") +
      (pruefung.stand ? " (Stand " + datumText(pruefung.stand) + ")" : "") +
      ". Der aktuelle Spielstand wird ersetzt. Er wird vorher automatisch als Datei gesichert.",
    ja: "Trotzdem laden",
    nein: "Abbrechen",
    dann: function () {
      uebernehmeSpielstand(pruefung.daten, "Spielstand geladen – das Spiel wird neu gestartet.");
    }
  });
}

/* Vereinigt den eigenen Stand mit einer Datei (Merge light). */
function fuehreSpielstaendeZusammen(text) {
  const ergebnis = speicher.zusammenfuehren(text);
  if (!ergebnis.ok) {
    zeigeImportMeldung("Diese Datei kann nicht zusammengeführt werden: " + ergebnis.grund);
    return;
  }
  const vorschau = ergebnis.vorschau || { runden: 0, sterne: 0, geschenke: 0 };
  if (!ergebnis.veraendert) {
    zeigeImportMeldung("Beide Spielstände enthalten bereits alles – es gibt nichts zu ergänzen.");
    return;
  }
  const hatZaehler = vorschau.runden !== 0 || vorschau.sterne !== 0 || vorschau.geschenke !== 0;
  const teile = [vorschau.runden + (vorschau.runden === 1 ? " Runde" : " Runden"),
    vorschau.sterne + (vorschau.sterne === 1 ? " Bonusstern" : " Bonussterne"),
    vorschau.geschenke + (vorschau.geschenke === 1 ? " Gutschein" : " Gutscheine")];
  const zusammenfassung = hatZaehler
    ? "Aus der Datei kommen " + teile.join(", ") + " dazu"
    : "Weitere Fortschritte (z. B. offene Aufgaben, Übezeiten oder Gutschein-Änderungen) werden übernommen";
  zeigeFrage({
    titel: "Spielstände zusammenführen?",
    text: zusammenfassung +
      (ergebnis.stand ? " (Stand " + datumText(ergebnis.stand) + ")" : "") +
      ". Beide Stände werden vereinigt, nichts wird gelöscht. Doppelte Runden und Gutscheine " +
      "zählen nur einmal. Der bisherige Stand wird vorher automatisch als Datei gesichert.",
    ja: "Ja, zusammenführen",
    nein: "Abbrechen",
    dann: function () {
      uebernehmeSpielstand(ergebnis.daten,
        "Spielstände zusammengeführt – das Spiel wird neu gestartet.", "mathe-vor-merge-");
    }
  });
}

function zeigeSpielstandInhalt() {
  const inhalt = document.getElementById("spielstandInhalt");
  inhalt.textContent = "";
  const daten = speicher.daten();

  const karte = element("div", "sterne-karte");
  karte.appendChild(element("h3", null, "💾 Spielstand übertragen"));
  karte.appendChild(element("p", null,
    "Der Spielstand liegt nur in diesem Browser auf diesem Gerät. Mit „Spielstand sichern“ " +
    "entsteht eine Datei, die du auf einem anderen PC über „Spielstand laden“ wieder einlesen kannst."));
  karte.appendChild(element("p", null,
    "„Spielstand zusammenführen“ vereinigt dagegen beide Stände: Runden und Gutscheine aus der " +
    "Datei kommen dazu, doppelte zählen nur einmal, der bisherige Fortschritt bleibt erhalten."));
  karte.appendChild(element("p", "rand",
    "Wichtig: Das Spiel auf dem anderen PC im gleichen Browser und über dieselbe Adresse öffnen. " +
    "Vor dem Laden alle anderen Spielfenster schließen. Der bisherige Stand wird vor dem " +
    "Ersetzen bzw. Zusammenführen automatisch als Datei gesichert."));

  const knoepfe = element("div", "statistik-knoepfe");
  const sichern = element("button", "knopf primaer", "Spielstand sichern (Datei)");
  sichern.type = "button";
  sichern.id = "spielstandSichernKnopf";
  sichern.addEventListener("click", function () {
    sichereDatenDownload("mathe-spielstand-" + heutigesDatum() + ".json");
  });
  const laden = element("button", "knopf", "Spielstand laden (Datei)");
  laden.type = "button";
  laden.id = "spielstandLadenKnopf";
  laden.addEventListener("click", function () {
    const datei = document.getElementById("spielstandDatei");
    if (datei) {
      datei.value = "";
      datei.click();
    }
  });
  const zusammen = element("button", "knopf", "Spielstand zusammenführen (Datei)");
  zusammen.type = "button";
  zusammen.id = "spielstandMergeKnopf";
  zusammen.addEventListener("click", function () {
    const datei = document.getElementById("spielstandMergeDatei");
    if (datei) {
      datei.value = "";
      datei.click();
    }
  });
  knoepfe.appendChild(sichern);
  knoepfe.appendChild(laden);
  knoepfe.appendChild(zusammen);
  karte.appendChild(knoepfe);
  inhalt.appendChild(karte);

  const stand = element("div", "sterne-karte");
  stand.appendChild(element("h3", null, "Aktueller Stand auf diesem Gerät"));
  stand.appendChild(element("p", null,
    "🌟 " + daten.bonusGesamt + " Bonussterne · 🎁 " + daten.geschenke.length +
    (daten.geschenke.length === 1 ? " Gutschein" : " Gutscheine") + " · " +
    daten.runden.length + (daten.runden.length === 1 ? " Runde" : " Runden") +
    (daten.tagesSet ? " · Tagesrunde von " + datumText(daten.tagesSet.datum) : "")));
  inhalt.appendChild(stand);

  /* Automatische Synchronisierung über GitHub */
  const e = sync.einstellungen();
  const syncKarte = element("div", "sterne-karte");
  syncKarte.appendChild(element("h3", null, "🔗 Automatische Synchronisierung (GitHub)"));
  syncKarte.appendChild(element("p", null,
    "Optional: Der Spielstand wird dann beim Start mit einer Datei in einem eigenen, " +
    "privaten GitHub-Repository zusammengeführt und beim Abschluss dorthin geschrieben. " +
    "Dafür ist ein Token nötig, das nur auf diesem Gerät gespeichert wird."));
  syncKarte.appendChild(element("p", "rand",
    "Token in GitHub unter Settings → Developer settings → Personal access tokens → " +
    "Fine-grained tokens anlegen: nur dieses Repository, nur „Contents: Read and write“, " +
    "mit Ablaufdatum. Das Token ist ein Schreibschlüssel – nicht weitergeben."));

  function syncFeld(bezeichnung, id, wert, typ, platzhalter) {
    const zeile = element("div", "sync-feld");
    const label = element("label", null, bezeichnung);
    label.setAttribute("for", id);
    const eingabe = element("input", "eingabe");
    eingabe.type = typ || "text";
    eingabe.id = id;
    eingabe.autocomplete = "off";
    eingabe.spellcheck = false;
    if (wert) { eingabe.value = wert; }
    if (platzhalter) { eingabe.placeholder = platzhalter; }
    zeile.appendChild(label);
    zeile.appendChild(eingabe);
    return zeile;
  }
  syncKarte.appendChild(syncFeld("Repository (besitzer/name)", "syncRepo", e.repo, "text",
    "z. B. kaichri/mathe-sync"));
  syncKarte.appendChild(syncFeld("Datei im Repository", "syncDatei",
    e.datei || "spielstand.json", "text", "spielstand.json"));
  syncKarte.appendChild(syncFeld("Token (nur lokal gespeichert)", "syncToken", "",
    "password", e.token ? "•••••••• (gespeichert)" : "github_pat_…"));

  const syncKnoepfe = element("div", "statistik-knoepfe");
  const syncSpeichern = element("button", "knopf primaer", "Speichern & prüfen");
  syncSpeichern.type = "button";
  syncSpeichern.id = "syncSpeichernKnopf";
  syncSpeichern.addEventListener("click", function () {
    const repo = String(document.getElementById("syncRepo").value || "").trim();
    const datei = String(document.getElementById("syncDatei").value || "").trim() || "spielstand.json";
    const tokenFeld = String(document.getElementById("syncToken").value || "").trim();
    const token = tokenFeld || sync.einstellungen().token;
    if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
      sync.setzeStatus("Bitte das Repository als „besitzer/name“ eintragen.", "fehler");
      return;
    }
    if (!token) {
      sync.setzeStatus("Bitte ein Token eintragen.", "fehler");
      return;
    }
    if (sync.speichere({ repo: repo, datei: datei, token: token, aktiv: true })) {
      sync.setzeStatus("Zugangsdaten gespeichert – gleiche ab …", "info");
      sync.jetzt();
    }
  });
  const syncJetzt = element("button", "knopf", "Jetzt synchronisieren");
  syncJetzt.type = "button";
  syncJetzt.id = "syncJetztKnopf";
  syncJetzt.addEventListener("click", function () { sync.jetzt(); });
  const syncWeg = element("button", "knopf schlicht", "Synchronisierung entfernen");
  syncWeg.type = "button";
  syncWeg.id = "syncEntfernenKnopf";
  syncWeg.addEventListener("click", function () {
    sync.vergessen();
    zeigeSpielstandInhalt();
  });
  syncKnoepfe.appendChild(syncSpeichern);
  syncKnoepfe.appendChild(syncJetzt);
  syncKnoepfe.appendChild(syncWeg);
  syncKarte.appendChild(syncKnoepfe);

  const syncStatus = element("p", "rand sync-status", sync.status().text);
  syncStatus.id = "syncStatus";
  syncStatus.setAttribute("role", "status");
  syncStatus.setAttribute("aria-live", "polite");
  syncKarte.appendChild(syncStatus);
  syncKarte.appendChild(element("p", "rand",
    "Hinweis: Jede Synchronisierung erzeugt einen Commit im Repository. Deshalb wird beim " +
    "Tippen höchstens einmal pro Minute geschrieben, sofort dagegen beim Abschluss einer " +
    "Runde, bei Gutscheinen und beim Verlassen der Seite."));
  inhalt.appendChild(syncKarte);
  aktualisiereSyncStatus();

  const meldung = element("p", "rand", "");
  meldung.id = "spielstandMeldung";
  meldung.setAttribute("role", "status");
  meldung.setAttribute("aria-live", "polite");
  inhalt.appendChild(meldung);
  spielstandMeldungKnoten = meldung;
}

/* Aktualisiert die Statuszeile im Spielstand-Reiter (falls sichtbar). */
function aktualisiereSyncStatus() {
  const knoten = document.getElementById("syncStatus");
  if (!knoten) { return; }
  const status = sync.status();
  knoten.textContent = status.text;
  knoten.className = "rand sync-status " + (status.art || "info");
}

function datumText(iso) {
  if (!iso) {
    return "";
  }
  const teile = iso.split("-");
  if (teile.length !== 3) {
    return iso;
  }
  return teile[2] + "." + teile[1] + "." + teile[0];
}

/* ------------- Statistik (zweiter Reiter im Fortschritts-Bereich) ------------- */

/* Reguläre Tagesrunden für Zusammenfassung und Weltwahl: Wiederholungen zählen
   nicht; Runden ohne Wiederholung-Kennzeichen (alte Spielstände) gelten als
   Quiz, wenn sie 50 Aufgaben haben. */
function zaehltAlsQuiz(eintrag) {
  const zeiten = eintrag.uebezeiten || {};
  if (eintrag.wiederholung === true || zeiten.wiederholung !== undefined) { return false; }
  return eintrag.wiederholung === false ||
    Object.keys(BEREICH_NAMEN).some(bereich => zeiten[bereich] !== undefined) ||
    (eintrag.wiederholung === undefined && eintrag.gesamt === 50);
}

function zeigeStatistikInhalt() {
  const inhalt = document.getElementById("statistikInhalt");
  inhalt.textContent = "";
  const daten = speicher.daten();

  if (daten.runden.length === 0) {
    inhalt.appendChild(element("p", null, "Hier erscheint deine Statistik, sobald du die erste Runde geprüft hast."));
    return;
  }

  const gruppen = {
    quiz: { titel: "Quiz", anzahl: 0, aufgaben: 0, richtig: 0 },
    bonus: { titel: "Bonusquiz", anzahl: 0, aufgaben: 0, richtig: 0 }
  };
  daten.runden.forEach(function (eintrag) {
    if (!eintrag.bonus && !zaehltAlsQuiz(eintrag)) { return; }
    const gruppe = eintrag.bonus ? gruppen.bonus : gruppen.quiz;
    gruppe.anzahl += 1;
    gruppe.aufgaben += eintrag.gesamt || 0;
    gruppe.richtig += eintrag.richtig || 0;
  });
  const eingeloesteGutscheine = daten.geschenke.filter(geschenk => geschenk.eingeloestAm).length;
  const uebersicht = element("div", "sterne-karte");
  uebersicht.appendChild(element("h3", null, "Zusammenfassung"));
  const liste = element("ul");
  Object.values(gruppen).forEach(function (gruppe) {
    if (!gruppe.anzahl) { return; }
    const zeile = element("li");
    zeile.appendChild(element("strong", null, gruppe.titel));
    const ergebnis = gruppe.aufgaben
      ? " · " + gruppe.richtig + " von " + gruppe.aufgaben + " Aufgaben richtig (" +
        Math.round(gruppe.richtig / gruppe.aufgaben * 100) + " %)"
      : "";
    zeile.appendChild(element("span", null, " · " + gruppe.anzahl + " abgeschlossen" + ergebnis));
    liste.appendChild(zeile);
  });
  uebersicht.appendChild(liste);
  uebersicht.appendChild(element("p", null,
    "🌟 " + daten.bonusGesamt + " Bonussterne" +
    " · 🎁 " + daten.geschenke.length + (daten.geschenke.length === 1 ? " Gutschein" : " Gutscheine") +
    " (" + eingeloesteGutscheine + " eingelöst)"));
  inhalt.appendChild(uebersicht);
  inhalt.appendChild(baueZeitstatistik(daten.runden));

  // Übe-Kalender der letzten 28 Tage
  inhalt.appendChild(baueKalender(daten));

  // Jede Runde mit Ergebnissen in diesem Bereich zählt als eine Übung.
  const tabelle = element("div", "sterne-karte");
  tabelle.appendChild(element("h3", null, "In welchem Bereich bist du schon stark?"));
  tabelle.appendChild(element("p", "rand", "Dein Durchschnitt aus bis zu 10 Übungen pro Bereich. Es zählen die neuesten Übungen."));
  Object.keys(BEREICH_NAMEN).forEach(function (bereich) {
    let anzahl = 0;
    let summe = 0;
    for (let i = daten.runden.length - 1; i >= 0 && anzahl < 10; i -= 1) {
      const runde = daten.runden[i];
      const punkt = runde.bereiche && runde.bereiche[bereich];
      if (runde.bonus || !punkt || !(punkt.gesamt > 0)) { continue; }
      summe += punkt.richtig / punkt.gesamt;
      anzahl += 1;
    }
    if (anzahl === 0) { return; }
    const anteil = Math.round(summe / anzahl * 100);
    const zeile = element("div", "bereich-zeile");
    zeile.appendChild(element("span", null, BEREICH_NAMEN[bereich]));
    const balken = element("div", "bereich-balken");
    const fuellung = element("div", "bereich-fuellung");
    fuellung.style.width = anteil + "%";
    balken.appendChild(fuellung);
    zeile.appendChild(balken);
    zeile.appendChild(element("span", null, anteil + " %"));
    tabelle.appendChild(zeile);
  });
  inhalt.appendChild(tabelle);
}

function baueZeitstatistik(runden) {
  const karte = element("div", "sterne-karte");
  karte.appendChild(element("h3", null, "Übezeit nach Bereich"));
  const summen = {};
  let erfasst = 0;
  runden.forEach(function (eintrag) {
    if (!eintrag.uebezeiten) { return; }
    erfasst += 1;
    Object.entries(eintrag.uebezeiten).forEach(function ([bereich, ms]) {
      summen[bereich] = (summen[bereich] || 0) + ms;
    });
  });
  karte.appendChild(element("p", null, erfasst
    ? "Gesamt: " + dauerText(uebezeitSumme(summen)) + " · " + erfasst + " von " + runden.length + " Runden mit Zeitmessung"
    : "Die bisherigen Runden haben noch keine Zeitmessung."));
  const liste = element("ul");
  Object.keys(ZEITBEREICHE).forEach(function (bereich) {
    if (summen[bereich] === undefined) { return; }
    liste.appendChild(element("li", null, ZEITBEREICHE[bereich] + ": " + dauerText(summen[bereich])));
  });
  if (erfasst) { karte.appendChild(liste); }
  return karte;
}

function baueKalender(daten) {
  const karte = element("div", "sterne-karte");
  karte.appendChild(element("h3", null, "An welchen Tagen hast du geübt?"));

  /* Pro Tag: Bonussterne und ob überhaupt geübt wurde. */
  const tage = {};
  const geuebtAm = {};
  daten.runden.forEach(function (eintrag) {
    if (eintrag.datum) {
      tage[eintrag.datum] = (tage[eintrag.datum] || 0) + (eintrag.bonus ? eintrag.bonusRichtig || 0 : 0);
      geuebtAm[eintrag.datum] = true;
    }
  });

  const raster = element("div", "kalender");
  const heute = heutigesDatum();
  const tagesmaximum = EINSTELLUNGEN.bonusSterneProTag;
  let streak = 0;
  let anzahlGeuebt = 0;
  for (let rückwaerts = 27; rückwaerts >= 0; rückwaerts--) {
    const schlüssel = verschiebeKalendertag(heute, -rückwaerts);
    const sterne = tage[schlüssel] || 0;
    const istGeuebt = geuebtAm[schlüssel] === true;
    const istHeute = schlüssel === heute;
    const punkt = element("div", "kalender-punkt" +
      (istGeuebt ? " geuebt" : "") +
      (sterne >= tagesmaximum ? " tagesmaximum" : "") +
      (istHeute ? " heute" : ""));
    punkt.appendChild(element("span", "kalender-datum", istHeute ? "Heute" : datumText(schlüssel).slice(0, 6)));
    if (istHeute) { punkt.setAttribute("aria-current", "date"); }
    if (istGeuebt) { punkt.appendChild(element("span", "kalender-sterne", "🌟 " + sterne)); }
    punkt.title = istGeuebt
      ? datumText(schlüssel) + ": " + sterne + (sterne === 1 ? " Bonusstern" : " Bonussterne") +
        (sterne >= tagesmaximum ? " · Tagesmaximum erreicht" : "")
      : datumText(schlüssel) + ": nicht geübt";
    raster.appendChild(punkt);
    if (istGeuebt) {
      anzahlGeuebt += 1;
    }
  }
  karte.appendChild(raster);
  const legende = element("div", "kalender-legende");
  legende.appendChild(element("span", "kalender-punkt", "Nicht geübt"));
  legende.appendChild(element("span", "kalender-punkt geuebt", "Geübt"));
  legende.appendChild(element("span", "kalender-punkt tagesmaximum", tagesmaximum + " Bonussterne = Tagesmaximum"));
  karte.appendChild(legende);

  // Streak zählen (aufeinanderfolgende Tage, bis heute oder gestern)
  const datenFuerStreak = {};
  daten.runden.forEach(function (eintrag) {
    if (eintrag.datum) {
      datenFuerStreak[eintrag.datum] = true;
    }
  });
  let verschiebung = datenFuerStreak[heute] ? 0 : 1;
  if (verschiebung <= 1) {
    while (datenFuerStreak[verschiebeKalendertag(heute, -verschiebung)]) {
      streak += 1;
      verschiebung += 1;
    }
  }
  karte.appendChild(element("p", "rand",
    (anzahlGeuebt === 1 ? "1 Tag" : anzahlGeuebt + " Tage") +
    " geübt in den letzten 4 Wochen" +
    (streak >= 2 ? " – davon " + streak + " Tage hintereinander! Stark!" : ".")));
  return karte;
}

/* Statistik als CSV herunterladen – jedes Mal eine neue Datei, nichts wird überschrieben. */
function csvZelle(wert) {
  let text = String(wert === undefined || wert === null ? "" : wert);
  if (/^[=+\-@\t\r]/.test(text)) { text = "'" + text; }
  return /[;"\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

function csvHerunterladen() {
  const daten = speicher.daten();
  const zeilen = [];
  zeilen.push("MATHE ÜBEN – STATISTIK FÜR " + SPIELERIN.toUpperCase());
  zeilen.push("Stand;" + new Date().toLocaleString("de-DE", { timeZone: "Europe/Vienna" }));
  zeilen.push("");
  const zeitbereiche = Object.keys(ZEITBEREICHE);
  zeilen.push("TYP;DATUM;UHRZEIT;MODUS;RICHTIG;GESAMT;BONUSSTERNE;ADDITION;SUBTRAKTION;MULTIPLIKATION;DIVISION;ZAHLENRAETSEL;GESCHICHTEN;ÜBEZEIT (SEK);" +
    zeitbereiche.map(bereich => ZEITBEREICHE[bereich].toUpperCase() + " (SEK)").join(";"));
  daten.runden.forEach(function (eintrag) {
    function spalte(bereich) {
      const punkt = eintrag.bereiche && eintrag.bereiche[bereich];
      return punkt ? punkt.richtig + "/" + punkt.gesamt : "";
    }
    zeilen.push([
      eintrag.bonus ? "BONUSRUNDE" : "RUNDE", eintrag.datum || "", eintrag.uhrzeit || "", eintrag.modus || "",
      eintrag.richtig, eintrag.gesamt, eintrag.bonus ? eintrag.bonusRichtig || 0 : "",
      spalte("add"), spalte("sub"), spalte("mul"), spalte("div"), spalte("raetsel"), spalte("geschichte"),
      eintrag.uebezeiten ? Math.floor(uebezeitSumme(eintrag.uebezeiten) / 1000) : "",
      ...zeitbereiche.map(function (bereich) {
        const ms = eintrag.uebezeiten && eintrag.uebezeiten[bereich];
        return ms === undefined ? "" : Math.floor(ms / 1000);
      })
    ].map(csvZelle).join(";"));
  });
  zeilen.push("");
  zeilen.push("BONUSSTERNE;insgesamt gesammelt;" + daten.bonusGesamt);
  zeilen.push("BONUSSTERNE;nächste Stufe;" + naechsteBonusStufe(daten.bonusGesamt));
  zeilen.push("BONUSSTERNE;höchstens pro Tag;" + EINSTELLUNGEN.bonusSterneProTag);
  zeilen.push("");
  zeilen.push("GUTSCHEIN;DATUM;WUNSCH GEAENDERT AM;TEXT;EINGELÖST AM");
  daten.geschenke.forEach(function (geschenk) {
    zeilen.push(["GUTSCHEIN", geschenk.datum || "",
      geschenk.wunschGeaendertAm || "", geschenk.text, geschenk.eingeloestAm || ""].map(csvZelle).join(";"));
  });

  const inhalt = "\uFEFF" + zeilen.join("\r\n");
  try {
    const now = new Date();
    const teile = wienerDatumTeile(now);
    const stempel = lokalesDatum(now) + "-" + teile.hour + teile.minute;
    datenHerunterladen(inhalt, "text/csv;charset=utf-8", "mathe-statistik-" + stempel + ".csv");
  } catch (fehler) {
    window.alert("Das Herunterladen klappt hier gerade nicht – die Statistik steht aber in der App.");
  }
}

/* ------------- Musik und Töne ------------- */

const musik = (function () {
  const dateien = {
    blau: ["musik/blau.mp3"],
    puppenhaus: ["musik/puppenhaus.mp3"],
    doozie: ["musik/doozie.mp3"],
    hunde: ["musik/hunde.mp3"],
    hamster: ["musik/hamster.mp3"],
    weihnachten: ["musik/weihnachten-a.mp3", "musik/weihnachten-b.mp3"]
  };
  let an = speicher.daten().sound === null
    ? EINSTELLUNGEN.hintergrundMusikAn
    : speicher.daten().sound === "an";
  let lautstaerke = speicher.daten().musikLautstaerke;
  let leise = false; // während des Vorlesens dreht die Musik leiser
  function aktuelleLautstaerke() {
    const basis = typeof lautstaerke === "number" && Number.isFinite(lautstaerke)
      ? lautstaerke : EINSTELLUNGEN.musikLautstaerke;
    return leise ? Math.max(0, basis * 0.45) : basis;
  }
  function wendeLautstaerkeAn() {
    if (audioKnoten) {
      try { audioKnoten.volume = aktuelleLautstaerke(); } catch (fehler) {}
    }
  }
  let audioKnoten = null;
  let rueckfallTimer = null;
  let audioKontext = null;
  let wartetAufKlick = false;
  let audioListe = null;
  let audioTeil = 0;
  let abspielVersuch = 0;
  let abspielVersuchLaeuft = false;
  let gestartet = false;
  let ersterMusikKlick = true;
  let doozieFehlt = false;

  function aktuellesAudio() {
    // Deutsch-Welten haben eigene Melodien – unabhängig vom Mathe-Modus.
    if (bereichAktuell === "deutsch") {
      return dateien[deutschWeltId()] || dateien.hunde;
    }
    if (modus === "doozie" && !doozieFehlt) { return dateien.doozie; }
    if (modus === "gabby" || modus === "doozie") {
      return dateien.puppenhaus;
    }
    return dateien.blau;
  }

  function kontext() {
    if (!audioKontext) {
      const Typ = window.AudioContext || window.webkitAudioContext;
      if (!Typ) {
        return null;
      }
      try {
        audioKontext = new Typ();
      } catch (fehler) {
        return null;
      }
    }
    if (audioKontext.state === "suspended" && audioKontext.resume) {
      audioKontext.resume().catch(function () {});
    }
    return audioKontext;
  }

  function spielTon(hertz, startBei, dauer, lautheit) {
    if (!an) {
      return;
    }
    const k = kontext();
    if (!k || !hertz) {
      return;
    }
    try {
      const schwinger = k.createOscillator();
      const verstaerker = k.createGain();
      schwinger.type = "triangle";
      schwinger.frequency.value = hertz;
      verstaerker.gain.setValueAtTime(0.0001, k.currentTime + startBei);
      verstaerker.gain.exponentialRampToValueAtTime(lautheit, k.currentTime + startBei + 0.04);
      verstaerker.gain.exponentialRampToValueAtTime(0.0001, k.currentTime + startBei + dauer);
      schwinger.connect(verstaerker);
      verstaerker.connect(k.destination);
      schwinger.start(k.currentTime + startBei);
      schwinger.stop(k.currentTime + startBei + dauer + 0.05);
    } catch (fehler) {
      // Ton geht gerade nicht – nicht weiter schlimm.
    }
  }

  const NOTEN = [392, 440, 494, 587, 659, 587, 494, 440]; // fröhliche Schleife (G-Dur-artig)

  function rueckfallMelodie() {
    stoppeNur();
    if (!an) {
      return;
    }
    const k = kontext();
    if (!k) {
      return;
    }
    let schritt = 0;
    rueckfallTimer = window.setInterval(function () {
      spielTon(NOTEN[schritt % NOTEN.length], 0, 0.35, 0.05);
      schritt += 1;
    }, 750);
  }

  function spieleAudio(knoten, durchKlick) {
    if (!an || audioKnoten !== knoten ||
        (abspielVersuchLaeuft && !(durchKlick && knoten.paused))) {
      return;
    }
    const versuch = ++abspielVersuch;
    abspielVersuchLaeuft = true;
    wartetAufKlick = false;
    function abgeschlossen(abgelehnt) {
      if (audioKnoten === knoten && versuch === abspielVersuch) {
        abspielVersuchLaeuft = false;
        wartetAufKlick = abgelehnt;
      }
    }
    try {
      const zusicherung = knoten.play();
      if (zusicherung && zusicherung.then) {
        zusicherung.then(function () { abgeschlossen(false); }, function () { abgeschlossen(true); });
      } else {
        abgeschlossen(false);
      }
    } catch (fehler) {
      abgeschlossen(true);
    }
  }

  function starteHintergrund(durchKlick) {
    if (!an) {
      return;
    }
    const liste = aktuellesAudio();
    if (audioKnoten && audioListe === liste) {
      if (durchKlick && (wartetAufKlick || audioKnoten.paused)) {
        spieleAudio(audioKnoten, durchKlick);
      }
      return;
    }
    stoppeNur();
    const knoten = document.createElement("audio");
    audioKnoten = knoten;
    audioListe = liste;
    audioTeil = 0;
    knoten.src = liste[0];
    knoten.volume = aktuelleLautstaerke();
    knoten.loop = liste.length === 1;
    knoten.addEventListener("error", function () {
      // Verspätete Fehler einer ersetzten Instanz dürfen nichts neu starten.
      if (audioKnoten === knoten) {
        if (audioListe === dateien.doozie) {
          doozieFehlt = true;
          starteHintergrund();
        } else {
          rueckfallMelodie();
        }
      }
    });
    // Mehrteilige Melodien (Weihnachten) wechseln am Ende ins nächste Teil.
    knoten.addEventListener("ended", function () {
      if (audioKnoten !== knoten || !audioListe || audioListe.length < 2) {
        return;
      }
      audioTeil = (audioTeil + 1) % audioListe.length;
      knoten.src = audioListe[audioTeil];
      spieleAudio(knoten);
    });
    spieleAudio(knoten);
  }

  function stoppeNur() {
    abspielVersuch += 1;
    abspielVersuchLaeuft = false;
    wartetAufKlick = false;
    if (audioKnoten) {
      try {
        audioKnoten.pause();
      } catch (fehler) {}
      audioKnoten = null;
    }
    audioListe = null;
    audioTeil = 0;
    if (rueckfallTimer) {
      window.clearInterval(rueckfallTimer);
      rueckfallTimer = null;
    }
  }

  /* Der Musik-Knopf pausiert: gleiche Welt → an gleicher Stelle weiter,
     Weltwechsel verwirft die gemerkte Stelle (dann startet die Musik vorne). */
  function pausiereNur() {
    abspielVersuch += 1;
    abspielVersuchLaeuft = false;
    wartetAufKlick = false;
    if (audioKnoten) {
      try {
        audioKnoten.pause();
      } catch (fehler) {}
    }
    if (rueckfallTimer) {
      window.clearInterval(rueckfallTimer);
      rueckfallTimer = null;
    }
  }

  function zeigeZustand() {
    const knopf = document.getElementById("musikKnopf");
    knopf.setAttribute("aria-pressed", String(an));
    knopf.classList.toggle("musik-aus", !an);
  }

  function umschalten() {
    const wartetAufStart = ersterMusikKlick && an && audioKnoten && audioKnoten.paused;
    ersterMusikKlick = false;
    if (wartetAufStart) {
      starteHintergrund(true);
      return;
    }
    an = !an;
    speicher.daten().sound = an ? "an" : "aus";
    speicher.speichere();
    zeigeZustand();
    if (an) {
      starteHintergrund(true);
    } else {
      pausiereNur();
    }
  }

  /* Die Freigabe des Browsers gilt direkt im Klick-Handler, auch wenn
     der Wiedergabeversuch beim Laden noch nicht beantwortet wurde. */
  function horchtAufErstenKlick() {
    document.addEventListener("click", function (ereignis) {
      if (!an) {
        return;
      }
      const ziel = ereignis && ereignis.target;
      if (ziel && document.getElementById("musikKnopf").contains(ziel)) {
        return;
      }
      ersterMusikKlick = false;
      if (!rueckfallTimer) {
        starteHintergrund(true);
      }
      if (audioKontext && audioKontext.state === "suspended" && audioKontext.resume) {
        audioKontext.resume().catch(function () {});
      }
    }, true);
  }

  return {
    an: function () { return an; },
    lautstaerke: aktuelleLautstaerke,
    setzeLautstaerke: function (wert) {
      lautstaerke = wert;
      wendeLautstaerkeAn();
    },
    fluestern: function (ein) {
      leise = !!ein;
      wendeLautstaerkeAn();
    },
    start: function () {
      if (!gestartet) {
        gestartet = true;
        horchtAufErstenKlick();
      }
      zeigeZustand();
      if (an) { starteHintergrund(); }
    },
    umschalten: umschalten,
    modusWechsel: function () {
      if (gestartet && an) { starteHintergrund(); }
      else if (gestartet && audioKnoten && audioListe !== aktuellesAudio()) {
        // Welt gewechselt, während die Musik pausiert: gemerkte Stelle vergessen.
        stoppeNur();
      }
    },
    fanfare: function (sterne) {
      if (!an) {
        return;
      }
      const k = kontext();
      if (!k) {
        return;
      }
      if (sterne >= 5) {
        [523.25, 659.25, 783.99, 1046.5].forEach(function (note, nummer) {
          spielTon(note, nummer * 0.14, 0.5, 0.12);
        });
      } else {
        [523.25, 659.25, 783.99].forEach(function (note, nummer) {
          spielTon(note, nummer * 0.16, 0.4, 0.1);
        });
      }
    },
    ton: function (art) {
      if (!an) {
        return;
      }
      if (art === "freude") {
        [587.33, 740, 880].forEach(function (note, nummer) {
          spielTon(note, nummer * 0.1, 0.4, 0.1);
        });
      } else if (art === "huepf") {
        spielTon(880, 0, 0.12, 0.06);
        spielTon(1175, 0.09, 0.12, 0.06);
      }
    }
  };
})();

/* ------------- Sprechtraining: Vorlesen ------------- */

/* Spielt die vorab erzeugten Sprachdateien (sprechtraining.js / audio-Ordner)
   ab oder – als Auswahl „Systemstimme“ – die Sprachausgabe des Browsers.
   Während des Vorlesens läuft die Musik leiser. */
const sprechAudio = (function () {
  const ORDNER = {
    thorsten: "audio/sprechtraining/thorsten",
    ramona: "audio/sprechtraining/ramona"
  };
  let knoten = null;
  let aktuell = null;      // id des vorgelesenen Schnipsels
  let istSystem = false;   // true, wenn gerade die Systemstimme spricht
  let pausiert = false;    // mitten im Schnipsel angehalten (Weiter spielt an gleicher Stelle)
  let unterbrochen = false;   // pause() hat den laufenden play()-Aufruf absichtlich unterbrochen
  let spielVersuch = 0;       // zählt play()-Aufrufe; späte Absagen alter Aufrufe dürfen nichts zurücksetzen
  let hoerer = [];         // Funktionen, die beim Start/Ende informiert werden

  function melde() {
    hoerer.slice().forEach(function (fn) { fn(); });
  }
  function gewaehlteStimme() {
    const wert = speicher.daten().vorleseStimme;
    return wert === "ramona" || wert === "system" ? wert : "thorsten";
  }
  function aktuelleLautstaerke() {
    const wert = speicher.daten().stimmeLautstaerke;
    return typeof wert === "number" && Number.isFinite(wert)
      ? Math.min(1, Math.max(0, wert)) : 1;
  }
  function stoppeSystem() {
    if (window.speechSynthesis && window.speechSynthesis.cancel) {
      try { window.speechSynthesis.cancel(); } catch (fehler) {}
    }
  }
  function sprichSystem(id, text) {
    if (!window.speechSynthesis || typeof window.SpeechSynthesisUtterance !== "function") {
      aktuell = null; istSystem = false; musik.fluestern(false); melde(); return;
    }
    const versuch = ++spielVersuch;
    unterbrochen = false;
    pausiert = false;
    istSystem = true;
    musik.fluestern(true);
    try {
      const sage = new window.SpeechSynthesisUtterance(text);
      sage.lang = "de-DE";
      const gewuenscht = speicher.daten().vorleseSystemStimme;
      const gefunden = window.speechSynthesis.getVoices().find(function (s) {
        return s.voiceURI === gewuenscht;
      });
      if (gefunden) { sage.voice = gefunden; }
      sage.volume = aktuelleLautstaerke();
      sage.onend = function () {
        if (spielVersuch === versuch && aktuell === id && istSystem) {
          aktuell = null; istSystem = false; pausiert = false; musik.fluestern(false); melde();
        }
      };
      sage.onerror = sage.onend;
      aktuell = id;
      window.speechSynthesis.speak(sage);
      melde();
    } catch (fehler) {
      aktuell = null; istSystem = false; pausiert = false; musik.fluestern(false); melde();
    }
  }
  function stoppe() {
    spielVersuch += 1;
    aktuell = null;
    istSystem = false;
    pausiert = false;
    unterbrochen = false;
    if (knoten) {
      try { knoten.pause(); } catch (fehler) {}
      knoten = null;
    }
    stoppeSystem();
    musik.fluestern(false);
    melde();
  }
  function pausiere() {
    if (!aktuell || pausiert) { return; }
    pausiert = true;
    unterbrochen = true;
    if (istSystem) {
      try { if (window.speechSynthesis && window.speechSynthesis.pause) { window.speechSynthesis.pause(); } } catch (fehler) {}
    } else if (knoten) {
      try { knoten.pause(); } catch (fehler) {}
    }
    musik.fluestern(false);
    melde();
  }
  function weiter() {
    if (!aktuell || !pausiert) { return; }
    pausiert = false;
    unterbrochen = false;
    const versuch = ++spielVersuch;
    const eigener = knoten;
    musik.fluestern(true);
    if (istSystem) {
      try { if (window.speechSynthesis && window.speechSynthesis.resume) { window.speechSynthesis.resume(); } } catch (fehler) {}
    } else if (eigener) {
      const zusicherung = eigener.play();
      if (zusicherung && zusicherung.catch) {
        zusicherung.catch(function () {
          if (knoten === eigener && aktuell && !unterbrochen && spielVersuch === versuch) {
            aktuell = null; pausiert = false; musik.fluestern(false); melde();
          }
        });
      }
    }
    melde();
  }
  function spiele(id, text) {
    stoppe();
    if (gewaehlteStimme() === "system") { sprichSystem(id, text); return; }
    unterbrochen = false;
    const versuch = ++spielVersuch;
    musik.fluestern(true);
    try {
      const eigener = document.createElement("audio");
      knoten = eigener;
      eigener.src = ORDNER[gewaehlteStimme()] + "/" + id + ".mp3";
      eigener.volume = aktuelleLautstaerke();
      aktuell = id;
      eigener.addEventListener("ended", function () {
        if (knoten === eigener && aktuell === id) {
          aktuell = null; pausiert = false; musik.fluestern(false); melde();
        }
      });
      eigener.addEventListener("error", function () {
        if (knoten === eigener && aktuell === id) {
          aktuell = null; pausiert = false; musik.fluestern(false); melde();
        }
      });
      const zusicherung = eigener.play();
      if (zusicherung && zusicherung.catch) {
        zusicherung.catch(function () {
          if (knoten === eigener && aktuell === id && !unterbrochen && spielVersuch === versuch) {
            aktuell = null; pausiert = false; musik.fluestern(false); melde();
          }
        });
      }
      melde();
    } catch (fehler) {
      aktuell = null; pausiert = false; musik.fluestern(false); melde();
    }
  }
  return {
    spiele: spiele,
    stoppe: stoppe,
    pausiere: pausiere,
    weiter: weiter,
    aktuell: function () { return aktuell; },
    pausiert: function () { return pausiert; },
    stimme: gewaehlteStimme,
    lautstaerke: aktuelleLautstaerke,
    setzeLautstaerke: function () {
      if (knoten && !istSystem) {
        try { knoten.volume = aktuelleLautstaerke(); } catch (fehler) {}
      }
    },
    systemStimmen: function () {
      if (!window.speechSynthesis || !window.speechSynthesis.getVoices) { return []; }
      try {
        return window.speechSynthesis.getVoices().filter(function (s) {
          return s && /^de/i.test(String(s.lang || ""));
        });
      } catch (fehler) { return []; }
    },
    aufAenderung: function (fn) { hoerer.push(fn); },
    ohneHoerer: function () { hoerer = []; }
  };
})();

/* ------------- Interaktive Extra-Übungen (Mathe-Themen & Deutsch-Übungen) ------------- */

const extraUebung = (function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function svgEl(tag, attrs, text) {
    const n = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { n.setAttribute(k, String(attrs[k])); });
    }
    if (text !== undefined) { n.textContent = String(text); }
    return n;
  }

  /* Klare analoge SVG-Uhr mit Ziffern 1–12, rotem Stunden- und blauem Minutenzeiger. */
  function baueUhrSvg(stunde, minute) {
    const svg = svgEl("svg", { class: "extra-uhr-svg", viewBox: "0 0 140 140", "aria-hidden": "true" });
    svg.appendChild(svgEl("circle", { cx: 70, cy: 70, r: 64, fill: "#fffdf6", stroke: "#466080", "stroke-width": 4 }));
    for (let i = 0; i < 60; i++) {
      const w = (i * 6 - 90) * Math.PI / 180;
      const lang = i % 5 === 0 ? 8 : 4;
      svg.appendChild(svgEl("line", {
        x1: (70 + Math.cos(w) * (60 - lang)).toFixed(1),
        y1: (70 + Math.sin(w) * (60 - lang)).toFixed(1),
        x2: (70 + Math.cos(w) * 60).toFixed(1),
        y2: (70 + Math.sin(w) * 60).toFixed(1),
        stroke: i % 5 === 0 ? "#385779" : "#9bb1c9",
        "stroke-width": i % 5 === 0 ? 2.4 : 1.1
      }));
    }
    for (let z = 1; z <= 12; z++) {
      const w = (z * 30 - 90) * Math.PI / 180;
      svg.appendChild(svgEl("text", {
        x: (70 + Math.cos(w) * 44).toFixed(1),
        y: (74 + Math.sin(w) * 44).toFixed(1),
        "text-anchor": "middle",
        "font-size": 12,
        "font-weight": 700,
        fill: "#2c3e50"
      }, z));
    }
    const minW = (minute * 6 - 90) * Math.PI / 180;
    const stdW = (((stunde % 12) + minute / 60) * 30 - 90) * Math.PI / 180;
    // Minutenzeiger (blau, lang)
    svg.appendChild(svgEl("line", {
      x1: 70, y1: 70,
      x2: (70 + Math.cos(minW) * 46).toFixed(1),
      y2: (70 + Math.sin(minW) * 46).toFixed(1),
      stroke: "#2b78c5", "stroke-width": 3.4, "stroke-linecap": "round"
    }));
    // Stundenzeiger (rot, kürzer)
    svg.appendChild(svgEl("line", {
      x1: 70, y1: 70,
      x2: (70 + Math.cos(stdW) * 31).toFixed(1),
      y2: (70 + Math.sin(stdW) * 31).toFixed(1),
      stroke: "#d64550", "stroke-width": 4.8, "stroke-linecap": "round"
    }));
    svg.appendChild(svgEl("circle", { cx: 70, cy: 70, r: 4.5, fill: "#2c3e50" }));
    return svg;
  }

  /* Geometrie-Formen, 3D-Körper, Spiegelachsen und isometrische Würfelgebäude. */
  function baueGeometrieSvg(bild) {
    const svg = svgEl("svg", { class: "extra-geo-svg", viewBox: "0 0 180 130", "aria-hidden": "true" });
    const art = bild && bild.art;
    if (art === "quadrat") {
      svg.appendChild(svgEl("rect", { x: 50, y: 25, width: 80, height: 80, fill: "#9ad0f5", stroke: "#2c5282", "stroke-width": 3 }));
    } else if (art === "rechteck") {
      svg.appendChild(svgEl("rect", { x: 25, y: 35, width: 130, height: 60, fill: "#fbd38d", stroke: "#9c4221", "stroke-width": 3 }));
    } else if (art === "dreieck") {
      svg.appendChild(svgEl("polygon", { points: "90,18 32,108 148,108", fill: "#9ae6b4", stroke: "#22543d", "stroke-width": 3 }));
    } else if (art === "fuenfeck") {
      svg.appendChild(svgEl("polygon", { points: "90,15 142,52 122,110 58,110 38,52", fill: "#fbb6ce", stroke: "#97266d", "stroke-width": 3 }));
    } else if (art === "sechseck") {
      svg.appendChild(svgEl("polygon", { points: "60,20 120,20 148,65 120,110 60,110 32,65", fill: "#d6bcfa", stroke: "#553c9a", "stroke-width": 3 }));
    } else if (art === "wuerfel") {
      svg.appendChild(svgEl("polygon", { points: "90,16 138,40 90,64 42,40", fill: "#bee3f8", stroke: "#2b6cb0", "stroke-width": 2.5 }));
      svg.appendChild(svgEl("polygon", { points: "42,40 90,64 90,114 42,90", fill: "#90cdf4", stroke: "#2b6cb0", "stroke-width": 2.5 }));
      svg.appendChild(svgEl("polygon", { points: "90,64 138,40 138,90 90,114", fill: "#63b3ed", stroke: "#2b6cb0", "stroke-width": 2.5 }));
    } else if (art === "quader") {
      svg.appendChild(svgEl("polygon", { points: "75,24 152,44 105,66 28,46", fill: "#fed7aa", stroke: "#9c4221", "stroke-width": 2.5 }));
      svg.appendChild(svgEl("polygon", { points: "28,46 105,66 105,104 28,84", fill: "#fbd38d", stroke: "#9c4221", "stroke-width": 2.5 }));
      svg.appendChild(svgEl("polygon", { points: "105,66 152,44 152,82 105,104", fill: "#f6ad55", stroke: "#9c4221", "stroke-width": 2.5 }));
    } else if (art === "spiegel-herz-ja") {
      svg.appendChild(svgEl("path", { d: "M90 108 C40 78 30 42 54 28 C70 18 85 30 90 42 C95 30 110 18 126 28 C150 42 140 78 90 108 Z", fill: "#feb2b2", stroke: "#9b2c2c", "stroke-width": 3 }));
      svg.appendChild(svgEl("line", { x1: 90, y1: 10, x2: 90, y2: 120, stroke: "#d64550", "stroke-width": 3, "stroke-dasharray": "6 5" }));
    } else if (art === "spiegel-rechteck-nein") {
      svg.appendChild(svgEl("rect", { x: 26, y: 34, width: 128, height: 62, fill: "#bee3f8", stroke: "#2b6cb0", "stroke-width": 3 }));
      svg.appendChild(svgEl("line", { x1: 20, y1: 31, x2: 160, y2: 99, stroke: "#d64550", "stroke-width": 3, "stroke-dasharray": "6 5" }));
    } else if (art === "spiegel-pfeil-nein") {
      svg.appendChild(svgEl("polygon", { points: "30,52 104,52 104,30 152,65 104,100 104,78 30,78", fill: "#c6f6d5", stroke: "#276749", "stroke-width": 3 }));
      svg.appendChild(svgEl("line", { x1: 90, y1: 12, x2: 90, y2: 118, stroke: "#d64550", "stroke-width": 3, "stroke-dasharray": "6 5" }));
    } else if (art === "spiegel-haus-ja") {
      svg.appendChild(svgEl("rect", { x: 52, y: 58, width: 76, height: 52, fill: "#fefcbf", stroke: "#744210", "stroke-width": 3 }));
      svg.appendChild(svgEl("polygon", { points: "44,58 90,20 136,58", fill: "#fc8181", stroke: "#9b2c2c", "stroke-width": 3 }));
      svg.appendChild(svgEl("rect", { x: 78, y: 80, width: 24, height: 30, fill: "#90cdf4", stroke: "#2b6cb0", "stroke-width": 2.5 }));
      svg.appendChild(svgEl("line", { x1: 90, y1: 10, x2: 90, y2: 120, stroke: "#d64550", "stroke-width": 3, "stroke-dasharray": "6 5" }));
    } else if (art === "wuerfelbau" && Array.isArray(bild.gitter)) {
      const gitter = bild.gitter;
      const dx = 22, dy = 11, dz = 22;
      const startX = 76, startY = 82;
      for (let r = 0; r < gitter.length; r++) {
        for (let c = 0; c < gitter[r].length; c++) {
          const hoehe = gitter[r][c];
          for (let z = 0; z < hoehe; z++) {
            const cx = startX + (c - r) * dx;
            const cy = startY + (c + r) * dy - z * dz;
            // Oben
            svg.appendChild(svgEl("polygon", {
              points: cx + "," + (cy - dy) + " " + (cx + dx) + "," + cy + " " + cx + "," + (cy + dy) + " " + (cx - dx) + "," + cy,
              fill: "#fef08a", stroke: "#854d0e", "stroke-width": 1.8
            }));
            // Links
            svg.appendChild(svgEl("polygon", {
              points: (cx - dx) + "," + cy + " " + cx + "," + (cy + dy) + " " + cx + "," + (cy + dy + dz) + " " + (cx - dx) + "," + (cy + dz),
              fill: "#fde047", stroke: "#854d0e", "stroke-width": 1.8
            }));
            // Rechts
            svg.appendChild(svgEl("polygon", {
              points: cx + "," + (cy + dy) + " " + (cx + dx) + "," + cy + " " + (cx + dx) + "," + (cy + dz) + " " + cx + "," + (cy + dy + dz),
              fill: "#eab308", stroke: "#854d0e", "stroke-width": 1.8
            }));
          }
        }
      }
    }
    return svg;
  }

  /* Rendert einen Satz mit **markiertem Wort** für Wortarten-Übungen. */
  function wortartSatzKnoten(satz) {
    const p = element("p", "extra-frage extra-wortart-satz");
    const teile = String(satz || "").split(/\*\*(.+?)\*\*/);
    teile.forEach(function (teil, idx) {
      if (idx % 2 === 1) {
        p.appendChild(element("mark", "wort-markiert", teil));
      } else if (teil) {
        p.appendChild(document.createTextNode(teil));
      }
    });
    return p;
  }

  function rendereRunde(behaelter, paket, optionen) {
    const opts = optionen || {};
    behaelter.textContent = "";
    const pruefer = [];
    let geprueft = false;

    // Kopfzeile der Übung
    const kopf = element("div", "sprech-kopf extra-kopf");
    const zurueck = element("button", "knopf schlicht", "◀ Übersicht");
    zurueck.type = "button";
    zurueck.addEventListener("click", function () {
      if (opts.aufZurueck) { opts.aufZurueck(); }
    });
    kopf.appendChild(zurueck);
    kopf.appendChild(element("h3", null, paket.thema.symbol + " " + paket.thema.titel));
    if (opts.figur) {
      kopf.appendChild(figurBild(opts.figur, "sprech-figur"));
    }
    kopf.appendChild(element("p", "sprech-ziel", paket.thema.kurz));
    behaelter.appendChild(kopf);

    // Optionaler Lesetext (bei Leseverständnis)
    if (paket.lesetext) {
      const leseKarte = element("div", "sterne-karte extra-lesetext");
      leseKarte.appendChild(element("h4", null, "📖 " + paket.lesetext.titel));
      leseKarte.appendChild(element("p", "sprech-text", paket.lesetext.text));
      behaelter.appendChild(leseKarte);
    }

    const liste = element("div", "extra-aufgaben-liste");
    paket.aufgaben.forEach(function (aufgabe, index) {
      const karte = element("div", "aufgabe extra-aufgabe");
      const nummer = element("div", "extra-aufgabe-kopf");
      nummer.appendChild(element("span", "extra-nummer", "Aufgabe " + (index + 1)));
      if (aufgabe.badge) {
        nummer.appendChild(element("span", "extra-badge", aufgabe.badge));
      }
      karte.appendChild(nummer);

      if (aufgabe.typ === "wortart") {
        karte.appendChild(wortartSatzKnoten(aufgabe.satz));
      } else if (aufgabe.frage) {
        karte.appendChild(element("p", "extra-frage", aufgabe.frage));
      }

      if (aufgabe.uhr) {
        const uhrBox = element("div", "extra-grafik");
        uhrBox.appendChild(baueUhrSvg(aufgabe.uhr.stunde, aufgabe.uhr.minute));
        karte.appendChild(uhrBox);
      }
      if (aufgabe.bild) {
        const geoBox = element("div", "extra-grafik");
        geoBox.appendChild(baueGeometrieSvg(aufgabe.bild));
        karte.appendChild(geoBox);
      }

      const kontrolle = element("div", "kontrolle");

      if (aufgabe.typ === "felder") {
        const zeile = element("div", "extra-eingabezeile");
        if (aufgabe.ausdruck) {
          zeile.appendChild(element("span", "extra-ausdruck", aufgabe.ausdruck));
        }
        const knotenListe = aufgabe.felder.map(function (f) {
          const inp = element("input", "eingabe extra-zahl");
          inp.type = "text";
          inp.inputMode = "numeric";
          inp.autocomplete = "off";
          inp.spellcheck = false;
          inp.placeholder = "?";
          if (f.max) { inp.maxLength = f.max; }
          inp.setAttribute("aria-label", f.einheit ? "Antwort in " + f.einheit : "Antwort");
          zeile.appendChild(inp);
          if (f.einheit) {
            zeile.appendChild(element("span", "extra-einheit", f.einheit));
          }
          return { inp: inp, korrekt: f.korrekt };
        });
        karte.appendChild(zeile);
        pruefer.push(function () {
          let ok = true;
          knotenListe.forEach(function (eintrag) {
            const wert = parseZahl(eintrag.inp.value);
            const stimmt = wert !== null && wert === eintrag.korrekt;
            if (!stimmt) { ok = false; }
            eintrag.inp.classList.add(stimmt ? "richtig" : "falsch");
            eintrag.inp.disabled = true;
          });
          return { ok: ok, karte: karte, kontrolle: kontrolle, aufgabe: aufgabe };
        });
      } else if (aufgabe.typ === "uhr-eingabe") {
        const zeile = element("div", "extra-eingabezeile");
        const inp = element("input", "eingabe mittel");
        inp.type = "text";
        inp.inputMode = "text";
        inp.autocomplete = "off";
        inp.spellcheck = false;
        inp.placeholder = "3:25";
        inp.setAttribute("aria-label", "Uhrzeit eingeben");
        zeile.appendChild(inp);
        zeile.appendChild(element("span", "extra-einheit", "Uhr"));
        karte.appendChild(zeile);
        pruefer.push(function () {
          const parsed = parseZeit(inp.value);
          const ok = Boolean(MATHE_THEMEN && MATHE_THEMEN.uhrAntwortStimmt(parsed, aufgabe.ziel));
          inp.classList.add(ok ? "richtig" : "falsch");
          inp.disabled = true;
          return { ok: ok, karte: karte, kontrolle: kontrolle, aufgabe: aufgabe };
        });
      } else if (aufgabe.typ === "auswahl" || aufgabe.typ === "wortart") {
        let gewaehlt = null;
        const gruppe = element("div", "extra-optionen");
        const knoepfe = aufgabe.optionen.map(function (optText, optIdx) {
          const k = element("button", "extra-option", optText);
          k.type = "button";
          k.setAttribute("aria-pressed", "false");
          k.addEventListener("click", function () {
            if (geprueft) { return; }
            gewaehlt = optIdx;
            knoepfe.forEach(function (anderer, j) {
              anderer.classList.toggle("aktiv", j === optIdx);
              anderer.setAttribute("aria-pressed", String(j === optIdx));
            });
          });
          gruppe.appendChild(k);
          return k;
        });
        karte.appendChild(gruppe);
        pruefer.push(function () {
          const ok = gewaehlt === aufgabe.richtig;
          knoepfe.forEach(function (k, j) {
            k.disabled = true;
            if (j === aufgabe.richtig) { k.classList.add("opt-richtig"); }
            else if (j === gewaehlt) { k.classList.add("opt-falsch"); }
          });
          return { ok: ok, karte: karte, kontrolle: kontrolle, aufgabe: aufgabe };
        });
      } else if (aufgabe.typ === "ordnen") {
        let reihenfolge = [];
        const zielBox = element("div", "extra-ordnen-ziel");
        const vorratBox = element("div", "extra-ordnen-vorrat");
        const leerenKnopf = element("button", "knopf schlicht klein extra-leeren", "↺ Neu legen");
        leerenKnopf.type = "button";

        function zeichneOrdnen() {
          zielBox.textContent = "";
          if (reihenfolge.length === 0) {
            zielBox.appendChild(element("span", "rand", "Klicke die Bausteine unten der Reihe nach an …"));
          } else {
            reihenfolge.forEach(function (idx, pos) {
              const chip = element("button", "extra-chip gewaehlt", aufgabe.bausteine[idx]);
              chip.type = "button";
              chip.disabled = geprueft;
              chip.addEventListener("click", function () {
                if (geprueft) { return; }
                reihenfolge.splice(pos, 1);
                zeichneOrdnen();
              });
              zielBox.appendChild(chip);
            });
          }
          vorratBox.textContent = "";
          aufgabe.bausteine.forEach(function (text, idx) {
            const benutzt = reihenfolge.includes(idx);
            const chip = element("button", "extra-chip" + (benutzt ? " benutzt" : ""), text);
            chip.type = "button";
            chip.disabled = geprueft || benutzt;
            chip.addEventListener("click", function () {
              if (geprueft || reihenfolge.includes(idx)) { return; }
              reihenfolge.push(idx);
              zeichneOrdnen();
            });
            vorratBox.appendChild(chip);
          });
          leerenKnopf.disabled = geprueft || reihenfolge.length === 0;
        }
        leerenKnopf.addEventListener("click", function () {
          if (geprueft) { return; }
          reihenfolge = [];
          zeichneOrdnen();
        });
        zeichneOrdnen();
        karte.appendChild(zielBox);
        karte.appendChild(vorratBox);
        karte.appendChild(leerenKnopf);
        pruefer.push(function () {
          const gebaut = reihenfolge.map(function (idx) { return aufgabe.bausteine[idx]; });
          const ok = gebaut.length === aufgabe.loesung.length &&
            gebaut.every(function (t, i) { return t === aufgabe.loesung[i]; });
          zeichneOrdnen();
          return { ok: ok, karte: karte, kontrolle: kontrolle, aufgabe: aufgabe };
        });
      } else if (aufgabe.typ === "mauer") {
        const mauer = element("div", "rechenmauer");
        const eingaben = [];
        const reihen = [
          [aufgabe.steine[0]],
          [aufgabe.steine[1], aufgabe.steine[2]],
          [aufgabe.steine[3], aufgabe.steine[4], aufgabe.steine[5]]
        ];
        reihen.forEach(function (reihe) {
          const rKnoten = element("div", "mauer-reihe");
          reihe.forEach(function (stein) {
            if (stein.offen) {
              const inp = element("input", "eingabe mauer-stein-eingabe");
              inp.type = "text";
              inp.inputMode = "numeric";
              inp.autocomplete = "off";
              inp.placeholder = "?";
              inp.maxLength = 4;
              inp.setAttribute("aria-label", "Mauerstein");
              rKnoten.appendChild(inp);
              eingaben.push({ inp: inp, korrekt: stein.wert });
            } else {
              rKnoten.appendChild(element("span", "mauer-stein-fest", String(stein.wert)));
            }
          });
          mauer.appendChild(rKnoten);
        });
        karte.appendChild(mauer);
        pruefer.push(function () {
          let ok = true;
          eingaben.forEach(function (eintrag) {
            const wert = parseZahl(eintrag.inp.value);
            const stimmt = wert !== null && wert === eintrag.korrekt;
            if (!stimmt) { ok = false; }
            eintrag.inp.classList.add(stimmt ? "richtig" : "falsch");
            eintrag.inp.disabled = true;
          });
          return { ok: ok, karte: karte, kontrolle: kontrolle, aufgabe: aufgabe };
        });
      } else if (aufgabe.typ === "dreieck") {
        const box = element("div", "rechendreieck");
        const buehne = element("div", "rechendreieck-feld");
        const svg = svgEl("svg", {
          class: "rechendreieck-svg",
          viewBox: "0 0 400 320",
          "aria-hidden": "true"
        });
        // Großes Dreieck (Innenraum klar von den Außenfeldern getrennt)
        svg.appendChild(svgEl("polygon", {
          class: "rechendreieck-form",
          points: "200,18 72,238 328,238"
        }));
        // Drei Kammern im Inneren (Mittelpunkt zu den drei Seitenmitten)
        [
          [200, 165, 136, 128],
          [200, 165, 264, 128],
          [200, 165, 200, 238]
        ].forEach(function (linie) {
          svg.appendChild(svgEl("line", {
            class: "rechendreieck-teiler",
            x1: linie[0], y1: linie[1], x2: linie[2], y2: linie[3]
          }));
        });
        svg.appendChild(svgEl("circle", {
          class: "rechendreieck-punkt",
          cx: 200, cy: 165, r: 3.5
        }));
        // Verbindungsstriche von den Seitenmitten zu den drei Außenzahlen
        [
          [136, 128, 102, 118],
          [264, 128, 298, 118],
          [200, 238, 200, 262]
        ].forEach(function (zeiger) {
          svg.appendChild(svgEl("line", {
            class: "rechendreieck-zeiger",
            x1: zeiger[0], y1: zeiger[1], x2: zeiger[2], y2: zeiger[3]
          }));
          svg.appendChild(svgEl("circle", {
            class: "rechendreieck-kantenpunkt",
            cx: zeiger[0], cy: zeiger[1], r: 4
          }));
        });
        buehne.appendChild(svg);

        const eingaben = [];
        function feldOderWert(eintrag, rolle, posKlasse, beschriftung) {
          const platz = element("div", "dreieck-platz " + posKlasse);
          if (eintrag.offen) {
            const inp = element("input", "eingabe dreieck-eingabe " + rolle);
            inp.type = "text";
            inp.inputMode = "numeric";
            inp.autocomplete = "off";
            inp.placeholder = "?";
            inp.maxLength = 4;
            inp.setAttribute("aria-label", beschriftung);
            eingaben.push({ inp: inp, korrekt: eintrag.wert });
            platz.appendChild(inp);
          } else {
            platz.appendChild(element("span", "dreieck-fest " + rolle, String(eintrag.wert)));
          }
          return platz;
        }
        buehne.appendChild(feldOderWert(aufgabe.innen[0], "dreieck-innen", "pos-i1", "Innenzahl oben"));
        buehne.appendChild(feldOderWert(aufgabe.innen[1], "dreieck-innen", "pos-i2", "Innenzahl links unten"));
        buehne.appendChild(feldOderWert(aufgabe.innen[2], "dreieck-innen", "pos-i3", "Innenzahl rechts unten"));
        buehne.appendChild(feldOderWert(aufgabe.aussen[0], "dreieck-aussen", "pos-a12", "Außenzahl links (Summe)"));
        buehne.appendChild(feldOderWert(aufgabe.aussen[2], "dreieck-aussen", "pos-a13", "Außenzahl rechts (Summe)"));
        buehne.appendChild(feldOderWert(aufgabe.aussen[1], "dreieck-aussen", "pos-a23", "Außenzahl unten (Summe)"));
        box.appendChild(buehne);
        karte.appendChild(box);
        pruefer.push(function () {
          let ok = true;
          eingaben.forEach(function (eintrag) {
            const wert = parseZahl(eintrag.inp.value);
            const stimmt = wert !== null && wert === eintrag.korrekt;
            if (!stimmt) { ok = false; }
            eintrag.inp.classList.add(stimmt ? "richtig" : "falsch");
            eintrag.inp.disabled = true;
          });
          return { ok: ok, karte: karte, kontrolle: kontrolle, aufgabe: aufgabe };
        });
      } else if (aufgabe.typ === "schriftlich") {
        const gitter = element("div", "schriftlich-gitter");
        const ziffern = function (n) {
          return [Math.floor(n / 100), Math.floor((n % 100) / 10), n % 10];
        };
        const aZ = ziffern(aufgabe.a);
        const bZ = ziffern(aufgabe.b);
        const eZ = ziffern(aufgabe.ergebnis);

        ["", "H", "Z", "E"].forEach(function (kopfText) {
          gitter.appendChild(element("span", "schriftlich-kopf", kopfText));
        });
        gitter.appendChild(element("span", "schriftlich-op", ""));
        aZ.forEach(function (d) { gitter.appendChild(element("span", "schriftlich-ziffer", String(d))); });

        gitter.appendChild(element("span", "schriftlich-op", aufgabe.op));
        bZ.forEach(function (d) { gitter.appendChild(element("span", "schriftlich-ziffer", String(d))); });

        // Merkfeld-Zeile (optional, zählt nie als Fehler)
        gitter.appendChild(element("span", "schriftlich-merk-titel", "Merk"));
        const merkFelder = [0, 1, 2].map(function (spalte) {
          if (spalte === 2) {
            const leer = element("span", "schriftlich-merk-leer", "");
            gitter.appendChild(leer);
            return null;
          }
          const m = element("input", "schriftlich-merk");
          m.type = "text";
          m.inputMode = "numeric";
          m.maxLength = 1;
          m.placeholder = "·";
          m.setAttribute("aria-label", spalte === 0 ? "Merkfeld Hunderter" : "Merkfeld Zehner");
          gitter.appendChild(m);
          return m;
        });

        gitter.appendChild(element("span", "schriftlich-strich"));

        // Ergebnis-Ziffern (H, Z, E) mit Auto-Sprung von rechts nach links (E -> Z -> H)
        gitter.appendChild(element("span", "schriftlich-op", "="));
        const ergFelder = [0, 1, 2].map(function (spalte) {
          const inp = element("input", "eingabe schriftlich-erg");
          inp.type = "text";
          inp.inputMode = "numeric";
          inp.autocomplete = "off";
          inp.maxLength = 1;
          inp.placeholder = "?";
          inp.setAttribute("aria-label", spalte === 0 ? "Ergebnis Hunderter" : spalte === 1 ? "Ergebnis Zehner" : "Ergebnis Einer");
          gitter.appendChild(inp);
          return inp;
        });
        ergFelder.forEach(function (inp, spalte) {
          inp.addEventListener("input", function () {
            if (inp.value.trim().length === 1 && spalte > 0) {
              ergFelder[spalte - 1].focus();
            }
          });
        });
        karte.appendChild(gitter);
        pruefer.push(function () {
          const h = parseZahl(ergFelder[0].value);
          const z = parseZahl(ergFelder[1].value);
          const e = parseZahl(ergFelder[2].value);
          const ok = h !== null && z !== null && e !== null && (h * 100 + z * 10 + e === aufgabe.ergebnis);
          ergFelder.forEach(function (inp, spalte) {
            const zifferStimmt = parseZahl(inp.value) === eZ[spalte];
            inp.classList.add(zifferStimmt ? "richtig" : "falsch");
            inp.disabled = true;
          });
          merkFelder.forEach(function (m) { if (m) { m.disabled = true; } });
          return { ok: ok, karte: karte, kontrolle: kontrolle, aufgabe: aufgabe };
        });
      }

      karte.appendChild(kontrolle);
      liste.appendChild(karte);
    });
    behaelter.appendChild(liste);

    const ergebnisBox = element("div", "ergebnis-kasten extra-ergebnis");
    ergebnisBox.hidden = true;
    behaelter.appendChild(ergebnisBox);

    const aktionen = element("div", "sprech-zeile extra-aktionen");
    const pruefenKnopf = element("button", "knopf primaer extra-pruefen", "Prüfen ✓");
    pruefenKnopf.type = "button";
    const neuKnopf = element("button", "knopf primaer extra-neu", "▶ Neue Runde");
    neuKnopf.type = "button";
    neuKnopf.hidden = true;
    const uebersichtUnten = element("button", "knopf schlicht", "◀ Übersicht");
    uebersichtUnten.type = "button";
    uebersichtUnten.addEventListener("click", function () {
      if (opts.aufZurueck) { opts.aufZurueck(); }
    });
    neuKnopf.addEventListener("click", function () {
      if (opts.aufNeu) { opts.aufNeu(); }
    });

    pruefenKnopf.addEventListener("click", function () {
      if (geprueft) { return; }
      geprueft = true;
      let richtig = 0;
      pruefer.forEach(function (fn) {
        const res = fn();
        res.kontrolle.textContent = "";
        if (res.ok) {
          richtig += 1;
          res.karte.classList.add("richtig");
          res.kontrolle.appendChild(element("span", "markierung", "✓ Richtig!"));
        } else {
          res.karte.classList.add("falsch");
          res.kontrolle.appendChild(element("span", "markierung",
            res.aufgabe.erklaerung ? "✗ Nicht ganz: " : "✗ Noch nicht richtig."));
          if (res.aufgabe.erklaerung) {
            res.kontrolle.appendChild(element("span", "loesung", res.aufgabe.erklaerung));
          }
        }
      });
      const gesamt = pruefer.length;
      const anteil = gesamt > 0 ? richtig / gesamt : 0;
      ergebnisBox.textContent = "";
      ergebnisBox.hidden = false;
      ergebnisBox.appendChild(element("p", "ergebnis-zeile", richtig + " von " + gesamt + " richtig!"));
      ergebnisBox.appendChild(element("p", "ergebnis-lob", lobFuerAnteil(anteil, richtig, gesamt)));
      pruefenKnopf.hidden = true;
      neuKnopf.hidden = false;
      if (anteil >= 0.8) {
        musik.fanfare(anteil === 1 ? 5 : 4);
        if (EINSTELLUNGEN.spaessig) { sternenRegen(anteil === 1); }
      }
      meldeRueckmeldung(richtig + " von " + gesamt + (gesamt === 1 ? " Aufgabe" : " Aufgaben") + " richtig gelöst.");
      if (typeof ergebnisBox.scrollIntoView === "function") {
        ergebnisBox.scrollIntoView({ block: "nearest" });
      }
    });

    aktionen.appendChild(uebersichtUnten);
    aktionen.appendChild(pruefenKnopf);
    aktionen.appendChild(neuKnopf);
    behaelter.appendChild(aktionen);
  }

  function oeffneMatheThema(themaId) {
    if (!MATHE_THEMEN) { return; }
    const paket = MATHE_THEMEN.erzeuge(themaId, modus);
    const inhalt = document.getElementById("matheThemaInhalt");
    if (!inhalt) { return; }
    rendereRunde(inhalt, paket, {
      figur: themenSymbol(),
      aufZurueck: function () {
        zeigeStartErgebnis();
        zeigeBildschirm("startBildschirm");
      },
      aufNeu: function () {
        oeffneMatheThema(themaId);
      }
    });
    zeigeBildschirm("matheThemaBildschirm");
  }

  function fuelleMatheThemenListe() {
    const liste = document.getElementById("matheThemenListe");
    if (!liste || !MATHE_THEMEN) { return; }
    liste.textContent = "";
    MATHE_THEMEN.THEMEN.forEach(function (thema) {
      const kachel = element("button", "themen-kachel");
      kachel.type = "button";
      kachel.dataset.matheThema = thema.id;
      kachel.appendChild(element("span", "kachel-symbol", thema.symbol));
      kachel.appendChild(element("span", "kachel-titel", thema.titel));
      kachel.appendChild(element("span", "kachel-text", thema.kurz));
      kachel.addEventListener("click", function () {
        oeffneMatheThema(thema.id);
      });
      liste.appendChild(kachel);
    });
  }

  return {
    rendereRunde: rendereRunde,
    oeffneMatheThema: oeffneMatheThema,
    fuelleMatheThemenListe: fuelleMatheThemenListe
  };
})();

/* ------------- Deutsch üben: Ablauf ------------- */

const sprech = (function () {
  const SCHRITTE = ["Zuhören", "Verstehen", "Satz bilden", "Erzählen"];
  let einheit = null;        // geöffnete Geschichte oder null (Übersicht)
  let deutschUebungId = null; // geöffnete selbstständige Deutsch-Übung oder null
  let letzteLeseId = null;
  let frageSetNummer = 1;    // welcher der vier Fragensätze gerade dran ist
  let schritt = 0;
  let hilfeSichtbar = false;
  let antwortenSichtbar = false;
  let bewertung = null;      // { punkte:Set, reihenfolge, grammatik, aussprache, zusammen }
  let letzteFragenSet = {};  // Geschichte → Fragensatz der letzten Runde (kein sofortiges Wiederholen)
  let letzteGeschichte = null;

  function oeffnen() {
    sprechAudio.stoppe();
    zeigeBildschirm("sprechBildschirm");
    rendere();
  }
  /* Deutsch-Startseite: laufende Übung verwerfen und zur Übersicht. */
  function oeffneStart() {
    sprechAudio.stoppe();
    einheit = null;
    deutschUebungId = null;
    oeffnen();
  }
  function oeffneDeutschUebung(themaId) {
    sprechAudio.stoppe();
    einheit = null;
    deutschUebungId = themaId;
    rendere();
    if (typeof window.scrollTo === "function") { window.scrollTo(0, 0); }
  }
  function waehleFragenSet(e) {
    const anzahl = (Array.isArray(e.fragenSets) && e.fragenSets.length) || 1;
    if (anzahl < 2) { return 1; }
    let nr = 1 + Math.floor(Math.random() * anzahl);
    if (nr === letzteFragenSet[e.tag]) { nr = (nr % anzahl) + 1; }
    return nr;
  }
  function starteZufaellig() {
    const alle = SPRECHTRAINING.EINHEITEN;
    const start = Math.floor(Math.random() * alle.length);
    let geschichte = alle[start];
    if (alle.length > 1 && geschichte.tag === letzteGeschichte) {
      geschichte = alle[(start + 1) % alle.length];
    }
    oeffneEinheit(geschichte);
  }
  function oeffneEinheit(e, setNummer) {
    sprechAudio.stoppe();
    const anzahl = (Array.isArray(e.fragenSets) && e.fragenSets.length) || 1;
    einheit = e;
    frageSetNummer = (typeof setNummer === "number" && setNummer >= 1 && setNummer <= anzahl)
      ? setNummer : waehleFragenSet(e);
    letzteFragenSet[e.tag] = frageSetNummer;
    letzteGeschichte = e.tag;
    schritt = 0;
    hilfeSichtbar = false;
    antwortenSichtbar = false;
    bewertung = { punkte: new Set() };
    rendere();
  }
  function zurueckZurUebersicht() {
    sprechAudio.stoppe();
    einheit = null;
    deutschUebungId = null;
    rendere();
  }
  function rendere() {
    sprechAudio.ohneHoerer();
    const ueberschrift = document.getElementById("sprechUeberschrift");
    const reihe = document.getElementById("sprechMaskottchenReihe");
    if (einheit) {
      if (ueberschrift) { ueberschrift.textContent = "Deutsch üben"; }
      if (reihe) { reihe.hidden = true; }
      rendereEinheit();
    } else if (deutschUebungId && DEUTSCH_UEBUNGEN) {
      if (ueberschrift) { ueberschrift.textContent = "Deutsch üben"; }
      if (reihe) { reihe.hidden = true; }
      const inhalt = document.getElementById("sprechInhalt");
      const paket = DEUTSCH_UEBUNGEN.erzeuge(deutschUebungId, deutschWeltId(), letzteLeseId);
      if (paket.lesetext) { letzteLeseId = paket.lesetext.id; }
      extraUebung.rendereRunde(inhalt, paket, {
        figur: DEUTSCH_WELTEN[deutschWeltId()].figur,
        aufZurueck: zurueckZurUebersicht,
        aufNeu: function () { oeffneDeutschUebung(deutschUebungId); }
      });
    } else {
      if (ueberschrift) { ueberschrift.textContent = "Hallo " + SPIELERIN + "!"; }
      if (reihe) { reihe.hidden = false; }
      rendereUebersicht();
    }
  }

  /* Ein Knopf, der einen Textabschnitt vorliest (Kinderstimme optional).
     Erste Klick startet, zweiter pausiert, dritter setzt an derselben Stelle fort. */
  function vorleseKnopf(id, text) {
    const knopf = element("button", "knopf schlicht vorlesen-knopf");
    knopf.type = "button";
    function auffrischen() {
      const laeuft = sprechAudio.aktuell() === id && !sprechAudio.pausiert();
      const wartet = sprechAudio.aktuell() === id && sprechAudio.pausiert();
      knopf.textContent = laeuft ? "⏸ Pause" : wartet ? "▶ Weiter" : "🔊 Vorlesen";
      knopf.setAttribute("aria-pressed", String(laeuft));
    }
    knopf.addEventListener("click", function () {
      if (sprechAudio.aktuell() === id) {
        if (sprechAudio.pausiert()) { sprechAudio.weiter(); } else { sprechAudio.pausiere(); }
      } else { sprechAudio.spiele(id, text); }
    });
    sprechAudio.aufAenderung(auffrischen);
    auffrischen();
    return knopf;
  }

  function elternKasten(ueberschrift) {
    const kasten = element("div", "eltern-kasten");
    kasten.appendChild(element("h4", null, ueberschrift));
    const liste = element("ul", "eltern-liste");
    SPRECHTRAINING.BEGLEITUNG.forEach(function (text) {
      liste.appendChild(element("li", null, text));
    });
    const dreh = element("details", null);
    dreh.appendChild(element("summary", null, "Für dich, erwachsene Person: Anleitung"));
    dreh.appendChild(liste);
    kasten.appendChild(dreh);
    return kasten;
  }

  function fuelleMaskottchenReihe() {
    const reihe = document.getElementById("sprechMaskottchenReihe");
    if (!reihe) { return; }
    reihe.textContent = "";
    const welt = DEUTSCH_WELTEN[deutschWeltId()];
    const figuren = welt.figuren.slice();
    for (let i = figuren.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [figuren[i], figuren[j]] = [figuren[j], figuren[i]];
    }
    figuren.forEach(function (figur) {
      const knopf = element("button", "maskottchen");
      knopf.type = "button";
      knopf.title = welt.namen[welt.figuren.indexOf(figur)] || "";
      const bild = figurBild(figur);
      bild.draggable = false;
      knopf.appendChild(bild);
      macheMaskottchenZiehbar(knopf, reihe);
      const platz = element("div", "maskottchen-platz");
      platz.appendChild(knopf);
      reihe.appendChild(platz);
    });
  }

  function rendereUebersicht() {
    const inhalt = document.getElementById("sprechInhalt");
    inhalt.textContent = "";
    fuelleMaskottchenReihe();

    inhalt.appendChild(element("p", "start-info",
      "Jede Übung dauert etwa 10 Minuten: einen kurzen Text anhören, Fragen beantworten, " +
      "Sätze bilden und am Ende mit eigenen Worten erzählen. Gemeinsam mit Mama oder Papa – " +
      "und jede Runde ist neu zusammengestellt."));

    inhalt.appendChild(element("p", "feldueberschrift", "Wer soll mit dir üben?"));
    const weltZeile = element("div", "themen-auswahl");
    weltZeile.setAttribute("role", "group");
    weltZeile.setAttribute("aria-label", "Welt für Deutsch üben wählen");
    Object.keys(DEUTSCH_WELTEN).forEach(function (id) {
      const welt = DEUTSCH_WELTEN[id];
      const aktiv = deutschWeltId() === id;
      const knopf = element("button", "deutsch-welt" + (aktiv ? " aktiv" : ""));
      knopf.type = "button";
      knopf.setAttribute("aria-pressed", String(aktiv));
      knopf.appendChild(figurBild(welt.figur));
      knopf.appendChild(element("span", "deutsch-welt-titel", welt.titel));
      knopf.appendChild(element("span", "deutsch-welt-text", welt.beschreibung));
      knopf.addEventListener("click", function () {
        speicher.daten().deutschWelt = id;
        speicher.speichere();
        musik.modusWechsel();
        rendere();
      });
      weltZeile.appendChild(knopf);
    });
    inhalt.appendChild(weltZeile);

    const aktionen = element("div", "start-aktionen");
    const los = element("button", "knopf primaer riesig sprech-los", "Los geht's!");
    los.type = "button";
    los.addEventListener("click", starteZufaellig);
    aktionen.appendChild(los);
    inhalt.appendChild(aktionen);

    const wahl = element("details", "sprech-wahl");
    wahl.appendChild(element("summary", null, "Oder eine bestimmte Geschichte aussuchen"));
    const raster = element("div", "sprech-tage");
    SPRECHTRAINING.EINHEITEN.forEach(function (e, i) {
      const knopf = element("button", "sprech-tag");
      knopf.type = "button";
      knopf.appendChild(element("span", "sprech-tag-nummer", "Übung " + (i + 1)));
      knopf.appendChild(element("span", "sprech-tag-titel", e.ziel));
      knopf.appendChild(element("span", "sprech-tag-status", "▶ üben"));
      knopf.addEventListener("click", function () { oeffneEinheit(e); });
      raster.appendChild(knopf);
    });
    wahl.appendChild(raster);
    inhalt.appendChild(wahl);

    inhalt.appendChild(elternKasten("So läuft das Sprechtraining"));

    if (DEUTSCH_UEBUNGEN) {
      const extraBlock = element("div", "extra-themen-bereich");
      extraBlock.appendChild(element("h3", "extra-ueberschrift", "Selbstständig Deutsch üben"));
      extraBlock.appendChild(element("p", "rand",
        "Diese fünf Übungen kann " + SPIELERIN + " auch ganz allein spielen – mit sofortiger Hilfe."));
      const kacheln = element("div", "themen-kacheln");
      DEUTSCH_UEBUNGEN.THEMEN.forEach(function (thema) {
        const kachel = element("button", "themen-kachel");
        kachel.type = "button";
        kachel.dataset.deutschThema = thema.id;
        kachel.appendChild(element("span", "kachel-symbol", thema.symbol));
        kachel.appendChild(element("span", "kachel-titel", thema.titel));
        kachel.appendChild(element("span", "kachel-text", thema.kurz));
        kachel.addEventListener("click", function () {
          oeffneDeutschUebung(thema.id);
        });
        kacheln.appendChild(kachel);
      });
      extraBlock.appendChild(kacheln);
      inhalt.appendChild(extraBlock);
    }
  }

  function schrittLeiste() {
    const leiste = element("p", "sprech-schritte");
    SCHRITTE.forEach(function (name, i) {
      const klasse = "sprech-schritt" + (i === schritt ? " aktiv" : "") + (i < schritt ? " erledigt" : "");
      leiste.appendChild(element("span", klasse, (i < schritt ? "✓ " : "") + name));
    });
    return leiste;
  }
  function weiterKnopf(text) {
    const knopf = element("button", "knopf primaer sprech-weiter", text || "Weiter ▶");
    knopf.type = "button";
    knopf.addEventListener("click", function () {
      sprechAudio.stoppe();
      schritt += 1;
      rendere();
      if (typeof window.scrollTo === "function") { window.scrollTo(0, 0); }
    });
    return knopf;
  }
  /* Blätterleiste wie in Mathe: Zurück (ab Schritt 2) neben Weiter. */
  function schrittNavi(text) {
    const zeile = element("div", "sprech-zeile sprech-navi");
    if (schritt > 0) {
      const zurueck = element("button", "knopf schlicht", "◀ Zurück");
      zurueck.type = "button";
      zurueck.addEventListener("click", function () {
        sprechAudio.stoppe();
        schritt -= 1;
        rendere();
        if (typeof window.scrollTo === "function") { window.scrollTo(0, 0); }
      });
      zeile.appendChild(zurueck);
    }
    zeile.appendChild(weiterKnopf(text));
    return zeile;
  }

  function rendereEinheit() {
    const inhalt = document.getElementById("sprechInhalt");
    inhalt.textContent = "";
    const nr = ("0" + einheit.tag).slice(-2);
    const fragen = SPRECHTRAINING.fragenSet(einheit, frageSetNummer);

    const kopf = element("div", "sprech-kopf");
    const zurueck = element("button", "knopf schlicht", "◀ Übersicht");
    zurueck.type = "button";
    zurueck.addEventListener("click", zurueckZurUebersicht);
    kopf.appendChild(zurueck);
    kopf.appendChild(element("h3", null, einheit.titel));
    kopf.appendChild(figurBild(DEUTSCH_WELTEN[deutschWeltId()].figur, "sprech-figur"));
    kopf.appendChild(element("p", "sprech-ziel", "Mini-Ziel: " + einheit.ziel));
    inhalt.appendChild(kopf);
    inhalt.appendChild(schrittLeiste());

    if (schritt === 0) {
      const karte = element("div", "sterne-karte");
      karte.appendChild(element("h4", null, "1. Zuhören"));
      karte.appendChild(element("p", "sprech-text", einheit.text));
      const zeile = element("div", "sprech-zeile");
      zeile.appendChild(vorleseKnopf("tag" + nr + "-text", einheit.text));
      zeile.appendChild(element("span", "rand", "Erst hören, dann sprecht ihr darüber."));
      karte.appendChild(zeile);
      inhalt.appendChild(karte);
      inhalt.appendChild(elternKasten("Für die Begleitung"));
      inhalt.appendChild(schrittNavi("Verstanden! Weiter ▶"));
    } else if (schritt === 1) {
      const karte = element("div", "sterne-karte");
      karte.appendChild(element("h4", null, "2. Verstehen"));
      karte.appendChild(element("p", "rand",
        "Stelle jede Frage mündlich. Die kleine Antwort daneben ist für dich zum Nachschlagen."));
      fragen.forEach(function (f, i) {
        const zeile = element("div", "sprech-frage");
        zeile.appendChild(vorleseKnopf("tag" + nr + "-s" + frageSetNummer + "-f" + (i + 1), f.frage));
        zeile.appendChild(element("span", "sprech-frage-text", f.frage));
        const antwort = element("span", "sprech-antwort" + (antwortenSichtbar ? "" : " verborgen"), "→ " + f.antwort);
        zeile.appendChild(antwort);
        karte.appendChild(zeile);
      });
      const antwortKnopf = element("button", "knopf schlicht", antwortenSichtbar ? "Antworten verbergen" : "Antworten zeigen");
      antwortKnopf.type = "button";
      antwortKnopf.addEventListener("click", function () {
        antwortenSichtbar = !antwortenSichtbar;
        rendere();
      });
      karte.appendChild(antwortKnopf);
      inhalt.appendChild(karte);
      inhalt.appendChild(elternKasten("Für die Begleitung"));
      inhalt.appendChild(schrittNavi("Weiter ▶"));
    } else if (schritt === 2) {
      const karte = element("div", "sterne-karte");
      karte.appendChild(element("h4", null, "3. Satz bilden"));
      karte.appendChild(element("p", "rand",
        SPIELERIN + " übt die Sätze zum Text. Diese Satzanfänge helfen – erst zeigen, wenn sie gebraucht werden."));
      const liste = element("ul", "sprech-satzanfaenge" + (hilfeSichtbar ? "" : " verborgen"));
      einheit.satzAnfaenge.forEach(function (anfang) {
        liste.appendChild(element("li", null, anfang));
      });
      karte.appendChild(liste);
      const hilfe = element("button", "knopf schlicht", hilfeSichtbar ? "Hilfe verbergen" : "Hilfe zeigen");
      hilfe.type = "button";
      hilfe.addEventListener("click", function () {
        hilfeSichtbar = !hilfeSichtbar;
        rendere();
      });
      karte.appendChild(hilfe);
      inhalt.appendChild(karte);
      inhalt.appendChild(elternKasten("Für die Begleitung"));
      inhalt.appendChild(schrittNavi("Weiter ▶"));
    } else if (schritt === 3) {
      inhalt.appendChild(rendereBewertung());
    } else {
      rendereFertig(inhalt);
    }
  }

  function rendereBewertung() {
    const fragment = document.createDocumentFragment();

    const emmaKarte = element("div", "sterne-karte");
    emmaKarte.appendChild(element("h4", null, "4. Erzählen"));
    emmaKarte.appendChild(element("p", "sprech-text",
      "Jetzt erzählst du den Abschnitt mit deinen eigenen Worten! Versuche zwei bis fünf Sätze. Du darfst dir Zeit lassen."));
    fragment.appendChild(emmaKarte);

    const kasten = element("div", "eltern-kasten");
    kasten.appendChild(element("h4", null, "Bewertung für Mama oder Papa"));
    const nr = ("0" + einheit.tag).slice(-2);
    const hinweisZeile = element("div", "sprech-zeile");
    hinweisZeile.appendChild(vorleseKnopf("tag" + nr + "-hinweis", einheit.hinweis));
    hinweisZeile.appendChild(element("p", "rand", "Hinweis heute: " + einheit.hinweis));
    kasten.appendChild(hinweisZeile);

    kasten.appendChild(element("p", "sprech-abschnitt", "Was hat " + SPIELERIN + " erwähnt?"));
    const chips = element("div", "sprech-chips");
    einheit.wichtigePunkte.forEach(function (punkt) {
      const aktiv = bewertung.punkte.has(punkt);
      const chip = element("button", "sprech-chip" + (aktiv ? " an" : ""), punkt);
      chip.type = "button";
      chip.setAttribute("aria-pressed", String(aktiv));
      chip.addEventListener("click", function () {
        if (bewertung.punkte.has(punkt)) { bewertung.punkte.delete(punkt); }
        else { bewertung.punkte.add(punkt); }
        rendere();
      });
      chips.appendChild(chip);
    });
    kasten.appendChild(chips);

    SPRECHTRAINING.KRITERIEN.forEach(function (k) {
      const block = element("div", "sprech-kriterium");
      block.appendChild(element("p", "sprech-kriterium-titel", k.titel));
      block.appendChild(element("p", "rand", "Worauf achten: " + k.achten));
      const stufen = element("div", "stufen-gruppe");
      k.stufen.forEach(function (text, i) {
        const aktiv = bewertung[k.name] === i;
        const knopf = element("button", "stufen-knopf" + (aktiv ? " aktiv" : ""), text);
        knopf.type = "button";
        knopf.setAttribute("aria-pressed", String(aktiv));
        knopf.addEventListener("click", function () {
          bewertung[k.name] = i;
          rendere();
        });
        stufen.appendChild(knopf);
      });
      block.appendChild(stufen);
      kasten.appendChild(block);
    });

    const fertig = bewertung.reihenfolge !== undefined && bewertung.grammatik !== undefined &&
      bewertung.aussprache !== undefined && bewertung.zusammen !== undefined;
    const zeile = element("div", "sprech-zeile sprech-navi");
    const zurueck = element("button", "knopf schlicht", "◀ Zurück");
    zurueck.type = "button";
    zurueck.addEventListener("click", function () {
      sprechAudio.stoppe();
      schritt -= 1;
      rendere();
      if (typeof window.scrollTo === "function") { window.scrollTo(0, 0); }
    });
    zeile.appendChild(zurueck);
    const abschliessen = element("button", "knopf primaer sprech-fertig-knopf", "Übung abschließen ✓");
    abschliessen.type = "button";
    abschliessen.disabled = !fertig;
    abschliessen.addEventListener("click", function () {
      if (!fertig) { return; }
      sprechAudio.stoppe();
      musik.ton("freude");
      schritt = 4;
      rendere();
      if (typeof window.scrollTo === "function") { window.scrollTo(0, 0); }
    });
    if (!fertig) {
      abschliessen.setAttribute("aria-disabled", "true");
    }
    zeile.appendChild(abschliessen);
    kasten.appendChild(zeile);
    fragment.appendChild(kasten);
    return fragment;
  }

  function figurenGruß(welt) {
    const kasten = element("div", "sprech-feier");
    const zeile = element("div", "sprech-figuren");
    welt.figuren.forEach(function (f) { zeile.appendChild(figurBild(f)); });
    kasten.appendChild(zeile);
    kasten.appendChild(element("p", "sprech-lob", welt.lob));
    return kasten;
  }

  function rendereFertig(inhalt) {
    const karte = element("div", "sterne-karte");
    karte.appendChild(element("h3", null, "✓ Übung geschafft!"));
    karte.appendChild(figurenGruß(DEUTSCH_WELTEN[deutschWeltId()]));
    const stufen = [bewertung.reihenfolge, bewertung.grammatik, bewertung.aussprache, bewertung.zusammen];
    const namen = SPRECHTRAINING.KRITERIEN.map(k => k.titel);
    const stark = [];
    let schwaechste = null;
    let schwaechsterWert = 3;
    stufen.forEach(function (wert, i) {
      if (wert >= 2) { stark.push(namen[i]); }
      if (wert < schwaechsterWert) { schwaechsterWert = wert; schwaechste = namen[i]; }
    });
    if (stark.length > 0) {
      karte.appendChild(element("p", null, "Heute schon richtig stark: " + stark.join(", ") + "."));
    }
    if (schwaechste && schwaechsterWert < 2) {
      const k = SPRECHTRAINING.KRITERIEN.find(k => k.titel === schwaechste);
      karte.appendChild(element("p", null, "Nächstes Mal drauf achten: " + schwaechste + "."));
      if (k) { karte.appendChild(element("p", "rand", k.achten)); }
    }
    karte.appendChild(element("p", "rand", SPIELERIN + " hat " + bewertung.punkte.size + " von " +
      einheit.wichtigePunkte.length + " wichtigen Dingen erwähnt."));
    inhalt.appendChild(karte);

    const zeile = element("div", "sprech-zeile");
    const uebersicht = element("button", "knopf", "◀ Übersicht");
    uebersicht.type = "button";
    uebersicht.addEventListener("click", zurueckZurUebersicht);
    zeile.appendChild(uebersicht);
    const neue = element("button", "knopf primaer", "▶ Neue Übung");
    neue.type = "button";
    neue.addEventListener("click", starteZufaellig);
    zeile.appendChild(neue);
    inhalt.appendChild(zeile);
  }

  return {
    oeffnen: oeffnen,
    oeffneStart: oeffneStart,
    oeffneEinheit: oeffneEinheit,
    oeffneDeutschUebung: oeffneDeutschUebung,
    starteZufaellig: starteZufaellig,
    rendere: rendere
  };
})();

/* ------------- Maskottchen und Sternenregen ------------- */

function mascottchenAuswahl(startseite = false) {
  if (modus === "bluey") {
    const figuren = ["hund", "bingo", "chilli", "bandit"];
    return startseite ? figuren.concat("muffin", "socks", "rusty", "chloe", "mackenzie", "snickers") : figuren;
  }
  if (modus === "gabby") {
    const figuren = ["gabbykopf", "panda", "kuchi", "meerkatze", "carlita", "ratkatz"];
    return startseite ? figuren.concat("kittyFee", "babybox", "djKatzenminze", "kuschelkatze", "marty") : figuren;
  }
  const figuren = ["dooziekopf", "puggie", "sahnepfoetchen", "paillette", "swenny", "pixiepfoetchen"];
  return startseite ? figuren.concat("traumpfoetchen", "spielpfoetchen", "bastelpfoetchen", "crouton") : figuren;
}

function macheMaskottchenZiehbar(knopf, stoppKnoten) {
  /* stoppKnoten: ist er versteckt (z. B. andere Ansicht), endet der Schwung. */
  const startseite = stoppKnoten || document.getElementById("startBildschirm");
  let griff = null;
  let gezogen = false;
  let frame = null;
  let links = 0;
  let oben = 0;
  let vx = 0;
  let vy = 0;

  function positioniere(x, y) {
    const groesse = knopf.offsetWidth;
    const maxX = Math.max(0, document.documentElement.clientWidth - groesse);
    const maxY = Math.max(0, document.documentElement.clientHeight - groesse);
    links = Math.max(0, Math.min(maxX, x));
    oben = Math.max(0, Math.min(maxY, y));
    if (links === 0 || links === maxX) { vx = links === 0 ? Math.abs(vx) : -Math.abs(vx); }
    if (oben === 0 || oben === maxY) { vy = oben === 0 ? Math.abs(vy) : -Math.abs(vy); }
    knopf.style.left = links + "px";
    knopf.style.top = oben + "px";
  }

  knopf.addEventListener("pointerdown", function (ereignis) {
    if (!ereignis.isPrimary || ereignis.button !== 0) { return; }
    if (frame !== null) { window.cancelAnimationFrame(frame); frame = null; }
    gezogen = false;
    const ort = knopf.getBoundingClientRect();
    griff = { id: ereignis.pointerId, links: ort.left, oben: ort.top,
      x: ereignis.clientX, y: ereignis.clientY, letzterX: ereignis.clientX, letzterY: ereignis.clientY,
      letzteBewegung: ereignis.timeStamp, tempoX: 0, tempoY: 0 };
    knopf.setPointerCapture(griff.id);
  });

  knopf.addEventListener("pointermove", function (ereignis) {
    if (!griff || ereignis.pointerId !== griff.id) { return; }
    const dx = ereignis.clientX - griff.x;
    const dy = ereignis.clientY - griff.y;
    if (!gezogen && Math.hypot(dx, dy) < 5) { return; }
    gezogen = true;
    const richtungX = ereignis.clientX - griff.letzterX;
    const richtungY = ereignis.clientY - griff.letzterY;
    const laenge = Math.hypot(richtungX, richtungY);
    if (laenge > 0) {
      const dauer = Math.max(16, ereignis.timeStamp - griff.letzteBewegung);
      const tempo = Math.min(180, laenge / dauer * 500);
      griff.tempoX = tempo * richtungX / laenge;
      griff.tempoY = tempo * richtungY / laenge;
      griff.letzteBewegung = ereignis.timeStamp;
    }
    griff.letzterX = ereignis.clientX;
    griff.letzterY = ereignis.clientY;
    knopf.classList.add("verschoben", "wird-gezogen");
    positioniere(griff.links + dx, griff.oben + dy);
  });

  knopf.addEventListener("lostpointercapture", function (ereignis) {
    const letzterGriff = griff;
    griff = null;
    knopf.classList.remove("wird-gezogen");
    if (!gezogen || !letzterGriff || !window.requestAnimationFrame ||
        (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) { return; }
    const restSchwung = Math.max(0, 1 - (ereignis.timeStamp - letzterGriff.letzteBewegung) / 100);
    vx = letzterGriff.tempoX * restSchwung;
    vy = letzterGriff.tempoY * restSchwung;
    if (Math.hypot(vx, vy) < 5) { return; }
    let vorher = null;
    function schwebe(zeit) {
      frame = null;
      if (!knopf.isConnected || startseite.hidden || !istInZeigbaremBereich(knopf)) { return; }
      const sekunden = vorher === null ? 0 : Math.min((zeit - vorher) / 1000, 0.05);
      vorher = zeit;
      positioniere(links + vx * sekunden, oben + vy * sekunden);
      frame = window.requestAnimationFrame(schwebe);
    }
    frame = window.requestAnimationFrame(schwebe);
  });

  knopf.addEventListener("click", function (ereignis) {
    if (gezogen && ereignis.detail > 0) { return; }
    musik.ton("huepf");
  });
}

function fuelleMaskottchen() {
  const reihe = document.getElementById("maskottchenReihe");
  reihe.textContent = "";
  const figuren = mascottchenAuswahl(true);
  for (let i = figuren.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [figuren[i], figuren[j]] = [figuren[j], figuren[i]];
  }
  figuren.forEach(function (figur) {
    const knopf = element("button", "maskottchen");
    knopf.type = "button";
    const name = MASKOTTCHEN_NAMEN[figur] || FIGURENBILDER[figur].replace("pfoetchen", "pfötchen");
    knopf.title = name[0].toUpperCase() + name.slice(1);
    const istKind = modus === "bluey" && figur !== "chilli" && figur !== "bandit";
    const bild = figurBild(figur, istKind ? "maskottchen-kind" : "");
    if (figur === "crouton") { bild.classList.add("maskottchen-crouton"); }
    bild.draggable = false;
    knopf.appendChild(bild);
    macheMaskottchenZiehbar(knopf);
    const platz = element("div", "maskottchen-platz");
    platz.appendChild(knopf);
    reihe.appendChild(platz);
  });
}

let regenFolge = 0;

function sternenRegen(mitBallons = false) {
  const feld = document.getElementById("regen");
  if (!mitBallons && feld.classList.contains("ballon-feier")) { return; }
  const folge = ++regenFolge;
  feld.classList.toggle("ballon-feier", mitBallons);
  feld.textContent = "";
  feld.hidden = false;
  const zeichen = mitBallons ? ["🎊", "✦", "🎉", "★", "✨"] : ["★", "☆", "✦", "♥", "✿", "🌟"];
  for (let i = 0; i < 34; i++) {
    const troepfchen = element("span", "regen-troepfchen", zeichen[i % zeichen.length]);
    troepfchen.style.left = (2 + Math.random() * 96) + "%";
    troepfchen.style.animationDuration = (2.4 + Math.random() * 2.6) + "s";
    troepfchen.style.animationDelay = (Math.random() * 0.9) + "s";
    troepfchen.style.fontSize = (14 + Math.random() * 26) + "px";
    feld.appendChild(troepfchen);
  }
  if (mitBallons) {
    for (let i = 0; i < 12; i += 1) {
      const ballon = element("span", "regen-ballon", "🎈");
      ballon.style.left = (3 + i * 8) + "%";
      ballon.style.animationDuration = (3.3 + Math.random() * 1.8) + "s";
      ballon.style.animationDelay = (Math.random() * 0.7) + "s";
      ballon.style.fontSize = (24 + Math.random() * 24) + "px";
      feld.appendChild(ballon);
    }
  }
  window.setTimeout(function () {
    if (folge !== regenFolge) { return; }
    feld.hidden = true;
    feld.textContent = "";
    feld.classList.remove("ballon-feier");
  }, mitBallons ? 6000 : 5900);
}

/* ------------- Maus-Spur: die Welt malt Symbole hinter dem Zeiger her ------------- */

const SPUR_MOTIVE = {
  gabby: { haupt: "spur-katze", extra: "spur-glitzer", farben: ["#f4a4ca", "#c1a1ed", "#f7bbdd"] },
  doozie: { haupt: "spur-keks", extra: "spur-cupcake", farben: ["#f5b076", "#eaa0bb", "#91cbd5"] },
  hunde: { haupt: "spur-pfote", extra: "spur-knochen", farben: ["#c98a4b", "#a86f3d", "#e0a96d"] },
  hamster: { haupt: "spur-hamster", extra: "spur-korn", farben: ["#e8b64c", "#d99a3e", "#f2cf85"] },
  weihnachten: { haupt: "spur-tannenbaum", extra: "spur-schneeflocke", farben: ["#d9534f", "#6aa84f", "#8fcbea"] }
};

function starteZeigerSpur() {
  if (!EINSTELLUNGEN.zeigerSpur) {
    return;
  }
  if (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return; // wer Bewegungen ausschaltet, bekommt auch keine Spur
  }
  const feld = element("div", "zeiger-spur-feld");
  feld.setAttribute("aria-hidden", "true");
  document.body.appendChild(feld);

  let letzterX = -999;
  let letzterY = -999;
  let letzteZeit = 0;
  let unterwegs = 0;
  let spurNummer = 0;

  document.addEventListener("mousemove", function (ereignis) {
    if (unterwegs >= 18) {
      return; // nie mehr als 18 Symbole auf einmal
    }
    const jetzt = Date.now();
    const abstandX = ereignis.clientX - letzterX;
    const abstandY = ereignis.clientY - letzterY;
    if (jetzt - letzteZeit < 50 || abstandX * abstandX + abstandY * abstandY < 1225) {
      return; // erst wieder nach ~35 px Weg und 50 ms
    }
    letzterX = ereignis.clientX;
    letzterY = ereignis.clientY;
    letzteZeit = jetzt;

    // Im Deutsch-Bereich verziehrt die gewählte Deutsch-Welt, sonst die Mathe-Welt.
    const motiv = SPUR_MOTIVE[bereichAktuell === "deutsch" ? deutschWeltId() : modus];
    const teilchen = element("span", "zeiger-teilchen", motiv ? "" : "🐾");
    if (motiv) {
      spurNummer += 1;
      teilchen.style.color = motiv.farben[spurNummer % motiv.farben.length];
      teilchen.appendChild(symbol(spurNummer % 6 === 0 ? motiv.extra : motiv.haupt));
    }
    const x = ereignis.clientX + Math.random() * 16 - 8;
    const y = ereignis.clientY + Math.random() * 16 - 8;
    teilchen.style.left = x + "px";
    teilchen.style.top = y + "px";
    teilchen.style.transform = "rotate(" + (Math.random() * 50 - 25) + "deg)";
    feld.appendChild(teilchen);
    unterwegs += 1;
    window.setTimeout(function () {
      if (typeof teilchen.remove === "function") {
        teilchen.remove();
      }
      unterwegs -= 1;
    }, 950);
  });
}

/* ------------- Startseite ------------- */

function setzeModus(neuerModus) {
  modus = neuerModus;
  document.body.dataset.thema = neuerModus;
  document.getElementById("homeHaus").setAttribute("href", "#haus-" + neuerModus);
  document.querySelectorAll(".themen-knopf").forEach(function (knopf) {
    knopf.setAttribute("aria-pressed", String(knopf.dataset.modus === neuerModus));
  });
  speicher.daten().modus = neuerModus;
  speicher.speichere();
  fuelleMaskottchen();
  musik.modusWechsel();
  aktualisiereWeltwahl();
}

function heutigeQuizWelt() {
  const { tagesSet, runden } = speicher.daten();
  const heute = heutigesDatum();
  if (tagesSet && tagesSet.datum === heute && tagesSet.fertig) { return tagesSet.welt; }
  // Ein neuer Versuch in derselben Welt öffnet die anderen Welten nicht wieder.
  const quiz = runden.findLast(eintrag => eintrag.datum === heute && !eintrag.bonus &&
    Object.hasOwn(WELT_NAMEN, eintrag.modus) && zaehltAlsQuiz(eintrag));
  return quiz?.modus;
}

function aktualisiereWeltwahl() {
  const offen = bonusPlaetzeHeute();
  const welten = speicher.daten().bonusWelten;
  const bonusText = offen > 0
    ? "Noch " + offen + (offen === 1 ? " Bonusstern" : " Bonussterne") + " für heute!"
    : "Morgen warten " + EINSTELLUNGEN.bonusSterneProTag + " neue Bonussterne.";
  document.querySelectorAll(".themen-knopf").forEach(function (knopf) {
    const welt = knopf.dataset.modus;
    const bonus = welten.includes(welt);
    knopf.disabled = false;
    knopf.classList.toggle("themen-bonus", bonus);
    knopf.querySelector(".thema-titel").textContent =
      bonus ? "Bonuswelt " + WELT_NAMEN[welt] + " 🌟" : WELT_NAMEN[welt];
    knopf.querySelector(".thema-text").hidden = bonus;
    const status = knopf.querySelector(".thema-bonusstatus");
    status.hidden = !bonus;
    status.textContent = bonus ? bonusText : "";
  });

  const los = document.getElementById("losKnopf");
  const set = speicher.daten().tagesSet;
  const offenQuiz = Boolean(set && !set.fertig && set.runde && Array.isArray(set.runde.bereiche));
  const bonus = welten.includes(modus);
  los.disabled = bonus ? offen === 0 : false;
  los.textContent = bonus
    ? (offen > 0 ? "Bonuswelt spielen!" : "Bonus für heute geschafft!")
    : offenQuiz ? "Weiterspielen!" : "Los geht's!";
  const matheWeiter = document.getElementById("matheWeiterKnopf");
  matheWeiter.hidden = !bonus;
  matheWeiter.textContent = offenQuiz ? "Mathe-Runde fortsetzen" : "Neues Mathe-Quiz starten";
}

function startBonusWelt(welt) {
  const offen = bonusPlaetzeHeute();
  if (offen <= 0) {
    window.alert("Heute sind schon alle " + EINSTELLUNGEN.bonusSterneProTag +
      " Bonussterne verteilt. Morgen geht es weiter! 🌟");
    return;
  }
  if (!weltHeuteFreigeschaltet(welt)) {
    window.alert("Die Bonuswelt " + WELT_NAMEN[welt] + " öffnet sich, sobald du in " +
      WELT_NAMEN[welt] + " mindestens 45 von 50 Aufgaben richtig löst. Du schaffst das!");
    return;
  }
  const neueRunde = baueBonusRunde(welt);
  if (!neueRunde) {
    window.alert("Heute sind schon alle " + EINSTELLUNGEN.bonusSterneProTag +
      " Bonussterne verteilt. Morgen geht es weiter! 🌟");
    return;
  }
  modus = welt;
  document.body.dataset.thema = welt;
  zeigeRunde(neueRunde);
}

function zeigeStartErgebnis() {
  aktualisiereWeltwahl();

  const kasten = document.getElementById("startErgebnis");
  kasten.textContent = "";
  if (!letzteZusammenfassung) {
    kasten.hidden = true;
    return;
  }
  kasten.hidden = false;
  if (letzteZusammenfassung.bonusRunde) {
    /* Bonusrunden vergeben keine regulären Sterne – nicht "0 Sterne" melden. */
    kasten.appendChild(element("p", "ergebnis-zeile",
      "Letzte Bonusrunde: " + letzteZusammenfassung.richtig + " von " +
      letzteZusammenfassung.gesamt + " geknobelt"));
    kasten.appendChild(element("p", "sterne-reihe",
      "🌟 " + letzteZusammenfassung.richtig +
      (letzteZusammenfassung.richtig === 1 ? " Bonusstern" : " Bonussterne")));
  } else {
    kasten.appendChild(element("p", "ergebnis-zeile",
      "Letzte Runde: " + letzteZusammenfassung.richtig + " von " + letzteZusammenfassung.gesamt + " richtig"));
  }
  kasten.appendChild(element("p", "ergebnis-lob", "Insgesamt hast du schon " + gesamtSterne() +
    " Bonussterne."));
}

/* ------------- Knöpfe verbinden ------------- */

document.getElementById("kopfName").textContent = SPIELERIN;
document.getElementById("startName").textContent = SPIELERIN;

document.querySelectorAll(".themen-knopf").forEach(function (knopf) {
  knopf.addEventListener("click", function () {
    if (!knopf.disabled && knopf.dataset.modus !== modus) { setzeModus(knopf.dataset.modus); }
  });
});

function starteMatheVonStart() {
  zeigeRunde(starteTagesRunde());
}

document.getElementById("matheWeiterKnopf").addEventListener("click", starteMatheVonStart);
document.getElementById("losKnopf").addEventListener("click", function () {
  aktualisiereWeltwahl();
  if (document.getElementById("losKnopf").disabled) { return; }
  if (weltHeuteFreigeschaltet(modus)) {
    startBonusWelt(modus);
  } else {
    starteMatheVonStart();
  }
});

/* Unterwegs gilt: erst „Weiter" (ohne jede Bewertung), und ganz am Ende „Fertig". */
document.getElementById("pruefenKnopf").addEventListener("click", function () {
  if (abschnittsModusAktiv && !fertigAnsicht && runde &&
      abschnittZeiger < runde.bereiche.length - 1) {
    zeigeAbschnitt(abschnittZeiger + 1);
    return;
  }
  pruefeRunde();
});

document.getElementById("zurueckKnopf").addEventListener("click", function () {
  zeigeAbschnitt(abschnittZeiger - 1);
});

document.getElementById("neuKnopf").addEventListener("click", function (ereignis) {
  // Der zweite Klick auf „Fertig“ kann nach dem Umbau bereits hier landen.
  if (ereignis && ereignis.detail > 1) { return; }
  if (istTagesRunde()) {
    zeigeNeuerVersuchFrage(function () {
      zeigeRunde(neuesTagesSet());
    });
  } else if (runde && runde.bereichsArt === "bonus") {
    if (bonusRundeVonGestern()) { return; }
    const neueBonusRunde = baueBonusRunde(runde.welt, true);
    if (neueBonusRunde) {
      zeigeRunde(neueBonusRunde);
    } else {
      meldeRueckmeldung(bonusTagesText());
    }
  }
});

/* „Neuer Versuch" fragt vorher nach – keine Antwort geht unbemerkt verloren. */
let versuchAngelegenheit = null;
function zeigeNeuerVersuchFrage(dann) {
  versuchAngelegenheit = dann;
  dialogOeffnen("versuchUeberlagerung");
}
document.getElementById("versuchAbbrechenKnopf").addEventListener("click", function () {
  dialogSchliessen("versuchUeberlagerung");
  versuchAngelegenheit = null;
});
document.getElementById("versuchBestaetigenKnopf").addEventListener("click", function () {
  dialogSchliessen("versuchUeberlagerung");
  const dann = versuchAngelegenheit;
  versuchAngelegenheit = null;
  if (dann) {
    dann();
  }
});

/* Rückfrage vor dem Abgeben, beim Tageswechsel bzw. beim Gutschein-Einlösen. */
document.getElementById("frageNeinKnopf").addEventListener("click", frageSchliessen);
const frageElternHakenKnoten = document.getElementById("frageElternHaken");
if (frageElternHakenKnoten) {
  frageElternHakenKnoten.addEventListener("change", function () {
    if (frageBrauchtEltern) {
      document.getElementById("frageJaKnopf").disabled = !frageElternHakenKnoten.checked;
    }
  });
}
document.getElementById("frageJaKnopf").addEventListener("click", function (ereignis) {
  // Der zweite Klick eines Doppelklicks darf die Aktion nicht wiederholen.
  if (ereignis && ereignis.detail > 1) { return; }
  if (frageBrauchtEltern && !(frageElternHakenKnoten && frageElternHakenKnoten.checked)) { return; }
  const dann = frageAngelegenheit;
  dialogSchliessen("frageUeberlagerung");
  frageAngelegenheit = null;
  frageElternZuruecksetzen();
  if (dann) {
    dann();
  }
});

document.getElementById("abbruchKnopf").addEventListener("click", function () {
  sichereTagesAntworten();
  if (bereichAktuell === "deutsch") {
    sprech.oeffneStart();
  } else {
    zeigeStartErgebnis();
    zeigeBildschirm("startBildschirm");
  }
});

document.getElementById("sterneKnopf").addEventListener("click", function () {
  zeigeFortschritt("sterne");
});
document.getElementById("gutscheinZaehlerKnopf").addEventListener("click", function () {
  zeigeFortschritt("geschenke");
});
document.getElementById("statistikKnopf").addEventListener("click", function () {
  zeigeFortschritt("statistik");
});
document.getElementById("fortschrittZurueckKnopf").addEventListener("click", function () {
  if (bereichAktuell === "deutsch") {
    sprech.oeffnen();
  } else {
    zeigeStartErgebnis();
    zeigeBildschirm("startBildschirm");
  }
});
document.getElementById("csvKnopf").addEventListener("click", csvHerunterladen);
document.getElementById("matheUmschalter").addEventListener("click", function () {
  zeigeStartErgebnis();
  zeigeBildschirm("startBildschirm");
});
document.getElementById("deutschUmschalter").addEventListener("click", function () {
  sprech.oeffnen();
});

/* Liest eine ausgewählte Datei und übergibt ihren Text an dann(text). */
function leseDateiText(datei, dann) {
  if (typeof datei.text === "function") {
    datei.text().then(dann, function () {
      zeigeImportMeldung("Die Datei konnte nicht gelesen werden.");
    });
  } else if (typeof FileReader === "function") {
    const leser = new FileReader();
    leser.onload = function () { dann(String(leser.result)); };
    leser.onerror = function () { zeigeImportMeldung("Die Datei konnte nicht gelesen werden."); };
    leser.readAsText(datei);
  } else {
    zeigeImportMeldung("Dieser Browser kann die Datei nicht lesen.");
  }
}

/* Spielstand-Datei einlesen (Knopf „Spielstand laden“ öffnet diesen Dateidialog). */
document.getElementById("spielstandDatei").addEventListener("change", function (ereignis) {
  const datei = ereignis.target && ereignis.target.files ? ereignis.target.files[0] : null;
  if (datei) { leseDateiText(datei, importiereSpielstand); }
});

/* Zusammenführen (Knopf „Spielstand zusammenführen“ öffnet diesen Dateidialog). */
document.getElementById("spielstandMergeDatei").addEventListener("change", function (ereignis) {
  const datei = ereignis.target && ereignis.target.files ? ereignis.target.files[0] : null;
  if (datei) { leseDateiText(datei, fuehreSpielstaendeZusammen); }
});

document.getElementById("musikKnopf").addEventListener("click", musik.umschalten);


document.getElementById("geschenkWegKnopf").addEventListener("click", function () {
  dialogSchliessen("geschenkUeberlagerung");
});
const geschenkUeberraschungKnopfKnoten = document.getElementById("geschenkUeberraschungKnopf");
if (geschenkUeberraschungKnopfKnoten) {
  geschenkUeberraschungKnopfKnoten.addEventListener("click", geschenkUeberraschungZiehen);
}
const geschenkFreitextSpeichernKnoten = document.getElementById("geschenkFreitextSpeichern");
if (geschenkFreitextSpeichernKnoten) {
  geschenkFreitextSpeichernKnoten.addEventListener("click", geschenkFreitextAbsenden);
}
const geschenkFreitextEingabeKnoten = document.getElementById("geschenkFreitextEingabe");
if (geschenkFreitextEingabeKnoten) {
  geschenkFreitextEingabeKnoten.addEventListener("keydown", function (ereignis) {
    if (ereignis.key === "Enter") {
      ereignis.preventDefault();
      geschenkFreitextAbsenden();
    }
  });
}

/* ------------- Start ------------- */

document.body.dataset.thema = modus;
setzeModus(modus);
extraUebung.fuelleMatheThemenListe();
aktualisiereBonusAnzeige();
aktualisiereGutscheinAnzeige();
zeigeStartErgebnis();
initialisiereWintermodus();
musik.start();
starteZeigerSpur();
zeigeBildschirm("startBildschirm");

// Änderungen bleiben sofort im Arbeitsspeicher; spätestens beim Verlassen schreiben.
document.getElementById("sicherungKnopf").addEventListener("click", function () {
  sichereDatenDownload();
});
if (typeof window.addEventListener === "function") {
  window.addEventListener("pagehide", function () {
    if (wirdNeuGeladen) { return; }
    pausiereUebezeit();
    sichereTagesAntworten();
    speicher.speichere();
    // Beim Verlassen noch ausstehende Änderungen zum Repository schicken.
    if (sync.istKonfiguriert()) { sync.schieben().catch(function () {}); }
  });
  window.addEventListener("pageshow", starteUebezeit);
}
document.addEventListener("visibilitychange", function () {
  if (wirdNeuGeladen) { return; }
  if (document.visibilityState === "hidden") {
    pausiereUebezeit();
    sichereTagesAntworten();
    speicher.speichere();
    if (sync.istKonfiguriert()) { sync.schieben().catch(function () {}); }
  } else {
    starteUebezeit();
    if (!document.getElementById("startBildschirm").hidden) { aktualisiereWeltwahl(); }
  }
});
aktualisiereSpeicherHinweis();

/* Beim Start einmal mit dem Repository abgleichen (falls eingerichtet). */
if (sync.istKonfiguriert()) {
  sync.starten();
}
