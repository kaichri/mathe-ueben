"use strict";
/* Freistellt die generierten Welt-Figuren (hellgrauer Hintergrund #E8E8E8)
   und speichert sie als webp mit Alpha, 256 px hoch, in bilder/.
   Aufruf: node tools/welt-figuren-bilder.cjs  (--force erzeugt neu) */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const quellOrdner = "vibe_images";
const zielOrdner = "bilder";
const force = process.argv.includes("--force");

/* Quell-Präfix in vibe_images/ -> Zieldatei in bilder/ */
const PAARE = [
  ["weihnachtsmann_", "weihnachtsmann"],
  ["christkind_", "christkind"],
  ["rudolph_", "rudolph"],
  ["schneemann_", "schneemann"],
  ["elfe_", "elfe"],
  ["wichtel_", "wichtel"],
  ["griesgram_", "griesgram"],
  ["lebkuchenmann_", "lebkuchenmann"],
  ["hund-mopsi_", "hund-mopsi"],
  ["hund-coco_", "hund-coco"],
  ["hund-schnuffel_", "hund-schnuffel"],
  ["hund-struppi_", "hund-struppi"],
  ["hund-bella_", "hund-bella"],
  ["hamster-bommel_", "hamster-bommel"],
  ["hamster-nussi_", "hamster-nussi"],
  ["hamster-flauschi_", "hamster-flauschi"],
  ["hamster-krummel_", "hamster-krummel"],
  ["hamster-zucker_", "hamster-zucker"]
];

const PYTHON = `
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGBA")
breite, hoehe = im.size
daten = im.load()

def naehe_hintergrund(p, tol):
    r, g, b, a = p
    return abs(r - 232) <= tol and abs(g - 232) <= tol and abs(b - 232) <= tol

# 1) Kern entfernen (tolerant), auch in eingekesselten Hintergrundluecken
for y in range(hoehe):
    for x in range(breite):
        if naehe_hintergrund(daten[x, y], 16):
            daten[x, y] = (232, 232, 232, 0)

# 2) Saum entschärfen: Randpixel, die noch Richtung Hintergrund gehen,
#    bekommen Teiltransparenz statt eines grauen Saums.
for y in range(hoehe):
    for x in range(breite):
        p = daten[x, y]
        if p[3] == 0:
            continue
        grenzt = False
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < breite and 0 <= ny < hoehe and daten[nx, ny][3] == 0:
                grenzt = True
                break
        if grenzt and naehe_hintergrund(p, 48):
            daten[x, y] = (p[0], p[1], p[2], 90)
im.save(sys.argv[2])
`;

function freistellen(quelle, zielPng) {
  const pyDatei = zielPng + ".py";
  fs.writeFileSync(pyDatei, PYTHON);
  try {
    execFileSync("python", [pyDatei, quelle, zielPng], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (fehler) {
    throw new Error(String(fehler.stderr || fehler));
  } finally {
    fs.unlinkSync(pyDatei);
  }
}

let erzeugt = 0;
let uebersprungen = 0;
(async () => {
  for (const [praefix, ziel] of PAARE) {
    const zielDatei = path.join(zielOrdner, ziel + ".webp");
    if (!force && fs.existsSync(zielDatei) && fs.statSync(zielDatei).size > 0) {
      uebersprungen += 1;
      continue;
    }
    const treffer = fs.readdirSync(quellOrdner)
      .filter(f => f.startsWith(praefix) && f.endsWith(".png") && !f.includes(".frei."))
      .sort();
    if (treffer.length === 0) { throw new Error("Quelle fehlt für " + praefix); }
    const quelle = path.join(quellOrdner, treffer.at(-1));
    const freiPng = path.join(quellOrdner, treffer.at(-1).replace(/\.png$/, ".frei.png"));
    freistellen(quelle, freiPng);
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", freiPng, "-vf", "scale=-2:256:flags=lanczos",
      "-frames:v", "1", "-c:v", "libwebp", "-quality", "90", zielDatei
    ]);
    erzeugt += 1;
    console.log("OK", zielDatei);
  }
  console.log("Fertig: " + erzeugt + " erzeugt, " + uebersprungen + " schon vorhanden.");
})();
