/* =========================================================
   videos.js – die Video-Mediathek für das Feier-Kino.
   Die Videos werden von YouTube gestreamt (dafür braucht
   die App dann kurz Internet). Nach dem "Prüfen" wird aus
   der Liste der passenden Welt zufällig ein Video ausgewählt.

   Neue Videos hinzufuegen:
   1. Auf YouTube das Video oeffnen, die Kennung aus der
      Adresse kopieren (der Teil nach "watch?v=").
   2. Hier einen neuen Eintrag dazwischen schreiben:
      { welt: "bluey", titel: "Was da steht", video: "Kennung" }
   welte: "bluey", "gabby" oder "doozie".
   ========================================================= */

window.VIDEOS = [
  /* ---------------- Bluey ---------------- */
  { welt: "bluey", titel: "Baby Bluey lernt laufen", video: "Fta8leoA3jk" },
  { welt: "bluey", titel: "Neugeboren – LEGO Bluey Kurzgeschichte", video: "THcPggdbVxo" },
  { welt: "bluey", titel: "Der Hindernisparcours – LEGO Bluey", video: "3mg0g2vOt48" },
  { welt: "bluey", titel: "Der letzte Luftballon – LEGO Bluey", video: "zOQ-Cl2QVr0" },

  /* ---------------- Gabbys Puppenhaus ---------------- */
  { welt: "gabby", titel: "Gabbys magische Feen-Transformation", video: "41rYt87LU9A" },
  { welt: "gabby", titel: "Teeparty-Probleme! Rette Cakey!", video: "XNzWVivp4xY" },
  { welt: "gabby", titel: "Kuchis neuer Freund! Wuffel-Tüten backen", video: "WvS8ggU_Q6I" },
  { welt: "gabby", titel: "Die Gabby Katzen spielen Verstecken", video: "ZNG2MDpPd8c" },
  { welt: "gabby", titel: "Lasst uns ein musikalisches Spiel spielen", video: "uDxC10QS_O8" },
  { welt: "gabby", titel: "Neues Puppenhauszimmer (Katzen-Pflege)", video: "uqPiIQYITHU" },
  { welt: "gabby", titel: "Gabbys Schwester besucht das Puppenhaus", video: "M17FOHH0Zsk" },
  { welt: "gabby", titel: "Neue Gabby-Katzen aus dem Film", video: "qWwxpTrJTdI" },

  /* ---------------- Doozies Hundehaus ---------------- */
  { welt: "doozie", titel: "Hey Doozie – das Lied", video: "bZNq7v5Aq7o" },
  { welt: "doozie", titel: "Mit meinen Hunden abhängen (Hund-des-Tages-Song)", video: "RSkU6M-pCsc" },
  { welt: "doozie", titel: "Hunde auf dem Laufsteg! Modenschau", video: "UnfthXfH0ks" },
  { welt: "doozie", titel: "Puggie kann nicht aufhören zu quaken! (ganze Folge)", video: "acy3jxzZLJg" },
  { welt: "doozie", titel: "Doozie's Doghouse – Trailer", video: "nO4P-wPDAkY" },
  { welt: "doozie", titel: "Gabbys Schwester ist da! Staffel-14-Trailer", video: "esJz7vxFxto" }
];
