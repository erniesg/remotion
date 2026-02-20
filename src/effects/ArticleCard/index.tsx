import React from "react";
import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {
  ArticleCardOverlayProps,
  ArticleCard as ArticleCardType,
  Highlight,
} from "./schema";
import { buildSegments } from "./segments";
import {
  getCardEnterAnimation,
  getCardExitAnimation,
  getHighlightProgress,
  EXIT_FRAMES,
} from "./animations";

/* ─── platform icons (simple text fallbacks) ─── */
const PLATFORM_ICON: Record<string, string> = {
  reddit: "🔴",
  twitter: "🐦",
  news: "📰",
  generic: "📄",
};

/* ─── Highlight Span ─── */
const HighlightSpan: React.FC<{
  text: string;
  highlight: Highlight;
  currentMs: number;
  bodySize: number;
}> = ({ text, highlight, currentMs, bodySize }) => {
  const progress = getHighlightProgress(
    currentMs,
    highlight.startMs,
    highlight.durationMs,
  );

  const renderHighlightBg = () => {
    const underlineH = Math.max(3, bodySize * 0.18);
    switch (highlight.style) {
      case "sweep":
        return (
          <span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress * 100}%`,
              backgroundColor: highlight.color,
              opacity: 0.35,
              borderRadius: 3,
              zIndex: 0,
            }}
          />
        );
      case "underline":
        return (
          <span
            style={{
              position: "absolute",
              left: 0,
              bottom: -1,
              height: underlineH,
              width: `${progress * 100}%`,
              backgroundColor: highlight.color,
              borderRadius: 2,
              zIndex: 0,
            }}
          />
        );
      case "box":
        return (
          <span
            style={{
              position: "absolute",
              inset: -3,
              border: `2px solid ${highlight.color}`,
              borderRadius: 4,
              opacity: progress,
              zIndex: 0,
            }}
          />
        );
      case "fade":
        return (
          <span
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: highlight.color,
              opacity: progress * 0.35,
              borderRadius: 3,
              zIndex: 0,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <span
      style={{
        position: "relative",
        display: "inline",
        fontWeight: progress > 0 ? 700 : 400,
      }}
    >
      {renderHighlightBg()}
      <span style={{ position: "relative", zIndex: 1 }}>{text}</span>
    </span>
  );
};

/* ─── Source Header ─── */
const SourceHeader: React.FC<{
  card: ArticleCardType;
  sourceSize: number;
}> = ({ card, sourceSize }) => {
  if (!card.source) return null;
  const { platform = "generic", author, subreddit, timestamp } = card.source;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
        fontSize: sourceSize,
        color: "#888",
      }}
    >
      <span style={{ fontSize: sourceSize + 4 }}>
        {PLATFORM_ICON[platform] ?? "📄"}
      </span>
      {subreddit && (
        <span style={{ fontWeight: 700, color: "#555" }}>{subreddit}</span>
      )}
      {author && <span>• {author}</span>}
      {timestamp && <span>• {timestamp}</span>}
    </div>
  );
};

/* ─── Single Card ─── */
const CardRenderer: React.FC<{
  card: ArticleCardType;
  frame: number;
  fps: number;
  frameWidth: number;
  frameHeight: number;
}> = ({ card, frame, fps, frameWidth, frameHeight }) => {
  const startFrame = Math.round((card.startMs / 1000) * fps);
  const endFrame = Math.round((card.endMs / 1000) * fps);

  if (frame < startFrame) return null;
  if (frame > endFrame + EXIT_FRAMES) return null;

  const entry = getCardEnterAnimation(
    frame - startFrame,
    fps,
    card.enterAnimation,
  );

  let exitStyle = { transform: "", opacity: 1 };
  if (frame >= endFrame) {
    const exitProgress = (frame - endFrame) / EXIT_FRAMES;
    exitStyle = getCardExitAnimation(exitProgress, card.exitAnimation);
  }

  const finalOpacity = entry.opacity * exitStyle.opacity;
  const finalTransform =
    frame >= endFrame ? exitStyle.transform : entry.transform;

  const currentMs = (frame / fps) * 1000;

  const segments = React.useMemo(
    () => (card.body ? buildSegments(card.body, card.highlights) : []),
    [card.body, card.highlights],
  );

  const cardTop = card.y * frameHeight;
  const bottomMargin = card.marginX;
  const maxHeightPx = frameHeight - cardTop - bottomMargin;

  const titleSize = card.titleSize;
  const bodySize = card.bodySize;
  const sourceSize = card.sourceSize;

  return (
    <div
      style={{
        position: "absolute",
        left: card.marginX,
        right: card.marginX,
        top: cardTop,
        maxHeight: maxHeightPx,
        transform: finalTransform,
        opacity: finalOpacity,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {card.imageSrc ? (
          <Img
            src={card.imageSrc}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        ) : (
          <>
            <SourceHeader card={card} sourceSize={sourceSize} />

            {card.flair && (
              <span
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#E8F5E9",
                  color: "#2E7D32",
                  fontSize: sourceSize - 2,
                  fontWeight: 700,
                  padding: "3px 12px",
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              >
                {card.flair}
              </span>
            )}

            {card.title && (
              <div
                style={{
                  fontSize: titleSize,
                  fontWeight: 700,
                  color: "#1a1a1a",
                  lineHeight: 1.3,
                  marginBottom: 14,
                }}
              >
                {card.title}
              </div>
            )}

            {card.body && (
              <div
                style={{
                  fontSize: bodySize,
                  lineHeight: 1.55,
                  color: "#333",
                  overflow: "hidden",
                }}
              >
                {segments.map((seg, i) =>
                  seg.highlightIndex != null ? (
                    <HighlightSpan
                      key={i}
                      text={seg.text}
                      highlight={card.highlights[seg.highlightIndex]}
                      currentMs={currentMs}
                      bodySize={bodySize}
                    />
                  ) : (
                    <span key={i}>{seg.text}</span>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Main ArticleCard Overlay ─── */
export const ArticleCardOverlay: React.FC<ArticleCardOverlayProps> = ({
  videoSrc,
  cards,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill>
      <OffthreadVideo
        src={videoSrc}
        style={{ width, height, objectFit: "cover" }}
      />
      {cards.map((card, i) => (
        <CardRenderer
          key={i}
          card={card}
          frame={frame}
          fps={fps}
          frameWidth={width}
          frameHeight={height}
        />
      ))}
    </AbsoluteFill>
  );
};
