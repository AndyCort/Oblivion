import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import NavBar from '../components/NavBar';
import ScrollProgress from '../components/ScrollProgress';
import Footer from '../components/Footer';
import { useGlobalAudio } from '../hooks/useGlobalAudio';

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  useGlobalAudio();

  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parallaxRef.current;
    if (!el) return;

    const measurePinAt = () =>
      document.querySelector('.home-section')?.getBoundingClientRect().height || 0;

    let pinAt = measurePinAt();
    let ticking = false;

    const update = () => {
      ticking = false;
      el.style.transform = `translate3d(0, ${Math.max(0, pinAt - window.scrollY)}px, 0)`;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const onResize = () => {
      pinAt = measurePinAt();
      onScroll();
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <>
      <ScrollProgress />
      <AppWrapper>
        <NavBar />
        <MainContent>
          <MainParallaxBg ref={parallaxRef} />
          {children}
          <Footer />
        </MainContent>
      </AppWrapper>
    </>
  );
}

// Styled Components

const AppWrapper = styled.div`
  min-height: 100vh;
  min-height: 100svh;
  transition: background-color 0.3s ease;
  position: relative;
  z-index: 0;
`;

const MainContent = styled.main`
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100svh;
`;

const MainParallaxBg = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  z-index: -1;
  pointer-events: none;
  background-image:
    linear-gradient(var(--home-bg-filter), var(--home-bg-filter)),
    var(--main-bg);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  will-change: transform;
`;
