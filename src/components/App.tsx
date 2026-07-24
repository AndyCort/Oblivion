import React, { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import styled, { createGlobalStyle } from 'styled-components'
import { ThemeProvider, useTheme } from '../stores/ThemeContext'
import { MusicProvider, useMusicContext } from '../stores/MusicContext'
import { AuthProvider } from '../stores/AuthContext'
import '../i18n' // Initialize i18n
import { useTranslation } from '../i18n/useTranslation'

import NavBar from './NavBar'
import ScrollingBar from './ScrollingBar'
import Footer from './Footer'
import SideButton from './SideButton'
import Music from './Music'
import HeartAnimation from './HeartAnimation'
import Background from './Background'
import Quote from './Quote'
import Social from './Social'
import ScrollArrow from './ScrollArrow'
import List from './List'
import InitialLoader from './InitialLoader'
import ScrollProgress from './ScrollProgress'

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body {
    min-height: 100vh;
    font-family: var(--content-font);
    background-color: var(--bg-color);
  }

  *::-webkit-scrollbar {
    display: none;
  }

  i {
    font-size: 1.25rem;
  }

  p {
    color: var(--text-color);
    white-space: pre-wrap;
    margin: 5px 0;
  }
`

const AppWrapper = styled.div`
  min-height: 100vh;
  transition: background-color 0.3s ease;
`

const MainContent = styled.div`
  padding: 0;
  margin: 0;
  position: relative;
  z-index: 1;
  min-height: 100vh;
`

const HomeSection = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  overflow: visible;
`

const HomeBg = styled.div`
  height: 100vh;
  width: 100%;
  background: center / cover no-repeat var(--home-bg);
  position: absolute;
  overflow: visible;
  z-index: -1;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    transform: scaleY(-1) translateY(-100%);
    background: inherit;
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%);
    mask-image: linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%);
  }
`

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
  height: 100vh;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(0.5rem, 2vh, 2rem);
  padding: clamp(1rem, 5vh, 3rem) 1rem;
  box-sizing: border-box;
`

const ListSection = styled.div`
  position: relative;
  z-index: 100;
  padding: 80px 20px;
  max-width: 1400px;
  margin: 0 auto;
`

const SectionTitle = styled.h2`
  text-align: center;
  font-family: var(--title-font);
  font-size: 2.2rem;
  color: var(--title-color);
  margin: 60px 0 40px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: var(--main-color);
    border-radius: 2px;
  }
`

function Home() {
  const { locale } = useTranslation()
  return (
    <>
      <HomeSection>
        <HomeBg />
        <WelcomeContent>
          <Quote />
          <Social />
        </WelcomeContent>
        <ScrollArrow />
      </HomeSection>
      <ListSection>
        <SectionTitle>
          {locale === 'zh-CN' ? '最近更新' : 'Latest Articles'}
        </SectionTitle>
        <List />
      </ListSection>
    </>
  )
}

import { Routes, Route } from 'react-router-dom'
import ArticleDetail from './ArticleDetail'

function AppContent() {
  const { theme } = useTheme()
  const { isMusicVisible } = useMusicContext()
  
  const [isInitialLoad, setIsInitialLoad] = useState(() => {
    return !sessionStorage.getItem('hasLoaded');
  });

  const handleLoadingComplete = () => {
    sessionStorage.setItem('hasLoaded', 'true');
    setIsInitialLoad(false);
  };

  return (
    <>
      <GlobalStyle />
      <ScrollProgress />
      <AnimatePresence>
        {isInitialLoad && (
          <InitialLoader key="loader" onLoadingComplete={handleLoadingComplete} />
        )}
      </AnimatePresence>

      <ScrollingBar />
      <SideButton />
      {isMusicVisible && <Music />}
      <HeartAnimation />
      <Background />
      
      <AppWrapper data-theme={theme}>
        <NavBar />
        <MainContent>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
          </Routes>
          <Footer />
        </MainContent>
      </AppWrapper>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <MusicProvider>
            <AppContent />
          </MusicProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
