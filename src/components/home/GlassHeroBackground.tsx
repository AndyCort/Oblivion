import styled from "styled-components";
import CrystalizedBall from "./CrystalizedBall";
import SpiralGalaxy from "./SpiralGalaxy";

export default function GlassHeroBackground() {
  return (
    <Wrapper>
      <SpiralGalaxy theme="dark" size={1.0} />
      <div className="ball-wrapper">
        <CrystalizedBall
          preset="plasma"
          color="#F25BD0"
          theme="dark"
          size={0.7}
          crackle={0.3}
          fill={0.6}
          interactive={false}
          hoverStrength={0.7}
          sparks={0.75}
          particleCount={31500}
          particleShape="round"
          depth={0.65}
          sway={0.3}
          twinkle={0.7}
          dustSpeed={2}
          speed={0.95}
        />
      </div>
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

  .ball-wrapper {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
`;

