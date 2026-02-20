import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const WHISPER_VERSION = "1.5.5";
const MODEL = "medium.en";

async function ensureWhisperInstalled(whisperPath: string) {
  if (!fs.existsSync(path.join(whisperPath, "main"))) {
    console.log("Installing whisper.cpp...");
    await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
  }
  const modelFile = path.join(whisperPath, `ggml-${MODEL}.bin`);
  if (!fs.existsSync(modelFile)) {
    console.log(`Downloading ${MODEL} model...`);
    await downloadWhisperModel({ model: MODEL, folder: whisperPath });
  }
}

function toWav16k(inputPath: string, outputDir: string): string {
  const basename = path.basename(inputPath, path.extname(inputPath));
  const wavPath = path.join(outputDir, `${basename}_16k.wav`);
  if (!fs.existsSync(wavPath)) {
    console.log(`Converting to 16kHz WAV: ${inputPath}`);
    execSync(
      `ffmpeg -i "${inputPath}" -ar 16000 -ac 1 "${wavPath}" -y`,
      { stdio: "pipe" }
    );
  }
  return wavPath;
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: npx tsx scripts/transcribe.ts <video-or-audio-path>");
    process.exit(1);
  }

  const absInput = path.resolve(inputPath);
  if (!fs.existsSync(absInput)) {
    console.error(`File not found: ${absInput}`);
    process.exit(1);
  }

  const whisperPath = path.join(process.cwd(), "whisper.cpp");
  const tmpDir = path.join(process.cwd(), ".tmp");
  const outputDir = path.join(process.cwd(), "transcripts");
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  await ensureWhisperInstalled(whisperPath);

  const wavPath = toWav16k(absInput, tmpDir);

  console.log("Transcribing...");
  const whisperOutput = await transcribe({
    inputPath: wavPath,
    whisperPath,
    whisperCppVersion: WHISPER_VERSION,
    model: MODEL,
    tokenLevelTimestamps: true,
  });

  const { captions } = toCaptions({ whisperCppOutput: whisperOutput });

  const basename = path.basename(absInput, path.extname(absInput));
  const outputPath = path.join(outputDir, `${basename}.json`);
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        source: absInput,
        model: MODEL,
        captions,
      },
      null,
      2
    )
  );

  console.log(`Transcript saved: ${outputPath}`);
  console.log(`Words: ${captions.length}`);
  console.log(
    `Sample:`,
    captions.slice(0, 5).map((c) => `${c.text} (${c.startMs}-${c.endMs}ms)`)
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
