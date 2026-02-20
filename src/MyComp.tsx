import { AbsoluteFill } from "remotion";

export const MyComp: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 60,
        backgroundColor: "white",
      }}
    >
      Hello Remotion!
    </AbsoluteFill>
  );
};
