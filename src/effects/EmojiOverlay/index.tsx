import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { EmojiOverlayProps, OcrFrame, WordPosition, EmojiAnnotation, Caption } from "./schema";
import { getEntryAnimation, getExitAnimation, getAnchorOffset } from "./animations";

const BASE_EMOJI_SIZE = 72;
const EXIT_ANIM_FRAMES = 3; // frames for exit animation

/**
 * Find the OCR frame closest to the given time.
 */
function findClosestOcrFrame(
  ocrFrames: OcrFrame[],
  timeSec: number,
): OcrFrame | null {
  if (ocrFrames.length === 0) return null;

  let closest = ocrFrames[0];
  let minDist = Math.abs(ocrFrames[0].timeSec - timeSec);

  for (const f of ocrFrames) {
    const dist = Math.abs(f.timeSec - timeSec);
    if (dist < minDist) {
      minDist = dist;
      closest = f;
    }
  }

  if (minDist > 1.0) return null;
  return closest;
}

/**
 * Find a word in an OCR frame — returns the LARGEST match
 * (subtitle text is much bigger than article body text).
 * Optionally filter by reference size if provided.
 */
function findWord(
  ocrFrame: OcrFrame,
  targetWord: string,
  refWidth?: number,
  refHeight?: number,
): WordPosition | null {
  const target = targetWord.toUpperCase().trim();
  let best: WordPosition | null = null;
  let bestArea = 0;

  for (const w of ocrFrame.words) {
    if (w.text.toUpperCase().trim() !== target) continue;
    // If reference size provided, reject words that are too small
    if (refWidth && refHeight) {
      if (w.w < refWidth * 0.4 || w.h < refHeight * 0.4) continue;
    }
    const area = w.w * w.h;
    if (area > bestArea) {
      best = w;
      bestArea = area;
    }
  }
  return best;
}

/**
 * Detect when the subtitle GROUP changes by checking OCR frames.
 * Returns the time (seconds) when the anchor word is last visible
 * as a large subtitle-sized word.
 */
function findSubtitleGroupEnd(
  ocrFrames: OcrFrame[],
  anchorWord: string,
  refWidth: number,
  refHeight: number,
  startTimeSec: number,
): number {
  let lastVisibleSec = startTimeSec;

  for (const f of ocrFrames) {
    if (f.timeSec < startTimeSec) continue;
    const match = findWord(f, anchorWord, refWidth, refHeight);
    if (match) {
      lastVisibleSec = f.timeSec;
    } else if (f.timeSec > lastVisibleSec + 0.3) {
      break;
    }
  }

  return lastVisibleSec;
}

/**
 * Find the transcript caption for a word.
 */
function findCaption(
  captions: Caption[],
  word: string,
): Caption | null {
  const target = word.toLowerCase().trim();
  for (const c of captions) {
    if (c.text.trim().toLowerCase() === target) return c;
  }
  return null;
}

/**
 * Get the transform-origin that pushes animation overshoot AWAY from text.
 */
function getTransformOrigin(position: string): string {
  switch (position) {
    case "above":
    case "above-left":
    case "above-right":
      return "center bottom"; // grow upward, bottom stays anchored near text
    case "below":
      return "center top"; // grow downward, top stays anchored near text
    case "left":
      return "right center";
    case "right":
      return "left center";
    default:
      return "center bottom";
  }
}

/**
 * Pre-compute emoji placement with subtitle-group-aware timing.
 */
