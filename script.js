/* =========================================================
   script.js – verbindet alles miteinander
   Hier kannst du unten bei SPIELERIN den Namen ändern
   und bei EINSTELLUNGEN / GESCHENKE alles verstellen.
   ========================================================= */

"use strict";

/* ------------- Name und Einstellungen ------------- */

const SPIELERIN = "Emma";

const EINSTELLUNGEN = {
  divisionMitRestAktiv: true, // true = 4 Divisionen mit Rest, false = ohne Rest
  geschichtenAnzahl: 5,
  merkzettelGroesse: 12,      // so viele letzte Geschichte-Merkmale merkt sich das Programm
  knobelMerken: 9,            // so viele letzte Knobelaufgaben merkt es sich
  bonusSterneProTag: 5,
  bonusAbAnteil: 0.9,
  hintergrundMusikAn: true,   // Standard, falls noch nichts gespeichert ist
  musikLautstaerke: 0.32,     // 0 = stumm, 1 = voll
  syncVerzoegerungMs: 60000,  // beim Tippen höchstens einmal pro Minute zu GitHub
  spaessig: true,             // Maskottchen, Sprünge und Sternenregen an?
  zeigerSpur: true            // kleine Welt-Symbole folgen der Maus?
};

/* Die Gutscheine – Mama kann diese Liste jederzeit ändern. */
const GESCHENKE = [
  { text: "Ein Geschenk für 2 €" },
  { text: "Zwei Nächte mit Mama oder Papa schlafen" },
  { text: "90 Minuten Film oder Serie anschauen" },
  { text: "Filmabend mit Popcorn" },
  { text: "90 Minuten Videospiel spielen" },
  { text: "Wunsch frei – such dir etwas aus und sag es Mama!" }
];

