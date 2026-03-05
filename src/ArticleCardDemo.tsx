import React from "react";
import { staticFile } from "remotion";
import { ArticleCardOverlay } from "./effects";
import type { ArticleCardOverlayProps } from "./effects";

export const ArticleCardDemo: React.FC<ArticleCardOverlayProps> = (props) => {
  return (
    <ArticleCardOverlay
      {...props}
      videoSrc={props.videoSrc ? staticFile(props.videoSrc) : undefined}
    />
  );
};
