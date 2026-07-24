import { useEffect, useRef, useState } from 'react';
import { getTheme, onThemeChange, type Theme } from '../stores/themeStore';
import Planet3D from './Planet3D';

export default function Background() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document !== 'undefined') return getTheme()
    return 'light'
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<HTMLDivElement>(null);

  // Subscribe to theme changes from the vanilla store
  useEffect(() => {
    setTheme(getTheme())
    return onThemeChange(setTheme)
  }, []);

  useEffect(() => {
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let animationFrameId: number;
    let isAnimating = false;

    const updateParallax = () => {
      currentScrollY += (targetScrollY - currentScrollY) * 0.05;

      const maxScroll = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      ) - window.innerHeight;

      const progress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScrollY / maxScroll)) : 0;

      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${progress * -10}vh)`;
      }

      if (planetRef.current) {
        const distanceToBottom = Math.max(0, maxScroll - currentScrollY);
        const revealThreshold = 150;
        let planetFactor = 0;
        if (distanceToBottom < revealThreshold) {
          planetFactor = 1 - (distanceToBottom / revealThreshold);
        }
        planetRef.current.style.transform = `translateY(${planetFactor * -15}vh)`;
      }

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
      <div ref={containerRef} className="bg-dark-container">
        {stars.map(s => (
          <div
            key={s.id}
            className="bg-star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.color,
              boxShadow: `0 0 ${s.size * 3.5}px ${s.color}, 0 0 ${Math.max(1, s.size)}px rgba(255,255,255,0.8)`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
        {meteors.map(m => (
          <div
            key={m.id}
            className="bg-meteor"
            style={{
              top: `${m.top}%`,
              left: `${m.left}%`,
              width: `${m.width}px`,
              animationDelay: `${m.delay}s`,
              animationDuration: `${m.duration}s`,
            }}
          />
        ))}
        <div ref={planetRef} className="bg-planet-container">
          <Planet3D theme="dark" />
        </div>
      </div>
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
    <div ref={containerRef} className="bg-light-container">
      {orbs.map(orb => (
        <div
          key={orb.id}
          className="bg-orb"
          style={{
            top: `${orb.top}%`,
            left: `${orb.left}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            background: orb.color,
            filter: `blur(${orb.size / 6}px)`,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s, ${orb.duration * 0.8}s`,
          }}
        />
      ))}
      {motes.map(mote => (
        <div
          key={mote.id}
          className="bg-mote"
          style={{
            left: `${mote.left}%`,
            width: `${mote.size}px`,
            height: `${mote.size}px`,
            boxShadow: `0 0 ${mote.size * 2}px rgba(255, 255, 255, 0.9)`,
            animationDelay: `${mote.delay}s`,
            animationDuration: `${mote.duration}s`,
          }}
        />
      ))}
      <div ref={planetRef} className="bg-planet-container">
        <Planet3D theme="light" />
      </div>
    </div>
  );
}
