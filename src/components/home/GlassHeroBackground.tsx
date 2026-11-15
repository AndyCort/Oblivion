import { useState, useEffect } from "react";
import styled from "styled-components";
import SpiralGalaxy from "./SpiralGalaxy";

export default function GlassHeroBackground() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const content = document.getElementById("main-content");
    const updatePaused = () => {
      // The hero is sticky, so the canvases still intersect even under the content.
      setPaused(!!content && content.getBoundingClientRect().top <= 0);
    };
    updatePaused();
    window.addEventListener("scroll", updatePaused, { passive: true });
    window.addEventListener("resize", updatePaused);
    return () => {
      window.removeEventListener("scroll", updatePaused);
      window.removeEventListener("resize", updatePaused);
    };
  }, []);

  return (
    <Wrapper>
      <SpiralGalaxy theme="dark" size={1.0} paused={paused} />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(242, 91, 208, 0.08) 0%,
    rgba(14, 6, 24, 0.35) 25%,
    #020105 60%,
    #000000 100%
  );
  pointer-events: none;
`;

