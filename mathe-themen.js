/* ------------------------------------------------------------------
   mathe-themen.js
   7 kindgerechte Mathe-Themen für die 3. Klasse Volksschule (Raum 1000):
     1. groessen     – Längen & Gewichte (m/cm, km/m, kg/g)
     2. stellenwert  – Zahlen zerlegen, H/Z/E, Nachbarn & Ordnen
     3. runden       – Runden auf Z/H & Überschlagen
     4. uhr          – Analoge Uhr (SVG) ablesen & weiterrechnen
     5. geometrie    – Formen, Körper, Spiegelachsen & Würfelgebäude (SVG)
     6. mauern       – Rechenmauern & Rechendreiecke
     7. schriftlich  – Schriftliches Addieren & Subtrahieren Schritt für Schritt
   ------------------------------------------------------------------ */
(function (umgebung, factory) {
  "use strict";
  var modul = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = modul;
  } else {
    umgebung.MATHE_THEMEN = modul;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var THEMEN = [
    {
      id: "groessen",
      symbol: "📏",
      titel: "Längen & Gewichte",
      kurz: "Meter, Zentimeter, Kilometer, Kilogramm und Gramm umrechnen",
      anzahl: 8
    },
    {
      id: "stellenwert",
      symbol: "🔢",
      titel: "Stellenwert & Nachbarn",
      kurz: "Hunderter, Zehner, Einer zerlegen, Nachbarzahlen & Ordnen",
      anzahl: 8
    },
    {
      id: "runden",
      symbol: "🎯",
      titel: "Runden & Überschlagen",
      kurz: "Auf Zehner und Hunderter runden und geschickt schätzen",
      anzahl: 8
    },
    {
      id: "uhr",
      symbol: "🕐",
      titel: "Analoge Uhr",
      kurz: "Uhrzeiten am Zifferblatt ablesen und Minuten weiterrechnen",
      anzahl: 8
    },
    {
      id: "geometrie",
      symbol: "📐",
      titel: "Geometrie & Spiegelbilder",
      kurz: "Formen, Körper, Spiegelachsen und Würfelgebäude zählen",
      anzahl: 8
    },
    {
      id: "mauern",
      symbol: "🧱",
      titel: "Rechenmauern & Dreiecke",
      kurz: "Zahlenmauern und Rechendreiecke nach oben und rückwärts lösen",
      anzahl: 6
    },
    {
      id: "schriftlich",
      symbol: "✏️",
      titel: "Schriftlich rechnen",
      kurz: "Untereinander plus und minus rechnen – mit kleinem Merkfeld",
      anzahl: 6
    }
  ];

  function zufall(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function waehle(liste) {
    return liste[zufall(0, liste.length - 1)];
  }

  function mische(liste) {
    var kopie = liste.slice();
    for (var i = kopie.length - 1; i > 0; i--) {
      var j = zufall(0, i);
      var tmp = kopie[i];
      kopie[i] = kopie[j];
      kopie[j] = tmp;
    }
    return kopie;
  }

  function rundeAuf(zahl, schritt) {
    return Math.floor((zahl + schritt / 2) / schritt) * schritt;
  }

  var zaehler = 0;
  function neueId(praefix) {
    zaehler += 1;
    return praefix + "-" + zaehler;
  }

  function sammleEinzigartig(generatoren, anzahl) {
    var liste = [];
    var gesehen = new Set();
    var runde = 0;
    var stelle = 0;
    var gemischt = mische(generatoren);
    while (liste.length < anzahl && runde < 20) {
      var gen = gemischt[stelle % gemischt.length];
      stelle += 1;
      if (stelle % gemischt.length === 0) { runde += 1; }
      var aufgabe = null;
      for (var v = 0; v < 40 && !aufgabe; v++) {
        aufgabe = gen();
      }
      if (aufgabe && !gesehen.has(aufgabe.schluessel)) {
        gesehen.add(aufgabe.schluessel);
        liste.push(aufgabe);
      }
    }
    return liste;
  }

  /* =====================================================================
     1. GRÖSSEN (Längen & Gewichte)
     ===================================================================== */

  var SCHAETZ_FRAGEN = [
    { frage: "Wie lang ist ein neuer Bleistift ungefähr?", optionen: ["18 cm", "18 m", "18 km"], richtig: 0, erklaerung: "Ein Bleistift passt in das Federpennal – etwa 18 cm." },
    { frage: "Wie hoch ist eine Zimmertür ungefähr?", optionen: ["20 cm", "2 m", "2 km"], richtig: 1, erklaerung: "Eine Zimmertür ist ungefähr 2 m hoch." },
    { frage: "Wie schwer ist eine ganze Packung Milch (1 Liter)?", optionen: ["10 g", "100 g", "1 kg"], richtig: 2, erklaerung: "1 Liter Milch wiegt ungefähr 1 kg (1000 g)." },
    { frage: "Wie schwer ist ein großer Apfel ungefähr?", optionen: ["150 g", "15 kg", "5 g"], richtig: 0, erklaerung: "Ein Apfel wiegt ungefähr 150 g." },
    { frage: "Wie lang ist ein Schulweg mit dem Bus in die nächste Stadt?", optionen: ["5 cm", "5 m", "5 km"], richtig: 2, erklaerung: "Weite Wege zwischen Orten misst man in Kilometern (km)." },
    { frage: "Wie schwer ist eine Tafel Schokolade meistens?", optionen: ["100 g", "10 kg", "1 g"], richtig: 0, erklaerung: "Eine normale Tafel Schokolade wiegt 100 g." },
    { frage: "Wie breit ist ein Schulheft (A4) ungefähr?", optionen: ["21 cm", "21 m", "2 cm"], richtig: 0, erklaerung: "Ein A4-Heft ist 21 cm breit." },
    { frage: "Wie schwer ist ein kleiner Welpe ungefähr?", optionen: ["3 g", "3 kg", "300 kg"], richtig: 1, erklaerung: "Ein kleiner Welpe wiegt einige Kilogramm (z. B. 3 kg)." }
  ];

  function baueGroessen(anzahl, welt) {
    var figuren = welt === "gabby" ? ["Gabby", "Pandy", "Kuchi", "Carlita"]
      : welt === "doozie" ? ["Doozie", "Puggie", "Paillette", "Swenny"]
      : ["Bluey", "Bingo", "Rusty", "Bandit"];

    var gens = [
      function () {
        var m = zufall(1, 8);
        var cm = waehle([5, 10, 15, 20, 25, 30, 40, 45, 50, 60, 75, 80, 90]);
        var gesamt = m * 100 + cm;
        return {
          id: neueId("gr"), typ: "felder", schluessel: "m2cm|" + gesamt,
          frage: "Rechne in Zentimeter um:",
          ausdruck: m + " m " + cm + " cm =",
          felder: [{ korrekt: gesamt, einheit: "cm", max: 4 }],
          erklaerung: "1 m = 100 cm, also " + m + " m " + cm + " cm = " + gesamt + " cm."
        };
      },
      function () {
        var m = zufall(1, 9);
        var cm = waehle([5, 10, 20, 25, 30, 40, 50, 60, 70, 80, 90]);
        var gesamt = m * 100 + cm;
        return {
          id: neueId("gr"), typ: "felder", schluessel: "cm2m|" + gesamt,
          frage: "Rechne in Meter und Zentimeter um:",
          ausdruck: gesamt + " cm =",
          felder: [
            { korrekt: m, einheit: "m", max: 2 },
            { korrekt: cm, einheit: "cm", max: 2 }
          ],
          erklaerung: gesamt + " cm = " + m + " m " + cm + " cm (100 cm = 1 m)."
        };
      },
      function () {
        var km = zufall(1, 5);
        var m = waehle([0, 100, 200, 250, 300, 500, 750, 800]);
        var gesamt = km * 1000 + m;
        return {
          id: neueId("gr"), typ: "felder", schluessel: "km2m|" + gesamt,
          frage: "Rechne in Meter um:",
          ausdruck: m === 0 ? km + " km =" : km + " km " + m + " m =",
          felder: [{ korrekt: gesamt, einheit: "m", max: 4 }],
          erklaerung: "1 km = 1000 m, also sind es " + gesamt + " m."
        };
      },
      function () {
        var kg = zufall(1, 5);
        var g = waehle([50, 100, 200, 250, 300, 400, 500, 600, 750, 800]);
        var gesamt = kg * 1000 + g;
        return {
          id: neueId("gr"), typ: "felder", schluessel: "kg2g|" + gesamt,
          frage: "Rechne in Gramm um:",
          ausdruck: kg + " kg " + g + " g =",
          felder: [{ korrekt: gesamt, einheit: "g", max: 4 }],
          erklaerung: "1 kg = 1000 g, also " + kg + " kg " + g + " g = " + gesamt + " g."
        };
      },
      function () {
        var kg = zufall(1, 5);
        var g = waehle([100, 200, 250, 300, 500, 600, 750, 900]);
        var gesamt = kg * 1000 + g;
        return {
          id: neueId("gr"), typ: "felder", schluessel: "g2kg|" + gesamt,
          frage: "Rechne in Kilogramm und Gramm um:",
          ausdruck: gesamt + " g =",
          felder: [
            { korrekt: kg, einheit: "kg", max: 2 },
            { korrekt: g, einheit: "g", max: 3 }
          ],
          erklaerung: gesamt + " g = " + kg + " kg " + g + " g (1000 g = 1 kg)."
        };
      },
      function () {
        var p = mische(figuren);
        var langM = 1;
        var langCm = waehle([10, 20, 30, 40, 50]);
        var kurzCm = waehle([55, 65, 75, 80, 85, 90]);
        var diff = (langM * 100 + langCm) - kurzCm;
        return {
          id: neueId("gr"), typ: "felder", schluessel: "diff|" + langCm + "|" + kurzCm,
          frage: p[0] + " hat ein Band mit " + langM + " m " + langCm + " cm. " +
            p[1] + " hat ein Band mit " + kurzCm + " cm. Wie viele Zentimeter ist das Band von " + p[0] + " länger?",
          ausdruck: "",
          felder: [{ korrekt: diff, einheit: "cm", max: 3 }],
          erklaerung: langM + " m " + langCm + " cm = " + (100 + langCm) + " cm. " +
            (100 + langCm) + " − " + kurzCm + " = " + diff + " cm."
        };
      },
      function () {
        var f = waehle(SCHAETZ_FRAGEN);
        return {
          id: neueId("gr"), typ: "auswahl", schluessel: "schaetz|" + f.frage,
          frage: f.frage,
          optionen: f.optionen.slice(),
          richtig: f.richtig,
          erklaerung: f.erklaerung
        };
      }
    ];
    return sammleEinzigartig(gens, anzahl || 8);
  }

  /* =====================================================================
     2. STELLENWERT & NACHBARN
     ===================================================================== */

  function baueStellenwert(anzahl) {
    var gens = [
      function () {
        var h = zufall(1, 9), z = zufall(0, 9), e = zufall(1, 9);
        var zahl = h * 100 + z * 10 + e;
        var teile = [h + " H", z + " Z", e + " E"];
        if (Math.random() < 0.35) { teile = [z + " Z", h + " H", e + " E"]; }
        return {
          id: neueId("st"), typ: "felder", schluessel: "hze-zu|" + zahl,
          frage: "Welche Zahl ergibt sich?",
          ausdruck: teile.join(" + ") + " =",
          felder: [{ korrekt: zahl, einheit: "", max: 4 }],
          erklaerung: h + " Hunderter, " + z + " Zehner und " + e + " Einer ergeben " + zahl + "."
        };
      },
      function () {
        var h = zufall(1, 9), z = zufall(0, 9), e = zufall(0, 9);
        if (z === 0 && e === 0) { e = zufall(1, 9); }
        var zahl = h * 100 + z * 10 + e;
        return {
          id: neueId("st"), typ: "felder", schluessel: "hze-zerleg|" + zahl,
          frage: "Zerlege die Zahl in Hunderter (H), Zehner (Z) und Einer (E):",
          ausdruck: zahl + " =",
          felder: [
            { korrekt: h, einheit: "H", max: 1 },
            { korrekt: z, einheit: "Z", max: 1 },
            { korrekt: e, einheit: "E", max: 1 }
          ],
          erklaerung: zahl + " = " + h + " H + " + z + " Z + " + e + " E."
        };
      },
      function () {
        var zehner = zufall(12, 97) * 10;
        var zahl = zehner + zufall(1, 9);
        return {
          id: neueId("st"), typ: "felder", schluessel: "nz|" + zahl,
          frage: "Trage beide Nachbarzehner ein:",
          ausdruck: "Nachbarzehner von " + zahl + ":",
          felder: [
            { korrekt: zehner, einheit: "und", max: 4 },
            { korrekt: zehner + 10, einheit: "", max: 4 }
          ],
          erklaerung: zahl + " liegt zwischen " + zehner + " und " + (zehner + 10) + "."
        };
      },
      function () {
        var hunderter = zufall(1, 8) * 100;
        var zahl = hunderter + zufall(5, 95);
        return {
          id: neueId("st"), typ: "felder", schluessel: "nh|" + zahl,
          frage: "Trage beide Nachbarhunderter ein:",
          ausdruck: "Nachbarhunderter von " + zahl + ":",
          felder: [
            { korrekt: hunderter, einheit: "und", max: 4 },
            { korrekt: hunderter + 100, einheit: "", max: 4 }
          ],
          erklaerung: zahl + " liegt zwischen " + hunderter + " und " + (hunderter + 100) + "."
        };
      },
      function () {
        var basis = zufall(12, 85) * 10;
        var halb = waehle([10, 20, 50]);
        if (basis + 2 * halb > 1000) { return null; }
        var mitte = basis + halb;
        return {
          id: neueId("st"), typ: "felder", schluessel: "mitte|" + basis + "|" + halb,
          frage: "Welche Zahl liegt genau in der Mitte zwischen " + basis + " und " + (basis + 2 * halb) + "?",
          ausdruck: "",
          felder: [{ korrekt: mitte, einheit: "", max: 4 }],
          erklaerung: "Genau zwischen " + basis + " und " + (basis + 2 * halb) + " liegt " + mitte + "."
        };
      },
      function () {
        var ziffern = mische([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
        var a = ziffern[0] * 100 + ziffern[1] * 10 + ziffern[2];
        var b = ziffern[0] * 100 + ziffern[2] * 10 + ziffern[1];
        var c = ziffern[1] * 100 + ziffern[0] * 10 + ziffern[2];
        var d = ziffern[2] * 100 + ziffern[0] * 10 + ziffern[1];
        var sortiert = Array.from(new Set([a, b, c, d])).sort(function (x, y) { return x - y; });
        if (sortiert.length < 4) { return null; }
        var anzeige = mische(sortiert);
        if (anzeige.every(function (v, i) { return v === sortiert[i]; })) {
          anzeige.reverse();
        }
        return {
          id: neueId("st"), typ: "ordnen", schluessel: "ordnen|" + sortiert.join(","),
          frage: "Klicke die vier Zahlen der Größe nach an – von der kleinsten zur größten:",
          bausteine: anzeige.map(String),
          loesung: sortiert.map(String),
          erklaerung: "Richtige Reihenfolge: " + sortiert.join(" < ") + "."
        };
      }
    ];
    return sammleEinzigartig(gens, anzahl || 8);
  }

  /* =====================================================================
     3. RUNDEN & ÜBERSCHLAGEN
     ===================================================================== */

  function baueRunden(anzahl) {
    var gens = [
      function () {
        var zahl = zufall(111, 989);
        if (zahl % 10 === 0) { return null; }
        var gerundet = rundeAuf(zahl, 10);
        return {
          id: neueId("ru"), typ: "felder", schluessel: "rz|" + zahl,
          frage: "Runde auf den nächsten Zehner (Z):",
          ausdruck: zahl + " \u2248",
          felder: [{ korrekt: gerundet, einheit: "", max: 4 }],
          erklaerung: "Einerstelle ist " + (zahl % 10) +
            (zahl % 10 >= 5 ? " (ab 5 wird aufgerundet)" : " (unter 5 wird abgerundet)") +
            " → " + gerundet + "."
        };
      },
      function () {
        var zahl = zufall(105, 949);
        if (zahl % 100 === 0) { return null; }
        var gerundet = rundeAuf(zahl, 100);
        return {
          id: neueId("ru"), typ: "felder", schluessel: "rh|" + zahl,
          frage: "Runde auf den nächsten Hunderter (H):",
          ausdruck: zahl + " \u2248",
          felder: [{ korrekt: gerundet, einheit: "", max: 4 }],
          erklaerung: "Zehnerstelle ist " + Math.floor((zahl % 100) / 10) +
            (zahl % 100 >= 50 ? " (ab 50 wird aufgerundet)" : " (unter 50 wird abgerundet)") +
            " → " + gerundet + "."
        };
      },
      function () {
        var h1 = zufall(2, 6) * 100;
        var h2 = zufall(1, 3) * 100;
        if (h1 + h2 > 900) { return null; }
        var a = h1 + waehle([-12, -8, -5, 4, 7, 11]);
        var b = h2 + waehle([-11, -7, -4, 5, 8, 12]);
        var ziel = h1 + h2;
        var optionen = [ziel - 100, ziel, ziel + 100].map(String);
        var gemischt = mische(optionen);
        return {
          id: neueId("ru"), typ: "auswahl", schluessel: "ueb-add|" + a + "|" + b,
          frage: "Überschlage im Kopf: Ungefähr wie viel ist " + a + " + " + b + "?",
          optionen: gemischt,
          richtig: gemischt.indexOf(String(ziel)),
          erklaerung: a + " \u2248 " + h1 + " und " + b + " \u2248 " + h2 + " → " + h1 + " + " + h2 + " = " + ziel + "."
        };
      },
      function () {
        var h1 = zufall(5, 9) * 100;
        var h2 = zufall(2, 4) * 100;
        var a = h1 + waehle([-9, -6, -3, 4, 7, 11]);
        var b = h2 + waehle([-8, -5, 3, 6, 9]);
        var ziel = h1 - h2;
        var optionen = [ziel - 100, ziel, ziel + 100].map(String);
        var gemischt = mische(optionen);
        return {
          id: neueId("ru"), typ: "auswahl", schluessel: "ueb-sub|" + a + "|" + b,
          frage: "Überschlage im Kopf: Ungefähr wie viel ist " + a + " \u2212 " + b + "?",
          optionen: gemischt,
          richtig: gemischt.indexOf(String(ziel)),
          erklaerung: a + " \u2248 " + h1 + " und " + b + " \u2248 " + h2 + " → " + h1 + " \u2212 " + h2 + " = " + ziel + "."
        };
      }
    ];
    return sammleEinzigartig(gens, anzahl || 8);
  }

  /* =====================================================================
     4. ANALOGE UHR (SVG-Zifferblatt)
     ===================================================================== */

  function uhrFormat(stunde, minute) {
    return stunde + ":" + (minute < 10 ? "0" + minute : String(minute));
  }

  function uhrSpruch(stunde, minute) {
    var naechste = (stunde % 12) + 1;
    if (minute === 0) { return "Punkt " + stunde + " Uhr"; }
    if (minute === 15) { return "Viertel nach " + stunde; }
    if (minute === 30) { return "Halb " + naechste; }
    if (minute === 45) { return "Viertel vor " + naechste; }
    return uhrFormat(stunde, minute) + " Uhr";
  }

  function baueUhr(anzahl) {
    var gens = [
      function () {
        var stunde = zufall(1, 12);
        var minute = waehle([0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]);
        return {
          id: neueId("uhr"), typ: "uhr-eingabe", schluessel: "uhr-les|" + stunde + "|" + minute,
          frage: "Wie spät ist es auf dieser Uhr? (z. B. 3:25)",
          uhr: { stunde: stunde, minute: minute },
          ziel: { stunde: stunde, minute: minute },
          erklaerung: "Der kleine Zeiger steht bei " + stunde + ", der große bei " + minute + " Minuten → " +
            uhrFormat(stunde, minute) + " Uhr (" + uhrSpruch(stunde, minute) + ")."
        };
      },
      function () {
        var stunde = zufall(1, 12);
        var minute = waehle([0, 10, 15, 20, 25, 30, 40, 45]);
        var dazu = waehle([15, 20, 30, 45]);
        var gesamt = ((stunde % 12) * 60 + minute + dazu) % 720;
        var zielStunde = Math.floor(gesamt / 60) || 12;
        var zielMinute = gesamt % 60;
        return {
          id: neueId("uhr"), typ: "uhr-eingabe", schluessel: "uhr-plus|" + stunde + "|" + minute + "|" + dazu,
          frage: "Wie spät ist es in " + dazu + " Minuten?",
          uhr: { stunde: stunde, minute: minute },
          ziel: { stunde: zielStunde, minute: zielMinute },
          erklaerung: "Jetzt ist es " + uhrFormat(stunde, minute) + " Uhr. Plus " + dazu + " Minuten ergibt " +
            uhrFormat(zielStunde, zielMinute) + " Uhr."
        };
      },
      function () {
        var stunde = zufall(1, 12);
        var minute = waehle([0, 15, 30, 45]);
        var richtigText = uhrSpruch(stunde, minute);
        var falschKandidaten = [
          uhrSpruch((stunde % 12) + 1, minute),
          uhrSpruch(stunde, (minute + 15) % 60),
          uhrSpruch(stunde, (minute + 30) % 60)
        ].filter(function (t) { return t !== richtigText; });
        var optionen = mische([richtigText, falschKandidaten[0], falschKandidaten[1]]);
        return {
          id: neueId("uhr"), typ: "auswahl", schluessel: "uhr-spruch|" + stunde + "|" + minute,
          frage: "Welche Zeit zeigt die Uhr?",
          uhr: { stunde: stunde, minute: minute },
          optionen: optionen,
          richtig: optionen.indexOf(richtigText),
          erklaerung: "Die Uhr zeigt " + uhrFormat(stunde, minute) + " Uhr – das ist „" + richtigText + "“."
        };
      }
    ];
    return sammleEinzigartig(gens, anzahl || 8);
  }

  /* =====================================================================
     5. GEOMETRIE, SPIEGELBILDER & WÜRFELGEBÄUDE (SVG)
     ===================================================================== */

  var FORMEN_FRAGEN = [
    {
      schluessel: "form-quadrat", bild: { art: "quadrat" },
      frage: "Wie heißt diese Figur?",
      optionen: ["Quadrat", "Dreieck", "Kreis"], richtig: 0,
      erklaerung: "Alle 4 Seiten sind gleich lang und alle Ecken sind rechtwinklig → Quadrat."
    },
    {
      schluessel: "form-rechteck", bild: { art: "rechteck" },
      frage: "Wie heißt diese Figur?",
      optionen: ["Quadrat", "Rechteck", "Fünfeck"], richtig: 1,
      erklaerung: "Gegenüberliegende Seiten sind gleich lang, aber es ist länger als hoch → Rechteck."
    },
    {
      schluessel: "form-dreieck", bild: { art: "dreieck" },
      frage: "Wie viele Ecken hat dieses Dreieck?",
      optionen: ["3", "4", "5"], richtig: 0,
      erklaerung: "Ein Dreieck hat immer 3 Ecken und 3 Seiten."
    },
    {
      schluessel: "form-fuenfeck", bild: { art: "fuenfeck" },
      frage: "Wie heißt diese Figur?",
      optionen: ["Viereck", "Fünfeck", "Sechseck"], richtig: 1,
      erklaerung: "Die Figur hat genau 5 Ecken und 5 Seiten → Fünfeck."
    },
    {
      schluessel: "form-sechseck", bild: { art: "sechseck" },
      frage: "Wie viele Ecken hat diese Figur?",
      optionen: ["5", "6", "8"], richtig: 1,
      erklaerung: "Es ist ein Sechseck mit genau 6 Ecken."
    },
    {
      schluessel: "koerper-wuerfel-ecken", bild: { art: "wuerfel" },
      frage: "Wie viele Ecken hat ein Würfel insgesamt?",
      optionen: ["6", "8", "12"], richtig: 1,
      erklaerung: "Ein Würfel hat 4 Ecken oben und 4 Ecken unten – zusammen 8 Ecken."
    },
    {
      schluessel: "koerper-wuerfel-flaechen", bild: { art: "wuerfel" },
      frage: "Wie viele Flächen (Seiten) hat ein Würfel?",
      optionen: ["4", "6", "8"], richtig: 1,
      erklaerung: "Wie ein Spielwürfel mit den Zahlen 1 bis 6: ein Würfel hat 6 Flächen."
    },
    {
      schluessel: "koerper-quader-kanten", bild: { art: "quader" },
      frage: "Wie viele Kanten hat ein Quader insgesamt?",
      optionen: ["8", "10", "12"], richtig: 2,
      erklaerung: "4 Kanten oben, 4 unten und 4 senkrecht – zusammen 12 Kanten."
    },
    {
      schluessel: "spiegel-herz-ja", bild: { art: "spiegel-herz-ja" },
      frage: "Ist die rote gestrichelte Linie eine echte Spiegelachse?",
      optionen: ["Ja, genau gespiegelt", "Nein, das passt nicht"], richtig: 0,
      erklaerung: "Linke und rechte Hälfte des Herzens sind genau spiegelgleich."
    },
    {
      schluessel: "spiegel-rechteck-diag", bild: { art: "spiegel-rechteck-nein" },
      frage: "Ist die rote gestrichelte Linie beim Rechteck eine echte Spiegelachse?",
      optionen: ["Ja, genau gespiegelt", "Nein, beim Falten passt es nicht"], richtig: 1,
      erklaerung: "Faltet man ein längliches Rechteck schräg, liegen die Ecken nicht genau aufeinander."
    },
    {
      schluessel: "spiegel-pfeil-nein", bild: { art: "spiegel-pfeil-nein" },
      frage: "Ist die rote Linie eine echte Spiegelachse?",
      optionen: ["Ja, genau gespiegelt", "Nein, links und rechts sind verschieden"], richtig: 1,
      erklaerung: "Links ist der Schaft, rechts die Spitze – nicht spiegelgleich."
    },
    {
      schluessel: "spiegel-haus-ja", bild: { art: "spiegel-haus-ja" },
      frage: "Ist die rote gestrichelte Linie eine echte Spiegelachse?",
      optionen: ["Ja, genau gespiegelt", "Nein, das passt nicht"], richtig: 0,
      erklaerung: "Dach, Wände und Tür liegen links und rechts genau spiegelbildlich."
    }
  ];

  /* Würfelgebäude als 2D-Höhenmatrix [reiheHintenNachVorne][spalteLinksNachRechts].
     Regel: Hintere Reihen sind immer >= vordere Reihen, damit kein Würfel verdeckt ist. */
  var WUERFEL_BAUTEN = [
    { name: "treppe", gitter: [[2, 1, 1], [1, 1, 0]] },
    { name: "turm-l", gitter: [[3, 1], [1, 1]] },
    { name: "stufe", gitter: [[2, 2], [1, 1]] },
    { name: "ecke", gitter: [[3, 2, 1], [1, 1, 1]] },
    { name: "mauer", gitter: [[2, 3, 2], [1, 1, 1]] },
    { name: "klotz", gitter: [[2, 2, 1], [2, 1, 0]] },
    { name: "klein", gitter: [[2, 1], [2, 1]] },
    { name: "bruecke", gitter: [[3, 1, 3], [1, 0, 1]] }
  ];

  function wuerfelSumme(gitter) {
    var summe = 0;
    for (var r = 0; r < gitter.length; r++) {
      for (var c = 0; c < gitter[r].length; c++) {
        summe += gitter[r][c];
      }
    }
    return summe;
  }

  function baueGeometrie(anzahl) {
    var gens = FORMEN_FRAGEN.map(function (f) {
      return function () {
        return {
          id: neueId("geo"), typ: "auswahl", schluessel: f.schluessel,
          frage: f.frage,
          bild: f.bild,
          optionen: f.optionen.slice(),
          richtig: f.richtig,
          erklaerung: f.erklaerung
        };
      };
    });
    // 3 Würfelgebäude-Generatoren dazumischen, damit in jeder Runde 2–3 vorkommen.
    for (var w = 0; w < 3; w++) {
      gens.push(function () {
        var bau = waehle(WUERFEL_BAUTEN);
        var gesamt = wuerfelSumme(bau.gitter);
        return {
          id: neueId("geo"), typ: "felder", schluessel: "wuerfel|" + bau.name,
          frage: "Wie viele kleine Würfel stecken in diesem Würfelgebäude insgesamt?",
          bild: { art: "wuerfelbau", gitter: bau.gitter },
          ausdruck: "",
          felder: [{ korrekt: gesamt, einheit: "Würfel", max: 2 }],
          erklaerung: "Zähle Turm für Turm: zusammen sind es genau " + gesamt + " Würfel."
        };
      });
    }
    return sammleEinzigartig(gens, anzahl || 8);
  }

  /* =====================================================================
     6. RECHENMAUERN & RECHENDREIECKE
     ===================================================================== */

  function baueMauerAufgabe(rueckwaerts) {
    var a = zufall(18, 160);
    var b = zufall(18, 160);
    var c = zufall(18, 160);
    var m1 = a + b;
    var m2 = b + c;
    var spitze = m1 + m2;
    if (spitze > 900) { return null; }
    // Steine: [spitze] / [m1, m2] / [a, b, c]
    var steine = [
      { id: "sp", wert: spitze, offen: !rueckwaerts },
      { id: "m1", wert: m1, offen: true },
      { id: "m2", wert: m2, offen: !rueckwaerts },
      { id: "a", wert: a, offen: rueckwaerts },
      { id: "b", wert: b, offen: false },
      { id: "c", wert: c, offen: rueckwaerts }
    ];
    return {
      id: neueId("mauer"), typ: "mauer",
      schluessel: "mauer|" + (rueckwaerts ? "r|" : "v|") + a + "|" + b + "|" + c,
      frage: rueckwaerts
        ? "Rechenmauer (Knobel-Version): Zwei Steine unten ergeben zusammen den Stein darüber. Finde die Lücken!"
        : "Rechenmauer: Rechne immer zwei Nachbarsteine zusammen für den Stein darüber.",
      steine: steine,
      erklaerung: "Unten: " + a + ", " + b + ", " + c + " → Mitte: " + m1 + " und " + m2 + " → Spitze: " + spitze + "."
    };
  }

  function baueDreieckAufgabe(rueckwaerts) {
    var i1 = zufall(20, 180);
    var i2 = zufall(20, 180);
    var i3 = zufall(20, 180);
    var a12 = i1 + i2;
    var a23 = i2 + i3;
    var a13 = i1 + i3;
    if (a12 > 500 || a23 > 500 || a13 > 500) { return null; }
    return {
      id: neueId("drei"), typ: "dreieck",
      schluessel: "drei|" + (rueckwaerts ? "r|" : "v|") + i1 + "|" + i2 + "|" + i3,
      frage: rueckwaerts
        ? "Rechendreieck: Jede Außenzahl ist die Summe der beiden Nachbar-Innenzahlen. Ergänze die Lücken!"
        : "Rechendreieck: Addiere jeweils zwei Innenzahlen für die Zahl auf der Außenkante.",
      innen: [
        { id: "i1", wert: i1, offen: false },
        { id: "i2", wert: i2, offen: rueckwaerts },
        { id: "i3", wert: i3, offen: rueckwaerts }
      ],
      aussen: [
        { id: "a12", wert: a12, offen: !rueckwaerts },
        { id: "a23", wert: a23, offen: true },
        { id: "a13", wert: a13, offen: !rueckwaerts }
      ],
      erklaerung: "Innen: " + i1 + ", " + i2 + ", " + i3 + " → Außen: " + a12 + ", " + a23 + " und " + a13 + "."
    };
  }

  function baueMauern(anzahl) {
    var gens = [
      function () { return baueMauerAufgabe(false); },
      function () { return baueMauerAufgabe(true); },
      function () { return baueDreieckAufgabe(false); },
      function () { return baueDreieckAufgabe(true); }
    ];
    return sammleEinzigartig(gens, anzahl || 6);
  }

  /* =====================================================================
     7. SCHRIFTLICHES RECHNEN SCHRITT FÜR SCHRITT
     ===================================================================== */

  function baueSchriftlichAdd() {
    var a = zufall(125, 689);
    var b = zufall(116, 489);
    var summe = a + b;
    if (summe > 999) { return null; }
    if (a % 10 + b % 10 < 10) { return null; } // mind. ein Übertrag zum Üben
    return {
      id: neueId("schr"), typ: "schriftlich", schluessel: "s-add|" + a + "|" + b,
      op: "+", a: a, b: b, ergebnis: summe,
      frage: "Rechne schriftlich untereinander (beginne rechts bei den Einern!). Das kleine Feld ist dein Merkfeld für den Übertrag:",
      erklaerung: a + " + " + b + " = " + summe + "."
    };
  }

  function baueSchriftlichSub() {
    var a = zufall(321, 987);
    var b = zufall(114, 589);
    if (a - b < 110) { return null; }
    if (a % 10 >= b % 10 && Math.floor((a % 100) / 10) >= Math.floor((b % 100) / 10)) {
      return null; // mind. einmal Borgen/Entbündeln
    }
    var diff = a - b;
    return {
      id: neueId("schr"), typ: "schriftlich", schluessel: "s-sub|" + a + "|" + b,
      op: "\u2212", a: a, b: b, ergebnis: diff,
      frage: "Rechne schriftlich untereinander (beginne rechts bei den Einern!). Das kleine Feld hilft beim Merken:",
      erklaerung: a + " \u2212 " + b + " = " + diff + "."
    };
  }

  function baueSchriftlich(anzahl) {
    var gens = [baueSchriftlichAdd, baueSchriftlichSub];
    return sammleEinzigartig(gens, anzahl || 6);
  }

  /* =====================================================================
     Öffentliche Schnittstelle
     ===================================================================== */

  function erzeuge(themaId, welt) {
    var info = THEMEN.find(function (t) { return t.id === themaId; });
    if (!info) { throw new Error("Unbekanntes Mathe-Thema: " + themaId); }
    var aufgaben;
    if (themaId === "groessen") { aufgaben = baueGroessen(info.anzahl, welt); }
    else if (themaId === "stellenwert") { aufgaben = baueStellenwert(info.anzahl); }
    else if (themaId === "runden") { aufgaben = baueRunden(info.anzahl); }
    else if (themaId === "uhr") { aufgaben = baueUhr(info.anzahl); }
    else if (themaId === "geometrie") { aufgaben = baueGeometrie(info.anzahl); }
    else if (themaId === "mauern") { aufgaben = baueMauern(info.anzahl); }
    else { aufgaben = baueSchriftlich(info.anzahl); }
    return { thema: info, aufgaben: aufgaben };
  }

  /* Prüft eine Uhrzeit-Eingabe gegen eine analoge 12h-Uhr (akzeptiert 3:25 und 15:25). */
  function uhrAntwortStimmt(eingabe, ziel) {
    if (!eingabe || !ziel) { return false; }
    return (eingabe.stunde % 12) === (ziel.stunde % 12) && eingabe.minute === ziel.minute;
  }

  return {
    THEMEN: THEMEN,
    erzeuge: erzeuge,
    uhrFormat: uhrFormat,
    uhrSpruch: uhrSpruch,
    uhrAntwortStimmt: uhrAntwortStimmt,
    wuerfelSumme: wuerfelSumme
  };
});
