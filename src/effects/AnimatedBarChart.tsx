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

export const AnimatedBarChartSchema = z.object({
  videoSrc: z.string().optional(),
  data: z.array(z.object({
    label: z.string(),
    value: z.number().min(0),
    color: z.string().default("#3B82F6"),
  })).min(1).max(10).default([
    { label: "Q1", value: 100, color: "#3B82F6" },
    { label: "Q2", value: 150, color: "#10B981" },
    { label: "Q3", value: 120, color: "#F59E0B" },
    { label: "Q4", value: 180, color: "#EF4444" },
    { label: "Q5", value: 90, color: "#8B5CF6" },
  ]),
  animationDelay: z.number().min(0).max(5).default(0.5),
  barAnimationDuration: z.number().min(0.5).max(5).default(2),
  showValues: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  title: z.string().default("Animated Bar Chart"),
  titleSize: z.number().min(20).max(80).default(36),
  labelSize: z.number().min(12).max(30).default(16),
  valueSize: z.number().min(12).max(24).default(14),
  backgroundColor: z.string().default("#1F2937"),
  textColor: z.string().default("#FFFFFF"),
  gridColor: z.string().default("rgba(255, 255, 255, 0.1)"),
});

export type AnimatedBarChartProps = z.infer<typeof AnimatedBarChartSchema>;

export default function AnimatedBarChart({
  videoSrc,
  data = [
    { label: "Q1", value: 100, color: "#3B82F6" },
    { label: "Q2", value: 150, color: "#10B981" },
    { label: "Q3", value: 120, color: "#F59E0B" },
    { label: "Q4", value: 180, color: "#EF4444" },
    { label: "Q5", value: 90, color: "#8B5CF6" },
  ],
  animationDelay = 0.5,
  barAnimationDuration = 2,
  showValues = true,
  showGrid = true,
  title = "Animated Bar Chart",
  titleSize = 36,
  labelSize = 16,
  valueSize = 14,
  backgroundColor = "#1F2937",
  textColor = "#FFFFFF",
  gridColor = "rgba(255, 255, 255, 0.1)",
}: AnimatedBarChartProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  
  const timeInSeconds = frame / fps;
  const adjustedTime = Math.max(0, timeInSeconds - animationDelay);
  
  // Chart dimensions
  const chartPadding = 80;
  const chartWidth = width - chartPadding * 2;
  const chartHeight = height - chartPadding * 3; // Extra space for title
  const chartTop = chartPadding * 2;
  
  // Calculate max value for scaling
  const maxValue = Math.max(...data.map(d => d.value));
  const gridLines = 5;
  
  // Bar dimensions
  const barWidth = chartWidth / data.length * 0.6;
  const barSpacing = chartWidth / data.length;
  
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
          width: "100%",
          height: "100%",
          backgroundColor: videoSrc ? "transparent" : backgroundColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: titleSize,
            fontWeight: "bold",
            color: textColor,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        
        {/* Chart Container */}
        <div
          style={{
            position: "relative",
            width: chartWidth,
            height: chartHeight,
          }}
        >
          {/* Grid Lines */}
          {showGrid && Array.from({ length: gridLines + 1 }, (_, i) => {
            const y = (chartHeight / gridLines) * i;
            const gridValue = maxValue - (maxValue / gridLines) * i;
            
            return (
              <div key={`grid-${i}`}>
                {/* Horizontal line */}
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: y,
                    width: "100%",
                    height: 1,
                    backgroundColor: gridColor,
                  }}
                />
                {/* Grid value label */}
                <div
                  style={{
                    position: "absolute",
                    left: -60,
                    top: y - 8,
                    fontSize: valueSize,
                    color: textColor,
                    opacity: 0.7,
                  }}
                >
                  {Math.round(gridValue)}
                </div>
              </div>
            );
          })}
          
          {/* Bars */}
          {data.map((item, index) => {
            const barLeft = index * barSpacing + (barSpacing - barWidth) / 2;
            
            // Stagger animation - each bar starts slightly after the previous one
            const barStartTime = adjustedTime - (index * 0.1);
            const barProgress = Math.max(0, Math.min(1, barStartTime / barAnimationDuration));
            
            // Spring animation for smooth growth
            const springProgress = spring({
              frame: Math.max(0, (barStartTime * fps)),
              fps,
              config: { stiffness: 60, damping: 15, mass: 1 },
            });
            
            const animatedHeight = (item.value / maxValue) * chartHeight * Math.min(springProgress, 1);
            const barTop = chartHeight - animatedHeight;
            
            // Animated value display
            const displayValue = Math.round(item.value * Math.min(springProgress, 1));
            
            return (
              <div key={index}>
                {/* Bar */}
                <div
                  style={{
                    position: "absolute",
                    left: barLeft,
                    top: barTop,
                    width: barWidth,
                    height: animatedHeight,
                    backgroundColor: item.color,
                    borderRadius: "4px 4px 0 0",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                    transition: "none",
                  }}
                />
                
                {/* Value on top of bar */}
                {showValues && springProgress > 0.1 && (
                  <div
                    style={{
                      position: "absolute",
                      left: barLeft,
                      top: barTop - 25,
                      width: barWidth,
                      textAlign: "center",
                      fontSize: valueSize,
                      fontWeight: "bold",
                      color: textColor,
                      opacity: interpolate(springProgress, [0.1, 0.3], [0, 1], {
                        extrapolateRight: "clamp",
                      }),
                    }}
                  >
                    {displayValue}
                  </div>
                )}
                
                {/* Label below chart */}
                <div
                  style={{
                    position: "absolute",
                    left: barLeft,
                    top: chartHeight + 20,
                    width: barWidth,
                    textAlign: "center",
                    fontSize: labelSize,
                    color: textColor,
                    fontWeight: "500",
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
}