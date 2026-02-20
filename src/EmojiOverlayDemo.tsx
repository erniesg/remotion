import React from "react";
import { staticFile } from "remotion";
import { EmojiOverlay } from "./effects";
import type { EmojiOverlayProps } from "./effects";
import demoProps from "./demo-props.json";

export const emojiOverlayDemoProps: EmojiOverlayProps = {
  videoSrc: demoProps.videoSrc,
  captions: demoProps.captions,
  ocrFrames: demoProps.ocrFrames,
  annotations: demoProps.annotations as EmojiOverlayProps["annotations"],
  fps: demoProps.fps,
};

export const EmojiOverlayDemo: React.FC = () => {
  return (
    <EmojiOverlay
      videoSrc={staticFile(demoProps.videoSrc)}
      captions={demoProps.captions}
      ocrFrames={demoProps.ocrFrames}
      annotations={demoProps.annotations as any}
      fps={demoProps.fps}
    />
  );
};
