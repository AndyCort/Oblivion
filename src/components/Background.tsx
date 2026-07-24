import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../stores/ThemeContext';
import Planet3D from './Planet3D';

// --- Light Theme Animations & Components ---
const breathe = keyframes`
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
`;

const float = keyframes`
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(80px, -120px) scale(1.1); }
  66% { transform: translate(-60px, 80px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
`;

const morph = keyframes`
  0%, 100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  34% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
  67% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
`;

const floatMote = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0; }
  50% { transform: translateY(-150px) scale(1.5); opacity: 0.8; }
  100% { transform: translateY(-300px) scale(1); opacity: 0; }
`;

const LightContainer = styled.div`
  position: fixed;
  top: -10vh;
  left: 0;
  width: 100vw;
  height: 120vh;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
  background-color: #fafafa;
  background-image: 
    radial-gradient(at 0% 0%, rgba(224, 231, 255, 0.8) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(253, 230, 138, 0.6) 0px, transparent 50%),
    radial-gradient(at 100% 100%, rgba(24, 211, 226, 0.8) 0px, transparent 50%),
    radial-gradient(at 0% 100%, rgba(204, 251, 241, 0.6) 0px, transparent 50%);
  background-size: 150% 150%;
  animation: ${breathe} 30s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;
  
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(#000000 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: 0 0;
    opacity: 0.015;
    z-index: 1;
  }
`;

const PlanetContainer = styled.div`
  position: absolute;
  top: 110vh;
  left: 0;
  width: 100vw;
  height: 40vh;
  will-change: transform;
  z-index: 5;
`;

const Orb = styled.div<{ size: number, top: number, left: number, delay: number, duration: number, color: string }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background: ${props => props.color};
  filter: blur(${props => props.size / 6}px);
  opacity: 0.7;
  animation: 
    ${float} ${props => props.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite,
    ${morph} ${props => props.duration * 0.8}s ease-in-out infinite alternate;
  animation-delay: ${props => props.delay}s;
  z-index: 1;
`;

const Mote = styled.div<{ size: number, left: number, delay: number, duration: number }>`
  position: absolute;
  bottom: -10%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  filter: blur(1px);
  opacity: 0;
  box-shadow: 0 0 ${props => props.size * 2}px rgba(255, 255, 255, 0.9);
  animation: ${floatMote} ${props => props.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  animation-delay: ${props => props.delay}s;
  z-index: 2;
`;

// --- Dark Theme Animations & Components ---
const meteorAnimation = keyframes`
  0% { opacity: 0; transform: rotate(-45deg) translateX(200px); }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; transform: rotate(-45deg) translateX(-3000px); }
`;

const starTwinkle = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.1; }
`;

const skyBreathe = keyframes`
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
`;

const MeteorContainer = styled.div`
  position: fixed;
  top: -10vh;
  left: 0;
  width: 100vw;
  height: 120vh;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
  background-color: #000000;
  background-image: 
    radial-gradient(at 20% 0%, rgba(30, 27, 75, 0.4) 0px, transparent 50%),
    radial-gradient(at 80% 0%, rgba(15, 23, 42, 0.5) 0px, transparent 50%),
    radial-gradient(at 50% 100%, rgba(8, 47, 73, 0.25) 0px, transparent 60%);
  background-size: 150% 150%;
  animation: ${skyBreathe} 35s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;

  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: radial-gradient(#ffffff 1px, transparent 1px);
    background-size: 50px 50px;
    background-position: 0 0;
    opacity: 0.02;
    z-index: 1;
  }
`;

/* DarkPlanet CSS replaced by 3D rendering container */

const Star = styled.div<{ top: number, left: number, size: number, delay: number, duration: number, color: string }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  background-color: ${props => props.color};
  border-radius: 50%;
  /* 增强星星的发光强度和中心高光 */
  box-shadow: 0 0 ${props => props.size * 3.5}px ${props => props.color}, 0 0 ${props => Math.max(1, props.size)}px rgba(255,255,255,0.8);
  animation: ${starTwinkle} ${props => props.duration}s ease-in-out infinite;
  animation-delay: ${props => props.delay}s;
  opacity: 1;
  z-index: 2;
`;

