/* ------------------------------------------------------------------
   deutsch-uebungen.js
   5 selbstständige Deutsch-Übungen für die 3. Klasse Volksschule:
     1. rechtschreibung – Rechtschreib-Detektiv (Groß/Klein, ie/i, ck/tz, b/d/g, ä/äu)
     2. wortarten       – Namenwort (Nomen), Tunwort (Verb), Wiewort (Adjektiv)
     3. satzbau         – Satzbau-Puzzle (Wortkarten richtig ordnen)
     4. lesen           – Leseverständnis (kurze Welt-Geschichten + 3 Fragen)
     5. worttraining    – Gegenteile, Einzahl/Mehrzahl, Wortfamilien & Vergangenheit
   ------------------------------------------------------------------ */
(function (umgebung, factory) {
  "use strict";
  var modul = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = modul;
  } else {
    umgebung.DEUTSCH_UEBUNGEN = modul;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var THEMEN = [
    {
      id: "rechtschreibung",
      symbol: "🔍",
      titel: "Rechtschreib-Detektiv",
      kurz: "Groß/Klein, ie/i, ck/tz, b/p, d/t, g/k und ä/äu knacken",
      anzahl: 8
    },
    {
      id: "wortarten",
      symbol: "🏷️",
      titel: "Wortarten sortieren",
      kurz: "Namenwort (Nomen), Tunwort (Verb) und Wiewort (Adjektiv)",
      anzahl: 8
    },
    {
      id: "satzbau",
      symbol: "🧩",
      titel: "Satzbau-Puzzle",
      kurz: "Wortkarten in der richtigen Reihenfolge zu Sätzen legen",
      anzahl: 6
    },
    {
      id: "lesen",
      symbol: "📖",
      titel: "Leseverständnis",
      kurz: "Eine kurze Geschichte selbst lesen und Fragen beantworten",
      anzahl: 1
    },
    {
      id: "worttraining",
      symbol: "✨",
      titel: "Wort-Training",
      kurz: "Gegenteile, Einzahl/Mehrzahl, Wortfamilien und Vergangenheit",
      anzahl: 8
    }
  ];

  var WORTARTEN_LABELS = [
    "Namenwort (Nomen)",
    "Tunwort (Verb)",
    "Wiewort (Adjektiv)"
  ];

  function zufall(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  /* ---------------- 1. Rechtschreib-Detektiv (70 Aufgaben) ---------------- */

  var RECHTSCHREIBUNG = [
    // Groß- und Kleinschreibung (14)
    { regel: "Groß oder klein?", satz: "Der kleine ___ rennt über die Wiese.", optionen: ["Hund", "hund"], richtig: 0, erklaerung: "„der Hund“ ist ein Namenwort (Nomen) – Namenwörter schreibt man groß." },
    { regel: "Groß oder klein?", satz: "Im Garten ___ bunte Blumen.", optionen: ["Blühen", "blühen"], richtig: 1, erklaerung: "„blühen“ ist ein Tunwort (Verb) – Tunwörter schreibt man im Satz klein." },
    { regel: "Groß oder klein?", satz: "Meine ___ hat heute Geburtstag.", optionen: ["Freundin", "freundin"], richtig: 0, erklaerung: "„die Freundin“ ist ein Namenwort (Nomen) und wird großgeschrieben." },
    { regel: "Groß oder klein?", satz: "Der Schneemann hat eine ___ Nase.", optionen: ["Lange", "lange"], richtig: 1, erklaerung: "„lange“ ist ein Wiewort (Adjektiv) – Wiewörter schreibt man klein." },
    { regel: "Groß oder klein?", satz: "Am Abend lesen wir eine spannende ___.", optionen: ["Geschichte", "geschichte"], richtig: 0, erklaerung: "„die Geschichte“ ist ein Namenwort (Nomen) – mit Begleiter „eine“ groß." },
    { regel: "Groß oder klein?", satz: "Der Hamster frisst ___ einen Sonnenblumenkern.", optionen: ["Schnell", "schnell"], richtig: 1, erklaerung: "„schnell“ beschreibt, wie er frisst (Wiewort) → kleingeschrieben." },
    { regel: "Groß oder klein?", satz: "Die ___ über das Geschenk ist riesig.", optionen: ["Freude", "freude"], richtig: 0, erklaerung: "„die Freude“ ist ein Namenwort (Gefühl mit Begleiter „die“) → großgeschrieben." },
    { regel: "Groß oder klein?", satz: "Alle Kinder ___ auf dem Spielplatz.", optionen: ["Klettern", "klettern"], richtig: 1, erklaerung: "„klettern“ ist ein Tunwort (Verb) – im Satz schreibt man es klein." },
    { regel: "Groß oder klein?", satz: "Auf dem Fensterbrett liegt ein ___ Buch.", optionen: ["Dickes", "dickes"], richtig: 1, erklaerung: "„dickes“ beschreibt das Buch (Wiewort) → kleingeschrieben." },
    { regel: "Groß oder klein?", satz: "Unser ___ baut im Baum ein Nest.", optionen: ["Vogel", "vogel"], richtig: 0, erklaerung: "„der Vogel“ ist ein Namenwort (Tier) → großgeschrieben." },
    { regel: "Groß oder klein?", satz: "Am Wochenende ___ wir unsere Großeltern.", optionen: ["Besuchen", "besuchen"], richtig: 1, erklaerung: "„besuchen“ ist ein Tunwort (Verb) → im Satz kleingeschrieben." },
    { regel: "Groß oder klein?", satz: "Die ___ in der Küche riecht nach Kakao.", optionen: ["Luft", "luft"], richtig: 0, erklaerung: "„die Luft“ ist ein Namenwort (Nomen) → großgeschrieben." },
    { regel: "Groß oder klein?", satz: "Das Wasser im Bergsee ist sehr ___.", optionen: ["Kalt", "kalt"], richtig: 1, erklaerung: "„kalt“ ist ein Wiewort (Adjektiv) → kleingeschrieben." },
    { regel: "Groß oder klein?", satz: "Mit dem ___ fahren wir in die Stadt.", optionen: ["Zug", "zug"], richtig: 0, erklaerung: "„der Zug“ ist ein Namenwort (Nomen) → großgeschrieben." },

    // ie oder i (14)
    { regel: "ie oder i?", satz: "Wir spielen heute ein lustiges ___.", optionen: ["Spil", "Spiel"], richtig: 1, erklaerung: "Man spricht ein langes i → Spiel schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Auf der Blume sitzt eine fleißige ___.", optionen: ["Biene", "Bine"], richtig: 0, erklaerung: "Langes i in der betonten Silbe → Biene mit ie." },
    { regel: "ie oder i?", satz: "Oma schreibt uns einen langen ___.", optionen: ["Brif", "Brief"], richtig: 1, erklaerung: "Langes i → Brief schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Im ___ schneit es dicke Flocken.", optionen: ["Wienter", "Winter"], richtig: 1, erklaerung: "Kurzes i vor nt → Winter schreibt man mit einfachem i." },
    { regel: "ie oder i?", satz: "Die Pferde laufen über die grüne ___.", optionen: ["Wiese", "Wise"], richtig: 0, erklaerung: "Langes i → Wiese schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Das kleine ___ lacht ganz laut.", optionen: ["Kiend", "Kind"], richtig: 1, erklaerung: "Kurzes i → Kind schreibt man mit einfachem i." },
    { regel: "ie oder i?", satz: "Im Bad hängt ein großer ___.", optionen: ["Spiegel", "Spigel"], richtig: 0, erklaerung: "Langes i → Spiegel schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Auf dem Bauernhof meckert eine weiße ___.", optionen: ["Zige", "Ziege"], richtig: 1, erklaerung: "Langes i → Ziege schreibt man mit ie." },
    { regel: "ie oder i?", satz: "In Musik singen wir ein fröhliches ___.", optionen: ["Lied", "Lid"], richtig: 0, erklaerung: "Langes i beim Singen → Lied schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Im Teich schwimmt ein bunter ___.", optionen: ["Fiesch", "Fisch"], richtig: 1, erklaerung: "Kurzes i vor sch → Fisch schreibt man mit einfachem i." },
    { regel: "ie oder i?", satz: "Bei Regen ziehe ich meine ___ an.", optionen: ["Stiefel", "Stifel"], richtig: 0, erklaerung: "Langes i → Stiefel schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Am Himmel zuckt im Gewitter ein heller ___.", optionen: ["Blietz", "Blitz"], richtig: 1, erklaerung: "Kurzes i vor tz → Blitz schreibt man mit einfachem i." },
    { regel: "ie oder i?", satz: "Im Märchen stapft ein freundlicher ___ durch den Wald.", optionen: ["Riese", "Rise"], richtig: 0, erklaerung: "Langes i → Riese schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Durch das offene Fenster summt eine kleine ___.", optionen: ["Flige", "Fliege"], richtig: 1, erklaerung: "Langes i → Fliege schreibt man mit ie." },

    // Doppelmitlaut, ck und tz (14)
    { regel: "Doppelmitlaut", satz: "Heute scheint die warme ___.", optionen: ["Sone", "Sonne"], richtig: 1, erklaerung: "Nach dem kurzen o folgt ein doppeltes n → Sonne." },
    { regel: "Doppelmitlaut", satz: "Der Welpe trinkt frisches ___.", optionen: ["Wasser", "Waser"], richtig: 0, erklaerung: "Nach dem kurzen a folgt ein doppeltes s → Wasser." },
    { regel: "ck oder k?", satz: "Der ___ backt frühmorgens knusprige Semmeln.", optionen: ["Bäker", "Bäcker"], richtig: 1, erklaerung: "Nach dem kurzen ä steht ck → Bäcker." },
    { regel: "tz oder z?", satz: "Die ___ schnurrt gemütlich auf dem Sofa.", optionen: ["Katze", "Kaze"], richtig: 0, erklaerung: "Nach dem kurzen a steht tz → Katze." },
    { regel: "tz oder z?", satz: "Im Winter trage ich eine warme ___.", optionen: ["Müze", "Mütze"], richtig: 1, erklaerung: "Nach dem kurzen ü steht tz → Mütze." },
    { regel: "ck oder k?", satz: "Am blauen Himmel schwebt eine weiße ___.", optionen: ["Wolcke", "Wolke"], richtig: 1, erklaerung: "Nach l, n oder r steht niemals ck, sondern immer einfaches k → Wolke." },
    { regel: "ck oder k?", satz: "Über den breiten Fluss führt eine alte ___.", optionen: ["Brücke", "Brüke"], richtig: 0, erklaerung: "Nach dem kurzen ü steht ck → Brücke." },
    { regel: "ck oder k?", satz: "Auf dem Geburtstagstisch liegt ein buntes ___.", optionen: ["Geschenck", "Geschenk"], richtig: 1, erklaerung: "Nach l, n oder r steht nie ck, sondern einfaches k → Geschenk." },
    { regel: "ck oder k?", satz: "In der Küche steht eine Dose mit weißem ___.", optionen: ["Zucker", "Zuker"], richtig: 0, erklaerung: "Nach dem kurzen u steht ck → Zucker." },
    { regel: "tz oder z?", satz: "Die Piraten finden eine Kiste mit einem goldenen ___.", optionen: ["Schaz", "Schatz"], richtig: 1, erklaerung: "Nach dem kurzen a steht tz → Schatz." },
    { regel: "tz oder z?", satz: "Struppi springt fröhlich in die große ___.", optionen: ["Pfütze", "Pfüze"], richtig: 0, erklaerung: "Nach dem kurzen ü steht tz → Pfütze." },
    { regel: "tz oder z?", satz: "Mein ___ in der Klasse ist direkt am Fenster.", optionen: ["Plaz", "Platz"], richtig: 1, erklaerung: "Nach dem kurzen a steht tz → Platz." },
    { regel: "Doppelmitlaut", satz: "Auf dem ___ liegt ein Stück Apfelkuchen.", optionen: ["Teller", "Teler"], richtig: 0, erklaerung: "Nach dem kurzen e folgt ein doppeltes l → Teller." },
    { regel: "Doppelmitlaut", satz: "Zum Frühstück streiche ich ___ aufs Brot.", optionen: ["Buter", "Butter"], richtig: 1, erklaerung: "Nach dem kurzen u folgt ein doppeltes t → Butter." },

    // b/p, d/t, g/k am Wortende – Verlängerungstrick (14)
    { regel: "d oder t?", satz: "Wuffi ist ein fröhlicher ___.", optionen: ["Hund", "Hunt"], richtig: 0, erklaerung: "Verlängerungstrick: viele Hun-de → man hört das d!" },
    { regel: "g oder k?", satz: "Wir wandern auf einen hohen ___.", optionen: ["Berk", "Berg"], richtig: 1, erklaerung: "Verlängerungstrick: viele Ber-ge → man hört das g!" },
    { regel: "b oder p?", satz: "Im ___ liegen frische Äpfel.", optionen: ["Korb", "Korp"], richtig: 0, erklaerung: "Verlängerungstrick: viele Kör-be → man hört das b!" },
    { regel: "d oder t?", satz: "Auf der Koppel steht ein braunes ___.", optionen: ["Pfert", "Pferd"], richtig: 1, erklaerung: "Verlängerungstrick: viele Pfer-de → man hört das d!" },
    { regel: "g oder k?", satz: "Im Märchen wohnt ein lustiger ___.", optionen: ["Zwerg", "Zwerk"], richtig: 0, erklaerung: "Verlängerungstrick: viele Zwer-ge → man hört das g!" },
    { regel: "d oder t?", satz: "Am Morgen fährt mein ___ sehr schnell.", optionen: ["Fahrrat", "Fahrrad"], richtig: 1, erklaerung: "Verlängerungstrick: viele Fahrrä-der → man hört das d!" },
    { regel: "d oder t?", satz: "Hinter unserem Dorf beginnt ein tiefer ___.", optionen: ["Wald", "Walt"], richtig: 0, erklaerung: "Verlängerungstrick: viele Wäl-der → man hört das d!" },
    { regel: "d oder t?", satz: "An der Wand hängt ein buntes ___.", optionen: ["Bilt", "Bild"], richtig: 1, erklaerung: "Verlängerungstrick: viele Bil-der → man hört das d!" },
    { regel: "d oder t?", satz: "Mein bester ___ wohnt gleich nebenan.", optionen: ["Freund", "Freunt"], richtig: 0, erklaerung: "Verlängerungstrick: viele Freun-de → man hört das d!" },
    { regel: "g oder k?", satz: "Der schmale ___ führt hinauf zur Alm.", optionen: ["Wek", "Weg"], richtig: 1, erklaerung: "Verlängerungstrick: viele We-ge → man hört das g!" },
    { regel: "g oder k?", satz: "Heute ist ein sonniger ___.", optionen: ["Tag", "Tak"], richtig: 0, erklaerung: "Verlängerungstrick: viele Ta-ge → man hört das g!" },
    { regel: "g oder k?", satz: "Im Bahnhof wartet der rote ___.", optionen: ["Zuk", "Zug"], richtig: 1, erklaerung: "Verlängerungstrick: viele Zü-ge → man hört das g!" },
    { regel: "b oder p?", satz: "Im Stall trinkt das kleine ___ warme Milch.", optionen: ["Kalb", "Kalp"], richtig: 0, erklaerung: "Verlängerungstrick: viele Käl-ber → man hört das b!" },
    { regel: "b oder p?", satz: "In der Geschichte schnappt der Polizist den ___.", optionen: ["Diep", "Dieb"], richtig: 1, erklaerung: "Verlängerungstrick: viele Die-be → man hört das b!" },

    // ä/e und äu/eu – Ableitungstrick (14)
    { regel: "ä oder e?", satz: "Im Herbst fallen die bunten ___.", optionen: ["Blätter", "Bletter"], richtig: 0, erklaerung: "Ableitungstrick: ein Blatt → viele Blätter (mit ä)." },
    { regel: "äu oder eu?", satz: "Im Wald stehen viele hohe ___.", optionen: ["Beume", "Bäume"], richtig: 1, erklaerung: "Ableitungstrick: ein Baum → viele Bäume (mit äu)." },
    { regel: "ä oder e?", satz: "Vor dem Essen wasche ich mir die ___.", optionen: ["Hände", "Hende"], richtig: 0, erklaerung: "Ableitungstrick: eine Hand → zwei Hände (mit ä)." },
    { regel: "äu oder eu?", satz: "Zwei kleine ___ huschen über das Feld.", optionen: ["Meuse", "Mäuse"], richtig: 1, erklaerung: "Ableitungstrick: eine Maus → zwei Mäuse (mit äu)." },
    { regel: "äu oder eu?", satz: "In der Nacht habe ich schöne ___.", optionen: ["Träume", "Treume"], richtig: 0, erklaerung: "Ableitungstrick: ein Traum → viele Träume (mit äu)." },
    { regel: "ä oder e?", satz: "Die roten ___ schmecken süß und knackig.", optionen: ["Epfel", "Äpfel"], richtig: 1, erklaerung: "Ableitungstrick: ein Apfel → viele Äpfel (mit ä)." },
    { regel: "ä oder e?", satz: "Im Frühling blühen alle ___ im Dorf.", optionen: ["Gärten", "Gerten"], richtig: 0, erklaerung: "Ableitungstrick: ein Garten → viele Gärten (mit ä)." },
    { regel: "ä oder e?", satz: "Bei dieser ___ brauchen wir Handschuhe.", optionen: ["Kelte", "Kälte"], richtig: 1, erklaerung: "Ableitungstrick: kalt → die Kälte (mit ä)." },
    { regel: "ä oder e?", satz: "Auf der Weide hüpfen drei weiße ___.", optionen: ["Lämmer", "Lemmer"], richtig: 0, erklaerung: "Ableitungstrick: ein Lamm → viele Lämmer (mit ä)." },
    { regel: "ä oder e?", satz: "Im Zoo brüllen die starken ___ ganz laut.", optionen: ["Beren", "Bären"], richtig: 1, erklaerung: "Merkwort mit ä: ein Bär → viele Bären (mit ä)." },
    { regel: "äu oder eu?", satz: "In unserer Straße stehen viele bunte ___.", optionen: ["Häuser", "Heuser"], richtig: 0, erklaerung: "Ableitungstrick: ein Haus → viele Häuser (mit äu)." },
    { regel: "äu oder eu?", satz: "Rund um die Gärten stehen hohe ___.", optionen: ["Zeune", "Zäune"], richtig: 1, erklaerung: "Ableitungstrick: ein Zaun → viele Zäune (mit äu)." },
    { regel: "äu oder eu?", satz: "Unsere Schule hat viele helle ___.", optionen: ["Räume", "Reume"], richtig: 0, erklaerung: "Ableitungstrick: ein Raum → viele Räume (mit äu)." },
    { regel: "äu oder eu?", satz: "Der freundliche ___ reicht uns eine Tüte Obst.", optionen: ["Verkeufer", "Verkäufer"], richtig: 1, erklaerung: "Ableitungstrick: kaufen → Verkäufer (mit äu)." }
  ];

  /* ---------------- 2. Wortarten sortieren (60 Aufgaben) ---------------- */

  var WORTARTEN = [
    // 0 = Namenwort (Nomen), 1 = Tunwort (Verb), 2 = Wiewort (Adjektiv) – je 20
    { satz: "Der kleine **Welpe** spielt mit dem Ball.", wort: "Welpe", art: 0, erklaerung: "„der Welpe“ ist ein Lebewesen mit Begleiter → Namenwort (Nomen)." },
    { satz: "Der kleine Welpe **spielt** mit dem Ball.", wort: "spielt", art: 1, erklaerung: "Was tut der Welpe? Er spielt → Tunwort (Verb)." },
    { satz: "Der **kleine** Welpe spielt mit dem Ball.", wort: "kleine", art: 2, erklaerung: "Wie ist der Welpe? klein → Wiewort (Adjektiv)." },
    { satz: "Der **flauschige** Hamster sammelt Kerne.", wort: "flauschige", art: 2, erklaerung: "Wie ist der Hamster? flauschig → Wiewort (Adjektiv)." },
    { satz: "Der flauschige Hamster **sammelt** Kerne.", wort: "sammelt", art: 1, erklaerung: "Was tut der Hamster? Er sammelt → Tunwort (Verb)." },
    { satz: "Auf dem Dach liegt weißer **Schnee**.", wort: "Schnee", art: 0, erklaerung: "„der Schnee“ ist ein Ding/Stoff → Namenwort (Nomen)." },
    { satz: "Die **bunte** Lichterkette leuchtet hell.", wort: "bunte", art: 2, erklaerung: "Wie ist die Lichterkette? bunt → Wiewort (Adjektiv)." },
    { satz: "Die bunte Lichterkette **leuchtet** hell.", wort: "leuchtet", art: 1, erklaerung: "Was tut die Lichterkette? Sie leuchtet → Tunwort (Verb)." },
    { satz: "Meine **Schultasche** steht neben der Tür.", wort: "Schultasche", art: 0, erklaerung: "„die Schultasche“ ist ein Gegenstand → Namenwort (Nomen)." },
    { satz: "Am Nachmittag **backen** wir süße Kekse.", wort: "backen", art: 1, erklaerung: "Was tun wir? Wir backen → Tunwort (Verb)." },
    { satz: "Am Nachmittag backen wir **süße** Kekse.", wort: "süße", art: 2, erklaerung: "Wie sind die Kekse? süß → Wiewort (Adjektiv)." },
    { satz: "Ein **freundlicher** Wichtel packt Geschenke ein.", wort: "freundlicher", art: 2, erklaerung: "Wie ist der Wichtel? freundlich → Wiewort (Adjektiv)." },
    { satz: "Die Kinder **lachen** über den lustigen Schneemann.", wort: "lachen", art: 1, erklaerung: "Was tun die Kinder? Sie lachen → Tunwort (Verb)." },
    { satz: "Auf dem **Tisch** steht eine warme Tasse Kakao.", wort: "Tisch", art: 0, erklaerung: "„der Tisch“ ist ein Gegenstand → Namenwort (Nomen)." },
    { satz: "Auf dem Tisch steht eine **warme** Tasse Kakao.", wort: "warme", art: 2, erklaerung: "Wie ist die Tasse Kakao? warm → Wiewort (Adjektiv)." },
    { satz: "Der rote **Schlitten** saust den Berg hinunter.", wort: "Schlitten", art: 0, erklaerung: "„der Schlitten“ ist ein Gegenstand → Namenwort (Nomen)." },
    { satz: "Der rote Schlitten **saust** den Berg hinunter.", wort: "saust", art: 1, erklaerung: "Was tut der Schlitten? Er saust → Tunwort (Verb)." },
    { satz: "Im Garten zwitschert ein **munterer** Vogel.", wort: "munterer", art: 2, erklaerung: "Wie ist der Vogel? munter → Wiewort (Adjektiv)." },
    { satz: "Im Garten **zwitschert** ein munterer Vogel.", wort: "zwitschert", art: 1, erklaerung: "Was tut der Vogel? Er zwitschert → Tunwort (Verb)." },
    { satz: "Die **Sonne** wärmt unser Gesicht.", wort: "Sonne", art: 0, erklaerung: "„die Sonne“ hat den Begleiter „die“ → Namenwort (Nomen)." },
    { satz: "Das **schnelle** Pferd galoppiert über die Wiese.", wort: "schnelle", art: 2, erklaerung: "Wie ist das Pferd? schnell → Wiewort (Adjektiv)." },
    { satz: "Bello **buddelt** ein tiefes Loch im Sand.", wort: "buddelt", art: 1, erklaerung: "Was tut Bello? Er buddelt → Tunwort (Verb)." },
    { satz: "Mein **Bruder** liest ein spannendes Buch.", wort: "Bruder", art: 0, erklaerung: "„der Bruder“ ist eine Person → Namenwort (Nomen)." },
    { satz: "Die **knusprige** Semmel riecht wunderbar.", wort: "knusprige", art: 2, erklaerung: "Wie ist die Semmel? knusprig → Wiewort (Adjektiv)." },

    // 36 weitere Aufgaben (13 Nomen, 12 Verben, 11 Adjektive -> exakt 20/20/20)
    { satz: "Im **Wald** wachsen viele hohe Tannen.", wort: "Wald", art: 0, erklaerung: "„der Wald“ ist ein Ort/Ding mit Begleiter → Namenwort (Nomen)." },
    { satz: "Die große **Katze** schläft auf dem Kissen.", wort: "Katze", art: 0, erklaerung: "„die Katze“ ist ein Tier → Namenwort (Nomen)." },
    { satz: "Unser **Lehrer** erklärt eine neue Rechenaufgabe.", wort: "Lehrer", art: 0, erklaerung: "„der Lehrer“ ist eine Person → Namenwort (Nomen)." },
    { satz: "Aus der **Wolke** fallen dicke Regentropfen.", wort: "Wolke", art: 0, erklaerung: "„die Wolke“ hat den Begleiter „die“ → Namenwort (Nomen)." },
    { satz: "Am Himmel funkelt ein heller **Stern**.", wort: "Stern", art: 0, erklaerung: "„der Stern“ ist ein Ding → Namenwort (Nomen)." },
    { satz: "Im **Korb** liegen süße Erdbeeren.", wort: "Korb", art: 0, erklaerung: "„der Korb“ ist ein Gegenstand → Namenwort (Nomen)." },
    { satz: "Mein **Fahrrad** hat eine neue Klingel.", wort: "Fahrrad", art: 0, erklaerung: "„das Fahrrad“ ist ein Gegenstand → Namenwort (Nomen)." },
    { satz: "Der bunte **Schmetterling** landet auf einer Blume.", wort: "Schmetterling", art: 0, erklaerung: "„der Schmetterling“ ist ein Tier → Namenwort (Nomen)." },
    { satz: "Unsere **Nachbarin** gießt die Rosen im Garten.", wort: "Nachbarin", art: 0, erklaerung: "„die Nachbarin“ ist eine Person → Namenwort (Nomen)." },
    { satz: "Im **Schwimmbad** spritzt das kühle Wasser.", wort: "Schwimmbad", art: 0, erklaerung: "„das Schwimmbad“ ist ein Ort → Namenwort (Nomen)." },
    { satz: "Die goldene **Glocke** klingt besonders klar.", wort: "Glocke", art: 0, erklaerung: "„die Glocke“ ist ein Gegenstand → Namenwort (Nomen)." },
    { satz: "Der mutige **Feuerwehrmann** rettet das Kätzchen.", wort: "Feuerwehrmann", art: 0, erklaerung: "„der Feuerwehrmann“ ist eine Person → Namenwort (Nomen)." },
    { satz: "Im **Herbsteimer** glänzen braune Kastanien.", wort: "Herbsteimer", art: 0, erklaerung: "„der Herbsteimer“ ist ein Gegenstand → Namenwort (Nomen)." },

    { satz: "Die Enten **schwimmen** fröhlich über den Teich.", wort: "schwimmen", art: 1, erklaerung: "Was tun die Enten? Sie schwimmen → Tunwort (Verb)." },
    { satz: "Opa **repariert** das alte Holzspielzeug.", wort: "repariert", art: 1, erklaerung: "Was tut Opa? Er repariert → Tunwort (Verb)." },
    { satz: "Das Eichhörnchen **klettert** blitzschnell auf den Baum.", wort: "klettert", art: 1, erklaerung: "Was tut das Eichhörnchen? Es klettert → Tunwort (Verb)." },
    { satz: "Wir **malen** heute bunte Herbstblätter.", wort: "malen", art: 1, erklaerung: "Was tun wir? Wir malen → Tunwort (Verb)." },
    { satz: "Der Wind **pustet** das bunte Laub über den Weg.", wort: "pustet", art: 1, erklaerung: "Was tut der Wind? Er pustet → Tunwort (Verb)." },
    { satz: "Die kleine Maus **knabbert** an einem Stück Käse.", wort: "knabbert", art: 1, erklaerung: "Was tut die Maus? Sie knabbert → Tunwort (Verb)." },
    { satz: "Alle Schüler **schreiben** einen kurzen Brief.", wort: "schreiben", art: 1, erklaerung: "Was tun die Schüler? Sie schreiben → Tunwort (Verb)." },
    { satz: "Am Abend **funkeln** tausend Sterne am Himmel.", wort: "funkeln", art: 1, erklaerung: "Was tun die Sterne? Sie funkeln → Tunwort (Verb)." },
    { satz: "Papa **kocht** eine leckere Gemüsesuppe.", wort: "kocht", art: 1, erklaerung: "Was tut Papa? Er kocht → Tunwort (Verb)." },
    { satz: "Das kleine Känguru **hüpft** über den grünen Rasen.", wort: "hüpft", art: 1, erklaerung: "Was tut das Känguru? Es hüpft → Tunwort (Verb)." },
    { satz: "Im Konzert **singen** die Kinder ihr Lieblingslied.", wort: "singen", art: 1, erklaerung: "Was tun die Kinder? Sie singen → Tunwort (Verb)." },
    { satz: "Die mutige Retterin **hilft** dem verletzten Igel.", wort: "hilft", art: 1, erklaerung: "Was tut die Retterin? Sie hilft → Tunwort (Verb)." },

    { satz: "Im Sommer essen wir **kaltes** Eis.", wort: "kaltes", art: 2, erklaerung: "Wie ist das Eis? kalt → Wiewort (Adjektiv)." },
    { satz: "Auf dem Berg weht ein **starker** Wind.", wort: "starker", art: 2, erklaerung: "Wie ist der Wind? stark → Wiewort (Adjektiv)." },
    { satz: "Der Elefant trägt einen **schweren** Baumstamm.", wort: "schweren", art: 2, erklaerung: "Wie ist der Baumstamm? schwer → Wiewort (Adjektiv)." },
    { satz: "Die Kinder bauen eine **riesige** Sandburg.", wort: "riesige", art: 2, erklaerung: "Wie ist die Sandburg? riesig → Wiewort (Adjektiv)." },
    { satz: "Unter der Decke ist es **gemütlich**.", wort: "gemütlich", art: 2, erklaerung: "Wie ist es unter der Decke? gemütlich → Wiewort (Adjektiv)." },
    { satz: "Der **neugierige** Fuchs schaut hinter dem Busch hervor.", wort: "neugierige", art: 2, erklaerung: "Wie ist der Fuchs? neugierig → Wiewort (Adjektiv)." },
    { satz: "Wir wandern über einen **schmalen** Waldpfad.", wort: "schmalen", art: 2, erklaerung: "Wie ist der Waldpfad? schmal → Wiewort (Adjektiv)." },
    { satz: "Die **frische** Zitrone schmeckt ganz sauer.", wort: "frische", art: 2, erklaerung: "Wie ist die Zitrone? frisch → Wiewort (Adjektiv)." },
    { satz: "Im Zimmer hängt ein **rundes** Bild.", wort: "rundes", art: 2, erklaerung: "Wie ist das Bild? rund → Wiewort (Adjektiv)." },
    { satz: "Der **müde** Welpe gähnt und legt sich hin.", wort: "müde", art: 2, erklaerung: "Wie ist der Welpe? müde → Wiewort (Adjektiv)." },
    { satz: "Am Bach liegen viele **glatte** Steine.", wort: "glatte", art: 2, erklaerung: "Wie sind die Steine? glatt → Wiewort (Adjektiv)." }
  ];

  /* ---------------- 3. Satzbau-Puzzle (40 Sätze) ---------------- */

  var SATZBAU = [
    { teile: ["Der kleine Welpe", "rennt", "fröhlich", "über die grüne Wiese."], erklaerung: "Der kleine Welpe rennt fröhlich über die grüne Wiese." },
    { teile: ["Am Nachmittag", "backen", "wir", "duftende Weihnachtskekse."], erklaerung: "Am Nachmittag backen wir duftende Weihnachtskekse." },
    { teile: ["Der flauschige Hamster", "versteckt", "fünf Kerne", "in seinem gemütlichen Haus."], erklaerung: "Der flauschige Hamster versteckt fünf Kerne in seinem gemütlichen Haus." },
    { teile: ["Nach der Schule", "treffe", "ich", "meine beste Freundin", "im Park."], erklaerung: "Nach der Schule treffe ich meine beste Freundin im Park." },
    { teile: ["Die bunte Lichterkette", "leuchtet", "abends", "am großen Fenster."], erklaerung: "Die bunte Lichterkette leuchtet abends am großen Fenster." },
    { teile: ["Rudolph", "zieht", "den schweren Schlitten", "durch den tiefen Schnee."], erklaerung: "Rudolph zieht den schweren Schlitten durch den tiefen Schnee." },
    { teile: ["Im Sommer", "schwimmen", "die Kinder", "gerne im kühlen See."], erklaerung: "Im Sommer schwimmen die Kinder gerne im kühlen See." },
    { teile: ["Bello", "bringt", "stolz", "den gelben Ball", "zurück."], erklaerung: "Bello bringt stolz den gelben Ball zurück." },
    { teile: ["Vor dem Schlafengehen", "liest", "Mama", "eine lustige Geschichte", "vor."], erklaerung: "Vor dem Schlafengehen liest Mama eine lustige Geschichte vor." },
    { teile: ["Knuspel", "läuft", "abends", "schnell", "in seinem bunten Laufrad."], erklaerung: "Knuspel läuft abends schnell in seinem bunten Laufrad." },
    { teile: ["Auf dem hohen Baum", "baut", "ein kleiner Vogel", "ein weiches Nest."], erklaerung: "Auf dem hohen Baum baut ein kleiner Vogel ein weiches Nest." },
    { teile: ["Heute", "malen", "alle Kinder", "bunte Bilder", "für das Fest."], erklaerung: "Heute malen alle Kinder bunte Bilder für das Fest." },
    { teile: ["Der fleißige Wichtel", "bindet", "eine goldene Schleife", "um das Paket."], erklaerung: "Der fleißige Wichtel bindet eine goldene Schleife um das Paket." },
    { teile: ["Bei Regen", "spannen", "wir", "unseren gelben Schirm", "auf."], erklaerung: "Bei Regen spannen wir unseren gelben Schirm auf." },
    { teile: ["Flocki", "wedelt", "begeistert", "mit seinem weichen Schwanz."], erklaerung: "Flocki wedelt begeistert mit seinem weichen Schwanz." },
    { teile: ["Im Herbst", "sammeln", "wir", "glänzende Kastanien", "im Wald."], erklaerung: "Im Herbst sammeln wir glänzende Kastanien im Wald." },

    // 24 weitere eindeutige Sätze
    { teile: ["Am Sonntag", "besuchen", "wir", "Oma und Opa", "auf dem Land."], erklaerung: "Am Sonntag besuchen wir Oma und Opa auf dem Land." },
    { teile: ["Der braune Igel", "sucht", "in der Dämmerung", "einen ruhigen Schlafplatz."], erklaerung: "Der braune Igel sucht in der Dämmerung einen ruhigen Schlafplatz." },
    { teile: ["In der Pause", "tauschen", "die Kinder", "bunte Sticker", "auf dem Schulhof."], erklaerung: "In der Pause tauschen die Kinder bunte Sticker auf dem Schulhof." },
    { teile: ["Die fleißige Biene", "sammelt", "süßen Nektar", "von den gelben Blüten."], erklaerung: "Die fleißige Biene sammelt süßen Nektar von den gelben Blüten." },
    { teile: ["Zum Frühstück", "schneidet", "Papa", "frische Äpfel", "in kleine Stücke."], erklaerung: "Zum Frühstück schneidet Papa frische Äpfel in kleine Stücke." },
    { teile: ["Das neugierige Kätzchen", "beobachtet", "einen bunten Schmetterling", "im Garten."], erklaerung: "Das neugierige Kätzchen beobachtet einen bunten Schmetterling im Garten." },
    { teile: ["Im Winter", "bauen", "alle Freunde", "einen großen Schneemann", "vor dem Haus."], erklaerung: "Im Winter bauen alle Freunde einen großen Schneemann vor dem Haus." },
    { teile: ["Meine kleine Schwester", "baut", "einen hohen Turm", "aus bunten Bauklötzen."], erklaerung: "Meine kleine Schwester baut einen hohen Turm aus bunten Bauklötzen." },
    { teile: ["Am Morgen", "putze", "ich", "gründlich", "meine Zähne."], erklaerung: "Am Morgen putze ich gründlich meine Zähne." },
    { teile: ["Der schnelle Zug", "fährt", "pünktlich", "aus dem großen Bahnhof", "ab."], erklaerung: "Der schnelle Zug fährt pünktlich aus dem großen Bahnhof ab." },
    { teile: ["Im Musikunterricht", "lernen", "wir", "ein neues Frühlingslied", "auswendig."], erklaerung: "Im Musikunterricht lernen wir ein neues Frühlingslied auswendig." },
    { teile: ["Das weiße Kaninchen", "knabbert", "genüsslich", "an einer knackigen Karotte."], erklaerung: "Das weiße Kaninchen knabbert genüsslich an einer knackigen Karotte." },
    { teile: ["In den Ferien", "fahren", "wir", "mit dem Fahrrad", "an den See."], erklaerung: "In den Ferien fahren wir mit dem Fahrrad an den See." },
    { teile: ["Die freundliche Bäckerin", "holt", "warme Semmeln", "aus dem heißen Ofen."], erklaerung: "Die freundliche Bäckerin holt warme Semmeln aus dem heißen Ofen." },
    { teile: ["Nach dem Gewitter", "erscheint", "ein bunter Regenbogen", "über den Bergen."], erklaerung: "Nach dem Gewitter erscheint ein bunter Regenbogen über den Bergen." },
    { teile: ["Der kleine Hamster", "klettert", "geschickt", "über die schmale Holzbrücke."], erklaerung: "Der kleine Hamster klettert geschickt über die schmale Holzbrücke." },
    { teile: ["An meinem Geburtstag", "puste", "ich", "alle bunten Kerzen", "aus."], erklaerung: "An meinem Geburtstag puste ich alle bunten Kerzen aus." },
    { teile: ["Auf der Wiese", "grasen", "drei friedliche Pferde", "in der Morgensonne."], erklaerung: "Auf der Wiese grasen drei friedliche Pferde in der Morgensonne." },
    { teile: ["Im Kino", "knabbern", "wir", "frisches Popcorn", "aus einer großen Tüte."], erklaerung: "Im Kino knabbern wir frisches Popcorn aus einer großen Tüte." },
    { teile: ["Die kleine Elfe", "hängt", "silberne Sterne", "an den grünen Tannenbaum."], erklaerung: "Die kleine Elfe hängt silberne Sterne an den grünen Tannenbaum." },
    { teile: ["Vor dem Ausflug", "packe", "ich", "meine Trinkflasche", "in den Rucksack."], erklaerung: "Vor dem Ausflug packe ich meine Trinkflasche in den Rucksack." },
    { teile: ["Der bunte Drachen", "steigt", "im kräftigen Herbstwind", "hoch in die Luft."], erklaerung: "Der bunte Drachen steigt im kräftigen Herbstwind hoch in die Luft." },
    { teile: ["In der Bücherei", "leihe", "ich", "mir", "zwei spannende Bücher aus."], erklaerung: "In der Bücherei leihe ich mir zwei spannende Bücher aus." },
    { teile: ["Nach dem Sport", "trinken", "alle Kinder", "ein großes Glas Wasser."], erklaerung: "Nach dem Sport trinken alle Kinder ein großes Glas Wasser." }
  ];

  /* ---------------- 4. Leseverständnis (15 Welt-Geschichten, 5 pro Welt) ---------------- */

  var LESETEXTE = [
    // Welt: Süße Hunde (5)
    {
      id: "lesen-hunde-1", welt: "hunde", titel: "Wuffis verlorener Knochen",
      text: "Wuffi hat heute Morgen seinen liebsten Kauknochen im Garten vergraben. Nach dem Mittagessen möchte er ihn wieder ausbuddeln, aber er findet die Stelle nicht mehr. Seine Freundin Bella hilft ihm beim Suchen und schnüffelt an jedem Blumenbeet. Plötzlich entdeckt Bella unter dem großen Apfelbaum frisch aufgewühlte Erde. Wuffi gräbt fröhlich drauflos und teilt seinen Knochen danach mit Bella.",
      fragen: [
        { frage: "Wann hat Wuffi den Knochen vergraben?", optionen: ["Heute Morgen", "Am Abend", "Gestern Nacht"], richtig: 0, erklaerung: "Im ersten Satz steht: „heute Morgen“." },
        { frage: "Wo findet Bella die richtige Stelle?", optionen: ["Hinter dem Zaun", "Unter dem großen Apfelbaum", "Auf der Terrasse"], richtig: 1, erklaerung: "Bella entdeckt die frisch aufgewühlte Erde unter dem großen Apfelbaum." },
        { frage: "Was macht Wuffi am Ende?", optionen: ["Er versteckt den Knochen neu", "Er rennt ins Haus", "Er teilt den Knochen mit Bella"], richtig: 2, erklaerung: "Wuffi bedankt sich und teilt seinen Knochen mit Bella." }
      ]
    },
    {
      id: "lesen-hunde-2", welt: "hunde", titel: "Die Pfützen-Wette",
      text: "Nach einem kurzen Sommergewitter glänzen auf dem Parkweg drei große Pfützen. Mopsi möchte am liebsten trocken bleiben und trippelt vorsichtig am Rand entlang. Struppi dagegen nimmt Anlauf und springt mitten in die größte Pfütze hinein. Das Wasser spritzt in alle Richtungen, und sogar Mopsis Nase bekommt einen Tropfen ab. Am Ende lachen beide Welpen und schütteln sich in der warmen Sonne wieder trocken.",
      fragen: [
        { frage: "Wie viele große Pfützen liegen auf dem Parkweg?", optionen: ["Zwei", "Drei", "Fünf"], richtig: 1, erklaerung: "Auf dem Parkweg glänzen drei große Pfützen." },
        { frage: "Wer springt mitten in die größte Pfütze?", optionen: ["Mopsi", "Struppi", "Keiner von beiden"], richtig: 1, erklaerung: "Struppi nimmt Anlauf und springt mitten hinein." },
        { frage: "Wie werden die Welpen am Ende wieder trocken?", optionen: ["Mit einem Handtuch", "Im Hundehaus", "Sie schütteln sich in der warmen Sonne"], richtig: 2, erklaerung: "Beide schütteln sich in der warmen Sonne wieder trocken." }
      ]
    },
    {
      id: "lesen-hunde-3", welt: "hunde", titel: "Bello bei der Tierärztin",
      text: "Beim Spielen im Garten ist Bello in einen kleinen Dorn getreten und humpelt leicht. Seine Freundin Flocki begleitet ihn mutig bis zur freundlichen Tierärztin. Die Tierärztin zieht den Dorn ganz vorsichtig mit einer Pinzette heraus und klebt ein rotes Pflaster auf Bellos Pfote. Zur Belohnung bekommen beide Hunde ein knuspriges Keks-Leckerli. Schon auf dem Heimweg wedelt Bello wieder so fröhlich wie immer.",
      fragen: [
        { frage: "Warum humpelt Bello?", optionen: ["Er hat sich verschluckt", "Er ist in einen kleinen Dorn getreten", "Er hat seinen Ball verloren"], richtig: 1, erklaerung: "Bello ist beim Spielen in einen kleinen Dorn getreten." },
        { frage: "Welche Farbe hat das Pflaster auf Bellos Pfote?", optionen: ["Blau", "Gelb", "Rot"], richtig: 2, erklaerung: "Die Tierärztin klebt ein rotes Pflaster auf Bellos Pfote." },
        { frage: "Was bekommen die beiden Hunde als Belohnung?", optionen: ["Ein knuspriges Keks-Leckerli", "Eine neue Leine", "Einen Gummiball"], richtig: 0, erklaerung: "Zur Belohnung bekommen beide ein knuspriges Keks-Leckerli." }
      ]
    },
    {
      id: "lesen-hunde-4", welt: "hunde", titel: "Cocos Geburtstagskuchen",
      text: "Heute feiert Coco ihren Geburtstag im sonnigen Garten. Schnuffel hat extra einen besonderen Hundekuchen aus Haferflocken und geriebenen Karotten gebacken. Oben drauf stecken vier bunte Kerzen, die im leichten Wind flackern. Alle Freunde singen laut ein Geburtstagslied, bevor Coco die Kerzen mit einem kräftigen Puster ausbläst. Danach schmeckt der Kuchen allen Gästen so gut, dass kein einziger Krümel übrig bleibt.",
      fragen: [
        { frage: "Woraus hat Schnuffel den Hundekuchen gebacken?", optionen: ["Aus Schokolade und Sahne", "Aus Haferflocken und Karotten", "Aus Äpfeln und Zimt"], richtig: 1, erklaerung: "Der Kuchen besteht aus Haferflocken und geriebenen Karotten." },
        { frage: "Wie viele Kerzen stecken auf dem Kuchen?", optionen: ["Drei", "Vier", "Sechs"], richtig: 1, erklaerung: "Auf dem Kuchen stecken vier bunte Kerzen." },
        { frage: "Wie viel bleibt am Ende vom Kuchen übrig?", optionen: ["Die Hälfte", "Zwei Stücke", "Kein einziger Krümel"], richtig: 2, erklaerung: "Der Kuchen schmeckt so gut, dass kein einziger Krümel übrig bleibt." }
      ]
    },
    {
      id: "lesen-hunde-5", welt: "hunde", titel: "Das Rätsel um den gelben Ball",
      text: "Flocki und Mopsi werfen sich auf der Wiese einen gelben Tennisball zu. Bei einem besonders hohen Wurf fliegt der Ball in hohem Bogen über die Hecke und verschwindet. Die beiden Freunde suchen zuerst hinter der Parkbank und unter der Rutsche, doch dort ist nichts. Erst als Flocki genau hinhorcht, hört sie ein leises Rascheln im großen Himbeerstrauch. Tatsächlich klemmt der Ball sicher zwischen zwei Zweigen, und die beiden können weiterspielen.",
      fragen: [
        { frage: "Welche Farbe hat der Tennisball?", optionen: ["Gelb", "Grün", "Orange"], richtig: 0, erklaerung: "Es ist ein gelber Tennisball." },
        { frage: "Wo suchen Flocki und Mopsi zuerst?", optionen: ["Am Teich und im Sandkasten", "Hinter der Parkbank und unter der Rutsche", "Vor dem Gartentor"], richtig: 1, erklaerung: "Sie suchen zuerst hinter der Parkbank und unter der Rutsche." },
        { frage: "Wo steckt der Ball schließlich?", optionen: ["Auf dem Dach", "In einem Eimer", "Im großen Himbeerstrauch"], richtig: 2, erklaerung: "Der Ball klemmt zwischen zwei Zweigen im großen Himbeerstrauch." }
      ]
    },

    // Welt: Flauschige Hamster (5)
    {
      id: "lesen-hamster-1", welt: "hamster", titel: "Knuspels Geheimversteck",
      text: "Knuspel sammelt für den Winter besonders viele Sonnenblumenkerne. Seine Backentaschen sind so prall gefüllt, dass er aussieht wie ein kleiner Ballon. Vorsichtig klettert er über die Holzbrücke zu seinem neuen Versteck hinter dem blauen Napf. Dort legt er alle Kerne fein säuberlich auf einen Haufen. Als Wommel vorbeikommt, lädt Knuspel ihn sofort zu einem kleinen Knabber-Picknick ein.",
      fragen: [
        { frage: "Was sammelt Knuspel?", optionen: ["Haselnüsse", "Sonnenblumenkerne", "Apfelstücke"], richtig: 1, erklaerung: "Knuspel sammelt besonders viele Sonnenblumenkerne." },
        { frage: "Wo ist Knuspels neues Versteck?", optionen: ["Unter dem Laufrad", "Hinter dem blauen Napf", "Auf der Holzbrücke"], richtig: 1, erklaerung: "Das neue Versteck liegt hinter dem blauen Napf." },
        { frage: "Wen lädt Knuspel zum Picknick ein?", optionen: ["Pip", "Wommel", "Bommel"], richtig: 1, erklaerung: "Als Wommel vorbeikommt, lädt Knuspel ihn zum Picknick ein." }
      ]
    },
    {
      id: "lesen-hamster-2", welt: "hamster", titel: "Das Wettrennen im Tunnel",
      text: "Im Hamster-Zimmer haben Pip und Flauschi heute einen langen Tunnel aus Pappröhren entdeckt. Sie stellen sich nebeneinander an den Eingang und zählen laut bis drei. Pip flitzt sofort los, aber in der Mitte des Tunnels liegt ein weiches Stück Heu im Weg. Gemeinsam schieben die beiden Hamster das Heu beiseite und rollen vergnügt aus dem Ausgang. Weil beide gleichzeitig ankommen, feiern sie gemeinsam als Sieger.",
      fragen: [
        { frage: "Woraus besteht der lange Tunnel?", optionen: ["Aus Holz", "Aus Pappröhren", "Aus Decken"], richtig: 1, erklaerung: "Der Tunnel besteht aus Pappröhren." },
        { frage: "Was blockiert die Mitte des Tunnels?", optionen: ["Ein Stück Heu", "Ein großer Stein", "Ein Futternapf"], richtig: 0, erklaerung: "In der Mitte liegt ein weiches Stück Heu im Weg." },
        { frage: "Wer gewinnt das Wettrennen?", optionen: ["Nur Pip", "Nur Flauschi", "Beide kommen gleichzeitig an"], richtig: 2, erklaerung: "Sie schieben das Heu gemeinsam weg und kommen zusammen als Sieger an." }
      ]
    },
    {
      id: "lesen-hamster-3", welt: "hamster", titel: "Nussis hohe Kletterburg",
      text: "Nussi träumt davon, einmal ganz bis zum Fenster hinauszuschauen. Zusammen mit Bommel stapelt sie drei bunte Holzklötze wie eine kleine Treppe aufeinander. Ganz vorsichtig tippelt Nussi Stufe für Stufe nach oben, während Bommel unten aufpasst, dass nichts wackelt. Von der obersten Stufe aus sieht Nussi draußen im Garten ein rotes Eichhörnchen über den Zaun flitzen. Begeistert winkt sie hinunter und ruft Bommel sofort zu sich nach oben.",
      fragen: [
        { frage: "Wie viele Holzklötze stapeln Nussi und Bommel aufeinander?", optionen: ["Zwei", "Drei", "Fünf"], richtig: 1, erklaerung: "Sie stapeln drei bunte Holzklötze aufeinander." },
        { frage: "Was macht Bommel, während Nussi hinaufklettert?", optionen: ["Er schläft im Nest", "Er passt unten auf, dass nichts wackelt", "Er holt Futter"], richtig: 1, erklaerung: "Bommel passt unten auf, dass die Treppe nicht wackelt." },
        { frage: "Welches Tier sieht Nussi draußen im Garten?", optionen: ["Einen Hund", "Einen Vogel", "Ein rotes Eichhörnchen"], richtig: 2, erklaerung: "Nussi sieht ein rotes Eichhörnchen über den Zaun flitzen." }
      ]
    },
    {
      id: "lesen-hamster-4", welt: "hamster", titel: "Krummels Apfel-Überraschung",
      text: "Am Nachmittag duftet es im Hamsterhaus plötzlich süß und frisch. Krummel schnüffelt neugierig aus seiner Höhle und entdeckt auf einem kleinen Porzellanteller ein saftiges Apfelstück. Weil das Stück für ihn allein viel zu groß ist, läuft er hinüber zu Zucker. Gemeinsam knabbern sie jeder von einer Seite, bis sich ihre kleinen Nasen genau in der Mitte treffen. Beide kichern leise und freuen sich über das beste Abendessen der Woche.",
      fragen: [
        { frage: "Worauf liegt das saftige Apfelstück?", optionen: ["Auf einem Blatt", "Auf einem kleinen Porzellanteller", "In einer Holzschale"], richtig: 1, erklaerung: "Das Apfelstück liegt auf einem kleinen Porzellanteller." },
        { frage: "Warum holt Krummel seinen Freund Zucker?", optionen: ["Weil das Apfelstück für ihn allein zu groß ist", "Weil er Äpfel nicht mag", "Weil er den Weg nicht kennt"], richtig: 0, erklaerung: "Das Stück ist für Krummel allein viel zu groß, deshalb teilt er es mit Zucker." },
        { frage: "Was passiert beim gemeinsamen Knabbern?", optionen: ["Der Apfel rollt weg", "Ihre Nasen treffen sich in der Mitte", "Sie schlafen ein"], richtig: 1, erklaerung: "Sie knabbern von beiden Seiten, bis sich ihre Nasen in der Mitte treffen." }
      ]
    },
    {
      id: "lesen-hamster-5", welt: "hamster", titel: "Bommels kuscheliges Nest",
      text: "Draußen prasselt der Herbstregen leise an die Fensterscheibe. Bommel beschließt, sein Schlafhäuschen heute besonders gemütlich einzurichten. Er sammelt weiche Papierschnipsel und trockenes Heu und polstert damit jede Ecke aus. Als Pip müde vom Spielen im Laufrad vorbeischaut, rückt Bommel sofort ein Stück zur Seite. Kurz darauf schlummern beide Hamster eingekuschelt ein, während der Regen draußen sein Schlaflied klopft.",
      fragen: [
        { frage: "Wie ist das Wetter draußen?", optionen: ["Es schneit stark", "Herbstregen prasselt ans Fenster", "Die Sonne scheint heiß"], richtig: 1, erklaerung: "Draußen prasselt der Herbstregen leise an die Fensterscheibe." },
        { frage: "Womit polstert Bommel sein Häuschen aus?", optionen: ["Mit Blättern und Moos", "Mit Papierschnipseln und trockenem Heu", "Mit Wolle und Stoff"], richtig: 1, erklaerung: "Er sammelt weiche Papierschnipsel und trockenes Heu." },
        { frage: "Woher kommt Pip, bevor sie sich dazulegt?", optionen: ["Vom Spielen im Laufrad", "Aus dem Garten", "Vom Futternapf"], richtig: 0, erklaerung: "Pip kommt müde vom Spielen im Laufrad vorbei." }
      ]
    },

    // Welt: Weihnachtswelt (5)
    {
      id: "lesen-weihnachten-1", welt: "weihnachten", titel: "Die verschwundene Glocke",
      text: "Kurz vor Heiligabend sucht der Weihnachtsmann überall nach der goldenen Schlittenglocke. Ohne ihren hellen Klang weiß Rudolph nicht, wann es losgehen soll. Eine kleine Elfe erinnert sich daran, dass der Wichtel die Glocke gestern frisch poliert hat. Tatsächlich liegt sie blitzblank auf einem roten Kissen in der Werkstatt. Der Weihnachtsmann lacht erleichtert und hängt die Glocke sofort an den Schlitten.",
      fragen: [
        { frage: "Was sucht der Weihnachtsmann?", optionen: ["Seine rote Mütze", "Die goldene Schlittenglocke", "Einen Wunschzettel"], richtig: 1, erklaerung: "Er sucht überall nach der goldenen Schlittenglocke." },
        { frage: "Wer hat die Glocke gestern poliert?", optionen: ["Rudolph", "Der Schneemann", "Der Wichtel"], richtig: 2, erklaerung: "Die Elfe erinnert sich, dass der Wichtel sie poliert hat." },
        { frage: "Wo liegt die Glocke?", optionen: ["Auf einem roten Kissen in der Werkstatt", "Im Schnee vor der Tür", "Unter dem Tannenbaum"], richtig: 0, erklaerung: "Die Glocke liegt blitzblank auf einem roten Kissen in der Werkstatt." }
      ]
    },
    {
      id: "lesen-weihnachten-2", welt: "weihnachten", titel: "Der Lebkuchenmann im Schnee",
      text: "In der Weihnachtsbäckerei duftet es herrlich nach Zimt und Honig. Ein kleiner Lebkuchenmann schaut neugierig aus dem Fenster und bewundert die glitzernden Schneeflocken. Draußen winkt ihm der Schneemann freundlich mit einem Tannenzweig zu. Die Elfe legt dem Lebkuchenmann einen winzigen Schal aus Zuckerstreuseln um, damit er nicht friert. So können die beiden durch das Fenster fröhlich zusammen lachen.",
      fragen: [
        { frage: "Wonach duftet es in der Weihnachtsbäckerei?", optionen: ["Nach Vanille und Kakao", "Nach Zimt und Honig", "Nach Äpfeln und Nüssen"], richtig: 1, erklaerung: "Es duftet herrlich nach Zimt und Honig." },
        { frage: "Womit winkt der Schneemann?", optionen: ["Mit einem Tannenzweig", "Mit seinem Hut", "Mit einem Besen"], richtig: 0, erklaerung: "Der Schneemann winkt mit einem Tannenzweig." },
        { frage: "Woraus ist der winzige Schal des Lebkuchenmanns?", optionen: ["Aus Wolle", "Aus Papier", "Aus Zuckerstreuseln"], richtig: 2, erklaerung: "Die Elfe legt ihm einen Schal aus Zuckerstreuseln um." }
      ]
    },
    {
      id: "lesen-weihnachten-3", welt: "weihnachten", titel: "Rudolphs Flug durch den Nebel",
      text: "Am Abend vor Weihnachten zieht plötzlich dichter Nebel über die verschneiten Tannen. Die anderen Rentiere sehen kaum noch die schmale Landebahn auf der Lichtung. Da tritt Rudolph nach vorn, und seine rote Nase leuchtet so hell wie eine kleine Laterne. Das Christkind streut zusätzlich ein paar glitzernde Sternenfunken in die Luft, damit alle den Weg erkennen. Sicher und sanft landet der ganze Schlitten mitten auf dem weichen Schnee.",
      fragen: [
        { frage: "Warum sehen die Rentiere die Landebahn kaum noch?", optionen: ["Weil es regnet", "Weil dichter Nebel aufzieht", "Weil der Mond fehlt"], richtig: 1, erklaerung: "Plötzlich zieht dichter Nebel über die verschneiten Tannen." },
        { frage: "Womit leuchtet Rudolph den Weg aus?", optionen: ["Mit einer Taschenlampe", "Mit seiner roten Nase", "Mit einer Kerze"], richtig: 1, erklaerung: "Rudolphs rote Nase leuchtet so hell wie eine kleine Laterne." },
        { frage: "Was streut das Christkind zusätzlich in die Luft?", optionen: ["Schneeflocken", "Glitzernde Sternenfunken", "Tannennadeln"], richtig: 1, erklaerung: "Das Christkind streut glitzernde Sternenfunken in die Luft." }
      ]
    },
    {
      id: "lesen-weihnachten-4", welt: "weihnachten", titel: "Der vergessene Wunschzettel",
      text: "Beim Aufräumen in der Spielzeugwerkstatt entdeckt der kleine Wichtel hinter einer Holzkiste einen blauen Briefumschlag. Neugierig bringt er ihn sofort zum Weihnachtsmann, der seine Brille aufsetzt und den Brief vorliest. Ein Kind wünscht sich darin ein bunt bemaltes Holzpferd mit einer langen weißen Mähne. Weil alle fleißigen Helfer zusammen anpacken, ist das Holzpferd noch vor Sonnenuntergang fertig geschnitzt und bemalt. Stolz bindet der Wichtel eine goldene Schleife darum.",
      fragen: [
        { frage: "Welche Farbe hat der Briefumschlag?", optionen: ["Blau", "Grün", "Rot"], richtig: 0, erklaerung: "Der Wichtel entdeckt einen blauen Briefumschlag." },
        { frage: "Was wünscht sich das Kind in dem Brief?", optionen: ["Eine Eisenbahn", "Ein bunt bemaltes Holzpferd", "Ein Bilderbuch"], richtig: 1, erklaerung: "Das Kind wünscht sich ein bunt bemaltes Holzpferd mit weißer Mähne." },
        { frage: "Wann ist das Geschenk fertig?", optionen: ["Erst am nächsten Morgen", "Noch vor Sonnenuntergang", "Nach Mitternacht"], richtig: 1, erklaerung: "Alle packen zusammen an, sodass es noch vor Sonnenuntergang fertig ist." }
      ]
    },
    {
      id: "lesen-weihnachten-5", welt: "weihnachten", titel: "Zimtsterne für den Schneemann",
      text: "Die Elfe hat am Vormittag ein ganzes Blech voller knuspriger Zimtsterne gebacken. Einen blauen Teller voll trägt sie hinaus in den Garten zum großen Schneemann. Natürlich kann der Schneemann keine Kekse essen, aber er freut sich riesig über die hübsche Dekoration neben seiner Möhre. Schon bald hüpfen drei kleine Meisen herbei und picken vorsichtig ein paar Krümel vom Teller. Der Schneemann lächelt mit seinen Kohlenaugen und hat den ganzen Nachmittag fröhliche Gesellschaft.",
      fragen: [
        { frage: "Was hat die Elfe am Vormittag gebacken?", optionen: ["Vanillekipferl", "Zimtsterne", "Apfelstrudel"], richtig: 1, erklaerung: "Sie hat ein Blech voller knuspriger Zimtsterne gebacken." },
        { frage: "Wie viele kleine Meisen hüpfen herbei?", optionen: ["Zwei", "Drei", "Fünf"], richtig: 1, erklaerung: "Drei kleine Meisen hüpfen herbei und picken Krümel." },
        { frage: "Worauf trägt die Elfe die Zimtsterne hinaus?", optionen: ["Auf einem blauen Teller", "In einem Korb", "Auf einem Holzbrett"], richtig: 0, erklaerung: "Sie trägt sie auf einem blauen Teller hinaus in den Garten." }
      ]
    }
  ];

  /* ---------------- 5. Wort-Training (60 Aufgaben, 15 pro Kategorie) ---------------- */

  var WORTTRAINING = [
    // Gegenteile (15)
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „mutig“?", optionen: ["ängstlich", "schnell", "laut"], richtig: 0, erklaerung: "Das Gegenteil von mutig ist ängstlich." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „hell“?", optionen: ["warm", "dunkel", "leicht"], richtig: 1, erklaerung: "Das Gegenteil von hell ist dunkel." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „fleißig“?", optionen: ["müde", "traurig", "faul"], richtig: 2, erklaerung: "Das Gegenteil von fleißig ist faul." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „früh“?", optionen: ["spät", "kurz", "eng"], richtig: 0, erklaerung: "Das Gegenteil von früh ist spät." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „scharf“ (bei einem Messer)?", optionen: ["weich", "stumpf", "kalt"], richtig: 1, erklaerung: "Ein Messer ist entweder scharf oder stumpf." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „geizig“?", optionen: ["großzügig", "lustig", "hungrig"], richtig: 0, erklaerung: "Das Gegenteil von geizig ist großzügig." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „schwer“?", optionen: ["klein", "leicht", "dünn"], richtig: 1, erklaerung: "Das Gegenteil von schwer ist leicht." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „breit“?", optionen: ["hoch", "rund", "schmal"], richtig: 2, erklaerung: "Das Gegenteil von breit ist schmal." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „glatt“?", optionen: ["rau", "nass", "weich"], richtig: 0, erklaerung: "Das Gegenteil von glatt ist rau." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „sauber“?", optionen: ["trocken", "schmutzig", "alt"], richtig: 1, erklaerung: "Das Gegenteil von sauber ist schmutzig." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „voll“?", optionen: ["offen", "fertig", "leer"], richtig: 2, erklaerung: "Das Gegenteil von voll ist leer." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „tief“ (bei einem Fluss)?", optionen: ["flach", "kalt", "lang"], richtig: 0, erklaerung: "Das Gegenteil von tief ist flach." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „laut“?", optionen: ["langsam", "leise", "kurz"], richtig: 1, erklaerung: "Das Gegenteil von laut ist leise." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „süß“ (bei einer Zitrone)?", optionen: ["heiß", "hart", "sauer"], richtig: 2, erklaerung: "Das Gegenteil von süß ist sauer." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „schnell“?", optionen: ["langsam", "müde", "leise"], richtig: 0, erklaerung: "Das Gegenteil von schnell ist langsam." },

    // Einzahl -> Mehrzahl (15)
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „die Maus“?", optionen: ["die Mausen", "die Mäuse", "die Maüse"], richtig: 1, erklaerung: "Eine Maus → viele Mäuse (aus au wird äu)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „das Buch“?", optionen: ["die Buchs", "die Buche", "die Bücher"], richtig: 2, erklaerung: "Ein Buch → viele Bücher." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Apfel“?", optionen: ["die Äpfel", "die Apfeln", "die Epfel"], richtig: 0, erklaerung: "Ein Apfel → viele Äpfel (mit Ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „das Blatt“?", optionen: ["die Blatts", "die Blätter", "die Bletter"], richtig: 1, erklaerung: "Ein Blatt → viele Blätter (mit ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „die Gans“?", optionen: ["die Gansen", "die Gense", "die Gänse"], richtig: 2, erklaerung: "Eine Gans → viele Gänse (aus a wird ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Vogel“?", optionen: ["die Vögel", "die Vogels", "die Vogeln"], richtig: 0, erklaerung: "Ein Vogel → viele Vögel." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „das Haus“?", optionen: ["die Hausen", "die Häuser", "die Heuser"], richtig: 1, erklaerung: "Ein Haus → viele Häuser (aus au wird äu)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Baum“?", optionen: ["die Baume", "die Beume", "die Bäume"], richtig: 2, erklaerung: "Ein Baum → viele Bäume (aus au wird äu)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „die Hand“?", optionen: ["die Hände", "die Handen", "die Hende"], richtig: 0, erklaerung: "Eine Hand → zwei Hände (mit ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Zahn“?", optionen: ["die Zahne", "die Zähne", "die Zehne"], richtig: 1, erklaerung: "Ein Zahn → viele Zähne (mit ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „das Dorf“?", optionen: ["die Dorfe", "die Dorfs", "die Dörfer"], richtig: 2, erklaerung: "Ein Dorf → viele Dörfer (mit ö)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Wald“?", optionen: ["die Wälder", "die Walde", "die Welder"], richtig: 0, erklaerung: "Ein Wald → viele Wälder (mit ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Fuß“?", optionen: ["die Fuße", "die Füße", "die Füsse"], richtig: 1, erklaerung: "Ein Fuß → zwei Füße (langes ü mit ß)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Fluss“?", optionen: ["die Flusse", "die Flüße", "die Flüsse"], richtig: 2, erklaerung: "Ein Fluss → viele Flüsse (kurzes ü mit ss)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „die Nuss“?", optionen: ["die Nüsse", "die Nussen", "die Nüße"], richtig: 0, erklaerung: "Eine Nuss → viele Nüsse (kurzes ü mit ss)." },

    // Wortfamilien – Kuckucksei finden (15)
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „fahren“?", optionen: ["Fahrrad", "Fahrer", "Farbe"], richtig: 2, erklaerung: "Fahrrad und Fahrer kommen von „fahren“ – „Farbe“ hat einen ganz anderen Wortstamm." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „spielen“?", optionen: ["Spielzeug", "Spiegel", "Spielplatz"], richtig: 1, erklaerung: "Spielzeug und Spielplatz gehören zu „spielen“ – „Spiegel“ nicht." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „backen“?", optionen: ["Bäcker", "Backofen", "Packung"], richtig: 2, erklaerung: "Bäcker und Backofen kommen von „backen“ – „Packung“ kommt von „packen“." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „laufen“?", optionen: ["Läufer", "Laub", "Wettlauf"], richtig: 1, erklaerung: "Läufer und Wettlauf gehören zu „laufen“ – „Laub“ sind die Blätter am Baum." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „bauen“?", optionen: ["Bauklotz", "Baustelle", "Baum"], richtig: 2, erklaerung: "Bauklotz und Baustelle gehören zu „bauen“ – „Baum“ ist eine eigene Wortfamilie." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „schreiben“?", optionen: ["Schrei", "Schreibheft", "Schreiber"], richtig: 0, erklaerung: "Schreibheft und Schreiber kommen von „schreiben“ – „Schrei“ kommt von „schreien“." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „singen“?", optionen: ["Sänger", "sinken", "Gesang"], richtig: 1, erklaerung: "Sänger und Gesang gehören zu „singen“ – „sinken“ bedeutet etwas ganz anderes." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „lesen“?", optionen: ["Leser", "Lesezeichen", "leise"], richtig: 2, erklaerung: "Leser und Lesezeichen gehören zu „lesen“ – „leise“ hat einen anderen Wortstamm." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „sprechen“?", optionen: ["springen", "Sprache", "Gespräch"], richtig: 0, erklaerung: "Sprache und Gespräch gehören zu „sprechen“ – „springen“ gehört nicht dazu." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „fliegen“?", optionen: ["Flugzeug", "Fliese", "Flieger"], richtig: 1, erklaerung: "Flugzeug und Flieger kommen von „fliegen“ – eine „Fliese“ klebt an der Wand." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „lachen“?", optionen: ["Gelächter", "Lachanfall", "Laken"], richtig: 2, erklaerung: "Gelächter und Lachanfall gehören zu „lachen“ – ein „Laken“ ist ein Betttuch." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „malen“?", optionen: ["Mahlzeit", "Malkasten", "Maler"], richtig: 0, erklaerung: "Malkasten und Maler gehören zu „malen“ – „Mahlzeit“ gehört zum Essen." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „ziehen“?", optionen: ["Umzug", "Ziel", "Zug"], richtig: 1, erklaerung: "Umzug und Zug gehören zu „ziehen“ – „Ziel“ ist eine eigene Wortfamilie." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „schlafen“?", optionen: ["Schlafzimmer", "Schläfer", "schlagen"], richtig: 2, erklaerung: "Schlafzimmer und Schläfer gehören zu „schlafen“ – „schlagen“ nicht." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „kochen“?", optionen: ["Knochen", "Kochtopf", "Köchin"], richtig: 0, erklaerung: "Kochtopf und Köchin gehören zu „kochen“ – ein „Knochen“ ist etwas anderes." },

    // Zeitformen – Gegenwart -> Vergangenheit / Präteritum (15)
    { kategorie: "Vergangenheit", frage: "Heute geht er in den Park. Gestern ___ er in den Park.", optionen: ["ging", "gehte", "gang"], richtig: 0, erklaerung: "Die Vergangenheit von „gehen“ heißt „ging“." },
    { kategorie: "Vergangenheit", frage: "Heute liest sie ein Buch. Gestern ___ sie ein Buch.", optionen: ["lieste", "las", "leste"], richtig: 1, erklaerung: "Die Vergangenheit von „lesen“ heißt „las“." },
    { kategorie: "Vergangenheit", frage: "Heute schwimmt er im See. Gestern ___ er im See.", optionen: ["schwimmte", "schwumm", "schwamm"], richtig: 2, erklaerung: "Die Vergangenheit von „schwimmen“ heißt „schwamm“." },
    { kategorie: "Vergangenheit", frage: "Heute schreibt sie eine Karte. Gestern ___ sie eine Karte.", optionen: ["schrieb", "schreibte", "schrub"], richtig: 0, erklaerung: "Die Vergangenheit von „schreiben“ heißt „schrieb“." },
    { kategorie: "Vergangenheit", frage: "Heute fliegt der Vogel weg. Gestern ___ der Vogel weg.", optionen: ["fliegte", "flog", "flag"], richtig: 1, erklaerung: "Die Vergangenheit von „fliegen“ heißt „flog“." },
    { kategorie: "Vergangenheit", frage: "Heute hilft sie beim Backen. Gestern ___ sie beim Backen.", optionen: ["hilfte", "holf", "half"], richtig: 2, erklaerung: "Die Vergangenheit von „helfen“ heißt „half“." },
    { kategorie: "Vergangenheit", frage: "Heute singt er ein Lied. Gestern ___ er ein Lied.", optionen: ["sang", "singte", "sung"], richtig: 0, erklaerung: "Die Vergangenheit von „singen“ heißt „sang“." },
    { kategorie: "Vergangenheit", frage: "Heute läuft sie sehr schnell. Gestern ___ sie sehr schnell.", optionen: ["laufte", "lief", "luf"], richtig: 1, erklaerung: "Die Vergangenheit von „laufen“ heißt „lief“." },
    { kategorie: "Vergangenheit", frage: "Heute spricht er laut und klar. Gestern ___ er laut und klar.", optionen: ["sprechte", "sproch", "sprach"], richtig: 2, erklaerung: "Die Vergangenheit von „sprechen“ heißt „sprach“." },
    { kategorie: "Vergangenheit", frage: "Heute trinkt sie warmen Kakao. Gestern ___ sie warmen Kakao.", optionen: ["trank", "trinkte", "trunk"], richtig: 0, erklaerung: "Die Vergangenheit von „trinken“ heißt „trank“." },
    { kategorie: "Vergangenheit", frage: "Heute isst er einen Apfel. Gestern ___ er einen Apfel.", optionen: ["esste", "aß", "isste"], richtig: 1, erklaerung: "Die Vergangenheit von „essen“ heißt „aß“." },
    { kategorie: "Vergangenheit", frage: "Heute sieht sie einen Regenbogen. Gestern ___ sie einen Regenbogen.", optionen: ["sehte", "siehte", "sah"], richtig: 2, erklaerung: "Die Vergangenheit von „sehen“ heißt „sah“." },
    { kategorie: "Vergangenheit", frage: "Heute findet er eine Muschel. Gestern ___ er eine Muschel.", optionen: ["fand", "findete", "fund"], richtig: 0, erklaerung: "Die Vergangenheit von „finden“ heißt „fand“." },
    { kategorie: "Vergangenheit", frage: "Heute springt der Hund hoch. Gestern ___ der Hund hoch.", optionen: ["springte", "sprang", "sprung"], richtig: 1, erklaerung: "Die Vergangenheit von „springen“ heißt „sprang“." },
    { kategorie: "Vergangenheit", frage: "Heute nimmt sie ihren Schirm mit. Gestern ___ sie ihren Schirm mit.", optionen: ["nehmte", "nimmte", "nahm"], richtig: 2, erklaerung: "Die Vergangenheit von „nehmen“ heißt „nahm“." }
  ];

  /* ---------------- Runden erzeugen (mit Sitzungs-Merkzettel gegen direkte Wiederholung) ---------------- */

  var zaehler = 0;
  var zuletztProThema = {};

  function neueId(praefix) {
    zaehler += 1;
    return praefix + "-" + zaehler;
  }

  function waehleOhneWiederholung(themaId, liste, anzahl, schluesselFn) {
    var gemerkt = zuletztProThema[themaId] || [];
    var frisch = liste.filter(function (e) { return gemerkt.indexOf(schluesselFn(e)) === -1; });
    var auswahl;
    if (frisch.length >= anzahl) {
      auswahl = mische(frisch).slice(0, anzahl);
    } else {
      var rest = liste.filter(function (e) { return gemerkt.indexOf(schluesselFn(e)) !== -1; });
      auswahl = mische(frisch).concat(mische(rest).slice(0, anzahl - frisch.length));
    }
    var neuGemerkt = auswahl.map(schluesselFn).concat(gemerkt);
    var maxMerken = Math.min(liste.length - anzahl, anzahl * 2);
    zuletztProThema[themaId] = maxMerken > 0 ? neuGemerkt.slice(0, maxMerken) : [];
    return auswahl;
  }

  function erzeuge(themaId, welt, letzteLeseId) {
    var info = THEMEN.find(function (t) { return t.id === themaId; });
    if (!info) { throw new Error("Unbekannte Deutsch-Übung: " + themaId); }

    if (themaId === "rechtschreibung") {
      var rAuswahl = waehleOhneWiederholung(themaId, RECHTSCHREIBUNG, info.anzahl, function (a) { return a.satz; })
        .map(function (a) {
          return {
            id: neueId("rs"), typ: "auswahl",
            badge: a.regel,
            frage: a.satz,
            optionen: a.optionen.slice(),
            richtig: a.richtig,
            erklaerung: a.erklaerung
          };
        });
      return { thema: info, aufgaben: rAuswahl };
    }

    if (themaId === "wortarten") {
      var wAuswahl = waehleOhneWiederholung(themaId, WORTARTEN, info.anzahl, function (a) { return a.satz; })
        .map(function (a) {
          return {
            id: neueId("wa"), typ: "wortart",
            satz: a.satz,
            wort: a.wort,
            optionen: WORTARTEN_LABELS.slice(),
            richtig: a.art,
            erklaerung: a.erklaerung
          };
        });
      return { thema: info, aufgaben: wAuswahl };
    }

    if (themaId === "satzbau") {
      var sAuswahl = waehleOhneWiederholung(themaId, SATZBAU, info.anzahl, function (a) { return a.erklaerung; })
        .map(function (a) {
          var gemischt = mische(a.teile);
          if (gemischt.every(function (t, i) { return t === a.teile[i]; })) {
            gemischt = a.teile.slice().reverse();
          }
          return {
            id: neueId("sb"), typ: "ordnen",
            frage: "Klicke die Satzbausteine in der richtigen Reihenfolge an:",
            bausteine: gemischt,
            loesung: a.teile.slice(),
            erklaerung: "Richtiger Satz: „" + a.erklaerung + "“"
          };
        });
      return { thema: info, aufgaben: sAuswahl };
    }

    if (themaId === "lesen") {
      // Bevorzuge eine Geschichte der gewählten Deutsch-Welt (ohne sofortige Wiederholung).
      var passend = LESETEXTE.filter(function (g) { return g.welt === welt && g.id !== letzteLeseId; });
      if (passend.length === 0) {
        passend = LESETEXTE.filter(function (g) { return g.id !== letzteLeseId; });
      }
      var geschichte = mische(passend)[0];
      var fragen = geschichte.fragen.map(function (f) {
        return {
          id: neueId("ls"), typ: "auswahl",
          frage: f.frage,
          optionen: f.optionen.slice(),
          richtig: f.richtig,
          erklaerung: f.erklaerung
        };
      });
      return {
        thema: info,
        lesetext: { id: geschichte.id, welt: geschichte.welt, titel: geschichte.titel, text: geschichte.text },
        aufgaben: fragen
      };
    }

    // worttraining
    var wtAuswahl = waehleOhneWiederholung(themaId, WORTTRAINING, info.anzahl, function (a) { return a.frage; })
      .map(function (a) {
        return {
          id: neueId("wt"), typ: "auswahl",
          badge: a.kategorie,
          frage: a.frage,
          optionen: a.optionen.slice(),
          richtig: a.richtig,
          erklaerung: a.erklaerung
        };
      });
    return { thema: info, aufgaben: wtAuswahl };
  }

  return {
    THEMEN: THEMEN,
    WORTARTEN_LABELS: WORTARTEN_LABELS,
    RECHTSCHREIBUNG: RECHTSCHREIBUNG,
    WORTARTEN: WORTARTEN,
    SATZBAU: SATZBAU,
    LESETEXTE: LESETEXTE,
    WORTTRAINING: WORTTRAINING,
    erzeuge: erzeuge
  };
});
