import React from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Social from '../components/Social';
import ScrollArrow from '../components/ScrollArrow';
import Background from '../components/Background';
import Quote from '../components/Quote';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import LoaderIsland from '../components/LoaderIsland';
import { getLocale } from '../i18n/utils';

export default function Home() {
  const locale = getLocale();
  const title = locale === "zh-CN" ? "半生雨" : "Oblivion";

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <MainLayout>
      <LoaderIsland />
      <SideButton />
      <MusicIsland />
      <Background />

      <HomeSection>
        <HomeBg />
        <WelcomeContent>
          <Quote />
          <Social />
        </WelcomeContent>
        <ScrollArrow />
      </HomeSection>

      <Main>
        <div className="sd">123</div>
      </Main>
    </MainLayout>
  );
}

const HomeSection = styled.section`
  height: 100vh;
  height: 100svh;
  width: 100%;
  position: relative;
  overflow: visible;
`;

const HomeBg = styled.div`
  height: 100vh;
  height: 100svh;
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
    -webkit-mask-image: linear-gradient(
      to top,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0) 60%
    );
    mask-image: linear-gradient(
      to top,
      rgba(0, 0, 0, 1) 0%,
      rgba(0, 0, 0, 0) 60%
    );
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
  height: 100vh;
  height: 100svh;
  min-height: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: clamp(0.5rem, 2vh, 2rem);
  padding: clamp(1rem, 5vh, 3rem) 1rem;
  box-sizing: border-box;
`;

const Main = styled.div`
  width: 40%;
  position: relative;
  overflow: visible;
  background: var(--bg-1);
  border: var(--border);
  box-shadow: var(--box-shadow);
  display: grid;
  margin: 100px auto;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(2, auto);
  height: 100vh;
  border-radius: 16px;
  padding: 20px;
`;
