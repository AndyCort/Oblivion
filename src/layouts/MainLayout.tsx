import React from 'react';
import styled from 'styled-components';
import NavBar from '../components/layout/NavBar';
import ScrollProgress from '../components/layout/ScrollProgress';
import Footer from '../components/layout/Footer';
import { useGlobalAudio } from '../hooks/useGlobalAudio';

interface Props {
  children: React.ReactNode;
  hero?: React.ReactNode;
}

export default function MainLayout({ children, hero }: Props) {
  useGlobalAudio();

  return (
    <>
      <ScrollProgress />
      <AppWrapper>
        <NavBar />
        {hero && <HeroWrapper>{hero}</HeroWrapper>}
        <MainAndFooterSection>
          <MainContent $hasHero={!!hero}>
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

const MainContent = styled.main<{ $hasHero?: boolean }>`
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  min-height: 100svh;
  overflow: clip;
  background: var(--main-bg);
  box-shadow: ${(props) =>
    props.$hasHero
      ? '0 -20px 40px rgba(0, 0, 0, 0.12), 0 20px 40px rgba(0, 0, 0, 0.12)'
      : '0 20px 40px rgba(0, 0, 0, 0.12)'};


`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
`;

const FooterWrapper = styled.div`
  position: relative;
  width: 100%;
  z-index: 1;
  pointer-events: auto;
`;
