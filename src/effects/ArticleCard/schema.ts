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
  startMs: z.number().min(0).max(120000).multipleOf(100),
  endMs: z.number().min(0).max(120000).multipleOf(100),

  // --- Card animation ---
  enterAnimation: z
    .enum(["slide-up", "slide-down", "fade", "scale"])
    .default("slide-up"),
  exitAnimation: z
    .enum(["slide-down", "slide-up", "fade", "scale"])
    .default("slide-down"),

  // --- Position & sizing ---
  /** Top edge as fraction of frame height (0–1). */
  y: z.number().min(0).max(1).multipleOf(0.01).default(0.45),
  /** Horizontal margin in px. */
  marginX: z.number().min(0).max(100).multipleOf(1).default(24),

  // --- Typography (px) ---
  titleSize: z.number().min(12).max(60).multipleOf(1).default(30),
  bodySize: z.number().min(10).max(48).multipleOf(1).default(26),
  sourceSize: z.number().min(10).max(36).multipleOf(1).default(18),

  // --- Highlights (text mode only) ---
  highlights: z.array(HighlightSchema).default([]),
});

/** Full composition props */
export const ArticleCardOverlaySchema = z.object({
  videoSrc: z.string().optional(),
  cards: z.array(ArticleCardSchema),
  fps: z.number().default(25),
});

export type Highlight = z.infer<typeof HighlightSchema>;
export type ArticleSource = z.infer<typeof ArticleSourceSchema>;
export type ArticleCard = z.infer<typeof ArticleCardSchema>;
export type ArticleCardOverlayProps = z.infer<typeof ArticleCardOverlaySchema>;
