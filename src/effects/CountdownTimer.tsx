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

export const CountdownTimerSchema = z.object({
  videoSrc: z.string().optional(),
  startFrom: z.number().min(1).max(60).default(10),
  circleSize: z.number().min(100).max(500).default(200),
  fontSize: z.number().min(30).max(150).default(80),
  pulseIntensity: z.number().min(0.1).max(2).default(0.3),
  position: z.enum(["center", "top-center", "bottom-center"]).default("center"),
  offsetX: z.number().default(0),
  offsetY: z.number().default(0),
});

export type CountdownTimerProps = z.infer<typeof CountdownTimerSchema>;

export default function CountdownTimer({
  videoSrc,
  startFrom = 10,
  circleSize = 200,
  fontSize = 80,
  pulseIntensity = 0.3,
  position = "center",
  offsetX = 0,
  offsetY = 0,
}: CountdownTimerProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  // Each number shows for 1 second
  const currentSecond = Math.floor(frame / fps);
  const frameInSecond = frame % fps;
  
  // Calculate which number to show
  const displayNumber = Math.max(0, startFrom - currentSecond);
  
  // Don't show anything after countdown reaches 0
  if (currentSecond >= startFrom + 1) return null;
  
  // Pulsing animation - faster pulse for lower numbers
  const pulseSpeed = displayNumber <= 3 ? 0.8 : 0.4;
  const pulseScale = 1 + Math.sin(frame * pulseSpeed) * pulseIntensity;
  
  // Spring animation when number changes
  const springValue = spring({
    frame: frameInSecond,
    fps,
    config: { stiffness: 200, damping: 15 },
  });
  
  // Scale effect for number appearance
  const numberScale = interpolate(springValue, [0, 1], [0.7, 1]);
  
  // Opacity fade for the last frame of each second
  const opacity = frameInSecond >= fps - 5 && displayNumber > 0
    ? interpolate(frameInSecond, [fps - 5, fps - 1], [1, 0.7])
    : 1;
  
  // Position calculation
  let containerX = width / 2;
  let containerY = height / 2;
  
  switch (position) {
    case "top-center":
      containerY = circleSize / 2 + 50;
      break;
    case "bottom-center":
      containerY = height - circleSize / 2 - 50;
      break;
  }
  
  containerX += offsetX;
  containerY += offsetY;
  
  // Intense red color for urgency
  const circleColor = displayNumber <= 3 ? "#FF0000" : "#DC2626";
  
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
          position: "absolute",
          left: containerX - circleSize / 2,
          top: containerY - circleSize / 2,
          width: circleSize,
          height: circleSize,
          transform: `scale(${pulseScale})`,
          opacity,
          zIndex: 10,
        }}
      >
        {/* Red pulsing circle */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: circleColor,
            boxShadow: `0 0 ${20 * pulseScale}px rgba(255, 0, 0, 0.5)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "4px solid rgba(255, 255, 255, 0.3)",
          }}
        >
          {/* White number */}
          <div
            style={{
              fontSize,
              fontWeight: "900",
              color: "white",
              fontFamily: "system-ui, -apple-system, sans-serif",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              transform: `scale(${numberScale})`,
              userSelect: "none",
            }}
          >
            {displayNumber}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}