import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { z } from "zod";

export const TypewriterTextSchema = z.object({
  videoSrc: z.string().optional(),
  text: z.string().default("Breaking News"),
  fontSize: z.number().min(20).max(200).default(80),
  fontWeight: z.enum(["normal", "bold", "900"]).default("bold"),
  textColor: z.string().default("#ffffff"),
  backgroundColor: z.string().default("transparent"),
  typeSpeed: z.number().min(0.1).max(2).default(0.8),
  showCursor: z.boolean().default(true),
  cursorColor: z.string().default("#ffffff"),
  position: z.enum(["center", "top-center", "bottom-center"]).default("center"),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
});

export type TypewriterTextProps = z.infer<typeof TypewriterTextSchema>;

export default function TypewriterText({
  videoSrc,
  text = "Breaking News",
  fontSize = 80,
  fontWeight = "bold",
  textColor = "#ffffff",
  backgroundColor = "transparent",
  typeSpeed = 0.8,
  showCursor = true,
  cursorColor = "#ffffff",
  position = "center",
  offsetX = 0,
  offsetY = 0,
}: TypewriterTextProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Calculate how many characters to show based on frame
  const timeInSeconds = frame / fps;
  const charactersToShow = Math.floor(timeInSeconds / typeSpeed);
  const displayText = text.substring(0, Math.min(charactersToShow, text.length));
  
  // Cursor blink animation (blinks every 0.5 seconds)
  const cursorOpacity = Math.sin(frame * 0.2) > 0 ? 1 : 0;
  
  // Show cursor only while typing or if showCursor is true and typing is done
  const shouldShowCursor = showCursor && (
    charactersToShow <= text.length || 
    (charactersToShow > text.length && cursorOpacity > 0)
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