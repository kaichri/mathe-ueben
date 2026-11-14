"use strict";
/* =========================================================================
   Erzeugt die Vorlese-Audiodateien für das Sprechtraining.

   Die Texte/Fragen/Hinweise aus sprechtraining.js werden mit der
   Offline-Sprachsynthese „Piper" (https://github.com/rhasspy/piper,
   MIT-Lizenz) als WAV gesprochen und mit ffmpeg zu MP3 (64 kbps, mono)
   umgewandelt. Ergebnis: audio/sprechtraining/<stimme>/<id>.mp3

   Aufruf (Beispiel):
     node tools/sprechtraining-audio.cjs --piper .tmp-tts/piper ^
        --models .tmp-tts --out audio/sprechtraining

   Voraussetzung: piper.exe + ffmpeg im Pfad, die zwei Modelle
   (de_DE-thorsten-high, de_DE-ramona-low) im Ordner --models.
   Mit --force werden vorhandene Dateien neu erzeugt.
   ========================================================================= */

const path = require("path");
const fs = require("fs");
const { execFileSync } = require("child_process");
const SPRECHTRAINING = require("../sprechtraining.js");

function arg(name, sonst) {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : sonst;
}

const piperDir = arg("piper", ".tmp-tts/piper");
const modelDir = arg("models", ".tmp-tts");
const outDir = arg("out", "audio/sprechtraining");
const force = process.argv.includes("--force");

const STIMMEN = {
  thorsten: { model: "de_DE-thorsten-high", laenge: 1.1 },
  ramona: { model: "de_DE-ramona-low", laenge: 1.15 }
};

/* Sprechtext von Schreibschärmen befreien, die Piper merkwürdig vorliest. */
function sprechText(roh) {
  return String(roh).replace(/\b3A\b/g, "drei A");
}

function schnipsel() {
  const liste = [];
  for (const e of SPRECHTRAINING.EINHEITEN) {
    const nr = ("0" + e.tag).slice(-2);
    liste.push({ id: "tag" + nr + "-text", text: e.text });
    (e.fragenSets || []).forEach(function (satze, s) {
      satze.forEach(function (f, i) {
        liste.push({ id: "tag" + nr + "-s" + (s + 1) + "-f" + (i + 1), text: f.frage });
      });
    });
    liste.push({ id: "tag" + nr + "-hinweis", text: e.hinweis });
  }
  return liste;
}

const schnipselAlle = schnipsel();
let erzeugt = 0;
let uebersprungen = 0;

for (const [stimme, einstellung] of Object.entries(STIMMEN)) {
  const stimmeOrdner = path.join(outDir, stimme);
  fs.mkdirSync(stimmeOrdner, { recursive: true });
  const model = path.join(modelDir, einstellung.model + ".onnx");
  const config = model + ".json";
  if (!fs.existsSync(model) || !fs.existsSync(config)) {
    throw new Error("Modell fehlt: " + model);
  }
  for (const s of schnipselAlle) {
    const ziel = path.join(stimmeOrdner, s.id + ".mp3");
    if (!force && fs.existsSync(ziel) && fs.statSync(ziel).size > 0) {
      uebersprungen += 1;
      continue;
    }
    const wav = ziel.replace(/\.mp3$/, ".wav.tmp");
    execFileSync(path.join(piperDir, "piper.exe"), [
      "-q", "-m", model, "-c", config,
      "--length_scale", String(einstellung.laenge),
      "--sentence_silence", "0.35",
      "-f", wav
    ], { input: sprechText(s.text), stdio: ["pipe", "ignore", "pipe"] });
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y",
      "-i", wav, "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1", ziel
    ]);
    fs.unlinkSync(wav);
    erzeugt += 1;
    console.log("OK", stimme + "/" + s.id + ".mp3");
  }
}

console.log("Fertig: " + erzeugt + " erzeugt, " + uebersprungen + " schon vorhanden.");
