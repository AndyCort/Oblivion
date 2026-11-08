import React from "react";
import styled from "styled-components";
import ScrollProgress from "../components/layout/ScrollProgress";
import Footer from "../components/layout/Footer";

interface Props {
  children: React.ReactNode;
  hero?: React.ReactNode;
  hideFooter?: boolean;
}

export default function MainLayout({ children, hero, hideFooter }: Props) {
  return (
    <>
      <ScrollProgress />
      <AppWrapper>
        {hero && <HeroWrapper>{hero}</HeroWrapper>}
        <MainContent id="main-content" tabIndex={-1} $hasHero={Boolean(hero)}>
          {children}
        </MainContent>
        {!hideFooter && <Footer />}
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

const HeroWrapper = styled.div`
  position: sticky;
  /* Give the artwork room above the sticky edge without moving the next section. */
  top: calc(0px - var(--safe-top));
  margin-top: calc(0px - var(--safe-top));
  padding-top: var(--safe-top);
  box-sizing: content-box;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100lvh;
  z-index: 1;
  overflow: hidden;
`;

const MainContent = styled.main<{ $hasHero?: boolean }>`
  padding: ${(props) =>
    props.$hasHero ? "0" : "var(--safe-top) var(--safe-right) 0 var(--safe-left)"};
  margin: 0;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100svh;
  flex-grow: 1;
  overflow: clip;
  background: ${(props) => (props.$hasHero ? "transparent" : "var(--main-bg)")};
  box-shadow: none;
`;
