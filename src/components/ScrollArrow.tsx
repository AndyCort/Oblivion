import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronDown } from 'lucide-react';

export default function ScrollArrow() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    const el = document.querySelector('.main, .article-list');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ScrollHint id="scroll-arrow" onClick={handleClick} className={isVisible ? '' : 'hidden'}>
      <ArrowIcon className="scroll-arrow">
        <ChevronDown size={24} />
      </ArrowIcon>
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

const ScrollHint = styled.div`
  position: absolute;
  bottom: clamp(20px, 4vh, 50px);
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 100;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const ArrowIcon = styled.div`
  font-size: 24px;
  color: var(--text-2);
  transition: color 0.2s, transform 0.2s;

  &:hover {
    color: var(--main-color);
    transform: scale(1.2);
  }
`;
