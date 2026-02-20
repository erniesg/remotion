import { z } from "zod";

/** Highlight on a phrase within the article body */
export const HighlightSchema = z.object({
  phrase: z.string(),
  style: z.enum(["sweep", "underline", "box", "fade"]).default("sweep"),
  color: z.string().default("#FF8C00"),
  startMs: z.number(),
  durationMs: z.number().default(500),
});

/** Source metadata for the article */
export const ArticleSourceSchema = z.object({
  platform: z
    .enum(["reddit", "twitter", "news", "generic"])
    .default("generic"),
  author: z.string().optional(),
  subreddit: z.string().optional(),
  timestamp: z.string().optional(),
});

/** A single article card */
export const ArticleCardSchema = z.object({
  // --- Content: text mode ---
  title: z.string().optional(),
  body: z.string().optional(),
  flair: z.string().optional(),
  source: ArticleSourceSchema.optional(),
  // --- Content: image mode ---
  imageSrc: z.string().optional(),

  // --- Timing ---
  startMs: z.number(),
  endMs: z.number(),

  // --- Card animation ---
  enterAnimation: z
    .enum(["slide-up", "slide-down", "fade", "scale"])
    .default("slide-up"),
  exitAnimation: z
    .enum(["slide-down", "slide-up", "fade", "scale"])
    .default("slide-down"),

  // --- Position & sizing ---
  /** Top edge as fraction of frame height (0–1). */
  y: z.number().default(0.45),
  /** Card height as fraction of frame height. Omit or 0 for auto-height. */
  height: z.number().default(0),
  /** Max height as fraction (only used in auto-height mode). */
  maxHeight: z.number().default(0.55),
  /** Horizontal margin in px. */
  marginX: z.number().default(24),

  // --- Typography (px) ---
  titleSize: z.number().default(30),
  bodySize: z.number().default(26),
  sourceSize: z.number().default(18),

  // --- Highlights (text mode only) ---
  highlights: z.array(HighlightSchema).default([]),
});

/** Full composition props */
export const ArticleCardOverlaySchema = z.object({
  videoSrc: z.string(),
  cards: z.array(ArticleCardSchema),
  fps: z.number().default(25),
});

export type Highlight = z.infer<typeof HighlightSchema>;
export type ArticleSource = z.infer<typeof ArticleSourceSchema>;
export type ArticleCard = z.infer<typeof ArticleCardSchema>;
export type ArticleCardOverlayProps = z.infer<typeof ArticleCardOverlaySchema>;
