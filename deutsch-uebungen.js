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

  /* ---------------- 1. Rechtschreib-Detektiv ---------------- */

  var RECHTSCHREIBUNG = [
    // Groß- und Kleinschreibung
    { regel: "Groß oder klein?", satz: "Der kleine ___ rennt über die Wiese.", optionen: ["Hund", "hund"], richtig: 0, erklaerung: "„der Hund“ ist ein Namenwort (Nomen) – Namenwörter schreibt man groß." },
    { regel: "Groß oder klein?", satz: "Im Garten ___ bunte Blumen.", optionen: ["Blühen", "blühen"], richtig: 1, erklaerung: "„blühen“ ist ein Tunwort (Verb) – Tunwörter schreibt man im Satz klein." },
    { regel: "Groß oder klein?", satz: "Meine ___ hat heute Geburtstag.", optionen: ["Freundin", "freundin"], richtig: 0, erklaerung: "„die Freundin“ ist ein Namenwort (Nomen) und wird großgeschrieben." },
    { regel: "Groß oder klein?", satz: "Der Schneemann hat eine ___ Nase.", optionen: ["Lange", "lange"], richtig: 1, erklaerung: "„lange“ ist ein Wiewort (Adjektiv) – Wiewörter schreibt man klein." },
    { regel: "Groß oder klein?", satz: "Am Abend lesen wir eine spannende ___.", optionen: ["Geschichte", "geschichte"], richtig: 0, erklaerung: "„die Geschichte“ ist ein Namenwort (Nomen) – mit Begleiter „eine“ groß." },
    { regel: "Groß oder klein?", satz: "Der Hamster frisst ___ einen Sonnenblumenkern.", optionen: ["Schnell", "schnell"], richtig: 1, erklaerung: "„schnell“ beschreibt, wie er frisst (Wiewort) → kleingeschrieben." },

    // ie oder i
    { regel: "ie oder i?", satz: "Wir spielen heute ein lustiges ___.", optionen: ["Spil", "Spiel"], richtig: 1, erklaerung: "Man spricht ein langes i → Spiel schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Auf der Blume sitzt eine fleißige ___.", optionen: ["Biene", "Bine"], richtig: 0, erklaerung: "Langes i in der betonten Silbe → Biene mit ie." },
    { regel: "ie oder i?", satz: "Oma schreibt uns einen langen ___.", optionen: ["Brif", "Brief"], richtig: 1, erklaerung: "Langes i → Brief schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Im ___ schneit es dicke Flocken.", optionen: ["Wienter", "Winter"], richtig: 1, erklaerung: "Kurzes i vor nt → Winter schreibt man mit einfachem i." },
    { regel: "ie oder i?", satz: "Die Pferde laufen über die grüne ___.", optionen: ["Wiese", "Wise"], richtig: 0, erklaerung: "Langes i → Wiese schreibt man mit ie." },
    { regel: "ie oder i?", satz: "Das kleine ___ lacht ganz laut.", optionen: ["Kiend", "Kind"], richtig: 1, erklaerung: "Kurzes i → Kind schreibt man mit einfachem i." },

    // Doppelmitlaut, ck und tz
    { regel: "Doppelmitlaut", satz: "Heute scheint die warme ___.", optionen: ["Sone", "Sonne"], richtig: 1, erklaerung: "Nach dem kurzen o folgt ein doppeltes n → Sonne." },
    { regel: "Doppelmitlaut", satz: "Der Welpe trinkt frisches ___.", optionen: ["Wasser", "Waser"], richtig: 0, erklaerung: "Nach dem kurzen a folgt ein doppeltes s → Wasser." },
    { regel: "ck oder k?", satz: "Der ___ backt frühmorgens knusprige Semmeln.", optionen: ["Bäker", "Bäcker"], richtig: 1, erklaerung: "Nach dem kurzen ä steht ck → Bäcker." },
    { regel: "ck oder k?", satz: "Die ___ schnurrt gemütlich auf dem Sofa.", optionen: ["Katze", "Kaze"], richtig: 0, erklaerung: "Nach dem kurzen a steht tz → Katze." },
    { regel: "tz oder z?", satz: "Im Winter trage ich eine warme ___.", optionen: ["Müze", "Mütze"], richtig: 1, erklaerung: "Nach dem kurzen ü steht tz → Mütze." },
    { regel: "ck oder k?", satz: "Die ___ trinkt gerne kühle Milch.", optionen: ["Wolcke", "Wolke"], richtig: 1, erklaerung: "Nach l, n, r steht nie ck, immer einfaches k → Wolke (Tipp: hier passt das Wort Wolke – merk dir: nach l steht nur k!)." },

    // b/p, d/t, g/k am Wortende (Verlängerungstrick)
    { regel: "d oder t?", satz: "Wuffi ist ein fröhlicher ___.", optionen: ["Hund", "Hunt"], richtig: 0, erklaerung: "Verlängerungstrick: viele Hun-de → man hört das d!" },
    { regel: "g oder k?", satz: "Wir wandern auf einen hohen ___.", optionen: ["Berk", "Berg"], richtig: 1, erklaerung: "Verlängerungstrick: viele Ber-ge → man hört das g!" },
    { regel: "b oder p?", satz: "Im ___ liegen frische Äpfel.", optionen: ["Korb", "Korp"], richtig: 0, erklaerung: "Verlängerungstrick: viele Kör-be → man hört das b!" },
    { regel: "d oder t?", satz: "Auf der Koppel steht ein braunes ___.", optionen: ["Pfert", "Pferd"], richtig: 1, erklaerung: "Verlängerungstrick: viele Pfer-de → man hört das d!" },
    { regel: "g oder k?", satz: "Im Märchen wohnt ein lustiger ___.", optionen: ["Zwerg", "Zwerk"], richtig: 0, erklaerung: "Verlängerungstrick: viele Zwer-ge → man hört das g!" },
    { regel: "d oder t?", satz: "Am Morgen fährt mein ___ sehr schnell.", optionen: ["Fahrrat", "Fahrrad"], richtig: 1, erklaerung: "Verlängerungstrick: viele Fahrrä-der → man hört das d!" },

    // ä/e und äu/eu (Ableitungstrick)
    { regel: "ä oder e?", satz: "Im Herbst fallen die bunten ___.", optionen: ["Blätter", "Bletter"], richtig: 0, erklaerung: "Ableitungstrick: ein Blatt → viele Blätter (mit ä)." },
    { regel: "äu oder eu?", satz: "Im Wald stehen viele hohe ___.", optionen: ["Beume", "Bäume"], richtig: 1, erklaerung: "Ableitungstrick: ein Baum → viele Bäume (mit äu)." },
    { regel: "ä oder e?", satz: "Vor dem Essen wasche ich mir die ___.", optionen: ["Hände", "Hende"], richtig: 0, erklaerung: "Ableitungstrick: eine Hand → zwei Hände (mit ä)." },
    { regel: "äu oder eu?", satz: "Zwei kleine ___ huschen über das Feld.", optionen: ["Meuse", "Mäuse"], richtig: 1, erklaerung: "Ableitungstrick: eine Maus → zwei Mäuse (mit äu)." },
    { regel: "äu oder eu?", satz: "In der Nacht habe ich schöne ___.", optionen: ["Träume", "Treume"], richtig: 0, erklaerung: "Ableitungstrick: ein Traum → viele Träume (mit äu)." },
    { regel: "ä oder e?", satz: "Die roten ___ schmecken süß und knackig.", optionen: ["Epfel", "Äpfel"], richtig: 1, erklaerung: "Ableitungstrick: ein Apfel → viele Äpfel (mit ä)." }
  ];

  // Korrektur Satz für Wolke (sinnvoller Kindersatz):
  RECHTSCHREIBUNG[17] = {
    regel: "ck oder k?",
    satz: "Am blauen Himmel schwebt eine weiße ___.",
    optionen: ["Wolcke", "Wolke"],
    richtig: 1,
    erklaerung: "Nach l, n oder r steht niemals ck, sondern immer einfaches k → Wolke."
  };

  /* ---------------- 2. Wortarten sortieren ---------------- */

  var WORTARTEN = [
    // 0 = Namenwort (Nomen), 1 = Tunwort (Verb), 2 = Wiewort (Adjektiv)
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
    { satz: "Die **knusprige** Semmel riecht wunderbar.", wort: "knusprige", art: 2, erklaerung: "Wie ist die Semmel? knusprig → Wiewort (Adjektiv)." }
  ];

  /* ---------------- 3. Satzbau-Puzzle ---------------- */

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
    { teile: ["Im Herbst", "sammeln", "wir", "glänzende Kastanien", "im Wald."], erklaerung: "Im Herbst sammeln wir glänzende Kastanien im Wald." }
  ];

  /* ---------------- 4. Leseverständnis (Welt-Geschichten) ---------------- */

  var LESETEXTE = [
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
    }
  ];

  /* ---------------- 5. Wort-Training (Gegenteile, Mehrzahl, Wortfamilien, Zeit) ---------------- */

  var WORTTRAINING = [
    // Gegenteile
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „mutig“?", optionen: ["ängstlich", "schnell", "laut"], richtig: 0, erklaerung: "Das Gegenteil von mutig ist ängstlich." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „hell“?", optionen: ["warm", "dunkel", "leicht"], richtig: 1, erklaerung: "Das Gegenteil von hell ist dunkel." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „fleißig“?", optionen: ["müde", "traurig", "faul"], richtig: 2, erklaerung: "Das Gegenteil von fleißig ist faul." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „früh“?", optionen: ["spät", "kurz", "eng"], richtig: 0, erklaerung: "Das Gegenteil von früh ist spät." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „scharf“ (bei einem Messer)?", optionen: ["weich", "stumpf", "kalt"], richtig: 1, erklaerung: "Ein Messer ist entweder scharf oder stumpf." },
    { kategorie: "Gegenteil", frage: "Was ist das Gegenteil von „geizig“?", optionen: ["großzügig", "lustig", "hungrig"], richtig: 0, erklaerung: "Das Gegenteil von geizig ist großzügig." },

    // Einzahl -> Mehrzahl
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „die Maus“?", optionen: ["die Mausen", "die Mäuse", "die Maüse"], richtig: 1, erklaerung: "Eine Maus → viele Mäuse (aus au wird äu)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „das Buch“?", optionen: ["die Buchs", "die Buche", "die Bücher"], richtig: 2, erklaerung: "Ein Buch → viele Bücher." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Apfel“?", optionen: ["die Äpfel", "die Apfeln", "die Epfel"], richtig: 0, erklaerung: "Ein Apfel → viele Äpfel (mit Ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „das Blatt“?", optionen: ["die Blatts", "die Blätter", "die Bletter"], richtig: 1, erklaerung: "Ein Blatt → viele Blätter (mit ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „die Gans“?", optionen: ["die Gansen", "die Gense", "die Gänse"], richtig: 2, erklaerung: "Eine Gans → viele Gänse (aus a wird ä)." },
    { kategorie: "Mehrzahl", frage: "Wie heißt die Mehrzahl von „der Vogel“?", optionen: ["die Vögel", "die Vogels", "die Vogeln"], richtig: 0, erklaerung: "Ein Vogel → viele Vögel." },

    // Wortfamilien (Kuckucksei finden)
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „fahren“?", optionen: ["Fahrrad", "Fahrer", "Farbe"], richtig: 2, erklaerung: "Fahrrad und Fahrer kommen von „fahren“ – „Farbe“ hat einen ganz anderen Wortstamm." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „spielen“?", optionen: ["Spielzeug", "Spiegel", "Spielplatz"], richtig: 1, erklaerung: "Spielzeug und Spielplatz gehören zu „spielen“ – „Spiegel“ nicht." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „backen“?", optionen: ["Bäcker", "Backofen", "Packung"], richtig: 2, erklaerung: "Bäcker und Backofen kommen von „backen“ – „Packung“ kommt von „packen“." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „laufen“?", optionen: ["Läufer", "Laub", "Wettlauf"], richtig: 1, erklaerung: "Läufer und Wettlauf gehören zu „laufen“ – „Laub“ sind die Blätter am Baum." },
    { kategorie: "Wortfamilie", frage: "Welches Wort gehört NICHT zur Wortfamilie „bauen“?", optionen: ["Bauklotz", "Baustelle", "Baum"], richtig: 2, erklaerung: "Bauklotz und Baustelle gehören zu „bauen“ – „Baum“ ist eine eigene Wortfamilie." },

    // Zeitformen (Gegenwart -> Vergangenheit / Präteritum)
    { kategorie: "Vergangenheit", frage: "Heute geht er in den Park. Gestern ___ er in den Park.", optionen: ["ging", "gehte", "gang"], richtig: 0, erklaerung: "Die Vergangenheit von „gehen“ heißt „ging“." },
    { kategorie: "Vergangenheit", frage: "Heute liest sie ein Buch. Gestern ___ sie ein Buch.", optionen: ["lieste", "las", "leste"], richtig: 1, erklaerung: "Die Vergangenheit von „lesen“ heißt „las“." },
    { kategorie: "Vergangenheit", frage: "Heute schwimmt er im See. Gestern ___ er im See.", optionen: ["schwimmte", "schwumm", "schwamm"], richtig: 2, erklaerung: "Die Vergangenheit von „schwimmen“ heißt „schwamm“." },
    { kategorie: "Vergangenheit", frage: "Heute schreibt sie eine Karte. Gestern ___ sie eine Karte.", optionen: ["schrieb", "schreibte", "schrub"], richtig: 0, erklaerung: "Die Vergangenheit von „schreiben“ heißt „schrieb“." },
    { kategorie: "Vergangenheit", frage: "Heute fliegt der Vogel weg. Gestern ___ der Vogel weg.", optionen: ["fliegte", "flog", "flag"], richtig: 1, erklaerung: "Die Vergangenheit von „fliegen“ heißt „flog“." },
    { kategorie: "Vergangenheit", frage: "Heute hilft sie beim Backen. Gestern ___ sie beim Backen.", optionen: ["hilfte", "holf", "half"], richtig: 2, erklaerung: "Die Vergangenheit von „helfen“ heißt „half“." },
    { kategorie: "Vergangenheit", frage: "Heute singt er ein Lied. Gestern ___ er ein Lied.", optionen: ["sang", "singte", "sung"], richtig: 0, erklaerung: "Die Vergangenheit von „singen“ heißt „sang“." }
  ];

  /* ---------------- Runden erzeugen ---------------- */

  var zaehler = 0;
  function neueId(praefix) {
    zaehler += 1;
    return praefix + "-" + zaehler;
  }

  function erzeuge(themaId, welt, letzteLeseId) {
    var info = THEMEN.find(function (t) { return t.id === themaId; });
    if (!info) { throw new Error("Unbekannte Deutsch-Übung: " + themaId); }

    if (themaId === "rechtschreibung") {
      var rAuswahl = mische(RECHTSCHREIBUNG).slice(0, info.anzahl).map(function (a) {
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
      var wAuswahl = mische(WORTARTEN).slice(0, info.anzahl).map(function (a) {
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
      var sAuswahl = mische(SATZBAU).slice(0, info.anzahl).map(function (a) {
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
    var wtAuswahl = mische(WORTTRAINING).slice(0, info.anzahl).map(function (a) {
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
