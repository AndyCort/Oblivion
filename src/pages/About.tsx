import React from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/layout/Background';
import SideButton from '../components/layout/SideButton';
import { useLocale } from '../i18n/useLocale';

export default function About() {
  const { locale } = useLocale();
  const titleText = locale === "zh-CN" ? "关于我" : "About Me";
  const bioText =
    locale === "zh-CN"
      ? "你好！我是个热爱探索与创造的开发者。我是一个喜欢把自己并不存在的想法做出来的人。"
      : "Hello! I am a developer passionate about exploration and creation. I love combining elegant design with modern frontend technologies to create impressive digital experiences. Welcome to my digital garden.";

  React.useEffect(() => {
    document.title = `${titleText} — Oblivion`;
  }, [titleText]);

  return (
    <MainLayout>
      <SideButton />
      <Background />

      <AboutContainer>
        <AboutContent data-card="base">
          <AboutTitle>{titleText}</AboutTitle>
          <AboutBio>{bioText}</AboutBio>
        </AboutContent>
      </AboutContainer>
    </MainLayout>
  );
}

const AboutContainer = styled.div`
  padding: 120px 20px 60px;
  max-width: 800px;
  margin: 0 auto;
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  z-index: 10;
`;

const AboutContent = styled.div`
  padding: 48px 40px;
  text-align: center;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);

  @media (max-width: 768px) {
    padding: 32px 20px;
    border-radius: 18px;
  }
`;

const AboutTitle = styled.h1`
  font-size: 2.6rem;
  font-family: var(--title-font);
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--main-color), oklch(0.645032 0.215403 16.439));
  -webkit-background-clip: text;
  -webkit-text-fill-color: oklch(0 0 0 / 0);
  letter-spacing: -0.5px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const AboutBio = styled.p`
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-1);
  white-space: pre-wrap;

  @media (max-width: 768px) {
    font-size: 1.05rem;
  }
`;
