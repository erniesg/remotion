import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { z } from "zod";

export const TestComponentSchema = z.object({
  videoSrc: z.string().optional(),
  message: z.string().default("Test Component"),
  fontSize: z.number().min(20).max(100).default(48),
  color: z.string().default("#ffffff"),
  animationSpeed: z.number().min(0.5).max(3).default(1),
});

export type TestComponentProps = z.infer<typeof TestComponentSchema>;

export default function TestComponent({
  videoSrc,
  message = "Test Component",
  fontSize = 48,
  color = "#ffffff",
  animationSpeed = 1,
}: TestComponentProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Simple fade in and bounce animation
  const timeInSeconds = frame / fps;
  const adjustedTime = timeInSeconds * animationSpeed;
  
  // Spring animation for scale
  const scale = spring({
    frame: frame / animationSpeed,
    fps,
    config: { stiffness: 100, damping: 10, mass: 1 },
  });
  
  // Fade in opacity
  const opacity = interpolate(
    adjustedTime,
    [0, 1],
    [0, 1],
    { extrapolateRight: "clamp" }
  );
  
  // Gentle floating animation
  const floatY = Math.sin(frame * 0.1) * 10;
  
  return (
    <AbsoluteFill>
      {videoSrc && (
        <OffthreadVideo 
          src={videoSrc} 
          style={{ width, height, objectFit: "cover" }} 
        />
      )}
      
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          style={{
            fontSize,
            fontWeight: "bold",
            color,
            fontFamily: "system-ui, -apple-system, sans-serif",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
            transform: `scale(${scale}) translateY(${floatY}px)`,
            opacity,
            userSelect: "none",
          }}
        >
          {message}
        </div>
      </div>
    </AbsoluteFill>
  );
}