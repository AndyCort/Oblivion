import React from 'react';
import styled from 'styled-components';

import { useAutoContrast } from '../hooks/useAutoContrast';

import { useCardStyle } from '../stores/themeStore';

type BadgeData = {
  isBreak?: boolean;
  label?: string;
  labelBg?: string;
  value?: string;
  valueBg?: string;
  valueColor?: string;
  url?: string;
};

const badgesData: BadgeData[] = [
  { label: '野ICP备', labelBg: '#493b78', value: '1145141919810号', valueBg: '#24fa2884', url: '/' },
  { label: 'Theme', labelBg: ' oklch(0.75 0.05 180)', value: 'Oblivion', valueBg: 'var(--main-color)', url: '/' },
  { isBreak: true },
  { label: 'Frame', labelBg: '#555555', value: 'React', valueBg: '#61dafb', valueColor: '#000000', url: 'https://react.dev/' },

  { label: 'CDN', labelBg: '#555555', value: 'Cloudflare', valueBg: '#f6821f', url: 'https://www.cloudflare.com' },
  { label: 'Copyright', labelBg: '#555555', value: 'BY-NC-SA 4.0', valueBg: '#c4004c', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
];

export default function Footer() {
  const { cardStyle } = useCardStyle();

  const footerRef = useAutoContrast<HTMLElement>({
    targetContrast: 15,
    dependencies: [cardStyle]
  });

  return (
    <SiteFooter ref={footerRef}>
      <FooterText>
        © 2001 ~ {new Date().getFullYear()} Oblivion · All Rights Reserved
      </FooterText>
      <FooterText>
        Powered by{' '}
        <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
          Oblivion
        </a>
        {' & '}
        <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer">
          Cloudflare
        </a> ·
        Designed by{' '}
        <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
          Anya
        </a>
      </FooterText>
      <BadgesWrapper>
        {badgesData.map((badge, index) => {
          if (badge.isBreak) {
            return <BreakLine key={index} />;
          }
          return (
            <BadgeItem key={index}>
              <BadgePart $bg={badge.labelBg as string}>{badge.label}</BadgePart>
              <BadgeLink href={badge.url as string} target="_blank" rel="noopener noreferrer">
                <BadgePart $bg={badge.valueBg as string} $color={badge.valueColor}>{badge.value}</BadgePart>
              </BadgeLink>
            </BadgeItem>
          );
        })}
      </BadgesWrapper>
    </SiteFooter>
  );
}

// Styled Components

const SiteFooter = styled.footer`
  text-align: center;
  margin: 0;
  padding: 20px 16px 20px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: var(--text-3); /* Default text color, overriden by JS inline style */
  position: relative;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &::before {
    content: '';
    position: absolute;
    top: -100px; /* 进一步延伸高度，让渐变更自然 */
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--footer-bg) center bottom / 100% auto no-repeat;
    
    /* 采用平滑遮罩曲线 (Smooth Easing)，消除生硬的边缘感 */
    -webkit-mask-image: linear-gradient(
      to bottom, 
      transparent 0px,
      rgba(0, 0, 0, 0.05) 30px,
      rgba(0, 0, 0, 0.2) 70px,
      rgba(0, 0, 0, 0.5) 120px,
      rgba(0, 0, 0, 0.85) 170px,
      black 200px
    );
    mask-image: linear-gradient(
      to bottom, 
      transparent 0px,
      rgba(0, 0, 0, 0.05) 30px,
      rgba(0, 0, 0, 0.2) 70px,
      rgba(0, 0, 0, 0.5) 120px,
      rgba(0, 0, 0, 0.85) 170px,
      black 200px
    );
    
    z-index: -1;
    pointer-events: none;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      height: 350px;
      margin-top: -150px; /* 向上延伸的高度差 (350 - 200 = 150) */
    }
  }
`;

const FooterText = styled.p`
  white-space: normal;
  margin: 5px 0;
  font-family: var(--content-font);
  font-size: 0.875rem;
  transition: color 0.3s ease;

  a {
    font-weight: 500;
    transition: color 0.3s ease;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BadgesWrapper = styled.div`
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px;
  display: flex;
  margin-top: 10px;
`;

const BadgeItem = styled.span`
  display: inline-flex;
  height: 20px;
  border-radius: 0px;
  overflow: hidden;
  font-size: 11px;
  font-family: HarmonyOS_Sans_SC_Regular, sans-serif;
  user-select: none;
  -webkit-user-select: none;
`;

const BadgePart = styled.span<{ $bg: string; $color?: string; $isBlock?: boolean }>`
  background: ${props => props.$bg};
  color: ${props => props.$color || '#ffffff'};
  display: ${props => props.$isBlock ? 'block' : 'flex'};
  align-items: center;
  justify-content: center;
  line-height: 1;
  height: 20px;
  padding: 0 6px;
`;

const BadgeLink = styled.a`
  text-decoration: none;
  color: var(--auto-contrast-color);
`;

const BreakLine = styled.span`
  width: 100%;
  height: 0;
`;
