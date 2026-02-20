import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { EmojiOverlayDemo } from "./EmojiOverlayDemo";
import { ArticleCardDemo } from "./ArticleCardDemo";
import { ArticleCardOverlaySchema } from "./effects";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="EmojiOverlayDemo"
        component={EmojiOverlayDemo}
        durationInFrames={78 * 25}
        fps={25}
        width={720}
        height={1280}
      />
      <Composition
        id="ArticleCardDemo"
        component={ArticleCardDemo}
        durationInFrames={78 * 25}
        fps={25}
        width={720}
        height={1280}
        schema={ArticleCardOverlaySchema}
        defaultProps={{
          videoSrc: "tiktok_dailytoast_7606345004319116564.mp4",
          fps: 25,
          cards: [
            {
              title:
                "Fatal EV crash in Chinatown — weight and instant torque are the real dangers",
              body: "The weight difference between EVs and traditional cars is staggering. A typical EV weighs around 2,200 kg due to the battery pack, compared to ~1,400 kg for an equivalent ICE car. Combined with 100% torque instantly available from a standstill, the kinetic energy in a collision is devastating. This isn't about driver error alone — it's physics.",
              flair: "Discussion",
              source: {
                platform: "reddit",
                author: "u/sg_driver_2024",
                subreddit: "r/drivingsg",
                timestamp: "14h ago",
              },
              startMs: 3000,
              endMs: 18000,
              enterAnimation: "slide-up",
              exitAnimation: "slide-down",
              y: 0.38,
              marginX: 24,
              titleSize: 30,
              bodySize: 26,
              sourceSize: 18,
              highlights: [
                {
                  phrase: "fatal",
                  style: "sweep",
                  color: "#FF4444",
                  startMs: 5000,
                  durationMs: 400,
                },
                {
                  phrase: "weight difference",
                  style: "sweep",
                  color: "#FF8C00",
                  startMs: 7500,
                  durationMs: 500,
                },
                {
                  phrase: "2,200 kg",
                  style: "underline",
                  color: "#FF8C00",
                  startMs: 9500,
                  durationMs: 400,
                },
                {
                  phrase: "100% torque instantly",
                  style: "sweep",
                  color: "#FF4444",
                  startMs: 12000,
                  durationMs: 600,
                },
              ],
            },
            {
              title: "Speed camera footage shows moment of impact",
              body: "Authorities released dashcam footage showing the vehicle accelerating through the pedestrian crossing. Witnesses reported no braking sounds before impact. The silent nature of EVs has reignited debate about mandatory low-speed warning sounds.",
              source: {
                platform: "news",
                author: "CNA",
                timestamp: "8h ago",
              },
              startMs: 22000,
              endMs: 35000,
              enterAnimation: "fade",
              exitAnimation: "fade",
              y: 0.42,
              marginX: 24,
              titleSize: 30,
              bodySize: 26,
              sourceSize: 18,
              highlights: [
                {
                  phrase: "no braking sounds",
                  style: "sweep",
                  color: "#FF4444",
                  startMs: 26000,
                  durationMs: 500,
                },
                {
                  phrase: "silent nature of EVs",
                  style: "underline",
                  color: "#2196F3",
                  startMs: 29000,
                  durationMs: 600,
                },
              ],
            },
          ],
        }}
      />
    </>
  );
};
