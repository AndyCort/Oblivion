import React from 'react';
import styled, { keyframes } from 'styled-components';

export default function ScrollProgress() {
  return <ScrollProgressBar />;
}

const scrollProgressAnim = keyframes`
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
`;

const ScrollProgressBar = styled.div`
  position: fixed;
  top: env(safe-area-inset-top, 0px);
  left: 0;
  right: 0;
  height: 3px;
  background: var(--main-color);
  z-index: 10001;
  transform-origin: left;
  transform: scaleX(0);
  animation: ${scrollProgressAnim} linear;
  animation-timeline: scroll(root);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
