/**
 * Generates a props JSON file for the EmojiOverlay demo composition.
 * Combines transcript (Tool 1) + OCR (Tool 2) + annotations (Tool 3/AI).
 *
 * Usage: npx tsx scripts/generate-demo-props.ts
 */
import fs from "fs";
import path from "path";

const transcriptPath = path.join(
  process.cwd(),
  "transcripts/tiktok_dailytoast_7606345004319116564.json"
);
const ocrPath = path.join(
  process.cwd(),
  "transcripts/tiktok_dailytoast_7606345004319116564_ocr.json"
);

const transcript = JSON.parse(fs.readFileSync(transcriptPath, "utf-8"));
const ocr = JSON.parse(fs.readFileSync(ocrPath, "utf-8"));

// AI-generated annotations (Tool 3 output)
// "FATAL" spoken at 540-800ms, subtitle visible ~0-800ms
// "CAR" spoken at 4120-4360ms
const annotations = [
  // --- "FATAL": 3 emojis, staggered start ---
  { emoji: "💀", anchorWord: "FATAL", position: "above",       animation: "pop",    exitAnimation: "shrink", scale: 1.2, startMs: 340, endMs: 800 },
  { emoji: "😱", anchorWord: "FATAL", position: "above-left",  animation: "bounce", exitAnimation: "fly-up", scale: 0.9, startMs: 440, endMs: 800 },
  { emoji: "🚨", anchorWord: "FATAL", position: "above-right", animation: "spin",   exitAnimation: "fade",   scale: 0.8, startMs: 540, endMs: 800 },

  // --- "CAR": 2 emojis ---
  { emoji: "🚗", anchorWord: "CAR", position: "above",       animation: "drop",     exitAnimation: "fly-up", scale: 1 },
  { emoji: "💨", anchorWord: "CAR", position: "above-right", animation: "slide-up", exitAnimation: "fade",   scale: 0.8, startMs: 4240, durationMs: 200 },

  // --- singles: auto-timed from transcript ---
  { emoji: "⚡",  anchorWord: "INSTANTLY", position: "above", animation: "wiggle",   exitAnimation: "pop-out", scale: 1.1 },
  { emoji: "⚖️", anchorWord: "WEIGHT",    position: "above", animation: "slide-up", exitAnimation: "shrink",  scale: 1.2 },
  { emoji: "👶",  anchorWord: "CHILD",     position: "above", animation: "float",    exitAnimation: "fly-down", scale: 1 },
];

const props = {
  videoSrc: "tiktok_dailytoast_7606345004319116564.mp4",
  captions: transcript.captions,
  ocrFrames: ocr.frames,
  annotations,
  fps: 25,
};

const outputPath = path.join(process.cwd(), "src/demo-props.json");
fs.writeFileSync(outputPath, JSON.stringify(props, null, 2));
console.log(`Props written to ${outputPath}`);
console.log(`  Captions: ${props.captions.length} words`);
console.log(`  OCR frames: ${props.ocrFrames.length}`);
console.log(`  Annotations: ${props.annotations.length} emojis`);