const Meteor = styled.div<{ delay: number, top: number, left: number, duration: number, width: number }>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  width: ${props => props.width}px;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.3) 40%, transparent 100%);
  animation: ${meteorAnimation} ${props => props.duration}s linear infinite;
  animation-delay: ${props => props.delay}s;
  transform: rotate(-45deg) translateX(200px);
  opacity: 0;
  transform-origin: left center;
  z-index: 3;
  
  &::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    left: -2px;
    top: 50%;
    transform: translateY(-50%);
    box-shadow: 0 0 15px 4px rgba(255, 255, 255, 1), 0 0 30px 8px rgba(100, 200, 255, 0.8);
  }
`;

export default function Background() {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let animationFrameId: number;
    let isAnimating = false;

    const updateParallax = () => {
      // Very smooth lerp (momentum scrolling effect)
      currentScrollY += (targetScrollY - currentScrollY) * 0.05;

      const maxScroll = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - window.innerHeight;

      // Ensure progress is safely bounded
      const progress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScrollY / maxScroll)) : 0;

      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${progress * -10}vh)`;
      }

      if (planetRef.current) {
        // The planet only starts revealing when user is within 150px of the very bottom of the page
        const distanceToBottom = Math.max(0, maxScroll - currentScrollY);
        const revealThreshold = 150; // Pixels from bottom

        let planetFactor = 0;
        if (distanceToBottom < revealThreshold) {
          planetFactor = 1 - (distanceToBottom / revealThreshold);
        }

        // Translates up from 0 to -12vh
        planetRef.current.style.transform = `translateY(${planetFactor * -15}vh)`;
      }

      // Keep animating if difference is larger than 0.5px
      if (Math.abs(targetScrollY - currentScrollY) > 0.5) {
        animationFrameId = requestAnimationFrame(updateParallax);
      } else {
        isAnimating = false;
      }
    };

    const handleScroll = () => {
      targetScrollY = window.scrollY;
      if (!isAnimating) {
        isAnimating = true;
        animationFrameId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  if (theme === 'dark') {
    const meteors = Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 20,
      top: -20 + Math.random() * 60,
      left: 40 + Math.random() * 120,
      duration: 20 + Math.random() * 15,
      width: 150 + Math.random() * 200,
    }));

    /* 翻倍星星数量并增大基础星体尺寸 */
    const stars = Array.from({ length: 300 }).map((_, i) => {
      const size = 0.8 + Math.pow(Math.random(), 4) * 2.5;

      const colorRoll = Math.random();
      let color = '#ffffff';
      if (colorRoll > 0.85) color = '#e2f2ff';
      else if (colorRoll > 0.7) color = '#fff9e6';
      else if (colorRoll > 0.98) color = '#ffdbdb';

      return {
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size,
        delay: Math.random() * 10,
        duration: 2 + Math.random() * 6,
        color
      };
    });

    return (
      <MeteorContainer ref={containerRef}>
        {stars.map(s => (
          <Star key={s.id} top={s.top} left={s.left} size={s.size} delay={s.delay} duration={s.duration} color={s.color} />
        ))}
        {meteors.map(m => (
          <Meteor key={m.id} delay={m.delay} top={m.top} left={m.left} duration={m.duration} width={m.width} />
        ))}
        <PlanetContainer ref={planetRef}>
          <Planet3D theme="dark" />
        </PlanetContainer>
      </MeteorContainer>
    );
  }

  const orbs = [
    { id: 1, size: 400, top: 5, left: 5, delay: 0, duration: 25, color: '#e0e7ff' },
    { id: 2, size: 500, top: 60, left: 70, delay: -5, duration: 30, color: '#fbcfe8' },
    { id: 3, size: 300, top: 40, left: 30, delay: -10, duration: 20, color: '#ccfbf1' },
    { id: 4, size: 450, top: 80, left: -5, delay: -15, duration: 28, color: '#fde68a' },
    { id: 5, size: 250, top: 10, left: 80, delay: -8, duration: 22, color: '#fae8ff' },
  ];

  const motes = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 10,
    duration: 8 + Math.random() * 12,
  }));

  return (
    <LightContainer ref={containerRef}>
      {orbs.map(orb => (
        <Orb
          key={orb.id}
          size={orb.size}
          top={orb.top}
          left={orb.left}
          delay={orb.delay}
          duration={orb.duration}
          color={orb.color}
        />
      ))}
      {motes.map(mote => (
        <Mote
          key={mote.id}
          size={mote.size}
          left={mote.left}
          delay={mote.delay}
          duration={mote.duration}
        />
      ))}
      <PlanetContainer ref={planetRef}>
        <Planet3D theme="light" />
      </PlanetContainer>
    </LightContainer>
  );
}