function resolveEmojiPlacement(
  annotation: EmojiAnnotation,
  captions: Caption[],
  ocrFrames: OcrFrame[],
  fps: number,
): {
  x: number;
  y: number;
  triggerFrame: number;
  exitFrame: number;
  emojiSize: number;
  transformOrigin: string;
} | null {
  const caption = findCaption(captions, annotation.anchorWord);
  if (!caption) return null;

  // Find OCR frame at trigger time for word position
  const ocrFrame = findClosestOcrFrame(ocrFrames, caption.startMs / 1000);
  if (!ocrFrame) return null;

  const wordPos = findWord(ocrFrame, annotation.anchorWord);
  if (!wordPos) return null;

  const emojiSize = BASE_EMOJI_SIZE * annotation.scale;

  const { dx, dy } = getAnchorOffset(
    annotation.position,
    wordPos.w,
    wordPos.h,
    emojiSize,
  );

  // --- Timing ---
  // Use explicit startMs/endMs if provided, otherwise derive from transcript + OCR.
  const startMs = annotation.startMs ?? caption.startMs;
  const triggerFrame = Math.round((startMs / 1000) * fps);

  let endMs: number;
  if (annotation.endMs != null) {
    endMs = annotation.endMs;
  } else if (annotation.durationMs != null) {
    endMs = startMs + annotation.durationMs;
  } else {
    // Auto: use subtitle group end from OCR
    const subtitleGroupEndSec = findSubtitleGroupEnd(
      ocrFrames, annotation.anchorWord,
      wordPos.w, wordPos.h,
      caption.startMs / 1000,
    );
    const captionEndSec = caption.endMs / 1000;
    endMs = Math.max(subtitleGroupEndSec + 0.1, captionEndSec) * 1000;
  }
  const exitFrame = Math.round((endMs / 1000) * fps);

  return {
    x: wordPos.x + dx + annotation.offsetX,
    y: wordPos.y + dy + annotation.offsetY,
    triggerFrame,
    exitFrame,
    emojiSize,
    transformOrigin: getTransformOrigin(annotation.position),
  };
}

// Set to true to show debug outlines for word bboxes and emoji positions
const DEBUG_OVERLAY = false;

export const EmojiOverlay: React.FC<EmojiOverlayProps> = ({
  videoSrc,
  captions,
  ocrFrames,
  annotations,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const placements = React.useMemo(() => {
    return annotations.map((annotation) =>
      resolveEmojiPlacement(annotation, captions, ocrFrames, fps)
    );
  }, [annotations, captions, ocrFrames, fps]);

  // Debug: get current OCR frame words
  const debugOcrWords = React.useMemo(() => {
    if (!DEBUG_OVERLAY) return [];
    const timeSec = frame / fps;
    const ocrFrame = findClosestOcrFrame(ocrFrames, timeSec);
    return ocrFrame?.words ?? [];
  }, [frame, fps, ocrFrames]);

  return (
    <AbsoluteFill>
      <OffthreadVideo src={videoSrc} style={{ width, height, objectFit: "cover" }} />

      {/* Debug: OCR word bounding boxes (semi-transparent red fill) */}
      {DEBUG_OVERLAY && debugOcrWords.map((w, i) => (
        <div
          key={`dbg-${i}`}
          style={{
            position: "absolute",
            left: w.x,
            top: w.y,
            width: w.w,
            height: w.h,
            background: "rgba(255, 0, 0, 0.4)",
            border: "2px solid red",
            pointerEvents: "none",
            zIndex: 20,
          }}
        />
      ))}

      {placements.map((placement, i) => {
        if (!placement) return null;
        const { x, y, triggerFrame, exitFrame, emojiSize, transformOrigin } = placement;
        const ann = annotations[i];

        // Not yet triggered
        if (frame < triggerFrame) return null;
        // Fully gone after exit animation
        if (frame >= exitFrame + EXIT_ANIM_FRAMES) return null;

        // Entry animation
        const entry = getEntryAnimation(
          frame - triggerFrame,
          fps,
          ann.animation,
        );

        // Exit animation: starts at exitFrame, completes over EXIT_ANIM_FRAMES
        let exitStyle = { transform: "", opacity: 1 };
        if (frame >= exitFrame) {
          const exitProgress = (frame - exitFrame) / EXIT_ANIM_FRAMES;
          exitStyle = getExitAnimation(exitProgress, ann.exitAnimation ?? "shrink");
        }

        const finalOpacity = entry.opacity * exitStyle.opacity;
        const finalTransform = frame >= exitFrame
          ? exitStyle.transform
          : entry.transform;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: emojiSize,
              height: emojiSize,
              fontSize: emojiSize * 0.8,
              lineHeight: `${emojiSize}px`,
              textAlign: "center",
              transform: finalTransform,
              opacity: finalOpacity,
              transformOrigin,
              pointerEvents: "none",
              zIndex: 10,
              ...(DEBUG_OVERLAY ? { border: "2px solid lime" } : {}),
            }}
          >
            {ann.emoji}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
