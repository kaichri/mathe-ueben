/* ------------------------------------------------------------------
   geschichten.js
   Rechengeschichten für die 3. Klasse.

   Vier Themenwelten:
   - alltag : Emma ist allein unterwegs
   - bluey  : Emma spielt mit Bluey, Bingo, Muffin, Socks, Bandit oder Chilli
   - gabby  : Emma ist mit Gabby, Pandy, Kuchi, Meerkatze, Kitty Fee,
              Carlita, Ratkatz, Marty, Kuschelkatze, DJ Katzenminze oder Baby Box im Puppenhaus
   - doozie : Emma ist mit Doozie (Gabbys Schwester), Puggie, Sahnepfötchen,
              Bastelpfötchen, Pogi, Crouton und den anderen Doozie-Hunden
              im Hundehaus – auch zusammen mit Gabby und ihren Katzen

   Pro Durchgang gibt es 5 Geschichten:
   - 3 einfache und 2 mit zwei Rechenschritten
   - davon handeln 2 von Geld (Euro und Cent) oder von Uhr und Minuten
   ------------------------------------------------------------------ */
(function (umgebung, factory) {
  "use strict";
  var modul = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = modul;
  } else {
    umgebung.GESCHICHTEN = modul;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* ---------------- Figuren in deutscher Sprache ---------------- */

  var FIGUREN = {
    alltag: {
      mit: [],
      freunde: ["Ben", "Mia", "Paul", "Lina", "Jonas", "Sofia", "Nico", "Anna"]
    },
    bluey: {
      mit: ["Bluey", "Bingo", "Muffin", "Socks", "Bandit", "Chilli"],
      freunde: ["Bluey", "Bingo", "Muffin", "Socks", "Bandit", "Chilli",
        "Rusty", "Chloe", "Judo", "Indy", "Winton", "Mackenzie", "Snickers",
        "Coco", "Honey", "Lucky", "Pom Pom", "Jack", "Lila", "Missy"]
    },
    gabby: {
      mit: ["Gabby", "Pandy", "Kuchi", "Meerkatze", "Kitty Fee", "DJ Katzenminze",
        "Baby Box", "Carlita", "Ratkatz", "Marty", "Kuschelkatze"],
      freunde: ["Gabby", "Pandy", "Kuchi", "Meerkatze", "Kitty Fee", "DJ Katzenminze",
        "Baby Box", "Carlita", "Ratkatz", "Marty", "Kuschelkatze"]
    },
    doozie: {
      mit: ["Doozie", "Puggie", "Sahnepf\u00F6tchen", "Bastelpf\u00F6tchen", "Pogi",
        "Crouton", "Paillette", "Traumpfötchen", "Pixiepfötchen", "Spielpfötchen", "Swenny"],
      freunde: ["Doozie", "Puggie", "Sahnepf\u00F6tchen", "Bastelpf\u00F6tchen", "Pogi",
        "Crouton", "Paillette", "Traumpfötchen", "Pixiepfötchen", "Spielpfötchen", "Swenny",
        "Gabby", "Pandy", "Kuchi", "Kitty Fee", "Hamsterh\u00FCndchen"]
    }
  };

  /* Kleinkinder kaufen nicht selbst ein – bei Geld-Geschichten außen vor */
  var BABY_FIGUREN = ["Socks", "Baby Box", "Pogi", "Hamsterh\u00FCndchen"];

  /* ---------------- Helfer ---------------- */

  function zufall(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function waehle(auswahl) {
    return auswahl[zufall(0, auswahl.length - 1)];
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

  var laufendeNummer = 0;

  function feld(korrekt, optionen) {
    var opts = optionen || {};
    return {
      korrekt: korrekt,
      typ: opts.typ || "zahl",
      beschriftung: opts.beschriftung || "",
      darstellung: opts.darstellung || "",
      anzeige: opts.anzeige !== undefined ? opts.anzeige : String(korrekt),
      einheit: opts.einheit || "",
      zeit: opts.zeit,
      geld: opts.geld
    };
  }

  function geldText(cent) {
    var euro = Math.floor(cent / 100);
    var rest = cent % 100;
    return rest === 0 ? euro + " \u20AC" : euro + " \u20AC " + rest;
  }

  function auswahlFeld(richtig, andere) {
    var optionen = mische([richtig].concat(andere));
    var antwort = feld(optionen.indexOf(richtig) + 1, { anzeige: richtig });
    antwort.auswahl = optionen;
    return antwort;
  }

  function uhrText(stunde, minute) {
    return stunde + ":" + (minute < 10 ? "0" + minute : minute);
  }

  function uhrSprechText(stunde, minute) {
    return minute === 0 ? stunde + " Uhr" : uhrText(stunde, minute) + " Uhr";
  }

  /* ---------------- Die Vorlagen ---------------- */

  var VORLAGEN = [
    /* ----- einfache Geschichten ----- */
    {
      id: "sammeln-dazu",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Murmeln", "Briefmarken", "Buntstifte", "Kristalle"],
        bluey: ["Muscheln", "St\u00F6cke", "Kieselsteine", "Federn"],
        gabby: ["Kekse", "Cupcakes", "Glitzersteine", "Sticker"],
        doozie: ["Leckerlis", "Tenndis-B\u00E4lle", "Pfoten-Abzeichen", "Knochen-Kekse"]
      },
      zahlen: [{ min: 24, max: 58 }, { min: 12, max: 34 }],
      regeln: function (z) { return z[0] + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " sammelt " + c.sache + " und hat schon " + c.z[0] + " St\u00FCck. " +
          c.p2 + " legt noch " + c.z[1] + " dazu. Wie viele " + c.sache + " sind es jetzt zusammen?";
      },
      losung: function (c) { return c.z[0] + c.z[1]; }
    },
    {
      id: "verschenken",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Sticker", "Äpfel", "Kreise", "Perlen"],
        bluey: ["Muscheln", "Bl\u00E4tter", "Zweige"],
        gabby: ["Kekse", "Bonbons", "Stern-Aufkleber"],
        doozie: ["Leckerlis", "Gummib\u00E4lle", "Kauknochen"]
      },
      zahlen: [{ min: 34, max: 89 }, { min: 12, max: 33 }],
      regeln: function (z) { return z[0] - z[1] >= 5; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + ". " + c.z[1] +
          " St\u00FCck verschenkt " + c.p1 + " an " + c.p2 + ". Wie viele " + c.sache + " hat " + c.p1 + " dann noch?";
      },
      losung: function (c) { return c.z[0] - c.z[1]; }
    },
    {
      id: "mehr-als",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Karten", "B\u00FCcher", "T\u00FCrme aus Baukl\u00F6tzen"],
        bluey: ["Tore", "Muscheln", "H\u00FCpfpunkte"],
        gabby: ["Kissen", "Lichter", "Tassen"],
        doozie: ["Hindernisse", "Schwanzwedel-Punkte", "Apportel-B\u00E4lle"]
      },
      zahlen: [{ min: 15, max: 60 }, { min: 12, max: 35 }],
      regeln: function (z) { return z[0] + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + ". " + c.p2 + " hat " + c.z[1] +
          " " + c.sache + " mehr als " + c.p1 + ". Wie viele " + c.sache + " hat " + c.p2 + "?";
      },
      losung: function (c) { return c.z[0] + c.z[1]; }
    },
    {
      id: "weniger-als",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Bonbons", "Figuren", "Stifte"],
        bluey: ["B\u00E4lle", "Schnecken", "Bl\u00E4tter"],
        gabby: ["Cupcakes", "Muffins", "Kerzen"],
        doozie: ["Tenndis-B\u00E4lle", "Knochen", "Quietsch-Enten"]
      },
      zahlen: [{ min: 35, max: 88 }, { min: 13, max: 34 }],
      regeln: function (z) { return z[0] - z[1] >= 5; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + ", " + c.p2 +
          " hat " + c.z[1] + " weniger. Wie viele " + c.sache + " hat " + c.p2 + "?";
      },
      losung: function (c) { return c.z[0] - c.z[1]; }
    },
    {
      id: "gleich-verteilen",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Gummib\u00E4rchen", "Kekse", "Sticker"],
        bluey: ["Kugeln", "Muscheln", "Karten"],
        gabby: ["Cupcakes", "Stifte", "Glitzerkarten"],
        doozie: ["Leckerlis", "B\u00E4lle", "Knochen-Kekse"]
      },
      zahlen: [{ min: 24, max: 96 }, { min: 3, max: 8 }],
      regeln: function (z) { return z[0] % z[1] === 0 && z[0] / z[1] >= 4; },
      text: function (c) {
        return c.p1 + " verteilt " + c.z[0] + " " + c.sache + " gleichm\u00E4\u00DFig auf " + c.z[1] +
          " Freundinnen und Freunde. Wie viele bekommt jede und jeder?";
      },
      losung: function (c) { return c.z[0] / c.z[1]; }
    },
    {
      id: "tueten-gruppen",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Stifte", "Kaugummis", "Murmeln", "Kreise"],
        bluey: ["N\u00FCsse", "Muscheln", "Zeichnungen"],
        gabby: ["Kekse", "Bonbons", "Kerzen"],
        doozie: ["Leckerlis", "Knochen-Kekse", "Muscheln"]
      },
      zahlen: [{ min: 3, max: 9 }, { min: 4, max: 11 }],
      regeln: function (z) { return z[0] * z[1] <= 100; },
      text: function (c) {
        return c.p1 + " f\u00FCllt " + c.z[0] + " T\u00FCten und legt in jede T\u00FCte " + c.z[1] + " " +
          c.sache + ". Wie viele " + c.sache + " sind das insgesamt?";
      },
      losung: function (c) { return c.z[0] * c.z[1]; }
    },
    {
      id: "keepy-uppy",
      stufe: 1,
      kategorie: "normal",
      themen: ["bluey"],
      zahlen: [{ min: 18, max: 47 }, { min: 12, max: 39 }],
      regeln: function (z) { return z[0] + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " und " + c.p2 + " spielen Keepy Uppy. " + c.p1 + " tippt den Ball " + c.z[0] +
          " Mal, " + c.p2 + " tippt ihn " + c.z[1] + " Mal. Wie viele Tipps schaffen beide zusammen?";
      },
      losung: function (c) { return c.z[0] + c.z[1]; }
    },
    {
      id: "am-bach",
      stufe: 1,
      kategorie: "normal",
      themen: ["bluey"],
      zahlen: [{ min: 36, max: 88 }, { min: 12, max: 33 }],
      regeln: function (z) { return z[0] - z[1] >= 5; },
      text: function (c) {
        return "Am Bach liegen " + c.z[0] + " St\u00F6cke. " + c.z[1] + " St\u00F6cke nimmt " + c.p2 +
          " mit nach Hause. Wie viele St\u00F6cke bleiben am Bach?";
      },
      losung: function (c) { return c.z[0] - c.z[1]; }
    },
    {
      id: "beim-backen",
      stufe: 1,
      kategorie: "normal",
      themen: ["gabby"],
      zahlen: [{ min: 3, max: 9 }, { min: 4, max: 11 }],
      regeln: function (z) { return z[0] * z[1] <= 100; },
      text: function (c) {
        return c.p1 + " backt " + c.z[0] + " Bleche mit je " + c.z[1] +
          " Keksen. Wie viele Kekse backt " + c.p1 + "?";
      },
      losung: function (c) { return c.z[0] * c.z[1]; }
    },
    {
      id: "puppenhaus-aufraeumen",
      stufe: 1,
      kategorie: "normal",
      themen: ["gabby"],
      zahlen: [{ min: 34, max: 78 }, { min: 12, max: 33 }],
      regeln: function (z) { return z[0] - z[1] >= 5; },
      text: function (c) {
        return "Beim Aufr\u00E4umen im Puppenhaus z\u00E4hlt " + c.p1 + ": Es stehen " + c.z[0] +
          " Tassen und " + c.z[1] + " Teller herum. Wie viele Tassen sind es mehr als Teller?";
      },
      losung: function (c) { return c.z[0] - c.z[1]; }
    },
    {
      id: "hundehaus-modenschau",
      stufe: 1,
      kategorie: "normal",
      themen: ["doozie"],
      zahlen: [{ min: 3, max: 9 }, { min: 4, max: 11 }],
      regeln: function (z) { return z[0] * z[1] <= 100; },
      text: function (c) {
        return "Bei der Hunde-Modenschau im Hundehaus organisiert " + c.p1 +
          " " + c.z[0] + " Reihen mit je " + c.z[1] + " Hunden. Wie viele Hunde laufen \u00FCber den Laufsteg?";
      },
      losung: function (c) { return c.z[0] * c.z[1]; }
    },
    {
      id: "quietschtiere",
      stufe: 1,
      kategorie: "normal",
      themen: ["doozie"],
      zahlen: [{ min: 36, max: 88 }, { min: 12, max: 33 }],
      regeln: function (z) { return z[0] - z[1] >= 5; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " Quietsch-Enten im Hundehaus. " + c.z[1] +
          " davon sind schon kaputt. Wie viele Quietsch-Enten sind noch heil?";
      },
      losung: function (c) { return c.z[0] - c.z[1]; }
    },

    /* ----- Weitere einfache Geschichten (gegen Wiederholungen) ----- */
    {
      id: "beide-zusammen-einfach",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Karten", "Sticker", "\u00C4pfel", "B\u00E4lle"],
        bluey: ["Muscheln", "B\u00E4lle", "Springseile"],
        gabby: ["Kerzen", "Kissen", "Keksdosen"],
        doozie: ["B\u00E4lle", "Kauknochen", "Schwimmwesten"]
      },
      zahlen: [{ min: 18, max: 55 }, { min: 12, max: 44 }],
      regeln: function (z) { return z[0] + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + " und " + c.p2 + " hat " + c.z[1] +
          " " + c.sache + ". Wie viele " + c.sache + " haben beide zusammen?";
      },
      losung: function (c) { return c.z[0] + c.z[1]; }
    },
    {
      id: "doppelt-so-viele",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["T\u00FCrme", "Fotos", "Lieder", "Runden mit dem Fahrrad"],
        bluey: ["Tore", "Saltos", "Muschelketten"],
        gabby: ["Lieder", "T\u00E4nze", "Zaubertricks"],
        doozie: ["Pfoten-Abzeichen", "\u00DCbungen", "Apportel-St\u00F6cke"]
      },
      zahlen: [{ min: 13, max: 45 }],
      regeln: function (z) { return 2 * z[0] <= 100; },
      text: function (c) {
        return c.p1 + " schafft " + c.z[0] + " " + c.sache + ". " + c.p2 +
          " schafft doppelt so viele. Wie viele " + c.sache + " schafft " + c.p2 + "?";
      },
      losung: function (c) { return 2 * c.z[0]; }
    },
    {
      id: "paare-legen",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Socken", "Handschuhe", "Untersetzer"],
        bluey: ["Flaschenverschl\u00FCsse", "Muscheln", "Stifte"],
        gabby: ["Handschuhe", "L\u00F6ffel", "Kerzen"],
        doozie: ["Quietsch-Enten", "Knochen", "Tenndis-B\u00E4lle"]
      },
      zahlen: [{ min: 18, max: 48 }],
      regeln: function (z) { return z[0] % 2 === 0; },
      text: function (c) {
        return c.p1 + " r\u00E4umt " + c.z[0] + " " + c.sache + " auf und legt immer zwei zusammen. " +
          "Wie viele Paare entstehen so?";
      },
      losung: function (c) { return c.z[0] / 2; }
    },
    {
      id: "parkplaetze-frei",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 40, max: 90 }, { min: 13, max: 35 }],
      regeln: function (z) { return z[0] - z[1] >= 5; },
      text: function (c) {
        return "Auf dem Parkplatz gibt es " + c.z[0] + " Pl\u00E4tze. " + c.z[1] +
          " Pl\u00E4tze sind noch frei. Wie viele Autos stehen schon dort?";
      },
      losung: function (c) { return c.z[0] - c.z[1]; }
    },
    {
      id: "wer-hat-mehr",
      stufe: 1,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Stern-Sticker", "Spielkarten", "Perlen"],
        bluey: ["Muscheln", "Kieselsteine", "B\u00E4lle"],
        gabby: ["Glitzersteine", "Aufkleber", "T\u00E4sschen"],
        doozie: ["Leckerlis", "Pfoten-Abzeichen", "Knochen-Marken"]
      },
      zahlen: [{ min: 34, max: 88 }, { min: 12, max: 33 }],
      regeln: function (z) { return z[0] - z[1] >= 5; },
      text: function (c) {
        return c.p1 + " sammelt " + c.z[0] + " " + c.sache + ", " + c.p2 + " sammelt " + c.z[1] +
          ". Wie viele " + c.sache + " hat " + c.p1 + " mehr als " + c.p2 + "?";
      },
      losung: function (c) { return c.z[0] - c.z[1]; }
    },

    /* ----- Geschichten mit zwei Rechenschritten ----- */
    {
      id: "dazu-dann-weg",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Murmeln", "Pilze", "Kristalle", "Kastanien"],
        bluey: ["Muscheln", "St\u00F6cke", "Eicheln"],
        gabby: ["Kekse", "Stern-Sticker", "Glitzerperlen"],
        doozie: ["Leckerlis", "Apportel-B\u00E4lle", "Knochen"]
      },
      zahlen: [{ min: 22, max: 48 }, { min: 11, max: 32 }, { min: 9, max: 28 }],
      regeln: function (z) { return z[0] + z[1] <= 100 && z[0] + z[1] - z[2] >= 5; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + ". " + c.p2 + " schenkt " + c.p1 + " noch " +
          c.z[1] + " dazu. Dann gibt " + c.p1 + " " + c.z[2] + " St\u00FCck an " + c.p2 + " ab. Wie viele " +
          c.sache + " hat " + c.p1 + " jetzt?";
      },
      losung: function (c) { return c.z[0] + c.z[1] - c.z[2]; }
    },
    {
      id: "verloren-und-gefunden",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Karten", "Murmeln", "Perlen"],
        bluey: ["Muscheln", "Flaschen", "Zeichnungen"],
        gabby: ["Sticker", "Kugeln", "Kerzen"],
        doozie: ["Leckerlis", "Tenndis-B\u00E4lle", "Knochen"]
      },
      zahlen: [{ min: 45, max: 88 }, { min: 13, max: 34 }, { min: 8, max: 27 }],
      regeln: function (z) { return z[2] <= z[1] && z[0] - z[1] >= 3 && z[0] - z[1] + z[2] <= 100; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + " dabei. Unterwegs gehen " + c.z[1] +
          " St\u00FCck verloren, sp\u00E4ter findet " + c.p1 + " aber " + c.z[2] + " St\u00FCck wieder. Wie viele hat " +
          c.p1 + " am Ende?";
      },
      losung: function (c) { return c.z[0] - c.z[1] + c.z[2]; }
    },
    {
      id: "packungen-dann-weg",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Kaugummis", "Kekse", "Stifte"],
        bluey: ["N\u00FCsse", "Muffins", "Muscheln"],
        gabby: ["Kekse", "Cupcakes", "Bonbons"],
        doozie: ["Knochen-Kekse", "Leckerlis", "N\u00FCsse"]
      },
      zahlen: [{ min: 3, max: 8 }, { min: 5, max: 12 }, { min: 6, max: 28 }],
      regeln: function (z) { return z[0] * z[1] <= 100 && z[0] * z[1] - z[2] >= 5; },
      text: function (c) {
        return c.p1 + " kauft " + c.z[0] + " Packungen mit je " + c.z[1] + " " + c.sache +
          ". Davon gibt " + c.p1 + " " + c.z[2] + " St\u00FCck an " + c.p2 + " ab. Wie viele " + c.sache + " bleiben \u00FCbrig?";
      },
      losung: function (c) { return c.z[0] * c.z[1] - c.z[2]; }
    },
    {
      id: "beide-haben-zusammen",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Briefmarken", "B\u00FCcher", "Figuren"],
        bluey: ["Muscheln", "Steine", "Bl\u00E4tter"],
        gabby: ["Sticker", "Kerzen", "Kissen"],
        doozie: ["Leckerlis", "Kieselsteine", "Zweige"]
      },
      zahlen: [{ min: 14, max: 42 }, { min: 9, max: 26 }],
      regeln: function (z) { return 2 * z[0] + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + ". " + c.p2 + " hat " + c.z[1] +
          " " + c.sache + " mehr als " + c.p1 + ". Wie viele " + c.sache + " haben beide zusammen?";
      },
      losung: function (c) { return c.z[0] + (c.z[0] + c.z[1]); }
    },
    {
      id: "verdoppeln-dann-weg",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Kreise", "Sterne", "Aufkleber"],
        bluey: ["Tore", "Muscheln", "H\u00FCpfpunkte"],
        gabby: ["Kekse", "Lichter", "Tassen"],
        doozie: ["Quietsch-Enten", "Tenndis-B\u00E4lle", "Pfoten-Abzeichen"]
      },
      zahlen: [{ min: 13, max: 48 }, { min: 7, max: 29 }],
      regeln: function (z) { return 2 * z[0] <= 100 && 2 * z[0] - z[1] >= 5; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + " und verdoppelt die Zahl. Danach gehen " +
          c.z[1] + " St\u00FCck kaputt. Wie viele bleiben \u00FCbrig?";
      },
      losung: function (c) { return 2 * c.z[0] - c.z[1]; }
    },

    {
      id: "halbierung-dann-dazu",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Gummib\u00E4rchen", "Kekse", "Kastanien"],
        bluey: ["Muscheln", "St\u00F6cke", "N\u00FCsse"],
        gabby: ["Cupcakes", "Sticker", "Glitzerperlen"],
        doozie: ["Leckerlis", "Knochen-Kekse", "B\u00E4lle"]
      },
      zahlen: [{ min: 24, max: 68 }, { min: 7, max: 28 }],
      regeln: function (z) { return z[0] % 2 === 0 && z[0] / 2 + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " verschenkt die H\u00E4lfte von " + c.z[0] + " " + c.sache + " an " + c.p2 +
          ". Sp\u00E4ter schenkt " + c.p2 + " " + c.p1 + " noch " + c.z[1] + " " + c.sache + " dazu. Wie viele " +
          c.sache + " hat " + c.p1 + " jetzt?";
      },
      losung: function (c) { return c.z[0] / 2 + c.z[1]; }
    },
    {
      id: "dreifach-dann-weg",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Murmel-Kugeln", "Bonbons", "Figuren"],
        bluey: ["Tenndis-B\u00E4lle", "Muscheln", "Ringe"],
        gabby: ["Cakey-Kekse", "Lichter", "Tassen"],
        doozie: ["Kauknochen", "Quietschb\u00E4lle", "Pfoten-Abzeichen"]
      },
      zahlen: [{ min: 8, max: 30 }, { min: 6, max: 30 }],
      regeln: function (z) { return 3 * z[0] <= 100 && 3 * z[0] - z[1] >= 5; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + ". " + c.p2 + " hat das Dreifache davon. " +
          "Dann verschenkt " + c.p2 + " " + c.z[1] + " St\u00FCck. Wie viele " + c.sache +
          " hat " + c.p2 + " dann?";
      },
      losung: function (c) { return 3 * c.z[0] - c.z[1]; }
    },
    {
      id: "kisten-stapeln",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Stifte", "\u00C4pfel", "B\u00FCcher"],
        bluey: ["Muscheln", "Zweige", "Steine"],
        gabby: ["Kerzen", "B\u00E4nder", "Servietten"],
        doozie: ["Leckerlis", "Apportel-B\u00E4lle", "Schwimmflossen"]
      },
      zahlen: [{ min: 3, max: 8 }, { min: 5, max: 11 }, { min: 4, max: 22 }],
      regeln: function (z) { return z[0] * z[1] + z[2] <= 100; },
      text: function (c) {
        return c.p1 + " stellt " + c.z[0] + " Kisten mit je " + c.z[1] + " " + c.sache +
          " in den Schrank. Oben drauf legt " + c.p2 + " noch " + c.z[2] + " " + c.sache +
          ". Wie viele " + c.sache + " sind es insgesamt?";
      },
      losung: function (c) { return c.z[0] * c.z[1] + c.z[2]; }
    },
    {
      id: "doppeltes-ergaenzen",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Decken", "Kissen", "Becher"],
        bluey: ["Schwimmflossen", "Handt\u00FCcher", "B\u00E4lle"],
        gabby: ["Kissen", "Decken", "Lichterketten"],
        doozie: ["N\u00E4pfe", "Decken", "Spielb\u00E4lle"]
      },
      zahlen: [{ min: 12, max: 40 }, { min: 6, max: 24 }],
      regeln: function (z) { return 2 * (z[0] + z[1]) <= 100; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " " + c.sache + " und " + c.p2 + " hat " + c.z[1] +
          " " + c.sache + ". Gemeinsam wollen sie genau das Doppelte davon haben. Wie viele " +
          c.sache + " m\u00FCssen sie noch sammeln?";
      },
      losung: function (c) { return c.z[0] + c.z[1]; }
    },
    {
      id: "sitzreihen-kino",
      stufe: 2,
      kategorie: "normal",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 40, max: 90 }, { min: 13, max: 35 }, { min: 4, max: 20 }],
      regeln: function (z) { return z[0] - z[1] >= 5 && z[2] <= z[1]; },
      text: function (c) {
        return "Im Kino-Saal sind " + c.z[0] + " Sitze. " + c.z[1] +
          " Sitze bleiben frei. Dann kommen " + c.z[2] + " Freunde sp\u00E4ter dazu. " +
          "Wie viele Sitze sind jetzt besetzt?";
      },
      losung: function (c) { return c.z[0] - c.z[1] + c.z[2]; }
    },

    /* ----- Geld-Geschichten (Euro und Cent) ----- */
    {
      id: "geld-zwei-eis",
      stufe: 1,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 1, max: 5 }, { min: 2, max: 9 }],
      regeln: function (z) { return (z[0] * 100 + z[1] * 10) * 2 <= 10000; },
      text: function (c) {
        return "Ein Eis kostet " + c.z[0] + " \u20AC " + (c.z[1] * 10) +
          " Cent. " + c.p1 + " und " + c.p2 + " wollen jedes ein Eis. Was kosten beide Eise zusammen?";
      },
      frage: "Antwort in Euro und Cent",
      feld: function (c) {
        var cent = (c.z[0] * 100 + c.z[1] * 10) * 2;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-taschengeld",
      stufe: 1,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 12, max: 48 }, { min: 6, max: 34 }],
      regeln: function (z) { return z[0] + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " \u20AC Taschengeld und bekommt von " + c.p2 + " noch " +
          c.z[1] + " \u20AC geschenkt. Wie viel Geld hat " + c.p1 + " jetzt?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = (c.z[0] + c.z[1]) * 100;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-rueckgeld",
      stufe: 2,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 40, max: 100 }, { min: 12, max: 34 }, { min: 9, max: 28 }],
      regeln: function (z) { return z[1] + z[2] < z[0] && z[0] - z[1] - z[2] >= 5; },
      text: function (c) {
        return c.p1 + " geht einkaufen und hat " + c.z[0] + " \u20AC dabei. Das Buch kostet " + c.z[1] +
          " \u20AC und die Stifte kosten " + c.z[2] + " \u20AC. " + c.p1 + " bezahlt mit den " + c.z[0] + " \u20AC. Wie viel Geld bekommt " + c.p1 + " zur\u00FCck?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = (c.z[0] - c.z[1] - c.z[2]) * 100;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-stueckpreis",
      stufe: 2,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      sache: {
        alltag: ["Muffins", "Cupcakes", "T\u00FCten Gummib\u00E4rchen"],
        bluey: ["Kekse", "Donuts", "T\u00FCten Popcorn"],
        gabby: ["Cakey-Kekse", "Muffins", "Glasur-Sterne"],
        doozie: ["Knochen-Kekse", "Leckerli-T\u00FCten", "Pfoten-Waffeln"]
      },
      zahlen: [{ min: 3, max: 9 }],
      regeln: function (z) { return z[0] * 250 <= 10000; },
      text: function (c) {
        return c.p1 + " kauft " + c.z[0] + " " + c.sache + ". Jedes St\u00FCck kostet 2 \u20AC 50. " +
          "Wie viel Geld muss " + c.p1 + " bezahlen?";
      },
      frage: "Antwort in Euro und Cent",
      feld: function (c) {
        var cent = c.z[0] * 250;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-drei-freunde",
      stufe: 1,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 4, max: 33 }],
      regeln: function (z) { return z[0] * 3 <= 100; },
      text: function (c) {
        return "Drei Freunde kaufen " + c.p2 + " gemeinsam ein Geschenk. Jeder zahlt " + c.z[0] +
          " \u20AC. Was kostet das Geschenk?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = c.z[0] * 300;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-taschengeld-monate",
      stufe: 1,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 5, max: 16 }, { min: 2, max: 6 }],
      regeln: function (z) { return z[0] * z[1] <= 100; },
      text: function (c) {
        return c.p1 + " bekommt jeden Monat " + c.z[0] + " \u20AC Taschengeld und legt alles in die " +
          "anfangs leere Sparb\u00FCchse. Wie viel Geld liegt nach " + c.z[1] + " Monaten in der Sparb\u00FCchse?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = c.z[0] * c.z[1] * 100;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-zwei-sachen",
      stufe: 1,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 6, max: 48 }, { min: 3, max: 30 }],
      regeln: function (z) { return z[0] + z[1] <= 100; },
      text: function (c) {
        return "Ein Rucksack kostet " + c.z[0] + " \u20AC und eine Trinkflasche kostet " + c.z[1] +
          " \u20AC. Was kostet beides zusammen?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = (c.z[0] + c.z[1]) * 100;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-haelfte-sparschwein",
      stufe: 1,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 12, max: 96 }],
      regeln: function (z) { return z[0] % 2 === 0; },
      text: function (c) {
        return c.p1 + " bekommt " + c.z[0] + " \u20AC geschenkt und legt genau die H\u00E4lfte davon " +
          "ins anfangs leere Sparschwein. Wie viel Geld liegt im Sparschwein?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = c.z[0] * 50;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-eis-rest",
      stufe: 2,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 8, max: 40 }, { min: 2, max: 5 }, { min: 2, max: 9 }],
      regeln: function (z) {
        var rest = (z[0] - z[1]) * 100 - z[2] * 10;
        return rest >= 150 && rest <= 9000;
      },
      text: function (c) {
        return c.p1 + " hat " + c.z[0] + " \u20AC dabei. Ein Eis kostet " + c.z[1] + " \u20AC " +
          (c.z[2] * 10) + " Cent. Wie viel Geld bleibt \u00FCbrig?";
      },
      frage: "Antwort in Euro und Cent",
      feld: function (c) {
        var cent = (c.z[0] - c.z[1]) * 100 - c.z[2] * 10;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-kinokarten",
      stufe: 2,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 4, max: 25 }],
      regeln: function (z) { return z[0] * 4 <= 100; },
      text: function (c) {
        return "Eine Kinokarte kostet " + c.z[0] + " \u20AC. " + c.p1 +
          " kauft Karten f\u00FCr sich und drei Freunde. Was kosten alle vier Karten zusammen?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = c.z[0] * 400;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-trikot-ball",
      stufe: 2,
      kategorie: "geld",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 5, max: 30 }, { min: 3, max: 25 }],
      regeln: function (z) { return 2 * z[0] + z[1] <= 100; },
      text: function (c) {
        return "Ein Ball kostet " + c.z[0] + " \u20AC. Ein Trikot kostet " + c.z[1] +
          " \u20AC mehr als der Ball. Was kosten Ball und Trikot zusammen?";
      },
      frage: "Antwort in Euro",
      feld: function (c) {
        var cent = (2 * c.z[0] + c.z[1]) * 100;
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },

    /* ----- Uhr- und Minuten-Geschichten ----- */
    {
      id: "uhr-minuten-zusammen",
      stufe: 1,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      tatigkeiten: {
        alltag: ["Memory", "Tabu", "Mensch \u00E4rgere Dich nicht", "Kopfzahlen"],
        bluey: ["Keepy Uppy", "Shadowlands", "Radio Hooray", "Krocket"],
        gabby: ["Verstecken im Puppenhaus", "Reise ins Sternenland", "Kuchis Backwettbewerb", "Sternen-Suchen"],
        doozie: ["Verstecken im Hundehaus", "Hunde-Modenschau", "Agenten-Alarm", "Hamsterh\u00FCndchen-Fangen"]
      },
      zahlen: [{ min: 18, max: 55 }, { min: 12, max: 34 }],
      regeln: function (z) { return z[0] + z[1] <= 100; },
      text: function (c) {
        return c.p1 + " spielt " + c.z[0] + " Minuten " + c.t1 + " und danach " + c.z[1] +
          " Minuten " + c.t2 + ". Wie viele Minuten spielt " + c.p1 + " insgesamt?";
      },
      frage: "Antwort in Minuten",
      losung: function (c) { return c.z[0] + c.z[1]; },
      einheit: "Minuten"
    },
    {
      id: "uhr-wie-spaet",
      stufe: 1,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 15, max: 40 }],
      vorbereitung: function () {
        return { stunde: zufall(7, 11), minute: waehle([0, 5, 10, 15, 20, 25, 30, 35, 40, 45]) };
      },
      text: function (c) {
        return "Es ist " + c.extra.uhrSprech + ". In " + c.z[0] + " Minuten beginnt der Film. Wie viel Uhr ist es dann?";
      },
      frage: "Antwort als Uhrzeit, zum Beispiel 9:25",
      feld: function (c) {
        var zusammen = c.extra.minuten + c.z[0];
        var stunde = Math.floor(zusammen / 60);
        var minute = zusammen % 60;
        return feld(zusammen, {
          typ: "zeit",
          zeit: { stunde: stunde, minute: minute },
          anzeige: uhrSprechText(stunde, minute)
        });
      }
    },
    {
      id: "uhr-zeit-planen",
      stufe: 2,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 13, max: 34 }, { min: 9, max: 22 }],
      regeln: function (z) { return z[0] + z[1] <= 55 && 60 - z[0] - z[1] >= 5; },
      text: function (c) {
        return c.p1 + " hat 1 Stunde Zeit, das sind 60 Minuten. Der Weg dauert " + c.z[0] +
          " Minuten und die Pause " + c.z[1] + " Minuten. Wie viele Minuten bleiben zum Spielen?";
      },
      frage: "Antwort in Minuten",
      losung: function (c) { return 60 - c.z[0] - c.z[1]; },
      einheit: "Minuten"
    },
    {
      id: "uhr-hin-und-zurueck",
      stufe: 2,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 12, max: 34 }, { min: 8, max: 26 }],
      regeln: function (z) { return 2 * z[0] + z[1] <= 100; },
      text: function (c) {
        return "Der Weg zum See dauert " + c.z[0] + " Minuten. " + c.p1 + " geht hin und wieder zur\u00FCck " +
          "und macht unterwegs " + c.z[1] + " Minuten Pause. Wie viele Minuten dauert der ganze Ausflug?";
      },
      frage: "Antwort in Minuten",
      losung: function (c) { return 2 * c.z[0] + c.z[1]; },
      einheit: "Minuten"
    },
    {
      id: "uhr-minuten-davor",
      stufe: 1,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 10, max: 35 }],
      vorbereitung: function () {
        return { stunde: zufall(8, 11), minute: waehle([15, 20, 25, 30, 35, 40, 45, 50]) };
      },
      text: function (c) {
        return "Es ist " + c.extra.uhrSprech + ". Vor " + c.z[0] +
          " Minuten hat " + c.p1 + " angefangen zu spielen. Wie viel Uhr war es da?";
      },
      frage: "Antwort als Uhrzeit, zum Beispiel 9:25",
      feld: function (c) {
        var zusammen = c.extra.minuten - c.z[0];
        var stunde = Math.floor(zusammen / 60);
        var minute = zusammen % 60;
        return feld(zusammen, {
          typ: "zeit",
          zeit: { stunde: stunde, minute: minute },
          anzeige: uhrSprechText(stunde, minute)
        });
      }
    },
    {
      id: "uhr-halbe-stunden",
      stufe: 1,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 1, max: 3 }],
      text: function (c) {
        return c.p1 + " darf genau " + c.z[0] + " halbe Stunden spielen. " +
          "Eine halbe Stunde sind 30 Minuten. Wie viele Minuten darf " + c.p1 + " spielen?";
      },
      frage: "Antwort in Minuten",
      losung: function (c) { return 30 * c.z[0]; },
      einheit: "Minuten"
    },
    {
      id: "uhr-ueben-pro-woche",
      stufe: 2,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      tatigkeiten: {
        alltag: ["Blockfl\u00F6te", "Kopfrechnen", "Wikinger-Schach"],
        bluey: ["Klavier", "Krocket", "Trampolin-Spr\u00FCnge"],
        gabby: ["Katzen-Musik", "Zaubertricks", "Backen"],
        doozie: ["Pfoten-Kunstst\u00FCcke", "Apportieren", "T\u00FCrme bauen"]
      },
      zahlen: [{ min: 6, max: 14 }, { min: 3, max: 7 }],
      regeln: function (z) { return z[0] * z[1] <= 100; },
      text: function (c) {
        return c.p1 + " \u00FCbt jeden Tag " + c.z[0] + " Minuten " + c.t1 +
          ". Wie viele Minuten sind das an " + c.z[1] + " Tagen?";
      },
      frage: "Antwort in Minuten",
      losung: function (c) { return c.z[0] * c.z[1]; },
      einheit: "Minuten"
    },
    {
      id: "uhr-zwei-aktivitaeten",
      stufe: 2,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      tatigkeiten: {
        alltag: ["Malen", "Vorlesen", "Basteln"],
        bluey: ["Krocket", "Planschen", "Bauen"],
        gabby: ["Puppentheater", "Tanzen", "Glitzer-Basteln"],
        doozie: ["Suchen und Finden", "Schwimmen", "Knochen vergraben"]
      },
      zahlen: [{ min: 18, max: 45 }, { min: 12, max: 40 }],
      regeln: function (z) { return z[0] + z[1] <= 95; },
      vorbereitung: function () {
        return { stunde: zufall(1, 14), minute: 0 };
      },
      text: function (c) {
        return c.p1 + " macht " + c.z[0] + " Minuten " + c.t1 + " und danach " + c.z[1] +
          " Minuten " + c.t2 + ". Um " + c.extra.stunde + " Uhr hat " + c.p1 +
          " angefangen. Wie viel Uhr ist es jetzt?";
      },
      frage: "Antwort als Uhrzeit, zum Beispiel 3:25",
      feld: function (c) {
        var zusammen = c.z[0] + c.z[1];
        var stunde = c.extra.stunde + Math.floor(zusammen / 60);
        var minute = zusammen % 60;
        return feld(zusammen, {
          typ: "zeit",
          zeit: { stunde: stunde, minute: minute },
          anzeige: uhrSprechText(stunde, minute)
        });
      }
    },
    {
      id: "uhr-film-dauer",
      stufe: 2,
      kategorie: "uhr",
      themen: ["alltag", "bluey", "gabby", "doozie"],
      zahlen: [{ min: 30, max: 55 }],
      vorbereitung: function () {
        return { stunde: zufall(2, 16), minute: waehle([5, 10, 15, 20, 25, 30]) };
      },
      text: function (c) {
        var gesamt = c.extra.minute + c.z[0];
        var endStunde = c.extra.stunde + Math.floor(gesamt / 60);
        var endMinute = gesamt % 60;
        return "Der Zeichentrickfilm lief von " + uhrText(c.extra.stunde, c.extra.minute) +
          " Uhr bis " + uhrText(endStunde, endMinute) + " Uhr. Wie viele Minuten hat er gedauert?";
      },
      frage: "Antwort in Minuten",
      losung: function (c) { return c.z[0]; },
      einheit: "Minuten"
    }
  ];

  var ALLE_WELTEN = ["bluey", "gabby", "doozie", "alltag"];
  var RECHENARTEN = ["Plus (+)", "Minus (−)", "Mal (×)", "Geteilt (÷)", "Eine Angabe fehlt"];

  VORLAGEN.push(
    {
      id: "alter-rueckwaerts", themen: ALLE_WELTEN, stufe: 1, kategorie: "normal",
      zahlen: [{ min: 12, max: 18 }, { min: 2, max: 5 }],
      text: c => c.p1 + " spielt Geburtstag. In der Geschichte ist " + c.p1 + " " + c.z[0] +
        " Jahre alt und damit um " + c.z[1] + " Jahre älter als " + c.p2 + ". Wie alt ist " + c.p2 + "?",
      losung: c => c.z[0] - c.z[1], einheit: "Jahren"
    },
    {
      id: "aufzug-mindestfahrten", themen: ALLE_WELTEN, stufe: 2, kategorie: "normal",
      zahlen: [{ min: 13, max: 36 }, { min: 4, max: 8 }],
      text: c => c.p1 + " zählt vor dem Aufzug " + c.z[0] + " wartende Personen. Pro Fahrt dürfen höchstens " +
        c.z[1] + " Personen einsteigen. Wie oft muss der Aufzug mindestens nach oben fahren, damit alle oben sind?",
      losung: c => Math.ceil(c.z[0] / c.z[1]), einheit: "Fahrten"
    },
    {
      id: "tretboote-volle-gruppen", themen: ALLE_WELTEN, stufe: 2, kategorie: "normal",
      zahlen: [{ min: 13, max: 32 }, { min: 3, max: 6 }],
      regeln: z => z[0] % z[1] !== 0,
      text: c => c.p1 + " teilt " + c.z[0] + " Kinder auf Tretboote auf. In jedes Boot kommen genau " +
        c.z[1] + " Kinder. Nur volle Boote fahren los. Wie viele Kinder bleiben am Steg?",
      losung: c => c.z[0] % c.z[1], einheit: "Kindern"
    },
    {
      id: "zahlenweg-huepfen", themen: ALLE_WELTEN, stufe: 1, kategorie: "normal",
      zahlen: [{ min: 11, max: 34 }, { min: 5, max: 12 }],
      text: c => c.p1 + " hüpft auf einem Zahlenweg. Die ersten drei Landefelder sind " + c.z[0] + ", " +
        (c.z[0] + c.z[1]) + " und " + (c.z[0] + 2 * c.z[1]) +
        ". Die Sprünge sind gleich groß und gehen immer vorwärts. Auf welcher Zahl landet " + c.p1 + " als Nächstes?",
      losung: c => c.z[0] + 3 * c.z[1]
    },
    {
      id: "rechnung-basteltisch", themen: ALLE_WELTEN, stufe: 2, kategorie: "normal",
      zahlen: [{ min: 21, max: 38 }, { min: 4, max: 9 }, { min: 11, max: 18 }],
      text: c => c.p1 + " hat " + c.z[0] + " Bastelperlen. " + c.p1 + " gibt " + c.z[1] +
        " Perlen her und bekommt danach " + c.z[2] + " neue dazu. Welche Rechnung zeigt, wie viele Perlen es jetzt sind?",
      feld: c => {
        var [a, b, d] = c.z;
        return auswahlFeld(a + " − " + b + " + " + d, [
          a + " + " + b + " − " + d, a + " + " + b + " + " + d, a + " − " + b + " − " + d
        ]);
      }
    },
    {
      id: "rechenart-fest", themen: ALLE_WELTEN, stufe: 1, kategorie: "normal",
      zahlen: [{ min: 4, max: 9 }, { min: 2, max: 7 }, { min: 0, max: 4 }],
      text: c => {
        var [a, b, art] = c.z;
        return [
          "Für das Fest bringt " + c.p1 + " " + a + " rote und " + b + " blaue Ballons. Wie viele Ballons sind es zusammen?",
          c.p1 + " hat " + (a + b) + " Ballons. Davon platzen " + b + ". Wie viele sind noch ganz?",
          c.p1 + " schmückt " + a + " Tische mit je " + b + " Ballons. Wie viele Ballons braucht " + c.p1 + "?",
          c.p1 + " verteilt " + (a * b) + " Ballons gleichmäßig auf " + b + " Tische. Wie viele bekommt jeder Tisch?",
          "Für das Fest bringt " + c.p1 + " " + a + " Ballons. Auch " + c.p2 + " bringt Ballons mit. Wie viele sind es zusammen?"
        ][art] + " Wähle die Rechenart oder entscheide, ob eine Angabe fehlt.";
      },
      feld: c => auswahlFeld(RECHENARTEN[c.z[2]], RECHENARTEN.filter((_, i) => i !== c.z[2]))
    },
    {
      id: "geld-riesenrad-gruppe", themen: ALLE_WELTEN, stufe: 2, kategorie: "geld",
      zahlen: [{ min: 7, max: 10 }, { min: 3, max: 6 }, { min: 2, max: 4 }, { min: 2, max: 6 }],
      text: c => c.p1 + " geht mit einer Gruppe zum Riesenrad. Die Karte kostet " + c.z[0] +
        " € pro Erwachsenem und " + c.z[1] + " € pro Kind. Es fahren " + c.z[2] +
        " Erwachsene und " + c.z[3] + " Kinder mit. Wie viel kosten alle Karten zusammen?",
      feld: c => {
        var cent = 100 * (c.z[0] * c.z[2] + c.z[1] * c.z[3]);
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    },
    {
      id: "geld-muenzbeutel", themen: ALLE_WELTEN, stufe: 1, kategorie: "geld",
      zahlen: [{ min: 1, max: 3 }, { min: 1, max: 4 }, { min: 1, max: 4 }],
      text: c => "In der Geldbörse von " + c.p1 + " liegen 20-€-Scheine (" + c.z[0] +
        " Stück), 2-€-Münzen (" + c.z[1] + " Stück) und 50-Cent-Münzen (" + c.z[2] +
        " Stück). Wie viel Geld ist das zusammen?",
      feld: c => {
        var cent = 2000 * c.z[0] + 200 * c.z[1] + 50 * c.z[2];
        return feld(cent, { typ: "geld", geld: { cent: cent }, anzeige: geldText(cent) });
      }
    }
  );

  /* ---------------- Personen zusammenstellen ---------------- */

  function personen(thema, name, verboten) {
    var welt = FIGUREN[thema] || FIGUREN.alltag;
    var sperrt = verboten || [];
    var nutztFigur = welt.mit.length > 0 && Math.random() < 0.5;
    if (nutztFigur) {
      var figuren = welt.mit.filter(function (f) { return sperrt.indexOf(f) < 0; });
      if (figuren.length === 0) {
        figuren = welt.mit;
      }
      var figur = waehle(figuren);
      var andere = welt.freunde.filter(function (f) {
        return f !== figur && sperrt.indexOf(f) < 0;
      });
      return { p1: figur, p2: andere.length ? waehle(andere) : name };
    }
    var freunde = welt.freunde.filter(function (f) {
      return f !== name && sperrt.indexOf(f) < 0;
    });
    if (freunde.length === 0) {
      freunde = [name === "Ben" ? "Mia" : "Ben"];
    }
    return { p1: name, p2: waehle(freunde) };
  }

  /* ---------------- Vorlagen auswählen ---------------- */

  function passtZu(vorlage, thema, stufe, kategorie) {
    return vorlage.themen.indexOf(thema) >= 0 &&
      (stufe === null || vorlage.stufe === stufe) &&
      (kategorie === null || vorlage.kategorie === kategorie);
  }

  function findetVorlage(thema, stufe, kategorie, benutzt, zuletzt) {
    // Kategorie und Schwierigkeit erhalten, bevor der Merkzettel gelockert wird.
    var kategorien = [kategorie, "normal", null];
    for (var k = 0; k < kategorien.length; k++) {
      var stufen = [stufe, null];
      for (var s = 0; s < stufen.length; s++) {
        var treffer = VORLAGEN.filter(function (v) {
          return passtZu(v, thema, stufen[s], kategorien[k]) && !benutzt.has(v.id);
        });
        var frisch = treffer.filter(function (v) { return !zuletzt.has(v.id); });
        if (frisch.length) {
          return waehle(frisch);
        }
        if (treffer.length) {
          var aelteste = Math.max.apply(null, treffer.map(function (v) { return zuletzt.get(v.id); }));
          return waehle(treffer.filter(function (v) { return zuletzt.get(v.id) === aelteste; }));
        }
      }
    }
    return null;
  }

  function modusThemen(modus, anzahl) {
    var themen = [];
    var mischung = modus === "bluey" ? ["bluey"]
      : modus === "gabby" ? ["gabby"]
      : ["doozie"];
    for (var i = 0; i < anzahl; i++) {
      themen.push(mischung[i % mischung.length]);
    }
    return mische(themen);
  }

  /* ---------------- 5 Geschichten für einen Durchgang ---------------- */

  function erzeugeGeschichten(optionen) {
    var opts = optionen || {};
    var anzahl = opts.anzahl || 5;
    var modus = opts.modus || "gemischt";
    var name = opts.name || "Emma";
    var zuletztIds = new Map();
    (opts.zuletzt || []).forEach(function (id, index) {
      if (!zuletztIds.has(id)) { zuletztIds.set(id, index); }
    });
    var benutzt = new Set();

    var zweistufigAnzahl = Math.min(2, anzahl);
    var slots = [];
    var i;
    for (i = 0; i < anzahl; i++) {
      slots.push({ stufe: i < anzahl - zweistufigAnzahl ? 1 : 2, kategorie: "normal" });
    }
    var positionen = mische(range(anzahl));
    if (anzahl >= 2) {
      slots[positionen[0]].kategorie = "geld";
      slots[positionen[1]].kategorie = "uhr";
    }
    slots = mische(slots);

    var themen = modusThemen(modus, anzahl);
    var geschichten = [];

    for (i = 0; i < slots.length; i++) {
      var thema = themen[i];
      var vorlage = findetVorlage(thema, slots[i].stufe, slots[i].kategorie, benutzt, zuletztIds);
      if (!vorlage) {
        continue;
      }
      benutzt.add(vorlage.id);

      var zahlen = null;
      for (var versuch = 0; versuch < 600 && zahlen === null; versuch++) {
        var wurfe = vorlage.zahlen.map(function (bereich) {
          return zufall(bereich.min, bereich.max);
        });
        if (!vorlage.regeln || vorlage.regeln(wurfe)) {
          zahlen = wurfe;
        }
      }
      if (!zahlen) {
        continue;
      }

      var leute = personen(thema, name, vorlage.kategorie === "geld" ? BABY_FIGUREN : []);
      var sache = "";
      if (vorlage.sache) {
        sache = waehle(vorlage.sache[thema] || vorlage.sache.alltag);
      }
      var tatigkeiten = [];
      if (vorlage.tatigkeiten) {
        var pool = mische(vorlage.tatigkeiten[thema] || vorlage.tatigkeiten.alltag);
        tatigkeiten = [pool[0], pool[1] !== pool[0] ? pool[1] : pool[0]];
      }
      var extra = {};
      if (vorlage.vorbereitung) {
        var vor = vorlage.vorbereitung();
        extra.stunde = vor.stunde;
        extra.minute = vor.minute;
        extra.minuten = vor.stunde * 60 + vor.minute;
        extra.uhrText = uhrText(vor.stunde, vor.minute);
        extra.uhrSprech = uhrSprechText(vor.stunde, vor.minute);
      }
      var kontext = {
        name: name,
        thema: thema,
        p1: leute.p1,
        p2: leute.p2,
        sache: sache,
        t1: tatigkeiten[0] || "",
        t2: tatigkeiten[1] || "",
        z: zahlen,
        extra: extra
      };

      laufendeNummer += 1;
      geschichten.push({
        ident: "geschichte-" + laufendeNummer,
        bereich: "geschichte",
        art: "geschichte",
        layout: "text",
        darstellung: "",
        text: vorlage.text(kontext),
        frage: vorlage.frage || "",
        vorlage: vorlage.id,
        thema: thema,
        schluessel: "geschichte|" + vorlage.id,
        felder: [vorlage.feld ? vorlage.feld(kontext) : feld(vorlage.losung(kontext), { einheit: vorlage.einheit || "" })]
      });
    }

    return geschichten;
  }

  function range(anzahl) {
    var liste = [];
    for (var i = 0; i < anzahl; i++) {
      liste.push(i);
    }
    return liste;
  }

  function vorlagenIds() {
    return VORLAGEN.map(function (v) { return v.id; });
  }

  return {
    FIGUREN: FIGUREN,
    VORLAGEN: VORLAGEN,
    erzeugeGeschichten: erzeugeGeschichten,
    vorlagenIds: vorlagenIds
  };
});
