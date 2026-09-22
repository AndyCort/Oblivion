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
      const scrollY = window.scrollY;
      const topOffset = Math.max(0, pinAt - scrollY);

      // 当主内容区域 A 的底边开始离开视口底部向上移动时，背景图与 A 同步向上移动，避免覆盖被揭露出的 Footer B
      const mainEl = el.parentElement;
      if (mainEl) {
        const mainBottom = mainEl.getBoundingClientRect().bottom;
        const bottomOver = Math.min(0, mainBottom - window.innerHeight);
        el.style.transform = `translate3d(0, ${topOffset + bottomOver}px, 0)`;
      } else {
        el.style.transform = `translate3d(0, ${topOffset}px, 0)`;
      }
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
        </MainContent>
        <FooterWrapper>
          <Footer />
        </FooterWrapper>
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
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100svh;
  background-color: var(--bg-0);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
`;

const FooterWrapper = styled.div`
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  pointer-events: auto;
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
