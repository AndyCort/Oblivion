import React from 'react';
import styled from 'styled-components';
import NavBar from '../components/NavBar';
import ScrollProgress from '../components/ScrollProgress';
import Footer from '../components/Footer';

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  return (
    <>
      <ScrollProgress />
      <AppWrapper>
        <NavBar />
        <MainContent>
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
`;

const MainContent = styled.main`
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  min-height: 100svh;
`;
