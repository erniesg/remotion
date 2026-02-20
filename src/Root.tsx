import { Composition } from "remotion";
import { MyComp } from "./MyComp";
import { EmojiOverlayDemo } from "./EmojiOverlayDemo";

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
    </>
  );
};
