/* ------------------------------------------------------------------
   sprechtraining.js
   20 Geschichten für das Sprechtraining (3. Klasse Volksschule) – endlos.

   Jede Geschichte (6 Sätze, alle Text-MP3s für Thorsten & Ramona vorhanden) enthält:
   - tag           : Nummer 1–20 (Audio-Kürzel tagNN-text.mp3)
   - titel         : Thema der Geschichte
   - text          : 6 lebendige Sätze (wird mit Thorsten/Ramona vorgelesen)
   - fragenSets    : 4 alternative Fragensätze mit je 5 Verständnisfragen
                     (Radio-Einzelauswahl + Checkbox-Mehrfachauswahl)
   - satzPuzzle    : 4 Sätze aus der Geschichte als Wortpuzzle
   - satzVerbinden : 4 Satzpaare mit Bindewort (weil, deshalb, aber, danach)
   - wichtigePunkte: 4 chronologische Erzähl-Stationen
   ------------------------------------------------------------------ */
(function (umgebung, factory) {
  "use strict";
  var modul = factory();
  if (typeof module !== "undefined" && module.exports) {
    module.exports = modul;
  } else {
    umgebung.SPRECHTRAINING = modul;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalisiereFrage(f) {
    return {
      frage: f.frage,
      optionen: f.optionen.slice(),
      richtig: f.richtig.slice(),
      antwort: f.richtig.map(function (i) { return f.optionen[i]; }).join(", ")
    };
  }

  /* Aus 10 handgemachten Fragen (Indizes 2, 4, 7, 9 = Mehrfachauswahl) entstehen
     4 ausgewogene 5er-Fragensätze (je 3 Einzel- + 2 Mehrfachauswahl-Fragen). */
  function baueFragenSets(pool) {
    const q = pool.map(normalisiereFrage);
    return [
      [q[0], q[1], q[2], q[3], q[4]],
      [q[5], q[6], q[7], q[8], q[9]],
      [q[0], q[2], q[4], q[6], q[8]],
      [q[1], q[3], q[5], q[7], q[9]]
    ];
  }

  function baueEinheit(roh) {
    const nr = ("0" + roh.tag).slice(-2);
    return {
      tag: roh.tag,
      titel: roh.titel,
      text: roh.text,
      bild: "bilder/geschichten/tag" + nr + ".webp",
      fragenSets: baueFragenSets(roh.fragen),
      satzPuzzle: roh.satzPuzzle,
      satzVerbinden: roh.satzVerbinden,
      wichtigePunkte: roh.wichtigePunkte
    };
  }

  const ROH_EINHEITEN = [
    {
      tag: 1,
      titel: "Emma im Garten",
      text: "Emma geht am Nachmittag in den sonnigen Garten. Barfuß läuft sie über das weiche grüne Gras. Neben einem blühenden Blumenbeet bleibt sie plötzlich stehen. Dort sieht sie ihren kleinen roten Ball im Schatten liegen. Fröhlich bückt sich Emma und hebt den Ball auf. Drüben bei der Schaukel winkt ihr Bruder, und Emma wirft ihm den Ball zu.",
      fragen: [
        { frage: "Wann geht Emma in den Garten?", optionen: ["Am Nachmittag", "Am frühen Morgen", "In der Nacht"], richtig: [0] },
        { frage: "Wie läuft Emma über das Gras?", optionen: ["Mit Gummistiefeln", "Barfuß", "Auf Rollschuhen"], richtig: [1] },
        { frage: "Was passt zum Ball in der Geschichte?", optionen: ["Er ist klein", "Er ist rot", "Er ist blau", "Er liegt im Schatten"], richtig: [0, 1, 3] },
        { frage: "Wo bleibt Emma plötzlich stehen?", optionen: ["Vor der Gartentür", "Neben einem blühenden Blumenbeet", "Auf der Terrasse"], richtig: [1] },
        { frage: "Was stimmt über Emmas Bruder und das Ende?", optionen: ["Er steht bei der Schaukel", "Er winkt Emma zu", "Er schläft im Haus", "Emma wirft ihm den Ball zu"], richtig: [0, 1, 3] },
        { frage: "Wie ist das Wetter im Garten?", optionen: ["Regnerisch", "Sonnig", "Neblig"], richtig: [1] },
        { frage: "Wie ist Emma gelaunt, als sie den Ball aufhebt?", optionen: ["Fröhlich", "Ärgerlich", "Müde"], richtig: [0] },
        { frage: "Wie wird das Gras im Garten beschrieben?", optionen: ["Weich", "Trocken", "Grün", "Stachelig"], richtig: [0, 2] },
        { frage: "Wo wartet ihr Bruder?", optionen: ["In der Küche", "Drüben bei der Schaukel", "Hinter dem Gartenzaun"], richtig: [1] },
        { frage: "Welche Dinge macht Emma in der Geschichte?", optionen: ["Sie läuft über das Gras", "Sie bückt sich nach dem Ball", "Sie gießt die Blumen", "Sie wirft den Ball ihrem Bruder zu"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Am Nachmittag", "geht", "Emma", "in den sonnigen Garten."], satz: "Am Nachmittag geht Emma in den sonnigen Garten." },
        { teile: ["Barfuß", "läuft", "sie", "über das weiche grüne Gras."], satz: "Barfuß läuft sie über das weiche grüne Gras." },
        { teile: ["Fröhlich", "bückt sich", "Emma", "und hebt den Ball auf."], satz: "Fröhlich bückt sich Emma und hebt den Ball auf." },
        { teile: ["Emma", "wirft", "ihrem Bruder", "den kleinen roten Ball zu."], satz: "Emma wirft ihrem Bruder den kleinen roten Ball zu." }
      ],
      satzVerbinden: [
        { teil1: "Emma bleibt am Blumenbeet stehen,", teil2: "sie dort ihren roten Ball sieht.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Emma bleibt am Blumenbeet stehen, weil sie dort ihren roten Ball sieht." },
        { teil1: "Das Gras ist weich und warm,", teil2: "läuft Emma barfuß durch den Garten.", optionen: ["aber", "deshalb", "weil"], richtig: 1, loesung: "Das Gras ist weich und warm, deshalb läuft Emma barfuß durch den Garten." },
        { teil1: "Emma hebt den Ball auf,", teil2: "wirft sie ihn ihrem Bruder zu.", optionen: ["weil", "aber", "danach"], richtig: 2, loesung: "Emma hebt den Ball auf, danach wirft sie ihn ihrem Bruder zu." },
        { teil1: "Der Garten ist sonnig,", teil2: "der rote Ball liegt im Schatten.", optionen: ["weil", "aber", "danach"], richtig: 1, loesung: "Der Garten ist sonnig, aber der rote Ball liegt im Schatten." }
      ],
      wichtigePunkte: ["Garten am Nachmittag", "roter Ball im Schatten", "hebt den Ball auf", "wirft Bruder zu"]
    },
    {
      tag: 2,
      titel: "Ben füttert die Katze",
      text: "Ben kommt nach der Schule gut gelaunt nach Hause. Im Flur stellt er seine schwere Schultasche ab. Sofort hört er ein leises, freundliches Miauen aus der Küche. Seine Katze wartet dort schon ungeduldig neben ihrem leeren Napf. Ben streichelt ihr weiches Fell und füllt Futter in die Schüssel. Danach gibt er ihr noch frisches Wasser, und die Katze frisst genüsslich.",
      fragen: [
        { frage: "Wann kommt Ben nach Hause?", optionen: ["Nach dem Schwimmen", "Nach der Schule", "Am Sonntagmorgen"], richtig: [1] },
        { frage: "Wo stellt Ben seine Schultasche ab?", optionen: ["Im Flur", "In der Küche", "Auf dem Bett"], richtig: [0] },
        { frage: "Was bekommt die Katze von Ben?", optionen: ["Futter in die Schüssel", "Einen neuen Ball", "Frisches Wasser", "Ein Stück Kuchen"], richtig: [0, 2] },
        { frage: "Was hört Ben sofort aus der Küche?", optionen: ["Ein lautes Bellen", "Ein leises, freundliches Miauen", "Musik aus dem Radio"], richtig: [1] },
        { frage: "Was stimmt über die Katze in der Geschichte?", optionen: ["Sie wartet ungeduldig in der Küche", "Ihr Napf ist leer", "Sie schläft auf dem Sofa", "Sie frisst am Ende genüsslich"], richtig: [0, 1, 3] },
        { frage: "Wie ist Ben gelaunt, als er heimkommt?", optionen: ["Schlecht gelaunt", "Gut gelaunt", "Sehr traurig"], richtig: [1] },
        { frage: "Wie ist seine Schultasche?", optionen: ["Ganz leicht", "Schwer", "Kaputt"], richtig: [1] },
        { frage: "Was tut Ben für seine Katze?", optionen: ["Er streichelt ihr weiches Fell", "Er füllt Futter ein", "Er badet sie", "Er gibt ihr frisches Wasser"], richtig: [0, 1, 3] },
        { frage: "Woneben wartet die Katze?", optionen: ["Neben ihrem leeren Napf", "Neben dem Fenster", "Neben der Schultasche"], richtig: [0] },
        { frage: "Welche Aussagen stimmen in der Geschichte?", optionen: ["Ben kommt nach der Schule heim", "Die Katze hat weiches Fell", "Die Katze trinkt Milch", "Die Tasche steht im Flur"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Ben", "kommt", "nach der Schule", "gut gelaunt nach Hause."], satz: "Ben kommt nach der Schule gut gelaunt nach Hause." },
        { teile: ["Im Flur", "stellt", "er", "seine schwere Schultasche ab."], satz: "Im Flur stellt er seine schwere Schultasche ab." },
        { teile: ["Seine Katze", "wartet", "ungeduldig", "neben ihrem leeren Napf."], satz: "Seine Katze wartet ungeduldig neben ihrem leeren Napf." },
        { teile: ["Danach", "gibt", "Ben", "ihr noch frisches Wasser."], satz: "Danach gibt Ben ihr noch frisches Wasser." }
      ],
      satzVerbinden: [
        { teil1: "Die Katze miaut in der Küche,", teil2: "ihr Napf ganz leer ist.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Die Katze miaut in der Küche, weil ihr Napf ganz leer ist." },
        { teil1: "Ben streichelt seine Katze,", teil2: "gibt er ihr Futter und Wasser.", optionen: ["aber", "danach", "weil"], richtig: 1, loesung: "Ben streichelt seine Katze, danach gibt er ihr Futter und Wasser." },
        { teil1: "Bens Schultasche ist schwer,", teil2: "stellt er sie sofort im Flur ab.", optionen: ["deshalb", "weil", "aber"], richtig: 0, loesung: "Bens Schultasche ist schwer, deshalb stellt er sie sofort im Flur ab." },
        { teil1: "Zuerst ist die Katze ungeduldig,", teil2: "dann frisst sie ganz genüsslich.", optionen: ["weil", "aber", "deshalb"], richtig: 1, loesung: "Zuerst ist die Katze ungeduldig, aber dann frisst sie ganz genüsslich." }
      ],
      wichtigePunkte: ["nach der Schule heim", "Katze miaut in Küche", "Futter in Schüssel", "frisches Wasser"]
    },
    {
      tag: 3,
      titel: "Ein Besuch am Spielplatz",
      text: "Am Samstag geht Sara mit ihrem Vater auf den Spielplatz. Die Sonne scheint hell vom blauen Himmel. Auf dem Platz lachen und spielen schon viele andere Kinder. Ihr Vater setzt sich auf eine Holzbank und winkt ihr zu. Zuerst klettert Sara geschickt bis ganz oben auf das hohe Klettergerüst. Danach rutscht sie mit einem fröhlichen Juchzer die große Rutsche hinunter.",
      fragen: [
        { frage: "Wann geht Sara auf den Spielplatz?", optionen: ["Am Montag", "Am Samstag", "Am Mittwoch"], richtig: [1] },
        { frage: "Mit wem geht Sara auf den Spielplatz?", optionen: ["Mit ihrer Oma", "Mit ihrem Vater", "Mit ihrem Bruder"], richtig: [1] },
        { frage: "Was macht Sara auf dem Spielplatz?", optionen: ["Sie klettert auf das Klettergerüst", "Sie schaukelt ganz hoch", "Sie rutscht die große Rutsche hinunter", "Sie baut eine Sandburg"], richtig: [0, 2] },
        { frage: "Worauf setzt sich ihr Vater?", optionen: ["Auf eine Holzbank", "Ins Gras", "Auf eine Mauer"], richtig: [0] },
        { frage: "Wie ist das Wetter in der Geschichte?", optionen: ["Die Sonne scheint hell", "Der Himmel ist blau", "Es regnet leicht", "Starker Wind weht"], richtig: [0, 1] },
        { frage: "Ist Sara allein auf dem Spielplatz?", optionen: ["Ja, niemand sonst ist da", "Nein, viele andere Kinder lachen und spielen dort", "Nur ein Hund ist dort"], richtig: [1] },
        { frage: "Wie hoch klettert Sara auf das Klettergerüst?", optionen: ["Nur zwei Sprossen", "Bis zur Mitte", "Bis ganz oben"], richtig: [2] },
        { frage: "Was tut Saras Vater auf dem Spielplatz?", optionen: ["Er setzt sich auf eine Holzbank", "Er klettert mit hinauf", "Er winkt ihr zu", "Er geht einkaufen"], richtig: [0, 2] },
        { frage: "Was ruft Sara beim Hinunterrutschen?", optionen: ["Einen fröhlichen Juchzer", "Um Hilfe", "Gar nichts"], richtig: [0] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Die Geschichte spielt am Samstag", "Sara klettert geschickt", "Die Rutsche ist sehr klein", "Andere Kinder lachen auf dem Platz"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Am Samstag", "geht", "Sara", "mit ihrem Vater", "auf den Spielplatz."], satz: "Am Samstag geht Sara mit ihrem Vater auf den Spielplatz." },
        { teile: ["Die Sonne", "scheint", "hell", "vom blauen Himmel."], satz: "Die Sonne scheint hell vom blauen Himmel." },
        { teile: ["Ihr Vater", "setzt sich", "auf eine Holzbank", "und winkt ihr zu."], satz: "Ihr Vater setzt sich auf eine Holzbank und winkt ihr zu." },
        { teile: ["Danach", "rutscht", "Sara", "die große Rutsche hinunter."], satz: "Danach rutscht Sara die große Rutsche hinunter." }
      ],
      satzVerbinden: [
        { teil1: "Die Sonne scheint am Samstag hell,", teil2: "gehen Sara und ihr Vater auf den Spielplatz.", optionen: ["aber", "deshalb", "weil"], richtig: 1, loesung: "Die Sonne scheint am Samstag hell, deshalb gehen Sara und ihr Vater auf den Spielplatz." },
        { teil1: "Sara klettert auf das hohe Klettergerüst,", teil2: "rutscht sie die große Rutsche hinunter.", optionen: ["danach", "weil", "aber"], richtig: 0, loesung: "Sara klettert auf das hohe Klettergerüst, danach rutscht sie die große Rutsche hinunter." },
        { teil1: "Sara gibt einen fröhlichen Juchzer von sich,", teil2: "das Rutschen ihr so viel Spaß macht.", optionen: ["weil", "aber", "danach"], richtig: 0, loesung: "Sara gibt einen fröhlichen Juchzer von sich, weil das Rutschen ihr so viel Spaß macht." },
        { teil1: "Ihr Vater bleibt auf der Holzbank sitzen,", teil2: "Sara klettert bis ganz nach oben.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Ihr Vater bleibt auf der Holzbank sitzen, aber Sara klettert bis ganz nach oben." }
      ],
      wichtigePunkte: ["Samstag am Spielplatz", "Vater auf Holzbank", "klettert ganz hinauf", "rutscht hinunter"]
    },
    {
      tag: 4,
      titel: "Der verschwundene Handschuh",
      text: "Draußen ist es kalt, und Paul möchte nach draußen gehen. Er zieht seine dicke Winterjacke an und setzt die Mütze auf. Plötzlich merkt er, dass sein blauer Handschuh fehlt. Paul sucht zuerst gründlich unter dem Tisch im Wohnzimmer. Dort liegen aber nur seine warmen Hausschuhe. Schließlich entdeckt er den blauen Handschuh neben der Tür und freut sich.",
      fragen: [
        { frage: "Wie ist das Wetter draußen?", optionen: ["Es ist heiß", "Es ist kalt", "Es ist windstill und warm"], richtig: [1] },
        { frage: "Welche Farbe hat der fehlende Handschuh?", optionen: ["Grün", "Rot", "Blau"], richtig: [2] },
        { frage: "Was zieht Paul an, bevor er rausgehen möchte?", optionen: ["Seine dicke Winterjacke", "Seine Badehose", "Seine Mütze", "Eine Sonnenbrille"], richtig: [0, 2] },
        { frage: "Wo sucht Paul zuerst nach dem Handschuh?", optionen: ["Unter dem Tisch im Wohnzimmer", "Im Badezimmer", "Auf dem Balkon"], richtig: [0] },
        { frage: "Was stimmt am Ende der Geschichte?", optionen: ["Paul findet den Handschuh neben der Tür", "Paul freut sich", "Der Handschuh bleibt verschwunden", "Der Handschuh ist blau"], richtig: [0, 1, 3] },
        { frage: "Was liegt statt des Handschuhs unter dem Tisch?", optionen: ["Ein Ball", "Seine warmen Hausschuhe", "Ein Buch"], richtig: [1] },
        { frage: "In welchem Zimmer steht der Tisch?", optionen: ["In der Küche", "Im Kinderzimmer", "Im Wohnzimmer"], richtig: [2] },
        { frage: "Wo sucht Paul oder wo findet er etwas?", optionen: ["Unter dem Tisch liegen Hausschuhe", "Neben der Tür liegt der Handschuh", "Auf dem Schrank liegt der Schal", "Im Wohnzimmer sucht er zuerst"], richtig: [0, 1, 3] },
        { frage: "Wie fühlt sich Paul am Ende?", optionen: ["Er ärgert sich", "Er freut sich", "Er wird müde"], richtig: [1] },
        { frage: "Welche Dinge kommen in der Geschichte vor?", optionen: ["Eine dicke Winterjacke", "Warme Hausschuhe", "Ein Regenschirm", "Ein blauer Handschuh"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Paul", "zieht", "seine dicke Winterjacke", "an."], satz: "Paul zieht seine dicke Winterjacke an." },
        { teile: ["Plötzlich", "merkt", "er,", "dass sein blauer Handschuh fehlt."], satz: "Plötzlich merkt er, dass sein blauer Handschuh fehlt." },
        { teile: ["Unter dem Tisch", "liegen", "nur", "seine warmen Hausschuhe."], satz: "Unter dem Tisch liegen nur seine warmen Hausschuhe." },
        { teile: ["Schließlich", "entdeckt", "er", "den blauen Handschuh", "neben der Tür."], satz: "Schließlich entdeckt er den blauen Handschuh neben der Tür." }
      ],
      satzVerbinden: [
        { teil1: "Paul zieht seine dicke Winterjacke an,", teil2: "es draußen sehr kalt ist.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Paul zieht seine dicke Winterjacke an, weil es draußen sehr kalt ist." },
        { teil1: "Paul sucht unter dem Tisch,", teil2: "dort liegen nur seine Hausschuhe.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Paul sucht unter dem Tisch, aber dort liegen nur seine Hausschuhe." },
        { teil1: "Sein blauer Handschuh fehlt,", teil2: "sucht Paul im ganzen Zimmer.", optionen: ["deshalb", "weil", "aber"], richtig: 0, loesung: "Sein blauer Handschuh fehlt, deshalb sucht Paul im ganzen Zimmer." },
        { teil1: "Zuerst sucht er im Wohnzimmer,", teil2: "entdeckt er den Handschuh neben der Tür.", optionen: ["weil", "danach", "aber"], richtig: 1, loesung: "Zuerst sucht er im Wohnzimmer, danach entdeckt er den Handschuh neben der Tür." }
      ],
      wichtigePunkte: ["will nach draußen", "blauer Handschuh fehlt", "sucht unter dem Tisch", "findet neben der Tür"]
    },
    {
      tag: 5,
      titel: "Der Apfelkuchen",
      text: "Am Sonntag backt Oma einen leckeren Apfelkuchen. Schon bald duftet es wunderbar in der ganzen Küche nach Zimt. Oma rührt den glatten Teig in einer bunten Schüssel an. Emma bindet sich eine Schürze um und möchte mithelfen. Sie legt die frischen Apfelstücke ordentlich auf den Teig. Später sitzen beide am Tisch und essen ein warmes Stück Kuchen.",
      fragen: [
        { frage: "Wann backt Oma den Apfelkuchen?", optionen: ["Am Freitag", "Am Sonntag", "Am Dienstag"], richtig: [1] },
        { frage: "Wonach duftet es in der ganzen Küche?", optionen: ["Nach Kakao", "Nach Zimt", "Nach Erdbeeren"], richtig: [1] },
        { frage: "Was macht Oma in der Geschichte?", optionen: ["Sie backt einen Apfelkuchen", "Sie rührt glatten Teig an", "Sie schneidet Brot", "Sie benutzt eine bunte Schüssel"], richtig: [0, 1, 3] },
        { frage: "Was bindet sich Emma vor dem Helfen um?", optionen: ["Einen Schal", "Eine Schürze", "Eine Mütze"], richtig: [1] },
        { frage: "Was macht Emma beim Backen und danach?", optionen: ["Sie legt frische Apfelstücke auf den Teig", "Sie sitzt später mit Oma am Tisch", "Sie isst ein warmes Stück Kuchen", "Sie spült draußen das Auto"], richtig: [0, 1, 2] },
        { frage: "Worin rührt Oma den Teig an?", optionen: ["In einem Topf", "In einer bunten Schüssel", "Auf einem Teller"], richtig: [1] },
        { frage: "Wie legt Emma die Apfelstücke auf den Teig?", optionen: ["Ordentlich", "Ganz schnell durcheinander", "Mit geschlossenen Augen"], richtig: [0] },
        { frage: "Was kommt im Text vor?", optionen: ["Glatter Teig", "Frische Apfelstücke", "Bunte Schokolinsen", "Warmes Stück Kuchen"], richtig: [0, 1, 3] },
        { frage: "Wo essen Oma und Emma den Kuchen?", optionen: ["Im Garten", "Am Tisch", "Auf dem Balkon"], richtig: [1] },
        { frage: "Welche Aussagen über die Geschichte stimmen?", optionen: ["Es duftet nach Zimt", "Emma hilft Oma gern", "Oma backt am Sonntag", "Der Kuchen ist eiskalt"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Am Sonntag", "backt", "Oma", "einen leckeren Apfelkuchen."], satz: "Am Sonntag backt Oma einen leckeren Apfelkuchen." },
        { teile: ["Oma", "rührt", "den glatten Teig", "in einer bunten Schüssel an."], satz: "Oma rührt den glatten Teig in einer bunten Schüssel an." },
        { teile: ["Emma", "legt", "die frischen Apfelstücke", "ordentlich auf den Teig."], satz: "Emma legt die frischen Apfelstücke ordentlich auf den Teig." },
        { teile: ["Später", "essen", "beide", "ein warmes Stück Kuchen."], satz: "Später essen beide ein warmes Stück Kuchen." }
      ],
      satzVerbinden: [
        { teil1: "Emma bindet sich eine Schürze um,", teil2: "sie der Oma beim Backen helfen möchte.", optionen: ["weil", "aber", "danach"], richtig: 0, loesung: "Emma bindet sich eine Schürze um, weil sie der Oma beim Backen helfen möchte." },
        { teil1: "Sie legen die Apfelstücke auf den Teig,", teil2: "essen beide ein warmes Stück Kuchen.", optionen: ["weil", "aber", "danach"], richtig: 2, loesung: "Sie legen die Apfelstücke auf den Teig, danach essen beide ein warmes Stück Kuchen." },
        { teil1: "In der Küche backt ein frischer Apfelkuchen,", teil2: "duftet es überall herrlich nach Zimt.", optionen: ["aber", "deshalb", "weil"], richtig: 1, loesung: "In der Küche backt ein frischer Apfelkuchen, deshalb duftet es überall herrlich nach Zimt." },
        { teil1: "Oma rührt den Teig allein an,", teil2: "beim Belegen hilft Emma fleißig mit.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Oma rührt den Teig allein an, aber beim Belegen hilft Emma fleißig mit." }
      ],
      wichtigePunkte: ["Oma backt Apfelkuchen", "duftet nach Zimt", "Emma legt Apfelstücke", "essen warmen Kuchen"]
    },
    {
      tag: 6,
      titel: "Der nasse Hund",
      text: "Lena geht am Nachmittag mit ihrem Hund Bruno im Park spazieren. Anfangs schnüffelt Bruno vergnügt am Wegesrand. Doch plötzlich ziehen dunkle Wolken auf, und es beginnt stark zu regnen. Zum Glück hat Lena ihren gelben Schirm dabei und spannt ihn sofort auf. Bruno tapst trotzdem fröhlich durch jede Pfütze, bis sein Fell tropfnass ist. Direkt neben Lena schüttelt er sich kräftig und spritzt Wasser auf ihre Hose.",
      fragen: [
        { frage: "Wie heißt Lenas Hund?", optionen: ["Bello", "Bruno", "Flocki"], richtig: [1] },
        { frage: "Welche Farbe hat Lenas Schirm?", optionen: ["Rot", "Gelb", "Grün"], richtig: [1] },
        { frage: "Was passiert plötzlich mit dem Wetter?", optionen: ["Dunkle Wolken ziehen auf", "Es beginnt stark zu regnen", "Es fällt dicker Schnee", "Die Sonne brennt heiß"], richtig: [0, 1] },
        { frage: "Wo gehen Lena und Bruno spazieren?", optionen: ["Am Strand", "Im Park", "Im Wald"], richtig: [1] },
        { frage: "Was macht Bruno im Regen?", optionen: ["Er tapst fröhlich durch jede Pfütze", "Sein Fell wird tropfnass", "Er schüttelt sich direkt neben Lena", "Er versteckt sich unter einer Bank"], richtig: [0, 1, 2] },
        { frage: "Wann sind die beiden im Park?", optionen: ["Am Nachmittag", "Am frühen Morgen", "Am späten Abend"], richtig: [0] },
        { frage: "Was wird am Ende durch Bruno nass?", optionen: ["Lenas Rucksack", "Lenas Hose", "Lenas Buch"], richtig: [1] },
        { frage: "Was macht Bruno in der ganzen Geschichte?", optionen: ["Er schnüffelt am Wegesrand", "Er tapst durch Pfützen", "Er jagt eine Katze", "Er spritzt Wasser auf Lenas Hose"], richtig: [0, 1, 3] },
        { frage: "Was hat Lena zum Glück dabei?", optionen: ["Einen gelben Schirm", "Ein Handtuch", "Ein Fahrrad"], richtig: [0] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Lena spannt ihren Schirm sofort auf", "Bruno stört der Regen gar nicht", "Lena ist am Nachmittag im Park", "Bruno bleibt ganz trocken"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Lena", "geht", "mit ihrem Hund Bruno", "im Park spazieren."], satz: "Lena geht mit ihrem Hund Bruno im Park spazieren." },
        { teile: ["Anfangs", "schnüffelt", "Bruno", "vergnügt am Wegesrand."], satz: "Anfangs schnüffelt Bruno vergnügt am Wegesrand." },
        { teile: ["Sofort", "spannt", "Lena", "ihren gelben Schirm auf."], satz: "Sofort spannt Lena ihren gelben Schirm auf." },
        { teile: ["Kräftig", "schüttelt sich", "Bruno", "direkt neben Lena."], satz: "Kräftig schüttelt sich Bruno direkt neben Lena." }
      ],
      satzVerbinden: [
        { teil1: "Es beginnt plötzlich stark zu regnen,", teil2: "spannt Lena sofort ihren gelben Schirm auf.", optionen: ["weil", "deshalb", "aber"], richtig: 1, loesung: "Es beginnt plötzlich stark zu regnen, deshalb spannt Lena sofort ihren gelben Schirm auf." },
        { teil1: "Lena bleibt unter dem Schirm trocken,", teil2: "Bruno spritzt Wasser auf ihre Hose.", optionen: ["weil", "aber", "danach"], richtig: 1, loesung: "Lena bleibt unter dem Schirm trocken, aber Bruno spritzt Wasser auf ihre Hose." },
        { teil1: "Brunos Fell ist tropfnass,", teil2: "er durch jede Pfütze getapst ist.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Brunos Fell ist tropfnass, weil er durch jede Pfütze getapst ist." },
        { teil1: "Zuerst schnüffelt Bruno am Wegesrand,", teil2: "zieht plötzlich ein starker Regen auf.", optionen: ["weil", "danach", "deshalb"], richtig: 1, loesung: "Zuerst schnüffelt Bruno am Wegesrand, danach zieht plötzlich ein starker Regen auf." }
      ],
      wichtigePunkte: ["Spaziergang mit Bruno", "starker Regen", "gelber Schirm auf", "Bruno spritzt Hose nass"]
    },
    {
      tag: 7,
      titel: "Der verlorene Ball",
      text: "Am Nachmittag spielen die Kinder im Park begeistert Fußball. Sie haben zwei Rucksäcke als Torpfosten auf die Wiese gestellt. Plötzlich holt Tom mit viel Schwung aus und schießt den Ball sehr weit. Der Ball fliegt hoch durch die Luft und rollt hinter einen dichten Busch. Alle Kinder laufen sofort hinüber und suchen gemeinsam zwischen den Zweigen. Schließlich entdecken sie den Ball unter einer Holzbank und spielen weiter.",
      fragen: [
        { frage: "Was spielen die Kinder im Park?", optionen: ["Fangen", "Fußball", "Verstecken"], richtig: [1] },
        { frage: "Was benutzen die Kinder als Torpfosten?", optionen: ["Zwei Jacken", "Zwei Rucksäcke", "Zwei Bäume"], richtig: [1] },
        { frage: "Was passiert nach Toms weitem Schuss?", optionen: ["Der Ball fliegt hoch durch die Luft", "Er rollt hinter einen dichten Busch", "Er fällt in einen Teich", "Alle Kinder laufen hinüber zum Suchen"], richtig: [0, 1, 3] },
        { frage: "Wer schießt den Ball sehr weit?", optionen: ["Tom", "Paul", "Ben"], richtig: [0] },
        { frage: "Was stimmt am Schluss der Geschichte?", optionen: ["Sie finden den Ball unter einer Holzbank", "Die Kinder spielen weiter", "Sie gehen ohne Ball heim", "Alle haben gemeinsam gesucht"], richtig: [0, 1, 3] },
        { frage: "Wann spielen die Kinder im Park?", optionen: ["Am Vormittag", "Am Nachmittag", "Am Abend"], richtig: [1] },
        { frage: "Unter welchem Gegenstand liegt der Ball schließlich?", optionen: ["Unter einem Auto", "Unter einer Holzbank", "Unter einer Rutsche"], richtig: [1] },
        { frage: "Wo suchen die Kinder oder wo stehen Dinge?", optionen: ["Die Rucksäcke stehen auf der Wiese", "Die Kinder suchen zwischen den Zweigen", "Der Ball liegt unter einer Holzbank", "Das Tor steht auf der Straße"], richtig: [0, 1, 2] },
        { frage: "Sucht Tom allein nach dem Ball?", optionen: ["Ja, ganz allein", "Nein, alle Kinder suchen gemeinsam", "Nur ein Hund sucht"], richtig: [1] },
        { frage: "Welche Wörter beschreiben die Geschichte richtig?", optionen: ["Die Kinder spielen begeistert", "Tom holt mit viel Schwung aus", "Der Busch ist dicht", "Es beginnt zu schneien"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Die Kinder", "spielen", "am Nachmittag", "im Park Fußball."], satz: "Die Kinder spielen am Nachmittag im Park Fußball." },
        { teile: ["Zwei Rucksäcke", "stehen", "als Torpfosten", "auf der Wiese."], satz: "Zwei Rucksäcke stehen als Torpfosten auf der Wiese." },
        { teile: ["Der Ball", "rollt", "hinter einen dichten Busch."], satz: "Der Ball rollt hinter einen dichten Busch." },
        { teile: ["Gemeinsam", "finden", "sie", "den Ball", "unter einer Holzbank."], satz: "Gemeinsam finden sie den Ball unter einer Holzbank." }
      ],
      satzVerbinden: [
        { teil1: "Tom schießt den Ball sehr weit,", teil2: "rollt er hinter einen dichten Busch.", optionen: ["deshalb", "aber", "weil"], richtig: 0, loesung: "Tom schießt den Ball sehr weit, deshalb rollt er hinter einen dichten Busch." },
        { teil1: "Die Kinder finden den Ball unter der Bank,", teil2: "spielen sie vergnügt weiter.", optionen: ["weil", "aber", "danach"], richtig: 2, loesung: "Die Kinder finden den Ball unter der Bank, danach spielen sie vergnügt weiter." },
        { teil1: "Alle Kinder laufen sofort zum Busch,", teil2: "sie den Ball gemeinsam suchen wollen.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Alle Kinder laufen sofort zum Busch, weil sie den Ball gemeinsam suchen wollen." },
        { teil1: "Sie suchen zuerst zwischen den Zweigen,", teil2: "der Ball liegt unter einer Holzbank.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Sie suchen zuerst zwischen den Zweigen, aber der Ball liegt unter einer Holzbank." }
      ],
      wichtigePunkte: ["Fußball im Park", "Tom schießt weit", "rollt hinter Busch", "unter Holzbank gefunden"]
    },
    {
      tag: 8,
      titel: "Der Ausflug in den Zoo",
      text: "Heute macht die Klasse 3A einen Ausflug in den Zoo. Schon am Eingang schauen die Kinder gespannt auf den großen Lageplan. Zuerst bleiben alle am weiten Gehege der grauen Elefanten stehen. Ein verspielter Elefant saugt Wasser auf und spritzt es mit seinem Rüssel hoch. Danach spaziert die Klasse weiter zum kühlen Becken der Pinguine. Die Kinder lachen laut, weil die Pinguine an Land so lustig watscheln.",
      fragen: [
        { frage: "Welche Klasse macht einen Ausflug?", optionen: ["Die Klasse 2B", "Die Klasse 3A", "Die Klasse 4C"], richtig: [1] },
        { frage: "Worauf schauen die Kinder schon am Eingang?", optionen: ["Auf eine große Uhr", "Auf den großen Lageplan", "Auf einen Eisstand"], richtig: [1] },
        { frage: "Welche Tiere besucht die Klasse in der Geschichte?", optionen: ["Graue Elefanten", "Löwen", "Pinguine", "Giraffen"], richtig: [0, 2] },
        { frage: "Womit spritzt der Elefant das Wasser hoch?", optionen: ["Mit seinen Ohren", "Mit seinem Rüssel", "Mit einem Eimer"], richtig: [1] },
        { frage: "Was passiert bei den Pinguinen?", optionen: ["Ihr Becken ist kühl", "Die Pinguine watscheln an Land lustig", "Die Kinder lachen laut", "Die Pinguine schlafen tief"], richtig: [0, 1, 2] },
        { frage: "Welche Tiere sehen die Kinder zuerst?", optionen: ["Die Pinguine", "Die Elefanten", "Die Affen"], richtig: [1] },
        { frage: "Wie wird der wasser-spritzende Elefant beschrieben?", optionen: ["Müde", "Verspielt", "Ängstlich"], richtig: [1] },
        { frage: "Was tut der verspielte Elefant?", optionen: ["Er saugt Wasser auf", "Er spritzt es mit dem Rüssel hoch", "Er frisst einen Apfel", "Er steht im weiten Gehege"], richtig: [0, 1, 3] },
        { frage: "Wie ist das Becken der Pinguine?", optionen: ["Warm", "Kühl", "Leer"], richtig: [1] },
        { frage: "Welche Aussagen stimmen in der Geschichte?", optionen: ["Der Ausflug geht in den Zoo", "Die Elefanten sind grau", "Zuerst besuchen sie die Pinguine", "Die Kinder schauen auf den Lageplan"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Heute", "macht", "die Klasse 3A", "einen Ausflug in den Zoo."], satz: "Heute macht die Klasse 3A einen Ausflug in den Zoo." },
        { teile: ["Am Eingang", "schauen", "die Kinder", "auf den großen Lageplan."], satz: "Am Eingang schauen die Kinder auf den großen Lageplan." },
        { teile: ["Ein verspielter Elefant", "spritzt", "Wasser", "mit seinem Rüssel hoch."], satz: "Ein verspielter Elefant spritzt Wasser mit seinem Rüssel hoch." },
        { teile: ["Danach", "spaziert", "die Klasse", "zum kühlen Becken der Pinguine."], satz: "Danach spaziert die Klasse zum kühlen Becken der Pinguine." }
      ],
      satzVerbinden: [
        { teil1: "Die Kinder lachen laut,", teil2: "die Pinguine so lustig watscheln.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Die Kinder lachen laut, weil die Pinguine so lustig watscheln." },
        { teil1: "Zuerst beobachten die Kinder die Elefanten,", teil2: "spazieren sie zu den Pinguinen.", optionen: ["weil", "danach", "aber"], richtig: 1, loesung: "Zuerst beobachten die Kinder die Elefanten, danach spazieren sie zu den Pinguinen." },
        { teil1: "Der Zoo ist sehr groß,", teil2: "schauen die Kinder am Eingang auf den Lageplan.", optionen: ["aber", "deshalb", "weil"], richtig: 1, loesung: "Der Zoo ist sehr groß, deshalb schauen die Kinder am Eingang auf den Lageplan." },
        { teil1: "Im Wasser sind Pinguine flink,", teil2: "an Land watscheln sie lustig.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Im Wasser sind Pinguine flink, aber an Land watscheln sie lustig." }
      ],
      wichtigePunkte: ["Klasse 3A im Zoo", "Elefant spritzt Wasser", "weiter zu Pinguinen", "Kinder lachen laut"]
    },
    {
      tag: 9,
      titel: "Ein Morgen mit Verspätung",
      text: "Am Morgen bleibt es still, denn Julias Wecker klingelt nicht. Erst als die helle Sonne ins Zimmer scheint, wacht Julia viel zu spät auf. Erschrocken springt sie aus dem Bett und zieht sich blitzschnell an. In der Küche packt sie ein Pausenbrot und ihre Hefte in die Schultasche. Weil der Fußweg zu lang ist, bringt ihr Vater sie mit dem Auto zur Schule. Gerade noch rechtzeitig vor dem Klingeln erreicht Julia ihr Klassenzimmer.",
      fragen: [
        { frage: "Was geht am Morgen schief?", optionen: ["Es schneit stark", "Julias Wecker klingelt nicht", "Das Fahrrad hat einen Platten"], richtig: [1] },
        { frage: "Wodurch wacht Julia schließlich auf?", optionen: ["Die helle Sonne scheint ins Zimmer", "Ihre Katze springt aufs Bett", "Das Telefon klingelt"], richtig: [0] },
        { frage: "Was packt Julia in der Küche in ihre Schultasche?", optionen: ["Ein Pausenbrot", "Ihre Hefte", "Einen Regenschirm", "Eine Trinkflasche"], richtig: [0, 1] },
        { frage: "Wie kommt Julia heute zur Schule?", optionen: ["Mit dem Bus", "Ihr Vater fährt sie mit dem Auto", "Sie läuft schnell zu Fuß"], richtig: [1] },
        { frage: "Was macht Julia direkt nach dem Aufwachen?", optionen: ["Sie ist erschrocken", "Sie springt aus dem Bett", "Sie zieht sich blitzschnell an", "Sie liest noch ein Buch"], richtig: [0, 1, 2] },
        { frage: "Kommt Julia zu spät in den Unterricht?", optionen: ["Ja, eine Stunde zu spät", "Nein, sie kommt gerade noch rechtzeitig vor dem Klingeln an", "Die Schule fällt aus"], richtig: [1] },
        { frage: "Warum geht Julia heute nicht zu Fuß?", optionen: ["Weil es regnet", "Weil der Fußweg zu lang ist", "Weil ihr Fuß wehtut"], richtig: [1] },
        { frage: "Welche Aussagen über Julias Morgen stimmen?", optionen: ["Der Wecker bleibt still", "Sie packt in der Küche ihre Tasche", "Ihre Mutter fährt das Auto", "Sie erreicht das Klassenzimmer rechtzeitig"], richtig: [0, 1, 3] },
        { frage: "In welchem Raum packt Julia ihre Schultasche?", optionen: ["Im Flur", "In der Küche", "Im Kinderzimmer"], richtig: [1] },
        { frage: "Welche Personen kommen in der Geschichte vor?", optionen: ["Julia", "Ihr Vater", "Ihre Lehrerin", "Ihr Bruder"], richtig: [0, 1] }
      ],
      satzPuzzle: [
        { teile: ["Erschrocken", "springt", "Julia", "aus dem Bett."], satz: "Erschrocken springt Julia aus dem Bett." },
        { teile: ["In der Küche", "packt", "sie", "ein Pausenbrot", "in die Schultasche."], satz: "In der Küche packt sie ein Pausenbrot in die Schultasche." },
        { teile: ["Ihr Vater", "bringt", "sie", "mit dem Auto", "zur Schule."], satz: "Ihr Vater bringt sie mit dem Auto zur Schule." },
        { teile: ["Gerade noch rechtzeitig", "erreicht", "Julia", "ihr Klassenzimmer."], satz: "Gerade noch rechtzeitig erreicht Julia ihr Klassenzimmer." }
      ],
      satzVerbinden: [
        { teil1: "Julia wacht viel zu spät auf,", teil2: "ihr Wecker nicht klingelt.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Julia wacht viel zu spät auf, weil ihr Wecker nicht klingelt." },
        { teil1: "Der Fußweg ist heute zu lang,", teil2: "fährt ihr Vater sie mit dem Auto zur Schule.", optionen: ["aber", "weil", "deshalb"], richtig: 2, loesung: "Der Fußweg ist heute zu lang, deshalb fährt ihr Vater sie mit dem Auto zur Schule." },
        { teil1: "Julia hat verschlafen,", teil2: "sie erreicht das Klassenzimmer trotzdem rechtzeitig.", optionen: ["weil", "aber", "danach"], richtig: 1, loesung: "Julia hat verschlafen, aber sie erreicht das Klassenzimmer trotzdem rechtzeitig." },
        { teil1: "Zuerst zieht sie sich blitzschnell an,", teil2: "packt sie in der Küche ihre Schultasche.", optionen: ["danach", "weil", "aber"], richtig: 0, loesung: "Zuerst zieht sie sich blitzschnell an, danach packt sie in der Küche ihre Schultasche." }
      ],
      wichtigePunkte: ["Wecker klingelt nicht", "zieht sich blitzschnell an", "Vater fährt Auto", "rechtzeitig im Klassenzimmer"]
    },
    {
      tag: 10,
      titel: "Das kaputte Vogelhaus",
      text: "Den ganzen Vormittag hat Noah mit seinem Opa ein Vogelhaus aus Holz gebaut. Stolz nimmt er das fertige Häuschen in beide Hände für den Garten. Doch auf der Stufe vor der Tür stolpert er über eine Fußmatte. Das Vogelhaus fällt ihm aus der Hand, und ein kleines Brett löst sich. Noah schaut auf das kaputte Häuschen und ist sehr traurig. Opa tröstet ihn liebevoll, und gemeinsam reparieren sie das Vogelhaus wieder.",
      fragen: [
        { frage: "Mit wem hat Noah das Vogelhaus gebaut?", optionen: ["Mit seinem Opa", "Mit seinem Freund", "Mit seiner Schwester"], richtig: [0] },
        { frage: "Worüber stolpert Noah vor der Tür?", optionen: ["Über einen Stein", "Über eine Fußmatte", "Über einen Schuh"], richtig: [1] },
        { frage: "Was passiert, als Noah stolpert?", optionen: ["Das Vogelhaus fällt ihm aus der Hand", "Ein kleines Brett löst sich", "Das ganze Dach verbrennt", "Noah wird sehr traurig"], richtig: [0, 1, 3] },
        { frage: "Woraus haben sie das Vogelhaus gebaut?", optionen: ["Aus Pappe", "Aus Holz", "Aus Plastik"], richtig: [1] },
        { frage: "Was macht Opa am Ende der Geschichte?", optionen: ["Er tröstet Noah liebevoll", "Er schimpft laut", "Sie reparieren das Vogelhaus gemeinsam", "Er wirft das Haus weg"], richtig: [0, 2] },
        { frage: "Wann haben Noah und Opa gebaut?", optionen: ["Den ganzen Vormittag", "Am späten Abend", "In der Mittagspause"], richtig: [0] },
        { frage: "Wohin will Noah das fertige Vogelhaus tragen?", optionen: ["In die Schule", "In den Garten", "Auf den Balkon"], richtig: [1] },
        { frage: "Welche Gefühle hat Noah im Verlauf der Geschichte?", optionen: ["Erst ist er stolz", "Nach dem Sturz ist er sehr traurig", "Er hat große Angst vor Vögeln", "Am Anfang hält er es in beiden Händen"], richtig: [0, 1, 3] },
        { frage: "Wo genau stolpert Noah?", optionen: ["Auf der Stufe vor der Tür", "Mitten auf der Wiese", "In der Werkstatt"], richtig: [0] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Das Vogelhaus ist aus Holz", "Es bleibt für immer kaputt", "Opa hilft beim Reparieren", "Die Fußmatte liegt vor der Tür"], richtig: [0, 2, 3] }
      ],
      satzPuzzle: [
        { teile: ["Mit seinem Opa", "hat", "Noah", "ein Vogelhaus aus Holz", "gebaut."], satz: "Mit seinem Opa hat Noah ein Vogelhaus aus Holz gebaut." },
        { teile: ["Vor der Tür", "stolpert", "er", "über eine Fußmatte."], satz: "Vor der Tür stolpert er über eine Fußmatte." },
        { teile: ["Opa", "tröstet", "den traurigen Noah", "liebevoll."], satz: "Opa tröstet den traurigen Noah liebevoll." },
        { teile: ["Gemeinsam", "reparieren", "sie", "das kaputte Vogelhaus", "wieder."], satz: "Gemeinsam reparieren sie das kaputte Vogelhaus wieder." }
      ],
      satzVerbinden: [
        { teil1: "Noah ist sehr traurig,", teil2: "das neue Vogelhaus kaputtgegangen ist.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Noah ist sehr traurig, weil das neue Vogelhaus kaputtgegangen ist." },
        { teil1: "Ein kleines Brett löst sich,", teil2: "Opa und Noah reparieren es gemeinsam wieder.", optionen: ["weil", "aber", "danach"], richtig: 1, loesung: "Ein kleines Brett löst sich, aber Opa und Noah reparieren es gemeinsam wieder." },
        { teil1: "Noah stolpert über die Fußmatte,", teil2: "fällt ihm das Vogelhaus aus der Hand.", optionen: ["deshalb", "weil", "aber"], richtig: 0, loesung: "Noah stolpert über die Fußmatte, deshalb fällt ihm das Vogelhaus aus der Hand." },
        { teil1: "Opa tröstet Noah liebevoll,", teil2: "reparieren sie das Häuschen zusammen.", optionen: ["weil", "aber", "danach"], richtig: 2, loesung: "Opa tröstet Noah liebevoll, danach reparieren sie das Häuschen zusammen." }
      ],
      wichtigePunkte: ["Vogelhaus mit Opa gebaut", "stolpert und fällt hin", "Noah ist traurig", "gemeinsam repariert"]
    },
    {
      tag: 11,
      titel: "Der kleine Igel",
      text: "An einem Herbstmorgen hört Amir auf dem Schulweg ein leises Rascheln. Neugierig schaut er hinunter und entdeckt einen kleinen Igel im Gras. Sofort bleibt Amir stehen und beobachtet das stachelige Tier vorsichtig. Zu Hause erzählt er seiner Mutter begeistert von seiner Entdeckung. Sie erklärt ihm, dass man wilde Tiere in der Natur lassen soll. Am nächsten Tag sehen beide nach, doch der Igel ist längst verschwunden.",
      fragen: [
        { frage: "In welcher Jahreszeit spielt die Geschichte?", optionen: ["Im Sommer", "Im Herbst", "Im Frühling"], richtig: [1] },
        { frage: "Wen entdeckt Amir im Gras?", optionen: ["Einen kleinen Igel", "Ein Eichhörnchen", "Einen Frosch"], richtig: [0] },
        { frage: "Wie verhält sich Amir beim Anblick des Igels?", optionen: ["Er bleibt sofort stehen", "Er beobachtet ihn vorsichtig", "Er hebt ihn hoch und nimmt ihn mit", "Er schaut neugierig hinunter"], richtig: [0, 1, 3] },
        { frage: "Wem erzählt Amir zu Hause von seiner Entdeckung?", optionen: ["Seinem Vater", "Seiner Mutter", "Seiner Lehrerin"], richtig: [1] },
        { frage: "Was passiert zu Hause und am nächsten Tag?", optionen: ["Mama erklärt, dass wilde Tiere in der Natur bleiben", "Amir und Mama sehen am nächsten Tag nach", "Der Igel ist längst verschwunden", "Der Igel wohnt jetzt in Amirs Zimmer"], richtig: [0, 1, 2] },
        { frage: "Wo hört Amir das leise Rascheln?", optionen: ["Im Garten", "Auf dem Schulweg", "Im Park"], richtig: [1] },
        { frage: "Wie erzählt Amir seiner Mutter von dem Igel?", optionen: ["Begeistert", "Gelangweilt", "Traurig"], richtig: [0] },
        { frage: "Wie wird der Igel im Text beschrieben?", optionen: ["Klein", "Stachelig", "Riesig", "Wildes Tier"], richtig: [0, 1, 3] },
        { frage: "Ist der Igel am nächsten Tag noch im Gras?", optionen: ["Ja, er schläft dort", "Nein, er ist längst verschwunden", "Er wartet auf Futter"], richtig: [1] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Es ist ein Herbstmorgen", "Amir hört ein leises Rascheln", "Die Mutter geht am nächsten Tag mit nachsehen", "Amir nimmt den Igel mit in die Schule"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["An einem Herbstmorgen", "hört", "Amir", "ein leises Rascheln."], satz: "An einem Herbstmorgen hört Amir ein leises Rascheln." },
        { teile: ["Auf dem Schulweg", "entdeckt", "Amir", "einen kleinen Igel", "im Gras."], satz: "Auf dem Schulweg entdeckt Amir einen kleinen Igel im Gras." },
        { teile: ["Zu Hause", "erzählt", "er", "seiner Mutter", "begeistert davon."], satz: "Zu Hause erzählt er seiner Mutter begeistert davon." },
        { teile: ["Am nächsten Tag", "ist", "der kleine Igel", "längst verschwunden."], satz: "Am nächsten Tag ist der kleine Igel längst verschwunden." }
      ],
      satzVerbinden: [
        { teil1: "Amir bleibt ganz ruhig stehen,", teil2: "er den kleinen Igel nicht erschrecken will.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Amir bleibt ganz ruhig stehen, weil er den kleinen Igel nicht erschrecken will." },
        { teil1: "Am nächsten Tag schauen Amir und Mama nach,", teil2: "der Igel ist schon verschwunden.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Am nächsten Tag schauen Amir und Mama nach, aber der Igel ist schon verschwunden." },
        { teil1: "Ein Igel ist ein wildes Tier,", teil2: "lässt Amir ihn in der Natur.", optionen: ["deshalb", "weil", "aber"], richtig: 0, loesung: "Ein Igel ist ein wildes Tier, deshalb lässt Amir ihn in der Natur." },
        { teil1: "Zuerst beobachtet Amir das Tier vorsichtig,", teil2: "erzählt er seiner Mutter davon.", optionen: ["weil", "aber", "danach"], richtig: 2, loesung: "Zuerst beobachtet Amir das Tier vorsichtig, danach erzählt er seiner Mutter davon." }
      ],
      wichtigePunkte: ["Igel im Gras entdeckt", "vorsichtig beobachtet", "Mutter erklärt Regel", "nächster Tag verschwunden"]
    },
    {
      tag: 12,
      titel: "Die Überraschung für Papa",
      text: "Am Nachmittag hat Mila eine tolle Idee und möchte ihren Vater überraschen. Heimlich holt sie bunte Filzstifte, Papier und etwas Glitzer aus dem Regal. Mit viel Geduld malt sie ein buntes Bild von ihrer ganzen Familie. Danach faltet sie eine kleine Karte und schreibt liebe Grüße hinein. Sie legt beides genau in die Mitte auf den Küchentisch. Als Papa nach Hause kommt, freut er sich riesig und umarmt Mila fest.",
      fragen: [
        { frage: "Wen möchte Mila überraschen?", optionen: ["Ihre Oma", "Ihren Vater", "Ihre Freundin"], richtig: [1] },
        { frage: "Wo legt Mila ihr Geschenk hin?", optionen: ["In die Mitte auf den Küchentisch", "Vor die Haustür", "Auf Papas Kissen"], richtig: [0] },
        { frage: "Was holt Mila heimlich aus dem Regal?", optionen: ["Bunte Filzstifte", "Papier", "Etwas Glitzer", "Eine Schere und Wolle"], richtig: [0, 1, 2] },
        { frage: "Was malt Mila auf das Bild?", optionen: ["Einen Hund", "Ihre ganze Familie", "Ein Haus mit Garten"], richtig: [1] },
        { frage: "Wie reagiert Papa, als er nach Hause kommt?", optionen: ["Er freut sich riesig", "Er umarmt Mila fest", "Er übersieht das Geschenk", "Er entdeckt Bild und Karte auf dem Tisch"], richtig: [0, 1, 3] },
        { frage: "Wann hat Mila ihre tolle Idee?", optionen: ["Am Morgen", "Am Nachmittag", "Spät in der Nacht"], richtig: [1] },
        { frage: "Was schreibt Mila in die kleine Karte?", optionen: ["Einen Einkaufszettel", "Liebe Grüße", "Ein langes Gedicht"], richtig: [1] },
        { frage: "Woraus besteht Milas Überraschung insgesamt?", optionen: ["Aus einem bunten Familienbild", "Aus einer kleinen Karte mit Grüßen", "Aus selbstgebackenen Keksen", "Aus Blumen"], richtig: [0, 1] },
        { frage: "Wie malt Mila das bunte Bild?", optionen: ["Ganz hastig", "Mit viel Geduld", "Ohne Lust"], richtig: [1] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Mila arbeitet heimlich", "Die Sachen standen im Regal", "Die Überraschung liegt auf dem Küchentisch", "Papa ist gar nicht zu Hause"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Heimlich", "holt", "Mila", "Stifte, Papier und Glitzer."], satz: "Heimlich holt Mila Stifte, Papier und Glitzer." },
        { teile: ["Mit viel Geduld", "malt", "Mila", "ein buntes Bild."], satz: "Mit viel Geduld malt Mila ein buntes Bild." },
        { teile: ["Sie", "legt", "das Geschenk", "auf den Küchentisch."], satz: "Sie legt das Geschenk auf den Küchentisch." },
        { teile: ["Papa", "freut sich", "riesig", "und umarmt Mila fest."], satz: "Papa freut sich riesig und umarmt Mila fest." }
      ],
      satzVerbinden: [
        { teil1: "Mila holt die Stifte heimlich heraus,", teil2: "sie ihren Vater überraschen möchte.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Mila holt die Stifte heimlich heraus, weil sie ihren Vater überraschen möchte." },
        { teil1: "Mila malt ein buntes Bild,", teil2: "schreibt sie liebe Grüße in eine Karte.", optionen: ["weil", "danach", "aber"], richtig: 1, loesung: "Mila malt ein buntes Bild, danach schreibt sie liebe Grüße in eine Karte." },
        { teil1: "Papa entdeckt das schöne Geschenk auf dem Tisch,", teil2: "umarmt er Mila ganz fest.", optionen: ["deshalb", "aber", "weil"], richtig: 0, loesung: "Papa entdeckt das schöne Geschenk auf dem Tisch, deshalb umarmt er Mila ganz fest." },
        { teil1: "Das Bild kostet viel Geduld,", teil2: "es wird am Ende wunderschön.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Das Bild kostet viel Geduld, aber es wird am Ende wunderschön." }
      ],
      wichtigePunkte: ["Überraschung für Papa", "Bild und Karte gebastelt", "auf den Küchentisch", "Papa freut sich"]
    },
    {
      tag: 13,
      titel: "Der Ausflug zum See",
      text: "Am Sonntag fährt Familie Berger bei warmem Sonnenschein an einen See. Vorher packen alle gemeinsam eine Decke, Getränke und belegte Brote ein. Am Ufer entdecken die Kinder eine Entenfamilie mit vier flauschigen Küken. Sie setzen sich ganz leise ins Gras und beobachten die Tiere. Danach essen alle gemütlich ihre Brote auf der großen Picknickdecke. Bevor sie nach Hause fahren, sammeln alle ordentlich ihren Müll ein.",
      fragen: [
        { frage: "Wann fährt Familie Berger an den See?", optionen: ["Am Samstag", "Am Sonntag", "Am Montag"], richtig: [1] },
        { frage: "Wie viele Küken schwimmen bei der Entenfamilie?", optionen: ["Zwei", "Vier", "Sechs"], richtig: [1] },
        { frage: "Was packt die Familie für den Ausflug ein?", optionen: ["Eine Decke", "Getränke", "Belegte Brote", "Schwimmflügel"], richtig: [0, 1, 2] },
        { frage: "Was macht die Familie kurz vor der Heimfahrt?", optionen: ["Sie sammeln ordentlich ihren Müll ein", "Sie füttern die Enten", "Sie fahren noch Boot"], richtig: [0] },
        { frage: "Was machen die Kinder am Ufer?", optionen: ["Sie entdecken eine Entenfamilie", "Sie setzen sich ganz leise ins Gras", "Sie beobachten die Tiere", "Sie werfen Steine ins Wasser"], richtig: [0, 1, 2] },
        { frage: "Wie heißt die Familie in der Geschichte?", optionen: ["Familie Maier", "Familie Berger", "Familie Weber"], richtig: [1] },
        { frage: "Wo essen alle danach ihre Brote?", optionen: ["Im Auto", "Auf der großen Picknickdecke", "In einem Gasthaus"], richtig: [1] },
        { frage: "Was stimmt über das Wetter und die Tiere?", optionen: ["Es ist warmer Sonnenschein", "Die Küken sind flauschig", "Es beginnt zu gewittern", "Die Enten sind am Ufer"], richtig: [0, 1, 3] },
        { frage: "Wer packt die Sachen vor dem Ausflug ein?", optionen: ["Nur die Mutter", "Alle gemeinsam", "Nur die Kinder"], richtig: [1] },
        { frage: "Welche Dinge passieren in der Geschichte?", optionen: ["Sie machen ein Picknick", "Sie essen gemütlich Brote", "Sie lassen den Müll liegen", "Sie fahren am Sonntag an einen See"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Am Sonntag", "fährt", "Familie Berger", "an einen See."], satz: "Am Sonntag fährt Familie Berger an einen See." },
        { teile: ["Am Ufer", "entdecken", "die Kinder", "eine Entenfamilie."], satz: "Am Ufer entdecken die Kinder eine Entenfamilie." },
        { teile: ["Gemütlich", "essen", "alle", "ihre Brote", "auf der Picknickdecke."], satz: "Gemütlich essen alle ihre Brote auf der Picknickdecke." },
        { teile: ["Vor der Heimfahrt", "sammeln", "alle", "ordentlich ihren Müll ein."], satz: "Vor der Heimfahrt sammeln alle ordentlich ihren Müll ein." }
      ],
      satzVerbinden: [
        { teil1: "Am Sonntag scheint warm die Sonne,", teil2: "fährt Familie Berger an den See.", optionen: ["weil", "deshalb", "aber"], richtig: 1, loesung: "Am Sonntag scheint warm die Sonne, deshalb fährt Familie Berger an den See." },
        { teil1: "Die Kinder beobachten leise die Enten,", teil2: "essen alle gemeinsam auf der Decke.", optionen: ["danach", "weil", "aber"], richtig: 0, loesung: "Die Kinder beobachten leise die Enten, danach essen alle gemeinsam auf der Decke." },
        { teil1: "Die Kinder setzen sich ganz leise ins Gras,", teil2: "sie die Entenfamilie nicht stören wollen.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Die Kinder setzen sich ganz leise ins Gras, weil sie die Entenfamilie nicht stören wollen." },
        { teil1: "Das Picknick ist sehr gemütlich,", teil2: "vor der Heimfahrt räumen alle ihren Müll weg.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Das Picknick ist sehr gemütlich, aber vor der Heimfahrt räumen alle ihren Müll weg." }
      ],
      wichtigePunkte: ["Sonntag an den See", "Decke und Brote", "Entenfamilie beobachtet", "Müll eingesammelt"]
    },
    {
      tag: 14,
      titel: "Ein besonderer Tag",
      text: "Heute ist für Ella ein ganz besonderer Tag. Zum ersten Mal darf sie allein mit dem Fahrrad bis zum kleinen Park fahren. Vorher erklärt ihre Mutter ihr noch einmal genau alle Verkehrsregeln. Ella setzt ihren Helm fest auf und fährt langsam und sicher los. Im Park wartet schon ihre Freundin, und beide spielen fröhlich zusammen. Als Ella später wohlbehalten nach Hause kommt, ist sie mächtig stolz.",
      fragen: [
        { frage: "Womit darf Ella heute zum ersten Mal allein fahren?", optionen: ["Mit dem Roller", "Mit dem Fahrrad", "Mit dem Zug"], richtig: [1] },
        { frage: "Wohin darf Ella allein fahren?", optionen: ["Bis zum kleinen Park", "Bis zur Schule", "Bis zum Schwimmbad"], richtig: [0] },
        { frage: "Was passiert vor dem Losfahren?", optionen: ["Ihre Mutter erklärt alle Verkehrsregeln", "Ella setzt ihren Helm fest auf", "Ella fährt langsam und sicher los", "Ella vergisst ihren Helm"], richtig: [0, 1, 2] },
        { frage: "Wen trifft Ella im Park?", optionen: ["Ihren Bruder", "Ihre Freundin", "Ihre Oma"], richtig: [1] },
        { frage: "Was stimmt über das Ende der Geschichte?", optionen: ["Ella kommt wohlbehalten nach Hause", "Sie ist mächtig stolz", "Die beiden Freundinnen haben fröhlich gespielt", "Ella hat sich verfahren"], richtig: [0, 1, 2] },
        { frage: "Wie fährt Ella los?", optionen: ["Sehr schnell", "Langsam und sicher", "Ohne Hände am Lenker"], richtig: [1] },
        { frage: "Wer erinnert Ella an die Verkehrsregeln?", optionen: ["Ihr Vater", "Ihre Mutter", "Ihre Freundin"], richtig: [1] },
        { frage: "Welche Aussagen über Ella stimmen?", optionen: ["Heute ist ein besonderer Tag für sie", "Sie trägt einen Helm", "Sie spielt allein im Park", "Sie fährt allein bis zum Park"], richtig: [0, 1, 3] },
        { frage: "Wie fühlt sich Ella am Ende zu Hause?", optionen: ["Mächtig stolz", "Traurig", "Ängstlich"], richtig: [0] },
        { frage: "Was machen Ella und ihre Freundin im Park?", optionen: ["Die Freundin wartet schon auf sie", "Beide spielen fröhlich zusammen", "Sie reparieren ein Fahrrad", "Ella kommt danach sicher heim"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Heute", "ist", "für Ella", "ein ganz besonderer Tag."], satz: "Heute ist für Ella ein ganz besonderer Tag." },
        { teile: ["Vorher", "erklärt", "ihre Mutter", "alle Verkehrsregeln."], satz: "Vorher erklärt ihre Mutter alle Verkehrsregeln." },
        { teile: ["Ella", "setzt", "ihren Helm", "fest auf."], satz: "Ella setzt ihren Helm fest auf." },
        { teile: ["Im Park", "spielen", "beide Freundinnen", "fröhlich zusammen."], satz: "Im Park spielen beide Freundinnen fröhlich zusammen." }
      ],
      satzVerbinden: [
        { teil1: "Ella ist am Abend mächtig stolz,", teil2: "sie ganz allein zum Park gefahren ist.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Ella ist am Abend mächtig stolz, weil sie ganz allein zum Park gefahren ist." },
        { teil1: "Zuerst erklärt die Mutter die Regeln,", teil2: "fährt Ella langsam und sicher los.", optionen: ["aber", "weil", "danach"], richtig: 2, loesung: "Zuerst erklärt die Mutter die Regeln, danach fährt Ella langsam und sicher los." },
        { teil1: "Ella möchte sicher ankommen,", teil2: "setzt sie ihren Helm fest auf.", optionen: ["deshalb", "aber", "weil"], richtig: 0, loesung: "Ella möchte sicher ankommen, deshalb setzt sie ihren Helm fest auf." },
        { teil1: "Ella fährt zum ersten Mal ganz allein,", teil2: "sie schafft den Weg ohne Probleme.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Ella fährt zum ersten Mal ganz allein, aber sie schafft den Weg ohne Probleme." }
      ],
      wichtigePunkte: ["erstmals allein fahren", "Mutter erklärt Regeln", "Helm auf und los", "Freundin und stolz"]
    },
    {
      tag: 15,
      titel: "Wuffi und der rote Ball",
      text: "Wuffi und Coco laufen am Nachmittag vergnügt über die große Hundewiese. Heute spielen sie mit ihrem liebsten roten Ball. Bei einem weiten Sprung stößt Coco den Ball leider zu kräftig an. Plötzlich rollt der Ball quer über die Wiese in ein dichtes Gebüsch. Wuffi kriecht vorsichtig unter die Zweige und sucht jeden Winkel ab. Mit einem fröhlichen Bellen bringt er den Ball heraus, und beide spielen weiter.",
      fragen: [
        { frage: "Wo laufen Wuffi und Coco herum?", optionen: ["Auf der großen Hundewiese", "Im Garten", "Am Strand"], richtig: [0] },
        { frage: "Wer stößt den Ball zu kräftig an?", optionen: ["Wuffi", "Coco", "Ein anderes Kind"], richtig: [1] },
        { frage: "Was macht Wuffi, nachdem der Ball wegrollt?", optionen: ["Er kriecht vorsichtig unter die Zweige", "Er sucht jeden Winkel ab", "Er bringt den Ball mit fröhlichem Bellen heraus", "Er läuft sofort nach Hause"], richtig: [0, 1, 2] },
        { frage: "Wohin rollt der rote Ball?", optionen: ["In einen Bach", "In ein dichtes Gebüsch", "Auf die Straße"], richtig: [1] },
        { frage: "Was stimmt über das Spiel der beiden Hunde?", optionen: ["Sie spielen am Nachmittag", "Ihr Lieblingsball ist rot", "Am Ende spielen beide weiter", "Der Ball geht kaputt"], richtig: [0, 1, 2] },
        { frage: "Wobei passiert Cocos Missgeschick?", optionen: ["Beim Fressen", "Bei einem weiten Sprung", "Beim Schlafen"], richtig: [1] },
        { frage: "Wie zeigt Wuffi, dass er den Ball gefunden hat?", optionen: ["Mit einem fröhlichen Bellen", "Mit leisem Knurren", "Er setzt sich stumm hin"], richtig: [0] },
        { frage: "Welche beiden Hunde spielen in der Geschichte?", optionen: ["Wuffi", "Coco", "Bruno", "Bello"], richtig: [0, 1] },
        { frage: "Wie kriecht Wuffi unter die Zweige?", optionen: ["Vorsichtig", "Ganz ungestüm", "Rückwärts"], richtig: [0] },
        { frage: "Welche Aussagen stimmen in der Geschichte?", optionen: ["Die Hundewiese ist groß", "Das Gebüsch ist dicht", "Wuffi rettet den Ball", "Coco kriecht ins Gebüsch"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Wuffi und Coco", "laufen", "über die große Hundewiese."], satz: "Wuffi und Coco laufen über die große Hundewiese." },
        { teile: ["Plötzlich", "rollt", "der rote Ball", "in ein dichtes Gebüsch."], satz: "Plötzlich rollt der rote Ball in ein dichtes Gebüsch." },
        { teile: ["Vorsichtig", "kriecht", "Wuffi", "unter die dichten Zweige."], satz: "Vorsichtig kriecht Wuffi unter die dichten Zweige." },
        { teile: ["Fröhlich", "bringt", "er", "den Ball wieder heraus."], satz: "Fröhlich bringt er den Ball wieder heraus." }
      ],
      satzVerbinden: [
        { teil1: "Der Ball rollt tief ins Gebüsch,", teil2: "Coco ihn zu kräftig angestoßen hat.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Der Ball rollt tief ins Gebüsch, weil Coco ihn zu kräftig angestoßen hat." },
        { teil1: "Wuffi holt den Ball aus dem Gebüsch,", teil2: "spielen die beiden sofort weiter.", optionen: ["weil", "aber", "danach"], richtig: 2, loesung: "Wuffi holt den Ball aus dem Gebüsch, danach spielen die beiden sofort weiter." },
        { teil1: "Der Ball ist im dichten Gebüsch verschwunden,", teil2: "kriecht Wuffi vorsichtig unter die Zweige.", optionen: ["deshalb", "aber", "weil"], richtig: 0, loesung: "Der Ball ist im dichten Gebüsch verschwunden, deshalb kriecht Wuffi vorsichtig unter die Zweige." },
        { teil1: "Das Gebüsch ist sehr dicht,", teil2: "Wuffi findet den roten Ball trotzdem.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Das Gebüsch ist sehr dicht, aber Wuffi findet den roten Ball trotzdem." }
      ],
      wichtigePunkte: ["Spielen auf Hundewiese", "Ball rollt ins Gebüsch", "Wuffi kriecht hinein", "beide spielen weiter"]
    },
    {
      tag: 16,
      titel: "Flocki beim Tierarzt",
      text: "Heute hat der kleine Welpe Flocki einen Termin beim Tierarzt. Im Wartezimmer zittert er zuerst ein bisschen hinter Bellos Pfote. Die freundliche Tierärztin streichelt ihn sanft hinter den Ohren und gibt ihm ein Leckerli. Flocki knabbert es auf und merkt, dass hier gar nichts schlimm ist. Danach lässt er sich ganz ruhig abhören und kurz wiegen. Auf dem Heimweg trabt Flocki stolz neben Bello, weil er so mutig war.",
      fragen: [
        { frage: "Wohin muss der kleine Welpe Flocki heute?", optionen: ["In die Hundeschule", "Zum Tierarzt", "Zum Friseur"], richtig: [1] },
        { frage: "Wer begleitet Flocki zum Termin?", optionen: ["Bello", "Wuffi", "Coco"], richtig: [0] },
        { frage: "Wie beruhigt die Tierärztin den kleinen Flocki?", optionen: ["Sie streichelt ihn sanft hinter den Ohren", "Sie gibt ihm ein Leckerli", "Sie setzt ihn in einen Käfig", "Sie ist sehr freundlich"], richtig: [0, 1, 3] },
        { frage: "Was tut Flocki zuerst im Wartezimmer?", optionen: ["Er bellt laut", "Er zittert ein bisschen hinter Bellos Pfote", "Er schläft ein"], richtig: [1] },
        { frage: "Was passiert bei der Untersuchung?", optionen: ["Flocki bleibt ganz ruhig", "Er lässt sich abhören", "Er wird kurz gewogen", "Er rennt davon"], richtig: [0, 1, 2] },
        { frage: "Wie fühlt sich Flocki auf dem Heimweg?", optionen: ["Stolz und mutig", "Noch immer ängstlich", "Sehr hungrig"], richtig: [0] },
        { frage: "Was merkt Flocki, nachdem er das Leckerli aufgeknabbert hat?", optionen: ["Dass er noch mehr Hunger hat", "Dass hier gar nichts schlimm ist", "Dass Bello weg ist"], richtig: [1] },
        { frage: "Welche Aussagen stimmen über Flocki?", optionen: ["Flocki ist ein kleiner Welpe", "Zuerst hat er etwas Angst", "Er trabt stolz neben Bello heim", "Er mag das Leckerli nicht"], richtig: [0, 1, 2] },
        { frage: "In welchem Raum wartet Flocki zuerst?", optionen: ["Im Wartezimmer", "Im Garten", "Im Auto"], richtig: [0] },
        { frage: "Was stimmt am Ende der Geschichte?", optionen: ["Flocki war mutig", "Flocki geht neben Bello nach Hause", "Die Untersuchung klappte ruhig", "Flocki bekam eine Spritze"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Zuerst", "zittert", "Flocki", "hinter Bellos Pfote."], satz: "Zuerst zittert Flocki hinter Bellos Pfote." },
        { teile: ["Die freundliche Tierärztin", "gibt", "ihm", "ein Leckerli."], satz: "Die freundliche Tierärztin gibt ihm ein Leckerli." },
        { teile: ["Ganz ruhig", "lässt", "er", "sich abhören und wiegen."], satz: "Ganz ruhig lässt er sich abhören und wiegen." },
        { teile: ["Auf dem Heimweg", "trabt", "Flocki", "stolz neben Bello."], satz: "Auf dem Heimweg trabt Flocki stolz neben Bello." }
      ],
      satzVerbinden: [
        { teil1: "Flocki trabt stolz nach Hause,", teil2: "er beim Tierarzt so mutig war.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Flocki trabt stolz nach Hause, weil er beim Tierarzt so mutig war." },
        { teil1: "Zuerst hat Flocki Angst,", teil2: "dann bleibt er ganz ruhig.", optionen: ["weil", "aber", "deshalb"], richtig: 1, loesung: "Zuerst hat Flocki Angst, aber dann bleibt er ganz ruhig." },
        { teil1: "Die Tierärztin gibt Flocki ein Leckerli,", teil2: "lässt er sich ganz ruhig untersuchen.", optionen: ["danach", "weil", "aber"], richtig: 0, loesung: "Die Tierärztin gibt Flocki ein Leckerli, danach lässt er sich ganz ruhig untersuchen." },
        { teil1: "Die Tierärztin ist sehr sanft,", teil2: "verliert Flocki schnell seine Angst.", optionen: ["aber", "deshalb", "weil"], richtig: 1, loesung: "Die Tierärztin ist sehr sanft, deshalb verliert Flocki schnell seine Angst." }
      ],
      wichtigePunkte: ["Termin beim Tierarzt", "zittert bei Bello", "Leckerli und Untersuchung", "stolz auf Heimweg"]
    },
    {
      tag: 17,
      titel: "Knuspels neues Laufrad",
      text: "Im Hamsterzimmer steht seit heute ein großes, buntes Laufrad. Knuspel schnuppert neugierig daran und setzt vorsichtig eine Pfote hinein. Sofort beginnt sich das Rad zu drehen, und Knuspel hopst überrascht heraus. Verdutzt schaut er das wackelnde Rad an und traut sich kurz nicht mehr. Da zeigt ihm seine Freundin Nussi, wie man ganz langsam losläuft. Schon nach wenigen Minuten flitzen beide abwechselnd durch das Rad und kichern.",
      fragen: [
        { frage: "Was steht seit heute im Hamsterzimmer?", optionen: ["Ein neues Haus", "Ein großes, buntes Laufrad", "Eine bunte Rutsche"], richtig: [1] },
        { frage: "Wer hilft Knuspel mit dem neuen Laufrad?", optionen: ["Sein Freund Bommel", "Seine Freundin Nussi", "Sein Bruder"], richtig: [1] },
        { frage: "Wie verhält sich Knuspel ganz am Anfang?", optionen: ["Er schnuppert neugierig am Rad", "Er setzt vorsichtig eine Pfote hinein", "Er rennt sofort ganz schnell los", "Er hopst überrascht heraus"], richtig: [0, 1, 3] },
        { frage: "Was zeigt Nussi ihrem Freund?", optionen: ["Wie man ganz langsam losläuft", "Wie man das Rad anhält", "Wie man darüber springt"], richtig: [0] },
        { frage: "Was passiert am Schluss der Geschichte?", optionen: ["Beide flitzen abwechselnd durch das Rad", "Beide kichern", "Es klappt schon nach wenigen Minuten", "Das Rad geht kaputt"], richtig: [0, 1, 2] },
        { frage: "Warum hopst Knuspel zuerst erschrocken heraus?", optionen: ["Weil das Rad quietscht", "Weil sich das Rad sofort zu drehen beginnt", "Weil es sehr heiß ist"], richtig: [1] },
        { frage: "Wie schaut Knuspel das wackelnde Rad an?", optionen: ["Verdutzt", "Wütend", "Schläfrig"], richtig: [0] },
        { frage: "Wie wird das neue Laufrad beschrieben?", optionen: ["Groß", "Bunt", "Grau", "Wackelnd beim Anhalten"], richtig: [0, 1, 3] },
        { frage: "Wie lange dauert es, bis es gut klappt?", optionen: ["Den ganzen Tag", "Nur wenige Minuten", "Eine ganze Woche"], richtig: [1] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Das Rad steht im Hamsterzimmer", "Knuspel traut sich kurz nicht mehr", "Nussi erklärt den Trick", "Knuspel bleibt lieber im Häuschen"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Im Hamsterzimmer", "steht", "ein großes, buntes Laufrad."], satz: "Im Hamsterzimmer steht ein großes, buntes Laufrad." },
        { teile: ["Vorsichtig", "setzt", "Knuspel", "eine Pfote hinein."], satz: "Vorsichtig setzt Knuspel eine Pfote hinein." },
        { teile: ["Seine Freundin Nussi", "zeigt", "ihm", "das langsame Loslaufen."], satz: "Seine Freundin Nussi zeigt ihm das langsame Loslaufen." },
        { teile: ["Schon bald", "flitzen", "beide", "abwechselnd durch das Rad."], satz: "Schon bald flitzen beide abwechselnd durch das Rad." }
      ],
      satzVerbinden: [
        { teil1: "Knuspel hopst überrascht aus dem Rad,", teil2: "es sich sofort zu drehen beginnt.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Knuspel hopst überrascht aus dem Rad, weil es sich sofort zu drehen beginnt." },
        { teil1: "Nussi zeigt ihm das langsame Loslaufen,", teil2: "flitzen beide vergnügt durch das Rad.", optionen: ["aber", "danach", "weil"], richtig: 1, loesung: "Nussi zeigt ihm das langsame Loslaufen, danach flitzen beide vergnügt durch das Rad." },
        { teil1: "Knuspel ist etwas verdutzt,", teil2: "traut er sich kurz nicht mehr ins Rad.", optionen: ["deshalb", "weil", "aber"], richtig: 0, loesung: "Knuspel ist etwas verdutzt, deshalb traut er sich kurz nicht mehr ins Rad." },
        { teil1: "Am Anfang ist das Rad ungewohnt,", teil2: "nach wenigen Minuten macht es riesigen Spaß.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Am Anfang ist das Rad ungewohnt, aber nach wenigen Minuten macht es riesigen Spaß." }
      ],
      wichtigePunkte: ["neues buntes Laufrad", "Rad dreht überraschend", "Nussi zeigt den Trick", "flitzen und kichern"]
    },
    {
      tag: 18,
      titel: "Bommel baut eine Brücke",
      text: "Am Morgen möchte Bommel von seinem Kuschelhaus zur Futterschale kommen. Doch dazwischen liegt eine kleine Lücke, über die er nicht springen mag. Da schlägt sein Freund Flauschi vor, gemeinsam eine Brücke zu bauen. Zusammen sammeln die beiden flache Holzstäbchen und legen sie sauber nebeneinander. Flauschi prüft vorsichtig mit den Pfoten, ob die neue Brücke wirklich hält. Als Bommel sicher hinübertrippelt, teilen beide als Belohnung eine süße Beere.",
      fragen: [
        { frage: "Wohin möchte Bommel am Morgen kommen?", optionen: ["Zur Futterschale", "Ins Laufrad", "Zur Tür"], richtig: [0] },
        { frage: "Woraus bauen die Hamster ihre Brücke?", optionen: ["Aus Strohhalmen", "Aus flachen Holzstäbchen", "Aus Papier"], richtig: [1] },
        { frage: "Wer baut und prüft die Brücke?", optionen: ["Bommel und Flauschi sammeln Holzstäbchen", "Sie legen die Stäbchen sauber nebeneinander", "Flauschi prüft vorsichtig mit den Pfoten", "Knuspel malt die Brücke an"], richtig: [0, 1, 2] },
        { frage: "Was hindert Bommel auf dem Weg?", optionen: ["Eine kleine Lücke", "Ein großer Stein", "Eine geschlossene Tür"], richtig: [0] },
        { frage: "Was passiert am Schluss der Geschichte?", optionen: ["Bommel trippelt sicher hinüber", "Beide teilen eine süße Beere", "Die Brücke bricht zusammen", "Sie bekommen eine Belohnung"], richtig: [0, 1, 3] },
        { frage: "Wann spielt die Geschichte?", optionen: ["Am Morgen", "Am Abend", "In der Nacht"], richtig: [0] },
        { frage: "Wer hat die Idee mit der Brücke?", optionen: ["Bommel", "Flauschi", "Nussi"], richtig: [1] },
        { frage: "Welche zwei Orte verbindet die neue Brücke?", optionen: ["Das Kuschelhaus", "Die Futterschale", "Das Laufrad", "Der Garten"], richtig: [0, 1] },
        { frage: "Womit prüft Flauschi, ob die Brücke hält?", optionen: ["Mit der Nase", "Mit den Pfoten", "Mit einem Stein"], richtig: [1] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Bommel mag nicht über die Lücke springen", "Die Freunde arbeiten zusammen", "Die Beere ist süß", "Bommel bleibt im Kuschelhaus"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Am Morgen", "möchte", "Bommel", "zur Futterschale kommen."], satz: "Am Morgen möchte Bommel zur Futterschale kommen." },
        { teile: ["Zusammen", "sammeln", "die beiden Hamster", "flache Holzstäbchen."], satz: "Zusammen sammeln die beiden Hamster flache Holzstäbchen." },
        { teile: ["Vorsichtig", "prüft", "Flauschi", "die neue Brücke."], satz: "Vorsichtig prüft Flauschi die neue Brücke." },
        { teile: ["Als Belohnung", "teilen", "beide", "eine süße Beere."], satz: "Als Belohnung teilen beide eine süße Beere." }
      ],
      satzVerbinden: [
        { teil1: "Bommel mag nicht über die Lücke springen,", teil2: "bauen die beiden eine feste Brücke.", optionen: ["weil", "deshalb", "aber"], richtig: 1, loesung: "Bommel mag nicht über die Lücke springen, deshalb bauen die beiden eine feste Brücke." },
        { teil1: "Flauschi prüft zuerst die Brücke,", teil2: "trippelt Bommel sicher hinüber.", optionen: ["danach", "weil", "aber"], richtig: 0, loesung: "Flauschi prüft zuerst die Brücke, danach trippelt Bommel sicher hinüber." },
        { teil1: "Beide freuen sich über die süße Beere,", teil2: "ihre neue Brücke so gut hält.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Beide freuen sich über die süße Beere, weil ihre neue Brücke so gut hält." },
        { teil1: "Zwischen Haus und Schale ist eine Lücke,", teil2: "mit Holzstäbchen lösen sie das Problem.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Zwischen Haus und Schale ist eine Lücke, aber mit Holzstäbchen lösen sie das Problem." }
      ],
      wichtigePunkte: ["Lücke zur Futterschale", "Holzstäbchen gesammelt", "Flauschi prüft Brücke", "süße Beere geteilt"]
    },
    {
      tag: 19,
      titel: "Rudolphs leuchtende Nase",
      text: "Am Abend vor Weihnachten startet der Weihnachtsmann mit seinem vollen Schlitten. Kurz nach dem Abflug zieht plötzlich dichter Nebel über die verschneiten Tannen auf. Der Weihnachtsmann kann den Weg durch die grauen Wolken kaum noch erkennen. Da tritt das Rentier Rudolph mutig nach vorn an die Spitze. Seine rote Nase leuchtet sofort so hell wie eine warme Laterne. Alle Rentiere folgen dem Licht, und alle Geschenke kommen pünktlich an.",
      fragen: [
        { frage: "Wann startet der Weihnachtsmann seinen Flug?", optionen: ["Am Abend vor Weihnachten", "Am Neujahrstag", "Am frühen Morgen"], richtig: [0] },
        { frage: "Was zieht plötzlich über die Tannen auf?", optionen: ["Ein heftiges Gewitter", "Dichter Nebel", "Ein Regenbogen"], richtig: [1] },
        { frage: "Was macht das Rentier Rudolph?", optionen: ["Es tritt mutig nach vorn an die Spitze", "Seine rote Nase leuchtet hell", "Es bleibt im Stall", "Es führt die anderen Rentiere durch den Nebel"], richtig: [0, 1, 3] },
        { frage: "Womit wird Rudolphs Nase verglichen?", optionen: ["Mit einer warmen Laterne", "Mit einer Kerze", "Mit dem Mond"], richtig: [0] },
        { frage: "Was stimmt am Ende der Geschichte?", optionen: ["Alle Rentiere folgen dem Licht", "Alle Geschenke kommen pünktlich an", "Der Schlitten muss umkehren", "Der Weihnachtsmann findet den Weg"], richtig: [0, 1, 3] },
        { frage: "Welches Problem hat der Weihnachtsmann im Nebel?", optionen: ["Der Schlitten ist zu leicht", "Er kann den Weg kaum noch erkennen", "Ein Geschenk fällt herunter"], richtig: [1] },
        { frage: "Welche Farbe haben die Wolken im Nebel?", optionen: ["Weiß", "Grau", "Blau"], richtig: [1] },
        { frage: "Was kommt in der Winterlandschaft vor?", optionen: ["Verschneite Tannen", "Dichter Nebel", "Graue Wolken", "Blühende Blumen"], richtig: [0, 1, 2] },
        { frage: "Welche Farbe hat Rudolphs Nase?", optionen: ["Gold", "Rot", "Gelb"], richtig: [1] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Der Schlitten ist voll mit Geschenken", "Rudolph ist mutig", "Die Rentiere verirren sich", "Der Nebel kommt kurz nach dem Abflug"], richtig: [0, 1, 3] }
      ],
      satzPuzzle: [
        { teile: ["Der Weihnachtsmann", "startet", "mit seinem vollen Schlitten."], satz: "Der Weihnachtsmann startet mit seinem vollen Schlitten." },
        { teile: ["Plötzlich", "zieht", "dichter Nebel", "über die Tannen auf."], satz: "Plötzlich zieht dichter Nebel über die Tannen auf." },
        { teile: ["Seine rote Nase", "leuchtet", "hell", "wie eine warme Laterne."], satz: "Seine rote Nase leuchtet hell wie eine warme Laterne." },
        { teile: ["Alle Geschenke", "kommen", "rechtzeitig und pünktlich", "an."], satz: "Alle Geschenke kommen rechtzeitig und pünktlich an." }
      ],
      satzVerbinden: [
        { teil1: "Alle Geschenke kommen pünktlich an,", teil2: "Rudolph mit seiner Nase den Weg leuchtet.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Alle Geschenke kommen pünktlich an, weil Rudolph mit seiner Nase den Weg leuchtet." },
        { teil1: "Der Weihnachtsmann sieht den Weg im Nebel nicht,", teil2: "tritt Rudolph mutig nach vorn.", optionen: ["aber", "deshalb", "weil"], richtig: 1, loesung: "Der Weihnachtsmann sieht den Weg im Nebel nicht, deshalb tritt Rudolph mutig nach vorn." },
        { teil1: "Der Nebel ist sehr dicht,", teil2: "Rudolphs Nase leuchtet hell hindurch.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Der Nebel ist sehr dicht, aber Rudolphs Nase leuchtet hell hindurch." },
        { teil1: "Rudolph tritt an die Spitze,", teil2: "folgen alle Rentiere seinem roten Licht.", optionen: ["danach", "weil", "aber"], richtig: 0, loesung: "Rudolph tritt an die Spitze, danach folgen alle Rentiere seinem roten Licht." }
      ],
      wichtigePunkte: ["Start vor Weihnachten", "dichter Nebel", "Rudolphs Nase leuchtet", "Geschenke pünktlich da"]
    },
    {
      tag: 20,
      titel: "Zimtsterne für den Wichtel",
      text: "In der warmen Weihnachtsbäckerei rollt die kleine Elfe den Teig dünn aus. Der Wichtel sticht mit einer goldenen Form viele hübsche Sterne aus. Vorsichtig legen beide alle Sterne nebeneinander aufs Backblech. Kurz darauf duftet die ganze Werkstatt herrlich nach Zimt und Vanille. Als die Plätzchen abgekühlt sind, streuen sie weißen Puderzucker wie Schnee darüber. Zum Schluss stellen sie eine bunte Schale für den Weihnachtsmann auf den Tisch.",
      fragen: [
        { frage: "Was macht die kleine Elfe mit dem Teig?", optionen: ["Sie rollt ihn dünn aus", "Sie isst ihn auf", "Sie friert ihn ein"], richtig: [0] },
        { frage: "Welche Farbe hat die Ausstechform des Wichtels?", optionen: ["Silbern", "Golden", "Rot"], richtig: [1] },
        { frage: "Wonach duftet kurz darauf die ganze Werkstatt?", optionen: ["Nach Zimt", "Nach Vanille", "Nach Zitrone", "Nach Schokolade"], richtig: [0, 1] },
        { frage: "Für wen stellen sie die bunte Schale auf den Tisch?", optionen: ["Für Rudolph", "Für den Weihnachtsmann", "Für die Nachbarn"], richtig: [1] },
        { frage: "Was machen Elfe und Wichtel gemeinsam?", optionen: ["Sie legen die Sterne aufs Backblech", "Sie streuen weißen Puderzucker darüber", "Sie stellen eine bunte Schale auf den Tisch", "Sie verpacken Geschenke"], richtig: [0, 1, 2] },
        { frage: "Wie ist es in der Weihnachtsbäckerei?", optionen: ["Kalt", "Warm", "Zugig"], richtig: [1] },
        { frage: "Womit wird der weiße Puderzucker verglichen?", optionen: ["Mit Mehl", "Mit Schnee", "Mit Wolken"], richtig: [1] },
        { frage: "Wer arbeitet in der Weihnachtsbäckerei?", optionen: ["Die kleine Elfe", "Der Wichtel", "Ein Schneemann", "Der Bäcker aus dem Dorf"], richtig: [0, 1] },
        { frage: "Wann streuen sie den Puderzucker über die Plätzchen?", optionen: ["Vor dem Backen", "Als die Plätzchen abgekühlt sind", "Direkt aus dem heißen Ofen"], richtig: [1] },
        { frage: "Welche Aussagen stimmen?", optionen: ["Sie stechen hübsche Sterne aus", "Die Sterne liegen nebeneinander auf dem Blech", "Die Schale ist bunt", "Sie backen Lebkuchenhäuser"], richtig: [0, 1, 2] }
      ],
      satzPuzzle: [
        { teile: ["Die kleine Elfe", "rollt", "den Teig", "dünn aus."], satz: "Die kleine Elfe rollt den Teig dünn aus." },
        { teile: ["Der Wichtel", "sticht", "mit einer goldenen Form", "hübsche Sterne aus."], satz: "Der Wichtel sticht mit einer goldenen Form hübsche Sterne aus." },
        { teile: ["Herrlich", "duftet", "die ganze Werkstatt", "nach Zimt und Vanille."], satz: "Herrlich duftet die ganze Werkstatt nach Zimt und Vanille." },
        { teile: ["Zum Schluss", "stellen", "sie", "eine bunte Schale", "auf den Tisch."], satz: "Zum Schluss stellen sie eine bunte Schale auf den Tisch." }
      ],
      satzVerbinden: [
        { teil1: "Die Werkstatt duftet herrlich,", teil2: "die Zimtsterne im Ofen backen.", optionen: ["weil", "deshalb", "aber"], richtig: 0, loesung: "Die Werkstatt duftet herrlich, weil die Zimtsterne im Ofen backen." },
        { teil1: "Zuerst kühlen die Plätzchen ab,", teil2: "streuen beide weißen Puderzucker darüber.", optionen: ["aber", "danach", "weil"], richtig: 1, loesung: "Zuerst kühlen die Plätzchen ab, danach streuen beide weißen Puderzucker darüber." },
        { teil1: "Sie möchten dem Weihnachtsmann eine Freude machen,", teil2: "stellen sie eine bunte Schale auf den Tisch.", optionen: ["deshalb", "weil", "aber"], richtig: 0, loesung: "Sie möchten dem Weihnachtsmann eine Freude machen, deshalb stellen sie eine bunte Schale auf den Tisch." },
        { teil1: "Draußen ist es eisig kalt,", teil2: "in der Weihnachtsbäckerei ist es gemütlich warm.", optionen: ["weil", "deshalb", "aber"], richtig: 2, loesung: "Draußen ist es eisig kalt, aber in der Weihnachtsbäckerei ist es gemütlich warm." }
      ],
      wichtigePunkte: ["Elfe rollt Teig aus", "Wichtel sticht Sterne", "Duft und Puderzucker", "Schale für Weihnachtsmann"]
    }
  ];

  const EINHEITEN = ROH_EINHEITEN.map(baueEinheit);

  /* Bewertung (für Kompatibilität erhalten). */
  const BEGLEITUNG = [];
  const KRITERIEN = [];

  function einheit(tag) {
    return EINHEITEN.find(function (e) { return e.tag === tag; }) || null;
  }

  /* Fragensatz Nr. (1-basiert) einer Geschichte; Umdrehen und Hinauslaufen
     sind erlaubt – so gibt es unendlich viele Runden mit denselben Sätzen. */
  function fragenSet(e, nr) {
    const sets = (e && Array.isArray(e.fragenSets)) ? e.fragenSets : [];
    if (sets.length === 0) { return []; }
    const i = ((nr - 1) % sets.length + sets.length) % sets.length;
    return sets[i];
  }

  return {
    EINHEITEN: EINHEITEN,
    BEGLEITUNG: BEGLEITUNG,
    KRITERIEN: KRITERIEN,
    einheit: einheit,
    fragenSet: fragenSet
  };
});
