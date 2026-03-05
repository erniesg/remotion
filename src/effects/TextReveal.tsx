import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";

export const TextRevealSchema = z.object({
  videoSrc: z.string().optional(),
  text: z.string().default("Breaking News"),
  fontSize: z.number().min(20).max(200).default(80),
  fontWeight: z.enum(["normal", "bold", "900"]).default("bold"),
  textColor: z.string().default("#ffffff"),
  backgroundColor: z.string().default("transparent"),
  typeSpeed: z.number().min(0.05).max(1).default(0.15),
  showCursor: z.boolean().default(true),
  cursorColor: z.string().default("#ffffff"),
  position: z.enum(["center", "top-center", "bottom-center"]).default("center"),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
  startDelay: z.number().min(0).max(5).default(0.5),
});

export type TextRevealProps = z.infer<typeof TextRevealSchema>;

export default function TextReveal({
  videoSrc,
  text = "Breaking News",
  fontSize = 80,
  fontWeight = "bold",
  textColor = "#ffffff",
  backgroundColor = "transparent",
  typeSpeed = 0.15,
  showCursor = true,
  cursorColor = "#ffffff",
  position = "center",
  offsetX = 0,
  offsetY = 0,
  startDelay = 0.5,
}: TextRevealProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Calculate timing
  const timeInSeconds = frame / fps;
  const adjustedTime = Math.max(0, timeInSeconds - startDelay);
  
  // Calculate how many characters to show based on frame and typing speed
  const charactersToShow = Math.floor(adjustedTime / typeSpeed);
  const displayText = text.substring(0, Math.min(charactersToShow, text.length));
  
  // Cursor blink animation (blinks every 0.5 seconds)
  const cursorOpacity = interpolate(
    Math.sin(frame * 0.2), 
    [-1, 1], 
    [0, 1], 
    { extrapolateRight: "clamp" }
  );
  
  // Show cursor while typing or after typing is complete
  const isTypingComplete = charactersToShow >= text.length;
  const shouldShowCursor = showCursor && (
    !isTypingComplete || cursorOpacity > 0.5
  );
  
  // Position calculation
  let containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    transform: `translate(${offsetX}px, ${offsetY}px)`,
  };
  
  switch (position) {
    case "top-center":
      containerStyle = {
        ...containerStyle,
        alignItems: "flex-start",
        paddingTop: "10%",
      };
      break;
    case "bottom-center":
      containerStyle = {
        ...containerStyle,
        alignItems: "flex-end",
        paddingBottom: "10%",
      };
      break;
  }

  return (
    <AbsoluteFill>
      {videoSrc && (
        <OffthreadVideo 
          src={videoSrc} 
          style={{ width, height, objectFit: "cover" }} 
        />
      )}
      
      <div style={containerStyle}>
        <div
          style={{
            fontSize,
            fontWeight,
            color: textColor,
            backgroundColor,
            fontFamily: "system-ui, -apple-system, 'Helvetica Neue', sans-serif",
            textAlign: "center",
            userSelect: "none",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            whiteSpace: "pre",
            padding: backgroundColor !== "transparent" ? "20px 40px" : "0",
            borderRadius: backgroundColor !== "transparent" ? "8px" : "0",
          }}
        >
          <span>{displayText}</span>
          {shouldShowCursor && (
            <span
              style={{
                opacity: cursorOpacity,
                marginLeft: "4px",
                color: cursorColor,
                fontWeight: "normal",
                animation: "none",
              }}
            >
              |
            </span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
}