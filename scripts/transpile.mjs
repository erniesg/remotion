#!/usr/bin/env node
/**
 * Transpile a single TSX file to browser-ready JS using esbuild.
 * Usage: node transpile.mjs <input.tsx>
 * Outputs: <input.js> in the same directory
 */
import { build } from "esbuild";
import { resolve, dirname, basename } from "path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node transpile.mjs <input.tsx>");
  process.exit(1);
}

const dir = dirname(resolve(inputPath));
const name = basename(inputPath, ".tsx");
const outfile = resolve(dir, `${name}.js`);

try {
  await build({
    entryPoints: [resolve(inputPath)],
    outfile,
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    // Mark remotion and react as external — they're already loaded in the browser
    external: ["remotion", "react", "react-dom", "react/jsx-runtime", "zod"],
    sourcemap: false,
    minify: false,
  });
  console.log(`OK: ${outfile}`);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
