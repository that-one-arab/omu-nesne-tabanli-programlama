import React from "react";
import ReactConfetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";

export default function Confetti() {
  const { width, height } = useWindowSize();

  if (!width || !height) {
    return null;
  }

  return <ReactConfetti width={width} height={height} gravity={0.4} />;
}
