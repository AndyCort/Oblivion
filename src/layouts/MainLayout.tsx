import React from "react";
import styled, { css } from "styled-components";
import ScrollProgress from "../components/layout/ScrollProgress";
import Footer from "../components/layout/Footer";

interface Props {
  children: React.ReactNode;
  hero?: React.ReactNode;
}

export default function MainLayout({ children, hero }: Props) {
  return (
    <>
      <ScrollProgress />
      <AppWrapper>
        {hero && <HeroWrapper>{hero}</HeroWrapper>}
        <MainAndFooterSection>
          <MainContent $hasHero={Boolean(hero)}>
            <ContentWrapper>{children}</ContentWrapper>
          </MainContent>
          <FooterWrapper>
            <Footer />
          </FooterWrapper>
        </MainAndFooterSection>
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

const MainAndFooterSection = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const HeroWrapper = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  z-index: 1;
  overflow: hidden;
`;

const MainContent = styled.main<{ $hasHero: boolean }>`
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100svh;
  overflow: clip;
  background: var(--main-bg);
  box-shadow: none;

  ${({ $hasHero }) => $hasHero && css`
    /* 遮罩仅作用于背景：前浪与正文共用完整背景层，渐变/图片也不会在接缝重启。 */
    --wave-height: 64px;
    background: transparent;
    overflow: visible;

    &::before,
    &::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: calc(-1 * var(--wave-height));
      pointer-events: none;
      mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'%3E%3Cpath d='M0 48 C22 -10 30 100 55 48 S80 8 100 48 V100 H0Z' fill='black'/%3E%3C/svg%3E"), linear-gradient(#000, #000);
      mask-size: 100% var(--wave-height), 100% calc(100% - var(--wave-height) + 1px);
      mask-position: top, bottom;
      mask-repeat: no-repeat;
    }

    &::before {
      height: calc(var(--wave-height) + 16px);
      background: var(--wave-bg);
      transform: translateY(-16px) scaleX(-1);
    }

    &::after {
      bottom: 0;
      background: var(--main-bg);
    }

    @media (max-width: 768px) {
      --wave-height: 40px;
    }
  `}
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  /* 装饰边缘在外层延伸，正文维持原有裁切范围。 */
  overflow: clip;
`;

const FooterWrapper = styled.div`
  position: relative;
  width: 100%;
  z-index: 1;
  pointer-events: auto;
`;
