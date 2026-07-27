import React from 'react';
import styled from 'styled-components';
import MainLayout from '../layouts/MainLayout';
import Background from '../components/Background';
import SideButton from '../components/SideButton';
import MusicIsland from '../components/MusicIsland';
import { getLocale } from '../i18n/utils';

export default function About() {
  const locale = getLocale();
  const titleText = locale === "zh-CN" ? "关于我" : "About Me";
  const bioText =
    locale === "zh-CN"
      ? "你好！我是个热爱探索与创造的开发者。我喜欢将优雅的设计和现代的前端技术相结合，创造令人印象深刻的数字体验。欢迎来到我的数字花园，在这里分享技术、生活与思考。"
      : "Hello! I am a developer passionate about exploration and creation. I love combining elegant design with modern frontend technologies to create impressive digital experiences. Welcome to my digital garden.";

  React.useEffect(() => {
    document.title = `${titleText} — Oblivion`;
  }, [titleText]);

  return (
    <MainLayout>
      <SideButton />
      <MusicIsland />
      <Background />

      <AboutContainer>123</AboutContainer>
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
