import { z } from "zod";

/** Word position from OCR (Tool 2 output) */
export const WordPositionSchema = z.object({
  text: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  confidence: z.number().optional(),
});

/** A single frame's OCR data */
export const OcrFrameSchema = z.object({
  timeSec: z.number(),
  words: z.array(WordPositionSchema),
});

/** Word timestamp from transcript (Tool 1 output) */
export const CaptionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  confidence: z.number().optional(),
});

/** Entry animation types */
export const EntryAnimation = z.enum([
  "pop",
  "bounce",
  "slide-up",
  "slide-down",
  "wiggle",
  "float",
  "spin",
  "drop",
  "fade",
]);

/** Exit animation types */
export const ExitAnimation = z.enum([
  "fade",
  "shrink",
  "fly-up",
  "fly-down",
  "spin-out",
  "pop-out",
  "none",
]);

/** Anchor position relative to word */
export const AnchorPosition = z.enum([
  "above",
  "below",
  "left",
  "right",
  "above-left",
  "above-right",
]);

/** A single emoji annotation (Tool 3 / AI output) */
export const EmojiAnnotationSchema = z.object({
  emoji: z.string(),
  anchorWord: z.string(),
  position: AnchorPosition.default("above"),
  animation: EntryAnimation.default("pop"),
  exitAnimation: ExitAnimation.default("shrink"),
  scale: z.number().default(1),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  /** When the emoji appears (ms). If omitted, derived from anchorWord transcript timing. */
  startMs: z.number().optional(),
  /** When the emoji exits (ms). If omitted, derived from subtitle group end. */
  endMs: z.number().optional(),
  /** Alternative to endMs: how long the emoji stays (ms). */
  durationMs: z.number().optional(),
});

/** Full props for the EmojiOverlay composition */
export const EmojiOverlaySchema = z.object({
  videoSrc: z.string(),
  captions: z.array(CaptionSchema),
  ocrFrames: z.array(OcrFrameSchema),
  annotations: z.array(EmojiAnnotationSchema),
  fps: z.number().default(25),
});

export type WordPosition = z.infer<typeof WordPositionSchema>;
export type OcrFrame = z.infer<typeof OcrFrameSchema>;
export type Caption = z.infer<typeof CaptionSchema>;
export type EmojiAnnotation = z.infer<typeof EmojiAnnotationSchema>;
export type EmojiOverlayProps = z.infer<typeof EmojiOverlaySchema>;