const SPEICHER_NAME = "mathe-ueben-fuer-emma";

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
    version: 3, modus: "bluey", runden: [], zuletzt: [],
    knobelZuletzt: [], // die letzten Knobelaufgaben – damit nicht bald dasselbe Rätsel kommt
    bonusSet: null,
    tagesSet: null,    // { datum, welt, fertig, runde, antworten, abschnitt } – das heutige Quiz
    vortagSchluessel: [], // die Aufgaben von gestern: nur zum Ausschluss beim Bauen
    bonusGesamt: 0, bonusStufenOffen: [], geschenke: [], bereichPunkte: {}, sound: null,
    bonusTag: null,     // { datum, verteilt } – wie viele Bonussterne heute schon vergeben sind
    bonusWelten: []     // ["bluey", ...] – welche Bonuswelten sind heute schon offen
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
    const BEKANNTE_FELDER = ["version", "sterneGesamt", "modus", "runden", "zuletzt",
      "knobelZuletzt", "tagesSet", "bonusSet", "vortagSchluessel", "bonussterne", "bonusGesamt",
      "geschenke", "bereichPunkte", "sound", "bonusTag", "bonusWelten", "bonusStufenOffen"];
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
    if (neu.geschenke) { neu.geschenke = migriereGutscheinUmtausch(neu.geschenke); }
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
    if (neu.sound !== undefined && ![null, "an", "aus"].includes(neu.sound)) { problem(); neu.sound = null; }
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
            bereichPunkte: (geladen.bereichPunkte && typeof geladen.bereichPunkte === "object")
              ? geladen.bereichPunkte : {},
            sound: geladen.sound || null,
            bonusTag: (geladen.bonusTag && typeof geladen.bonusTag === "object") ? geladen.bonusTag : null,
            bonusWelten: Array.isArray(geladen.bonusWelten) ? geladen.bonusWelten : []
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
    if (a.datum !== b.datum) { return String(a.datum) > String(b.datum) ? a : b; }
    // Gleicher Tag: die abgeschlossene Runde gewinnt, damit nichts doppelt bewertet wird.
    if (!!a.fertig !== !!b.fertig) { return a.fertig ? a : b; }
    const antworten = set => Object.keys((set && set.antworten) || {}).length;
    return antworten(b) > antworten(a) ? b : a;
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

  return {
    version: 3,
    modus: A.modus || B.modus || "bluey",
    runden: runden,
    /* Merkzettel: die Einträge des eigenen Geräts gelten als die neuesten,
       deshalb zuerst (vereinigeTexte gibt den zweiten Parameter zuerst aus). */
    zuletzt: vereinigeTexte(B.zuletzt, A.zuletzt, EINSTELLUNGEN.merkzettelGroesse),
    knobelZuletzt: vereinigeTexte(B.knobelZuletzt, A.knobelZuletzt, EINSTELLUNGEN.knobelMerken),
    tagesSet: waehleTagesSet(A.tagesSet, B.tagesSet),
    bonusSet: waehleBonusSet(A.bonusSet, B.bonusSet),
    vortagSchluessel: vereinigeAeltesteZuerst(B.vortagSchluessel, A.vortagSchluessel, 300),
    bonusGesamt: bonusGesamt,
    bonusStufenOffen: offeneStufenOhneGutschein(liste(A.bonusStufenOffen).concat(liste(B.bonusStufenOffen)), geschenke),
    geschenke: geschenke,
    bereichPunkte: bereichPunkte,
    sound: A.sound !== undefined ? A.sound : (B.sound !== undefined ? B.sound : null),
    bonusTag: bonusTag,
    bonusWelten: Array.from(new Set(welten)).filter(function (welt) {
      return ["bluey", "gabby", "doozie"].includes(welt);
    })
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
    einstellungen = Object.assign({}, einstellungen, neu || {});
    /* Repository muss "besitzer/name" sein, Dateiname ein relativer Pfad. */
    if (!/^[\w.-]+\/[\w.-]+$/.test(String(einstellungen.repo || ""))) {
      setzeStatus("Bitte das Repository als „besitzer/name“ eintragen.", "fehler");
      return false;
    }
    const datei = String(einstellungen.datei || "");
    if (!datei || datei.indexOf("..") >= 0 || datei.indexOf("//") >= 0 || datei[0] === "/") {
      setzeStatus("Bitte einen gültigen Dateinamen angeben (z. B. spielstand.json).", "fehler");
      return false;
    }
    try {
      window.localStorage.setItem(SYNC_SCHLUESSEL, JSON.stringify(einstellungen));
    } catch (fehler) {
      setzeStatus("Die Zugangsdaten konnten nicht gespeichert werden.", "fehler");
      return false;
    }
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
      const lokal = JSON.stringify(speicher.daten());
      if (!opts.erzwingen && zuletztGepusht === stabilStringify(speicher.daten())) {
        return { ok: true, unveraendert: true };
      }
      let letzterGrund = "";
      for (let versuch = 0; versuch < 3; versuch++) {
        const stand = await holeStand();
        let zuSchreiben = lokal;
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
        zuletztGepusht = stabilStringify(speicher.daten());
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
    if (timer) { return; }
    const wartezeit = sofort ? 0 : EINSTELLUNGEN.syncVerzoegerungMs;
    timer = window.setTimeout(function () {
      timer = null;
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
    if (timer) { window.clearTimeout(timer); timer = null; }
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
  const url = window.URL.createObjectURL(new window.Blob([inhalt], { type: typ }));
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

function zeigeBildschirm(id) {
  if (id !== "uebungsBildschirm") { pausiereUebezeit(); }
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
  let treffer = text.match(/^(\d{1,2})\s*(?:uhr|u|:|\.|,)\s*(\d{1,2})$/);
  if (treffer) {
    const stunde = Number(treffer[1]);
    const minute = Number(treffer[2]);
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
  crouton: "crouton"
};

const MASKOTTCHEN_NAMEN = {
  kittyFee: "Kitty Fee",
  babybox: "Baby Box",
  djKatzenminze: "DJ Katzenminze"
};

const DOOZIE_GESCHICHTENFIGUREN = new Map([
  ["paillette", "paillette"], ["seaquin", "paillette"],
  ["traumpfötchen", "traumpfoetchen"], ["dreampup", "traumpfoetchen"],
  ["pixiepfötchen", "pixiepfoetchen"], ["pixiepup", "pixiepfoetchen"],
  ["spielpfötchen", "spielpfoetchen"], ["gamepup", "spielpfoetchen"],
  ["swenny", "swenny"], ["swaggy", "swenny"],
  ["sahnepfötchen", "sahnepfoetchen"], ["creampup", "sahnepfoetchen"]
]);

function geschichtenFigur(karte) {
  const woerter = karte.text.toLowerCase().split(/[^\p{L}]+/u);
  if (modus === "doozie") {
    for (const wort of woerter) {
      if (DOOZIE_GESCHICHTENFIGUREN.has(wort)) { return DOOZIE_GESCHICHTENFIGUREN.get(wort); }
    }
  }
  return mascottchenAuswahl().find(figur => woerter.includes(FIGURENBILDER[figur])) || themenSymbol();
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

/* Heute schon ein offenes Set? Dann wird es geladen – mit allen Antworten.
   Sonst (neuer Tag oder beendeter Versuch) gibt es ein frisches Set. */
function starteTagesRunde() {
  const daten = speicher.daten();
  const heute = heutigesDatum();
  if (daten.tagesSet && daten.tagesSet.datum !== heute) {
    // Das Set von gestern braucht niemand mehr – nur seine Schlüssel nicht nochmal.
    daten.vortagSchluessel = (daten.vortagSchluessel || [])
      .concat(schluesselDerSetRunde(daten.tagesSet.runde)).slice(-300);
    daten.tagesSet = null;
    speicher.speichere();
  }
  const set = daten.tagesSet;
  if (set && set.datum === heute && !set.fertig &&
      set.runde && Array.isArray(set.runde.bereiche)) {
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
  if (runde.bonusSet && geaendert) { set.antwortenZeit = Date.now(); }
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
      if (Array.isArray(werte) && Array.isArray(teile)) {
        werte.forEach(function (wert, stelle) {
          if (teile[stelle]) {
            teile[stelle].value = wert;
            if (runde.bonusAuswertung?.belohnt.has(karte.ident)) { teile[stelle].disabled = true; }
          }
        });
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
    pruefen.hidden = false;
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
  kopf.appendChild(element("span", "zaehler", bereich.aufgaben.length + " Aufgaben"));
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
  return element("span", "ausdruck" + (text.length > 11 ? " lang" : ""), text);
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
      kasten.classList.add("falsch");
      kontrolle.prepend(element("span", "markierung", "Da war ein Fehler."));
      falschKarten.push(karte);
    }
  });

  const gesamt = runde.karten.length;
  const anteil = richtig / gesamt;
  const lob = lobFuerAnteil(anteil);

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

  /* Nur eine reguläre Tagesrunde öffnet die Bonuswelt ab 90 %.
     Eine bereits offene Welt bleibt für den Tag offen. */
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
    sync.nachAenderung(false);
  }
  if (bonusRichtig === runde.karten.length) {
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
  } else {
    kasten.appendChild(element("p", "ergebnis-zeile",
      "Knobel weiter! Beim nächsten Versuch klappt es bestimmt."));
  }
  kasten.appendChild(element("p", "bonus-hinweis", bonusTagesText()));
  kasten.scrollIntoView({ block: "start" });

  aktualisiereWeltwahl();
  // "Neue Aufgaben" verschwindet, sobald das Tageskontingent erschöpft ist.
  aktualisiereKnopfLeiste();
  meldeRueckmeldung(vergeben + " neue Bonussterne. " + bonusTagesText());

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
  return karte.felder.map(function (feld) {
    return loesungsText(karte, feld);
  });
}

function lobFuerAnteil(anteil) {
  if (anteil >= 0.95) {
    return "Fast alles richtig – stark, " + SPIELERIN + "!";
  }
  if (anteil >= 0.8) {
    return "Das war richtig gut. Weiter so!";
  }
  if (anteil >= 0.6) {
    return "Schon gut! Ein paar Aufgaben üben wir noch einmal.";
  }
  if (anteil >= 0.4) {
    return "Du hast durchgehalten – das zählt. Schau dir die Fehler an, dann klappt es beim nächsten Mal besser.";
  }
  return "Noch ist nicht alles rund – fang einfach noch einmal an. Du schaffst das!";
}

/* Alles wird angehängt – nichts wird überschrieben. */
function speichernRunde(richtig, gesamt, bereichErgebnis, bonusRichtig, istBonus) {
  const daten = speicher.daten();
  const jetzt = new Date();
  const zeitTeile = wienerDatumTeile(jetzt);
  daten.runden.push({
    zeit: jetzt.toISOString(),
    /* Die Runde zählt für den Tag, zu dem sie gehört (Tagesrunde/Bonusrunde),
       nicht für den Tag, an dem sie zufällig beendet wird. */
    datum: (runde && runde.tagesSet && runde.tagesSet.datum) || (runde && runde.bonusDatum) ||
      lokalesDatum(jetzt),
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
  meldeRueckmeldung(richtig + " von " + gesamt + " Aufgaben richtig.");
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
    "Du hast " + richtig + " von " + gesamt + " Aufgaben richtig!"));
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

/* Allgemeine Ja/Nein-Rückfrage: wird vor dem Abgeben einer fast leeren Runde
   und beim Tageswechsel mit noch offenen Antworten verwendet. */
let frageAngelegenheit = null;

function zeigeFrage(optionen) {
  const angaben = optionen || {};
  document.getElementById("frageTitel").textContent = angaben.titel || "Bist du sicher?";
  document.getElementById("frageText").textContent = angaben.text || "";
  document.getElementById("frageJaKnopf").textContent = angaben.ja || "Ja";
  document.getElementById("frageNeinKnopf").textContent = angaben.nein || "Abbrechen";
  frageAngelegenheit = angaben.dann || null;
  dialogOeffnen("frageUeberlagerung");
}

function frageSchliessen() {
  dialogSchliessen("frageUeberlagerung");
  frageAngelegenheit = null;
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
    if (id === "frageUeberlagerung") { frageAngelegenheit = null; }
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

function geschenkAuswahlOeffnen(modusOptionen, ueberschrift) {
  const optionen = modusOptionen || { art: "neu", tauschId: null };
  const stufe = speicher.daten().bonusStufenOffen[0];
  geschenkModus = optionen;
  const lager = document.getElementById("geschenkUeberlagerung");
  const titel = document.getElementById("geschenkTitel");
  const raster = document.getElementById("geschenkeRaster");
  titel.textContent = ueberschrift || (optionen.art === "tausch"
    ? "🔄 Was möchtest du stattdessen haben?"
    : stufe ? "🎉 " + stufe + " Bonussterne! Such dir etwas aus!" : "Such dir ein Geschenk aus!");
  raster.textContent = "";
  GESCHENKE.forEach(function (geschenk) {
    const karte = element("button", "geschenk-karte");
    karte.type = "button";
    karte.appendChild(symbol("geschenk"));
    karte.appendChild(element("span", "geschenk-text", geschenk.text));
    karte.appendChild(element("span", "geschenk-waehlen", "Das möchte ich!"));
    karte.addEventListener("click", function () {
      geschenkAusgewaehlt(geschenk.text);
    });
    raster.appendChild(karte);
  });
  dialogOeffnen("geschenkUeberlagerung");
  musik.ton("freude");
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
  daten: "Spielstand"
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
    daten: document.getElementById("spielstandInhalt")
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
  } else if (aktuellerTab === "daten") {
    zeigeSpielstandInhalt();
  } else {
    zeigeSterneInhalt();
  }
  zeigeBildschirm("fortschrittBildschirm");
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
      inhalt.appendChild(karte);
    });
  }

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
  if (vorschau.runden === 0 && vorschau.sterne === 0 && vorschau.geschenke === 0) {
    zeigeImportMeldung("Beide Spielstände enthalten bereits alles – es gibt nichts zu ergänzen.");
    return;
  }
  const teile = [vorschau.runden + (vorschau.runden === 1 ? " Runde" : " Runden"),
    vorschau.sterne + (vorschau.sterne === 1 ? " Bonusstern" : " Bonussterne"),
    vorschau.geschenke + (vorschau.geschenke === 1 ? " Gutschein" : " Gutscheine")];
  zeigeFrage({
    titel: "Spielstände zusammenführen?",
    text: "Aus der Datei kommen " + teile.join(", ") + " dazu" +
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
    blau: "musik/blau.mp3",
    puppenhaus: "musik/puppenhaus.mp3",
    doozie: "musik/doozie.mp3"
  };
  let an = speicher.daten().sound === null
    ? EINSTELLUNGEN.hintergrundMusikAn
    : speicher.daten().sound === "an";
  let audioKnoten = null;
  let rueckfallTimer = null;
  let audioKontext = null;
  let wartetAufKlick = false;
  let audioDatei = "";
  let abspielVersuch = 0;
  let abspielVersuchLaeuft = false;
  let gestartet = false;
  let ersterMusikKlick = true;
  let doozieFehlt = false;

  function aktuellesAudio() {
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
    const datei = aktuellesAudio();
    if (audioKnoten && audioDatei === datei) {
      if (wartetAufKlick || (durchKlick && audioKnoten.paused)) {
        spieleAudio(audioKnoten, durchKlick);
      }
      return;
    }
    stoppeNur();
    const knoten = document.createElement("audio");
    audioKnoten = knoten;
    audioDatei = datei;
    knoten.src = datei;
    knoten.volume = EINSTELLUNGEN.musikLautstaerke;
    knoten.loop = true;
    knoten.addEventListener("error", function () {
      // Verspätete Fehler einer ersetzten Instanz dürfen nichts neu starten.
      if (audioKnoten === knoten) {
        if (datei === dateien.doozie) {
          doozieFehlt = true;
          starteHintergrund();
        } else {
          rueckfallMelodie();
        }
      }
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
    audioDatei = "";
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
      starteHintergrund();
    } else {
      stoppeNur();
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
    start: function () {
      if (!gestartet) {
        gestartet = true;
        horchtAufErstenKlick();
      }
      zeigeZustand();
      if (an) { starteHintergrund(); }
    },
    umschalten: umschalten,
    modusWechsel: function () { if (gestartet && an) { starteHintergrund(); } },
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

function macheMaskottchenZiehbar(knopf) {
  const startseite = document.getElementById("startBildschirm");
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
      if (!knopf.isConnected || startseite.hidden) { return; }
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
  doozie: { haupt: "spur-keks", extra: "spur-cupcake", farben: ["#f5b076", "#eaa0bb", "#91cbd5"] }
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

    const motiv = SPUR_MOTIVE[modus];
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
  const quizWelt = heutigeQuizWelt();
  const bonusText = offen > 0
    ? "Noch " + offen + (offen === 1 ? " Bonusstern" : " Bonussterne") + " für heute!"
    : "Morgen warten " + EINSTELLUNGEN.bonusSterneProTag + " neue Bonussterne.";
  document.querySelectorAll(".themen-knopf").forEach(function (knopf) {
    const welt = knopf.dataset.modus;
    const bonus = welten.includes(welt);
    const gesperrt = Boolean(quizWelt && welt !== quizWelt && !bonus);
    knopf.disabled = gesperrt;
    knopf.classList.toggle("themen-bonus", bonus);
    knopf.querySelector(".thema-titel").textContent =
      bonus ? "Bonuswelt " + WELT_NAMEN[welt] + " 🌟" : WELT_NAMEN[welt];
    knopf.querySelector(".thema-text").hidden = bonus || gesperrt;
    const status = knopf.querySelector(".thema-bonusstatus");
    status.hidden = !bonus && !gesperrt;
    status.textContent = bonus ? bonusText : gesperrt ? "Heute schon ein Quiz gespielt." : "";
  });

  const los = document.getElementById("losKnopf");
  const set = speicher.daten().tagesSet;
  const heute = set && set.datum === heutigesDatum();
  const bonus = welten.includes(modus);
  los.disabled = bonus ? offen === 0 : Boolean(quizWelt && modus !== quizWelt);
  los.textContent = bonus ? (offen > 0 ? "Bonuswelt spielen!" : "Bonus für heute geschafft!")
    : los.disabled ? "Für heute gesperrt" : heute ? (set.fertig ? "Neues Quiz für heute!" : "Weiterspielen!") : "Los geht's!";
  document.getElementById("matheWeiterKnopf").hidden = !(bonus && heute && !set.fertig);
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
  const quizWelt = heutigeQuizWelt();
  if (quizWelt && modus !== quizWelt) { return; }
  const set = speicher.daten().tagesSet;
  const heute = heutigesDatum();
  if (set && set.datum === heute && set.fertig) {
    zeigeNeuerVersuchFrage(function () {
      zeigeRunde(neuesTagesSet());
    });
    return;
  }
  /* Eine angefangene Runde von gestern kann nicht fortgesetzt werden. Vor dem
     Verwerfen der Antworten einmal nachfragen, damit nichts unbemerkt verloren geht. */
  if (set && set.datum !== heute && !set.fertig) {
    const beantwortet = Object.keys(set.antworten || {}).length;
    if (beantwortet > 0) {
      zeigeFrage({
        titel: "Aufgaben von gestern",
        text: "Deine Runde von gestern ist noch offen (" + beantwortet + " von " +
          (set.runde && set.runde.bereiche
            ? set.runde.bereiche.reduce(function (n, b) { return n + b.aufgaben.length; }, 0)
            : 50) + " Aufgaben beantwortet). Sie kann nicht fortgesetzt werden. " +
          "Möchtest du mit neuen Aufgaben für heute starten?",
        ja: "Neue Aufgaben starten",
        nein: "Abbrechen",
        dann: function () {
          zeigeRunde(starteTagesRunde());
        }
      });
      return;
    }
  }
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

/* Rückfrage vor dem Abgeben bzw. beim Tageswechsel. */
document.getElementById("frageNeinKnopf").addEventListener("click", frageSchliessen);
document.getElementById("frageJaKnopf").addEventListener("click", function (ereignis) {
  // Der zweite Klick eines Doppelklicks darf die Aktion nicht wiederholen.
  if (ereignis && ereignis.detail > 1) { return; }
  const dann = frageAngelegenheit;
  dialogSchliessen("frageUeberlagerung");
  frageAngelegenheit = null;
  if (dann) {
    dann();
  }
});

document.getElementById("abbruchKnopf").addEventListener("click", function () {
  sichereTagesAntworten();
  zeigeStartErgebnis();
  zeigeBildschirm("startBildschirm");
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
  zeigeStartErgebnis();
  zeigeBildschirm("startBildschirm");
});
document.getElementById("csvKnopf").addEventListener("click", csvHerunterladen);

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

/* ------------- Start ------------- */

document.body.dataset.thema = modus;
setzeModus(modus);
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
    pausiereUebezeit();
    sichereTagesAntworten();
    speicher.speichere();
    // Beim Verlassen noch ausstehende Änderungen zum Repository schicken.
    if (sync.istKonfiguriert()) { sync.schieben().catch(function () {}); }
  });
  window.addEventListener("pageshow", starteUebezeit);
}
document.addEventListener("visibilitychange", function () {
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
