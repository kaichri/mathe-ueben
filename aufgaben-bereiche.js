/* ------------------------------------------------------------------
   aufgaben-bereiche.js
   Erzeugt die Rechenaufgaben für die 3. Klasse Volksschule.

   Regeln für alle Aufgaben:
   - alle Zahlen und Ergebnisse im Raum 100
   - keine negativen Ergebnisse
   - Divisionen ohne Rest gehen wirklich ohne Rest auf
   - bei Divisionen mit Rest ist der Rest immer kleiner als der Teiler
   - keine doppelten Aufgaben in einem Durchgang
   ------------------------------------------------------------------ */
(function (umgebung, factory) {
  "use strict";
  var modul = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = modul;
  } else {
    umgebung.AUFGABEN = modul;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var LUECKE = "\u25A1"; // □

  var VORGABEN = {
    add: 10,
    sub: 10,
    mul: 10,
    div: 10,
    raetsel: 5,
    anzahlAddDreiZahlen: 3,
    anzahlSubKetten: 3,
    divisionMitRestAktiv: true,
    umkehrPaare: 3
  };

  /* ---------------- kleine Helfer ---------------- */

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

  function teiler(zahl, von, bis) {
    var treffer = [];
    for (var d = von; d <= bis; d++) {
      if (zahl % d === 0) {
        treffer.push(d);
      }
    }
    return treffer;
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

  function karte(bereich, art, darstellung, felder, extra) {
    laufendeNummer += 1;
    var opts = extra || {};
    return {
      ident: "aufgabe-" + laufendeNummer,
      bereich: bereich,
      art: art,
      darstellung: darstellung,
      layout: opts.layout || "einfach",
      text: opts.text || "",
      schluessel: opts.schluessel || bereich + "|" + darstellung,
      felder: felder
    };
  }

  /* ---------------- Addition ---------------- */

  function additionUebertrag() {
    var a = zufall(13, 88);
    var b = zufall(13, 88);
    if (a + b > 100) {
      return null;
    }
    if (a % 10 + b % 10 < 11) {
      return null; // ohne Übertrag wäre für die 3. Klasse zu leicht
    }
    return karte("add", "addition", a + " + " + b + " =", [feld(a + b)]);
  }

  function additionDreiZahlen() {
    var a = zufall(11, 44);
    var b = zufall(11, 38);
    var c = zufall(4, 17);
    if (a + b + c > 100) {
      return null;
    }
    if (a % 10 + b % 10 < 11 && b % 10 + c % 10 < 11) {
      return null; // mindestens ein Übertrag soll vorkommen
    }
    return karte("add", "addition-drei", a + " + " + b + " + " + c + " =", [feld(a + b + c)]);
  }

  /* ---------------- Subtraktion ---------------- */

  function subtraktionBorgen() {
    var a = zufall(31, 98);
    var b = zufall(13, 79);
    if (a - b < 3) {
      return null;
    }
    if (a % 10 >= b % 10) {
      return null; // Zehnerübergang (Borgen) muss nötig sein
    }
    return karte("sub", "subtraktion", a + " \u2212 " + b + " =", [feld(a - b)]);
  }

  function subtraktionKette() {
    if (Math.random() < 0.5) {
      var a = zufall(45, 99);
      var b = zufall(13, 40);
      var c = zufall(6, 25);
      if (a - b - c < 3 || a % 10 >= b % 10) {
        return null;
      }
      return karte("sub", "subtraktion-kette", a + " \u2212 " + b + " \u2212 " + c + " =", [feld(a - b - c)]);
    }
    var x = zufall(34, 88);
    var y = zufall(15, 45);
    var z = zufall(6, 20);
    if (x - y < 2 || x - y + z > 100 || x % 10 >= y % 10) {
      return null;
    }
    return karte("sub", "subtraktion-kette", x + " \u2212 " + y + " + " + z + " =", [feld(x - y + z)]);
  }

  /* ---------------- Multiplikation ---------------- */

  function multiplikationEinmaleins() {
    var a = zufall(3, 9);
    var b = zufall(3, 10);
    var k = karte("mul", "einmaleins", a + " \u00D7 " + b + " =", [feld(a * b)]);
    k.umkehrbar = { erster: a, zweiter: b };
    return k;
  }

  function multiplikationZehner() {
    var zehner = waehle([10, 20, 30, 40, 50]);
    var einstieg = zufall(2, 4);
    if (zehner * einstieg > 100) {
      return null;
    }
    var paar = Math.random() < 0.5 ? [zehner, einstieg] : [einstieg, zehner];
    var k = karte("mul", "zehnermaleins", paar[0] + " \u00D7 " + paar[1] + " =", [feld(zehner * einstieg)]);
    k.umkehrbar = { erster: einstieg, zweiter: zehner };
    return k;
  }

  function multiplikationHalbschriftlich() {
    var zweistellig = zufall(12, 29);
    var einstieg = zufall(3, 4);
    if (zweistellig * einstieg > 100 || zweistellig % 10 === 0) {
      return null;
    }
    var k = karte("mul", "halbschriftlich", zweistellig + " \u00D7 " + einstieg + " =", [feld(zweistellig * einstieg)]);
    k.umkehrbar = { erster: einstieg, zweiter: zweistellig };
    return k;
  }

  function haengeUmkehraufgaben(an, aufgaben) {
    var kandidaten = mische(aufgaben.filter(function (k) {
      return k.umkehrbar && k.umkehrbar.erster > 1 && k.umkehrbar.zweiter > 1;
    })).slice(0, an);
    kandidaten.forEach(function (k) {
      haengeUmkehraufgabeAn(k);
    });
  }

  function haengeUmkehraufgabeAn(k) {
    var u = k.umkehrbar;
    var produkt = u.erster * u.zweiter;
    k.felder.push(feld(u.zweiter, {
      darstellung: produkt + " \u00F7 " + u.erster + " =",
      beschriftung: "Umkehraufgabe"
    }));
  }

  /* ---------------- Division ---------------- */

  function divisionEinmaleins() {
    var a = zufall(3, 9);
    var b = zufall(3, 10);
    return karte("div", "division", a * b + " \u00F7 " + a + " =", [feld(b)]);
  }

  function divisionGlatteZahlen() {
    var dividend = waehle([20, 30, 40, 50, 60, 70, 80, 90, 100]);
    var moeglich = teiler(dividend, 2, 10).filter(function (d) {
      return dividend / d >= 3 && dividend / d <= 50;
    });
    if (moeglich.length === 0) {
      return null;
    }
    var d = waehle(moeglich);
    return karte("div", "division-zehner", dividend + " \u00F7 " + d + " =", [feld(dividend / d)]);
  }

  function divisionZweistelligOhneRest() {
    var d = zufall(3, 9);
    var q = zufall(12, 29);
    if (d * q > 100 || q % 10 === 0) {
      return null;
    }
    return karte("div", "division-zweistellig", d * q + " \u00F7 " + d + " =", [feld(q)]);
  }

  function divisionMitRestBauen() {
    var d = zufall(3, 9);
    var q = zufall(4, 11);
    var r = zufall(1, d - 1);
    var dividend = d * q + r;
    if (dividend > 100) {
      return null;
    }
    return karte("div", "division-rest", dividend + " \u00F7 " + d + " =", [
      feld(q),
      feld(r, { beschriftung: "Rest" })
    ], { layout: "rest" });
  }

  /* ---------------- Zahlenrätsel mit □ ---------------- */

  function raetselAddition() {
    var loesung = zufall(13, 74);
    var b = zufall(11, 26);
    if (loesung + b > 100) {
      return null;
    }
    var text = Math.random() < 0.5
      ? LUECKE + " + " + b + " = " + (loesung + b)
      : b + " + " + LUECKE + " = " + (loesung + b);
    return karte("raetsel", "luecke-addition", text, [feld(loesung, { beschriftung: LUECKE + " = " })], { layout: "luecke" });
  }

  function raetselSubtraktion() {
    var a = zufall(12, 60);
    var b = zufall(11, 38);
    var gesamt = a + b;
    if (gesamt > 100) {
      return null;
    }
    if (Math.random() < 0.5) {
      // gesamt − □ = a   ->   □ = b
      return karte("raetsel", "luecke-subtraktion", gesamt + " \u2212 " + LUECKE + " = " + a,
        [feld(b, { beschriftung: LUECKE + " = " })], { layout: "luecke" });
    }
    // □ − b = a   ->   □ = a + b
    return karte("raetsel", "luecke-subtraktion", LUECKE + " \u2212 " + b + " = " + a,
      [feld(gesamt, { beschriftung: LUECKE + " = " })], { layout: "luecke" });
  }

  function raetselMultiplikation() {
    var a = zufall(3, 9);
    var b = zufall(3, 10);
    var produkt = a * b;
    if (produkt > 100) {
      return null;
    }
    if (Math.random() < 0.5) {
      // □ × a = produkt   ->   □ = b
      return karte("raetsel", "luecke-multiplikation", LUECKE + " \u00D7 " + a + " = " + produkt,
        [feld(b, { beschriftung: LUECKE + " = " })], { layout: "luecke" });
    }
    // a × □ = produkt   ->   □ = b
    return karte("raetsel", "luecke-multiplikation", a + " \u00D7 " + LUECKE + " = " + produkt,
      [feld(b, { beschriftung: LUECKE + " = " })], { layout: "luecke" });
  }

  function raetselDivision() {
    var a = zufall(3, 9);
    var b = zufall(3, 10);
    var produkt = a * b;
    if (produkt > 100) {
      return null;
    }
    if (Math.random() < 0.5) {
      // produkt ÷ □ = b   ->   □ = a
      return karte("raetsel", "luecke-division", produkt + " \u00F7 " + LUECKE + " = " + b,
        [feld(a, { beschriftung: LUECKE + " = " })], { layout: "luecke" });
    }
    // produkt ÷ a = □   ->   □ = b
    return karte("raetsel", "luecke-division", produkt + " \u00F7 " + a + " = " + LUECKE,
      [feld(b, { beschriftung: LUECKE + " = " })], { layout: "luecke" });
  }

  function zahlerraetsel() {
    return waehle([raetselAddition, raetselSubtraktion, raetselMultiplikation, raetselDivision])();
  }

  /* ---------------- Bonus-Knobelaufgaben (zählen nicht mit) ---------------- */

  /* Die Knobel-Figuren nach Welten – so tauchen in Doozies Hundehaus
     auch die Hundehaus-Figuren auf und nicht nur Blueys Familie. */
  var KNOBEL_FIGUREN = {
    gemischt: ["Bluey", "Bingo", "Gabby", "Kuchi", "Marty", "Chloe",
      "Mackenzie", "Winton", "Rusty", "Pandy", "Kitty Fee", "Snickers"],
    bluey: ["Bluey", "Bingo", "Muffin", "Socks", "Bandit", "Chilli", "Rusty",
      "Chloe", "Mackenzie", "Winton", "Snickers", "Indy", "Coco", "Honey"],
    gabby: ["Gabby", "Pandy", "Kuchi", "Meerkatze", "Kitty Fee", "Carlita",
      "Ratkatz", "Marty", "DJ Katzenminze", "Baby Box", "Kuschelkatze"],
    doozie: ["Doozie", "Puggie", "Sahnepf\u00F6tchen", "Bastelpf\u00F6tchen", "Pogi",
      "Crouton", "Seaquin", "DreamPup", "PixiePup", "GamePup", "Swaggy"]
  };

  var KNOBEL_SACHE = {
    gemischt: ["Muscheln", "Sticker", "B\u00E4lle", "Kekse"],
    bluey: ["Muscheln", "St\u00F6cke", "Tenndis-B\u00E4lle", "Kekse"],
    gabby: ["Stern-Sticker", "Cakey-Kekse", "Glitzersteine", "Cupcakes"],
    doozie: ["Leckerlis", "Knochen-Kekse", "Quietschb\u00E4lle", "Pfoten-Abzeichen"]
  };

  function knobelFiguren(welt) {
    return KNOBEL_FIGUREN[welt] || KNOBEL_FIGUREN.gemischt;
  }

  function knobelSache(welt) {
    return KNOBEL_SACHE[welt] || KNOBEL_SACHE.gemischt;
  }

  // "Ich denke mir eine Zahl ..." – Rückwärtsrechnen
  function knobelaufgabeDenkmal() {
    var variante = zufall(1, 4);
    if (variante === 1) {
      var kleine = zufall(6, 24);
      return karte("bonus", "knobel-halb", "", [feld(kleine * 2)], {
        layout: "text",
        text: "Ich denke mir eine Zahl. Die H\u00e4lfte davon ist " + kleine + ". Welche Zahl meine ich?",
        frage: "Welche Zahl?",
        schluessel: "knobel-halb|" + kleine
      });
    }
    if (variante === 2) {
      var mittel = zufall(8, 32);
      return karte("bonus", "knobel-verdoppelt", "", [feld(mittel)], {
        layout: "text",
        text: "Ich denke mir eine Zahl. Wenn ich sie verdopple, bekomme ich " + (mittel * 2) + ". Welche Zahl meine ich?",
        frage: "Welche Zahl?",
        schluessel: "knobel-verdoppelt|" + mittel
      });
    }
    if (variante === 3) {
      var abzug = zufall(12, 45);
      var rest = zufall(7, 30);
      return karte("bonus", "knobel-minus", "", [feld(abzug + rest)], {
        layout: "text",
        text: "Ich denke mir eine Zahl. Ich ziehe " + abzug + " ab, dann bleiben " + rest +
          " \u00fcbrig. Welche Zahl meine ich?",
        frage: "Welche Zahl?",
        schluessel: "knobel-minus|" + abzug + "|" + rest
      });
    }
    var faktor = waehle([3, 4, 5]);
    var passend = zufall(4, 12);
    return karte("bonus", "knobel-mal", "", [feld(passend)], {
      layout: "text",
      text: "Ich denke mir eine Zahl. Wenn ich sie mit " + faktor + " multipliziere, kommt " + (faktor * passend) + ". Welche Zahl meine ich?",
      frage: "Welche Zahl?",
      schluessel: "knobel-mal|" + faktor + "|" + passend
    });
  }

  // Zahlenreihe: Welche Zahl kommt als Nächstes?
  function knobelaufgabeReihe() {
    var art = zufall(1, 5);
    var reihe = [];
    var loesung;
    var i;
    if (art === 1) { // gleichmäßiger Schritt
      var start = zufall(2, 15);
      var schritt = zufall(3, 9);
      for (i = 0; i < 5; i++) {
        reihe.push(start + i * schritt);
      }
      loesung = start + 5 * schritt;
    } else if (art === 2) { // Verdoppeln
      var anfang = zufall(2, 4);
      for (i = 0; i < 5; i++) {
        reihe.push(anfang * Math.pow(2, i));
      }
      loesung = anfang * Math.pow(2, 5);
      if (loesung > 100) {
        return null;
      }
    } else if (art === 3) { // immer ein Stück mehr
      var basis = zufall(3, 12);
      var schrittchen = zufall(2, 4);
      var aktuell = basis;
      var zuSchritt = schrittchen;
      for (i = 0; i < 5; i++) {
        reihe.push(aktuell);
        aktuell += zuSchritt;
        zuSchritt += 1;
      }
      loesung = aktuell;
    } else if (art === 4) { // rückwärts
      var oben = zufall(50, 95);
      var runter = zufall(4, 9);
      for (i = 0; i < 5; i++) {
        reihe.push(oben - i * runter);
      }
      loesung = oben - 5 * runter;
    } else { // immer halbieren
      var groesser = waehle([64, 96]);
      reihe = [groesser, groesser / 2, groesser / 4, groesser / 8, groesser / 16];
      loesung = groesser / 32;
    }
    if (loesung < 2 || loesung > 100) {
      return null;
    }
    return karte("bonus", "knobel-reihe", "", [feld(loesung)], {
      layout: "text",
      text: "Wie heißt die nächste Zahl?  " + reihe.join(", ") + ", \u25A1",
      frage: "Nächste Zahl:",
      schluessel: "knobel-reihe|" + reihe.join(",")
    });
  }

  // Kleine Geschichten mit zwei Schritten (Figuren aus der passenden Welt)
  function knobelaufgabeGeschichte(welt) {
    var figuren = mische(knobelFiguren(welt));
    var person = figuren[0];
    var person2 = figuren[1];
    var sache = waehle(knobelSache(welt));
    var variante = zufall(1, 3);
    if (variante === 1) {
      var gerade = zufall(4, 12) * 2; // 8 .. 24
      return karte("bonus", "knobel-geschichte-haelfte", "", [feld(gerade * 2)], {
        layout: "text",
        text: person + " hat " + gerade + " " + sache + ". Das ist genau die H\u00e4lfte von dem, was " +
          person2 + " hat. Wie viele " + sache + " hat " + person2 + "?",
        frage: "Wie viele " + sache + "?",
        schluessel: "knobel-geschichte-haelfte|" + sache + "|" + gerade
      });
    }
    if (variante === 2) {
      var groesse = zufall(15, 48);
      var geschenkt = zufall(4, groesse - 4);
      return karte("bonus", "knobel-geschichte-verdoppelt", "", [feld(groesse * 2 - geschenkt)], {
        layout: "text",
        text: person + " hat " + groesse + " " + sache + " und bekommt noch einmal genauso viele dazu. " +
          "Dann verschenkt " + person + " " + geschenkt + " St\u00fcck an " + person2 +
          ". Wie viele " + sache + " hat " + person + " jetzt?",
        frage: "Wie viele " + sache + "?",
        schluessel: "knobel-geschichte-verdoppelt|" + sache + "|" + groesse + "|" + geschenkt
      });
    }
    var klein = zufall(6, 20);
    var weg = zufall(3, 2 * klein);
    if (4 * klein > 100 || 4 * klein - weg < 2) {
      return null;
    }
    return karte("bonus", "knobel-geschichte-dreifach", "", [feld(4 * klein - weg)], {
      layout: "text",
      text: person + " hat " + klein + " " + sache + " und " + person2 + " hat das Dreifache davon. " +
        "Zusammen verschenken sie " + weg + " St\u00fcck. Wie viele " + sache +
        " haben sie dann noch zusammen?",
      frage: "Wie viele " + sache + "?",
      schluessel: "knobel-geschichte-dreifach|" + sache + "|" + klein + "|" + weg
    });
  }

  /* ---------------- Neue Knobelaufgaben (mehr Abwechslung) ---------------- */

  // Alter vergleichen: der Abstand bleibt immer gleich
  function knobelaufgabeAlter(welt) {
    var figuren = mische(knobelFiguren(welt));
    var person = figuren[0];
    var person2 = figuren[1];
    var jung = zufall(3, 10);
    var abstand = zufall(3, 9);
    var spaeter = zufall(3, 10);
    return karte("bonus", "knobel-alter", "", [feld(jung + abstand + spaeter)], {
      layout: "text",
      text: person2 + " ist " + jung + " Jahre alt. " + person + " ist " + abstand +
        " Jahre \u00e4lter. Wie viele Jahre alt ist " + person + " in " + spaeter + " Jahren?",
      frage: "Wie viele Jahre?",
      schluessel: "knobel-alter|" + person2 + "|" + jung + "|" + abstand + "|" + spaeter
    });
  }

  // Waage-Gleichung: welche Zahl steckt im □?
  function knobelaufgabeGleichung() {
    var a = zufall(6, 19);
    var b = zufall(6, 19);
    var c = zufall(6, a + b - 6);
    var loesung = a + b - c;
    if (loesung < 2 || loesung > 40 || loesung === a || loesung === b || loesung === c) {
      return null;
    }
    return karte("bonus", "knobel-gleichung", "", [feld(loesung)], {
      layout: "text",
      text: "Welche Zahl steckt im \u25A1?   " + a + " + " + b + " = " + c + " + \u25A1",
      frage: "Zahl im \u25A1:",
      schluessel: "knobel-gleichung|" + a + "|" + b + "|" + c
    });
  }

  // Zwei Schritte r\u00fcckw\u00e4rts: erst plus, dann mal
  function knobelaufgabeZweiSchritt() {
    var faktor = waehle([2, 3, 4]);
    var gedacht = zufall(3, Math.min(18, Math.floor(24 / faktor) + 6));
    var plus = zufall(4, 15);
    var ergebnis = (gedacht + plus) * faktor;
    if (ergebnis > 100) {
      return null;
    }
    return karte("bonus", "knobel-zwei-schritt", "", [feld(gedacht)], {
      layout: "text",
      text: "Ich denke mir eine Zahl. Erst rechne ich plus " + plus + ", dann mal " + faktor +
        ". Es kommt " + ergebnis + " heraus. Welche Zahl hatte ich im Kopf?",
      frage: "Welche Zahl?",
      schluessel: "knobel-zwei-schritt|" + plus + "|" + faktor + "|" + ergebnis
    });
  }

  // Einkaufen: mit welchem Geldst\u00fcck wurde bezahlt?
  function knobelaufgabeKauf(welt) {
    var figuren = mische(knobelFiguren(welt));
    var person = figuren[0];
    var preis = zufall(23, 88);
    if (preis % 10 === 0 || preis === 50) {
      preis += 3;
    }
    var schein = preis < 50 ? 50 : 100;
    var zurueck = schein - preis;
    return karte("bonus", "knobel-kauf", "", [feld(schein)], {
      layout: "text",
      text: person + " kauft ein Spielzeug f\u00fcr " + preis + " \u20ac und bekommt " + zurueck +
        " \u20ac zur\u00fcck. Mit welchem Geldst\u00fcck hat " + person + " bezahlt?",
      frage: "Welcher Betrag?",
      schluessel: "knobel-kauf|" + preis + "|" + zurueck
    });
  }

  // Zaun ums Rechteck: die beiden anderen Seiten
  function knobelaufgabeViereck() {
    var a = zufall(7, 24);
    var b = zufall(7, 24);
    var umfang = 2 * (a + b);
    if (umfang > 100) {
      return null;
    }
    return karte("bonus", "knobel-viereck", "", [feld(a + b)], {
      layout: "text",
      text: "Um ein Rechteck l\u00e4uft ein Zaun. Zwei Seiten sind " + a + " m und " + b +
        " m lang, der ganze Zaun ist " + umfang + " m. Wie lang sind die beiden anderen Seiten zusammen?",
      frage: "Beide Seiten zusammen:",
      schluessel: "knobel-viereck|" + a + "|" + b
    });
  }

  // Verdreifacht zur\u00fcckdenken
  function knobelaufgabeVerdreifacht() {
    var zahl = waehle([3, 4, 5, 6, 7, 8, 9, 12]);
    return karte("bonus", "knobel-verdreifacht", "", [feld(zahl)], {
      layout: "text",
      text: "Ich denke mir eine Zahl. Wenn ich sie verdreifache, bekomme ich " + (zahl * 3) +
        ". Welche Zahl meine ich?",
      frage: "Welche Zahl?",
      schluessel: "knobel-verdreifacht|" + zahl
    });
  }

  // anzahl Knobelaufgaben f\u00fcr den Bonusbereich holen.
  // welt: Figuren der aktuellen Welt, zuletzt: Schl\u00fcssel der letzten Knobelaufgaben
  // (damit sich nicht jede Woche dieselben R\u00e4tsel wiederholen).
  function erzeugeBonus(anzahl, welt, zuletzt) {
    var gewuenscht = anzahl || 3;
    var benutzt = new Set(zuletzt || []);
    var generatoren = mische([
      function () { return knobelaufgabeDenkmal(); },
      function () { return knobelaufgabeReihe(); },
      function () { return knobelaufgabeGeschichte(welt); },
      function () { return knobelaufgabeAlter(welt); },
      function () { return knobelaufgabeGleichung(); },
      function () { return knobelaufgabeZweiSchritt(); },
      function () { return knobelaufgabeKauf(welt); },
      function () { return knobelaufgabeViereck(); },
      function () { return knobelaufgabeVerdreifacht(); }
    ]);
    var liste = [];
    var stelle = 0;
    var runden = 0;
    // Erst jede Art einmal durchprobieren – so kommen verschiedene R\u00e4tseltypen.
    while (liste.length < gewuenscht && runden < 3) {
      var bauen = generatoren[stelle % generatoren.length];
      stelle += 1;
      if (stelle % generatoren.length === 0) {
        runden += 1;
      }
      var k = null;
      var versuche = 0;
      while (!k && versuche < 80) {
        versuche += 1;
        k = bauen();
      }
      if (k && !benutzt.has(k.schluessel)) {
        benutzt.add(k.schluessel);
        liste.push(k);
      }
    }
    // Wenn der Merkzettel zu voll war: noch einmal ohne Merkzettel suchen.
    var notversuche = 0;
    while (liste.length < gewuenscht && notversuche < 40000) {
      notversuche += 1;
      var rettung = generatoren[notversuche % generatoren.length]();
      if (!rettung) {
        continue;
      }
      var doppelt = liste.some(function (alt) { return alt.schluessel === rettung.schluessel; });
      if (!doppelt) {
        liste.push(rettung);
      }
    }
    if (liste.length < gewuenscht) {
      throw new Error("Es konnten nicht genug Knobelaufgaben gebaut werden (" + gewuenscht + " erwartet).");
    }
    return liste;
  }

  /* ---------------- eine komplette Runde bauen ---------------- */

  function sammle(anzahl, baue, benutzt, ausschluss) {
    var liste = [];
    var ersatz = new Map();
    var versuche = 0;
    while (liste.length < anzahl && versuche < 40000) {
      versuche += 1;
      var k = baue();
      if (!k) {
        continue;
      }
      if (benutzt.has(k.schluessel)) {
        continue;
      }
      if (ausschluss.has(k.schluessel)) {
        ersatz.set(k.schluessel, k);
        continue;
      }
      benutzt.add(k.schluessel);
      liste.push(k);
    }
    // Erst neue Aufgaben ausschöpfen; nur fehlende Plätze mit den am
    // längsten zurückliegenden Aufgaben füllen. Innerhalb der Runde nie doppeln.
    var kandidaten = Array.from(ersatz.values()).sort(function (a, b) {
      return ausschluss.get(a.schluessel) - ausschluss.get(b.schluessel);
    });
    for (var i = 0; liste.length < anzahl && i < kandidaten.length; i++) {
      benutzt.add(kandidaten[i].schluessel);
      liste.push(kandidaten[i]);
    }
    if (liste.length < anzahl) {
      throw new Error("Es konnten nicht genug Aufgaben gebaut werden (" + anzahl + " erwartet).");
    }
    return liste;
  }

  function erzeugeRunde(optionen) {
    var v = {}, schluessel;
    for (schluessel in VORGABEN) {
      if (Object.prototype.hasOwnProperty.call(VORGABEN, schluessel)) {
        v[schluessel] = VORGABEN[schluessel];
      }
    }
    var wuesche = optionen || {};
    for (schluessel in wuesche) {
      if (Object.prototype.hasOwnProperty.call(wuesche, schluessel)) {
        v[schluessel] = wuesche[schluessel];
      }
    }

    var nummerVorher = laufendeNummer;
    try {
      var benutzt = new Set();
      // Reihenfolge: älteste zuerst; bei mehrfachen Einträgen zählt der jüngste.
      var ausschuss = wuesche.ausschliessen || [];
      var ausschluss = new Map();
      for (var a = 0; a < ausschuss.length; a++) {
        ausschluss.set(ausschuss[a], a);
      }
      function sammeln(anzahl, baue) {
        return sammle(anzahl, baue, benutzt, ausschluss);
      }

      var addAufgaben = sammeln(v.add - v.anzahlAddDreiZahlen, additionUebertrag)
        .concat(sammeln(v.anzahlAddDreiZahlen, additionDreiZahlen));

      var subAufgaben = sammeln(v.sub - v.anzahlSubKetten, subtraktionBorgen)
        .concat(sammeln(v.anzahlSubKetten, subtraktionKette));

      var mulAufgaben = sammeln(4, multiplikationEinmaleins)
        .concat(sammeln(3, multiplikationZehner))
        .concat(sammeln(v.mul - 7, multiplikationHalbschriftlich));
      haengeUmkehraufgaben(v.umkehrPaare, mulAufgaben);

      var divSpezial = v.divisionMitRestAktiv ? divisionMitRestBauen : divisionZweistelligOhneRest;
      var divAufgaben = sammeln(3, divisionEinmaleins)
        .concat(sammeln(3, divisionGlatteZahlen))
        .concat(sammeln(v.div - 6, divSpezial));

      var raetselAufgaben = sammeln(v.raetsel, zahlerraetsel);

      var bereiche = [
        { bereich: "add", titel: "Addition", untertitel: "Rechne mit Übertrag.", aufgaben: mische(addAufgaben) },
        { bereich: "sub", titel: "Subtraktion", untertitel: "Hier musst du borgen.", aufgaben: mische(subAufgaben) },
        { bereich: "mul", titel: "Multiplikation", untertitel: "Einmaleins, Zehnermaleins und halbschriftlich.", aufgaben: mische(mulAufgaben) },
        { bereich: "div", titel: "Division", untertitel: v.divisionMitRestAktiv
          ? "Einige Aufgaben haben einen Rest."
          : "Alle Aufgaben gehen ohne Rest auf.", aufgaben: mische(divAufgaben) },
        { bereich: "raetsel", titel: "Zahlenrätsel", untertitel: "Welche Zahl steckt hinter dem □?", aufgaben: mische(raetselAufgaben) }
      ];

      var alle = [];
      bereiche.forEach(function (b) {
        alle = alle.concat(b.aufgaben);
      });

      return { bereiche: bereiche, aufgaben: alle, anzahl: alle.length };
    } catch (fehler) {
      // Keine internen Kennungen einer fehlgeschlagenen Teilrunde behalten.
      laufendeNummer = nummerVorher;
      throw fehler;
    }
  }

  return {
    VORGABEN: VORGABEN,
    erzeugeRunde: erzeugeRunde,
    erzeugeBonus: erzeugeBonus
  };
});
