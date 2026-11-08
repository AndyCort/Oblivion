import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronDown } from 'lucide-react';
import { useLocale } from '../../i18n/useLocale';

export default function ScrollArrow() {
  const [isVisible, setIsVisible] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const el = document.getElementById('main-content');
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  return (
    <ScrollHint type="button" id="scroll-arrow" onClick={handleClick}
      aria-label={locale === 'zh-CN' ? '向下浏览内容' : 'Explore the content'}
      className={isVisible ? '' : 'hidden'}>
      <div className="scroll-arrow">
        <ChevronDown size={36} aria-hidden="true" />
      </div>
    </ScrollHint>
  );
}

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-12px);
  }
  60% {
    transform: translateX(-50%) translateY(-6px);
  }
`;

const ScrollHint = styled.button`
  position: absolute;
  bottom: clamp(20px, 4vh, 50px);
  /* Keep the control above the toolbar while the artwork fills the large viewport. */
  bottom: calc(100% - 100dvh + var(--safe-bottom) + clamp(20px, 4vh, 50px));
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 100;
  padding: 0;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  animation: ${bounce} 2s ease-in-out infinite;

  &:focus-visible {
    outline: 2px solid var(--main-color);
    outline-offset: 4px;
  }

  &.hidden {
    visibility: hidden;
    pointer-events: none;
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  .scroll-arrow {
    font-size: 24px;
    color: var(--hero-foreground, var(--text-1));
    transition: color 0.2s, transform 0.2s;

    &:hover {
      color: var(--main-color);
      transform: scale(1.2);
    }
  }
`;
