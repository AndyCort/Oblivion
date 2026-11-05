import React from "react";
import styled from "styled-components";
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
        <MainContent id="main-content" tabIndex={-1} $hasHero={Boolean(hero)}>{children}</MainContent>
        <Footer />
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  z-index: 1;
  overflow: hidden;
`;

const MainContent = styled.main<{ $hasHero?: boolean }>`
  padding: 0;
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
