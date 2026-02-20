import { spring, interpolate } from "remotion";

type AnimationStyle = {
  transform: string;
  opacity: number;
};

/**
 * ENTRY animations: how the emoji appears on screen.
 */
export function getEntryAnimation(
  localFrame: number,
  fps: number,
  animation: string,
): AnimationStyle {
  if (localFrame < 0) {
    return { transform: "scale(0)", opacity: 0 };
  }

  switch (animation) {
    case "pop": {
      const s = spring({
        frame: localFrame,
        fps,
        config: { stiffness: 200, damping: 12, mass: 0.8 },
      });
      return { transform: `scale(${s})`, opacity: Math.min(1, s * 2) };
    }

    case "bounce": {
      const s = spring({
        frame: localFrame,
        fps,
        config: { stiffness: 180, damping: 8, mass: 1 },
      });
      const bounceY = interpolate(s, [0, 1], [-30, 0]);
      return {
        transform: `translateY(${bounceY}px) scale(${Math.min(s, 1)})`,
        opacity: Math.min(1, s * 2),
      };
    }

    case "slide-up": {
      const progress = interpolate(localFrame, [0, 10], [0, 1], {
        extrapolateRight: "clamp",
      });
      const y = interpolate(progress, [0, 1], [30, 0]);
      return { transform: `translateY(${y}px)`, opacity: progress };
    }

    case "slide-down": {
      const progress = interpolate(localFrame, [0, 10], [0, 1], {
        extrapolateRight: "clamp",
      });
      const y = interpolate(progress, [0, 1], [-30, 0]);
      return { transform: `translateY(${y}px)`, opacity: progress };
    }

    case "wiggle": {
      const s = spring({
        frame: localFrame,
        fps,
        config: { stiffness: 200, damping: 14 },
      });
      const angle =
        Math.sin(localFrame * 0.8) * 15 * Math.max(0, 1 - localFrame / 30);
      return {
        transform: `scale(${s}) rotate(${angle}deg)`,
        opacity: Math.min(1, s * 2),
      };
    }

    case "float": {
      const s = spring({
        frame: localFrame,
        fps,
        config: { stiffness: 100, damping: 20 },
      });
      const floatY = Math.sin(localFrame * 0.15) * 5;
      return {
        transform: `translateY(${floatY}px) scale(${s})`,
        opacity: Math.min(1, s * 2),
      };
    }

    case "spin": {
      const s = spring({
        frame: localFrame,
        fps,
        config: { stiffness: 160, damping: 14 },
      });
      const rotation = interpolate(s, [0, 1], [360, 0]);
      return {
        transform: `scale(${s}) rotate(${rotation}deg)`,
        opacity: Math.min(1, s * 2),
      };
    }

    case "drop": {
      const s = spring({
        frame: localFrame,
        fps,
        config: { stiffness: 300, damping: 15, mass: 0.6 },
      });
      const dropY = interpolate(s, [0, 1], [-60, 0]);
      return {
        transform: `translateY(${dropY}px) scale(${Math.min(s * 1.2, 1)})`,
        opacity: Math.min(1, s * 3),
      };
    }

    case "fade": {
      const progress = interpolate(localFrame, [0, 8], [0, 1], {
        extrapolateRight: "clamp",
      });
      return { transform: "scale(1)", opacity: progress };
    }

    default:
      return { transform: "scale(1)", opacity: 1 };
  }
}

/**
 * EXIT animations: how the emoji leaves the screen.
 * `progress` goes from 0 (exit starts) to 1 (fully gone).
 */
export function getExitAnimation(
  progress: number,
  exitAnimation: string,
): AnimationStyle {
  const p = Math.min(1, Math.max(0, progress));
  const remaining = 1 - p;

  switch (exitAnimation) {
    case "fade":
      return { transform: "scale(1)", opacity: remaining };

    case "shrink":
      return { transform: `scale(${remaining})`, opacity: remaining };

    case "fly-up": {
      const y = -40 * p;
      return { transform: `translateY(${y}px)`, opacity: remaining };
    }

    case "fly-down": {
      const y = 40 * p;
      return { transform: `translateY(${y}px)`, opacity: remaining };
    }

    case "spin-out": {
      const rotation = 180 * p;
      return {
        transform: `scale(${remaining}) rotate(${rotation}deg)`,
        opacity: remaining,
      };
    }

    case "pop-out": {
      // Scale up briefly then disappear
      const scale = p < 0.4 ? 1 + p * 0.5 : Math.max(0, 1 - (p - 0.4) * 2.5);
      return { transform: `scale(${scale})`, opacity: remaining };
    }

    default:
      // "none" — instant disappear
      return { transform: "scale(1)", opacity: remaining };
  }
}

/**
 * Combined entry+exit animation for backward compatibility.
 */
export function getEmojiAnimation(
  frame: number,
  fps: number,
  triggerFrame: number,
  animation: string,
): AnimationStyle {
  return getEntryAnimation(frame - triggerFrame, fps, animation);
}

/**
 * Calculate emoji position: always centered horizontally above the anchor word.
 * emoji_center_x = word_center_x, emoji positioned above with gap.
 *
 * For variant positions (below, left, right), shifts accordingly while
 * keeping the emoji visually connected to its anchor word.
 */
export function getAnchorOffset(
  position: string,
  wordW: number,
  wordH: number,
  emojiSize: number,
): { dx: number; dy: number } {
  // Accounts for text stroke/glow (~10px) that extends beyond OCR bbox.
  // transformOrigin is set so spring overshoot grows AWAY from text.
  const vGap = 40;
  const hGap = 16;

  // Center emoji horizontally above the word:
  // word starts at x=0 (relative), center at wordW/2
  // emoji center should be at wordW/2, so left edge = wordW/2 - emojiSize/2
  const centerDx = (wordW - emojiSize) / 2;

  switch (position) {
    case "above":
      return { dx: centerDx, dy: -(emojiSize + vGap) };
    case "below":
      return { dx: centerDx, dy: wordH + vGap };
    case "left":
      return { dx: -(emojiSize + hGap), dy: (wordH - emojiSize) / 2 };
    case "right":
      return { dx: wordW + hGap, dy: (wordH - emojiSize) / 2 };
    case "above-left":
      return { dx: -emojiSize * 0.3, dy: -(emojiSize + vGap) };
    case "above-right":
      return { dx: wordW - emojiSize * 0.7, dy: -(emojiSize + vGap) };
    default:
      return { dx: centerDx, dy: -(emojiSize + vGap) };
  }
}
