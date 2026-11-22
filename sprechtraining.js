/* ------------------------------------------------------------------
   sprechtraining.js
   Die Geschichten für „Deutsch üben" (Eltern-Kind-Übung) – endlos.

   Quelle: „14 Tage Deutsch-Sprechtraining für Emma – 3. Klasse
   Volksschule" (PDF auf dem Desktop, November 2026).

   Es gibt kein „Tag 1 bis 14" mehr: Jede Geschichte ist eine Übung,
   die beliebig oft und in beliebiger Reihenfolge gemacht werden kann.
   Jede Übung hat vier Fragensätze (fragenSets) – die App wählt pro
   Runde zufällig einen aus, sodass die Fragen immer wieder anders sind.

   Jede Geschichte:
   - tag           : Nummer 1–14 (nur noch als interne Nummer/Audio-Kürzel)
   - titel         : das Übungsziel als Fähigkeit
   - ziel          : die Geschichte in einem Satz
   - text          : der kurze Abschnitt (wird vorgelesen)
   - fragenSets    : 4 alternative Fragensätze mit erwarteter Antwort
                     (für die Begleitung); Satz 1 ist der aus dem PDF
   - satzAnfaenge  : Hilfs-Satzanfänge (schrittweise einblenden)
   - hinweis       : Übungstipp für die Begleitung
   - wichtigePunkte: kurze Stichworte – was Emma in der Nacherzählung erwähnen soll
   - musterloesung : Beispielnacherzählung für die Begleitung

   Audio-Schnipsel (vom Werkzeug tools/sprechtraining-audio.cjs erzeugt):
   id = "tagNN-text", "tagNN-sS-fK" (S = Fragensatz, K = Fragennummer),
   "tagNN-hinweis"
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

  const EINHEITEN = [
    {
      tag: 1,
      titel: "Wer? Was? Wo?",
      ziel: "Emma ist im Garten.",
      text: "Emma geht am Nachmittag in den Garten. Dort sieht sie einen kleinen roten Ball. Sie hebt den Ball auf und wirft ihn ihrem Bruder zu.",
      fragenSets: [
        [
          { frage: "Wer geht in den Garten?", antwort: "Emma geht in den Garten." },
          { frage: "Was sieht Emma?", antwort: "Sie sieht einen kleinen roten Ball." },
          { frage: "Was macht sie mit dem Ball?", antwort: "Sie hebt den Ball auf und wirft ihn ihrem Bruder zu." }
        ],
        [
          { frage: "Wann geht Emma in den Garten?", antwort: "Am Nachmittag." },
          { frage: "Was ist mit dem Ball?", antwort: "Emma hebt ihn auf und wirft ihn ihrem Bruder zu." },
          { frage: "Wem wirft Emma den Ball zu?", antwort: "Ihrem Bruder." }
        ],
        [
          { frage: "Wo sieht Emma den Ball?", antwort: "Im Garten." },
          { frage: "Wie sieht der Ball aus?", antwort: "Er ist klein und rot." },
          { frage: "Was passiert am Ende?", antwort: "Emma wirft den Ball ihrem Bruder zu." }
        ],
        [
          { frage: "Wer wirft den Ball?", antwort: "Emma." },
          { frage: "Für wen ist der Ball?", antwort: "Für Emmas Bruder." },
          { frage: "Was passiert zuerst, was passiert dann?", antwort: "Emma geht in den Garten, sieht den Ball und wirft ihn ihrem Bruder zu." }
        ]
      ],
      satzAnfaenge: ["Emma geht …", "Sie sieht …", "Dann …"],
      hinweis: "Emma soll drei Informationen finden und zu vollständigen Sätzen machen.",
      wichtigePunkte: ["Garten", "roter Ball", "hebt auf", "wirft Bruder zu"],
      musterloesung: "Emma geht in den Garten. Sie sieht einen roten Ball. Dann wirft sie ihn ihrem Bruder zu."
    },
    {
      tag: 2,
      titel: "Wer macht was?",
      ziel: "Ben füttert die Katze.",
      text: "Ben kommt nach der Schule nach Hause. Seine Katze wartet schon in der Küche. Ben gibt ihr Futter und frisches Wasser.",
      fragenSets: [
        [
          { frage: "Wer kommt nach Hause?", antwort: "Ben kommt nach Hause." },
          { frage: "Wo wartet die Katze?", antwort: "Die Katze wartet in der Küche." },
          { frage: "Was gibt Ben der Katze?", antwort: "Ben gibt ihr Futter und frisches Wasser." }
        ],
        [
          { frage: "Wann kommt Ben nach Hause?", antwort: "Nach der Schule." },
          { frage: "Wer wartet schon in der Küche?", antwort: "Seine Katze." },
          { frage: "Was bekommt die Katze?", antwort: "Futter und frisches Wasser." }
        ],
        [
          { frage: "Wer füttert die Katze?", antwort: "Ben." },
          { frage: "Wo ist die Katze?", antwort: "In der Küche." },
          { frage: "Was trinkt die Katze?", antwort: "Frisches Wasser." }
        ],
        [
          { frage: "Was passiert zuerst in der Geschichte?", antwort: "Ben kommt nach der Schule nach Hause." },
          { frage: "Wen findet Ben in der Küche?", antwort: "Seine Katze." },
          { frage: "Wie endet die Geschichte?", antwort: "Ben gibt der Katze Futter und frisches Wasser." }
        ]
      ],
      satzAnfaenge: ["Ben kommt …", "Die Katze wartet …", "Er gibt ihr …"],
      hinweis: "Achte auf das Verb: kommt, wartet, gibt.",
      wichtigePunkte: ["nach der Schule", "Küche", "Futter", "Wasser"],
      musterloesung: "Ben kommt nach der Schule nach Hause. Die Katze wartet in der Küche. Ben gibt ihr Futter und Wasser."
    },
    {
      tag: 3,
      titel: "Wo und wann?",
      ziel: "Ein Besuch am Spielplatz.",
      text: "Am Samstag geht Sara mit ihrem Vater auf den Spielplatz. Die Sonne scheint. Sara klettert auf das Klettergerüst und rutscht danach die große Rutsche hinunter.",
      fragenSets: [
        [
          { frage: "Wann geht Sara auf den Spielplatz?", antwort: "Am Samstag." },
          { frage: "Mit wem geht sie?", antwort: "Mit ihrem Vater." },
          { frage: "Was macht sie zuerst?", antwort: "Sie klettert auf das Klettergerüst." },
          { frage: "Was macht sie danach?", antwort: "Sie rutscht die große Rutsche hinunter." }
        ],
        [
          { frage: "Mit wem geht Sara auf den Spielplatz?", antwort: "Mit ihrem Vater." },
          { frage: "Wie ist das Wetter?", antwort: "Die Sonne scheint." },
          { frage: "Worauf klettert Sara?", antwort: "Auf das Klettergerüst." },
          { frage: "Wohin rutscht Sara danach?", antwort: "Die große Rutsche hinunter." }
        ],
        [
          { frage: "Wann geht Sara zum Spielplatz?", antwort: "Am Samstag." },
          { frage: "Was macht Sara zuerst?", antwort: "Sie klettert auf das Klettergerüst." },
          { frage: "Was macht sie danach?", antwort: "Sie rutscht die Rutsche hinunter." },
          { frage: "Wer geht mit Sara?", antwort: "Ihr Vater." }
        ],
        [
          { frage: "Wer klettert auf das Klettergerüst?", antwort: "Sara." },
          { frage: "Wo ist Sara am Samstag?", antwort: "Auf dem Spielplatz." },
          { frage: "Was ist das Letzte, was Sara macht?", antwort: "Sie rutscht die große Rutsche hinunter." }
        ]
      ],
      satzAnfaenge: ["Am Samstag …", "Zuerst …", "Danach …"],
      hinweis: "Heute darf Emma die Reihenfolge mit zuerst und danach ausdrücken.",
      wichtigePunkte: ["Samstag", "mit dem Vater", "klettert", "rutscht"],
      musterloesung: "Am Samstag geht Sara mit ihrem Vater auf den Spielplatz. Zuerst klettert sie. Danach rutscht sie hinunter."
    },
    {
      tag: 4,
      titel: "Aus einem Wort wird ein Satz",
      ziel: "Der verschwundene Handschuh.",
      text: "Paul möchte nach draußen gehen. Er findet aber seinen blauen Handschuh nicht. Er sucht unter dem Tisch und entdeckt ihn schließlich neben der Tür.",
      fragenSets: [
        [
          { frage: "Was möchte Paul machen?", antwort: "Paul möchte nach draußen gehen." },
          { frage: "Was findet er nicht?", antwort: "Seinen blauen Handschuh." },
          { frage: "Wo entdeckt er den Handschuh?", antwort: "Neben der Tür." }
        ],
        [
          { frage: "Wer sucht den Handschuh?", antwort: "Paul." },
          { frage: "Wo sucht Paul zuerst?", antwort: "Unter dem Tisch." },
          { frage: "Wo liegt der Handschuh am Ende?", antwort: "Neben der Tür." }
        ],
        [
          { frage: "Was möchte Paul machen?", antwort: "Nach draußen gehen." },
          { frage: "Welcher Handschuh fehlt?", antwort: "Der blaue." },
          { frage: "Wer findet den Handschuh, und wo?", antwort: "Paul, neben der Tür." }
        ],
        [
          { frage: "Was findet Paul nicht?", antwort: "Seinen blauen Handschuh." },
          { frage: "Wo sucht er ihn?", antwort: "Unter dem Tisch." },
          { frage: "Wie geht die Geschichte aus?", antwort: "Paul entdeckt den Handschuh neben der Tür und kann nach draußen gehen." }
        ]
      ],
      satzAnfaenge: ["Paul möchte …", "Er findet … nicht.", "Schließlich entdeckt er …"],
      hinweis: "Wenn Emma nur „Handschuh“ sagt, frage: „Was ist mit dem Handschuh?“",
      wichtigePunkte: ["nach draußen", "Handschuh nicht gefunden", "unter dem Tisch gesucht", "neben der Tür"],
      musterloesung: "Paul möchte nach draußen gehen. Er findet seinen Handschuh nicht. Schließlich entdeckt er ihn neben der Tür."
    },
    {
      tag: 5,
      titel: "Zwei Sätze verbinden",
      ziel: "Der Apfelkuchen.",
      text: "Oma backt einen Apfelkuchen. Es duftet wunderbar in der Küche. Emma hilft ihr und legt die Apfelstücke auf den Teig. Später essen beide ein Stück Kuchen.",
      fragenSets: [
        [
          { frage: "Wer backt den Kuchen?", antwort: "Die Oma." },
          { frage: "Wie riecht es in der Küche?", antwort: "Es duftet wunderbar." },
          { frage: "Wobei hilft Emma?", antwort: "Sie legt die Apfelstücke auf den Teig." },
          { frage: "Was machen sie später?", antwort: "Sie essen ein Stück Kuchen." }
        ],
        [
          { frage: "Was backt die Oma?", antwort: "Einen Apfelkuchen." },
          { frage: "Wer hilft der Oma?", antwort: "Emma." },
          { frage: "Was tut Emma mit den Apfelstücken?", antwort: "Sie legt sie auf den Teig." },
          { frage: "Wann essen sie Kuchen?", antwort: "Später." }
        ],
        [
          { frage: "Wer backt den Apfelkuchen?", antwort: "Die Oma." },
          { frage: "Wobei hilft Emma?", antwort: "Sie legt die Apfelstücke auf den Teig." },
          { frage: "Wie riecht es?", antwort: "Es duftet wunderbar." },
          { frage: "Was essen beide später?", antwort: "Ein Stück Kuchen." }
        ],
        [
          { frage: "Wo duftet es wunderbar?", antwort: "In der Küche." },
          { frage: "Wer legt die Apfelstücke auf den Teig?", antwort: "Emma." },
          { frage: "Was passiert ganz am Ende?", antwort: "Oma und Emma essen ein Stück Kuchen." },
          { frage: "Wer backt mit Emmas Hilfe?", antwort: "Die Oma." }
        ]
      ],
      satzAnfaenge: ["Oma backt …", "In der Küche …", "Emma hilft …", "Später …"],
      hinweis: "Emma soll mindestens zwei Sätze nacheinander sagen.",
      wichtigePunkte: ["Oma backt", "duftet", "legt Apfelstücke", "essen Kuchen"],
      musterloesung: "Oma backt einen Apfelkuchen. Es duftet wunderbar. Emma legt Apfelstücke auf den Teig. Später essen beide Kuchen."
    },
    {
      tag: 6,
      titel: "Eine kleine Handlung erzählen",
      ziel: "Der nasse Hund.",
      text: "Lena geht mit ihrem Hund Bruno spazieren. Plötzlich beginnt es stark zu regnen. Lena spannt ihren gelben Schirm auf. Bruno schüttelt sich und spritzt Wasser auf Lenas Hose.",
      fragenSets: [
        [
          { frage: "Wer geht spazieren?", antwort: "Lena mit ihrem Hund Bruno." },
          { frage: "Was passiert plötzlich?", antwort: "Es beginnt stark zu regnen." },
          { frage: "Was macht Lena?", antwort: "Sie spannt ihren gelben Schirm auf." },
          { frage: "Was macht Bruno?", antwort: "Er schüttelt sich und spritzt Wasser auf Lenas Hose." }
        ],
        [
          { frage: "Wen nimmt Lena mit zum Spazierengehen?", antwort: "Ihren Hund Bruno." },
          { frage: "Was passiert plötzlich?", antwort: "Es beginnt stark zu regnen." },
          { frage: "Welchen Schirm spannt Lena auf?", antwort: "Ihren gelben." },
          { frage: "Warum wird Lenas Hose nass?", antwort: "Bruno schüttelt sich und spritzt Wasser." }
        ],
        [
          { frage: "Mit wem geht Lena spazieren?", antwort: "Mit ihrem Hund Bruno." },
          { frage: "Wie beginnt es zu regnen?", antwort: "Plötzlich und stark." },
          { frage: "Was macht Bruno, als er nass ist?", antwort: "Er schüttelt sich." }
        ],
        [
          { frage: "Wann beginnt es zu regnen?", antwort: "Während des Spaziergangs." },
          { frage: "Wem gehört der gelbe Schirm?", antwort: "Lena." },
          { frage: "Was macht Bruno am Ende?", antwort: "Er schüttelt sich und spritzt Wasser auf Lenas Hose." }
        ]
      ],
      satzAnfaenge: ["Lena geht …", "Plötzlich …", "Deshalb …", "Bruno …"],
      hinweis: "Übt die Verbindung zwischen Ereignis und Reaktion: Es regnet – Lena öffnet den Schirm.",
      wichtigePunkte: ["Lena mit Bruno", "Regen", "Schirm auf", "Hose nass"],
      musterloesung: "Lena geht mit Bruno spazieren. Plötzlich beginnt es zu regnen. Lena öffnet ihren Schirm. Bruno schüttelt sich und macht ihre Hose nass."
    },
    {
      tag: 7,
      titel: "Wiederholung: drei Sätze",
      ziel: "Der verlorene Ball.",
      text: "Die Kinder spielen im Park Fußball. Tom schießt den Ball sehr weit. Der Ball rollt hinter einen Busch. Gemeinsam suchen die Kinder und finden ihn unter einer Bank.",
      fragenSets: [
        [
          { frage: "Was spielen die Kinder?", antwort: "Sie spielen im Park Fußball." },
          { frage: "Wohin rollt der Ball?", antwort: "Hinter einen Busch." },
          { frage: "Wo finden sie ihn?", antwort: "Unter einer Bank." }
        ],
        [
          { frage: "Wer spielt Fußball?", antwort: "Die Kinder im Park." },
          { frage: "Wer schießt den Ball weit?", antwort: "Tom." },
          { frage: "Wo liegt der Ball am Ende?", antwort: "Unter einer Bank." }
        ],
        [
          { frage: "Wo spielen die Kinder Fußball?", antwort: "Im Park." },
          { frage: "Wohin rollt der Ball?", antwort: "Hinter einen Busch." },
          { frage: "Wer findet den Ball?", antwort: "Die Kinder gemeinsam." }
        ],
        [
          { frage: "Was macht Tom?", antwort: "Er schießt den Ball sehr weit." },
          { frage: "Was passiert mit dem Ball?", antwort: "Er rollt hinter einen Busch." },
          { frage: "Wie finden die Kinder den Ball?", antwort: "Gemeinsam suchen sie und finden ihn unter einer Bank." }
        ]
      ],
      satzAnfaenge: ["Die Kinder spielen …", "Der Ball rollt …", "Am Ende …"],
      hinweis: "Wiederholt alle Schritte in Ruhe. Hilf nur so viel wie nötig.",
      wichtigePunkte: ["Fußball im Park", "schießt weit", "hinter Busch", "unter der Bank"],
      musterloesung: "Die Kinder spielen Fußball. Toms Ball rollt hinter einen Busch. Am Ende finden sie ihn unter einer Bank."
    },
    {
      tag: 8,
      titel: "Wichtiges erkennen",
      ziel: "Der Ausflug in den Zoo.",
      text: "Die Klasse 3A besucht den Zoo. Zuerst beobachten die Kinder die Elefanten. Ein Elefant spritzt mit seinem Rüssel Wasser. Danach gehen sie zu den Pinguinen. Die Kinder lachen, weil die Pinguine so lustig watscheln.",
      fragenSets: [
        [
          { frage: "Wohin geht die Klasse?", antwort: "In den Zoo." },
          { frage: "Was macht der Elefant?", antwort: "Er spritzt mit seinem Rüssel Wasser." },
          { frage: "Welche Tiere sehen die Kinder danach?", antwort: "Die Pinguine." },
          { frage: "Warum lachen sie?", antwort: "Weil die Pinguine so lustig watscheln." }
        ],
        [
          { frage: "Welche Klasse besucht den Zoo?", antwort: "Die Klasse 3A." },
          { frage: "Welche Tiere sehen die Kinder zuerst?", antwort: "Die Elefanten." },
          { frage: "Was macht der Elefant mit dem Rüssel?", antwort: "Er spritzt Wasser." },
          { frage: "Warum lachen die Kinder?", antwort: "Weil die Pinguine lustig watscheln." }
        ],
        [
          { frage: "Wohin geht die Klasse 3A?", antwort: "In den Zoo." },
          { frage: "Wen sehen die Kinder danach?", antwort: "Die Pinguine." },
          { frage: "Womit spritzt der Elefant?", antwort: "Mit seinem Rüssel." }
        ],
        [
          { frage: "Wer besucht den Zoo?", antwort: "Die Klasse 3A." },
          { frage: "Was passiert bei den Elefanten?", antwort: "Ein Elefant spritzt mit dem Rüssel Wasser." },
          { frage: "Wie watscheln die Pinguine?", antwort: "Lustig." }
        ]
      ],
      satzAnfaenge: ["Die Klasse besucht …", "Zuerst …", "Danach …", "Die Kinder lachen, weil …"],
      hinweis: "Nicht jedes Detail muss wiederholt werden. Emma soll die wichtigsten Ereignisse nennen.",
      wichtigePunkte: ["Zoo", "Elefanten", "Rüssel-Wasser", "Pinguine", "lachen"],
      musterloesung: "Die Klasse besucht den Zoo. Zuerst sehen die Kinder Elefanten. Ein Elefant spritzt Wasser. Danach beobachten sie Pinguine, die lustig watscheln."
    },
    {
      tag: 9,
      titel: "Sätze in die richtige Reihenfolge bringen",
      ziel: "Ein Morgen mit Verspätung.",
      text: "Am Morgen klingelt der Wecker nicht. Julia wacht spät auf. Schnell zieht sie sich an und packt ihre Schultasche. Ihr Vater bringt sie mit dem Auto zur Schule. Gerade noch rechtzeitig kommt sie im Klassenzimmer an.",
      fragenSets: [
        [
          { frage: "Was passiert zuerst?", antwort: "Der Wecker klingelt nicht." },
          { frage: "Warum muss Julia sich beeilen?", antwort: "Weil sie spät aufgewacht ist." },
          { frage: "Wie kommt sie zur Schule?", antwort: "Ihr Vater bringt sie mit dem Auto." },
          { frage: "Wie endet die Geschichte?", antwort: "Sie kommt gerade noch rechtzeitig im Klassenzimmer an." }
        ],
        [
          { frage: "Wer wacht spät auf?", antwort: "Julia." },
          { frage: "Warum wacht Julia spät auf?", antwort: "Weil der Wecker nicht klingelt." },
          { frage: "Wie kommt Julia zur Schule?", antwort: "Ihr Vater bringt sie mit dem Auto." },
          { frage: "Wie endet die Geschichte?", antwort: "Sie kommt gerade noch rechtzeitig an." }
        ],
        [
          { frage: "Was passiert am Morgen?", antwort: "Der Wecker klingelt nicht." },
          { frage: "Was packt Julia ein?", antwort: "Ihre Schultasche." },
          { frage: "Wer fährt Julia zur Schule?", antwort: "Ihr Vater." }
        ],
        [
          { frage: "Wen bringt der Vater zur Schule?", antwort: "Julia." },
          { frage: "Warum muss Julia sich beeilen?", antwort: "Weil sie spät aufgewacht ist." },
          { frage: "Wo kommt Julia gerade noch rechtzeitig an?", antwort: "Im Klassenzimmer." }
        ]
      ],
      satzAnfaenge: ["Zuerst …", "Weil …", "Dann …", "Zum Glück …"],
      hinweis: "Achte auf die zeitliche Reihenfolge und auf das Wort weil.",
      wichtigePunkte: ["Wecker klingelt nicht", "spät auf", "schnell anziehen", "Auto vom Vater", "rechtzeitig"],
      musterloesung: "Der Wecker klingelt nicht und Julia wacht spät auf. Sie zieht sich schnell an und packt ihre Tasche. Ihr Vater fährt sie zur Schule. Sie kommt gerade noch rechtzeitig an."
    },
    {
      tag: 10,
      titel: "Eine Geschichte mit Gefühlen",
      ziel: "Das kaputte Vogelhaus.",
      text: "Noah hat mit seinem Opa ein Vogelhaus gebaut. Als er es in den Garten tragen möchte, fällt es ihm aus der Hand. Ein kleines Brett löst sich. Noah ist traurig. Opa tröstet ihn und gemeinsam reparieren sie das Vogelhaus.",
      fragenSets: [
        [
          { frage: "Was hat Noah gebaut?", antwort: "Ein Vogelhaus, mit seinem Opa." },
          { frage: "Was passiert mit dem Vogelhaus?", antwort: "Es fällt ihm aus der Hand und ein Brett löst sich." },
          { frage: "Wie fühlt sich Noah?", antwort: "Traurig." },
          { frage: "Was machen Noah und Opa?", antwort: "Opa tröstet ihn, gemeinsam reparieren sie das Vogelhaus." }
        ],
        [
          { frage: "Wer hat das Vogelhaus gebaut?", antwort: "Noah mit seinem Opa." },
          { frage: "Was passiert, als Noah es tragen möchte?", antwort: "Es fällt ihm aus der Hand." },
          { frage: "Wie fühlt sich Noah?", antwort: "Traurig." },
          { frage: "Wer tröstet Noah?", antwort: "Sein Opa." }
        ],
        [
          { frage: "Was baut Noah mit seinem Opa?", antwort: "Ein Vogelhaus." },
          { frage: "Was passiert mit einem Brett?", antwort: "Es löst sich." },
          { frage: "Was machen sie am Ende?", antwort: "Sie reparieren das Vogelhaus gemeinsam." }
        ],
        [
          { frage: "Mit wem baut Noah das Vogelhaus?", antwort: "Mit seinem Opa." },
          { frage: "Warum ist Noah traurig?", antwort: "Weil das Vogelhaus kaputtgegangen ist." },
          { frage: "Wie endet die Geschichte?", antwort: "Opa tröstet Noah und zusammen reparieren sie das Vogelhaus." }
        ]
      ],
      satzAnfaenge: ["Noah hat … gebaut.", "Plötzlich …", "Er ist traurig, weil …", "Gemeinsam …"],
      hinweis: "Heute soll Emma auch sagen, warum sich eine Person so fühlt.",
      wichtigePunkte: ["Vogelhaus gebaut", "fällt herunter", "traurig", "reparieren"],
      musterloesung: "Noah hat mit seinem Opa ein Vogelhaus gebaut. Es fällt herunter und ein Brett löst sich. Noah ist traurig. Gemeinsam reparieren sie es."
    },
    {
      tag: 11,
      titel: "Eine Geschichte nacherzählen",
      ziel: "Der kleine Igel.",
      text: "Auf dem Schulweg entdeckt Amir einen kleinen Igel im Gras. Er bleibt stehen und schaut ihn vorsichtig an. Zu Hause erzählt er seiner Mutter davon. Sie erklärt ihm, dass man wilde Tiere nicht einfach mitnehmen soll. Am nächsten Tag sehen sie nach, ob der Igel noch dort ist. Er ist verschwunden.",
      fragenSets: [
        [
          { frage: "Wen entdeckt Amir?", antwort: "Einen kleinen Igel im Gras." },
          { frage: "Was macht er zuerst?", antwort: "Er bleibt stehen und schaut ihn vorsichtig an." },
          { frage: "Wem erzählt er davon?", antwort: "Seiner Mutter." },
          { frage: "Was erfährt er?", antwort: "Man soll wilde Tiere nicht einfach mitnehmen." },
          { frage: "Was sehen sie am nächsten Tag?", antwort: "Der Igel ist verschwunden." }
        ],
        [
          { frage: "Wen entdeckt Amir auf dem Schulweg?", antwort: "Einen kleinen Igel." },
          { frage: "Wo ist der Igel?", antwort: "Im Gras." },
          { frage: "Wem erzählt Amir vom Igel?", antwort: "Seiner Mutter." },
          { frage: "Was passiert am nächsten Tag?", antwort: "Der Igel ist verschwunden." }
        ],
        [
          { frage: "Was macht Amir zuerst?", antwort: "Er bleibt stehen und schaut den Igel vorsichtig an." },
          { frage: "Was lernt Amir?", antwort: "Man soll wilde Tiere nicht einfach mitnehmen." },
          { frage: "Wo entdeckt Amir den Igel?", antwort: "Auf dem Schulweg." },
          { frage: "Wie schaut Amir den Igel an?", antwort: "Vorsichtig." }
        ],
        [
          { frage: "Wer schaut sich den Igel an?", antwort: "Amir." },
          { frage: "Was erzählt Amir zu Hause?", antwort: "Von dem Igel." },
          { frage: "Ist der Igel am nächsten Tag noch dort?", antwort: "Nein, er ist verschwunden." }
        ]
      ],
      satzAnfaenge: ["Auf dem Schulweg …", "Zuerst …", "Zu Hause …", "Am nächsten Tag …"],
      hinweis: "Lies den Abschnitt zweimal. Emma erzählt anschließend mit eigenen Worten.",
      wichtigePunkte: ["Igel im Gras", "schaut an", "Mutter erzählt", "nicht mitnehmen", "verschwunden"],
      musterloesung: "Amir entdeckt einen Igel im Gras. Er schaut ihn vorsichtig an und erzählt seiner Mutter davon. Sie erklärt, dass wilde Tiere in der Natur bleiben sollen. Am nächsten Tag ist der Igel verschwunden."
    },
    {
      tag: 12,
      titel: "Mit eigenen Worten erzählen",
      ziel: "Die Überraschung für Papa.",
      text: "Mila möchte ihren Vater überraschen. Sie malt ein buntes Bild und schreibt eine kleine Karte dazu. Dann legt sie beides auf den Küchentisch. Als Papa nach Hause kommt, entdeckt er das Geschenk und freut sich sehr. Er umarmt Mila und bedankt sich.",
      fragenSets: [
        [
          { frage: "Was plant Mila?", antwort: "Ihren Vater zu überraschen." },
          { frage: "Was macht sie für Papa?", antwort: "Sie malt ein buntes Bild und schreibt eine kleine Karte." },
          { frage: "Wo legt sie das Geschenk hin?", antwort: "Auf den Küchentisch." },
          { frage: "Wie reagiert Papa?", antwort: "Er entdeckt das Geschenk, freut sich sehr, umarmt Mila und bedankt sich." }
        ],
        [
          { frage: "Wen möchte Mila überraschen?", antwort: "Ihren Vater." },
          { frage: "Was malt Mila?", antwort: "Ein buntes Bild." },
          { frage: "Wohin legt sie das Geschenk?", antwort: "Auf den Küchentisch." },
          { frage: "Was macht Papa, als er das Geschenk sieht?", antwort: "Er freut sich sehr, umarmt Mila und bedankt sich." }
        ],
        [
          { frage: "Was schreibt Mila dazu?", antwort: "Eine kleine Karte." },
          { frage: "Was entdeckt Papa?", antwort: "Das Geschenk auf dem Küchentisch." },
          { frage: "Wer umarmt Mila?", antwort: "Papa." }
        ],
        [
          { frage: "Was plant Mila?", antwort: "Eine Überraschung für ihren Vater." },
          { frage: "Was gehört zur Überraschung?", antwort: "Ein buntes Bild und eine kleine Karte." },
          { frage: "Wie reagiert Papa?", antwort: "Er freut sich und bedankt sich." }
        ]
      ],
      satzAnfaenge: ["Mila möchte …", "Zuerst …", "Danach …", "Als Papa …"],
      hinweis: "Die Hilfsfragen erst nach einem eigenen Versuch stellen.",
      wichtigePunkte: ["Überraschung", "Bild + Karte", "Küchentisch", "Papa freut sich"],
      musterloesung: "Mila möchte ihren Vater überraschen. Sie malt ein Bild und schreibt eine Karte. Sie legt alles auf den Tisch. Papa freut sich und umarmt sie."
    },
    {
      tag: 13,
      titel: "Selbstständig erzählen",
      ziel: "Der Ausflug zum See.",
      text: "Am Sonntag fährt Familie Berger an einen See. Sie packen eine Decke, Getränke und Brote ein. Am Ufer entdecken die Kinder eine Entenfamilie. Sie beobachten die Tiere leise. Danach essen alle gemeinsam auf der Decke. Bevor sie nach Hause fahren, sammeln sie ihren Müll ein.",
      fragenSets: [
        [
          { frage: "Wer fährt wohin?", antwort: "Familie Berger fährt an einen See." },
          { frage: "Was packt die Familie ein?", antwort: "Eine Decke, Getränke und Brote." },
          { frage: "Was entdecken die Kinder?", antwort: "Eine Entenfamilie am Ufer." },
          { frage: "Was machen sie vor der Heimfahrt?", antwort: "Sie sammeln ihren Müll ein." }
        ],
        [
          { frage: "Wohin fährt Familie Berger?", antwort: "An einen See." },
          { frage: "Was nehmen sie mit?", antwort: "Eine Decke, Getränke und Brote." },
          { frage: "Was machen die Kinder bei den Enten?", antwort: "Sie beobachten die Tiere leise." },
          { frage: "Was sammeln sie vor der Heimfahrt ein?", antwort: "Ihren Müll." }
        ],
        [
          { frage: "Wann fährt die Familie an den See?", antwort: "Am Sonntag." },
          { frage: "Wo essen sie?", antwort: "Auf der Decke." },
          { frage: "Wie beobachten die Kinder die Enten?", antwort: "Leise." }
        ],
        [
          { frage: "Wer entdeckt die Entenfamilie?", antwort: "Die Kinder." },
          { frage: "Wo entdecken sie die Enten?", antwort: "Am Ufer." },
          { frage: "Was passiert ganz am Ende?", antwort: "Sie sammeln ihren Müll ein und fahren nach Hause." }
        ]
      ],
      satzAnfaenge: ["Am Sonntag …", "Die Familie packt …", "Am Ufer …", "Bevor sie nach Hause fahren …"],
      hinweis: "Emma soll möglichst selbstständig vier bis fünf Sätze erzählen.",
      wichtigePunkte: ["See am Sonntag", "Decke + Brote", "Enten beobachtet", "Müll eingesammelt"],
      musterloesung: "Die Familie Berger macht einen Ausflug an einen See. Sie nimmt Essen und eine Decke mit. Die Kinder beobachten Enten. Danach essen alle zusammen und sammeln ihren Müll ein."
    },
    {
      tag: 14,
      titel: "Abschluss: frei erzählen",
      ziel: "Ein besonderer Tag.",
      text: "Heute ist für Ella ein besonderer Tag. Sie darf zum ersten Mal allein mit dem Fahrrad bis zum kleinen Park fahren. Ihre Mutter erklärt ihr vorher die Regeln. Ella setzt ihren Helm auf und fährt langsam los. Im Park trifft sie ihre Freundin. Gemeinsam spielen sie und fahren später wieder nach Hause. Ella ist stolz, weil alles gut geklappt hat.",
      fragenSets: [
        [
          { frage: "Was ist heute besonders?", antwort: "Ella darf zum ersten Mal allein mit dem Fahrrad bis zum Park fahren." },
          { frage: "Was erklärt die Mutter?", antwort: "Die Regeln." },
          { frage: "Was macht Ella vor der Fahrt?", antwort: "Sie setzt ihren Helm auf." },
          { frage: "Wen trifft sie?", antwort: "Ihre Freundin im Park." },
          { frage: "Warum ist Ella stolz?", antwort: "Weil alles gut geklappt hat." }
        ],
        [
          { frage: "Wen trifft Ella im Park?", antwort: "Ihre Freundin." },
          { frage: "Was setzt Ella auf?", antwort: "Ihren Helm." },
          { frage: "Wer erklärt ihr die Regeln?", antwort: "Ihre Mutter." },
          { frage: "Warum ist Ella stolz?", antwort: "Weil alles gut geklappt hat." }
        ],
        [
          { frage: "Wohin darf Ella zum ersten Mal allein fahren?", antwort: "Bis zum kleinen Park." },
          { frage: "Wie fährt Ella los?", antwort: "Langsam." },
          { frage: "Was machen Ella und ihre Freundin im Park?", antwort: "Sie spielen zusammen und fahren später nach Hause." }
        ],
        [
          { frage: "Wer fährt zum ersten Mal allein mit dem Fahrrad?", antwort: "Ella." },
          { frage: "Womit fährt Ella?", antwort: "Mit dem Fahrrad." },
          { frage: "Wie endet der Tag für Ella?", antwort: "Sie ist stolz, weil alles gut geklappt hat." }
        ]
      ],
      satzAnfaenge: ["Heute ist ein besonderer Tag, weil …", "Zuerst …", "Danach …", "Am Ende …", "Ella ist stolz, weil …"],
      hinweis: "Lass Emma zuerst frei erzählen. Danach könnt ihr gemeinsam schauen, was schon gut gelingt.",
      wichtigePunkte: ["erstmals allein fahren", "Helm auf", "Freundin getroffen", "stolz"],
      musterloesung: "Ella darf zum ersten Mal allein mit dem Fahrrad zum Park fahren. Ihre Mutter erklärt ihr die Regeln. Ella setzt ihren Helm auf und fährt los. Im Park trifft sie ihre Freundin. Am Ende ist sie stolz, weil alles gut geklappt hat."
    }
  ];

  /* Feste Anleitung für die Begleitung – bei jeder Übung sichtbar. */
  const BEGLEITUNG = [
    "Lies (oder spiele) den Text langsam vor. Ein zweites Mal ist erlaubt – auswendig lernen muss Emma ihn nicht.",
    "Erst selbst versuchen lassen: Warte ein paar Sekunden, bevor du hilfst.",
    "Hilfsleiter: kleine Frage stellen → zwei Möglichkeiten anbieten → Satzanfang vorsagen. Nicht sofort die ganze Antwort sagen.",
    "Lobe den Versuch. Korrigiere freundlich, indem du den Satz richtig wiederholst.",
    "Wird Emma müde oder frustriert: nach einem gelungenen Satz beenden. Regelmäßigkeit ist wichtiger als die Menge."
  ];

  /* Bewertung: Kriterien mit 3 Stufen und dem Hinweis, worauf zu achten ist. */
  const KRITERIEN = [
    { name: "reihenfolge", titel: "Reihenfolge",
      achten: "Erzählt sie die Ereignisse in der richtigen Ordnung? Benutzt sie Wörter wie „zuerst“, „danach“, „am Ende“?",
      stufen: ["vermischt noch", "größtenteils richtig", "richtig geordnet"] },
    { name: "grammatik", titel: "Ganze Sätze & Grammatik",
      achten: "Bildet sie ganze Sätze mit Verb? Steht das Verb an der richtigen Stelle (z. B. „Ben kommt nach Hause“ statt nur „Ben“)?",
      stufen: ["einzelne Wörter", "ganze Sätze mit Hilfe", "ganze Sätze selbstständig"] },
    { name: "aussprache", titel: "Aussprache",
      achten: "Ist sie gut zu verstehen? Verständlich ist wichtiger als perfekt – freundlich mit aussprechen statt verbessern.",
      stufen: ["schwer zu verstehen", "meistens verständlich", "klar verständlich"] },
    { name: "zusammen", titel: "Zusammengehörigkeit",
      achten: "Erzählt sie eine kleine Geschichte (Ereignis + Reaktion, „weil“, „deshalb“) oder nur einzelne Sätze nebeneinander?",
      stufen: ["nur Einzelsätze", "verbindet schon", "erzählt zusammenhängend"] }
  ];

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
