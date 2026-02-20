import { spring, interpolate } from "remotion";

type CardAnimStyle = {
  transform: string;
  opacity: number;
};

const ENTER_FRAMES = 15;
const EXIT_FRAMES = 12;

/**
 * Card enter animation.
 * `localFrame` = frames since card startMs.
 */
export function getCardEnterAnimation(
  localFrame: number,
  fps: number,
  animation: string,
): CardAnimStyle {
  if (localFrame < 0) return { transform: "translateY(100%)", opacity: 0 };

  switch (animation) {
    case "slide-up": {
      const s = spring({ frame: localFrame, fps, config: { stiffness: 120, damping: 18 } });
      const y = interpolate(s, [0, 1], [100, 0]);
      return { transform: `translateY(${y}%)`, opacity: Math.min(1, s * 2) };
    }
    case "slide-down": {
      const s = spring({ frame: localFrame, fps, config: { stiffness: 120, damping: 18 } });
      const y = interpolate(s, [0, 1], [-100, 0]);
      return { transform: `translateY(${y}%)`, opacity: Math.min(1, s * 2) };
    }
    case "fade": {
      const p = interpolate(localFrame, [0, ENTER_FRAMES], [0, 1], { extrapolateRight: "clamp" });
      return { transform: "translateY(0)", opacity: p };
    }
    case "scale": {
      const s = spring({ frame: localFrame, fps, config: { stiffness: 140, damping: 16 } });
      const sc = interpolate(s, [0, 1], [0.8, 1]);
      return { transform: `scale(${sc})`, opacity: Math.min(1, s * 2) };
    }
    default:
      return { transform: "translateY(0)", opacity: 1 };
  }
}

/**
 * Card exit animation.
 * `progress` 0→1 = exit start → fully gone.
 */
export function getCardExitAnimation(
  progress: number,
  animation: string,
): CardAnimStyle {
  const p = Math.min(1, Math.max(0, progress));
  const remaining = 1 - p;

  switch (animation) {
    case "slide-down": {
      const y = p * 100;
      return { transform: `translateY(${y}%)`, opacity: remaining };
    }
    case "slide-up": {
      const y = p * -100;
      return { transform: `translateY(${y}%)`, opacity: remaining };
    }
    case "fade":
      return { transform: "translateY(0)", opacity: remaining };
    case "scale": {
      const sc = 1 - p * 0.2;
      return { transform: `scale(${sc})`, opacity: remaining };
    }
    default:
      return { transform: "translateY(0)", opacity: remaining };
  }
}

export { EXIT_FRAMES };

/**
 * Highlight sweep progress: 0 = not started, 1 = fully revealed.
 */
export function getHighlightProgress(
  currentMs: number,
  startMs: number,
  durationMs: number,
): number {
  if (currentMs < startMs) return 0;
  if (currentMs >= startMs + durationMs) return 1;
  return (currentMs - startMs) / durationMs;
}
