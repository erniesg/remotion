import { Composition } from "remotion";
import { ArticleCardOverlay, ArticleCardOverlaySchema } from "./effects";

import { default as CountdownTimer, CountdownTimerSchema } from "./effects/CountdownTimer";

import { default as TypewriterText, TypewriterTextSchema } from "./effects/TypewriterText";

import { default as TextReveal, TextRevealSchema } from "./effects/TextReveal";

import { default as AnimatedBarChart, AnimatedBarChartSchema } from "./effects/AnimatedBarChart";

import { default as TestComponent, TestComponentSchema } from "./effects/TestComponent";

import { default as AnimatedList, schema as AnimatedListSchema } from "./effects/AnimatedList";

import { default as GraphAnimations, graphSchema as GraphAnimationsSchema } from "./effects/GraphAnimations";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ArticleCard"
        component={ArticleCardOverlay}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        schema={ArticleCardOverlaySchema}
        defaultProps={{
          cards: [
            {
              title: "Breaking News: Important Update",
              body: "This is a sample article with some important information that needs to be highlighted. The key points will be emphasized using text highlighting features.",
              source: {
                platform: "news",
                author: "News Reporter",
                timestamp: "2 hours ago",
              },
              startMs: 1000,
              endMs: 8000,
              y: 0.3,
              marginX: 40,
              titleSize: 32,
              bodySize: 24,
              sourceSize: 16,
              highlights: [
                {
                  phrase: "important information",
                  style: "sweep",
                  color: "#FF8C00",
                  startMs: 2500,
                  durationMs: 800,
                },
                {
                  phrase: "key points",
                  style: "underline",
                  color: "#32CD32",
                  startMs: 4000,
                  durationMs: 600,
                },
                {
                  phrase: "text highlighting",
                  style: "box",
                  color: "#FF69B4",
                  startMs: 5500,
                  durationMs: 700,
                },
              ],
            },
          ],
        }}
      />
      <Composition
        id="CountdownTimer"
        component={CountdownTimer}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        schema={CountdownTimerSchema}
        defaultProps={{
          startFrom: 5,
          circleSize: 150,
          fontSize: 60,
          pulseIntensity: 0.3,
          position: "top-center",
          offsetX: 0,
          offsetY: 0,
        }}
      />
      <Composition
        id="TypewriterText"
        component={TypewriterText}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        schema={TypewriterTextSchema}
        defaultProps={{
          text: "Breaking News",
          fontSize: 80,
          fontWeight: "bold" as const,
          textColor: "#ffffff",
          backgroundColor: "transparent",
          typeSpeed: 0.8,
          showCursor: true,
          cursorColor: "#ffffff",
          position: "center" as const,
          offsetX: 0,
          offsetY: 0,
        }}
      />
      <Composition
        id="TextReveal"
        component={TextReveal}
        durationInFrames={100}
        fps={25}
        width={720}
        height={1280}
        schema={TextRevealSchema}
        defaultProps={{
          text: "WAR IN IRAN!!!",
          fontSize: 60,
          fontWeight: "bold",
          textColor: "#ff0000",
          backgroundColor: "transparent",
          typeSpeed: 0.3,
          showCursor: true,
          cursorColor: "#ff0000",
          position: "center",
          offsetX: 0,
          offsetY: 0,
          startDelay: 0,
        }}
      />
      <Composition
        id="AnimatedBarChart"
        component={AnimatedBarChart}
        durationInFrames={100}
        fps={30}
        width={720}
        height={1280}
        schema={AnimatedBarChartSchema}
        defaultProps={{
          data: [
            { label: "Q1", value: 100, color: "#3B82F6" },
            { label: "Q2", value: 150, color: "#10B981" },
            { label: "Q3", value: 120, color: "#F59E0B" },
            { label: "Q4", value: 180, color: "#EF4444" },
            { label: "Q5", value: 90, color: "#8B5CF6" },
          ],
          animationDelay: 0.5,
          barAnimationDuration: 2,
          showValues: true,
          showGrid: true,
          title: "Animated Bar Chart",
          titleSize: 36,
          labelSize: 16,
          valueSize: 14,
          backgroundColor: "#1F2937",
          textColor: "#FFFFFF",
          gridColor: "rgba(255, 255, 255, 0.1)",
        }}
      />
      <Composition
        id="TestComponent"
        component={TestComponent}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        schema={TestComponentSchema}
        defaultProps={{
          message: "Test Component",
          fontSize: 48,
          color: "#ffffff",
          animationSpeed: 1,
        }}
      />
      <Composition
        id="AnimatedList"
        component={AnimatedList}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        schema={AnimatedListSchema}
        defaultProps={{
          backgroundColor: "#2B3FF0",
          textColor: "#FFFFFF",
          words: ["buy", "use", "monetize"],
          arrowColor: "#FFFFFF",
        }}
      />
      <Composition
        id="GraphAnimations"
        component={GraphAnimations}
        durationInFrames={300}
        fps={30}
        width={720}
        height={1280}
        schema={GraphAnimationsSchema}
      />
    </>
  );
};
